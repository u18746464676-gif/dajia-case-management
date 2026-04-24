// 逾期提醒服务
import dayjs from 'dayjs'

// 计算工作日天数
function workingDaysDiff(startDate, endDate) {
  let count = 0
  let current = dayjs(startDate)
  const end = dayjs(endDate)
  while (current.isBefore(end) || current.isSame(end, 'day')) {
    const dayOfWeek = current.day()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++
    }
    current = current.add(1, 'day')
  }
  return count - 1
}

function addWorkingDays(startDate, days) {
  let current = dayjs(startDate)
  let added = 0

  while (added < days) {
    current = current.add(1, 'day')
    const dayOfWeek = current.day()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      added++
    }
  }

  return current.format('YYYY-MM-DD')
}

function formatCountdownStatus(daysLeft) {
  if (daysLeft < 0) return `已超期 ${Math.abs(daysLeft)} 天`
  if (daysLeft === 0) return '今日到期'
  return `剩余 ${daysLeft} 天`
}

// 检查案件是否超期
export function checkOverdueCases(cases) {
  const now = dayjs()
  const overdueList = []

  for (const c of cases) {
    const hasTerminalOutcome = Boolean(c.reportResultStatus)
      || ['decided', 'mediation_terminated'].includes(c.mediationStatus)
    const hasOldRuleFilingCountdown = c.procedureVersion === 'old'
      && c.filingStatus === 'filed'
      && Boolean(c.filingDate)
      && !hasTerminalOutcome

    if (!c.acceptanceStatus && c.signDate) {
      const deadline = addWorkingDays(c.signDate, 10)
      const workingDaysLeft = workingDaysDiff(now, deadline)
      if (workingDaysLeft < 0 || workingDaysLeft <= 3) {
        overdueList.push({
          id: c.id,
          shopName: c.shopName,
          productName: c.productName,
          type: 'acceptance',
          message: `受理到期日（10个工作日）：${formatCountdownStatus(workingDaysLeft)}`,
          deadline,
          urgency: workingDaysLeft < 0 ? 'danger' : 'warning'
        })
      }
    }

    if (hasOldRuleFilingCountdown) {
      const filingNormalDeadline = dayjs(c.filingDate).add(90, 'day').format('YYYY-MM-DD')
      const filingNormalDaysLeft = dayjs(filingNormalDeadline).diff(now, 'day')
      if (filingNormalDaysLeft < 0 || filingNormalDaysLeft <= 15) {
        overdueList.push({
          id: c.id,
          shopName: c.shopName,
          productName: c.productName,
          type: 'filing_normal',
          message: `立案后普通办理期限（90日）：${formatCountdownStatus(filingNormalDaysLeft)}`,
          deadline: filingNormalDeadline,
          urgency: filingNormalDaysLeft < 0 ? 'danger' : 'warning'
        })
      }

      const filingCompletionDeadline = dayjs(c.filingDate).add(120, 'day').format('YYYY-MM-DD')
      const filingCompletionDaysLeft = dayjs(filingCompletionDeadline).diff(now, 'day')
      if (filingCompletionDaysLeft < 0 || filingCompletionDaysLeft <= 15) {
        overdueList.push({
          id: c.id,
          shopName: c.shopName,
          productName: c.productName,
          type: 'filing_completion',
          message: `立案办结总控提醒（120日）：${formatCountdownStatus(filingCompletionDaysLeft)}`,
          deadline: filingCompletionDeadline,
          urgency: filingCompletionDaysLeft < 0 ? 'danger' : 'warning'
        })
      }
    }

    if (c.acceptanceStatus === 'accepted' && c.acceptanceDate) {
      if (!c.mediationStatus) {
        const isOldProcedure = c.procedureVersion === 'old'
        const mediationName = isOldProcedure ? '调解倒计时（45个工作日）' : '调解倒计时（60日）'
        const mediationDeadline = isOldProcedure
          ? addWorkingDays(c.acceptanceDate, 45)
          : dayjs(c.acceptanceDate).add(60, 'day').format('YYYY-MM-DD')
        const daysLeft = isOldProcedure
          ? workingDaysDiff(now, mediationDeadline)
          : dayjs(mediationDeadline).diff(now, 'day')
        if (daysLeft < 0 || daysLeft <= 7) {
          let message = `${mediationName}：${formatCountdownStatus(daysLeft)}`
          if (isOldProcedure) {
            message += ' 工作日计算暂按排除周六、周日测算，法定节假日需人工复核。'
          }
          if (daysLeft < 0) {
            message += ' 调解期限已届满，可能存在未依法终止调解或未依法告知问题，可考虑行政复议、行政执法监督、政府督查。'
          }
          overdueList.push({
            id: c.id,
            shopName: c.shopName,
            productName: c.productName,
            type: 'mediation',
            message,
            deadline: mediationDeadline,
            urgency: daysLeft < 0 ? 'danger' : 'warning'
          })
        }
      }

      if (!hasTerminalOutcome && !hasOldRuleFilingCountdown) {
        const completionDeadline = dayjs(c.acceptanceDate).add(120, 'day').format('YYYY-MM-DD')
        const completionDaysLeft = dayjs(completionDeadline).diff(now, 'day')
        if (completionDaysLeft < 0 || completionDaysLeft <= 15) {
          overdueList.push({
            id: c.id,
            shopName: c.shopName,
            productName: c.productName,
            type: 'completion',
            message: `案件办结到期日（120日）：${formatCountdownStatus(completionDaysLeft)}`,
            deadline: completionDeadline,
            urgency: completionDaysLeft < 0 ? 'danger' : 'warning'
          })
        }
      }
    }

    if (c.acceptanceStatus === 'reported' && !hasTerminalOutcome && !hasOldRuleFilingCountdown && c.acceptanceDate) {
      const completionDeadline = dayjs(c.acceptanceDate).add(120, 'day').format('YYYY-MM-DD')
      const completionDaysLeft = dayjs(completionDeadline).diff(now, 'day')
      if (completionDaysLeft < 0 || completionDaysLeft <= 15) {
        overdueList.push({
          id: c.id,
          shopName: c.shopName,
          productName: c.productName,
          type: 'completion',
          message: `案件办结到期日（120日）：${formatCountdownStatus(completionDaysLeft)}`,
          deadline: completionDeadline,
          urgency: completionDaysLeft < 0 ? 'danger' : 'warning'
        })
      }
    }

    if (['rejected', 'exempted'].includes(c.reportResultStatus) && c.reportResultDate) {
      const reviewDeadline60 = dayjs(c.reportResultDate).add(60, 'day').format('YYYY-MM-DD')
      const reviewDaysLeft = dayjs(reviewDeadline60).diff(now, 'day')
      const reviewLongStopDate = dayjs(c.reportResultDate).add(1, 'year').format('YYYY-MM-DD')
      const reviewLongStopDaysLeft = dayjs(reviewLongStopDate).diff(now, 'day')
      let message = ''
      if (reviewDaysLeft >= 0) {
        message = `行政复议期限：${formatCountdownStatus(reviewDaysLeft)}；状态：通常仍在 60 日期限内。行政复议申请截止日：${reviewDeadline60}。未告知救济途径最长保护期：${reviewLongStopDate}。默认按举报结果日期起算 60 日。若文书未告知复议权利、复议机关、申请期限，可适用最长一年保护期规则。`
      } else if (reviewLongStopDaysLeft >= 0) {
        message = `行政复议 60 日期限：${formatCountdownStatus(reviewDaysLeft)}；未告知救济途径最长保护期：尚余 ${reviewLongStopDaysLeft} 天。提示：如文书未告知复议权利、复议机关、申请期限，可主张最长一年保护期，需人工确认。`
      } else {
        message = `行政复议 60 日期限：${formatCountdownStatus(reviewDaysLeft)}；未告知救济途径最长保护期：已超期 ${Math.abs(reviewLongStopDaysLeft)} 天。提示：通常已超过最长保护期；是否仍可救济需结合不可抗力、正当理由、是否另有新行政行为等人工审查。`
      }
      overdueList.push({
        id: c.id,
        shopName: c.shopName,
        productName: c.productName,
        type: 'review_deadline',
        message,
        deadline: reviewDeadline60,
        urgency: reviewDaysLeft >= 0 ? (reviewDaysLeft <= 15 ? 'warning' : 'info') : (reviewLongStopDaysLeft >= 0 ? 'warning' : 'danger')
      })
    }

    if (hasTerminalOutcome) {
      continue
    }
  }

  return overdueList
}

// 发送浏览器通知
export async function sendBrowserNotification(title, body, icon = '/guohui.png') {
  if (!('Notification' in window)) {
    console.log('浏览器不支持通知')
    return false
  }

  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon })
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      new Notification(title, { body, icon })
      return true
    }
  }

  return false
}

// 提醒服务类
export class ReminderService {
  constructor(onUpdate) {
    this.onUpdate = onUpdate
    this.lastNotifyTime = null
  }

  // 检查并提醒
  async checkAndNotify(cases) {
    const overdueList = checkOverdueCases(cases)

    // 触发更新回调
    if (this.onUpdate) {
      this.onUpdate(overdueList)
    }

    // 发送浏览器通知（每5分钟最多一次）
    const now = Date.now()
    if (overdueList.length > 0 && (!this.lastNotifyTime || now - this.lastNotifyTime > 5 * 60 * 1000)) {
      const dangerCount = overdueList.filter(o => o.urgency === 'danger').length
      const title = dangerCount > 0 ? `⚠️ ${dangerCount}个案件超期！` : `⏰ ${overdueList.length}个案件临近期限`
      const body = overdueList.slice(0, 3).map(o => o.message).join('\n')
      await sendBrowserNotification(title, body)
      this.lastNotifyTime = now
    }

    return overdueList
  }

  // 启动定时检查
  start(cases, intervalMs = 60000) {
    // 立即检查一次
    this.checkAndNotify(cases)

    // 定时检查
    return setInterval(() => {
      this.checkAndNotify(cases)
    }, intervalMs)
  }
}
