export function formatRelativeTime(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = (now - date) / 1000

  if (diff < 60) return 'только что'
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`
  if (diff < 2592000) return `${Math.floor(diff / 86400)} дн назад`
  // Если больше — показываем дату целиком
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().slice(0, 5)
}
