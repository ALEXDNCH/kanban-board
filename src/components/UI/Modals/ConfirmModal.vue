<template>
  <header class="modal-header">
    <h2 class="modal-title">{{ title }}</h2>
  </header>
  <div class="modal-content-body">
    <p v-if="body">{{ body }}</p>
    <slot v-else />
  </div>
  <footer class="modal-footer">
    <div class="buttons">
      <button class="btn btn--danger" @click="handleOk">{{ okText }}</button>
      <button class="btn" @click="$emit('close')">{{ cancelText }}</button>
    </div>
  </footer>
</template>

<script setup>
const props = defineProps({
  title: { type: String, default: 'Confirm' },
  body: { type: String, default: '' },
  okText: { type: String, default: 'Удалить' },
  cancelText: { type: String, default: 'Отмена' },
  onOk: Function
})
const emit = defineEmits(['close'])

function handleOk() {
  props.onOk?.()
  emit('close')
}
</script>
