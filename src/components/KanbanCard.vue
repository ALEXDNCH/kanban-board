<template>
  <div class="kanban-card">
    <h2 class="kanban-card__title">{{ card.title }}</h2>
    <p class="kanban-card__description">
      <span class="description-has" v-if="card.description">
        {{ card.description }}
      </span>
      <span class="description-not" v-else>Add Description</span>
    </p>
    <div class="kanban-card__drag-handle">⋮⋮</div>
  </div>
</template>

<script setup>
defineProps({
  card: {
    type: Object,
    required: true
  }
})
</script>

<style scoped lang="scss">
.kanban-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing);
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: all var(--transition);
  position: relative;
}

.kanban-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.kanban-card__title {
  font-weight: 600;
  font-size: 14px;
  color: rgba(#000, 0.9);
}

.kanban-card__description {
  color: var(--color-text-light);
  font-size: 14px;
  margin-top: 8px;
  &.description-has{
    font-weight: 500;
  }
  &.description-not{
    font-weight: 600;
  }
}

.kanban-card__drag-handle {
  position: absolute;
  top: calc(var(--spacing) * 0.5);
  right: calc(var(--spacing) * 0.5);
  color: var(--color-text-light);
  cursor: grab;
  opacity: 0;
  transition: opacity var(--transition);
}

.kanban-card:hover .kanban-card__drag-handle {
  opacity: 1;
}
</style>
