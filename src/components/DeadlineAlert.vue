<template>
  <div v-if="nearDeadline" class="text-right">
    <div
      v-for="d in nearDeadline"
      :key="d.name"
      class="text-xs"
      :class="d.urgent ? 'text-red-600 font-bold' : 'text-orange-500'"
    >
      {{ d.name }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getDeadlineReminder } from '@/utils/deadline'

const props = defineProps(['caseObj'])

const nearDeadline = computed(() => {
  if (!props.caseObj) return []
  const reminder = getDeadlineReminder(props.caseObj)
  if (!reminder?.text) return []
  return [{
    name: reminder.text,
    daysLeft: '',
    urgent: ['warning', 'danger', 'overdue'].includes(reminder.level),
  }]
})
</script>
