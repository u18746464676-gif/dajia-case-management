<template>
  <div class="max-w-xl mx-auto">
    <div class="mb-4">
      <button @click="$router.back()" class="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm">
        ← 返回
      </button>
    </div>
    <div class="card">
      <h2 class="text-lg font-bold text-gray-900 mb-6">⚙️ 设置</h2>

      <!-- 外观模式 -->
      <div class="mb-8">
        <h3 class="font-medium text-gray-800 mb-3">🎨 外观模式</h3>
        <div class="flex gap-2">
          <button
            v-for="opt in [{v:'light',l:'浅色'},{v:'dark',l:'深色'},{v:'system',l:'跟随系统'}]"
            :key="opt.v"
            @click="changeTheme(opt.v)"
            class="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all"
            :class="currentTheme===opt.v
              ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'"
          >{{ opt.l }}</button>
        </div>
      </div>

      <!-- AI 助手 -->
      <div class="mb-8">
        <h3 class="font-medium text-gray-800 mb-3">🤖 AI 智能助手</h3>

        <!-- 智能搜索 -->
        <div class="mb-6">
          <label class="label">智能搜索案件</label>
          <div class="flex gap-2">
            <input
              v-model="searchQuery"
              type="text"
              class="input-field flex-1 text-sm"
              placeholder="输入自然语言搜索，如：'所有未处罚的案件'"
              @keyup.enter="doSmartSearch"
            />
            <button @click="doSmartSearch" class="btn-primary text-sm" :disabled="searchLoading">
              {{ searchLoading ? '分析中...' : '搜索' }}
            </button>
          </div>
          <div v-if="searchResult" class="mt-3 p-4 bg-blue-50 rounded-xl text-sm">
            <div class="font-semibold text-blue-700 mb-2">搜索结果：</div>
            <pre class="whitespace-pre-wrap text-blue-600">{{ searchResult }}</pre>
          </div>
        </div>

        <!-- AI 文书生 -->
        <div>
          <label class="label">生成法律文书</label>
          <div class="flex gap-2 mb-3">
            <select v-model="docType" class="input-field flex-1 text-sm">
              <option value="投诉信">投诉信</option>
              <option value="答复函">答复函</option>
              <option value="案件摘要">案件摘要</option>
            </select>
            <select v-model="selectedCaseId" class="input-field flex-1 text-sm">
              <option value="">选择案件...</option>
              <option v-for="c in store.cases" :key="c.id" :value="c.id">
                {{ c.shopName }} - {{ c.productName }}
              </option>
            </select>
            <button @click="generateDoc" class="btn-primary text-sm" :disabled="docLoading || !selectedCaseId">
              {{ docLoading ? '生成中...' : '生成' }}
            </button>
          </div>
          <div v-if="generatedDoc" class="p-4 bg-green-50 rounded-xl">
            <div class="flex justify-between items-center mb-2">
              <span class="font-semibold text-green-700">生成的文书：</span>
              <button @click="copyDoc" class="text-xs text-green-600 hover:text-green-800">复制</button>
            </div>
            <pre class="whitespace-pre-wrap text-sm text-green-600 max-h-96 overflow-y-auto">{{ generatedDoc }}</pre>
          </div>
        </div>
      </div>

      <!-- 阿里云盘授权 -->
      <div class="mb-8">
        <h3 class="font-medium text-gray-800 mb-3">阿里云盘授权</h3>
        <p class="text-sm text-gray-500 mb-3">
          授权后文书文件将上传到你的阿里云盘保存。Token会自动刷新。
        </p>

        <div v-if="aliToken" class="p-3 bg-green-50 rounded-lg mb-3">
          <div class="text-sm text-green-700">
            ✓ 已授权（Token有效期至 {{ tokenExpireDate }}）
          </div>
          <div class="text-xs text-green-600 mt-1">
            {{ aliToken.user_name || '已登录账号' }}
          </div>
        </div>
        <div v-else class="p-3 bg-yellow-50 rounded-lg mb-3 text-sm text-yellow-700">
          ⚠ 未授权，文书将仅保存在浏览器本地（换设备会丢失）
        </div>

        <div class="space-y-2">
          <button @click="startAuth" class="btn-primary text-sm">
            {{ aliToken ? '重新授权' : '授权阿里云盘' }}
          </button>

          <div v-if="showTokenInput" class="mt-3 space-y-2">
            <p class="text-xs text-gray-500">
              请在弹出窗口中完成授权后，将页面上显示的 <code class="bg-gray-100 px-1 rounded">refresh_token</code> 粘贴到这里：
            </p>
            <textarea
              v-model="manualToken"
              class="input-field min-h-20 text-sm font-mono"
              placeholder="refresh_token=xxxxxxx"
            ></textarea>
            <button @click="submitManualToken" class="btn-primary text-sm">确认</button>
          </div>
        </div>
      </div>

      <!-- 数据管理 -->
      <div class="border-t pt-6">
        <h3 class="font-medium text-gray-800 mb-3">数据管理</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm font-medium text-gray-700">导出数据</div>
              <div class="text-xs text-gray-400">下载JSON格式备份文件</div>
            </div>
            <button @click="exportData" class="btn-secondary text-sm">导出</button>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm font-medium text-gray-700">导入数据</div>
              <div class="text-xs text-gray-400">从JSON备份文件恢复</div>
            </div>
            <label class="btn-secondary text-sm cursor-pointer">
              导入
              <input type="file" accept=".json" @change="importData" class="hidden" />
            </label>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm font-medium text-gray-700">清空数据</div>
              <div class="text-xs text-gray-400">删除所有案件记录（不可恢复）</div>
            </div>
            <button @click="clearAll" class="btn-danger text-sm">清空</button>
          </div>
        </div>
      </div>

      <!-- 版本信息 -->
      <div class="border-t pt-4 mt-4 text-xs text-gray-400">
        打假案件管理系统 v1.1.0 · 支持云端同步 · AI 智能助手
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCaseStore } from '@/stores/case'
import { smartSearchCases, generateDocument } from '@/lib/doubao'

const store = useCaseStore()

const showTokenInput = ref(false)
const manualToken = ref('')
const aliToken = ref(null)

// AI 功能
const searchQuery = ref('')
const currentTheme = ref(getTheme())

function changeTheme(t) {
  currentTheme.value = t
  setTheme(t)
}
const searchResult = ref('')
const searchLoading = ref(false)
const docType = ref('投诉信')
const selectedCaseId = ref('')
const generatedDoc = ref('')
const docLoading = ref(false)

onMounted(() => {
  const saved = localStorage.getItem('ali_token')
  if (saved) {
    try { aliToken.value = JSON.parse(saved) } catch {}
  }
})

const tokenExpireDate = computed(() => {
  if (!aliToken.value?.expires_at) return ''
  return new Date(aliToken.value.expires_at).toLocaleDateString('zh-CN')
})

// AI 智能搜索
async function doSmartSearch() {
  if (!searchQuery.value.trim()) return
  searchLoading.value = true
  searchResult.value = ''
  try {
    searchResult.value = await smartSearchCases(store.cases, searchQuery.value)
  } catch (err) {
    searchResult.value = '搜索失败：' + err.message
  }
  searchLoading.value = false
}

// AI 生成文书
async function generateDoc() {
  if (!selectedCaseId.value) return
  const caseData = store.getCase(selectedCaseId.value)
  if (!caseData) return

  docLoading.value = true
  generatedDoc.value = ''
  try {
    generatedDoc.value = await generateDocument(caseData, docType.value)
  } catch (err) {
    generatedDoc.value = '生成失败：' + err.message
  }
  docLoading.value = false
}

function copyDoc() {
  navigator.clipboard.writeText(generatedDoc.value)
  alert('已复制到剪贴板')
}

function startAuth() {
  showTokenInput.value = true
}

function submitManualToken() {
  if (!manualToken.value.trim()) return
  const tokenData = {
    refresh_token: manualToken.value.trim(),
    expires_at: Date.now() + 30 * 24 * 60 * 60 * 1000,
  }
  localStorage.setItem('ali_token', JSON.stringify(tokenData))
  aliToken.value = tokenData
  showTokenInput.value = false
  alert('授权已保存！')
}

function exportData() {
  const data = JSON.stringify(store.cases, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `案件备份_${new Date().toISOString().slice(0,10).replace(/-/g,'')}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function importData(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const imported = JSON.parse(ev.target.result)
      if (Array.isArray(imported)) {
        if (confirm(`确定要导入 ${imported.length} 条案件吗？这将覆盖现有数据。`)) {
          imported.forEach(c => store.cases.push(c))
          localStorage.setItem('pdd_case_list_v1', JSON.stringify(store.cases))
          alert('导入成功！')
          location.reload()
        }
      }
    } catch {
      alert('文件格式错误，无法导入')
    }
  }
  reader.readAsText(file)
}

function clearAll() {
  if (confirm('确定要清空所有案件数据吗？此操作不可恢复！')) {
    store.cases.splice(0)
    localStorage.removeItem('pdd_case_list_v1')
    alert('已清空')
    location.reload()
  }
}
</script>
