import { formatDistanceToNow, format, differenceInDays } from 'date-fns'

export function formatDate(date) {
  if (!date) return '—'
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch {
    return '—'
  }
}

export function formatFullDate(date) {
  if (!date) return '—'
  try {
    return format(new Date(date), 'MMM dd, yyyy')
  } catch {
    return '—'
  }
}

export function formatDateTime(date) {
  if (!date) return '—'
  try {
    return format(new Date(date), 'MMM dd, yyyy HH:mm')
  } catch {
    return '—'
  }
}

export function formatDuration(seconds) {
  if (seconds === null || seconds === undefined) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function formatNumber(n) {
  if (n === null || n === undefined) return '0'
  return Number(n).toLocaleString()
}

export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getDaysLeft(expiresAt) {
  if (!expiresAt) return null
  try {
    return differenceInDays(new Date(expiresAt), new Date())
  } catch {
    return null
  }
}

export function getAvatarColor(name) {
  if (!name) return '#7c3aed'
  const colors = [
    '#7c3aed', '#3b82f6', '#22c55e', '#ef4444',
    '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
