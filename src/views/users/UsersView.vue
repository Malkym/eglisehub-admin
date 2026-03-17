<template>
  <div class="fade-in">

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-left">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key; loadUsers()"
        >
          {{ tab.label }}
          <span class="tab-count">{{ tab.count }}</span>
        </button>
      </div>
      <div class="toolbar-right">
        <div class="search-wrap">
          <svg class="search-icon" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input v-model="search" class="search-input" placeholder="Rechercher..." @input="debouncedSearch"/>
        </div>
        <button class="btn-primary" @click="openModal()">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
          </svg>
          Nouvel utilisateur
        </button>
      </div>
    </div>

    <!-- Tableau -->
    <div class="table-container">
      <div class="table-head">
        <div class="th" style="flex:1">Utilisateur</div>
        <div class="th" style="width:140px">Rôle</div>
        <div class="th" style="width:180px">Ministère</div>
        <div class="th" style="width:80px">Statut</div>
        <div class="th" style="width:100px">Créé le</div>
        <div class="th" style="width:100px">Actions</div>
      </div>

      <!-- Loading -->
      <div v-if="loading">
        <div v-for="i in 5" :key="i" class="skeleton-row">
          <div class="sk-avatar"></div>
          <div class="sk-lines">
            <div class="sk-line w60"></div>
            <div class="sk-line w40"></div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="users.length === 0" class="empty-table">
        <div class="empty-icon">👤</div>
        <div class="empty-title">Aucun utilisateur</div>
        <div class="empty-sub">Créez le premier utilisateur</div>
        <button class="btn-primary" @click="openModal()">Créer un utilisateur</button>
      </div>

      <!-- Rows -->
      <div v-else>
        <div
          v-for="user in users"
          :key="user.id"
          class="table-row stagger-item"
          :class="{ inactive: !user.actif }"
        >
          <!-- User info -->
          <div class="td" style="flex:1">
            <div class="user-cell">
              <div class="user-avatar" :style="{ background: getColor(user.name) }">
                {{ (user.name?.[0] || '') + (user.prenom?.[0] || '') }}
              </div>
              <div class="user-info">
                <div class="user-name">{{ user.name }} {{ user.prenom }}</div>
                <div class="user-email">{{ user.email }}</div>
              </div>
            </div>
          </div>

          <!-- Rôle -->
          <div class="td" style="width:140px">
            <span class="badge" :class="user.role === 'super_admin' ? 'badge-red' : 'badge-blue'">
              {{ user.role === 'super_admin' ? 'Super Admin' : 'Admin Ministère' }}
            </span>
          </div>

          <!-- Ministère -->
          <div class="td" style="width:180px">
            <span v-if="user.ministere" class="ministere-tag">
              {{ user.ministere.nom }}
            </span>
            <span v-else class="no-ministere">—</span>
          </div>

          <!-- Statut -->
          <div class="td" style="width:80px">
            <span class="status-dot" :class="user.actif ? 'active' : 'inactive'">
              {{ user.actif ? 'Actif' : 'Inactif' }}
            </span>
          </div>

          <!-- Date -->
          <div class="td date-td" style="width:100px">
            {{ formatDate(user.created_at) }}
          </div>

          <!-- Actions -->
          <div class="td actions-td" style="width:100px" @click.stop>
            <button class="action-btn edit" @click="openModal(user)" title="Modifier">
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button
              class="action-btn"
              :class="user.actif ? 'deactivate' : 'activate'"
              @click="toggleUser(user)"
              :title="user.actif ? 'Désactiver' : 'Activer'"
            >
              <svg v-if="user.actif" width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
              </svg>
              <svg v-else width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </button>
            <button
              v-if="auth.isSuperAdmin"
              class="action-btn impersonate"
              @click="impersonate(user)"
              title="Se connecter en tant que"
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.lastPage > 1" class="pagination">
      <button class="page-btn" :disabled="pagination.currentPage === 1"
        @click="loadUsers(pagination.currentPage - 1)">← Précédent</button>
      <span class="page-info">{{ pagination.currentPage }} / {{ pagination.lastPage }}</span>
      <button class="page-btn" :disabled="pagination.currentPage === pagination.lastPage"
        @click="loadUsers(pagination.currentPage + 1)">Suivant →</button>
    </div>

    <!-- Modal création/édition -->
    <Teleport to="body">
      <div v-if="modal.show" class="modal-overlay" @click.self="modal.show = false">
        <div class="modal-form">
          <div class="modal-header">
            <div class="modal-title">{{ modal.user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur' }}</div>
            <button class="modal-close" @click="modal.show = false">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nom <span class="req">*</span></label>
                <input v-model="modalForm.name" class="form-input" placeholder="Mologbama"/>
              </div>
              <div class="form-group">
                <label class="form-label">Prénom</label>
                <input v-model="modalForm.prenom" class="form-input" placeholder="Abishadai"/>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Email <span class="req">*</span></label>
              <input v-model="modalForm.email" class="form-input" type="email" placeholder="admin@crc.org"/>
            </div>
            <div class="form-group">
              <label class="form-label">
                Mot de passe
                <span class="optional">{{ modal.user ? '(laisser vide pour ne pas changer)' : '*' }}</span>
              </label>
              <input v-model="modalForm.password" class="form-input" type="password" placeholder="Min. 8 caractères"/>
            </div>
            <div class="form-group" v-if="auth.isSuperAdmin">
              <label class="form-label">Rôle <span class="req">*</span></label>
              <select v-model="modalForm.role" class="form-input">
                <option value="admin_ministere">Admin Ministère</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div class="form-group" v-if="auth.isSuperAdmin && modalForm.role === 'admin_ministere'">
              <label class="form-label">Ministère <span class="req">*</span></label>
              <select v-model="modalForm.ministere_id" class="form-input">
                <option value="">Choisir un ministère...</option>
                <option v-for="m in ministeresList" :key="m.id" :value="m.id">
                  {{ m.nom }}
                </option>
              </select>
            </div>
            <div class="toggle-row">
              <span class="toggle-label">Compte actif</span>
              <label class="toggle">
                <input type="checkbox" v-model="modalForm.actif"/>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="modal.show = false">Annuler</button>
            <button class="btn-primary" @click="saveUser" :disabled="saving">
              <span v-if="saving" class="spinner-sm"></span>
              <span v-else>{{ modal.user ? 'Mettre à jour' : 'Créer' }}</span>
            </button>
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
import { useRouter } from 'vue-router'
import api from '@/services/api'

const auth   = useAuthStore()
const router = useRouter()

const users          = ref([])
const ministeresList = ref([])
const loading        = ref(true)
const saving         = ref(false)
const search         = ref('')
const activeTab      = ref('')
const pagination     = ref({ currentPage: 1, lastPage: 1, total: 0 })
const counts         = ref({ all: 0, super_admin: 0, admin_ministere: 0 })
const toast          = ref({ show: false, type: 'success', message: '' })

const modal     = ref({ show: false, user: null })
const modalForm = ref({
  name: '', prenom: '', email: '', password: '',
  role: 'admin_ministere', ministere_id: '', actif: true,
})

const tabs = computed(() => [
  { key: '',               label: 'Tous',            count: counts.value.all },
  { key: 'super_admin',    label: 'Super Admins',    count: counts.value.super_admin },
  { key: 'admin_ministere',label: 'Admins Ministère',count: counts.value.admin_ministere },
])

const avatarColors = [
  '#1E3A8A','#DC2626','#D97706','#16A34A',
  '#7C3AED','#0369A1','#BE185D','#0F766E',
]
function getColor(name) {
  let hash = 0
  for (const c of (name || '')) hash = c.charCodeAt(0) + ((hash << 5) - hash)
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: '2-digit' })
}

let searchTimer = null
function debouncedSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => loadUsers(), 400)
}

async function loadUsers(page = 1) {
  loading.value = true
  try {
    const isAdmin = auth.isSuperAdmin
    const endpoint = isAdmin ? '/admin/users' : '/ministry/users'
    const params = { page, per_page: 20 }
    if (activeTab.value) params.role = activeTab.value
    if (search.value)    params.search = search.value
    if (!isAdmin && auth.user?.ministere_id) params.ministere_id = auth.user.ministere_id

    const { data } = await api.get(endpoint, { params })
    const result = data.data
    users.value = result.data || result
    pagination.value = {
      currentPage: result.current_page || 1,
      lastPage:    result.last_page    || 1,
      total:       result.total        || users.value.length,
    }
    counts.value = {
      all:             users.value.length,
      super_admin:     users.value.filter(u => u.role === 'super_admin').length,
      admin_ministere: users.value.filter(u => u.role === 'admin_ministere').length,
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function loadMinisteres() {
  try {
    const { data } = await api.get('/admin/ministeres', { params: { per_page: 100 } })
    ministeresList.value = data.data?.data || data.data || []
  } catch {}
}

function openModal(user = null) {
  modal.value.user = user
  modal.value.show = true
  if (user) {
    Object.assign(modalForm.value, {
      name:         user.name,
      prenom:       user.prenom || '',
      email:        user.email,
      password:     '',
      role:         user.role,
      ministere_id: user.ministere_id || '',
      actif:        user.actif,
    })
  } else {
    Object.assign(modalForm.value, {
      name: '', prenom: '', email: '', password: '',
      role: auth.isSuperAdmin ? 'admin_ministere' : 'admin_ministere',
      ministere_id: auth.isSuperAdmin ? '' : auth.user?.ministere_id,
      actif: true,
    })
  }
}

async function saveUser() {
  if (!modalForm.value.name.trim() || !modalForm.value.email.trim()) {
    showToast('Nom et email obligatoires.', 'error')
    return
  }
  if (!modal.value.user && !modalForm.value.password) {
    showToast('Mot de passe obligatoire pour un nouvel utilisateur.', 'error')
    return
  }
  saving.value = true
  try {
    const isAdmin    = auth.isSuperAdmin
    const endpoint   = isAdmin ? '/admin/users' : '/ministry/users'
    const payload    = { ...modalForm.value }
    if (!payload.password) delete payload.password
    if (!isAdmin) delete payload.role

    if (modal.value.user) {
      const { data } = await api.put(`${endpoint}/${modal.value.user.id}`, payload)
      const idx = users.value.findIndex(u => u.id === modal.value.user.id)
      if (idx !== -1) users.value[idx] = { ...users.value[idx], ...data.data }
      showToast('Utilisateur mis à jour !', 'success')
    } else {
      const { data } = await api.post(endpoint, payload)
      users.value.unshift(data.data)
      showToast('Utilisateur créé !', 'success')
    }
    modal.value.show = false
  } catch (e) {
    showToast(e.response?.data?.message || 'Erreur.', 'error')
  } finally {
    saving.value = false
  }
}

async function toggleUser(user) {
  try {
    if (auth.isSuperAdmin) {
      await api.patch(`/admin/users/${user.id}/toggle`)
    } else {
      await api.put(`/ministry/users/${user.id}`, { actif: !user.actif })
    }
    user.actif = !user.actif
    showToast(`Compte ${user.actif ? 'activé' : 'désactivé'}.`, 'success')
  } catch (e) {
    showToast('Erreur.', 'error')
  }
}

async function impersonate(user) {
  try {
    const { data } = await api.post(`/admin/users/${user.id}/impersonate`)
    // Sauvegarder le token actuel pour revenir
    const currentToken = localStorage.getItem('token')
    localStorage.setItem('token_before_impersonate', currentToken)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    showToast(`Connecté en tant que ${user.name} !`, 'success')
    setTimeout(() => { window.location.href = '/dashboard' }, 1000)
  } catch (e) {
    showToast('Erreur.', 'error')
  }
}

function showToast(message, type = 'success') {
  toast.value = { show: true, type, message }
  setTimeout(() => { toast.value.show = false }, 2500)
}

onMounted(() => {
  loadUsers()
  if (auth.isSuperAdmin) loadMinisteres()
})
</script>

<style scoped>
.toolbar {
  display: flex; align-items: center;
  justify-content: space-between;
  margin-bottom: 16px; gap: 12px; flex-wrap: wrap;
}
.toolbar-left  { display: flex; gap: 4px; }
.toolbar-right { display: flex; gap: 8px; align-items: center; }

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

.search-wrap { position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 10px; color: #94A3B8; pointer-events: none; }
.search-input {
  padding: 8px 12px 8px 32px; border: 1px solid #E2E8F0;
  border-radius: 8px; font-size: 13px; color: #0F172A;
  background: #fff; outline: none; width: 200px;
}
.search-input:focus { border-color: #3B82F6; }
.btn-primary {
  display: flex; align-items: center; gap: 6px;
  background: #1E3A8A; color: #fff; border: none;
  padding: 9px 16px; border-radius: 8px;
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: background .12s;
}
.btn-primary:hover:not(:disabled) { background: #1e40af; }
.btn-primary:disabled { opacity: .6; }

/* Table */
.table-container {
  background: #fff; border: 1px solid #E2E8F0;
  border-radius: 12px; overflow: hidden;
}
.table-head {
  display: flex; padding: 10px 16px;
  background: #F8FAFC; border-bottom: 1px solid #E2E8F0;
}
.th {
  font-size: 11px; font-weight: 600; color: #94A3B8;
  text-transform: uppercase; letter-spacing: .06em;
}
.table-row {
  display: flex; align-items: center; padding: 12px 16px;
  border-bottom: 1px solid #F8FAFC; transition: background .1s;
}
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: #FAFBFC; }
.table-row.inactive { opacity: .6; }
.td { display: flex; align-items: center; font-size: 13px; }

.user-cell { display: flex; align-items: center; gap: 10px; }
.user-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0;
  text-transform: uppercase;
}
.user-name  { font-size: 13px; font-weight: 500; color: #0F172A; }
.user-email { font-size: 11px; color: #94A3B8; }

.badge {
  display: inline-flex; padding: 2px 8px;
  border-radius: 20px; font-size: 11px; font-weight: 500;
}
.badge-red  { background: #FEE2E2; color: #991B1B; }
.badge-blue { background: #DBEAFE; color: #1D4ED8; }

.ministere-tag {
  font-size: 12px; color: #374151;
  background: #F1F5F9; padding: 2px 8px; border-radius: 6px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px;
}
.no-ministere { color: #CBD5E1; font-size: 13px; }

.status-dot {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 500;
}
.status-dot::before {
  content: ''; width: 6px; height: 6px; border-radius: 50%;
}
.status-dot.active  { color: #16A34A; }
.status-dot.active::before  { background: #16A34A; }
.status-dot.inactive{ color: #94A3B8; }
.status-dot.inactive::before{ background: #94A3B8; }

.date-td { font-size: 12px; color: #94A3B8; }

.actions-td { display: flex; gap: 4px; }
.action-btn {
  width: 28px; height: 28px; border-radius: 6px;
  border: none; display: flex; align-items: center;
  justify-content: center; cursor: pointer; transition: all .1s;
}
.action-btn.edit        { background: #EEF2FF; color: #4338CA; }
.action-btn.activate    { background: #DCFCE7; color: #16A34A; }
.action-btn.deactivate  { background: #FEF3C7; color: #D97706; }
.action-btn.impersonate { background: #E0F2FE; color: #0369A1; }
.action-btn:hover { filter: brightness(.9); }

/* Skeleton */
.skeleton-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; border-bottom: 1px solid #F8FAFC;
}
.sk-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: #F1F5F9; flex-shrink: 0;
  animation: shimmer 1.5s infinite;
}
.sk-lines { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.sk-line {
  height: 11px; border-radius: 6px; background: #F1F5F9;
  animation: shimmer 1.5s infinite;
}
.w60 { width: 60%; }
.w40 { width: 40%; }
@keyframes shimmer {
  0%,100% { opacity: 1; }
  50%      { opacity: .5; }
}

/* Empty */
.empty-table {
  display: flex; flex-direction: column;
  align-items: center; gap: 8px; padding: 48px; text-align: center;
}
.empty-icon  { font-size: 36px; }
.empty-title { font-size: 16px; font-weight: 600; color: #0F172A; }
.empty-sub   { font-size: 13px; color: #94A3B8; margin-bottom: 8px; }

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

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; padding: 20px;
}
.modal-form {
  background: #fff; border-radius: 16px;
  width: 90%; max-width: 480px; max-height: 90vh;
  overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,.2);
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px; border-bottom: 1px solid #F1F5F9;
  position: sticky; top: 0; background: #fff; z-index: 1;
}
.modal-title  { font-size: 16px; font-weight: 600; color: #0F172A; }
.modal-close {
  width: 30px; height: 30px; border-radius: 7px;
  border: none; background: #F1F5F9; color: #64748B;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.modal-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 14px 20px; border-top: 1px solid #F1F5F9;
}

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-label { font-size: 12px; font-weight: 500; color: #374151; }
.req      { color: #DC2626; }
.optional { color: #94A3B8; font-weight: 400; font-size: 11px; }
.form-input {
  width: 100%; padding: 9px 12px;
  border: 1px solid #E2E8F0; border-radius: 8px;
  font-size: 13px; color: #0F172A; background: #fff;
  outline: none; transition: border-color .15s; font-family: inherit;
}
.form-input:focus { border-color: #3B82F6; }
.toggle-row {
  display: flex; align-items: center;
  justify-content: space-between; font-size: 13px;
}
.toggle-label { color: #374151; }
.toggle { position: relative; width: 36px; height: 20px; cursor: pointer; }
.toggle input { display: none; }
.toggle-slider {
  position: absolute; inset: 0;
  background: #E2E8F0; border-radius: 10px; transition: background .2s;
}
.toggle-slider::after {
  content: ''; position: absolute;
  top: 2px; left: 2px; width: 16px; height: 16px;
  background: #fff; border-radius: 50%; transition: transform .2s;
  box-shadow: 0 1px 3px rgba(0,0,0,.2);
}
.toggle input:checked + .toggle-slider { background: #1E3A8A; }
.toggle input:checked + .toggle-slider::after { transform: translateX(16px); }
.btn-secondary {
  padding: 9px 18px; border: 1px solid #E2E8F0;
  border-radius: 8px; background: #fff;
  font-size: 13px; color: #374151; cursor: pointer;
}

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
.spinner-sm {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff; border-radius: 50%;
  animation: spin .6s linear infinite; display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>