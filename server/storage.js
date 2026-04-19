import http from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { URL } from 'node:url'
import { TosClient } from '@volcengine/tos-sdk'

const PORT = Number(process.env.PORT || process.env.STORAGE_SERVER_PORT || 8787)
const ENV_FILES = ['.env.local', '.env']

for (const name of ENV_FILES) {
  const file = resolve(process.cwd(), name)
  if (!existsSync(file)) continue
  const text = readFileSync(file, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue
    const idx = line.indexOf('=')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim()
    if (!(key in process.env)) process.env[key] = value
  }
}

const BUCKET = process.env.TOS_BUCKET || process.env.VITE_TOS_BUCKET || ''
const REGION = process.env.TOS_REGION || process.env.VITE_TOS_REGION || ''
const ENDPOINT = process.env.TOS_ENDPOINT || process.env.VITE_TOS_ENDPOINT || ''
const ACCESS_KEY_ID = process.env.TOS_ACCESS_KEY_ID || process.env.VITE_TOS_ACCESS_KEY_ID || ''
const SECRET_ACCESS_KEY = process.env.TOS_SECRET_ACCESS_KEY || process.env.VITE_TOS_SECRET_ACCESS_KEY || ''
const ALLOWED_ORIGIN = process.env.STORAGE_ALLOWED_ORIGIN || '*'

function json(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(JSON.stringify(data))
}

function getTosFileUrl(key = '') {
  return `https://${BUCKET}.${ENDPOINT}/${key}`
}

function getTosKeyFromUrl(urlOrKey = '') {
  try {
    const urlObj = new URL(urlOrKey)
    return decodeURIComponent(urlObj.pathname.replace(/^\//, ''))
  } catch {
    return decodeURIComponent(String(urlOrKey).replace(/^\//, ''))
  }
}

function createClient() {
  if (!BUCKET || !REGION || !ENDPOINT || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
    throw new Error('TOS server env missing')
  }
  return new TosClient({
    accessKeyId: ACCESS_KEY_ID,
    accessKeySecret: SECRET_ACCESS_KEY,
    region: REGION,
    endpoint: ENDPOINT,
    autoRecognizeContentType: false,
  })
}

async function parseBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

function parseDataUrl(input = '') {
  const match = String(input).match(/^data:(.+?);base64,(.+)$/)
  if (!match) throw new Error('invalid data url')
  return {
    contentType: match[1],
    buffer: Buffer.from(match[2], 'base64'),
  }
}

function normalizeError(error) {
  const statusCode = error?.statusCode || error?.data?.StatusCode || 500
  const code = error?.data?.Code || error?.code || 'StorageError'
  const message = error?.data?.Message || error?.message || 'storage error'
  return { statusCode, code, message }
}

const server = http.createServer(async (req, res) => {
  if (!req.url) return json(res, 400, { error: 'missing url' })
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    return res.end()
  }

  if (url.pathname === '/health') {
    return json(res, 200, {
      ok: true,
      bucket: BUCKET,
      region: REGION,
      endpoint: ENDPOINT,
      mode: 'server-storage',
    })
  }

  try {
    const client = createClient()

    // 列出云端文件
    if (req.method === 'GET' && url.pathname === '/api/storage/files') {
      const prefix = url.searchParams.get('prefix') || 'case-images/'
      const result = await client.listObjects({ bucket: BUCKET, prefix })
      const files = (result?.data?.contents || []).map(item => ({
        ...item,
        url: getTosFileUrl(item.Key),
      }))
      return json(res, 200, { files })
    }

    // 上传文件到 TOS
    if (req.method === 'POST' && url.pathname === '/api/storage/upload') {
      const body = await parseBody(req)
      const fileName = body.fileName || `file_${Date.now()}.jpg`
      const { contentType, buffer } = parseDataUrl(body.base64Data || '')
      const key = `case-images/${Date.now()}_${fileName}`

      await client.putObject({
        bucket: BUCKET,
        key,
        body: buffer,
        contentType: contentType || 'image/jpeg',
      })

      return json(res, 200, { url: getTosFileUrl(key), key })
    }

    // 删除单个云端文件
    if (req.method === 'DELETE' && url.pathname === '/api/storage/file') {
      const urlOrKey = url.searchParams.get('urlOrKey') || ''
      const key = getTosKeyFromUrl(urlOrKey)
      if (!key) return json(res, 400, { error: 'missing urlOrKey' })
      await client.deleteObject({ bucket: BUCKET, key })
      return json(res, 200, { ok: true, deletedKey: key })
    }

    // 批量删除云端文件
    if (req.method === 'POST' && url.pathname === '/api/storage/batch-delete') {
      const body = await parseBody(req)
      const urls = Array.isArray(body.urls) ? body.urls : []
      const errors = []
      for (const urlOrKey of urls) {
        try {
          const key = getTosKeyFromUrl(urlOrKey)
          if (key) await client.deleteObject({ bucket: BUCKET, key })
        } catch (e) {
          errors.push({ url: urlOrKey, error: e.message })
        }
      }
      return json(res, 200, { ok: errors.length === 0, deleted: urls.length, errors })
    }

    return json(res, 404, { error: 'not found' })
  } catch (error) {
    const normalized = normalizeError(error)
    return json(res, normalized.statusCode, normalized)
  }
})

server.listen(PORT, () => {
  console.log(`[storage-server] listening on http://0.0.0.0:${PORT}`)
})
