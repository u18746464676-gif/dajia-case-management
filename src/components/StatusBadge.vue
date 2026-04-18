<template>
  <span :class="['status-badge', meta.className]">
    <span v-if="showDot" class="h-1.5 w-1.5 rounded-full" :class="meta.dotClass"></span>
    <span>{{ meta.label }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { getCaseStatusMeta } from '@/lib/case-status'

const props = defineProps({
  status: {
    type: String,
    default: '',
  },
  profit: {
    type: [Number, String],
    default: 0,
  },
  showDot: {
    type: Boolean,
    default: true,
  },
})

const meta = computed(() => getCaseStatusMeta(props.status, props.profit))
</script>
