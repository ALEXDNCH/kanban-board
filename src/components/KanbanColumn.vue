<template>
  <div
    class="kanban-column"
    @dragover="handleDragOver"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <div class="kanban-column__header">
      <div class="kanban-column__title-wrapper">
        <h3
          ref="titleRef"
          class="kanban-column__title"
          :contenteditable="!column.editingDisabled"
          @blur="saveTitle"
          @keydown.enter.prevent="blurTitle"
          @input="onInput"
        >
          {{ column.title }}
        </h3>
        <span class="kanban-column__count">{{ column.cards.length }}</span>
      </div>

      <div class="kanban-column__actions">
        <ActionButton @click="toggleEditing">
          <template #icon>
            <img v-if="!column.editingDisabled" src="@/assets/images/pause.svg" alt="Icon">
            <img v-else src="@/assets/images/resume.svg" alt="Icon">
          </template>
          {{ column.editingDisabled ? 'Unlock Column' : 'Disable Editing' }}
        </ActionButton>

        <ActionButton  @click="deleteColumn" :disabled="column.editingDisabled">
          <template #icon>
            <img src="@/assets/images/minus.svg" alt="Delete">
          </template>
          Delete Column
        </ActionButton>
      </div>
    </div>

    <div class="kanban-column__cards">
      <div
        v-for="(card, index) in column.cards"
        :key="card.id"
        class="card-wrapper"
        :class="{ 'card-wrapper--drop-target': dropIndex === index }"
        @dragover="handleCardDragOver($event, index)"
      >
        <KanbanCard
          :card="card"
          :column-id="column.id"
          :editing-disabled="column.editingDisabled"
          @update-card="updateCard(card.id, $event)"
          @delete-card="deleteCard(card.id)"
        />
      </div>

      <div
        v-if="dropIndex === column.cards.length"
        class="drop-box"
      ></div>
    </div>

    <button
      class="btn full-width"
      @click="addCard"
      :disabled="column.editingDisabled"
    >
      <img src="@/assets/images/plus.svg" alt="Plus">
      New Card
    </button>
    <LastUpdated v-if="newestUpdatedCard" :date="newestUpdatedCard?.updatedAt"/>

    <div class="kanban-column__footer">
      <div class="kanban-column__sort-actions">
        <ActionButton @click="sortCards" :disabled="column.editingDisabled || column.cards.length < 2">
          <template #icon>
            <SortIcon :direction="sortDirection"/>
          </template>
          Sort
          <span
            class="sort-direction"
            v-if="sortDirection !== 'none'"
          >
            {{sortDirection}}
          </span>
        </ActionButton>

        <ActionButton @click="clearAll" :disabled="column.editingDisabled || !column.cards.length">
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
import { computed, ref } from 'vue'
import KanbanCard from './KanbanCard.vue'
import ActionButton from './UI/Buttons/ActionButton.vue'
import SortIcon from '@/components/UI/Icons/SortIcon.vue'
import DeleteColumnModal from '@/components/UI/Modals/DeleteColumnModal.vue'
import DeleteCardsModal from '@/components/UI/Modals/DeleteCardsModal.vue'
import { useModal } from '@/composables/useModal'
import LastUpdated from '@/components/LastUpdated.vue'

const { openPopup } = useModal()

const props = defineProps({
  column: { type: Object, required: true },
})

const titleRef = ref(null)
const lastValue = ref(props.column.title)

const blurTitle = () => {
  titleRef.value && titleRef.value.blur()
}
const onInput = (event) => {
  lastValue.value = event.target.innerText.trim()
}
const saveTitle = (event) => {
  const newTitle = (event?.target?.innerText || '').trim()
  if (newTitle && newTitle !== props.column.title) {
    emit('update-column', props.column.id, { title: newTitle })
  } else if (!newTitle) {
    event.target.innerText = props.column.title
  }
}

const emit = defineEmits([
  'update-column',
  'delete-column',
  'add-card',
  'update-card',
  'delete-card',
  'move-card',
  'reorder-card',
  'sort-cards',
  'clear-cards',
  'toggle-editing'
])

const newestUpdatedCard = computed(() => {
  if (!props.column.cards.length) return null
  return props.column.cards.reduce((latest, card) => {
    const latestTime = new Date(latest.updatedAt).getTime()
    const cardTime = new Date(card.updatedAt).getTime()
    return cardTime > latestTime ? card : latest
  }, props.column.cards[0])
})


const isDragOver = ref(false)
const sortDirection = computed({
  get: () => props.column.sortDirection,
  set: dir => emit('update-column', props.column.id, { sortDirection: dir })
})
const dropIndex = ref(-1)

const handleDragOver = (event) => {
  event.preventDefault()
  isDragOver.value = true

  // Вычисляем позицию drop
  calculateDropPosition(event)
}

const handleDragEnter = (event) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event) => {
  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX
  const y = event.clientY

  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    isDragOver.value = false
    dropIndex.value = -1
  }
}

const calculateDropPosition = (event) => {
  const mouseY = event.clientY
  const cardElements = event.currentTarget.querySelectorAll('.card-wrapper')

  if (cardElements.length === 0) {
    dropIndex.value = 0
    return
  }

  for (let i = 0; i < cardElements.length; i++) {
    const cardRect = cardElements[i].getBoundingClientRect()
    const cardMidPoint = cardRect.top + cardRect.height / 2

    if (mouseY < cardMidPoint) {
      dropIndex.value = i
      return
    }
  }

  // Если ниже всех карточек
  dropIndex.value = cardElements.length
}

const handleCardDragOver = (event, index) => {
  event.preventDefault()
  event.stopPropagation()

  const rect = event.currentTarget.getBoundingClientRect()
  const midPoint = rect.top + rect.height / 2

  if (event.clientY < midPoint) {
    dropIndex.value = index
  } else {
    dropIndex.value = index + 1
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false

  try {
    const data = event.dataTransfer.getData('text/plain')
    const dragData = JSON.parse(data)

    if (dragData.sourceColumnId === props.column.id) {
      // Перестановка внутри колонки
      if (dropIndex.value >= 0) {
        const currentIndex = props.column.cards.findIndex(c => c.id === dragData.cardId)

        if (currentIndex !== dropIndex.value && currentIndex !== dropIndex.value - 1) {
          emit('reorder-card', {
            columnId: props.column.id,
            cardId: dragData.cardId,
            newIndex: dropIndex.value
          })
        }
      }
    } else {
      // Перемещение между колонками
      emit('move-card', {
        cardId: dragData.cardId,
        sourceColumnId: dragData.sourceColumnId,
        targetColumnId: props.column.id,
        targetIndex: dropIndex.value >= 0 ? dropIndex.value : props.column.cards.length
      })
    }
  } catch (error) {
    console.error('Error handling drop:', error)
  }

  dropIndex.value = -1
}

const updateCard = (cardId, updates) => {
  emit('update-card', props.column.id, cardId, updates)
}

const deleteCard = (cardId) => {
  emit('delete-card', props.column.id, cardId)
}

const sortCards = () => {
  if (sortDirection.value === 'desc') {
    sortDirection.value = 'asc'
  } else {
    sortDirection.value = 'desc'
  }
  emit('sort-cards', props.column.id, sortDirection.value)
}

const clearAll = () => {
  openPopup(DeleteCardsModal, {
    onDelete: () => {
      emit('clear-cards', props.column.id)
      sortDirection.value = 'none'
    }
  })
}

const addCard = () => {
  if (props.column.editingDisabled) return
  emit('add-card', props.column.id, true)
}

const deleteColumn = () => {
  openPopup(DeleteColumnModal, {
    title: props.column.title,
    onDelete: () => {
      emit('delete-column', props.column.id)
    }
  })
}

const toggleEditing = () => {
  emit('update-column', props.column.id, { editingDisabled: !props.column.editingDisabled })
}
</script>

<style scoped lang="scss">
.kanban-column {
  background: var(--bg-column);
  border-radius: var(--border-radius);
  border: 2px dashed transparent;
  padding: var(--spacing);
  min-height: 600px;
  display: flex;
  min-width: 440px;
  width: 100%;
  flex-direction: column;
  transition: all 0.3s ease;
  &.opacity{
    background: #FBFBFD;
    & .kanban-column__title-wrapper, .last-updated, .kanban-card{
      opacity: .5;
    }
  }

}

.kanban-column__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kanban-column__title-wrapper {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  gap: calc(var(--spacing) * 0.5);
  max-width: 30%;
  & .kanban-column__title{
    word-break: break-all;
  }
}

.sort-direction{
  font-size: 12px;
  color: var(--color-text-light);
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
  margin: var(--spacing) 0 var(--spacing);
}

.card-wrapper {
  position: relative;

  //&--drop-target::before {
  //  content: '';
  //  position: absolute;
  //  top: -6px;
  //  left: 0;
  //  right: 0;
  //  height: 4px;
  //  background-color: var(--card-border-color);
  //  border-radius: 2px;
  //  z-index: 10;
  //}
}

.drop-box {
  height: 80px;
  border: 1px dashed var(--card-border-color);
  border-radius: calc(var(--spacing) * 0.5);
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

.kanban-column__sort-actions {
  margin: 10px auto 0;
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 0.5);
}
</style>
