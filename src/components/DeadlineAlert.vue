<template>
  <div v-if="nearDeadline" class="text-right">
    <div
      v-for="d in nearDeadline"
      :key="d.name"
      class="text-xs"
      :class="d.urgent ? 'text-red-600 font-bold' : 'text-orange-500'"
    >
      {{ d.name }}：{{ d.daysLeft }}天
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'

const props = defineProps(['caseObj'])

const nearDeadline = computed(() => {
  if (!props.caseObj) return []
  const deadlines = []
  const now = dayjs()

  // 受理后90天结案（未进入举报结果前适用）
  if (props.caseObj.acceptanceDate && !props.caseObj.reportResultStatus) {
    const deadline = dayjs(props.caseObj.acceptanceDate).add(90, 'day')
    const daysLeft = deadline.diff(now, 'day')
    if (daysLeft >= 0) {
      deadlines.push({
        name: '结案期限',
        daysLeft,
        urgent: daysLeft <= 7,
      })
    }
  }

  // 责令改正15天
  if (props.caseObj.acceptanceWay === '责令改正' && props.caseObj.decisionDate) {
    const deadline = dayjs(props.caseObj.decisionDate).add(15, 'day')
    const daysLeft = deadline.diff(now, 'day')
    if (daysLeft >= 0) {
      deadlines.push({
        name: '整改期限',
        daysLeft,
        urgent: daysLeft <= 3,
      })
    }
  }

  return deadlines.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 2)
})
</script>
