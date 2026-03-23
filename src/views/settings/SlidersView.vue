<template>
  <div class="fade-in">

    <div class="toolbar">
      <div class="toolbar-info">
        <span class="page-desc">{{ sliders.length }} slide(s) — affiché sur la page d'accueil</span>
      </div>
      <button class="btn-primary" @click="openModal()">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
        Ajouter un slide
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="sliders-grid">
      <div v-for="i in 3" :key="i" class="slider-skeleton"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="sliders.length === 0" class="empty-state">
      <svg width="48" height="48" fill="none" stroke="#94A3B8" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <div class="empty-title">Aucun slide</div>
      <div class="empty-sub">Ajoutez des bannières pour la page d'accueil de votre site</div>
      <button class="btn-primary" @click="openModal()">Ajouter le premier slide</button>
    </div>

    <!-- Grid sliders -->
    <div v-else class="sliders-grid">
      <div v-for="slider in slidersSorted" :key="slider.id" class="slider-card stagger-item"
        :class="{ inactive: !slider.actif }">
        <!-- Aperçu média (image ou vidéo) -->
        <div class="slider-thumb">
          <img v-if="slider.type_media === 'image' && (slider.url_image || slider.image)"
            :src="storageUrl(slider.url_image || slider.image)" :alt="slider.titre" loading="lazy" />
          <video v-else-if="slider.type_media === 'video' && slider.video_path" :src="getFullUrl(slider.video_path)"
            class="video-thumb" preload="metadata"></video>
          <div v-else class="slider-no-image">
            <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <!-- Badge type média -->
          <div class="media-type-badge" :class="slider.type_media">
            <svg v-if="slider.type_media === 'video'" width="12" height="12" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <svg v-else width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {{ slider.type_media === 'video' ? 'Vidéo' : 'Image' }}
          </div>
          <!-- Overlay avec les infos -->
          <div class="slider-overlay">
            <span class="slider-position-badge">
              <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              {{ slider.position_texte }}
            </span>
            <span class="slider-order-badge">
              <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              #{{ slider.ordre }}
            </span>
          </div>
          <!-- Badge inactif -->
          <div v-if="!slider.actif" class="inactive-overlay">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            Inactif
          </div>
        </div>

        <!-- Infos -->
        <div class="slider-body">
          <div class="slider-title">{{ slider.titre }}</div>
          <div v-if="slider.sous_titre" class="slider-sub">{{ slider.sous_titre }}</div>
          <div v-if="slider.bouton_texte" class="slider-btn-preview">
            <span class="preview-cta">{{ slider.bouton_texte }}</span>
            <span v-if="slider.bouton_lien" class="preview-link">{{ slider.bouton_lien }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="slider-actions">
          <button class="action-btn" :class="slider.actif ? 'active-btn' : 'inactive-btn'" @click="toggleSlider(slider)"
            :title="slider.actif ? 'Désactiver' : 'Activer'">
            <svg v-if="slider.actif" width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <svg v-else width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          </button>
          <button class="action-btn edit-btn" @click="openModal(slider)" title="Modifier">
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button class="action-btn delete-btn" @click="confirmDelete(slider)" title="Supprimer">
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
            <div class="modal-title">{{ modal.slider ? 'Modifier le slide' : 'Nouveau slide' }}</div>
            <button class="modal-close" @click="modal.show = false">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="modal-body">

            <!-- Sélecteur type de média -->
            <div class="form-group">
              <label class="form-label">Type de média</label>
              <div class="media-type-select">
                <button v-for="type in mediaTypes" :key="type.key" class="media-type-btn"
                  :class="{ active: modalForm.type_media === type.key }"
                  @click="modalForm.type_media = type.key; resetMedia()">
                  <span v-html="type.icon"></span>
                  {{ type.label }}
                </button>
              </div>
            </div>

            <!-- Upload Vidéo -->
            <div v-if="modalForm.type_media === 'video'" class="form-group">
              <label class="form-label">Vidéo <span class="req">*</span> <span class="optional">(max 20 Mo,
                  MP4/MOV/WEBM)</span></label>
              <div class="media-drop video-drop" :class="{ 'has-media': modalForm.video_preview, dragging }"
                @dragover.prevent="dragging = true" @dragleave="dragging = false" @drop.prevent="handleVideoDrop"
                @click="$refs.videoInput.click()">
                <video v-if="modalForm.video_preview" :src="modalForm.video_preview" class="video-preview"
                  controls></video>
                <div v-else class="media-placeholder">
                  <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Cliquer ou glisser une vidéo</span>
                  <small class="file-limit">MP4, MOV, WEBM - Maximum 20 Mo</small>
                </div>
              </div>
              <input ref="videoInput" type="file" accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
                style="display:none" @change="handleVideoFile" />
              <button v-if="modalForm.video_preview" class="remove-btn" @click="removeVideo">
                Supprimer la vidéo
              </button>
            </div>

            <!-- Upload Image -->
            <div v-else class="form-group">
              <label class="form-label">Image du slide <span class="req">*</span> <span class="optional">(max 5 Mo,
                  JPG/PNG/GIF/WEBP)</span></label>
              <div class="media-drop image-drop" :class="{ 'has-media': modalForm.image_preview }"
                @click="$refs.slideImg.click()">
                <img v-if="modalForm.image_preview" :src="modalForm.image_preview" class="image-preview" />
                <div v-else class="media-placeholder">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Cliquer pour choisir l'image (recommandé: 1920×600px)</span>
                </div>
              </div>
              <input ref="slideImg" type="file" accept="image/*" style="display:none" @change="handleSlideImg" />
            </div>

            <div class="form-group">
              <label class="form-label">Titre <span class="req">*</span></label>
              <input v-model="modalForm.titre" class="form-input" placeholder="Bienvenue au CRC" />
            </div>

            <div class="form-group">
              <label class="form-label">Sous-titre <span class="optional">(optionnel)</span></label>
              <input v-model="modalForm.sous_titre" class="form-input"
                placeholder="Pillons l'enfer pour peupler le Royaume" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Texte du bouton <span class="optional">(opt.)</span></label>
                <input v-model="modalForm.bouton_texte" class="form-input" placeholder="Nous rejoindre" />
              </div>
              <div class="form-group">
                <label class="form-label">Lien du bouton</label>
                <input v-model="modalForm.bouton_lien" class="form-input" placeholder="/contact" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Position du texte</label>
                <select v-model="modalForm.position_texte" class="form-input">
                  <option value="gauche">Gauche</option>
                  <option value="centre">Centre</option>
                  <option value="droite">Droite</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Ordre</label>
                <input v-model.number="modalForm.ordre" class="form-input" type="number" min="0" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Couleur du texte</label>
                <div class="color-input-wrap">
                  <input type="color" v-model="modalForm.couleur_texte" class="color-picker" />
                  <input v-model="modalForm.couleur_texte" class="form-input" maxlength="7" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Couleur de fond <span class="optional">(opt.)</span></label>
                <div class="color-input-wrap">
                  <input type="color" v-model="modalForm.couleur_fond" class="color-picker" />
                  <input v-model="modalForm.couleur_fond" class="form-input" maxlength="7" />
                </div>
              </div>
            </div>

            <div class="toggle-row">
              <span class="toggle-label">Actif</span>
              <label class="toggle">
                <input type="checkbox" v-model="modalForm.actif" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="modal.show = false">Annuler</button>
            <button class="btn-primary" @click="saveSlider" :disabled="saving">
              <span v-if="saving" class="spinner-sm"></span>
              <span v-else>{{ modal.slider ? 'Mettre à jour' : 'Ajouter' }}</span>
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div class="modal-title">Supprimer ce slide ?</div>
          <div class="modal-sub">« {{ deleteModal.slider?.titre }} »</div>
          <div class="modal-actions">
            <button class="btn-secondary" @click="deleteModal.show = false">Annuler</button>
            <button class="btn-danger" @click="deleteSlider" :disabled="deleteModal.loading">
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
import api, { storageUrl } from '@/services/api'

const auth = useAuthStore()
const sliders = ref([])
const loading = ref(true)
const saving = ref(false)
const dragging = ref(false)
const toast = ref({ show: false, type: 'success', message: '' })

const modal = ref({ show: false, slider: null })
const deleteModal = ref({ show: false, slider: null, loading: false })

const mediaTypes = [
  {
    key: 'image',
    label: 'Image',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="2.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>'
  },
  {
    key: 'video',
    label: 'Vidéo',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>'
  }
];

const modalForm = ref({
  titre: '',
  sous_titre: '',
  type_media: 'image',
  image_file: null,
  image_preview: null,
  video_file: null,
  video_preview: null,
  bouton_texte: '',
  bouton_lien: '',
  position_texte: 'centre',
  couleur_texte: '#FFFFFF',
  couleur_fond: '',
  ordre: 0,
  actif: true,
})

const slidersSorted = computed(() => [...sliders.value].sort((a, b) => a.ordre - b.ordre))

function getFullUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${storageUrl}/${path.replace(/^\//, '')}`
}

async function loadSliders() {
  loading.value = true
  try {
    const params = {}
    if (auth.user?.ministere_id) params.ministere_id = auth.user.ministere_id
    const { data } = await api.get('/ministry/sliders', { params })
    sliders.value = data.data || []
  } catch (e) {
    console.error('Erreur chargement sliders:', e)
    showToast('Erreur lors du chargement des sliders', 'error')
  } finally {
    loading.value = false
  }
}

function openModal(slider = null) {
  modal.value.slider = slider
  modal.value.show = true

  if (slider) {
    modalForm.value = {
      titre: slider.titre,
      sous_titre: slider.sous_titre || '',
      type_media: slider.type_media || 'image',
      image_file: null,
      image_preview: slider.type_media === 'image' ? (slider.url_image || slider.image) : null,
      video_file: null,
      video_preview: slider.type_media === 'video' && slider.video_path ? getFullUrl(slider.video_path) : null,
      bouton_texte: slider.bouton_texte || '',
      bouton_lien: slider.bouton_lien || '',
      position_texte: slider.position_texte || 'centre',
      couleur_texte: slider.couleur_texte || '#FFFFFF',
      couleur_fond: slider.couleur_fond || '',
      ordre: slider.ordre,
      actif: slider.actif,
    }
  } else {
    modalForm.value = {
      titre: '',
      sous_titre: '',
      type_media: 'image',
      image_file: null,
      image_preview: null,
      video_file: null,
      video_preview: null,
      bouton_texte: '',
      bouton_lien: '',
      position_texte: 'centre',
      couleur_texte: '#FFFFFF',
      couleur_fond: '',
      ordre: sliders.value.length,
      actif: true,
    }
  }
}

function resetMedia() {
  modalForm.value.image_file = null
  modalForm.value.image_preview = null
  modalForm.value.video_file = null
  modalForm.value.video_preview = null
}

// Gestion des images
function handleSlideImg(e) {
  const file = e.target.files[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    showToast('L\'image ne doit pas dépasser 5 Mo', 'error')
    return
  }

  modalForm.value.image_file = file
  const reader = new FileReader()
  reader.onload = ev => { modalForm.value.image_preview = ev.target.result }
  reader.readAsDataURL(file)
}

// Gestion des vidéos
function handleVideoDrop(e) {
  dragging.value = false
  const file = e.dataTransfer.files[0]
  if (file?.type.startsWith('video/')) setVideoFile(file)
}

function handleVideoFile(e) {
  const file = e.target.files[0]
  if (!file) return

  if (file.size > 20 * 1024 * 1024) {
    showToast('La vidéo ne doit pas dépasser 20 Mo', 'error')
    return
  }

  const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska']
  if (!allowedTypes.includes(file.type)) {
    showToast('Format vidéo non supporté. Utilisez MP4, MOV, WEBM ou MKV', 'error')
    return
  }

  setVideoFile(file)
}

function setVideoFile(file) {
  modalForm.value.video_file = file
  const reader = new FileReader()
  reader.onload = e => { modalForm.value.video_preview = e.target.result }
  reader.readAsDataURL(file)
}

function removeVideo() {
  modalForm.value.video_preview = null
  modalForm.value.video_file = null
  if (videoInput.value) {
    videoInput.value.value = ''
  }
}

async function saveSlider() {
  if (!modalForm.value.titre.trim()) {
    showToast('Le titre est obligatoire.', 'error')
    return
  }

  if (modalForm.value.type_media === 'image' && !modalForm.value.image_file && !modal.value.slider?.image) {
    showToast('Une image est obligatoire.', 'error')
    return
  }

  if (modalForm.value.type_media === 'video' && !modalForm.value.video_file && !modal.value.slider?.video_path) {
    showToast('Une vidéo est obligatoire.', 'error')
    return
  }

  saving.value = true
  try {
    const formData = new FormData()
    formData.append('titre', modalForm.value.titre)
    formData.append('sous_titre', modalForm.value.sous_titre || '')
    formData.append('type_media', modalForm.value.type_media)
    formData.append('bouton_texte', modalForm.value.bouton_texte || '')
    formData.append('bouton_lien', modalForm.value.bouton_lien || '')
    formData.append('position_texte', modalForm.value.position_texte)
    formData.append('couleur_texte', modalForm.value.couleur_texte)
    formData.append('couleur_fond', modalForm.value.couleur_fond || '')
    formData.append('ordre', modalForm.value.ordre)
    formData.append('actif', modalForm.value.actif ? 1 : 0)
    formData.append('ministere_id', auth.user?.ministere_id || 1)

    if (modalForm.value.type_media === 'image' && modalForm.value.image_file) {
      formData.append('image', modalForm.value.image_file)
    }

    if (modalForm.value.type_media === 'video' && modalForm.value.video_file) {
      formData.append('video', modalForm.value.video_file)
    }

    if (modal.value.slider) {
      const { data } = await api.post(
        `/ministry/sliders/${modal.value.slider.id}?_method=PUT`,
        formData, { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      const idx = sliders.value.findIndex(s => s.id === modal.value.slider.id)
      if (idx !== -1) sliders.value[idx] = data.data
      showToast('Slide mis à jour !', 'success')
    } else {
      const { data } = await api.post('/ministry/sliders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, // 60 secondes
      })
      sliders.value.push(data.data)
      showToast('Slide ajouté !', 'success')
    }
    modal.value.show = false
  } catch (e) {
    console.error('Erreur sauvegarde:', e)
    if (e.response?.data?.errors) {
      const errors = Object.values(e.response.data.errors).flat()
      showToast(errors.join(', '), 'error')
    } else {
      showToast(e.response?.data?.message || 'Erreur lors de la sauvegarde', 'error')
    }
  } finally {
    saving.value = false
  }
}

async function toggleSlider(slider) {
  try {
    await api.patch(`/ministry/sliders/${slider.id}/toggle`)
    slider.actif = !slider.actif
    showToast(slider.actif ? 'Slide activé' : 'Slide désactivé', 'success')
  } catch (e) {
    console.error('Erreur toggle:', e)
    showToast('Erreur lors du changement de statut', 'error')
  }
}

function confirmDelete(slider) {
  deleteModal.value = { show: true, slider, loading: false }
}

async function deleteSlider() {
  deleteModal.value.loading = true
  try {
    await api.delete(`/ministry/sliders/${deleteModal.value.slider.id}`)
    sliders.value = sliders.value.filter(s => s.id !== deleteModal.value.slider.id)
    deleteModal.value.show = false
    showToast('Slide supprimé.', 'success')
  } catch (e) {
    console.error('Erreur suppression:', e)
    showToast('Erreur lors de la suppression', 'error')
  } finally {
    deleteModal.value.loading = false
  }
}

function showToast(message, type = 'success') {
  toast.value = { show: true, type, message }
  setTimeout(() => { toast.value.show = false }, 2500)
}

const videoInput = ref(null)

onMounted(() => loadSliders())
</script>

<style scoped>
.media-type-select {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.media-type-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  background: #fff;
  font-size: 13px;
  font-weight: 500;
  color: #64748B;
  cursor: pointer;
  transition: all .2s;
}

.media-type-btn.active {
  border-color: #1E3A8A;
  background: #EFF6FF;
  color: #1E3A8A;
}

.media-drop {
  border: 2px dashed #E2E8F0;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: all .15s;
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-drop:hover {
  border-color: #3B82F6;
  background: #EFF6FF;
}

.media-drop.has-media {
  border-style: solid;
}

.media-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #94A3B8;
  font-size: 12px;
  padding: 20px;
  text-align: center;
}

.video-drop {
  min-height: 180px;
}

.video-preview {
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  background: #000;
}

.video-thumb {
  width: 100%;
  height: 160px;
  object-fit: cover;
  background: #000;
}

.media-type-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, .6);
  backdrop-filter: blur(4px);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 20px;
  z-index: 2;
}

.media-type-badge.video {
  background: #DC2626;
}

.media-type-badge.image {
  background: #16A34A;
}

.file-limit {
  font-size: 10px;
  color: #94A3B8;
  margin-top: 4px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-info {
  display: flex;
  align-items: center;
}

.page-desc {
  font-size: 13px;
  color: #64748B;
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
}

.btn-primary:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.sliders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.slider-card {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow .15s, transform .15s;
}

.slider-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, .08);
  transform: translateY(-2px);
}

.slider-card.inactive {
  opacity: .65;
}

.slider-thumb {
  position: relative;
  height: 160px;
  background: #F8FAFC;
  overflow: hidden;
}

.slider-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .3s;
}

.slider-card:hover .slider-thumb img {
  transform: scale(1.05);
}

.slider-no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #CBD5E1;
}

.slider-overlay {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
}

.slider-position-badge,
.slider-order-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, .5);
  backdrop-filter: blur(4px);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 20px;
}

.inactive-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, .6);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.slider-body {
  padding: 14px 16px;
  border-bottom: 1px solid #F8FAFC;
}

.slider-title {
  font-size: 14px;
  font-weight: 600;
  color: #0F172A;
  margin-bottom: 4px;
}

.slider-sub {
  font-size: 12px;
  color: #64748B;
  margin-bottom: 8px;
}

.slider-btn-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.preview-cta {
  display: inline-flex;
  padding: 4px 10px;
  background: #1E3A8A;
  color: #fff;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
}

.preview-link {
  font-size: 11px;
  color: #3B82F6;
}

.slider-actions {
  display: flex;
  gap: 6px;
  padding: 10px 14px 14px;
  opacity: 0.7;
  transition: opacity .2s;
}

.slider-card:hover .slider-actions {
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
  filter: brightness(.9);
}

.active-btn {
  background: #DCFCE7;
  color: #16A34A;
}

.inactive-btn {
  background: #F1F5F9;
  color: #94A3B8;
}

.edit-btn {
  background: #EEF2FF;
  color: #4338CA;
}

.delete-btn {
  background: #FEF2F2;
  color: #DC2626;
}

/* Skeleton */
.slider-skeleton {
  height: 240px;
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

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  overflow-y: auto;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal-form {
  background: #fff;
  border-radius: 16px;
  width: 90%;
  max-width: 560px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, .2);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
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
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid #F1F5F9;
  position: sticky;
  bottom: 0;
  background: #fff;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
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

.image-drop {
  border: 2px dashed #E2E8F0;
  border-radius: 10px;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all .15s;
  overflow: hidden;
}

.image-drop:hover {
  border-color: #3B82F6;
  background: #EFF6FF;
}

.image-drop.has-image {
  border-style: solid;
}

.image-preview {
  width: 100%;
  height: 140px;
  object-fit: cover;
  display: block;
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #94A3B8;
  font-size: 12px;
  padding: 20px;
  text-align: center;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
}

.toggle-label {
  color: #374151;
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, .2);
}

.toggle input:checked+.toggle-slider {
  background: #1E3A8A;
}

.toggle input:checked+.toggle-slider::after {
  transform: translateX(16px);
}

.modal-sm {
  background: #fff;
  border-radius: 16px;
  padding: 28px;
  max-width: 360px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, .2);
}

.modal-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
}

.modal-icon.danger {
  background: #FEF2F2;
  color: #DC2626;
}

.modal-sub {
  font-size: 13px;
  color: #64748B;
  margin-bottom: 4px;
}

.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 20px;
}

.btn-secondary {
  padding: 8px 16px;
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

.btn-danger {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 90px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #DC2626;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.btn-danger:hover:not(:disabled) {
  background: #B91C1C;
}

.btn-danger:disabled {
  opacity: .7;
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