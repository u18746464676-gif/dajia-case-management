import { createRouter, createWebHashHistory } from 'vue-router'
import CaseList from '@/pages/CaseList.vue'
import CaseForm from '@/pages/CaseForm.vue'
import CaseDetail from '@/pages/CaseDetail.vue'
import Settings from '@/pages/Settings.vue'

// 新页面占坑组件
import WorkbenchView from '@/pages/WorkbenchView.vue'
import CaseArchiveView from '@/pages/CaseArchiveView.vue'
import EvidenceView from '@/pages/EvidenceView.vue'
import MailLedgerView from '@/pages/MailLedgerView.vue'
import GovernmentResponseView from '@/pages/GovernmentResponseView.vue'
import ReliefSupervisionView from '@/pages/ReliefSupervisionView.vue'
import FinancialStatsView from '@/pages/FinancialStatsView.vue'
import ReminderCenterView from '@/pages/ReminderCenterView.vue'
import DocumentTemplatesView from '@/pages/DocumentTemplatesView.vue'
import SettingsCenterView from '@/pages/SettingsCenterView.vue'

const routes = [
  // 首页重定向到工作台
  { path: '/', redirect: '/workbench' },
  // 原有路由保留
  { path: '/legacy-cases', component: CaseList },
  { path: '/case/new', component: CaseForm },
  { path: '/case/:id', component: CaseDetail },
  { path: '/case/:id/edit', component: CaseForm },
  { path: '/settings', component: Settings },

  // 案件档案（显式路径）
  { path: '/cases', component: CaseArchiveView },

  // 新增 10 个页面路由
  { path: '/workbench', component: WorkbenchView },
  { path: '/evidence', component: EvidenceView },
  { path: '/mail', component: MailLedgerView },
  { path: '/response', component: GovernmentResponseView },
  { path: '/relief', component: ReliefSupervisionView },
  { path: '/finance', component: FinancialStatsView },
  { path: '/reminders', component: ReminderCenterView },
  { path: '/templates', component: DocumentTemplatesView },
  { path: '/settings-center', component: SettingsCenterView },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
