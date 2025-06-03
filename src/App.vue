<template>
  <KanbanBoard/>
  <BaseModal
    v-model="modalState.isOpen"
    @close="closePopup"
  >
    <component
      :is="modalState.component"
      v-bind="modalState.props"
      @close="closePopup"
    />
  </BaseModal>
</template>


<script setup>
import KanbanBoard from '@/components/KanbanBoard.vue'
import BaseModal from '@/components/UI/Modals/BaseModal.vue'
import { useModal } from '@/composables/useModal'

const { modalState, closePopup } = useModal()
</script>


