<template>
  <div class="page-shell">
    <!-- 顶部案件定位区 -->
    <div class="page-header page-header-row relief-header">
      <div class="breadcrumb-area">
        <router-link to="/relief" class="breadcrumb-link">案件详情</router-link>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">{{ selectedCase?.caseNumber || '未选择案件' }}</span>
      </div>
      <div class="header-actions">
        <router-link to="/relief" class="btn-secondary sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="15 18 9 12 15 6"/></svg>
          返回列表
        </router-link>
        <router-link v-if="selectedCase" :to="'/case/' + selectedCase.id + '/edit'" class="btn-secondary sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          编辑案件
        </router-link>
        <span v-if="selectedCase" class="status-badge badge-orange">{{ caseStatusLabel }}</span>
      </div>
    </div>

    <!-- 无可显示案件时 -->
    <div v-if="!selectedCase" class="table-card" style="padding: 40px; text-align: center;">
      <p style="color: #888; margin-bottom: 16px;">暂无可显示的案件</p>
      <p style="color: #aaa; font-size: 13px;">当前没有需要救济监督的案件，或请先在案件档案中查看。</p>
      <router-link to="/archive" class="btn-primary" style="display: inline-block; margin-top: 16px;">去案件档案</router-link>
    </div>

    <template v-if="selectedCase">
      <!-- 案件主卡 -->
      <div class="case-main-card">
        <div class="case-main-title">{{ selectedCase.shopName || '未填写店铺' }}</div>
        <div class="case-main-grid">
          <div class="case-field"><span class="field-label">平台</span><span class="field-value">{{ selectedCase.platformSource || '未填写' }}</span></div>
          <div class="case-field"><span class="field-label">商品</span><span class="field-value">{{ selectedCase.productName || '未填写' }}</span></div>
          <div class="case-field full-width"><span class="field-label">订单号</span><span class="field-value">{{ selectedCase.orderNo || '-' }}</span></div>
          <div class="case-field"><span class="field-label">金额</span><span class="field-value badge-money">¥{{ (selectedCase.expense || 0).toFixed(2) }}</span></div>
          <div class="case-field"><span class="field-label">案件类型</span><span class="field-value">{{ selectedCase.caseType || '举报' }}</span></div>
          <div class="case-field"><span class="field-label">主要问题</span><span class="field-value">{{ selectedCase.mainIssue || '-' }}</span></div>
          <div class="case-field"><span class="field-label">提交日期</span><span class="field-value">{{ selectedCase.reportDate || '-' }}</span></div>
          <div class="case-field"><span class="field-label">签收日期</span><span class="field-value">{{ selectedCase.signDate || '-' }}</span></div>
          <div class="case-field"><span class="field-label">当前状态</span><span class="field-value badge-blue-sm">{{ caseStatusLabel }}</span></div>
          <div class="case-field"><span class="field-label">超期天数</span><span :class="'field-value ' + (overdueDays > 0 ? 'badge-red-sm' : 'badge-blue-sm')">{{ overdueDays > 0 ? '已超期' + overdueDays + '天' : overdueDays < 0 ? '剩余' + Math.abs(overdueDays) + '天' : '无超期' }}</span></div>
          <div class="case-field full-width"><span class="field-label">关联机关</span><span class="field-value">{{ selectedCase.jurisdiction || '未填写' }}</span></div>
          <div class="case-field"><span class="field-label">处理结果</span><span :class="'field-value ' + (isUnfavorable ? 'badge-red-sm' : 'badge-green-sm')">{{ reportResultLabel }}</span></div>
          <div class="case-field"><span class="field-label">结果日期</span><span class="field-value">{{ selectedCase.reportResultDate || '-' }}</span></div>
          <div class="case-field full-width"><span class="field-label">答复文书</span><span class="field-value link-blue">{{ selectedCase.documents && selectedCase.documents.length > 0 ? selectedCase.documents.length + '份文书' : '未关联' }}</span></div>
          <div class="case-field full-width"><span class="field-label">是否可复议</span><span :class="'field-value ' + (canReconsider ? 'badge-green-sm' : 'badge-gray-sm')">{{ canReconsider ? '是（剩余' + reconsiderDaysLeft + '天）' : '否或已超期' }}</span></div>
        </div>
      </div>

      <!-- 案件详情 tab -->
      <div class="detail-tabs">
        <button class="detail-tab">案件信息</button>
        <button class="detail-tab">证据材料 <span class="tab-count">{{ (selectedCase.images?.length || 0) + (selectedCase.documents?.length || 0) }}</span></button>
        <button class="detail-tab">邮寄台账</button>
        <button class="detail-tab">机关答复</button>
        <button class="detail-tab active">救济监督 <span class="tab-count">{{ reliefRecords.length }}</span></button>
        <button class="detail-tab">办理记录</button>
        <button class="detail-tab">提醒记录</button>
      </div>

      <!-- 主内容两列布局 -->
      <div class="detail-layout relief-layout">
        <!-- 左侧主区域 -->
        <div class="detail-main-column">
          <div class="section-head">
            <h3>关联的救济监督记录（{{ reliefRecords.length }}）</h3>
            <button v-if="selectedCase" class="btn-primary sm"><span>＋</span>新增救济记录</button>
          </div>

          <!-- 无救济记录时 -->
          <div v-if="reliefRecords.length === 0" class="table-card" style="padding: 32px; text-align: center; color: #888;">
            <p>当前案件暂无救济监督记录</p>
            <p style="font-size: 13px; color: #aaa; margin-top: 8px;">点击上方「新增救济记录」按钮添加</p>
          </div>

          <div class="relief-cards">
            <div v-for="(rec, idx) in reliefRecords" :key="rec.id" class="relief-card" :class="reliefCardClass(idx)">
              <div class="relief-card-left-bar" :style="{ background: reliefCardColor(idx) }"></div>
              <div class="relief-card-body">
                <div class="relief-card-top">
                  <div class="relief-type">{{ DISPOSAL_TYPE_MAP[rec.disposalType] || rec.disposalType || '其他' }}</div>
                  <span class="status-badge" :class="reliefStatusClass(rec.status)">{{ rec.status || '待处理' }}</span>
                </div>
                <div class="relief-fields">
                  <div class="relief-field"><span class="relief-label">提交对象</span><span class="relief-value">{{ rec.targetOrgan || '-' }}</span></div>
                  <div class="relief-field"><span class="relief-label">提交日期</span><span class="relief-value">{{ rec.submitDate || '未提交' }}</span></div>
                  <div class="relief-field"><span class="relief-label">期限提醒</span><span :class="'relief-value ' + reliefDeadlineClass(rec)">{{ reliefDeadlineText(rec) }}</span></div>
                  <div class="relief-field"><span class="relief-label">我方下一步</span><span class="relief-value">{{ rec.note || '待跟进' }}</span></div>
                  <div class="relief-field"><span class="relief-label">关联材料</span><span class="relief-value">{{ (rec.relatedMaterials?.length || 0) + '份' }}</span></div>
                </div>
                <div class="relief-actions">
                  <button class="btn-link sm">查看</button>
                  <button class="btn-link sm">编辑</button>
                  <button class="btn-link sm">更多</button>
                </div>
              </div>
            </div>
          </div>

          <div class="collapse-section">
            <button class="collapse-btn">已完成的救济记录（0）<span class="collapse-arrow">▾</span></button>
          </div>
        </div>

        <!-- 右侧 AI 建议栏 -->
        <div class="detail-sidebar ai-sidebar">
          <div class="side-card">
            <div class="side-card-head"><h3>AI 下一步建议</h3></div>
            <div class="ai-body">
              <div class="ai-block">
                <div class="ai-block-label">优先建议动作</div>
                <div class="ai-primary-action">
                  <div class="action-main">{{ aiPrimaryAction }}</div>
                  <div class="action-priority">建议优先级：<strong>{{ aiPriority }}</strong></div>
                </div>
              </div>
              <div class="ai-block">
                <div class="ai-block-label">判断依据</div>
                <ul class="ai-list">
                  <li v-for="b in aiBasis" :key="b">{{ b }}</li>
                </ul>
              </div>
              <div class="ai-block">
                <div class="ai-block-label">可选救济路径</div>
                <div class="ai-path-pills">
                  <span v-for="p in aiPaths" :key="p" class="path-pill">{{ p }}</span>
                </div>
              </div>
              <div class="ai-actions">
                <button class="btn-secondary sm full">暂不处理</button>
                <button class="btn-primary sm full">采纳建议</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCaseStore } from '@/stores/case'
import dayjs from 'dayjs'

const store = useCaseStore()

const DISPOSAL_TYPE_MAP = {
  administrative_reconsideration: '行政复议',
  government_info_disclosure: '政府信息公开',
  superior_supervision: '上级机关监督',
  disciplinary_supervision: '纪检监察举报',
  npc_letters: '人大信访',
  administrative_litigation: '行政诉讼',
}

const STATUS_LABELS = {
  pending_report: '待处理', accepted: '已受理', rejected: '不予立案',
  not_punished: '违法事实不成立', closed: '已办结', decided: '已调解',
  mediation_terminated: '终止调解',
}

const UNFAVORABLE = ['rejected', 'not_accepted', 'not_punished', 'exempted', 'mediation_terminated']

// 默认选中第一条有不利结果的案件
const selectedCaseId = ref(null)

const selectedCase = computed(() => {
  if (selectedCaseId.value) {
    const found = store.cases.find(c => c.id === selectedCaseId.value)
    if (found) return found
  }
  // 自动选择第一个有不利结果的案件
  const unfavorable = store.cases.find(c => c.reportResultStatus && UNFAVORABLE.includes(c.reportResultStatus))
  if (unfavorable) {
    selectedCaseId.value = unfavorable.id
    return unfavorable
  }
  // 否则选第一个有处置记录的
  const withDisposals = store.cases.find(c => c.disposals && c.disposals.length > 0)
  if (withDisposals) {
    selectedCaseId.value = withDisposals.id
    return withDisposals
  }
  // 否则选第一个案件
  if (store.cases.length > 0) {
    selectedCaseId.value = store.cases[0].id
    return store.cases[0]
  }
  return null
})

const reliefRecords = computed(() => {
  if (!selectedCase.value) return []
  return selectedCase.value.disposals || []
})

const isUnfavorable = computed(() => {
  return selectedCase.value?.reportResultStatus && UNFAVORABLE.includes(selectedCase.value.reportResultStatus)
})

const reportResultLabel = computed(() => {
  const s = selectedCase.value?.reportResultStatus
  if (!s) return '-'
  return STATUS_LABELS[s] || s
})

const caseStatusLabel = computed(() => {
  const c = selectedCase.value
  if (!c) return '-'
  if (c.mediationStatus === 'decided') return '已调解'
  if (c.reportResultStatus) return STATUS_LABELS[c.reportResultStatus] || c.reportResultStatus
  if (c.procedureVersion === 'old' && c.filingStatus === 'filed') return '已立案'
  if (c.acceptanceStatus) return STATUS_LABELS[c.acceptanceStatus] || c.acceptanceStatus
  return '待处理'
})

const overdueDays = computed(() => {
  const c = selectedCase.value
  if (!c?.signDate || !isUnfavorable.value) return 0
  return dayjs().diff(dayjs(c.reportResultDate || c.signDate), 'day') - 60
})

const reconsiderDaysLeft = computed(() => {
  const c = selectedCase.value
  if (!c?.reportResultDate) return 0
  return 60 - dayjs().diff(dayjs(c.reportResultDate), 'day')
})

const canReconsider = computed(() => {
  return isUnfavorable.value && reconsiderDaysLeft.value > 0
})

// AI 建议
const aiPrimaryAction = computed(() => {
  if (!selectedCase.value) return '无建议'
  if (isUnfavorable.value && canReconsider.value) return '准备行政复议'
  if (isUnfavorable.value && !canReconsider.value) return '建立救济记录'
  if (selectedCase.value.signDate && !selectedCase.value.reportResultStatus) return '催告 / 信息公开'
  return '持续跟进'
})

const aiPriority = computed(() => {
  if (canReconsider.value) return '高'
  if (isUnfavorable.value) return '中'
  return '低'
})

const aiBasis = computed(() => {
  const result = []
  if (isUnfavorable.value) result.push('已登记不利处理结果')
  if (canReconsider.value) result.push('当前仍在可救济期限内')
  if (!selectedCase.value?.reportResultStatus) result.push('尚无最终处理结果')
  if (result.length === 0) result.push('案件持续跟进中')
  return result
})

const aiPaths = computed(() => {
  const paths = ['行政复议', '政府信息公开', '上级机关监督']
  if (isUnfavorable.value) return paths
  return ['持续跟踪', '补充材料']
})

function reliefCardClass(idx) {
  const colors = ['card-blue', 'card-purple', 'card-green', 'card-orange']
  return colors[idx % colors.length]
}

function reliefCardColor(idx) {
  const colors = ['#1677ff', '#8b5cf6', '#10b981', '#f59e0b']
  return colors[idx % colors.length]
}

function reliefStatusClass(status) {
  if (!status) return 'badge-gray'
  if (status.includes('完成') || status.includes('已')) return 'badge-green'
  if (status.includes('提交') || status.includes('进行')) return 'badge-blue'
  if (status.includes('驳回') || status.includes('拒绝')) return 'badge-red'
  return 'badge-orange'
}

function reliefDeadlineText(rec) {
  if (!rec.reviewDeadline60) return '无期限'
  if (!rec.submitDate) return '建议尽快提交'
  const d = dayjs(rec.reviewDeadline60)
  const diff = d.diff(dayjs(), 'day')
  if (diff < 0) return '已超期' + Math.abs(diff) + '天'
  if (diff <= 7) return '剩余' + diff + '天'
  return '剩余' + diff + '天'
}

function reliefDeadlineClass(rec) {
  if (!rec.reviewDeadline60 || !rec.submitDate) return 'text-gray'
  const diff = dayjs(rec.reviewDeadline60).diff(dayjs(), 'day')
  if (diff < 0) return 'text-red'
  if (diff <= 7) return 'text-orange'
  return 'text-blue'
}
</script>
