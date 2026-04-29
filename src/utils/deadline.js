import {
  isAccepted, isNotAccepted, isFiled, isRejectedFiling, isNotPunished,
  isPenalty, isMediated, isAbnormal, isOrderedCorrection,
  isPresumedFiled, hasSignDate, hasReportReceivedDate, hasReportResultDate,
  getSignDate, getReportReceivedDate, getReportResultDate,
} from './caseStatus'

const HOLIDAYS = []

function isWeekend(date) {
  const day = date.getDay()
  return day === 0 || day === 6
}

function isHoliday(date) {
  return HOLIDAYS.includes(formatDate(date))
}

export function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function addWorkdays(date, workdays) {
  const d = new Date(date)
  let remaining = workdays
  while (remaining > 0) {
    d.setDate(d.getDate() + 1)
    if (!isWeekend(d) && !isHoliday(d)) remaining--
  }
  return d
}

export function diffDays(targetDate, baseDate = new Date()) {
  const t = new Date(targetDate)
  const b = new Date(baseDate)
  t.setHours(0, 0, 0, 0)
  b.setHours(0, 0, 0, 0)
  return Math.ceil((t - b) / (1000 * 60 * 60 * 24))
}

export function diffWorkdays(targetDate, baseDate = new Date()) {
  const t = new Date(targetDate)
  const b = new Date(baseDate)
  t.setHours(0, 0, 0, 0)
  b.setHours(0, 0, 0, 0)
  let count = 0
  const current = new Date(b)
  current.setDate(current.getDate() + 1)
  while (current <= t) {
    if (!isWeekend(current) && !isHoliday(current)) count++
    current.setDate(current.getDate() + 1)
  }
  return count
}

export function formatDate(date) {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export function todayStr() {
  return formatDate(new Date())
}

export function getDeadlineLevel(level) {
  return {
    done: 'deadline-done',
    normal: 'deadline-normal',
    warning: 'deadline-warning',
    danger: 'deadline-danger',
    overdue: 'deadline-overdue',
    muted: 'deadline-muted',
  }[level] || 'deadline-muted'
}

function buildRemainingText(label, remainingDays, unit = '天') {
  if (remainingDays > 7) return { text: `${label}剩余 ${remainingDays}${unit}`, level: 'normal' }
  if (remainingDays > 3) return { text: `${label}剩余 ${remainingDays}${unit}`, level: 'warning' }
  if (remainingDays > 0) return { text: `${label}剩余 ${remainingDays}${unit}`, level: 'danger' }
  if (remainingDays === 0) return { text: `${label}今日到期`, level: 'danger' }
  return { text: `${label}已超期 ${Math.abs(remainingDays)}${unit}`, level: 'overdue' }
}

function buildRemainingWorkdayText(label, remainingWorkdays) {
  if (remainingWorkdays > 5) return { text: `${label}剩余 ${remainingWorkdays}个工作日`, level: 'normal' }
  if (remainingWorkdays > 2) return { text: `${label}剩余 ${remainingWorkdays}个工作日`, level: 'warning' }
  if (remainingWorkdays > 0) return { text: `${label}剩余 ${remainingWorkdays}个工作日`, level: 'danger' }
  if (remainingWorkdays === 0) return { text: `${label}今日到期`, level: 'danger' }
  return { text: `${label}已超期 ${Math.abs(remainingWorkdays)}个工作日`, level: 'overdue' }
}

function buildComplaintAcceptReminder(c) {
  const signDate = getSignDate(c)
  if (!signDate) return { text: '未签收，暂不计算期限', level: 'muted', type: 'no-sign' }
  const dueDate = addWorkdays(new Date(signDate), 7)
  return { ...buildRemainingWorkdayText('受理', diffWorkdays(dueDate)), type: 'accept-countdown' }
}

function buildAcceptedStageReminder(c) {
  const acceptedDate = c.acceptanceDate || getSignDate(c)
  if (!acceptedDate) return { text: '缺少受理日期', level: 'muted', type: 'no-accept-date' }
  const mediationDue = addDays(new Date(acceptedDate), 60)
  const mediationRemaining = diffDays(mediationDue)
  const receivedDate = getReportReceivedDate(c) || acceptedDate
  const reportCheckDue = addWorkdays(new Date(receivedDate), 30)
  const reportCheckRemaining = diffWorkdays(reportCheckDue)
  const parts = [
    mediationRemaining >= 0 ? `投诉调解剩余 ${mediationRemaining}天` : `投诉调解已超期 ${Math.abs(mediationRemaining)}天`,
    reportCheckRemaining >= 0 ? `举报核查剩余 ${reportCheckRemaining}个工作日` : `举报核查已超期 ${Math.abs(reportCheckRemaining)}个工作日`,
  ]
  const level = mediationRemaining <= 3 || reportCheckRemaining <= 2 ? 'danger' : mediationRemaining <= 7 || reportCheckRemaining <= 5 ? 'warning' : 'normal'
  return { text: parts.join('，'), level, type: 'accepted-stage' }
}

function buildReportCheckReminder(c) {
  const receivedDate = getReportReceivedDate(c)
  if (!receivedDate) return { text: '缺少线索收到日期', level: 'muted', type: 'no-received-date' }
  const dueDate = addWorkdays(new Date(receivedDate), 30)
  return { ...buildRemainingWorkdayText('举报核查', diffWorkdays(dueDate)), type: 'report-check' }
}

function buildPunishmentProcessReminder(c, mode = 'actual') {
  let startDate = null
  if (mode === 'presumed') {
    const receivedDate = getReportReceivedDate(c)
    if (!receivedDate) return { text: '缺少线索日期', level: 'muted', type: 'no-date' }
    startDate = addWorkdays(new Date(receivedDate), 30)
  } else {
    if (!c.filingDate) return { text: '缺少立案日期', level: 'muted', type: 'no-filing-date' }
    startDate = new Date(c.filingDate)
  }
  const dueDate = addDays(startDate, 120)
  return {
    ...buildRemainingText(mode === 'presumed' ? '推定办结' : '处罚办理', diffDays(dueDate)),
    type: mode === 'presumed' ? 'presumed-punishment' : 'punishment',
  }
}

function buildReconsiderationApplyReminder(c) {
  const resultDate = getReportResultDate(c)
  if (!resultDate) return { text: '缺少结果日期，无法计算复议期限', level: 'danger', type: 'no-result-date' }
  const dueDate = addDays(new Date(resultDate), 60)
  return { ...buildRemainingText('复议', diffDays(dueDate)), type: 'reconsideration' }
}

export function getDeadlineReminder(c) {
  if (!c) return { text: '', level: 'muted' }
  if (isMediated(c)) return { text: '已调解，案件结束', level: 'done', type: 'closed' }
  if (isPenalty(c)) return { text: '已处罚，可归档', level: 'done', type: 'punished' }
  if (isAbnormal(c)) return { text: '异常案件，需人工处理', level: 'danger', type: 'abnormal' }
  if (isNotAccepted(c) || isRejectedFiling(c) || isNotPunished(c) || isOrderedCorrection(c) || hasReportResultDate(c)) {
    return buildReconsiderationApplyReminder(c)
  }
  if (isFiled(c)) return buildPunishmentProcessReminder(c, 'actual')
  if (isPresumedFiled(c)) return buildPunishmentProcessReminder(c, 'presumed')
  if (isAccepted(c)) return buildAcceptedStageReminder(c)
  if (hasReportReceivedDate(c)) return buildReportCheckReminder(c)
  if (hasSignDate(c)) return buildComplaintAcceptReminder(c)
  return { text: '未签收，暂不计算期限', level: 'muted', type: 'no-sign' }
}

export const STATUS_OPTIONS = [
  { value: 'accepted', label: '已受理', fields: [{ key: 'acceptanceDate', label: '受理日期', type: 'date', default: 'today' }] },
  { value: 'not_accepted', label: '不予受理', fields: [{ key: 'reportResultDate', label: '不予受理日期', type: 'date', default: 'today' }] },
  { value: 'mediated', label: '已调解', fields: [{ key: 'mediationDate', label: '调解日期', type: 'date', default: 'today' }, { key: 'compensationAmount', label: '赔偿金额', type: 'number', placeholder: '0', min: 0 }] },
  { value: 'mediation_terminated', label: '终止调解', fields: [{ key: 'mediationEndDate', label: '终止调解日期', type: 'date', default: 'today' }, { key: 'mediationEndReason', label: '终止原因', type: 'text', placeholder: '输入终止原因' }] },
  { value: 'filed', label: '已立案', fields: [{ key: 'filingDate', label: '立案日期', type: 'date', default: 'today' }] },
  { value: 'not_filed', label: '不予立案', fields: [{ key: 'reportResultDate', label: '不予立案日期', type: 'date', default: 'today' }] },
  { value: 'ordered_correction', label: '责令改正', fields: [{ key: 'reportResultDate', label: '责令改正日期', type: 'date', default: 'today' }, { key: 'correctionContent', label: '责令改正内容', type: 'text', placeholder: '输入责令改正内容' }] },
  { value: 'penalty', label: '已处罚', fields: [{ key: 'reportResultDate', label: '处罚日期', type: 'date', default: 'today' }, { key: 'penaltyAmount', label: '处罚金额', type: 'number', placeholder: '0', min: 0 }, { key: 'penaltyContent', label: '处罚内容', type: 'text', placeholder: '输入处罚内容' }] },
  { value: 'not_punished', label: '不予处罚', fields: [{ key: 'reportResultDate', label: '不予处罚日期', type: 'date', default: 'today' }] },
  { value: 'abnormal', label: '列入异常', fields: [{ key: 'abnormalDate', label: '异常日期', type: 'date', default: 'today' }, { key: 'abnormalReason', label: '异常原因', type: 'text', placeholder: '输入异常原因' }] },
]

export function applyStatusChange(selectedStatus, fieldValues = {}) {
  const updates = {}
  const today = todayStr()

  switch (selectedStatus) {
    case 'accepted':
      updates.acceptanceStatus = 'accepted'
      updates.acceptanceDate = fieldValues.acceptanceDate || today
      break
    case 'not_accepted':
      updates.acceptanceStatus = 'not_accepted'
      updates.reportResultDate = fieldValues.reportResultDate || today
      break
    case 'mediated':
      updates.mediationStatus = 'decided'
      updates.mediationDate = fieldValues.mediationDate || today
      updates.compensationAmount = Number(fieldValues.compensationAmount) || 0
      if (updates.compensationAmount > 0) updates.paymentStatus = 'paid'
      break
    case 'mediation_terminated':
      updates.mediationStatus = 'mediation_terminated'
      updates.mediationDate = fieldValues.mediationEndDate || today
      updates.mediationEndDate = fieldValues.mediationEndDate || today
      updates.mediationEndReason = fieldValues.mediationEndReason || ''
      break
    case 'filed':
      updates.filingStatus = 'filed'
      updates.filingDate = fieldValues.filingDate || today
      break
    case 'not_filed':
      updates.reportResultStatus = 'rejected'
      updates.reportResultDate = fieldValues.reportResultDate || today
      break
    case 'ordered_correction':
      updates.reportResultStatus = 'ordered_correction'
      updates.reportResultDate = fieldValues.reportResultDate || today
      updates.correctionContent = fieldValues.correctionContent || ''
      break
    case 'penalty':
      updates.reportResultStatus = 'penalty'
      updates.reportResultDate = fieldValues.reportResultDate || today
      updates.penaltyAmount = Number(fieldValues.penaltyAmount) || 0
      updates.penaltyContent = fieldValues.penaltyContent || ''
      break
    case 'not_punished':
      updates.reportResultStatus = 'not_punished'
      updates.reportResultDate = fieldValues.reportResultDate || today
      break
    case 'abnormal':
      updates.abnormalStatus = true
      updates.isAbnormal = true
      updates.abnormalDate = fieldValues.abnormalDate || today
      updates.abnormalReason = fieldValues.abnormalReason || ''
      break
  }

  updates.updatedAt = today
  return updates
}
