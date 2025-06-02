<template>
  <div
    class="kanban-card"
    :class="{
      'kanban-card--editing': isEditing,
      'kanban-card--dragging': isDragging
    }"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @dblclick="startEditing"
    @contextmenu.prevent="deleteCard"
  >
    <h2
      ref="titleRef"
      class="kanban-card__title"
      :contenteditable="isEditing && !editingDisabled"
      @keydown="handleKeydown"
      @blur="handleBlur"
      @input="updateHasChanges"
    >
      {{ isEditing ? undefined : card.title }}
    </h2>

    <div class="kanban-card__description">
      <div
        ref="descriptionRef"
        class="kanban-card__description-content"
        :class="{
          'description-has': card.description && !isEditing,
          'description-not': !card.description && !isEditing
        }"
        :contenteditable="isEditing && !editingDisabled"
        @keydown="handleKeydown"
        @blur="handleBlur"
        @input="updateHasChanges"
      >
        {{ isEditing ? undefined : (card.description || 'Add Description') }}
      </div>
    </div>

    <div class="kanban-card__actions" v-if="isEditing">
      <ActionButton
        @click="saveChanges"
        :disabled="!hasChanges"
      >
        <template #icon>
          <img src="@/assets/images/energy.svg" alt="Save">
        </template>
        Save Changes
      </ActionButton>

      <ActionButton @click="cancelEditing">
        <template #icon>
          <img src="@/assets/images/clear.svg" alt="Cancel">
        </template>
        Cancel
      </ActionButton>
    </div>

    <div class="kanban-card__drag-handle" v-if="!isEditing">⋮⋮</div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import ActionButton from './UI/Buttons/ActionButton.vue'

const props = defineProps({
  card: { type: Object, required: true },
  columnId: { type: [String, Number], required: true },
  editingDisabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update-card', 'delete-card'])

const isDragging = ref(false)
const isEditing = ref(false)
const titleRef = ref(null)
const descriptionRef = ref(null)
const originalTitle = ref('')
const originalDescription = ref('')
const hasChanges = ref(false)

// Drag handlers
const handleDragStart = (event) => {
  if (isEditing.value || props.editingDisabled) {
    event.preventDefault()
    return
  }

  isDragging.value = true

  // Простые данные для передачи
  event.dataTransfer.setData('text/plain', JSON.stringify({
    cardId: props.card.id,
    sourceColumnId: props.columnId
  }))
}

const handleDragEnd = () => {
  isDragging.value = false
  console.log('Drag ended')
}

const updateHasChanges = () => {
  if (!isEditing.value) return

  const currentTitle = titleRef.value?.innerHTML?.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').trim() || ''
  const currentDescription = descriptionRef.value?.innerHTML?.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').trim() || ''

  hasChanges.value = currentTitle !== originalTitle.value ||
    currentDescription !== originalDescription.value
}

onMounted(() => {
  if (props.card.autoEdit && !props.editingDisabled) {
    startEditing()
    emit('update-card', { autoEdit: false })
  }
})

const handleKeydown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey) {
    event.preventDefault()
    saveChanges()
  } else if (event.key === 'Tab' && !event.shiftKey) {
    event.preventDefault()
    if (event.target === titleRef.value) {
      descriptionRef.value?.focus()
    }
  } else if (event.key === 'Tab' && event.shiftKey) {
    event.preventDefault()
    if (event.target === descriptionRef.value) {
      titleRef.value?.focus()
    }
  } else if (event.key === 'Escape') {
    event.preventDefault()
    cancelEditing()
  }
}

const startEditing = async () => {
  if (props.editingDisabled) return

  isEditing.value = true
  originalTitle.value = props.card.title || ''
  originalDescription.value = props.card.description || ''
  hasChanges.value = false

  await nextTick()

  if (titleRef.value) {
    titleRef.value.focus()
    titleRef.value.innerHTML = originalTitle.value.replace(/\n/g, '<br>')
  }

  if (descriptionRef.value) {
    descriptionRef.value.innerHTML = originalDescription.value.replace(/\n/g, '<br>')
  }
}

const saveChanges = () => {
  if (!isEditing.value) return

  const newTitle = titleRef.value?.innerHTML?.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').trim() || ''
  const newDescription = descriptionRef.value?.innerHTML?.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').trim() || ''

  emit('update-card', { title: newTitle, description: newDescription })

  isEditing.value = false
  hasChanges.value = false
}

const cancelEditing = () => {
  isEditing.value = false
  hasChanges.value = false
}

const handleBlur = (event) => {
  setTimeout(() => {
    const activeElement = document.activeElement
    const cardElement = event.target.closest('.kanban-card')

    if (!cardElement?.contains(activeElement)) {
      hasChanges.value ? saveChanges() : cancelEditing()
    }
  }, 100)
}

const deleteCard = () => {
  if (props.editingDisabled) return

  const message = props.card.title
    ? `Удалить карточку "${props.card.title}"?`
    : 'Удалить эту карточку?'

  if (confirm(message)) emit('delete-card')
}
</script>

<style scoped lang="scss">
.kanban-card {
  background: var(--bg-card);
  border: 2px solid transparent;
  border-radius: var(--border-radius);
  word-wrap: anywhere;
  padding: var(--spacing);
  cursor: pointer;
  transition: all var(--transition);
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &--dragging {
    opacity: 0.5;
    transform: rotate(5deg) scale(1.05);
    z-index: 1000;
  }

  &--editing {
    border-color: var(--card-border-color);
    cursor: default;
  }
}

.kanban-card__title {
  font-weight: 600;
  font-size: 14px;
  color: rgba(#000, 0.9);
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &[contenteditable="true"] {
    white-space: pre-wrap;
    overflow: visible;
    text-overflow: unset;
    border-radius: 4px;
    padding: 4px 6px;
    background: rgba(66, 133, 244, 0.05);
    outline: none;

    &:focus {
      background: rgba(66, 133, 244, 0.15);
    }

    &:empty::before {
      content: 'Enter title...';
      color: var(--color-text-light);
      font-style: italic;
    }
  }
}

.kanban-card__description-content {
  color: var(--color-text-light);
  font-size: 14px;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &.description-has {
    font-weight: 500;
  }

  &.description-not {
    font-weight: 600;
  }

  &[contenteditable="true"] {
    white-space: pre-wrap;
    overflow: visible;
    text-overflow: unset;
    border-radius: 4px;
    padding: 4px 6px;
    background: rgba(66, 133, 244, 0.05);
    color: var(--color-text);
    font-style: normal;
    min-height: 60px;
    border: 1px solid transparent;

    &:focus {
      background: rgba(66, 133, 244, 0.15);
    }

    &:empty::before {
      content: 'Enter description... (Enter to save)';
      color: var(--color-text-light);
      font-style: italic;
    }
  }
}

.kanban-card__actions {
  display: flex;
  gap: calc(var(--spacing) * 0.5);
  margin-top: var(--spacing);
}

.kanban-card__drag-handle {
  position: absolute;
  top: calc(var(--spacing) * 0.5);
  right: calc(var(--spacing) * 0.5);
  color: var(--color-text-light);
  cursor: grab;
  opacity: 0;
  transition: opacity var(--transition);

  &:active {
    cursor: grabbing;
  }
}

.kanban-card:hover .kanban-card__drag-handle {
  opacity: 1;
}
</style>
