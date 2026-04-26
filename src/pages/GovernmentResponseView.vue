<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <h1 class="page-title">机关答复</h1>
        <p class="page-desc">集中管理所有案件收到的处理结果、答复文书及结论，跟踪答复状态和后续可救济期限。</p>
      </div>
    </div>

    <div class="dashboard-layout">
      <div class="dashboard-main-column">
        <div class="stat6-grid">
          <div class="stat-card sm" v-for="s in statCards" :key="s.label">
            <div class="stat-icon sm" :style="{ background: s.bg, color: s.color }">{{ s.icon }}</div>
            <div class="stat-body">
              <div class="stat-label">{{ s.label }}</div>
              <div class="stat-value">{{ s.value }}</div>
            </div>
          </div>
        </div>

        <div class="filter-card compact">
          <div class="filter-row multi-row">
            <select class="filter-select"><option>全部年份</option></select>
            <select class="filter-select"><option>答复机关</option></select>
            <select class="filter-select"><option>答复类型</option></select>
            <select class="filter-select"><option>答复结果</option></select>
            <select class="filter-select"><option>是否可复议</option></select>
            <select class="filter-select"><option>复议状态</option></select>
            <input type="date" class="filter-input date-input" />
            <input type="date" class="filter-input date-input" />
            <button class="btn-secondary">自定义列</button>
          </div>
          <div class="filter-actions left-actions">
            <input placeholder="搜索案件编号 / 店铺 / 机关 / 文书内容" class="filter-input flex-1" />
            <button class="btn-primary">查询</button>
            <button class="btn-secondary">重置</button>
            <button class="btn-primary">新增答复</button>
            <button class="btn-secondary">导出台账</button>
          </div>
        </div>

        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th><input type="checkbox" /></th>
                <th>案件信息</th>
                <th>答复机关 / 类型</th>
                <th>答复日期</th>
                <th>答复结果</th>
                <th>是否可复议 / 期限</th>
                <th>关联文书</th>
                <th>我方下一步</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in responseRows" :key="row.code">
                <td><input type="checkbox" /></td>
                <td>
                  <div class="double-line-cell">
                    <div>{{ row.code }}</div>
                    <div class="sub-line">{{ row.shop }} · {{ row.subject }}</div>
                  </div>
                </td>
                <td>
                  <div class="double-line-cell">
                    <div>{{ row.office }}</div>
                    <div class="sub-line">{{ row.type }}</div>
                  </div>
                </td>
                <td>{{ row.date }}</td>
                <td><span class="status-chip" :class="row.resultClass">{{ row.result }}</span></td>
                <td>{{ row.review }}</td>
                <td>{{ row.document }}</td>
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

      <div class="right-sidebar">
        <div class="side-card">
          <div class="side-card-head"><h3>重要提醒</h3></div>
          <div class="reminder-list">
            <div class="reminder-item" v-for="r in reminders" :key="r.label">
              <div class="reminder-dot" :style="{ background: r.color }"></div>
              <div class="reminder-body">
                <div class="reminder-label">{{ r.label }}</div>
                <div class="reminder-sub">{{ r.sub }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="side-card">
          <div class="side-card-head"><h3>答复结果分布</h3></div>
          <div class="donut-wrap small-gap">
            <div class="donut-chart response-donut"><span>186</span></div>
            <div class="donut-legend">
              <div class="donut-legend-item" v-for="d in distribution" :key="d.label">
                <span class="dot" :style="{ background: d.color }"></span>
                <span>{{ d.label }}</span>
                <strong>{{ d.count }}</strong>
              </div>
            </div>
          </div>
        </div>
        <div class="side-card">
          <div class="side-card-head"><h3>快捷操作</h3></div>
          <div class="quick-actions-grid one-col">
            <button class="btn-secondary">登记新答复</button>
            <button class="btn-secondary">准备复议材料</button>
            <button class="btn-secondary" @click="() => { if (openAINextStepDrawer) openAINextStepDrawer({ source: 'response', caseNumber: 'AJ202604230018', status: '机关答复处理中', originalResult: '不予立案', resultDate: '2026-04-21', currentReliefStatus: '可复议', relatedPathCount: 1, deadlineRisk: '存在可复议案件和临期复议事项，请先人工确认期限。', priorityActions: ['准备行政复议', '建议优先级：高'], basis: ['已登记不利处理结果', '当前仍在可救济期限内', '建议优先准备复议材料'] }); else console.warn('openAINextStepDrawer not provided') }">AI分析下一步</button>
            <button class="btn-secondary">建立信息公开记录</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
const openAINextStepDrawer = inject('openAINextStepDrawer', null)
const statCards = [
  { label: '答复总数', value: 186, icon: '📄', bg: '#e8f2ff', color: '#1677ff' },
  { label: '不利答复', value: 78, icon: '⚠️', bg: '#fef2f2', color: '#ef4444' },
  { label: '可复议案件', value: 62, icon: '⚖️', bg: '#f5f3ff', color: '#8b5cf6' },
  { label: '临期复议', value: 14, icon: '⏳', bg: '#fff7ed', color: '#f59e0b' },
  { label: '已超期', value: 6, icon: '🚨', bg: '#fef2f2', color: '#ef4444' },
  { label: '有利 / 已办结', value: 40, icon: '✅', bg: '#ecfdf5', color: '#10b981' },
]

const reminders = [
  { label: '临期复议提醒', sub: '14件案件复议期限不足7天', color: '#ef4444' },
  { label: '需补答复文书', sub: '9件案件已登记结果但未绑定答复文书', color: '#f59e0b' },
  { label: '建议建立救济记录', sub: '11件不利答复建议进入救济监督', color: '#8b5cf6' },
]

const distribution = [
  { label: '不予立案', count: 68, color: '#ef4444' },
  { label: '责令整改', count: 34, color: '#1677ff' },
  { label: '已受理', count: 24, color: '#10b981' },
  { label: '已办结', count: 40, color: '#8b5cf6' },
  { label: '其他', count: 20, color: '#f59e0b' },
]

const responseRows = [
  { code: 'AJ202604230018', shop: '1989潮牌鞋服集合店', subject: '商品宣传', office: '杭州市市场监督管理局', type: '不予立案决定书', date: '2026-04-21', result: '不予立案', resultClass: 'badge-red', review: '可复议，剩余6天', document: '不予立案决定书.pdf', nextStep: '准备复议材料' },
  { code: 'AJ202604220012', shop: '优品数码专营店', subject: '违法宣传', office: '余杭区市场监督管理局', type: '投诉举报答复', date: '2026-04-18', result: '责令整改', resultClass: 'badge-blue', review: '无需复议', document: '整改答复函.pdf', nextStep: '跟进整改结果' },
  { code: 'AJ202604180009', shop: '家居生活馆', subject: '虚假宣传', office: '广州市市场监督管理局', type: '信息公开答复', date: '2026-04-16', result: '未完整公开', resultClass: 'badge-orange', review: '可复议，剩余18天', document: '信息公开答复.pdf', nextStep: '建立信息公开复议' },
]
</script>
