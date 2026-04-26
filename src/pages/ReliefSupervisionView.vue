<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <h1 class="page-title">救济监督</h1>
        <p class="page-desc">记录行政复议、行政诉讼等救济途径的进展与结果，确保每个案件都有完整的法律救济链条。</p>
      </div>
    </div>

    <!-- 6张统计卡 -->
    <div class="stat6-grid sm">
      <div class="stat-card sm" v-for="s in statCards" :key="s.label">
        <div class="stat-icon sm" :style="{ background: s.bg }">{{ s.icon }}</div>
        <div class="stat-body">
          <div class="stat-label">{{ s.label }}</div>
          <div class="stat-value">{{ s.value }}</div>
        </div>
      </div>
    </div>

    <!-- 视图切换 -->
    <div class="view-toggle">
      <button class="toggle-btn" :class="viewMode === 'record' ? 'active' : ''" @click="viewMode = 'record'">按救济记录</button>
      <button class="toggle-btn" :class="viewMode === 'case' ? 'active' : ''" @click="viewMode = 'case'">按案件聚合</button>
    </div>

    <!-- 快捷筛选 -->
    <div class="filter-bar">
      <button v-for="f in quickFilters" :key="f" class="quick-filter-btn" :class="active === f ? 'active' : ''" @click="active = f">{{ f }}</button>
    </div>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <button class="btn-primary">新建救济记录</button>
      <button class="btn-secondary">批量导出</button>
      <div class="action-bar-right">
        <input placeholder="搜索案件/机关/内容" class="filter-input" style="width:200px" />
        <button class="btn-primary">搜索</button>
      </div>
    </div>

    <!-- 救济记录表 -->
    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th><input type="checkbox" /></th>
            <th>案件编号</th><th>救济类型</th><th>受理机关</th><th>申请日期</th><th>当前状态</th><th>结果</th><th>期限</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr><td colspan="9" class="empty-cell">暂无救济记录</td></tr>
        </tbody>
      </table>
    </div>

    <!-- 右侧栏 -->
    <div class="right-sidebar">
      <div class="side-card">
        <h3>风险提示</h3>
        <div class="reminder-list">
          <div class="reminder-item" v-for="r in risks" :key="r.label">
            <div class="reminder-dot" :style="{ background: r.color }"></div>
            <div class="reminder-body">
              <div class="reminder-label">{{ r.label }}</div>
              <div class="reminder-sub">{{ r.sub }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const viewMode = ref('record')
const active = ref('全部')
const quickFilters = ['全部', '复议中', '诉讼中', '已完成', '超期限', '建议启动']
const statCards = [
  { label: '累计记录', value: 24, icon: '📋', bg: '#e8f2ff' },
  { label: '复议中', value: 5, icon: '⚖️', bg: '#f5f3ff' },
  { label: '诉讼中', value: 2, icon: '🏛️', bg: '#fff7ed' },
  { label: '已完成', value: 12, icon: '✅', bg: '#ecfdf5' },
  { label: '超期限', value: 3, icon: '⚠️', bg: '#fef2f2' },
  { label: '建议启动', value: 2, icon: '💡', bg: '#fef3c7' },
]
const risks = [
  { label: '复议超期风险', sub: '3件复议期限不足15天', color: '#ef4444' },
  { label: '诉讼临期提醒', sub: '2件诉讼时效不足30天', color: '#f59e0b' },
  { label: '材料缺失', sub: '2件缺少关键证据材料', color: '#8b5cf6' },
]
</script>
