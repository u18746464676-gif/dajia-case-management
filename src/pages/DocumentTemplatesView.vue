<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <h1 class="page-title">文书生成中心</h1>
        <p class="page-desc">根据案件信息自动生成投诉书、复议申请书等法律文书，支持在线编辑与导出。</p>
      </div>
    </div>

    <!-- 顶部统计卡 -->
    <div class="stat4-grid">
      <div class="stat-card sm" v-for="s in statCards" :key="s.label">
        <div class="stat-icon sm" :style="{ background: s.bg }">{{ s.icon }}</div>
        <div class="stat-body">
          <div class="stat-label">{{ s.label }}</div>
          <div class="stat-value">{{ s.value }}</div>
        </div>
      </div>
    </div>

    <!-- 分类页签 -->
    <div class="page-tabs">
      <button v-for="t in tabs" :key="t" class="page-tab" :class="activeTab === t ? 'active' : ''" @click="activeTab = t">{{ t }}</button>
    </div>

    <!-- 筛选区 -->
    <div class="filter-card compact">
      <div class="filter-row">
        <select class="filter-select"><option>全部分类</option></select>
        <input placeholder="搜索模板名称" class="filter-input flex-1" />
        <button class="btn-secondary">重置</button>
        <button class="btn-primary">筛选</button>
      </div>
    </div>

    <!-- 模板卡片两列 + 右侧详情 -->
    <div class="template-layout">
      <div class="template-grid">
        <div class="template-card" v-for="t in templates" :key="t.name" :class="selected === t.name ? 'selected' : ''" @click="selected = t.name">
          <div class="tpl-icon">{{ t.icon }}</div>
          <div class="tpl-name">{{ t.name }}</div>
          <div class="tpl-desc">{{ t.desc }}</div>
          <div class="tpl-meta">已使用 {{ t.used }} 次</div>
        </div>
      </div>
      <div class="tpl-detail-card">
        <h3>{{ selected || '请选择模板' }}</h3>
        <p v-if="selected">{{ selectedDesc }}</p>
        <p v-else class="empty-hint">点击左侧模板卡片查看详情</p>
        <div class="tpl-actions">
          <button class="btn-primary" :disabled="!selected">选择案件生成</button>
          <button class="btn-secondary" :disabled="!selected">预览</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const activeTab = ref('全部')
const selected = ref(null)
const tabs = ['全部', '投诉类', '复议类', '诉讼类', '信息公开类']
const statCards = [
  { label: '可用模板', value: 24, icon: '📄', bg: '#e8f2ff' },
  { label: '本月生成', value: 18, icon: '🆕', bg: '#f5f3ff' },
  { label: '累计生成', value: 186, icon: '✅', bg: '#ecfdf5' },
  { label: '本周使用', value: 9, icon: '📅', bg: '#fff7ed' },
]
const templates = [
  { name: '投诉举报信', icon: '📝', desc: '向行政机关提交投诉举报的标准格式文书', used: 86 },
  { name: '行政复议申请书', icon: '⚖️', desc: '针对行政行为申请行政复议的标准格式', used: 42 },
  { name: '政府信息公开申请', icon: '🔍', desc: '申请政府公开相关信息的标准格式文书', used: 28 },
  { name: '证据目录清单', icon: '📋', desc: '整理案件证据材料的标准目录清单', used: 35 },
  { name: '邮寄材料清单', icon: '📦', desc: '记录邮寄给机关的材料明细清单', used: 19 },
  { name: '跟进记录表', icon: '📊', desc: '记录案件跟进过程的标准跟进记录表', used: 54 },
]
const selectedDesc = templates.find(t => t.name === selected.value)?.desc || ''
</script>
