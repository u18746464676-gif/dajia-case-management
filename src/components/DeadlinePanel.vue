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
            <div v-if="d.actions?.length" class="mt-3 flex flex-wrap gap-2">
              <button
                v-for="action in d.actions"
                :key="`${d.type || d.name}-${action.key}`"
                type="button"
                class="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
                @click="emit('open-disposal', action.payload)"
              >
                {{ action.label }}
              </button>
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

    <div v-if="disposalDeadlineItems.length" class="mb-4">
      <div class="text-xs text-slate-400 mb-3 uppercase tracking-wider">后续处置期限提醒</div>
      <div class="space-y-2">
        <div
          v-for="d in disposalDeadlineItems"
          :key="d.id || d.name"
          class="flex items-start justify-between gap-4 p-3 rounded-xl transition-colors"
          :class="d.expired ? 'bg-red-50 border border-red-100' : d.urgent ? 'bg-orange-50 border border-orange-100' : 'bg-slate-50 border border-slate-100'"
        >
          <div class="min-w-0 flex-1">
            <div class="text-sm font-semibold" :class="d.expired ? 'text-red-600' : d.urgent ? 'text-orange-600' : 'text-slate-700'">
              {{ d.name }}
            </div>
            <div v-if="d.date" class="text-xs text-slate-400 mt-0.5">到期：{{ d.date }}</div>
            <div v-for="(line, idx) in d.metaLines || []" :key="`${d.id || d.name}-meta-${idx}`" class="text-xs text-slate-500 mt-1 leading-5">
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
const emit = defineEmits(['update', 'open-disposal'])
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
    actions: extra.actions || [],
  }
}

function buildReviewDisposalPayload(c) {
  if (!c?.reportResultDate) return null
  const reviewDeadline60 = dayjs(c.reportResultDate).add(60, 'day').format('YYYY-MM-DD')
  const reviewLongStopDate = dayjs(c.reportResultDate).add(1, 'year').format('YYYY-MM-DD')
  const reviewDaysLeft = dayjs(reviewDeadline60).diff(dayjs(), 'day')
  const reviewLongStopDaysLeft = dayjs(reviewLongStopDate).diff(dayjs(), 'day')
  let reviewStatusText = `行政复议期限：${formatCountdownStatus(reviewDaysLeft)}`
  if (reviewDaysLeft < 0 && reviewLongStopDaysLeft >= 0) {
    reviewStatusText = `行政复议 60 日期限：${formatCountdownStatus(reviewDaysLeft)}；未告知救济途径最长保护期：尚余 ${reviewLongStopDaysLeft} 天`
  }
  if (reviewLongStopDaysLeft < 0) {
    reviewStatusText = `行政复议 60 日期限：${formatCountdownStatus(reviewDaysLeft)}；未告知救济途径最长保护期：已超期 ${Math.abs(reviewLongStopDaysLeft)} 天`
  }
  return {
    type: '行政复议',
    source: 'review_deadline',
    caseContext: {
      caseNumber: c.caseNumber || '',
      jurisdiction: c.jurisdiction || '',
      reportResult: c.reportResultStatus || '',
      reportResultLabel: {
        closed: '已处罚',
        rejected: '不予立案',
        not_punished: '责令改正',
        exempted: '不予处理',
      }[c.reportResultStatus] || c.reportResultStatus || '',
      reportResultDate: c.reportResultDate || '',
      reviewDeadline60,
      reviewLongStopDate,
      reviewStatusText,
    },
    draft: {
      disposalType: '行政复议',
      targetOrgan: c.jurisdiction || '',
      submitDate: dayjs().format('YYYY-MM-DD'),
      status: '拟申请',
      resultSummary: c.reportResultStatus ? `举报结果：${{
        closed: '已处罚',
        rejected: '不予立案',
        not_punished: '责令改正',
        exempted: '不予处理',
      }[c.reportResultStatus] || c.reportResultStatus}` : '',
      reviewStartDate: c.reportResultDate || '',
      reviewDeadline60,
      reviewLongStopDate,
      reviewStatusText,
      deadlineBasis: 'admin_review_apply_60',
      acceptDate: '',
      mailSignedDate: c.signDate || '',
      deadlineDate: reviewDeadline60,
      deadlineNote: '已超过系统测算期限时，需结合是否正式受理、是否延期、是否另有指定期限人工复核。',
      note: [
        c.caseNumber ? `案件编号：${c.caseNumber}` : '',
        c.jurisdiction ? `管辖局：${c.jurisdiction}` : '',
        c.reportResultDate ? `举报结果日期：${c.reportResultDate}` : '',
      ].filter(Boolean).join('\n'),
    },
  }
}

function buildMediationDisposalPayload(c, type, deadline, daysLeft) {
  const labels = {
    '行政执法监督': '行政执法监督',
    '政府督查': '政府督查',
    '12345 / 信访': '12345 / 信访',
  }
  return {
    type,
    source: 'mediation_overdue',
    caseContext: {
      caseNumber: c.caseNumber || '',
      jurisdiction: c.jurisdiction || '',
      acceptanceDate: c.acceptanceDate || '',
      mediationDeadline: deadline,
      mediationOverdueText: formatCountdownStatus(daysLeft),
      mediationRiskHint: '调解期限已届满，可能存在未依法终止调解或未依法告知问题，可考虑行政复议、行政执法监督、政府督查。',
    },
    draft: {
      disposalType: labels[type] || type,
      targetOrgan: c.jurisdiction || '',
      submitDate: dayjs().format('YYYY-MM-DD'),
      status: '拟提交',
      deadlineBasis: type === '行政执法监督' ? 'law_enforcement_supervision_60_90' : type === '政府督查' ? 'gov_inspection_specified' : 'petition_60',
      acceptDate: c.acceptanceDate || '',
      mailSignedDate: c.signDate || '',
      deadlineDate: deadline || '',
      deadlineNote: '已超过系统测算期限时，需结合是否正式受理、是否延期、是否另有指定期限人工复核。',
      note: [
        c.caseNumber ? `案件编号：${c.caseNumber}` : '',
        c.acceptanceDate ? `受理日期：${c.acceptanceDate}` : '',
        deadline ? `调解截止日：${deadline}` : '',
        `期限状态：${formatCountdownStatus(daysLeft)}`,
        '风险提示：调解期限已届满，可能存在未依法终止调解或未依法告知问题，可考虑行政复议、行政执法监督、政府督查。',
      ].filter(Boolean).join('\n'),
    },
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

function resolveDisposalStartDate(item) {
  if (item.acceptDate) {
    return { value: item.acceptDate, source: '正式受理日期' }
  }
  if (item.mailSignedDate) {
    return { value: item.mailSignedDate, source: '签收日期（临时测算）', temporary: true }
  }
  if (item.mailSentDate) {
    return { value: '', source: '仅有寄件日期，不能作为正式期限起算点', mailSentOnly: true }
  }
  return { value: '', source: '' }
}

function resolveDisposalDeadline(item) {
  if (item.deadlineDate) return item.deadlineDate
  const start = resolveDisposalStartDate(item)
  if (!start.value) return ''
  switch (item.deadlineBasis) {
    case 'petition_60':
    case 'admin_review_apply_60':
    case 'admin_review_handle_60':
      return dayjs(start.value).add(60, 'day').format('YYYY-MM-DD')
    case 'gov_info_20wd':
      return addWorkingDays(start.value, 20)
    case 'law_enforcement_supervision_60_90':
      return dayjs(start.value).add(60, 'day').format('YYYY-MM-DD')
    case 'discipline_inspection_3m':
    case 'npc_deputy_suggestion_3m':
      return dayjs(start.value).add(3, 'month').format('YYYY-MM-DD')
    case 'npc_petition_60':
      return dayjs(start.value).add(60, 'day').format('YYYY-MM-DD')
    default:
      return ''
  }
}

function getDeadlineBasisDescription(value) {
  const descriptions = {
    petition_60: '信访事项通常关注 15 日接收/处理途径告知、60 日办结，复杂情况可延长 30 日。',
    gov_info_20wd: '政府信息公开通常按 20 个工作日答复，必要时可延长 20 个工作日。',
    admin_review_apply_60: '行政复议申请期限通常按 60 日测算。',
    admin_review_handle_60: '行政复议办理期限通常按受理后 60 日测算。',
    law_enforcement_supervision_60_90: '行政执法监督通常按 60 日反馈处理结果，复杂情况可延长至 90 日，具体以当地规定为准。',
    discipline_inspection_3m: '纪检监察交办件通常按 3 个月办理提醒，必要时可延长 3 个月。',
    gov_inspection_specified: '政府督查/督办按督查方案、交办要求或督办通知指定期限执行。',
    npc_petition_60: '人大信访渠道通常可按 60 日办结节奏测算。',
    npc_deputy_suggestion_3m: '人大代表建议通常按 3 个月办理提醒测算。',
    custom_followup: '人工跟进提醒，请结合具体交办要求或自定义日期处理。',
  }
  return descriptions[value] || '待补充期限依据'
}

const disposalDeadlineItems = computed(() => {
  const c = props.caseObj
  const list = []
  const records = Array.isArray(c?.disposals) ? c.disposals : []

  records.forEach(item => {
    const start = resolveDisposalStartDate(item)
    const deadline = resolveDisposalDeadline(item)
    const hasDeadline = Boolean(deadline)
    const daysLeft = hasDeadline ? dayjs(deadline).diff(dayjs(), 'day') : null
    const metaLines = [
      `类型：${item.disposalType || '未命名处置'}`,
      item.targetOrgan ? `提交机关：${item.targetOrgan}` : '',
      item.mailTrackingNo ? `寄件单号：${item.mailTrackingNo}` : '',
      item.mailSignedDate ? `签收日期：${item.mailSignedDate}` : '',
      start.value ? `起算日期：${start.value}${start.source ? `（${start.source}）` : ''}` : '',
      deadline ? `到期日期：${deadline}` : '',
      item.followUpDate ? `跟进日期：${item.followUpDate}` : '',
      `期限依据：${getDeadlineBasisDescription(item.deadlineBasis)}`,
      item.deadlineNote || '',
    ].filter(Boolean)
    let hint = '需结合是否正式受理、是否延期、是否另有指定期限人工复核。'
    if (!item.deadlineBasis) {
      hint = '待补充期限依据。'
    } else if (start.temporary) {
      hint = '当前按签收日期临时测算，需确认正式受理日期。'
    } else if (start.mailSentOnly) {
      hint = '仅有寄件日期，不能作为正式期限起算点。'
    } else if (hasDeadline && daysLeft < 0) {
      hint = '已超过系统测算期限，需结合是否正式受理、是否延期、是否另有指定期限人工复核。'
    }

    list.push({
      id: item.id,
      name: `后续处置：${item.disposalType || '未命名处置'}`,
      date: deadline || '',
      statusText: hasDeadline ? formatCountdownStatus(daysLeft) : '',
      urgent: hasDeadline ? daysLeft >= 0 && daysLeft <= 15 : false,
      expired: hasDeadline ? daysLeft < 0 : false,
      metaLines,
      hint,
    })
  })

  return list
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
        actions: mediationDaysLeft < 0
          ? [
              { key: 'law_supervision', label: '发起行政执法监督', payload: buildMediationDisposalPayload(c, '行政执法监督', mediationDeadline, mediationDaysLeft) },
              { key: 'gov_inspection', label: '发起政府督查', payload: buildMediationDisposalPayload(c, '政府督查', mediationDeadline, mediationDaysLeft) },
              { key: 'petition', label: '发起 12345 / 信访', payload: buildMediationDisposalPayload(c, '12345 / 信访', mediationDeadline, mediationDaysLeft) },
              { key: 'view_all', label: '查看/编辑后续处置', payload: { type: '', source: 'disposals_overview' } },
            ]
          : [],
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

    const reviewPayload = buildReviewDisposalPayload(c)
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
      actions: reviewPayload
        ? [
            { key: 'start_review', label: '发起行政复议', payload: reviewPayload },
            { key: 'view_all', label: '查看/编辑后续处置', payload: { type: '', source: 'disposals_overview' } },
          ]
        : [],
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
