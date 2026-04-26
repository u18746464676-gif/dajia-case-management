<template>
  <div class="page-shell">
    <div class="page-header page-header-row">
      <div>
        <h1 class="page-title">设置中心</h1>
        <p class="page-desc">系统基础配置、规则管理和数据安全。</p>
      </div>
      <div class="header-actions">
        <button class="btn-secondary">操作日志</button>
      </div>
    </div>

    <div class="page-tabs">
      <button v-for="t in tabs" :key="t" class="page-tab" :class="activeTab === t ? 'active' : ''" @click="activeTab = t">{{ t }}</button>
    </div>

    <div class="info-strip blue">
      <span class="info-icon">i️</span>
      <span>基础资料用于配置系统中使用的各类基础选项,这些选项将在新建案件、录入数据等场景中使用。</span>
    </div>

    <div class="settings-layout">
      <div class="dashboard-main-column">
        <div class="sub-tabs setting-sub-tabs">
          <button v-for="s in subTabs" :key="s" class="sub-tab" :class="activeSub === s ? 'active' : ''" @click="activeSub = s">{{ s }}</button>
        </div>

        <div class="table-card">
          <div class="table-head">
            <div>
              <h2>平台来源</h2>
              <p>配置案件所涉及的平台名称、平台类型和启用状态。</p>
            </div>
            <div class="table-actions-inline">
              <button class="btn-primary">+ 新增</button>
              <button class="btn-secondary">批量排序</button>
            </div>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>排序</th>
                <th>平台名称</th>
                <th>平台类型</th>
                <th>状态</th>
                <th>备注</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in configItems" :key="item.name">
                <td>{{ item.sort }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.type }}</td>
                <td><span class="switch-pill" :class="item.enabled ? 'on' : 'off'"></span></td>
                <td>{{ item.note }}</td>
                <td>
                  <div class="table-actions">
                    <button class="btn-link">编辑</button>
                    <button class="btn-link">删除</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="setting-help-card">
            <div>
              <div class="help-title">使用说明</div>
              <ol>
                <li>排序值越小,在下拉选择中显示越靠前。</li>
                <li>停用的选项不会在下拉中显示,但历史数据不受影响。</li>
                <li>修改选项名称不会影响历史数据,删除前请确认无关联数据。</li>
              </ol>
            </div>
            <div class="help-illustration">🗂️</div>
          </div>
        </div>
      </div>

      <div class="right-sidebar">
        <div class="side-card">
          <div class="side-card-head"><h3>基础资料概览</h3></div>
          <div class="mini-stat-grid single-column">
            <div class="mini-stat-card" v-for="card in summaryCards" :key="card.label">
              <div class="mini-stat-label">{{ card.label }}</div>
              <div class="mini-stat-value">{{ card.value }}</div>
            </div>
          </div>
        </div>
        <div class="side-card">
          <div class="side-card-head"><h3>最近更新</h3></div>
          <div class="stack-list">
            <div class="stack-item" v-for="r in recentUpdates" :key="r.title">
              <div>{{ r.title }}</div>
              <div class="sub-line">{{ r.time }}</div>
            </div>
          </div>
        </div>
        <div class="side-card">
          <div class="side-card-head"><h3>快捷操作</h3></div>
          <div class="quick-actions-grid one-col">
            <button class="btn-secondary">导入基础资料</button>
            <button class="btn-secondary">导出基础资料</button>
            <button class="btn-secondary">恢复默认设置</button>
            <button class="btn-secondary danger-text">清理无效数据</button>
          </div>
        </div>
        <div class="side-card">
          <div class="side-card-head"><h3>数据安全</h3></div>
          <div class="security-card-list">
            <div class="security-row"><span>最近备份：</span><strong>{{ backupInfo.latestBackupTime || '暂无备份记录' }}</strong></div>
            <div class="security-row"><span>自动备份：</span><strong :class="backupInfo.autoBackupEnabled ? 'green-text' : 'gray-text'">{{ backupInfo.autoBackupEnabled ? '已开启' : '未开启' }}</strong></div>
            <div class="quick-actions-grid one-col top-gap">
              <button class="btn-secondary">立即备份</button>
              <button class="btn-secondary">查看备份记录</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const activeTab = ref('基础资料')
const activeSub = ref('平台来源')
const tabs = ['基础资料', '案件状态', '提醒规则', 'AI建议规则', '文书模板', '机关库', '用户权限', '数据备份', '系统外观']
const subTabs = ['平台来源', '案件类型', '材料类型', '机关类型', '救济路径', '答复结果', '常用地区']
const configItems = [
  { sort: 1, name: '淘宝', type: '电商平台', enabled: true, note: '包括天猫' },
  { sort: 2, name: '拼多多', type: '电商平台', enabled: true, note: '拼多多及多多买菜' },
  { sort: 3, name: '京东', type: '电商平台', enabled: true, note: '京东及京喜' },
  { sort: 4, name: '抖音', type: '内容电商', enabled: true, note: '抖音小店' },
  { sort: 5, name: '快手', type: '内容电商', enabled: false, note: '快手小店' },
  { sort: 6, name: '小红书', type: '内容电商', enabled: false, note: '小红书商城' },
  { sort: 7, name: '线下', type: '线下实体', enabled: true, note: '实体店、批发市场等' },
  { sort: 8, name: '其他', type: '其他渠道', enabled: true, note: '其他平台或渠道' },
]
const summaryCards = [
  { label: '平台来源', value: '8 个' },
  { label: '案件类型', value: '12 个' },
  { label: '材料类型', value: '18 个' },
  { label: '机关类型', value: '15 个' },
  { label: '救济路径', value: '10 个' },
  { label: '答复结果', value: '16 个' },
]
const backupInfo = ref({
  latestBackupTime: null,
  autoBackupEnabled: false,
})

const recentUpdates = ref([])
</script>
