<template>
    <div class="fade-in">

        <!-- Info banner -->
        <div class="info-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Les pages constituent la structure de votre site public. L'ordre du menu est modifiable par
                glisser-déposer.</span>
        </div>

        <!-- Toolbar -->
        <div class="toolbar">
            <div class="toolbar-left">
                <button v-for="tab in tabs" :key="tab.key" class="tab-btn" :class="{ active: activeTab === tab.key }"
                    @click="activeTab = tab.key; loadPages()">
                    {{ tab.label }}
                    <span class="tab-count">{{ tab.count }}</span>
                </button>
            </div>
            <div class="toolbar-right">
                <div class="search-wrap">
                    <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input v-model="search" class="search-input" placeholder="Rechercher..." @input="debouncedSearch" />
                </div>
                <RouterLink to="/pages/new" class="btn-primary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Nouvelle page</span>
                </RouterLink>
            </div>
        </div>

        <!-- Pages liste avec drag & drop -->
        <div class="pages-container">

            <!-- Loading -->
            <div v-if="loading" class="pages-list">
                <div v-for="i in 4" :key="i" class="page-skeleton">
                    <div class="sk-icon"></div>
                    <div class="sk-lines">
                        <div class="sk-line w50"></div>
                        <div class="sk-line w30"></div>
                    </div>
                </div>
            </div>

            <!-- Empty -->
            <div v-else-if="pages.length === 0" class="empty-state">
                <div class="empty-illustration">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 class="empty-title">Aucune page</h3>
                <p class="empty-description">Créez votre première page pour commencer</p>
                <RouterLink to="/pages/new" class="empty-action">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Créer une page
                </RouterLink>
            </div>

            <!-- Menu pages (drag & drop) -->
            <div v-else>

                <!-- Section menu -->
                <div class="section-header">
                    <div class="section-header-left">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        <span class="section-title">Pages dans le menu</span>
                    </div>
                    <span class="section-sub">{{ menuPages.length }} page(s) — glissez pour réordonner</span>
                </div>

                <div class="pages-list menu-pages" @dragover.prevent @drop="onDrop($event, 'menu')">
                    <div v-for="page in menuPages" :key="page.id" class="page-item" :class="{
                        dragging: dragItem?.id === page.id,
                        'drag-over': dragOver === page.id
                    }" draggable="true" @dragstart="onDragStart($event, page)" @dragend="onDragEnd"
                        @dragover.prevent="dragOver = page.id" @dragleave="dragOver = null">
                        <!-- Handle -->
                        <div class="drag-handle">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4 8h16M4 16h16" />
                            </svg>
                        </div>

                        <!-- Ordre -->
                        <div class="page-order">{{ page.ordre_menu ?? '—' }}</div>

                        <!-- Icône type -->
                        <div class="page-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="1.75">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>

                        <!-- Info -->
                        <div class="page-info">
                            <div class="page-title">{{ page.titre }}</div>
                            <div class="page-meta">
                                <span class="page-slug">/{{ page.slug }}</span>
                                <span class="page-date">{{ formatDate(page.updated_at) }}</span>
                            </div>
                        </div>

                        <!-- Badges -->
                        <div class="page-badges">
                            <span class="badge badge-blue">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="3">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                Menu
                            </span>
                            <span class="badge" :class="page.statut === 'publie' ? 'badge-success' : 'badge-neutral'">
                                {{ page.statut === 'publie' ? 'Publiée' : 'Brouillon' }}
                            </span>
                        </div>

                        <!-- Actions -->
                        <div class="page-actions" @click.stop>
                            <a v-if="page.statut === 'publie'"
                                :href="`http://localhost:5174/?subdomain=crc&page=${page.slug}`" target="_blank"
                                class="action-btn view" title="Voir la page">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </a>

                            <button class="action-btn edit" @click="router.push(`/pages/${page.id}`)" title="Modifier">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>

                            <button class="action-btn" :class="page.statut === 'publie' ? 'unpublish' : 'publish'"
                                @click="togglePublish(page)"
                                :title="page.statut === 'publie' ? 'Dépublier' : 'Publier'">
                                <svg v-if="page.statut !== 'publie'" width="13" height="13" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            </button>

                            <button class="action-btn delete" @click="confirmDelete(page)" title="Supprimer">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Bouton enregistrer l'ordre -->
                    <div v-if="orderChanged" class="order-save-bar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Ordre modifié</span>
                        <button class="btn-save-order" @click="saveOrder" :disabled="savingOrder">
                            <span v-if="savingOrder" class="spinner-sm"></span>
                            <span v-else>Enregistrer l'ordre</span>
                        </button>
                        <button class="btn-cancel-order" @click="cancelOrder">Annuler</button>
                    </div>
                </div>

                <!-- Section hors menu -->
                <div v-if="noMenuPages.length > 0">
                    <div class="section-header mt-16">
                        <div class="section-header-left">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                            </svg>
                            <span class="section-title">Pages hors menu</span>
                        </div>
                        <span class="section-sub">{{ noMenuPages.length }} page(s)</span>
                    </div>

                    <div class="pages-list">
                        <div v-for="page in noMenuPages" :key="page.id" class="page-item">
                            <div class="drag-handle" style="opacity:.2; cursor:default">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 8h16M4 16h16" />
                                </svg>
                            </div>

                            <div class="page-order">—</div>

                            <div class="page-icon" style="background:#F1F5F9; color:#94A3B8">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="1.75">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>

                            <div class="page-info">
                                <div class="page-title">{{ page.titre }}</div>
                                <div class="page-meta">
                                    <span class="page-slug">/{{ page.slug }}</span>
                                    <span class="page-date">{{ formatDate(page.updated_at) }}</span>
                                </div>
                            </div>

                            <div class="page-badges">
                                <span class="badge badge-neutral">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="3">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Hors menu
                                </span>
                                <span class="badge"
                                    :class="page.statut === 'publie' ? 'badge-success' : 'badge-neutral'">
                                    {{ page.statut === 'publie' ? 'Publiée' : 'Brouillon' }}
                                </span>
                            </div>

                            <div class="page-actions" @click.stop>
                                <button class="action-btn edit" @click="router.push(`/pages/${page.id}`)"
                                    title="Modifier">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>

                                <button class="action-btn" :class="page.statut === 'publie' ? 'unpublish' : 'publish'"
                                    @click="togglePublish(page)"
                                    :title="page.statut === 'publie' ? 'Dépublier' : 'Publier'">
                                    <svg v-if="page.statut !== 'publie'" width="13" height="13" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                </button>

                                <button class="action-btn delete" @click="confirmDelete(page)" title="Supprimer">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal suppression -->
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
                    <h3 class="modal-title">Supprimer cette page ?</h3>
                    <p class="modal-sub">« {{ deleteModal.page?.titre }} »</p>
                    <p class="modal-sub">Cette action est irréversible.</p>
                    <div class="modal-actions">
                        <button class="btn-secondary" @click="deleteModal.show = false">Annuler</button>
                        <button class="btn-danger" :disabled="deleteModal.loading" @click="deletePage">
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

const router = useRouter()
const auth = useAuthStore()

const pages = ref([])
const loading = ref(true)
const search = ref('')
const activeTab = ref('')
const counts = ref({ all: 0, publie: 0, brouillon: 0 })
const orderChanged = ref(false)
const savingOrder = ref(false)
const originalOrder = ref([])
const dragItem = ref(null)
const dragOver = ref(null)
const deleteModal = ref({ show: false, page: null, loading: false })
const toast = ref({ show: false, type: 'success', message: '' })

const tabs = computed(() => [
    { key: '', label: 'Toutes', count: counts.value.all },
    { key: 'publie', label: 'Publiées', count: counts.value.publie },
    { key: 'brouillon', label: 'Brouillons', count: counts.value.brouillon },
])

const menuPages = computed(() => pages.value.filter(p => p.dans_menu).sort((a, b) => (a.ordre_menu ?? 99) - (b.ordre_menu ?? 99)))
const noMenuPages = computed(() => pages.value.filter(p => !p.dans_menu))

function formatDate(date) {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}

let searchTimer = null
function debouncedSearch() {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => loadPages(), 400)
}

async function loadPages() {
    loading.value = true
    try {
        const params = { per_page: 100 }
        if (auth.user?.ministere_id) params.ministere_id = auth.user.ministere_id
        if (activeTab.value) params.statut = activeTab.value
        if (search.value) params.search = search.value

        const { data } = await api.get('/ministry/pages', { params })
        pages.value = data.data?.data || data.data || []

        // Sauvegarder l'ordre original
        originalOrder.value = menuPages.value.map(p => p.id)
        orderChanged.value = false

        await loadCounts()
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

async function loadCounts() {
    try {
        const base = auth.user?.ministere_id ? { ministere_id: auth.user.ministere_id, per_page: 1 } : { per_page: 1 }
        const [all, pub, draft] = await Promise.all([
            api.get('/ministry/pages', { params: base }),
            api.get('/ministry/pages', { params: { ...base, statut: 'publie' } }),
            api.get('/ministry/pages', { params: { ...base, statut: 'brouillon' } }),
        ])
        counts.value = {
            all: all.data.data?.length || 0,
            publie: pub.data.data?.length || 0,
            brouillon: draft.data.data?.length || 0,
        }
    } catch { }
}

// Drag & Drop
function onDragStart(e, page) {
    dragItem.value = page
    e.dataTransfer.effectAllowed = 'move'
}

function onDragEnd() {
    dragItem.value = null
    dragOver.value = null
}

function onDrop(e, zone) {
    if (!dragItem.value) return

    const overPage = pages.value.find(p => p.id === dragOver.value)
    if (!overPage || overPage.id === dragItem.value.id) {
        dragOver.value = null
        return
    }

    // Réordonner
    const menuList = [...menuPages.value]
    const fromIdx = menuList.findIndex(p => p.id === dragItem.value.id)
    const toIdx = menuList.findIndex(p => p.id === overPage.id)

    menuList.splice(fromIdx, 1)
    menuList.splice(toIdx, 0, dragItem.value)

    // Mettre à jour les ordres
    menuList.forEach((p, idx) => { p.ordre_menu = idx })

    // Vérifier si l'ordre a changé
    const newOrder = menuList.map(p => p.id)
    orderChanged.value = JSON.stringify(newOrder) !== JSON.stringify(originalOrder.value)

    dragOver.value = null
}

async function saveOrder() {
    savingOrder.value = true
    try {
        const items = menuPages.value.map(p => ({ id: p.id, ordre: p.ordre_menu }))
        await api.post('/ministry/pages/reorder', { pages: items })
        originalOrder.value = menuPages.value.map(p => p.id)
        orderChanged.value = false
        showToast('Ordre enregistré !', 'success')
    } catch (e) {
        showToast('Erreur lors de l\'enregistrement.', 'error')
    } finally {
        savingOrder.value = false
    }
}

function cancelOrder() {
    loadPages()
}

async function togglePublish(page) {
    try {
        let response;

        if (page.statut === 'publie') {
            // API pour dépublier
            response = await api.patch(`/ministry/pages/${page.id}/unpublish`);
        } else {
            // API pour publier
            response = await api.patch(`/ministry/pages/${page.id}/publish`);
        }

        // Mettre à jour le statut local
        page.statut = page.statut === 'publie' ? 'brouillon' : 'publie';

        // Afficher le message approprié
        showToast(
            page.statut === 'publie' ? 'Page publiée avec succès.' : 'Page dépubliée avec succès.',
            'success'
        );

    } catch (e) {
        console.error('Erreur lors du changement de statut:', e);
        showToast('Erreur lors du changement de statut.', 'error');
    }
}

function confirmDelete(page) {
    deleteModal.value = { show: true, page, loading: false }
}

async function deletePage() {
    deleteModal.value.loading = true
    try {
        await api.delete(`/ministry/pages/${deleteModal.value.page.id}`)
        pages.value = pages.value.filter(p => p.id !== deleteModal.value.page.id)
        deleteModal.value.show = false
        showToast('Page supprimée.', 'success')
    } catch (e) {
        showToast('Erreur.', 'error')
    } finally {
        deleteModal.value.loading = false
    }
}

function showToast(message, type = 'success') {
    toast.value = { show: true, type, message }
    setTimeout(() => { toast.value.show = false }, 2500)
}

onMounted(() => loadPages())
</script>

<style scoped>
.fade-in {
    width: 100%;
}

/* Info banner */
.info-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #EFF6FF;
    border: 1px solid #BFDBFE;
    border-radius: 12px;
    padding: 12px 18px;
    font-size: 13px;
    color: #1E3A8A;
    margin-bottom: 20px;
}

.info-banner svg {
    flex-shrink: 0;
    color: #3B82F6;
}

/* Toolbar */
.toolbar {
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
}

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

.toolbar-right {
    display: flex;
    gap: 12px;
    align-items: center;
}

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

/* Section headers */
.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    padding: 0 4px;
}

.section-header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #64748B;
}

.section-title {
    font-size: 14px;
    font-weight: 600;
    color: #0F172A;
}

.section-sub {
    font-size: 12px;
    color: #94A3B8;
}

.mt-16 {
    margin-top: 24px;
}

/* Pages list */
.pages-list {
    display: flex;
    flex-direction: column;
    background: white;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    overflow: hidden;
}

/* Page item */
.page-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 18px;
    border-bottom: 1px solid #F1F5F9;
    transition: all 0.2s;
    position: relative;
}

.page-item:last-child {
    border-bottom: none;
}

.page-item:hover {
    background: #F8FAFC;
}

.page-item.dragging {
    opacity: 0.5;
    background: #EFF6FF;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.page-item.drag-over {
    border-top: 2px solid #3B82F6;
    background: #EFF6FF;
}

/* Drag handle */
.drag-handle {
    color: #CBD5E1;
    cursor: grab;
    display: flex;
    align-items: center;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s;
    flex-shrink: 0;
}

.drag-handle:hover {
    color: #64748B;
    background: #E2E8F0;
}

.drag-handle:active {
    cursor: grabbing;
}

/* Page order */
.page-order {
    width: 28px;
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    color: #94A3B8;
    flex-shrink: 0;
}

/* Page icon */
.page-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #EEF2FF;
    color: #4338CA;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

/* Page info */
.page-info {
    flex: 1;
    min-width: 0;
}

.page-title {
    font-size: 14px;
    font-weight: 600;
    color: #0F172A;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 4px;
}

.page-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.page-slug {
    font-size: 11px;
    font-family: 'SF Mono', 'Fira Code', monospace;
    color: #3B82F6;
    background: #EFF6FF;
    padding: 2px 8px;
    border-radius: 12px;
}

.page-date {
    font-size: 11px;
    color: #94A3B8;
    display: flex;
    align-items: center;
    gap: 4px;
}

/* Badges */
.page-badges {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 30px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
}

.badge-success {
    background: #DCFCE7;
    color: #166534;
}

.badge-blue {
    background: #DBEAFE;
    color: #1E40AF;
}

.badge-neutral {
    background: #F1F5F9;
    color: #475569;
}

/* Actions */
.page-actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
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
    text-decoration: none;
    transition: all 0.2s;
}

.action-btn.view {
    background: #F1F5F9;
    color: #64748B;
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

.action-btn:hover {
    filter: brightness(0.95);
    transform: scale(1.05);
}

.action-btn:active {
    transform: scale(0.95);
}

/* Order save bar */
.order-save-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    background: #EFF6FF;
    border-top: 1px solid #BFDBFE;
    font-size: 13px;
    color: #1E3A8A;
}

.btn-save-order {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    background: #1E3A8A;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 150px;
    justify-content: center;
}

.btn-save-order:hover:not(:disabled) {
    background: #1e40af;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2);
}

.btn-save-order:disabled {
    opacity: 0.6;
    cursor: wait;
}

.btn-cancel-order {
    padding: 8px 16px;
    background: white;
    border: 1px solid #BFDBFE;
    border-radius: 8px;
    font-size: 12px;
    color: #1E3A8A;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-cancel-order:hover {
    background: #F8FAFC;
    border-color: #3B82F6;
}

/* Skeleton */
.page-skeleton {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #F1F5F9;
}

.sk-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #F1F5F9;
    flex-shrink: 0;
    animation: shimmer 1.5s infinite;
}

.sk-lines {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.sk-line {
    height: 12px;
    border-radius: 6px;
    background: #F1F5F9;
    animation: shimmer 1.5s infinite;
}

.w50 {
    width: 50%;
}

.w30 {
    width: 30%;
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
    border-top-color: white;
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
    .page-item {
        flex-wrap: wrap;
    }

    .page-actions {
        margin-left: auto;
    }
}

@media (max-width: 768px) {
    .toolbar {
        flex-direction: column;
        align-items: stretch;
    }

    .toolbar-right {
        flex-direction: column;
    }

    .search-input {
        width: 100%;
    }

    .page-badges {
        order: -1;
        width: 100%;
        margin-bottom: 8px;
    }

    .page-item {
        flex-wrap: wrap;
    }

    .page-actions {
        width: 100%;
        justify-content: flex-end;
    }
}
</style>