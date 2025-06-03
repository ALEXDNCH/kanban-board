export function dateFormat(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60) return 'just now'
  if (diff < 3600) {
    const m = Math.floor(diff / 60)
    return `Last edit ${m} min ago`
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600)
    return `Last edit ${h} hour${h === 1 ? '' : 's'} ago`
  }
  if (diff < 2592000) {
    const d = Math.floor(diff / 86400)
    return `Last edit ${d} day${d === 1 ? '' : 's'} ago`
  }
  // Если больше месяца — показываем дату
  return 'Last edit ' + date.toLocaleDateString() + ' ' + date.toLocaleTimeString().slice(0, 5)
}
