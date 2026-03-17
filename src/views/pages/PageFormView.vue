<template>
  <div class="fade-in">

    <div class="form-header">
      <div class="breadcrumb">
        <RouterLink to="/pages" class="breadcrumb-link">Pages</RouterLink>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">{{ isEdit ? 'Modifier' : 'Nouvelle page' }}</span>
      </div>
      <div class="form-actions">
        <button class="btn-secondary" @click="router.push('/pages')">Annuler</button>
        <button class="btn-outline-save" @click="save('brouillon')" :disabled="saving">
          Brouillon
        </button>
        <button class="btn-primary" @click="save('publie')" :disabled="saving">
          <span v-if="saving" class="spinner-sm"></span>
          <span v-else>{{ isEdit ? 'Mettre à jour' : 'Publier' }}</span>
        </button>
      </div>
    </div>

    <div class="form-layout">
      <div class="form-main">

        <!-- Titre -->
        <div class="card">
          <input
            v-model="form.titre"
            class="title-input"
            placeholder="Titre de la page..."
          />
          <div class="slug-row">
            <span class="slug-label">URL :</span>
            <span class="slug-value">/{{ generatedSlug }}</span>
          </div>
        </div>

        <!-- Contenu -->
        <div class="card">
          <div class="card-section-title">Contenu de la page</div>
          <div class="editor-toolbar">
            <button class="toolbar-btn bold" @click="wrapText('**','**')">B</button>
            <button class="toolbar-btn italic" @click="wrapText('*','*')">I</button>
            <button class="toolbar-btn" @click="wrapText('\n## ','')">H2</button>
            <button class="toolbar-btn" @click="wrapText('\n### ','')">H3</button>
            <button class="toolbar-btn" @click="wrapText('\n- ','')">•</button>
            <button class="toolbar-btn" @click="wrapText('\n> ','')">❝</button>
            <div class="toolbar-sep"></div>
            <span class="toolbar-hint">Markdown</span>
          </div>
          <textarea
            v-model="form.contenu"
            class="content-editor"
            placeholder="Rédigez le contenu de votre page..."
            rows="16"
            ref="contentRef"
          ></textarea>
        </div>

        <!-- SEO -->
        <div class="card">
          <div class="card-section-title">SEO & Métadonnées</div>
          <div class="form-group">
            <label class="form-label">Titre SEO <span class="optional">(optionnel)</span></label>
            <input v-model="form.meta_titre" class="form-input" placeholder="Titre pour les moteurs de recherche..."/>
            <div class="char-count" :class="{ warn: form.meta_titre?.length > 60 }">
              {{ form.meta_titre?.length || 0 }}/60 caractères
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Description SEO <span class="optional">(optionnel)</span></label>
            <textarea
              v-model="form.meta_description"
              class="form-input"
              placeholder="Description courte pour Google..."
              rows="3"
              style="resize:vertical"
            ></textarea>
            <div class="char-count" :class="{ warn: form.meta_description?.length > 160 }">
              {{ form.meta_description?.length || 0 }}/160 caractères
            </div>
          </div>
        </div>

      </div>

      <div class="form-sidebar">

        <!-- Publication -->
        <div class="card">
          <div class="card-section-title">Publication</div>
          <div class="status-row">
            <span class="status-label">Statut</span>
            <span class="badge" :class="form.statut === 'publie' ? 'badge-green' : 'badge-gray'">
              {{ form.statut === 'publie' ? 'Publiée' : 'Brouillon' }}
            </span>
          </div>
          <div class="toggle-row">
            <span class="toggle-label">Dans le menu</span>
            <label class="toggle">
              <input type="checkbox" v-model="form.dans_menu"/>
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div v-if="form.dans_menu" class="form-group mt-10">
            <label class="form-label">Position dans le menu</label>
            <input
              v-model.number="form.ordre_menu"
              class="form-input"
              type="number"
              min="0"
              placeholder="0"
            />
            <div class="form-hint">0 = premier, 1 = deuxième...</div>
          </div>
        </div>

        <!-- Template -->
        <div class="card">
          <div class="card-section-title">Type de page</div>
          <div class="template-grid">
            <button
              v-for="tmpl in templates"
              :key="tmpl.key"
              class="template-btn"
              :class="{ active: form.template === tmpl.key }"
              @click="form.template = tmpl.key"
            >
              <span v-html="tmpl.icon"></span>
              <span>{{ tmpl.label }}</span>
            </button>
          </div>
        </div>

        <!-- Image -->
        <div class="card">
          <div class="card-section-title">Image d'en-tête <span class="optional">(optionnel)</span></div>
          <div
            class="image-drop"
            :class="{ 'has-image': form.image_preview }"
            @click="$refs.imgInput.click()"
            @dragover.prevent
            @drop.prevent="handleDrop"
          >
            <img v-if="form.image_preview" :src="form.image_preview" class="image-preview"/>
            <div v-else class="image-placeholder">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span>Cliquer pour ajouter</span>
            </div>
          </div>
          <input ref="imgInput" type="file" accept="image/*" style="display:none" @change="handleFile"/>
          <button v-if="form.image_preview" class="remove-btn" @click="form.image_preview = null">
            Supprimer
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
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()

const isEdit     = computed(() => !!route.params.id)
const saving     = ref(false)
const contentRef = ref(null)
const toast      = ref({ show: false, type: 'success', message: '' })

const form = ref({
  titre:            '',
  contenu:          '',
  statut:           'brouillon',
  dans_menu:        true,
  ordre_menu:       0,
  meta_titre:       '',
  meta_description: '',
  template:         'standard',
  image_preview:    null,
  image_file:       null,
})

const templates = [
  {
    key: 'standard', label: 'Standard',
    icon: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6M5 5h14"/>
    </svg>`,
  },
  {
    key: 'accueil', label: 'Accueil',
    icon: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
    </svg>`,
  },
  {
    key: 'contact', label: 'Contact',
    icon: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
    </svg>`,
  },
  {
    key: 'galerie', label: 'Galerie',
    icon: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
    </svg>`,
  },
]

const generatedSlug = computed(() =>
  form.value.titre
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-')
    .substring(0, 60)
)

function wrapText(before, after) {
  const el = contentRef.value
  if (!el) return
  const start = el.selectionStart
  const end   = el.selectionEnd
  const sel   = form.value.contenu.substring(start, end)
  form.value.contenu =
    form.value.contenu.substring(0, start) +
    before + sel + after +
    form.value.contenu.substring(end)
}

function handleDrop(e) {
  const file = e.dataTransfer.files[0]
  if (file?.type.startsWith('image/')) setFile(file)
}
function handleFile(e) {
  const file = e.target.files[0]
  if (file) setFile(file)
}
function setFile(file) {
  form.value.image_file = file
  const reader = new FileReader()
  reader.onload = e => { form.value.image_preview = e.target.result }
  reader.readAsDataURL(file)
}

onMounted(async () => {
  if (isEdit.value) {
    try {
      const { data } = await api.get(`/ministry/pages/${route.params.id}`)
      const p = data.data
      Object.assign(form.value, {
        titre:            p.titre,
        contenu:          p.contenu || '',
        statut:           p.statut,
        dans_menu:        p.dans_menu,
        ordre_menu:       p.ordre_menu ?? 0,
        meta_titre:       p.meta_titre || '',
        meta_description: p.meta_description || '',
        template:         p.template || 'standard',
        image_preview:    p.image || null,
      })
    } catch (e) { console.error(e) }
  }
})

async function save(statut) {
  if (!form.value.titre.trim()) {
    showToast('Le titre est obligatoire.', 'error')
    return
  }
  saving.value = true
  try {
    // Upload image si présente
    let imageUrl = null
    if (form.value.image_file) {
      const fd = new FormData()
      fd.append('fichier', form.value.image_file)
      fd.append('ministere_id', auth.user?.ministere_id || 1)
      const res = await api.post('/ministry/media/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      imageUrl = res.data.data?.url
    }

    const payload = {
      titre:            form.value.titre,
      contenu:          form.value.contenu,
      statut,
      dans_menu:        form.value.dans_menu,
      ordre_menu:       form.value.ordre_menu,
      meta_titre:       form.value.meta_titre,
      meta_description: form.value.meta_description,
      ministere_id:     auth.user?.ministere_id || 1,
    }
    if (imageUrl) payload.image = imageUrl

    if (isEdit.value) {
      await api.put(`/ministry/pages/${route.params.id}`, payload)
      if (statut === 'publie') await api.patch(`/ministry/pages/${route.params.id}/publish`)
    } else {
      const { data } = await api.post('/ministry/pages', payload)
      if (statut === 'publie') await api.patch(`/ministry/pages/${data.data.id}/publish`)
    }

    showToast(statut === 'publie' ? 'Page publiée !' : 'Brouillon enregistré.', 'success')
    setTimeout(() => router.push('/pages'), 1200)
  } catch (e) {
    showToast(e.response?.data?.message || 'Erreur.', 'error')
  } finally {
    saving.value = false
  }
}

function showToast(message, type = 'success') {
  toast.value = { show: true, type, message }
  setTimeout(() => { toast.value.show = false }, 3000)
}
</script>

<style scoped>
.form-header {
  display: flex; align-items: center;
  justify-content: space-between; margin-bottom: 20px;
}
.breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; }
.breadcrumb-link { color: #3B82F6; text-decoration: none; }
.breadcrumb-sep     { color: #CBD5E1; }
.breadcrumb-current { color: #64748B; }
.form-actions { display: flex; gap: 8px; }

.btn-primary {
  display: flex; align-items: center; gap: 6px;
  background: #1E3A8A; color: #fff; border: none;
  padding: 9px 20px; border-radius: 8px;
  font-size: 13px; font-weight: 500; cursor: pointer;
  min-width: 120px; justify-content: center;
  transition: background .12s;
}
.btn-primary:hover:not(:disabled) { background: #1e40af; }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }
.btn-secondary {
  padding: 9px 16px; border: 1px solid #E2E8F0;
  border-radius: 8px; background: #fff;
  font-size: 13px; color: #374151; cursor: pointer;
}
.btn-outline-save {
  padding: 9px 16px; border: 1px solid #E2E8F0;
  border-radius: 8px; background: #fff;
  font-size: 13px; color: #374151; cursor: pointer;
  transition: all .12s;
}
.btn-outline-save:hover { border-color: #3B82F6; color: #3B82F6; }

.form-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 16px; align-items: flex-start;
}
.form-main    { display: flex; flex-direction: column; gap: 16px; }
.form-sidebar { display: flex; flex-direction: column; gap: 16px; }

.card {
  background: #fff; border: 1px solid #E2E8F0;
  border-radius: 12px; padding: 20px;
}
.card-section-title {
  font-size: 11px; font-weight: 600; color: #94A3B8;
  text-transform: uppercase; letter-spacing: .06em; margin-bottom: 14px;
}

.title-input {
  width: 100%; border: none; outline: none;
  font-size: 22px; font-weight: 700; color: #0F172A;
  font-family: 'Sora', system-ui, sans-serif;
  background: transparent; padding: 0;
}
.title-input::placeholder { color: #CBD5E1; }
.slug-row {
  display: flex; align-items: center; gap: 6px;
  margin-top: 10px; padding-top: 10px;
  border-top: 1px solid #F1F5F9;
}
.slug-label { font-size: 11px; color: #94A3B8; }
.slug-value { font-size: 11px; color: #3B82F6; font-family: monospace; }

.editor-toolbar {
  display: flex; align-items: center; gap: 4px;
  padding: 8px 10px; background: #F8FAFC;
  border: 1px solid #E2E8F0; border-bottom: none;
  border-radius: 8px 8px 0 0;
}
.toolbar-btn {
  padding: 4px 10px; border: none; background: transparent;
  font-size: 13px; font-weight: 600; color: #374151;
  cursor: pointer; border-radius: 4px; transition: background .1s;
}
.toolbar-btn:hover { background: #E2E8F0; }
.toolbar-btn.italic  { font-style: italic; }
.toolbar-sep { width: 1px; height: 16px; background: #E2E8F0; margin: 0 4px; }
.toolbar-hint { font-size: 11px; color: #CBD5E1; margin-left: auto; }

.content-editor {
  width: 100%; border: 1px solid #E2E8F0;
  border-radius: 0 0 8px 8px; padding: 14px;
  font-size: 14px; color: #0F172A; line-height: 1.8;
  outline: none; resize: vertical; font-family: inherit;
  transition: border-color .15s;
}
.content-editor:focus { border-color: #3B82F6; }

.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.form-group:last-child { margin-bottom: 0; }
.form-label { font-size: 12px; font-weight: 500; color: #374151; }
.optional { color: #94A3B8; font-weight: 400; }
.form-input {
  width: 100%; padding: 9px 12px;
  border: 1px solid #E2E8F0; border-radius: 8px;
  font-size: 13px; color: #0F172A; background: #fff;
  outline: none; transition: border-color .15s; font-family: inherit;
}
.form-input:focus { border-color: #3B82F6; }
.form-hint { font-size: 11px; color: #94A3B8; margin-top: 3px; }
.char-count { font-size: 11px; color: #94A3B8; text-align: right; margin-top: 3px; }
.char-count.warn { color: #DC2626; }

.status-row {
  display: flex; align-items: center;
  justify-content: space-between; font-size: 13px; margin-bottom: 12px;
}
.status-label { color: #64748B; }
.badge {
  display: inline-flex; padding: 2px 8px;
  border-radius: 20px; font-size: 11px; font-weight: 500;
}
.badge-green { background: #DCFCE7; color: #166534; }
.badge-gray  { background: #F1F5F9; color: #475569; }
.mt-10 { margin-top: 10px; }

.toggle-row {
  display: flex; align-items: center;
  justify-content: space-between; font-size: 13px; margin-bottom: 10px;
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

.template-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.template-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 10px; border: 1.5px solid #E2E8F0;
  border-radius: 8px; background: #fff;
  font-size: 12px; font-weight: 500; color: #64748B;
  cursor: pointer; transition: all .12s;
}
.template-btn:hover { border-color: #93C5FD; color: #1D4ED8; }
.template-btn.active {
  border-color: #3B82F6; background: #EFF6FF; color: #1D4ED8;
}

.image-drop {
  border: 2px dashed #E2E8F0; border-radius: 10px;
  min-height: 80px; display: flex;
  align-items: center; justify-content: center;
  cursor: pointer; transition: all .15s; overflow: hidden;
}
.image-drop:hover { border-color: #3B82F6; background: #EFF6FF; }
.image-drop.has-image { border-style: solid; }
.image-preview { width: 100%; height: 100px; object-fit: cover; display: block; }
.image-placeholder {
  display: flex; flex-direction: column;
  align-items: center; gap: 6px;
  color: #CBD5E1; font-size: 11px; padding: 16px;
}
.remove-btn {
  width: 100%; margin-top: 8px; padding: 6px;
  border: 1px solid #FECACA; border-radius: 6px;
  background: #FEF2F2; color: #DC2626;
  font-size: 12px; cursor: pointer;
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