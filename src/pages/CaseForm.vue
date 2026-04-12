<template>
  <div class="max-w-xl mx-auto">
    <!-- 返回列表按钮 -->
    <div class="mb-4">
      <button @click="router.push('/')" class="text-red-500 hover:text-red-700 text-sm flex items-center gap-2 transition-colors">
        <span>←</span>
        <span>返回列表</span>
      </button>
    </div>

    <div class="card border-0 shadow-lg">
      <h2 class="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <span>{{ isEdit ? '✏️' : '➕' }}</span>
        <span>{{ isEdit ? '编辑案件' : '新增案件' }}</span>
      </h2>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div>
          <label class="label">🏪 店铺名称 *</label>
          <input v-model="form.shopName" type="text" class="input-field rounded-lg" required placeholder="例：xxx旗舰店" />
        </div>

        <div>
          <label class="label">📦 商品名称 *</label>
          <input v-model="form.productName" type="text" class="input-field rounded-lg" required placeholder="例：美白祛斑面膜" />
        </div>

        <div>
          <label class="label">💰 商品价格（元）*</label>
          <input v-model.number="form.productPrice" type="number" step="0.01" class="input-field rounded-lg" required placeholder="0.00" />
        </div>

        <div>
          <label class="label">📋 执照名称 *</label>
          <input v-model="form.licenseName" type="text" class="input-field rounded-lg" required placeholder="营业执照上的名称" />
        </div>

        <div>
          <label class="label">🏛️ 管辖局 *</label>
          <input v-model="form.jurisdiction" type="text" class="input-field rounded-lg" required placeholder="例：市场监督管理局" />
        </div>

        <div>
          <label class="label">📬 签收日期</label>
          <input v-model="form.signDate" type="date" class="input-field rounded-lg" />
        </div>

        <!-- 花费与盈利 -->
        <div class="border-t pt-5 mt-5">
          <h3 class="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <span>💵</span>
            <span>财务信息</span>
          </h3>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">💰 商品价格（元）</label>
              <input v-model.number="form.productPrice" type="number" step="0.01" class="input-field rounded-lg" placeholder="0.00" />
            </div>
            <div>
              <label class="label">📤 花费总额（元）</label>
              <input v-model.number="form.expense" type="number" step="0.01" class="input-field rounded-lg" placeholder="维权花费总金额" />
            </div>
            <div>
              <label class="label">📥 盈利金额（元）</label>
              <input v-model.number="form.profit" type="number" step="0.01" class="input-field rounded-lg" placeholder="实际获利金额" />
            </div>
          </div>
        </div>

        <!-- 行政复议信息 -->
        <div class="border-t pt-5 mt-5">
          <h3 class="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <span>⚖️</span>
            <span>行政复议</span>
          </h3>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">是否申请复议</label>
              <select v-model="form.hasAdminReview" class="input-field rounded-lg">
                <option value="">未申请</option>
                <option value="yes">是</option>
                <option value="no">否</option>
              </select>
            </div>

            <div v-if="form.hasAdminReview === 'yes'">
              <label class="label">复议结果</label>
              <select v-model="form.adminReviewResult" class="input-field rounded-lg">
                <option value="">请选择</option>
                <option value="维持">维持</option>
                <option value="撤销">撤销</option>
                <option value="变更">变更</option>
                <option value="责令限期履行">责令限期履行</option>
                <option value="终止">终止</option>
              </select>
            </div>

            <div v-if="form.hasAdminReview === 'yes'">
              <label class="label">复议申请日期</label>
              <input v-model="form.adminReviewApplyDate" type="date" class="input-field rounded-lg" />
            </div>

            <div v-if="form.hasAdminReview === 'yes'">
              <label class="label">复议机关</label>
              <input v-model="form.adminReviewAuthority" type="text" class="input-field rounded-lg" placeholder="行政复议机关名称" />
            </div>

            <div v-if="form.hasAdminReview === 'yes'">
              <label class="label">复议受理日期</label>
              <input v-model="form.adminReviewAcceptDate" type="date" class="input-field rounded-lg" />
            </div>

            <div v-if="form.hasAdminReview === 'yes'">
              <label class="label">复议决定日期</label>
              <input v-model="form.adminReviewDecisionDate" type="date" class="input-field rounded-lg" />
            </div>

            <div v-if="form.hasAdminReview === 'yes'" class="col-span-2">
              <label class="label">复议决定书编号</label>
              <input v-model="form.adminReviewDocNo" type="text" class="input-field rounded-lg" placeholder="例：x复字〔2024〕第xx号" />
            </div>
          </div>
        </div>

        <div class="pt-4 flex gap-3">
          <button type="submit" class="btn-primary flex-1 shadow-lg flex items-center justify-center gap-2">
            <span>{{ isEdit ? '💾' : '✅' }}</span>
            <span>{{ isEdit ? '保存修改' : '创建案件' }}</span>
          </button>
          <button type="button" @click="router.push('/')" class="btn-secondary flex-1">
            取消
          </button>
        </div>
      </form>
    </div>
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

const form = ref({
  shopName: '',
  productName: '',
  productPrice: '',
  licenseName: '',
  jurisdiction: '',
  signDate: '',
  // 财务
  expense: '',
  profit: '',
  // 行政复议
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
        shopName: c.shopName,
        productName: c.productName,
        productPrice: c.productPrice,
        licenseName: c.licenseName,
        jurisdiction: c.jurisdiction || '',
        signDate: c.signDate || '',
        // 财务
        expense: c.expense || '',
        profit: c.profit || '',
        // 行政复议
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

function handleSubmit() {
  if (isEdit.value) {
    store.updateCase(route.params.id, form.value)
    router.push('/')
  } else {
    store.createCase(form.value)
    router.push('/')
  }
}
</script>
