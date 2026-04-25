<template>
  <div class="workbench-shell">
    <aside class="shell-sidebar">
      <div class="brand-badge" aria-hidden="true">
        <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="18" y="38" width="8" height="2" rx="1" fill="currentColor" />
          <rect x="21" y="14" width="2" height="24" rx="1" fill="currentColor" />
          <rect x="6" y="12" width="32" height="2" rx="1" fill="currentColor" />
          <path d="M7 14 L7 18 Q7 20 9 20 L13 20 Q15 20 15 18 L15 14" stroke="currentColor" stroke-width="1.5" fill="none" />
          <line x1="6" y1="14" x2="16" y2="14" stroke="currentColor" stroke-width="1.5" />
          <path d="M29 14 L29 18 Q29 20 31 20 L35 20 Q37 20 37 18 L37 14" stroke="currentColor" stroke-width="1.5" fill="none" />
          <line x1="28" y1="14" x2="38" y2="14" stroke="currentColor" stroke-width="1.5" />
          <circle cx="22" cy="10" r="3" fill="currentColor" />
          <line x1="22" y1="13" x2="22" y2="17" stroke="currentColor" stroke-width="1" />
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
          <span v-if="resolvedModule === item.id" class="sidebar-link-rail"></span>
          <span class="sidebar-link-icon" v-html="item.icon"></span>
          <span class="sidebar-link-text">{{ item.label }}</span>
        </button>
      </nav>
    </aside>

    <div class="shell-main">
      <header class="shell-topbar">
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
            <span class="icon-dot"></span>
          </button>

          <button class="topbar-user">
            <span class="topbar-user-avatar">管</span>
            <span class="topbar-user-name">管理员</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
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
        <router-view v-if="isCaseFlowRoute" />

        <template v-else>
          <section v-if="resolvedModule === 'workbench'" class="dashboard-page">
            <section class="hero-panel">
              <div class="hero-layout">
                <div class="hero-copy">
                  <div class="hero-breadcrumb">案件治理 / 合规处置 / 复议跟踪</div>
                  <h1 class="hero-title">案件处置工作台</h1>
                  <div class="hero-subtitle">循法而行，据证而断</div>
                  <p class="hero-desc">围绕案件建档、材料归集、流程处置与复议跟踪形成统一工作界面，保持信息清晰、处置有据、留痕完整。</p>
                </div>

                <div class="hero-stats-grid">
                  <article v-for="card in statCards" :key="card.label" class="hero-stat-card">
                    <div class="hero-stat-icon" :style="{ color: card.color }">
                      <span v-html="card.icon"></span>
                    </div>
                    <div class="hero-stat-main">
                      <div class="hero-stat-label">{{ card.label }}</div>
                      <div class="hero-stat-value">{{ card.value }}</div>
                    </div>
                  </article>
                </div>
              </div>
            </section>

            <section class="status-bar-panel">
              <button
                v-for="item in statusFilters"
                :key="item.key"
                class="status-pill"
                :class="workbenchFilter === item.key ? 'status-pill-active' : ''"
                @click="workbenchFilter = item.key"
              >
                <span class="status-pill-dot" :class="item.dotClass"></span>
                <span class="status-pill-label">{{ item.label }}</span>
                <span class="status-pill-count">{{ item.count }}</span>
              </button>
            </section>

            <section class="panel-card followup-panel">
              <div class="panel-head">
                <div>
                  <h2>待跟进案件</h2>
                  <p>优先展示当前需要处理的案件，支持按状态、月份、关键词快速筛选。</p>
                </div>
                <div class="panel-actions">
                  <button class="ghost-btn" @click="switchModule('cases')">拍照上传</button>
                  <button class="gold-btn" @click="$router.push('/case/new')">新建案件</button>
                  <button class="ghost-btn ghost-btn-arrow" @click="switchModule('cases')">
                    <span>更多操作</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="data-pills">
                <span class="data-pill">检索结果 <strong>{{ filteredWorkbenchCases.length }}</strong></span>
                <span class="data-pill">本页已选 <strong>0</strong></span>
                <span class="data-pill">已立案 <strong>{{ dashboardStats.filed }}</strong></span>
                <span class="data-pill">云端文件 <strong>{{ metricCloudFiles }}</strong></span>
                <span class="data-pill">磁盘已用 <strong>5.3 GB</strong></span>
                <span class="data-pill">上传目录 <strong>—</strong></span>
              </div>

              <div class="followup-summary-grid">
                <article v-for="item in summaryPreviewCases" :key="item.id" class="followup-summary-card">
                  <div class="followup-summary-head">
                    <router-link :to="'/case/' + item.id" class="followup-summary-title">{{ item.shopName || item.licenseName || item.caseNumber || '未命名案件' }}</router-link>
                    <StatusBadge :status="getEffectiveStatus(item)" :profit="item.profit" />
                  </div>
                  <div class="followup-summary-meta">{{ item.caseNumber || '待生成' }} · {{ formatDate(item.updatedAt) }}</div>
                </article>
                <article v-if="!summaryPreviewCases.length" class="followup-summary-empty">暂无待跟进案件摘要</article>
              </div>
            </section>

            <section class="metric-grid">
              <article v-for="card in metricCards" :key="card.label" class="panel-card metric-card">
                <div class="metric-label">{{ card.label }}</div>
                <div class="metric-value" :class="card.highlightClass">{{ card.value }}</div>
                <div class="metric-sub">{{ card.sub }}</div>
                <svg v-if="card.trend" class="metric-trend" viewBox="0 0 120 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polyline :points="card.trend" :stroke="card.trendColor" stroke-width="2" fill="none" />
                </svg>
              </article>
            </section>

            <section class="panel-card filter-table-panel">
              <div class="panel-head compact">
                <div>
                  <h2>检索与筛选</h2>
                </div>
              </div>

              <div class="search-row">
                <select class="field-select field-year">
                  <option>全部年份</option>
                  <option>2026</option>
                  <option>2025</option>
                </select>
                <select class="field-select field-month">
                  <option>全部月份</option>
                  <option>01</option>
                  <option>02</option>
                  <option>03</option>
                </select>
                <select class="field-select field-status">
                  <option>全部状态</option>
                  <option>待受理</option>
                  <option>已立案</option>
                  <option>已办结</option>
                </select>
                <label class="field-search">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input placeholder="搜索编号 / 店铺 / 商品 / 执照 / 单号..." />
                </label>
                <button class="ghost-btn reset-btn" @click="switchModule('cases')">重置</button>
              </div>

              <div class="preview-table-wrap">
                <table class="preview-table">
                  <thead>
                    <tr>
                      <th>案件编号</th>
                      <th>店铺名称</th>
                      <th>状态</th>
                      <th>更新时间</th>
                      <th>更多操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in workbenchTableCases" :key="item.id">
                      <td class="mono-text">
                        <router-link :to="'/case/' + item.id" class="mono-link">{{ item.caseNumber || '待生成' }}</router-link>
                      </td>
                      <td>{{ item.shopName || item.licenseName || '—' }}</td>
                      <td>
                        <StatusBadge :status="getEffectiveStatus(item)" :profit="item.profit" />
                      </td>
                      <td>{{ formatDate(item.updatedAt) }}</td>
                      <td>
                        <button class="more-btn" @click="$router.push('/case/' + item.id)">···</button>
                      </td>
                    </tr>
                    <tr v-if="!workbenchTableCases.length">
                      <td colspan="5" class="empty-cell">暂无简表案件</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </section>

          <section v-else-if="resolvedModule === 'cases'" class="module-page cases-page">
            <div class="module-hero">
              <div>
                <div class="hero-breadcrumb">案件管理</div>
                <h1 class="module-title">完整案件列表与业务操作</h1>
                <p class="module-desc">完整搜索、年份筛选、月份筛选、状态筛选、原案件列表、上传、新建案件和详情入口都保留在这里。</p>
              </div>
            </div>
            <div class="module-body">
              <router-view />
            </div>
          </section>

          <section v-else-if="resolvedModule === 'materials'" class="module-page">
            <div class="module-hero">
              <div>
                <div class="hero-breadcrumb">材料归档</div>
                <h1 class="module-title">材料上传与归档概览</h1>
                <p class="module-desc">承接材料上传入口、云端文件概览、最近上传以及图片 / PDF / Word 分类入口。</p>
              </div>
            </div>
            <div class="module-grid module-grid-4">
              <article class="panel-card module-tile"><h3>材料上传入口</h3><p>连接拍照上传、本地上传与批量导入入口。</p></article>
              <article class="panel-card module-tile"><h3>云端文件概览</h3><p>汇总已归档文件总数与关联案件数量。</p></article>
              <article class="panel-card module-tile"><h3>最近上传</h3><p>展示最新归档记录与材料流转摘要。</p></article>
              <article class="panel-card module-tile"><h3>分类入口</h3><p>图片、PDF、Word、材料预览入口统一收口。</p></article>
            </div>
          </section>

          <section v-else-if="resolvedModule === 'review'" class="module-page">
            <div class="module-hero">
              <div>
                <div class="hero-breadcrumb">复议跟踪</div>
                <h1 class="module-title">复议期限与后续处置概览</h1>
                <p class="module-desc">聚合可复议案件、复议期限提醒、一年保护期提醒、后续处置记录和超期事项。</p>
              </div>
            </div>
            <div class="module-grid module-grid-5">
              <article class="panel-card module-tile"><h3>可复议案件</h3><p>当前复议相关案件 {{ dashboardStats.reviewing }} 件。</p></article>
              <article class="panel-card module-tile"><h3>复议期限提醒</h3><p>按结果日期和期限提示集中查看风险。</p></article>
              <article class="panel-card module-tile"><h3>一年保护期</h3><p>需要人工复核的保护期事项在这里集中汇总。</p></article>
              <article class="panel-card module-tile"><h3>后续处置记录</h3><p>承接案件详情页中的处置摘要与状态概览。</p></article>
              <article class="panel-card module-tile"><h3>超期事项</h3><p>当前逾期提醒 {{ overdueList.length }} 项。</p></article>
            </div>
          </section>

          <section v-else-if="resolvedModule === 'reports'" class="module-page">
            <div class="module-hero">
              <div>
                <div class="hero-breadcrumb">数据报表</div>
                <h1 class="module-title">案件统计与经营数据总览</h1>
                <p class="module-desc">承接案件总数、调解成功、赔偿总额、不予立案、已处罚、本月花费、本月盈利和状态分布。</p>
              </div>
            </div>
            <div class="report-grid">
              <article v-for="item in reportStats" :key="item.label" class="panel-card report-card">
                <div class="report-icon" :style="{ color: item.color }">
                  <span v-html="item.icon"></span>
                </div>
                <div class="report-label">{{ item.label }}</div>
                <div class="report-value">{{ item.value }}</div>
              </article>
            </div>
          </section>

          <section v-else class="module-page">
            <div class="module-hero">
              <div>
                <div class="hero-breadcrumb">系统设置</div>
                <h1 class="module-title">基础设置与部署信息</h1>
                <p class="module-desc">承接基础设置、存储设置、账号设置、部署信息、当前稳定 bundle 和回滚目标。</p>
              </div>
            </div>
            <div class="module-grid module-grid-3">
              <article class="panel-card module-tile"><h3>基础设置</h3><p>编号规则、状态枚举、基础参数入口。</p></article>
              <article class="panel-card module-tile"><h3>存储设置</h3><p>本地与云端存储路径、空间策略。</p></article>
              <article class="panel-card module-tile"><h3>账号设置</h3><p>管理员账户和权限入口。</p></article>
              <article class="panel-card module-tile"><h3>部署信息</h3><p>当前环境、更新时间与稳定发布记录。</p></article>
              <article class="panel-card module-tile"><h3>当前稳定 bundle</h3><p>{{ currentStableBundle }}</p></article>
              <article class="panel-card module-tile"><h3>回滚目标</h3><p>{{ rollbackBundle }}</p></article>
            </div>
          </section>

          <footer class="shell-footer">案件处置工作台 · 法律线索管理</footer>
        </template>
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

const currentStableBundle = 'index-BthJy9au.js'
const rollbackBundle = 'index-CgpVIwH3.js'

const iconGrid = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`
const iconFolder = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`
const iconArchive = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`
const iconSearch = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`
const iconChart = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`
const iconSettings = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`
const iconFolderLarge = iconFolder
const iconClockLarge = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
const iconBalanceLarge = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v18"/><path d="M5 7h14"/><path d="M6 7l-3 5h6l-3-5z"/><path d="M18 7l-3 5h6l-3-5z"/><path d="M8 21h8"/></svg>`
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

const isCaseFlowRoute = computed(() => route.path !== '/' && route.path.startsWith('/case/'))

const resolvedModule = computed(() => {
  if (isCaseFlowRoute.value) return 'cases'
  if (route.path === '/settings') return 'settings'
  return activeModule.value
})

const localCases = computed(() => store.cases || [])

const dashboardStats = computed(() => {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const closedThisMonth = localCases.value.filter((item) => {
    const status = getEffectiveStatus(item)
    if (!['closed', 'decided', 'exempted', 'not_punished'].includes(status)) return false
    const raw = item.reportResultDate || item.mediationDate || item.updatedAt
    const date = new Date(raw || 0)
    return !Number.isNaN(date.getTime()) && date.getFullYear() === currentYear && date.getMonth() === currentMonth
  }).length

  const reviewing = localCases.value.filter((item) => Array.isArray(item.disposals) && item.disposals.some((d) => d.disposalType === 'administrative_review')).length

  return {
    total: store.stats?.total ?? 0,
    pending: store.stats?.pending ?? 0,
    filed: store.stats?.filed ?? 0,
    reported: store.stats?.reported ?? 0,
    closed: store.stats?.closed ?? 0,
    decided: store.stats?.decided ?? 0,
    reviewing,
    closedThisMonth,
  }
})

const statCards = computed(() => [
  { label: '案件总数', value: dashboardStats.value.total, icon: iconFolderLarge, color: '#d6a650' },
  { label: '待受理', value: dashboardStats.value.pending, icon: iconClockLarge, color: '#4c8dff' },
  { label: '已立案', value: dashboardStats.value.filed, icon: iconBalanceLarge, color: '#a78bfa' },
  { label: '复议跟进', value: dashboardStats.value.reviewing, icon: iconSearch, color: '#22d3ee' },
  { label: '本月办结', value: dashboardStats.value.closedThisMonth, icon: iconCheckLarge, color: '#34d399' },
])

const statusFilters = computed(() => [
  { key: 'all', label: '全部', count: dashboardStats.value.total, dotClass: 'dot-slate' },
  { key: 'pending_report', label: '待受理', count: dashboardStats.value.pending, dotClass: 'dot-amber' },
  { key: 'filed', label: '已立案', count: dashboardStats.value.filed, dotClass: 'dot-blue' },
  { key: 'reported', label: '不予受理', count: dashboardStats.value.reported, dotClass: 'dot-red' },
  { key: 'closed', label: '已办结', count: dashboardStats.value.closed, dotClass: 'dot-green' },
  { key: 'reviewing', label: '复议中', count: dashboardStats.value.reviewing, dotClass: 'dot-cyan' },
])

const filteredWorkbenchCases = computed(() => {
  const source = [...localCases.value]
  const sorted = source.sort((a, b) => {
    const at = new Date(a.updatedAt || a.createdAt || 0).getTime()
    const bt = new Date(b.updatedAt || b.createdAt || 0).getTime()
    return bt - at
  })

  if (workbenchFilter.value === 'all') return sorted
  if (workbenchFilter.value === 'reviewing') {
    return sorted.filter((item) => Array.isArray(item.disposals) && item.disposals.some((d) => d.disposalType === 'administrative_review'))
  }
  return sorted.filter((item) => getEffectiveStatus(item) === workbenchFilter.value)
})

const summaryPreviewCases = computed(() => filteredWorkbenchCases.value.slice(0, 3))
const workbenchTableCases = computed(() => filteredWorkbenchCases.value.slice(0, 4))
const metricCloudFiles = computed(() => Math.max(18, localCases.value.length))

const metricCards = computed(() => [
  {
    label: '当月花费',
    value: '¥7,729.64',
    sub: '点击定位到案件列表',
    trend: '0,26 20,22 40,24 60,16 80,18 100,10 120,12',
    trendColor: 'rgba(214, 166, 80, 0.55)',
    highlightClass: 'metric-value-gold',
  },
  {
    label: '当月盈利',
    value: '¥12,560.00',
    sub: '点击定位到案件列表',
    trend: '0,28 20,24 40,20 60,22 80,14 100,12 120,8',
    trendColor: 'rgba(52, 211, 153, 0.62)',
    highlightClass: 'metric-value-cyan',
  },
  {
    label: '云端文件',
    value: `${metricCloudFiles.value} 个`,
    sub: '云端文件总数',
    trend: '',
    trendColor: '',
    highlightClass: 'metric-value-default',
  },
  {
    label: '磁盘占用',
    value: '5.3 GB',
    sub: '磁盘已使用空间',
    trend: '',
    trendColor: '',
    highlightClass: 'metric-value-default',
  },
])

const reportStats = computed(() => [
  { label: '案件总数', value: dashboardStats.value.total, icon: iconFolderLarge, color: '#d6a650' },
  { label: '调解成功数', value: dashboardStats.value.decided, icon: iconCheckLarge, color: '#34d399' },
  { label: '赔偿总额', value: '¥12,560.00', icon: iconCoinLarge, color: '#d6a650' },
  { label: '不予立案数量', value: store.stats?.rejected ?? 0, icon: iconWarnLarge, color: '#f87171' },
  { label: '已处罚数量', value: dashboardStats.value.closed, icon: iconBalanceLarge, color: '#a78bfa' },
  { label: '本月花费', value: '¥7,729.64', icon: iconCoinLarge, color: '#f59e0b' },
  { label: '本月盈利', value: '¥12,560.00', icon: iconTrendLarge, color: '#34d399' },
  { label: '状态分布', value: '8 类', icon: iconChart, color: '#22d3ee' },
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

  if (module !== 'cases' && (isCaseFlowRoute.value || route.path === '/settings')) {
    router.push('/')
    return
  }

  if (module === 'cases' && route.path === '/settings') {
    router.push('/')
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
  reminderService.start(localCases.value, 60000)
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
    radial-gradient(circle at 82% 4%, rgba(59, 130, 246, 0.12), transparent 32%),
    radial-gradient(circle at 18% 0%, rgba(214, 166, 80, 0.07), transparent 28%),
    linear-gradient(135deg, #06101f 0%, #09172b 45%, #07111f 100%);
  color: #eaf2ff;
}

.shell-sidebar {
  width: 88px;
  min-height: 100vh;
  flex-shrink: 0;
  background: rgba(7, 17, 31, 0.94);
  border-right: 1px solid rgba(148, 163, 184, 0.16);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
}

.brand-badge {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: rgba(214, 166, 80, 0.12);
  border: 1px solid rgba(214, 166, 80, 0.35);
  color: #d6a650;
  display: flex;
  align-items: center;
  justify-content: center;
}
.brand-badge svg { width: 26px; height: 26px; }

.sidebar-nav {
  width: 100%;
  margin-top: 18px;
  display: flex;
  flex-direction: column;
}

.sidebar-link {
  position: relative;
  height: 64px;
  margin: 6px 10px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  border: 1px solid transparent;
  background: transparent;
  color: #93a4ba;
  cursor: pointer;
}
.sidebar-link:hover {
  background: rgba(148, 163, 184, 0.06);
  color: #dbeafe;
}
.sidebar-link-active {
  color: #f3c77b;
  background: rgba(214, 166, 80, 0.10);
  border: 1px solid rgba(214, 166, 80, 0.35);
  box-shadow: inset 0 0 0 1px rgba(214, 166, 80, 0.12);
}
.sidebar-link-icon { width: 18px; height: 18px; display: block; }
.sidebar-link-icon :deep(svg) { width: 18px; height: 18px; }
.sidebar-link-text { line-height: 1; }
.sidebar-link-rail {
  position: absolute;
  left: -10px;
  top: 14px;
  bottom: 14px;
  width: 3px;
  border-radius: 999px;
  background: #d6a650;
}

.shell-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}

.shell-topbar {
  height: 48px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 10px 28px 0;
}

.topbar-tools {
  display: flex;
  align-items: center;
  gap: 10px;
}

.topbar-search {
  width: 280px;
  height: 38px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border-radius: 12px;
  background: rgba(15, 30, 52, 0.68);
  border: 1px solid rgba(148, 163, 184, 0.18);
  color: #64748b;
}
.topbar-search svg,
.topbar-user svg,
.topbar-icon-button svg,
.field-search svg,
.ghost-btn-arrow svg {
  width: 14px;
  height: 14px;
}
.topbar-search input,
.field-search input {
  width: 100%;
  background: transparent;
  border: 0;
  outline: 0;
  color: #eaf2ff;
}
.topbar-search input::placeholder,
.field-search input::placeholder { color: #93a4ba; }

.topbar-icon-button {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 30, 52, 0.68);
  color: #dbeafe;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.icon-dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #d6a650;
}

.topbar-user {
  height: 38px;
  padding: 0 12px 0 10px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 30, 52, 0.68);
  color: #dbeafe;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.topbar-user-avatar {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(214, 166, 80, 0.18);
  color: #d6a650;
  font-size: 10px;
  font-weight: 700;
}
.topbar-user-name { font-size: 13px; }

.notify-panel {
  position: absolute;
  top: 54px;
  right: 28px;
  z-index: 30;
  width: 320px;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 30, 52, 0.95);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.36);
  backdrop-filter: blur(18px);
}
.notify-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  color: #f3c77b;
}
.notify-head button { background: transparent; border: 0; color: #93a4ba; font-size: 20px; cursor: pointer; }
.notify-body { max-height: 320px; overflow: auto; }
.notify-empty { padding: 26px 16px; text-align: center; color: #93a4ba; }
.notify-item {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
  color: inherit;
  text-decoration: none;
}
.notify-dot { width: 8px; height: 8px; border-radius: 999px; margin-top: 7px; }
.notify-dot-danger { background: #f87171; }
.notify-dot-warn { background: #f59e0b; }
.notify-copy { flex: 1; min-width: 0; }
.notify-title { color: #eaf2ff; font-size: 13px; font-weight: 600; }
.notify-sub,
.notify-msg,
.notify-link { color: #93a4ba; font-size: 12px; }

.shell-content {
  flex: 1;
  overflow: auto;
  padding: 20px 24px 18px;
}

.dashboard-page,
.module-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hero-panel,
.panel-card,
.module-hero {
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 30, 52, 0.72);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(16px);
}

.hero-panel {
  padding: 16px 18px;
}
.hero-layout {
  min-height: 142px;
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  gap: 14px;
  align-items: stretch;
}
.hero-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.hero-breadcrumb {
  font-size: 12px;
  color: #93a4ba;
  letter-spacing: 0.06em;
}
.hero-title,
.module-title {
  margin: 6px 0 0;
  font-size: 38px;
  line-height: 1.1;
  font-weight: 800;
  color: #eaf2ff;
}
.hero-subtitle {
  margin-top: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #d6a650;
}
.hero-desc,
.module-desc {
  margin-top: 8px;
  max-width: 620px;
  font-size: 13px;
  line-height: 1.7;
  color: #93a4ba;
}

.hero-stats-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}
.hero-stat-card {
  min-width: 0;
  height: 94px;
  border-radius: 18px;
  padding: 14px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: linear-gradient(180deg, rgba(20, 42, 72, 0.86), rgba(13, 29, 52, 0.72));
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.26);
}
.hero-stat-icon {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.hero-stat-icon :deep(svg) { width: 18px; height: 18px; }
.hero-stat-main { min-width: 0; display: flex; flex-direction: column; justify-content: space-between; }
.hero-stat-label { font-size: 13px; color: #93a4ba; }
.hero-stat-value { margin-top: 8px; font-size: 28px; font-weight: 800; line-height: 1; color: #eaf2ff; }

.status-bar-panel {
  height: 52px;
  padding: 8px;
  border-radius: 18px;
  background: rgba(15, 30, 52, 0.66);
  border: 1px solid rgba(148, 163, 184, 0.16);
  display: flex;
  align-items: center;
  gap: 8px;
}
.status-pill {
  height: 36px;
  padding: 0 12px;
  border-radius: 12px;
  color: #93a4ba;
  background: transparent;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.status-pill-active {
  color: #f3c77b;
  background: rgba(214, 166, 80, 0.10);
  border: 1px solid rgba(214, 166, 80, 0.55);
}
.status-pill-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  flex-shrink: 0;
}
.dot-slate { background: #94a3b8; }
.dot-amber { background: #f59e0b; }
.dot-blue { background: #60a5fa; }
.dot-red { background: #f87171; }
.dot-green { background: #34d399; }
.dot-cyan { background: #22d3ee; }
.status-pill-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 22px;
  padding: 0 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: inherit;
  font-weight: 700;
  font-size: 12px;
}

.followup-panel,
.filter-table-panel,
.module-hero,
.metric-card,
.module-tile,
.report-card {
  padding: 16px 18px;
}
.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
}
.panel-head.compact { align-items: center; }
.panel-head h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #eaf2ff;
}
.panel-head p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #93a4ba;
}
.panel-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.gold-btn,
.ghost-btn,
.more-btn {
  height: 38px;
  border-radius: 12px;
  cursor: pointer;
}
.gold-btn {
  padding: 0 16px;
  border: 0;
  background: linear-gradient(135deg, #f3c77b, #d6a650);
  color: #09111f;
  font-weight: 700;
}
.ghost-btn {
  padding: 0 14px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(15, 30, 52, 0.68);
  color: #dbeafe;
}
.ghost-btn-arrow { display: inline-flex; align-items: center; gap: 8px; }
.reset-btn { color: #dbeafe; }

.data-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.data-pill {
  height: 30px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(7, 17, 31, 0.46);
  border: 1px solid rgba(148, 163, 184, 0.16);
  font-size: 12px;
  color: #93a4ba;
}
.data-pill strong { color: #eaf2ff; font-weight: 700; }

.followup-summary-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.followup-summary-card {
  border-radius: 16px;
  padding: 12px 14px;
  background: rgba(7, 17, 31, 0.42);
  border: 1px solid rgba(148, 163, 184, 0.12);
}
.followup-summary-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}
.followup-summary-title {
  color: #eaf2ff;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}
.followup-summary-meta {
  margin-top: 6px;
  font-size: 12px;
  color: #93a4ba;
}
.followup-summary-empty {
  grid-column: 1 / -1;
  border-radius: 16px;
  padding: 16px;
  text-align: center;
  background: rgba(7, 17, 31, 0.42);
  border: 1px solid rgba(148, 163, 184, 0.12);
  color: #93a4ba;
}
.followup-panel :deep(.status-badge),
.preview-table :deep(.status-badge) {
  border: 1px solid rgba(148, 163, 184, 0.2) !important;
  background: rgba(7, 17, 31, 0.55) !important;
  color: #dbeafe !important;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
.metric-card {
  position: relative;
  height: 88px;
  overflow: hidden;
}
.metric-label { font-size: 13px; color: #93a4ba; }
.metric-value {
  margin-top: 6px;
  font-size: 24px;
  line-height: 1;
  font-weight: 800;
  color: #eaf2ff;
}
.metric-value-gold { color: #f3c77b; }
.metric-value-cyan { color: #7dd3fc; }
.metric-sub { margin-top: 6px; font-size: 11px; color: #93a4ba; }
.metric-trend {
  position: absolute;
  right: 12px;
  bottom: 10px;
  width: 110px;
  height: 34px;
  opacity: 0.95;
}

.search-row {
  display: grid;
  grid-template-columns: 120px 110px 140px minmax(280px, 1fr) auto;
  gap: 10px;
  margin-top: 12px;
  margin-bottom: 12px;
}
.field-select,
.field-search {
  height: 38px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(7, 17, 31, 0.48);
  color: #eaf2ff;
}
.field-select {
  padding: 0 34px 0 12px;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2393a4ba' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}
.field-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  color: #93a4ba;
}

.preview-table-wrap {
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.10);
}
.preview-table {
  width: 100%;
  border-collapse: collapse;
}
.preview-table th,
.preview-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid rgba(148, 163, 184, 0.10);
}
.preview-table th {
  background: rgba(7, 17, 31, 0.52);
  color: #93a4ba;
  font-size: 12px;
  font-weight: 500;
}
.preview-table tbody tr {
  background: rgba(15, 30, 52, 0.36);
}
.preview-table tbody tr:hover {
  background: rgba(30, 64, 110, 0.28);
}
.preview-table td { color: #eaf2ff; font-size: 13px; }
.mono-text {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  color: #93a4ba;
}
.mono-link {
  color: #dbeafe;
  text-decoration: none;
}
.more-btn {
  width: 38px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(7, 17, 31, 0.44);
  color: #dbeafe;
  font-size: 20px;
  line-height: 1;
}
.empty-cell { color: #93a4ba !important; text-align: center; }

.module-grid,
.report-grid {
  display: grid;
  gap: 12px;
}
.module-grid-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.module-grid-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
.module-grid-3,
.report-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.module-tile h3,
.report-label {
  margin: 0 0 10px;
  font-size: 16px;
  color: #eaf2ff;
}
.module-tile p { margin: 0; font-size: 13px; line-height: 1.7; color: #93a4ba; }
.report-icon { width: 22px; height: 22px; color: inherit; }
.report-icon :deep(svg) { width: 22px; height: 22px; }
.report-value { margin-top: 6px; font-size: 28px; font-weight: 800; color: #eaf2ff; }
.module-body :deep(.space-y-4) { margin-top: 0; }
.shell-footer {
  padding: 4px 2px 0;
  font-size: 12px;
  color: rgba(147, 164, 186, 0.72);
}

@media (max-width: 1480px) {
  .hero-layout { grid-template-columns: 1fr; }
  .hero-stats-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); }
}

@media (max-width: 1280px) {
  .hero-stats-grid,
  .metric-grid,
  .module-grid-4,
  .module-grid-5,
  .module-grid-3,
  .report-grid,
  .followup-summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .search-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 900px) {
  .workbench-shell { flex-direction: column; }
  .shell-sidebar {
    width: 100%;
    min-height: auto;
    padding: 12px 10px;
    overflow-x: auto;
  }
  .sidebar-nav { flex-direction: row; margin-top: 0; }
  .brand-badge { display: none; }
  .sidebar-link-rail { display: none; }
  .shell-topbar { justify-content: stretch; height: auto; padding: 12px 16px 0; }
  .topbar-tools, .panel-head { width: 100%; flex-direction: column; align-items: stretch; }
  .topbar-search { width: 100%; }
  .shell-content { padding: 16px; }
  .hero-title, .module-title { font-size: 32px; }
  .hero-stats-grid,
  .metric-grid,
  .module-grid-4,
  .module-grid-5,
  .module-grid-3,
  .report-grid,
  .followup-summary-grid,
  .search-row {
    grid-template-columns: 1fr;
  }
}
</style>
