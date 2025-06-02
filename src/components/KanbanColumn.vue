<template>
  <div class="kanban-column">
    <div class="kanban-column__header">
      <div class="kanban-column__title-wrapper">
        <h3 class="kanban-column__title">{{ column.title }}</h3>
        <span class="kanban-column__count">{{ column.cards.length }}</span>
      </div>

      <div class="kanban-column__actions">
        <ActionButton >
          <template #icon>
            <img src="@/assets/images/pause.svg" alt="Disable">
          </template>
          Disable Editing
        </ActionButton>

        <ActionButton @click="deleteColumn">
          <template #icon>
            <img src="@/assets/images/minus.svg" alt="Delete">
          </template>
          Delete Column
        </ActionButton>
      </div>
    </div>

    <!-- Карточки -->
    <div class="kanban-column__cards">
      <KanbanCard
        v-for="card in column.cards"
        :key="card.id"
        :card="card"
      />
    </div>

    <button class="btn full-width" @click="addCard">
      <img src="@/assets/images/plus.svg" alt="Plus">
      New Card
    </button>

    <div class="kanban-column__footer">

      <div class="kanban-column__sort-actions">
        <ActionButton @click="sortCards">
          <template #icon>
            <SortIcon :direction="sortDirection"/>
          </template>
          Sort
        </ActionButton>

        <ActionButton @click="clearAll">
          <template #icon>
            <img src="@/assets/images/clear.svg" alt="Clear">
          </template>
          Clear All
        </ActionButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import KanbanCard from './KanbanCard.vue'
import ActionButton from './UI/Buttons/ActionButton.vue'
import SortIcon from '@/components/UI/Icons/SortIcon.vue'

defineProps({
  column: {
    type: Object,
    required: true
  }
})

const sortDirection = ref('desc');

const sortCards = () => {
  // логика сортировки
}

const clearAll = () => {
  // логика очистки
}

const addCard = () => {
  // логика добавления карточки
}

const deleteColumn = () => {
  // логика удаления колонки
}
</script>

<style scoped>
.kanban-column {
  background: var(--bg-column);
  border-radius: var(--border-radius);
  padding: var(--spacing);
  min-height: 600px;
  display: flex;
  flex-direction: column;
}

.kanban-column__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: calc(var(--spacing) * 0.5);
}

.kanban-column__title-wrapper {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  gap: calc(var(--spacing) * 0.5);
}

.kanban-column__title {
  color: var(--color-text-light);
}

.kanban-column__count {
  color: var(--color-text-muted);
}

.kanban-column__actions {
  display: flex;
  gap: calc(var(--spacing) * 0.25);
}

.kanban-column__cards {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 0.75);
  margin-bottom: var(--spacing);
}

.kanban-column__footer {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 0.5);
  margin-top: auto;
}

.full-width {
  width: 100%;
}

.kanban-column__sort-actions{
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 0.5);
}
</style>
