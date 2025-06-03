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
          @move-card="moveCard"
          @reorder-card="reorderCard"
          @sort-cards="sortCards"
          @clear-cards="clearCards"
          @toggle-editing="toggleEditing"
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
import KanbanColumn from './KanbanColumn.vue'
import BoardActions from './BoardActions.vue'
import { useKanbanStorage } from '@/composables/useKanbanStorage'

const { boardState } = useKanbanStorage()

const addColumn = () => {
  boardState.columns.push({
    id: Date.now(),
    title: 'New Column',
    cards: [],
    editingDisabled: false
  })
}

const reorderCard = (reorderData) => {
  const { columnId, cardId, newIndex } = reorderData
  const column = boardState.columns.find(c => c.id === columnId)

  if (column) {
    const currentIndex = column.cards.findIndex(c => c.id === cardId)

    if (currentIndex > -1 && currentIndex !== newIndex) {
      // Удаляем карточку из текущей позиции
      const [card] = column.cards.splice(currentIndex, 1)

      // Вставляем в новую позицию
      const insertIndex = newIndex > currentIndex ? newIndex - 1 : newIndex
      column.cards.splice(insertIndex, 0, card)

      console.log(`Reordered card ${cardId} from index ${currentIndex} to ${insertIndex}`)
    }
  }
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

// Card methods
const addCard = (columnId, autoEdit = false) => {
  const column = boardState.columns.find(c => c.id === columnId)
  if (column) {
    const newCard = {
      id: Date.now(),
      title: '',
      description: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      card.updatedAt = new Date().toISOString()
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

const moveCard = (moveData) => {
  const { cardId, sourceColumnId, targetColumnId, targetIndex } = moveData

  const sourceColumn = boardState.columns.find(c => c.id === sourceColumnId)
  const targetColumn = boardState.columns.find(c => c.id === targetColumnId)

  if (sourceColumn && targetColumn) {
    const cardIndex = sourceColumn.cards.findIndex(c => c.id === cardId)

    if (cardIndex > -1) {
      const [card] = sourceColumn.cards.splice(cardIndex, 1)

      // Вставляем в конкретную позицию или в конец
      const insertIndex = targetIndex !== undefined ? targetIndex : targetColumn.cards.length
      targetColumn.cards.splice(insertIndex, 0, card)

      console.log(`Moved card ${cardId} from ${sourceColumnId} to ${targetColumnId} at index ${insertIndex}`)
    }
  }
}

// Board actions
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

const shuffleColumns = () => {
  boardState.columns = [...boardState.columns].sort(() => Math.random() - 0.5)
}

const shuffleCards = () => {
  boardState.columns.forEach(column => {
    column.cards = [...column.cards].sort(() => Math.random() - 0.5)
  })
}

const toggleEditing = () => {
  boardState.editingDisabled = !boardState.editingDisabled
}
</script>

<style scoped>
.kanban-board {
  min-height: 100vh;
  padding: var(--spacing) 0;
}

.kanban-board__columns {
  display: flex;
  overflow-x: auto;
  gap: var(--spacing);
  margin-bottom: calc(var(--spacing) * 2);
  padding-bottom: var(--spacing);
}

.kanban-board__actions {
  position: sticky;
  bottom: 0;
  background: var(--bg-card);
  padding: var(--spacing);
  margin: 0 calc(-1 * var(--spacing));
}
</style>
