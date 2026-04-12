<template>
  <div v-if="c" class="max-w-4xl mx-auto">
    <!-- 返回按钮 -->
    <div class="mb-4">
      <button @click="$router.back()" class="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-2 transition-colors">
        <span>←</span>
        <span>返回列表</span>
      </button>
    </div>

    <!-- 基本信息卡片 -->
    <div class="card mb-4 border-0 shadow-lg">
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <h2 class="text-2xl font-bold text-slate-800 mb-3">{{ c.productName }}</h2>
          <div class="flex flex-wrap gap-4 text-sm text-slate-500">
            <span class="flex items-center gap-1">
              <span class="text-slate-400">🏪</span>
              <span>{{ c.shopName }}</span>
            </span>
            <span class="flex items-center gap-1">
              <span class="text-slate-400">📋</span>
              <span>{{ c.licenseName }}</span>
            </span>
            <span class="flex items-center gap-1">
              <span class="text-slate-400">🏛️</span>
              <span>{{ c.jurisdiction || '-' }}</span>
            </span>
          </div>
        </div>
        <div class="text-right shrink-0 ml-4">
          <div class="text-3xl font-bold text-blue-600 mb-2">¥{{ c.productPrice }}</div>
          <StatusBadge :status="c.status" />
        </div>
      </div>

      <div class="text-xs text-slate-400 mb-4">
        创建于 {{ formatDate(c.createdAt) }} · 更新于 {{ formatDate(c.updatedAt) }}
      </div>

      <div class="flex flex-wrap gap-2">
        <router-link :to="'/case/' + c.id + '/edit'" class="btn-secondary text-sm">✏️ 编辑</router-link>
        <button @click="showStatusModal = true" class="btn-primary text-sm">🔄 变更状态</button>
        <button @click="showReplyModal = true" class="btn-secondary text-sm">💬 添加答复</button>
        <button @click="showDocModal = true" class="btn-secondary text-sm">📎 上传文书</button>
        <button @click="confirmDelete" class="btn-danger text-sm">🗑️ 删除</button>
      </div>
    </div>

    <!-- 倒计时提醒 -->
    <DeadlinePanel :case-obj="caseData" @update="loadCase" class="mb-4" />

    <!-- 状态流转记录 -->
    <div class="card mb-4 border-0 shadow-lg">
      <h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <span>📊</span>
        <span>状态流转记录</span>
      </h3>
      <div class="space-y-3">
        <div v-for="(h, idx) in c.statusHistory" :key="h.changedAt" class="flex items-center gap-3 p-3 rounded-xl transition-colors" :class="idx > 0 ? 'bg-slate-50 hover:bg-slate-100' : 'bg-blue-50'">
          <span class="text-xs text-slate-400 w-32 font-mono">{{ formatDate(h.changedAt) }}</span>
          <span class="text-slate-500">{{ statusLabel(h.from) || '初始' }}</span>
          <span class="text-blue-500">→</span>
          <span class="font-semibold text-slate-800">{{ statusLabel(h.to) }}</span>
          <button
            v-if="idx > 0"
            @click="undoStatus(idx)"
            class="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg ml-auto transition-colors"
          >
            撤销此步
          </button>
        </div>
      </div>
    </div>

    <!-- 受理信息 -->
    <div class="card mb-4 border-0 shadow-lg">
      <h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <span>📋</span>
        <span>举报/受理信息</span>
      </h3>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">管辖局</label>
          <input
            type="text"
            v-model="c.jurisdiction"
            @change="saveField('jurisdiction', c.jurisdiction)"
            class="input-field rounded-lg"
            placeholder="市场监督管理局等"
          />
        </div>
        <div>
          <label class="label">举报日期</label>
          <input
            type="date"
            v-model="c.reportDate"
            @change="saveField('reportDate', c.reportDate)"
            class="input-field rounded-lg"
          />
        </div>
        <div>
          <label class="label">签收日期</label>
          <input
            type="date"
            v-model="c.signDate"
            @change="saveField('signDate', c.signDate)"
            class="input-field rounded-lg"
          />
        </div>
        <div>
          <label class="label">受理日期</label>
          <input
            type="date"
            v-model="c.acceptanceDate"
            @change="saveField('acceptanceDate', c.acceptanceDate)"
            class="input-field rounded-lg"
          />
        </div>
        <div>
          <label class="label">决定日期</label>
          <input
            type="date"
            v-model="c.decisionDate"
            @change="saveField('decisionDate', c.decisionDate)"
            class="input-field rounded-lg"
          />
        </div>
        <div>
          <label class="label">受理方式</label>
          <select
            v-model="c.acceptanceWay"
            @change="saveField('acceptanceWay', c.acceptanceWay)"
            class="input-field rounded-lg"
          >
            <option value="">未选择</option>
            <option value="已受理">已受理</option>
            <option value="不予立案">不予立案</option>
            <option value="已立案">已立案</option>
            <option value="责令改正">责令改正</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 财务信息 -->
    <div class="card mb-4 border-0 shadow-lg">
      <h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <span>💵</span>
        <span>财务信息</span>
      </h3>
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="label">商品价格（元）</label>
          <input
            type="number"
            step="0.01"
            v-model="c.productPrice"
            @change="saveField('productPrice', c.productPrice)"
            class="input-field rounded-lg"
          />
        </div>
        <div>
          <label class="label">花费总额（元）</label>
          <input
            type="number"
            step="0.01"
            v-model="c.expense"
            @change="saveField('expense', c.expense)"
            class="input-field rounded-lg"
            placeholder="维权花费总金额"
          />
        </div>
        <div>
          <label class="label">盈利金额（元）</label>
          <input
            type="number"
            step="0.01"
            v-model="c.profit"
            @change="saveField('profit', c.profit)"
            class="input-field rounded-lg"
            placeholder="实际获利金额"
          />
        </div>
      </div>
    </div>

    <!-- 答复记录 -->
    <div class="card mb-4 border-0 shadow-lg">
      <h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <span>💬</span>
        <span>答复记录</span>
        <span class="text-xs text-slate-400 font-normal">({{ c.replies.length }})</span>
      </h3>
      <div v-if="c.replies.length === 0" class="text-center py-8 text-slate-400">
        <span class="text-4xl">💬</span>
        <p class="mt-2">暂无答复记录</p>
      </div>
      <div v-else class="space-y-4">
        <div v-for="r in c.replies" :key="r.id" class="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">{{ r.date }}</span>
            <button @click="deleteReply(r.id)" class="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors">删除</button>
          </div>
          <p class="text-sm text-slate-600">{{ r.content }}</p>
        </div>
      </div>
    </div>

    <!-- 案件材料 -->
    <div class="card mb-4 border-0 shadow-lg">
      <h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <span>📁</span>
        <span>案件材料</span>
        <span class="text-xs text-slate-400 font-normal">({{ totalMaterials }})</span>
      </h3>

      <!-- 材料分类筛选 -->
      <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          v-for="tab in materialTabs"
          :key="tab.value"
          @click="activeMaterialTab = tab.value"
          class="px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors"
          :class="activeMaterialTab === tab.value ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
        >
          {{ tab.label }} ({{ tab.count }})
        </button>
      </div>

      <!-- 全部材料 -->
      <div v-if="activeMaterialTab === 'all'">
        <div v-if="allMaterials.length === 0" class="text-center py-8 text-slate-400">
          <span class="text-4xl">📁</span>
          <p class="mt-2">暂无案件材料</p>
        </div>
        <div v-else class="grid grid-cols-2 gap-3">
          <div
            v-for="(item, idx) in allMaterials"
            :key="item.id || idx"
            class="flex items-center gap-3 p-3 rounded-xl transition-colors"
            :class="item.type === 'reply' ? 'bg-blue-50 hover:bg-blue-100' : item.type === 'image' ? 'bg-purple-50 hover:bg-purple-100' : 'bg-slate-50 hover:bg-slate-100'"
          >
            <span class="text-2xl">{{ getMaterialIcon(item.type) }}</span>
            <div class="flex-1 min-w-0">
              <div class="truncate text-slate-700 font-medium text-sm">{{ item.name }}</div>
              <div class="text-xs text-slate-400">{{ item.date }}</div>
            </div>
            <button @click="deleteMaterial(item)" class="text-red-400 hover:text-red-600 text-xl transition-colors">×</button>
          </div>
        </div>
      </div>

      <!-- 信封图片 -->
      <div v-if="activeMaterialTab === 'images'">
        <div v-if="caseImages.length === 0" class="text-center py-8 text-slate-400">
          <span class="text-4xl">🖼️</span>
          <p class="mt-2">暂无上传图片</p>
        </div>
        <div v-else class="grid grid-cols-3 gap-3">
          <div v-for="(img, idx) in caseImages" :key="idx" class="relative group">
            <img :src="img.url" class="w-full aspect-square object-cover rounded-xl border-2 border-slate-100" />
            <div class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-xl truncate">{{ img.date }}</div>
            <button @click="deleteImage(idx)" class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity">×</button>
          </div>
        </div>
      </div>

      <!-- 文书 -->
      <div v-if="activeMaterialTab === 'documents'">
        <div v-if="c.documents.length === 0" class="text-center py-8 text-slate-400">
          <span class="text-4xl">📄</span>
          <p class="mt-2">暂无上传文书</p>
        </div>
        <div v-else class="grid grid-cols-2 gap-3">
          <div
            v-for="d in c.documents"
            :key="d.id"
            class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <span class="text-2xl">{{ d.type === 'pdf' ? '📄' : '🖼️' }}</span>
            <div class="flex-1 min-w-0">
              <div class="truncate text-slate-700 font-medium">{{ d.name }}</div>
              <div class="text-xs text-slate-400">{{ formatDate(d.uploadedAt) }}</div>
            </div>
            <button @click="deleteDoc(d.id)" class="text-red-400 hover:text-red-600 text-xl transition-colors">×</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 行政复议 -->
    <div class="card mb-4 border-0 shadow-lg">
      <h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <span>⚖️</span>
        <span>行政复议</span>
        <span v-if="c.hasAdminReview === 'yes'" :class="getReviewBadgeClass(c.adminReviewResult)" class="text-xs px-2 py-0.5 rounded-full">
          {{ c.adminReviewResult || '处理中' }}
        </span>
      </h3>

      <div v-if="!c.hasAdminReview || c.hasAdminReview === 'no'" class="text-center py-8 text-slate-400">
        <span class="text-4xl">⚖️</span>
        <p class="mt-2">未申请行政复议</p>
      </div>

      <div v-else class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">复议申请日期</label>
            <input
              type="date"
              :value="c.adminReviewApplyDate"
              @change="saveField('adminReviewApplyDate', $event.target.value)"
              class="input-field rounded-lg"
            />
          </div>
          <div>
            <label class="label">复议机关</label>
            <input
              type="text"
              :value="c.adminReviewAuthority"
              @change="saveField('adminReviewAuthority', $event.target.value)"
              class="input-field rounded-lg"
              placeholder="行政复议机关"
            />
          </div>
          <div>
            <label class="label">复议受理日期</label>
            <input
              type="date"
              :value="c.adminReviewAcceptDate"
              @change="saveField('adminReviewAcceptDate', $event.target.value)"
              class="input-field rounded-lg"
            />
          </div>
          <div>
            <label class="label">复议决定日期</label>
            <input
              type="date"
              :value="c.adminReviewDecisionDate"
              @change="saveField('adminReviewDecisionDate', $event.target.value)"
              class="input-field rounded-lg"
            />
          </div>
        </div>
        <div>
          <label class="label">复议结果</label>
          <select
            :value="c.adminReviewResult"
            @change="saveField('adminReviewResult', $event.target.value)"
            class="input-field rounded-lg"
          >
            <option value="">请选择</option>
            <option value="维持">维持</option>
            <option value="撤销">撤销</option>
            <option value="变更">变更</option>
            <option value="责令限期履行">责令限期履行</option>
            <option value="终止">终止</option>
          </select>
        </div>
        <div>
          <label class="label">复议决定书编号</label>
          <input
            type="text"
            :value="c.adminReviewDocNo"
            @change="saveField('adminReviewDocNo', $event.target.value)"
            class="input-field rounded-lg"
            placeholder="例：x复字〔2024〕第xx号"
          />
        </div>
      </div>
    </div>

    <!-- 文书 -->
    <div class="card mb-4 border-0 shadow-lg">
      <h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <span>📎</span>
        <span>文书</span>
        <span class="text-xs text-slate-400 font-normal">({{ c.documents.length }})</span>
      </h3>
      <div v-if="c.documents.length === 0" class="text-center py-8 text-slate-400">
        <span class="text-4xl">📎</span>
        <p class="mt-2">暂无上传文书</p>
      </div>
      <div v-else class="grid grid-cols-2 gap-3">
        <div
          v-for="d in c.documents"
          :key="d.id"
          class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <span class="text-2xl">{{ d.type === 'pdf' ? '📄' : '🖼️' }}</span>
          <div class="flex-1 min-w-0">
            <div class="truncate text-slate-700 font-medium">{{ d.name }}</div>
            <div class="text-xs text-slate-400">{{ formatDate(d.uploadedAt) }}</div>
          </div>
          <button @click="deleteDoc(d.id)" class="text-red-400 hover:text-red-600 text-xl transition-colors">×</button>
        </div>
      </div>
    </div>

    <!-- 备注 -->
    <div class="card border-0 shadow-lg">
      <h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <span>📝</span>
        <span>备注</span>
      </h3>
      <textarea
        v-model="c.notes"
        @change="saveField('notes', c.notes)"
        class="input-field rounded-lg min-h-32 resize-none"
        placeholder="补充信息..."
      ></textarea>
    </div>

    <!-- 状态变更弹窗 -->
    <div v-if="showStatusModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" @click.self="showStatusModal = false">
      <div class="bg-white rounded-2xl p-6 w-96 shadow-2xl">
        <h3 class="font-bold text-lg mb-4 text-slate-800">变更案件状态</h3>
        <div class="space-y-2">
          <button
            v-for="s in statusOptions"
            :key="s.value"
            @click="changeStatus(s.value)"
            class="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-2"
          >
            <span>{{ s.icon }}</span>
            <span>{{ s.label }}</span>
          </button>
        </div>
        <button @click="showStatusModal = false" class="btn-secondary w-full mt-4">取消</button>
      </div>
    </div>

    <!-- 添加答复弹窗 -->
    <div v-if="showReplyModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" @click.self="showReplyModal = false">
      <div class="bg-white rounded-2xl p-6 w-[500px] shadow-2xl">
        <h3 class="font-bold text-lg mb-4 text-slate-800">添加答复记录</h3>
        <div class="space-y-4">
          <div>
            <label class="label">日期</label>
            <input v-model="replyForm.date" type="date" class="input-field rounded-lg" />
          </div>
          <div>
            <label class="label">答复内容</label>
            <textarea v-model="replyForm.content" class="input-field rounded-lg min-h-32 resize-none" placeholder="官方答复内容..."></textarea>
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="submitReply" class="btn-primary flex-1 shadow-lg shadow-blue-600/20">保存</button>
          <button @click="showReplyModal = false" class="btn-secondary flex-1">取消</button>
        </div>
      </div>
    </div>

    <!-- 上传文书弹窗 -->
    <div v-if="showDocModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" @click.self="showDocModal = false">
      <div class="bg-white rounded-2xl p-6 w-[500px] shadow-2xl">
        <h3 class="font-bold text-lg mb-4 text-slate-800">上传文书</h3>
        <div class="space-y-4">
          <div>
            <label class="label">文件名</label>
            <input v-model="docForm.name" type="text" class="input-field rounded-lg" placeholder="例：处罚决定书.pdf" />
          </div>
          <div>
            <label class="label">文件链接（阿里云盘分享链接）</label>
            <input v-model="docForm.url" type="text" class="input-field rounded-lg" placeholder="https://alipan.com/..." />
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="submitDoc" class="btn-primary flex-1 shadow-lg shadow-blue-600/20">保存</button>
          <button @click="showDocModal = false" class="btn-secondary flex-1">取消</button>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-32 bg-white rounded-2xl shadow-sm border border-slate-100">
    <span class="text-8xl">🔍</span>
    <p class="text-xl text-slate-400 mt-4 mb-6">案件不存在</p>
    <router-link to="/" class="btn-primary inline-flex items-center gap-2">返回列表</router-link>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCaseStore } from '@/stores/case'
import StatusBadge from '@/components/StatusBadge.vue'
import DeadlinePanel from '@/components/DeadlinePanel.vue'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const store = useCaseStore()

const showStatusModal = ref(false)
const showReplyModal = ref(false)
const showDocModal = ref(false)

const replyForm = ref({ date: dayjs().format('YYYY-MM-DD'), content: '' })
const docForm = ref({ name: '', url: '', type: 'other' })

const c = ref(null)

// 使用computed实时获取最新案件数据
const caseData = computed(() => store.getCase(route.params.id))

onMounted(() => {
  c.value = caseData.value
})

// 监听store中案件变化，更新本地数据
watch(caseData, (newVal) => {
  if (newVal) {
    c.value = newVal
  }
}, { immediate: true })

const statusOptions = [
  { value: 'pending_report', label: '未受理', icon: '⏳' },
  { value: 'accepted', label: '已受理', icon: '✅' },
  { value: 'reported', label: '已立案', icon: '📝' },
  { value: 'decided', label: '已调解', icon: '🤝' },
  { value: 'closed', label: '已处罚', icon: '⚖️' },
  { value: 'rejected', label: '不予立案', icon: '❌' },
  { value: 'not_punished', label: '不予处罚', icon: '🚫' },
]

const statusLabels = {
  pending_report: '未受理',
  accepted: '已受理',
  reported: '已立案',
  decided: '已调解',
  closed: '已处罚',
  rejected: '不予立案',
  not_punished: '不予处罚',
}

// 案件材料相关
const activeMaterialTab = ref('all')

// 全部材料（答复+文书+图片）
const allMaterials = computed(() => {
  const materials = []
  // 添加答复
  if (c.value?.replies) {
    c.value.replies.forEach(r => {
      materials.push({
        id: r.id,
        type: 'reply',
        name: r.content.substring(0, 50) + (r.content.length > 50 ? '...' : ''),
        date: r.date,
        data: r
      })
    })
  }
  // 添加文书
  if (c.value?.documents) {
    c.value.documents.forEach(d => {
      materials.push({
        id: d.id,
        type: 'document',
        name: d.name,
        date: formatDate(d.uploadedAt),
        data: d
      })
    })
  }
  // 添加图片
  if (c.value?.images) {
    c.value.images.forEach((img, idx) => {
      materials.push({
        id: 'img-' + idx,
        type: 'image',
        name: img.name || '信封图片',
        date: img.date || '',
        url: img.url,
        data: img
      })
    })
  }
  return materials.sort((a, b) => new Date(b.date) - new Date(a.date))
})

// 仅图片
const caseImages = computed(() => {
  return c.value?.images || []
})

// 材料统计
const materialTabs = computed(() => {
  return [
    { label: '全部', value: 'all', count: allMaterials.value.length },
    { label: '信封', value: 'images', count: caseImages.value.length },
    { label: '答复', value: 'replies', count: c.value?.replies?.length || 0 },
    { label: '文书', value: 'documents', count: c.value?.documents?.length || 0 },
  ]
})

const totalMaterials = computed(() => allMaterials.value.length)

function getMaterialIcon(type) {
  const icons = {
    reply: '💬',
    document: '📄',
    image: '🖼️'
  }
  return icons[type] || '📁'
}

function deleteMaterial(item) {
  if (item.type === 'reply') {
    deleteReply(item.id)
  } else if (item.type === 'document') {
    deleteDoc(item.id)
  } else if (item.type === 'image') {
    const idx = caseImages.value.findIndex(img => img.url === item.url)
    if (idx !== -1) deleteImage(idx)
  }
}

function deleteImage(idx) {
  const images = [...(c.value.images || [])]
  images.splice(idx, 1)
  saveField('images', images)
}

function statusLabel(s) {
  return statusLabels[s] || s
}

function formatDate(iso) {
  return dayjs(iso).format('YYYY-MM-DD HH:mm')
}

function getReviewBadgeClass(result) {
  const map = {
    '维持': 'bg-green-100 text-green-700',
    '撤销': 'bg-red-100 text-red-700',
    '变更': 'bg-orange-100 text-orange-700',
    '责令限期履行': 'bg-yellow-100 text-yellow-700',
    '终止': 'bg-gray-100 text-gray-700',
  }
  return map[result] || 'bg-blue-100 text-blue-700'
}

function saveField(field, value) {
  store.updateCase(c.value.id, { [field]: value })
}

function changeStatus(newStatus) {
  const updates = {}
  if (newStatus === 'accepted') {
    updates.acceptanceDate = dayjs().format('YYYY-MM-DD')
  }
  store.changeStatus(c.value.id, newStatus, updates)
  loadCase()
  showStatusModal.value = false
}

function undoStatus(index) {
  let targetStatus = c.value.statusHistory[index].from
  if (!targetStatus) {
    targetStatus = 'pending_report'
  }
  let newHistory = c.value.statusHistory.slice(0, index)
  if (newHistory.length === 0) {
    newHistory = [{ from: '', to: 'pending_report', changedAt: c.value.statusHistory[index].changedAt }]
  }
  store.updateCase(c.value.id, {
    status: targetStatus,
    statusHistory: newHistory
  })
  router.push('/')
}

function submitReply() {
  if (!replyForm.value.content.trim()) return
  store.addReply(c.value.id, replyForm.value)
  replyForm.value = { date: dayjs().format('YYYY-MM-DD'), content: '' }
  showReplyModal.value = false
  loadCase()
}

function deleteReply(replyId) {
  c.value.replies = c.value.replies.filter(r => r.id !== replyId)
  store.updateCase(c.value.id, { replies: c.value.replies })
  loadCase()
}

function submitDoc() {
  if (!docForm.value.name.trim()) return
  const type = docForm.value.name.endsWith('.pdf') ? 'pdf' : 'image'
  store.addDocument(c.value.id, { ...docForm.value, type })
  docForm.value = { name: '', url: '', type: 'other' }
  showDocModal.value = false
  loadCase()
}

function deleteDoc(docId) {
  c.value.documents = c.value.documents.filter(d => d.id !== docId)
  store.updateCase(c.value.id, { documents: c.value.documents })
  loadCase()
}

function confirmDelete() {
  if (confirm('确认删除此案件？删除后不可恢复。')) {
    store.deleteCase(c.value.id)
    router.push('/')
  }
}
</script>
