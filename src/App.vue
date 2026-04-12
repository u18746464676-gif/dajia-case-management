<template>
  <div class="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50">
    <!-- 顶部导航 -->
    <AIChat />
    <header class="bg-gradient-to-r from-red-800 via-red-700 to-red-600 shadow-2xl">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-center relative">
        <!-- 提醒铃铛 -->
        <button
          @click="showNotifications = !showNotifications"
          class="absolute right-6 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/20 transition-colors"
        >
          <span class="text-2xl">🔔</span>
          <span
            v-if="overdueList.length > 0"
            class="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
          >
            {{ overdueList.length > 9 ? '9+' : overdueList.length }}
          </span>
        </button>

        <!-- 提醒列表弹窗 -->
        <div
          v-if="showNotifications"
          class="absolute right-6 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-red-100 z-50 overflow-hidden"
        >
          <div class="bg-gradient-to-r from-red-600 to-amber-500 text-white px-4 py-2 font-semibold flex items-center justify-between">
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
              class="p-3 border-b border-red-50 hover:bg-red-50 transition-colors"
              :class="item.urgency === 'danger' ? 'bg-red-50' : 'bg-yellow-50'"
            >
              <div class="flex items-start gap-2">
                <span class="text-lg">{{ item.urgency === 'danger' ? '🔴' : '🟡' }}</span>
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-gray-800 truncate">{{ item.shopName }}</div>
                  <div class="text-xs text-gray-500">{{ item.productName }}</div>
                  <div class="text-sm mt-1" :class="item.urgency === 'danger' ? 'text-red-600' : 'text-yellow-600'">
                    {{ item.message }}
                  </div>
                </div>
                <router-link
                  :to="'/case/' + item.id"
                  @click="showNotifications = false"
                  class="text-xs text-red-600 hover:text-red-800 whitespace-nowrap"
                >
                  查看 →
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-6 text-center">
          <div class="relative">
            <img src="/guohui.png" alt="国徽" class="w-16 h-16 object-contain opacity-90" />
            <div class="absolute inset-0 bg-gradient-to-b from-red-800/10 to-transparent rounded-full"></div>
          </div>
          <div class="flex flex-col">
            <span class="text-3xl font-bold text-white tracking-wide drop-shadow">打假案件管理系统</span>
            <span class="text-sm text-white/70 tracking-widest mt-1">ANTI-COUNTERFEITING CASE MANAGEMENT</span>
          </div>
        </div>
      </div>
    </header>

    <!-- 状态快捷栏 -->
    <div class="bg-white/95 backdrop-blur-sm shadow-md border-b border-amber-100">
      <div class="max-w-7xl mx-auto px-6 py-3">
        <div class="flex gap-2 text-xs overflow-x-auto pb-1">
          <router-link
            to="/"
            class="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 border-2"
            :class="!$route.query.status ? 'bg-red-500 text-white border-red-500 shadow-lg' : 'bg-white text-red-600 border-red-200 hover:border-red-400'"
          >
            <span class="font-bold">{{ store.stats.total }}</span>
            <span>全部</span>
          </router-link>
          <router-link
            to="/?status=pending_report"
            class="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 border-2"
            :class="$route.query.status === 'pending_report' ? 'bg-yellow-600 text-white border-yellow-600 shadow-lg' : 'bg-white text-yellow-700 border-yellow-200 hover:border-yellow-400'"
          >
            <span class="w-2 h-2 rounded-full" :class="$route.query.status === 'pending_report' ? 'bg-white' : 'bg-yellow-500'"></span>
            <span class="font-bold">{{ store.stats.pending }}</span>
            <span>未受理</span>
          </router-link>
          <router-link
            to="/?status=accepted"
            class="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 border-2"
            :class="$route.query.status === 'accepted' ? 'bg-purple-600 text-white border-purple-600 shadow-lg' : 'bg-white text-purple-700 border-purple-200 hover:border-purple-400'"
          >
            <span class="w-2 h-2 rounded-full" :class="$route.query.status === 'accepted' ? 'bg-white' : 'bg-purple-500'"></span>
            <span class="font-bold">{{ store.stats.accepted }}</span>
            <span>已受理</span>
          </router-link>
          <router-link
            to="/?status=reported"
            class="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 border-2"
            :class="$route.query.status === 'reported' ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-blue-700 border-blue-200 hover:border-blue-400'"
          >
            <span class="w-2 h-2 rounded-full" :class="$route.query.status === 'reported' ? 'bg-white' : 'bg-blue-500'"></span>
            <span class="font-bold">{{ store.stats.reported }}</span>
            <span>已立案</span>
          </router-link>
          <router-link
            to="/?status=decided"
            class="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 border-2"
            :class="$route.query.status === 'decided' ? 'bg-orange-600 text-white border-orange-600 shadow-lg' : 'bg-white text-orange-700 border-orange-200 hover:border-orange-400'"
          >
            <span class="w-2 h-2 rounded-full" :class="$route.query.status === 'decided' ? 'bg-white' : 'bg-orange-500'"></span>
            <span class="font-bold">{{ store.stats.decided }}</span>
            <span>已调解</span>
          </router-link>
          <router-link
            to="/?status=closed"
            class="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 border-2"
            :class="$route.query.status === 'closed' ? 'bg-green-700 text-white border-green-700 shadow-lg' : 'bg-white text-green-700 border-green-200 hover:border-green-400'"
          >
            <span class="w-2 h-2 rounded-full" :class="$route.query.status === 'closed' ? 'bg-white' : 'bg-green-600'"></span>
            <span class="font-bold">{{ store.stats.closed }}</span>
            <span>已处罚</span>
          </router-link>
          <router-link
            to="/?status=rejected"
            class="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 border-2"
            :class="$route.query.status === 'rejected' ? 'bg-red-600 text-white border-red-600 shadow-lg' : 'bg-white text-red-600 border-red-200 hover:border-red-400'"
          >
            <span class="w-2 h-2 rounded-full" :class="$route.query.status === 'rejected' ? 'bg-white' : 'bg-red-500'"></span>
            <span class="font-bold">{{ store.stats.rejected }}</span>
            <span>不予立案</span>
          </router-link>
          <router-link
            to="/?status=not_punished"
            class="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 border-2"
            :class="$route.query.status === 'not_punished' ? 'bg-gray-600 text-white border-gray-600 shadow-lg' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'"
          >
            <span class="w-2 h-2 rounded-full" :class="$route.query.status === 'not_punished' ? 'bg-white' : 'bg-gray-500'"></span>
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
    <footer class="bg-gradient-to-r from-red-700 via-red-600 to-amber-600 text-white/80 py-4 mt-auto">
      <div class="max-w-7xl mx-auto px-6 text-center text-sm">
        打假案件管理系统 · 政务专用版 v1.2
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useCaseStore } from '@/stores/case'
import { ReminderService } from '@/lib/notification'
import AIChat from '@/components/AIChat.vue'

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
