<template>
  <div class="fade-in">

    <!-- Tabs navigation -->
    <div class="settings-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="settings-tab"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <span v-html="tab.icon"></span>
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab: Général -->
    <div v-if="activeTab === 'general'" class="tab-content fade-in">
      <div class="form-layout">
        <div class="form-main">
          <div class="card">
            <div class="card-title">Informations générales</div>
            <div class="form-grid">
              <div class="form-group span-2">
                <label class="form-label">Nom du ministère</label>
                <input v-model="general.nom" class="form-input" placeholder="Centre Révélation du Christ"/>
              </div>
              <div class="form-group">
                <label class="form-label">Type</label>
                <select v-model="general.type" class="form-input">
                  <option value="eglise">Église</option>
                  <option value="ministere">Ministère</option>
                  <option value="organisation">Organisation</option>
                  <option value="para_ecclesial">Para-ecclésial</option>
                  <option value="mission">Mission</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Email de contact</label>
                <input v-model="general.email_contact" class="form-input" type="email" placeholder="contact@crc.org"/>
              </div>
              <div class="form-group">
                <label class="form-label">Téléphone</label>
                <input v-model="general.telephone" class="form-input" placeholder="+236 74 02 67 55"/>
              </div>
              <div class="form-group">
                <label class="form-label">Ville</label>
                <input v-model="general.ville" class="form-input" placeholder="Bangui"/>
              </div>
              <div class="form-group span-2">
                <label class="form-label">Adresse</label>
                <input v-model="general.adresse" class="form-input" placeholder="Fatima Sandoumbé, rue deux jumeaux Bamboula"/>
              </div>
              <div class="form-group">
                <label class="form-label">Pays</label>
                <input v-model="general.pays" class="form-input" placeholder="République centrafricaine"/>
              </div>
              <div class="form-group span-2">
                <label class="form-label">Description</label>
                <textarea v-model="general.description" class="form-input" rows="3"
                  placeholder="Description du ministère..."></textarea>
              </div>
            </div>
            <div class="card-footer">
              <button class="btn-primary" @click="saveGeneral" :disabled="saving">
                <span v-if="saving === 'general'" class="spinner-sm"></span>
                <span v-else>Enregistrer</span>
              </button>
            </div>
          </div>
        </div>
        <div class="form-sidebar">
          <div class="card">
            <div class="card-title">Sous-domaine</div>
            <div class="subdomain-display">
              <div class="subdomain-value">{{ ministere?.sous_domaine }}.eglisehub.org</div>
              <div class="subdomain-hint">Le sous-domaine ne peut être modifié que par le Super Admin.</div>
            </div>
          </div>
          <div class="card">
            <div class="card-title">Statut</div>
            <div class="status-info">
              <span class="badge" :class="ministere?.statut === 'actif' ? 'badge-green' : 'badge-gray'">
                {{ ministere?.statut === 'actif' ? 'Actif' : 'Inactif' }}
              </span>
              <div class="status-date">Créé le {{ formatDate(ministere?.created_at) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Thème -->
    <div v-if="activeTab === 'theme'" class="tab-content fade-in">
      <div class="form-layout">
        <div class="form-main">

          <!-- Couleurs -->
          <div class="card">
            <div class="card-title">Couleurs</div>
            <div class="colors-grid">
              <div class="color-item" v-for="color in colorFields" :key="color.key">
                <label class="form-label">{{ color.label }}</label>
                <div class="color-input-wrap">
                  <input
                    type="color"
                    v-model="theme[color.key]"
                    class="color-picker"
                  />
                  <input
                    v-model="theme[color.key]"
                    class="form-input color-hex"
                    placeholder="#1E3A8A"
                    maxlength="7"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Typographie -->
          <div class="card">
            <div class="card-title">Typographie</div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Police des titres</label>
                <select v-model="theme.police_titre" class="form-input">
                  <option v-for="font in fonts" :key="font" :value="font">{{ font }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Police du corps</label>
                <select v-model="theme.police_corps" class="form-input">
                  <option v-for="font in fonts" :key="font" :value="font">{{ font }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Style -->
          <div class="card">
            <div class="card-title">Style des boutons</div>
            <div class="btn-styles">
              <button
                v-for="style in btnStyles"
                :key="style.key"
                class="btn-style-preview"
                :class="{ active: theme.style_boutons === style.key }"
                :style="{ borderRadius: style.radius }"
                @click="theme.style_boutons = style.key"
              >
                {{ style.label }}
              </button>
            </div>
          </div>

          <div class="card">
            <div class="card-footer" style="padding:0">
              <button class="btn-primary" @click="saveTheme" :disabled="saving">
                <span v-if="saving === 'theme'" class="spinner-sm"></span>
                <span v-else>Enregistrer le thème</span>
              </button>
            </div>
          </div>
        </div>

        <div class="form-sidebar">
          <!-- Logo -->
          <div class="card">
            <div class="card-title">Logo</div>
            <div
              class="logo-drop"
              :class="{ 'has-logo': theme.logo_preview }"
              @click="$refs.logoInput.click()"
            >
              <img v-if="theme.logo_preview" :src="theme.logo_preview" class="logo-preview"/>
              <div v-else class="logo-placeholder">
                <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span>Cliquer pour choisir</span>
              </div>
            </div>
            <input ref="logoInput" type="file" accept="image/*" style="display:none" @change="handleLogo"/>
            <button v-if="theme.logo_preview" class="remove-btn" @click="theme.logo_preview = null; theme.logo_file = null">
              Supprimer
            </button>
          </div>

          <!-- Aperçu -->
          <div class="card">
            <div class="card-title">Aperçu</div>
            <div class="theme-preview" :style="{ '--primary': theme.couleur_primaire }">
              <div class="preview-header" :style="{ background: theme.couleur_menu || theme.couleur_primaire }">
                <div class="preview-logo">
                  <img v-if="theme.logo_preview" :src="theme.logo_preview" style="height:20px"/>
                  <span v-else style="color:#fff;font-size:12px;font-weight:700">LOGO</span>
                </div>
                <div class="preview-nav">
                  <span>Accueil</span>
                  <span>À propos</span>
                  <span>Contact</span>
                </div>
              </div>
              <div class="preview-body">
                <div class="preview-hero" :style="{ background: theme.couleur_primaire + '20' }">
                  <div class="preview-title" :style="{ fontFamily: theme.police_titre, color: theme.couleur_primaire }">
                    Titre principal
                  </div>
                  <button class="preview-btn"
                    :style="{
                      background: theme.couleur_primaire,
                      borderRadius: theme.style_boutons === 'rounded' ? '8px' : theme.style_boutons === 'pill' ? '999px' : '2px'
                    }"
                  >
                    Rejoindre
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: SEO -->
    <div v-if="activeTab === 'seo'" class="tab-content fade-in">
      <div class="form-layout">
        <div class="form-main">
          <div class="card">
            <div class="card-title">Référencement (SEO)</div>
            <div class="form-group">
              <label class="form-label">Titre SEO</label>
              <input v-model="seo.meta_titre" class="form-input" placeholder="Centre Révélation du Christ - Bangui"/>
              <div class="char-count" :class="{ warn: seo.meta_titre?.length > 60 }">
                {{ seo.meta_titre?.length || 0 }}/60
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Description SEO</label>
              <textarea v-model="seo.meta_description" class="form-input" rows="3"
                placeholder="Ministère chrétien basé à Bangui..."></textarea>
              <div class="char-count" :class="{ warn: seo.meta_description?.length > 160 }">
                {{ seo.meta_description?.length || 0 }}/160
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Mots-clés</label>
              <div class="tags-wrap">
                <div v-for="kw in seo.meta_keywords" :key="kw" class="tag-item">
                  {{ kw }}
                  <button class="tag-remove" @click="removeKeyword(kw)">×</button>
                </div>
              </div>
              <input
                v-model="keywordInput"
                class="form-input"
                placeholder="Ajouter un mot-clé (Entrée)"
                @keydown.enter.prevent="addKeyword"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Google Analytics ID <span class="optional">(optionnel)</span></label>
              <input v-model="seo.google_analytics" class="form-input" placeholder="G-XXXXXXXXXX"/>
            </div>
            <div class="toggle-row">
              <span class="toggle-label">Indexable par Google</span>
              <label class="toggle">
                <input type="checkbox" v-model="seo.indexable"/>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="card-footer">
              <button class="btn-primary" @click="saveSeo" :disabled="saving">
                <span v-if="saving === 'seo'" class="spinner-sm"></span>
                <span v-else>Enregistrer SEO</span>
              </button>
            </div>
          </div>

          <!-- Aperçu Google -->
          <div class="card">
            <div class="card-title">Aperçu dans Google</div>
            <div class="google-preview">
              <div class="google-url">crc.eglisehub.org</div>
              <div class="google-title">{{ seo.meta_titre || general.nom || 'Titre du site' }}</div>
              <div class="google-desc">{{ seo.meta_description || 'Description du site...' }}</div>
            </div>
          </div>
        </div>

        <div class="form-sidebar">
          <div class="card">
            <div class="card-title">Conseils SEO</div>
            <div class="seo-tips">
              <div class="seo-tip" :class="seo.meta_titre?.length > 0 ? 'ok' : 'warn'">
                <span class="tip-dot"></span>
                Titre SEO renseigné
              </div>
              <div class="seo-tip" :class="seo.meta_titre?.length <= 60 ? 'ok' : 'error'">
                <span class="tip-dot"></span>
                Titre ≤ 60 caractères
              </div>
              <div class="seo-tip" :class="seo.meta_description?.length > 0 ? 'ok' : 'warn'">
                <span class="tip-dot"></span>
                Description renseignée
              </div>
              <div class="seo-tip" :class="seo.meta_description?.length <= 160 ? 'ok' : 'error'">
                <span class="tip-dot"></span>
                Description ≤ 160 caractères
              </div>
              <div class="seo-tip" :class="seo.meta_keywords?.length > 0 ? 'ok' : 'warn'">
                <span class="tip-dot"></span>
                Mots-clés définis
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Réseaux sociaux -->
    <div v-if="activeTab === 'social'" class="tab-content fade-in">
      <div class="card" style="max-width:600px">
        <div class="card-title">Réseaux sociaux</div>
        <div class="social-list">
          <div class="social-item" v-for="s in socialFields" :key="s.key">
            <div class="social-icon" :style="{ background: s.bg, color: s.color }">
              <span v-html="s.icon"></span>
            </div>
            <div class="social-field">
              <label class="form-label">{{ s.label }}</label>
              <input
                v-model="social[s.key]"
                class="form-input"
                :placeholder="s.placeholder"
                :type="s.key === 'whatsapp' ? 'tel' : 'url'"
              />
            </div>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn-primary" @click="saveSocial" :disabled="saving">
            <span v-if="saving === 'social'" class="spinner-sm"></span>
            <span v-else>Enregistrer les réseaux</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.message }}</div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const auth = useAuthStore()

const activeTab   = ref('general')
const saving      = ref(null)
const ministere   = ref(null)
const keywordInput = ref('')
const toast       = ref({ show: false, type: 'success', message: '' })

const general = ref({
  nom: '', type: 'eglise', email_contact: '',
  telephone: '', adresse: '', ville: '', pays: '', description: '',
})

const theme = ref({
  couleur_primaire:   '#1E3A8A',
  couleur_secondaire: '#FFFFFF',
  couleur_menu:       '#1E3A8A',
  couleur_pied:       '#111827',
  police_titre:       'Sora',
  police_corps:       'DM Sans',
  style_boutons:      'rounded',
  logo_preview:       null,
  logo_file:          null,
})

const seo = ref({
  meta_titre: '', meta_description: '',
  meta_keywords: [], google_analytics: '', indexable: true,
})

const social = ref({
  facebook: '', youtube: '', whatsapp: '',
  instagram: '', twitter: '', tiktok: '', telegram: '',
})

const tabs = [
  {
    key: 'general', label: 'Général',
    icon: `<svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
    </svg>`,
  },
  {
    key: 'theme', label: 'Thème',
    icon: `<svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
    </svg>`,
  },
  {
    key: 'seo', label: 'SEO',
    icon: `<svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
    </svg>`,
  },
  {
    key: 'social', label: 'Réseaux sociaux',
    icon: `<svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
    </svg>`,
  },
]

const colorFields = [
  { key: 'couleur_primaire',   label: 'Couleur principale' },
  { key: 'couleur_secondaire', label: 'Couleur secondaire' },
  { key: 'couleur_menu',       label: 'Couleur du menu' },
  { key: 'couleur_pied',       label: 'Couleur du pied de page' },
]

const fonts = ['Sora', 'DM Sans', 'Poppins', 'Inter', 'Nunito', 'Raleway', 'Montserrat', 'Lato']

const btnStyles = [
  { key: 'rounded', label: 'Arrondi',    radius: '8px' },
  { key: 'pill',    label: 'Pilule',     radius: '999px' },
  { key: 'square',  label: 'Carré',      radius: '2px' },
]

const socialFields = [
  {
    key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...',
    bg: '#EBF5FF', color: '#1877F2',
    icon: `<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>`,
  },
  {
    key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@...',
    bg: '#FEF2F2', color: '#FF0000',
    icon: `<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>`,
  },
  {
    key: 'whatsapp', label: 'WhatsApp', placeholder: '+236 74 02 67 55',
    bg: '#F0FDF4', color: '#25D366',
    icon: `<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>`,
  },
  {
    key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...',
    bg: '#FDF2F8', color: '#E1306C',
    icon: `<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>`,
  },
]

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function handleLogo(e) {
  const file = e.target.files[0]
  if (!file) return
  theme.value.logo_file = file
  const reader = new FileReader()
  reader.onload = ev => { theme.value.logo_preview = ev.target.result }
  reader.readAsDataURL(file)
}

function addKeyword() {
  const kw = keywordInput.value.trim()
  if (kw && !seo.value.meta_keywords.includes(kw)) {
    seo.value.meta_keywords.push(kw)
  }
  keywordInput.value = ''
}
function removeKeyword(kw) {
  seo.value.meta_keywords = seo.value.meta_keywords.filter(k => k !== kw)
}

async function loadSettings() {
  try {
    const params = {}
    if (auth.user?.ministere_id) params.ministere_id = auth.user.ministere_id

    const { data } = await api.get('/ministry/settings', { params })
    const d = data.data

    ministere.value = d.general

    Object.assign(general.value, {
      nom:           d.general?.nom || '',
      type:          d.general?.type || 'eglise',
      email_contact: d.general?.email_contact || '',
      telephone:     d.general?.telephone || '',
      adresse:       d.general?.adresse || '',
      ville:         d.general?.ville || '',
      pays:          d.general?.pays || '',
      description:   d.general?.description || '',
    })

    if (d.theme) {
      Object.assign(theme.value, {
        couleur_primaire:   d.theme.couleur_primaire   || '#1E3A8A',
        couleur_secondaire: d.theme.couleur_secondaire || '#FFFFFF',
        couleur_menu:       d.theme.couleur_menu       || '#1E3A8A',
        couleur_pied:       d.theme.couleur_pied       || '#111827',
        police_titre:       d.theme.police_titre       || 'Sora',
        police_corps:       d.theme.police_corps       || 'DM Sans',
        style_boutons:      d.theme.style_boutons      || 'rounded',
        logo_preview:       d.theme.logo_url           || null,
      })
    }

    if (d.seo) {
      Object.assign(seo.value, {
        meta_titre:       d.seo.meta_titre       || '',
        meta_description: d.seo.meta_description || '',
        meta_keywords:    d.seo.meta_keywords    || [],
        google_analytics: d.seo.google_analytics || '',
        indexable:        d.seo.indexable ?? true,
      })
    }

    if (d.social) {
      Object.assign(social.value, {
        facebook:  d.social.facebook  || '',
        youtube:   d.social.youtube   || '',
        whatsapp:  d.social.whatsapp  || '',
        instagram: d.social.instagram || '',
        twitter:   d.social.twitter   || '',
        tiktok:    d.social.tiktok    || '',
        telegram:  d.social.telegram  || '',
      })
    }
  } catch (e) {
    console.error(e)
  }
}

async function saveGeneral() {
  saving.value = 'general'
  try {
    const params = auth.user?.ministere_id ? { ministere_id: auth.user.ministere_id } : {}
    await api.put('/ministry/settings', { ...general.value, ...params })
    showToast('Paramètres généraux enregistrés !', 'success')
  } catch (e) {
    showToast('Erreur lors de l\'enregistrement.', 'error')
  } finally {
    saving.value = null
  }
}

async function saveTheme() {
  saving.value = 'theme'
  try {
    const formData = new FormData()
    const params = auth.user?.ministere_id ? auth.user.ministere_id : 1

    formData.append('ministere_id', params)
    formData.append('couleur_primaire',   theme.value.couleur_primaire)
    formData.append('couleur_secondaire', theme.value.couleur_secondaire)
    formData.append('couleur_menu',       theme.value.couleur_menu)
    formData.append('couleur_pied',       theme.value.couleur_pied)
    formData.append('police_titre',       theme.value.police_titre)
    formData.append('police_corps',       theme.value.police_corps)
    formData.append('style_boutons',      theme.value.style_boutons)

    if (theme.value.logo_file) {
      formData.append('logo', theme.value.logo_file)
    }

    await api.put('/ministry/settings/theme', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    showToast('Thème enregistré !', 'success')
  } catch (e) {
    showToast('Erreur.', 'error')
  } finally {
    saving.value = null
  }
}

async function saveSeo() {
  saving.value = 'seo'
  try {
    const params = auth.user?.ministere_id ? { ministere_id: auth.user.ministere_id } : {}
    await api.put('/ministry/settings/seo', { ...seo.value, ...params })
    showToast('SEO enregistré !', 'success')
  } catch (e) {
    showToast('Erreur.', 'error')
  } finally {
    saving.value = null
  }
}

async function saveSocial() {
  saving.value = 'social'
  try {
    const params = auth.user?.ministere_id ? { ministere_id: auth.user.ministere_id } : {}
    await api.put('/ministry/settings/social', { ...social.value, ...params })
    showToast('Réseaux sociaux enregistrés !', 'success')
  } catch (e) {
    showToast('Erreur.', 'error')
  } finally {
    saving.value = null
  }
}

function showToast(message, type = 'success') {
  toast.value = { show: true, type, message }
  setTimeout(() => { toast.value.show = false }, 3000)
}

onMounted(() => loadSettings())
</script>

<style scoped>
.settings-tabs {
  display: flex; gap: 4px; margin-bottom: 20px;
  background: #fff; border: 1px solid #E2E8F0;
  border-radius: 10px; padding: 4px;
  width: fit-content;
}
.settings-tab {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 16px; border-radius: 7px; border: none;
  background: transparent; font-size: 13px;
  color: #64748B; cursor: pointer; transition: all .12s;
}
.settings-tab:hover { background: #F8FAFC; color: #374151; }
.settings-tab.active {
  background: #1E3A8A; color: #fff; font-weight: 500;
}

.tab-content { animation: fadeIn .2s ease-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.form-layout {
  display: grid; grid-template-columns: 1fr 300px;
  gap: 16px; align-items: flex-start;
}
.form-main    { display: flex; flex-direction: column; gap: 16px; }
.form-sidebar { display: flex; flex-direction: column; gap: 16px; }

.card {
  background: #fff; border: 1px solid #E2E8F0;
  border-radius: 12px; padding: 20px;
}
.card-title {
  font-size: 14px; font-weight: 600; color: #0F172A;
  margin-bottom: 16px;
}
.card-footer {
  padding-top: 16px; margin-top: 16px;
  border-top: 1px solid #F1F5F9;
  display: flex; justify-content: flex-end;
}

.form-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
}
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.span-2 { grid-column: span 2; }
.form-label { font-size: 12px; font-weight: 500; color: #374151; }
.optional   { color: #94A3B8; font-weight: 400; }
.form-input {
  width: 100%; padding: 9px 12px;
  border: 1px solid #E2E8F0; border-radius: 8px;
  font-size: 13px; color: #0F172A; background: #fff;
  outline: none; transition: border-color .15s; font-family: inherit;
}
.form-input:focus { border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,.08); }
.form-input::placeholder { color: #CBD5E1; }
.char-count { font-size: 11px; color: #94A3B8; text-align: right; }
.char-count.warn { color: #DC2626; }

.subdomain-display { padding: 10px 14px; background: #F8FAFC; border-radius: 8px; }
.subdomain-value { font-size: 14px; font-weight: 600; color: #1E3A8A; font-family: monospace; }
.subdomain-hint  { font-size: 11px; color: #94A3B8; margin-top: 4px; }
.status-info { display: flex; flex-direction: column; gap: 8px; }
.badge { display: inline-flex; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; width: fit-content; }
.badge-green { background: #DCFCE7; color: #166534; }
.badge-gray  { background: #F1F5F9; color: #475569; }
.status-date { font-size: 12px; color: #94A3B8; }

/* Couleurs */
.colors-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.color-item  { display: flex; flex-direction: column; gap: 6px; }
.color-input-wrap { display: flex; align-items: center; gap: 8px; }
.color-picker {
  width: 36px; height: 36px; border: 1px solid #E2E8F0;
  border-radius: 8px; cursor: pointer; padding: 2px;
  background: #fff;
}
.color-hex { flex: 1; font-family: monospace; }

/* Typographie */
.btn-styles { display: flex; gap: 10px; flex-wrap: wrap; }
.btn-style-preview {
  padding: 8px 20px; border: 2px solid #E2E8F0;
  background: #1E3A8A; color: #fff;
  font-size: 13px; cursor: pointer; transition: all .12s;
}
.btn-style-preview.active { border-color: #1E3A8A; box-shadow: 0 0 0 3px rgba(30,58,138,.2); }

/* Logo */
.logo-drop {
  border: 2px dashed #E2E8F0; border-radius: 10px;
  min-height: 80px; display: flex;
  align-items: center; justify-content: center;
  cursor: pointer; transition: all .15s; overflow: hidden;
}
.logo-drop:hover { border-color: #3B82F6; background: #EFF6FF; }
.logo-drop.has-logo { border-style: solid; }
.logo-preview { max-height: 80px; object-fit: contain; padding: 8px; }
.logo-placeholder {
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

/* Aperçu thème */
.theme-preview { border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; }
.preview-header {
  padding: 8px 12px; display: flex;
  align-items: center; justify-content: space-between;
}
.preview-nav { display: flex; gap: 10px; }
.preview-nav span { color: rgba(255,255,255,.7); font-size: 9px; }
.preview-body { padding: 12px; background: #F8FAFC; }
.preview-hero {
  padding: 16px; border-radius: 8px;
  display: flex; flex-direction: column;
  align-items: center; gap: 10px; text-align: center;
}
.preview-title { font-size: 14px; font-weight: 700; }
.preview-btn {
  color: #fff; border: none; padding: 6px 16px;
  font-size: 11px; cursor: pointer;
}

/* SEO */
.google-preview {
  background: #F8FAFC; border-radius: 8px;
  padding: 14px; border: 1px solid #E2E8F0;
}
.google-url   { font-size: 12px; color: #1a73e8; margin-bottom: 2px; }
.google-title { font-size: 16px; color: #1a0dab; margin-bottom: 4px; font-weight: 400; }
.google-desc  { font-size: 13px; color: #545454; line-height: 1.5; }
.seo-tips     { display: flex; flex-direction: column; gap: 8px; }
.seo-tip {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: #374151;
}
.tip-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.seo-tip.ok    .tip-dot { background: #16A34A; }
.seo-tip.warn  .tip-dot { background: #D97706; }
.seo-tip.error .tip-dot { background: #DC2626; }

/* Social */
.social-list { display: flex; flex-direction: column; gap: 14px; margin-bottom: 16px; }
.social-item { display: flex; align-items: center; gap: 12px; }
.social-icon {
  width: 38px; height: 38px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.social-field { flex: 1; display: flex; flex-direction: column; gap: 4px; }

/* Tags */
.tags-wrap { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 8px; min-height: 24px; }
.tag-item {
  display: inline-flex; align-items: center; gap: 5px;
  background: #EEF2FF; color: #4338CA;
  font-size: 12px; padding: 3px 8px 3px 10px; border-radius: 20px;
}
.tag-remove {
  background: none; border: none; color: #818CF8;
  cursor: pointer; font-size: 14px; line-height: 1; padding: 0;
}

/* Toggle */
.toggle-row {
  display: flex; align-items: center;
  justify-content: space-between; font-size: 13px; margin-top: 14px;
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

/* Buttons */
.btn-primary {
  display: flex; align-items: center; gap: 6px;
  background: #1E3A8A; color: #fff; border: none;
  padding: 9px 20px; border-radius: 8px;
  font-size: 13px; font-weight: 500; cursor: pointer;
  min-width: 140px; justify-content: center;
  transition: background .12s;
}
.btn-primary:hover:not(:disabled) { background: #1e40af; }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }

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