<template>
    <div class="fade-in">

        <!-- Filtres -->
        <div class="filters-bar">
            <div class="filters-left">
                <button v-for="tab in tabs" :key="tab.key" class="tab-btn" :class="{ active: activeTab === tab.key }"
                    @click="activeTab = tab.key; loadArticles()">
                    {{ tab.label }}
                    <span class="tab-count">{{ tab.count }}</span>
                </button>
            </div>

            <div class="filters-right">
                <div class="search-wrap">
                    <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input v-model="search" class="search-input" placeholder="Rechercher..." @input="debouncedSearch" />
                </div>

                <div class="select-wrap">
                    <select v-model="filterType" class="filter-select" @change="loadArticles()">
                        <option value="">Tous les types</option>
                        <option value="texte">Texte</option>
                        <option value="video_youtube">YouTube</option>
                        <option value="lien_externe">Lien externe</option>
                        <option value="audio">Audio</option>
                    </select>
                    <svg class="select-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                <RouterLink to="/articles/new" class="btn-primary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Nouvel article</span>
                </RouterLink>
            </div>
        </div>

        <!-- Tableau -->
        <div class="table-container">
            <!-- Header -->
            <div class="table-head">
                <div class="th" style="flex:1">Article</div>
                <div class="th" style="width:120px">Type</div>
                <div class="th" style="width:110px">Catégorie</div>
                <div class="th" style="width:80px;text-align:center">Vues</div>
                <div class="th" style="width:100px">Statut</div>
                <div class="th" style="width:100px">Date</div>
                <div class="th" style="width:80px">Actions</div>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="loading-state">
                <div v-for="i in 5" :key="i" class="skeleton-row">
                    <div class="skeleton-thumb"></div>
                    <div class="skeleton-lines">
                        <div class="skeleton-line w70"></div>
                        <div class="skeleton-line w40"></div>
                    </div>
                </div>
            </div>

            <!-- Empty -->
            <div v-else-if="articles.length === 0" class="empty-table">
                <div class="empty-illustration">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                </div>
                <h3 class="empty-title">Aucun article</h3>
                <p class="empty-description">Commencez par créer votre premier article</p>
                <RouterLink to="/articles/new" class="empty-action">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Créer un article
                </RouterLink>
            </div>

            <!-- Rows -->
            <div v-else>
                <div v-for="article in articles" :key="article.id" class="table-row stagger-item"
                    @click="router.push(`/articles/${article.id}`)">
                    <!-- Article info -->
                    <div class="td" style="flex:1">
                        <div class="article-cell">
                            <div class="article-thumb"
                                :style="{ background: typeConfig[article.type_contenu]?.bg + '20' }">
                                <span v-html="typeConfig[article.type_contenu]?.icon"
                                    :style="{ color: typeConfig[article.type_contenu]?.color }"></span>
                            </div>
                            <div class="article-cell-info">
                                <div class="article-cell-title">{{ article.titre }}</div>
                                <div class="article-cell-meta">
                                    <span v-if="article.en_avant" class="pin-badge">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2.5">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                        </svg>
                                        En avant
                                    </span>
                                    <span v-if="article.duree">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {{ article.duree }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Type -->
                    <div class="td" style="width:120px">
                        <span class="badge" :class="typeConfig[article.type_contenu]?.badge">
                            {{ typeLabels[article.type_contenu] || article.type_contenu }}
                        </span>
                    </div>

                    <!-- Catégorie -->
                    <div class="td" style="width:110px">
                        <span class="cat-text">{{ article.categorie || '—' }}</span>
                    </div>

                    <!-- Vues -->
                    <div class="td" style="width:80px;text-align:center">
                        <span class="views-count">{{ formatNumber(article.vues) || 0 }}</span>
                    </div>

                    <!-- Statut -->
                    <div class="td" style="width:100px">
                        <span class="badge" :class="article.statut === 'publie' ? 'badge-success' : 'badge-neutral'">
                            {{ article.statut === 'publie' ? 'Publié' : 'Brouillon' }}
                        </span>
                    </div>

                    <!-- Date -->
                    <div class="td" style="width:100px">
                        <span class="date-text">{{ formatDate(article.date_publication || article.created_at) }}</span>
                    </div>

                    <!-- Actions -->
                    <div class="td actions-td" style="width:80px" @click.stop>
                        <button class="action-btn edit" @click="router.push(`/articles/${article.id}`)"
                            title="Modifier">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>

                        <button class="action-btn" :class="article.statut === 'publie' ? 'unpublish' : 'publish'"
                            @click="togglePublish(article)"
                            :title="article.statut === 'publie' ? 'Dépublier' : 'Publier'"
                            :disabled="publishingId === article.id">
                            <span v-if="publishingId === article.id" class="spinner-sm"></span>
                            <template v-else>
                                <svg v-if="article.statut !== 'publie'" width="14" height="14" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            </template>
                        </button>

                        <button class="action-btn delete" @click="confirmDelete(article)" title="Supprimer">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.lastPage > 1" class="pagination">
            <button class="page-btn" :disabled="pagination.currentPage === 1"
                @click="changePage(pagination.currentPage - 1)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Précédent
            </button>

            <div class="page-info">
                Page {{ pagination.currentPage }} sur {{ pagination.lastPage }}
                <span class="page-total">({{ pagination.total }} articles)</span>
            </div>

            <button class="page-btn" :disabled="pagination.currentPage === pagination.lastPage"
                @click="changePage(pagination.currentPage + 1)">
                Suivant
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>

        <!-- Modal confirmation suppression -->
        <Teleport to="body">
            <div v-if="deleteModal.show" class="modal-overlay" @click.self="deleteModal.show = false">
                <div class="modal">
                    <div class="modal-icon danger">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    <h3 class="modal-title">Supprimer cet article ?</h3>
                    <p class="modal-sub">« {{ deleteModal.article?.titre }} »</p>
                    <p class="modal-sub">Cette action est irréversible.</p>
                    <div class="modal-actions">
                        <button class="btn-secondary" @click="deleteModal.show = false">Annuler</button>
                        <button class="btn-danger" :disabled="deleteModal.loading" @click="deleteArticle">
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
                    <path v-if="toast.type === 'success'" stroke-linecap="round" stroke-linejoin="round"
                        d="M5 13l4 4L19 7" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                {{ toast.message }}
            </div>
        </Transition>

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import { storageUrl } from '@/services/api'

const router = useRouter()
const auth = useAuthStore()

// États
const articles = ref([])
const loading = ref(true)
const search = ref('')
const activeTab = ref('')
const filterType = ref('')
const publishingId = ref(null)
const pagination = ref({ currentPage: 1, lastPage: 1, total: 0 })
const counts = ref({ all: 0, publie: 0, brouillon: 0 })
const deleteModal = ref({ show: false, article: null, loading: false })
const toast = ref({ show: false, type: 'success', message: '' })

// Tabs
const tabs = computed(() => [
    { key: '', label: 'Tous', count: counts.value.all },
    { key: 'publie', label: 'Publiés', count: counts.value.publie },
    { key: 'brouillon', label: 'Brouillons', count: counts.value.brouillon },
])

// Types d'articles
const typeLabels = {
    texte: 'Texte',
    video_youtube: 'YouTube',
    lien_externe: 'Lien',
    audio: 'Audio',
    mixte: 'Mixte',
}

const typeConfig = {
    texte: {
        bg: '#4338CA',
        color: '#4338CA',
        badge: 'badge-primary',
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
    </svg>`,
    },
    video_youtube: {
        bg: '#DC2626',
        color: '#DC2626',
        badge: 'badge-error',
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>`,
    },
    lien_externe: {
        bg: '#0369A1',
        color: '#0369A1',
        badge: 'badge-info',
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
    </svg>`,
    },
    audio: {
        bg: '#16A34A',
        color: '#16A34A',
        badge: 'badge-success',
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM21 16c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"/>
    </svg>`,
    },
    mixte: {
        bg: '#9333EA',
        color: '#9333EA',
        badge: 'badge-purple',
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h7"/>
    </svg>`,
    },
}

// Helpers
function formatNumber(num) {
    return num?.toLocaleString('fr-FR') || '0'
}

function formatDate(date) {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: '2-digit'
    })
}

function showToast(message, type = 'success') {
    toast.value = { show: true, type, message }
    setTimeout(() => { toast.value.show = false }, 2500)
}

// Debounce
let searchTimer = null
function debouncedSearch() {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => loadArticles(), 400)
}

// Chargement des articles
async function loadArticles(page = 1) {
    loading.value = true
    try {
        const params = { page, per_page: 15 }
        if (auth.user?.ministere_id) params.ministere_id = auth.user.ministere_id
        if (activeTab.value) params.statut = activeTab.value
        if (filterType.value) params.type_contenu = filterType.value
        if (search.value) params.search = search.value

        const { data } = await api.get('/ministry/articles', { params })
        const result = data.data

        articles.value = result.data || result
        pagination.value = {
            currentPage: result.current_page || 1,
            lastPage: result.last_page || 1,
            total: result.total || articles.value.length,
        }

        await loadCounts()
    } catch (e) {
        console.error(e)
        showToast('Erreur lors du chargement des articles.', 'error')
    } finally {
        loading.value = false
    }
}

// Chargement des compteurs
async function loadCounts() {
    try {
        const base = auth.user?.ministere_id ? { ministere_id: auth.user.ministere_id } : {}
        const [all, pub, draft] = await Promise.all([
            api.get('/ministry/articles', { params: { ...base, per_page: 1 } }),
            api.get('/ministry/articles', { params: { ...base, statut: 'publie', per_page: 1 } }),
            api.get('/ministry/articles', { params: { ...base, statut: 'brouillon', per_page: 1 } }),
        ])

        counts.value = {
            all: all.data.data?.total || 0,
            publie: pub.data.data?.total || 0,
            brouillon: draft.data.data?.total || 0,
        }
    } catch { }
}

async function togglePublish(article) {
    try {
        const { data } = await api.patch(`/ministry/articles/${article.id}/publish`)
        // Mettre à jour le statut depuis la réponse du serveur
        article.statut = data.statut
    } catch (e) {
        console.error(e)
    }
}

// Suppression
function confirmDelete(article) {
    deleteModal.value = { show: true, article, loading: false }
}

async function deleteArticle() {
    deleteModal.value.loading = true
    try {
        await api.delete(`/ministry/articles/${deleteModal.value.article.id}`)
        articles.value = articles.value.filter(a => a.id !== deleteModal.value.article.id)
        deleteModal.value.show = false
        counts.value.all = Math.max(0, counts.value.all - 1)
        showToast('Article supprimé avec succès.', 'success')
    } catch (e) {
        console.error(e)
        showToast('Erreur lors de la suppression.', 'error')
    } finally {
        deleteModal.value.loading = false
    }
}

// Pagination
function changePage(page) {
    loadArticles(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => loadArticles())
</script>

<style scoped>
.fade-in {
    width: 100%;
}

/* Filters bar */
.filters-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    gap: 16px;
    flex-wrap: wrap;
}

.filters-left {
    display: flex;
    gap: 4px;
    background: #F8FAFC;
    padding: 4px;
    border-radius: 10px;
    border: 1px solid #E2E8F0;
}

.filters-right {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
}

/* Tabs */
.tab-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
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
    width: 240px;
    transition: all 0.2s;
}

.search-input:focus {
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input::placeholder {
    color: #CBD5E1;
}

/* Select */
.select-wrap {
    position: relative;
    display: flex;
    align-items: center;
}

.filter-select {
    padding: 9px 32px 9px 12px;
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    font-size: 13px;
    color: #0F172A;
    background: white;
    outline: none;
    cursor: pointer;
    appearance: none;
    min-width: 150px;
    transition: all 0.2s;
}

.filter-select:focus {
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.select-arrow {
    position: absolute;
    right: 12px;
    color: #64748B;
    pointer-events: none;
}

/* Button primary */
.btn-primary {
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
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary:hover {
    background: #1e40af;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2);
}

/* Table */
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
    padding: 14px 16px;
    border-bottom: 1px solid #F1F5F9;
    cursor: pointer;
    transition: all 0.2s;
}

.table-row:last-child {
    border-bottom: none;
}

.table-row:hover {
    background: #F8FAFC;
}

.td {
    display: flex;
    align-items: center;
    font-size: 13px;
    color: #0F172A;
}

/* Article cell */
.article-cell {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
}

.article-thumb {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.article-cell-info {
    min-width: 0;
}

.article-cell-title {
    font-size: 13px;
    font-weight: 600;
    color: #0F172A;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
    margin-bottom: 4px;
}

.article-cell-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: #64748B;
}

.article-cell-meta svg {
    margin-right: 2px;
}

.pin-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #D97706;
    background: #FEF3C7;
    padding: 2px 6px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 500;
}

/* Badges */
.badge {
    display: inline-flex;
    padding: 4px 10px;
    border-radius: 30px;
    font-size: 11px;
    font-weight: 600;
}

.badge-primary {
    background: #EEF2FF;
    color: #4338CA;
}

.badge-success {
    background: #DCFCE7;
    color: #166534;
}

.badge-error {
    background: #FEE2E2;
    color: #991B1B;
}

.badge-info {
    background: #E0F2FE;
    color: #0369A1;
}

.badge-purple {
    background: #F3E8FF;
    color: #6D28D9;
}

.badge-neutral {
    background: #F1F5F9;
    color: #475569;
}

/* Catégorie */
.cat-text {
    font-size: 12px;
    color: #64748B;
    max-width: 110px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Vues */
.views-count {
    font-size: 13px;
    font-weight: 600;
    color: #0F172A;
}

/* Date */
.date-text {
    font-size: 12px;
    color: #64748B;
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
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.action-btn.edit {
    background: #EEF2FF;
    color: #4338CA;
}

.action-btn.publish {
    background: #DCFCE7;
    color: #16A34A;
}

.action-btn.unpublish {
    background: #FEF3C7;
    color: #D97706;
}

.action-btn.delete {
    background: #FEF2F2;
    color: #DC2626;
}

.action-btn:hover:not(:disabled) {
    filter: brightness(0.95);
    transform: scale(1.05);
}

.action-btn:disabled {
    opacity: 0.5;
    cursor: wait;
}

/* Pagination */
.pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;
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

/* Loading skeleton */
.loading-state {
    padding: 8px;
}

.skeleton-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-bottom: 1px solid #F1F5F9;
}

.skeleton-thumb {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: #F1F5F9;
    flex-shrink: 0;
    animation: shimmer 1.5s infinite;
}

.skeleton-lines {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
}

.skeleton-line {
    height: 12px;
    border-radius: 6px;
    background: #F1F5F9;
    animation: shimmer 1.5s infinite;
}

.w70 {
    width: 70%;
}

.w40 {
    width: 40%;
}

@keyframes shimmer {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

/* Empty state */
.empty-table {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 60px 20px;
    text-align: center;
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

/* Modal */
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
    to {
        transform: rotate(360deg);
    }
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
@media (max-width: 1024px) {
    .table-row {
        flex-wrap: wrap;
        gap: 12px;
    }

    .td[style*="width:80px"],
    .td[style*="width:100px"],
    .td[style*="width:110px"],
    .td[style*="width:120px"] {
        width: auto !important;
        min-width: 80px;
    }
}

@media (max-width: 768px) {
    .filters-bar {
        flex-direction: column;
        align-items: stretch;
    }

    .filters-right {
        flex-direction: column;
    }

    .search-input {
        width: 100%;
    }

    .filter-select {
        width: 100%;
    }

    .table-head {
        display: none;
    }

    .table-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .td {
        width: 100% !important;
    }

    .article-cell {
        width: 100%;
    }

    .actions-td {
        justify-content: flex-end;
        width: 100% !important;
    }
}
</style>