<template>
  <div class="page-shell">
    <div class="page-header page-header-row">
      <div>
        <div class="page-title-inline">
          <h1 class="page-title">案件处置工作台</h1>
          <span class="page-title-note">循证留痕,依法跟进</span>
        </div>
        <p class="page-desc">集中记录购买事实、投诉举报、邮寄签收、机关答复、救济监督和费用收益,帮助维权案件形成完整证据链与跟进链。</p>
      </div>
      <div class="header-actions">
        <button class="top-action-btn icon-only">🔔</button>
        <button class="top-action-btn user-pill">
          <span class="mini-avatar">打</span>
          <span>打假人</span>
          <span class="caret">▾</span>
        </button>
      </div>
    </div>

    <div class="dashboard-layout">
      <div class="dashboard-main-column">
        <div class="stat6-grid">
          <div
            class="stat-card"
            v-for="c in statCards"
            :key="c.key"
            :class="activeMetric === c.key ? 'stat-card-active' : ''"
            @click="activeMetric = c.key"
            style="cursor:pointer"
          >
            <div class="stat-icon" :style="{ background: c.iconBg, color: c.iconColor }">{{ c.icon }}</div>
            <div class="stat-body">
              <div class="stat-label">{{ c.label }}</div>
              <div class="stat-value">{{ c.value }}</div>
              <div class="stat-change" :class="c.trend">{{ c.change }}</div>
            </div>
          </div>
        </div>

        <div class="filter-bar">
          <span class="filter-bar-label">快捷筛选</span>
          <button
            v-for="f in quickFilters"
            :key="f.key"
            class="quick-filter-btn"
            :class="activeQuick === f.key ? 'active' : ''"
            @click="activeQuick = f.key"
          >
            {{ f.label }}
          </button>
        </div>

        <div class="toolbar-card workbench-toolbar">
          <select class="toolbar-select"><option>年份</option><option>2026</option><option>2025</option></select>
          <select class="toolbar-select"><option>月份</option><option>04</option><option>03</option></select>
          <select class="toolbar-select wide"><option>全部进度</option></select>
          <select class="toolbar-select wide"><option>全部类型</option></select>
          <div class="toolbar-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="搜索店铺/商品/案件编号/内容" />
          </div>
          <button class="btn-reset">重置</button>
        </div>

        <div class="table-card">
          <div class="table-head table-head-large">
            <div>
              <div class="table-head-title-row">
                <h2>待跟进案件</h2>
                <span class="info-dot">i</span>
              </div>
              <p>优先展示需要继续操作的案件,按照期限紧急程度和材料缺口综合排序。</p>
            </div>
            <button class="btn-ghost">刷新</button>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 36px"></th>
                <th>案件编号</th>
                <th>店铺 / 商家</th>
                <th>商品 / 事项</th>
                <th>当前进度</th>
                <th>结果 / 签收日期</th>
                <th>期限提醒</th>
                <th>我方下一步</th>
                <th>金额</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in filteredWorkbenchCases" :key="item.id" :class="index === 0 ? 'selected-row' : ''">
                <td>
                  <div class="row-radio" :class="index === 0 ? 'active' : ''"></div>
                </td>
                <td>{{ item.code }}</td>
                <td>{{ item.shop }}</td>
                <td>{{ item.subject }}</td>
                <td><span class="status-chip" :class="item.progressClass">{{ item.progress }}</span></td>
                <td>{{ item.result }}</td>
                <td><span class="status-chip" :class="item.deadlineClass">{{ item.deadline }}</span></td>
                <td>{{ item.nextStep }}</td>
                <td>{{ item.amount }}</td>
                <td>{{ item.updatedAt }}</td>
                <td>
                  <div class="table-actions">
                    <button class="btn-link" @click="router.push(`/case/${item.id}`)">查看</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="table-foot">
            <span>共 <strong>10</strong> 条</span>
            <span>10条/页</span>
            <div class="pagination">
              <button class="page-btn">&lt;</button>
              <button class="page-btn active">1</button>
              <button class="page-btn">2</button>
              <button class="page-btn">3</button>
              <button class="page-btn">&gt;</button>
            </div>
          </div>
        </div>
      </div>

      <div class="right-sidebar">
        <div class="side-card">
          <div class="side-card-head">
            <h3>跟进提醒</h3>
            <button class="btn-link">更多 &gt;</button>
          </div>
          <div class="reminder-list reminder-list-compact">
            <div class="follow-reminder-item" v-for="r in reminders" :key="r.label">
              <div class="follow-reminder-icon" :style="{ background: r.bg, color: r.color }">{{ r.icon }}</div>
              <div class="follow-reminder-body">
                <div class="reminder-label">{{ r.label }}</div>
                <div class="reminder-sub">{{ r.sub }}</div>
              </div>
              <div class="reminder-badge">{{ r.count }}</div>
            </div>
          </div>
        </div>

        <div class="side-card">
          <div class="side-card-head">
            <h3>费用收益概览(本月)</h3>
          </div>
          <div class="mini-stat-grid">
            <div class="mini-stat-card" v-for="f in feeStats" :key="f.label">
              <div class="mini-stat-label">{{ f.label }}</div>
              <div class="mini-stat-value">{{ f.value }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { inject, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCaseStore } from '@/stores/case'
import dayjs from 'dayjs'

const store = useCaseStore()
const router = useRouter()
const openAINextStepDrawer = inject('openAINextStepDrawer', null)

const unfavorableResults = ['rejected', 'not_punished', 'mediation_terminated', 'exempted']

// 工作台统计卡 - 真实数据驱动
const statCards = computed(() => {
  const all = store.cases
  const needOrganize = all.filter(c =>
    !c.caseNumber || !c.shopName || !c.productName || !c.jurisdiction ||
    (!c.mailTrackingNo && !c.trackingNumber && !c.expressNo)
  ).length
  const sent = all.filter(c => c.mailTrackingNo || c.trackingNumber || c.expressNo).length
  const waitingReply = all.filter(c => c.signDate && !c.reportResultStatus).length
  const canReconsiderCount = all.filter(c => {
    if (!c.reportResultStatus || !unfavorableResults.includes(c.reportResultStatus)) return false
    if (!c.reportResultDate) return false
    return dayjs().diff(dayjs(c.reportResultDate), 'day') <= 60
  }).length
  const reviewDeadlineCount = all.filter(c => {
    if (!c.reportResultStatus || !['rejected', 'not_punished', 'exempted'].includes(c.reportResultStatus)) return false
    if (!c.reportResultDate) return false
    const daysLeft = 60 - dayjs().diff(dayjs(c.reportResultDate), 'day')
    return daysLeft > 0 && daysLeft <= 7
  }).length
  return [
    { key: 'all', label: '案件总数', value: all.length, change: '', trend: '', icon: '📁', iconBg: '#e8f2ff', iconColor: '#1677ff' },
    { key: 'needOrganize', label: '待整理', value: needOrganize, change: '', trend: '', icon: '🗂️', iconBg: '#f5f3ff', iconColor: '#8b5cf6' },
    { key: 'sent', label: '已寄出', value: sent, change: '', trend: '', icon: '📮', iconBg: '#ecfdf5', iconColor: '#10b981' },
    { key: 'waitingReply', label: '等待答复', value: waitingReply, change: '', trend: '', icon: '⏳', iconBg: '#fff7ed', iconColor: '#f59e0b' },
    { key: 'canReconsider', label: '可复议', value: canReconsiderCount, change: '', trend: '', icon: '⚖️', iconBg: '#fef2f2', iconColor: '#ef4444' },
    { key: 'deadline', label: '临期提醒', value: reviewDeadlineCount, change: '', trend: '', icon: '🔔', iconBg: '#fef9c3', iconColor: '#ca8a04' },
  ]
})

// 点击统计卡后过滤的案件
const activeMetric = ref('all')

const quickFilters = [
  { key: 'all', label: '全部' },
  { key: 'evidence', label: '待补证据' },
  { key: 'mail', label: '待邮寄' },
  { key: 'signed', label: '已签收未答复' },
  { key: 'unsatisfied', label: '答复不满意' },
  { key: 'reconsider', label: '可复议' },
  { key: 'review_due', label: '复议临期' },
  { key: 'paid', label: '已回款' },
  { key: 'archived', label: '已归档' },
]
const activeQuick = ref('all')

// 按统计卡过滤的案件列表
const filteredWorkbenchCases = computed(() => {
  const all = store.cases
  let filtered = all.filter(c => {
    const eff = store.getEffectiveStatus(c)
    if (eff === 'decided' || c.isArchived) return false
    switch (activeMetric.value) {
      case 'all': return eff !== 'pending_report'
      case 'needOrganize': return !c.caseNumber || !c.shopName || !c.productName || !c.jurisdiction || (!c.mailTrackingNo && !c.trackingNumber && !c.expressNo)
      case 'sent': return !c.signDate && (c.mailTrackingNo || c.trackingNumber || c.expressNo)
      case 'waitingReply': return c.signDate && !c.reportResultStatus
      case 'canReconsider': return c.reportResultStatus && unfavorableResults.includes(c.reportResultStatus) && c.reportResultDate && dayjs().diff(dayjs(c.reportResultDate), 'day') <= 60
      case 'deadline': return c.reportResultDate && (() => { const d = 60 - dayjs().diff(dayjs(c.reportResultDate), 'day'); return d > 0 && d <= 7 })()
      default: return eff !== 'pending_report'
    }
  })
  return filtered.map(c => {
    let deadline = ''
    let deadlineClass = 'badge-blue'
    if (c.reportResultDate) {
      const daysLeft = 60 - dayjs().diff(dayjs(c.reportResultDate), 'day')
      if (daysLeft <= 0) { deadline = `已超期${Math.abs(daysLeft)}天`; deadlineClass = 'badge-red' }
      else if (daysLeft <= 7) { deadline = `复议临期 ${daysLeft}天`; deadlineClass = 'badge-red' }
      else { deadline = `${daysLeft}天`; deadlineClass = 'badge-orange' }
    }
    let progress = ''
    let progressClass = 'badge-blue'
    if (c.signDate && !c.reportResultStatus) {
      progress = `已签收${dayjs().diff(dayjs(c.signDate), 'day')}天未答复`; progressClass = 'badge-orange'
    } else if (c.reportResultStatus) {
      progress = { rejected: '不予立案', not_punished: '违法事实不成立', closed: '已办结', exempted: '免于处罚', mediation_terminated: '终止调解', not_accepted: '不予受理' }[c.reportResultStatus] || c.reportResultStatus; progressClass = 'badge-orange'
    } else if (c.mediationStatus === 'decided') { progress = '已调解'; progressClass = 'badge-green' }
    return {
      id: c.id,
      code: c.caseNumber || '待生成',
      shop: c.shopName || '-',
      subject: c.productName || '-',
      progress, progressClass,
      result: c.reportResultDate ? `答复日期 ${dayjs(c.reportResultDate).format('YYYY-MM-DD')}` : (c.signDate ? `签收日期 ${dayjs(c.signDate).format('YYYY-MM-DD')}` : '-'),
      deadline, deadlineClass,
      nextStep: c.reportResultStatus ? '登记答复结果' : (c.signDate ? '等待答复' : '待建档'),
      amount: c.expense ? `¥${Number(c.expense).toFixed(2)}` : '-',
      updatedAt: c.updatedAt ? dayjs(c.updatedAt).format('MM-DD HH:mm') : '-',
    }
  })
})

// 右侧跟进提醒 - 真实数据
const reminders = computed(() => {
  const all = store.cases
  const reviewDue = all.filter(c => {
    if (!c.reportResultDate) return false
    const daysLeft = 60 - dayjs().diff(dayjs(c.reportResultDate), 'day')
    return daysLeft > 0 && daysLeft <= 7
  }).length
  const signedNoReply = all.filter(c => c.signDate && !c.reportResultStatus).length
  const missingMaterial = all.filter(c => !c.signDate && !c.trackingNumber && !c.mailTrackingNo).length
  return [
    { label: '复议临期提醒', sub: `${reviewDue}件案件复议期限不足7天`, count: reviewDue, icon: '⚠', color: '#ef4444', bg: '#fef2f2' },
    { label: '已签收未答复', sub: `${signedNoReply}件案件已签收未登记答复`, count: signedNoReply, icon: '✉', color: '#f59e0b', bg: '#fff7ed' },
    { label: '缺少关键材料', sub: `${missingMaterial}件案件缺少关键材料`, count: missingMaterial, icon: '📎', color: '#8b5cf6', bg: '#f5f3ff' },
  ].filter(r => r.count > 0)
})

// 费用收益概览 - 真实数据
const feeStats = computed(() => {
  const thisMonth = dayjs().format('YYYY-MM')
  const monthCases = store.cases.filter(c => c.createdAt && c.createdAt.startsWith(thisMonth))
  const totalExpense = monthCases.reduce((sum, c) => sum + Number(c.expense || 0), 0)
  const totalProfit = monthCases.reduce((sum, c) => sum + Number(c.profit || 0), 0)
  const netProfit = totalProfit - totalExpense
  return [
    { label: '本月购买金额', value: `¥${totalExpense.toFixed(0).replace(/\B(?=(\d{3})+$)/g, ',')}` },
    { label: '本月赔付金额', value: `¥${totalProfit.toFixed(0).replace(/\B(?=(\d{3})+$)/g, ',')}` },
    { label: '本月净收益', value: `¥${netProfit.toFixed(0).replace(/\B(?=(\d{3})+$)/g, ',')}` },
    { label: '本月新增案件', value: String(monthCases.length) },
  ]
})
</script>
