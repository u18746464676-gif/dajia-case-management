const express = require('express')
const { createClient } = require('@supabase/supabase-js')
const cors = require('cors')

const app = express()
const PORT = 3001

// ── CORS ─────────────────────────────────────────────────
app.use(cors())
app.use(express.json())

// ── 常量 ─────────────────────────────────────────────────
const SUPABASE_URL = 'https://hsfovbgeeqomtvaegfqb.supabase.co'
const ALLOWED_HOSTS = ['dajia-case.tos-cn-beijing.volces.com']
const ALLOWED_PREFIXES = ['case-images/', 'case-docs/', 'case-attachments/']

// ── 参数校验 ──────────────────────────────────────────────
function validatePayload(body) {
  const { caseId, fileUrl, fileKey, fileName, fileType, fileSize } = body

  if (!fileUrl || typeof fileUrl !== 'string') {
    return { ok: false, code: 'MISSING_FILE_URL', message: '缺少 fileUrl' }
  }
  if (!fileKey || typeof fileKey !== 'string') {
    return { ok: false, code: 'MISSING_FILE_KEY', message: '缺少 fileKey' }
  }
  if (!fileName || typeof fileName !== 'string') {
    return { ok: false, code: 'MISSING_FILE_NAME', message: '缺少 fileName' }
  }

  // 校验 fileUrl hostname
  let url
  try { url = new URL(fileUrl) } catch {
    return { ok: false, code: 'INVALID_URL', message: 'fileUrl 格式错误' }
  }
  if (!ALLOWED_HOSTS.includes(url.hostname)) {
    return { ok: false, code: 'INVALID_HOST', message: `fileUrl hostname 不在白名单: ${url.hostname}` }
  }

  // 去掉前导 / 后校验路径前缀
  const pathname = url.pathname.replace(/^\//, '')
  if (!ALLOWED_PREFIXES.some(p => pathname.startsWith(p))) {
    return { ok: false, code: 'INVALID_PATH', message: `fileUrl path 不合规: /${pathname}` }
  }

  // 校验 fileKey 前缀
  if (!ALLOWED_PREFIXES.some(p => fileKey.startsWith(p))) {
    return { ok: false, code: 'INVALID_KEY', message: `fileKey 不合规: ${fileKey}` }
  }

  return {
    ok: true,
    data: {
      caseId: typeof caseId === 'string' ? caseId : null,
      fileUrl,
      fileKey,
      fileName,
      fileType: typeof fileType === 'string' ? fileType : 'image',
      fileSize: typeof fileSize === 'number' ? fileSize : null,
    },
  }
}

// ── POST /api/register-cloud-file ────────────────────────
app.post('/api/register-cloud-file', async (req, res) => {
  const t0 = Date.now()
  const body = req.body

  // 1. 校验参数
  const validation = validatePayload(body)
  if (!validation.ok) {
    console.log(`[register] ❌ INPUT_REJECTED code=${validation.code} msg=${validation.message}`)
    return res.status(400).json({ error: validation.message, code: validation.code })
  }
  const { caseId, fileUrl, fileKey, fileName, fileType, fileSize } = validation.data

  // 2. 写库（service role 绕过 RLS）
  const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  const { data, error } = await supabase
    .from('cloud_files')
    .insert({
      case_id: caseId,
      file_url: fileUrl,
      file_key: fileKey,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
    })
    .select()
    .single()

  if (error) {
    console.log(`[register] ❌ DB_ERROR fileUrl=${fileUrl} pg_code=${error.code} pg_msg=${error.message} latency_ms=${Date.now() - t0}`)
    return res.status(500).json({
      error: '数据库写入失败',
      code: 'DB_ERROR',
      pg_code: error.code,
      pg_message: error.message,
      pg_details: error.details,
      pg_hint: error.hint,
    })
  }

  console.log(`[register] ✅ SUCCESS id=${data.id} fileUrl=${fileUrl} latency_ms=${Date.now() - t0}`)
  return res.json({ success: true, data, latency_ms: Date.now() - t0 })
})

// ── 健康检查 ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ ok: true, ts: Date.now() })
})

// ── 启动 ─────────────────────────────────────────────────
app.listen(PORT, '127.0.0.1', () => {
  console.log(`[api] 后端服务启动，监听 127.0.0.1:${PORT}`)
  console.log(`[api] SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '已设置(' + process.env.SUPABASE_SERVICE_ROLE_KEY.slice(0, 10) + '...)' : '❌ 未设置'}`)
})
