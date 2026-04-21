<template>
  <!-- 悬浮按钮 -->
  <button
    @click="showChat = true"
    class="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-800 hover:to-amber-700 text-white rounded-full shadow-lg shadow-red-700/40 flex items-center justify-center text-2xl transition-all hover:scale-110 z-40"
  >
    💬
  </button>

  <!-- 聊天弹窗 -->
  <div v-if="showChat" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" @click.self="showChat = false">
    <div class="bg-white rounded-2xl w-[500px] max-w-[90vw] h-[600px] max-h-[80vh] shadow-2xl flex flex-col overflow-hidden border-2 border-amber-200">
      <!-- 头部 -->
      <div class="bg-gradient-to-r from-red-700 to-amber-600 text-white px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xl">🤖</span>
          <span class="font-semibold">AI 案件助手</span>
        </div>
        <button @click="showChat = false" class="hover:bg-white/20 p-1 rounded">×</button>
      </div>

      <!-- 对话列表 -->
      <div ref="messagesEl" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-amber-50 to-white">
        <div v-if="messages.length === 0" class="text-center text-amber-600 py-12">
          <div class="text-4xl mb-3">👋</div>
          <p class="font-semibold">您好！我是案件管理 AI 助手</p>
          <p class="text-sm mt-2">可咨询案件问题、分析处理流程、生成文书</p>
        </div>

        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          class="flex"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[80%] px-4 py-2 rounded-2xl text-sm"
            :class="msg.role === 'user'
              ? 'bg-gradient-to-r from-red-700 to-amber-600 text-white rounded-br-md shadow-lg'
              : 'bg-white text-red-700 rounded-bl-md border border-amber-100 shadow'"
          >
            <pre class="whitespace-pre-wrap font-sans">{{ msg.content }}</pre>
          </div>
        </div>

        <div v-if="loading" class="flex justify-start">
          <div class="bg-white text-amber-600 px-4 py-2 rounded-2xl rounded-bl-md text-sm border border-amber-100 shadow">
            <span class="animate-pulse">思考中...</span>
          </div>
        </div>
      </div>

      <!-- 输入框 -->
      <div class="border-t border-amber-100 p-4 bg-white">
        <div class="flex gap-2">
          <input
            v-model="inputText"
            type="text"
            class="flex-1 input-field rounded-xl"
            placeholder="输入问题..."
            @keyup.enter="sendMessage"
            :disabled="loading"
          />
          <button
            @click="sendMessage"
            :disabled="!inputText.trim() || loading"
            class="btn-primary px-4 rounded-xl disabled:opacity-50"
          >
            发送
          </button>
        </div>
        <div class="flex gap-2 mt-2 text-xs text-amber-600">
          <button
            v-for="q in quickQuestions"
            :key="q"
            @click="inputText = q"
            class="bg-amber-50 px-2 py-1 rounded border border-amber-200 hover:bg-amber-100 transition-colors"
          >
            {{ q }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { callDoubaoPro } from '@/lib/doubao'
import { useCaseStore } from '@/stores/case'

const store = useCaseStore()
const showChat = ref(false)
const messages = ref([])
const inputText = ref('')
const loading = ref(false)
const messagesEl = ref(null)

const quickQuestions = [
  '帮我总结未处罚案件',
  '哪些案件超期了？',
  '生成本周工作报告',
]

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || loading.value) return

  // 添加用户消息
  messages.value.push({ role: 'user', content: text })
  inputText.value = ''
  loading.value = true
  scrollToBottom()

  try {
    // 构建上下文
    const context = buildContext()
    const fullPrompt = `${context}\n\n用户问题：${text}`

    const response = await callDoubaoPro(fullPrompt, '你是一个专业的法律案件管理助手，擅长分析案件状态、处理流程和生成文书。请用简洁专业的语言回答。')

    if (response) {
      messages.value.push({ role: 'assistant', content: response })
    } else {
      messages.value.push({ role: 'assistant', content: '抱歉，AI 暂时无法回答，请稍后重试。' })
    }
  } catch (err) {
    messages.value.push({ role: 'assistant', content: '发生错误：' + err.message })
  }

  loading.value = false
  scrollToBottom()
}

function buildContext() {
  const cases = store.cases
  if (cases.length === 0) {
    return '当前没有案件记录。'
  }

  // 终态综合状态：已调解最优先，其次举报结果，其次终止调解，最后受理状态
  function getEffectiveStatus(c) {
    if (c.mediationStatus === 'decided') return 'decided'
    if (c.reportResultStatus) return c.reportResultStatus
    if (c.mediationStatus) return c.mediationStatus
    if (c.acceptanceStatus) return c.acceptanceStatus
    return 'pending_report'
  }

  const summary = {
    总数: cases.length,
    未受理: cases.filter(c => getEffectiveStatus(c) === 'pending_report').length,
    已受理: cases.filter(c => getEffectiveStatus(c) === 'accepted').length,
    不予受理: cases.filter(c => getEffectiveStatus(c) === 'reported').length,
    已调解: cases.filter(c => getEffectiveStatus(c) === 'decided').length,
    已处罚: cases.filter(c => getEffectiveStatus(c) === 'closed').length,
    不予立案: cases.filter(c => getEffectiveStatus(c) === 'rejected').length,
    责令改正: cases.filter(c => getEffectiveStatus(c) === 'not_punished').length,
    终止调解: cases.filter(c => getEffectiveStatus(c) === 'mediation_terminated').length,
    不予处罚: cases.filter(c => getEffectiveStatus(c) === 'exempted').length,
  }

  const caseList = cases.slice(0, 10).map(c =>
    `[${c.id.slice(0,8)}] ${c.shopName} | ${c.productName} | ${c.status} | ¥${c.productPrice}`
  ).join('\n')

  return `案件统计：${JSON.stringify(summary)}
案件列表（前10条）：
${caseList}
（共 ${cases.length} 条案件）`
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  })
}
</script>
