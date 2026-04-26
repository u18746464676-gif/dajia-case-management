<template>
  <div class="page-shell">
    <div class="page-header page-header-row">
      <div>
        <h1 class="page-title">收支统计</h1>
      </div>
      <div class="header-actions">
        <button class="btn-secondary">使用说明</button>
        <button class="btn-primary">更新数据</button>
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
        <input type="date" class="filter-input date-input" placeholder="开始日期" />
        <input type="date" class="filter-input date-input" placeholder="结束日期" />
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
import { ref, computed } from 'vue'
import { useCaseStore } from '@/stores/case'
import dayjs from 'dayjs'

const store = useCaseStore()
const activeTab = ref('收支明细')
const tabs = ['收支总览', '收支明细', '平台分析', '店铺分析']

const statCards = computed(() => {
  const all = store.cases
  const totalCases = all.length
  const totalBuy = all.reduce((sum, c) => sum + Number(c.expense || 0), 0)
  const totalCompensation = all.reduce((sum, c) => sum + Number(c.profit || 0), 0)
  const netProfit = totalCompensation - totalBuy
  const paidCases = all.filter(c => Number(c.profit || 0) > 0).length
  const resultCases = all.filter(c => c.reportResultStatus || c.mediationStatus === 'decided').length
  const successRate = resultCases > 0 ? ((paidCases / resultCases) * 100).toFixed(1) : '0.0'
  return [
    { label: '累计案件数', value: totalCases, icon: '📁', bg: '#e8f2ff', color: '#1677ff' },
    { label: '累计购买金额', value: `¥${totalBuy.toFixed(2)}`, icon: '💰', bg: '#eff6ff', color: '#2563eb' },
    { label: '累计赔付金额', value: `¥${totalCompensation.toFixed(2)}`, icon: '💵', bg: '#ecfdf5', color: '#10b981' },
    { label: '累计净收益', value: `¥${netProfit.toFixed(2)}`, icon: '📈', bg: '#f5f3ff', color: '#8b5cf6' },
    { label: '已回款案件数', value: paidCases, icon: '✅', bg: '#fff7ed', color: '#f59e0b' },
    { label: '赔付成功率', value: `${successRate}%`, icon: '📊', bg: '#fef2f2', color: '#ef4444' },
  ]
})

const financeRows = computed(() => {
  return store.cases.map(c => {
    const buyAmt = Number(c.expense || 0)
    const compAmt = Number(c.profit || 0)
    return {
      id: c.id,
      code: c.caseNumber || '待生成',
      shop: c.shopName || '-',
      subject: c.productName || '-',
      platform: c.platformSource || '-',
      office: c.jurisdiction || '-',
      buy: `¥${buyAmt.toFixed(2)}`,
      compensation: `¥${compAmt.toFixed(2)}`,
      profit: `¥${(compAmt - buyAmt).toFixed(2)}`,
      progress: c.mediationStatus === 'decided' ? '已调解' : (c.reportResultStatus || '-'),
      result: c.reportResultStatus ? { rejected: '不予立案', not_punished: '违法事实不成立', closed: '已办结', exempted: '免于处罚', mediation_terminated: '终止调解', not_accepted: '不予受理' }[c.reportResultStatus] || c.reportResultStatus : '-',
      paid: compAmt > 0 ? '是' : '否',
      updatedAt: c.updatedAt ? dayjs(c.updatedAt).format('YYYY-MM-DD') : '-',
    }
  })
})

const metrics = computed(() => {
  const all = store.cases
  const jurisdictions = [...new Set(all.map(c => c.jurisdiction).filter(Boolean))]
  return [
    { label: '涉及城市', value: jurisdictions.length },
    { label: '涉及市监局', value: jurisdictions.length },
    { label: '有效样本机关', value: jurisdictions.length },
    { label: '平均解决率', value: '暂未统计' },
    { label: '平均赔付率', value: '暂未统计' },
    { label: '平均处理周期', value: '暂未统计' },
  ]
})

const cityRanks = computed(() => {
  return []
})

const officeRanks = computed(() => {
  return []
})

const officeTable = computed(() => {
  return []
})
</script>
