<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <h1 class="page-title">提醒中心</h1>
        <p class="page-desc">集中展示所有案件的时间节点提醒，帮助你及时跟进，避免错过关键期限。</p>
      </div>
    </div>

    <!-- 5张统计卡 -->
    <div class="stat5-grid">
      <div class="stat-card sm" v-for="s in statCards" :key="s.label">
        <div class="stat-icon sm" :style="{ background: s.bg }">{{ s.icon }}</div>
        <div class="stat-body">
          <div class="stat-label">{{ s.label }}</div>
          <div class="stat-value">{{ s.value }}</div>
        </div>
      </div>
    </div>

    <!-- 分类Tab -->
    <div class="status-tab">
      <button v-for="t in categoryTabs" :key="t.key" class="status-tab-btn" :class="activeCat === t.key ? 'active' : ''" @click="activeCat = t.key">
        {{ t.label }} <span class="tab-count">{{ t.count }}</span>
      </button>
    </div>

    <!-- 筛选区 -->
    <div class="filter-card compact">
      <div class="filter-row">
        <select class="filter-select"><option>全部紧急度</option><option>紧急</option><option>一般</option></select>
        <select class="filter-select"><option>全部类型</option></select>
        <input type="date" class="filter-input date-input" />
        <input placeholder="搜索案件编号/店铺" class="filter-input flex-1" />
        <button class="btn-secondary">重置</button>
        <button class="btn-primary">筛选</button>
      </div>
    </div>

    <!-- 提醒列表 -->
    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th><input type="checkbox" /></th>
            <th>提醒类型</th><th>案件编号</th><th>店铺</th><th>商品</th><th>紧急度</th><th>到期日期</th><th>剩余天数</th><th>状态</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr><td colspan="10" class="empty-cell">暂无提醒记录</td></tr>
        </tbody>
      </table>
    </div>

    <!-- 右侧栏 -->
    <div class="right-sidebar">
      <div class="side-card">
        <h3>提醒概览</h3>
        <div class="reminder-list">
          <div class="reminder-item" v-for="r in overview" :key="r.label">
            <div class="reminder-dot" :style="{ background: r.color }"></div>
            <div class="reminder-body">
              <div class="reminder-label">{{ r.label }}</div>
              <div class="reminder-sub">{{ r.sub }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="side-card">
        <h3>今日必须处理</h3>
        <div class="action-list">
          <div class="action-item" v-for="a in todayActions" :key="a">{{ a }}</div>
        </div>
      </div>
      <div class="side-card">
        <h3>本周临期</h3>
        <div class="reminder-list">
          <div class="reminder-item" v-for="r in weekDue" :key="r.label">
            <div class="reminder-dot" :style="{ background: r.color }"></div>
            <div class="reminder-body">
              <div class="reminder-label">{{ r.label }}</div>
              <div class="reminder-sub">{{ r.sub }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="side-card">
        <h3>快捷操作</h3>
        <div class="quick-actions">
          <button class="btn-secondary w-full">全部标为已读</button>
          <button class="btn-secondary w-full">设置提醒规则</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const activeCat = ref('all')
const categoryTabs = [
  { key: 'all', label: '全部', count: 28 },
  { key: 'urgent', label: '紧急', count: 5 },
  { key: 'medium', label: '一般', count: 15 },
  { key: 'low', label: '低', count: 8 },
]
const statCards = [
  { label: '今日到期', value: 3, icon: '🔴', bg: '#fef2f2' },
  { label: '本周临期', value: 12, icon: '🟡', bg: '#fff7ed' },
  { label: '本月待办', value: 28, icon: '📋', bg: '#e8f2ff' },
  { label: '已处理', value: 86, icon: '✅', bg: '#ecfdf5' },
  { label: '长期未处理', value: 4, icon: '⚠️', bg: '#fef3c7' },
]
const overview = [
  { label: '复议临期', sub: '3件不足7天', color: '#ef4444' },
  { label: '答复超时', sub: '5件超过法定答复期', color: '#f59e0b' },
  { label: '材料待补', sub: '4件缺少关键证据', color: '#8b5cf6' },
]
const todayActions = ['跟进3件复议临期案件', '登记2件新答复结果', '补充1件材料缺失']
const weekDue = [
  { label: '复议临期', sub: '本周3件不足7天', color: '#ef4444' },
  { label: '邮寄超时', sub: '本周2件超过15天', color: '#f59e0b' },
]
</script>
