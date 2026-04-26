<template>
  <div class="page-shell">
    <div class="page-header page-header-row">
      <div>
        <h1 class="page-title">证据库</h1>
        <p class="page-desc">集中管理所有案件的证据材料，支持分类管理、OCR识别和批量导出。</p>
      </div>
      <div class="header-actions">
        <div class="topbar-search-light">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="搜索案件、材料、OCR内容" />
        </div>
        <button class="topbar-icon-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span class="notif-badge">3</span>
        </button>
        <button class="topbar-user">
          <span class="topbar-avatar">打</span>
          <span class="topbar-name">打假人</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>
    </div>

    <div class="evidence-top enhanced-evidence-top">
      <div class="status-tab slim-tabs">
        <button v-for="v in viewModes" :key="v.key" class="status-tab-btn" :class="activeView === v.key ? 'active' : ''" @click="activeView = v.key">{{ v.label }}</button>
      </div>
      <div class="inline-stat-cards">
        <div class="inline-stat-card" v-for="item in topStats" :key="item.label">
          <div class="inline-stat-value" :class="item.className">{{ item.value }}</div>
          <div class="inline-stat-label">{{ item.label }}</div>
        </div>
      </div>
    </div>

    <div class="filter-card compact">
      <div class="filter-row">
        <select class="filter-select"><option>全部案件状态</option></select>
        <select class="filter-select"><option>全部类型</option></select>
        <select class="filter-select"><option>上传时间</option></select>
        <input type="date" class="filter-input date-input" />
        <input type="date" class="filter-input date-input" />
        <input placeholder="搜索案件、材料、OCR内容" class="filter-input flex-1" />
        <button class="btn-secondary">重置</button>
        <button class="btn-primary">筛选</button>
      </div>
    </div>

    <div class="action-bar">
      <button class="btn-primary">上传材料</button>
      <button class="btn-secondary">批量上传</button>
      <button class="btn-secondary">OCR识别</button>
      <button class="btn-secondary">批量绑定案件</button>
      <button class="btn-secondary">批量导出</button>
      <button class="btn-danger">删除材料</button>
      <div class="action-bar-right">
        <span class="sort-label">排序：</span>
        <select class="filter-select"><option>更新时间</option><option>上传时间</option></select>
        <span class="sort-label">视图：</span>
        <button class="btn-icon" :class="gridView ? 'active' : ''" @click="gridView = true">宫格</button>
        <button class="btn-icon" :class="!gridView ? 'active' : ''" @click="gridView = false">列表</button>
      </div>
    </div>

    <div class="table-card card-section">
      <div class="table-head">
        <div>
          <h2>案件材料夹（共 {{ materialCases.length }} 个案件）</h2>
        </div>
      </div>
      <div class="folder-grid four-col-grid">
        <div class="evidence-folder-card" :class="{ 'selected-case': selectedCaseId === folder.id }" v-for="folder in materialCases" :key="folder.id" @click="selectedCaseId = folder.id">
          <div class="folder-card-top">
            <div class="folder-symbol">📁</div>
            <span class="status-chip" :class="getBadgeClass(folder)">{{ getEffectiveStatusLabel(folder) }}</span>
          </div>
          <div class="folder-case-code">{{ folder.caseNumber || '待生成' }}</div>
          <div class="folder-shop">{{ folder.shopName || '-' }}</div>
          <div class="folder-subject">{{ getEffectiveStatusLabel(folder) }}</div>
          <div class="folder-progress-row">
            <span>材料 {{ folderMaterials(folder).length }} 份</span>
          </div>
          <div class="folder-progress-bar"><span :style="{ width: '100%' }"></span></div>
          <div class="folder-footer">
            <span>{{ folderMaterials(folder).length }} 份</span>
            <span>{{ folder.updatedAt ? '更新于 ' + dayjs(folder.updatedAt).format('MM-DD HH:mm') : '-' }}</span>
          </div>
        </div>
        <div class="evidence-folder-card dashed-folder-card">
          <div class="plus-folder">＋</div>
          <div class="folder-create-title">新建案件材料夹</div>
          <div class="folder-create-sub">为新案件创建材料文件夹</div>
        </div>
      </div>
    </div>

    <div class="legend-strip">
      <span v-for="legend in legends" :key="legend" class="legend-item">{{ legend }}</span>
    </div>

    <div class="detail-layout">
      <div class="table-card detail-main-card">
        <div class="table-head">
          <div>
            <h2>案件材料详情：{{ selectedCase ? (selectedCase.caseNumber + ' ' + selectedCase.shopName + '（' + getEffectiveStatusLabel(selectedCase) + '）') : '暂无选中案件' }}</h2>
          </div>
          <button class="btn-link">查看案件详情</button>
        </div>
        <div class="page-tabs evidence-tabs">
          <button v-for="tab in materialTabs" :key="tab" class="page-tab" :class="activeTab === tab ? 'active' : ''" @click="activeTab = tab">{{ tab }}</button>
        </div>
        <div class="material-card-grid">
          <div class="material-thumb-card upload-card">
            <div class="upload-thumb-box">⬆</div>
            <div class="material-name">上传购买凭证</div>
            <div class="material-meta">支持拖拽或点击上传 JPG / PNG / PDF</div>
          </div>
          <div class="material-thumb-card" v-for="item in materials" :key="item.name">
            <div class="thumb-preview">{{ item.preview }}</div>
            <div class="material-name">{{ item.name }}</div>
            <div class="material-meta">{{ item.size }} · {{ item.time }}</div>
            <span class="status-chip" :class="item.ocrClass">{{ item.ocr }}</span>
          </div>
        </div>
      </div>

      <div class="right-sidebar detail-sidebar">
        <div class="side-card">
          <div class="side-card-head"><h3>材料完整度</h3></div>
          <div class="completeness-score">{{ selectedCompleteness.done }} / {{ selectedCompleteness.total }}</div>
          <div class="folder-progress-bar large"><span :style="{ width: selectedCompleteness.percent + '%' }"></span></div>
          <p class="side-note">缺少机关答复与复议材料，建议优先补齐签收截图与答复结论。</p>
        </div>
        <div class="side-card">
          <div class="side-card-head"><h3>该案件下一步建议</h3></div>
          <div class="suggestion-list">
            <div class="suggestion-item">1. 上传签收截图并登记签收日期</div>
            <div class="suggestion-item">2. 15个工作日后仍无答复，建立催告记录</div>
            <div class="suggestion-item">3. 如为不予立案，准备复议材料</div>
          </div>
        </div>
        <div class="side-card">
          <div class="side-card-head"><h3>快捷操作</h3></div>
          <div class="quick-actions-grid two-col">
            <button class="btn-secondary">OCR识别</button>
            <button class="btn-secondary">绑定案件</button>
            <button class="btn-secondary">批量导出</button>
            <button class="btn-secondary">查看缺失项</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCaseStore } from '@/stores/case'
import dayjs from 'dayjs'

const store = useCaseStore()

const activeView = ref('group')
const gridView = ref(true)
const activeTab = ref('购买凭证')
const selectedCaseId = ref(null)

const viewModes = [
  { key: 'group', label: '案件分组视图' },
  { key: 'list', label: '材料列表视图' },
  { key: 'check', label: '缺失检查视图' },
]

const allMaterialCount = computed(() => {
  return store.cases.reduce((sum, c) => {
    return sum + (c.images ? c.images.length : 0) + (c.documents ? c.documents.length : 0)
  }, 0)
})

const unassignedCount = computed(() => store.unassignedImages.length)

const pendingOcrCount = computed(() => {
  return store.cases.reduce((sum, c) => {
    return sum + (c.images ? c.images.filter(img => !img.ocrTitle).length : 0)
  }, 0)
})

const topStats = computed(() => [
  { label: '全部材料', value: allMaterialCount.value, className: 'blue' },
  { label: '未绑定材料', value: unassignedCount.value, className: 'orange' },
  { label: '待OCR识别', value: pendingOcrCount.value, className: 'blue' },
  { label: '疑似重复', value: 0, className: 'purple' },
])

const materialCases = computed(() => {
  return store.cases.filter(c => (c.images && c.images.length > 0) || (c.documents && c.documents.length > 0))
})

const selectedCase = computed(() => {
  if (!selectedCaseId.value) return store.cases[0] || null
  return store.cases.find(c => c.id === selectedCaseId.value) || store.cases[0] || null
})

const materials = computed(() => {
  const c = selectedCase.value
  if (!c) return []
  const items = []
  if (c.images) c.images.forEach(function(img) {
    const name = img.name || (img.url ? img.url.split('/').pop() : '图片')
    items.push({ name: name, size: '-', time: img.uploadedAt ? dayjs(img.uploadedAt).format('YYYY-MM-DD HH:mm') : '-', ocr: img.ocrTitle ? 'OCR完成' : '待OCR', ocrClass: img.ocrTitle ? 'badge-green' : 'badge-orange', preview: '🖼' })
  })
  if (c.documents) c.documents.forEach(function(doc) {
    const name = doc.name || '文档'
    items.push({ name: name, size: '-', time: doc.uploadedAt ? dayjs(doc.uploadedAt).format('YYYY-MM-DD HH:mm') : '-', ocr: doc.ocrTitle ? 'OCR完成' : '待OCR', ocrClass: doc.ocrTitle ? 'badge-green' : 'badge-orange', preview: 'PDF' })
  })
  return items
})

const completeness = computed(() => {
  const c = selectedCase.value
  if (!c) return { have: 0, total: 4, percent: 0 }
  let have = 0
  if (c.images && c.images.length > 0 || c.documents && c.documents.length > 0) have++
  if (c.trackingNumber || c.mailTrackingNo) have++
  if (c.signDate) have++
  if (c.reportResultStatus) have++
  return { have: have, total: 4, percent: Math.round((have / 4) * 100) }
})

const selectedCompleteness = computed(() => completeness.value)

function getEffectiveStatusLabel(c) {
  if (!c) return '-'
  const eff = store.getEffectiveStatus ? store.getEffectiveStatus(c) : (c.status || 'pending_report')
  const STATUS_LABELS = {
    pending_report: '待处理', accepted: '已受理', rejected: '不予立案',
    not_punished: '违法事实不成立', closed: '已办结', decided: '已调解', mediation_terminated: '终止调解',
  }
  return STATUS_LABELS[eff] || eff || '-'
}

function getBadgeClass(c) {
  const eff = store.getEffectiveStatus ? store.getEffectiveStatus(c) : (c.status || 'pending_report')
  if (eff === 'rejected' || eff === 'not_punished') return 'badge-orange'
  if (eff === 'decided') return 'badge-green'
  if (eff === 'closed') return 'badge-green'
  return 'badge-blue'
}

function folderMaterials(folder) {
  if (!folder) return []
  return [
    ...(folder.images || []),
    ...(folder.documents || []),
  ]
}
</script>
