<template>
  <div class="fade-in messages-layout">

    <!-- Liste messages -->
    <div class="messages-list">

      <!-- Header liste -->
      <div class="list-header">
        <div class="list-header-top">
          <span class="list-title">Messages</span>
          <span class="unread-badge" v-if="unreadCount > 0">{{ unreadCount }} non lus</span>
        </div>
        <div class="list-filters">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="filter-tab"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key; loadMessages()"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="list-search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="search" placeholder="Rechercher..." @input="debouncedSearch" />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="list-loading">
        <div v-for="i in 6" :key="i" class="msg-skeleton">
          <div class="sk-avatar"></div>
          <div class="sk-lines">
            <div class="sk-line w70"></div>
            <div class="sk-line w50"></div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="messages.length === 0" class="list-empty">
        <div class="list-empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div class="list-empty-text">Aucun message</div>
      </div>

      <!-- Items -->
      <div v-else class="list-items">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="msg-item"
          :class="{
            active: selectedMsg?.id === msg.id,
            unread: msg.statut === 'non_lu'
          }"
          @click="openMessage(msg)"
        >
          <div class="msg-item-avatar" :style="{ background: getAvatarColor(msg.nom_expediteur) }">
            {{ msg.nom_expediteur[0].toUpperCase() }}
          </div>
          <div class="msg-item-body">
            <div class="msg-item-top">
              <span class="msg-item-name">{{ msg.nom_expediteur }}</span>
              <span class="msg-item-time">{{ timeAgo(msg.created_at) }}</span>
            </div>
            <div class="msg-item-subject">{{ msg.sujet || 'Sans objet' }}</div>
            <div class="msg-item-preview">{{ msg.message?.substring(0, 60) }}...</div>
          </div>
          <div v-if="msg.statut === 'non_lu'" class="unread-dot"></div>
        </div>
      </div>

      <!-- Pagination simple -->
      <div v-if="pagination.lastPage > 1" class="list-pagination">
        <button :disabled="pagination.currentPage === 1" @click="loadMessages(pagination.currentPage - 1)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span>{{ pagination.currentPage }} / {{ pagination.lastPage }}</span>
        <button :disabled="pagination.currentPage === pagination.lastPage" @click="loadMessages(pagination.currentPage + 1)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Détail message -->
    <div class="message-detail">

      <!-- Aucun message sélectionné -->
      <div v-if="!selectedMsg" class="detail-empty">
        <div class="detail-empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div class="detail-empty-title">Sélectionnez un message</div>
        <div class="detail-empty-sub">Cliquez sur un message pour le lire</div>
      </div>

      <!-- Message sélectionné -->
      <div v-else class="detail-content">

        <!-- Header -->
        <div class="detail-header">
          <div class="detail-sender">
            <div class="detail-avatar" :style="{ background: getAvatarColor(selectedMsg.nom_expediteur) }">
              {{ selectedMsg.nom_expediteur[0].toUpperCase() }}
            </div>
            <div class="detail-sender-info">
              <div class="detail-sender-name">{{ selectedMsg.nom_expediteur }}</div>
              <div class="detail-sender-email">
                <a :href="`mailto:${selectedMsg.email}`" class="email-link">{{ selectedMsg.email }}</a>
                <span v-if="selectedMsg.telephone"> · {{ selectedMsg.telephone }}</span>
              </div>
            </div>
          </div>
          <div class="detail-header-actions">
            <span class="detail-date">{{ formatDate(selectedMsg.created_at) }}</span>
            <span class="badge" :class="statusBadge[selectedMsg.statut]">
              {{ statusLabels[selectedMsg.statut] }}
            </span>
            <button
              class="icon-btn"
              @click="toggleRead(selectedMsg)"
              :title="selectedMsg.statut === 'non_lu' ? 'Marquer comme lu' : 'Marquer non lu'"
            >
              <svg v-if="selectedMsg.statut === 'non_lu'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
            <button class="icon-btn danger" @click="confirmDelete(selectedMsg)" title="Supprimer">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Sujet -->
        <div class="detail-subject">
          {{ selectedMsg.sujet || 'Sans objet' }}
        </div>

        <!-- Corps -->
        <div class="detail-body">
          {{ selectedMsg.message }}
        </div>

        <!-- Réponses existantes -->
        <div v-if="selectedMsg.reponses?.length > 0" class="replies-section">
          <div class="replies-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            {{ selectedMsg.reponses.length }} réponse(s)
          </div>
          <div v-for="rep in selectedMsg.reponses" :key="rep.id" class="reply-item">
            <div class="reply-header">
              <span class="reply-author">Vous</span>
              <span class="reply-date">{{ formatDate(rep.created_at) }}</span>
            </div>
            <div class="reply-body">{{ rep.contenu }}</div>
          </div>
        </div>

        <!-- Formulaire de réponse -->
        <div class="reply-form">
          <div class="reply-form-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Répondre à {{ selectedMsg.nom_expediteur }}
          </div>
          <textarea
            v-model="replyText"
            class="reply-textarea"
            :placeholder="`Bonjour ${selectedMsg.nom_expediteur}, merci pour votre message...`"
            rows="5"
          ></textarea>
          <div class="reply-actions">
            <span class="reply-hint">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              La réponse sera envoyée à {{ selectedMsg.email }}
            </span>
            <button
              class="btn-primary"
              @click="sendReply"
              :disabled="!replyText.trim() || replying"
            >
              <span v-if="replying" class="spinner-sm"></span>
              <span v-else>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Envoyer
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- Modal suppression -->
    <Teleport to="body">
      <div v-if="deleteModal.show" class="modal-overlay" @click.self="deleteModal.show = false">
        <div class="modal">
          <div class="modal-icon danger">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div class="modal-title">Supprimer ce message ?</div>
          <div class="modal-sub">De {{ deleteModal.msg?.nom_expediteur }}</div>
          <div class="modal-actions">
            <button class="btn-secondary" @click="deleteModal.show = false">Annuler</button>
            <button class="btn-danger" :disabled="deleteModal.loading" @click="deleteMessage">
              <span v-if="!deleteModal.loading">Supprimer</span>
              <span v-else class="spinner-sm"></span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path v-if="toast.type === 'success'" stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        {{ toast.message }}
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const auth = useAuthStore()

const messages    = ref([])
const loading     = ref(true)
const search      = ref('')
const activeTab   = ref('')
const selectedMsg = ref(null)
const replyText   = ref('')
const replying    = ref(false)
const pagination  = ref({ currentPage: 1, lastPage: 1, total: 0 })
const deleteModal = ref({ show: false, msg: null, loading: false })
const toast       = ref({ show: false, type: 'success', message: '' })

const unreadCount = computed(() =>
  messages.value.filter(m => m.statut === 'non_lu').length
)

const tabs = [
  { key: '',         label: 'Tous' },
  { key: 'non_lu',   label: 'Non lus' },
  { key: 'lu',       label: 'Lus' },
  { key: 'repondu',  label: 'Répondus' },
]

const statusLabels = {
  non_lu: 'Non lu', lu: 'Lu', repondu: 'Répondu',
}
const statusBadge = {
  non_lu:  'badge-blue',
  lu:      'badge-gray',
  repondu: 'badge-green',
}

const avatarColors = [
  '#1E3A8A','#DC2626','#D97706','#16A34A',
  '#7C3AED','#0369A1','#BE185D','#0F766E',
]
function getAvatarColor(name) {
  let hash = 0
  for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash)
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

function timeAgo(date) {
  if (!date) return '—'
  const diff = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'À l\'instant'
  if (mins < 60)  return `${mins}min`
  if (hours < 24) return `${hours}h`
  return `${days}j`
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

let searchTimer = null
function debouncedSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => loadMessages(), 400)
}

async function loadMessages(page = 1) {
  loading.value = true
  try {
    const params = { page, per_page: 20 }
    if (auth.user?.ministere_id) params.ministere_id = auth.user.ministere_id
    if (activeTab.value) params.statut = activeTab.value
    if (search.value)    params.search = search.value

    const { data } = await api.get('/ministry/contact-messages', { params })
    const result = data.data
    messages.value = result.data || result
    pagination.value = {
      currentPage: result.current_page || 1,
      lastPage:    result.last_page    || 1,
      total:       result.total        || messages.value.length,
    }
  } catch (e) {
    console.error(e)
    showToast('Erreur lors du chargement des messages.', 'error')
  } finally {
    loading.value = false
  }
}

async function openMessage(msg) {
  selectedMsg.value = msg
  replyText.value   = ''

  if (msg.statut === 'non_lu') {
    try {
      await api.patch(`/ministry/contact-messages/${msg.id}/read`)
      msg.statut = 'lu'
    } catch {}
  }

  // Charger les réponses
  try {
    const { data } = await api.get(`/ministry/contact-messages/${msg.id}`)
    selectedMsg.value = data.data
  } catch {}
}

async function toggleRead(msg) {
  try {
    if (msg.statut === 'non_lu') {
      await api.patch(`/ministry/contact-messages/${msg.id}/read`)
      msg.statut = 'lu'
      selectedMsg.value.statut = 'lu'
      showToast('Message marqué comme lu', 'success')
    } else {
      await api.patch(`/ministry/contact-messages/${msg.id}/unread`)
      msg.statut = 'non_lu'
      selectedMsg.value.statut = 'non_lu'
      showToast('Message marqué comme non lu', 'success')
    }
  } catch (e) {
    console.error(e)
    showToast('Erreur lors du changement de statut', 'error')
  }
}

async function sendReply() {
  if (!replyText.value.trim()) return
  replying.value = true
  try {
    await api.post(`/ministry/contact-messages/${selectedMsg.value.id}/reply`, {
      reponse: replyText.value,
    })

    // Mettre à jour localement
    if (!selectedMsg.value.reponses) selectedMsg.value.reponses = []
    selectedMsg.value.reponses.push({
      contenu:    replyText.value,
      created_at: new Date().toISOString(),
    })
    selectedMsg.value.statut = 'repondu'

    const msg = messages.value.find(m => m.id === selectedMsg.value.id)
    if (msg) msg.statut = 'repondu'

    replyText.value = ''
    showToast('Réponse envoyée !', 'success')
  } catch (e) {
    console.error(e)
    showToast('Erreur lors de l\'envoi.', 'error')
  } finally {
    replying.value = false
  }
}

function confirmDelete(msg) {
  deleteModal.value = { show: true, msg, loading: false }
}

async function deleteMessage() {
  deleteModal.value.loading = true
  try {
    await api.delete(`/ministry/contact-messages/${deleteModal.value.msg.id}`)
    messages.value = messages.value.filter(m => m.id !== deleteModal.value.msg.id)
    if (selectedMsg.value?.id === deleteModal.value.msg.id) selectedMsg.value = null
    deleteModal.value.show = false
    showToast('Message supprimé.', 'success')
  } catch (e) {
    console.error(e)
    showToast('Erreur lors de la suppression.', 'error')
  } finally {
    deleteModal.value.loading = false
  }
}

function showToast(message, type = 'success') {
  toast.value = { show: true, type, message }
  setTimeout(() => { toast.value.show = false }, 2500)
}

onMounted(() => loadMessages())
</script>

<style scoped>
.messages-layout {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 0;
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
  min-height: calc(100vh - 140px);
}

/* Liste gauche */
.messages-list {
  border-right: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
}

.list-header {
  padding: 16px;
  border-bottom: 1px solid #F1F5F9;
  background: #FAFBFC;
}
.list-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.list-title {
  font-size: 15px;
  font-weight: 600;
  color: #0F172A;
}
.unread-badge {
  background: #1E3A8A;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
}
.list-filters {
  display: flex;
  gap: 4px;
  margin-bottom: 10px;
}
.filter-tab {
  padding: 4px 10px;
  border-radius: 6px;
  border: none;
  background: transparent;
  font-size: 12px;
  color: #64748B;
  cursor: pointer;
  transition: all .1s;
}
.filter-tab:hover { background: #F1F5F9; }
.filter-tab.active {
  background: #EEF2FF;
  color: #4338CA;
  font-weight: 500;
}
.list-search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 7px 10px;
  color: #94A3B8;
}
.list-search input {
  border: none;
  outline: none;
  font-size: 13px;
  color: #0F172A;
  flex: 1;
  background: transparent;
}
.list-search input::placeholder { color: #CBD5E1; }

/* Loading skeleton */
.list-loading { padding: 8px; }
.msg-skeleton {
  display: flex;
  gap: 10px;
  padding: 12px;
  border-bottom: 1px solid #F8FAFC;
}
.sk-avatar {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: #F1F5F9;
  flex-shrink: 0;
  animation: shimmer 1.5s infinite;
}
.sk-lines { flex: 1; display: flex; flex-direction: column; gap: 6px; padding-top: 4px; }
.sk-line {
  height: 11px; border-radius: 6px;
  background: #F1F5F9;
  animation: shimmer 1.5s infinite;
}
.w70 { width: 70%; }
.w50 { width: 50%; }
@keyframes shimmer {
  0%,100% { opacity: 1; }
  50%      { opacity: .5; }
}

/* Empty state */
.list-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #94A3B8;
}
.list-empty-icon {
  color: #CBD5E1;
}
.list-empty-text {
  font-size: 14px;
  font-weight: 500;
}

/* Message items */
.list-items { flex: 1; overflow-y: auto; }
.msg-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid #F8FAFC;
  cursor: pointer;
  position: relative;
  transition: background .1s;
}
.msg-item:hover { background: #F8FAFC; }
.msg-item.active { background: #EFF6FF; border-right: 3px solid #3B82F6; }
.msg-item.unread { background: #FAFBFF; }
.msg-item.unread .msg-item-name { font-weight: 700; color: #0F172A; }
.msg-item.unread .msg-item-subject { font-weight: 600; color: #334155; }

.msg-item-avatar {
  width: 38px; height: 38px; min-width: 38px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700; color: #fff;
}
.msg-item-body { flex: 1; min-width: 0; }
.msg-item-top {
  display: flex; justify-content: space-between;
  align-items: center; margin-bottom: 2px;
}
.msg-item-name  { font-size: 13px; color: #374151; font-weight: 500; }
.msg-item-time  { font-size: 10px; color: #94A3B8; white-space: nowrap; }
.msg-item-subject {
  font-size: 12px; color: #374151;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.msg-item-preview {
  font-size: 11px; color: #94A3B8; margin-top: 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.unread-dot {
  width: 8px; height: 8px;
  background: #3B82F6; border-radius: 50%;
  flex-shrink: 0; margin-top: 4px;
}

/* Pagination liste */
.list-pagination {
  display: flex; align-items: center;
  justify-content: center; gap: 12px;
  padding: 10px; border-top: 1px solid #F1F5F9;
  font-size: 12px; color: #64748B;
}
.list-pagination button {
  width: 28px; height: 28px; border-radius: 6px;
  border: 1px solid #E2E8F0; background: #fff;
  cursor: pointer; font-size: 13px; transition: background .1s;
  display: flex; align-items: center; justify-content: center;
}
.list-pagination button:disabled { opacity: .4; cursor: not-allowed; }
.list-pagination button:hover:not(:disabled) { background: #F1F5F9; }

/* Détail droite */
.message-detail {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.detail-empty {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 16px; color: #CBD5E1;
}
.detail-empty-icon { opacity: .5; }
.detail-empty-title { font-size: 16px; font-weight: 600; color: #94A3B8; }
.detail-empty-sub   { font-size: 13px; color: #CBD5E1; }

.detail-content { flex: 1; display: flex; flex-direction: column; }

.detail-header {
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #F1F5F9;
}
.detail-sender { display: flex; align-items: center; gap: 12px; }
.detail-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 700; color: #fff;
}
.detail-sender-name  { font-size: 15px; font-weight: 600; color: #0F172A; }
.detail-sender-email { font-size: 12px; color: #64748B; margin-top: 2px; }
.email-link { color: #3B82F6; text-decoration: none; }
.email-link:hover { color: #1D4ED8; }
.detail-header-actions { display: flex; align-items: center; gap: 8px; }
.detail-date { font-size: 12px; color: #94A3B8; margin-right: 4px; }

.badge {
  display: inline-flex; padding: 4px 10px;
  border-radius: 30px; font-size: 11px; font-weight: 600;
}
.badge-blue  { background: #DBEAFE; color: #1D4ED8; }
.badge-gray  { background: #F1F5F9; color: #475569; }
.badge-green { background: #DCFCE7; color: #166534; }

.icon-btn {
  width: 36px; height: 36px; border-radius: 8px;
  border: 1px solid #E2E8F0; background: #fff;
  display: flex; align-items: center; justify-content: center;
  color: #64748B; cursor: pointer; transition: all .2s;
}
.icon-btn:hover { background: #F1F5F9; }
.icon-btn.danger { color: #DC2626; border-color: #FECACA; }
.icon-btn.danger:hover { background: #FEF2F2; }

.detail-subject {
  padding: 16px 24px 0;
  font-size: 18px; font-weight: 700;
  color: #0F172A;
  font-family: 'Sora', system-ui, sans-serif;
}

.detail-body {
  padding: 16px 24px;
  font-size: 14px; color: #374151;
  line-height: 1.8; flex: 1;
  white-space: pre-wrap;
}

/* Réponses */
.replies-section {
  margin: 0 24px 16px;
  background: #F8FAFC;
  border-radius: 12px;
  padding: 16px;
}
.replies-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; font-weight: 600;
  color: #64748B; margin-bottom: 12px;
  text-transform: uppercase; letter-spacing: .05em;
}
.reply-item {
  background: #fff;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 8px;
  border: 1px solid #E2E8F0;
}
.reply-item:last-child { margin-bottom: 0; }
.reply-header {
  display: flex; justify-content: space-between;
  margin-bottom: 8px;
}
.reply-author { font-size: 12px; font-weight: 600; color: #1E3A8A; }
.reply-date   { font-size: 11px; color: #94A3B8; }
.reply-body   { font-size: 13px; color: #374151; line-height: 1.6; }

/* Formulaire réponse */
.reply-form {
  margin: 0 24px 24px;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
}
.reply-form-header {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
  font-size: 12px; font-weight: 600;
  color: #64748B;
}
.reply-textarea {
  width: 100%; padding: 16px;
  border: none; outline: none;
  font-size: 13px; color: #0F172A;
  line-height: 1.7; resize: vertical;
  font-family: inherit;
  background: #fff;
}
.reply-textarea::placeholder { color: #CBD5E1; }
.reply-actions {
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid #F1F5F9;
  background: #FAFBFC;
}
.reply-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #94A3B8;
}
.btn-primary {
  display: flex; align-items: center; gap: 8px;
  background: #1E3A8A; color: #fff; border: none;
  padding: 8px 20px; border-radius: 8px;
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: all .2s;
}
.btn-primary:hover:not(:disabled) { background: #1e40af; transform: translateY(-1px); }
.btn-primary:disabled { opacity: .5; cursor: not-allowed; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.5);
  display: flex; align-items: center; justify-content: center; z-index: 100;
  backdrop-filter: blur(4px);
}
.modal {
  background: #fff; border-radius: 24px;
  padding: 32px; max-width: 380px; width: 90%;
  text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,.2);
}
.modal-icon {
  width: 60px; height: 60px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 20px;
}
.modal-icon.danger { background: #FEF2F2; color: #DC2626; }
.modal-title { font-size: 18px; font-weight: 600; color: #0F172A; margin-bottom: 8px; }
.modal-sub   { font-size: 14px; color: #64748B; }
.modal-actions {
  display: flex; gap: 12px;
  justify-content: center; margin-top: 28px;
}
.btn-secondary {
  padding: 10px 20px; border: 1px solid #E2E8F0;
  border-radius: 10px; background: #fff;
  font-size: 13px; font-weight: 500; color: #475569; cursor: pointer;
  transition: all .2s;
}
.btn-secondary:hover { background: #F8FAFC; border-color: #CBD5E1; }
.btn-danger {
  display: flex; align-items: center; justify-content: center;
  min-width: 120px; padding: 10px 20px;
  border: none; border-radius: 10px;
  background: #DC2626; color: #fff;
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: all .2s;
}
.btn-danger:hover:not(:disabled) { background: #b91c1c; transform: translateY(-1px); }
.btn-danger:disabled { opacity: .7; }

/* Toast */
.toast {
  position: fixed; bottom: 24px; right: 24px;
  display: flex; align-items: center; gap: 10px;
  padding: 14px 20px; border-radius: 12px;
  font-size: 13px; font-weight: 500; z-index: 200;
  box-shadow: 0 8px 24px rgba(0,0,0,.15);
  min-width: 280px;
}
.toast.success { background: #0F172A; color: #fff; }
.toast.error   { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }
.toast-enter-active, .toast-leave-active { transition: all .3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }

.spinner-sm {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff; border-radius: 50%;
  animation: spin .6s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Responsive */
@media (max-width: 1024px) {
  .messages-layout {
    grid-template-columns: 300px 1fr;
  }
}

@media (max-width: 768px) {
  .messages-layout {
    grid-template-columns: 1fr;
  }
  
  .messages-list {
    border-right: none;
    border-bottom: 1px solid #E2E8F0;
  }
}
</style>