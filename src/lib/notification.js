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

// 检查案件是否超期
export function checkOverdueCases(cases) {
  const now = dayjs()
  const overdueList = []

  for (const c of cases) {
    // 未受理案件：签收日期起10个工作日内应受理
    if (c.status === 'pending_report' && c.signDate) {
      const deadline = addWorkingDays(c.signDate, 10)
      const workingDaysLeft = workingDaysDiff(now, deadline)
      if (workingDaysLeft < 0) {
        const overdueDays = Math.abs(workingDaysLeft)
        overdueList.push({
          id: c.id,
          shopName: c.shopName,
          productName: c.productName,
          type: 'acceptance',
          message: `签收已超过${overdueDays}个工作日未受理`,
          deadline: deadline,
          urgency: overdueDays > 3 ? 'danger' : 'warning'
        })
      } else if (workingDaysLeft <= 3) {
        overdueList.push({
          id: c.id,
          shopName: c.shopName,
          productName: c.productName,
          type: 'acceptance',
          message: `受理到期日还剩${workingDaysLeft}个工作日`,
          deadline: deadline,
          urgency: 'warning'
        })
      }
    }

    // 受理相关案件时限，不予受理只保留办结期限
    if ((c.status === 'accepted' || c.status === 'reported' || c.status === 'decided') && c.acceptanceDate) {
      if (c.status !== 'reported') {
        const mediationDeadline = dayjs(c.acceptanceDate).add(60, 'day').format('YYYY-MM-DD')
        const daysLeft = dayjs(mediationDeadline).diff(now, 'day')
        if (daysLeft < 0) {
          const overdueDays = Math.abs(daysLeft)
          overdueList.push({
            id: c.id,
            shopName: c.shopName,
            productName: c.productName,
            type: 'mediation',
            message: `调解期限已超过${overdueDays}天`,
            deadline: mediationDeadline,
            urgency: 'danger'
          })
        } else if (daysLeft <= 7) {
          overdueList.push({
            id: c.id,
            shopName: c.shopName,
            productName: c.productName,
            type: 'mediation',
            message: `调解期限还剩${daysLeft}天`,
            deadline: mediationDeadline,
            urgency: 'warning'
          })
        }
      }

      const completionDeadline = dayjs(c.acceptanceDate).add(120, 'day').format('YYYY-MM-DD')
      const completionDaysLeft = dayjs(completionDeadline).diff(now, 'day')
      if (completionDaysLeft < 0) {
        const overdueDays = Math.abs(completionDaysLeft)
        overdueList.push({
          id: c.id,
          shopName: c.shopName,
          productName: c.productName,
          type: 'completion',
          message: `案件办结期限已超过${overdueDays}天`,
          deadline: completionDeadline,
          urgency: 'danger'
        })
      } else if (completionDaysLeft <= 15) {
        overdueList.push({
          id: c.id,
          shopName: c.shopName,
          productName: c.productName,
          type: 'completion',
          message: `案件办结期限还剩${completionDaysLeft}天`,
          deadline: completionDeadline,
          urgency: completionDaysLeft <= 7 ? 'danger' : 'warning'
        })
      }
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
