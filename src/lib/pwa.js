import { ref } from 'vue'
import { registerSW } from 'virtual:pwa-register'

export const pwaNeedRefresh = ref(false)
export const pwaOfflineReady = ref(false)

let updateServiceWorker = null
let registrationRef = null
let listenersBound = false
let updateTimer = null

function checkForUpdates() {
  registrationRef?.update().catch(() => {})
}

function bindUpdateListeners() {
  if (listenersBound || typeof window === 'undefined') return

  listenersBound = true
  window.addEventListener('focus', checkForUpdates)
  window.addEventListener('online', checkForUpdates)

  if (!updateTimer) {
    updateTimer = window.setInterval(checkForUpdates, 30 * 60 * 1000)
  }
}

export function registerPwaServiceWorker() {
  if (typeof window === 'undefined' || !import.meta.env.PROD) return
  if (updateServiceWorker) return

  updateServiceWorker = registerSW({
    immediate: true,
    onNeedRefresh() {
      pwaOfflineReady.value = false
      pwaNeedRefresh.value = true
    },
    onOfflineReady() {
      if (!pwaNeedRefresh.value) {
        pwaOfflineReady.value = true
      }
    },
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return
      registrationRef = registration
      bindUpdateListeners()
      checkForUpdates()
    },
    onRegisterError(error) {
      console.error('PWA 注册失败:', error)
    },
  })
}

export function closePwaNotice() {
  pwaNeedRefresh.value = false
  pwaOfflineReady.value = false
}

export async function refreshPwa() {
  pwaNeedRefresh.value = false
  pwaOfflineReady.value = false

  if (!updateServiceWorker) {
    window.location.reload()
    return
  }

  await updateServiceWorker()
}
