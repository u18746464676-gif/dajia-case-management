// 豆包大模型服务
const BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3'

// 你的凭证
const API_KEY = '0bf9d45d-7269-4236-814f-e07590d1d4cf'
const ACCESS_KEY = 'AKLTOGFhY2RhYjM0MzliNDNkOGJmY2NiNTA3OTI5YmFmOWY'
const SECRET_KEY = 'WlRVeE56QXlNbUZpTmpRME5ERTJZamc0TmpCa09HSXdNVFpoTmpreE5Uaw=='
const REGION = 'cn-beijing'
const PROJECT_ID = 'seed-general' // 可以不改,API Key已经验证

// 生成签名(简化版,实际生产应使用完整的签名算法)
async function generateAuthHeader(method, path, body = '') {
  const timestamp = Math.floor(Date.now() / 1000)
  const stringToSign = `${method}|${path}|${timestamp}|${body}`
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(SECRET_KEY),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign(
    'SHA-256',
    key,
    encoder.encode(stringToSign)
  )
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))

  return `AVM2 ${ACCESS_KEY}:${signatureBase64}:${timestamp}`
}

// 调用豆包文本模型
export async function callDoubaoPro(text, systemPrompt = '你是一个专业的法律案件助手。') {
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'X-Project-Id': PROJECT_ID,
      },
      body: JSON.stringify({
        model: 'doubao-seed-2-0-pro-260215',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('豆包 API 错误:', error)
      return null
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  } catch (err) {
    console.error('调用豆包失败:', err)
    return null
  }
}

// 图像理解(使用doubao-pro视觉版本)
export async function analyzeImage(imageBase64, prompt = '描述这张图片的内容') {
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'X-Project-Id': PROJECT_ID,
      },
      body: JSON.stringify({
        model: 'doubao-seed-2-0-pro-260215', // 需要视觉版本
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
            ]
          }
        ],
        max_tokens: 2000,
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('图像分析 API 错误:', error)
      return null
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  } catch (err) {
    console.error('图像分析失败:', err)
    return null
  }
}

// 生成图像(使用 doubao-seed-2.0-lite)
export async function generateImage(prompt) {
  try {
    const response = await fetch(`${BASE_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'X-Project-Id': PROJECT_ID,
      },
      body: JSON.stringify({
        model: 'doubao-seed-2.0-lite',
        prompt: prompt,
        size: '1024x1024',
        num: 1,
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('图像生成 API 错误:', error)
      return null
    }

    const data = await response.json()
    return data.data?.[0]?.url || data.data?.[0]?.b64_json || ''
  } catch (err) {
    console.error('图像生成失败:', err)
    return null
  }
}

// 智能搜索案件
export async function smartSearchCases(cases, query) {
  const caseList = cases.map(c =>
    `【案件${c.id}】店铺:${c.shopName} 商品:${c.productName} 状态:${c.status} 金额:¥${c.productPrice} 执照:${c.licenseName}`
  ).join('\n')

  const prompt = `你是案件管理助手。根据以下案件列表,回答用户的问题。

案件列表:
${caseList}

用户问题:${query}

请根据案件列表回答。如果问题涉及具体案件,请列出相关案件的完整信息。如果找不到答案,说明"未找到相关案件"。`

  return await callDoubaoPro(prompt, '你是一个专业的法律案件管理助手,擅长分析和总结案件信息。')
}

// 提取OCR文字并理解
export async function extractFromImage(imageBase64) {
  const prompt = `你是一个专业的OCR和文档理解助手。请仔细分析这张图片，提取其中的关键信息，并且只返回 JSON。

请重点识别：
1. 执照名称/公司主体名称
2. 店铺名称
3. 快递单号或运单号（通常是一串数字或字母组合）
4. 文档类型：信封、受理通知书、举报不予立案告知书、答复函、其他文书、普通图片
5. 文书标题（如果图片里有明确标题，原样返回）
6. 日期（如签收日期、收件日期等）
7. 金额
8. 其他有价值的信息

返回格式：
{
  "licenseName": "识别到的执照/主体名称",
  "shopName": "识别到的店铺名称",
  "trackingNumbers": ["单号1", "单号2"],
  "documentType": "信封/受理通知书/举报不予立案告知书/答复函/其他文书/普通图片",
  "documentTitle": "文书标题",
  "isEnvelope": true,
  "dates": ["日期1", "日期2"],
  "amounts": ["金额1", "金额2"],
  "other": "其他重要信息"
}

特别说明——信封图片的单号识别规则：
- 快递信封通常印有两个单号区域：寄件方单号（通常在左上/右上）和收件方单号（通常在中间显眼位置）。
- 收件方单号是重点，应放在 trackingNumbers 的第一位。
- 如果只有一个单号，也要填入数组第一位。
- 只返回 JSON，不要解释，不要 markdown 代码块。
- 无法识别的字段返回 null。`

  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'X-Project-Id': PROJECT_ID,
      },
      body: JSON.stringify({
        model: 'doubao-seed-2-0-pro-260215',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
            ]
          }
        ],
        max_tokens: 2000,
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OCR提取 API 错误:', error)
      return null
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    try {
      const cleaned = String(content)
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim()
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch {
      return { raw: content }
    }

    return { raw: content }
  } catch (err) {
    console.error('OCR提取失败:', err)
    return null
  }
}

// 生成案件文书草稿
export async function generateDocument(caseData, documentType) {
  const templates = {
    '投诉信': `请为以下案件生成一份投诉信:

案件信息:
- 店铺名称:${caseData.shopName}
- 商品名称:${caseData.productName}
- 购买金额:¥${caseData.productPrice}
- 执照名称:${caseData.licenseName}
- 管辖局:${caseData.jurisdiction || '市场监督管理局'}

要求:
1. 语言正式规范
2. 事实陈述清晰
3. 诉求明确合理
4. 包含必要的法律依据`,

    '答复函': `请为以下案件生成一份行政答复函草稿:

案件信息:
- 店铺名称:${caseData.shopName}
- 商品名称:${caseData.productName}
- 举报日期:${caseData.reportDate || '待填写'}
- 当前状态:${caseData.status}

要求:
1. 语言严谨专业
2. 结构完整(收件人、正文、落款)
3. 说明处理依据和结果`,

    '案件摘要': `请为以下案件生成一份摘要报告:

案件信息:
- 店铺名称:${caseData.shopName}
- 商品名称:${caseData.productName}
- 购买金额:¥${caseData.productPrice}
- 执照名称:${caseData.licenseName}
- 当前状态:${caseData.status}
- 创建时间:${caseData.createdAt}
- 备注:${caseData.notes || '无'}

要求:
1. 简明扼要
2. 突出重点
3. 便于归档`
  }

  const prompt = templates[documentType] || templates['案件摘要']
  return await callDoubaoPro(prompt, '你是一个专业的法律文书撰写助手,擅长生成规范的法律文书。')
}
