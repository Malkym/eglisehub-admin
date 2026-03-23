<template>
  <div class="fade-in">

    <!-- Stats rapides -->
    <div class="stats-row">
      <div class="stat-pill">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <div>
          <div class="stat-pill-n">{{ counts.total }}</div>
          <div class="stat-pill-l">Total</div>
        </div>
      </div>
      <div class="stat-pill green">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <div class="stat-pill-n">{{ counts.actifs }}</div>
          <div class="stat-pill-l">Actifs</div>
        </div>
      </div>
      <div class="stat-pill gray">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
        <div>
          <div class="stat-pill-n">{{ counts.inactifs }}</div>
          <div class="stat-pill-l">Inactifs</div>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-left">
        <button v-for="tab in tabs" :key="tab.key" class="tab-btn" :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key; loadMinisteres()">
          {{ tab.label }}
          <span class="tab-count">{{ tab.count }}</span>
        </button>
      </div>
      <div class="toolbar-right">
        <div class="search-wrap">
          <svg class="search-icon" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="search" class="search-input" placeholder="Rechercher..." @input="debouncedSearch" />
        </div>
        <select v-model="filterType" class="filter-select" @change="loadMinisteres()">
          <option value="">Tous les types</option>
          <option value="eglise">Église</option>
          <option value="ministere">Ministère</option>
          <option value="organisation">Organisation</option>
          <option value="para_ecclesial">Para-ecclésial</option>
          <option value="mission">Mission</option>
        </select>
        <button class="btn-primary" @click="openModal()">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Nouveau ministère
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="ministeres-grid">
      <div v-for="i in 6" :key="i" class="ministere-skeleton"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="ministeres.length === 0" class="empty-state">
      <svg width="48" height="48" fill="none" stroke="#94A3B8" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <div class="empty-title">Aucun ministère</div>
      <div class="empty-sub">Créez le premier ministère de la plateforme</div>
      <button class="btn-primary" @click="openModal()">Créer un ministère</button>
    </div>

    <!-- Grid -->
    <div v-else class="ministeres-grid">
      <div v-for="min in ministeres" :key="min.id" class="ministere-card stagger-item"
        :class="{ inactive: min.statut !== 'actif' }">
        <!-- Header -->
        <div class="ministere-card-header" :style="{ background: min.couleur_primaire || '#1E3A8A' }">
          <div class="ministere-logo">
            <img v-if="min.logo" :src="getFullUrl(min.logo)" :alt="min.nom" loading="lazy" />
            <span v-else>{{ min.nom.substring(0, 2).toUpperCase() }}</span>
          </div>
          <div class="ministere-header-info">
            <div class="ministere-type-badge">{{ typeLabels[min.type] || min.type }}</div>
          </div>
          <span class="ministere-status-dot" :class="min.statut === 'actif' ? 'active' : 'inactive'"></span>
        </div>

        <!-- Body -->
        <div class="ministere-card-body">
          <div class="ministere-name">{{ min.nom }}</div>

          <a :href="`http://${min.sous_domaine}.eglisehub.org`" target="_blank" class="ministere-domain" @click.stop>
            <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {{ min.sous_domaine }}.eglisehub.org
          </a>
          <div v-if="min.description" class="ministere-desc">
            {{ min.description?.substring(0, 80) }}{{ min.description?.length > 80 ? '...' : '' }}
          </div>

          <!-- Stats -->
          <div class="ministere-stats">
            <div class="m-stat">
              <span class="m-stat-n">{{ min.pages_count || 0 }}</span>
              <span class="m-stat-l">pages</span>
            </div>
            <div class="m-stat">
              <span class="m-stat-n">{{ min.articles_count || 0 }}</span>
              <span class="m-stat-l">articles</span>
            </div>
            <div class="m-stat">
              <span class="m-stat-n">{{ min.utilisateurs_count || 0 }}</span>
              <span class="m-stat-l">admins</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="ministere-card-actions">
          <button class="action-btn edit" @click="openModal(min)" title="Modifier">
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button class="action-btn" :class="min.statut === 'actif' ? 'deactivate' : 'activate'"
            @click="toggleMinistere(min)" :title="min.statut === 'actif' ? 'Désactiver' : 'Activer'">
            <svg v-if="min.statut === 'actif'" width="13" height="13" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <svg v-else width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button class="action-btn stats-btn" @click="openStats(min)" title="Statistiques">
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.lastPage > 1" class="pagination">
      <button class="page-btn" :disabled="pagination.currentPage === 1"
        @click="loadMinisteres(pagination.currentPage - 1)">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Précédent
      </button>
      <span class="page-info">{{ pagination.currentPage }} / {{ pagination.lastPage }}</span>
      <button class="page-btn" :disabled="pagination.currentPage === pagination.lastPage"
        @click="loadMinisteres(pagination.currentPage + 1)">
        Suivant
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Modal création/édition -->
    <Teleport to="body">
      <div v-if="modal.show" class="modal-overlay" @click.self="modal.show = false">
        <div class="modal-form">
          <div class="modal-header">
            <div class="modal-title">{{ modal.ministere ? 'Modifier le ministère' : 'Nouveau ministère' }}</div>
            <button class="modal-close" @click="modal.show = false">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="modal-body">

            <!-- Infos principales -->
            <div class="modal-section-title">Informations principales</div>
            <div class="form-row">
              <div class="form-group span-2">
                <label class="form-label">Nom du ministère <span class="req">*</span></label>
                <input v-model="modalForm.nom" class="form-input" placeholder="Centre Révélation du Christ" />
              </div>
              <div class="form-group">
                <label class="form-label">Type <span class="req">*</span></label>
                <select v-model="modalForm.type" class="form-input">
                  <option value="eglise">Église</option>
                  <option value="ministere">Ministère</option>
                  <option value="organisation">Organisation</option>
                  <option value="para_ecclesial">Para-ecclésial</option>
                  <option value="mission">Mission</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Sous-domaine <span class="req">*</span></label>
                <div class="subdomain-input">
                  <input v-model="modalForm.sous_domaine" class="form-input" placeholder="crc"
                    @input="modalForm.sous_domaine = $event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')" />
                  <span class="subdomain-suffix">.eglisehub.org</span>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Description <span class="optional">(optionnel)</span></label>
              <textarea v-model="modalForm.description" class="form-input" rows="3"
                placeholder="Description du ministère..."></textarea>
            </div>

            <!-- Contact -->
            <div class="modal-section-title mt-16">Contact</div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Email</label>
                <input v-model="modalForm.email_contact" class="form-input" type="email"
                  placeholder="contact@crc.org" />
              </div>
              <div class="form-group">
                <label class="form-label">Téléphone</label>
                <input v-model="modalForm.telephone" class="form-input" placeholder="+236 74 02 67 55" />
              </div>
              <div class="form-group">
                <label class="form-label">Ville</label>
                <input v-model="modalForm.ville" class="form-input" placeholder="Bangui" />
              </div>
              <div class="form-group">
                <label class="form-label">Pays</label>
                <input v-model="modalForm.pays" class="form-input" placeholder="République centrafricaine" />
              </div>
            </div>

            <!-- Identité visuelle -->
            <div class="modal-section-title mt-16">Identité visuelle</div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Couleur principale</label>
                <div class="color-input-wrap">
                  <input type="color" v-model="modalForm.couleur_primaire" class="color-picker" />
                  <input v-model="modalForm.couleur_primaire" class="form-input" maxlength="7" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Couleur secondaire</label>
                <div class="color-input-wrap">
                  <input type="color" v-model="modalForm.couleur_secondaire" class="color-picker" />
                  <input v-model="modalForm.couleur_secondaire" class="form-input" maxlength="7" />
                </div>
              </div>
            </div>

            <!-- Admin du ministère (création uniquement) -->
            <div v-if="!modal.ministere" class="admin-section">
              <div class="modal-section-title mt-16">
                Administrateur initial
                <span class="optional">(optionnel — peut être créé plus tard)</span>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Nom de l'admin</label>
                  <input v-model="modalForm.admin_name" class="form-input" placeholder="Mologbama" />
                </div>
                <div class="form-group">
                  <label class="form-label">Prénom</label>
                  <input v-model="modalForm.admin_prenom" class="form-input" placeholder="Abishadai" />
                </div>
                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input v-model="modalForm.admin_email" class="form-input" type="email" placeholder="admin@crc.org" />
                </div>
                <div class="form-group">
                  <label class="form-label">Mot de passe</label>
                  <input v-model="modalForm.admin_password" class="form-input" type="password"
                    placeholder="Min. 8 caractères" />
                </div>
              </div>
            </div>

          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="modal.show = false">Annuler</button>
            <button class="btn-primary" @click="saveMinistere" :disabled="saving">
              <span v-if="saving" class="spinner-sm"></span>
              <span v-else>{{ modal.ministere ? 'Mettre à jour' : 'Créer le ministère' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal stats -->
    <Teleport to="body">
      <div v-if="statsModal.show" class="modal-overlay" @click.self="statsModal.show = false">
        <div class="modal-stats">
          <div class="modal-header">
            <div class="modal-title">Statistiques — {{ statsModal.ministere?.nom }}</div>
            <button class="modal-close" @click="statsModal.show = false">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="stats-body" v-if="statsModal.data">
            <div class="stats-cards">
              <div v-for="stat in statsModal.data" :key="stat.module" class="stats-card">
                <div class="stats-card-icon" :style="{ background: getStatColor(stat.module) + '20', color: getStatColor(stat.module) }">
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="getStatIcon(stat.module)" />
                  </svg>
                </div>
                <div>
                  <div class="stats-card-n">{{ stat.total }}</div>
                  <div class="stats-card-l">{{ stat.module }}</div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="stats-loading">
            <span class="spinner-sm" style="border-color:rgba(0,0,0,.1);border-top-color:#1E3A8A"></span>
          </div>
        </div>
      </div>
    </Teleport>

    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.message }}</div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const auth = useAuthStore()

const ministeres = ref([])
const loading = ref(true)
const saving = ref(false)
const search = ref('')
const activeTab = ref('')
const filterType = ref('')
const pagination = ref({ currentPage: 1, lastPage: 1, total: 0 })
const counts = ref({ total: 0, actifs: 0, inactifs: 0 })
const toast = ref({ show: false, type: 'success', message: '' })

const modal = ref({ show: false, ministere: null })
const modalForm = ref({
  nom: '', type: 'eglise', sous_domaine: '', description: '',
  email_contact: '', telephone: '', ville: '', pays: 'République centrafricaine',
  couleur_primaire: '#1E3A8A', couleur_secondaire: '#FFFFFF',
  admin_name: '', admin_prenom: '', admin_email: '', admin_password: '',
})

const statsModal = ref({ show: false, ministere: null, data: null })

// Icônes pour les statistiques
const statIcons = {
  pages: 'M4 7h16M4 7v10a2 2 0 002 2h12a2 2 0 002-2V7M4 7l4-4h8l4 4',
  articles: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15',
  evenements: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  medias: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  messages: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  utilisateurs: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
}

function getStatIcon(module) {
  return statIcons[module] || statIcons.pages
}

function getStatColor(module) {
  const colors = {
    pages: '#3B82F6',
    articles: '#16A34A',
    evenements: '#D97706',
    medias: '#7C3AED',
    messages: '#DC2626',
    utilisateurs: '#0F172A',
    users: '#0F172A', // Alias
    events: '#D97706', // Alias
  }
  return colors[module] || '#64748B'
}

const typeLabels = {
  eglise: 'Église', ministere: 'Ministère',
  organisation: 'Organisation', para_ecclesial: 'Para-ecclésial', mission: 'Mission',
}

const tabs = computed(() => [
  { key: '', label: 'Tous', count: counts.value.total },
  { key: 'actif', label: 'Actifs', count: counts.value.actifs },
  { key: 'inactif', label: 'Inactifs', count: counts.value.inactifs },
])

let searchTimer = null
function debouncedSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => loadMinisteres(), 400)
}

const BASE_URL = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000'

function getFullUrl(path) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/storage/')) return `${BASE_URL}${path}`
  return `${BASE_URL}/storage/${path}`
}

async function loadMinisteres(page = 1) {
  loading.value = true
  try {
    const params = { page, per_page: 12 }
    if (activeTab.value) params.statut = activeTab.value
    if (filterType.value) params.type = filterType.value
    if (search.value) params.search = search.value

    const { data } = await api.get('/admin/ministeres', { params })
    const result = data.data

    ministeres.value = result.data || result
    pagination.value = {
      currentPage: result.current_page || 1,
      lastPage: result.last_page || 1,
      total: result.total || ministeres.value.length,
    }

    // Compter tous les ministères (pas seulement ceux de la page)
    await loadCounts()
  } catch (e) {
    console.error('Erreur chargement ministères:', e)
    showToast('Erreur lors du chargement', 'error')
  } finally {
    loading.value = false
  }
}

async function loadCounts() {
  try {
    const [all, actifs, inactifs] = await Promise.all([
      api.get('/admin/ministeres', { params: { per_page: 1 } }),
      api.get('/admin/ministeres', { params: { per_page: 1, statut: 'actif' } }),
      api.get('/admin/ministeres', { params: { per_page: 1, statut: 'inactif' } }),
    ])
    
    counts.value = {
      total: all.data.data?.total || 0,
      actifs: actifs.data.data?.total || 0,
      inactifs: inactifs.data.data?.total || 0,
    }
  } catch (e) {
    console.error('Erreur chargement compteurs:', e)
  }
}

function openModal(ministere = null) {
  modal.value.ministere = ministere
  modal.value.show = true
  if (ministere) {
    Object.assign(modalForm.value, {
      nom: ministere.nom,
      type: ministere.type || 'eglise',
      sous_domaine: ministere.sous_domaine,
      description: ministere.description || '',
      email_contact: ministere.email_contact || '',
      telephone: ministere.telephone || '',
      ville: ministere.ville || '',
      pays: ministere.pays || 'République centrafricaine',
      couleur_primaire: ministere.couleur_primaire || '#1E3A8A',
      couleur_secondaire: ministere.couleur_secondaire || '#FFFFFF',
    })
  } else {
    Object.assign(modalForm.value, {
      nom: '', type: 'eglise', sous_domaine: '', description: '',
      email_contact: '', telephone: '', ville: '', pays: 'République centrafricaine',
      couleur_primaire: '#1E3A8A', couleur_secondaire: '#FFFFFF',
      admin_name: '', admin_prenom: '', admin_email: '', admin_password: '',
    })
  }
}

async function saveMinistere() {
  if (!modalForm.value.nom.trim() || !modalForm.value.sous_domaine.trim()) {
    showToast('Nom et sous-domaine obligatoires.', 'error')
    return
  }
  saving.value = true
  try {
    const payload = {
      nom: modalForm.value.nom,
      type: modalForm.value.type,
      sous_domaine: modalForm.value.sous_domaine,
      description: modalForm.value.description,
      email_contact: modalForm.value.email_contact,
      telephone: modalForm.value.telephone,
      ville: modalForm.value.ville,
      pays: modalForm.value.pays,
      couleur_primaire: modalForm.value.couleur_primaire,
      couleur_secondaire: modalForm.value.couleur_secondaire,
    }

    if (modal.value.ministere) {
      // Mise à jour
      const { data } = await api.put(`/admin/ministeres/${modal.value.ministere.id}`, payload)
      const idx = ministeres.value.findIndex(m => m.id === modal.value.ministere.id)
      if (idx !== -1) ministeres.value[idx] = { ...ministeres.value[idx], ...data.data }
      showToast('Ministère mis à jour !', 'success')
    } else {
      // Création
      const { data } = await api.post('/admin/ministeres', payload)
      const newMinistere = data.data

      // Créer l'admin si fourni
      if (modalForm.value.admin_email && modalForm.value.admin_password) {
        await api.post('/admin/users', {
          name: modalForm.value.admin_name,
          prenom: modalForm.value.admin_prenom,
          email: modalForm.value.admin_email,
          password: modalForm.value.admin_password,
          role: 'admin_ministere',
          ministere_id: newMinistere.id,
        })
      }

      ministeres.value.unshift(newMinistere)
      showToast('Ministère créé !', 'success')
    }
    modal.value.show = false
    await loadCounts() // Recharger les compteurs
  } catch (e) {
    console.error('Erreur sauvegarde:', e)
    showToast(e.response?.data?.message || 'Erreur lors de la sauvegarde', 'error')
  } finally {
    saving.value = false
  }
}

async function toggleMinistere(min) {
  try {
    const { data } = await api.patch(`/admin/ministeres/${min.id}/toggle`)
    min.statut = data.data?.statut || (min.statut === 'actif' ? 'inactif' : 'actif')
    showToast(`Ministère ${min.statut === 'actif' ? 'activé' : 'désactivé'}.`, 'success')
    await loadCounts() // Recharger les compteurs
  } catch (e) {
    console.error('Erreur toggle:', e)
    showToast('Erreur lors du changement de statut', 'error')
  }
}

async function openStats(min) {
  statsModal.value = { show: true, ministere: min, data: null }
  try {
    // Récupérer les stats depuis l'API
    const { data } = await api.get(`/admin/ministeres/${min.id}/stats`)
    
    // Transformer les données pour l'affichage
    const stats = []
    if (data.data) {
      for (const [key, value] of Object.entries(data.data)) {
        if (value && typeof value === 'object' && value.total !== undefined) {
          stats.push({
            module: key,
            total: value.total || 0
          })
        }
      }
    }
    
    statsModal.value.data = stats.length > 0 ? stats : [
      { module: 'pages', total: min.pages_count || 0 },
      { module: 'articles', total: min.articles_count || 0 },
      { module: 'evenements', total: min.evenements_count || 0 },
      { module: 'medias', total: min.medias_count || 0 },
      { module: 'messages', total: min.messages_count || 0 },
      { module: 'utilisateurs', total: min.utilisateurs_count || 0 },
    ]
  } catch (e) {
    console.error('Erreur chargement stats:', e)
    // Fallback : utiliser les compteurs du ministère
    statsModal.value.data = [
      { module: 'pages', total: min.pages_count || 0 },
      { module: 'articles', total: min.articles_count || 0 },
      { module: 'evenements', total: min.evenements_count || 0 },
      { module: 'medias', total: min.medias_count || 0 },
      { module: 'messages', total: min.messages_count || 0 },
      { module: 'utilisateurs', total: min.utilisateurs_count || 0 },
    ]
    showToast('Utilisation des données locales', 'info')
  }
}

function showToast(message, type = 'success') {
  toast.value = { show: true, type, message }
  setTimeout(() => { toast.value.show = false }, 2500)
}

onMounted(() => loadMinisteres())
</script>

<style scoped>
.stats-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 12px 20px;
  min-width: 140px;
  transition: all .2s;
}
.stat-pill:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,.05);
}

.stat-pill.green {
  border-color: #BBF7D0;
  background: #F0FDF4;
}

.stat-pill.gray {
  border-color: #E2E8F0;
}

.stat-pill svg {
  width: 24px;
  height: 24px;
  opacity: .8;
}

.stat-pill-n {
  font-size: 22px;
  font-weight: 700;
  color: #0F172A;
  line-height: 1.2;
}

.stat-pill.green .stat-pill-n {
  color: #16A34A;
}

.stat-pill-l {
  font-size: 12px;
  color: #64748B;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.toolbar-right {
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

.btn-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #1E3A8A;
  color: #fff;
  border: none;
  padding: 9px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background .12s;
}

.btn-primary:hover:not(:disabled) {
  background: #1e40af;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(30, 58, 138, .2);
}

.btn-primary:disabled {
  opacity: .6;
  cursor: not-allowed;
}

/* Grid ministères */
.ministeres-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.ministere-card {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
  transition: all .2s;
}

.ministere-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, .08);
  transform: translateY(-2px);
  border-color: #CBD5E1;
}

.ministere-card.inactive {
  opacity: .65;
}

.ministere-card-header {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  min-height: 80px;
}

.ministere-logo {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: rgba(255, 255, 255, .2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.ministere-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ministere-logo span {
  color: #fff;
  font-size: 16px;
  font-weight: 700;
}

.ministere-type-badge {
  background: rgba(255, 255, 255, .2);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.ministere-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, .5);
}

.ministere-status-dot.active {
  background: #4ADE80;
}

.ministere-status-dot.inactive {
  background: #94A3B8;
}

.ministere-card-body {
  padding: 16px;
}

.ministere-name {
  font-size: 16px;
  font-weight: 600;
  color: #0F172A;
  margin-bottom: 4px;
}

.ministere-domain {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #3B82F6;
  text-decoration: none;
  font-family: monospace;
  margin-bottom: 8px;
  padding: 2px 8px;
  background: #EFF6FF;
  border-radius: 20px;
}

.ministere-domain:hover {
  background: #DBEAFE;
  color: #1D4ED8;
}

.ministere-desc {
  font-size: 12px;
  color: #64748B;
  line-height: 1.5;
  margin-bottom: 12px;
}

.ministere-stats {
  display: flex;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid #F1F5F9;
}

.m-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.m-stat-n {
  font-size: 18px;
  font-weight: 700;
  color: #0F172A;
}

.m-stat-l {
  font-size: 10px;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: .04em;
}

.ministere-card-actions {
  display: flex;
  gap: 6px;
  padding: 10px 14px 14px;
  border-top: 1px solid #F8FAFC;
  opacity: 0.7;
  transition: opacity .2s;
}
.ministere-card:hover .ministere-card-actions {
  opacity: 1;
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
  transition: all .15s;
}
.action-btn:hover {
  transform: scale(1.05);
  filter: brightness(.95);
}

.action-btn.edit {
  background: #EEF2FF;
  color: #4338CA;
}

.action-btn.activate {
  background: #DCFCE7;
  color: #16A34A;
}

.action-btn.deactivate {
  background: #FEF3C7;
  color: #D97706;
}

.action-btn.stats-btn {
  background: #E0F2FE;
  color: #0369A1;
}

/* Skeleton */
.ministere-skeleton {
  height: 260px;
  border-radius: 12px;
  background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
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
  margin-bottom: 8px;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
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

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
  overflow-y: auto;
  backdrop-filter: blur(4px);
}

.modal-form {
  background: #fff;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, .2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid #F1F5F9;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 1;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #0F172A;
}

.modal-close {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  border: none;
  background: #F1F5F9;
  color: #64748B;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.modal-close:hover {
  background: #E2E8F0;
}

.modal-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 24px;
  border-top: 1px solid #F1F5F9;
  position: sticky;
  bottom: 0;
  background: #fff;
}

.modal-section-title {
  font-size: 11px;
  font-weight: 600;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: .06em;
  margin-bottom: 4px;
}

.mt-16 {
  margin-top: 8px;
}

.admin-section {
  background: #F8FAFC;
  border-radius: 10px;
  padding: 16px;
  border: 1px solid #E2E8F0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group.span-2 {
  grid-column: span 2;
}

.form-label {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.req {
  color: #DC2626;
}

.optional {
  color: #94A3B8;
  font-weight: 400;
}

.form-input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 13px;
  color: #0F172A;
  background: #fff;
  outline: none;
  transition: border-color .15s;
  font-family: inherit;
}

.form-input:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59,130,246,.1);
}

.subdomain-input {
  position: relative;
  display: flex;
  align-items: center;
}

.subdomain-suffix {
  position: absolute;
  right: 10px;
  font-size: 11px;
  color: #94A3B8;
  pointer-events: none;
}

.subdomain-input .form-input {
  padding-right: 110px;
}

.color-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-picker {
  width: 36px;
  height: 36px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  cursor: pointer;
  padding: 2px;
  background: #fff;
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

/* Stats modal */
.modal-stats {
  background: #fff;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, .2);
  max-height: 90vh;
  overflow-y: auto;
}

.stats-body {
  padding: 24px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stats-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #F8FAFC;
  border-radius: 12px;
  padding: 16px;
  transition: all .2s;
}
.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,.05);
}

.stats-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-card-n {
  font-size: 22px;
  font-weight: 700;
  color: #0F172A;
  line-height: 1.2;
}

.stats-card-l {
  font-size: 11px;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: .04em;
}

.stats-loading {
  padding: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  box-shadow: 0 4px 20px rgba(0, 0, 0, .15);
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

.toast.info {
  background: #EFF6FF;
  color: #1E3A8A;
  border: 1px solid #BFDBFE;
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