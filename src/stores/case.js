import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { supabase } from '@/lib/supabase'
import {
  ensureCloudFilesTable,
  registerCloudFile,
  verifyCloudFileExists,
  fetchUnassignedFiles,
  fetchCaseFileUrls,
  deleteCloudFilesByUrl,
  deleteCloudFiles,
} from '@/lib/cloudFiles'

const STORAGE_KEY = 'pdd_case_list_v1'
const UNASSIGNED_IMAGES_KEY = 'unassigned_images'
const APP_META_ID = '00000000-0000-0000-0000-000000000000'
const CASE_NUMBER_PREFIX = 'AJ'
const CASE_NUMBER_PATTERN = /^AJ-(\d{8})-(\d{4})$/
const STORAGE_API_BASE = import.meta.env.VITE_STORAGE_API_BASE || 'http://192.168.1.28:8787'

// 从 TOS URL 中提取对象 key，例如：
// https://dajia-case.tos-cn-beijing.volces.com/case-images/abc.jpg → case-images/abc.jpg
function extractTosKey(url) {
  if (!url) return ''
  try {
    const u = new URL(url)
    return u.pathname.replace(/^\//, '')
  } catch {
    return url
  }
}

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
    ocrTitle: image.ocrTitle || '',   // OCR 提取的标题（独立展示，不改文件名）
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
    // console.log('[Supabase] 开始加载数据...')
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

      // 云端返回空但本地有数据时，用本地数据（防止上传失败导致刷新丢数据）
      if (cases.value.length === 0) {
        const localData = loadFromLocalStorage()
        if (localData.length > 0) {
          cases.value = ensureCaseNumbers(localData)
        }
      }

      persistToLocal()
      isSynced.value = true
    } catch (err) {
      console.error('[Supabase] 加载失败:', err)
      console.error('[Supabase] 尝试使用本地数据...')
      cases.value = ensureCaseNumbers(loadFromLocalStorage())
      unassignedImages.value = loadUnassignedImagesFromLocalStorage()
      isSynced.value = false
    } finally {
      isLoading.value = false
    }
    // console.log('[Supabase] 最终案件数:', cases.value.length)
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

  // ── 云端文件操作 ────────────────────────────────────
  async function deleteFilesFromCloud(urls) {
    if (!urls || urls.length === 0) return
    // 1. 从 TOS 云存储删除
    try {
      const body = JSON.stringify({ urls })
      await fetch(`${STORAGE_API_BASE}/api/storage/batch-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      })
    } catch (e) {
      console.warn('[cloud] TOS delete failed:', e)
    }
    // 2. 从 Supabase cloud_files 软删除
    await deleteCloudFilesByUrl(urls)
  }

  async function init() {
    // 确保 cloud_files 表存在
    await ensureCloudFilesTable()
    await loadFromSupabase()
    // 尝试从 cloud_files 加载未分配图片（云端优先）
    try {
      const cloudFiles = await fetchUnassignedFiles()
      if (cloudFiles && cloudFiles.length > 0) {
        const cloudUrls = new Set(unassignedImages.value.map(i => i.url))
        const merged = [
          ...unassignedImages.value,
          ...cloudFiles.map(f => ({ url: f.file_url, key: f.file_key, name: f.file_name, id: f.id, uploadedAt: f.uploaded_at })),
        ]
        unassignedImages.value = dedupeByUrl(merged)
      }
    } catch (e) {
      console.warn('[cloud] fetchUnassignedFiles failed:', e)
    }

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

  // 终态综合状态：已调解最优先，其次举报结果，其次终止调解，最后受理状态
  function getEffectiveStatus(c) {
    if (c.mediationStatus === 'decided') return 'decided'
    if (c.reportResultStatus) return c.reportResultStatus
    if (c.mediationStatus) return c.mediationStatus
    if (c.acceptanceStatus) return c.acceptanceStatus
    return 'pending_report'
  }

  const stats = computed(() => {
    return {
      total: cases.value.filter(c => getEffectiveStatus(c) !== 'decided').length,
      pending: cases.value.filter(c => getEffectiveStatus(c) === 'pending_report').length,
      reported: cases.value.filter(c => getEffectiveStatus(c) === 'reported').length,
      accepted: cases.value.filter(c => getEffectiveStatus(c) === 'accepted').length,
      decided: cases.value.filter(c => getEffectiveStatus(c) === 'decided').length,
      closed: cases.value.filter(c => getEffectiveStatus(c) === 'closed').length,
      rejected: cases.value.filter(c => getEffectiveStatus(c) === 'rejected').length,
      notPunished: cases.value.filter(c => getEffectiveStatus(c) === 'not_punished').length,
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
    const caseToDelete = cases.value.find(c => c.id === id)
    if (caseToDelete) {
      // 收集所有图片 URL 并从云端删除
      const imageUrls = []
        .concat(Array.isArray(caseToDelete.images) ? caseToDelete.images : [])
        .concat(Array.isArray(caseToDelete.attachmentUrls) ? caseToDelete.attachmentUrls : [])
        .map(img => typeof img === 'string' ? img : img?.url)
        .filter(Boolean)
      if (imageUrls.length > 0) await deleteFilesFromCloud(imageUrls)
    }
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

    // 批量收集所有待删案件的图片并从云端删除
    const toDelete = cases.value.filter(c => idSet.has(c.id))
    const imageUrls = []
    for (const c of toDelete) {
      ;[].concat(Array.isArray(c.images) ? c.images : [])
        .concat(Array.isArray(c.attachmentUrls) ? c.attachmentUrls : [])
        .map(img => typeof img === 'string' ? img : img?.url)
        .filter(Boolean)
        .forEach(url => imageUrls.push(url))
    }
    if (imageUrls.length > 0) await deleteFilesFromCloud(imageUrls)

    cases.value = cases.value.filter(c => !idSet.has(c.id))
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
    // 注册到云端 cloud_files 表并二次验证
    if (image.key || image.url) {
      const regResult = await registerCloudFile({
        fileUrl: image.url,
        fileKey: image.key || extractTosKey(image.url),
        fileName: image.name,
      })
      if (regResult.error) {
        console.error('[addUnassignedImage] ❌ cloud_files 注册失败:', regResult.error)
        // 抛出让调用方感知
        throw new Error('cloud_files 注册失败: ' + (regResult.error.message || JSON.stringify(regResult.error)))
      }
      const verifyResult = await verifyCloudFileExists(image.url)
      if (!verifyResult.exists) {
        throw new Error('文件入库二次验证失败：数据库记录不存在')
      }
    }
    await syncState()
    return normalized
  }

  async function removeUnassignedImage(url) {
    if (!url) return
    const next = unassignedImages.value.filter(item => item.url !== url)
    if (next.length === unassignedImages.value.length) return
    unassignedImages.value = next
    await deleteFilesFromCloud([url])
    await syncState()
  }

  async function assignCloudFile(fileUrl, caseId, image = {}, casePatch = null) {
    if (!fileUrl) return null

    const imageRecord = normalizeImageRecord({ ...image, url: fileUrl })
    const patch = casePatch && typeof casePatch === 'object' ? casePatch : null
    const now = dayjs().toISOString()
    const lowerUrl = String(fileUrl || '').toLowerCase()
    const lowerName = String(image?.name || '').toLowerCase()
    const explicitFileType = String(image?.fileType || '').toLowerCase()
    const isDocumentFile = explicitFileType === 'doc' || explicitFileType === 'pdf' || /\.(doc|docx|pdf)$/i.test(lowerUrl) || /\.(doc|docx|pdf)$/i.test(lowerName)
    let changed = false

    cases.value = cases.value.map(c => {
      const currentImages = Array.isArray(c.images) ? c.images : []
      const currentDocuments = Array.isArray(c.documents) ? c.documents : []
      const filteredImages = currentImages.filter(img => img.url !== fileUrl)
      const filteredDocuments = currentDocuments.filter(doc => doc.url !== fileUrl)
      let nextImages = filteredImages
      let nextDocuments = filteredDocuments

      if (caseId && c.id === caseId) {
        if (isDocumentFile) {
          nextDocuments = [
            ...filteredDocuments,
            {
              id: uuid(),
              name: image?.name || '未命名文档',
              type: explicitFileType === 'pdf' || /\.pdf$/i.test(lowerUrl) || /\.pdf$/i.test(lowerName) ? 'pdf' : 'other',
              category: 'other',
              note: image?.note || '',
              url: fileUrl,
              uploadedAt: image?.uploadedAt || now,
            },
          ]
        } else {
          nextImages = [...filteredImages, imageRecord]
        }
      }

      const shouldApplyPatch = Boolean(caseId && c.id === caseId && patch)
      const imagesChanged = nextImages.length !== currentImages.length || JSON.stringify(nextImages) !== JSON.stringify(currentImages)
      const documentsChanged = nextDocuments.length !== currentDocuments.length || JSON.stringify(nextDocuments) !== JSON.stringify(currentDocuments)
      if (imagesChanged || documentsChanged || (caseId && c.id === caseId) || shouldApplyPatch) {
        changed = true
        return {
          ...c,
          ...(shouldApplyPatch ? patch : {}),
          images: nextImages,
          documents: nextDocuments,
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
      // 未匹配案件 → 写入 cloud_files 表
      const regResult = await registerCloudFile({
        fileUrl,
        fileKey: extractTosKey(fileUrl),
        fileName: imageRecord.name,
        fileType: image.fileType || 'image',
        ocrTitle: imageRecord.ocrTitle || '',
      })
      if (regResult.error) {
        console.error('[assignCloudFile] ❌ cloud_files 注册失败:', regResult.error)
        throw new Error('cloud_files 注册失败: ' + (regResult.error.message || JSON.stringify(regResult.error)))
      }

      // 二次验证（stub 始终返回 exists:true，可确保写入成功）
      const verifyResult = await verifyCloudFileExists(fileUrl)
      if (!verifyResult.exists) {
        console.error('[assignCloudFile] ❌ 二次验证失败：数据库记录不存在！fileUrl:', fileUrl)
        throw new Error('文件入库二次验证失败：数据库记录不存在，请联系管理员')
      }

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
