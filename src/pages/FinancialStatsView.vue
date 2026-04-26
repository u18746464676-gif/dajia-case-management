<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <h1 class="page-title">收支统计</h1>
        <p class="page-desc">记录打假维权案件的收入、支出与净收益，支持按时间段、平台、店铺多维度分析。</p>
      </div>
    </div>

    <!-- 页签 -->
    <div class="page-tabs">
      <button v-for="t in tabs" :key="t" class="page-tab" :class="activeTab === t ? 'active' : ''" @click="activeTab = t">{{ t }}</button>
    </div>

    <!-- 累计统计6卡 -->
    <div class="stat6-grid sm">
      <div class="stat-card sm" v-for="s in statCards" :key="s.label">
        <div class="stat-icon sm" :style="{ background: s.bg }">{{ s.icon }}</div>
        <div class="stat-body">
          <div class="stat-label">{{ s.label }}</div>
          <div class="stat-value">{{ s.value }}</div>
        </div>
      </div>
    </div>

    <!-- 数据说明条 -->
    <div class="info-strip">
      <span class="info-icon">ℹ️</span>
      <span>统计数据基于已登记的赔付记录，不含未回款项。数据更新周期为每日凌晨。</span>
    </div>

    <!-- 收支明细表 -->
    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>日期</th><th>案件编号</th><th>店铺</th><th>平台</th><th>购买金额</th><th>赔付金额</th><th>净收益</th><th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr><td colspan="8" class="empty-cell">暂无收支记录</td></tr>
        </tbody>
      </table>
    </div>

    <!-- 右侧分析区 -->
    <div class="right-sidebar">
      <div class="side-card">
        <h3>平台分析</h3>
        <div class="dist-list">
          <div class="dist-item" v-for="d in platformDist" :key="d.label">
            <span class="dist-label">{{ d.label }}</span>
            <div class="dist-bar-bg"><div class="dist-bar-fill" :style="{ width: d.pct + '%', background: d.color }"></div></div>
            <span class="dist-count">{{ d.count }}</span>
          </div>
        </div>
      </div>
      <div class="side-card">
        <h3>机关处理效果</h3>
        <div class="reminder-list">
          <div class="reminder-item" v-for="r in govEffects" :key="r.label">
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
const activeTab = ref('收支概览')
const tabs = ['收支概览', '收支明细', '平台分析', '店铺分析']
const statCards = [
  { label: '累计购买金额', value: '¥28,460', icon: '💰', bg: '#e8f2ff' },
  { label: '累计赔付金额', value: '¥96,800', icon: '💵', bg: '#ecfdf5' },
  { label: '累计净收益', value: '¥68,340', icon: '📈', bg: '#f5f3ff' },
  { label: '本月净收益', value: '¥5,720', icon: '📅', bg: '#fff7ed' },
  { label: '进行中案件', value: 34, icon: '⏳', bg: '#fef3c7' },
  { label: '已回款案件', value: 82, icon: '✅', bg: '#ecfdf5' },
]
const platformDist = [
  { label: '拼多多', count: 48, pct: 60, color: '#1677ff' },
  { label: '淘宝', count: 22, pct: 28, color: '#f59e0b' },
  { label: '京东', count: 8, pct: 10, color: '#10b981' },
]
const govEffects = [
  { label: '复议维持原决定', sub: '2件，赔付到位', color: '#10b981' },
  { label: '机关调解成功', sub: '6件，平均赔付周期15天', color: '#1677ff' },
  { label: '平台直接赔付', sub: '12件，无需机关介入', color: '#8b5cf6' },
]
</script>
