<template>
  <div class="topbar">
    <div class="topbar-left">
      <div class="topbar-title">{{ pageTitle }}</div>
    </div>
    <div class="topbar-right">

      <!-- Cloche notifications -->
      <div class="notif-wrap" ref="notifRef">
        <button class="icon-btn" @click="toggleNotifPanel">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
        </button>

        <!-- Panel dropdown -->
        <div v-if="showNotifPanel" class="notif-panel">
          <div class="notif-panel-header">
            <span>Notifications</span>
            <button v-if="unreadCount > 0" class="mark-all-btn" @click="markAllRead">
              Tout marquer lu
            </button>
          </div>
          <div v-if="recentNotifs.length === 0" class="notif-panel-empty">
            <div style="font-size:28px; margin-bottom:8px">🔔</div>
            Aucune notification
          </div>
          <div v-else class="notif-panel-list">
            <div
              v-for="n in recentNotifs"
              :key="n.id"
              class="notif-panel-item"
              :class="{ unread: !n.lu }"
              @click="openNotif(n)"
            >
              <div class="notif-panel-icon" :class="`type-${n.type || 'info'}`">
                {{ notifEmoji[n.type] || '🔔' }}
              </div>
              <div class="notif-panel-body">
                <div class="notif-panel-title">{{ n.titre || n.message }}</div>
                <div class="notif-panel-time">{{ timeAgo(n.created_at) }}</div>
              </div>
              <div v-if="!n.lu" class="notif-panel-dot"></div>
            </div>
          </div>
          <RouterLink to="/notifications" class="notif-panel-footer" @click="showNotifPanel = false">
            Voir toutes les notifications →
          </RouterLink>
        </div>
      </div>

      <!-- Avatar utilisateur -->
      <div class="user-wrap" ref="userRef">
        <button class="user-btn" @click="toggleUserMenu">
          <div class="user-avatar" :style="{ background: getColor(auth.user?.name) }">
            {{ initials }}
          </div>
        </button>
        <div v-if="showUserMenu" class="user-menu">
          <div class="user-menu-header">
            <div class="user-menu-name">{{ auth.user?.name }} {{ auth.user?.prenom }}</div>
            <div class="user-menu-email">{{ auth.user?.email }}</div>
            <div class="user-menu-role">{{ auth.isSuperAdmin ? 'Super Admin' : 'Admin Ministère' }}</div>
          </div>
          <div class="user-menu-divider"></div>
          <RouterLink to="/profile" class="user-menu-item" @click="showUserMenu = false">
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Mon profil
          </RouterLink>
          <RouterLink to="/settings" class="user-menu-item" @click="showUserMenu = false">
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            Paramètres
          </RouterLink>
          <div class="user-menu-divider"></div>
          <button class="user-menu-item danger" @click="logout">
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const auth   = useAuthStore()
const route  = useRoute()
const router = useRouter()

const unreadCount      = ref(0)
const recentNotifs     = ref([])
const showNotifPanel   = ref(false)
const showUserMenu     = ref(false)
const notifRef         = ref(null)
const userRef          = ref(null)
let   pollTimer        = null

const notifEmoji = {
  info: '💬', success: '✅', warning: '⚠️',
  error: '❌', message: '📩', don: '💰',
}

const pageTitles = {
  '/dashboard':          'Tableau de bord',
  '/pages':              'Pages',
  '/articles':           'Articles',
  '/events':             'Événements',
  '/media':              'Médias',
  '/messages':           'Messages',
  '/faq':                'FAQ',
  '/sliders':            'Sliders',
  '/settings':           'Paramètres',
  '/users':              'Utilisateurs',
  '/admin/ministeres':   'Ministères',
  '/notifications':      'Notifications',
  '/profile':            'Mon profil',
  '/logs':               'Logs système',
}
const pageTitle = computed(() => pageTitles[route.path] || 'EgliseHub')

const initials = computed(() => {
  const n = auth.user?.name?.[0]   || ''
  const p = auth.user?.prenom?.[0] || ''
  return (n + p).toUpperCase()
})

const avatarColors = ['#1E3A8A','#DC2626','#D97706','#16A34A','#7C3AED','#0369A1']
function getColor(name) {
  let hash = 0
  for (const c of (name || '')) hash = c.charCodeAt(0) + ((hash << 5) - hash)
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

function timeAgo(date) {
  if (!date) return ''
  const diff  = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  if (mins < 1)   return 'À l\'instant'
  if (mins < 60)  return `${mins}min`
  if (hours < 24) return `${hours}h`
  return `${Math.floor(diff / 86400000)}j`
}

function toggleNotifPanel() {
  showNotifPanel.value = !showNotifPanel.value
  showUserMenu.value   = false
  if (showNotifPanel.value) fetchNotifs()
}

function toggleUserMenu() {
  showUserMenu.value   = !showUserMenu.value
  showNotifPanel.value = false
}

async function fetchUnreadCount() {
  try {
    const { data } = await api.get('/notifications/unread-count')
    const newCount = data.data?.count || 0
    
    // Son uniquement pour les nouveaux messages de contact (priorité haute)
    if (newCount > unreadCount.value && unreadCount.value !== 0) {
      // Vérifier si ce sont des messages de contact
      const { data: notifs } = await api.get('/notifications', { 
        params: { per_page: 1, lu: 0, type: 'message' }
      })
      if (notifs.data?.total > 0) {
        playNotifSound()
        // Afficher une notification toast
        showToast('Nouveau message reçu !', 'info')
      }
    }
    unreadCount.value = newCount
  } catch {}
}

async function fetchNotifs() {
  try {
    const { data } = await api.get('/notifications', {
      params: { per_page: 8 }
    })
    recentNotifs.value = data.data?.data || []
  } catch {}
}

function playNotifSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.3)
  } catch {}
}

async function markAllRead() {
  try {
    await api.post('/notifications/mark-all-read')
    unreadCount.value = 0
    recentNotifs.value.forEach(n => { n.lu = true })
  } catch {}
}

function openNotif(notif) {
  if (!notif.lu) {
    api.patch(`/notifications/${notif.id}/read`).catch(() => {})
    notif.lu = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  }
  showNotifPanel.value = false
  if (notif.lien) router.push(notif.lien)
}

async function logout() {
  try { await api.post('/logout') } catch {}
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

// Fermer panels en cliquant dehors
function onClickOutside(e) {
  if (notifRef.value && !notifRef.value.contains(e.target)) {
    showNotifPanel.value = false
  }
  if (userRef.value && !userRef.value.contains(e.target)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  fetchUnreadCount()
  fetchNotifs()
  pollTimer = setInterval(fetchUnreadCount, 30000)
  document.addEventListener('click', onClickOutside)
})
onUnmounted(() => {
  clearInterval(pollTimer)
  document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.topbar {
  height: 60px; background: #fff;
  border-bottom: 1px solid #F1F5F9;
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 0 24px; flex-shrink: 0;
}
.topbar-title {
  font-size: 16px; font-weight: 600; color: #0F172A;
  font-family: 'Sora', system-ui, sans-serif;
}
.topbar-right { display: flex; align-items: center; gap: 8px; }

/* Notif */
.notif-wrap { position: relative; }
.icon-btn {
  width: 36px; height: 36px; border-radius: 9px;
  border: none; background: #F8FAFC; color: #64748B;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .15s; position: relative;
}
.icon-btn:hover { background: #F1F5F9; color: #374151; }
.notif-badge {
  position: absolute; top: -4px; right: -4px;
  background: #DC2626; color: #fff;
  font-size: 9px; font-weight: 700;
  min-width: 16px; height: 16px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  padding: 0 4px; border: 2px solid #fff;
}

.notif-panel {
  position: absolute; top: calc(100% + 10px); right: 0;
  width: 340px; background: #fff;
  border: 1px solid #E2E8F0; border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,.12); z-index: 200;
  overflow: hidden;
}
.notif-panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; border-bottom: 1px solid #F1F5F9;
  font-size: 14px; font-weight: 600; color: #0F172A;
}
.mark-all-btn {
  font-size: 11px; color: #3B82F6; background: none;
  border: none; cursor: pointer; font-weight: 500;
}
.notif-panel-empty {
  padding: 32px; text-align: center;
  font-size: 13px; color: #94A3B8;
}
.notif-panel-list { max-height: 320px; overflow-y: auto; }
.notif-panel-item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 12px 16px; border-bottom: 1px solid #F8FAFC;
  cursor: pointer; transition: background .1s; position: relative;
}
.notif-panel-item:hover { background: #F8FAFC; }
.notif-panel-item.unread { background: #FAFBFF; }
.notif-panel-icon {
  width: 36px; height: 36px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; flex-shrink: 0; background: #F1F5F9;
}
.notif-panel-body { flex: 1; min-width: 0; }
.notif-panel-title {
  font-size: 13px; font-weight: 500; color: #0F172A;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-bottom: 2px;
}
.notif-panel-time { font-size: 11px; color: #94A3B8; }
.notif-panel-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #3B82F6; flex-shrink: 0; margin-top: 4px;
}
.notif-panel-footer {
  display: block; padding: 12px 16px; text-align: center;
  font-size: 13px; color: #3B82F6; font-weight: 500;
  border-top: 1px solid #F1F5F9; transition: background .1s;
}
.notif-panel-footer:hover { background: #F8FAFC; }

/* User menu */
.user-wrap { position: relative; }
.user-btn {
  background: none; border: none; cursor: pointer; padding: 0;
}
.user-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: #fff;
}
.user-menu {
  position: absolute; top: calc(100% + 10px); right: 0;
  width: 240px; background: #fff;
  border: 1px solid #E2E8F0; border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0,0,0,.12); z-index: 200;
  overflow: hidden;
}
.user-menu-header { padding: 14px 16px; }
.user-menu-name   { font-size: 14px; font-weight: 600; color: #0F172A; }
.user-menu-email  { font-size: 12px; color: #64748B; margin-top: 2px; }
.user-menu-role   {
  display: inline-flex; margin-top: 6px;
  padding: 2px 8px; border-radius: 20px;
  background: #EEF2FF; color: #4338CA;
  font-size: 10px; font-weight: 600;
}
.user-menu-divider { height: 1px; background: #F1F5F9; }
.user-menu-item {
  display: flex; align-items: center; gap: 10px;
  padding: 11px 16px; font-size: 13px; color: #374151;
  cursor: pointer; transition: background .1s;
  background: none; border: none; width: 100%; text-align: left;
  text-decoration: none;
}
.user-menu-item:hover { background: #F8FAFC; }
.user-menu-item.danger { color: #DC2626; }
.user-menu-item.danger:hover { background: #FEF2F2; }
</style>