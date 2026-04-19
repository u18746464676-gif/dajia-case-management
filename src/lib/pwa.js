import { ref } from 'vue'

// PWA 已禁用，此文件不再使用
export const pwaNeedRefresh = ref(false)
export const pwaOfflineReady = ref(false)

export function registerPwaServiceWorker() {
  // PWA 已禁用，不注册 Service Worker
}

export function closePwaNotice() {
  pwaNeedRefresh.value = false
  pwaOfflineReady.value = false
}

export async function refreshPwa() {
  window.location.reload()
}
