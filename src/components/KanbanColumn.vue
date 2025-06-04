<template>
  <div
    class="kanban-column"
    :class="{
    'kanban-column--drag-over': isDragOver,
    'kanban-column--blocked-drag': isDragOver && column.editingDisabled,
    'opacity': column.editingDisabled
  }"
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
          @blur="onBlur"
          @keydown.enter="onEnter"
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
          draggable="true"
          @dragstart="onCardDragStart(card)"
          @dragend="onCardDragEnd"
          @dragover="(e)=>onCardDragOver(e, index)"
        />
      </div>
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
      <div class="footer-spacer"></div>
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
            {{sortDirection === 'desc' ? 'Descending' : 'Ascending'}}
          </span>
        </ActionButton>

        <ActionButton @click="clearAll" :disabled="column.editingDisabled || !column.cards.length">
          <template #icon>
            <img src="@/assets/images/clear.svg" alt="Clear">
          </template>
          Clear All
        </ActionButton>
      </div>
      <div class="arrow-btn__wrapper">
        <ActionButton
          class="arrow-btn"
          @click="$emit('move-left')"
          :disabled="isFirst || column.editingDisabled"
        >
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 5l-7 7 7 7"/></svg>
          </template>
        </ActionButton>
        <ActionButton
          class="arrow-btn"
          @click="$emit('move-right')"
          :disabled="isLast || column.editingDisabled"
        >
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M8.5 19l7-7-7-7"/></svg>
          </template>
        </ActionButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import KanbanCard from './KanbanCard.vue'
import ActionButton from './UI/Buttons/ActionButton.vue'
import SortIcon from '@/components/UI/Icons/SortIcon.vue'
import ConfirmModal from '@/components/UI/Modals/ConfirmModal.vue'
import { useModal } from '@/composables/useModal'
import LastUpdated from '@/components/LastUpdated.vue'

const { openPopup } = useModal()

const props = defineProps({
  column: { type: Object, required: true },
  isFirst: Boolean,
  isLast: Boolean,
  index: Number,
})

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
  'toggle-editing',
  'move-left',
  'move-right'
])

const titleRef = ref(null)
const originalTitle = ref(props.column.title)

watch(() => props.column.title, val => { originalTitle.value = val })

const blurTitle = () => { titleRef.value && titleRef.value.blur() }

const onBlur = (e) => {
  const current = (e?.target?.innerText || '').trim()
  if (current && current !== originalTitle.value) {
    // Не сохраняем, сбрасываем к оригиналу
    e.target.innerText = originalTitle.value
  }
}

const onEnter = (e) => {
  e.preventDefault()
  const newTitle = (titleRef.value?.innerText || '').trim()
  if (newTitle && newTitle !== originalTitle.value) {
    emit('update-column', props.column.id, { title: newTitle })
    originalTitle.value = newTitle
  }
  blurTitle()
}

const newestUpdatedCard = computed(() => {
  if (!props.column.cards.length) return null
  return props.column.cards.reduce((latest, card) => {
    const latestTime = new Date(latest.updatedAt).getTime()
    const cardTime = new Date(card.updatedAt).getTime()
    return cardTime > latestTime ? card : latest
  }, props.column.cards[0])
})

const dragCardId = ref(null);

const onCardDragStart = (card) => {
  dragCardId.value = card.id;
};

const onCardDragEnd = () => {
  dragCardId.value = null;
};

const onCardDragOver = (event, idx) => {
  if (props.column.editingDisabled || !dragCardId.value) return;

  const draggedId = dragCardId.value;
  if (draggedId === props.column.cards[idx].id) return;

  const cardRect = event.target.getBoundingClientRect();
  const offset = event.clientY - cardRect.top;
  const half = cardRect.height / 2;
  let newIndex = idx;
  if (offset > half) {
    newIndex += 1;
  }

  const currentIndex = props.column.cards.findIndex(c => c.id === draggedId);
  if (currentIndex !== newIndex && currentIndex !== newIndex - 1) {
    emit('reorder-card', {
      columnId: props.column.id,
      cardId: draggedId,
      newIndex
    });
    dragCardId.value = null; // иначе карточка дрожит
  }
};



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
  openPopup(ConfirmModal, {
    title: 'Очистить все задания',
    body: `Вы уверены, что хотите очистить все задания в колонке "${props.column.title}"?`,
    okText: 'Очистить',
    onOk: () => {
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
  openPopup(ConfirmModal, {
    title: 'Удаление колонки',
    body: `Вы уверены, что хотите удалить колонку "${props.column.title}"?`,
    onOk: () => emit('delete-column', props.column.id)
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
  min-height: 400px;
  max-height: 600px;
  display: flex;
  min-width: 440px;
  width: 100%;
  flex-direction: column;
  transition: all 0.3s ease;
  &--drag-over {
    border-color: var(--card-border-color);
  }
  &.opacity{
    background: #FBFBFD;
    & .kanban-column__title-wrapper, .last-updated, .kanban-card{
      opacity: .5;
    }
  }
  &--blocked-drag {
    border-color: var(--color-red);
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
  margin: var(--spacing) 0 calc(var(--spacing) * 0.5);
  max-height: 70%;
  overflow: auto;
}

.card-wrapper {
  position: relative;

  &--drop-target::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 4px;
    background-color: var(--card-border-color);
    border-radius: 2px;
    z-index: 10;
  }
}


.kanban-column__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 0.5);
  margin-top: auto;
  padding-top: 10px;
}


.footer-spacer {
  flex: 0.3;
}

.arrow-btn__wrapper{
  display: flex;
  flex: 0.3;
  align-items: center;
  gap: 1px;
}

.full-width {
  width: 100%;
}

.kanban-column__sort-actions {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: calc(var(--spacing) * 0.5);
}
</style>
