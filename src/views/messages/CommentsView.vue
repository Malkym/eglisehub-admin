<!-- src/views/admin/CommentsView.vue -->
<template>
  <div class="fade-in">

    <!-- Header avec stats -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Modération des commentaires</h1>
        <p class="page-subtitle">Gérez les commentaires des articles</p>
      </div>
      <div class="stats-badge">
        <span class="stat-item">
          <span class="stat-dot pending"></span>
          {{ pendingCount }} en attente
        </span>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key; loadComments()"
      >
        {{ tab.label }}
        <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
      </button>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-left">
        <div class="search-wrap">
          <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="search"
            class="search-input"
            placeholder="Rechercher un commentaire..."
            @input="debouncedSearch"
          />
        </div>

        <select v-model="filterArticle" class="filter-select" @change="loadComments()">
          <option value="">Tous les articles</option>
          <option v-for="article in articles" :key="article.id" :value="article.id">
            {{ article.titre }}
          </option>
        </select>
      </div>

      <div class="toolbar-right" v-if="selected.length > 0">
        <span class="selection-info">{{ selected.length }} sélectionné(s)</span>
        <button class="btn-outline" @click="selected = []">Désélectionner</button>
        <button class="btn-success" @click="bulkApprove" :disabled="processing">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Approuver
        </button>
        <button class="btn-warning" @click="bulkReject" :disabled="processing">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Rejeter
        </button>
        <button class="btn-danger" @click="confirmBulkDelete" :disabled="processing">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Supprimer
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="table-container">
      <div class="table-head">
        <div class="th" style="width:40px">
          <label class="checkbox">
            <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
          </label>
        </div>
        <div class="th" style="flex:2">Commentaire</div>
        <div class="th" style="width:160px">Auteur</div>
        <div class="th" style="width:200px">Article</div>
        <div class="th" style="width:100px">Statut</div>
        <div class="th" style="width:140px">Date</div>
        <div class="th" style="width:120px">Actions</div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <div v-for="i in 5" :key="i" class="skeleton-row"></div>
      </div>

      <!-- Empty -->
      <div v-else-if="comments.length === 0" class="empty-state">
        <svg width="48" height="48" fill="none" stroke="#94A3B8" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <div class="empty-title">Aucun commentaire</div>
        <div class="empty-sub">Les commentaires des visiteurs apparaîtront ici</div>
      </div>

      <!-- Rows -->
      <div v-else>
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="table-row"
          :class="{ 
            selected: selected.includes(comment.id),
            pending: comment.statut === 'en_attente',
            approved: comment.statut === 'approuve',
            rejected: comment.statut === 'rejete'
          }"
        >
          <!-- Checkbox -->
          <div class="td" style="width:40px">
            <label class="checkbox">
              <input 
                type="checkbox" 
                :value="comment.id" 
                v-model="selected"
                @change="updateSelectAll"
              />
            </label>
          </div>

          <!-- Commentaire -->
          <div class="td" style="flex:2">
            <div class="comment-content">
              <p class="comment-text">{{ comment.contenu }}</p>
              <div v-if="comment.reponses_count > 0" class="replies-badge">
                {{ comment.reponses_count }} réponse(s)
              </div>
            </div>
          </div>

          <!-- Auteur -->
          <div class="td" style="width:160px">
            <div class="author-info">
              <span class="author-name">{{ comment.nom_auteur || 'Anonyme' }}</span>
              <span v-if="comment.email" class="author-email">{{ comment.email }}</span>
            </div>
          </div>

          <!-- Article -->
          <div class="td" style="width:200px">
            <RouterLink :to="`/articles/${comment.article_id}`" class="article-link">
              {{ comment.article?.titre || 'Article inconnu' }}
            </RouterLink>
          </div>

          <!-- Statut -->
          <div class="td" style="width:100px">
            <span class="status-badge" :class="`status-${comment.statut}`">
              {{ statusLabels[comment.statut] }}
            </span>
          </div>

          <!-- Date -->
          <div class="td" style="width:140px">
            <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
          </div>

          <!-- Actions -->
          <div class="td actions-td" style="width:120px" @click.stop>
            <button
              v-if="comment.statut !== 'approuve'"
              class="action-btn approve"
              @click="approveComment(comment)"
              title="Approuver"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>

            <button
              v-if="comment.statut !== 'rejete'"
              class="action-btn reject"
              @click="rejectComment(comment)"
              title="Rejeter"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <button class="action-btn delete" @click="confirmDelete(comment)" title="Supprimer">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.lastPage > 1" class="pagination">
      <button class="page-btn" :disabled="pagination.currentPage === 1"
        @click="loadComments(pagination.currentPage - 1)">← Précédent</button>
      <span class="page-info">{{ pagination.currentPage }} / {{ pagination.lastPage }}</span>
      <button class="page-btn" :disabled="pagination.currentPage === pagination.lastPage"
        @click="loadComments(pagination.currentPage + 1)">Suivant →</button>
    </div>

    <!-- Modal confirmation suppression -->
    <Teleport to="body">
      <div v-if="deleteModal.show" class="modal-overlay" @click.self="deleteModal.show = false">
        <div class="modal">
          <div class="modal-icon danger">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 class="modal-title">{{ deleteModal.bulk ? 'Supprimer plusieurs commentaires ?' : 'Supprimer ce commentaire ?' }}</h3>
          <p class="modal-sub">Cette action est irréversible.</p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="deleteModal.show = false">Annuler</button>
            <button class="btn-danger" :disabled="deleteModal.loading" @click="executeDelete">
              <span v-if="!deleteModal.loading">Supprimer</span>
              <span v-else class="spinner-sm"></span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.message }}</div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const auth = useAuthStore()

const comments = ref([])
const articles = ref([])
const loading = ref(true)
const processing = ref(false)
const search = ref('')
const activeTab = ref('pending')
const filterArticle = ref('')
const selected = ref([])
const selectAll = ref(false)
const pagination = ref({ currentPage: 1, lastPage: 1, total: 0 })
const pendingCount = ref(0)
const toast = ref({ show: false, type: 'success', message: '' })
const deleteModal = ref({ show: false, comment: null, bulk: false, loading: false })

const tabs = computed(() => [
  { key: 'all', label: 'Tous', count: pagination.value.total },
  { key: 'pending', label: 'En attente', count: pendingCount.value },
  { key: 'approuve', label: 'Approuvés' },
  { key: 'rejete', label: 'Rejetés' },
])

const statusLabels = {
  en_attente: 'En attente',
  approuve: 'Approuvé',
  rejete: 'Rejeté',
}

let searchTimer = null
function debouncedSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => loadComments(), 400)
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function toggleSelectAll() {
  if (selectAll.value) {
    selected.value = comments.value.map(c => c.id)
  } else {
    selected.value = []
  }
}

function updateSelectAll() {
  selectAll.value = comments.value.length > 0 && selected.value.length === comments.value.length
}

async function loadComments(page = 1) {
  loading.value = true
  try {
    const params = { 
      page, 
      per_page: 15,
      search: search.value || undefined,
      article_id: filterArticle.value || undefined
    }
    
    if (activeTab.value !== 'all') {
      params.statut = activeTab.value
    }

    const { data } = await api.get('/ministry/comments', { params })
    const result = data.data
    comments.value = result.data || []
    pagination.value = {
      currentPage: result.current_page || 1,
      lastPage: result.last_page || 1,
      total: result.total || comments.value.length,
    }

    // Charger le compteur des en attente
    await loadPendingCount()

  } catch (e) {
    console.error('Erreur chargement commentaires:', e)
    showToast('Erreur lors du chargement', 'error')
  } finally {
    loading.value = false
  }
}

async function loadPendingCount() {
  try {
    const { data } = await api.get('/ministry/comments/pending', { params: { per_page: 1 } })
    pendingCount.value = data.total || 0
  } catch (e) {
    console.error('Erreur chargement compteur:', e)
  }
}

async function loadArticles() {
  try {
    const { data } = await api.get('/ministry/articles', { params: { per_page: 100 } })
    articles.value = data.data?.data || []
  } catch (e) {
    console.error('Erreur chargement articles:', e)
  }
}

async function approveComment(comment) {
  try {
    await api.patch(`/ministry/comments/${comment.id}/approve`)
    comment.statut = 'approuve'
    await loadPendingCount()
    showToast('Commentaire approuvé', 'success')
  } catch (e) {
    showToast('Erreur lors de l\'approbation', 'error')
  }
}

async function rejectComment(comment) {
  try {
    await api.patch(`/ministry/comments/${comment.id}/reject`)
    comment.statut = 'rejete'
    await loadPendingCount()
    showToast('Commentaire rejeté', 'success')
  } catch (e) {
    showToast('Erreur lors du rejet', 'error')
  }
}

async function bulkApprove() {
  if (selected.value.length === 0) return
  processing.value = true
  try {
    await api.post('/ministry/comments/bulk-approve', { ids: selected.value })
    selected.value = []
    await loadComments()
    showToast('Commentaires approuvés', 'success')
  } catch (e) {
    showToast('Erreur', 'error')
  } finally {
    processing.value = false
  }
}

async function bulkReject() {
  if (selected.value.length === 0) return
  processing.value = true
  try {
    await api.post('/ministry/comments/bulk-reject', { ids: selected.value })
    selected.value = []
    await loadComments()
    showToast('Commentaires rejetés', 'success')
  } catch (e) {
    showToast('Erreur', 'error')
  } finally {
    processing.value = false
  }
}

function confirmBulkDelete() {
  deleteModal.value = { show: true, comment: null, bulk: true, loading: false }
}

function confirmDelete(comment) {
  deleteModal.value = { show: true, comment, bulk: false, loading: false }
}

async function executeDelete() {
  deleteModal.value.loading = true
  try {
    if (deleteModal.value.bulk) {
      await api.post('/ministry/comments/bulk-delete', { ids: selected.value })
      selected.value = []
    } else {
      await api.delete(`/ministry/comments/${deleteModal.value.comment.id}`)
    }
    deleteModal.value.show = false
    await loadComments()
    showToast('Supprimé avec succès', 'success')
  } catch (e) {
    showToast('Erreur lors de la suppression', 'error')
  } finally {
    deleteModal.value.loading = false
  }
}

function showToast(message, type = 'success') {
  toast.value = { show: true, type, message }
  setTimeout(() => { toast.value.show = false }, 2500)
}

watch([activeTab, filterArticle], () => {
  loadComments()
})

onMounted(() => {
  loadComments()
  loadArticles()
})
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #0F172A;
  font-family: 'Sora', sans-serif;
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 14px;
  color: #64748B;
}

.stats-badge {
  background: #F8FAFC;
  border-radius: 20px;
  padding: 10px 18px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #0F172A;
}

.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.stat-dot.pending { background: #D97706; }

.tabs-container {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 1px solid #E2E8F0;
  padding-bottom: 10px;
}

.tab-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: #64748B;
  cursor: pointer;
  position: relative;
}

.tab-btn.active {
  background: #EEF2FF;
  color: #4338CA;
}

.tab-count {
  background: #E2E8F0;
  color: #475569;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 12px;
  margin-left: 6px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.toolbar-right {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  background: #EFF6FF;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #BFDBFE;
}

.selection-info {
  font-size: 12px;
  font-weight: 600;
  color: #1D4ED8;
}

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #94A3B8;
  pointer-events: none;
}

.search-input {
  padding: 8px 12px 8px 32px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 13px;
  color: #0F172A;
  background: #fff;
  outline: none;
  width: 200px;
}

.search-input:focus {
  border-color: #3B82F6;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 13px;
  color: #374151;
  background: #fff;
  outline: none;
  cursor: pointer;
}

.btn-outline {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  background: #fff;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
  transition: all .12s;
}

.btn-outline:hover {
  border-color: #3B82F6;
  color: #1D4ED8;
}

.btn-success {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: none;
  border-radius: 8px;
  background: #16A34A;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background .12s;
}

.btn-success:hover:not(:disabled) {
  background: #15803D;
}

.btn-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: none;
  border-radius: 8px;
  background: #D97706;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background .12s;
}

.btn-warning:hover:not(:disabled) {
  background: #B45309;
}

.btn-danger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: none;
  border-radius: 8px;
  background: #DC2626;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background .12s;
}

.btn-danger:hover:not(:disabled) {
  background: #B91C1C;
}

.table-container {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
}

.table-head {
  display: flex;
  padding: 12px 16px;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
}

.th {
  font-size: 11px;
  font-weight: 600;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.table-row {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #F1F5F9;
  transition: background .1s;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row.selected {
  background: #EFF6FF;
}

.table-row.pending {
  border-left: 3px solid #D97706;
}

.table-row.approved {
  border-left: 3px solid #16A34A;
}

.table-row.rejected {
  border-left: 3px solid #DC2626;
  opacity: 0.7;
}

.td {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #0F172A;
}

.checkbox {
  display: flex;
  align-items: center;
}

.checkbox input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.comment-content {
  flex: 1;
}

.comment-text {
  font-size: 13px;
  color: #0F172A;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.replies-badge {
  display: inline-flex;
  margin-top: 4px;
  font-size: 10px;
  font-weight: 600;
  color: #3B82F6;
  background: #EFF6FF;
  padding: 2px 8px;
  border-radius: 12px;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.author-name {
  font-size: 13px;
  font-weight: 500;
  color: #0F172A;
}

.author-email {
  font-size: 11px;
  color: #64748B;
}

.article-link {
  color: #3B82F6;
  text-decoration: none;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
  display: block;
}

.article-link:hover {
  text-decoration: underline;
}

.status-badge {
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.status-en_attente {
  background: #FEF3C7;
  color: #92400E;
}

.status-approuve {
  background: #DCFCE7;
  color: #166534;
}

.status-rejete {
  background: #FEE2E2;
  color: #991B1B;
}

.comment-date {
  font-size: 12px;
  color: #64748B;
}

.actions-td {
  display: flex;
  gap: 6px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all .2s;
}

.action-btn.approve {
  background: #DCFCE7;
  color: #16A34A;
}

.action-btn.approve:hover {
  background: #BBF7D0;
}

.action-btn.reject {
  background: #FEF3C7;
  color: #D97706;
}

.action-btn.reject:hover {
  background: #FDE68A;
}

.action-btn.delete {
  background: #FEF2F2;
  color: #DC2626;
}

.action-btn.delete:hover {
  background: #FEE2E2;
}

/* Skeleton */
.skeleton-row {
  height: 60px;
  background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  margin: 2px 0;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #0F172A;
}

.empty-sub {
  font-size: 13px;
  color: #94A3B8;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
}

.page-btn:disabled {
  opacity: .4;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: #64748B;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.modal {
  background: #fff;
  border-radius: 24px;
  padding: 32px;
  max-width: 380px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,.2);
}

.modal-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.modal-icon.danger {
  background: #FEF2F2;
  color: #DC2626;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #0F172A;
  margin-bottom: 8px;
}

.modal-sub {
  font-size: 14px;
  color: #64748B;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 28px;
}

.btn-secondary {
  padding: 10px 20px;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  background: #fff;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all .2s;
}

.btn-secondary:hover {
  background: #F8FAFC;
  border-color: #CBD5E1;
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .6s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 12px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  z-index: 200;
  box-shadow: 0 4px 20px rgba(0,0,0,.15);
}

.toast.success {
  background: #0F172A;
  color: #fff;
}

.toast.error {
  background: #FEF2F2;
  color: #DC2626;
  border: 1px solid #FECACA;
}

.toast-enter-active,
.toast-leave-active {
  transition: all .3s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>