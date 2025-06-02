<template>
  <div class="kanban-column">
    <div class="kanban-column__header">
      <div class="kanban-column__title-wrapper">
        <h3 class="kanban-column__title">{{ column.title }}</h3>
        <span class="kanban-column__count">{{ column.cards.length }}</span>
      </div>

      <div class="kanban-column__actions">
        <ActionButton @click="toggleEditing">
          <template #icon>
            <img src="@/assets/images/pause.svg" alt="Toggle editing">
          </template>
          {{ editingDisabled ? 'Enable' : 'Disable' }} Editing
        </ActionButton>

        <ActionButton @click="deleteColumn" :disabled="editingDisabled">
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
        :editing-disabled="editingDisabled"
        @update-card="updateCard(card.id, $event)"
        @delete-card="deleteCard(card.id)"
      />
    </div>

    <button
      class="btn full-width"
      @click="addCard"
      :disabled="editingDisabled"
    >
      <img src="@/assets/images/plus.svg" alt="Plus">
      New Card
    </button>

    <div class="kanban-column__footer">
      <div class="kanban-column__sort-actions">
        <ActionButton @click="sortCards" :disabled="editingDisabled">
          <template #icon>
            <SortIcon :direction="sortDirection"/>
          </template>
          Sort
        </ActionButton>

        <ActionButton @click="clearAll" :disabled="editingDisabled">
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

const props = defineProps({
  column: {
    type: Object,
    required: true
  },
  editingDisabled: {
    type: Boolean,
    default: false
  }
})


const emit = defineEmits([
  'update-column',
  'delete-column',
  'add-card',
  'update-card',
  'delete-card',
  'sort-cards',
  'clear-cards',
  'toggle-editing'
])

const updateCard = (cardId, updates) => {
  emit('update-card', props.column.id, cardId, updates)
}
const deleteCard = (cardId) => {
  emit('delete-card', props.column.id, cardId)
}

const sortDirection = ref('none') // 'none', 'asc', 'desc'

const sortCards = () => {
  if (sortDirection.value === 'none' || sortDirection.value === 'desc') {
    sortDirection.value = 'asc'
  } else {
    sortDirection.value = 'desc'
  }

  emit('sort-cards', props.column.id, sortDirection.value)
}

const clearAll = () => {
  if (confirm(`Вы уверены, что хотите очистить все карточки в колонке "${props.column.title}"?`)) {
    sortDirection.value = 'none'

    emit('clear-cards', props.column.id)
  }
}

const addCard = () => {
  if (props.editingDisabled) return;
  emit('add-card', props.column.id, true);
}

const deleteColumn = () => {
  const confirmMessage = props.column.cards.length > 0
    ? `Вы уверены, что хотите удалить колонку "${props.column.title}" со всеми карточками (${props.column.cards.length})?`
    : `Вы уверены, что хотите удалить колонку "${props.column.title}"?`

  if (confirm(confirmMessage)) {
    emit('delete-column', props.column.id)
  }
}

const toggleEditing = () => {
  emit('toggle-editing')
}
</script>


<style scoped>
.kanban-column {
  background: var(--bg-column);
  border-radius: var(--border-radius);
  padding: var(--spacing);
  min-height: 600px;
  display: flex;
  min-width: 440px;
  width: 100%;
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
  margin: 10px auto 0;
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 0.5);
}
</style>
