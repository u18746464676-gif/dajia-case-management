<template>
  <div class="page-shell">
    <div class="page-header page-header-row">
      <div>
        <div class="page-title-inline">
          <h1 class="page-title">案件处置工作台</h1>
          <span class="page-title-note">循证留痕，依法跟进</span>
        </div>
        <p class="page-desc">集中记录购买事实、投诉举报、邮寄签收、机关答复、救济监督和费用收益，帮助维权案件形成完整证据链与跟进链。</p>
      </div>
      <div class="header-actions">
        <button class="top-action-btn icon-only">🔔</button>
        <button class="top-action-btn user-pill">
          <span class="mini-avatar">打</span>
          <span>打假人</span>
          <span class="caret">▾</span>
        </button>
      </div>
    </div>

    <div class="dashboard-layout">
      <div class="dashboard-main-column">
        <div class="stat6-grid">
          <div class="stat-card" v-for="c in statCards" :key="c.label">
            <div class="stat-icon" :style="{ background: c.iconBg, color: c.iconColor }">{{ c.icon }}</div>
            <div class="stat-body">
              <div class="stat-label">{{ c.label }}</div>
              <div class="stat-value">{{ c.value }}</div>
              <div class="stat-change" :class="c.trend">{{ c.change }}</div>
            </div>
          </div>
        </div>

        <div class="filter-bar">
          <span class="filter-bar-label">快捷筛选</span>
          <button
            v-for="f in quickFilters"
            :key="f.key"
            class="quick-filter-btn"
            :class="activeQuick === f.key ? 'active' : ''"
            @click="activeQuick = f.key"
          >
            {{ f.label }}
          </button>
        </div>

        <div class="toolbar-card workbench-toolbar">
          <select class="toolbar-select"><option>年份</option><option>2026</option><option>2025</option></select>
          <select class="toolbar-select"><option>月份</option><option>04</option><option>03</option></select>
          <select class="toolbar-select wide"><option>全部进度</option></select>
          <select class="toolbar-select wide"><option>全部类型</option></select>
          <div class="toolbar-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="搜索店铺/商品/案件编号/内容" />
          </div>
          <button class="btn-reset">重置</button>
        </div>

        <div class="table-card">
          <div class="table-head table-head-large">
            <div>
              <div class="table-head-title-row">
                <h2>待跟进案件</h2>
                <span class="info-dot">i</span>
              </div>
              <p>优先展示需要继续操作的案件，按照期限紧急程度和材料缺口综合排序。</p>
            </div>
            <button class="btn-ghost">刷新</button>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 36px"></th>
                <th>案件编号</th>
                <th>店铺 / 商家</th>
                <th>商品 / 事项</th>
                <th>当前进度</th>
                <th>结果 / 签收日期</th>
                <th>期限提醒</th>
                <th>我方下一步</th>
                <th>金额</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in followUpCases" :key="item.id" :class="index === 0 ? 'selected-row' : ''">
                <td>
                  <div class="row-radio" :class="index === 0 ? 'active' : ''"></div>
                </td>
                <td>{{ item.code }}</td>
                <td>{{ item.shop }}</td>
                <td>{{ item.subject }}</td>
                <td><span class="status-chip" :class="item.progressClass">{{ item.progress }}</span></td>
                <td>{{ item.result }}</td>
                <td><span class="status-chip" :class="item.deadlineClass">{{ item.deadline }}</span></td>
                <td>{{ item.nextStep }}</td>
                <td>{{ item.amount }}</td>
                <td>{{ item.updatedAt }}</td>
                <td>
                  <div class="table-actions">
                    <button class="btn-link">查看</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="table-foot">
            <span>共 <strong>10</strong> 条</span>
            <span>10条/页</span>
            <div class="pagination">
              <button class="page-btn">&lt;</button>
              <button class="page-btn active">1</button>
              <button class="page-btn">2</button>
              <button class="page-btn">3</button>
              <button class="page-btn">&gt;</button>
            </div>
          </div>
        </div>
      </div>

      <div class="right-sidebar">
        <div class="side-card">
          <div class="side-card-head">
            <h3>跟进提醒</h3>
            <button class="btn-link">更多 &gt;</button>
          </div>
          <div class="reminder-list reminder-list-compact">
            <div class="follow-reminder-item" v-for="r in reminders" :key="r.label">
              <div class="follow-reminder-icon" :style="{ background: r.bg, color: r.color }">{{ r.icon }}</div>
              <div class="follow-reminder-body">
                <div class="reminder-label">{{ r.label }}</div>
                <div class="reminder-sub">{{ r.sub }}</div>
              </div>
              <div class="reminder-badge">{{ r.count }}</div>
            </div>
          </div>
        </div>

        <div class="side-card">
          <div class="side-card-head">
            <h3>费用收益概览（本月）</h3>
          </div>
          <div class="mini-stat-grid">
            <div class="mini-stat-card" v-for="f in feeStats" :key="f.label">
              <div class="mini-stat-label">{{ f.label }}</div>
              <div class="mini-stat-value">{{ f.value }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, ref } from 'vue'

const openAINextStepDrawer = inject('openAINextStepDrawer', null)

const statCards = [
  { label: '案件总数', value: 128, change: '较上月 +18', trend: 'up', icon: '📁', iconBg: '#e8f2ff', iconColor: '#1677ff' },
  { label: '待整理', value: 12, change: '较上月 -3', trend: 'down', icon: '🗂️', iconBg: '#f5f3ff', iconColor: '#8b5cf6' },
  { label: '已寄出', value: 35, change: '较上月 +6', trend: 'up', icon: '📮', iconBg: '#ecfdf5', iconColor: '#10b981' },
  { label: '等待答复', value: 26, change: '较上月 +4', trend: 'up', icon: '⏳', iconBg: '#fff7ed', iconColor: '#f59e0b' },
  { label: '可复议', value: 9, change: '较上月 +2', trend: 'up', icon: '⚖️', iconBg: '#fef2f2', iconColor: '#ef4444' },
  { label: '临期提醒', value: 7, change: '较上月 +1', trend: 'up', icon: '🔔', iconBg: '#fef9c3', iconColor: '#ca8a04' },
]

const quickFilters = [
  { key: 'all', label: '全部' },
  { key: 'evidence', label: '待补证据' },
  { key: 'mail', label: '待邮寄' },
  { key: 'signed', label: '已签收未答复' },
  { key: 'unsatisfied', label: '答复不满意' },
  { key: 'reconsider', label: '可复议' },
  { key: 'review_due', label: '复议临期' },
  { key: 'paid', label: '已回款' },
  { key: 'archived', label: '已归档' },
]
const activeQuick = ref('all')

const followUpCases = [
  { id: 1, code: 'AJ202604230018', shop: '1989潮牌鞋服集合店', subject: '短视频宣传“国家级认证”', progress: '已签收未答复', progressClass: 'badge-orange', result: '2026-05-07 已签收', deadline: '复议临期 3天', deadlineClass: 'badge-red', nextStep: '催告 / 信息公开', amount: '¥199.00', updatedAt: '10:26', },
  { id: 2, code: 'AJ202604220012', shop: '优品数码专营店', subject: '夸大功能宣传', progress: '准备复议', progressClass: 'badge-blue', result: '不予立案', deadline: '7天', deadlineClass: 'badge-orange', nextStep: '准备复议材料', amount: '¥88.00', updatedAt: '09:45', },
  { id: 3, code: 'AJ202604150007', shop: '母婴之家旗舰店', subject: '签收31天未答复', progress: '待跟进', progressClass: 'badge-purple', result: '已签收 31天未登记答复', deadline: '已超期24天', deadlineClass: 'badge-red', nextStep: '催告 / 信息公开', amount: '¥168.00', updatedAt: '昨天', },
  { id: 4, code: 'AJ202604230021', shop: '美妆小铺', subject: '商品页宣传“零添加”', progress: '待补材料', progressClass: 'badge-orange', result: '-', deadline: '5天', deadlineClass: 'badge-orange', nextStep: '上传检测截图', amount: '¥59.90', updatedAt: '昨天', },
  { id: 5, code: 'AJ202604180009', shop: '家居生活馆', subject: '缺少签收截图', progress: '材料缺失', progressClass: 'badge-red', result: '-', deadline: '-', deadlineClass: 'badge-blue', nextStep: '上传签收截图', amount: '¥126.00', updatedAt: '04-24', },
  { id: 6, code: 'AJ202604120006', shop: '3C数码商城', subject: '案件已赔付但未标记', progress: '待处理', progressClass: 'badge-blue', result: '已回款 ¥199.00', deadline: '-', deadlineClass: 'badge-green', nextStep: '标记已回款', amount: '¥199.00', updatedAt: '04-23', },
  { id: 7, code: 'AJ202604120001', shop: '食品生活馆', subject: '答复结果不满意', progress: '可复议', progressClass: 'badge-purple', result: '复议期限剩余15天', deadline: '已超期2天', deadlineClass: 'badge-red', nextStep: '催告 / 上级监督', amount: '¥45.00', updatedAt: '04-22', },
]

const reminders = [
  { label: '复议临期提醒', sub: '3件案件复议期限不足7天', count: 3, icon: '⚠', color: '#ef4444', bg: '#fef2f2' },
  { label: '已签收未答复', sub: '5件案件已签收超过15个工作日', count: 5, icon: '✉', color: '#f59e0b', bg: '#fff7ed' },
  { label: '缺少关键材料', sub: '2件案件缺少快递签收截图', count: 2, icon: '📎', color: '#8b5cf6', bg: '#f5f3ff' },
  { label: '未登记答复结果', sub: '4件案件未登记机关答复结果', count: 4, icon: '📝', color: '#1677ff', bg: '#eaf3ff' },
  { label: '建议信息公开', sub: '1件案件建议申请信息公开', count: 1, icon: '💡', color: '#10b981', bg: '#ecfdf5' },
]

const feeStats = [
  { label: '本月购买金额', value: '¥2,480' },
  { label: '本月赔付金额', value: '¥8,200' },
  { label: '本月净收益', value: '¥5,720' },
  { label: '本月新增案件', value: '12' },
]
</script>
