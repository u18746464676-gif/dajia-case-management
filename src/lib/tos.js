import { TOS } from '@volcengine/tos-sdk'

const isBrowser = typeof window !== 'undefined'

// 从环境变量获取配置
const BUCKET = import.meta.env.VITE_TOS_BUCKET || ''
const REGION = import.meta.env.VITE_TOS_REGION || ''
const ENDPOINT = import.meta.env.VITE_TOS_ENDPOINT || ''
const ACCESS_KEY_ID = import.meta.env.VITE_TOS_ACCESS_KEY_ID || ''
const SECRET_ACCESS_KEY = import.meta.env.VITE_TOS_SECRET_ACCESS_KEY || ''

let tosClient = null

function getTosClient() {
  if (!tosClient && isBrowser) {
    tosClient = new TOS({
      accessKeyId: ACCESS_KEY_ID,
      accessKeySecret: SECRET_ACCESS_KEY,
      region: REGION,
      endpoint: ENDPOINT,
    })
  }
  return tosClient
}

// 上传文件到火山引擎
export async function uploadToTos(fileData, fileName) {
  if (!isBrowser) return null

  try {
    const client = getTosClient()
    const timestamp = Date.now()
    const key = `case-files/${timestamp}_${fileName}`

    const result = await client.putObject({
      Bucket: BUCKET,
      Key: key,
      Body: fileData,
      ContentType: fileData.type || 'application/octet-stream',
    })

    // 返回公开访问的URL
    return `https://${BUCKET}.${ENDPOINT}/${key}`
  } catch (err) {
    console.error('TOS upload failed:', err)
    throw err
  }
}

// 上传Base64图片
export async function uploadBase64ToTos(base64Data, fileName) {
  if (!isBrowser) return null

  try {
    // 把base64转成Blob
    const base64Response = await fetch(base64Data)
    const blob = await base64Response.blob()

    const client = getTosClient()
    const timestamp = Date.now()
    const key = `case-images/${timestamp}_${fileName}`

    const result = await client.putObject({
      Bucket: BUCKET,
      Key: key,
      Body: blob,
      ContentType: blob.type || 'image/jpeg',
    })

    // 返回公开访问的URL
    return `https://${BUCKET}.${ENDPOINT}/${key}`
  } catch (err) {
    console.error('TOS upload failed:', err)
    throw err
  }
}

// 检查TOS是否已配置
export function isTosConfigured() {
  return !!(BUCKET && REGION && ENDPOINT && ACCESS_KEY_ID && SECRET_ACCESS_KEY)
}