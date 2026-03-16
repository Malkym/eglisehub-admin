<template>
  <div class="fade-in">

    <div class="toolbar">
      <div class="toolbar-left">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key; loadNotifications()"
        >
          {{ tab.label }}
          <span class="tab-count" :class="{ unread: tab.key === 'non_lu' && counts.non_lu > 0 }">
            {{ tab.count }}
          </span>
        </button>
      </div>
      <div class="toolbar-right">
        <button v-if="counts.non_lu > 0" class="btn-outline" @click="markAllRead">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          Tout marquer comme lu
        </button>
        <button v-if="notifications.length > 0" class="btn-danger-outline" @click="clearRead">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          Effacer les lues
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="notif-list">
      <div v-for="i in 5" :key="i" class="notif-skeleton">
        <div class="sk-icon"></div>
        <div class="sk-lines">
          <div class="sk-line w70"></div>
          <div class="sk-line w50"></div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="notifications.length === 0" class="empty-state">
      <svg width="48" height="48" fill="none" stroke="#94A3B8" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
      </svg>
      <div class="empty-title">Aucune notification</div>
      <div class="empty-sub">Vous êtes à jour !</div>
    </div>

    <!-- Liste -->
    <div v-else class="notif-list">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        class="notif-item"
        :class="{ unread: !notif.lu }"
        @click="openNotif(notif)"
      >
        <!-- Icône type -->
        <div class="notif-icon" :style="{ background: typeConfig[notif.type]?.bg, color: typeConfig[notif.type]?.color }">
          <span v-html="typeConfig[notif.type]?.icon || typeConfig.info.icon"></span>
        </div>

        <!-- Contenu -->
        <div class="notif-body">
          <div class="notif-title">{{ notif.titre || notif.message }}</div>
          <div v-if="notif.titre" class="notif-message">{{ notif.message }}</div>
          <div class="notif-meta">
            <span class="notif-time">{{ timeAgo(notif.created_at) }}</span>
            <span v-if="notif.module" class="notif-module">{{ notif.module }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="notif-actions" @click.stop>
          <div v-if="!notif.lu" class="unread-dot"></div>
          <button class="notif-btn" @click.stop="markRead(notif)" v-if="!notif.lu" title="Marquer comme lu">
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </button>
          <button class="notif-btn delete" @click.stop="deleteNotif(notif)" title="Supprimer">
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.lastPage > 1" class="pagination">
      <button class="page-btn" :disabled="pagination.currentPage === 1"
        @click="loadNotifications(pagination.currentPage - 1)">← Précédent</button>
      <span class="page-info">{{ pagination.currentPage }} / {{ pagination.lastPage }}</span>
      <button class="page-btn" :disabled="pagination.currentPage === pagination.lastPage"
        @click="loadNotifications(pagination.currentPage + 1)">Suivant →</button>
    </div>

    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.message }}</div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

const notifications = ref([])
const loading   = ref(true)
const activeTab = ref('')
const pagination = ref({ currentPage: 1, lastPage: 1, total: 0 })
const counts    = ref({ all: 0, non_lu: 0, lu: 0 })
const toast     = ref({ show: false, type: 'success', message: '' })

const tabs = computed(() => [
  { key: '',       label: 'Toutes',   count: counts.value.all },
  { key: 'non_lu', label: 'Non lues', count: counts.value.non_lu },
  { key: 'lu',     label: 'Lues',     count: counts.value.lu },
])

const typeConfig = {
  info:    { bg: '#EFF6FF', color: '#3B82F6', icon: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>` },
  success: { bg: '#F0FDF4', color: '#16A34A', icon: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>` },
  warning: { bg: '#FFFBEB', color: '#D97706', icon: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>` },
  error:   { bg: '#FEF2F2', color: '#DC2626', icon: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>` },
  message: { bg: '#F0FDF4', color: '#16A34A', icon: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>` },
}

function timeAgo(date) {
  if (!date) return '—'
  const diff  = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'À l\'instant'
  if (mins < 60)  return `Il y a ${mins} min`
  if (hours < 24) return `Il y a ${hours}h`
  return `Il y a ${days}j`
}

async function loadNotifications(page = 1) {
  loading.value = true
  try {
    const params = { page, per_page: 20 }
    if (activeTab.value === 'non_lu') params.lu = 0
    if (activeTab.value === 'lu')     params.lu = 1

    const { data } = await api.get('/notifications', { params })
    const result = data.data
    notifications.value = result.data || []
    pagination.value = {
      currentPage: result.current_page || 1,
      lastPage:    result.last_page    || 1,
      total:       result.total        || notifications.value.length,
    }
    await loadCounts()
  } catch (e) {
    console.error('Erreur chargement notifications:', e)
    showToast('Erreur lors du chargement des notifications', 'error')
  } finally {
    loading.value = false
  }
}

async function loadCounts() {
  try {
    const response = await api.get('/notifications/unread-count')
    const count = response.data.data?.count || 0
    
    // On a besoin du total aussi
    const allResponse = await api.get('/notifications', { params: { per_page: 1 } })
    const readResponse = await api.get('/notifications', { params: { per_page: 1, lu: 1 } })
    
    counts.value = {
      all:    allResponse.data.data?.total || 0,
      non_lu: count,
      lu:     readResponse.data.data?.total || 0,
    }
  } catch (error) {
    console.error('Erreur chargement compteurs:', error)
  }
}

function openNotif(notif) {
  if (!notif.lu) markRead(notif)
  if (notif.lien) router.push(notif.lien)
}

async function markRead(notif) {
  try {
    await api.patch(`/notifications/${notif.id}/read`)
    notif.lu = true
    await loadCounts()
  } catch (error) {
    console.error('Erreur marquage lecture:', error)
  }
}

async function markAllRead() {
  try {
    await api.post('/notifications/mark-all-read')
    notifications.value.forEach(n => { n.lu = true })
    await loadCounts()
    showToast('Toutes les notifications marquées comme lues', 'success')
  } catch (error) {
    console.error('Erreur marquage tout lu:', error)
    showToast('Erreur lors du marquage', 'error')
  }
}

async function clearRead() {
  try {
    await api.delete('/notifications/clear-read')
    notifications.value = notifications.value.filter(n => !n.lu)
    showToast('Notifications lues supprimées', 'success')
    await loadCounts()
  } catch (error) {
    console.error('Erreur suppression notifications lues:', error)
    showToast('Erreur lors de la suppression', 'error')
  }
}

async function deleteNotif(notif) {
  try {
    await api.delete(`/notifications/${notif.id}`)
    notifications.value = notifications.value.filter(n => n.id !== notif.id)
    await loadCounts()
    showToast('Notification supprimée', 'success')
  } catch (error) {
    console.error('Erreur suppression notification:', error)
    showToast('Erreur lors de la suppression', 'error')
  }
}

function showToast(message, type = 'success') {
  toast.value = { show: true, type, message }
  setTimeout(() => { toast.value.show = false }, 2500)
}

onMounted(() => {
  loadNotifications()
})
</script>

<style scoped>
.toolbar {
  display: flex; align-items: center;
  justify-content: space-between; margin-bottom: 16px;
  gap: 12px; flex-wrap: wrap;
}
.toolbar-left  { display: flex; gap: 4px; flex-wrap: wrap; }
.toolbar-right { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

.tab-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 8px;
  border: 1px solid transparent; background: transparent;
  font-size: 13px; color: #64748B; cursor: pointer;
  transition: all .12s;
}
.tab-btn:hover { background: #F1F5F9; }
.tab-btn.active {
  background: #fff; border-color: #E2E8F0;
  color: #0F172A; font-weight: 500;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
}
.tab-count {
  background: #F1F5F9; color: #64748B;
  font-size: 11px; padding: 1px 6px; border-radius: 10px;
}
.tab-count.unread { background: #FEE2E2; color: #DC2626; }

.btn-outline {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; border: 1px solid #E2E8F0;
  border-radius: 8px; background: #fff;
  font-size: 13px; color: #374151; cursor: pointer;
  transition: all .12s;
}
.btn-outline:hover { border-color: #3B82F6; color: #1D4ED8; }
.btn-danger-outline {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; border: 1px solid #FECACA;
  border-radius: 8px; background: #FEF2F2;
  font-size: 13px; color: #DC2626; cursor: pointer;
  transition: all .12s;
}
.btn-danger-outline:hover { background: #FEE2E2; }

/* Notif list */
.notif-list {
  background: #fff; border: 1px solid #E2E8F0;
  border-radius: 12px; overflow: hidden;
}
.notif-item {
  display: flex; align-items: flex-start;
  gap: 14px; padding: 16px 18px;
  border-bottom: 1px solid #F8FAFC;
  cursor: pointer; transition: background .1s;
  position: relative;
}
.notif-item:last-child { border-bottom: none; }
.notif-item:hover { background: #FAFBFC; }
.notif-item.unread { background: #FAFBFF; border-left: 3px solid #3B82F6; }

.notif-icon {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.notif-body { flex: 1; min-width: 0; }
.notif-title { font-size: 14px; font-weight: 500; color: #0F172A; margin-bottom: 2px; }
.notif-item.unread .notif-title { font-weight: 600; }
.notif-message { font-size: 13px; color: #64748B; margin-bottom: 6px; line-height: 1.5; }
.notif-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.notif-time { font-size: 11px; color: #94A3B8; }
.notif-module {
  font-size: 10px; font-weight: 600;
  padding: 1px 6px; border-radius: 10px;
  background: #F1F5F9; color: #64748B;
  text-transform: uppercase; letter-spacing: .05em;
}

.notif-actions {
  display: flex; align-items: center; gap: 6px; flex-shrink: 0;
}
.unread-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #3B82F6; flex-shrink: 0;
}
.notif-btn {
  width: 28px; height: 28px; border-radius: 6px;
  border: none; background: #F1F5F9; color: #64748B;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .1s; opacity: 0;
}
.notif-item:hover .notif-btn { opacity: 1; }
.notif-btn:hover { background: #E2E8F0; }
.notif-btn.delete { color: #DC2626; background: #FEF2F2; }
.notif-btn.delete:hover { background: #FEE2E2; }

/* Skeleton */
.notif-skeleton {
  display: flex; gap: 14px; align-items: center;
  padding: 16px 18px; border-bottom: 1px solid #F8FAFC;
}
.sk-icon {
  width: 40px; height: 40px; border-radius: 10px;
  background: #F1F5F9; flex-shrink: 0; animation: shimmer 1.5s infinite;
}
.sk-lines { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.sk-line {
  height: 12px; border-radius: 6px; background: #F1F5F9;
  animation: shimmer 1.5s infinite;
}
.w70 { width: 70%; }
.w50 { width: 50%; }
@keyframes shimmer { 0%,100% { opacity: 1; } 50% { opacity: .5; } }

/* Empty */
.empty-state {
  display: flex; flex-direction: column;
  align-items: center; gap: 12px;
  padding: 60px; text-align: center;
  background: #fff; border: 1px solid #E2E8F0; border-radius: 12px;
}
.empty-title { font-size: 18px; font-weight: 600; color: #0F172A; }
.empty-sub   { font-size: 14px; color: #94A3B8; }

/* Pagination */
.pagination {
  display: flex; align-items: center;
  justify-content: space-between; margin-top: 16px;
}
.page-btn {
  padding: 8px 16px; border: 1px solid #E2E8F0;
  border-radius: 8px; background: #fff;
  font-size: 13px; color: #374151; cursor: pointer;
}
.page-btn:disabled { opacity: .4; cursor: not-allowed; }
.page-info { font-size: 13px; color: #64748B; }

/* Toast */
.toast {
  position: fixed; bottom: 24px; right: 24px;
  padding: 12px 18px; border-radius: 10px;
  font-size: 13px; font-weight: 500; z-index: 200;
  box-shadow: 0 4px 20px rgba(0,0,0,.15);
}
.toast.success { background: #0F172A; color: #fff; }
.toast.error   { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }
.toast-enter-active, .toast-leave-active { transition: all .3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }
</style>