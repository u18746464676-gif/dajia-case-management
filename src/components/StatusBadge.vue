<template>
  <span :class="['status-badge', colorClass]">
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps(['status'])

const config = {
  pending_report: { label: '未受理', class: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
  reported:       { label: '已立案', class: 'bg-blue-100 text-blue-700 border border-blue-200' },
  accepted:       { label: '已受理', class: 'bg-purple-100 text-purple-700 border border-purple-200' },
  decided:        { label: '已调解', class: 'bg-orange-100 text-orange-700 border border-orange-200' },
  closed:         { label: '已处罚', class: 'bg-green-100 text-green-700 border border-green-200' },
  rejected:       { label: '不予立案', class: 'bg-red-100 text-red-700 border border-red-200' },
  not_punished:   { label: '不予处罚', class: 'bg-slate-100 text-slate-700 border border-slate-200' },
}

const label = computed(() => config[props.status]?.label || props.status)
const colorClass = computed(() => config[props.status]?.class || 'bg-gray-100 text-gray-700 border border-gray-200')
</script>
