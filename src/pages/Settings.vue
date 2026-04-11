<template>
  <div class="max-w-xl mx-auto">
    <div class="mb-4">
      <button @click="$router.back()" class="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm">
        ← 返回
      </button>
    </div>
    <div class="card">
      <h2 class="text-lg font-bold text-gray-900 mb-6">⚙️ 设置</h2>

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
        打假案件管理系统 v1.0.0 · 数据存储于本地浏览器
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCaseStore } from '@/stores/case'

const store = useCaseStore()

const showTokenInput = ref(false)
const manualToken = ref('')

const aliToken = ref(null)

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

function startAuth() {
  // 跳转到阿里云盘授权页面
  const clientId = 'YOUR_CLIENT_ID' // TODO: 填入阿里云盘应用client_id
  const redirectUri = encodeURIComponent('http://localhost:3000/settings')
  const authUrl = `https://auth.aliyundrive.com/v2/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&state=aliyun`
  // 暂时显示手动输入框
  showTokenInput.value = true
}

function submitManualToken() {
  if (!manualToken.value.trim()) return
  // 解析token（简化处理，实际应该用code换token）
  const tokenData = {
    refresh_token: manualToken.value.trim(),
    expires_at: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30天
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
