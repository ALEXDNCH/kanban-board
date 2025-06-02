<template>
  <div class="kanban-board">
    <div class="container">
      <div class="kanban-board__columns">
        <KanbanColumn
          v-for="column in boardState.columns"
          :key="column.id"
          :column="column"
          :editing-disabled="boardState.editingDisabled"
          @update-column="updateColumn"
          @delete-column="deleteColumn"
          @add-card="addCard"
          @update-card="updateCard"
          @delete-card="deleteCard"
          @sort-cards="sortCards"
          @clear-cards="clearCards"
        />
      </div>

      <div class="kanban-board__actions">
        <BoardActions
          :editing-disabled="boardState.editingDisabled"
          @new-column="addColumn"
          @shuffle-columns="shuffleColumns"
          @shuffle-cards="shuffleCards"
          @toggle-editing="toggleEditing"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick } from 'vue'
import KanbanColumn from './KanbanColumn.vue'
import BoardActions from './BoardActions.vue'
import { useKanbanStorage } from '@/composables/useKanbanStorage'

// Получаем реактивное состояние с автосохранением
const { boardState } = useKanbanStorage()

// Методы управления колонками
const addColumn = () => {
  boardState.columns.push({
    id: Date.now(),
    title: 'New Column',
    cards: []
  })
}

const updateColumn = (columnId, updates) => {
  const column = boardState.columns.find(c => c.id === columnId)
  if (column) {
    Object.assign(column, updates)
  }
}

const deleteColumn = (columnId) => {
  const index = boardState.columns.findIndex(c => c.id === columnId)
  if (index > -1) {
    boardState.columns.splice(index, 1)
  }
}

const addCard = (columnId, autoEdit = false) => {
  const column = boardState.columns.find(c => c.id === columnId)
  if (column) {
    const newCard = {
      id: Date.now(),
      title: '',
      description: '',
      createdAt: new Date().toISOString(),
      autoEdit: autoEdit 
    }
    column.cards.push(newCard)
  }
}

const updateCard = (columnId, cardId, updates) => {
  const column = boardState.columns.find(c => c.id === columnId)
  if (column) {
    const card = column.cards.find(c => c.id === cardId)
    if (card) {
      Object.assign(card, updates)
    }
  }
}

const deleteCard = (columnId, cardId) => {
  const column = boardState.columns.find(c => c.id === columnId)
  if (column) {
    const index = column.cards.findIndex(c => c.id === cardId)
    if (index > -1) {
      column.cards.splice(index, 1)
    }
  }
}

const sortCards = (columnId, direction) => {
  const column = boardState.columns.find(c => c.id === columnId)
  if (column) {
    column.cards.sort((a, b) => {
      const compareResult = a.title.localeCompare(b.title)
      return direction === 'desc' ? -compareResult : compareResult
    })
  }
}

const clearCards = (columnId) => {
  const column = boardState.columns.find(c => c.id === columnId)
  if (column) {
    column.cards = []
  }
}

// Board actions
const shuffleColumns = () => {
  // Создаем новый массив для реактивности
  boardState.columns = [...boardState.columns].sort(() => Math.random() - 0.5)
}

const shuffleCards = () => {
  boardState.columns.forEach(column => {
    // Создаем новый массив для реактивности
    column.cards = [...column.cards].sort(() => Math.random() - 0.5)
  })
}

const toggleEditing = () => {
  boardState.editingDisabled = !boardState.editingDisabled
}

// Методы для drag & drop (будут использоваться позже)
const moveCard = (cardId, fromColumnId, toColumnId) => {
  const fromColumn = boardState.columns.find(c => c.id === fromColumnId)
  const toColumn = boardState.columns.find(c => c.id === toColumnId)

  if (fromColumn && toColumn && fromColumn !== toColumn) {
    const cardIndex = fromColumn.cards.findIndex(c => c.id === cardId)
    if (cardIndex > -1) {
      const [card] = fromColumn.cards.splice(cardIndex, 1)
      toColumn.cards.push(card)
    }
  }
}
</script>

<style scoped>
.kanban-board {
  min-height: 100vh;
  padding: var(--spacing) 0;
}

.kanban-board__columns {
  display: flex;
  overflow: auto;
  gap: var(--spacing);
  margin-bottom: calc(var(--spacing) * 2);
}

.kanban-board__actions {
  position: sticky;
  bottom: 0;
  background: var(--bg-card);
  padding: var(--spacing);
  margin: 0 calc(-1 * var(--spacing));
}
</style>
