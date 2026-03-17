const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000'

export function getStorageUrl(path) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/storage')) return `${STORAGE_URL}${path}`
  if (path.startsWith('storage')) return `${STORAGE_URL}/${path}`
  return `${STORAGE_URL}/storage/${path}`
}