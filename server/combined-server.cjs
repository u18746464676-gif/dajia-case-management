const express = require('express')
const { createClient } = require('@supabase/supabase-js')
const cors = require('cors')
const { TosClient } = require('@volcengine/tos-sdk')
const fs = require('fs')
const path = require('path')

const LOCAL_UPLOAD_ROOT = process.env.LOCAL_UPLOAD_ROOT || '/uploads'

const app = express()
const PORT = 3001

// ── CORS ─────────────────────────────────────────────────
app.use(cors())
app.use(express.json({ limit: '50mb' }))

// ── TOS 环境变量 ──────────────────────────────────────────
function loadEnv() {
  const files = ['/var/www/case-management-api/.env', '/var/www/case-management-api/.env.local']
  for (const f of files) {
    if (!fs.existsSync(f)) continue
    const text = fs.readFileSync(f, 'utf8')
    for (const line of text.split(/\r?\n/)) {
      if (!line || line.trim().startsWith('#')) continue
      const idx = line.indexOf('=')
      if (idx === -1) continue
      const key = line.slice(0, idx).trim()
      const value = line.slice(idx + 1).trim()
      if (!(key in process.env)) process.env[key] = value
    }
  }
}
loadEnv()

const TOS_BUCKET = process.env.TOS_BUCKET || process.env.VITE_TOS_BUCKET || ''
const TOS_REGION = process.env.TOS_REGION || process.env.VITE_TOS_REGION || ''
const TOS_ENDPOINT = process.env.TOS_ENDPOINT || process.env.VITE_TOS_ENDPOINT || ''
const TOS_AK = process.env.TOS_ACCESS_KEY_ID || process.env.VITE_TOS_ACCESS_KEY_ID || ''
const TOS_SK = process.env.TOS_SECRET_ACCESS_KEY || process.env.VITE_TOS_SECRET_ACCESS_KEY || ''

console.log(`[api] TOS_BUCKET=${TOS_BUCKET} TOS_REGION=${TOS_REGION} TOS_ENDPOINT=${TOS_ENDPOINT}`)
console.log(`[api] TOS_AK=${TOS_AK ? TOS_AK.slice(0, 8) + '...' : '❌ 未设置'}`)

// ── 常量 ─────────────────────────────────────────────────
const SUPABASE_URL = 'https://hsfovbgeeqomtvaegfqb.supabase.co'
const ALLOWED_HOSTS = ['dajia-case.tos-cn-beijing.volces.com']
const ALLOWED_PREFIXES = ['case-images/', 'case-docs/', 'case-attachments/']

// ── TOS 客户端 ────────────────────────────────────────────
let tosClient = null
function getTosClient() {
  if (!tosClient) {
    if (!TOS_BUCKET || !TOS_REGION || !TOS_ENDPOINT || !TOS_AK || !TOS_SK) {
      throw new Error(`TOS配置不完整: BUCKET=${!!TOS_BUCKET} REGION=${!!TOS_REGION} ENDPOINT=${!!TOS_ENDPOINT} AK=${!!TOS_AK} SK=${!!TOS_SK}`)
    }
    tosClient = new TosClient({
      accessKeyId: TOS_AK,
      accessKeySecret: TOS_SK,
      region: TOS_REGION,
      endpoint: TOS_ENDPOINT,
      autoRecognizeContentType: false,
    })
  }
  return tosClient
}

function getTosFileUrl(key = '') {
  return `https://${TOS_BUCKET}.${TOS_ENDPOINT}/${key}`
}

// ── 参数校验 ──────────────────────────────────────────────
function validatePayload(body) {
  const { caseId, fileUrl, fileKey, fileName, fileType, fileSize, ocrTitle } = body
  // ocrTitle: optional OCR title (extracted title, stored separately from file_name)
  if (!fileUrl || typeof fileUrl !== 'string') return { ok: false, code: 'MISSING_FILE_URL', message: '缺少 fileUrl' }
  if (!fileKey || typeof fileKey !== 'string') return { ok: false, code: 'MISSING_FILE_KEY', message: '缺少 fileKey' }
  if (!fileName || typeof fileName !== 'string') return { ok: false, code: 'MISSING_FILE_NAME', message: '缺少 fileName' }

  const isLocalUploadPath = value => typeof value === 'string' && value.startsWith('/uploads/')
  const isAllowedRemoteUrl = value => {
    let url
    try {
      url = new URL(value)
    } catch {
      return { ok: false, code: 'INVALID_URL', message: 'fileUrl 格式错误' }
    }
    if (!ALLOWED_HOSTS.includes(url.hostname)) return { ok: false, code: 'INVALID_HOST', message: `fileUrl hostname 不在白名单: ${url.hostname}` }
    const pathname = url.pathname.replace(/^\//, '')
    if (!ALLOWED_PREFIXES.some(p => pathname.startsWith(p))) return { ok: false, code: 'INVALID_PATH', message: `fileUrl path 不合规: /${pathname}` }
    return { ok: true }
  }

  if (isLocalUploadPath(fileUrl)) {
    if (!isLocalUploadPath(fileKey)) return { ok: false, code: 'INVALID_KEY', message: `fileKey 不合规: ${fileKey}` }
  } else {
    const remoteCheck = isAllowedRemoteUrl(fileUrl)
    if (!remoteCheck.ok) return remoteCheck
    if (!ALLOWED_PREFIXES.some(p => fileKey.startsWith(p))) return { ok: false, code: 'INVALID_KEY', message: `fileKey 不合规: ${fileKey}` }
  }

  return { ok: true, data: { caseId: typeof caseId === 'string' ? caseId : null, fileUrl, fileKey, fileName, fileType: typeof fileType === 'string' ? fileType : 'image', fileSize: typeof fileSize === 'number' ? fileSize : null } }
}

// ── POST /api/storage/upload ─────────────────────────────
app.post('/api/storage/upload', async (req, res) => {
  const t0 = Date.now()
  try {
    const { base64Data, fileName, fileKey } = req.body
    if (!base64Data) return res.status(400).json({ error: '缺少 base64Data', code: 'MISSING_BASE64' })
    if (!fileName) return res.status(400).json({ error: '缺少 fileName', code: 'MISSING_FILENAME' })

    const match = String(base64Data).match(/^data:(.+?);base64,(.+)$/)
    if (!match) return res.status(400).json({ error: 'invalid data url format', code: 'INVALID_DATA_URL' })
    const contentType = match[1]
    const buffer = Buffer.from(match[2], 'base64')

    // fileKey 可选：传了则直接用（Word 专用链路），不传则走默认 case-images/
    const key = fileKey || `case-images/${Date.now()}_${fileName}`
    const client = getTosClient()

    await client.putObject({
      bucket: TOS_BUCKET,
      key,
      body: buffer,
      contentType: contentType || 'image/jpeg',
    })

    const fileUrl = getTosFileUrl(key)
    console.log(`[storage-upload] ✅ key=${key} url=${fileUrl} size=${buffer.length} latency_ms=${Date.now() - t0}`)
    return res.json({ url: fileUrl, key })
  } catch (err) {
    console.error(`[storage-upload] ❌ ${err.message}`)
    return res.status(500).json({ error: err.message, code: 'UPLOAD_FAILED', details: err.stack ? String(err.stack).split('\n')[0] : undefined })
  }
})

// ── POST /api/register-cloud-file ────────────────────────
app.post('/api/register-cloud-file', async (req, res) => {
  const t0 = Date.now()
  const body = req.body
  const validation = validatePayload(body)
  if (!validation.ok) {
    console.log(`[register] ❌ INPUT_REJECTED code=${validation.code} msg=${validation.message}`)
    return res.status(400).json({ error: validation.message, code: validation.code })
  }
  const { caseId, fileUrl, fileKey, fileName, fileType, fileSize } = validation.data
  const ocrTitle = body.ocrTitle || ''
  const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const { data, error } = await supabase.from('cloud_files').insert({ case_id: caseId, file_url: fileUrl, file_key: fileKey, file_name: fileName, file_type: fileType, file_size: fileSize, ocr_title: ocrTitle }).select().single()
  if (error) {
    console.log(`[register] ❌ DB_ERROR fileUrl=${fileUrl} pg_code=${error.code} pg_msg=${error.message} latency_ms=${Date.now() - t0}`)
    return res.status(500).json({ error: '数据库写入失败', code: 'DB_ERROR', pg_code: error.code, pg_message: error.message, pg_details: error.details, pg_hint: error.hint })
  }
  console.log(`[register] ✅ SUCCESS id=${data.id} fileUrl=${fileUrl} latency_ms=${Date.now() - t0}`)
  return res.json({ success: true, data, latency_ms: Date.now() - t0 })
})

// ── 健康检查 ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ ok: true, ts: Date.now(), mode: 'combined-storage' })
})

// ── GET /api/storage/files ────────────────────────────────
app.get('/api/storage/files', async (req, res) => {
  try {
    const { prefix = '', limit = '200' } = req.query
    const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    let query = supabase
      .from('cloud_files')
      .select('id,file_url,file_key,file_name,file_type,file_size,uploaded_at,deleted_at,case_id,ocr_title')
      .is('deleted_at', null)
      .order('uploaded_at', { ascending: false })
      .limit(Math.min(Number(limit) || 200, 500))

    if (prefix) {
      query = query.like('file_key', `${prefix}%`)
    }

    const { data, error } = await query
    if (error) {
      console.error('[storage/files] db error:', error.message)
      return res.status(500).json({ error: '列表获取失败', detail: error.message })
    }

    const files = (data || []).map(item => ({
      id: item.id,
      url: item.file_url,
      key: item.file_key,
      name: item.file_name,
      fileType: item.file_type,
      size: item.file_size,
      uploadedAt: item.uploaded_at,
      deletedAt: item.deleted_at,
      caseId: item.case_id,
      ocrTitle: item.ocr_title,
    }))

    return res.json({ files })
  } catch (err) {
    console.error('[storage/files] list error:', err?.message)
    return res.status(500).json({ error: '列表获取失败', detail: err?.message })
  }
})

// ── DELETE /api/storage/file ─────────────────────────────
app.delete('/api/storage/file', async (req, res) => {
  const { urlOrKey } = req.query
  if (!urlOrKey) return res.status(400).json({ error: '缺少 urlOrKey 参数' })

  let lookup = String(urlOrKey)
  if (lookup.startsWith('http')) {
    try {
      const u = new URL(lookup)
      lookup = u.pathname
    } catch {
      return res.status(400).json({ error: 'urlOrKey 格式错误' })
    }
  }

  const normalizedPath = lookup.startsWith('/uploads/') ? lookup : `/${lookup.replace(/^\/+/, '')}`
  if (!normalizedPath.startsWith('/uploads/')) {
    return res.status(400).json({ error: '仅允许删除 /uploads/ 下文件' })
  }

  try {
    const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    const { data: record, error: findError } = await supabase
      .from('cloud_files')
      .select('id,file_url,file_key,deleted_at')
      .or(`file_url.eq.${normalizedPath},file_key.eq.${normalizedPath}`)
      .is('deleted_at', null)
      .order('uploaded_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (findError) {
      console.error('[storage/file] db find error:', findError.message)
      return res.status(500).json({ error: '删除失败', detail: findError.message })
    }
    if (!record) {
      return res.status(404).json({ error: '未找到对应文件记录' })
    }

    const localFilePath = path.resolve(LOCAL_UPLOAD_ROOT, normalizedPath.replace(/^\/uploads\//, ''))
    let fileDeleted = false
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath)
      fileDeleted = true
    }

    const deletedAt = new Date().toISOString()
    const { data: updated, error: updateError } = await supabase
      .from('cloud_files')
      .update({ deleted_at: deletedAt })
      .eq('id', record.id)
      .select('id,file_url,file_key,deleted_at')
      .single()

    if (updateError) {
      console.error('[storage/file] db update error:', updateError.message)
      return res.status(500).json({ error: '删除失败', detail: updateError.message })
    }

    return res.json({ success: true, fileDeleted, localFilePath, data: updated })
  } catch (err) {
    console.error('[storage/file] delete error:', err?.message)
    return res.status(500).json({ error: '删除失败', detail: err?.message })
  }
})

// ── 临时管理接口：添加 ocr_title 列 ─────────────────────────
app.post('/api/admin/add-ocr-title-column', async (req, res) => {
  try {
    const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    const { error } = await supabase.rpc('exec', {
      sql: 'ALTER TABLE cloud_files ADD COLUMN IF NOT EXISTS ocr_title TEXT;',
    })
    if (error) {
      // RPC exec not available, try direct table check approach
      // First check if column exists by attempting a select
      const { data, error: selectErr } = await supabase
        .from('cloud_files')
        .select('ocr_title')
        .limit(1)
      if (selectErr && selectErr.message.includes('ocr_title')) {
        return res.json({ ok: false, reason: 'column missing but cannot add via API - please add manually in Supabase dashboard' })
      }
      // If error is not about missing column, it's something else
      if (selectErr && !selectErr.message.includes('does not exist')) {
        return res.status(500).json({ ok: false, error: selectErr.message })
      }
      return res.json({ ok: true, note: 'column already exists or not needed' })
    }
    return res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

// ── 启动 ─────────────────────────────────────────────────
app.listen(PORT, '127.0.0.1', () => {
  console.log(`[api] 后端服务启动，监听 127.0.0.1:${PORT}`)
  console.log(`[api] SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '已设置' : '❌ 未设置'}`)
  console.log(`[api] TOS: ${TOS_BUCKET ? '已配置' : '❌ 未配置'}`)
})
