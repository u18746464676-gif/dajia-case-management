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
          <h2>案件材料夹（共 12 个案件）</h2>
        </div>
      </div>
      <div class="folder-grid four-col-grid">
        <div class="evidence-folder-card" v-for="folder in folders" :key="folder.code">
          <div class="folder-card-top">
            <div class="folder-symbol">📁</div>
            <span class="status-chip" :class="folder.badgeClass">{{ folder.status }}</span>
          </div>
          <div class="folder-case-code">{{ folder.code }}</div>
          <div class="folder-shop">{{ folder.shop }}</div>
          <div class="folder-subject">{{ folder.subject }}</div>
          <div class="folder-progress-row">
            <span>材料完整度 {{ folder.complete }}</span>
            <span>{{ folder.progress }}</span>
          </div>
          <div class="folder-progress-bar"><span :style="{ width: folder.progress }"></span></div>
          <div class="folder-footer">
            <span>{{ folder.icons }}</span>
            <span>{{ folder.updatedAt }}</span>
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
            <h2>案件材料详情：AJ202604240021 1989潮牌鞋服集合店（不予立案）</h2>
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
          <div class="completeness-score">6 / 8</div>
          <div class="folder-progress-bar large"><span style="width: 75%"></span></div>
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
import { ref } from 'vue'

const activeView = ref('group')
const gridView = ref(true)
const activeTab = ref('购买凭证')

const viewModes = [
  { key: 'group', label: '案件分组视图' },
  { key: 'list', label: '材料列表视图' },
  { key: 'check', label: '缺失检查视图' },
]

const topStats = [
  { label: '全部材料', value: 1286, className: 'blue' },
  { label: '未绑定材料', value: 23, className: 'orange' },
  { label: '待OCR识别', value: 58, className: 'blue' },
  { label: '疑似重复', value: 12, className: 'purple' },
]

const folders = [
  { code: 'AJ202604240021', shop: '1989潮牌鞋服集合店', subject: '不予立案', complete: '6 / 8', progress: '75%', icons: '🧾 2 · 🖼 1 · 💬 1 · ✉ 2', updatedAt: '更新时间 04-24 15:30', status: '已签收未答复', badgeClass: 'badge-orange' },
  { code: 'AJ202604230018', shop: '母婴之家旗舰店', subject: '夸大宣传', complete: '5 / 8', progress: '62%', icons: '🧾 1 · 🖼 2 · 💬 1 · ✉ 1', updatedAt: '更新时间 04-24 14:12', status: '待补材料', badgeClass: 'badge-red' },
  { code: 'AJ202604220012', shop: '优品数码专营店', subject: '违法宣传', complete: '7 / 8', progress: '88%', icons: '🧾 2 · 🖼 2 · 💬 1 · ✉ 2', updatedAt: '更新时间 04-23 19:08', status: '可复议', badgeClass: 'badge-purple' },
  { code: 'AJ202604210007', shop: '家居生活馆', subject: '签收未答复', complete: '4 / 8', progress: '50%', icons: '🧾 1 · 🖼 1 · 💬 1 · ✉ 1', updatedAt: '更新时间 04-22 11:06', status: '临期提醒', badgeClass: 'badge-red' },
  { code: 'AJ202604180009', shop: '美妆小铺', subject: '短视频宣传', complete: '6 / 8', progress: '75%', icons: '🧾 1 · 🖼 2 · 💬 1 · ✉ 2', updatedAt: '更新时间 04-22 09:32', status: '待跟进', badgeClass: 'badge-blue' },
  { code: 'AJ202604150006', shop: '食品生活馆', subject: '答复不满意', complete: '8 / 8', progress: '100%', icons: '🧾 2 · 🖼 2 · 💬 2 · ✉ 2', updatedAt: '更新时间 04-21 18:56', status: '材料完整', badgeClass: 'badge-green' },
]

const legends = ['购买凭证', '商品宣传', '实物照片', '聊天记录', '邮寄签收', '机关答复', '复议材料', '其他材料']
const materialTabs = [...legends]

const materials = [
  { name: '下单截图.png', size: '268KB', time: '2026-04-24 15:08', ocr: 'OCR完成', ocrClass: 'badge-green', preview: '🖼' },
  { name: '支付记录.pdf', size: '1.2MB', time: '2026-04-24 15:09', ocr: 'OCR完成', ocrClass: 'badge-green', preview: 'PDF' },
  { name: '物流签收截图.jpg', size: '326KB', time: '2026-04-24 15:20', ocr: '待OCR', ocrClass: 'badge-orange', preview: '📦' },
  { name: '商品宣传页.png', size: '482KB', time: '2026-04-24 15:21', ocr: 'OCR完成', ocrClass: 'badge-green', preview: '🛍' },
]
</script>
