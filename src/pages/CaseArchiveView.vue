<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <h1 class="page-title">案件档案</h1>
        <p class="page-desc">全部案件的档案库，支持全量查看、筛选、批量管理和导出，方便历史查询与数据维护。</p>
      </div>
    </div>

    <!-- 顶部操作栏 -->
    <div class="action-bar">
      <button class="btn-primary">新建案件</button>
      <button class="btn-secondary">批量导入</button>
      <button class="btn-secondary">批量导出</button>
      <button class="btn-secondary">批量归档</button>
      <button class="btn-danger">批量删除</button>
      <button class="btn-secondary">更多操作</button>
      <div class="action-bar-right">
        <button class="btn-link">导入模板下载</button>
      </div>
    </div>

    <!-- 高级筛选 -->
    <div class="filter-card">
      <div class="filter-card-head">
        <span class="section-title-sm">高级筛选</span>
        <button class="btn-link">重置</button>
      </div>
      <div class="filter5-grid">
        <div class="filter-field"><label>年份</label><select class="filter-select"><option>全部年份</option><option>2026</option><option>2025</option></select></div>
        <div class="filter-field"><label>月份</label><select class="filter-select"><option>全部月份</option><option>01-06</option></select></div>
        <div class="filter-field"><label>当前进度</label><select class="filter-select"><option>全部进度</option><option>待整理</option><option>已寄出</option><option>已签收</option></select></div>
        <div class="filter-field"><label>案件类型</label><select class="filter-select"><option>全部类型</option><option>投诉</option><option>举报</option></select></div>
        <div class="filter-field"><label>平台来源</label><select class="filter-select"><option>全部平台</option><option>拼多多</option><option>淘宝</option></select></div>
        <div class="filter-field"><label>管辖局</label><select class="filter-select"><option>全部管辖局</option></select></div>
        <div class="filter-field filter-search"><label>搜索</label><input placeholder="搜索案件编号/店铺/商品" class="filter-input" /></div>
      </div>
      <div class="filter-actions">
        <button class="btn-primary">筛选</button>
        <button class="btn-secondary">重置</button>
      </div>
    </div>

    <!-- 状态Tab -->
    <div class="status-tab">
      <button v-for="t in statusTabs" :key="t.key" class="status-tab-btn" :class="activeTab === t.key ? 'active' : ''" @click="activeTab = t.key">
        {{ t.label }} <span class="tab-count">{{ t.count }}</span>
      </button>
    </div>

    <!-- 完整案件表格 -->
    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th><input type="checkbox" /></th>
            <th>案件编号</th><th>店铺/商家</th><th>商品/事项</th><th>平台来源</th><th>当前进度</th><th>管辖局</th><th>签收日期</th><th>答复结果</th><th>金额(元)</th><th>更新时间</th><th>是否归档</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr><td colspan="13" class="empty-cell">暂无案件数据</td></tr>
        </tbody>
      </table>
      <div class="table-foot">
        <span>已选择 <strong>0</strong> 项</span>
        <span>共 <strong>0</strong> 条</span>
        <div class="pagination">
          <button class="page-btn">上一页</button>
          <button class="page-btn active">1</button>
          <button class="page-btn">下一页</button>
          <span class="page-info">10条/页</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const activeTab = ref('all')
const statusTabs = [
  { key: 'all', label: '全部案件', count: 386 },
  { key: 'ongoing', label: '进行中', count: 128 },
  { key: 'done', label: '已完成', count: 186 },
  { key: 'archived', label: '已归档', count: 72 },
  { key: 'deleted', label: '已删除', count: 0 },
]
</script>
