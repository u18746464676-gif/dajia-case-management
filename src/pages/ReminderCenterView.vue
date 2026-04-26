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
              <tr v-for="row in reminderRows" :key="row.content">
                <td>{{ row.content }}</td>
                <td>{{ row.caseInfo }}</td>
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
            <div class="donut-chart reminder-donut"><span>56</span></div>
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
          <div class="side-card-head"><h3>今日必须处理（3）</h3><button class="btn-link">查看全部</button></div>
          <div class="stack-list">
            <div class="stack-item" v-for="item in todayList" :key="item.text">
              <div>{{ item.text }}</div>
              <div class="sub-line">{{ item.code }}</div>
            </div>
          </div>
        </div>
        <div class="side-card">
          <div class="side-card-head"><h3>本周临期（8）</h3><button class="btn-link">查看全部</button></div>
          <div class="stack-list">
            <div class="stack-item" v-for="item in weekList" :key="item.text">
              <div>{{ item.text }}</div>
              <div class="sub-line">{{ item.code }}</div>
            </div>
          </div>
        </div>
        <div class="side-card">
          <div class="side-card-head"><h3>长期未处理（5）</h3><button class="btn-link">查看全部</button></div>
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
import { inject, ref } from 'vue'
const openAINextStepDrawer = inject('openAINextStepDrawer', null)
const activeCat = ref('all')
const categoryTabs = [
  { key: 'all', label: '全部', count: 56 },
  { key: 'review', label: '复议期限', count: 8 },
  { key: 'mail', label: '签收未答复', count: 12 },
  { key: 'material', label: '材料缺失', count: 9 },
  { key: 'mailError', label: '邮寄异常', count: 5 },
  { key: 'response', label: '机关答复', count: 7 },
  { key: 'relief', label: '救济监督', count: 10 },
  { key: 'finance', label: '收支异常', count: 5 },
]
const statCards = [
  { label: '全部提醒', value: 56, icon: '📋', bg: '#e8f2ff', color: '#1677ff' },
  { label: '今日到期', value: 3, icon: '📅', bg: '#fef2f2', color: '#ef4444' },
  { label: '7日内到期', value: 8, icon: '⏳', bg: '#fff7ed', color: '#f59e0b' },
  { label: '已超期', value: 12, icon: '🚨', bg: '#fef2f2', color: '#ef4444' },
  { label: '已处理', value: 33, icon: '✅', bg: '#ecfdf5', color: '#10b981' },
]
const reminderRows = [
  { content: '复议期限剩余 3 天', caseInfo: 'AJ202604230018 / 1989潮牌鞋服集合店', module: '救济监督', reason: '不予立案后未提交复议', deadline: '2026-05-17', remain: '3天', level: '高', levelClass: 'badge-red', action: '准备复议材料', status: '待处理', statusClass: 'badge-orange' },
  { content: '签收 31 天未登记答复', caseInfo: 'AJ202604150007 / 母婴之家旗舰店', module: '邮寄台账', reason: '已签收但无答复记录', deadline: '-', remain: '已超期24天', level: '高', levelClass: 'badge-red', action: '催告 / 信息公开', status: '待处理', statusClass: 'badge-orange' },
  { content: '缺少关键证据截图', caseInfo: 'AJ202604180009 / 家居生活馆', module: '证据库', reason: '材料完整度不足', deadline: '-', remain: '-', level: '中', levelClass: 'badge-orange', action: '上传签收截图', status: '待补材料', statusClass: 'badge-blue' },
]
const overview = [
  { label: '复议期限', count: 8, color: '#ef4444' },
  { label: '签收未答复', count: 12, color: '#1677ff' },
  { label: '材料缺失', count: 9, color: '#f59e0b' },
  { label: '邮寄异常', count: 5, color: '#8b5cf6' },
  { label: '机关答复', count: 7, color: '#10b981' },
  { label: '救济监督', count: 10, color: '#06b6d4' },
  { label: '收支异常', count: 5, color: '#f97316' },
]
const todayList = [
  { text: '复议期限剩余 3 天', code: 'AJ202604230018' },
  { text: '短视频违规期限未登记', code: 'AJ202604010002' },
  { text: '已签收 31 天未登记答复', code: 'AJ202604150007' },
]
const weekList = [
  { text: '复议期限剩余 7 天', code: 'AJ202604220012' },
  { text: '信息公开申请记录待答复', code: 'AJ202604200015' },
  { text: '寄出 5 天未签收', code: 'AJ202604230021' },
]
const longList = [
  { text: '已签收 48 天未登记答复', code: 'AJ202603180003' },
  { text: '复议未处理超过 21 天', code: 'AJ202603010001' },
]
</script>
