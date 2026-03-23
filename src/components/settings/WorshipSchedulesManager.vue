<template>
  <div class="worship-schedules-manager">
    <div class="manager-header">
      <h2 class="manager-title">Horaires des cultes</h2>
      <button class="btn-primary" @click="openModal()">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Ajouter un horaire
      </button>
    </div>

    <div v-if="loading" class="loading-spinner"></div>

    <div v-else-if="schedules.length === 0" class="empty-state">
      <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <p>Aucun horaire de culte configuré</p>
      <button class="btn-outline" @click="openModal()">Ajouter le premier horaire</button>
    </div>

    <div v-else class="schedules-list">
      <div v-for="schedule in sortedSchedules" :key="schedule.id" class="schedule-card" :class="{ inactive: !schedule.is_active }">
        <div class="schedule-drag-handle" @mousedown="startDrag($event, schedule)">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"/>
          </svg>
        </div>
        
        <div class="schedule-content">
          <div class="schedule-main">
            <div class="schedule-day">
              <select v-model="schedule.jour" @change="updateSchedule(schedule)" class="day-select">
                <option value="monday">Lundi</option>
                <option value="tuesday">Mardi</option>
                <option value="wednesday">Mercredi</option>
                <option value="thursday">Jeudi</option>
                <option value="friday">Vendredi</option>
                <option value="saturday">Samedi</option>
                <option value="sunday">Dimanche</option>
              </select>
            </div>
            <div class="schedule-time">
              <input type="time" v-model="schedule.heure_debut" @change="updateSchedule(schedule)" class="time-input" />
              <span>–</span>
              <input type="time" v-model="schedule.heure_fin" @change="updateSchedule(schedule)" class="time-input" />
            </div>
          </div>
          
          <div class="schedule-options">
            <label class="toggle-label">
              <span class="toggle-text">Principal</span>
              <label class="toggle">
                <input type="checkbox" v-model="schedule.is_highlight" @change="updateSchedule(schedule)" />
                <span class="toggle-slider"></span>
              </label>
            </label>
            
            <label class="toggle-label">
              <span class="toggle-text">Actif</span>
              <label class="toggle">
                <input type="checkbox" v-model="schedule.is_active" @change="updateSchedule(schedule)" />
                <span class="toggle-slider"></span>
              </label>
            </label>
          </div>
          
          <div class="schedule-note">
            <input 
              type="text" 
              v-model="schedule.note" 
              @blur="updateSchedule(schedule)"
              placeholder="Note supplémentaire (optionnel)" 
              class="note-input"
            />
          </div>
        </div>
        
        <button class="delete-btn" @click="deleteSchedule(schedule.id)">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Modal d'ajout -->
    <div v-if="modalOpen" class="modal-overlay" @click.self="modalOpen = false">
      <div class="modal-form">
        <div class="modal-header">
          <h3>Ajouter un horaire de culte</h3>
          <button class="modal-close" @click="modalOpen = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Jour <span class="required">*</span></label>
            <select v-model="newSchedule.jour" class="form-input">
              <option value="monday">Lundi</option>
              <option value="tuesday">Mardi</option>
              <option value="wednesday">Mercredi</option>
              <option value="thursday">Jeudi</option>
              <option value="friday">Vendredi</option>
              <option value="saturday">Samedi</option>
              <option value="sunday">Dimanche</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Heure de début <span class="required">*</span></label>
              <input type="time" v-model="newSchedule.heure_debut" class="form-input" />
            </div>
            <div class="form-group">
              <label>Heure de fin <span class="required">*</span></label>
              <input type="time" v-model="newSchedule.heure_fin" class="form-input" />
            </div>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="newSchedule.is_highlight" />
              Mettre en avant (Principal)
            </label>
          </div>
          <div class="form-group">
            <label>Note (optionnel)</label>
            <input type="text" v-model="newSchedule.note" class="form-input" placeholder="Ex: Culte de louange" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="modalOpen = false">Annuler</button>
          <button class="btn-primary" @click="addSchedule" :disabled="saving">
            <span v-if="saving" class="spinner-sm"></span>
            <span v-else>Ajouter</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        <svg v-if="toast.type === 'success'" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-if="toast.type === 'error'" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-if="toast.type === 'warning'" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const loading = ref(false)
const saving = ref(false)
const modalOpen = ref(false)
const schedules = ref([])
const dragStartIndex = ref(null)

// Toast system
const toast = ref({
  show: false,
  type: 'success',
  message: '',
  timeout: null
})

function showToast(message, type = 'success', duration = 3000) {
  // Clear existing timeout
  if (toast.value.timeout) {
    clearTimeout(toast.value.timeout)
  }
  
  toast.value = {
    show: true,
    type,
    message,
    timeout: setTimeout(() => {
      toast.value.show = false
    }, duration)
  }
}

const newSchedule = ref({
  jour: 'sunday',
  heure_debut: '09:00',
  heure_fin: '12:00',
  is_highlight: false,
  note: '',
  is_active: true
})

// Formater l'heure au format HH:MM
function formatTime(time) {
  if (!time) return ''
  if (typeof time === 'string' && /^\d{2}:\d{2}$/.test(time)) {
    return time
  }
  return time
}

const sortedSchedules = computed(() => {
  const order = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  return [...schedules.value].sort((a, b) => {
    const indexA = order.indexOf(a.jour)
    const indexB = order.indexOf(b.jour)
    return (a.ordre || indexA) - (b.ordre || indexB)
  })
})

async function loadSchedules() {
  loading.value = true
  try {
    const { data } = await api.get('/ministry/worship-schedules', {
      params: { ministere_id: auth.user?.ministere_id }
    })
    schedules.value = data.data || []
  } catch (e) {
    console.error('Erreur chargement horaires:', e)
    showToast('Erreur lors du chargement des horaires', 'error')
  } finally {
    loading.value = false
  }
}

async function addSchedule() {
  // Validation
  if (!newSchedule.value.jour) {
    showToast('Veuillez sélectionner un jour', 'warning')
    return
  }
  
  if (!newSchedule.value.heure_debut) {
    showToast('Veuillez renseigner l\'heure de début', 'warning')
    return
  }
  
  if (!newSchedule.value.heure_fin) {
    showToast('Veuillez renseigner l\'heure de fin', 'warning')
    return
  }
  
  saving.value = true
  try {
    const dataToSend = {
      ...newSchedule.value,
      heure_debut: formatTime(newSchedule.value.heure_debut),
      heure_fin: formatTime(newSchedule.value.heure_fin),
      ministere_id: auth.user?.ministere_id
    }
    
    const { data } = await api.post('/ministry/worship-schedules', dataToSend)
    schedules.value.push(data.data)
    modalOpen.value = false
    
    // Réinitialiser le formulaire
    newSchedule.value = {
      jour: 'sunday',
      heure_debut: '09:00',
      heure_fin: '12:00',
      is_highlight: false,
      note: '',
      is_active: true
    }
    
    showToast('Horaire ajouté avec succès', 'success')
  } catch (e) {
    console.error('Erreur ajout:', e)
    
    // Gestion détaillée des erreurs
    if (e.response?.data?.errors) {
      const errors = Object.values(e.response.data.errors).flat()
      showToast(errors.join(', '), 'error')
    } else if (e.response?.data?.message) {
      showToast(e.response.data.message, 'error')
    } else {
      showToast('Erreur lors de l\'ajout de l\'horaire', 'error')
    }
  } finally {
    saving.value = false
  }
}

async function updateSchedule(schedule) {
  // Sauvegarder l'état original en cas d'erreur
  const originalSchedule = { ...schedule }
  
  try {
    const dataToSend = {
      ...schedule,
      heure_debut: formatTime(schedule.heure_debut),
      heure_fin: formatTime(schedule.heure_fin)
    }
    
    await api.put(`/ministry/worship-schedules/${schedule.id}`, dataToSend)
    showToast('Horaire mis à jour', 'success')
  } catch (e) {
    console.error('Erreur mise à jour:', e)
    
    // Restaurer l'état original en cas d'erreur
    Object.assign(schedule, originalSchedule)
    
    if (e.response?.data?.errors) {
      const errors = Object.values(e.response.data.errors).flat()
      showToast(errors.join(', '), 'error')
    } else {
      showToast('Erreur lors de la mise à jour', 'error')
    }
  }
}

async function deleteSchedule(id) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet horaire ?')) return
  
  try {
    await api.delete(`/ministry/worship-schedules/${id}`)
    schedules.value = schedules.value.filter(s => s.id !== id)
    showToast('Horaire supprimé avec succès', 'success')
  } catch (e) {
    console.error('Erreur suppression:', e)
    showToast('Erreur lors de la suppression', 'error')
  }
}

function startDrag(event, schedule) {
  dragStartIndex.value = schedules.value.findIndex(s => s.id === schedule.id)
  event.dataTransfer?.setData('text/plain', dragStartIndex.value)
}

function openModal() {
  // Réinitialiser le formulaire
  newSchedule.value = {
    jour: 'sunday',
    heure_debut: '09:00',
    heure_fin: '12:00',
    is_highlight: false,
    note: '',
    is_active: true
  }
  modalOpen.value = true
}

// Nettoyer le timeout du toast à la destruction du composant
onUnmounted(() => {
  if (toast.value.timeout) {
    clearTimeout(toast.value.timeout)
  }
})

onMounted(() => {
  loadSchedules()
})
</script>

<style scoped>
.worship-schedules-manager {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.manager-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-dark);
}

.schedules-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schedule-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 16px;
  transition: all .15s;
}

.schedule-card.inactive {
  opacity: 0.6;
  background: #F1F5F9;
}

.schedule-drag-handle {
  cursor: grab;
  color: #94A3B8;
  padding: 4px;
}

.schedule-drag-handle:active {
  cursor: grabbing;
}

.schedule-content {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.schedule-main {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.day-select {
  padding: 6px 12px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  background: #fff;
}

.schedule-time {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-input {
  padding: 6px 10px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 13px;
  font-family: monospace;
}

.schedule-options {
  display: flex;
  gap: 16px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-muted);
}

.toggle {
  position: relative;
  width: 36px;
  height: 20px;
  cursor: pointer;
}

.toggle input {
  display: none;
}

.toggle-slider {
  position: absolute;
  inset: 0;
  background: #E2E8F0;
  border-radius: 10px;
  transition: background .2s;
}

.toggle-slider::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: transform .2s;
  box-shadow: 0 1px 3px rgba(0,0,0,.2);
}

.toggle input:checked + .toggle-slider {
  background: #1E3A8A;
}

.toggle input:checked + .toggle-slider::after {
  transform: translateX(16px);
}

.note-input {
  width: 200px;
  padding: 6px 12px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 12px;
  background: #fff;
}

.delete-btn {
  background: none;
  border: none;
  color: #94A3B8;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all .15s;
}

.delete-btn:hover {
  color: #DC2626;
  background: #FEF2F2;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-form {
  background: #fff;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #E2E8F0;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #94A3B8;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #E2E8F0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-dark);
}

.required {
  color: #DC2626;
  font-size: 11px;
  margin-left: 2px;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #1E3A8A;
  box-shadow: 0 0 0 3px rgba(30,58,138,.1);
}

.btn-primary, .btn-secondary, .btn-outline {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all .15s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-primary {
  background: #1E3A8A;
  color: #fff;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background: #1e40af;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #fff;
  border: 1px solid #E2E8F0;
  color: var(--color-dark);
}

.btn-secondary:hover {
  background: #F8FAFC;
}

.btn-outline {
  background: none;
  border: 1px solid #E2E8F0;
  color: var(--color-primary);
}

.btn-outline:hover {
  background: #F8FAFC;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #E2E8F0;
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin .6s linear infinite;
  margin: 40px auto;
}

.spinner-sm {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .6s linear infinite;
  display: inline-block;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: #94A3B8;
}

.empty-state svg {
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Toast Notifications */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  z-index: 1100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, .15);
  max-width: 400px;
  animation: slideIn 0.3s ease;
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

.toast.warning {
  background: #FFFBEB;
  color: #D97706;
  border: 1px solid #FEF3C7;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>