<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <h1 class="page-title">证据库</h1>
        <p class="page-desc">集中管理所有案件的证据材料，支持分类管理、OCR识别和批量导出。</p>
      </div>
    </div>

    <!-- 视图切换 + 统计 -->
    <div class="evidence-top">
      <div class="view-tabs">
        <button v-for="v in viewModes" :key="v.key" class="view-tab-btn" :class="activeView === v.key ? 'active' : ''" @click="activeView = v.key">{{ v.label }}</button>
      </div>
      <div class="stat4-inline">
        <div class="stat4-item"><span class="stat4-val">1286</span><span class="stat4-label">全部材料</span></div>
        <div class="stat4-item"><span class="stat4-val warn">23</span><span class="stat4-label">未绑定材料</span></div>
        <div class="stat4-item"><span class="stat4-val info">58</span><span class="stat4-label">待OCR识别</span></div>
        <div class="stat4-item"><span class="stat4-val purple">12</span><span class="stat4-label">疑似重复</span></div>
      </div>
    </div>

    <!-- 筛选区 -->
    <div class="filter-card compact">
      <div class="filter-row">
        <select class="filter-select"><option>全部案件状态</option></select>
        <select class="filter-select"><option>全部类型</option></select>
        <select class="filter-select"><option>上传时间</option></select>
        <input type="date" class="filter-input date-input" />
        <input type="date" class="filter-input date-input" />
        <input placeholder="搜索案件、材料、OCR内容" class="filter-input flex-1" />
        <button class="btn-secondary">重置</button>
        <button class="btn-primary">筛选</button>
      </div>
    </div>

    <!-- 操作按钮区 -->
    <div class="action-bar">
      <button class="btn-primary">上传材料</button>
      <button class="btn-secondary">批量上传</button>
      <button class="btn-secondary">OCR识别</button>
      <button class="btn-secondary">批量绑定案件</button>
      <button class="btn-secondary">批量导出</button>
      <button class="btn-danger">删除材料</button>
      <div class="action-bar-right">
        <span class="sort-label">排序：</span>
        <select class="filter-select"><option>更新时间</option><option>上传时间</option></select>
        <button class="btn-icon" :class="gridView ? 'active' : ''" @click="gridView = true">宫格</button>
        <button class="btn-icon" :class="!gridView ? 'active' : ''" @click="gridView = false">列表</button>
      </div>
    </div>

    <!-- 案件材料夹网格 -->
    <div class="folder-grid">
      <div class="folder-card" v-for="f in folders" :key="f.name">
        <div class="folder-icon">📁</div>
        <div class="folder-name">{{ f.name }}</div>
        <div class="folder-count">{{ f.count }}条材料</div>
        <div class="folder-meta">{{ f.binded }}已绑定 · {{ f.orphan }}未绑定</div>
      </div>
    </div>

    <!-- 材料详情区 -->
    <div class="material-detail-card">
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <p>选择左侧案件材料夹查看详情</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const activeView = ref('group')
const gridView = ref(true)
const viewModes = [
  { key: 'group', label: '案件分组视图' },
  { key: 'list', label: '材料列表视图' },
  { key: 'check', label: '缺失检查视图' },
]
const folders = [
  { name: '2026年4月 - 拼多多打假', count: 32, binded: 28, orphan: 4 },
  { name: '2026年3月 - 淘宝投诉', count: 18, binded: 16, orphan: 2 },
  { name: '2026年2月 - 举报跟进', count: 25, binded: 22, orphan: 3 },
  { name: '2026年1月 - 新年特辑', count: 11, binded: 9, orphan: 2 },
  { name: '2025年12月 - 年终汇总', count: 40, binded: 38, orphan: 2 },
  { name: '2025年11月 - 批量处理', count: 29, binded: 27, orphan: 2 },
]
</script>
