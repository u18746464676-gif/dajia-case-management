/**
 * 统一案件状态 helper
 * 只读，不改 store
 * 所有页面统一使用这里的函数，避免各页面各自写一套状态判断
 */

const STATUS_LABELS = {
  pending_report: '待整理',
  accepted: '已受理',
  reported: '不予受理',
  decided: '已调解',
  closed: '已办结',
  rejected: '不予立案',
  not_punished: '违法事实不成立',
  exempted: '不予处罚',
  mediation_terminated: '终止调解',
  filed: '已立案',
}

const UNFAVORABLE_RESULTS = ['rejected', 'not_punished', 'mediation_terminated', 'exempted']

const MEDIATION_TERMINATED_RESULTS = ['mediation_terminated']

/**
 * 获取案件有效状态（与 store.getEffectiveStatus 口径一致）
 * 优先级：已调解 > 举报结果 > 老流程已立案 > 受理状态 > 终止调解 > 待整理
 */
export function getEffectiveStatus(c) {
  if (!c) return 'pending_report'
  if (c.mediationStatus === 'decided') return 'decided'
  if (c.reportResultStatus) return c.reportResultStatus
  if (c.procedureVersion === 'old' && c.filingStatus === 'filed' && !c.reportResultStatus) return 'filed'
  if (c.acceptanceStatus) return c.acceptanceStatus
  if (c.mediationStatus === 'mediation_terminated') return 'mediation_terminated'
  return 'pending_report'
}

/**
 * 获取有效状态的人类可读标签
 */
export function getEffectiveStatusLabel(c) {
  const s = getEffectiveStatus(c)
  return STATUS_LABELS[s] || s || '待整理'
}

/**
 * 判断是否为不利结果（可用于复议判断）
 */
export function isUnfavorableResult(c) {
  const s = getEffectiveStatus(c)
  return UNFAVORABLE_RESULTS.includes(s)
}

/**
 * 获取期限提醒文本
 */
export function getDeadlineText(c) {
  if (!c) return ''
  const eff = getEffectiveStatus(c)

  // 已调解 / 已赔付
  if (eff === 'decided') return '可归档'

  // 不利结果：计算复议剩余天数
  if (isUnfavorableResult(c) && c.reportResultDate) {
    const daysLeft = 60 - Math.floor((Date.now() - new Date(c.reportResultDate)) / (1000 * 60 * 60 * 24))
    if (daysLeft <= 0) return `复议已超期${Math.abs(daysLeft)}天`
    if (daysLeft <= 7) return `复议临期 ${daysLeft}天`
    return `复议剩余 ${daysLeft}天`
  }

  // 已立案
  if (eff === 'filed') return '等待处理结果'

  // 已受理
  if (eff === 'accepted') return '等待处理结果'

  // 已签收未答复
  if (c.signDate && !c.reportResultStatus) {
    const days = Math.floor((Date.now() - new Date(c.signDate)) / (1000 * 60 * 60 * 24))
    if (days > 0) return `已签收 ${days}天未答复`
    return '已签收未答复'
  }

  // 待整理
  if (eff === 'pending_report') return '补充材料'

  // 有举报结果日期但不是不利结果
  if (c.reportResultDate && !isUnfavorableResult(c)) {
    return '已登记答复结果'
  }

  return ''
}

/**
 * 获取"我方下一步"建议文本
 */
export function getNextAction(c) {
  if (!c) return '补充材料'
  const eff = getEffectiveStatus(c)

  // 已调解
  if (eff === 'decided') {
    if (c.profit > 0) return '确认履行 / 归档'
    return '归档'
  }

  // 已赔付/已回款
  if (eff === 'closed' || (eff !== 'decided' && c.profit > 0)) return '归档'

  // 不利结果
  if (isUnfavorableResult(c)) return '准备复议'

  // 终止调解
  if (eff === 'mediation_terminated') return '评估复议 / 建立救济记录'

  // 已受理
  if (eff === 'accepted') return '等待处理结果'

  // 已立案
  if (eff === 'filed') return '跟进立案处理进度'

  // 已签收未答复
  if (c.signDate && !c.reportResultStatus) return '催告跟进 / 申请信息公开'

  // 待整理 / 待举报
  if (eff === 'pending_report') return '补充材料'

  // 处罚/责令改正
  if (eff === 'closed') return '跟进整改 / 归档'

  return '待跟进'
}

/**
 * 获取案件状态对应的 badge class
 */
export function getStatusBadgeClass(c) {
  const eff = getEffectiveStatus(c)
  if (eff === 'decided') return 'badge-green'
  if (eff === 'closed') return 'badge-green'
  if (['rejected', 'not_punished', 'mediation_terminated', 'exempted'].includes(eff)) return 'badge-orange'
  if (eff === 'filed') return 'badge-blue'
  if (eff === 'accepted') return 'badge-blue'
  if (eff === 'pending_report') return 'badge-orange'
  return 'badge-blue'
}

/**
 * 格式化日期（兼容 dayjs 和原生 Date）
 */
export function formatCaseDate(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return String(iso)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
