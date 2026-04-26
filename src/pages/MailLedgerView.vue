<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <h1 class="page-title">邮寄台账</h1>
        <p class="page-desc">集中管理所有案件的寄出记录、快递单号、签收状态、签收日期和后续跟进节点。</p>
      </div>
    </div>

    <div class="stat5-grid">
      <div class="stat-card sm" v-for="s in statCards" :key="s.label">
        <div class="stat-icon sm" :style="{ background: s.bg, color: s.color }">{{ s.icon }}</div>
        <div class="stat-body">
          <div class="stat-label">{{ s.label }}</div>
          <div class="stat-value">{{ s.value }}</div>
        </div>
      </div>
    </div>

    <div class="filter-bar">
      <span class="filter-bar-label">快捷筛选</span>
      <button v-for="f in quickFilters" :key="f" class="quick-filter-btn" :class="active === f ? 'active' : ''" @click="active = f">{{ f }}</button>
    </div>

    <div class="action-bar">
      <button class="btn-primary">新增邮寄记录</button>
      <button class="btn-secondary">批量导入单号</button>
      <button class="btn-secondary">批量更新签收</button>
      <button class="btn-secondary">导出邮寄台账</button>
    </div>

    <div class="dashboard-layout">
      <div class="dashboard-main-column">
        <div class="filter-card compact">
          <div class="filter-row">
            <select class="filter-select"><option>年份</option></select>
            <select class="filter-select"><option>月份</option></select>
            <select class="filter-select"><option>寄送对象</option></select>
            <select class="filter-select"><option>寄送事项</option></select>
            <select class="filter-select"><option>快递公司</option></select>
            <select class="filter-select"><option>签收状态</option></select>
            <input placeholder="搜索案件编号 / 店铺 / 单号 / 寄送对象" class="filter-input flex-1" />
            <button class="btn-secondary">重置</button>
          </div>
        </div>

        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th><input type="checkbox" /></th>
                <th>案件编号</th>
                <th>店铺 / 商家</th>
                <th>寄送对象</th>
                <th>寄送事项</th>
                <th>快递公司</th>
                <th>快递单号</th>
                <th>寄出日期</th>
                <th>签收日期</th>
                <th>签收状态</th>
                <th>下一步</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in mailRows" :key="item.code">
                <td><input type="checkbox" /></td>
                <td>{{ item.code }}</td>
                <td>{{ item.shop }}</td>
                <td>{{ item.target }}</td>
                <td>{{ item.subject }}</td>
                <td>{{ item.company }}</td>
                <td>{{ item.tracking }}</td>
                <td>{{ item.sentAt }}</td>
                <td>{{ item.signedAt }}</td>
                <td><span class="status-chip" :class="item.statusClass">{{ item.status }}</span></td>
                <td>{{ item.nextStep }}</td>
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
          <div class="side-card-head"><h3>签收提醒</h3></div>
          <div class="reminder-list">
            <div class="reminder-item" v-for="r in signReminders" :key="r.label">
              <div class="reminder-dot" :style="{ background: r.color }"></div>
              <div class="reminder-body">
                <div class="reminder-label">{{ r.label }}</div>
                <div class="reminder-sub">{{ r.sub }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="side-card">
          <div class="side-card-head"><h3>物流状态分布</h3></div>
          <div class="donut-wrap">
            <div class="donut-chart"><span>149</span></div>
            <div class="donut-legend">
              <div class="donut-legend-item" v-for="d in distribution" :key="d.label">
                <span class="dot" :style="{ background: d.color }"></span>
                <span>{{ d.label }}</span>
                <strong>{{ d.count }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const active = ref('全部')
const quickFilters = ['全部', '待寄出', '有单号未签收', '已签收未答复', '超15个工作日', '缺签收截图', '复议相关寄送']
const statCards = [
  { label: '待寄出', value: 18, icon: '📮', bg: '#e8f2ff', color: '#1677ff' },
  { label: '运输中', value: 26, icon: '🚚', bg: '#eff6ff', color: '#2563eb' },
  { label: '已签收', value: 92, icon: '✅', bg: '#ecfdf5', color: '#10b981' },
  { label: '签收未答复', value: 31, icon: '📄', bg: '#fff7ed', color: '#f59e0b' },
  { label: '超期未答复', value: 7, icon: '⚠️', bg: '#fef2f2', color: '#ef4444' },
]
const signReminders = [
  { label: '已签收未答复', sub: '31条寄送记录已签收但未登记机关答复', color: '#ef4444' },
  { label: '缺签收截图', sub: '12条记录需要补传签收截图', color: '#f59e0b' },
  { label: '复议相关寄送', sub: '5条复议寄送记录需要核对期限', color: '#8b5cf6' },
]
const distribution = [
  { label: '已签收', count: 92, color: '#10b981' },
  { label: '运输中', count: 26, color: '#1677ff' },
  { label: '待寄出', count: 18, color: '#f59e0b' },
  { label: '异常退回', count: 13, color: '#ef4444' },
]
const mailRows = [
  { code: 'AJ202604230018', shop: '1989潮牌鞋服集合店', target: '杭州市市场监督管理局', subject: '投诉举报材料', company: '中国邮政', tracking: 'XA123456789CN', sentAt: '2026-04-18', signedAt: '2026-04-21', status: '已签收', statusClass: 'badge-green', nextStep: '等待答复' },
  { code: 'AJ202604220012', shop: '优品数码专营店', target: '余杭区市场监督管理局', subject: '信息公开申请', company: '顺丰速运', tracking: 'SF1234567890', sentAt: '2026-04-19', signedAt: '-', status: '运输中', statusClass: 'badge-blue', nextStep: '跟进物流' },
  { code: 'AJ202604210007', shop: '母婴之家旗舰店', target: '上海市市场监督管理局', subject: '复议材料', company: '京东快递', tracking: 'JD1234509876', sentAt: '2026-04-10', signedAt: '2026-04-12', status: '已签收未答复', statusClass: 'badge-orange', nextStep: '催告 / 信息公开' },
  { code: 'AJ202604180009', shop: '家居生活馆', target: '广州市市场监督管理局', subject: '投诉举报材料', company: '中国邮政', tracking: 'XA998877665CN', sentAt: '-', signedAt: '-', status: '待寄出', statusClass: 'badge-red', nextStep: '打印面单寄出' },
]
</script>
