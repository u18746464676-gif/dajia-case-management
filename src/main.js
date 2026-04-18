import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { registerPwaServiceWorker } from '@/lib/pwa'
import './style.css'

// 强制清除旧 SW 缓存，保证所有设备拿到最新版本
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    for (const reg of regs) {
      reg.unregister().then(() => {
        if ('caches' in window) {
          caches.keys().then(names => names.forEach(n => caches.delete(n)))
        }
      })
    }
  })
}

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// 初始化store并加载云端数据
import { useCaseStore } from './stores/case'
const store = useCaseStore()
store.init()
registerPwaServiceWorker()

app.mount('#app')
