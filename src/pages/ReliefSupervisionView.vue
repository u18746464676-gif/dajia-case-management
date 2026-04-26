<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <h1 class="page-title">救济监督</h1>
        <p class="page-desc">集中管理不利答复后的后续救济与监督路径，支持一个案件绑定多条救济记录。</p>
      </div>
    </div>

    <div class="stat6-grid">
      <div class="stat-card sm" v-for="s in statCards" :key="s.label">
        <div class="stat-icon sm" :style="{ background: s.bg, color: s.color }">{{ s.icon }}</div>
        <div class="stat-body">
          <div class="stat-label">{{ s.label }}</div>
          <div class="stat-value">{{ s.value }}</div>
        </div>
      </div>
    </div>

    <div class="view-tabs standalone-view-tabs">
      <button class="view-tab-btn" :class="viewMode === 'record' ? 'active' : ''" @click="viewMode = 'record'">按救济记录</button>
      <button class="view-tab-btn" :class="viewMode === 'case' ? 'active' : ''" @click="viewMode = 'case'">按案件聚合</button>
    </div>

    <div class="filter-bar">
      <span class="filter-bar-label">快捷筛选</span>
      <button v-for="f in quickFilters" :key="f" class="quick-filter-btn" :class="active === f ? 'active' : ''" @click="active = f">{{ f }}</button>
    </div>

    <div class="action-bar">
      <button class="btn-primary">新增救济记录</button>
      <button class="btn-secondary">生成复议材料</button>
      <button class="btn-secondary">生成信息公开申请</button>
      <button class="btn-secondary">批量导出</button>
      <button class="btn-secondary" @click="() => { if (openAINextStepDrawer) openAINextStepDrawer({ source: 'relief', caseNumber: 'AJ202604230018', status: '救济监督处理中', originalResult: '不予立案', resultDate: '2026-04-21', currentReliefStatus: '行政复议准备中', relatedPathCount: 2, deadlineRisk: '复议临期案件需优先人工核对法定期限。', priorityActions: ['准备行政复议', '建议优先级：高'], basis: ['已登记不利处理结果', '当前仍在可救济期限内', '建议优先准备复议材料'] }); else console.warn('openAINextStepDrawer not provided') }">AI分析下一步</button>
      <button class="btn-secondary">期限计算</button>
    </div>

    <div class="filter-card compact">
      <div class="filter-row">
        <select class="filter-select"><option>年份</option></select>
        <select class="filter-select"><option>月份</option></select>
        <select class="filter-select"><option>救济大类</option></select>
        <select class="filter-select"><option>救济路径</option></select>
        <select class="filter-select"><option>原答复结果</option></select>
        <select class="filter-select"><option>当前状态</option></select>
        <select class="filter-select"><option>救济机关</option></select>
        <input placeholder="搜索案件编号 / 店铺 / 机关 / 路径" class="filter-input flex-1" />
      </div>
    </div>

    <div class="notice-strip warning-strip">
      该路径用于反映具体程序违法、失职渎职、徇私舞弊、不作为慢作为乱作为等问题，不得仅因不服处理结果而认定工作人员违法违纪。请基于事实和证据填写。
    </div>

    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>案件编号</th>
            <th>店铺 / 商家</th>
            <th>原答复结果</th>
            <th>救济大类</th>
            <th>救济路径</th>
            <th>提交对象</th>
            <th>提交日期</th>
            <th>当前状态</th>
            <th>期限提醒</th>
            <th>处理结果</th>
            <th>我方下一步</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in reliefRows" :key="row.code + row.path">
            <td>{{ row.code }}</td>
            <td>{{ row.shop }}</td>
            <td>{{ row.origin }}</td>
            <td>{{ row.category }}</td>
            <td>{{ row.path }}</td>
            <td>{{ row.target }}</td>
            <td>{{ row.submitDate }}</td>
            <td><span class="status-chip" :class="row.statusClass">{{ row.status }}</span></td>
            <td>{{ row.deadline }}</td>
            <td>{{ row.result }}</td>
            <td>{{ row.nextStep }}</td>
            <td>
              <div class="table-actions">
                <button class="btn-link">查看</button>
                <button class="btn-link">编辑</button>
                <button class="btn-link">更多</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { inject, ref } from 'vue'
const openAINextStepDrawer = inject('openAINextStepDrawer', null)
const viewMode = ref('record')
const active = ref('全部')
const quickFilters = ['全部', '待复议', '复议临期', '已提交', '已受理', '复议撤销', '复议维持', '信息公开', '纪检监察', '人大信访', '诉讼准备']
const statCards = [
  { label: '可复议案件', value: 62, icon: '⚖️', bg: '#f5f3ff', color: '#8b5cf6' },
  { label: '复议临期', value: 14, icon: '⏳', bg: '#fff7ed', color: '#f59e0b' },
  { label: '已提交复议', value: 21, icon: '📄', bg: '#e8f2ff', color: '#1677ff' },
  { label: '信息公开中', value: 8, icon: '📬', bg: '#eff6ff', color: '#2563eb' },
  { label: '监督反映中', value: 5, icon: '📝', bg: '#fef2f2', color: '#ef4444' },
  { label: '诉讼准备', value: 3, icon: '🏛️', bg: '#ecfdf5', color: '#10b981' },
]
const reliefRows = [
  { code: 'AJ202604230018', shop: '1989潮牌鞋服集合店', origin: '不予立案', category: '行政复议', path: '行政复议申请', target: '杭州市人民政府', submitDate: '2026-04-24', status: '待提交', statusClass: 'badge-orange', deadline: '剩余3天', result: '-', nextStep: '生成复议材料' },
  { code: 'AJ202604220012', shop: '优品数码专营店', origin: '答复不完整', category: '信息公开', path: '政府信息公开申请', target: '余杭区市场监督管理局', submitDate: '2026-04-22', status: '已提交', statusClass: 'badge-blue', deadline: '等待答复', result: '-', nextStep: '跟进答复期限' },
  { code: 'AJ202604180009', shop: '家居生活馆', origin: '不予立案', category: '监督反映', path: '纪检监察', target: '驻局纪检组', submitDate: '2026-04-20', status: '已受理', statusClass: 'badge-green', deadline: '处理中', result: '-', nextStep: '补充事实材料' },
]
</script>
