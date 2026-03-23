<template>
  <div class="fade-in">

    <div class="toolbar">
      <div class="toolbar-left">
        <span class="page-desc">{{ faqs.length }} question(s) configurée(s)</span>
      </div>
      <button class="btn-primary" @click="openModal()">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
        </svg>
        Ajouter une FAQ
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="faq-list">
      <div v-for="i in 4" :key="i" class="faq-skeleton">
        <div class="sk-lines">
          <div class="sk-line w60"></div>
          <div class="sk-line w80"></div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="faqs.length === 0" class="empty-state">
      <svg width="48" height="48" fill="none" stroke="#94A3B8" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <div class="empty-title">Aucune FAQ</div>
      <div class="empty-sub">Ajoutez des questions fréquentes pour aider vos visiteurs</div>
      <button class="btn-primary" @click="openModal()">Ajouter la première FAQ</button>
    </div>

    <!-- Liste FAQ -->
    <div v-else class="faq-list">
      <div
        v-for="faq in faqsSorted"
        :key="faq.id"
        class="faq-item stagger-item"
        :class="{ inactive: !faq.actif }"
      >
        <div class="faq-order">{{ faq.ordre }}</div>
        <div class="faq-content">
          <div class="faq-question">{{ faq.question }}</div>
          <div class="faq-answer">{{ faq.reponse }}</div>
          <div v-if="faq.categorie" class="faq-cat">{{ faq.categorie }}</div>
        </div>
        <div class="faq-actions">
          <button
            class="action-btn"
            :class="faq.actif ? 'active-btn' : 'inactive-btn'"
            @click="toggleFaq(faq)"
            :title="faq.actif ? 'Désactiver' : 'Activer'"
          >
            <svg v-if="faq.actif" width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            <svg v-else width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
            </svg>
          </button>
          <button class="action-btn edit-btn" @click="openModal(faq)">
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button class="action-btn delete-btn" @click="confirmDelete(faq)">
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal ajout/édition -->
    <Teleport to="body">
      <div v-if="modal.show" class="modal-overlay" @click.self="modal.show = false">
        <div class="modal-form">
          <div class="modal-header">
            <div class="modal-title">{{ modal.faq ? 'Modifier la FAQ' : 'Nouvelle FAQ' }}</div>
            <button class="modal-close" @click="modal.show = false">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Question <span class="req">*</span></label>
              <input v-model="modalForm.question" class="form-input" placeholder="Comment nous rejoindre ?"/>
            </div>
            <div class="form-group">
              <label class="form-label">Réponse <span class="req">*</span></label>
              <textarea v-model="modalForm.reponse" class="form-input" rows="4"
                placeholder="Rédigez la réponse ici..."></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Catégorie <span class="optional">(optionnel)</span></label>
                <input v-model="modalForm.categorie" class="form-input"
                  placeholder="Général, Activités..." list="faq-cats"/>
                <datalist id="faq-cats">
                  <option value="Général"/>
                  <option value="Activités"/>
                  <option value="Localisation"/>
                  <option value="Dons"/>
                </datalist>
              </div>
              <div class="form-group">
                <label class="form-label">Ordre</label>
                <input v-model.number="modalForm.ordre" class="form-input" type="number" min="0" placeholder="0"/>
              </div>
            </div>
            <div class="toggle-row">
              <span class="toggle-label">Active</span>
              <label class="toggle">
                <input type="checkbox" v-model="modalForm.actif"/>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="modal.show = false">Annuler</button>
            <button class="btn-primary" @click="saveFaq" :disabled="saving">
              <span v-if="saving" class="spinner-sm"></span>
              <span v-else>{{ modal.faq ? 'Mettre à jour' : 'Ajouter' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal suppression -->
    <Teleport to="body">
      <div v-if="deleteModal.show" class="modal-overlay" @click.self="deleteModal.show = false">
        <div class="modal-sm">
          <div class="modal-icon danger">
            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </div>
          <div class="modal-title">Supprimer cette FAQ ?</div>
          <div class="modal-sub">{{ deleteModal.faq?.question }}</div>
          <div class="modal-actions">
            <button class="btn-secondary" @click="deleteModal.show = false">Annuler</button>
            <button class="btn-danger" @click="deleteFaq" :disabled="deleteModal.loading">
              <span v-if="!deleteModal.loading">Supprimer</span>
              <span v-else class="spinner-sm"></span>
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
import api from '@/services/api'

const auth  = useAuthStore()
const faqs  = ref([])
const loading = ref(true)
const saving  = ref(false)
const toast   = ref({ show: false, type: 'success', message: '' })

const modal = ref({ show: false, faq: null })
const modalForm = ref({ question: '', reponse: '', categorie: '', ordre: 0, actif: true })
const deleteModal = ref({ show: false, faq: null, loading: false })

const faqsSorted = computed(() => [...faqs.value].sort((a, b) => a.ordre - b.ordre))

async function loadFaqs() {
  loading.value = true
  try {
    const params = {}
    if (auth.user?.ministere_id) params.ministere_id = auth.user.ministere_id
    const { data } = await api.get('/ministry/faq', { params })
    faqs.value = data.data || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

function openModal(faq = null) {
  modal.value.faq  = faq
  modal.value.show = true
  if (faq) {
    Object.assign(modalForm.value, {
      question: faq.question, reponse: faq.reponse,
      categorie: faq.categorie || '', ordre: faq.ordre, actif: faq.actif,
    })
  } else {
    Object.assign(modalForm.value, {
      question: '', reponse: '', categorie: '', ordre: faqs.value.length, actif: true,
    })
  }
}

async function saveFaq() {
  if (!modalForm.value.question.trim() || !modalForm.value.reponse.trim()) {
    showToast('Question et réponse obligatoires.', 'error')
    return
  }
  saving.value = true
  try {
    const payload = {
      ...modalForm.value,
      ministere_id: auth.user?.ministere_id || 1,
    }
    if (modal.value.faq) {
      await api.put(`/ministry/faq/${modal.value.faq.id}`, payload)
      const idx = faqs.value.findIndex(f => f.id === modal.value.faq.id)
      if (idx !== -1) faqs.value[idx] = { ...faqs.value[idx], ...modalForm.value }
      showToast('FAQ mise à jour !', 'success')
    } else {
      const { data } = await api.post('/ministry/faq', payload)
      faqs.value.push(data.data)
      showToast('FAQ ajoutée !', 'success')
    }
    modal.value.show = false
  } catch (e) {
    showToast('Erreur lors de la sauvegarde.', 'error')
  } finally {
    saving.value = false
  }
}

async function toggleFaq(faq) {
  try {
    await api.patch(`/ministry/faq/${faq.id}/toggle`)
    faq.actif = !faq.actif
    showToast(faq.actif ? 'FAQ activée' : 'FAQ désactivée', 'success')
  } catch (e) { 
    console.error(e)
    showToast('Erreur lors du changement de statut', 'error')
  }
}

function confirmDelete(faq) {
  deleteModal.value = { show: true, faq, loading: false }
}

async function deleteFaq() {
  deleteModal.value.loading = true
  try {
    await api.delete(`/ministry/faq/${deleteModal.value.faq.id}`)
    faqs.value = faqs.value.filter(f => f.id !== deleteModal.value.faq.id)
    deleteModal.value.show = false
    showToast('FAQ supprimée.', 'success')
  } catch (e) {
    showToast('Erreur lors de la suppression.', 'error')
  } finally {
    deleteModal.value.loading = false
  }
}

function showToast(message, type = 'success') {
  toast.value = { show: true, type, message }
  setTimeout(() => { toast.value.show = false }, 2500)
}

onMounted(() => loadFaqs())
</script>

<style scoped>
.toolbar {
  display: flex; align-items: center;
  justify-content: space-between; margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}
.page-desc { font-size: 13px; color: #64748B; }
.btn-primary {
  display: flex; align-items: center; gap: 6px;
  background: #1E3A8A; color: #fff; border: none;
  padding: 9px 16px; border-radius: 8px;
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: background .12s;
}
.btn-primary:hover:not(:disabled) { background: #1e40af; }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }

.faq-list {
  background: #fff; border: 1px solid #E2E8F0;
  border-radius: 12px; overflow: hidden;
}
.faq-item {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 16px; border-bottom: 1px solid #F8FAFC;
  transition: background .1s;
}
.faq-item:last-child { border-bottom: none; }
.faq-item:hover { background: #FAFBFC; }
.faq-item.inactive { opacity: .6; }

.faq-order {
  width: 24px; height: 24px; border-radius: 6px;
  background: #EEF2FF; color: #4338CA;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; flex-shrink: 0;
  margin-top: 2px;
}
.faq-content { flex: 1; min-width: 0; }
.faq-question {
  font-size: 14px; font-weight: 600; color: #0F172A; margin-bottom: 4px;
}
.faq-answer {
  font-size: 13px; color: #64748B; line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}
.faq-cat {
  display: inline-flex; margin-top: 6px;
  padding: 2px 8px; border-radius: 20px;
  background: #EEF2FF; color: #4338CA; font-size: 11px;
}
.faq-actions { 
  display: flex; 
  gap: 4px; 
  flex-shrink: 0;
  opacity: 0.7;
  transition: opacity .2s;
}
.faq-item:hover .faq-actions {
  opacity: 1;
}
.action-btn {
  width: 28px; height: 28px; border-radius: 6px;
  border: none; display: flex; align-items: center;
  justify-content: center; cursor: pointer; transition: all .15s;
}
.action-btn:hover { 
  transform: scale(1.05);
  filter: brightness(.95);
}
.active-btn  { background: #DCFCE7; color: #16A34A; }
.inactive-btn{ background: #F1F5F9; color: #94A3B8; }
.edit-btn    { background: #EEF2FF; color: #4338CA; }
.delete-btn  { background: #FEF2F2; color: #DC2626; }

/* Skeleton */
.faq-skeleton {
  display: flex; align-items: center; gap: 12px;
  padding: 16px; border-bottom: 1px solid #F8FAFC;
}
.sk-lines { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.sk-line {
  height: 12px; border-radius: 6px;
  background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
}
.w60 { width: 60%; }
.w80 { width: 80%; }
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Empty */
.empty-state {
  background: #fff; border: 1px solid #E2E8F0; border-radius: 12px;
  display: flex; flex-direction: column;
  align-items: center; gap: 12px; padding: 60px; text-align: center;
}
.empty-title { font-size: 18px; font-weight: 600; color: #0F172A; }
.empty-sub   { font-size: 14px; color: #94A3B8; margin-bottom: 8px; }

/* Modal form */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.5);
  display: flex; align-items: center; justify-content: center; 
  z-index: 100;
  backdrop-filter: blur(4px);
}
.modal-form {
  background: #fff; border-radius: 16px;
  width: 90%; max-width: 520px;
  box-shadow: 0 20px 60px rgba(0,0,0,.2);
  display: flex; flex-direction: column;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px; border-bottom: 1px solid #F1F5F9;
}
.modal-title { font-size: 16px; font-weight: 600; color: #0F172A; }
.modal-close {
  width: 30px; height: 30px; border-radius: 7px;
  border: none; background: #F1F5F9; color: #64748B;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background .1s;
}
.modal-close:hover { background: #E2E8F0; }
.modal-body { 
  padding: 20px; 
  display: flex; 
  flex-direction: column; 
  gap: 14px; 
  max-height: 70vh;
  overflow-y: auto;
}
.modal-footer {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 14px 20px; border-top: 1px solid #F1F5F9;
}

.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-label { font-size: 12px; font-weight: 500; color: #374151; }
.req      { color: #DC2626; }
.optional { color: #94A3B8; font-weight: 400; }
.form-input {
  width: 100%; padding: 9px 12px;
  border: 1px solid #E2E8F0; border-radius: 8px;
  font-size: 13px; color: #0F172A; background: #fff;
  outline: none; transition: border-color .15s; font-family: inherit;
}
.form-input:focus { border-color: #3B82F6; }
textarea.form-input { resize: vertical; min-height: 80px; }
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

/* Modal sm */
.modal-sm {
  background: #fff; border-radius: 16px;
  padding: 28px; max-width: 360px; width: 90%;
  text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,.2);
}
.modal-icon {
  width: 48px; height: 48px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 14px;
}
.modal-icon.danger { background: #FEF2F2; color: #DC2626; }
.modal-sub   { font-size: 13px; color: #64748B; margin-bottom: 4px; }
.modal-actions {
  display: flex; gap: 8px; justify-content: center; margin-top: 20px;
}
.btn-secondary {
  padding: 8px 16px; border: 1px solid #E2E8F0;
  border-radius: 8px; background: #fff;
  font-size: 13px; color: #374151; cursor: pointer;
  transition: background .12s;
}
.btn-secondary:hover { background: #F8FAFC; }
.btn-danger {
  display: flex; align-items: center; justify-content: center;
  min-width: 90px; padding: 8px 16px; border: none;
  border-radius: 8px; background: #DC2626; color: #fff;
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: background .12s;
}
.btn-danger:hover:not(:disabled) { background: #B91C1C; }
.btn-danger:disabled { opacity: .7; cursor: not-allowed; }

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