<template>
  <div class="fade-in">

    <!-- Vue tabs : liste / calendrier -->
    <div class="view-controls">
      <div class="filters-left">
        <button v-for="tab in tabs" :key="tab.key" class="tab-btn" :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key; loadEvents()">
          {{ tab.label }}
          <span class="tab-count">{{ tab.count }}</span>
        </button>
      </div>
      <div class="filters-right">
        <div class="search-wrap">
          <svg class="search-icon" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="search" class="search-input" placeholder="Rechercher..." @input="debouncedSearch" />
        </div>
        <select v-model="filterCategorie" class="filter-select" @change="loadEvents()">
          <option value="">Toutes catégories</option>
          <option value="ponctuel">Ponctuel</option>
          <option value="recurrent">Récurrent</option>
          <option value="permanent">Permanent</option>
          <option value="saison">Saison</option>
        </select>
        <select v-model="filterMode" class="filter-select" @change="loadEvents()">
          <option value="">Tous les modes</option>
          <option value="presentiel">Présentiel</option>
          <option value="en_ligne">En ligne</option>
          <option value="hybride">Hybride</option>
        </select>
        <RouterLink to="/events/new" class="btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Nouvel événement</span>
        </RouterLink>
      </div>
    </div>

    <!-- Liste des événements -->
    <div class="events-container">

      <!-- Loading -->
      <div v-if="loading" class="events-grid">
        <div v-for="i in 4" :key="i" class="event-card skeleton-card">
          <div class="skeleton-header"></div>
          <div class="skeleton-body">
            <div class="skeleton-line w60"></div>
            <div class="skeleton-line w40"></div>
            <div class="skeleton-line w80"></div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="events.length === 0" class="empty-state">
        <svg width="48" height="48" fill="none" stroke="#94A3B8" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <div class="empty-title">Aucun événement</div>
        <div class="empty-sub">
          {{ activeTab ? `Aucun événement "${tabLabels[activeTab]}"` : 'Créez votre premier événement' }}
        </div>
        <RouterLink to="/events/new" class="btn-primary">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Créer un événement
        </RouterLink>
      </div>

      <!-- Grid cards -->
      <div v-else class="events-grid">
        <div v-for="event in events" :key="event.id" class="event-card stagger-item"
          :class="{ cancelled: event.statut === 'annule' }">
          <!-- Header couleur -->
          <div class="event-card-header"
            :style="{ background: getFullUrl(event.image) ? `url(${getFullUrl(event.image)}) center/cover` : categorieColors[event.categorie]?.bg }">
            <div class="event-card-date">
              <div class="event-card-day">{{ getDay(event.date_debut) }}</div>
              <div class="event-card-month">{{ getMonth(event.date_debut) }}</div>
              <br>
            </div>
            <div class="event-card-badges">
              <span class="event-type-badge" :style="{
                background: categorieColors[event.categorie]?.badge,
                color: categorieColors[event.categorie]?.text
              }">
                {{ categorieLabels[event.categorie] || event.categorie }}
              </span>
              <span v-if="event.statut === 'annule'" class="event-cancelled-badge">
                <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Annulé
              </span>
            </div>
            <div v-if="event.categorie === 'recurrent'" class="recurrent-icon" title="Événement récurrent">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>

          <!-- Body -->
          <div class="event-card-body">
            <div class="event-card-title">{{ event.titre }}</div>

            <div class="event-card-meta">
              <div v-if="event.heure_debut" class="meta-row">
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ event.heure_debut }}
                <span v-if="event.heure_fin">– {{ event.heure_fin }}</span>
              </div>
              <div v-if="event.lieu" class="meta-row">
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ event.lieu }}
              </div>
              <div v-if="event.categorie === 'recurrent' && event.frequence" class="meta-row">
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {{ frequenceLabels[event.frequence] }}
                <span v-if="event.jours_semaine?.length">
                  · {{ formatJours(event.jours_semaine) }}
                </span>
              </div>
            </div>

            <!-- Mode badge -->
            <div class="event-card-footer">
              <span class="mode-badge" :class="modeBadge[event.mode]">
                {{ modeLabels[event.mode] || event.mode }}
              </span>
              <span v-if="event.est_gratuit" class="gratuit-badge">Gratuit</span>
              <span v-else class="payant-badge">Payant</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="event-card-actions">
            <button class="action-btn edit" @click="router.push(`/events/${event.id}`)" title="Modifier">
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button v-if="event.statut !== 'annule'" class="action-btn cancel" @click="confirmCancel(event)"
              title="Annuler l'événement">
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </button>
            <button class="action-btn delete" @click="confirmDelete(event)" title="Supprimer">
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.lastPage > 1" class="pagination">
      <button class="page-btn" :disabled="pagination.currentPage === 1" @click="changePage(pagination.currentPage - 1)">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Précédent
      </button>
      <div class="page-info">
        Page {{ pagination.currentPage }} / {{ pagination.lastPage }}
        <span class="page-total">({{ pagination.total }} événements)</span>
      </div>
      <button class="page-btn" :disabled="pagination.currentPage === pagination.lastPage"
        @click="changePage(pagination.currentPage + 1)">
        Suivant
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Modal annulation -->
    <Teleport to="body">
      <div v-if="cancelModal.show" class="modal-overlay" @click.self="cancelModal.show = false">
        <div class="modal">
          <div class="modal-icon warning">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="modal-title">Annuler cet événement ?</div>
          <div class="modal-sub">« {{ cancelModal.event?.titre }} »</div>
          <div class="modal-sub">L'événement sera marqué comme annulé mais conservé.</div>
          <div class="modal-actions">
            <button class="btn-secondary" @click="cancelModal.show = false">Fermer</button>
            <button class="btn-warning" :disabled="cancelModal.loading" @click="cancelEvent">
              <span v-if="!cancelModal.loading">Confirmer l'annulation</span>
              <span v-else class="spinner-sm"></span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal suppression -->
    <Teleport to="body">
      <div v-if="deleteModal.show" class="modal-overlay" @click.self="deleteModal.show = false">
        <div class="modal">
          <div class="modal-icon danger">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div class="modal-title">Supprimer cet événement ?</div>
          <div class="modal-sub">« {{ deleteModal.event?.titre }} »</div>
          <div class="modal-sub">Cette action est irréversible.</div>
          <div class="modal-actions">
            <button class="btn-secondary" @click="deleteModal.show = false">Annuler</button>
            <button class="btn-danger" :disabled="deleteModal.loading" @click="deleteEvent">
              <span v-if="!deleteModal.loading">Supprimer</span>
              <span v-else class="spinner-sm"></span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const BASE_URL = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000'

function getFullUrl(path) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  // path commence par /storage/...
  return `${BASE_URL}/storage/${path}`
}


const router = useRouter()
const auth = useAuthStore()

const events = ref([])
const loading = ref(true)
const search = ref('')
const activeTab = ref('')
const filterCategorie = ref('')
const filterMode = ref('')
const pagination = ref({ currentPage: 1, lastPage: 1, total: 0 })
const counts = ref({ all: 0, a_venir: 0, en_cours: 0, annule: 0 })

const cancelModal = ref({ show: false, event: null, loading: false })
const deleteModal = ref({ show: false, event: null, loading: false })

const tabLabels = {
  '': 'Tous', a_venir: 'À venir', en_cours: 'En cours', annule: 'Annulés',
}

const tabs = computed(() => [
  { key: '', label: 'Tous', count: counts.value.all },
  { key: 'a_venir', label: 'À venir', count: counts.value.a_venir },
  { key: 'en_cours', label: 'En cours', count: counts.value.en_cours },
  { key: 'annule', label: 'Annulés', count: counts.value.annule },
])

const categorieLabels = {
  ponctuel: 'Ponctuel', recurrent: 'Récurrent',
  permanent: 'Permanent', saison: 'Saison',
}

const categorieColors = {
  ponctuel: { bg: '#FEF3C7', badge: '#FDE68A', text: '#92400E' },
  recurrent: { bg: '#EDE9FE', badge: '#DDD6FE', text: '#6D28D9' },
  permanent: { bg: '#DCFCE7', badge: '#BBF7D0', text: '#166534' },
  saison: { bg: '#E0F2FE', badge: '#BAE6FD', text: '#0369A1' },
}

const frequenceLabels = {
  aucune: 'Unique', quotidien: 'Quotidien',
  hebdomadaire: 'Hebdomadaire', bimensuel: 'Bimensuel',
  mensuel: 'Mensuel', annuel: 'Annuel',
}

const modeLabels = {
  presentiel: 'Présentiel', en_ligne: 'En ligne', hybride: 'Hybride',
}

const modeBadge = {
  presentiel: 'badge-blue',
  en_ligne: 'badge-purple',
  hybride: 'badge-teal',
}

const jourLabels = {
  lundi: 'Lun', mardi: 'Mar', mercredi: 'Mer', jeudi: 'Jeu',
  vendredi: 'Ven', samedi: 'Sam', dimanche: 'Dim',
}

function formatJours(jours) {
  if (!jours?.length) return ''
  return jours.map(j => jourLabels[j] || j).join(', ')
}

function getDay(date) {
  if (!date) return '—'
  return new Date(date).getDate()
}

function getMonth(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', { month: 'short' })
}

let searchTimer = null
function debouncedSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => loadEvents(), 400)
}

async function loadEvents(page = 1) {
  loading.value = true
  try {
    const params = { page, per_page: 12 }
    if (auth.user?.ministere_id) params.ministere_id = auth.user.ministere_id
    if (activeTab.value) params.statut = activeTab.value
    if (filterCategorie.value) params.categorie = filterCategorie.value
    if (filterMode.value) params.mode = filterMode.value
    if (search.value) params.search = search.value

    const { data } = await api.get('/ministry/events', { params })
    const result = data.data

    events.value = result.data || result
    pagination.value = {
      currentPage: result.current_page || 1,
      lastPage: result.last_page || 1,
      total: result.total || events.value.length,
    }

    await loadCounts()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function loadCounts() {
  try {
    const base = auth.user?.ministere_id ? { ministere_id: auth.user.ministere_id, per_page: 1 } : { per_page: 1 }
    const [all, avenir, encours, annule] = await Promise.all([
      api.get('/ministry/events', { params: base }),
      api.get('/ministry/events', { params: { ...base, statut: 'a_venir' } }),
      api.get('/ministry/events', { params: { ...base, statut: 'en_cours' } }),
      api.get('/ministry/events', { params: { ...base, statut: 'annule' } }),
    ])
    counts.value = {
      all: all.data.data?.total || 0,
      a_venir: avenir.data.data?.total || 0,
      en_cours: encours.data.data?.total || 0,
      annule: annule.data.data?.total || 0,
    }
  } catch { }
}

function confirmCancel(event) {
  cancelModal.value = { show: true, event, loading: false }
}

async function cancelEvent() {
  cancelModal.value.loading = true
  try {
    await api.patch(`/ministry/events/${cancelModal.value.event.id}/cancel`)
    const ev = events.value.find(e => e.id === cancelModal.value.event.id)
    if (ev) ev.statut = 'annule'
    cancelModal.value.show = false
  } catch (e) {
    console.error(e)
  } finally {
    cancelModal.value.loading = false
  }
}

function confirmDelete(event) {
  deleteModal.value = { show: true, event, loading: false }
}

async function deleteEvent() {
  deleteModal.value.loading = true
  try {
    await api.delete(`/ministry/events/${deleteModal.value.event.id}`)
    events.value = events.value.filter(e => e.id !== deleteModal.value.event.id)
    deleteModal.value.show = false
  } catch (e) {
    console.error(e)
  } finally {
    deleteModal.value.loading = false
  }
}

function changePage(page) {
  loadEvents(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => loadEvents())
</script>

<style scoped>
/* Controls */
.view-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
}

.event-image {
  width: 180px;
  min-width: 180px;
  overflow: hidden;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}


.filters-left {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.filters-right {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  font-size: 13px;
  color: #64748B;
  cursor: pointer;
  transition: all .12s;
}

.tab-btn:hover {
  background: #F1F5F9;
  color: #334155;
}

.tab-btn.active {
  background: #fff;
  border-color: #E2E8F0;
  color: #0F172A;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, .06);
}

.tab-count {
  background: #F1F5F9;
  color: #64748B;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 10px;
}

.tab-btn.active .tab-count {
  background: #EDE9FE;
  color: #6D28D9;
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
  width: 180px;
  transition: border-color .15s;
}

.search-input:focus {
  border-color: #3B82F6;
}

.search-input::placeholder {
  color: #CBD5E1;
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

/* Events grid */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

/* Event card */
.event-card {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow .15s, transform .15s;
  cursor: default;
}

.event-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, .08);
  transform: translateY(-2px);
}

.event-card.cancelled {
  opacity: .7;
  filter: grayscale(.3);
}

.event-card-header {
  padding: 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  position: relative;
  min-height: 72px;
}

.event-card-date {
  flex-shrink: 0;
}

.event-card-day {
  background: #fff;
  font-size: 28px;
  border-radius: 50% 0 0;
  padding: 5px;
  font-weight: 700;
  color: #0F172A;
  line-height: 1;
  font-family: 'Sora', system-ui, sans-serif;
}

.event-card-month {
  background: #fff;
  padding: 5px;
  font-size: 11px;
  border-radius: 0 0 50% 0;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: .04em;
}

.event-card-badges {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.event-type-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
  letter-spacing: .03em;
}

.event-cancelled-badge {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
  background: #FEE2E2;
  color: #991B1B;
}

.recurrent-icon {
  position: absolute;
  bottom: 10px;
  left: 14px;
  color: #94A3B8;
}

.event-card-body {
  padding: 14px 16px 10px;
}

.event-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #0F172A;
  margin-bottom: 10px;
  line-height: 1.4;
}

.event-card-meta {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 12px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #64748B;
}

.event-card-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

/* Mode badges */
.mode-badge {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
}

.badge-blue {
  background: #DBEAFE;
  color: #1D4ED8;
}

.badge-purple {
  background: #EDE9FE;
  color: #6D28D9;
}

.badge-teal {
  background: #CCFBF1;
  color: #0F766E;
}

.gratuit-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 20px;
  background: #DCFCE7;
  color: #166534;
}

.payant-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 20px;
  background: #FEF3C7;
  color: #92400E;
}

/* Card actions */
.event-card-actions {
  display: flex;
  gap: 6px;
  padding: 10px 14px 14px;
  border-top: 1px solid #F8FAFC;
}

.action-btn {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all .1s;
}

.action-btn.edit {
  background: #EEF2FF;
  color: #4338CA;
}

.action-btn.cancel {
  background: #FEF3C7;
  color: #D97706;
}

.action-btn.delete {
  background: #FEF2F2;
  color: #DC2626;
}

.action-btn:hover {
  filter: brightness(.9);
  transform: scale(1.05);
}

/* Loading skeleton */
.skeleton-card {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
}

.skeleton-header {
  height: 72px;
  background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.w60 {
  width: 60%;
}

.w40 {
  width: 40%;
}

.w80 {
  width: 80%;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

/* Empty */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px;
  text-align: center;
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #0F172A;
}

.empty-sub {
  font-size: 14px;
  color: #94A3B8;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding: 12px 0;
}

.page-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: all .12s;
}

.page-btn:hover:not(:disabled) {
  background: #F8FAFC;
}

.page-btn:disabled {
  opacity: .4;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: #64748B;
}

.page-total {
  color: #94A3B8;
}

/* Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #1E3A8A;
  color: #fff;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  margin-top: 8px;
  transition: background .12s;
}

.btn-primary:hover {
  background: #1e40af;
}

.btn-secondary {
  padding: 9px 18px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #F8FAFC;
}

.btn-warning {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 160px;
  padding: 9px 18px;
  border: none;
  border-radius: 8px;
  background: #D97706;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background .12s;
}

.btn-warning:hover:not(:disabled) {
  background: #B45309;
}

.btn-warning:disabled {
  opacity: .7;
  cursor: wait;
}

.btn-danger {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
  padding: 9px 18px;
  border: none;
  border-radius: 8px;
  background: #DC2626;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background .12s;
}

.btn-danger:hover:not(:disabled) {
  background: #B91C1C;
}

.btn-danger:disabled {
  opacity: .7;
  cursor: wait;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.modal {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  max-width: 380px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, .2);
}

.modal-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.modal-icon.warning {
  background: #FEF3C7;
  color: #D97706;
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
  font-size: 13px;
  color: #64748B;
  margin-bottom: 4px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 24px;
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, .3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .6s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>