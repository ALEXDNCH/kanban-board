<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="modal-overlay"
        role="dialog"
        aria-modal="true"
        @click="closeOnOverlay"
      >
        <div
          class="modal-content"
          role="document"
          @click.stop
          ref="modalContent"
          tabindex="-1"
        >
          <div class="modal-wrapper">
            <slot/>
          </div>
          <button class="modal-close" @click="close">×</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch, computed, ref, nextTick, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  closeOnOverlay: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'close'])

const modalContent = ref(null)
let previousActiveElement = null

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const close = () => {
  isOpen.value = false
  emit('close')
}

const closeOnOverlay = () => {
  if (props.closeOnOverlay) close()
}

const trapFocus = (e) => {
  if (!modalContent.value) return

  const focusableElements = modalContent.value.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (e.key === 'Tab') {
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault()
      lastElement?.focus()
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault()
      firstElement?.focus()
    }
  }
}

const handleKeydown = (e) => {
  if (e.key === 'Escape' && isOpen.value) {
    close()
  }
  if (isOpen.value) {
    trapFocus(e)
  }
}

watch(isOpen, async (value) => {
  if (value) {
    previousActiveElement = document.activeElement
    document.addEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'hidden'
    await nextTick()
    modalContent.value?.focus()
  } else {
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
    previousActiveElement?.focus()
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
  document.body.removeAttribute('aria-hidden')
})
</script>

<style>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  outline: none;
  padding: var(--spacing);
  position: relative;
}

.modal-wrapper {
  width: 400px;
  max-width: 90vw;
}

.modal-header {
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  border-radius: 4px;
  padding: 0.25rem;
  position: absolute;
  top: 5px;
  right: 5px;
  &:hover {
    color: #333;
  }
}

.modal-content-body {
  margin-top: calc(var(--spacing) * 0.75);
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  margin-top: calc(var(--spacing) * 1.5);
  justify-content: flex-end;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
