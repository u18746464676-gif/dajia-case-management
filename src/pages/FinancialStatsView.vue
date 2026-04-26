<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <h1 class="page-title">收支统计</h1>
      </div>
    </div>

    <div class="page-tabs">
      <button v-for="t in tabs" :key="t" class="page-tab" :class="activeTab === t ? 'active' : ''" @click="activeTab = t">{{ t }}</button>
    </div>

    <div class="stat6-grid">
      <div class="stat-card sm" v-for="s in statCards" :key="s.label">
        <div class="stat-icon sm" :style="{ background: s.bg, color: s.color }">{{ s.icon }}</div>
        <div class="stat-body">
          <div class="stat-label">{{ s.label }}</div>
          <div class="stat-value small-money">{{ s.value }}</div>
        </div>
      </div>
    </div>

    <div class="info-strip blue">
      <span class="info-icon">ℹ️</span>
      <span>数据为系统累计全部案件的统计结果，包含所有已录入案件。</span>
    </div>

    <div class="filter-card compact">
      <div class="filter-row">
        <select class="filter-select"><option>统计范围</option></select>
        <select class="filter-select"><option>城市</option></select>
        <select class="filter-select"><option>市监局</option></select>
        <select class="filter-select"><option>平台来源</option></select>
        <select class="filter-select"><option>案件状态</option></select>
        <input type="date" class="filter-input date-input" />
        <input type="date" class="filter-input date-input" />
        <button class="btn-primary">查询</button>
        <button class="btn-secondary">重置</button>
      </div>
    </div>

    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>案件编号</th>
            <th>店铺 / 商家</th>
            <th>商品 / 事项</th>
            <th>平台来源</th>
            <th>管辖市监局</th>
            <th>购买金额</th>
            <th>赔付金额</th>
            <th>净收益</th>
            <th>当前进度</th>
            <th>答复结果</th>
            <th>是否回款</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in financeRows" :key="row.code">
            <td>{{ row.code }}</td>
            <td>{{ row.shop }}</td>
            <td>{{ row.subject }}</td>
            <td>{{ row.platform }}</td>
            <td>{{ row.office }}</td>
            <td>{{ row.buy }}</td>
            <td>{{ row.compensation }}</td>
            <td>{{ row.profit }}</td>
            <td>{{ row.progress }}</td>
            <td>{{ row.result }}</td>
            <td>{{ row.paid }}</td>
            <td>{{ row.updatedAt }}</td>
            <td>
              <div class="table-actions">
                <button class="btn-link">查看</button>
                <button class="btn-link">更多</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="table-card analysis-card">
      <div class="table-head">
        <div>
          <h2>机关处理效果分析（按累计数据统计）</h2>
        </div>
      </div>
      <div class="analysis-metrics">
        <div class="analysis-metric" v-for="metric in metrics" :key="metric.label">
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
        </div>
      </div>
      <div class="analysis-grid">
        <div class="analysis-panel">
          <h3>城市解决率 TOP10</h3>
          <div class="rank-bar-item" v-for="item in cityRanks" :key="item.label">
            <span>{{ item.label }}</span>
            <div class="rank-bar"><i :style="{ width: item.value }"></i></div>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
        <div class="analysis-panel">
          <h3>市监局赔付率 TOP10</h3>
          <div class="rank-bar-item" v-for="item in officeRanks" :key="item.label">
            <span>{{ item.label }}</span>
            <div class="rank-bar orange"><i :style="{ width: item.value }"></i></div>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
        <div class="analysis-panel">
          <h3>市监局处理效果排行表</h3>
          <table class="mini-table">
            <thead><tr><th>机关</th><th>解决率</th><th>赔付率</th></tr></thead>
            <tbody>
              <tr v-for="row in officeTable" :key="row.name"><td>{{ row.name }}</td><td>{{ row.solve }}</td><td>{{ row.pay }}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const activeTab = ref('收支明细')
const tabs = ['收支总览', '收支明细', '平台分析', '店铺分析']
const statCards = [
  { label: '累计案件数', value: 500, icon: '📁', bg: '#e8f2ff', color: '#1677ff' },
  { label: '累计购买金额', value: '¥128,650.00', icon: '💰', bg: '#eff6ff', color: '#2563eb' },
  { label: '累计赔付金额', value: '¥289,430.00', icon: '💵', bg: '#ecfdf5', color: '#10b981' },
  { label: '累计净收益', value: '¥160,780.00', icon: '📈', bg: '#f5f3ff', color: '#8b5cf6' },
  { label: '已回款案件数', value: 432, icon: '✅', bg: '#fff7ed', color: '#f59e0b' },
  { label: '赔付成功率', value: '64.80%', icon: '📊', bg: '#fef2f2', color: '#ef4444' },
]
const financeRows = [
  { code: 'AJ202604230018', shop: '1989潮牌鞋服集合店', subject: '商品宣传', platform: '拼多多', office: '杭州市市场监督管理局', buy: '¥199.00', compensation: '¥500.00', profit: '¥301.00', progress: '已回款', result: '责令整改', paid: '是', updatedAt: '2026-04-24' },
  { code: 'AJ202604220012', shop: '优品数码专营店', subject: '违法宣传', platform: '淘宝', office: '余杭区市场监督管理局', buy: '¥88.00', compensation: '¥300.00', profit: '¥212.00', progress: '等待答复', result: '处理中', paid: '否', updatedAt: '2026-04-23' },
  { code: 'AJ202604180009', shop: '家居生活馆', subject: '虚假宣传', platform: '京东', office: '广州市市场监督管理局', buy: '¥126.00', compensation: '¥800.00', profit: '¥674.00', progress: '已回款', result: '已办结', paid: '是', updatedAt: '2026-04-22' },
]
const metrics = [
  { label: '涉及城市', value: 18 },
  { label: '涉及市监局', value: 62 },
  { label: '有效样本机关', value: 41 },
  { label: '平均解决率', value: '52.8%' },
  { label: '平均赔付率', value: '43.6%' },
  { label: '平均处理周期', value: '18天' },
]
const cityRanks = [
  { label: '杭州', value: '82%' },
  { label: '广州', value: '76%' },
  { label: '上海', value: '73%' },
]
const officeRanks = [
  { label: '余杭区局', value: '68%' },
  { label: '西湖区局', value: '61%' },
  { label: '天河区局', value: '57%' },
]
const officeTable = [
  { name: '余杭区市场监督管理局', solve: '68%', pay: '54%' },
  { name: '西湖区市场监督管理局', solve: '61%', pay: '49%' },
  { name: '天河区市场监督管理局', solve: '57%', pay: '46%' },
]
</script>
