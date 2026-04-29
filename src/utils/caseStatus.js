// ============================================================
// Unified case status utilities
// ============================================================

export function isAccepted(c = {}) {
  return c.acceptanceStatus === 'accepted' || c.acceptanceStatus === '已受理'
}

export function isNotAccepted(c = {}) {
  return c.acceptanceStatus === 'not_accepted'
    || c.acceptanceStatus === 'reported'
    || c.acceptanceStatus === 'rejected_acceptance'
    || c.acceptanceStatus === '不予受理'
}

export function isUnaccepted(c = {}) {
  return !isAccepted(c) && !isNotAccepted(c)
}

export function isFiled(c = {}) {
  return c.filingStatus === 'filed'
    || c.filingStatus === '已立案'
    || c.reportResultStatus === 'filed'
    || c.reportResultStatus === '已立案'
}

export function isRejectedFiling(c = {}) {
  return c.reportResultStatus === 'rejected'
    || c.reportResultStatus === 'not_filed'
    || c.reportResultStatus === '不予立案'
}

export function isNotPunished(c = {}) {
  return c.reportResultStatus === 'not_punished'
    || c.reportResultStatus === 'exempted'
    || c.reportResultStatus === '违法事实不成立'
    || c.reportResultStatus === '不予处罚'
}

export function isPenalty(c = {}) {
  return c.reportResultStatus === 'penalty'
    || c.reportResultStatus === 'punished'
    || c.reportResultStatus === 'closed'
    || c.reportResultStatus === '已处罚'
}

export function isOrderedCorrection(c = {}) {
  return c.reportResultStatus === 'ordered_correction'
    || c.reportResultStatus === 'corrected'
    || c.reportResultStatus === '责令改正'
}

export function isMediated(c = {}) {
  return c.mediationStatus === 'decided'
    || c.mediationStatus === 'mediation_success'
    || c.mediationStatus === 'success'
    || c.mediationStatus === '已调解'
}

export function isMediationTerminated(c = {}) {
  return c.mediationStatus === 'mediation_terminated'
    || c.mediationStatus === '终止调解'
}

export function isAbnormal(c = {}) {
  const tags = Array.isArray(c.tags) ? c.tags : []
  return c.caseStatus === 'abnormal'
    || c.abnormalStatus === true
    || c.isAbnormal === true
    || c.status === '列入异常'
    || tags.includes('abnormal')
    || tags.includes('异常')
    || tags.includes('列入异常')
}

export function hasSignDate(c = {}) {
  return Boolean(getSignDate(c))
}

export function getSignDate(c = {}) {
  return c.signDate || c.signedDate || c.mailSignedDate || c.deliverySignedDate || ''
}

export function hasReportReceivedDate(c = {}) {
  return Boolean(getReportReceivedDate(c))
}

export function getReportReceivedDate(c = {}) {
  return c.reportReceivedDate || getSignDate(c) || c.replyDate || ''
}

export function hasReportResultDate(c = {}) {
  return Boolean(getReportResultDate(c))
}

export function getReportResultDate(c = {}) {
  return c.reportResultDate || c.resultDate || c.replyResultDate || c.punishmentResultDate || ''
}

export function hasReportResult(c = {}) {
  return isRejectedFiling(c) || isNotPunished(c) || isPenalty(c) || isOrderedCorrection(c)
}

export function isPresumedFiled(c = {}) {
  if (!hasReportReceivedDate(c)) return false
  if (hasReportResult(c) || isMediated(c) || isMediationTerminated(c) || isAbnormal(c) || isFiled(c) || isNotAccepted(c)) return false
  const start = new Date(getReportReceivedDate(c))
  if (Number.isNaN(start.getTime())) return false
  const diffDays = (Date.now() - start.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays >= 30
}

export function getCurrentProgress(c = {}) {
  if (isAbnormal(c)) return '列入异常'
  if (isMediated(c)) return '已调解'
  if (isPenalty(c)) return '已处罚'
  if (isOrderedCorrection(c)) return '责令改正'
  if (isNotPunished(c)) return '不予处罚'
  if (isRejectedFiling(c)) return '不予立案'
  if (isNotAccepted(c)) return '不予受理'
  if (isFiled(c)) return '已立案'
  if (isPresumedFiled(c)) return '推定立案期'
  if (isAccepted(c)) return '已受理'
  if (isMediationTerminated(c)) return '终止调解'
  return '未受理'
}

export function getStatusBadgeClass(c = {}) {
  if (isAbnormal(c)) return 'badge-abnormal'
  if (isMediated(c)) return 'badge-mediated'
  if (isPenalty(c)) return 'badge-punished'
  if (isOrderedCorrection(c)) return 'badge-corrected'
  if (isNotPunished(c)) return 'badge-not-punished'
  if (isRejectedFiling(c)) return 'badge-not-filed'
  if (isNotAccepted(c)) return 'badge-not-accepted'
  if (isFiled(c)) return 'badge-filed'
  if (isPresumedFiled(c)) return 'badge-presumed'
  if (isAccepted(c)) return 'badge-accepted'
  if (isMediationTerminated(c)) return 'badge-mediated'
  return 'badge-unaccepted'
}

export function getJurisdiction(c = {}) {
  return c.marketRegulatorName || c.jurisdictionName || c.jurisdiction || c.bureauName || c.agencyName || c.recipientAgency || '未填写'
}

export function getShopName(c = {}) {
  return c.shopName || c.storeName || c.merchantName || '未填写'
}

export function getProductName(c = {}) {
  return c.productName || c.productTitle || c.itemName || c.goodsName || '未填写'
}

export function getLicenseName(c = {}) {
  return c.licenseName || c.businessLicenseName || c.operatorName || c.companyName || c.reportedPartyName || c.respondentName || '未填写'
}

export function getResultDate(c = {}) {
  return c.reportResultDate || c.resultDate || c.replyResultDate || c.punishmentResultDate || ''
}

export function getDisplayAmount(c = {}) {
  const value = Number(
    c.compensationAmount
    || c.refundAmount
    || c.paymentAmount
    || c.settlementAmount
    || c.amount
    || c.purchaseAmount
    || c.payAmount
    || c.costAmount
    || c.expense
    || c.productPrice
    || 0
  )
  return Number.isFinite(value) ? value : 0
}

export function getCompensationAmount(c = {}) {
  const value = Number(
    c.compensationAmount
    || c.refundAmount
    || c.paymentAmount
    || c.settlementAmount
    || c.profit
    || 0
  )
  return Number.isFinite(value) ? value : 0
}

export function formatMoney(v) {
  const value = Number(v || 0)
  return `¥${Number.isFinite(value) ? value.toFixed(2) : '0.00'}`
}
