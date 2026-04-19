import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { initTheme } from '@/lib/theme'
import './style.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// 初始化store并加载云端数据
import { useCaseStore } from './stores/case'
const store = useCaseStore()

// 等待数据加载完成再挂载应用
store.init().then(() => {
  console.log('[App] 数据加载完成，开始渲染')
  initTheme()
  app.mount('#app')
}).catch(err => {
  console.error('[App] 数据加载失败:', err)
  initTheme()
  app.mount('#app')
})
