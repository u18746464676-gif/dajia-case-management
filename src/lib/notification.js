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
        const mediationDeadline = dayjs(c.acceptanceDate).add(60, 'day').format('YYYY-MM-DD')
        const daysLeft = dayjs(mediationDeadline).diff(now, 'day')
        if (daysLeft < 0 || daysLeft <= 7) {
          overdueList.push({
            id: c.id,
            shopName: c.shopName,
            productName: c.productName,
            type: 'mediation',
            message: daysLeft < 0
              ? `调解倒计时（60日）：${formatCountdownStatus(daysLeft)}。自投诉受理之日起 60 日内未达成调解协议的，应进入终止调解处理；终止调解后应告知投诉人和被投诉人。`
              : `调解倒计时（60日）：${formatCountdownStatus(daysLeft)}`,
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
      let message = `行政复议申请截止日：${reviewDeadline60}，行政复议期限：${formatCountdownStatus(reviewDaysLeft)}，未告知救济途径最长保护期：${reviewLongStopDate}。默认按举报结果日期起算 60 日。若文书未告知复议权利、复议机关、申请期限，可适用最长一年保护期规则。`
      if (reviewDaysLeft < 0 && reviewLongStopDaysLeft >= 0) {
        message += ` 60日复议期限已超期 ${Math.abs(reviewDaysLeft)} 天；如未告知复议权利、复议机关、申请期限，最长保护期尚余 ${reviewLongStopDaysLeft} 天。`
      }
      overdueList.push({
        id: c.id,
        shopName: c.shopName,
        productName: c.productName,
        type: 'review_deadline',
        message,
        deadline: reviewDeadline60,
        urgency: reviewDaysLeft < 0 ? 'danger' : (reviewDaysLeft <= 15 ? 'warning' : 'info')
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
