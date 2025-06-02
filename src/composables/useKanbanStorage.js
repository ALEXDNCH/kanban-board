import { reactive, watch } from 'vue'
import { getLocalStorage, setLocalStorage } from '@/utils/localStorage'
import { STORAGE_KEYS } from '@/utils/constants'

const DEFAULT_COLUMNS = [
  { id: 0, title: 'TODO', cards: [] },
  { id: 1, title: 'In progress', cards: [] },
  { id: 2, title: 'Done', cards: [] }
]

export function useKanbanStorage() {
  const boardState = reactive({
    columns: getLocalStorage(STORAGE_KEYS.KANBAN_BOARD) || DEFAULT_COLUMNS,
    editingDisabled: getLocalStorage(STORAGE_KEYS.EDITING_DISABLED) || false
  })

  // Автоматически сохраняем изменения в localStorage
  watch(
    () => boardState.columns,
    (newColumns) => {
      setLocalStorage(STORAGE_KEYS.KANBAN_BOARD, newColumns)
    },
    { deep: true }
  )

  watch(
    () => boardState.editingDisabled,
    (newValue) => {
      setLocalStorage(STORAGE_KEYS.EDITING_DISABLED, newValue)
    }
  )

  return {
    boardState
  }
}
