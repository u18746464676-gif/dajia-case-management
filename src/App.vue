<template>
  <div class="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
    <!-- 顶部导航 -->
    <AIChat />
    <header class="bg-gradient-to-r from-red-700 via-red-600 to-orange-600 shadow-lg">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <router-link to="/" class="text-xl font-bold text-white flex items-center gap-3">
            <span class="text-3xl">🏛️</span>
            <span class="tracking-wide">打假案件管理系统</span>
          </router-link>
        </div>
        <div class="flex items-center gap-4">
          <router-link to="/settings" class="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-1">
            <span>⚙️</span>
            <span>设置</span>
          </router-link>
          <router-link to="/case/new" class="bg-white text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-lg">
            <span class="text-lg">+</span>
            <span>新增案件</span>
          </router-link>
        </div>
      </div>
    </header>

    <!-- 状态快捷栏 -->
    <div class="bg-white/90 backdrop-blur-sm shadow-md border-b border-red-100">
      <div class="max-w-7xl mx-auto px-6 py-3">
        <div class="flex gap-2 text-xs overflow-x-auto pb-1">
          <router-link
            to="/"
            class="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 border-2"
            :class="!$route.query.status ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-200' : 'bg-white text-red-700 border-red-200 hover:border-red-400'"
          >
            <span class="font-bold">{{ store.stats.total }}</span>
            <span>全部</span>
          </router-link>
          <router-link
            to="/?status=pending_report"
            class="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 border-2"
            :class="$route.query.status === 'pending_report' ? 'bg-yellow-500 text-white border-yellow-500 shadow-lg shadow-yellow-200' : 'bg-white text-yellow-700 border-yellow-200 hover:border-yellow-400'"
          >
            <span class="w-2 h-2 rounded-full" :class="$route.query.status === 'pending_report' ? 'bg-white' : 'bg-yellow-500'"></span>
            <span class="font-bold">{{ store.stats.pending }}</span>
            <span>未受理</span>
          </router-link>
          <router-link
            to="/?status=accepted"
            class="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 border-2"
            :class="$route.query.status === 'accepted' ? 'bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-200' : 'bg-white text-purple-700 border-purple-200 hover:border-purple-400'"
          >
            <span class="w-2 h-2 rounded-full" :class="$route.query.status === 'accepted' ? 'bg-white' : 'bg-purple-500'"></span>
            <span class="font-bold">{{ store.stats.accepted }}</span>
            <span>已受理</span>
          </router-link>
          <router-link
            to="/?status=reported"
            class="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 border-2"
            :class="$route.query.status === 'reported' ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-200' : 'bg-white text-blue-700 border-blue-200 hover:border-blue-400'"
          >
            <span class="w-2 h-2 rounded-full" :class="$route.query.status === 'reported' ? 'bg-white' : 'bg-blue-500'"></span>
            <span class="font-bold">{{ store.stats.reported }}</span>
            <span>已立案</span>
          </router-link>
          <router-link
            to="/?status=decided"
            class="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 border-2"
            :class="$route.query.status === 'decided' ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-200' : 'bg-white text-orange-700 border-orange-200 hover:border-orange-400'"
          >
            <span class="w-2 h-2 rounded-full" :class="$route.query.status === 'decided' ? 'bg-white' : 'bg-orange-500'"></span>
            <span class="font-bold">{{ store.stats.decided }}</span>
            <span>已调解</span>
          </router-link>
          <router-link
            to="/?status=closed"
            class="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 border-2"
            :class="$route.query.status === 'closed' ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-200' : 'bg-white text-green-700 border-green-200 hover:border-green-400'"
          >
            <span class="w-2 h-2 rounded-full" :class="$route.query.status === 'closed' ? 'bg-white' : 'bg-green-600'"></span>
            <span class="font-bold">{{ store.stats.closed }}</span>
            <span>已处罚</span>
          </router-link>
          <router-link
            to="/?status=rejected"
            class="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 border-2"
            :class="$route.query.status === 'rejected' ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-200' : 'bg-white text-red-700 border-red-200 hover:border-red-400'"
          >
            <span class="w-2 h-2 rounded-full" :class="$route.query.status === 'rejected' ? 'bg-white' : 'bg-red-600'"></span>
            <span class="font-bold">{{ store.stats.rejected }}</span>
            <span>不予立案</span>
          </router-link>
          <router-link
            to="/?status=not_punished"
            class="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 border-2"
            :class="$route.query.status === 'not_punished' ? 'bg-gray-600 text-white border-gray-600 shadow-lg shadow-gray-200' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'"
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
    <footer class="bg-gradient-to-r from-red-700 via-red-600 to-orange-600 text-white/80 py-4 mt-auto">
      <div class="max-w-7xl mx-auto px-6 text-center text-sm">
        打假案件管理系统 · 政务专用版
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useCaseStore } from '@/stores/case'
import AIChat from '@/components/AIChat.vue'
const store = useCaseStore()
</script>
