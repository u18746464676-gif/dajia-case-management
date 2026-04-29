export function getMailStatus(row = {}) {
  if (row.isAbnormal || row.abnormalStatus) return '异常件'
  if (row.signDate || row.signedDate || row.deliverySignedDate) return '已签收'
  if (row.trackingNumber || row.mailTrackingNo || row.expressNo) return '运输中'
  return '待识别'
}

export function getMailStatusClass(status) {
  return {
    '已签收': 'status-signed',
    '运输中': 'status-transit',
    '异常件': 'status-abnormal',
    '待识别': 'status-pending',
  }[status] || 'status-pending'
}

export function normalizeCourierCompany(row = {}) {
  return row.courierCompany || row.expressCompany || '中国邮政'
}

export function getMailLicenseName(row = {}) {
  return row.licenseName || row.businessLicenseName || row.operatorName || row.companyName || row.reportedPartyName || row.respondentName || row.merchantName || '未填写'
}

export function getMailRecipientAgency(row = {}) {
  return row.recipientAgency || row.receiverAgency || row.targetAgency || row.mailRecipient || row.authorityName || row.marketRegulatorName || row.jurisdictionName || row.jurisdiction || '未识别'
}

export function getMailTrackingNumber(row = {}) {
  return row.trackingNumber || row.mailTrackingNo || row.expressNo || '未识别'
}

export function getMailSentDate(row = {}) {
  return row.sentDate || row.mailSentDate || row.shippingDate || row.submitDate || ''
}

export function getMailSignDate(row = {}) {
  return row.signDate || row.signedDate || row.deliverySignedDate || ''
}

export function extractLicenseNameFromText(text) {
  if (!text || typeof text !== 'string') return ''
  const candidates = []
  const namePattern = /(?:名称|商户名称|公司名称|经营者|被投诉人|被举报人|营业执照名称)[：:]\s*([^\n\r]{2,50})/g
  let match
  while ((match = namePattern.exec(text)) !== null) {
    const name = match[1].trim()
    if (name.length >= 2 && name.length <= 50) candidates.push({ name, score: 10 })
  }
  const companyPattern = /([^\n\r]{2,40}(?:有限公司|有限责任公司|股份有限公司|合伙企业|个人独资企业|个体工商户))/g
  while ((match = companyPattern.exec(text)) !== null) {
    const name = match[1].trim()
    if (name.length >= 4 && name.length <= 50) candidates.push({ name, score: 8 })
  }
  if (candidates.length === 0) return ''
  candidates.sort((a, b) => b.score - a.score || b.name.length - a.name.length)
  return candidates[0].name
}

export function extractRecipientAgencyFromEnvelopeText(text) {
  if (!text || typeof text !== 'string') return ''
  const keywords = ['市场监督管理局', '市监局', '食品药品监督管理局', '质量技术监督局', '工商行政管理局', '综合执法局', '分局', '管理局', '监督管理局']
  const candidates = []
  for (const keyword of keywords) {
    const idx = text.indexOf(keyword)
    if (idx === -1) continue
    let start = idx
    for (let i = idx - 1; i >= Math.max(0, idx - 20); i--) {
      if (text[i] === '\n' || text[i] === '\r') break
      start = i
    }
    let end = idx + keyword.length
    for (let i = end; i < Math.min(text.length, end + 10); i++) {
      if (text[i] === '\n' || text[i] === '\r') break
      end = i + 1
    }
    const segment = text.substring(start, end).trim()
    if (segment.length >= 4) candidates.push(segment)
  }
  candidates.sort((a, b) => b.length - a.length)
  return candidates[0] || ''
}

export function extractTrackingNumberFromEnvelopeText(text) {
  if (!text || typeof text !== 'string') return ''
  const cleaned = text.replace(/\s+/g, ' ')
  const patterns = [/\b(XA[A-Z0-9]{8,18}CN)\b/g, /\b(XA[A-Z0-9]{8,20})\b/g, /\b([A-Z]{2}\d{9}[A-Z]{2})\b/g]
  for (const pattern of patterns) {
    const match = pattern.exec(cleaned)
    if (match?.[1]) return match[1]
  }
  return ''
}

export function extractOrderNumberFromText(text) {
  if (!text || typeof text !== 'string') return ''
  const patterns = [/(?:订单编号|订单号|Order\s*No)[：:]*\s*([A-Z0-9]{8,30})/gi, /\b(\d{15,22})\b/g]
  for (const pattern of patterns) {
    const match = pattern.exec(text)
    if (match?.[1]) return match[1].trim()
  }
  return ''
}

export function scoreMaterialToCase(material = {}, caseItem = {}) {
  let score = 0
  const reasons = []
  const exact = (a, b) => Boolean(a && b) && a.trim().toLowerCase() === b.trim().toLowerCase()
  const similar = (a, b) => Boolean(a && b) && (a.trim().toLowerCase().includes(b.trim().toLowerCase()) || b.trim().toLowerCase().includes(a.trim().toLowerCase()))
  const agencyMatch = (a, b) => Boolean(a && b) && (a.toLowerCase().includes(b.toLowerCase()) || b.toLowerCase().includes(a.toLowerCase()))

  const caseLicenseName = getMailLicenseName(caseItem)
  const caseAgency = getMailRecipientAgency(caseItem)
  const caseTrackingNo = getMailTrackingNumber(caseItem)
  const caseOrderNo = caseItem.orderNo || caseItem.orderNumber || ''

  const matLicenseName = material.licenseName || material.ocrLicenseName || ''
  const matAgency = material.recipientAgency || material.ocrAgency || ''
  const matTrackingNo = material.trackingNumber || material.ocrTrackingNo || ''
  const matOrderNo = material.orderNo || material.ocrOrderNo || ''

  if (exact(matTrackingNo, caseTrackingNo)) {
    score += 100
    reasons.push('快递单号完全一致')
  }
  if (exact(matOrderNo, caseOrderNo)) {
    score += 90
    reasons.push('订单编号完全一致')
  }
  if (exact(matLicenseName, caseLicenseName)) {
    score += 90
    reasons.push('执照名称完全一致')
  }
  if (agencyMatch(matAgency, caseAgency)) {
    score += 40
    reasons.push('收件机关一致')
  }
  if (!exact(matLicenseName, caseLicenseName) && similar(matLicenseName, caseLicenseName)) {
    score += 50
    reasons.push('执照名称相似')
  }

  return { score, reasons }
}

export function getMatchConfidence(scoreResult = {}) {
  const reasons = scoreResult.reasons || []
  const score = Number(scoreResult.score || 0)
  if (reasons.includes('快递单号完全一致') || reasons.includes('执照名称完全一致') || reasons.includes('订单编号完全一致') || (reasons.includes('执照名称完全一致') && reasons.includes('收件机关一致'))) return 'high'
  if (reasons.includes('执照名称相似')) return 'medium'
  if (reasons.length === 1 && reasons[0] === '收件机关一致') return 'low'
  if (score <= 40) return 'low'
  return 'medium'
}

export function findBestMatchingCase(material = {}, cases = []) {
  if (!Array.isArray(cases) || cases.length === 0) return null
  let bestMatch = null
  let bestScore = 0
  for (const caseItem of cases) {
    const result = scoreMaterialToCase(material, caseItem)
    const confidence = getMatchConfidence(result)
    if (confidence === 'low' && result.reasons.length === 1 && result.reasons[0] === '收件机关一致') continue
    if (result.score > bestScore) {
      bestScore = result.score
      bestMatch = { case: caseItem, score: result.score, reasons: result.reasons, confidence }
    }
  }
  return bestMatch
}

export function normalizeOcrResult(ocrText, imageUrl) {
  return {
    envelopeImageUrl: imageUrl || '',
    ocrTextSummary: ocrText || '',
    ocrLicenseName: extractLicenseNameFromText(ocrText),
    ocrAgency: extractRecipientAgencyFromEnvelopeText(ocrText),
    ocrTrackingNo: extractTrackingNumberFromEnvelopeText(ocrText),
    ocrOrderNo: extractOrderNumberFromText(ocrText),
  }
}
