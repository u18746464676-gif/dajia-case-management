<template>
  <div class="app-shell flex h-screen overflow-hidden">

    <!-- ========== 左侧竖向导航 ========== -->
    <aside class="sidebar flex flex-shrink-0 flex-col items-center py-5 px-0 w-[88px]">
      <!-- 法律天平图标 -->
      <div class="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(214,166,80,0.4)] bg-[rgba(214,166,80,0.08)]">
        <svg width="28" height="28" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="18" y="38" width="8" height="2" rx="1" fill="#d6a650"/>
          <rect x="21" y="14" width="2" height="24" rx="1" fill="#d6a650"/>
          <rect x="6" y="12" width="32" height="2" rx="1" fill="#d6a650"/>
          <path d="M7 14 L7 18 Q7 20 9 20 L13 20 Q15 20 15 18 L15 14" stroke="#d6a650" stroke-width="1.5" fill="none"/>
          <line x1="6" y1="14" x2="16" y2="14" stroke="#d6a650" stroke-width="1.5"/>
          <path d="M29 14 L29 18 Q29 20 31 20 L35 20 Q37 20 37 18 L37 14" stroke="#d6a650" stroke-width="1.5" fill="none"/>
          <line x1="28" y1="14" x2="38" y2="14" stroke="#d6a650" stroke-width="1.5"/>
          <circle cx="22" cy="10" r="3" fill="#d6a650"/>
          <line x1="22" y1="13" x2="22" y2="17" stroke="#d6a650" stroke-width="1"/>
        </svg>
      </div>

      <!-- 导航项 -->
      <nav class="flex flex-col gap-1 w-full px-2">
        <button
          v-for="(item, idx) in navItems"
          :key="item.id"
          class="nav-item flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all duration-200 relative"
          :class="activeNav === item.id ? 'nav-item-active' : 'nav-item-inactive'"
          @click="activeNav = item.id"
        >
          <span class="text-xl">{{ item.icon }}</span>
          <span class="text-[10px] font-medium leading-tight">{{ item.label }}</span>
          <div v-if="activeNav === item.id" class="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full bg-[#d6a650]"></div>
        </button>
      </nav>

      <!-- 底部收起按钮 -->
      <div class="mt-auto px-2 w-full">
        <button class="nav-item flex flex-col items-center gap-1 py-2.5 rounded-xl w-full transition-all duration-200 nav-item-inactive">
          <span class="text-lg">⬅</span>
          <span class="text-[10px] font-medium leading-tight">收起</span>
        </button>
      </div>
    </aside>

    <!-- ========== 主内容区 ========== -->
    <div class="main-area flex flex-col flex-1 min-w-0 overflow-hidden">

      <!-- 顶部工具栏 -->
      <header class="topbar flex flex-shrink-0 items-center justify-between px-6 py-3">
        <div class="flex items-center gap-3">
          <span class="text-sm text-[#93a4ba]">案件治理 / 合规处置 / 复议跟踪</span>
        </div>
        <div class="flex items-center gap-3">
          <!-- 搜索框 -->
          <div class="search-box flex items-center gap-2 rounded-xl border border-[rgba(148,163,184,0.22)] bg-[rgba(15,30,52,0.65)] px-3.5 py-2">
            <span class="text-sm text-[#64748b]">🔍</span>
            <input
              type="text"
              class="search-input bg-transparent text-sm text-[#eaf2ff] placeholder:text-[#64748b] outline-none w-56"
              placeholder="搜索案件、店铺或编号..."
            />
          </div>
          <!-- 通知铃铛 -->
          <button
            @click="showNotifications = !showNotifications"
            class="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(148,163,184,0.22)] bg-[rgba(15,30,52,0.65)] text-[#93a4ba] hover:border-[rgba(148,163,184,0.4)] hover:text-[#eaf2ff] transition-all duration-200"
          >
            <span class="text-base">🔔</span>
            <span
              v-if="overdueList.length > 0"
              class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#d6a650] text-[10px] font-bold text-[#09111f]"
            >
              {{ overdueList.length > 9 ? '9+' : overdueList.length }}
            </span>
          </button>
          <!-- 管理员 -->
          <button class="flex items-center gap-2 rounded-xl border border-[rgba(148,163,184,0.22)] bg-[rgba(15,30,52,0.65)] px-3 py-1.5 text-sm text-[#93a4ba] hover:border-[rgba(148,163,184,0.4)] hover:text-[#eaf2ff] transition-all duration-200">
            <span>👤</span>
            <span class="text-xs">管理员</span>
          </button>
        </div>
      </header>

      <!-- 提醒弹窗 -->
      <div
        v-if="showNotifications"
        class="fixed right-6 top-16 z-50 w-80 rounded-2xl border border-[rgba(148,163,184,0.22)] bg-[rgba(15,30,52,0.96)] shadow-2xl backdrop-blur-xl overflow-hidden"
      >
        <div class="flex items-center justify-between border-b border-[rgba(148,163,184,0.18)] px-4 py-3">
          <span class="text-sm font-semibold text-[#d6a650]">⚠️ 逾期提醒</span>
          <button @click="showNotifications = false" class="text-lg text-[#64748b] hover:text-[#eaf2ff] transition-colors">×</button>
        </div>
        <div class="max-h-72 overflow-y-auto">
          <div v-if="overdueList.length === 0" class="py-8 text-center">
            <span class="text-3xl">✅</span>
            <p class="mt-2 text-sm text-[#64748b]">暂无逾期案件</p>
          </div>
          <div
            v-for="item in overdueList"
            :key="item.id + item.type"
            class="flex items-start gap-2 border-b border-[rgba(148,163,184,0.1)] px-3 py-2.5 transition-colors"
            :class="item.urgency === 'danger' ? 'bg-[rgba(248,113,113,0.08)]' : 'bg-[rgba(245,158,11,0.06)]'"
          >
            <span class="text-base mt-0.5">{{ item.urgency === 'danger' ? '🔴' : '🟡' }}</span>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-[#eaf2ff] truncate">{{ item.shopName }}</div>
              <div class="text-xs text-[#64748b]">{{ item.productName }}</div>
              <div class="text-xs mt-0.5" :class="item.urgency === 'danger' ? 'text-[#f87171]' : 'text-[#f59e0b]'">{{ item.message }}</div>
            </div>
            <router-link
              :to="'/case/' + item.id"
              @click="showNotifications = false"
              class="text-xs text-[#64748b] hover:text-[#d6a650] whitespace-nowrap transition-colors"
            >
              查看 →
            </router-link>
          </div>
        </div>
      </div>

      <!-- 可滚动主内容 -->
      <main class="flex-1 overflow-y-auto px-6 pb-6">

        <!-- Hero 标题区 -->
        <div class="pt-5 pb-5">
          <div class="mb-1 text-[11px] uppercase tracking-[0.28em] text-[#64748b]">案件治理 / 合规处置 / 复议跟踪</div>
          <h1 class="mt-2 text-[40px] font-extrabold text-[#eaf2ff] leading-tight tracking-wide">案件处置工作台</h1>
          <div class="mt-2 text-[18px] font-medium text-[#d6a650] tracking-[0.18em]">循法而行，据证而断</div>
          <p class="mt-3 max-w-2xl text-[13px] leading-6 text-[#64748b]">围绕案件建档、材料归集、流程处置与复议跟踪形成统一工作界面，保持信息清晰、处置有据、留痕完整。</p>
        </div>

        <!-- 五个核心统计卡片 -->
        <div class="grid grid-cols-5 gap-4 mb-5">
          <div v-for="card in statCards" :key="card.label" class="stat-card flex flex-col gap-2 rounded-2xl border border-[rgba(148,163,184,0.18)] bg-[rgba(15,30,52,0.72)] p-4 backdrop-blur-xl" :style="card.shadow">
            <div class="flex items-center justify-between">
              <span class="text-[11px] uppercase tracking-[0.16em] text-[#64748b] font-medium">{{ card.label }}</span>
              <span class="text-xl">{{ card.icon }}</span>
            </div>
            <div class="text-[32px] font-bold text-[#eaf2ff] leading-none">{{ card.value }}</div>
          </div>
        </div>

        <!-- 状态筛选条 -->
        <div class="rounded-2xl border border-[rgba(148,163,184,0.18)] bg-[rgba(15,30,52,0.72)] backdrop-blur-xl px-4 py-2 mb-5">
          <div class="flex items-center gap-2 overflow-x-auto">
            <router-link
              v-for="s in statusFilters"
              :key="s.key"
              :to="s.route"
              class="status-pill flex items-center gap-1.5 flex-shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200"
              :class="s.active ? 'status-pill-active' : 'status-pill-inactive'"
            >
              <span v-if="s.dot" class="h-1.5 w-1.5 rounded-full" :class="s.active ? 'bg-white' : s.dotColor"></span>
              <span :class="s.active ? 'text-[#09111f] font-semibold' : 'text-[#93a4ba]'">{{ s.count }}</span>
              <span :class="s.active ? 'text-[#09111f]' : 'text-[#64748b]'">{{ s.label }}</span>
            </router-link>
          </div>
        </div>

        <!-- 待跟进案件模块 -->
        <div class="rounded-2xl border border-[rgba(148,163,184,0.18)] bg-[rgba(15,30,52,0.72)] backdrop-blur-xl px-5 py-4 mb-5">
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h2 class="text-[18px] font-semibold text-[#eaf2ff]">待跟进案件</h2>
              <p class="text-[12px] text-[#64748b] mt-0.5">优先展示当前需要处理的案件，支持按状态、月份、关键词快速筛选。</p>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <button class="btn-secondary-dark text-xs px-3.5 py-2 flex items-center gap-1.5">
                <span>📷</span>拍照上传
              </button>
              <button class="btn-gold text-xs px-4 py-2 flex items-center gap-1.5">
                <span>➕</span>新建案件
              </button>
              <button class="btn-secondary-dark text-xs px-3.5 py-2 flex items-center gap-1.5">
                <span>⋯</span>更多操作
              </button>
            </div>
          </div>

          <!-- 数据胶囊 -->
          <div class="flex flex-wrap gap-2 mb-4">
            <span v-for="p in pagePills" :key="p.label" class="data-pill">{{ p.label }}：<strong>{{ p.value }}</strong></span>
          </div>

          <!-- 案件列表 -->
          <router-view />
        </div>

        <!-- 经营数据卡片 -->
        <div class="grid grid-cols-4 gap-4 mb-5">
          <div v-for="m in metricCards" :key="m.label" class="metric-card rounded-2xl border border-[rgba(148,163,184,0.18)] bg-[rgba(15,30,52,0.72)] p-4 backdrop-blur-xl">
            <div class="text-[11px] uppercase tracking-[0.16em] text-[#64748b] mb-1">{{ m.label }}</div>
            <div class="text-[20px] font-bold text-[#eaf2ff] mb-0.5">{{ m.value }}</div>
            <div class="text-[11px] text-[#64748b]">{{ m.sub }}</div>
          </div>
        </div>

        <!-- 检索与筛选 -->
        <div class="rounded-2xl border border-[rgba(148,163,184,0.18)] bg-[rgba(15,30,52,0.72)] backdrop-blur-xl px-5 py-4">
          <h3 class="text-[15px] font-semibold text-[#eaf2ff] mb-3">检索与筛选</h3>
          <div class="flex flex-wrap gap-3 items-end">
            <div class="flex flex-col gap-1">
              <label class="text-[11px] text-[#64748b] uppercase tracking-wider">年份</label>
              <select class="filter-select">
                <option>全部</option><option>2025</option><option>2024</option>
              </select>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[11px] text-[#64748b] uppercase tracking-wider">月份</label>
              <select class="filter-select">
                <option>全部</option><option>01</option><option>02</option><option>03</option>
              </select>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[11px] text-[#64748b] uppercase tracking-wider">案件状态</label>
              <select class="filter-select">
                <option>全部</option><option>待受理</option><option>已立案</option><option>已办结</option>
              </select>
            </div>
            <div class="flex-1 min-w-48">
              <label class="text-[11px] text-[#64748b] uppercase tracking-wider">搜索</label>
              <div class="flex items-center gap-2 rounded-xl border border-[rgba(148,163,184,0.22)] bg-[rgba(7,17,31,0.6)] px-3 py-2">
                <span class="text-sm text-[#64748b]">🔍</span>
                <input type="text" class="bg-transparent text-sm text-[#eaf2ff] placeholder:text-[#64748b] outline-none w-full" placeholder="搜索编号 / 店铺 / 商品 / 执照 / 单号..." />
              </div>
            </div>
            <button class="btn-secondary-dark text-xs px-4 py-2">重置</button>
          </div>
        </div>

      </main>

      <!-- 底部版权 -->
      <footer class="flex-shrink-0 border-t border-[rgba(148,163,184,0.12)] bg-[rgba(7,17,31,0.88)] px-6 py-3 text-center text-[12px] text-[#64748b]">
        案件处置工作台 · 法律事务管理
      </footer>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCaseStore } from '@/stores/case'
import { ReminderService } from '@/lib/notification'
import { useRoute } from 'vue-router'

const store = useCaseStore()
const route = useRoute()
const showNotifications = ref(false)
const overdueList = ref([])
const activeNav = ref('workspace')

const navItems = [
  { id: 'workspace', label: '工作台', icon: '🏠' },
  { id: 'cases', label: '案件管理', icon: '📁' },
  { id: 'archive', label: '材料归档', icon: '📋' },
  { id: 'review', label: '复议跟踪', icon: '🔍' },
  { id: 'report', label: '数据报表', icon: '📊' },
  { id: 'settings', label: '系统设置', icon: '⚙️' },
]

const statCards = computed(() => [
  { label: '案件总数', value: store.stats.total, icon: '📁', shadow: '' },
  { label: '待受理', value: store.stats.pending, icon: '⏳', shadow: '' },
  { label: '已立案', value: store.stats.filed, icon: '⚖️', shadow: '' },
  { label: '复议跟进', value: store.stats.reviewing, icon: '🔎', shadow: '' },
  { label: '本月办结', value: store.stats.closedThisMonth, icon: '✅', shadow: '' },
])

const currentStatus = computed(() => route.query.status || '')

const statusFilters = computed(() => {
  const s = currentStatus.value
  return [
    { key: 'all', label: '全部', count: store.stats.total, route: '/', active: !s, dot: false, dotColor: '' },
    { key: 'pending', label: '待受理', count: store.stats.pending, route: '/?status=pending_report', active: s === 'pending_report', dot: true, dotColor: 'bg-yellow-500' },
    { key: 'filed', label: '已立案', count: store.stats.filed, route: '/?status=filed', active: s === 'filed', dot: true, dotColor: 'bg-amber-500' },
    { key: 'not_accepted', label: '不予受理', count: store.stats.notAccepted, route: '/?status=not_accepted', active: s === 'not_accepted', dot: true, dotColor: 'bg-red-500' },
    { key: 'closed', label: '已办结', count: store.stats.closed, route: '/?status=closed', active: s === 'closed', dot: true, dotColor: 'bg-emerald-500' },
    { key: 'reviewing', label: '复议中', count: store.stats.reviewing, route: '/?status=reviewing', active: s === 'reviewing', dot: true, dotColor: 'bg-blue-500' },
  ]
})

const pagePills = computed(() => [
  { label: '检索结果', value: store.cases.length },
  { label: '本页已选', value: 0 },
  { label: '已立案', value: store.stats.filed },
  { label: '云端文件', value: '—' },
  { label: '磁盘已用', value: '—' },
  { label: '上传目录', value: '—' },
])

const metricCards = [
  { label: '当月花费', value: '¥7,729.64', sub: '点击定位到案件列表' },
  { label: '当月盈利', value: '¥12,560.00', sub: '点击定位到案件列表' },
  { label: '云端文件', value: '18 个', sub: '云端文件总数' },
  { label: '磁盘占用', value: '5.3 GB', sub: '磁盘已使用空间' },
]

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
