import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { supabase } from '@/lib/supabase'

const STORAGE_KEY = 'pdd_case_list_v1'

// 生成UUID
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

export const useCaseStore = defineStore('case', () => {
  const cases = ref([])
  const isLoading = ref(false)
  const isSynced = ref(false)

  // 从localStorage加载（首次加载用）
  function loadFromLocalStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  // 保存到localStorage
  function saveToLocalStorage(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  // 从Supabase加载
  async function loadFromSupabase() {
    isLoading.value = true
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('data')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data && data.length > 0) {
        cases.value = data.map(row => row.data)
      }
      isSynced.value = true
    } catch (err) {
      console.error('加载失败，尝试本地数据:', err)
      cases.value = loadFromLocalStorage()
    } finally {
      isLoading.value = false
    }
  }

  // 保存到Supabase
  async function saveToSupabase() {
    try {
      // 先删除所有旧数据
      await supabase.from('cases').delete().neq('id', '00000000-0000-0000-0000-000000000000')

      // 批量插入新数据
      const records = cases.value.map(c => ({
        id: c.id,
        data: c
      }))

      if (records.length > 0) {
        const { error } = await supabase.from('cases').upsert(records)
        if (error) throw error
      }
    } catch (err) {
      console.error('保存到云失败:', err)
    }
  }

  // 初始化加载
  async function init() {
    await loadFromSupabase()
    // 如果云端没数据，从本地读取
    if (cases.value.length === 0) {
      const localData = loadFromLocalStorage()
      if (localData.length > 0) {
        cases.value = localData
        await saveToSupabase()
      }
    }
  }

  // 统计
  const stats = computed(() => {
    const list = cases.value
    return {
      total: list.length,
      pending: list.filter(c => c.status === 'pending_report').length,
      reported: list.filter(c => c.status === 'reported').length,
      accepted: list.filter(c => c.status === 'accepted').length,
      decided: list.filter(c => c.status === 'decided').length,
      closed: list.filter(c => c.status === 'closed').length,
      rejected: list.filter(c => c.status === 'rejected').length,
      notPunished: list.filter(c => c.status === 'not_punished').length,
    }
  })

  // 获取单个案件
  function getCase(id) {
    return cases.value.find(c => c.id === id)
  }

  // 新增案件
  async function createCase(data) {
    const now = dayjs().toISOString()
    const newCase = {
      id: uuid(),
      createdAt: now,
      updatedAt: now,
      shopName: data.shopName || '',
      productName: data.productName || '',
      productPrice: Number(data.productPrice) || 0,
      licenseName: data.licenseName || '',
      jurisdiction: data.jurisdiction || '',
      expense: Number(data.expense) || 0,
      profit: Number(data.profit) || 0,
      status: 'pending_report',
      statusHistory: [{ from: '', to: 'pending_report', changedAt: now }],
      reportDate: null,
      signDate: data.signDate || null,
      reportPlatform: '',
      acceptanceDate: null,
      acceptanceWay: '',
      decisionDate: null,
      replies: [],
      documents: [],
      images: [],
      deadlines: [],
      notes: '',
      // 行政复议
      hasAdminReview: data.hasAdminReview || '',
      adminReviewResult: data.adminReviewResult || '',
      adminReviewApplyDate: data.adminReviewApplyDate || '',
      adminReviewAuthority: data.adminReviewAuthority || '',
      adminReviewAcceptDate: data.adminReviewAcceptDate || '',
      adminReviewDecisionDate: data.adminReviewDecisionDate || '',
      adminReviewDocNo: data.adminReviewDocNo || '',
    }
    cases.value.unshift(newCase)
    saveToLocalStorage(cases.value)
    await saveToSupabase()
    return newCase
  }

  // 更新案件
  async function updateCase(id, data) {
    const idx = cases.value.findIndex(c => c.id === id)
    if (idx === -1) return null
    const now = dayjs().toISOString()
    const old = cases.value[idx]
    const updated = { ...old, ...data, updatedAt: now }
    cases.value[idx] = updated
    saveToLocalStorage(cases.value)
    await saveToSupabase()
    return updated
  }

  // 变更状态
  async function changeStatus(id, newStatus, extra = {}) {
    const idx = cases.value.findIndex(c => c.id === id)
    if (idx === -1) return null
    const now = dayjs().toISOString()
    const old = cases.value[idx]
    old.statusHistory.push({ from: old.status, to: newStatus, changedAt: now })
    cases.value[idx] = { ...old, status: newStatus, updatedAt: now, ...extra }
    saveToLocalStorage(cases.value)
    await saveToSupabase()
    return cases.value[idx]
  }

  // 添加答复
  async function addReply(caseId, reply) {
    const c = cases.value.find(c => c.id === caseId)
    if (!c) return
    c.replies.unshift({
      id: uuid(),
      date: reply.date || dayjs().format('YYYY-MM-DD'),
      content: reply.content || '',
      attachmentUrls: reply.attachmentUrls || [],
    })
    c.updatedAt = dayjs().toISOString()
    saveToLocalStorage(cases.value)
    await saveToSupabase()
    return c
  }

  // 上传文书
  async function addDocument(caseId, doc) {
    const c = cases.value.find(c => c.id === caseId)
    if (!c) return
    c.documents.push({
      id: uuid(),
      name: doc.name || '未命名',
      type: doc.type || 'other',
      url: doc.url || '',
      uploadedAt: dayjs().toISOString(),
    })
    c.updatedAt = dayjs().toISOString()
    saveToLocalStorage(cases.value)
    await saveToSupabase()
    return c
  }

  // 删除案件
  async function deleteCase(id) {
    cases.value = cases.value.filter(c => c.id !== id)
    saveToLocalStorage(cases.value)
    await saveToSupabase()
  }

  return {
    cases,
    stats,
    isLoading,
    isSynced,
    init,
    getCase,
    createCase,
    updateCase,
    changeStatus,
    addReply,
    addDocument,
    deleteCase,
  }
})
