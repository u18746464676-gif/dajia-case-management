import { TosClient } from '@volcengine/tos-sdk'

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
    console.log('TOS init params:', {
      AK: ACCESS_KEY_ID ? ACCESS_KEY_ID.slice(0, 10) + '...' : 'MISSING',
      region: REGION || 'MISSING',
      endpoint: ENDPOINT || 'MISSING',
      bucket: BUCKET || 'MISSING'
    })

    if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !BUCKET || !REGION || !ENDPOINT) {
      throw new Error('TOS配置不完整，请检查环境变量')
    }

    try {
      tosClient = new TosClient({
        accessKeyId: ACCESS_KEY_ID,
        accessKeySecret: SECRET_ACCESS_KEY,
        region: REGION,
        endpoint: ENDPOINT,
        autoRecognizeContentType: false,
      })
      console.log('TOS client created successfully')
    } catch (err) {
      console.error('Failed to create TOS client:', err)
      throw err
    }
  }
  return tosClient
}

// 上传Base64图片
export async function uploadBase64ToTos(base64Data, fileName = 'image.jpg') {
  if (!isBrowser) return null

  try {
    console.log('Starting upload, fileName:', fileName)

    // 把base64转成Blob
    const base64Response = await fetch(base64Data)
    const blob = await base64Response.blob()
    console.log('Blob created, size:', blob.size, 'type:', blob.type)

    const client = getTosClient()
    if (!client) {
      throw new Error('TOS client not initialized')
    }

    // 生成唯一的key
    const timestamp = Date.now()
    const key = `case-images/${timestamp}_${fileName}`
    console.log('Uploading to key:', key)

    const result = await client.putObject({
      bucket: BUCKET,
      key: key,
      body: blob,
      contentType: 'image/png',
    })

    console.log('Upload result:', result)

    // 返回公开访问的URL
    return `https://${BUCKET}.${ENDPOINT}/${key}`
  } catch (err) {
    console.error('TOS upload failed:', err)
    throw err
  }
}

// 从TOS删除文件
export async function deleteFromTos(url) {
  if (!isBrowser || !url) return false

  try {
    // 从URL中提取key
    let key = ''
    try {
      const urlObj = new URL(url)
      key = urlObj.pathname.slice(1) // 去掉开头的/
    } catch {
      // 如果URL解析失败，尝试直接使用url作为key
      key = url
    }

    // URL解码key（因为pathname可能被编码了）
    key = decodeURIComponent(key)

    console.log('Deleting from TOS, key:', key)

    const client = getTosClient()
    if (!client) {
      throw new Error('TOS client not initialized')
    }

    const result = await client.deleteObject({
      bucket: BUCKET,
      key: key,
    })

    console.log('Delete successful', result)
    return true
  } catch (err) {
    console.error('TOS delete failed:', err)
    throw err
  }
}

// 检查TOS是否已配置
export function isTosConfigured() {
  return !!(BUCKET && REGION && ENDPOINT && ACCESS_KEY_ID && SECRET_ACCESS_KEY)
}