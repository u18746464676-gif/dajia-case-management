<template>
  <div class="card border-0 shadow-lg">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-slate-800 flex items-center gap-2">
        <span>⏰</span>
        <span>倒计时提醒</span>
      </h3>
      <button @click="showAdd = !showAdd" class="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
        <span v-if="!showAdd">+</span>
        <span v-else>×</span>
        <span>添加自定义</span>
      </button>
    </div>

    <!-- 添加自定义时限 -->
    <div v-if="showAdd" class="mb-4 p-4 bg-slate-50 rounded-xl space-y-3">
      <input v-model="newDeadline.name" type="text" class="input-field rounded-lg text-sm" placeholder="时限名称" />
      <input v-model="newDeadline.date" type="date" class="input-field rounded-lg text-sm" />
      <div class="flex gap-2">
        <button @click="addDeadline" class="btn-primary text-xs py-1.5 px-4">添加</button>
        <button @click="showAdd = false" class="btn-secondary text-xs py-1.5 px-4">取消</button>
      </div>
    </div>

    <!-- 法定时限 -->
    <div v-if="legalDeadlines.length" class="mb-4">
      <div class="text-xs text-slate-400 mb-3 uppercase tracking-wider">法定时限</div>
      <div class="space-y-2">
        <div
          v-for="d in legalDeadlines"
          :key="d.name"
          class="flex items-center justify-between p-3 rounded-xl transition-colors"
          :class="d.expired ? 'bg-red-50 border border-red-100' : d.urgent ? 'bg-orange-50 border border-orange-100' : 'bg-slate-50 border border-slate-100'"
        >
          <div>
            <div class="text-sm font-semibold" :class="d.expired ? 'text-red-600' : d.urgent ? 'text-orange-600' : 'text-slate-700'">
              {{ d.name }}
            </div>
            <div class="text-xs text-slate-400 mt-0.5">截止：{{ d.date }}</div>
          </div>
          <div class="text-right">
            <div v-if="d.expired" class="text-sm font-bold text-red-600">已过期</div>
            <div v-else class="text-sm font-bold" :class="d.urgent ? 'text-orange-600' : 'text-slate-700'">
              {{ d.daysLeft }}天
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 超期提醒 -->
    <div v-if="overdueAlert" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
      <div class="flex items-center gap-2 text-red-600">
        <span class="text-xl">⚠️</span>
        <span class="font-semibold">已超过法定受理期限</span>
      </div>
      <p class="text-sm text-red-500 mt-1">自签收之日起已超过7个工作日，请尽快处理</p>
    </div>

    <!-- 自定义时限 -->
    <div v-if="customDeadlines.length">
      <div class="text-xs text-slate-400 mb-3 uppercase tracking-wider">自定义提醒</div>
      <div class="space-y-2">
        <div
          v-for="d in customDeadlines"
          :key="d.id"
          class="flex items-center justify-between p-3 rounded-xl transition-colors"
          :class="d.expired ? 'bg-red-50 border border-red-100' : d.urgent ? 'bg-orange-50 border border-orange-100' : 'bg-slate-50 border border-slate-100'"
        >
          <div>
            <div class="text-sm font-semibold" :class="d.expired ? 'text-red-600' : d.urgent ? 'text-orange-600' : 'text-slate-700'">
              {{ d.name }}
            </div>
            <div class="text-xs text-slate-400 mt-0.5">截止：{{ d.date }}</div>
          </div>
          <div class="flex items-center gap-2">
            <div v-if="d.expired" class="text-sm font-bold text-red-600">已过期</div>
            <div v-else class="text-sm font-bold" :class="d.urgent ? 'text-orange-600' : 'text-slate-700'">
              {{ d.daysLeft }}天
            </div>
            <button @click="removeDeadline(d.id)" class="text-red-400 hover:text-red-600 hover:bg-red-100 p-1 rounded transition-colors">×</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 无时限 -->
    <div v-if="!legalDeadlines.length && !customDeadlines.length && !overdueAlert" class="text-sm text-slate-400 py-6 text-center">
      <span class="text-3xl">📅</span>
      <p class="mt-2">暂无时限记录</p>
      <p class="text-xs mt-1">变更状态或填写日期后将自动生成倒计时</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import dayjs from 'dayjs'
import { useCaseStore } from '@/stores/case'

const props = defineProps(['caseObj'])
const emit = defineEmits(['update'])
const store = useCaseStore()

const showAdd = ref(false)
const newDeadline = ref({ name: '', date: '' })

// 确保deadlines数组存在，并追踪所有相关属性的变化
watchEffect(() => {
  const c = props.caseObj
  if (c) {
    if (!c.deadlines) {
      store.updateCase(c.id, { deadlines: [] })
    }
  }
})

// 计算两个日期之间的工作日天数
function workingDaysDiff(startDate, endDate) {
  let count = 0
  let current = dayjs(startDate)
  const end = dayjs(endDate)
  while (current.isBefore(end) || current.isSame(end, 'day')) {
    const dayOfWeek = current.day()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++
    }
    current = current.add(1, 'day')
  }
  return count - 1
}

// 检查是否超过法定受理期限（未受理状态下，签收日期超过7个工作日）
const overdueAlert = computed(() => {
  const c = props.caseObj
  // 只有在未受理状态且有签收日期时才检查
  if (c.status === 'pending_report' && c.signDate) {
    const deadline = dayjs(c.signDate).add(7, 'day').format('YYYY-MM-DD')
    const workingDaysLeft = workingDaysDiff(dayjs(), deadline)
    return workingDaysLeft < 0
  }
  return false
})

const legalDeadlines = computed(() => {
  const list = []
  const now = dayjs()
  const c = props.caseObj

  // 只有已受理状态才显示调解和办结倒计时
  if (c.status === 'accepted' || c.status === 'reported' || c.status === 'decided' || c.status === 'closed') {
    // 调解倒计时60自然日（从受理日期算起）
    if (c.acceptanceDate) {
      const mediationDeadline = dayjs(c.acceptanceDate).add(60, 'day').format('YYYY-MM-DD')
      const mediationDaysLeft = dayjs(mediationDeadline).diff(now, 'day')
      list.push({
        name: '调解倒计时（60日）',
        date: mediationDeadline,
        daysLeft: mediationDaysLeft,
        urgent: mediationDaysLeft <= 7,
        expired: mediationDaysLeft < 0,
        type: 'mediation'
      })

      // 案件办结到期日120日（从受理日期算起）
      const completionDeadline = dayjs(c.acceptanceDate).add(120, 'day').format('YYYY-MM-DD')
      const completionDaysLeft = dayjs(completionDeadline).diff(now, 'day')
      list.push({
        name: '案件办结到期日（120日）',
        date: completionDeadline,
        daysLeft: completionDaysLeft,
        urgent: completionDaysLeft <= 15,
        expired: completionDaysLeft < 0,
        type: 'completion'
      })
    }

    // 责令改正整改期（15日，从决定日期算起）
    if (c.acceptanceWay === '责令改正' && c.decisionDate) {
      const rectDeadline = dayjs(c.decisionDate).add(15, 'day').format('YYYY-MM-DD')
      const daysLeft = dayjs(rectDeadline).diff(now, 'day')
      list.push({
        name: '责令改正整改期（15日）',
        date: rectDeadline,
        daysLeft,
        urgent: daysLeft <= 3,
        expired: daysLeft < 0,
        type: 'rect'
      })
    }
  }

  // 不予立案
  if (c.status === 'rejected') {
    list.push({
      name: '不予立案',
      date: c.decisionDate || '',
      daysLeft: '—',
      urgent: false,
      expired: false,
      type: 'rejected'
    })
  }

  return list
})

const customDeadlines = computed(() => {
  const now = dayjs()
  return (props.caseObj.deadlines || []).map(d => {
    const daysLeft = dayjs(d.date).diff(now, 'day')
    return { ...d, daysLeft, urgent: daysLeft <= 3, expired: daysLeft < 0 }
  })
})

function addDeadline() {
  if (!newDeadline.value.name || !newDeadline.value.date) return
  const deadlines = [...(props.caseObj.deadlines || []), {
    id: Date.now().toString(),
    name: newDeadline.value.name,
    date: newDeadline.value.date,
    type: 'self',
  }]
  store.updateCase(props.caseObj.id, { deadlines })
  newDeadline.value = { name: '', date: '' }
  showAdd.value = false
  emit('update')
}

function removeDeadline(id) {
  const deadlines = (props.caseObj.deadlines || []).filter(d => d.id !== id)
  store.updateCase(props.caseObj.id, { deadlines })
  emit('update')
}
</script>
