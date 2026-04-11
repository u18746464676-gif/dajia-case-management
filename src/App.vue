<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <!-- 顶部导航 -->
    <AIChat />
    <header class="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <router-link to="/" class="text-xl font-bold text-slate-800 flex items-center gap-3">
            <span class="text-3xl">📋</span>
            <span class="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">打假案件管理</span>
          </router-link>
        </div>
        <div class="flex items-center gap-4">
          <router-link to="/settings" class="text-slate-400 hover:text-slate-600 transition-colors text-sm flex items-center gap-1">
            <span>⚙️</span>
            <span>设置</span>
          </router-link>
          <router-link to="/case/new" class="btn-primary text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20">
            <span class="text-lg">+</span>
            <span>新增案件</span>
          </router-link>
        </div>
      </div>
    </header>

    <!-- 状态快捷栏 -->
    <div class="bg-white/60 backdrop-blur-sm border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-6 py-3">
        <div class="flex gap-2 text-xs overflow-x-auto pb-1">
          <router-link
            to="/"
            class="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200"
            :class="!$route.query.status ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'"
          >
            <span class="font-bold">{{ store.stats.total }}</span>
            <span>全部</span>
          </router-link>
          <router-link
            to="/?status=pending_report"
            class="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200"
            :class="$route.query.status === 'pending_report' ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'"
          >
            <span class="w-2 h-2 rounded-full" :class="$route.query.status === 'pending_report' ? 'bg-white' : 'bg-yellow-500'"></span>
            <span class="font-bold">{{ store.stats.pending }}</span>
            <span>未受理</span>
          </router-link>
          <router-link
            to="/?status=accepted"
            class="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200"
            :class="$route.query.status === 'accepted' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'"
          >
            <span class="w-2 h-2 rounded-full" :class="$route.query.status === 'accepted' ? 'bg-white' : 'bg-purple-500'"></span>
            <span class="font-bold">{{ store.stats.accepted }}</span>
            <span>已受理</span>
          </router-link>
          <router-link
            to="/?status=reported"
            class="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200"
            :class="$route.query.status === 'reported' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'"
          >
            <span class="w-2 h-2 rounded-full" :class="$route.query.status === 'reported' ? 'bg-white' : 'bg-blue-500'"></span>
            <span class="font-bold">{{ store.stats.reported }}</span>
            <span>已立案</span>
          </router-link>
          <router-link
            to="/?status=decided"
            class="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200"
            :class="$route.query.status === 'decided' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'"
          >
            <span class="w-2 h-2 rounded-full" :class="$route.query.status === 'decided' ? 'bg-white' : 'bg-orange-500'"></span>
            <span class="font-bold">{{ store.stats.decided }}</span>
            <span>已调解</span>
          </router-link>
          <router-link
            to="/?status=closed"
            class="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200"
            :class="$route.query.status === 'closed' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'"
          >
            <span class="w-2 h-2 rounded-full" :class="$route.query.status === 'closed' ? 'bg-white' : 'bg-green-500'"></span>
            <span class="font-bold">{{ store.stats.closed }}</span>
            <span>已处罚</span>
          </router-link>
          <router-link
            to="/?status=rejected"
            class="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200"
            :class="$route.query.status === 'rejected' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'"
          >
            <span class="w-2 h-2 rounded-full" :class="$route.query.status === 'rejected' ? 'bg-white' : 'bg-red-500'"></span>
            <span class="font-bold">{{ store.stats.rejected }}</span>
            <span>不予立案</span>
          </router-link>
          <router-link
            to="/?status=not_punished"
            class="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200"
            :class="$route.query.status === 'not_punished' ? 'bg-slate-500 text-white shadow-lg shadow-slate-500/30' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'"
          >
            <span class="w-2 h-2 rounded-full" :class="$route.query.status === 'not_punished' ? 'bg-white' : 'bg-slate-400'"></span>
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
  </div>
</template>

<script setup>
import { useCaseStore } from '@/stores/case'
import AIChat from '@/components/AIChat.vue'
const store = useCaseStore()
</script>
