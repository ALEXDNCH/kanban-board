<template>
  <div class="kanban-board">
    <div class="container">
      <div class="kanban-board__columns">
        <KanbanColumn
          v-for="column in staticColumns"
          :key="column.id"
          :column="column"
        />
      </div>

      <div class="kanban-board__actions">
        <BoardActions />
      </div>
    </div>
  </div>
</template>

<script setup>
import KanbanColumn from './KanbanColumn.vue'
import BoardActions from './BoardActions.vue'

const staticColumns = [
  {
    id: 0,
    title: 'TODO',
    cards: []
  },
  {
    id: 1,
    title: 'In progress',
    cards: []
  },
  {
    id: 2,
    title: 'Done',
    cards: []
  }
]
</script>

<style scoped>
.kanban-board {
  min-height: 100vh;
  padding: var(--spacing) 0;
}

.kanban-board__columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing);
  margin-bottom: calc(var(--spacing) * 2);
}

.kanban-board__actions {
  position: sticky;
  bottom: 0;
  padding: var(--spacing);
  margin-top: 24px;
}
</style>
