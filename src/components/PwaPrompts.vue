<template>
  <div v-if="showPromptBar" class="bg-white/95 backdrop-blur-sm border-b border-amber-100 shadow-sm">
    <div class="max-w-7xl mx-auto px-6 py-3 flex flex-col gap-2">
      <div
        v-if="showUpdatePrompt || showOfflineReady"
        class="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between"
      >
        <div class="flex items-start gap-3">
          <span class="text-xl">{{ showUpdatePrompt ? '🔄' : '✅' }}</span>
          <div>
            <p class="text-sm font-semibold text-slate-800">
              {{ showUpdatePrompt ? '发现新版本，建议立即刷新' : '已启用离线缓存' }}
            </p>
            <p class="text-xs text-slate-500 mt-1">
              {{ showUpdatePrompt ? '静态资源和页面壳已更新，刷新后即可使用最新版本。' : '常用页面和静态资源已缓存，网络波动时打开更稳定。' }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <button
            v-if="showUpdatePrompt"
            type="button"
            class="btn-primary !px-3 !py-2 text-sm"
            @click="handleRefresh"
          >
            立即刷新
          </button>
          <button
            type="button"
            class="btn-secondary !px-3 !py-2 text-sm"
            @click="dismissSwPrompt"
          >
            {{ showUpdatePrompt ? '稍后再说' : '知道了' }}
          </button>
        </div>
      </div>

      <div
        v-if="showInstallCard"
        class="flex flex-col gap-3 rounded-2xl border border-red-100 bg-gradient-to-r from-white to-red-50 px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between"
      >
        <div class="flex items-start gap-3">
          <span class="text-xl">{{ installIcon }}</span>
          <div>
            <p class="text-sm font-semibold text-slate-800">{{ installTitle }}</p>
            <p class="text-xs text-slate-500 mt-1">{{ installDescription }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <template v-if="showInstallPrompt">
            <button
              type="button"
              class="btn-primary !px-3 !py-2 text-sm"
              :disabled="isInstalling"
              @click="installApp"
            >
              {{ isInstalling ? '正在调起安装...' : installActionText }}
            </button>
            <button
              type="button"
              class="btn-secondary !px-3 !py-2 text-sm"
              @click="dismissInstallPrompt"
            >
              暂不安装
            </button>
          </template>

          <template v-else-if="showIgnoredState">
            <button
              v-if="canInstall"
              type="button"
              class="btn-secondary !px-3 !py-2 text-sm"
              @click="restoreInstallPrompt"
            >
              重新显示安装按钮
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { closePwaNotice, pwaNeedRefresh, pwaOfflineReady, refreshPwa } from '@/lib/pwa'

const INSTALL_DISMISSED_KEY = 'case_management_pwa_install_dismissed'
const INSTALL_INSTALLED_KEY = 'case_management_pwa_installed'

const deferredPrompt = ref(null)
const isInstalled = ref(false)
const isInstallIgnored = ref(false)
const isInstalling = ref(false)
const isAndroidEdge = ref(false)
const swPromptDismissed = ref(false)

const canInstall = computed(() => Boolean(deferredPrompt.value) && !isInstalled.value)
const showInstallPrompt = computed(() => canInstall.value && !isInstallIgnored.value)
const showIgnoredState = computed(() => !isInstalled.value && isInstallIgnored.value)
const showUpdatePrompt = computed(() => pwaNeedRefresh.value && !swPromptDismissed.value)
const showOfflineReady = computed(() => pwaOfflineReady.value && !swPromptDismissed.value)
const showInstallCard = computed(() => showInstallPrompt.value || showIgnoredState.value)
const showPromptBar = computed(() => showInstallCard.value || showUpdatePrompt.value || showOfflineReady.value)

const installIcon = computed(() => {
  if (isInstalled.value) return '📲'
  if (showIgnoredState.value) return '🫥'
  return '⬇️'
})

const installTitle = computed(() => {
  if (showIgnoredState.value) return '已忽略安装提示'
  return isAndroidEdge.value ? '建议在安卓 Edge 中安装' : '安装到桌面使用'
})

const installDescription = computed(() => {
  if (showIgnoredState.value) {
    return canInstall.value
      ? '当前已隐藏安装提示，如需安装可重新显示按钮。'
      : '如需后续安装，可在浏览器菜单中选择“安装应用”或重新打开页面。'
  }

  return isAndroidEdge.value
    ? '安装后可直接从桌面进入，Edge 会保留更好的全屏体验和缓存表现。'
    : '安装后可从桌面快速进入，常用页面打开更稳。'
})

const installActionText = computed(() => isAndroidEdge.value ? '安装到 Edge 桌面' : '立即安装')

function syncInstalledState() {
  if (typeof window === 'undefined') return

  const standalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true
    || document.referrer.startsWith('android-app://')
    || localStorage.getItem(INSTALL_INSTALLED_KEY) === '1'

  isInstalled.value = Boolean(standalone)

  if (isInstalled.value) {
    localStorage.setItem(INSTALL_INSTALLED_KEY, '1')
    localStorage.removeItem(INSTALL_DISMISSED_KEY)
    isInstallIgnored.value = false
  }
}

function handleBeforeInstallPrompt(event) {
  event.preventDefault()
  deferredPrompt.value = event
}

function handleAppInstalled() {
  localStorage.setItem(INSTALL_INSTALLED_KEY, '1')
  localStorage.removeItem(INSTALL_DISMISSED_KEY)
  deferredPrompt.value = null
  isInstallIgnored.value = false
  syncInstalledState()
}

function dismissInstallPrompt() {
  isInstallIgnored.value = true
  localStorage.setItem(INSTALL_DISMISSED_KEY, '1')
}

function restoreInstallPrompt() {
  isInstallIgnored.value = false
  localStorage.removeItem(INSTALL_DISMISSED_KEY)
}

function dismissSwPrompt() {
  swPromptDismissed.value = true
  closePwaNotice()
}

async function handleRefresh() {
  swPromptDismissed.value = false
  await refreshPwa()
}

async function installApp() {
  if (!deferredPrompt.value) return

  isInstalling.value = true

  try {
    await deferredPrompt.value.prompt()
    const choice = await deferredPrompt.value.userChoice

    if (choice?.outcome === 'accepted') {
      localStorage.setItem(INSTALL_INSTALLED_KEY, '1')
      localStorage.removeItem(INSTALL_DISMISSED_KEY)
      isInstallIgnored.value = false
    } else {
      dismissInstallPrompt()
    }
  } finally {
    deferredPrompt.value = null
    isInstalling.value = false
    syncInstalledState()
  }
}

watch([pwaNeedRefresh, pwaOfflineReady], ([needRefresh, offlineReady]) => {
  if (needRefresh || offlineReady) {
    swPromptDismissed.value = false
  }
})

onMounted(() => {
  isAndroidEdge.value = /Android/i.test(navigator.userAgent) && /EdgA\//i.test(navigator.userAgent)
  isInstallIgnored.value = localStorage.getItem(INSTALL_DISMISSED_KEY) === '1'
  syncInstalledState()

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('appinstalled', handleAppInstalled)
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.removeEventListener('appinstalled', handleAppInstalled)
})
</script>
