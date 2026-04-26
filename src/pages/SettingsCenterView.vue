<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <h1 class="page-title">设置中心</h1>
        <p class="page-desc">管理账户基础资料、通知偏好、接口配置等系统设置。</p>
      </div>
    </div>

    <!-- 一级设置页签 -->
    <div class="page-tabs">
      <button v-for="t in tabs" :key="t" class="page-tab" :class="activeTab === t ? 'active' : ''" @click="activeTab = t">{{ t }}</button>
    </div>

    <!-- 基础资料说明条 -->
    <div class="info-strip blue">
      <span class="info-icon">ℹ️</span>
      <span>基础资料包括账户信息、维权偏好、平台绑定等，修改后将影响新建案件和通知推送。</span>
    </div>

    <!-- 二级分类Tab -->
    <div class="sub-tabs">
      <button v-for="s in subTabs" :key="s" class="sub-tab" :class="activeSub === s ? 'active' : ''" @click="activeSub = s">{{ s }}</button>
    </div>

    <!-- 配置表格 -->
    <div class="table-card">
      <table class="data-table config-table">
        <thead>
          <tr>
            <th style="width:220px">配置项</th>
            <th>当前值</th>
            <th style="width:120px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in configItems" :key="c.label">
            <td class="config-label">{{ c.label }}</td>
            <td class="config-value">{{ c.value }}</td>
            <td><button class="btn-link">编辑</button></td>
          </tr>
          <tr v-if="!configItems.length"><td colspan="3" class="empty-cell">暂无配置项</td></tr>
        </tbody>
      </table>
    </div>

    <!-- 右侧栏 -->
    <div class="right-sidebar">
      <div class="side-card">
        <h3>基础资料概览</h3>
        <div class="profile-overview">
          <div class="profile-item"><span class="profile-key">用户名</span><span class="profile-val">打假人 VIP</span></div>
          <div class="profile-item"><span class="profile-key">ID</span><span class="profile-val">888888</span></div>
          <div class="profile-item"><span class="profile-key">注册时间</span><span class="profile-val">2024-01-01</span></div>
          <div class="profile-item"><span class="profile-key">案件总数</span><span class="profile-val">128</span></div>
        </div>
      </div>
      <div class="side-card">
        <h3>最近更新</h3>
        <div class="recent-list">
          <div class="recent-item" v-for="r in recentUpdates" :key="r">{{ r }}</div>
        </div>
      </div>
      <div class="side-card">
        <h3>数据安全</h3>
        <div class="quick-actions">
          <button class="btn-secondary w-full">修改密码</button>
          <button class="btn-secondary w-full">导出账户数据</button>
          <button class="btn-secondary w-full">登录日志</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const activeTab = ref('基础设置')
const activeSub = ref('账户信息')
const tabs = ['基础设置', '通知设置', '接口设置', '数据管理']
const subTabs = ['账户信息', '维权偏好', '平台绑定', '通知偏好']
const configItems = [
  { label: '默认维权类型', value: '投诉举报' },
  { label: '首选平台', value: '拼多多' },
  { label: '默认管辖局', value: '市场监督管理局' },
  { label: '通知接收邮箱', value: 'user@example.com' },
  { label: '短信提醒', value: '已开启' },
]
const recentUpdates = [
  '2026-04-25 修改通知偏好',
  '2026-04-20 更新平台绑定',
  '2026-04-15 修改账户密码',
]
</script>
