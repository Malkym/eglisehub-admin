<template>
  <div class="fade-in">
    <div class="profile-layout">

      <!-- Sidebar profil -->
      <div class="profile-sidebar">
        <div class="profile-card">
          <!-- Avatar -->
          <div class="avatar-wrap">
            <div class="avatar-circle" :style="{ background: getColor(userData?.name) }">
              {{ initials }}
            </div>
            <div class="avatar-badge" :class="userData?.role === 'super_admin' ? 'super' : 'admin'">
              {{ userData?.role === 'super_admin' ? 'Super Admin' : 'Admin' }}
            </div>
          </div>
          <div class="profile-name">{{ userData?.name }} {{ userData?.prenom }}</div>
          <div class="profile-email">{{ userData?.email }}</div>
          <div v-if="userData?.ministere" class="profile-ministere">
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/>
            </svg>
            {{ userData.ministere?.nom || 'Ministère non assigné' }}
          </div>
          <div class="profile-since">
            Membre depuis {{ formatDate(userData?.created_at) }}
          </div>
        </div>

        <!-- Navigation sections -->
        <div class="profile-nav">
          <button
            v-for="section in sections"
            :key="section.key"
            class="profile-nav-btn"
            :class="{ active: activeSection === section.key }"
            @click="activeSection = section.key"
          >
            <span v-html="section.icon"></span>
            {{ section.label }}
          </button>
        </div>
      </div>

      <!-- Contenu -->
      <div class="profile-content">

        <!-- Informations personnelles -->
        <div v-if="activeSection === 'info'" class="profile-section">
          <div class="section-header">
            <div class="section-title">Informations personnelles</div>
            <div class="section-sub">Modifiez vos informations de profil</div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Nom <span class="req">*</span></label>
              <input v-model="infoForm.name" class="form-input" placeholder="Mologbama"/>
            </div>
            <div class="form-group">
              <label class="form-label">Prénom</label>
              <input v-model="infoForm.prenom" class="form-input" placeholder="Abishadai"/>
            </div>
            <div class="form-group span-2">
              <label class="form-label">Email <span class="req">*</span></label>
              <input v-model="infoForm.email" class="form-input" type="email"/>
            </div>
            <div class="form-group span-2">
              <label class="form-label">Téléphone <span class="optional">(optionnel)</span></label>
              <input v-model="infoForm.telephone" class="form-input" placeholder="+236 74 02 67 55"/>
            </div>
          </div>
          <div class="form-actions">
            <button class="btn-primary" @click="saveInfo" :disabled="saving === 'info'">
              <span v-if="saving === 'info'" class="spinner-sm"></span>
              <span v-else>Enregistrer</span>
            </button>
          </div>
        </div>

        <!-- Sécurité -->
        <div v-if="activeSection === 'security'" class="profile-section">
          <div class="section-header">
            <div class="section-title">Sécurité</div>
            <div class="section-sub">Changez votre mot de passe</div>
          </div>
          <div class="form-grid" style="max-width:480px">
            <div class="form-group span-2">
              <label class="form-label">Mot de passe actuel <span class="req">*</span></label>
              <div class="password-wrap">
                <input
                  v-model="passwordForm.current"
                  :type="showPasswords.current ? 'text' : 'password'"
                  class="form-input"
                  placeholder="••••••••"
                />
                <button class="eye-btn" @click="showPasswords.current = !showPasswords.current">
                  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="showPasswords.current" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Nouveau mot de passe <span class="req">*</span></label>
              <div class="password-wrap">
                <input
                  v-model="passwordForm.new"
                  :type="showPasswords.new ? 'text' : 'password'"
                  class="form-input"
                  placeholder="Min. 8 caractères"
                />
                <button class="eye-btn" @click="showPasswords.new = !showPasswords.new">
                  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Confirmer <span class="req">*</span></label>
              <div class="password-wrap">
                <input
                  v-model="passwordForm.confirm"
                  :type="showPasswords.confirm ? 'text' : 'password'"
                  class="form-input"
                  placeholder="Répétez le mot de passe"
                />
                <button class="eye-btn" @click="showPasswords.confirm = !showPasswords.confirm">
                  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Indicateur force mot de passe -->
          <div v-if="passwordForm.new" class="password-strength">
            <div class="strength-bars">
              <div v-for="i in 4" :key="i" class="strength-bar"
                :class="{ active: passwordStrength >= i, [`level-${passwordStrength}`]: true }">
              </div>
            </div>
            <span class="strength-label" :class="`strength-${passwordStrength}`">
              {{ strengthLabels[passwordStrength] }}
            </span>
          </div>

          <div class="form-actions">
            <button class="btn-primary" @click="savePassword" :disabled="saving === 'password'">
              <span v-if="saving === 'password'" class="spinner-sm"></span>
              <span v-else>Changer le mot de passe</span>
            </button>
          </div>
        </div>

        <!-- Activité récente -->
        <div v-if="activeSection === 'activity'" class="profile-section">
          <div class="section-header">
            <div class="section-title">Activité récente</div>
            <div class="section-sub">Vos dernières actions sur la plateforme</div>
          </div>

          <div v-if="loadingActivity" class="activity-loading">
            <div v-for="i in 5" :key="i" class="activity-skeleton">
              <div class="sk-dot"></div>
              <div class="sk-lines">
                <div class="sk-line w70"></div>
                <div class="sk-line w40"></div>
              </div>
            </div>
          </div>

          <div v-else-if="activities.length === 0" class="empty-activity">
            <svg width="36" height="36" fill="none" stroke="#94A3B8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <div>Aucune activité récente</div>
          </div>

          <div v-else class="activity-timeline">
            <div v-for="log in activities" :key="log.id" class="activity-item">
              <div class="activity-dot" :class="getActionColor(log.action)"></div>
              <div class="activity-content">
                <div class="activity-action">{{ formatAction(log.action) }}</div>
                <div class="activity-meta">
                  <span class="activity-module">{{ log.module }}</span>
                  <span class="activity-time">{{ timeAgo(log.date_action || log.created_at) }}</span>
                </div>
                <div v-if="log.details" class="activity-details">{{ log.details }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sessions -->
        <div v-if="activeSection === 'sessions'" class="profile-section">
          <div class="section-header">
            <div class="section-title">Sessions actives</div>
            <div class="section-sub">Appareils connectés à votre compte</div>
          </div>
          <div class="sessions-list">
            <div class="session-item current">
              <div class="session-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <div class="session-info">
                <div class="session-device">Session actuelle</div>
                <div class="session-meta">
                  {{ userAgent }} · {{ formatDateTime(userData?.dernier_login) }}
                </div>
              </div>
              <span class="session-badge">Actif maintenant</span>
            </div>
          </div>
          <button class="btn-danger-outline" @click="logoutAll" style="margin-top:16px">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Se déconnecter de toutes les sessions
          </button>
        </div>

      </div>
    </div>

    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.message }}</div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

// Données utilisateur depuis l'API /me
const userData = ref(null)
const loading = ref(true)

const activeSection   = ref('info')
const saving          = ref(null)
const loadingActivity = ref(false)
const activities      = ref([])
const toast           = ref({ show: false, type: 'success', message: '' })
const userAgent       = ref('Navigateur inconnu')

const infoForm = ref({
  name: '',
  prenom: '',
  email: '',
  telephone: '',
})

const passwordForm = ref({ current: '', new: '', confirm: '' })
const showPasswords = ref({ current: false, new: false, confirm: false })

const sections = [
  {
    key: 'info', label: 'Informations',
    icon: `<svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
  },
  {
    key: 'security', label: 'Sécurité',
    icon: `<svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>`,
  },
  {
    key: 'activity', label: 'Activité',
    icon: `<svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>`,
  },
  {
    key: 'sessions', label: 'Sessions',
    icon: `<svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`,
  },
]

const initials = computed(() => {
  if (!userData.value) return 'U'
  const n = userData.value.name?.[0] || ''
  const p = userData.value.prenom?.[0] || ''
  return (n + p).toUpperCase() || 'U'
})

const passwordStrength = computed(() => {
  const p = passwordForm.value.new
  if (!p) return 0
  let score = 0
  if (p.length >= 8)  score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p) && /[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})

const strengthLabels = ['', 'Faible', 'Moyen', 'Bien', 'Fort']

const avatarColors = ['#1E3A8A','#DC2626','#D97706','#16A34A','#7C3AED','#0369A1']
function getColor(name) {
  if (!name) return '#1E3A8A'
  let hash = 0
  for (const c of (name || '')) hash = c.charCodeAt(0) + ((hash << 5) - hash)
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDateTime(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', { 
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function timeAgo(date) {
  if (!date) return '—'
  const diff  = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'À l\'instant'
  if (mins < 60)  return `Il y a ${mins}min`
  if (hours < 24) return `Il y a ${hours}h`
  return `Il y a ${days}j`
}

function formatAction(action) {
  const labels = {
    create: 'Création', update: 'Modification', delete: 'Suppression',
    login: 'Connexion', logout: 'Déconnexion', publish: 'Publication',
    upload: 'Upload fichier', reply: 'Réponse message',
  }
  return labels[action] || action
}

function getActionColor(action) {
  const colors = {
    create: 'green', update: 'blue', delete: 'red',
    login: 'purple', logout: 'gray', publish: 'teal',
  }
  return colors[action] || 'gray'
}

// Charger les données utilisateur
async function loadUserData() {
  loading.value = true
  try {
    const { data } = await api.get('/me')
    userData.value = data.user
    
    // Mettre à jour le formulaire
    infoForm.value = {
      name:      userData.value.name || '',
      prenom:    userData.value.prenom || '',
      email:     userData.value.email || '',
      telephone: userData.value.telephone || '',
    }
    
    // Détecter le user agent
    userAgent.value = navigator.userAgent
      .replace(/Chrome\/\d+/, 'Chrome')
      .replace(/Firefox\/\d+/, 'Firefox')
      .replace(/Safari\/\d+/, 'Safari')
      .split(' ').slice(0, 3).join(' ')
    
  } catch (error) {
    console.error('Erreur chargement profil:', error)
    showToast('Erreur lors du chargement du profil', 'error')
  } finally {
    loading.value = false
  }
}

async function loadActivity() {
  loadingActivity.value = true
  try {
    const { data } = await api.get('/admin/logs', { 
      params: { 
        per_page: 20,
        user_id: userData.value?.id 
      } 
    })
    activities.value = data.data?.data || []
  } catch (error) {
    console.error('Erreur chargement activité:', error)
  } finally {
    loadingActivity.value = false
  }
}

async function saveInfo() {
  if (!infoForm.value.name || !infoForm.value.email) {
    showToast('Nom et email obligatoires.', 'error')
    return
  }
  saving.value = 'info'
  try {
    const { data } = await api.put('/profile', infoForm.value)
    userData.value = { ...userData.value, ...data.user }
    showToast('Profil mis à jour !', 'success')
  } catch (e) {
    showToast(e.response?.data?.message || 'Erreur lors de la mise à jour.', 'error')
  } finally {
    saving.value = null
  }
}

async function savePassword() {
  if (!passwordForm.value.current || !passwordForm.value.new) {
    showToast('Remplissez tous les champs.', 'error')
    return
  }
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    showToast('Les mots de passe ne correspondent pas.', 'error')
    return
  }
  if (passwordForm.value.new.length < 8) {
    showToast('Le mot de passe doit faire au moins 8 caractères.', 'error')
    return
  }
  saving.value = 'password'
  try {
    await api.post('/profile/change-password', {
      current_password: passwordForm.value.current,
      new_password: passwordForm.value.new,
      new_password_confirmation: passwordForm.value.confirm,
    })
    passwordForm.value = { current: '', new: '', confirm: '' }
    showToast('Mot de passe changé !', 'success')
  } catch (e) {
    showToast(e.response?.data?.message || 'Mot de passe actuel incorrect.', 'error')
  } finally {
    saving.value = null
  }
}

async function logoutAll() {
  try {
    await api.post('/logout-all')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  } catch (error) {
    console.error('Erreur déconnexion:', error)
  }
}

function showToast(message, type = 'success') {
  toast.value = { show: true, type, message }
  setTimeout(() => { toast.value.show = false }, 3000)
}

onMounted(() => {
  loadUserData()
})

watch(activeSection, (val) => {
  if (val === 'activity' && activities.value.length === 0 && userData.value) {
    loadActivity()
  }
})
</script>

<style scoped>
.profile-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
  align-items: flex-start;
}
@media (max-width: 768px) {
  .profile-layout { grid-template-columns: 1fr; }
}

/* Sidebar */
.profile-sidebar { display: flex; flex-direction: column; gap: 12px; }

.profile-card {
  background: #fff; border: 1px solid #E2E8F0;
  border-radius: 16px; padding: 24px;
  text-align: center;
}
.avatar-wrap { position: relative; width: fit-content; margin: 0 auto 16px; }
.avatar-circle {
  width: 72px; height: 72px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; font-weight: 700; color: #fff;
  font-family: 'Sora', sans-serif;
}
.avatar-badge {
  position: absolute; bottom: -4px; right: -4px;
  font-size: 9px; font-weight: 700;
  padding: 2px 6px; border-radius: 20px;
  border: 2px solid #fff;
}
.avatar-badge.super { background: #DC2626; color: #fff; }
.avatar-badge.admin { background: #1E3A8A; color: #fff; }

.profile-name  { font-size: 16px; font-weight: 600; color: #0F172A; margin-bottom: 4px; }
.profile-email { font-size: 13px; color: #64748B; margin-bottom: 8px; }
.profile-ministere {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; color: #374151;
  background: #F1F5F9; padding: 3px 10px; border-radius: 20px;
  margin-bottom: 8px;
}
.profile-since { font-size: 11px; color: #94A3B8; }

.profile-nav {
  background: #fff; border: 1px solid #E2E8F0;
  border-radius: 12px; overflow: hidden;
  display: flex; flex-direction: column;
}
.profile-nav-btn {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; border: none; background: transparent;
  font-size: 13px; color: #64748B; cursor: pointer;
  transition: all .12s; text-align: left;
  border-bottom: 1px solid #F8FAFC;
}
.profile-nav-btn:last-child { border-bottom: none; }
.profile-nav-btn:hover { background: #F8FAFC; color: #374151; }
.profile-nav-btn.active {
  background: #EFF6FF; color: #1D4ED8; font-weight: 500;
  border-left: 3px solid #3B82F6;
}

/* Content */
.profile-content {
  background: #fff; border: 1px solid #E2E8F0;
  border-radius: 16px; padding: 28px;
}
.profile-section {}
.section-header { margin-bottom: 24px; }
.section-title { font-size: 18px; font-weight: 600; color: #0F172A; margin-bottom: 4px; }
.section-sub   { font-size: 13px; color: #64748B; }

.form-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;
}
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.span-2 { grid-column: span 2; }
.form-label { font-size: 12px; font-weight: 500; color: #374151; }
.req      { color: #DC2626; }
.optional { color: #94A3B8; font-weight: 400; }
.form-input {
  width: 100%; padding: 10px 14px;
  border: 1px solid #E2E8F0; border-radius: 8px;
  font-size: 14px; color: #0F172A; background: #fff;
  outline: none; transition: border-color .15s; font-family: inherit;
}
.form-input:focus { border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,.08); }

.password-wrap { position: relative; display: flex; align-items: center; }
.password-wrap .form-input { padding-right: 44px; }
.eye-btn {
  position: absolute; right: 12px;
  background: none; border: none; color: #94A3B8; cursor: pointer;
  display: flex; align-items: center;
}
.eye-btn:hover { color: #64748B; }

/* Strength */
.password-strength { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
.strength-bars { display: flex; gap: 4px; }
.strength-bar {
  width: 40px; height: 4px; border-radius: 2px;
  background: #E2E8F0; transition: background .2s;
}
.strength-bar.active.level-1 { background: #DC2626; }
.strength-bar.active.level-2 { background: #D97706; }
.strength-bar.active.level-3 { background: #16A34A; }
.strength-bar.active.level-4 { background: #0369A1; }
.strength-label { font-size: 12px; font-weight: 500; }
.strength-1 { color: #DC2626; }
.strength-2 { color: #D97706; }
.strength-3 { color: #16A34A; }
.strength-4 { color: #0369A1; }

.form-actions { display: flex; justify-content: flex-end; }
.btn-primary {
  display: flex; align-items: center; gap: 6px;
  background: #1E3A8A; color: #fff; border: none;
  padding: 10px 24px; border-radius: 8px;
  font-size: 13px; font-weight: 500; cursor: pointer;
  min-width: 140px; justify-content: center;
  transition: background .12s;
}
.btn-primary:hover:not(:disabled) { background: #1e40af; }
.btn-primary:disabled { opacity: .6; }

/* Activity */
.activity-timeline { display: flex; flex-direction: column; gap: 0; }
.activity-item {
  display: flex; gap: 14px; align-items: flex-start;
  padding: 12px 0; border-bottom: 1px solid #F8FAFC;
}
.activity-item:last-child { border-bottom: none; }
.activity-dot {
  width: 10px; height: 10px; border-radius: 50%;
  flex-shrink: 0; margin-top: 5px;
}
.activity-dot.green  { background: #16A34A; }
.activity-dot.blue   { background: #3B82F6; }
.activity-dot.red    { background: #DC2626; }
.activity-dot.purple { background: #7C3AED; }
.activity-dot.gray   { background: #94A3B8; }
.activity-dot.teal   { background: #0F766E; }
.activity-content { flex: 1; }
.activity-action { font-size: 13px; font-weight: 500; color: #0F172A; margin-bottom: 3px; }
.activity-meta   { display: flex; gap: 10px; margin-bottom: 3px; }
.activity-module { font-size: 11px; color: #3B82F6; font-weight: 500; }
.activity-time   { font-size: 11px; color: #94A3B8; }
.activity-details { font-size: 12px; color: #64748B; }

/* Skeleton activity */
.activity-skeleton {
  display: flex; gap: 14px; align-items: center;
  padding: 12px 0; border-bottom: 1px solid #F8FAFC;
}
.sk-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: #F1F5F9; flex-shrink: 0;
  animation: shimmer 1.5s infinite;
}
.sk-lines { flex: 1; display: flex; flex-direction: column; gap: 5px; }
.sk-line { height: 10px; border-radius: 5px; background: #F1F5F9; animation: shimmer 1.5s infinite; }
.w70 { width: 70%; }
.w40 { width: 40%; }
@keyframes shimmer { 0%,100% { opacity: 1; } 50% { opacity: .5; } }

.empty-activity {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 40px; color: #94A3B8; font-size: 14px;
}

/* Sessions */
.sessions-list { display: flex; flex-direction: column; gap: 10px; }
.session-item {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px; border: 1px solid #E2E8F0;
  border-radius: 10px; transition: background .1s;
}
.session-item.current { border-color: #BFDBFE; background: #EFF6FF; }
.session-icon {
  width: 40px; height: 40px; border-radius: 10px;
  background: #F1F5F9; color: #64748B;
  display: flex; align-items: center; justify-content: center;
}
.session-info { flex: 1; }
.session-device { font-size: 13px; font-weight: 500; color: #0F172A; }
.session-meta   { font-size: 12px; color: #64748B; }
.session-badge {
  font-size: 11px; font-weight: 600;
  padding: 3px 10px; border-radius: 20px;
  background: #DCFCE7; color: #166534;
}
.btn-danger-outline {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 16px; border: 1px solid #FECACA;
  border-radius: 8px; background: #FEF2F2;
  font-size: 13px; color: #DC2626; cursor: pointer;
  transition: all .12s;
}
.btn-danger-outline:hover { background: #FEE2E2; }

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

.spinner-sm {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff; border-radius: 50%;
  animation: spin .6s linear infinite; display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>