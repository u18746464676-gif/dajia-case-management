<template>
  <div class="min-h-screen bg-slate-50">
    <!-- 顶部导航 -->
    <AIChat />
    <header class="border-b border-slate-700 bg-slate-900 shadow-lg">
      <div class="max-w-7xl mx-auto px-6 py-5 relative">
        <!-- 提醒铃铛 -->
        <button
          @click="showNotifications = !showNotifications"
          class="absolute right-6 top-6 p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
        >
          <span class="text-xl">🔔</span>
          <span
            v-if="overdueList.length > 0"
            class="absolute -top-1 -right-1 bg-amber-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
          >
            {{ overdueList.length > 9 ? '9+' : overdueList.length }}
          </span>
        </button>

        <!-- 提醒列表弹窗 -->
        <div
          v-if="showNotifications"
          class="absolute right-6 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
        >
          <div class="bg-slate-700 text-white px-4 py-2.5 font-semibold flex items-center justify-between">
            <span>⚠️ 逾期提醒</span>
            <button @click="showNotifications = false" class="hover:bg-white/20 p-1 rounded">×</button>
          </div>
          <div class="max-h-80 overflow-y-auto">
            <div v-if="overdueList.length === 0" class="p-6 text-center text-gray-400">
              <span class="text-4xl">✅</span>
              <p class="mt-2">暂无逾期案件</p>
            </div>
            <div
              v-for="item in overdueList"
              :key="item.id + item.type"
              class="p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors"
              :class="item.urgency === 'danger' ? 'bg-red-50' : 'bg-amber-50'"
            >
              <div class="flex items-start gap-2">
                <span class="text-lg">{{ item.urgency === 'danger' ? '🔴' : '🟡' }}</span>
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-gray-800 truncate">{{ item.shopName }}</div>
                  <div class="text-xs text-gray-500">{{ item.productName }}</div>
                  <div class="text-sm mt-1" :class="item.urgency === 'danger' ? 'text-red-600' : 'text-amber-600'">
                    {{ item.message }}
                  </div>
                </div>
                <router-link
                  :to="'/case/' + item.id"
                  @click="showNotifications = false"
                  class="text-xs text-slate-600 hover:text-slate-800 whitespace-nowrap"
                >
                  查看 →
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- 法律主题 Header -->
        <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div class="flex items-start gap-4">
            <div class="mt-1 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10">
              <svg width="42" height="42" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" class="opacity-95">
                <rect x="18" y="38" width="8" height="2" rx="1" fill="#c9a84c"/>
                <rect x="21" y="14" width="2" height="24" rx="1" fill="#c9a84c"/>
                <rect x="6" y="12" width="32" height="2" rx="1" fill="#c9a84c"/>
                <path d="M7 14 L7 18 Q7 20 9 20 L13 20 Q15 20 15 18 L15 14" stroke="#c9a84c" stroke-width="1.5" fill="none"/>
                <line x1="6" y1="14" x2="16" y2="14" stroke="#c9a84c" stroke-width="1.5"/>
                <path d="M29 14 L29 18 Q29 20 31 20 L35 20 Q37 20 37 18 L37 14" stroke="#c9a84c" stroke-width="1.5" fill="none"/>
                <line x1="28" y1="14" x2="38" y2="14" stroke="#c9a84c" stroke-width="1.5"/>
                <circle cx="22" cy="10" r="3" fill="#c9a84c"/>
                <line x1="22" y1="13" x2="22" y2="17" stroke="#c9a84c" stroke-width="1"/>
              </svg>
            </div>

            <div class="flex flex-col">
              <span class="text-[11px] uppercase tracking-[0.32em] text-amber-300/80">案件治理 / 合规处置 / 复议跟踪</span>
              <span class="mt-2 text-3xl font-semibold tracking-wide text-white">案件处置工作台</span>
              <span class="mt-2 text-sm tracking-[0.2em] text-slate-300">循法而行，据证而断</span>
              <span class="mt-3 max-w-2xl text-sm leading-6 text-slate-400">围绕案件建档、材料归集、流程处理与复议跟踪形成统一工作界面，保持信息清晰、处置有据、留痕完整。</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[420px]">
            <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">案件总数</div>
              <div class="mt-2 text-2xl font-semibold text-white">{{ store.stats.total }}</div>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">未受理</div>
              <div class="mt-2 text-2xl font-semibold text-white">{{ store.stats.pending }}</div>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">已受理</div>
              <div class="mt-2 text-2xl font-semibold text-white">{{ store.stats.accepted }}</div>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">已处罚</div>
              <div class="mt-2 text-2xl font-semibold text-white">{{ store.stats.closed }}</div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <PwaPrompts />

    <!-- 状态快捷栏 -->
    <div class="bg-white border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-6 py-2.5">
        <div class="flex gap-1.5 text-xs overflow-x-auto pb-0.5">
          <router-link
            to="/"
            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 border font-medium text-sm"
            :class="!$route.query.status ? 'bg-slate-800 text-white border-slate-800 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-800'"
          >
            <span class="font-bold">{{ store.stats.total }}</span>
            <span>全部</span>
          </router-link>
          <router-link
            to="/?status=pending_report"
            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 border font-medium text-sm"
            :class="$route.query.status === 'pending_report' ? 'bg-yellow-600 text-white border-yellow-600 shadow-sm' : 'bg-white text-yellow-700 border-yellow-200 hover:border-yellow-400'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="$route.query.status === 'pending_report' ? 'bg-white' : 'bg-yellow-500'"></span>
            <span class="font-bold">{{ store.stats.pending }}</span>
            <span>未受理</span>
          </router-link>
          <router-link
            to="/?status=accepted"
            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 border font-medium text-sm"
            :class="$route.query.status === 'accepted' ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'bg-white text-purple-700 border-purple-200 hover:border-purple-400'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="$route.query.status === 'accepted' ? 'bg-white' : 'bg-purple-500'"></span>
            <span class="font-bold">{{ store.stats.accepted }}</span>
            <span>已受理</span>
          </router-link>
          <router-link
            to="/?status=reported"
            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 border font-medium text-sm"
            :class="$route.query.status === 'reported' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-blue-700 border-blue-200 hover:border-blue-400'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="$route.query.status === 'reported' ? 'bg-white' : 'bg-blue-500'"></span>
            <span class="font-bold">{{ store.stats.reported }}</span>
            <span>不予受理</span>
          </router-link>
          <router-link
            to="/?status=decided"
            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 border font-medium text-sm"
            :class="$route.query.status === 'decided' ? 'bg-orange-600 text-white border-orange-600 shadow-sm' : 'bg-white text-orange-700 border-orange-200 hover:border-orange-400'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="$route.query.status === 'decided' ? 'bg-white' : 'bg-orange-500'"></span>
            <span class="font-bold">{{ store.stats.decided }}</span>
            <span>已调解</span>
          </router-link>
          <router-link
            to="/?status=closed"
            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 border font-medium text-sm"
            :class="$route.query.status === 'closed' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white text-emerald-700 border-emerald-200 hover:border-emerald-400'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="$route.query.status === 'closed' ? 'bg-white' : 'bg-emerald-600'"></span>
            <span class="font-bold">{{ store.stats.closed }}</span>
            <span>已处罚</span>
          </router-link>
          <router-link
            to="/?status=rejected"
            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 border font-medium text-sm"
            :class="$route.query.status === 'rejected' ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-white text-red-600 border-red-200 hover:border-red-400'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="$route.query.status === 'rejected' ? 'bg-white' : 'bg-red-500'"></span>
            <span class="font-bold">{{ store.stats.rejected }}</span>
            <span>不予立案</span>
          </router-link>
          <router-link
            to="/?status=not_punished"
            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 border font-medium text-sm"
            :class="$route.query.status === 'not_punished' ? 'bg-slate-500 text-white border-slate-500 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="$route.query.status === 'not_punished' ? 'bg-white' : 'bg-slate-400'"></span>
            <span class="font-bold">{{ store.stats.notPunished }}</span>
            <span>不予处罚</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- 主内容 -->
    <main class="max-w-7xl mx-auto px-6 py-6">
      <router-view />
    </main>

    <!-- 底部版权 -->
    <footer class="bg-slate-800 text-slate-400 py-4 mt-auto">
      <div class="max-w-7xl mx-auto px-6 text-center text-sm">
        案件处置工作台 · 法律事务管理
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useCaseStore } from '@/stores/case'
import { ReminderService } from '@/lib/notification'
import AIChat from '@/components/AIChat.vue'
import PwaPrompts from '@/components/PwaPrompts.vue'

const store = useCaseStore()
const showNotifications = ref(false)
const overdueList = ref([])

// 初始化提醒服务
let reminderService = null

onMounted(() => {
  reminderService = new ReminderService((list) => {
    overdueList.value = list
  })

  // 启动定时检查（每分钟检查一次）
  reminderService.start(store.cases, 60000)

  // 请求通知权限
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
})

onUnmounted(() => {
  if (reminderService?.interval) {
    clearInterval(reminderService.interval)
  }
})
</script>
