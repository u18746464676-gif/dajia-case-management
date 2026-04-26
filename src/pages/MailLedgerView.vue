<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <h1 class="page-title">邮寄台账</h1>
        <p class="page-desc">记录所有投诉举报材料的邮寄签收情况，跟进各机关签收状态与时效。</p>
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

    <!-- 快捷筛选 -->
    <div class="filter-bar">
      <button v-for="f in quickFilters" :key="f" class="quick-filter-btn" :class="active === f ? 'active' : ''" @click="active = f">{{ f }}</button>
    </div>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <button class="btn-primary">新建邮寄记录</button>
      <button class="btn-secondary">批量导入</button>
      <button class="btn-secondary">批量导出</button>
      <div class="action-bar-right">
        <input placeholder="搜索收件单位/单号" class="filter-input" style="width:200px" />
        <button class="btn-primary">搜索</button>
      </div>
    </div>

    <!-- 邮寄记录表 -->
    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th><input type="checkbox" /></th>
            <th>快递单号</th><th>收件单位</th><th>收件地址</th><th>邮寄内容</th><th>邮寄日期</th><th>签收日期</th><th>当前状态</th><th>关联案件</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr><td colspan="10" class="empty-cell">暂无邮寄记录</td></tr>
        </tbody>
      </table>
    </div>

    <!-- 右侧栏 -->
    <div class="right-sidebar">
      <div class="side-card">
        <h3>签收提醒</h3>
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
        <h3>物流状态分布</h3>
        <div class="dist-list">
          <div class="dist-item" v-for="d in distribution" :key="d.label">
            <span class="dist-label">{{ d.label }}</span>
            <div class="dist-bar-bg"><div class="dist-bar-fill" :style="{ width: d.pct + '%', background: d.color }"></div></div>
            <span class="dist-count">{{ d.count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const active = ref('全部')
const quickFilters = ['全部', '待发出', '运输中', '已签收', '被退回', '超时未签收']
const statCards = [
  { label: '本月邮寄', value: 24, icon: '📦', bg: '#e8f2ff' },
  { label: '本月签收', value: 18, icon: '✅', bg: '#ecfdf5' },
  { label: '本月退回', value: 2, icon: '↩️', bg: '#fef2f2' },
  { label: '待签收', value: 6, icon: '⏳', bg: '#fff7ed' },
  { label: '超时未签', value: 3, icon: '⚠️', bg: '#fef3c7' },
]
const signReminders = [
  { label: '超15日未签收', sub: '3件记录需跟进', color: '#ef4444' },
  { label: '超7日未签收', sub: '5件记录需跟进', color: '#f59e0b' },
  { label: '本月新提交', sub: '6件等待签收', color: '#1677ff' },
]
const distribution = [
  { label: '已签收', count: 18, pct: 75, color: '#10b981' },
  { label: '运输中', count: 4, pct: 17, color: '#1677ff' },
  { label: '被退回', count: 2, pct: 8, color: '#ef4444' },
]
</script>
