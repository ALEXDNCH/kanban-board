<template>
  <header class="modal-header">
    <h2 class="modal-title">Удаление колонки</h2>
  </header>

  <div class="modal-content-body">
    <p>
      Вы уверены, что хотите удалить колонку "{{ title }}"?
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
  title: String,
  onDelete: Function
})

const emit = defineEmits(['close'])

const handleDelete = () => {
  props.onDelete?.()
  emit('close')
}
</script>

