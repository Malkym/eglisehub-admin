import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user  = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)
  const isSuperAdmin    = computed(() => user.value?.role === 'super_admin')
  const isAdminMinistere = computed(() => user.value?.role === 'admin_ministere')
  const ministereId     = computed(() => user.value?.ministere_id)
  const currentMinistereId = computed(() => {
  // Super admin peut passer ministere_id en paramètre
  // Par défaut on utilise son ministere_id ou 1
  return user.value?.ministere_id || null
})

  async function login(email, password) {
    const { data } = await api.post('/login', { email, password })
    token.value = data.token
    user.value  = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  }

  async function logout() {
    try { await api.post('/logout') } catch {}
    token.value = null
    user.value  = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  async function fetchMe() {
    const { data } = await api.get('/me')
    user.value = data.user
    localStorage.setItem('user', JSON.stringify(data.user))
    return data.user
  }

  return {
    token, user,
    isAuthenticated, isSuperAdmin, isAdminMinistere, ministereId,
    login, logout, fetchMe, currentMinistereId,
  }
})