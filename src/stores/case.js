import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

const STORAGE_KEY = 'pdd_case_list_v1'

// 生成UUID
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

// 计算法定时限
function calcDeadlines(status, acceptanceDate, decisionDate) {
  const deadlines = []
  const now = dayjs()

  if (status === 'pending_report') {
    // 举报后7个工作日应答
  }

  if (acceptanceDate) {
    // 受理后90日结案（复杂可延至180日）
    deadlines.push({
      name: '立案后结案时限',
      date: dayjs(acceptanceDate).add(90, 'day').format('YYYY-MM-DD'),
      type: 'legal',
      alertDays: 7,
    })
  }

  if (status === 'decided' && decisionDate) {
    if (acceptanceWay === '责令改正') {
      deadlines.push({
        name: '责令改正整改期限',
        date: dayjs(decisionDate).add(15, 'day').format('YYYY-MM-DD'),
        type: 'legal',
        alertDays: 3,
      })
    }
  }

  return deadlines
}

export const useCaseStore = defineStore('case', () => {
  const cases = ref(loadFromStorage())

  function loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases.value))
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
  function createCase(data) {
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
      deadlines: [],
      notes: '',
    }
    cases.value.unshift(newCase)
    saveToStorage()
    return newCase
  }

  // 更新案件
  function updateCase(id, data) {
    const idx = cases.value.findIndex(c => c.id === id)
    if (idx === -1) return null
    const now = dayjs().toISOString()
    const old = cases.value[idx]
    const updated = { ...old, ...data, updatedAt: now }
    cases.value[idx] = updated
    saveToStorage()
    return updated
  }

  // 变更状态
  function changeStatus(id, newStatus, extra = {}) {
    const idx = cases.value.findIndex(c => c.id === id)
    if (idx === -1) return null
    const now = dayjs().toISOString()
    const old = cases.value[idx]
    old.statusHistory.push({ from: old.status, to: newStatus, changedAt: now })
    cases.value[idx] = { ...old, status: newStatus, updatedAt: now, ...extra }
    saveToStorage()
    return cases.value[idx]
  }

  // 添加答复
  function addReply(caseId, reply) {
    const c = cases.value.find(c => c.id === caseId)
    if (!c) return
    c.replies.unshift({
      id: uuid(),
      date: reply.date || dayjs().format('YYYY-MM-DD'),
      content: reply.content || '',
      attachmentUrls: reply.attachmentUrls || [],
    })
    c.updatedAt = dayjs().toISOString()
    saveToStorage()
    return c
  }

  // 上传文书
  function addDocument(caseId, doc) {
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
    saveToStorage()
    return c
  }

  // 删除案件
  function deleteCase(id) {
    cases.value = cases.value.filter(c => c.id !== id)
    saveToStorage()
  }

  return {
    cases,
    stats,
    getCase,
    createCase,
    updateCase,
    changeStatus,
    addReply,
    addDocument,
    deleteCase,
  }
})
