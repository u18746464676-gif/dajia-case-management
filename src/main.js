import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// 初始化store并加载云端数据
import { useCaseStore } from './stores/case'
const store = useCaseStore()
store.init()

app.mount('#app')
