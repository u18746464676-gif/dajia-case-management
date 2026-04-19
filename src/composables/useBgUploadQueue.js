/**
 * 背景上传队列
 * - 文件立即转为 base64 入队，页面刷新后自动恢复
 * - 所有上传在后台静默进行，不阻塞页面操作
 * - 进度持久化到 localStorage，浏览器关闭后重新打开仍可继续
 */
import { ref, computed } from 'vue'
import { readFileAsDataUrl } from '@/lib/document-processing'

const QUEUE_KEY = 'bg_upload_queue_v1'
const MAX_CONCURRENT = 2  // 同时上传数量

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

// ── 队列状态（模块级别，所有实例共享同一份）───────────────────────────────
const queue = ref([])   // BgUploadItem[]
let processing = false

function loadQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    if (raw) queue.value = JSON.parse(raw)
    else queue.value = []
  } catch {
    queue.value = []
  }
}

function saveQueue() {
  try {
    // 只存 base64，不存 File 对象（File 对象无法序列化）
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.value))
  } catch (e) {
    console.error('[BgUpload] 保存队列失败:', e)
  }
}

function updateItem(id, patch) {
  const idx = queue.value.findIndex(it => it.id === id)
  if (idx !== -1) {
    queue.value[idx] = { ...queue.value[idx], ...patch }
    saveQueue()
  }
}

// ── 背景处理器 ─────────────────────────────────────────────────────────
async function processQueue(uploadFn) {
  if (processing) return
  processing = true

  while (true) {
    const pending = queue.value.filter(it => it.status === 'pending')
    if (pending.length === 0) break

    const batch = pending.slice(0, MAX_CONCURRENT)
    await Promise.allSettled(
      batch.map(item => uploadItem(item, uploadFn))
    )
  }

  processing = false
}

async function uploadItem(item, uploadFn) {
  updateItem(item.id, { status: 'uploading', progress: 0 })

  try {
    // base64 → Blob → dataUrl（readFileAsDataUrl 的逆向）
    const base64Data = item.base64.replace(/^data:[^;]+;base64,/, '')
    const binary = atob(base64Data)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    const blob = new Blob([bytes], { type: item.mimeType || 'image/jpeg' })
    const dataUrl = await readFileAsDataUrl(new File([blob], item.name, { type: item.mimeType }))

    updateItem(item.id, { progress: 50 })
    const url = await uploadFn(dataUrl, item.name)

    updateItem(item.id, { status: 'done', progress: 100, url })
    saveQueue()
    return { success: true, url, item }
  } catch (err) {
    updateItem(item.id, { status: 'error', error: err.message || '上传失败' })
    saveQueue()
    return { success: false, error: err.message, item }
  }
}

// ── 公开 API ───────────────────────────────────────────────────────────
export function useBgUploadQueue() {
  // 初始化（仅第一次调用时加载队列）
  if (queue.value.length === 0) {
    loadQueue()
    // 恢复中的上传继续处理
    const hasPending = queue.value.some(it => it.status === 'pending' || it.status === 'uploading')
    if (hasPending) {
      queue.value.forEach(it => { if (it.status === 'uploading') it.status = 'pending' })
      saveQueue()
    }
  }

  /** 当前队列（响应式） */
  const items = computed(() => queue.value)

  /** 总进度 0-100 */
  const totalProgress = computed(() => {
    if (queue.value.length === 0) return 0
    const sum = queue.value.reduce((acc, it) => acc + (it.progress || 0), 0)
    return Math.round(sum / queue.value.length)
  })

  /** 正在上传中的数量 */
  const activeCount = computed(() =>
    queue.value.filter(it => it.status === 'uploading').length
  )

  /** 是否有待处理/进行中的项目 */
  const hasActive = computed(() =>
    queue.value.some(it => it.status !== 'done' && it.status !== 'error')
  )

  /** 是否有新完成的项目（上次调用后新增的 done 项） */
  const justCompleted = computed(() =>
    queue.value.filter(it => it.status === 'done')
  )

  /**
   * 添加文件到上传队列
   * @param {File[]} files - File 对象数组
   * @param {(dataUrl: string, name: string) => Promise<string>} uploadFn - 上传函数，返回云端 URL
   */
  async function enqueueFiles(files, uploadFn) {
    const newItems = []

    for (const file of files) {
      const base64 = await readFileAsDataUrl(file)
      const item = {
        id: uid(),
        name: file.name || '未命名文件',
        mimeType: file.type || 'image/jpeg',
        base64,
        status: 'pending',   // pending | uploading | done | error
        progress: 0,
        url: '',
        error: '',
        createdAt: Date.now(),
      }
      newItems.push(item)
      queue.value.push(item)
    }

    saveQueue()

    // 立即开始处理（后台）
    processQueue(uploadFn)

    return newItems
  }

  /** 手动重试某个失败项 */
  async function retryItem(id, uploadFn) {
    const item = queue.value.find(it => it.id === id)
    if (!item || item.status === 'uploading') return
    item.status = 'pending'
    item.progress = 0
    item.error = ''
    saveQueue()
    processQueue(uploadFn)
  }

  /** 清空已完成/失败项目 */
  function clearFinished() {
    queue.value = queue.value.filter(it => it.status === 'pending' || it.status === 'uploading')
    saveQueue()
  }

  /** 清空全部队列（慎用） */
  function clearAll() {
    queue.value = []
    saveQueue()
  }

  return {
    items,
    totalProgress,
    activeCount,
    hasActive,
    justCompleted,
    enqueueFiles,
    retryItem,
    clearFinished,
    clearAll,
    processQueue,
  }
}
