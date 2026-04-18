import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { supabase } from '@/lib/supabase'

const STORAGE_KEY = 'pdd_case_list_v1'
const UNASSIGNED_IMAGES_KEY = 'unassigned_images'
const APP_META_ID = '00000000-0000-0000-0000-000000000000'
const CASE_NUMBER_PREFIX = 'AJ'
const CASE_NUMBER_PATTERN = /^AJ-(\d{8})-(\d{4})$/

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

function dedupeByUrl(list = []) {
  const map = new Map()
  list.filter(Boolean).forEach(item => {
    if (!item.url) return
    map.set(item.url, item)
  })
  return Array.from(map.values())
}

function normalizeImageRecord(image = {}) {
  const now = dayjs().toISOString()
  return {
    url: image.url || '',
    name: image.name || '未命名文件',
    date: image.date || dayjs().format('YYYY-MM-DD'),
    uploadedAt: image.uploadedAt || now,
  }
}

function formatCaseNumber(dateLike, sequence) {
  const dayKey = dayjs(dateLike).isValid() ? dayjs(dateLike).format('YYYYMMDD') : dayjs().format('YYYYMMDD')
  return `${CASE_NUMBER_PREFIX}-${dayKey}-${String(sequence).padStart(4, '0')}`
}

function parseCaseNumber(caseNumber = '') {
  const match = String(caseNumber || '').match(CASE_NUMBER_PATTERN)
  if (!match) return null

  return {
    dayKey: match[1],
    sequence: Number(match[2]),
  }
}

function ensureCaseNumbers(list = []) {
  const sorted = [...(list || [])].sort((a, b) => {
    const aTime = dayjs(a?.createdAt).valueOf() || 0
    const bTime = dayjs(b?.createdAt).valueOf() || 0
    if (aTime !== bTime) return aTime - bTime
    return String(a?.id || '').localeCompare(String(b?.id || ''))
  })

  const counters = new Map()
  const assigned = new Map()

  sorted.forEach(item => {
    const parsed = parseCaseNumber(item?.caseNumber)
    if (!parsed) return
    counters.set(parsed.dayKey, Math.max(counters.get(parsed.dayKey) || 0, parsed.sequence))
    assigned.set(item.id, item.caseNumber)
  })

  sorted.forEach(item => {
    if (assigned.has(item.id)) return
    const createdAt = item?.createdAt || dayjs().toISOString()
    const dayKey = dayjs(createdAt).isValid() ? dayjs(createdAt).format('YYYYMMDD') : dayjs().format('YYYYMMDD')
    const nextSequence = (counters.get(dayKey) || 0) + 1
    counters.set(dayKey, nextSequence)
    assigned.set(item.id, formatCaseNumber(createdAt, nextSequence))
  })

  return (list || []).map(item => ({
    ...item,
    caseNumber: assigned.get(item.id) || item.caseNumber || '',
  }))
}

export const useCaseStore = defineStore('case', () => {
  const cases = ref([])
  const unassignedImages = ref([])
  const isLoading = ref(false)
  const isSynced = ref(false)

  function loadFromLocalStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  function saveToLocalStorage(data = cases.value) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data || []))
  }

  function loadUnassignedImagesFromLocalStorage() {
    try {
      const data = localStorage.getItem(UNASSIGNED_IMAGES_KEY)
      return dedupeByUrl(data ? JSON.parse(data) : [])
    } catch {
      return []
    }
  }

  function saveUnassignedImagesToLocalStorage(data = unassignedImages.value) {
    localStorage.setItem(UNASSIGNED_IMAGES_KEY, JSON.stringify(dedupeByUrl(data || [])))
  }

  function persistToLocal() {
    saveToLocalStorage(cases.value)
    saveUnassignedImagesToLocalStorage(unassignedImages.value)
  }

  function buildAppMeta() {
    return {
      id: APP_META_ID,
      type: '__app_meta__',
      updatedAt: dayjs().toISOString(),
      unassignedImages: dedupeByUrl(unassignedImages.value),
    }
  }

  async function loadFromSupabase() {
    isLoading.value = true
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('id, data')
        .order('created_at', { ascending: false })

      if (error) throw error

      const rows = data || []
      const appMetaRow = rows.find(row => row.id === APP_META_ID || row.data?.id === APP_META_ID || row.data?.type === '__app_meta__')
      const caseRows = rows.filter(row => row.id !== APP_META_ID && row.data?.type !== '__app_meta__')

      cases.value = ensureCaseNumbers(caseRows.map(row => row.data).filter(Boolean))
      unassignedImages.value = dedupeByUrl(appMetaRow?.data?.unassignedImages || loadUnassignedImagesFromLocalStorage())
      persistToLocal()
      isSynced.value = true
    } catch (err) {
      console.error('加载失败，尝试本地数据:', err)
      cases.value = ensureCaseNumbers(loadFromLocalStorage())
      unassignedImages.value = loadUnassignedImagesFromLocalStorage()
      isSynced.value = false
    } finally {
      isLoading.value = false
    }
  }

  async function saveToSupabase() {
    try {
      const records = cases.value.map(c => ({
        id: c.id,
        data: c,
      }))

      records.push({
        id: APP_META_ID,
        data: buildAppMeta(),
      })

      const { error: upsertError } = await supabase.from('cases').upsert(records)
      if (upsertError) throw upsertError

      const { data: remoteRows, error: remoteError } = await supabase
        .from('cases')
        .select('id')
        .neq('id', APP_META_ID)

      if (remoteError) throw remoteError

      const localIds = new Set(cases.value.map(c => c.id))
      const staleIds = (remoteRows || [])
        .map(row => row.id)
        .filter(id => !localIds.has(id))

      if (staleIds.length > 0) {
        const { error: deleteError } = await supabase.from('cases').delete().in('id', staleIds)
        if (deleteError) throw deleteError
      }

      isSynced.value = true
    } catch (err) {
      console.error('保存到云失败:', err)
      isSynced.value = false
    }
  }

  async function syncState() {
    persistToLocal()
    await saveToSupabase()
  }

  async function init() {
    await loadFromSupabase()

    if (cases.value.length === 0) {
      const localData = loadFromLocalStorage()
      if (localData.length > 0) {
        cases.value = ensureCaseNumbers(localData)
      }
    }

    if (unassignedImages.value.length === 0) {
      const localUnassigned = loadUnassignedImagesFromLocalStorage()
      if (localUnassigned.length > 0) {
        unassignedImages.value = localUnassigned
      }
    }

    if (cases.value.length > 0 || unassignedImages.value.length > 0) {
      persistToLocal()
      await saveToSupabase()
    }
  }

  const stats = computed(() => {
    const list = cases.value
    return {
      total: list.filter(c => !(c.status === 'decided' && Number(c.profit) > 0)).length,
      pending: list.filter(c => c.status === 'pending_report').length,
      reported: list.filter(c => c.status === 'reported').length,
      accepted: list.filter(c => c.status === 'accepted').length,
      decided: list.filter(c => c.status === 'decided').length,
      closed: list.filter(c => c.status === 'closed').length,
      rejected: list.filter(c => c.status === 'rejected').length,
      notPunished: list.filter(c => c.status === 'not_punished').length,
    }
  })

  function getCase(id) {
    return cases.value.find(c => c.id === id)
  }

  function buildCaseRecord(data = {}) {
    const now = dayjs().toISOString()
    const status = data.status || 'pending_report'

    return {
      id: data.id || uuid(),
      caseNumber: data.caseNumber || '',
      createdAt: data.createdAt || now,
      updatedAt: now,
      shopName: data.shopName || '',
      productName: data.productName || '',
      productPrice: Number(data.productPrice ?? data.expense) || 0,
      licenseName: data.licenseName || '',
      jurisdiction: data.jurisdiction || '',
      expense: Number(data.expense ?? data.productPrice) || 0,
      profit: Number(data.profit) || 0,
      status,
      statusHistory: Array.isArray(data.statusHistory) && data.statusHistory.length > 0
        ? data.statusHistory
        : [{ from: '', to: status, changedAt: now }],
      reportDate: data.reportDate || null,
      signDate: data.signDate || null,
      trackingNumber: data.trackingNumber || '',
      reportPlatform: data.reportPlatform || '',
      acceptanceDate: data.acceptanceDate || null,
      acceptanceWay: data.acceptanceWay || '',
      decisionDate: data.decisionDate || null,
      replies: Array.isArray(data.replies) ? data.replies : [],
      documents: Array.isArray(data.documents) ? data.documents : [],
      images: Array.isArray(data.images) ? data.images : [],
      deadlines: Array.isArray(data.deadlines) ? data.deadlines : [],
      notes: data.notes || '',
      hasAdminReview: data.hasAdminReview || '',
      adminReviewResult: data.adminReviewResult || '',
      adminReviewApplyDate: data.adminReviewApplyDate || '',
      adminReviewAuthority: data.adminReviewAuthority || '',
      adminReviewAcceptDate: data.adminReviewAcceptDate || '',
      adminReviewDecisionDate: data.adminReviewDecisionDate || '',
      adminReviewDocNo: data.adminReviewDocNo || '',
    }
  }

  async function createCase(data) {
    const newCase = buildCaseRecord(data)
    cases.value = ensureCaseNumbers([newCase, ...cases.value])
    await syncState()
    return cases.value.find(item => item.id === newCase.id)
  }

  async function createCasesBulk(list = []) {
    const nextCases = list
      .filter(Boolean)
      .map(item => buildCaseRecord(item))

    if (nextCases.length === 0) return []

    cases.value = ensureCaseNumbers([...nextCases, ...cases.value])
    await syncState()
    return cases.value.filter(item => nextCases.some(next => next.id === item.id))
  }

  async function updateCase(id, data) {
    const idx = cases.value.findIndex(c => c.id === id)
    if (idx === -1) return null
    const now = dayjs().toISOString()
    const old = cases.value[idx]
    const nextCaseNumber = data.caseNumber === '' || data.caseNumber === null || data.caseNumber === undefined
      ? old.caseNumber
      : data.caseNumber
    cases.value[idx] = { ...old, ...data, caseNumber: nextCaseNumber, updatedAt: now }
    await syncState()
    return cases.value[idx]
  }

  async function changeStatus(id, newStatus, extra = {}) {
    const idx = cases.value.findIndex(c => c.id === id)
    if (idx === -1) return null
    const now = dayjs().toISOString()
    const old = cases.value[idx]
    old.statusHistory.push({ from: old.status, to: newStatus, changedAt: now })

    const normalizedExtra = { ...extra }
    if ((newStatus === 'accepted' || newStatus === 'reported') && !old.acceptanceDate && !normalizedExtra.acceptanceDate) {
      normalizedExtra.acceptanceDate = dayjs().format('YYYY-MM-DD')
    }

    if (['decided', 'closed', 'rejected', 'not_punished'].includes(newStatus) && !old.decisionDate && !normalizedExtra.decisionDate) {
      normalizedExtra.decisionDate = dayjs().format('YYYY-MM-DD')
    }

    cases.value[idx] = { ...old, status: newStatus, updatedAt: now, ...normalizedExtra }
    await syncState()
    return cases.value[idx]
  }

  async function addReply(caseId, reply) {
    const c = cases.value.find(c => c.id === caseId)
    if (!c) return null
    c.replies.unshift({
      id: uuid(),
      date: reply.date || dayjs().format('YYYY-MM-DD'),
      content: reply.content || '',
      attachmentUrls: reply.attachmentUrls || [],
    })
    c.updatedAt = dayjs().toISOString()
    await syncState()
    return c
  }

  async function addDocument(caseId, doc) {
    const c = cases.value.find(c => c.id === caseId)
    if (!c) return null
    c.documents.push({
      id: uuid(),
      name: doc.name || '未命名',
      type: doc.type || 'other',
      category: doc.category || 'other',
      note: doc.note || '',
      url: doc.url || '',
      uploadedAt: dayjs().toISOString(),
    })
    c.updatedAt = dayjs().toISOString()
    await syncState()
    return c
  }

  async function deleteCase(id) {
    cases.value = cases.value.filter(c => c.id !== id)
    await syncState()
  }

  async function batchUpdateCases(ids = [], patch = {}) {
    const idSet = new Set((ids || []).filter(Boolean))
    if (idSet.size === 0) return

    const now = dayjs().toISOString()
    let changed = false

    cases.value = cases.value.map(item => {
      if (!idSet.has(item.id)) return item
      changed = true
      return {
        ...item,
        ...patch,
        updatedAt: now,
      }
    })

    if (changed) {
      await syncState()
    }
  }

  async function deleteCases(ids = []) {
    const idSet = new Set((ids || []).filter(Boolean))
    if (idSet.size === 0) return

    const nextCases = cases.value.filter(c => !idSet.has(c.id))
    if (nextCases.length === cases.value.length) return

    cases.value = nextCases
    await syncState()
  }

  async function setUnassignedImages(list) {
    unassignedImages.value = dedupeByUrl(list)
    await syncState()
    return unassignedImages.value
  }

  async function addUnassignedImage(image) {
    if (!image?.url) return null
    const normalized = normalizeImageRecord(image)
    unassignedImages.value = [normalized, ...unassignedImages.value.filter(item => item.url !== normalized.url)]
    await syncState()
    return normalized
  }

  async function removeUnassignedImage(url) {
    if (!url) return
    const next = unassignedImages.value.filter(item => item.url !== url)
    if (next.length === unassignedImages.value.length) return
    unassignedImages.value = next
    await syncState()
  }

  async function assignCloudFile(fileUrl, caseId, image = {}, casePatch = null) {
    if (!fileUrl) return null

    const imageRecord = normalizeImageRecord({ ...image, url: fileUrl })
    const patch = casePatch && typeof casePatch === 'object' ? casePatch : null
    const now = dayjs().toISOString()
    let changed = false

    cases.value = cases.value.map(c => {
      const currentImages = Array.isArray(c.images) ? c.images : []
      const filteredImages = currentImages.filter(img => img.url !== fileUrl)
      let nextImages = filteredImages

      if (caseId && c.id === caseId) {
        nextImages = [...filteredImages, imageRecord]
      }

      const shouldApplyPatch = Boolean(caseId && c.id === caseId && patch)
      if (nextImages.length !== currentImages.length || (caseId && c.id === caseId) || shouldApplyPatch) {
        changed = true
        return {
          ...c,
          ...(shouldApplyPatch ? patch : {}),
          images: nextImages,
          updatedAt: now,
        }
      }

      return c
    })

    if (caseId) {
      const nextUnassigned = unassignedImages.value.filter(item => item.url !== fileUrl)
      if (nextUnassigned.length !== unassignedImages.value.length) {
        unassignedImages.value = nextUnassigned
        changed = true
      }
    } else {
      const existing = unassignedImages.value.find(item => item.url === fileUrl)
      const nextUnassigned = [imageRecord, ...unassignedImages.value.filter(item => item.url !== fileUrl)]
      if (!existing || JSON.stringify(existing) !== JSON.stringify(imageRecord)) {
        unassignedImages.value = nextUnassigned
        changed = true
      }
    }

    if (changed) {
      await syncState()
    }

    return imageRecord
  }

  async function removeCloudFileReferences(fileUrls) {
    const urls = Array.isArray(fileUrls) ? fileUrls.filter(Boolean) : [fileUrls].filter(Boolean)
    if (urls.length === 0) return

    const urlSet = new Set(urls)
    let changed = false

    cases.value = cases.value.map(c => {
      const currentImages = Array.isArray(c.images) ? c.images : []
      const nextImages = currentImages.filter(img => !urlSet.has(img.url))
      if (nextImages.length !== currentImages.length) {
        changed = true
        return { ...c, images: nextImages, updatedAt: dayjs().toISOString() }
      }
      return c
    })

    const nextUnassigned = unassignedImages.value.filter(item => !urlSet.has(item.url))
    if (nextUnassigned.length !== unassignedImages.value.length) {
      unassignedImages.value = nextUnassigned
      changed = true
    }

    if (changed) {
      await syncState()
    }
  }

  return {
    cases,
    unassignedImages,
    stats,
    isLoading,
    isSynced,
    init,
    getCase,
    createCase,
    createCasesBulk,
    updateCase,
    changeStatus,
    addReply,
    addDocument,
    deleteCase,
    batchUpdateCases,
    deleteCases,
    saveToLocalStorage,
    saveToSupabase,
    setUnassignedImages,
    addUnassignedImage,
    removeUnassignedImage,
    assignCloudFile,
    removeCloudFileReferences,
  }
})
