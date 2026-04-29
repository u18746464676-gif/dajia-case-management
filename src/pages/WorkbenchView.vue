<template>
  <div class="workbench-app-shell">
    <aside class="wb-sidebar">
      <div class="wb-brand">
        <div class="wb-brand-icon">
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 3 L33 9 L33 24 Q33 33 18 36 Q3 33 3 24 L3 9 Z" fill="#F7D27A" />
            <path d="M18 3 L33 9 L33 24 Q33 33 18 36 Q3 33 3 24 L3 9 Z" stroke="#D4A24C" stroke-width="1.5" fill="none" />
            <path d="M18 10.5L24.5 13.5V19.6C24.5 23.3 21.8 26 18 27.2C14.2 26 11.5 23.3 11.5 19.6V13.5L18 10.5Z" fill="#8B2F0F" opacity="0.18" />
            <path d="M18 13V21" stroke="#8B2F0F" stroke-width="2" stroke-linecap="round" />
            <path d="M14.5 17.2H21.5" stroke="#8B2F0F" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <div class="wb-brand-text">
          <div class="wb-brand-name">打假维权</div>
          <div class="wb-brand-sub">案件管理系统</div>
        </div>
      </div>

      <nav class="wb-nav">
        <router-link to="/workbench" class="wb-nav-item active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
          <span>工作台</span>
        </router-link>
        <router-link to="/cases" class="wb-nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
          <span>案件档案</span>
        </router-link>
        <router-link to="/evidence" class="wb-nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
          <span>证据库</span>
        </router-link>
        <router-link to="/mail" class="wb-nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
          <span>邮寄台账</span>
        </router-link>
        <router-link to="/response" class="wb-nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          <span>机关答复</span>
        </router-link>
        <router-link to="/relief" class="wb-nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          <span>救济监督</span>
        </router-link>
        <router-link to="/finance" class="wb-nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
          <span>收支统计</span>
        </router-link>
        <router-link to="/reminders" class="wb-nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
          <span>提醒中心</span>
        </router-link>
        <router-link to="/templates" class="wb-nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
          <span>文书模板</span>
        </router-link>
      </nav>

      <div class="wb-user-card">
        <div class="wb-user-info">
          <div class="wb-user-avatar">管</div>
          <div class="wb-user-detail">
            <div class="wb-user-name">打假人 VIP</div>
            <div class="wb-user-id">ID: 888888</div>
          </div>
        </div>
        <div class="wb-user-actions">
          <button class="wb-user-btn">切换账号</button>
          <button class="wb-user-btn">退出登录</button>
        </div>
      </div>
    </aside>

    <div class="wb-main-wrapper">
      <header class="wb-topbar">
        <div class="wb-topbar-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input v-model="topbarSearch" placeholder="搜索案件、店铺或编号..." @keydown.enter="handleTopbarSearch" />
        </div>
        <div class="wb-topbar-right">
          <button class="wb-topbar-icon-btn" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
            <span class="wb-notif-badge">{{ remindersTotal }}</span>
          </button>
          <div class="wb-topbar-user">
            <div class="wb-topbar-avatar">管</div>
            <div class="wb-topbar-user-text">
              <span class="wb-topbar-name">打假人</span>
              <span class="wb-topbar-id">ID: 888888</span>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9" /></svg>
          </div>
        </div>
      </header>

      <main class="wb-main-content">
        <div class="workbench-red-layout">
          <div class="wb-content-left">
            <div class="wb-page-title-section">
              <h1 class="wb-page-title">案件处置工作台</h1>
              <div class="wb-page-subtitle">证据留痕，依法跟进，维护品牌权益</div>
            </div>

            <div class="stat10-grid">
              <button
                v-for="card in statCards"
                :key="card.key"
                type="button"
                class="stat-card"
                :class="activeMetric === card.key ? 'stat-card-active' : ''"
                @click="toggleMetric(card.key)"
              >
                <div class="stat-card-icon" :style="{ background: card.iconBg, color: card.iconColor }" v-html="card.iconSvg"></div>
                <div class="stat-card-info">
                  <div class="stat-card-title">{{ card.label }}</div>
                  <div class="stat-card-value">{{ card.value }}</div>
                </div>
              </button>
            </div>

            <div class="quick-upload-panel">
              <div class="quick-upload-head">
                <div class="quick-upload-title">快速上传中心</div>
                <div class="quick-upload-subtitle">用于快速上传信封图片、机关答复、文书材料和其他证据文件，上传后自动归入对应案件。</div>
              </div>
              <div class="quick-upload-grid">
                <div class="upload-card-box">
                  <div class="upload-card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="18" height="18"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                    上传信封图片
                  </div>
                  <div
                    class="upload-drop-card"
                    :class="isDraggingEnvelope ? 'upload-drop-dragging' : ''"
                    @click="triggerEnvelopeUpload"
                    @dragover.prevent="isDraggingEnvelope = true"
                    @dragleave="isDraggingEnvelope = false"
                    @drop.prevent="handleEnvelopeDrop"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="28" height="28"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                    <div class="upload-drop-btn">点击上传信封图片</div>
                    <div class="upload-drop-hint">支持 JPG、PNG、JPEG，多选上传，上传后可进入 OCR / 归档流程。</div>
                  </div>
                  <input ref="envelopeInputRef" type="file" accept="image/*" multiple style="display: none" @change="handleEnvelopeFileChange" />
                </div>

                <div class="upload-card-box">
                  <div class="upload-card-title upload-card-title-doc">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                    上传文书材料
                  </div>
                  <div
                    class="upload-drop-card upload-drop-card-doc"
                    :class="isDraggingDoc ? 'upload-drop-dragging' : ''"
                    @click="triggerDocUpload"
                    @dragover.prevent="isDraggingDoc = true"
                    @dragleave="isDraggingDoc = false"
                    @drop.prevent="handleDocDrop"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="28" height="28"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                    <div class="upload-drop-btn">点击上传文书文件</div>
                    <div class="upload-drop-hint">支持 PDF、DOC、DOCX、图片，多选上传，上传后进入案件材料中心。</div>
                  </div>
                  <input ref="docInputRef" type="file" accept=".pdf,.doc,.docx,image/*" multiple style="display: none" @change="handleDocFileChange" />
                </div>

                <div class="upload-side-info">
                  <div class="upload-note-section">
                    <div class="upload-note-title">上传说明</div>
                    <ul class="upload-note-list">
                      <li>信封图片用于记录邮寄、签收、留痕。</li>
                      <li>文书材料用于保存答复、处罚、立案、不予立案等材料。</li>
                      <li>上传后需选择案件，或由系统辅助匹配案件。</li>
                      <li>所有上传内容必须保留原始文件名称和时间。</li>
                    </ul>
                  </div>
                  <div class="upload-recent-section">
                    <div class="upload-recent-title">最近上传</div>
                    <div v-if="recentUploads.length === 0" class="upload-recent-empty">暂无上传记录</div>
                    <div v-else>
                      <div v-for="item in recentUploads" :key="item.url" class="upload-recent-item">
                        <div class="upload-recent-name">{{ item.name }}</div>
                        <div class="upload-recent-meta">{{ getFileTypeLabel(item) }} · {{ formatUploadTime(item.uploadedAt) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="follow-preview-card">
              <div class="follow-preview-header">
                <div class="follow-preview-title-row">
                  <div class="follow-preview-title-left">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="18" height="18"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    <h2 class="follow-preview-title">重点待跟进案件</h2>
                  </div>
                  <div class="follow-preview-actions">
                    <button class="follow-btn-primary" type="button" @click="goToCasesArchive">查看全部待跟进案件</button>
                    <button class="follow-btn-secondary" type="button" @click="goToCasesList">进入案件档案查看完整列表</button>
                  </div>
                </div>
                <div class="follow-preview-subtitle">仅展示最需要优先处理的案件，完整案件请前往案件档案页查看。</div>
              </div>
              <table class="follow-data-table">
                <thead>
                  <tr>
                    <th>管辖局</th>
                    <th>店铺名称</th>
                    <th>商品名称</th>
                    <th>执照名称</th>
                    <th>当前进度</th>
                    <th>签收日期</th>
                    <th>结果日期</th>
                    <th>期限提醒</th>
                    <th>金额</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="previewCases.length === 0">
                    <td colspan="10" class="follow-empty-cell">当前分类暂无重点待跟进案件</td>
                  </tr>
                  <tr v-for="item in previewCases" :key="item.id">
                    <td>{{ item.jurisdiction }}</td>
                    <td>{{ item.shop }}</td>
                    <td>{{ item.product }}</td>
                    <td>{{ item.license }}</td>
                    <td><span class="status-chip" :class="item.progressClass">{{ item.progress }}</span></td>
                    <td>{{ item.signDate }}</td>
                    <td>{{ item.resultDate }}</td>
                    <td><span class="status-chip" :class="item.deadlineClass">{{ item.deadline }}</span></td>
                    <td>{{ item.amount }}</td>
                    <td><button class="follow-view-btn" type="button" @click="goToCaseDetail(item.id)">查看</button></td>
                  </tr>
                </tbody>
              </table>
              <div v-if="filteredWorkbenchCasesCount > 5" class="follow-preview-more">
                <span>当前筛选共 <strong>{{ filteredWorkbenchCasesCount }}</strong> 条，仅展示前 5 条，</span>
                <button class="follow-more-link" type="button" @click="goToCasesArchive">可去案件档案查看完整列表 ></button>
              </div>
            </div>

            <div class="follow-tip-bar">
              <div class="follow-tip-left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                <span>完善待跟进案件已迁移至案件档案页，工作台仅保留重点案件预览。</span>
              </div>
              <button class="follow-tip-action" type="button" @click="goToCasesList">前往案件档案</button>
            </div>
          </div>

          <div class="wb-content-right">
            <div class="side-card">
              <div class="side-card-head">
                <h3>跟进提醒</h3>
                <button class="side-more-btn" type="button" @click="router.push('/reminders')">更多 ></button>
              </div>
              <div class="reminder-list">
                <div v-if="reminders.length === 0" class="reminder-empty">暂无提醒</div>
                <div v-for="item in reminders" :key="item.label" class="follow-reminder-item">
                  <div class="follow-reminder-icon" :style="{ background: item.bg, color: item.color }" v-html="item.iconSvg"></div>
                  <div class="follow-reminder-body">
                    <div class="reminder-label">{{ item.label }}</div>
                    <div class="reminder-sub">{{ item.sub }}</div>
                  </div>
                  <div class="reminder-badge">{{ item.count }}</div>
                </div>
              </div>
            </div>

            <div class="side-card">
              <div class="side-card-head">
                <h3>费用收益概览（本月）</h3>
              </div>
              <div class="mini-stat-grid">
                <div class="mini-stat-card" v-for="item in feeStats" :key="item.label">
                  <div class="mini-stat-label">{{ item.label }}</div>
                  <div class="mini-stat-value" :class="item.isNegative ? 'fee-negative' : ''">{{ item.value }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <div v-if="uploadStatus.show" class="upload-toast" :class="uploadStatus.type">{{ uploadStatus.message }}</div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { useCaseStore } from '@/stores/case'
import { uploadBase64ToTos, uploadWordToTos } from '@/lib/tos'
import {
  getCurrentProgress,
  getStatusBadgeClass,
  getJurisdiction,
  getShopName,
  getProductName,
  getLicenseName,
  getSignDate as getCaseSignDate,
  getResultDate,
  getDisplayAmount,
  formatMoney as formatCaseMoney,
} from '@/utils/caseStatus'
import { getDeadlineReminder, getDeadlineLevel } from '@/utils/deadline'

const router = useRouter()
const store = useCaseStore()

const topbarSearch = ref('')
const activeMetric = ref(null)
const isDraggingEnvelope = ref(false)
const isDraggingDoc = ref(false)
const envelopeInputRef = ref(null)
const docInputRef = ref(null)
const uploadStatus = ref({ show: false, type: 'info', message: '' })
let toastTimer = null

const metricIcons = {
  total: makeIcon('<path d="M4 7a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" />'),
  accepted: makeIcon('<path d="M9 11l2 2 4-4" /><path d="M21 12c0 5-4 9-9 9s-9-4-9-9 4-9 9-9 9 4 9 9z" />'),
  pending: makeIcon('<path d="M12 7v5l3 2" /><path d="M21 12c0 5-4 9-9 9s-9-4-9-9 4-9 9-9 9 4 9 9z" />'),
  notAccepted: makeIcon('<circle cx="12" cy="12" r="9" /><path d="M8.5 8.5l7 7" />'),
  filed: makeIcon('<path d="M12 3l7 4v5c0 5-3 7.5-7 9-4-1.5-7-4-7-9V7l7-4z" /><path d="M9.5 12.5h5" />'),
  rejected: makeIcon('<circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" />'),
  notPunished: makeIcon('<path d="M12 3l8 4v5c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V7l8-4z" /><path d="M12 8v5" /><circle cx="12" cy="16" r="0.8" fill="currentColor" stroke="none" />'),
  punished: makeIcon('<path d="M12 3v4" /><path d="M5 8h14" /><path d="M7 8l-2 4h6l-2-4" /><path d="M13 8l-2 4h8l-2-4" /><path d="M12 12v8" />'),
  mediated: makeIcon('<path d="M8 12l2.5 2.5L13 12l3 3 2-2" /><path d="M4 10l3-3 3 3M14 7l3-3 3 3" />'),
  abnormal: makeIcon('<path d="M10.3 4.3L2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z" /><path d="M12 9v4" /><circle cx="12" cy="16.2" r="0.8" fill="currentColor" stroke="none" />'),
}

const allCases = computed(() => Array.isArray(store.cases) ? store.cases : [])

const statDefinitions = [
  { key: 'total', label: '案件总数', iconBg: '#F7E7CF', iconColor: '#A56018', predicate: () => true },
  { key: 'accepted', label: '已受理', iconBg: '#F8E7C9', iconColor: '#B07A1A', predicate: isAccepted },
  { key: 'pending', label: '未受理', iconBg: '#F7ECD7', iconColor: '#C08A2D', predicate: isPendingAcceptance },
  { key: 'notAccepted', label: '不予受理', iconBg: '#FCE8E6', iconColor: '#C83E2D', predicate: isNotAccepted },
  { key: 'filed', label: '已立案', iconBg: '#F7E8DE', iconColor: '#B93227', predicate: isFiled },
  { key: 'rejected', label: '不予立案', iconBg: '#FBE9E5', iconColor: '#D1493E', predicate: isNotFiled },
  { key: 'notPunished', label: '不予处罚', iconBg: '#F9E9E2', iconColor: '#BE3A2F', predicate: isNotPunished },
  { key: 'punished', label: '已处罚', iconBg: '#F8EDDD', iconColor: '#B57422', predicate: isPunished },
  { key: 'mediated', label: '已调解', iconBg: '#F5EACC', iconColor: '#B98A2E', predicate: isMediated },
  { key: 'abnormal', label: '列入异常', iconBg: '#FCEBDD', iconColor: '#C94E1F', predicate: isAbnormal },
]

const statCards = computed(() => statDefinitions.map(item => ({
  ...item,
  iconSvg: metricIcons[item.key],
  value: allCases.value.filter(item.predicate).length,
})))

const searchableCases = computed(() => {
  const keyword = topbarSearch.value.trim().toLowerCase()
  if (!keyword) return allCases.value
  return allCases.value.filter(caseItem => [
    caseItem.caseNumber,
    caseItem.shopName,
    caseItem.licenseName,
    caseItem.productName,
    caseItem.jurisdiction,
  ].some(value => String(value || '').toLowerCase().includes(keyword)))
})

const filteredWorkbenchCases = computed(() => {
  const current = statDefinitions.find(item => item.key === activeMetric.value)
  const baseList = current ? searchableCases.value.filter(current.predicate) : searchableCases.value
  return [...baseList].sort(compareWorkbenchPriority)
})

const filteredWorkbenchCasesCount = computed(() => filteredWorkbenchCases.value.length)

const previewCases = computed(() => filteredWorkbenchCases.value.slice(0, 5).map(formatPreviewCase))

const allUploads = computed(() => {
  const caseUploads = allCases.value.flatMap(caseItem => [
    ...(Array.isArray(caseItem.images) ? caseItem.images : []),
    ...(Array.isArray(caseItem.documents) ? caseItem.documents : []),
  ])
  const merged = [...caseUploads, ...(Array.isArray(store.unassignedImages) ? store.unassignedImages : [])]
  const map = new Map()
  merged.forEach(item => {
    if (!item?.url) return
    map.set(item.url, item)
  })
  return Array.from(map.values())
    .sort((a, b) => dayjs(b.uploadedAt || b.createdAt || 0).valueOf() - dayjs(a.uploadedAt || a.createdAt || 0).valueOf())
})

const recentUploads = computed(() => allUploads.value.slice(0, 3))

const reminders = computed(() => {
  const overdue = allCases.value.filter(caseItem => getDeadlineState(caseItem).state === 'overdue').length
  const dueSoon = allCases.value.filter(caseItem => getDeadlineState(caseItem).state === 'soon').length
  const pendingAcceptance = allCases.value.filter(isPendingAcceptance).length
  const abnormal = allCases.value.filter(isAbnormal).length

  return [
    {
      label: '超期跟进',
      sub: '已超出法定处理时限的案件',
      count: overdue,
      bg: '#FCE7DD',
      color: '#C0392B',
      iconSvg: metricIcons.abnormal,
    },
    {
      label: '临期案件',
      sub: '近三日内需优先处理',
      count: dueSoon,
      bg: '#FFF1D6',
      color: '#B56D13',
      iconSvg: metricIcons.pending,
    },
    {
      label: '待受理登记',
      sub: '尚未完成受理状态登记',
      count: pendingAcceptance,
      bg: '#F6EAD4',
      color: '#8B6B20',
      iconSvg: metricIcons.pending,
    },
    {
      label: '异常关注',
      sub: '已列入异常或需人工复核',
      count: abnormal,
      bg: '#FCEBDD',
      color: '#C94E1F',
      iconSvg: metricIcons.abnormal,
    },
  ]
})

const remindersTotal = computed(() => reminders.value.reduce((sum, item) => sum + Number(item.count || 0), 0))

const feeStats = computed(() => {
  const monthKey = dayjs().format('YYYY-MM')
  const currentMonthCases = allCases.value.filter(caseItem => {
    const refs = [caseItem.updatedAt, caseItem.createdAt, caseItem.reportResultDate, caseItem.signDate].filter(Boolean)
    return refs.some(value => dayjs(value).isValid() && dayjs(value).format('YYYY-MM') === monthKey)
  })

  const expense = currentMonthCases.reduce((sum, item) => sum + Number(item.expense || 0), 0)
  const income = currentMonthCases.reduce((sum, item) => sum + Number(item.profit || 0), 0)
  const net = income - expense
  const incomeCases = currentMonthCases.filter(item => Number(item.profit || 0) > 0).length

  return [
    { label: '本月支出', value: formatCurrency(expense), isNegative: false },
    { label: '本月回款', value: formatCurrency(income), isNegative: false },
    { label: '净收益', value: formatCurrency(net), isNegative: net < 0 },
    { label: '回款案件', value: String(incomeCases), isNegative: false },
  ]
})

function toggleMetric(key) {
  activeMetric.value = activeMetric.value === key ? null : key
}

function handleTopbarSearch() {
  topbarSearch.value = topbarSearch.value.trim()
}

function goToCasesArchive() {
  const statusQueryMap = {
    accepted: 'accepted',
    notAccepted: 'reported',
    filed: 'filed',
    rejected: 'rejected',
    notPunished: 'not_punished',
    mediated: 'decided',
  }

  const query = {}
  if (activeMetric.value && statusQueryMap[activeMetric.value]) {
    query.status = statusQueryMap[activeMetric.value]
  }
  if (activeMetric.value) {
    query.workbenchMetric = activeMetric.value
  }

  router.push({
    path: '/cases',
    query,
  })
}

function goToCasesList() {
  router.push('/cases')
}

function goToCaseDetail(id) {
  if (!id) return
  router.push(`/case/${id}`)
}

function triggerEnvelopeUpload() {
  if (!envelopeInputRef.value) return
  envelopeInputRef.value.value = ''
  envelopeInputRef.value.click()
}

function triggerDocUpload() {
  if (!docInputRef.value) return
  docInputRef.value.value = ''
  docInputRef.value.click()
}

function handleEnvelopeDrop(event) {
  isDraggingEnvelope.value = false
  const files = Array.from(event.dataTransfer?.files || [])
  if (files.length === 0) {
    showToast('请选择案件后上传信封图片', 'warn')
    return
  }
  uploadEnvelopeFiles(files)
}

function handleDocDrop(event) {
  isDraggingDoc.value = false
  const files = Array.from(event.dataTransfer?.files || [])
  if (files.length === 0) {
    showToast('请选择案件后上传文书材料', 'warn')
    return
  }
  uploadDocumentFiles(files)
}

function handleEnvelopeFileChange(event) {
  const files = Array.from(event.target.files || [])
  if (files.length === 0) {
    showToast('请选择案件后上传信封图片', 'warn')
    return
  }
  uploadEnvelopeFiles(files)
  event.target.value = ''
}

function handleDocFileChange(event) {
  const files = Array.from(event.target.files || [])
  if (files.length === 0) {
    showToast('请选择案件后上传文书材料', 'warn')
    return
  }
  uploadDocumentFiles(files)
  event.target.value = ''
}

async function uploadEnvelopeFiles(files) {
  showToast('开始上传信封图片...', 'info')
  try {
    let success = 0
    for (const file of files.filter(Boolean)) {
      const dataUrl = await readFileAsDataUrl(file)
      const url = await uploadBase64ToTos(dataUrl, file.name)
      await store.assignCloudFile(url, null, {
        url,
        name: file.name,
        date: dayjs().format('YYYY-MM-DD'),
        uploadedAt: dayjs().toISOString(),
        fileType: 'image',
        documentType: '信封',
      })
      success += 1
    }
    showToast(`已上传 ${success} 张信封图片，可继续进入 OCR / 归档流程。`, 'success')
  } catch (error) {
    console.error('[Workbench] envelope upload failed:', error)
    showToast(error?.message || '信封图片上传失败，请稍后重试。', 'error')
  }
}

async function uploadDocumentFiles(files) {
  showToast('开始上传文书材料...', 'info')
  try {
    let success = 0
    for (const file of files.filter(Boolean)) {
      const dataUrl = await readFileAsDataUrl(file)
      const lowerName = String(file.name || '').toLowerCase()
      const isWord = /\.(doc|docx)$/i.test(lowerName)
      const url = isWord
        ? await uploadWordToTos(dataUrl, file.name)
        : await uploadBase64ToTos(dataUrl, file.name)
      await store.assignCloudFile(url, null, {
        url,
        name: file.name,
        date: dayjs().format('YYYY-MM-DD'),
        uploadedAt: dayjs().toISOString(),
        fileType: isWord ? 'doc' : (/\.pdf$/i.test(lowerName) ? 'pdf' : 'image'),
        documentType: '文书材料',
      })
      success += 1
    }
    showToast(`已上传 ${success} 份文书材料，可在案件材料中心继续归档。`, 'success')
  } catch (error) {
    console.error('[Workbench] document upload failed:', error)
    showToast(error?.message || '文书材料上传失败，请稍后重试。', 'error')
  }
}

function showToast(message, type = 'info') {
  uploadStatus.value = { show: true, message, type }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    uploadStatus.value.show = false
  }, 2600)
}

onBeforeUnmount(() => {
  if (toastTimer) clearTimeout(toastTimer)
})

function formatPreviewCase(caseItem) {
  const deadlineMeta = getDeadlineState(caseItem)
  const progressMeta = getProgressMeta(caseItem)

  return {
    id: caseItem.id,
    jurisdiction: getJurisdiction(caseItem),
    shop: getShopName(caseItem),
    product: getProductName(caseItem),
    license: getLicenseName(caseItem),
    progress: progressMeta.label,
    progressClass: progressMeta.className,
    signDate: formatDate(getCaseSignDate(caseItem)) || '-',
    resultDate: formatDate(getResultDate(caseItem)) || '-',
    deadline: deadlineMeta.label,
    deadlineClass: deadlineMeta.className,
    amount: getAmountText(caseItem),
  }
}

function mapStatusChipClass(className) {
  return {
    'badge-abnormal': 'chip-abnormal',
    'badge-filed': 'chip-filed',
    'badge-not-filed': 'chip-not-filed',
    'badge-mediated': 'chip-mediated',
    'badge-punished': 'chip-filed',
    'badge-corrected': 'chip-waiting',
    'badge-not-punished': 'chip-waiting',
    'badge-accepted': 'chip-signed',
    'badge-not-accepted': 'chip-not-filed',
    'badge-presumed': 'chip-waiting',
    'badge-unaccepted': 'chip-waiting',
  }[className] || 'chip-waiting'
}

function getProgressMeta(caseItem) {
  return {
    label: getCurrentProgress(caseItem),
    className: mapStatusChipClass(getStatusBadgeClass(caseItem)),
  }
}

function getDeadlineState(caseItem) {
  const reminder = getDeadlineReminder(caseItem)
  return {
    label: reminder.text || '未签收，暂不计算期限',
    state: reminder.level || 'muted',
    className: getDeadlineLevel(reminder.level),
  }
}

function getAmountText(caseItem) {
  return formatCaseMoney(getDisplayAmount(caseItem))
}

function getFileTypeLabel(item = {}) {
  const lower = `${item.fileType || ''} ${item.name || ''} ${item.documentType || ''}`.toLowerCase()
  if (lower.includes('信封')) return '信封图片'
  if (lower.includes('doc')) return 'Word 文书'
  if (lower.includes('pdf')) return 'PDF 文书'
  if (/\.(doc|docx)$/i.test(item.name || '')) return 'Word 文书'
  if (/\.pdf$/i.test(item.name || '')) return 'PDF 文书'
  if (/\.(png|jpg|jpeg|webp|gif)$/i.test(item.name || '')) return '图片材料'
  return item.documentType || '上传文件'
}

function formatUploadTime(value) {
  if (!value) return '-'
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm') : String(value)
}

function formatDate(value) {
  if (!value) return '-'
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : String(value)
}

function formatDateTime(value) {
  if (!value) return '-'
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm') : String(value)
}

function formatCurrency(value) {
  const amount = Number(value || 0)
  if (!Number.isFinite(amount)) return '¥0'
  const abs = Math.abs(amount)
  const text = Number.isInteger(abs) ? abs.toLocaleString('zh-CN') : abs.toFixed(2)
  return `${amount < 0 ? '-' : ''}¥${text}`
}

function isAccepted(caseItem = {}) {
  return caseItem.acceptanceStatus === 'accepted' || caseItem.acceptanceStatus === '已受理'
}

function isNotAccepted(caseItem = {}) {
  return ['not_accepted', 'rejected_acceptance', '不予受理'].includes(caseItem.acceptanceStatus)
}

function isPendingAcceptance(caseItem = {}) {
  return !isAccepted(caseItem) && !isNotAccepted(caseItem)
}

function isFiled(caseItem = {}) {
  return caseItem.filingStatus === 'filed' || caseItem.filingStatus === '已立案'
}

function isNotFiled(caseItem = {}) {
  return ['rejected', 'not_filed', '不予立案'].includes(caseItem.reportResultStatus)
}

function isNotPunished(caseItem = {}) {
  return ['not_punished', 'exempted', '违法事实不成立', '不予处罚'].includes(caseItem.reportResultStatus)
}

function isPunished(caseItem = {}) {
  return ['penalty', 'punished', '已处罚', 'closed'].includes(caseItem.reportResultStatus || caseItem.status)
}

function isMediated(caseItem = {}) {
  return caseItem.mediationStatus === 'decided' || caseItem.mediationStatus === 'mediation_success' || caseItem.mediationStatus === '已调解'
}

function isAbnormal(caseItem = {}) {
  const tags = Array.isArray(caseItem.tags) ? caseItem.tags : []
  return caseItem.isAbnormal === true
    || caseItem.abnormal === true
    || caseItem.exceptionStatus === 'abnormal'
    || caseItem.riskStatus === 'abnormal'
    || tags.includes('abnormal')
    || tags.includes('列入异常')
}

function isFinalCase(caseItem = {}) {
  return isNotAccepted(caseItem) || isNotFiled(caseItem) || isNotPunished(caseItem) || isPunished(caseItem) || isMediated(caseItem) || caseItem.mediationStatus === 'mediation_terminated' || caseItem.mediationStatus === '终止调解'
}

function compareWorkbenchPriority(a, b) {
  const priorityDiff = getPriorityScore(b) - getPriorityScore(a)
  if (priorityDiff !== 0) return priorityDiff
  return dayjs(b.updatedAt || b.createdAt || 0).valueOf() - dayjs(a.updatedAt || a.createdAt || 0).valueOf()
}

function getPriorityScore(caseItem = {}) {
  let score = 0
  const deadline = getDeadlineState(caseItem)
  if (deadline.state === 'overdue') score += 100
  if (deadline.state === 'soon') score += 60
  if (isAbnormal(caseItem)) score += 90
  if (isPendingAcceptance(caseItem)) score += 40
  if (isAccepted(caseItem)) score += 20
  if (isFiled(caseItem)) score += 10
  return score
}

function makeIcon(paths) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('文件读取失败，请重新选择。'))
    reader.readAsDataURL(file)
  })
}
</script>
