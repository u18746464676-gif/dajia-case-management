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
          class="flex items-start justify-between gap-4 p-3 rounded-xl transition-colors"
          :class="d.expired ? 'bg-red-50 border border-red-100' : d.urgent ? 'bg-orange-50 border border-orange-100' : 'bg-slate-50 border border-slate-100'"
        >
          <div class="min-w-0 flex-1">
            <div class="text-sm font-semibold" :class="d.expired ? 'text-red-600' : d.urgent ? 'text-orange-600' : 'text-slate-700'">
              {{ d.name }}
            </div>
            <div v-if="d.date" class="text-xs text-slate-400 mt-0.5">截止：{{ d.date }}</div>
            <div v-for="(line, idx) in d.metaLines || []" :key="`${d.type || d.name}-meta-${idx}`" class="text-xs text-slate-500 mt-1 leading-5">
              {{ line }}
            </div>
            <div v-if="d.hint" class="text-xs mt-1 leading-5" :class="d.expired ? 'text-red-500' : 'text-slate-500'">
              {{ d.hint }}
            </div>
          </div>
          <div v-if="d.statusText" class="text-right shrink-0">
            <div class="text-sm font-bold" :class="d.expired ? 'text-red-600' : d.urgent ? 'text-orange-600' : 'text-slate-700'">
              {{ d.statusText }}
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
      <p class="text-sm text-red-500 mt-1">自签收之日起已超过10个工作日，请尽快处理</p>
    </div>

    <!-- 自定义时限 -->
    <div v-if="customDeadlines.length">
      <div class="text-xs text-slate-400 mb-3 uppercase tracking-wider">自定义提醒</div>
      <div class="space-y-2">
        <div
          v-for="d in customDeadlines"
          :key="d.id"
          class="flex items-start justify-between gap-4 p-3 rounded-xl transition-colors"
          :class="d.expired ? 'bg-red-50 border border-red-100' : d.urgent ? 'bg-orange-50 border border-orange-100' : 'bg-slate-50 border border-slate-100'"
        >
          <div class="min-w-0 flex-1">
            <div class="text-sm font-semibold" :class="d.expired ? 'text-red-600' : d.urgent ? 'text-orange-600' : 'text-slate-700'">
              {{ d.name }}
            </div>
            <div class="text-xs text-slate-400 mt-0.5">截止：{{ d.date }}</div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <div class="text-sm font-bold" :class="d.expired ? 'text-red-600' : d.urgent ? 'text-orange-600' : 'text-slate-700'">
              {{ d.statusText }}
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

function addWorkingDays(startDate, days) {
  let current = dayjs(startDate)
  let added = 0

  while (added < days) {
    current = current.add(1, 'day')
    const dayOfWeek = current.day()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      added++
    }
  }

  return current.format('YYYY-MM-DD')
}

function formatCountdownStatus(daysLeft) {
  if (daysLeft < 0) return `已超期 ${Math.abs(daysLeft)} 天`
  if (daysLeft === 0) return '今日到期'
  return `剩余 ${daysLeft} 天`
}

function buildCountdownItem(name, date, daysLeft, type, extra = {}) {
  return {
    name,
    date,
    daysLeft,
    statusText: formatCountdownStatus(daysLeft),
    urgent: daysLeft >= 0 && daysLeft <= (extra.urgentThreshold ?? 7),
    expired: daysLeft < 0,
    type,
    hint: extra.hint || '',
    metaLines: extra.metaLines || [],
  }
}

// 检查是否超过法定受理期限（未受理状态下，签收日期起10个工作日）
const overdueAlert = computed(() => {
  const c = props.caseObj
  // 有受理状态后不再提示受理超期
  if (c.acceptanceStatus && c.signDate) return false
  if (!c.acceptanceStatus && c.signDate) {
    const deadline = addWorkingDays(c.signDate, 10)
    const workingDaysLeft = workingDaysDiff(dayjs(), deadline)
    return workingDaysLeft < 0
  }
  return false
})

const legalDeadlines = computed(() => {
  const list = []
  const now = dayjs()
  const c = props.caseObj
  const hasTerminalOutcome = Boolean(c.reportResultStatus)
    || ['decided', 'mediation_terminated'].includes(c.mediationStatus)
  const hasOldRuleFilingCountdown = c.procedureVersion === 'old'
    && c.filingStatus === 'filed'
    && Boolean(c.filingDate)
    && !hasTerminalOutcome
  const shouldShowReviewReminder = ['rejected', 'exempted'].includes(c.reportResultStatus) && Boolean(c.reportResultDate)
  const isOldProcedure = c.procedureVersion === 'old'

  if (!c.acceptanceStatus && c.signDate) {
    const acceptanceDeadline = addWorkingDays(c.signDate, 10)
    const acceptanceDaysLeft = workingDaysDiff(dayjs(), acceptanceDeadline)
    list.push(buildCountdownItem('受理到期日（10个工作日）', acceptanceDeadline, acceptanceDaysLeft, 'acceptance', { urgentThreshold: 3 }))
  }

  if (hasOldRuleFilingCountdown) {
    const filingNormalDeadline = dayjs(c.filingDate).add(90, 'day').format('YYYY-MM-DD')
    const filingNormalDaysLeft = dayjs(filingNormalDeadline).diff(now, 'day')
    list.push(buildCountdownItem('立案后普通办理期限（90日）', filingNormalDeadline, filingNormalDaysLeft, 'filing_normal', { urgentThreshold: 15 }))

    const filingCompletionDeadline = dayjs(c.filingDate).add(120, 'day').format('YYYY-MM-DD')
    const filingCompletionDaysLeft = dayjs(filingCompletionDeadline).diff(now, 'day')
    list.push(buildCountdownItem('立案办结总控提醒（120日）', filingCompletionDeadline, filingCompletionDaysLeft, 'filing_completion', { urgentThreshold: 15 }))
  }

  if (c.acceptanceStatus === 'accepted' && c.acceptanceDate) {
    if (!c.mediationStatus) {
      const mediationName = isOldProcedure ? '调解倒计时（45个工作日）' : '调解倒计时（60日）'
      const mediationDeadline = isOldProcedure
        ? addWorkingDays(c.acceptanceDate, 45)
        : dayjs(c.acceptanceDate).add(60, 'day').format('YYYY-MM-DD')
      const mediationDaysLeft = isOldProcedure
        ? workingDaysDiff(now, mediationDeadline)
        : dayjs(mediationDeadline).diff(now, 'day')
      const mediationMetaLines = []
      if (isOldProcedure) {
        mediationMetaLines.push('工作日计算暂按排除周六、周日测算，法定节假日需人工复核。')
      }
      list.push(buildCountdownItem(mediationName, mediationDeadline, mediationDaysLeft, 'mediation', {
        urgentThreshold: 7,
        metaLines: mediationMetaLines,
        hint: mediationDaysLeft < 0
          ? '调解期限已届满，可能存在未依法终止调解或未依法告知问题，可考虑行政复议、行政执法监督、政府督查。'
          : '',
      }))
    }

    if (!hasTerminalOutcome && !hasOldRuleFilingCountdown) {
      const completionDeadline = dayjs(c.acceptanceDate).add(120, 'day').format('YYYY-MM-DD')
      const completionDaysLeft = dayjs(completionDeadline).diff(now, 'day')
      list.push(buildCountdownItem('案件办结到期日（120日）', completionDeadline, completionDaysLeft, 'completion', { urgentThreshold: 15 }))
    }
  }

  if (c.acceptanceStatus === 'reported' && !hasTerminalOutcome && !hasOldRuleFilingCountdown && c.acceptanceDate) {
    const completionDeadline = dayjs(c.acceptanceDate).add(120, 'day').format('YYYY-MM-DD')
    const completionDaysLeft = dayjs(completionDeadline).diff(now, 'day')
    list.push(buildCountdownItem('案件办结到期日（120日）', completionDeadline, completionDaysLeft, 'completion', { urgentThreshold: 15 }))
  }

  if (c.mediationStatus === 'decided') {
    list.push({
      name: '案件已调解',
      date: c.mediationDate || '',
      statusText: '',
      urgent: false,
      expired: false,
      type: 'mediation_decided',
      metaLines: [],
      hint: '',
    })
  }
  if (c.mediationStatus === 'mediation_terminated') {
    list.push({
      name: '调解已终止',
      date: c.mediationDate || '',
      statusText: '',
      urgent: false,
      expired: false,
      type: 'mediation_terminated',
      metaLines: [],
      hint: '',
    })
  }

  if (c.reportResultStatus) {
    const reportLabels = {
      closed: '已处罚',
      rejected: '不予立案',
      not_punished: '责令改正',
      exempted: '不予处理',
    }
    list.push({
      name: `举报结果：${reportLabels[c.reportResultStatus] || c.reportResultStatus}`,
      date: '',
      statusText: '',
      urgent: false,
      expired: false,
      type: 'report_result',
      metaLines: c.reportResultDate ? [`结果日期：${c.reportResultDate}`] : [],
      hint: '',
    })
  }

  if (shouldShowReviewReminder) {
    const reviewDeadline60 = dayjs(c.reportResultDate).add(60, 'day').format('YYYY-MM-DD')
    const reviewDaysLeft = dayjs(reviewDeadline60).diff(now, 'day')
    const reviewLongStopDate = dayjs(c.reportResultDate).add(1, 'year').format('YYYY-MM-DD')
    const reviewLongStopDaysLeft = dayjs(reviewLongStopDate).diff(now, 'day')
    const metaLines = [`结果日期：${c.reportResultDate}`]
    let name = ''
    let statusText = ''
    let hint = ''

    if (reviewDaysLeft >= 0) {
      name = '行政复议期限'
      statusText = formatCountdownStatus(reviewDaysLeft)
      metaLines.push('状态：通常仍在 60 日期限内')
      metaLines.push(`行政复议申请截止日：${reviewDeadline60}`)
      metaLines.push(`未告知救济途径最长保护期：${reviewLongStopDate}`)
      hint = '默认按举报结果日期起算 60 日。若文书未告知复议权利、复议机关、申请期限，可适用最长一年保护期规则。'
    } else if (reviewLongStopDaysLeft >= 0) {
      name = `行政复议 60 日期限：${formatCountdownStatus(reviewDaysLeft)}`
      statusText = `尚余 ${reviewLongStopDaysLeft} 天`
      metaLines.push(`未告知救济途径最长保护期：尚余 ${reviewLongStopDaysLeft} 天`)
      metaLines.push(`行政复议申请截止日：${reviewDeadline60}`)
      metaLines.push(`一年保护期截止日：${reviewLongStopDate}`)
      hint = '提示：如文书未告知复议权利、复议机关、申请期限，可主张最长一年保护期，需人工确认。'
    } else {
      name = `行政复议 60 日期限：${formatCountdownStatus(reviewDaysLeft)}`
      statusText = `已超期 ${Math.abs(reviewLongStopDaysLeft)} 天`
      metaLines.push(`未告知救济途径最长保护期：已超期 ${Math.abs(reviewLongStopDaysLeft)} 天`)
      metaLines.push(`行政复议申请截止日：${reviewDeadline60}`)
      metaLines.push(`一年保护期截止日：${reviewLongStopDate}`)
      hint = '提示：通常已超过最长保护期；是否仍可救济需结合不可抗力、正当理由、是否另有新行政行为等人工审查。'
    }

    list.push({
      name,
      date: reviewDeadline60,
      daysLeft: reviewDaysLeft,
      statusText,
      urgent: reviewDaysLeft >= 0 ? reviewDaysLeft <= 15 : reviewLongStopDaysLeft >= 0,
      expired: reviewDaysLeft < 0,
      type: 'review_deadline',
      metaLines,
      hint,
    })
  }

  return list
})

const customDeadlines = computed(() => {
  const now = dayjs()
  return (props.caseObj.deadlines || []).map(d => {
    const daysLeft = dayjs(d.date).diff(now, 'day')
    return {
      ...d,
      daysLeft,
      urgent: daysLeft >= 0 && daysLeft <= 3,
      expired: daysLeft < 0,
      statusText: formatCountdownStatus(daysLeft),
    }
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
