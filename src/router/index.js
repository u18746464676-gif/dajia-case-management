import { createRouter, createWebHistory } from 'vue-router'
import CaseList from '@/pages/CaseList.vue'
import CaseForm from '@/pages/CaseForm.vue'
import CaseDetail from '@/pages/CaseDetail.vue'
import Settings from '@/pages/Settings.vue'

const routes = [
  { path: '/', component: CaseList },
  { path: '/case/new', component: CaseForm },
  { path: '/case/:id', component: CaseDetail },
  { path: '/case/:id/edit', component: CaseForm },
  { path: '/settings', component: Settings },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
