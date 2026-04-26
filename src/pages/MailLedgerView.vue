<template>
  <div class="page-shell">
    <div class="page-header page-header-row">
      <div>
        <h1 class="page-title">邮寄台账</h1>
        <p class="page-desc">集中管理所有案件的寄出记录、快递单号、签收状态、签收日期和后续跟进节点。</p>
      </div>
      <div class="header-actions">
        <button class="top-action-btn icon-only">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span class="notif-badge">3</span>
        </button>
        <button class="top-action-btn user-pill">
          <span class="mini-avatar">打</span>
          <span>打假人</span>
          <span class="caret">▾</span>
        </button>
      </div>
    </div>

    <div class="stat5-grid">
      <div class="stat-card sm" v-for="s in statCards" :key="s.label">
        <div class="stat-icon sm" :style="{ background: s.bg, color: s.color }">{{ s.icon }}</div>
        <div class="stat-body">
          <div class="stat-label">{{ s.label }}</div>
          <div class="stat-value">{{ s.value }}</div>
        </div>
      </div>
    </div>

    <div class="filter-bar">
      <span class="filter-bar-label">快捷筛选</span>
      <button v-for="f in quickFilters" :key="f" class="quick-filter-btn" :class="active === f ? 'active' : ''" @click="active = f">{{ f }}</button>
    </div>

    <div class="action-bar">
      <button class="btn-primary">新增邮寄记录</button>
      <button class="btn-secondary">批量导入单号</button>
      <button class="btn-secondary">批量更新签收</button>
      <button class="btn-secondary">导出邮寄台账</button>
    </div>

    <div class="dashboard-layout">
      <div class="dashboard-main-column">
        <div class="filter-card compact">
          <div class="filter-row">
            <select class="filter-select"><option>年份</option></select>
            <select class="filter-select"><option>月份</option></select>
            <select class="filter-select"><option>寄送对象</option></select>
            <select class="filter-select"><option>寄送事项</option></select>
            <select class="filter-select"><option>快递公司</option></select>
            <select class="filter-select"><option>签收状态</option></select>
            <input placeholder="搜索案件编号 / 店铺 / 单号 / 寄送对象" class="filter-input flex-1" />
            <button class="btn-secondary">重置</button>
          </div>
        </div>

        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th><input type="checkbox" /></th>
                <th>案件编号</th>
                <th>店铺 / 商家</th>
                <th>寄送对象</th>
                <th>寄送事项</th>
                <th>快递公司</th>
                <th>快递单号</th>
                <th>寄出日期</th>
                <th>签收日期</th>
                <th>签收状态</th>
                <th>下一步</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in mailRows" :key="item.code">
                <td><input type="checkbox" /></td>
                <td>{{ item.code }}</td>
                <td>{{ item.shop }}</td>
                <td>{{ item.target }}</td>
                <td>{{ item.subject }}</td>
                <td>{{ item.company }}</td>
                <td>{{ item.tracking }}</td>
                <td>{{ item.sentAt }}</td>
                <td>{{ item.signedAt }}</td>
                <td><span class="status-chip" :class="item.statusClass">{{ item.status }}</span></td>
                <td>{{ item.nextStep }}</td>
                <td>
                  <div class="table-actions">
                    <button class="btn-link">查看</button>
                    <button class="btn-link">编辑</button>
                    <button class="btn-link">更多</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="right-sidebar">
        <div class="side-card">
          <div class="side-card-head"><h3>签收提醒</h3></div>
          <div class="reminder-list">
            <div class="reminder-item" v-for="r in signReminders" :key="r.label">
              <div class="reminder-dot" :style="{ background: r.color }"></div>
              <div class="reminder-body">
                <div class="reminder-label">{{ r.label }}</div>
                <div class="reminder-sub">{{ r.sub }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="side-card">
          <div class="side-card-head"><h3>物流状态分布</h3></div>
          <div class="donut-wrap">
            <div class="donut-chart"><span>{{ store.cases.length }}</span></div>
            <div class="donut-total">总记录</div>
            <div class="donut-legend">
              <div class="donut-legend-item" v-for="d in distribution" :key="d.label">
                <span class="dot" :style="{ background: d.color }"></span>
                <span>{{ d.label }}</span>
                <strong>{{ d.count }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCaseStore } from '@/stores/case'
import dayjs from 'dayjs'

const store = useCaseStore()
const active = ref('全部')
const quickFilters = ['全部', '待寄出', '有单号未签收', '已签收未答复', '超15个工作日', '缺签收截图', '复议相关寄送']

const statCards = computed(() => {
  const all = store.cases
  const pending = all.filter(c => !c.trackingNumber && !c.mailTrackingNo).length
  const inTransit = all.filter(c => (c.trackingNumber || c.mailTrackingNo) && !c.signDate).length
  const signed = all.filter(c => c.signDate).length
  const signedNoReply = all.filter(c => c.signDate && !c.reportResultStatus).length
  const overdue = all.filter(c => {
    if (!c.signDate || c.reportResultStatus) return false
    const daysSince = dayjs().diff(dayjs(c.signDate), 'day')
    return daysSince >= 21
  }).length
  return [
    { label: '待寄出', value: pending, icon: '📮', bg: '#e8f2ff', color: '#1677ff' },
    { label: '运输中', value: inTransit, icon: '🚚', bg: '#eff6ff', color: '#2563eb' },
    { label: '已签收', value: signed, icon: '✅', bg: '#ecfdf5', color: '#10b981' },
    { label: '签收未答复', value: signedNoReply, icon: '📄', bg: '#fff7ed', color: '#f59e0b' },
    { label: '超期未答复', value: overdue, icon: '⚠️', bg: '#fef2f2', color: '#ef4444' },
  ]
})

const mailRows = computed(() => {
  return store.cases
    .filter(c => c.trackingNumber || c.mailTrackingNo || c.signDate)
    .map(c => {
      const trackingNo = c.trackingNumber || c.mailTrackingNo || '-'
      const hasTracking = !!(c.trackingNumber || c.mailTrackingNo)
      const hasSign = !!c.signDate
      let status = '待寄出'
      let statusClass = 'badge-red'
      if (hasSign) {
        status = c.reportResultStatus ? '已答复' : '签收未答复'
        statusClass = c.reportResultStatus ? 'badge-green' : 'badge-orange'
      } else if (hasTracking) {
        status = '运输中'
        statusClass = 'badge-blue'
      }
      return {
        id: c.id,
        code: c.caseNumber || '待生成',
        shop: c.shopName || '-',
        target: c.jurisdiction || '未填写',
        subject: c.productName || '未填写',
        company: hasTracking ? '待识别' : '-',
        tracking: trackingNo,
        sentAt: c.submitDate || '-',
        signedAt: c.signDate || '-',
        status,
        statusClass,
        nextStep: hasSign
          ? (c.reportResultStatus ? '等待下一步' : '登记答复结果')
          : (hasTracking ? '跟进物流' : '打印面单寄出'),
      }
    })
})

const signReminders = computed(() => {
  const all = store.cases
  const overdueList = all.filter(c => {
    if (!c.signDate || c.reportResultStatus) return false
    return dayjs().diff(dayjs(c.signDate), 'day') >= 21
  })
  const noReplyList = all.filter(c => c.signDate && !c.reportResultStatus)
  const canReconsider = all.filter(c => {
    if (!c.reportResultStatus || !['rejected', 'not_punished', 'exempted'].includes(c.reportResultStatus)) return false
    if (!c.reportResultDate) return false
    const daysSince = dayjs().diff(dayjs(c.reportResultDate), 'day')
    return daysSince <= 60
  })
  const result = []
  if (overdueList.length > 0) result.push({ label: '已签收未答复', sub: `${overdueList.length}件案件签收超过21天未答复`, color: '#ef4444' })
  if (noReplyList.length > 0) result.push({ label: '建议催告跟进', sub: `${noReplyList.length}件案件建议催告跟进`, color: '#8b5cf6' })
  if (canReconsider.length > 0) result.push({ label: '建议准备复议', sub: `${canReconsider.length}件案件建议准备复议`, color: '#10b981' })
  return result
})

const distribution = computed(() => {
  const all = store.cases
  const pending = all.filter(c => !c.trackingNumber && !c.mailTrackingNo).length
  const inTransit = all.filter(c => (c.trackingNumber || c.mailTrackingNo) && !c.signDate).length
  const signed = all.filter(c => c.signDate).length
  const noRecord = all.filter(c => !c.trackingNumber && !c.mailTrackingNo && !c.signDate).length
  return [
    { label: '待寄出', count: pending, color: '#1677ff' },
    { label: '运输中', count: inTransit, color: '#2563eb' },
    { label: '已签收', count: signed, color: '#10b981' },
    { label: '未登记签收', count: signed ? noRecord : 0, color: '#9ca3af' },
  ]
})
</script>
