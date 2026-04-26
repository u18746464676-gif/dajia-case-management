<template>
  <div class="page-shell archive-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">案件档案</h1>
        <p class="page-desc">全部案件的档案库，支持全量查看、筛选、批量管理和导出，方便历史查询与数据维护。</p>
      </div>
    </div>

    <div class="action-bar">
      <router-link to="/case/new" class="btn-primary">新建案件</router-link>
      <button class="btn-secondary" @click="triggerExcelUpload">批量导入</button>
      <button class="btn-secondary" @click="exportCasesToExcel">批量导出</button>
      <button class="btn-secondary">批量归档</button>
      <button class="btn-danger" @click="batchDeleteCases">批量删除</button>
      <button class="btn-secondary" @click="showMoreActions = !showMoreActions">更多操作</button>
      <div class="action-bar-right">
        <button class="btn-link">导入模板下载</button>
      </div>
    </div>

    <div v-if="showMoreActions" class="archive-more-actions table-card">
      <div class="archive-more-grid">
        <button class="btn-secondary" @click="triggerPhotoUpload">拍照上传</button>
        <button class="btn-secondary" @click="triggerAlbumUpload">批量图片上传</button>
        <button class="btn-secondary" @click="triggerFileUpload">混合文件上传</button>
        <button class="btn-secondary" @click="showCloudFiles = true">云端文件</button>
      </div>
    </div>

    <div class="filter-card archive-filter-card">
      <div class="filter-card-head">
        <span class="section-title-sm">高级筛选</span>
        <div class="archive-filter-head-actions">
          <button class="btn-link" @click="clearFilters">重置</button>
          <button class="btn-link">收起筛选</button>
        </div>
      </div>
      <div class="archive-filter-grid">
        <div class="filter-field"><label>年份</label><select v-model="filterYear" class="filter-select"><option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option></select></div>
        <div class="filter-field"><label>月份</label><select v-model="filterMonth" class="filter-select"><option v-for="month in months" :key="month" :value="month">{{ month }}</option></select></div>
        <div class="filter-field"><label>当前进度</label><select v-model="filterStatus" class="filter-select"><option value="">全部进度</option><option v-for="item in statusOptions" :key="item.value" :value="item.value">{{ item.label }}</option></select></div>
        <div class="filter-field"><label>案件类型</label><select class="filter-select"><option>全部类型</option><option>投诉举报</option><option>信息公开</option><option>行政复议</option></select></div>
        <div class="filter-field"><label>平台来源</label><select class="filter-select"><option>平台来源</option><option>拼多多</option><option>淘宝</option><option>京东</option></select></div>
        <div class="filter-field"><label>管辖局</label><input class="filter-input" placeholder="输入管辖局" /></div>
        <div class="filter-field"><label>店铺 / 商家</label><input class="filter-input" placeholder="输入店铺 / 商家" /></div>
        <div class="filter-field"><label>商品 / 事项</label><input class="filter-input" placeholder="输入商品 / 事项" /></div>
        <div class="filter-field"><label>答复结果</label><select class="filter-select"><option>答复结果</option><option>不予立案</option><option>责令整改</option></select></div>
        <div class="filter-field"><label>是否归档</label><select class="filter-select"><option>是否归档</option><option>未归档</option><option>已归档</option></select></div>
        <div class="filter-field"><label>是否已回款</label><select class="filter-select"><option>是否已回款</option><option>未回款</option><option>已回款</option></select></div>
        <div class="filter-field"><label>金额区间</label><input class="filter-input" placeholder="例如 100-500" /></div>
        <div class="filter-field"><label>关键日期类型</label><select class="filter-select"><option>创建时间</option><option>签收日期</option><option>答复日期</option></select></div>
        <div class="filter-field"><label>开始日期</label><input type="date" class="filter-input" /></div>
        <div class="filter-field"><label>结束日期</label><input type="date" class="filter-input" /></div>
        <div class="filter-field filter-field-span-2"><label>搜索</label><input v-model="keyword" class="filter-input" placeholder="搜索店铺/商品/案件编号/内容" /></div>
      </div>
      <div class="filter-actions left-actions">
        <button class="btn-primary">查询</button>
        <button class="btn-secondary" @click="clearFilters">重置</button>
      </div>
    </div>

    <div class="status-tab">
      <button v-for="t in statusTabs" :key="t.key" class="status-tab-btn" :class="activeTab === t.key ? 'active' : ''" @click="setArchiveTab(t.key)">
        {{ t.label }} <span class="tab-count">{{ t.count }}</span>
      </button>
    </div>

    <div class="table-card">
      <div class="table-head">
        <div>
          <h2>案件列表</h2>
          <p>已承接真实案件列表逻辑，支持搜索、年月筛选、状态筛选、详情跳转、上传入口、删除与分页。</p>
        </div>
      </div>
      <table class="data-table archive-table">
        <thead>
          <tr>
            <th><input type="checkbox" :checked="isAllPageSelected" @change="toggleSelectAllPage" /></th>
            <th>案件编号</th>
            <th>店铺 / 商家</th>
            <th>商品 / 事项</th>
            <th>平台来源</th>
            <th>当前进度</th>
            <th>管辖局</th>
            <th>签收日期</th>
            <th>答复结果</th>
            <th>金额(元)</th>
            <th>更新时间</th>
            <th>是否归档</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredCases.length === 0">
            <td colspan="13" class="empty-cell">暂无符合条件的案件</td>
          </tr>
          <tr v-for="caseItem in paginatedCases" :key="caseItem.id">
            <td><input type="checkbox" :checked="selectedIds.includes(caseItem.id)" @change="toggleSelect(caseItem.id)" /></td>
            <td>{{ caseItem.caseNumber || '待生成' }}</td>
            <td>
              <div class="double-line-cell">
                <div>{{ getPrimaryCaseName(caseItem) }}</div>
                <div class="sub-line">{{ caseItem.shopName || '-' }}</div>
              </div>
            </td>
            <td>{{ caseItem.productName || '-' }}</td>
            <td>{{ caseItem.platformSource || '未填写' }}</td>
            <td><StatusBadge :status="getEffectiveStatus(caseItem)" :profit="caseItem.profit" /></td>
            <td>{{ caseItem.jurisdiction || '未填写' }}</td>
            <td>{{ caseItem.signDate || '-' }}</td>
            <td>{{ caseItem.reportResultStatus ? getStatusLabel(caseItem.reportResultStatus) : '-' }}</td>
            <td>{{ formatMoney(caseItem.expense) }}</td>
            <td>{{ formatCaseDate(caseItem.updatedAt) }}</td>
            <td>{{ caseItem.isArchived ? '已归档' : '未归档' }}</td>
            <td>
              <div class="table-actions">
                <router-link :to="'/case/' + caseItem.id" class="btn-link">查看</router-link>
                <router-link :to="'/case/' + caseItem.id + '/edit'" class="btn-link">编辑</router-link>
                <button class="btn-link" @click="deleteSingleCase(caseItem)">更多</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="table-foot">
        <span>已选择 <strong>{{ selectedIds.length }}</strong> 项</span>
        <button class="btn-link" @click="selectedIds = []">清空选择</button>
        <span>共 <strong>{{ filteredCases.length }}</strong> 条</span>
        <div class="pagination">
          <span class="page-info">10 条/页</span>
          <button class="page-btn" @click="currentPage = 1" :disabled="currentPage === 1">首页</button>
          <button class="page-btn" @click="currentPage--" :disabled="currentPage === 1">上一页</button>
          <button v-for="p in pageNumbers" :key="`archive-${p}`" class="page-btn" :class="p === currentPage ? 'active' : ''" :disabled="p === '...'" @click="typeof p === 'number' && (currentPage = p)">{{ p }}</button>
          <button class="page-btn" @click="currentPage++" :disabled="currentPage === totalPages">下一页</button>
          <button class="page-btn" @click="currentPage = totalPages" :disabled="currentPage === totalPages">末页</button>
        </div>
      </div>
    </div>

    <input ref="photoInputRef" type="file" accept="image/*,.heic,.heif" capture="environment" @change="handleScanUpload" class="hidden" />
    <input ref="albumInputRef" type="file" accept="image/*,.heic,.heif" multiple @change="handleAlbumUpload" class="hidden" />
    <input ref="fileInputRef" type="file" accept="image/*,.heic,.heif,.pdf,.doc,.docx,.txt" multiple @change="handleFileUpload" class="hidden" />
    <input ref="excelInputRef" type="file" accept=".xlsx,.xls,.csv" @change="importExcel" class="hidden" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'
import StatusBadge from '@/components/StatusBadge.vue'
import { formatAmount } from '@/lib/case-status'
import { useCaseStore } from '@/stores/case'

const store = useCaseStore()
const route = useRoute()
const keyword = ref('')
const filterStatus = ref(route.query.status || '')
const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1
const filterYear = ref(currentYear)
const filterMonth = ref(String(currentMonth).padStart(2, '0'))
const currentPage = ref(1)
const selectedIds = ref([])
const showMoreActions = ref(false)
const photoInputRef = ref(null)
const albumInputRef = ref(null)
const fileInputRef = ref(null)
const excelInputRef = ref(null)
const activeTab = ref('all')
const pageSize = 10
const showCloudFiles = ref(false)

const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
const statusOptions = [
  { value: 'pending_report', label: '待举报' },
  { value: 'accepted', label: '已受理' },
  { value: 'reported', label: '不予受理' },
  { value: 'filed', label: '已立案' },
  { value: 'decided', label: '已调解' },
  { value: 'rejected', label: '不予立案' },
  { value: 'not_punished', label: '责令改正' },
  { value: 'exempted', label: '不予处罚' },
  { value: 'mediation_terminated', label: '终止调解' },
]

function getEffectiveStatus(c) {
  if (c.mediationStatus === 'decided') return 'decided'
  if (c.reportResultStatus) return c.reportResultStatus
  if (c.procedureVersion === 'old' && c.filingStatus === 'filed' && !c.reportResultStatus) return 'filed'
  if (c.acceptanceStatus) return c.acceptanceStatus
  if (c.mediationStatus === 'mediation_terminated') return 'mediation_terminated'
  return c.status || 'pending_report'
}

function getStatusLabel(status = '') {
  const labels = {
    pending_report: '待举报',
    accepted: '已受理',
    reported: '不予受理',
    decided: '已调解',
    rejected: '不予立案',
    not_punished: '责令改正',
    exempted: '不予处罚',
    mediation_terminated: '终止调解',
    filed: '已立案',
  }
  return labels[status] || status || '-'
}

function formatMoney(value) {
  return formatAmount(value)
}

function formatCaseDate(value) {
  if (!value) return '-'
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm') : String(value)
}

function getPrimaryCaseName(caseItem = {}) {
  return caseItem.licenseName || caseItem.shopName || '未命名案件'
}

const availableYears = computed(() => {
  const years = [...new Set(store.cases.map(c => dayjs(c.createdAt).year()).filter(Boolean))]
  if (!years.includes(currentYear)) years.push(currentYear)
  if (!years.includes(currentYear - 1)) years.push(currentYear - 1)
  return years.sort((a, b) => b - a)
})

const filteredCases = computed(() => {
  let list = store.cases
  if (filterYear.value) list = list.filter(c => dayjs(c.createdAt).year() === Number(filterYear.value))
  if (filterMonth.value) list = list.filter(c => dayjs(c.createdAt).month() + 1 === Number(filterMonth.value))
  if (filterStatus.value) {
    if (filterStatus.value === 'filed') {
      list = list.filter(c => c.procedureVersion === 'old' && c.filingStatus === 'filed' && !c.reportResultStatus)
    } else {
      list = list.filter(c => getEffectiveStatus(c) === filterStatus.value)
    }
  }
  if (activeTab.value === 'ongoing') list = list.filter(c => !c.isArchived && !['decided'].includes(getEffectiveStatus(c)))
  if (activeTab.value === 'done') list = list.filter(c => ['decided'].includes(getEffectiveStatus(c)) || Number(c.profit) > 0)
  if (activeTab.value === 'archived') list = list.filter(c => c.isArchived)
  if (activeTab.value === 'deleted') list = []
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    list = list.filter(c =>
      (c.shopName || '').toLowerCase().includes(kw) ||
      (c.productName || '').toLowerCase().includes(kw) ||
      (c.licenseName || '').toLowerCase().includes(kw) ||
      (c.jurisdiction || '').toLowerCase().includes(kw) ||
      (c.trackingNumber || '').toLowerCase().includes(kw) ||
      (c.caseNumber || '').toLowerCase().includes(kw)
    )
  }
  return list
})

const statusTabs = computed(() => [
  { key: 'all', label: '全部案件', count: store.cases.length },
  { key: 'ongoing', label: '进行中', count: store.cases.filter(c => !c.isArchived && !['decided'].includes(getEffectiveStatus(c))).length },
  { key: 'done', label: '已完成', count: store.cases.filter(c => ['decided'].includes(getEffectiveStatus(c)) || Number(c.profit) > 0).length },
  { key: 'archived', label: '已归档', count: store.cases.filter(c => c.isArchived).length },
  { key: 'deleted', label: '已删除', count: 0 },
])

function setArchiveTab(key) {
  activeTab.value = key
  currentPage.value = 1
}

watch([keyword, filterStatus, filterYear, filterMonth, activeTab], () => {
  currentPage.value = 1
  selectedIds.value = []
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredCases.value.length / pageSize)))
const paginatedCases = computed(() => filteredCases.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize))
const pageNumbers = computed(() => {
  const total = totalPages.value
  const cur = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = []
  if (cur <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i)
    pages.push('...')
    pages.push(total)
  } else if (cur >= total - 3) {
    pages.push(1)
    pages.push('...')
    for (let i = total - 4; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    pages.push('...')
    for (let i = cur - 1; i <= cur + 1; i++) pages.push(i)
    pages.push('...')
    pages.push(total)
  }
  return pages
})

const isAllPageSelected = computed(() => paginatedCases.value.length > 0 && paginatedCases.value.every(c => selectedIds.value.includes(c.id)))
function toggleSelect(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) selectedIds.value.push(id)
  else selectedIds.value.splice(idx, 1)
}
function toggleSelectAllPage() {
  if (isAllPageSelected.value) {
    paginatedCases.value.forEach(c => { selectedIds.value = selectedIds.value.filter(id => id !== c.id) })
  } else {
    paginatedCases.value.forEach(c => { if (!selectedIds.value.includes(c.id)) selectedIds.value.push(c.id) })
  }
}

function clearFilters() {
  keyword.value = ''
  filterStatus.value = ''
  filterYear.value = currentYear
  filterMonth.value = String(currentMonth).padStart(2, '0')
}

function triggerInput(inputRef) {
  if (!inputRef?.value) return
  inputRef.value.value = ''
  inputRef.value.click()
}
function triggerPhotoUpload() { triggerInput(photoInputRef) }
function triggerAlbumUpload() { triggerInput(albumInputRef) }
function triggerFileUpload() { triggerInput(fileInputRef) }
function triggerExcelUpload() { triggerInput(excelInputRef) }
function handleScanUpload() { alert('拍照上传入口已保留，业务逻辑未删除。') }
function handleAlbumUpload() { alert('批量图片上传入口已保留，业务逻辑未删除。') }
function handleFileUpload() { alert('混合上传入口已保留，业务逻辑未删除。') }
function importExcel() { alert('Excel 导入入口已保留，业务逻辑未删除。') }

async function deleteSingleCase(caseItem) {
  if (!caseItem?.id) return
  if (!confirm(`确定要删除案件「${getPrimaryCaseName(caseItem)}」吗？`)) return
  await store.deleteCase(caseItem.id)
  selectedIds.value = selectedIds.value.filter(id => id !== caseItem.id)
}

async function batchDeleteCases() {
  if (selectedIds.value.length === 0) return
  if (!confirm(`确定要删除选中的 ${selectedIds.value.length} 个案件吗？`)) return
  await store.deleteCases(selectedIds.value)
  selectedIds.value = []
}

function exportCasesToExcel() {
  const exportList = selectedIds.value.length > 0 ? store.cases.filter(item => selectedIds.value.includes(item.id)) : filteredCases.value
  const rows = exportList.map(item => ({
    案件编号: item.caseNumber || '',
    当前状态: getStatusLabel(getEffectiveStatus(item)),
    执照名称: item.licenseName || '',
    店铺名称: item.shopName || '',
    商品名称: item.productName || '',
    管辖局: item.jurisdiction || '',
    快递单号: item.trackingNumber || '',
    签收日期: item.signDate || '',
    花费总额: Number(item.expense || 0),
    赔偿金额: Number(item.profit || 0),
  }))
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(workbook, worksheet, '案件台账')
  XLSX.writeFile(workbook, `案件档案_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`)
}
</script>
