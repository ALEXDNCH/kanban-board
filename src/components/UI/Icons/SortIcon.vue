<template>
  <div class="sort-icon">
    <ArrowIcon :class="{ 'sort-icon__arrow--opacity': direction === 'desc' }" />
    <ArrowIcon
      :class="{ 'sort-icon__arrow--opacity': direction === 'asc' }"
      style="transform: rotate(180deg)"
    />
  </div>
</template>

<script setup>
import ArrowIcon from '@/components/UI/Icons/ArrowIcon.vue'

defineProps({
  direction: {
    type: String,
    default: 'desc',
    validator: value => ['asc', 'desc'].includes(value)
  }
})
</script>

<style scoped lang="scss">
.sort-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  &__arrow {
    opacity: 1;
    transition: opacity 0.2s ease;

    &--opacity {
      opacity: 0.5;
    }
  }
}
</style>
