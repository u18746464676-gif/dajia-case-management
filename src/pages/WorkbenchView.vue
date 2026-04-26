<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <h1 class="page-title">案件处置工作台</h1>
        <p class="page-sub">循证留痕，依法跟进</p>
        <p class="page-desc">集中记录购买事实、投诉举报、邮寄签收、机关答复、救济监督和费用收益，帮助维权案件形成完整证据链与跟进链。</p>
      </div>
    </div>

    <!-- 6张统计卡 -->
    <div class="stat6-grid">
      <div class="stat-card" v-for="c in statCards" :key="c.label">
        <div class="stat-icon" :style="{ background: c.iconBg }">
          <span v-html="c.icon"></span>
        </div>
        <div class="stat-body">
          <div class="stat-label">{{ c.label }}</div>
          <div class="stat-value">{{ c.value }}</div>
          <div class="stat-change" :class="c.change.indexOf('+') === 0 ? 'up' : 'down'">{{ c.change }}</div>
        </div>
      </div>
    </div>

    <!-- 快捷筛选条 -->
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

    <!-- 筛选工具栏 -->
    <div class="toolbar-card">
      <select class="toolbar-select"><option>全部年份</option><option>2026</option><option>2025</option></select>
      <select class="toolbar-select"><option>全部月份</option><option>01</option><option>02</option></select>
      <select class="toolbar-select"><option>全部进度</option><option>待整理</option><option>已寄出</option><option>已签收</option></select>
      <select class="toolbar-select"><option>全部类型</option><option>投诉</option><option>举报</option></select>
      <div class="toolbar-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input placeholder="搜索店铺/商品/案件编号/内容" />
      </div>
      <button class="btn-reset">重置</button>
    </div>

    <!-- 待跟进案件 -->
    <div class="table-card">
      <div class="table-head">
        <div>
          <h2>待跟进案件</h2>
          <p>优先展示需要继续操作的案件，按照期限紧急程度和材料缺口综合排序。</p>
        </div>
        <button class="btn-ghost">刷新</button>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>案件编号</th><th>店铺 / 商家</th><th>商品 / 事项</th><th>当前进度</th><th>结果/签收日期</th><th>期限提醒</th><th>我方下一步</th><th>金额(元)</th><th>更新时间</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colspan="10" class="empty-cell">暂无待跟进案件</td>
          </tr>
        </tbody>
      </table>
      <div class="table-foot">
        <span>共 <strong>0</strong> 条</span>
        <span>第 1 页</span>
      </div>
    </div>

    <!-- 右侧跟进栏 -->
    <div class="right-sidebar">
      <div class="side-card">
        <div class="side-card-head">
          <h3>跟进提醒</h3>
          <button class="btn-link">更多 &gt;</button>
        </div>
        <div class="reminder-list">
          <div class="reminder-item" v-for="r in reminders" :key="r.label">
            <div class="reminder-dot" :style="{ background: r.color }"></div>
            <div class="reminder-body">
              <div class="reminder-label">{{ r.label }}</div>
              <div class="reminder-sub">{{ r.sub }}</div>
            </div>
            <div class="reminder-badge" v-if="r.count">{{ r.count }}</div>
          </div>
        </div>
      </div>
      <div class="side-card">
        <div class="side-card-head">
          <h3>费用收益概览（本月）</h3>
        </div>
        <div class="fee-grid">
          <div class="fee-item" v-for="f in feeStats" :key="f.label">
            <div class="fee-label">{{ f.label }}</div>
            <div class="fee-value">{{ f.value }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const statCards = [
  { label: '案件总数', value: 128, change: '较上月 +18', icon: '📁', iconBg: '#e8f2ff' },
  { label: '待整理', value: 12, change: '较上月 -3', icon: '📋', iconBg: '#f5f3ff' },
  { label: '已寄出', value: 35, change: '较上月 +6', icon: '📦', iconBg: '#ecfdf5' },
  { label: '等待答复', value: 26, change: '较上月 +4', icon: '⏳', iconBg: '#fff7ed' },
  { label: '可复议', value: 9, change: '较上月 +2', icon: '⚖️', iconBg: '#fef2f2' },
  { label: '临期提醒', value: 7, change: '较上月 +1', icon: '🔔', iconBg: '#fffde7' },
]

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

const reminders = [
  { label: '复议临期提醒', sub: '3件案件复议期限不足7天', count: 3, color: '#ef4444' },
  { label: '已签收未答复', sub: '6件案件已签收超过15个工作日', count: 6, color: '#f59e0b' },
  { label: '缺少关键材料', sub: '4件案件缺少截图或检测报告', count: 4, color: '#8b5cf6' },
  { label: '未登记答复结果', sub: '5件案件未登记机关答复', count: 5, color: '#f59e0b' },
  { label: '建议信息公开', sub: '1件案件建议申请信息公开', count: 1, color: '#1677ff' },
]

const feeStats = [
  { label: '本月购买金额', value: '¥2,480' },
  { label: '本月赔付金额', value: '¥8,200' },
  { label: '本月净收益', value: '¥5,720' },
  { label: '本月新增案件', value: '12' },
]
</script>
