import { TosClient } from '@volcengine/tos-sdk'

const isBrowser = typeof window !== 'undefined'

const BUCKET = import.meta.env.VITE_TOS_BUCKET || ''
const REGION = import.meta.env.VITE_TOS_REGION || ''
const ENDPOINT = import.meta.env.VITE_TOS_ENDPOINT || ''
const ACCESS_KEY_ID = import.meta.env.VITE_TOS_ACCESS_KEY_ID || ''
const SECRET_ACCESS_KEY = import.meta.env.VITE_TOS_SECRET_ACCESS_KEY || ''

let tosClient = null

export function isTosConfigured() {
  return !!(BUCKET && REGION && ENDPOINT && ACCESS_KEY_ID && SECRET_ACCESS_KEY)
}

export function getTosFileUrl(key = '') {
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
  const client = getTosClient()
  const result = await client.listObjects({
    bucket: BUCKET,
    prefix,
  })
  return result?.data?.contents || []
}

export async function uploadBase64ToTos(base64Data, fileName = 'image.jpg') {
  if (!isBrowser) return null

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

  return getTosFileUrl(key)
}

export async function deleteFromTos(urlOrKey) {
  if (!isBrowser || !urlOrKey) return false

  const key = getTosKeyFromUrl(urlOrKey)
  const client = getTosClient()

  await client.deleteObject({
    bucket: BUCKET,
    key,
  })

  return true
}
