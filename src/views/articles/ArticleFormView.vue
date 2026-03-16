<template>
    <div class="fade-in">

        <!-- Header avec breadcrumb -->
        <div class="form-header">
            <div class="breadcrumb">
                <RouterLink to="/articles" class="breadcrumb-link">Articles</RouterLink>
                <span class="breadcrumb-sep">›</span>
                <span class="breadcrumb-current">{{ isEdit ? 'Modifier' : 'Nouvel article' }}</span>
            </div>
            <div class="form-actions">
                <button class="btn-secondary" @click="router.push('/articles')">Annuler</button>
                <button class="btn-outline-save" @click="saveAsDraft" :disabled="saving">
                    {{ saving === 'draft' ? 'Enregistrement...' : 'Brouillon' }}
                </button>
                <button class="btn-primary" @click="saveAndPublish" :disabled="saving">
                    <span v-if="saving === 'publish'">
                        <span class="spinner-sm"></span>
                    </span>
                    <span v-else>
                        {{ isEdit && form.statut === 'publie' ? 'Mettre à jour' : 'Publier' }}
                    </span>
                </button>
            </div>
        </div>

        <div class="form-layout">

            <!-- Colonne principale -->
            <div class="form-main">

                <!-- Titre -->
                <div class="card">
                    <input v-model="form.titre" class="title-input" placeholder="Titre de l'article..."
                        maxlength="255" />
                    <div class="slug-row">
                        <span class="slug-label">Slug :</span>
                        <span class="slug-value">{{ generatedSlug }}</span>
                    </div>
                </div>

                <!-- Type de contenu -->
                <div class="card">
                    <div class="card-section-title">Type de contenu</div>
                    <div class="type-grid">
                        <button v-for="type in contentTypes" :key="type.key" class="type-btn"
                            :class="{ active: form.type_contenu === type.key }" @click="form.type_contenu = type.key">
                            <span class="type-btn-icon" v-html="type.icon"></span>
                            <span class="type-btn-label">{{ type.label }}</span>
                        </button>
                    </div>
                </div>

                <!-- Contenu selon le type -->
                <div class="card">

                    <!-- Texte -->
                    <div v-if="form.type_contenu === 'texte' || form.type_contenu === 'mixte'">
                        <div class="card-section-title">Contenu</div>
                        <div class="editor-toolbar">
                            <button class="toolbar-btn" @click="wrapText('**', '**')" title="Gras">B</button>
                            <button class="toolbar-btn italic" @click="wrapText('*', '*')" title="Italique">I</button>
                            <button class="toolbar-btn" @click="wrapText('\n## ', '')" title="Titre">H2</button>
                            <button class="toolbar-btn" @click="wrapText('\n- ', '')" title="Liste">•</button>
                            <div class="toolbar-sep"></div>
                            <span class="toolbar-hint">Markdown supporté</span>
                        </div>
                        <textarea v-model="form.contenu" class="content-editor"
                            placeholder="Rédigez votre contenu ici..." rows="14" ref="contentRef"></textarea>
                    </div>

                    <!-- YouTube -->
                    <div v-if="form.type_contenu === 'video_youtube' || form.type_contenu === 'mixte'">
                        <div class="card-section-title" :class="{ 'mt-16': form.type_contenu === 'mixte' }">
                            Vidéo YouTube
                        </div>
                        <div class="form-group">
                            <label class="form-label">URL ou ID YouTube</label>
                            <input v-model="youtubeInput" class="form-input"
                                placeholder="https://youtube.com/watch?v=... ou dQw4w9WgXcQ" @input="parseYoutube" />
                        </div>
                        <div v-if="form.youtube_id" class="youtube-preview">
                            <img :src="`https://img.youtube.com/vi/${form.youtube_id}/hqdefault.jpg`"
                                class="youtube-thumb" :alt="form.titre" />
                            <div class="youtube-info">
                                <div class="youtube-id">ID : {{ form.youtube_id }}</div>
                                <a :href="`https://youtube.com/watch?v=${form.youtube_id}`" target="_blank"
                                    class="youtube-link">Voir sur YouTube →</a>
                            </div>
                        </div>
                    </div>

                    <!-- Lien externe -->
                    <div v-if="form.type_contenu === 'lien_externe'">
                        <div class="card-section-title">Lien externe</div>
                        <div class="form-group">
                            <label class="form-label">URL du lien</label>
                            <input v-model="form.url_externe" class="form-input" placeholder="https://..." type="url" />
                        </div>
                    </div>

                    <!-- Audio -->
                    <div v-if="form.type_contenu === 'audio'">
                        <div class="card-section-title">Fichier audio</div>
                        <div class="form-group">
                            <label class="form-label">URL du fichier audio</label>
                            <input v-model="form.url_externe" class="form-input"
                                placeholder="https://... (MP3, WAV, etc.)" />
                        </div>
                    </div>

                    <!-- Résumé (tous les types) -->
                    <div class="form-group" :class="{ 'mt-16': form.type_contenu !== 'texte' }">
                        <label class="form-label">Résumé <span class="optional">(optionnel)</span></label>
                        <textarea v-model="form.resume" class="form-input"
                            placeholder="Résumé court affiché dans les listes..." rows="3"
                            style="resize: vertical"></textarea>
                    </div>

                </div>

            </div>

            <!-- Colonne latérale -->
            <div class="form-sidebar">

                <!-- Statut & publication -->
                <div class="card">
                    <div class="card-section-title">Publication</div>
                    <div class="status-row">
                        <span class="status-label">Statut</span>
                        <span class="badge" :class="form.statut === 'publie' ? 'badge-green' : 'badge-gray'">
                            {{ form.statut === 'publie' ? 'Publié' : 'Brouillon' }}
                        </span>
                    </div>
                    <div v-if="form.statut === 'publie'" class="status-row">
                        <span class="status-label">Publié le</span>
                        <span class="status-val">{{ formatDate(form.date_publication) }}</span>
                    </div>
                    <div class="toggle-row">
                        <span class="toggle-label">Mettre en avant</span>
                        <label class="toggle">
                            <input type="checkbox" v-model="form.en_avant" />
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="toggle-row">
                        <span class="toggle-label">Autoriser les commentaires</span>
                        <label class="toggle">
                            <input type="checkbox" v-model="form.commentaires_actifs" />
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                <!-- Catégorie et infos -->
                <div class="card">
                    <div class="card-section-title">Informations</div>

                    <div class="form-group">
                        <label class="form-label">Catégorie</label>
                        <input v-model="form.categorie" class="form-input" placeholder="Enseignements, Témoignages..."
                            list="categories-list" />
                        <datalist id="categories-list">
                            <option v-for="cat in suggestedCategories" :key="cat" :value="cat" />
                        </datalist>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Auteur externe <span class="optional">(optionnel)</span></label>
                        <input v-model="form.auteur_externe" class="form-input"
                            placeholder="Pasteur Bangaya K. Freddy" />
                    </div>

                    <div class="form-group">
                        <label class="form-label">Durée <span class="optional">(optionnel)</span></label>
                        <input v-model="form.duree" class="form-input" placeholder="45 min, 1h30..." />
                    </div>
                </div>

                <!-- Image à la une -->
                <div class="card">
                    <div class="card-section-title">Image à la une</div>
                    <div class="image-drop" :class="{ 'has-image': form.image_preview, dragging }"
                        @dragover.prevent="dragging = true" @dragleave="dragging = false"
                        @drop.prevent="handleImageDrop" @click="$refs.imageInput.click()">
                        <img v-if="form.image_preview" :src="form.image_preview" class="image-preview" />
                        <div v-else class="image-drop-placeholder">
                            <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Cliquer ou glisser une image</span>
                        </div>
                    </div>
                    <input ref="imageInput" type="file" accept="image/*" style="display:none"
                        @change="handleImageSelect" />
                    <button v-if="form.image_preview" class="remove-image"
                        @click="form.image_preview = null; form.image_file = null">
                        Supprimer l'image
                    </button>
                </div>

                <!-- Tags -->
                <div class="card">
                    <div class="card-section-title">Tags</div>
                    <div class="tags-wrap">
                        <div v-for="tag in form.tags" :key="tag" class="tag-item">
                            {{ tag }}
                            <button class="tag-remove" @click="removeTag(tag)">×</button>
                        </div>
                    </div>
                    <div class="tag-input-wrap">
                        <input v-model="tagInput" class="form-input" placeholder="Ajouter un tag..."
                            @keydown.enter.prevent="addTag" @keydown.comma.prevent="addTag" />
                    </div>
                </div>

            </div>
        </div>

        <!-- Toast notification -->
        <Transition name="toast">
            <div v-if="toast.show" class="toast" :class="toast.type">
                <svg v-if="toast.type === 'success'" width="16" height="16" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ toast.message }}
            </div>
        </Transition>

    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const isEdit = computed(() => !!route.params.id)
const saving = ref(null)
const dragging = ref(false)
const tagInput = ref('')
const youtubeInput = ref('')
const contentRef = ref(null)

const form = ref({
    titre: '',
    type_contenu: 'texte',
    contenu: '',
    resume: '',
    youtube_id: '',
    url_externe: '',
    auteur_externe: '',
    duree: '',
    categorie: '',
    statut: 'brouillon',
    en_avant: false,
    commentaires_actifs: true,
    image_preview: null,
    image_file: null,
    date_publication: null,
    tags: [],
})

const toast = ref({ show: false, type: 'success', message: '' })

const suggestedCategories = [
    'Enseignements', 'Prédications', 'Témoignages',
    'Ressources', 'Actualités', 'Jeunesse', 'Famille',
]

const contentTypes = [
    {
        key: 'texte', label: 'Texte',
        icon: `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6M5 5h14"/>
    </svg>`,
    },
    {
        key: 'video_youtube', label: 'YouTube',
        icon: `<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
      <path d="M21.582 7.186a2.506 2.506 0 00-1.762-1.773C18.265 5 12 5 12 5s-6.265 0-7.82.413a2.506 2.506 0 00-1.762 1.773C2 8.748 2 12 2 12s0 3.252.418 4.814a2.506 2.506 0 001.762 1.773C5.735 19 12 19 12 19s6.265 0 7.82-.413a2.506 2.506 0 001.762-1.773C22 15.252 22 12 22 12s0-3.252-.418-4.814zM10 15V9l5.197 3L10 15z"/>
    </svg>`,
    },
    {
        key: 'lien_externe', label: 'Lien',
        icon: `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
    </svg>`,
    },
    {
        key: 'audio', label: 'Audio',
        icon: `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"/>
    </svg>`,
    },
    {
        key: 'mixte', label: 'Mixte',
        icon: `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/>
    </svg>`,
    },
]

// Slug auto-généré
const generatedSlug = computed(() => {
    return form.value.titre
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .substring(0, 60)
})

// Parser YouTube
function parseYoutube(e) {
    const val = e.target.value
    const match = val.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
    if (match) {
        form.value.youtube_id = match[1]
    } else if (/^[a-zA-Z0-9_-]{11}$/.test(val.trim())) {
        form.value.youtube_id = val.trim()
    }
}

// Toolbar markdown
function wrapText(before, after) {
    const el = contentRef.value
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const sel = form.value.contenu.substring(start, end)
    form.value.contenu =
        form.value.contenu.substring(0, start) +
        before + sel + after +
        form.value.contenu.substring(end)
}

// Image
function handleImageDrop(e) {
    dragging.value = false
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) setImageFile(file)
}
function handleImageSelect(e) {
    const file = e.target.files[0]
    if (file) setImageFile(file)
}
function setImageFile(file) {
    form.value.image_file = file
    const reader = new FileReader()
    reader.onload = e => { form.value.image_preview = e.target.result }
    reader.readAsDataURL(file)
}

// Tags
function addTag() {
    const tag = tagInput.value.trim().replace(',', '')
    if (tag && !form.value.tags.includes(tag)) {
        form.value.tags.push(tag)
    }
    tagInput.value = ''
}
function removeTag(tag) {
    form.value.tags = form.value.tags.filter(t => t !== tag)
}

function formatDate(date) {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric'
    })
}

// Charger si édition
onMounted(async () => {
    if (isEdit.value) {
        try {
            const { data } = await api.get(`/ministry/articles/${route.params.id}`)
            const a = data.data
            Object.assign(form.value, {
                titre: a.titre,
                type_contenu: a.type_contenu,
                contenu: a.contenu || '',
                resume: a.resume || '',
                youtube_id: a.youtube_id || '',
                url_externe: a.url_externe || '',
                auteur_externe: a.auteur_externe || '',
                duree: a.duree || '',
                categorie: a.categorie || '',
                statut: a.statut,
                en_avant: a.en_avant,
                date_publication: a.date_publication,
                image_preview: a.image_une || null,
            })
            if (a.youtube_id) youtubeInput.value = a.youtube_id
        } catch (e) {
            console.error(e)
        }
    }
})

// Sauvegarder
async function saveAsDraft() {
    saving.value = 'draft'
    form.value.statut = 'brouillon'
    await save()
}

async function saveAndPublish() {
    saving.value = 'publish'
    form.value.statut = 'publie'
    await save()
}

async function save() {
    if (!form.value.titre.trim()) {
        showToast('Le titre est obligatoire.', 'error')
        saving.value = null
        return
    }

    try {
        // 1. Uploader l'image si présente
        let imageUrl = null
        if (form.value.image_file) {
            const formData = new FormData()
            formData.append('fichier', form.value.image_file)
            formData.append('ministere_id', auth.user?.ministere_id || 1)
            formData.append('categorie', 'articles')

            const uploadRes = await api.post('/ministry/media/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            imageUrl = uploadRes.data.data?.url
        }

        // 2. Sauvegarder l'article
        const payload = {
            titre: form.value.titre,
            type_contenu: form.value.type_contenu,
            contenu: form.value.contenu,
            resume: form.value.resume,
            youtube_id: form.value.youtube_id,
            url_externe: form.value.url_externe,
            auteur_externe: form.value.auteur_externe,
            duree: form.value.duree,
            categorie: form.value.categorie,
            statut: form.value.statut,
            en_avant: form.value.en_avant,
            ministere_id: auth.user?.ministere_id || 1,
            tags: form.value.tags  // AJOUTER CETTE LIGNE
        }

        if (imageUrl) payload.image_une = imageUrl

        if (isEdit.value) {
            await api.put(`/ministry/articles/${route.params.id}`, payload)
            if (form.value.statut === 'publie') {
                await api.patch(`/ministry/articles/${route.params.id}/publish`)
            }
        } else {
            const { data } = await api.post('/ministry/articles', payload)
            if (form.value.statut === 'publie') {
                await api.patch(`/ministry/articles/${data.data.id}/publish`)
            }
        }

        showToast(
            form.value.statut === 'publie' ? 'Article publié !' : 'Brouillon enregistré.',
            'success'
        )
        setTimeout(() => router.push('/articles'), 1200)
    } catch (e) {
        showToast(e.response?.data?.message || 'Une erreur est survenue.', 'error')
    } finally {
        saving.value = null
    }
}

function showToast(message, type = 'success') {
    toast.value = { show: true, type, message }
    setTimeout(() => { toast.value.show = false }, 3000)
}
</script>

<style scoped>
/* Header */
.form-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
}

.breadcrumb-link {
    color: #3B82F6;
    text-decoration: none;
}

.breadcrumb-link:hover {
    color: #1D4ED8;
}

.breadcrumb-sep {
    color: #CBD5E1;
}

.breadcrumb-current {
    color: #64748B;
}

.form-actions {
    display: flex;
    gap: 8px;
    align-items: center;
}

/* Buttons */
.btn-primary {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #1E3A8A;
    color: #fff;
    border: none;
    padding: 9px 20px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    min-width: 120px;
    justify-content: center;
    transition: background .12s;
}

.btn-primary:hover:not(:disabled) {
    background: #1e40af;
}

.btn-primary:disabled {
    opacity: .6;
    cursor: not-allowed;
}

.btn-secondary {
    padding: 9px 16px;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    background: #fff;
    font-size: 13px;
    color: #374151;
    cursor: pointer;
    transition: background .12s;
}

.btn-secondary:hover {
    background: #F8FAFC;
}

.btn-outline-save {
    padding: 9px 16px;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    background: #fff;
    font-size: 13px;
    color: #374151;
    cursor: pointer;
    transition: all .12s;
}

.btn-outline-save:hover {
    border-color: #3B82F6;
    color: #3B82F6;
}

.btn-outline-save:disabled {
    opacity: .6;
    cursor: not-allowed;
}

/* Layout */
.form-layout {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 16px;
    align-items: flex-start;
}

.form-main {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.form-sidebar {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

/* Card */
.card {
    background: #fff;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    padding: 20px;
}

.card-section-title {
    font-size: 12px;
    font-weight: 600;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: .06em;
    margin-bottom: 14px;
}

.mt-16 {
    margin-top: 20px;
}

/* Title input */
.title-input {
    width: 100%;
    border: none;
    outline: none;
    font-size: 22px;
    font-weight: 700;
    color: #0F172A;
    font-family: 'Sora', system-ui, sans-serif;
    background: transparent;
    padding: 0;
    line-height: 1.3;
}

.title-input::placeholder {
    color: #CBD5E1;
}

.slug-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #F1F5F9;
}

.slug-label {
    font-size: 11px;
    color: #94A3B8;
}

.slug-value {
    font-size: 11px;
    color: #64748B;
    font-family: monospace;
}

/* Type grid */
.type-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
}

.type-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px 8px;
    border: 1.5px solid #E2E8F0;
    border-radius: 10px;
    background: #fff;
    cursor: pointer;
    transition: all .12s;
    color: #64748B;
}

.type-btn:hover {
    border-color: #93C5FD;
    background: #EFF6FF;
    color: #1D4ED8;
}

.type-btn.active {
    border-color: #3B82F6;
    background: #EFF6FF;
    color: #1D4ED8;
}

.type-btn-icon {
    display: flex;
}

.type-btn-label {
    font-size: 11px;
    font-weight: 500;
}

/* Editor toolbar */
.editor-toolbar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 10px;
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-bottom: none;
    border-radius: 8px 8px 0 0;
}

.toolbar-btn {
    padding: 4px 10px;
    border: none;
    background: transparent;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    cursor: pointer;
    border-radius: 4px;
    transition: background .1s;
}

.toolbar-btn:hover {
    background: #E2E8F0;
}

.toolbar-btn.italic {
    font-style: italic;
}

.toolbar-sep {
    width: 1px;
    height: 16px;
    background: #E2E8F0;
    margin: 0 4px;
}

.toolbar-hint {
    font-size: 11px;
    color: #CBD5E1;
    margin-left: auto;
}

.content-editor {
    width: 100%;
    border: 1px solid #E2E8F0;
    border-radius: 0 0 8px 8px;
    padding: 14px;
    font-size: 14px;
    color: #0F172A;
    line-height: 1.7;
    outline: none;
    resize: vertical;
    font-family: 'DM Sans', system-ui, sans-serif;
    transition: border-color .15s;
}

.content-editor:focus {
    border-color: #3B82F6;
}

/* Form elements */
.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 14px;
}

.form-group:last-child {
    margin-bottom: 0;
}

.form-label {
    font-size: 12px;
    font-weight: 500;
    color: #374151;
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
    box-shadow: 0 0 0 3px rgba(59, 130, 246, .08);
}

.form-input::placeholder {
    color: #CBD5E1;
}

/* YouTube preview */
.youtube-preview {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-top: 12px;
    padding: 10px;
    background: #F8FAFC;
    border-radius: 8px;
    border: 1px solid #E2E8F0;
}

.youtube-thumb {
    width: 100px;
    height: 56px;
    object-fit: cover;
    border-radius: 6px;
}

.youtube-id {
    font-size: 12px;
    color: #64748B;
    font-family: monospace;
}

.youtube-link {
    font-size: 12px;
    color: #3B82F6;
    text-decoration: none;
    display: block;
    margin-top: 4px;
}

/* Publication status */
.status-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    margin-bottom: 12px;
}

.status-label {
    color: #64748B;
}

.status-val {
    color: #0F172A;
    font-weight: 500;
}

.badge {
    display: inline-flex;
    padding: 2px 8px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 500;
}

.badge-green {
    background: #DCFCE7;
    color: #166534;
}

.badge-gray {
    background: #F1F5F9;
    color: #475569;
}

/* Toggle */
.toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    margin-bottom: 10px;
}

.toggle-row:last-child {
    margin-bottom: 0;
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

/* Image drop */
.image-drop {
    border: 2px dashed #E2E8F0;
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    transition: border-color .15s, background .15s;
    min-height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.image-drop:hover,
.image-drop.dragging {
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

.image-drop-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 24px;
    color: #CBD5E1;
    font-size: 12px;
    text-align: center;
}

.remove-image {
    width: 100%;
    margin-top: 8px;
    padding: 7px;
    border: 1px solid #FECACA;
    border-radius: 6px;
    background: #FEF2F2;
    color: #DC2626;
    font-size: 12px;
    cursor: pointer;
    transition: background .12s;
}

.remove-image:hover {
    background: #FEE2E2;
}

/* Tags */
.tags-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 10px;
    min-height: 28px;
}

.tag-item {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: #EEF2FF;
    color: #4338CA;
    font-size: 12px;
    padding: 3px 8px 3px 10px;
    border-radius: 20px;
}

.tag-remove {
    background: none;
    border: none;
    color: #818CF8;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    padding: 0;
    transition: color .1s;
}

.tag-remove:hover {
    color: #4338CA;
}

/* Toast */
.toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    display: flex;
    align-items: center;
    gap: 8px;
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
    transition: all .3s ease;
}

.toast-enter-from {
    opacity: 0;
    transform: translateY(10px);
}

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