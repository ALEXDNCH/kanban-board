<template>
  <div class="last-updated">
    {{dateFormat(date)}}
  </div>
</template>

<script setup>
import {dateFormat} from '@/utils/dateFormat.js';

defineProps({
  date: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.last-updated{
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-light);
  margin: var(--spacing) 0;
  text-align: center;
}
</style>