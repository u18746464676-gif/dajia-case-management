<template>
  <div class="max-w-4xl mx-auto space-y-4">
    <button @click="router.push('/')" class="btn-ghost px-0">
      <span>←</span><span>返回列表</span>
    </button>

    <div class="card">
      <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div class="text-xs uppercase tracking-[0.24em] text-slate-400">案件建档</div>
          <h2 class="mt-2 text-3xl font-semibold tracking-tight text-slate-800">
            {{ isEdit ? '编辑案件卷宗' : '新建案件卷宗' }}
          </h2>
          <p class="mt-2 text-sm leading-6 text-slate-500">按基础信息、财务信息、行政复议三个分区录入，保持卷宗字段统一、结构清晰、后续跟进方便。</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <span class="soft-tag">中文录入</span>
          <span class="soft-tag">卷宗结构</span>
          <span class="soft-tag">{{ isEdit ? `编号 ${currentCase?.caseNumber || '待生成'}` : '保存后自动生成编号' }}</span>
          <span class="soft-tag">保存后回到案件列表</span>
        </div>
      </div>
    </div>

    <!-- 快速录入 -->
    <div class="card">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-lg">🔍</span>
        <h3 class="section-title mb-0">快速录入</h3>
        <span class="text-xs text-slate-400">粘贴订单截图文字、商品快照或混合格式文本，系统自动识别填入下方字段</span>
      </div>
      <div class="flex gap-3">
        <textarea
          v-model="quickInput"
          class="input-field flex-1 min-h-20 resize-none"
          placeholder="粘贴信息，用空格分隔，系统按顺序识别：\n执照名称 店铺名称 商品名称 商品价格\n例：xxx化妆品有限公司 xxx旗舰店 美白祛斑面膜 199"
        ></textarea>
        <div class="flex flex-col gap-2">
          <button type="button" @click="doQuickParse" class="btn-primary whitespace-nowrap">
            <span>🔍</span><span>识别</span>
          </button>
          <button type="button" @click="quickInput = ''" class="btn-secondary whitespace-nowrap text-xs">清空</button>
        </div>
      </div>
      <div v-if="quickParseResult" class="mt-2 text-xs text-slate-500">
        <span v-if="!Object.values(quickParseResult).every(v => !v)" class="text-green-600">✅ 已识别：</span>
        <span v-if="quickParseResult.licenseName">执照 {{ quickParseResult.licenseName }}</span>
        <span v-if="quickParseResult.shopName">、店铺 {{ quickParseResult.shopName }}</span>
        <span v-if="quickParseResult.productName">、商品 {{ quickParseResult.productName }}</span>
        <span v-if="quickParseResult.productPrice">、金额 {{ quickParseResult.productPrice }}元</span>
        <span v-if="Object.values(quickParseResult).every(v => !v)" class="text-amber-500">未识别到有效字段，请手动填写</span>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- 基础信息 -->
      <section class="card">
        <h3 class="section-title">基础信息</h3>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="label">案件编号</label>
            <input :value="currentCase?.caseNumber || '保存后自动生成'" type="text" class="input-field bg-slate-50 text-slate-500" readonly />
          </div>
          <div>
            <label class="label">📋 执照名称 *</label>
            <input v-model="form.licenseName" type="text" class="input-field" required placeholder="营业执照上的名称" />
          </div>
          <div>
            <label class="label">🏪 店铺名称 *</label>
            <input v-model="form.shopName" type="text" class="input-field" required placeholder="例：xxx旗舰店" />
          </div>
          <div class="md:col-span-2">
            <label class="label">📦 商品名称 *</label>
            <input v-model="form.productName" type="text" class="input-field" required placeholder="例：美白祛斑面膜" />
          </div>
          <div>
            <label class="label">🏛️ 管辖局 *</label>
            <div class="relative">
              <input
                v-model="form.jurisdiction"
                type="text"
                class="input-field w-full"
                required
                placeholder="输入区县名称，下方会匹配历史记录"
                autocomplete="off"
                @focus="showJurisdictionSuggestions = true"
                @blur="onJurisdictionBlur"
                @keydown.escape="showJurisdictionSuggestions = false"
              />
              <!-- 补全下拉 -->
              <ul
                v-if="showJurisdictionSuggestions && filteredJurisdictionSuggestions.length > 0"
                class="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
              >
                <li
                  v-for="item in filteredJurisdictionSuggestions"
                  :key="item"
                  class="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 text-slate-700"
                  @mousedown.prevent="selectJurisdiction(item)"
                >
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
          <div>
            <label class="label">📦 快递单号</label>
            <input v-model="form.trackingNumber" type="text" class="input-field" placeholder="有单号时可直接录入" />
          </div>
          <div>
            <label class="label">📬 签收日期</label>
            <input v-model="form.signDate" type="date" class="input-field" />
          </div>
          <div>
            <label class="label">📨 举报寄件日期</label>
            <input v-model="form.reportDate" type="date" class="input-field" />
          </div>
          <div>
            <label class="label">⚖️ 结果日期</label>
            <input v-model="form.decisionDate" type="date" class="input-field" />
          </div>
          <div class="md:col-span-2">
            <label class="label">📝 备注</label>
            <textarea v-model="form.notes" class="input-field min-h-28 resize-none" placeholder="补充识别来源、店铺别名、案件说明等"></textarea>
          </div>
        </div>
      </section>

      <!-- 财务信息 -->
      <section class="card">
        <h3 class="section-title">财务信息</h3>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label class="label">商品价格（元） *</label>
            <input v-model.number="form.productPrice" type="number" step="0.01" class="input-field" required placeholder="0.00" />
          </div>
          <div>
            <label class="label">花费总额（元）</label>
            <input v-model.number="form.expense" type="number" step="0.01" class="input-field" placeholder="默认可与商品价格一致" />
          </div>
          <div>
            <label class="label">赔偿金额（元）</label>
            <input v-model.number="form.profit" type="number" step="0.01" class="input-field" placeholder="已赔付时填写" />
          </div>
        </div>
        <p class="mt-3 text-xs text-slate-500">若未单独填写花费总额，将自动按商品价格入库。</p>
      </section>

      <!-- 行政复议 -->
      <section class="card">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 class="section-title mb-0">行政复议</h3>
          <div class="w-full md:w-56">
            <label class="label">是否申请复议</label>
            <select v-model="form.hasAdminReview" class="input-field">
              <option value="">未申请</option>
              <option value="yes">是</option>
              <option value="no">否</option>
            </select>
          </div>
        </div>
        <div v-if="form.hasAdminReview === 'yes'" class="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
          <div>
            <label class="label">复议结果</label>
            <select v-model="form.adminReviewResult" class="input-field">
              <option value="">请选择</option>
              <option value="维持">维持</option>
              <option value="撤销">撤销</option>
              <option value="变更">变更</option>
              <option value="责令限期履行">责令限期履行</option>
              <option value="终止">终止</option>
            </select>
          </div>
          <div>
            <label class="label">复议机关</label>
            <input v-model="form.adminReviewAuthority" type="text" class="input-field" placeholder="行政复议机关名称" />
          </div>
          <div>
            <label class="label">复议申请日期</label>
            <input v-model="form.adminReviewApplyDate" type="date" class="input-field" />
          </div>
          <div>
            <label class="label">复议受理日期</label>
            <input v-model="form.adminReviewAcceptDate" type="date" class="input-field" />
          </div>
          <div>
            <label class="label">复议决定日期</label>
            <input v-model="form.adminReviewDecisionDate" type="date" class="input-field" />
          </div>
          <div>
            <label class="label">复议决定书编号</label>
            <input v-model="form.adminReviewDocNo" type="text" class="input-field" placeholder="例：x复字〔2024〕第xx号" />
          </div>
        </div>
        <p v-else class="mt-4 text-sm text-slate-500">未申请复议时，无需填写后续字段。</p>
      </section>

      <!-- 提交按钮 -->
      <div class="card">
        <div class="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
          <button type="button" @click="router.push('/')" class="btn-secondary md:min-w-32">取消</button>
          <button type="submit" class="btn-primary md:min-w-40">
            <span>{{ isEdit ? '💾' : '✅' }}</span>
            <span>{{ isEdit ? '保存修改' : '创建案件' }}</span>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCaseStore } from '@/stores/case'

const router = useRouter()
const route = useRoute()
const store = useCaseStore()

const isEdit = computed(() => !!route.params.id)
const currentCase = computed(() => (isEdit.value ? store.getCase(route.params.id) : null))

const quickInput = ref('')
const quickParseResult = ref(null)

const form = ref({
  shopName: '',
  productName: '',
  productPrice: '',
  licenseName: '',
  jurisdiction: '',
  trackingNumber: '',
  signDate: '',
  reportDate: '',
  notes: '',
  decisionDate: '',
  expense: '',
  profit: '',
  hasAdminReview: '',
  adminReviewResult: '',
  adminReviewApplyDate: '',
  adminReviewAuthority: '',
  adminReviewAcceptDate: '',
  adminReviewDecisionDate: '',
  adminReviewDocNo: '',
})

onMounted(() => {
  if (isEdit.value) {
    const c = store.getCase(route.params.id)
    if (c) {
      form.value = {
        shopName: c.shopName || '',
        productName: c.productName || '',
        productPrice: c.productPrice || '',
        licenseName: c.licenseName || '',
        jurisdiction: c.jurisdiction || '',
        trackingNumber: c.trackingNumber || '',
        signDate: c.signDate || '',
        reportDate: c.reportDate || '',
        notes: c.notes || '',
        decisionDate: c.decisionDate || '',
        expense: c.expense || '',
        profit: c.profit || '',
        hasAdminReview: c.hasAdminReview || '',
        adminReviewResult: c.adminReviewResult || '',
        adminReviewApplyDate: c.adminReviewApplyDate || '',
        adminReviewAuthority: c.adminReviewAuthority || '',
        adminReviewAcceptDate: c.adminReviewAcceptDate || '',
        adminReviewDecisionDate: c.adminReviewDecisionDate || '',
        adminReviewDocNo: c.adminReviewDocNo || '',
      }
    }
  }
})

// ── 管辖局：历史补全 + 自动后缀 ──────────────────────────
const showJurisdictionSuggestions = ref(false)

// 从所有案件中提取去重后的管辖局历史
const jurisdictionHistory = computed(() => {
  const list = store.cases
    .map(c => c.jurisdiction)
    .filter(j => j && typeof j === 'string' && j.includes('市场监督管理局'))
  return [...new Set(list)]
})

// 根据当前输入过滤补全列表
const filteredJurisdictionSuggestions = computed(() => {
  const val = form.value.jurisdiction || ''
  if (!val) return jurisdictionHistory.value
  const lower = val.toLowerCase()
  return jurisdictionHistory.value.filter(j => j.toLowerCase().includes(lower))
})

// 选中某条历史记录
function selectJurisdiction(item) {
  form.value.jurisdiction = item
  showJurisdictionSuggestions.value = false
}

// 失焦时：如果字段不以"市场监督管理局"结尾，自动补上
function onJurisdictionBlur() {
  setTimeout(() => {
    const val = form.value.jurisdiction.trim()
    if (val && !val.includes('市场监督管理局')) {
      form.value.jurisdiction = val + '市场监督管理局'
    }
    showJurisdictionSuggestions.value = false
  }, 150)
}

// 快速录入解析
function doQuickParse() {
  const raw = quickInput.value
  if (!raw || !raw.trim()) return

  // 支持各种空白字符：普通空格、全角空格、制表符、换行、&nbsp;等 HTML 实体
  const cleanText = raw
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // 按空格拆分，取前4段
  const parts = cleanText.split(' ').filter(p => p.length > 0)
  const result = { licenseName: '', shopName: '', productName: '', productPrice: '' }

  if (parts[0]) result.licenseName = parts[0]
  if (parts[1]) result.shopName = parts[1]
  if (parts[2]) result.productName = parts[2]
  if (parts[3]) {
    const num = parseFloat(parts[3].replace(/[^\d.]/g, ''))
    result.productPrice = (!isNaN(num) && num > 0) ? num.toFixed(2) : parts[3]
  }

  quickParseResult.value = result
  if (result.licenseName) form.value.licenseName = result.licenseName
  if (result.shopName) form.value.shopName = result.shopName
  if (result.productName) form.value.productName = result.productName
  if (result.productPrice) form.value.productPrice = result.productPrice
}

function buildPayload() {
  return {
    ...form.value,
    expense: form.value.expense === '' || form.value.expense === null || form.value.expense === undefined
      ? form.value.productPrice
      : form.value.expense,
  }
}

function handleSubmit() {
  const payload = buildPayload()
  if (isEdit.value) {
    store.updateCase(route.params.id, payload)
    router.push('/')
  } else {
    store.createCase(payload)
    router.push('/')
  }
}
</script>
