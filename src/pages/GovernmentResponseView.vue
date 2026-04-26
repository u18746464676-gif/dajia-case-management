<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <h1 class="page-title">机关答复</h1>
        <p class="page-desc">记录和跟进各政府机关对投诉举报事项的答复结果，作为下一步救济行动的重要依据。</p>
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

    <!-- 筛选区 -->
    <div class="filter-card compact">
      <div class="filter-row">
        <select class="filter-select"><option>全部年份</option><option>2026</option></select>
        <select class="filter-select"><option>全部机关</option></select>
        <select class="filter-select"><option>全部答复结果</option><option>受理</option><option>不受理</option><option>答复</option></select>
        <input placeholder="搜索案件/机关/内容" class="filter-input flex-1" />
        <button class="btn-secondary">重置</button>
        <button class="btn-primary">筛选</button>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <button class="btn-primary">登记答复结果</button>
      <button class="btn-secondary">批量导入</button>
      <button class="btn-secondary">批量导出</button>
      <div class="action-bar-right">
        <span class="sort-label">排序：</span>
        <select class="filter-select"><option>答复日期</option><option>登记日期</option></select>
      </div>
    </div>

    <!-- 答复记录表 -->
    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th><input type="checkbox" /></th>
            <th>案件编号</th><th>机关名称</th><th>机关级别</th><th>答复类型</th><th>答复结果</th><th>答复日期</th><th>登记日期</th><th>下一步</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr><td colspan="10" class="empty-cell">暂无答复记录</td></tr>
        </tbody>
      </table>
    </div>

    <!-- 右侧栏 -->
    <div class="right-sidebar">
      <div class="side-card">
        <h3>重要提醒</h3>
        <div class="reminder-list">
          <div class="reminder-item" v-for="r in reminders" :key="r.label">
            <div class="reminder-dot" :style="{ background: r.color }"></div>
            <div class="reminder-body">
              <div class="reminder-label">{{ r.label }}</div>
              <div class="reminder-sub">{{ r.sub }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="side-card">
        <h3>答复结果分布</h3>
        <div class="dist-list">
          <div class="dist-item" v-for="d in distribution" :key="d.label">
            <span class="dist-label">{{ d.label }}</span>
            <div class="dist-bar-bg"><div class="dist-bar-fill" :style="{ width: d.pct + '%', background: d.color }"></div></div>
            <span class="dist-count">{{ d.count }}</span>
          </div>
        </div>
      </div>
      <div class="side-card">
        <h3>快捷操作</h3>
        <div class="quick-actions">
          <button class="btn-secondary w-full">登记新答复</button>
          <button class="btn-secondary w-full">跟进超时答复</button>
          <button class="btn-secondary w-full">准备复议材料</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const statCards = [
  { label: '累计答复', value: 86, icon: '📋', bg: '#e8f2ff' },
  { label: '本月新增', value: 12, icon: '🆕', bg: '#f5f3ff' },
  { label: '受理', value: 34, icon: '✅', bg: '#ecfdf5' },
  { label: '不受理', value: 18, icon: '❌', bg: '#fef2f2' },
  { label: '答复中', value: 22, icon: '⏳', bg: '#fff7ed' },
  { label: '超时未答复', value: 6, icon: '⚠️', bg: '#fef3c7' },
]
const reminders = [
  { label: '超时未答复', sub: '6件超过法定期限', color: '#ef4444' },
  { label: '临期提醒', sub: '3件答复期限不足7天', color: '#f59e0b' },
  { label: '建议复议', sub: '4件不受理可考虑复议', color: '#8b5cf6' },
]
const distribution = [
  { label: '受理', count: 34, pct: 40, color: '#10b981' },
  { label: '不受理', count: 18, pct: 21, color: '#ef4444' },
  { label: '答复中', count: 22, pct: 26, color: '#f59e0b' },
  { label: '超时', count: 6, pct: 7, color: '#8b5cf6' },
]
</script>
