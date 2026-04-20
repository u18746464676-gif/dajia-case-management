import { TosClient } from '@volcengine/tos-sdk'

const isBrowser = typeof window !== 'undefined'

const BUCKET = import.meta.env.VITE_TOS_BUCKET || ''
const REGION = import.meta.env.VITE_TOS_REGION || ''
const ENDPOINT = import.meta.env.VITE_TOS_ENDPOINT || ''
const ACCESS_KEY_ID = import.meta.env.VITE_TOS_ACCESS_KEY_ID || ''
const SECRET_ACCESS_KEY = import.meta.env.VITE_TOS_SECRET_ACCESS_KEY || ''
const STORAGE_API_BASE = (import.meta.env.VITE_STORAGE_API_BASE || '').replace(/\/$/, '')

let tosClient = null

function normalizeTosError(error) {
  const statusCode = error?.statusCode || error?.data?.StatusCode || error?.status || 0
  const code = error?.data?.Code || error?.code || error?.error || ''

  if (statusCode === 403 || code === 'SignatureDoesNotMatch') {
    return new Error('云存储鉴权失败（403）。当前 TOS 密钥或签名配置不正确，请更新后再试。')
  }

  if (error?.message) {
    return new Error(`云存储异常：${error.message}`)
  }

  return new Error('云存储异常，请稍后重试')
}

async function requestStorageApi(path, options = {}) {
  const url = `${STORAGE_API_BASE}${path}`
  let data = {}
  let bodyText = ''
  let status = 0

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    })

    status = response.status
    bodyText = await response.text()

    try {
      data = bodyText ? JSON.parse(bodyText) : {}
    } catch {
      data = { _raw: bodyText }
    }

    if (!response.ok) {
      const msg = data?.error || data?.message || data?.msg || bodyText || 'unknown'
      const err = new Error(`UPLOAD FAILED status=${status} body=${typeof msg === 'string' ? msg : JSON.stringify(msg)}`)
      err._status = status
      err._body = bodyText
      err._data = data
      throw err
    }

    return data
  } catch (e) {
    if (e._status !== undefined) throw e
    const err = new Error(`UPLOAD FAILED status=${status} body=${bodyText || e.message}`)
    err._status = status
    err._body = bodyText
    err._data = data
    throw err
  }
}

function useStorageApi() {
  return Boolean(STORAGE_API_BASE)
}

export function isTosConfigured() {
  return useStorageApi() || !!(BUCKET && REGION && ENDPOINT && ACCESS_KEY_ID && SECRET_ACCESS_KEY)
}

export function getTosFileUrl(key = '') {
  const raw = String(key || '')

  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw

  if (BUCKET && ENDPOINT) {
    return `https://${BUCKET}.${ENDPOINT}/${raw.replace(/^\//, '')}`
  }

  if (STORAGE_API_BASE) {
    return `${STORAGE_API_BASE}${raw.startsWith('/') ? '' : '/'}${raw}`
  }

  return raw
}

function getTosKeyFromUrl(urlOrKey = '') {
  try {
    const urlObj = new URL(urlOrKey)
    return decodeURIComponent(urlObj.pathname.replace(/^\//, ''))
  } catch {
    return decodeURIComponent(String(urlOrKey).replace(/^\//, ''))
  }
}

export function getTosClient() {
  if (!isBrowser) return null

  if (!tosClient) {
    if (!isTosConfigured()) {
      throw new Error('TOS配置不完整，请检查环境变量')
    }

    tosClient = new TosClient({
      accessKeyId: ACCESS_KEY_ID,
      accessKeySecret: SECRET_ACCESS_KEY,
      region: REGION,
      endpoint: ENDPOINT,
      autoRecognizeContentType: false,
    })
  }

  return tosClient
}

export async function listTosObjects(prefix = 'case-images/') {
  try {
    if (useStorageApi()) {
      const data = await requestStorageApi(`/api/storage/files?prefix=${encodeURIComponent(prefix)}`, {
        method: 'GET',
      })
      return data.files || []
    }

    const client = getTosClient()
    const result = await client.listObjects({
      bucket: BUCKET,
      prefix,
    })
    return result?.data?.contents || []
  } catch (error) {
    throw normalizeTosError(error)
  }
}

export async function uploadBase64ToTos(base64Data, fileName = 'image.jpg') {
  if (!isBrowser) return null

  const bLen = base64Data ? base64Data.length : 0

  try {
    if (useStorageApi()) {
      const data = await requestStorageApi('/api/storage/upload', {
        method: 'POST',
        body: JSON.stringify({ base64Data, fileName }),
      })
      return data.url
    }

    const base64Response = await fetch(base64Data)
    const blob = await base64Response.blob()
    const client = getTosClient()
    const timestamp = Date.now()
    const key = `case-images/${timestamp}_${fileName}`

    const result = await client.putObject({
      bucket: BUCKET,
      key,
      body: blob,
      contentType: blob.type || 'image/jpeg',
    })

    if (!result || (result.statusCode && result.statusCode >= 400)) {
      throw new Error('云端上传失败，未收到有效响应')
    }

    await client.headObject({
      bucket: BUCKET,
      key,
    })

    const finalUrl = getTosFileUrl(key)
    return finalUrl
  } catch (error) {
    const msg = `error=${error.message}`
    throw normalizeTosError(error)
  }
}

export async function deleteFromTos(urlOrKey) {
  if (!isBrowser || !urlOrKey) return false

  try {
    if (useStorageApi()) {
      await requestStorageApi(`/api/storage/file?urlOrKey=${encodeURIComponent(urlOrKey)}`, {
        method: 'DELETE',
      })
      return true
    }

    const key = getTosKeyFromUrl(urlOrKey)
    const client = getTosClient()

    await client.deleteObject({
      bucket: BUCKET,
      key,
    })

    return true
  } catch (error) {
    throw normalizeTosError(error)
  }
}
