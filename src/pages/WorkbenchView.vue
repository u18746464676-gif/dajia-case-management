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
        <div class="stat9-grid">
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
import { getEffectiveStatusLabel, getNextAction, getDeadlineText, getStatusBadgeClass } from '@/utils/caseStatus'

const store = useCaseStore()
const router = useRouter()
const openAINextStepDrawer = inject('openAINextStepDrawer', null)

const unfavorableResults = ['rejected', 'not_punished', 'mediation_terminated', 'exempted']

function isAccepted(c) {
  return c.acceptanceStatus === 'accepted' || c.acceptanceStatus === '已受理'
}

function isNotAccepted(c) {
  return c.acceptanceStatus === 'not_accepted' || c.acceptanceStatus === 'rejected_acceptance' || c.acceptanceStatus === '不予受理'
}

// 工作台统计卡 - 真实数据驱动
const statCards = computed(() => {
  const all = store.cases
  const unaccepted = all.filter(c => !isAccepted(c) && !isNotAccepted(c))
  return [
    { key: 'all', label: '案件总数', value: all.length, icon: '📁', iconBg: '#e8f2ff', iconColor: '#1677ff' },
    { key: 'accepted', label: '已受理', value: all.filter(isAccepted).length, icon: '📋', iconBg: '#f0fdf4', iconColor: '#16a34a' },
    { key: 'notAccepted', label: '未受理', value: unaccepted.length, icon: '📝', iconBg: '#fffbeb', iconColor: '#d97706' },
    { key: 'notAcceptedExplicit', label: '不予受理', value: all.filter(isNotAccepted).length, icon: '🚫', iconBg: '#fef2f2', iconColor: '#dc2626' },
    { key: 'filed', label: '已立案', value: all.filter(c => ['filed', '已立案'].includes(c.filingStatus)).length, icon: '⚖️', iconBg: '#eff6ff', iconColor: '#2563eb' },
    { key: 'rejected', label: '不予立案', value: all.filter(c => ['rejected', 'not_filed', '不予立案'].includes(c.reportResultStatus)).length, icon: '❌', iconBg: '#fff1f2', iconColor: '#be123c' },
    { key: 'notPunished', label: '不予处罚', value: all.filter(c => ['not_punished', 'exempted', '违法事实不成立', '不予处罚'].includes(c.reportResultStatus)).length, icon: '🚫', iconBg: '#f5f3ff', iconColor: '#7c3aed' },
    { key: 'penalized', label: '已处罚', value: all.filter(c => ['penalty', 'punished', '已处罚'].includes(c.reportResultStatus)).length, icon: '🔨', iconBg: '#fef3c7', iconColor: '#b45309' },
    { key: 'decided', label: '已调解', value: all.filter(c => ['decided', 'mediation_success', '已调解'].includes(c.mediationStatus)).length, icon: '🤝', iconBg: '#ecfdf5', iconColor: '#059669' },
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
  let filtered = all
  switch (activeMetric.value) {
    case 'all': filtered = all; break
    case 'accepted': filtered = all.filter(c => c.acceptanceStatus === 'accepted'); break
    case 'notAccepted': filtered = all.filter(c => !c.acceptanceStatus); break
    case 'notAcceptedExplicit': filtered = all.filter(c => ['not_accepted', 'rejected_acceptance', '不予受理'].includes(c.acceptanceStatus)); break
    case 'filed': filtered = all.filter(c => ['filed', '已立案'].includes(c.filingStatus)); break
    case 'rejected': filtered = all.filter(c => ['rejected', 'not_filed', '不予立案'].includes(c.reportResultStatus)); break
    case 'notPunished': filtered = all.filter(c => ['not_punished', 'exempted', '违法事实不成立', '不予处罚'].includes(c.reportResultStatus)); break
    case 'penalized': filtered = all.filter(c => ['penalty', 'punished', '已处罚'].includes(c.reportResultStatus)); break
    case 'decided': filtered = all.filter(c => ['decided', 'mediation_success', '已调解'].includes(c.mediationStatus)); break
    default: filtered = all
  }
  return filtered.map(c => {
    const progress = getEffectiveStatusLabel(c)
    const progressClass = getStatusBadgeClass(c)
    const deadline = getDeadlineText(c)
    const deadlineClass = deadline.includes('超期') || deadline.includes('临期') ? 'badge-red' : (deadline && deadline !== '补充材料' && deadline !== '等待处理结果' && deadline !== '可归档' ? 'badge-orange' : 'badge-blue')
    return {
      id: c.id,
      code: c.caseNumber || '待生成',
      shop: c.shopName || '-',
      subject: c.productName || '-',
      progress, progressClass,
      result: c.reportResultDate ? `答复日期 ${dayjs(c.reportResultDate).format('YYYY-MM-DD')}` : (c.signDate ? `签收日期 ${dayjs(c.signDate).format('YYYY-MM-DD')}` : '-'),
      deadline, deadlineClass,
      nextStep: getNextAction(c),
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
