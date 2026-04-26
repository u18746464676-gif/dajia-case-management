<template>
  <div class="app-shell">
    <AINextStepDrawer :visible="aiDrawerVisible" :context="aiDrawerContext" @close="aiDrawerVisible = false" />
    <!-- 左侧固定导航栏 -->
    <aside class="sidebar" :class="sidebarClass">
      <!-- 品牌区 -->
      <div class="sidebar-brand">
        <div class="brand-icon">
          <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 4 L38 12 L38 28 Q38 38 22 42 Q6 38 6 28 L6 12 Z" fill="#1677ff" opacity="0.9"/>
            <path d="M22 4 L38 12 L38 28 Q38 38 22 42 Q6 38 6 28 L6 12 Z" stroke="#fff" stroke-width="2" fill="none"/>
            <text x="22" y="28" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold">盾</text>
          </svg>
        </div>
        <div class="brand-text">
          <div class="brand-name">打假维权</div>
          <div class="brand-sub">{{ sidebarBrandSub }}</div>
        </div>
      </div>

      <!-- 菜单 -->
      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.key"
          :to="item.path"
          class="nav-item"
          :class="isActive(item) ? 'active' : ''"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span class="nav-text">{{ item.label }}</span>
          <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
        </router-link>
      </nav>

      <!-- 底部用户区 -->
      <div class="sidebar-user">
        <div class="user-card">
          <div class="user-info">
            <div class="user-avatar">管</div>
            <div class="user-detail">
              <div class="user-name">打假人 VIP</div>
              <div class="user-id">ID: 888888</div>
            </div>
          </div>
          <div class="user-actions">
            <button class="user-btn">切换账号</button>
            <button class="user-btn">退出登录</button>
          </div>
        </div>
      </div>
    </aside>

    <!-- 右侧主内容区 -->
    <div class="main-wrapper">
      <!-- 顶部栏 -->
      <header class="topbar">
        <div class="topbar-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="搜索案件、店铺或编号..." />
        </div>
        <div class="topbar-right">
          <button class="topbar-icon-btn" @click="notifOpen = !notifOpen">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span class="notif-badge">3</span>
          </button>
          <button class="topbar-user">
            <span class="topbar-avatar">管</span>
            <span class="topbar-name">打假人</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
      </header>

      <!-- 通知面板 -->
      <div v-if="notifOpen" class="notif-panel">
        <div class="notif-head">
          <span>逾期提醒</span>
          <button @click="notifOpen = false">×</button>
        </div>
        <div class="notif-body">
          <div class="notif-empty">暂无逾期案件</div>
        </div>
      </div>

      <!-- 页面内容 -->
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, provide, ref } from 'vue'
import { useRoute } from 'vue-router'
import AINextStepDrawer from '@/components/AINextStepDrawer.vue'

const route = useRoute()

const darkRoutes = []
const sidebarClass = computed(() => 'sidebar-light')
const sidebarBrandSub = computed(() => '案件管理系统')

const notifOpen = ref(false)
const aiDrawerVisible = ref(false)
const aiDrawerContext = ref(null)

function openAINextStepDrawer(payload = {}) {
  console.log('[AI Drawer] open', payload)
  aiDrawerContext.value = {
    caseNumber: payload.caseNumber || 'AJ202604230018',
    status: payload.status || '已签收未答复',
    originalResult: payload.originalResult || '不予立案',
    resultDate: payload.resultDate || '2026-04-21',
    currentReliefStatus: payload.currentReliefStatus || '未建立救济记录',
    relatedPathCount: payload.relatedPathCount ?? 0,
    priorityActions: payload.priorityActions || ['准备行政复议', '建议优先级：高'],
    basis: payload.basis || ['已登记不利处理结果', '当前仍在可救济期限内', '建议优先准备复议材料'],
    deadlineRisk: payload.deadlineRisk || '复议剩余 57 天，建议优先处理。',
    materials: payload.materials || ['原举报信', '购买凭证', '商品宣传截图', '邮寄签收记录', '机关答复', '程序问题说明', '事实理由说明'],
    paths: payload.paths || ['行政复议', '政府信息公开', '上级复议机构监督', '纪检监察举报', '人大信访', '行政诉讼准备', '更多路径'],
    riskNotice: payload.riskNotice || '纪检监察、人大信访、信访督办等路径应基于具体事实和证据，不得仅因不服处理结果而认定工作人员违法违纪。',
  }
  aiDrawerVisible.value = true
}

provide('openAINextStepDrawer', openAINextStepDrawer)

function isActive(item) {
  const path = route.path
  if (item.key === 'workbench') return path === '/workbench'
  if (item.key === 'cases') return path === '/cases' || path.startsWith('/case/')
  return path === item.path || path.startsWith(item.path + '/')
}

const navItems = [
  {
    key: 'workbench',
    path: '/workbench',
    label: '工作台',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>'
  },
  {
    key: 'cases',
    path: '/cases',
    label: '案件档案',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>'
  },
  {
    key: 'evidence',
    path: '/evidence',
    label: '证据库',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'
  },
  {
    key: 'mail',
    path: '/mail',
    label: '邮寄台账',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>'
  },
  {
    key: 'response',
    path: '/response',
    label: '机关答复',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
  },
  {
    key: 'relief',
    path: '/relief',
    label: '救济监督',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
  },
  {
    key: 'finance',
    path: '/finance',
    label: '收支统计',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'
  },
  {
    key: 'reminders',
    path: '/reminders',
    label: '提醒中心',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    badge: 3
  },
  {
    key: 'templates',
    path: '/templates',
    label: '文书模板',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>'
  },
  {
    key: 'settings',
    path: '/settings-center',
    label: '设置中心',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'
  },
]
</script>
