<template>
  <header class="modal-header">
    <h2 class="modal-title">Удаление текущего задания</h2>
  </header>

  <div class="modal-content-body">
    <p>
      Вы уверены, что хотите удалить текущее задание?
    </p>
  </div>

  <footer class="modal-footer">
    <div class="buttons">
      <button class="btn btn--danger" @click="handleDelete">
        Удалить
      </button>
      <button class="btn" @click="$emit('close')">
        Отмена
      </button>
    </div>
  </footer>
</template>

<script setup>
const props = defineProps({
  onDelete: Function
})

const emit = defineEmits(['close'])

const handleDelete = () => {
  props.onDelete?.()
  emit('close')
}
</script>

