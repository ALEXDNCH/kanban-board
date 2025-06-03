import { reactive, watch } from 'vue'
import { getLocalStorage, setLocalStorage } from '@/utils/localStorage'
import { STORAGE_KEYS } from '@/utils/constants'

const DEFAULT_COLUMNS = [
  { id: 0, title: 'TODO', cards: [], editingDisabled: false, sortDirection: 'none' },
  { id: 1, title: 'IN PROGRESS', cards: [], editingDisabled: false, sortDirection: 'none' },
  { id: 2, title: 'DONE', cards: [], editingDisabled: false, sortDirection: 'none' }
]
export function useKanbanStorage() {
  const boardState = reactive({
    columns: getLocalStorage(STORAGE_KEYS.KANBAN_BOARD) || DEFAULT_COLUMNS,
  })

  watch(
    () => boardState.columns,
    (newColumns) => {
      setLocalStorage(STORAGE_KEYS.KANBAN_BOARD, newColumns)
    },
    { deep: true }
  )

  return {
    boardState
  }
}
