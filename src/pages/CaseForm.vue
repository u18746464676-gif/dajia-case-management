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
          placeholder="粘贴含有以下信息的文字，系统将自动识别：执照名称、店铺名称、商品名称、金额&#10;例如：xxx旗舰店购买的《美白祛斑面膜》，金额199元，执照名：xxx化妆品有限公司"
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
            <input v-model="form.jurisdiction" type="text" class="input-field" required placeholder="例：市场监督管理局" />
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

// 快速录入解析
function doQuickParse() {
  const text = quickInput.value.trim()
  if (!text) return

  const result = { licenseName: '', shopName: '', productName: '', productPrice: '' }

  // ── 执照名称 ──────────────────────────────────────
  // 1) 带标头的写法：执照名称/营业执照/公司名  某某有限公司
  let m = text.match(/(?:执照名称|营业执照(?![状])|公司名|企业名)[：: ]*([\u4e00-\u9fa5]{2,30})(?:有限公司|股份有限公司)?/)
  if (m) result.licenseName = m[1].trim()
  // 2) 直接以"有限公司"结尾的公司名（取前面 5-30 个中文）
  if (!result.licenseName) {
    m = text.match(/([\u4e00-\u9fa5]{4,30})(?:有限公司|股份有限公司|有限合伙|集团)$/)
    if (m) result.licenseName = m[1].trim()
  }

  // ── 店铺名称 ──────────────────────────────────────
  // 1) 带标头
  m = text.match(/(?:店铺(?:名称|名)?|店铺)[：: ]*([\u4e00-\u9fa5a-zA-Z0-9]{2,20})/)
  if (m) result.shopName = m[1].trim()
  // 2) 以"旗舰店/专卖店/专营店/官方店/商城"结尾
  if (!result.shopName) {
    m = text.match(/([\u4e00-\u9fa5a-zA-Z0-9]{1,20})(?:旗舰店|专卖店|专营店|官方店|商城)$/)
    if (m) result.shopName = m[1].trim()
  }
  // 3) 括号内或引号内的店名
  if (!result.shopName) {
    m = text.match(/[(（"『]([\u4e00-\u9fa5a-zA-Z0-9]{2,20})旗舰店/)
    if (m) result.shopName = m[1].trim()
  }

  // ── 商品名称 ──────────────────────────────────────
  // 1) 带标头
  m = text.match(/(?:商品(?:名称|名)?|产品(?:名称|名)?|品名)[：: ]*([\u4e00-\u9fa5a-zA-Z0-9\s]{2,50})/)
  if (m) result.productName = m[1].trim()
  // 2) 《》或「」包裹的书名号产品
  if (!result.productName) {
    m = text.match(/[《「『]([\u4e00-\u9fa5a-zA-Z0-9\s]{2,40})[》」』]/)
    if (m) result.productName = m[1].trim()
  }
  // 3) 常见商品标题特征：品牌词 + 产品名（前面有"买/下单/购买/在"等）
  if (!result.productName) {
    m = text.match(/(?:买|购买|下单|入手|在|购)[^\n]{0,8}([\u4e00-\u9fa5a-zA-Z0-9\s]{3,40})(?:¥|￥|元|价格|包邮|片|盒|瓶|支|装)/)
    if (m) result.productName = m[1].trim()
  }

  // ── 金额 ─────────────────────────────────────────
  // 1) 带标头：价格/金额/实付/合计/付款  ¥123 或 123元
  m = text.match(/(?:价格|金额|售价|实付|合计|付款|成交价)[：: ]*(?:RMB\s*)?[¥￥]?\s*([\d.]+)(?:元|块)?/)
  if (m) { const p = parseFloat(m[1]); if (p > 0 && p < 1000000) result.productPrice = p.toFixed(2) }
  // 2) 纯金额符号 ¥123 或 ￥123
  if (!result.productPrice) {
    m = text.match(/(?:RMB\s*)?[¥￥]\s*([\d.]+)/)
    if (m) { const p = parseFloat(m[1]); if (p > 0 && p < 1000000) result.productPrice = p.toFixed(2) }
  }
  // 3) "XXX元" 纯文字
  if (!result.productPrice) {
    m = text.match(/([\d.]+)(?:元|块)(?:人民币)?/)
    if (m) { const p = parseFloat(m[1]); if (p > 0 && p < 1000000) result.productPrice = p.toFixed(2) }
  }
  // 4) 单独的数字（金额最可能出现在商品价格附近，排除日期/数量）
  if (!result.productPrice) {
    const prices = text.match(/\b(\d+\.?\d{0,2})\b/g) || []
    const valid = prices.map(v => parseFloat(v)).filter(v => v >= 10 && v <= 99999 && !Number.isInteger(v / 1))
    if (valid.length > 0) {
      result.productPrice = Math.max(...valid).toFixed(2)
    }
  }

  // ── 基于长度的智能推断（当标头式匹配未命中时启用）──
  // 逻辑：最长的肯定是执照名称（公司名），短一点的是店铺名称
  if (!result.licenseName || !result.shopName) {
    const lines = text.split(/[\n\r]+/).map(l => l.trim()).filter(l => l.length > 0)

    // 收集所有「XXX有限公司」类型的公司全称候选
    const companyCandidates = []
    for (const line of lines) {
      const cm = line.match(/^([\u4e00-\u9fa5]{4,30})(?:有限公司|股份有限公司|有限合伙|集团)$/)
      if (cm) companyCandidates.push({ raw: cm[0], name: cm[1], len: cm[1].length })
    }

    // 收集所有「XXX旗舰店/专卖店/官方店」类型的店铺全称候选
    const shopCandidates = []
    for (const line of lines) {
      const sm = line.match(/^([\u4e00-\u9fa5a-zA-Z0-9]{2,20})(?:旗舰店|专卖店|专营店|官方店|商城)$/)
      if (sm) shopCandidates.push({ raw: sm[0], name: sm[1], len: sm[1].length })
    }

    // 按长度降序排列，取最长的作为执照名称
    if (!result.licenseName && companyCandidates.length > 0) {
      companyCandidates.sort((a, b) => b.len - a.len)
      result.licenseName = companyCandidates[0].name
    }

    // 店铺候选取最短的（店名通常比公司名短）
    if (!result.shopName && shopCandidates.length > 0) {
      shopCandidates.sort((a, b) => a.len - b.len)
      result.shopName = shopCandidates[0].name
    }

    // 备选：只有一个公司候选且无店铺候选时，从公司名推断店铺
    if (!result.shopName && companyCandidates.length === 1 && shopCandidates.length === 0) {
      const cName = companyCandidates[0].name
      const shortMatch = cName.match(/([\u4e00-\u9fa5]{2,10})(?:化妆品|服饰|食品|家居|电器|珠宝|母婴|医疗|教育)?$/)
      if (shortMatch) {
        result.shopName = shortMatch[1] + '旗舰店'
      }
    }
  }

  // ── 商品名称兜底 ─────────────────────────────────
  // 如果商品名称还是没识别到，尝试从书名号《》或「」中提取，取最短的
  if (!result.productName) {
    const bookMatches = text.match(/[\u300a\u300b\u300c\u300d]([^\u300a\u300b\u300c\u300d]{2,40})[\u300a\u300b\u300c\u300d]/g)
    if (bookMatches && bookMatches.length > 0) {
      const candidates = bookMatches.map(b => b.slice(1, -1)).filter(s => s.length >= 2 && s.length <= 40)
      if (candidates.length > 0) {
        candidates.sort((a, b) => a.length - b.length)
        result.productName = candidates[0]
      }
    }
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
