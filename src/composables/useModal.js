import { reactive, markRaw } from 'vue'

const modalState = reactive({
  isOpen: false,
  component: null,
  title: '',
  props: {}
})

export function useModal() {
  const openPopup = (component, props = {}, title = '') => {
    modalState.isOpen = true
    modalState.component = markRaw(component)
    modalState.title = title
    modalState.props = props
  }

  const closePopup = () => {
    modalState.isOpen = false
    modalState.component = null
    modalState.title = ''
    modalState.props = {}
  }

  return {
    modalState,
    openPopup,
    closePopup
  }
}
