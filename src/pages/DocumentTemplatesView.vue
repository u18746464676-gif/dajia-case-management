<template>
  <div class="page-shell">
    <div class="page-header page-header-row">
      <div>
        <h1 class="page-title">文书生成中心</h1>
        <p class="page-desc">基于案件数据和证据材料，自动生成各类法律文书。</p>
      </div>
      <div class="header-actions">
        <button class="btn-secondary">使用说明</button>
        <button class="btn-secondary">模板管理</button>
        <button class="btn-secondary">生成记录</button>
      </div>
    </div>

    <div class="template-stat-grid">
      <div class="stat-card sm" v-for="s in statCards" :key="s.label">
        <div class="stat-icon sm" :style="{ background: s.bg, color: s.color }">{{ s.icon }}</div>
        <div class="stat-body">
          <div class="stat-label">{{ s.label }}</div>
          <div class="stat-value">{{ s.value }}</div>
          <div v-if="s.sub" class="stat-change">{{ s.sub }}</div>
        </div>
      </div>
    </div>

    <div class="page-tabs">
      <button v-for="t in tabs" :key="t" class="page-tab" :class="activeTab === t ? 'active' : ''" @click="activeTab = t">{{ t }}</button>
    </div>

    <div class="filter-card compact">
      <div class="filter-row">
        <select class="filter-select"><option>模板类型</option></select>
        <select class="filter-select"><option>适用阶段</option></select>
        <select class="filter-select"><option>适用机关</option></select>
        <select class="filter-select"><option>是否支持AI生成</option></select>
        <input placeholder="搜索模板名称 / 关键词" class="filter-input flex-1" />
      </div>
    </div>

    <div class="template-layout large-detail-layout">
      <div class="template-grid two-col-template-grid">
        <div class="template-card rich-template-card" v-for="t in templates" :key="t.name" :class="selected === t.name ? 'selected' : ''" @click="selected = t.name">
          <div class="template-card-top">
            <div class="tpl-icon colored-icon" :style="{ background: t.iconBg, color: t.iconColor }">{{ t.icon }}</div>
            <span class="status-chip" :class="t.badgeClass">{{ t.badge }}</span>
          </div>
          <div class="tpl-name">{{ t.name }}</div>
          <div class="tpl-line"><strong>适用：</strong>{{ t.scene }}</div>
          <div class="tpl-line"><strong>所需材料：</strong>{{ t.materials }}</div>
          <div class="tpl-foot-meta">生成次数：{{ t.used }}次　最近使用：{{ t.lastUsed }}</div>
          <div class="tpl-card-actions">
            <button class="btn-secondary">预览模板</button>
            <button class="btn-primary">选择案件生成</button>
          </div>
        </div>
      </div>

      <div class="tpl-detail-card detail-sidebar-320">
        <div class="side-card-head detail-head">
          <h3>{{ currentTemplate.name }}</h3>
          <span class="status-chip" :class="currentTemplate.badgeClass">{{ currentTemplate.badge }}</span>
        </div>
        <div class="detail-section">
          <div class="detail-label">适用场景</div>
          <div class="detail-text">{{ currentTemplate.scene }}</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">所需案件字段</div>
          <div class="detail-text">案件编号、当事人信息、店铺/商家名称、商品/事项、平台来源、答复日期、答复结果</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">所需证据材料</div>
          <div class="detail-text">{{ currentTemplate.materials }}</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">AI生成能力</div>
          <div class="detail-text">自动提取案件事实和时间线，生成复议请求和事实理由框架，支持导出Word/PDF草稿。</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">风险提示</div>
          <div class="detail-text">AI仅生成草稿和待确认记录，不会自动提交任何文书。请人工核对事实、期限和证据材料。</div>
        </div>
        <div class="tpl-actions vertical-actions">
          <button class="btn-secondary">预览模板</button>
          <button class="btn-secondary" @click="() => { if (openAINextStepDrawer) openAINextStepDrawer({ source: 'templates', caseNumber: 'AJ202604230018', status: currentTemplate.name, originalResult: '文书生成准备', resultDate: currentTemplate.lastUsed, currentReliefStatus: '待选择案件', relatedPathCount: 3, deadlineRisk: '文书生成前请人工核对案件事实、期限和证据完整度。', priorityActions: ['准备行政复议', '建议优先级：高'], basis: ['已登记不利处理结果', '当前仍在可救济期限内', '建议优先准备复议材料'] }); else console.warn('openAINextStepDrawer not provided') }">AI分析下一步</button>
          <button class="btn-primary">选择案件生成</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, ref } from 'vue'
const openAINextStepDrawer = inject('openAINextStepDrawer', null)
const activeTab = ref('全部')
const selected = ref('行政复议申请书')
const tabs = ['全部', '投诉举报', '信息公开', '行政复议', '监督督办', '纪检监察', '人大信访', '行政诉讼', '归档材料']
const statCards = [
  { label: '全部模板', value: 68, icon: '📁', bg: '#e8f2ff', color: '#1677ff' },
  { label: '常用模板', value: 18, icon: '⭐', bg: '#fdf2f8', color: '#ec4899' },
  { label: '已生成文书', value: 126, icon: '📄', bg: '#f5f3ff', color: '#8b5cf6' },
  { label: '草稿箱', value: 32, icon: '📝', bg: '#ecfdf5', color: '#10b981' },
  { label: '最近使用', value: '行政复议申请书', sub: '2026-04-24 15:30', icon: '🕘', bg: '#eff6ff', color: '#2563eb' },
]
const templates = [
  { name: '行政复议申请书', icon: '📘', iconBg: '#e8f2ff', iconColor: '#1677ff', badge: '行政复议', badgeClass: 'badge-blue', scene: '收到不予立案、不予受理、违法事实不成立等不利结果后，在法定期限内申请行政复议。', materials: '原举报截图、购买凭证、商品宣传截图、邮寄签收、答复文书', used: 28, lastUsed: '2026-04-24' },
  { name: '政府信息公开申请书', icon: '🔓', iconBg: '#ecfdf5', iconColor: '#10b981', badge: '信息公开', badgeClass: 'badge-green', scene: '申请公开行政机关处理过程信息、受理依据、调查结果等。', materials: '案件基本信息、处理机关、申请公开具体内容', used: 36, lastUsed: '2026-04-23' },
  { name: '投诉举报书（通用版）', icon: '🧾', iconBg: '#fff7ed', iconColor: '#f59e0b', badge: '投诉举报', badgeClass: 'badge-orange', scene: '对经营者违法行为向市场监管部门进行投诉或举报。', materials: '商品信息、违法事实、证据材料、诉求等', used: 52, lastUsed: '2026-04-22' },
  { name: '履职催告函', icon: '✉️', iconBg: '#f5f3ff', iconColor: '#8b5cf6', badge: '监督督办', badgeClass: 'badge-purple', scene: '机关答复后长期未答复或未处理，要求依法履行法定职责。', materials: '签收记录、时间线、未处理事实等', used: 19, lastUsed: '2026-04-21' },
  { name: '行政诉讼起诉状（草稿）', icon: '⚖️', iconBg: '#fdf2f8', iconColor: '#ec4899', badge: '行政诉讼', badgeClass: 'badge-red', scene: '对复议决定不服，向人民法院提起行政诉讼。', materials: '复议决定书、证据材料、事实经过', used: 15, lastUsed: '2026-04-18' },
  { name: '人大信访材料', icon: '📙', iconBg: '#fef3c7', iconColor: '#ca8a04', badge: '人大信访', badgeClass: 'badge-orange', scene: '向人大代表或信访部门反映长期未履职或程序违法问题。', materials: '案件基础信息、问题描述、证据材料等', used: 8, lastUsed: '2026-04-17' },
]
const currentTemplate = computed(() => templates.find(t => t.name === selected.value) || templates[0])
</script>
