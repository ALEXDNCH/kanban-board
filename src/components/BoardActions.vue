<template>
  <div class="board-actions">
    <div class="board-actions__group">

      <ActionButton @click="$emit('new-column')">
        <template #icon>
          <img src="@/assets/images/plus.svg" alt="Icon">
        </template>
        New Column
      </ActionButton>

      <ActionButton @click="$emit('shuffle-columns')">
        <template #icon>
          <img src="@/assets/images/shuffle.svg" alt="Icon">
        </template>
        Shuffle Columns
      </ActionButton>

      <ActionButton @click="$emit('shuffle-cards')">
        <template #icon>
          <img src="@/assets/images/shuffle.svg" alt="Icon">
        </template>
        Shuffle Cards
      </ActionButton>

      <ActionButton @click="$emit('toggle-editing')">
        <template #icon>
          <img src="@/assets/images/pause.svg" alt="Icon">
        </template>
        {{ editingDisabled ? 'Enable' : 'Disable' }} Editing
      </ActionButton>
    </div>
    <span class="board-actions__label">Board Actions</span>
  </div>
</template>

<script setup>
import ActionButton from '@/components/UI/Buttons/ActionButton.vue'
</script>

<style scoped lang="scss">
.board-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacing);
  flex-wrap: wrap;
}

.board-actions__group {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 0.5);
}

.board-actions__label {
  background: linear-gradient(180deg, #000 0%, rgba(#000000, 0.4) 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  font-size: 14px;
  font-weight: 600;
}

</style>
