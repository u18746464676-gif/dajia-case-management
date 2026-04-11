<template>
  <div>
    <!-- 图片上传区域 -->
    <div class="card mb-4 p-4 border-0 shadow-md">
      <div class="flex items-center gap-3 mb-3">
        <label class="btn-primary text-sm cursor-pointer flex items-center gap-2 shadow-lg shadow-blue-600/20">
          <span>📷</span>
          <span>拍照上传</span>
          <input type="file" accept="image/*" capture="environment" @change="handleImageUpload" class="hidden" />
        </label>
        <label class="btn-secondary text-sm cursor-pointer flex items-center gap-2">
          <span>🖼️</span>
          <span>相册选择</span>
          <input type="file" accept="image/*" multiple @change="handleImageUpload" class="hidden" />
        </label>
        <label class="btn-secondary text-sm cursor-pointer flex items-center gap-2">
          <span>📄</span>
          <span>上传文件</span>
          <input type="file" accept=".doc,.docx,.pdf,.txt" multiple @change="handleFileUpload" class="hidden" />
        </label>
        <label class="btn-secondary text-sm cursor-pointer flex items-center gap-2">
          <span>🔍</span>
          <span>OCR识别</span>
          <input type="file" accept="image/*" @change="handleOcrUpload" class="hidden" />
        </label>
        <span class="text-sm text-slate-400 ml-2">图片 {{ uploadedImages.length }} | 文件 {{ uploadedFiles.length }}</span>
      </div>

      <!-- OCR加载中 -->
      <div v-if="ocrLoading" class="flex items-center gap-3 p-4 bg-blue-50 rounded-xl mb-3">
        <div class="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        <span class="text-blue-600">正在识别图片，请稍候...</span>
      </div>

      <!-- OCR结果 -->
      <div v-if="ocrResult" class="p-4 bg-green-50 rounded-xl mb-3">
        <div class="flex items-center justify-between mb-2">
          <span class="text-green-600 font-semibold">✅ OCR识别结果</span>
          <button @click="ocrResult = null" class="text-green-400 hover:text-green-600">×</button>
        </div>
        <div class="text-sm text-green-700 mb-2">识别到的主体：<strong>{{ ocrResult.shopName }}</strong></div>
        <div class="text-sm text-green-700 mb-2">识别到单号：<strong>{{ ocrResult.trackingNumber }}</strong></div>
        <div v-if="ocrResult.matchedCases.length > 0" class="mt-3">
          <div class="text-sm text-green-600 mb-2">匹配到的案件：</div>
          <div class="space-y-2">
            <div
              v-for="c in ocrResult.matchedCases"
              :key="c.id"
              @click="applyOcrToCase(c.id)"
              class="p-2 bg-white rounded-lg cursor-pointer hover:bg-green-100 transition-colors text-sm"
            >
              <span class="font-medium">{{ c.shopName }}</span>
              <span class="text-slate-400 ml-2">{{ c.productName }}</span>
            </div>
          </div>
        </div>
        <div v-else class="text-sm text-orange-600 mt-2">
          未匹配到相关案件，请手动选择
        </div>
      </div>

      <div v-if="uploadedImages.length > 0 || uploadedFiles.length > 0" class="flex flex-wrap gap-3">
        <div v-for="(img, idx) in uploadedImages" :key="'img-' + idx" class="relative group">
          <img :src="img" class="w-16 h-16 object-cover rounded-xl border-2 border-slate-100" />
          <button
            @click="removeImage(idx)"
            class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >×</button>
        </div>
        <div v-for="(file, idx) in uploadedFiles" :key="'file-' + idx" class="relative group">
          <div class="w-16 h-16 flex flex-col items-center justify-center bg-slate-100 rounded-xl border-2 border-slate-100">
            <span class="text-2xl">📄</span>
            <span class="text-xs text-slate-500 truncate w-full text-center px-1">{{ file.name.substring(0, 8) }}</span>
          </div>
          <button
            @click="removeFile(idx)"
            class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >×</button>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="mb-4 flex flex-wrap gap-3 items-center bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <div class="flex items-center gap-2">
        <select v-model="filterYear" class="input-field w-28 text-sm rounded-lg">
          <option value="">全部年份</option>
          <option v-for="y in availableYears" :key="y" :value="y">{{ y }}年</option>
        </select>
        <select v-model="filterMonth" class="input-field w-24 text-sm rounded-lg">
          <option value="">全部月份</option>
          <option v-for="m in 12" :key="m" :value="String(m).padStart(2,'0')">{{ m }}月</option>
        </select>
      </div>
      <div class="flex-1 max-w-xs">
        <input
          v-model="keyword"
          type="text"
          placeholder="🔍 搜索店铺/商品/执照..."
          class="input-field text-sm rounded-lg"
        />
      </div>
      <button
        v-if="selectedIds.length > 0"
        @click="showBatchModal = true"
        class="btn-primary text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20"
      >
        <span>📅</span>
        <span>批量设置寄件日期</span>
        <span class="bg-white/20 px-2 py-0.5 rounded-full text-xs">{{ selectedIds.length }}</span>
      </button>
    </div>

    <!-- 批量设置寄件日期弹窗 -->
    <div v-if="showBatchModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" @click.self="showBatchModal = false">
      <div class="bg-white rounded-2xl p-6 w-96 shadow-2xl">
        <h3 class="font-bold text-lg mb-4 text-slate-800">批量设置寄件日期</h3>
        <div class="mb-6">
          <label class="label">选择日期</label>
          <input type="date" v-model="batchReportDate" class="input-field rounded-lg" />
        </div>
        <div class="flex gap-3">
          <button @click="batchUpdateReportDate" class="btn-primary flex-1 shadow-lg shadow-blue-600/20">确认</button>
          <button @click="showBatchModal = false" class="btn-secondary flex-1">取消</button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredCases.length === 0" class="text-center py-32 bg-white rounded-2xl shadow-sm border border-slate-100">
      <div class="text-8xl mb-6">📂</div>
      <p class="text-xl text-slate-400 mb-6">{{ keyword || filterStatus || filterYear || filterMonth ? '没有找到符合条件的案件' : '还没有任何案件' }}</p>
      <router-link to="/case/new" class="btn-primary inline-flex items-center gap-2 text-lg px-6 py-3 shadow-lg shadow-blue-600/20">
        <span class="text-xl">+</span>
        <span>添加第一个案件</span>
      </router-link>
    </div>

    <!-- 案件列表 -->
    <div v-else class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th class="py-3 px-4 text-center font-semibold w-12">
                <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" class="w-4 h-4 rounded border-slate-300" />
              </th>
              <th class="py-3 px-4 text-left font-semibold">管辖局</th>
              <th class="py-3 px-4 text-left font-semibold">商品名称</th>
              <th class="py-3 px-4 text-right font-semibold">价格</th>
              <th class="py-3 px-4 text-left font-semibold">店铺名称</th>
              <th class="py-3 px-4 text-left font-semibold">执照名称</th>
              <th class="py-3 px-4 text-center font-semibold">状态</th>
              <th class="py-3 px-4 text-center font-semibold">寄件日期</th>
              <th class="py-3 px-4 text-center font-semibold">签收日期</th>
              <th class="py-3 px-4 text-center font-semibold w-20">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr
              v-for="c in paginatedCases"
              :key="c.id"
              class="hover:bg-blue-50/30 transition-colors cursor-pointer"
              :class="{ 'bg-blue-50/50': selectedIds.includes(c.id) }"
            >
              <td class="py-3 px-4 text-center" @click.stop>
                <input
                  type="checkbox"
                  :checked="selectedIds.includes(c.id)"
                  @change="toggleSelect(c.id)"
                  class="w-4 h-4 rounded border-slate-300"
                />
              </td>
              <td class="py-3 px-4 text-slate-600" @click="$router.push('/case/' + c.id)">{{ c.jurisdiction || '-' }}</td>
              <td class="py-3 px-4 font-medium text-slate-800" @click="$router.push('/case/' + c.id)">{{ c.productName }}</td>
              <td class="py-3 px-4 text-right text-blue-600 font-semibold" @click="$router.push('/case/' + c.id)">¥{{ c.productPrice }}</td>
              <td class="py-3 px-4 text-slate-600" @click="$router.push('/case/' + c.id)">{{ c.shopName }}</td>
              <td class="py-3 px-4 text-slate-600" @click="$router.push('/case/' + c.id)">{{ c.licenseName }}</td>
              <td class="py-3 px-4 text-center" @click.stop>
                <select
                  :value="c.status"
                  @change="changeCaseStatus(c.id, $event.target.value)"
                  class="input-field w-28 text-xs py-1.5 text-center rounded-lg"
                >
                  <option value="pending_report">未受理</option>
                  <option value="accepted">已受理</option>
                  <option value="reported">已立案</option>
                  <option value="decided">已调解</option>
                  <option value="closed">已处罚</option>
                  <option value="rejected">不予立案</option>
                  <option value="not_punished">不予处罚</option>
                </select>
              </td>
              <td class="py-3 px-4 text-center" @click.stop>
                <input
                  type="date"
                  :value="c.reportDate"
                  @change="updateReportDate(c.id, $event.target.value)"
                  class="input-field w-32 text-xs py-1.5 text-center rounded-lg"
                />
              </td>
              <td class="py-3 px-4 text-center" @click.stop>
                <input
                  type="date"
                  :value="c.signDate"
                  @change="updateSignDate(c.id, $event.target.value)"
                  class="input-field w-32 text-xs py-1.5 text-center rounded-lg"
                />
              </td>
              <td class="py-3 px-4 text-center" @click.stop>
                <router-link :to="'/case/' + c.id" class="text-blue-500 hover:text-blue-700 text-sm font-medium">查看</router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
        <div class="text-sm text-slate-500">
          共 <span class="font-semibold text-slate-700">{{ filteredCases.length }}</span> 条，第 <span class="font-semibold text-slate-700">{{ currentPage }}</span> / <span class="font-semibold text-slate-700">{{ totalPages }}</span> 页
        </div>
        <div class="flex items-center gap-1">
          <button
            @click="currentPage = 1"
            :disabled="currentPage === 1"
            class="px-3 py-1.5 text-xs rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >首页</button>
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="px-3 py-1.5 text-xs rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >上一页</button>
          <button
            v-for="p in pageNumbers"
            :key="p"
            @click="currentPage = p"
            class="w-8 h-8 text-xs rounded-lg transition-colors"
            :class="p === currentPage ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'hover:bg-white'"
          >{{ p }}</button>
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="px-3 py-1.5 text-xs rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >下一页</button>
          <button
            @click="currentPage = totalPages"
            :disabled="currentPage === totalPages"
            class="px-3 py-1.5 text-xs rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >末页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCaseStore } from '@/stores/case'
import dayjs from 'dayjs'
import { extractFromImage } from '@/lib/doubao'

const store = useCaseStore()
const route = useRoute()
const router = useRouter()
const keyword = ref('')
const filterStatus = ref(route.query.status || '')
const filterYear = ref('')
const filterMonth = ref('')
const currentPage = ref(1)
const selectedIds = ref([])
const selectAll = ref(false)
const showBatchModal = ref(false)
const batchReportDate = ref('')
const uploadedImages = ref([])
const uploadedFiles = ref([])
const ocrLoading = ref(false)
const ocrResult = ref(null)
const pageSize = 20

// 监听路由变化，同步筛选状态
watch(() => route.query.status, (newStatus) => {
  filterStatus.value = newStatus || ''
  currentPage.value = 1
})

const availableYears = computed(() => {
  const years = [...new Set(store.cases.map(c => dayjs(c.createdAt).year()))]
  const currentYear = new Date().getFullYear()
  if (!years.includes(currentYear)) years.push(currentYear)
  if (!years.includes(currentYear - 1)) years.push(currentYear - 1)
  return years.sort((a, b) => b - a)
})

const filteredCases = computed(() => {
  let list = store.cases
  if (filterYear.value) {
    list = list.filter(c => dayjs(c.createdAt).year() === Number(filterYear.value))
  }
  if (filterMonth.value) {
    list = list.filter(c => dayjs(c.createdAt).month() + 1 === Number(filterMonth.value))
  }
  if (filterStatus.value) {
    list = list.filter(c => c.status === filterStatus.value)
  }
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    list = list.filter(c =>
      (c.shopName || '').toLowerCase().includes(kw) ||
      (c.productName || '').toLowerCase().includes(kw) ||
      (c.licenseName || '').toLowerCase().includes(kw) ||
      (c.jurisdiction || '').toLowerCase().includes(kw)
    )
  }
  return list
})

watch([keyword, filterStatus, filterYear, filterMonth], () => {
  currentPage.value = 1
  selectedIds.value = []
  selectAll.value = false
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredCases.value.length / pageSize)))

const paginatedCases = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredCases.value.slice(start, start + pageSize)
})

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

function updateReportDate(id, date) {
  store.updateCase(id, { reportDate: date })
}

function toggleSelect(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(idx, 1)
  }
}

function toggleSelectAll() {
  if (selectAll.value) {
    selectedIds.value = paginatedCases.value.map(c => c.id)
  } else {
    selectedIds.value = []
  }
}

function batchUpdateReportDate() {
  if (!batchReportDate.value) return
  selectedIds.value.forEach(id => {
    store.updateCase(id, { reportDate: batchReportDate.value })
  })
  selectedIds.value = []
  selectAll.value = false
  batchReportDate.value = ''
  showBatchModal.value = false
}

function handleImageUpload(event) {
  const files = event.target.files
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImages.value.push(e.target.result)
    }
    reader.readAsDataURL(file)
  }
}

function removeImage(idx) {
  uploadedImages.value.splice(idx, 1)
}

function handleFileUpload(event) {
  const files = event.target.files
  for (let i = 0; i < files.length; i++) {
    uploadedFiles.value.push(files[i])
  }
}

function removeFile(idx) {
  uploadedFiles.value.splice(idx, 1)
}

function changeCaseStatus(id, newStatus) {
  const updates = {}
  // 当变更为"已受理"状态时，自动设置受理日期为今天
  if (newStatus === 'accepted') {
    updates.acceptanceDate = dayjs().format('YYYY-MM-DD')
  }
  store.changeStatus(id, newStatus, updates)
}

function updateSignDate(id, date) {
  store.updateCase(id, { signDate: date })
}

async function handleOcrUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  ocrLoading.value = true
  ocrResult.value = null

  try {
    // 将图片转换为 base64
    const reader = new FileReader()
    const imageBase64 = await new Promise((resolve, reject) => {
      reader.onload = (e) => {
        const base64 = e.target.result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    // 使用豆包AI提取图片信息
    const result = await extractFromImage(imageBase64)

    if (!result) {
      alert('AI识别失败，请重试或使用传统OCR')
      return
    }

    // 匹配案件
    const matchedCases = store.cases.filter(c => {
      const shopName = result.shopName || ''
      if (!shopName) return false
      return c.shopName.includes(shopName) || shopName.includes(c.shopName) ||
             c.licenseName.includes(shopName) || shopName.includes(c.licenseName)
    })

    ocrResult.value = {
      shopName: result.shopName || '',
      trackingNumber: result.trackingNumber || '',
      matchedCases,
      rawText: result.raw || JSON.stringify(result, null, 2),
      aiResult: result
    }

  } catch (err) {
    console.error('OCR错误:', err)
    alert('OCR识别失败，请重试')
  } finally {
    ocrLoading.value = false
    event.target.value = ''
  }
}

function applyOcrToCase(caseId) {
  if (!ocrResult.value) return

  const updates = {}
  if (ocrResult.value.trackingNumber) {
    updates.notes = `[快递单号] ${ocrResult.value.trackingNumber}\n`
  }
  store.updateCase(caseId, updates)

  ocrResult.value = null
  alert('已成功关联到案件！')
}
</script>
