<template>
  <div class="workbench-shell">
    <aside class="shell-sidebar">
      <div class="brand-badge" aria-hidden="true">
        <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="18" y="38" width="8" height="2" rx="1" fill="currentColor"/>
          <rect x="21" y="14" width="2" height="24" rx="1" fill="currentColor"/>
          <rect x="6" y="12" width="32" height="2" rx="1" fill="currentColor"/>
          <path d="M7 14 L7 18 Q7 20 9 20 L13 20 Q15 20 15 18 L15 14" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <line x1="6" y1="14" x2="16" y2="14" stroke="currentColor" stroke-width="1.5"/>
          <path d="M29 14 L29 18 Q29 20 31 20 L35 20 Q37 20 37 18 L37 14" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <line x1="28" y1="14" x2="38" y2="14" stroke="currentColor" stroke-width="1.5"/>
          <circle cx="22" cy="10" r="3" fill="currentColor"/>
          <line x1="22" y1="13" x2="22" y2="17" stroke="currentColor" stroke-width="1"/>
        </svg>
      </div>

      <nav class="sidebar-nav">
        <button
          v-for="item in navItems"
          :key="item.id"
          class="sidebar-link"
          :class="resolvedModule === item.id ? 'sidebar-link-active' : 'sidebar-link-idle'"
          @click="switchModule(item.id)"
        >
          <span class="sidebar-link-icon" v-html="item.icon"></span>
          <span class="sidebar-link-text">{{ item.label }}</span>
          <span v-if="resolvedModule === item.id" class="sidebar-link-rail"></span>
        </button>
      </nav>

      <div class="sidebar-footer">案件工作台</div>
    </aside>

    <div class="shell-main">
      <header class="shell-topbar">
        <div class="topbar-breadcrumb">案件治理 / 合规处置 / 复议跟踪</div>
        <div class="topbar-tools">
          <label class="topbar-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input placeholder="搜索案件、店铺或编号..." />
          </label>
          <button class="topbar-icon-button" @click="showNotifications = !showNotifications">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span v-if="overdueList.length" class="icon-badge">{{ overdueList.length > 9 ? '9+' : overdueList.length }}</span>
          </button>
          <button class="topbar-user">
            <span class="topbar-user-avatar">管</span>
            <span>管理员</span>
          </button>
        </div>
      </header>

      <div v-if="showNotifications" class="notify-panel">
        <div class="notify-head">
          <span>逾期提醒</span>
          <button @click="showNotifications = false">×</button>
        </div>
        <div class="notify-body">
          <div v-if="!overdueList.length" class="notify-empty">暂无逾期案件</div>
          <router-link
            v-for="item in overdueList"
            :key="item.id + item.type"
            :to="'/case/' + item.id"
            class="notify-item"
            @click="showNotifications = false"
          >
            <div class="notify-dot" :class="item.urgency === 'danger' ? 'notify-dot-danger' : 'notify-dot-warn'"></div>
            <div class="notify-copy">
              <div class="notify-title">{{ item.shopName }}</div>
              <div class="notify-sub">{{ item.productName }}</div>
              <div class="notify-msg">{{ item.message }}</div>
            </div>
            <span class="notify-link">查看</span>
          </router-link>
        </div>
      </div>

      <main class="shell-content">
        <section v-if="resolvedModule === 'workbench'" class="dashboard-page">
          <div class="hero-block">
            <div class="hero-kicker">案件处置工作台</div>
            <h1 class="hero-title">固定首屏仪表盘</h1>
            <div class="hero-subtitle">循法而行，据证而断</div>
            <p class="hero-desc">首页只保留概览、核心统计、待跟进摘要和少量简表，不再把完整案件列表塞进工作台首屏。</p>
          </div>

          <section class="panel-card stats-panel">
            <div v-for="card in statCards" :key="card.label" class="stat-card">
              <div class="stat-icon" :style="{ color: card.color }" v-html="card.icon"></div>
              <div class="stat-label">{{ card.label }}</div>
              <div class="stat-value">{{ card.value }}</div>
            </div>
          </section>

          <section class="panel-card filter-panel">
            <button
              v-for="item in statusFilters"
              :key="item.key"
              class="status-chip"
              :class="workbenchFilter === item.key ? 'status-chip-active' : ''"
              @click="workbenchFilter = item.key"
            >
              <span class="status-chip-count">{{ item.count }}</span>
              <span>{{ item.label }}</span>
            </button>
          </section>

          <section class="panel-card cases-panel">
            <div class="panel-head">
              <div>
                <h2>待跟进案件</h2>
                <p>只展示摘要，不在首页承载完整列表、分页和批量操作。</p>
              </div>
              <div class="panel-actions">
                <button class="ghost-btn">拍照上传</button>
                <button class="gold-btn" @click="$router.push('/case/new')">新建案件</button>
                <button class="ghost-btn" @click="switchModule('cases')">进入案件管理</button>
              </div>
            </div>

            <div class="data-pills">
              <span class="data-pill">检索结果 <strong>{{ filteredWorkbenchCases.length }}</strong></span>
              <span class="data-pill">已立案 <strong>{{ dashboardStats.filed }}</strong></span>
              <span class="data-pill">复议中 <strong>{{ dashboardStats.reviewing }}</strong></span>
              <span class="data-pill">本月办结 <strong>{{ dashboardStats.closedThisMonth }}</strong></span>
            </div>

            <div class="preview-table-wrap">
              <table class="preview-table">
                <thead>
                  <tr>
                    <th>案件编号</th>
                    <th>店铺名称</th>
                    <th>状态</th>
                    <th>更新时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in workbenchPreviewCases" :key="item.id">
                    <td class="mono-text">{{ item.caseNumber || '待生成' }}</td>
                    <td>{{ item.shopName || item.licenseName || '—' }}</td>
                    <td>
                      <StatusBadge :status="getEffectiveStatus(item)" :profit="item.profit" />
                    </td>
                    <td>{{ formatDate(item.updatedAt) }}</td>
                    <td>
                      <router-link class="table-link" :to="'/case/' + item.id">查看</router-link>
                    </td>
                  </tr>
                  <tr v-if="!workbenchPreviewCases.length">
                    <td colspan="5" class="empty-cell">暂无符合条件的案件</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="metric-row">
            <div v-for="card in metricCards" :key="card.label" class="panel-card metric-card">
              <div class="metric-label">{{ card.label }}</div>
              <div class="metric-value">{{ card.value }}</div>
              <div class="metric-sub">{{ card.sub }}</div>
            </div>
          </section>

          <section class="panel-card search-panel">
            <div class="panel-head compact">
              <div>
                <h2>检索与筛选</h2>
                <p>工作台只保留轻量入口，完整筛选请进入案件管理。</p>
              </div>
              <button class="ghost-btn" @click="switchModule('cases')">查看完整列表</button>
            </div>
            <div class="search-grid">
              <select class="field-select"><option>全部年份</option><option>2026</option><option>2025</option></select>
              <select class="field-select"><option>全部月份</option><option>01</option><option>02</option><option>03</option></select>
              <select class="field-select"><option>全部状态</option><option>待受理</option><option>已立案</option><option>已办结</option></select>
              <label class="field-search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input placeholder="搜索编号 / 店铺 / 商品 / 单号..." />
              </label>
            </div>
          </section>
        </section>

        <section v-else-if="resolvedModule === 'cases'" class="module-page cases-page">
          <div class="module-hero">
            <div>
              <div class="hero-kicker">案件管理</div>
              <h1 class="module-title">完整案件列表与业务操作</h1>
              <p class="module-desc">筛选、搜索、分页、批量操作和详情入口全部留在这里，不再挤进工作台首页。</p>
            </div>
          </div>
          <div class="module-body">
            <router-view />
          </div>
        </section>

        <section v-else-if="resolvedModule === 'materials'" class="module-page">
          <div class="module-hero">
            <div>
              <div class="hero-kicker">材料归档</div>
              <h1 class="module-title">上传、云端文件与材料预览入口</h1>
              <p class="module-desc">这里承载材料上传、归档和预览入口，不和案件首页混排。</p>
            </div>
          </div>
          <div class="module-grid">
            <article class="panel-card module-tile"><h3>材料上传</h3><p>拍照上传、本地上传、上传记录。</p></article>
            <article class="panel-card module-tile"><h3>云端文件</h3><p>按案件聚合材料，统一查看归档状态。</p></article>
            <article class="panel-card module-tile"><h3>材料预览</h3><p>后续接入图片、PDF、文书预览入口。</p></article>
          </div>
        </section>

        <section v-else-if="resolvedModule === 'review'" class="module-page">
          <div class="module-hero">
            <div>
              <div class="hero-kicker">复议跟踪</div>
              <h1 class="module-title">行政复议、后续处置与期限提醒</h1>
              <p class="module-desc">这里聚合复议、救济监督、期限风险和后续处置摘要。</p>
            </div>
          </div>
          <div class="module-grid">
            <article class="panel-card module-tile"><h3>复议案件</h3><p>当前复议中 {{ dashboardStats.reviewing }} 件。</p></article>
            <article class="panel-card module-tile"><h3>后续处置</h3><p>汇总案件详情页中的处置记录与状态。</p></article>
            <article class="panel-card module-tile"><h3>期限提醒</h3><p>逾期风险 {{ overdueList.length }} 件，集中查看与跟进。</p></article>
          </div>
        </section>

        <section v-else-if="resolvedModule === 'reports'" class="module-page">
          <div class="module-hero">
            <div>
              <div class="hero-kicker">数据报表</div>
              <h1 class="module-title">案件统计与经营数据</h1>
              <p class="module-desc">承载案件统计、调解赔偿、不予立案、已处罚、本月花费和本月盈利等报表入口。</p>
            </div>
          </div>
          <div class="report-grid">
            <article v-for="item in reportStats" :key="item.label" class="panel-card report-card">
              <div class="report-icon" :style="{ color: item.color }" v-html="item.icon"></div>
              <div class="report-label">{{ item.label }}</div>
              <div class="report-value">{{ item.value }}</div>
            </article>
          </div>
        </section>

        <section v-else class="module-page">
          <div class="module-hero">
            <div>
              <div class="hero-kicker">系统设置</div>
              <h1 class="module-title">基础设置与部署信息</h1>
              <p class="module-desc">这里承载基础配置、存储设置和系统信息，不再在首页出现。</p>
            </div>
          </div>
          <div class="module-grid">
            <article class="panel-card module-tile"><h3>基础设置</h3><p>编号规则、状态枚举、系统参数。</p></article>
            <article class="panel-card module-tile"><h3>存储设置</h3><p>本地与云端存储路径、配额与策略。</p></article>
            <article class="panel-card module-tile"><h3>部署信息</h3><p>版本包、更新时间与回滚信息。</p></article>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCaseStore } from '@/stores/case'
import { ReminderService } from '@/lib/notification'
import StatusBadge from '@/components/StatusBadge.vue'

const store = useCaseStore()
const route = useRoute()
const router = useRouter()

const showNotifications = ref(false)
const overdueList = ref([])
const activeModule = ref('workbench')
const workbenchFilter = ref('all')

const iconGrid = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`
const iconFolder = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`
const iconArchive = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`
const iconSearch = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`
const iconChart = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`
const iconSettings = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`
const iconFolderLarge = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`
const iconClockLarge = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
const iconBalanceLarge = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v18"/><path d="M5 7h14"/><path d="M6 7l-3 5h6l-3-5z"/><path d="M18 7l-3 5h6l-3-5z"/><path d="M8 21h8"/></svg>`
const iconSearchLarge = iconSearch
const iconCheckLarge = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
const iconWarnLarge = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
const iconCoinLarge = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`
const iconTrendLarge = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`

const navItems = [
  { id: 'workbench', label: '工作台', icon: iconGrid },
  { id: 'cases', label: '案件管理', icon: iconFolder },
  { id: 'materials', label: '材料归档', icon: iconArchive },
  { id: 'review', label: '复议跟踪', icon: iconSearch },
  { id: 'reports', label: '数据报表', icon: iconChart },
  { id: 'settings', label: '系统设置', icon: iconSettings },
]

const resolvedModule = computed(() => {
  if (route.path === '/settings') return 'settings'
  if (route.path.startsWith('/case/')) return 'cases'
  if (route.path === '/' && activeModule.value === 'cases') return 'cases'
  return activeModule.value
})

const dashboardStats = computed(() => {
  const cases = store.cases || []
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  return {
    total: cases.length,
    pending: cases.filter((item) => getEffectiveStatus(item) === 'pending_report').length,
    filed: cases.filter((item) => getEffectiveStatus(item) === 'filed').length,
    rejected: cases.filter((item) => getEffectiveStatus(item) === 'rejected').length,
    closed: cases.filter((item) => ['closed', 'decided', 'exempted', 'not_punished'].includes(getEffectiveStatus(item))).length,
    reviewing: cases.filter((item) => Array.isArray(item.disposals) && item.disposals.some((d) => d.disposalType === 'administrative_review')).length,
    closedThisMonth: cases.filter((item) => {
      const status = getEffectiveStatus(item)
      if (!['closed', 'decided', 'exempted', 'not_punished'].includes(status)) return false
      const raw = item.reportResultDate || item.mediationDate || item.updatedAt
      const date = new Date(raw || 0)
      return !Number.isNaN(date.getTime()) && date.getFullYear() === currentYear && date.getMonth() === currentMonth
    }).length,
    decided: cases.filter((item) => getEffectiveStatus(item) === 'decided').length,
  }
})

const statCards = computed(() => [
  { label: '案件总数', value: dashboardStats.value.total, icon: iconFolderLarge, color: '#d6a650' },
  { label: '待受理', value: dashboardStats.value.pending, icon: iconClockLarge, color: '#67a2ff' },
  { label: '已立案', value: dashboardStats.value.filed, icon: iconBalanceLarge, color: '#c8a665' },
  { label: '复议跟进', value: dashboardStats.value.reviewing, icon: iconSearchLarge, color: '#f59e0b' },
  { label: '本月办结', value: dashboardStats.value.closedThisMonth, icon: iconCheckLarge, color: '#34d399' },
])

const statusFilters = computed(() => [
  { key: 'all', label: '全部', count: dashboardStats.value.total },
  { key: 'pending_report', label: '待受理', count: dashboardStats.value.pending },
  { key: 'filed', label: '已立案', count: dashboardStats.value.filed },
  { key: 'rejected', label: '不予立案', count: dashboardStats.value.rejected },
  { key: 'closed', label: '已办结', count: dashboardStats.value.closed },
  { key: 'reviewing', label: '复议中', count: dashboardStats.value.reviewing },
])

const filteredWorkbenchCases = computed(() => {
  const source = [...(store.cases || [])]
  const sorted = source.sort((a, b) => {
    const at = new Date(a.updatedAt || a.createdAt || 0).getTime()
    const bt = new Date(b.updatedAt || b.createdAt || 0).getTime()
    return bt - at
  })
  if (workbenchFilter.value === 'all') return sorted
  if (workbenchFilter.value === 'reviewing') {
    return sorted.filter((item) => Array.isArray(item.disposals) && item.disposals.some((d) => d.disposalType === 'administrative_review'))
  }
  if (workbenchFilter.value === 'closed') {
    return sorted.filter((item) => ['closed', 'decided', 'exempted', 'not_punished'].includes(getEffectiveStatus(item)))
  }
  return sorted.filter((item) => getEffectiveStatus(item) === workbenchFilter.value)
})

const workbenchPreviewCases = computed(() => filteredWorkbenchCases.value.slice(0, 5))

const metricCards = computed(() => [
  { label: '当月花费', value: '¥7,729.64', sub: '保留报表入口，不在首页展开明细' },
  { label: '当月盈利', value: '¥12,560.00', sub: '进入数据报表查看完整口径' },
  { label: '云端文件', value: `${dashboardStats.value.total} 件`, sub: '作为材料归档模块入口摘要' },
  { label: '磁盘占用', value: '5.3 GB', sub: '部署与存储设置中维护' },
])

const reportStats = computed(() => [
  { label: '案件总数', value: dashboardStats.value.total, icon: iconFolderLarge, color: '#d6a650' },
  { label: '调解成功', value: dashboardStats.value.decided, icon: iconCheckLarge, color: '#34d399' },
  { label: '不予立案', value: dashboardStats.value.rejected, icon: iconWarnLarge, color: '#f87171' },
  { label: '已处罚', value: dashboardStats.value.closed, icon: iconBalanceLarge, color: '#a78bfa' },
  { label: '本月花费', value: '¥7,729.64', icon: iconCoinLarge, color: '#f59e0b' },
  { label: '本月盈利', value: '¥12,560.00', icon: iconTrendLarge, color: '#34d399' },
  { label: '复议跟进', value: dashboardStats.value.reviewing, icon: iconSearchLarge, color: '#67a2ff' },
  { label: '已立案', value: dashboardStats.value.filed, icon: iconFolderLarge, color: '#d6a650' },
])

function getEffectiveStatus(c) {
  if (c?.mediationStatus === 'decided') return 'decided'
  if (c?.reportResultStatus) return c.reportResultStatus
  if (c?.procedureVersion === 'old' && c?.filingStatus === 'filed' && !c?.reportResultStatus) return 'filed'
  if (c?.acceptanceStatus) return c.acceptanceStatus
  if (c?.mediationStatus === 'mediation_terminated') return 'mediation_terminated'
  return 'pending_report'
}

function switchModule(module) {
  activeModule.value = module
  showNotifications.value = false
  if (module === 'cases' && route.path === '/settings') {
    router.push('/')
    return
  }
  if (module === 'settings') {
    router.push('/settings')
    return
  }
  if (module === 'workbench' || module === 'materials' || module === 'review' || module === 'reports') {
    if (route.path !== '/') router.push('/')
  }
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('zh-CN')
}

let reminderService = null

onMounted(() => {
  reminderService = new ReminderService((list) => {
    overdueList.value = list
  })
  reminderService.start(store.cases, 60000)
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
})

onUnmounted(() => {
  if (reminderService?.interval) clearInterval(reminderService.interval)
})

</script>

<style scoped>
.workbench-shell {
  display: flex;
  min-height: 100vh;
  background:
    radial-gradient(circle at 82% 4%, rgba(59, 130, 246, 0.14), transparent 32%),
    radial-gradient(circle at 18% 0%, rgba(214, 166, 80, 0.08), transparent 28%),
    linear-gradient(135deg, #06101f 0%, #0a1930 45%, #07111f 100%);
  color: #eaf2ff;
}

.shell-sidebar {
  width: 92px;
  flex-shrink: 0;
  border-right: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(7, 17, 31, 0.9);
  backdrop-filter: blur(16px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 10px;
}

.brand-badge {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  color: #d6a650;
  border: 1px solid rgba(214, 166, 80, 0.4);
  background: rgba(214, 166, 80, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}
.brand-badge svg { width: 28px; height: 28px; }

.sidebar-nav {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar-link {
  position: relative;
  border: 0;
  background: transparent;
  border-radius: 14px;
  padding: 10px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #93a4ba;
}
.sidebar-link:hover { background: rgba(148, 163, 184, 0.08); color: #eaf2ff; }
.sidebar-link-active { background: rgba(214, 166, 80, 0.1); color: #d6a650; }
.sidebar-link-icon { width: 18px; height: 18px; display: block; }
.sidebar-link-icon :deep(svg) { width: 18px; height: 18px; }
.sidebar-link-text { font-size: 10px; line-height: 1.2; }
.sidebar-link-rail {
  position: absolute;
  left: -10px;
  top: 12px;
  bottom: 12px;
  width: 2px;
  border-radius: 999px;
  background: #d6a650;
}
.sidebar-footer { margin-top: auto; font-size: 10px; color: #64748b; }

.shell-main { flex: 1; min-width: 0; display: flex; flex-direction: column; position: relative; }
.shell-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(7, 17, 31, 0.64);
  backdrop-filter: blur(16px);
}
.topbar-breadcrumb { font-size: 13px; color: #93a4ba; }
.topbar-tools { display: flex; align-items: center; gap: 12px; }
.topbar-search {
  width: 260px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 14px;
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 30, 52, 0.66);
  color: #64748b;
}
.topbar-search svg { width: 14px; height: 14px; }
.topbar-search input,
.field-search input {
  width: 100%;
  background: transparent;
  border: 0;
  outline: 0;
  color: #eaf2ff;
}
.topbar-icon-button,
.topbar-user {
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 30, 52, 0.66);
  color: #93a4ba;
  border-radius: 14px;
}
.topbar-icon-button {
  position: relative;
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.topbar-icon-button svg { width: 16px; height: 16px; }
.icon-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: #d6a650;
  color: #09111f;
  font-size: 10px;
  font-weight: 700;
}
.topbar-user { display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; }
.topbar-user-avatar {
  width: 24px; height: 24px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center;
  background: rgba(214, 166, 80, 0.18); color: #d6a650; font-size: 10px; font-weight: 700;
}

.notify-panel {
  position: absolute; right: 24px; top: 72px; z-index: 30; width: 320px;
  border-radius: 18px; overflow: hidden; border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 30, 52, 0.95); backdrop-filter: blur(18px); box-shadow: 0 30px 80px rgba(0,0,0,0.35);
}
.notify-head { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid rgba(148, 163, 184, 0.12); color: #d6a650; }
.notify-head button { background: transparent; border: 0; color: #93a4ba; font-size: 20px; cursor: pointer; }
.notify-body { max-height: 320px; overflow: auto; }
.notify-empty { padding: 28px 16px; text-align: center; color: #64748b; }
.notify-item { display: flex; gap: 10px; padding: 12px 16px; border-bottom: 1px solid rgba(148, 163, 184, 0.08); color: inherit; text-decoration: none; }
.notify-dot { width: 8px; height: 8px; border-radius: 999px; margin-top: 7px; }
.notify-dot-danger { background: #f87171; }
.notify-dot-warn { background: #f59e0b; }
.notify-title { color: #eaf2ff; font-size: 13px; font-weight: 600; }
.notify-sub,.notify-msg,.notify-link { font-size: 12px; color: #93a4ba; }
.notify-copy { min-width: 0; flex: 1; }

.shell-content { flex: 1; overflow: auto; padding: 24px; }
.dashboard-page, .module-page { display: flex; flex-direction: column; gap: 18px; }
.hero-block, .module-hero {
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: linear-gradient(180deg, rgba(15, 30, 52, 0.82), rgba(9, 20, 37, 0.9));
  border-radius: 24px;
  padding: 24px 26px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.22);
}
.hero-kicker { font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; color: #64748b; }
.hero-title, .module-title { margin: 10px 0 0; font-size: 38px; line-height: 1.05; font-weight: 800; }
.hero-subtitle { margin-top: 10px; font-size: 18px; letter-spacing: 0.16em; color: #d6a650; }
.hero-desc, .module-desc { margin-top: 12px; max-width: 860px; font-size: 13px; line-height: 1.8; color: #93a4ba; }

.panel-card {
  border-radius: 22px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(15, 30, 52, 0.74);
  backdrop-filter: blur(18px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}
.stats-panel {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
  padding: 16px;
}
.stat-card { border-radius: 18px; padding: 18px; background: rgba(7, 17, 31, 0.44); }
.stat-icon { width: 20px; height: 20px; margin-bottom: 14px; }
.stat-icon :deep(svg) { width: 20px; height: 20px; }
.stat-label { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #64748b; }
.stat-value { margin-top: 8px; font-size: 34px; font-weight: 800; line-height: 1; }

.filter-panel { display: flex; gap: 10px; flex-wrap: wrap; padding: 14px 16px; }
.status-chip {
  border-radius: 999px; border: 1px solid rgba(148, 163, 184, 0.2); background: rgba(7, 17, 31, 0.48);
  color: #93a4ba; padding: 8px 14px; font-size: 12px; display: inline-flex; gap: 6px; align-items: center;
}
.status-chip-active { background: linear-gradient(135deg, #f3c77b, #d6a650); color: #09111f; border-color: #d6a650; }
.status-chip-count { font-weight: 700; }

.cases-panel, .search-panel { padding: 18px; }
.panel-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; margin-bottom: 16px; }
.panel-head.compact { align-items: center; }
.panel-head h2 { margin: 0; font-size: 20px; }
.panel-head p { margin: 6px 0 0; font-size: 12px; color: #93a4ba; }
.panel-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.gold-btn, .ghost-btn {
  height: 38px; padding: 0 16px; border-radius: 12px; cursor: pointer; font-size: 13px;
}
.gold-btn { border: 0; background: linear-gradient(135deg, #f3c77b, #d6a650); color: #09111f; font-weight: 700; }
.ghost-btn { border: 1px solid rgba(148, 163, 184, 0.2); background: rgba(7, 17, 31, 0.5); color: #93a4ba; }
.data-pills { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.data-pill {
  display: inline-flex; gap: 5px; align-items: center; border-radius: 999px; padding: 5px 11px;
  border: 1px solid rgba(148, 163, 184, 0.18); background: rgba(7, 17, 31, 0.5); font-size: 11px; color: #93a4ba;
}
.data-pill strong { color: #eaf2ff; }

.preview-table-wrap { overflow: auto; border-radius: 18px; border: 1px solid rgba(148, 163, 184, 0.12); }
.preview-table { width: 100%; border-collapse: collapse; min-width: 720px; }
.preview-table th, .preview-table td { padding: 14px 16px; border-bottom: 1px solid rgba(148, 163, 184, 0.08); text-align: left; }
.preview-table th { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #64748b; background: rgba(7, 17, 31, 0.42); }
.preview-table td { font-size: 13px; color: #eaf2ff; }
.mono-text { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: #93a4ba; }
.table-link { color: #d6a650; text-decoration: none; }
.empty-cell { text-align: center; color: #64748b !important; }

.metric-row { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.metric-card { padding: 18px; }
.metric-label { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #64748b; }
.metric-value { margin-top: 8px; font-size: 24px; font-weight: 800; color: #d6a650; }
.metric-sub { margin-top: 8px; font-size: 12px; color: #93a4ba; }

.search-grid { display: grid; grid-template-columns: 160px 160px 180px 1fr; gap: 12px; }
.field-select, .field-search {
  height: 42px; border-radius: 14px; border: 1px solid rgba(148, 163, 184, 0.2); background: rgba(7, 17, 31, 0.54); color: #eaf2ff;
}
.field-select { padding: 0 12px; }
.field-search { display: flex; align-items: center; gap: 8px; padding: 0 12px; color: #64748b; }
.field-search svg { width: 14px; height: 14px; }

.module-grid, .report-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.module-tile, .report-card { padding: 20px; }
.module-tile h3 { margin: 0 0 10px; font-size: 18px; }
.module-tile p { margin: 0; font-size: 13px; line-height: 1.8; color: #93a4ba; }
.report-icon { width: 22px; height: 22px; margin-bottom: 12px; }
.report-icon :deep(svg) { width: 22px; height: 22px; }
.report-label { font-size: 12px; color: #93a4ba; }
.report-value { margin-top: 8px; font-size: 28px; font-weight: 800; }
.module-body :deep(.space-y-4) { margin-top: 0; }

@media (max-width: 1280px) {
  .stats-panel, .metric-row, .module-grid, .report-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .search-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 900px) {
  .workbench-shell { flex-direction: column; }
  .shell-sidebar {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    padding: 12px 16px;
    overflow-x: auto;
  }
  .brand-badge, .sidebar-footer { display: none; }
  .sidebar-nav { flex-direction: row; }
  .sidebar-link-rail { display: none; }
  .shell-topbar, .panel-head { flex-direction: column; align-items: stretch; }
  .topbar-search { width: 100%; }
  .stats-panel, .metric-row, .module-grid, .report-grid, .search-grid { grid-template-columns: 1fr; }
}
</style>
