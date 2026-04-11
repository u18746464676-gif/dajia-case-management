<template>
  <div class="max-w-xl mx-auto">
    <!-- 返回列表按钮 -->
    <div class="mb-4">
      <button @click="router.push('/')" class="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-2 transition-colors">
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
          <input v-model="form.signDate" type="date" class="input-field rounded-lg" placeholder="收到答复的日期" />
        </div>

        <div class="pt-4 flex gap-3">
          <button type="submit" class="btn-primary flex-1 shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
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
