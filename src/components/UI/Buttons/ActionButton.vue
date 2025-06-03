<template>
  <button
    class="action-btn"
    @click="$emit('click')"
    :disabled="disabled"
    :title="tooltip"
  >
    <slot name="icon" />
    <slot />
  </button>
</template>

<script setup>
defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  tooltip: {
    type: String,
    default: ''
  }
})

defineEmits(['click'])
</script>

<style scoped lang="scss">
.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: calc(var(--spacing) * 0.25);
  padding: 5.5px 8px;
  border: 2px solid var(--border-color);
  border-radius: 50px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color var(--transition);
  white-space: nowrap;
  background: var(--bg-card);
  color: var(--color-text-dark);
  font-family: inherit;
}

.action-btn:hover:not(:disabled) {
  border-color: var(--main-btn-color-hover);
}


.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
