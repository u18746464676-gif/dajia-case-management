<template>
  <div class="page-shell">
    <div class="page-header page-header-row">
      <div>
        <h1 class="page-title">提醒中心</h1>
        <p class="page-desc">全局提醒和待办事项，按紧急程度优先处理。</p>
      </div>
      <div class="header-actions">
        <button class="btn-secondary">提醒设置</button>
        <button class="btn-secondary">处理记录</button>
        <button class="btn-secondary">刷新</button>
      </div>
    </div>

    <div class="dashboard-layout">
      <div class="dashboard-main-column">
        <div class="stat5-grid">
          <div class="stat-card sm" v-for="s in statCards" :key="s.label">
            <div class="stat-icon sm" :style="{ background: s.bg, color: s.color }">{{ s.icon }}</div>
            <div class="stat-body">
              <div class="stat-label">{{ s.label }}</div>
              <div class="stat-value">{{ s.value }}</div>
            </div>
          </div>
        </div>

        <div class="status-tab">
          <button v-for="t in categoryTabs" :key="t.key" class="status-tab-btn" :class="activeCat === t.key ? 'active' : ''" @click="activeCat = t.key">
            {{ t.label }} <span class="tab-count">{{ t.count }}</span>
          </button>
        </div>

        <div class="filter-card compact">
          <div class="filter-row">
            <select class="filter-select"><option>年份</option></select>
            <select class="filter-select"><option>月份</option></select>
            <select class="filter-select"><option>紧急程度</option></select>
            <select class="filter-select"><option>状态</option></select>
            <input placeholder="搜索案件编号 / 店铺 / 提醒内容" class="filter-input flex-1" />
            <button class="btn-secondary">重置</button>
          </div>
        </div>

        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th>提醒内容</th>
                <th>所属案件</th>
                <th>来源模块</th>
                <th>触发原因</th>
                <th>截止日期</th>
                <th>剩余时间</th>
                <th>紧急程度</th>
                <th>建议动作</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in reminderRows" :key="row.id">
                <td>{{ row.content }}</td>
                <td>
                  <div class="double-line-cell">
                    <div>{{ row.code }}</div>
                    <div class="sub-line">{{ row.shop }}</div>
                  </div>
                </td>
                <td>{{ row.module }}</td>
                <td>{{ row.reason }}</td>
                <td>{{ row.deadline }}</td>
                <td>{{ row.remain }}</td>
                <td><span class="status-chip" :class="row.levelClass">{{ row.level }}</span></td>
                <td>{{ row.action }}</td>
                <td><span class="status-chip" :class="row.statusClass">{{ row.status }}</span></td>
                <td>
                  <div class="table-actions">
                    <button class="btn-link">查看</button>
                    <button class="btn-link">处理</button>
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
          <div class="side-card-head"><h3>提醒概览</h3></div>
          <div class="donut-wrap small-gap">
            <div class="donut-chart reminder-donut"><span>{{ allReminders.length }}</span></div>
            <div class="donut-legend">
              <div class="donut-legend-item" v-for="item in overview" :key="item.label">
                <span class="dot" :style="{ background: item.color }"></span>
                <span>{{ item.label }}</span>
                <strong>{{ item.count }}</strong>
              </div>
            </div>
          </div>
        </div>
        <div class="side-card">
          <div class="side-card-head"><h3>今日必须处理（{{ todayList.length }}）</h3><button class="btn-link">查看全部</button></div>
          <div class="stack-list">
            <div class="stack-item" v-for="item in todayList" :key="item.text">
              <div>{{ item.text }}</div>
              <div class="sub-line">{{ item.code }}</div>
            </div>
          </div>
        </div>
        <div class="side-card">
          <div class="side-card-head"><h3>本周临期（{{ weekList.length }}）</h3><button class="btn-link">查看全部</button></div>
          <div class="stack-list">
            <div class="stack-item" v-for="item in weekList" :key="item.text">
              <div>{{ item.text }}</div>
              <div class="sub-line">{{ item.code }}</div>
            </div>
          </div>
        </div>
        <div class="side-card">
          <div class="side-card-head"><h3>长期未处理（{{ longList.length }}）</h3><button class="btn-link">查看全部</button></div>
          <div class="stack-list">
            <div class="stack-item" v-for="item in longList" :key="item.text">
              <div>{{ item.text }}</div>
              <div class="sub-line">{{ item.code }}</div>
            </div>
          </div>
        </div>
        <div class="side-card">
          <div class="side-card-head"><h3>快捷操作</h3></div>
          <div class="quick-actions-grid three-col">
            <button class="btn-secondary small-action" @click="() => { if (openAINextStepDrawer) openAINextStepDrawer({ source: 'reminders', caseNumber: 'REMINDER-CENTER', status: '提醒中心待处理', originalResult: '全局提醒汇总', resultDate: '今日', currentReliefStatus: '待人工判断', relatedPathCount: 6, deadlineRisk: '今日有 3 条必须处理提醒，请先人工确认后再生成草稿。', priorityActions: ['准备行政复议', '建议优先级：高'], basis: ['已登记不利处理结果', '当前仍在可救济期限内', '建议优先准备复议材料'] }); else console.warn('openAINextStepDrawer not provided') }">AI分析下一步</button>
            <button class="btn-secondary small-action">生成复议材料</button>
            <button class="btn-secondary small-action">催告 / 信息公开</button>
            <button class="btn-secondary small-action">上传签收截图</button>
            <button class="btn-secondary small-action">上级监督建议</button>
            <button class="btn-secondary small-action">批量标记处理</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, ref, computed } from 'vue'
import { useCaseStore } from '@/stores/case'
import dayjs from 'dayjs'

const store = useCaseStore()
const openAINextStepDrawer = inject('openAINextStepDrawer', null)
const activeCat = ref('all')

const UNFAVORABLE = ['rejected', 'not_accepted', 'not_punished', 'exempted', 'mediation_terminated']

// 生成所有真实提醒
const allReminders = computed(() => {
  const result = []
  store.cases.forEach(c => {
    // 1. 复议期限提醒
    if (c.reportResultStatus && UNFAVORABLE.includes(c.reportResultStatus) && c.reportResultDate) {
      const daysSince = dayjs().diff(dayjs(c.reportResultDate), 'day')
      const daysLeft = 60 - daysSince
      const deadline = dayjs(c.reportResultDate).add(60, 'day').format('YYYY-MM-DD')
      if (daysLeft > 0) {
        let level = '低', levelClass = 'badge-blue'
        if (daysLeft <= 7) { level = '高'; levelClass = 'badge-red' }
        else if (daysLeft <= 15) { level = '中'; levelClass = 'badge-orange' }
        result.push({
          id: `${c.id}-review`, content: `复议期限剩余 ${daysLeft} 天`,
          code: c.caseNumber || '待生成', shop: c.shopName || '-',
          module: '机关答复', reason: `不予 ${c.reportResultStatus} 后未提交复议`,
          deadline, remain: `${daysLeft}天`, level, levelClass,
          action: '准备复议材料', status: '待处理', statusClass: 'badge-orange',
          cat: 'review',
        })
      } else {
        result.push({
          id: `${c.id}-overdue`, content: `复议期限已超期 ${Math.abs(daysLeft)} 天`,
          code: c.caseNumber || '待生成', shop: c.shopName || '-',
          module: '机关答复', reason: `复议期限已届满未行动`,
          deadline, remain: `已超期${Math.abs(daysLeft)}天`, level: '高', levelClass: 'badge-red',
          action: '建立救济记录', status: '待处理', statusClass: 'badge-orange',
          cat: 'review',
        })
      }
    }
    // 2. 签收未答复
    if (c.signDate && !c.reportResultStatus) {
      const daysSince = dayjs().diff(dayjs(c.signDate), 'day')
      let level = '低', levelClass = 'badge-blue'
      if (daysSince >= 21) { level = '高'; levelClass = 'badge-red' }
      else if (daysSince >= 15) { level = '中'; levelClass = 'badge-orange' }
      result.push({
        id: `${c.id}-sign`, content: `已签收 ${daysSince} 天未登记答复`,
        code: c.caseNumber || '待生成', shop: c.shopName || '-',
        module: '邮寄台账', reason: '已签收但无答复记录',
        deadline: '-', remain: daysSince >= 21 ? `已超期${daysSince - 21}天` : `${daysSince}天`,
        level, levelClass, action: '催告 / 信息公开', status: '待处理', statusClass: 'badge-orange',
        cat: 'mail',
      })
    }
    // 3. 材料缺失
    const missing = []
    if (!c.caseNumber) missing.push('案件编号')
    if (!c.shopName) missing.push('店铺')
    if (!c.productName) missing.push('商品')
    if (!c.jurisdiction) missing.push('管辖局')
    if (!c.expense && !c.productPrice) missing.push('金额')
    if (!c.trackingNumber && !c.mailTrackingNo) missing.push('快递单号')
    if (!c.signDate) missing.push('签收日期')
    if (missing.length > 0) {
      result.push({
        id: `${c.id}-material`, content: `缺少 ${missing.slice(0, 2).join('、')} 等`,
        code: c.caseNumber || '待生成', shop: c.shopName || '-',
        module: '证据库', reason: missing.join('、'),
        deadline: '-', remain: '-', level: '中', levelClass: 'badge-orange',
        action: '补充材料', status: '待补材料', statusClass: 'badge-blue',
        cat: 'material',
      })
    }
    // 4. 邮寄异常
    if ((c.trackingNumber || c.mailTrackingNo) && !c.signDate) {
      const daysSince = c.submitDate ? dayjs().diff(dayjs(c.submitDate), 'day') : 0
      if (daysSince >= 5) {
        result.push({
          id: `${c.id}-mailerror`, content: `寄出 ${daysSince} 天未签收`,
          code: c.caseNumber || '待生成', shop: c.shopName || '-',
          module: '邮寄台账', reason: '长期无签收记录',
          deadline: '-', remain: '-', level: '中', levelClass: 'badge-orange',
          action: '跟踪物流', status: '待处理', statusClass: 'badge-orange',
          cat: 'mailError',
        })
      }
    }
    // 5. 机关答复
    if (c.reportResultStatus) {
      result.push({
        id: `${c.id}-response`, content: `已有答复结果：${c.reportResultStatus}`,
        code: c.caseNumber || '待生成', shop: c.shopName || '-',
        module: '机关答复', reason: '答复结果待跟进',
        deadline: c.reportResultDate || '-', remain: '-', level: '低', levelClass: 'badge-blue',
        action: '登记答复结果', status: '待处理', statusClass: 'badge-orange',
        cat: 'response',
      })
    }
  })
  return result
})

// 分类 tab
const categoryTabs = computed(() => [
  { key: 'all', label: '全部', count: allReminders.value.length },
  { key: 'review', label: '复议期限', count: allReminders.value.filter(r => r.cat === 'review').length },
  { key: 'mail', label: '签收未答复', count: allReminders.value.filter(r => r.cat === 'mail').length },
  { key: 'material', label: '材料缺失', count: allReminders.value.filter(r => r.cat === 'material').length },
  { key: 'mailError', label: '邮寄异常', count: allReminders.value.filter(r => r.cat === 'mailError').length },
  { key: 'response', label: '机关答复', count: allReminders.value.filter(r => r.cat === 'response').length },
  { key: 'relief', label: '救济监督', count: allReminders.value.filter(r => r.cat === 'review').length },
  { key: 'finance', label: '收支异常', count: 0 },
])

// 统计卡
const statCards = computed(() => {
  const today = dayjs().format('YYYY-MM-DD')
  const all = allReminders.value
  const todayCount = all.filter(r => r.deadline === today).length
  const weekCount = all.filter(r => {
    if (!r.deadline || r.deadline === '-') return false
    const d = dayjs(r.deadline)
    const diff = d.diff(dayjs(), 'day')
    return diff >= 0 && diff <= 7
  }).length
  const overdueCount = all.filter(r => r.remain && r.remain.startsWith('已超期')).length
  return [
    { label: '全部提醒', value: all.length, icon: '📋', bg: '#e8f2ff', color: '#1677ff' },
    { label: '今日到期', value: todayCount, icon: '📅', bg: '#fef2f2', color: '#ef4444' },
    { label: '7日内到期', value: weekCount, icon: '⏳', bg: '#fff7ed', color: '#f59e0b' },
    { label: '已超期', value: overdueCount, icon: '🚨', bg: '#fef2f2', color: '#ef4444' },
    { label: '已处理', value: 0, icon: '✅', bg: '#ecfdf5', color: '#10b981' },
  ]
})

// 提醒列表
const reminderRows = computed(() => {
  if (activeCat.value === 'all') return allReminders.value
  return allReminders.value.filter(r => r.cat === activeCat.value)
})

// 右侧栏概览
const overview = computed(() => {
  const all = allReminders.value
  return [
    { label: '复议期限', count: all.filter(r => r.cat === 'review').length, color: '#ef4444' },
    { label: '签收未答复', count: all.filter(r => r.cat === 'mail').length, color: '#1677ff' },
    { label: '材料缺失', count: all.filter(r => r.cat === 'material').length, color: '#f59e0b' },
    { label: '邮寄异常', count: all.filter(r => r.cat === 'mailError').length, color: '#8b5cf6' },
    { label: '机关答复', count: all.filter(r => r.cat === 'response').length, color: '#10b981' },
  ].filter(o => o.count > 0)
})

const todayList = computed(() => {
  const today = dayjs().format('YYYY-MM-DD')
  return allReminders.value
    .filter(r => r.deadline === today)
    .slice(0, 3)
    .map(r => ({ text: r.content, code: r.code }))
})

const weekList = computed(() => {
  return allReminders.value
    .filter(r => {
      if (!r.deadline || r.deadline === '-') return false
      const d = dayjs(r.deadline)
      const diff = d.diff(dayjs(), 'day')
      return diff >= 0 && diff <= 7
    })
    .slice(0, 5)
    .map(r => ({ text: r.content, code: r.code }))
})

const longList = computed(() => {
  return allReminders.value
    .filter(r => r.remain && r.remain.startsWith('已超期'))
    .slice(0, 5)
    .map(r => ({ text: r.content, code: r.code }))
})
</script>
