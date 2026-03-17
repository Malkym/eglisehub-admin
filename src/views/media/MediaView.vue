<template>
  <div class="fade-in">

    <!-- Toolbar -->
    <div class="media-toolbar">
      <div class="toolbar-left">
        <button
          v-for="tab in typeTabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeType === tab.key }"
          @click="activeType = tab.key; loadMedia()"
        >
          <span v-html="tab.icon"></span>
          {{ tab.label }}
          <span class="tab-count">{{ tab.count }}</span>
        </button>
      </div>
      <div class="toolbar-right">
        <div class="search-wrap">
          <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="search" class="search-input" placeholder="Rechercher..." @input="debouncedSearch" />
        </div>
        <div class="view-toggle">
          <button class="view-btn" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h7v7H3zm0 11h7v7H3zm11-11h7v7h-7zm0 11h7v7h-7z" />
            </svg>
          </button>
          <button class="view-btn" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <label class="btn-primary upload-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Uploader
          <input
            ref="fileInput"
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            style="display:none"
            @change="handleUpload"
          />
        </label>
      </div>
    </div>

    <!-- Zone de drop global -->
    <div
      class="drop-zone"
      :class="{ active: isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <div v-if="isDragging" class="drop-overlay">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <span>Déposer les fichiers ici</span>
      </div>

      <!-- Progress upload -->
      <div v-if="uploading.length > 0" class="upload-progress-bar">
        <div v-for="up in uploading" :key="up.name" class="upload-item">
          <div class="upload-item-info">
            <span class="upload-name">{{ up.name }}</span>
            <span class="upload-pct">{{ up.progress }}%</span>
          </div>
          <div class="upload-bar">
            <div class="upload-fill" :style="{ width: up.progress + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Sélection multiple actions -->
      <div v-if="selected.length > 0" class="selection-bar">
        <span class="selection-count">{{ selected.length }} fichier(s) sélectionné(s)</span>
        <div class="selection-actions">
          <button class="sel-btn" @click="selected = []">Désélectionner</button>
          <button class="sel-btn danger" @click="confirmBulkDelete">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Supprimer ({{ selected.length }})
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="media-grid">
        <div v-for="i in 12" :key="i" class="media-skeleton"></div>
      </div>

      <!-- Empty -->
      <div v-else-if="medias.length === 0" class="empty-state">
        <div class="empty-illustration">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 class="empty-title">Aucun média</h3>
        <p class="empty-description">Glissez des fichiers ici ou cliquez sur Uploader</p>
        <label class="btn-primary upload-label" style="margin-top:8px">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Uploader des fichiers
          <input type="file" multiple style="display:none" @change="handleUpload" />
        </label>
      </div>

      <!-- Grid view -->
      <div v-else-if="viewMode === 'grid'" class="media-grid">
        <div
          v-for="media in medias"
          :key="media.id"
          class="media-item"
          :class="{ selected: selected.includes(media.id) }"
          @click="toggleSelect(media)"
          @dblclick="openPreview(media)"
        >
          <!-- Checkbox -->
          <div class="media-checkbox" @click.stop="toggleSelect(media)">
            <div class="checkbox" :class="{ checked: selected.includes(media.id) }">
              <svg v-if="selected.includes(media.id)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <!-- Aperçu -->
          <div class="media-thumb">
            <img 
              v-if="media.type === 'image'" 
              :src="getFullUrl(media.url)" 
              :alt="media.nom_original" 
              loading="lazy"
              @error="handleImageError"
            />
            <div v-else class="media-icon-wrap" :style="{ background: typeConfig[media.type]?.bg }">
              <span v-html="typeConfig[media.type]?.icon" :style="{ color: typeConfig[media.type]?.color }"></span>
            </div>
          </div>

          <!-- Info -->
          <div class="media-info">
            <div class="media-name" :title="media.nom_original">{{ media.nom_original }}</div>
            <div class="media-size">{{ formatSize(media.taille) }}</div>
          </div>

          <!-- Actions hover -->
          <div class="media-actions">
            <button class="media-action" @click.stop="openPreview(media)" title="Aperçu">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button class="media-action" @click.stop="copyUrl(media)" title="Copier l'URL">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button class="media-action danger" @click.stop="confirmDelete(media)" title="Supprimer">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- List view -->
      <div v-else class="table-container">
        <div class="table-head">
          <div class="th" style="width:40px"></div>
          <div class="th" style="flex:1">Fichier</div>
          <div class="th" style="width:100px">Type</div>
          <div class="th" style="width:90px">Taille</div>
          <div class="th" style="width:120px">Date</div>
          <div class="th" style="width:80px">Actions</div>
        </div>
        <div
          v-for="media in medias"
          :key="media.id"
          class="table-row"
          :class="{ selected: selected.includes(media.id) }"
        >
          <div class="td" style="width:40px">
            <div class="checkbox" :class="{ checked: selected.includes(media.id) }" @click="toggleSelect(media)">
              <svg v-if="selected.includes(media.id)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div class="td" style="flex:1">
            <div class="list-file">
              <div class="list-thumb">
                <img 
                  v-if="media.type === 'image'" 
                  :src="getFullUrl(media.url)" 
                  :alt="media.nom_original"
                  @error="handleImageError"
                />
                <span v-else v-html="typeConfig[media.type]?.icon" :style="{ color: typeConfig[media.type]?.color }"></span>
              </div>
              <span class="list-name" :title="media.nom_original">{{ media.nom_original }}</span>
            </div>
          </div>
          <div class="td" style="width:100px">
            <span class="badge" :class="typeConfig[media.type]?.badge">{{ media.type }}</span>
          </div>
          <div class="td" style="width:90px">
            <span class="list-size">{{ formatSize(media.taille) }}</span>
          </div>
          <div class="td" style="width:120px">
            <span class="list-date">{{ formatDate(media.created_at) }}</span>
          </div>
          <div class="td actions-td" style="width:80px" @click.stop>
            <button class="action-btn" @click="copyUrl(media)" title="Copier l'URL">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button class="action-btn danger" @click="confirmDelete(media)" title="Supprimer">
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
      <button class="page-btn" :disabled="pagination.currentPage === 1" @click="changePage(pagination.currentPage - 1)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Précédent
      </button>
      <div class="page-info">
        Page {{ pagination.currentPage }} / {{ pagination.lastPage }}
        <span class="page-total">({{ pagination.total }} fichiers)</span>
      </div>
      <button class="page-btn" :disabled="pagination.currentPage === pagination.lastPage" @click="changePage(pagination.currentPage + 1)">
        Suivant
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Modal preview -->
    <Teleport to="body">
      <div v-if="preview.show" class="preview-overlay" @click.self="preview.show = false">
        <div class="preview-modal">
          <div class="preview-header">
            <div class="preview-title">{{ preview.media?.nom_original }}</div>
            <button class="preview-close" @click="preview.show = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="preview-body">
            <img 
              v-if="preview.media?.type === 'image'"
              :src="getFullUrl(preview.media?.url)"
              class="preview-image"
              :alt="preview.media?.nom_original"
            />
            <div v-else class="preview-file-icon">
              <span v-html="typeConfig[preview.media?.type]?.icon"></span>
              <div class="preview-file-name">{{ preview.media?.nom_original }}</div>
            </div>
          </div>
          <div class="preview-footer">
            <div class="preview-meta">
              <span>{{ formatSize(preview.media?.taille) }}</span>
              <span>·</span>
              <span>{{ formatDate(preview.media?.created_at) }}</span>
            </div>
            <div class="preview-footer-actions">
              <button class="btn-secondary" @click="copyUrl(preview.media)">Copier l'URL</button>
              <a :href="getFullUrl(preview.media?.url)" target="_blank" class="btn-primary-sm">
                Ouvrir
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal suppression -->
    <Teleport to="body">
      <div v-if="deleteModal.show" class="modal-overlay" @click.self="deleteModal.show = false">
        <div class="modal">
          <div class="modal-icon danger">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 class="modal-title">
            {{ deleteModal.bulk ? `Supprimer ${selected.length} fichiers ?` : 'Supprimer ce fichier ?' }}
          </h3>
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


const medias     = ref([])
const loading    = ref(true)
const search     = ref('')
const activeType = ref('')
const viewMode   = ref('grid')
const selected   = ref([])
const isDragging = ref(false)
const uploading  = ref([])
const pagination = ref({ currentPage: 1, lastPage: 1, total: 0 })
const counts     = ref({ all: 0, image: 0, video: 0, audio: 0, document: 0 })
const preview    = ref({ show: false, media: null })
const deleteModal = ref({ show: false, media: null, bulk: false, loading: false })
const toast      = ref({ show: false, type: 'success', message: '' })

// Cette ligne doit être présente et correcte
const BASE_URL = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000'

function getFullUrl(path) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  // path commence par /storage/...
  return `${BASE_URL}${path}`
}

// Gestionnaire d'erreur d'image
function handleImageError(e) {
  e.target.style.display = 'none'
  e.target.parentElement.innerHTML = typeConfig.image.icon
}

const typeTabs = computed(() => [
  {
    key: '', label: 'Tous', count: counts.value.all,
    icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
    </svg>`,
  },
  {
    key: 'image', label: 'Images', count: counts.value.image,
    icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
    </svg>`,
  },
  {
    key: 'video', label: 'Vidéos', count: counts.value.video,
    icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
    </svg>`,
  },
  {
    key: 'audio', label: 'Audio', count: counts.value.audio,
    icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"/>
    </svg>`,
  },
  {
    key: 'document', label: 'Documents', count: counts.value.document,
    icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
    </svg>`,
  },
])

const typeConfig = {
  image: { 
    bg: '#EEF2FF', 
    color: '#4338CA', 
    badge: 'badge-purple', 
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>` 
  },
  video: { 
    bg: '#FEF2F2', 
    color: '#DC2626', 
    badge: 'badge-red', 
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>` 
  },
  audio: { 
    bg: '#F0FDF4', 
    color: '#16A34A', 
    badge: 'badge-green', 
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"/></svg>` 
  },
  document: { 
    bg: '#FEF3C7', 
    color: '#D97706', 
    badge: 'badge-yellow', 
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>` 
  },
}

function formatSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short', 
    year: '2-digit' 
  })
}

let searchTimer = null
function debouncedSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => loadMedia(), 400)
}

async function loadMedia(page = 1) {
  loading.value = true
  try {
    const params = { page, per_page: 24 }
    if (auth.user?.ministere_id) params.ministere_id = auth.user.ministere_id
    if (activeType.value) params.type = activeType.value
    if (search.value) params.search = search.value

    const { data } = await api.get('/ministry/media', { params })
    const result = data.data

    medias.value = result.data || result
    pagination.value = {
      currentPage: result.current_page || 1,
      lastPage: result.last_page || 1,
      total: result.total || medias.value.length,
    }

    await loadCounts()
  } catch (e) {
    console.error(e)
    showToast('Erreur lors du chargement des médias.', 'error')
  } finally {
    loading.value = false
  }
}

async function loadCounts() {
  try {
    const base = auth.user?.ministere_id ? { ministere_id: auth.user.ministere_id, per_page: 1 } : { per_page: 1 }
    const [all, img, vid, aud, doc] = await Promise.all([
      api.get('/ministry/media', { params: base }),
      api.get('/ministry/media', { params: { ...base, type: 'image' } }),
      api.get('/ministry/media', { params: { ...base, type: 'video' } }),
      api.get('/ministry/media', { params: { ...base, type: 'audio' } }),
      api.get('/ministry/media', { params: { ...base, type: 'document' } }),
    ])
    counts.value = {
      all: all.data.data?.total || 0,
      image: img.data.data?.total || 0,
      video: vid.data.data?.total || 0,
      audio: aud.data.data?.total || 0,
      document: doc.data.data?.total || 0,
    }
  } catch {}
}

function toggleSelect(media) {
  const idx = selected.value.indexOf(media.id)
  if (idx === -1) selected.value.push(media.id)
  else selected.value.splice(idx, 1)
}

function openPreview(media) {
  preview.value = { show: true, media }
}

async function copyUrl(media) {
  if (!media?.url) return
  const fullUrl = getFullUrl(media.url)
  await navigator.clipboard.writeText(fullUrl)
  showToast('URL copiée !', 'success')
}

// Upload
async function handleDrop(e) {
  isDragging.value = false
  const files = Array.from(e.dataTransfer.files)
  await uploadFiles(files)
}

async function handleUpload(e) {
  const files = Array.from(e.target.files)
  await uploadFiles(files)
  e.target.value = ''
}

async function uploadFiles(files) {
  for (const file of files) {
    const upItem = { name: file.name, progress: 0 }
    uploading.value.push(upItem)

    try {
      const formData = new FormData()
      formData.append('fichier', file)
      formData.append('ministere_id', auth.user?.ministere_id || 1)

      await api.post('/ministry/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          upItem.progress = Math.round((e.loaded * 100) / e.total)
        },
      })

      showToast(`${file.name} uploadé !`, 'success')
    } catch (e) {
      showToast(`Erreur : ${file.name}`, 'error')
    } finally {
      uploading.value = uploading.value.filter(u => u !== upItem)
    }
  }
  await loadMedia()
}

// Delete
function confirmDelete(media) {
  deleteModal.value = { show: true, media, bulk: false, loading: false }
}

function confirmBulkDelete() {
  deleteModal.value = { show: true, media: null, bulk: true, loading: false }
}

async function executeDelete() {
  deleteModal.value.loading = true
  try {
    if (deleteModal.value.bulk) {
      await api.post('/ministry/media/bulk-delete', { ids: selected.value })
      medias.value = medias.value.filter(m => !selected.value.includes(m.id))
      selected.value = []
    } else {
      await api.delete(`/ministry/media/${deleteModal.value.media.id}`)
      medias.value = medias.value.filter(m => m.id !== deleteModal.value.media.id)
    }
    deleteModal.value.show = false
    showToast('Supprimé avec succès.', 'success')
    await loadCounts()
  } catch (e) {
    showToast('Erreur lors de la suppression.', 'error')
  } finally {
    deleteModal.value.loading = false
  }
}

function changePage(page) {
  loadMedia(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function showToast(message, type = 'success') {
  toast.value = { show: true, type, message }
  setTimeout(() => { toast.value.show = false }, 2500)
}

onMounted(() => loadMedia())
</script>

<style scoped>
/* Toolbar */
.media-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 16px;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  gap: 4px;
  background: #F8FAFC;
  padding: 4px;
  border-radius: 10px;
  border: 1px solid #E2E8F0;
  flex-wrap: wrap;
}

.toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: #64748B;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: white;
  color: #0F172A;
}

.tab-btn.active {
  background: white;
  color: #0F172A;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.tab-count {
  background: #E2E8F0;
  color: #475569;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
}

.tab-btn.active .tab-count {
  background: #EEF2FF;
  color: #4338CA;
}

/* Search */
.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #94A3B8;
  pointer-events: none;
}

.search-input {
  padding: 9px 12px 9px 36px;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  font-size: 13px;
  color: #0F172A;
  background: white;
  outline: none;
  width: 200px;
  transition: all 0.2s;
}

.search-input:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input::placeholder {
  color: #CBD5E1;
}

/* View toggle */
.view-toggle {
  display: flex;
  gap: 2px;
  background: #F1F5F9;
  padding: 3px;
  border-radius: 8px;
}

.view-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #94A3B8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.view-btn.active {
  background: white;
  color: #0F172A;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

/* Upload button */
.upload-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  background: #1E3A8A;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.upload-label:hover {
  background: #1e40af;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2);
}

/* Drop zone */
.drop-zone {
  position: relative;
  min-height: 300px;
  border-radius: 16px;
  transition: all 0.2s;
}

.drop-zone.active {
  border: 2px dashed #3B82F6;
  background: rgba(59, 130, 246, 0.03);
}

.drop-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  background: rgba(239, 246, 255, 0.95);
  border-radius: 16px;
  border: 2px dashed #3B82F6;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #1D4ED8;
  font-size: 16px;
  font-weight: 500;
  backdrop-filter: blur(4px);
}

/* Upload progress */
.upload-progress-bar {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-item-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #374151;
  margin-bottom: 6px;
}

.upload-name {
  font-weight: 500;
  color: #0F172A;
}

.upload-pct {
  color: #1E3A8A;
  font-weight: 600;
}

.upload-bar {
  height: 4px;
  background: #E2E8F0;
  border-radius: 2px;
  overflow: hidden;
}

.upload-fill {
  height: 100%;
  background: #1E3A8A;
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* Selection bar */
.selection-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: 12px;
  padding: 12px 18px;
  margin-bottom: 16px;
}

.selection-count {
  font-size: 13px;
  font-weight: 600;
  color: #1D4ED8;
}

.selection-actions {
  display: flex;
  gap: 10px;
}

.sel-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 8px;
  border: 1px solid #BFDBFE;
  background: white;
  font-size: 12px;
  font-weight: 500;
  color: #1D4ED8;
  cursor: pointer;
  transition: all 0.2s;
}

.sel-btn:hover {
  background: #EFF6FF;
  border-color: #3B82F6;
}

.sel-btn.danger {
  border-color: #FECACA;
  background: #FEF2F2;
  color: #DC2626;
}

.sel-btn.danger:hover {
  background: #FEE2E2;
}

/* Media grid */
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.media-item {
  background: white;
  border: 1.5px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.media-item:hover {
  border-color: #3B82F6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.media-item.selected {
  border-color: #1E3A8A;
  background: #EFF6FF;
}

.media-checkbox {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
}

.checkbox {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 1.5px solid #CBD5E1;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.checkbox.checked {
  background: #1E3A8A;
  border-color: #1E3A8A;
}

.checkbox:hover {
  border-color: #3B82F6;
}

.media-thumb {
  width: 100%;
  height: 120px;
  background: #F8FAFC;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.media-item:hover .media-thumb img {
  transform: scale(1.05);
}

.media-icon-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-info {
  padding: 10px 12px;
}

.media-name {
  font-size: 12px;
  font-weight: 500;
  color: #0F172A;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.media-size {
  font-size: 10px;
  color: #64748B;
}

.media-actions {
  position: absolute;
  bottom: 50px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  opacity: 0;
  transition: opacity 0.2s;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.4));
}

.media-item:hover .media-actions {
  opacity: 1;
}

.media-action {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  backdrop-filter: blur(2px);
}

.media-action:hover {
  background: white;
  transform: scale(1.1);
}

.media-action.danger {
  color: #DC2626;
}

.media-action.danger:hover {
  background: #FEF2F2;
}

/* Skeleton */
.media-skeleton {
  height: 180px;
  border-radius: 12px;
  background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Table view */
.table-container {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
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
  padding: 12px 16px;
  border-bottom: 1px solid #F1F5F9;
  transition: background 0.2s;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: #F8FAFC;
}

.table-row.selected {
  background: #EFF6FF;
}

.td {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #0F172A;
}

.list-file {
  display: flex;
  align-items: center;
  gap: 12px;
}

.list-thumb {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #F8FAFC;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.list-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.list-name {
  font-size: 13px;
  font-weight: 500;
  color: #0F172A;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}

.list-size,
.list-date {
  font-size: 12px;
  color: #64748B;
}

/* Badges */
.badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 30px;
  font-size: 11px;
  font-weight: 600;
}

.badge-purple {
  background: #EDE9FE;
  color: #6D28D9;
}

.badge-red {
  background: #FEE2E2;
  color: #991B1B;
}

.badge-green {
  background: #DCFCE7;
  color: #166534;
}

.badge-yellow {
  background: #FEF3C7;
  color: #92400E;
}

/* Actions */
.actions-td {
  display: flex;
  gap: 6px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: #F1F5F9;
  color: #64748B;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #E2E8F0;
  color: #0F172A;
}

.action-btn.danger {
  background: #FEF2F2;
  color: #DC2626;
}

.action-btn.danger:hover {
  background: #FEE2E2;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
  padding: 12px 0;
}

.page-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  background: white;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #F8FAFC;
  border-color: #3B82F6;
  color: #1E3A8A;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: #64748B;
}

.page-total {
  color: #94A3B8;
  margin-left: 4px;
}

/* Preview modal */
.preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(8px);
}

.preview-modal {
  background: white;
  border-radius: 24px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid #E2E8F0;
}

.preview-title {
  font-size: 15px;
  font-weight: 600;
  color: #0F172A;
}

.preview-close {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: #F1F5F9;
  color: #64748B;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.preview-close:hover {
  background: #E2E8F0;
  color: #0F172A;
}

.preview-body {
  flex: 1;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #F8FAFC;
  min-height: 400px;
}

.preview-image {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.preview-file-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #94A3B8;
}

.preview-file-name {
  font-size: 15px;
  color: #0F172A;
  font-weight: 500;
}

.preview-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid #E2E8F0;
  background: white;
}

.preview-meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #64748B;
}

.preview-footer-actions {
  display: flex;
  gap: 12px;
}

.btn-secondary {
  padding: 8px 18px;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  background: white;
  font-size: 12px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #F8FAFC;
  border-color: #CBD5E1;
}

.btn-primary-sm {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: #1E3A8A;
  color: white;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-primary-sm:hover {
  background: #1e40af;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2);
}

/* Modal suppression */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 24px;
  padding: 32px;
  max-width: 380px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
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
  margin-bottom: 4px;
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
  background: white;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #F8FAFC;
  border-color: #CBD5E1;
}

.btn-danger {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  background: #DC2626;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: wait;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  z-index: 200;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  min-width: 280px;
}

.toast.success {
  background: #0F172A;
  color: white;
}

.toast.error {
  background: #FEF2F2;
  color: #DC2626;
  border: 1px solid #FECACA;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;
  text-align: center;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 20px;
}

.empty-illustration {
  width: 120px;
  height: 120px;
  border-radius: 60px;
  background: #F8FAFC;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94A3B8;
  margin-bottom: 8px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #0F172A;
  margin: 0;
}

.empty-description {
  font-size: 14px;
  color: #64748B;
  margin: 0 0 8px 0;
}

.empty-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #1E3A8A;
  color: white;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  margin-top: 8px;
}

.empty-action:hover {
  background: #1e40af;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2);
}

/* Spinner */
.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Responsive */
@media (max-width: 768px) {
  .media-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .toolbar-right {
    flex-direction: column;
  }
  
  .search-input {
    width: 100%;
  }
  
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
  
  .table-head {
    display: none;
  }
  
  .table-row {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .td {
    width: 100% !important;
  }
  
  .list-file {
    width: 100%;
  }
  
  .actions-td {
    justify-content: flex-end;
  }
}
</style>