<template>
  <div class="fade-in">

    <!-- Header -->
    <div class="form-header">
      <div class="breadcrumb">
        <RouterLink to="/events" class="breadcrumb-link">Événements</RouterLink>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">{{ isEdit ? 'Modifier' : 'Nouvel événement' }}</span>
      </div>
      <div class="form-actions">
        <button class="btn-secondary" @click="router.push('/events')">Annuler</button>
        <button class="btn-primary" @click="save" :disabled="saving">
          <span v-if="saving" class="spinner-sm"></span>
          <span v-else>{{ isEdit ? 'Mettre à jour' : 'Créer l\'événement' }}</span>
        </button>
      </div>
    </div>

    <div class="form-layout">

      <!-- Colonne principale -->
      <div class="form-main">

        <!-- Titre & Description -->
        <div class="card">
          <input
            v-model="form.titre"
            class="title-input"
            placeholder="Titre de l'événement..."
          />
          <div class="form-group mt-12">
            <label class="form-label">Description <span class="optional">(optionnel)</span></label>
            <textarea
              v-model="form.description"
              class="form-input"
              placeholder="Décrivez l'événement..."
              rows="4"
              style="resize: vertical"
            ></textarea>
          </div>
        </div>

        <!-- Catégorie -->
        <div class="card">
          <div class="card-section-title">Catégorie d'événement</div>
          <div class="categorie-grid">
            <button
              v-for="cat in categories"
              :key="cat.key"
              class="cat-btn"
              :class="{ active: form.categorie === cat.key }"
              :style="form.categorie === cat.key ? {
                borderColor: cat.color,
                background: cat.bg,
                color: cat.text
              } : {}"
              @click="form.categorie = cat.key; onCategorieChange()"
            >
              <span v-html="cat.icon"></span>
              <span class="cat-btn-label">{{ cat.label }}</span>
              <span class="cat-btn-sub">{{ cat.sub }}</span>
            </button>
          </div>
        </div>

        <!-- Récurrence (si recurrent) -->
        <div v-if="form.categorie === 'recurrent' || form.categorie === 'permanent'" class="card">
          <div class="card-section-title">Configuration de la récurrence</div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Fréquence</label>
              <select v-model="form.frequence" class="form-input">
                <option value="quotidien">Quotidien</option>
                <option value="hebdomadaire">Hebdomadaire</option>
                <option value="bimensuel">Bimensuel (2x/semaine)</option>
                <option value="mensuel">Mensuel</option>
                <option value="annuel">Annuel</option>
              </select>
            </div>
            <div v-if="form.frequence !== 'quotidien' && form.frequence !== 'mensuel'" class="form-group">
              <label class="form-label">Jours de la semaine</label>
              <div class="jours-grid">
                <button
                  v-for="jour in jours"
                  :key="jour.key"
                  class="jour-btn"
                  :class="{ active: form.jours_semaine.includes(jour.key) }"
                  @click="toggleJour(jour.key)"
                  type="button"
                >
                  {{ jour.label }}
                </button>
              </div>
            </div>
          </div>

          <div class="form-row" v-if="form.categorie === 'recurrent'">
            <div class="form-group">
              <label class="form-label">Date de fin de récurrence <span class="optional">(optionnel)</span></label>
              <input ref="dateFinRecurrenceInput" class="form-input" type="text" placeholder="Sélectionner une date" />
            </div>
          </div>
        </div>

        <!-- Dates & Horaires -->
        <div class="card">
          <div class="card-section-title">Dates et horaires</div>
          <div class="form-row">
            <div class="form-group" v-if="form.categorie !== 'permanent' && form.categorie !== 'recurrent'">
              <label class="form-label">Date de début</label>
              <input ref="dateDebutInput" class="form-input" type="text" placeholder="Sélectionner une date" />
            </div>
            <div class="form-group" v-if="form.categorie === 'ponctuel'">
              <label class="form-label">Date de fin <span class="optional">(optionnel)</span></label>
              <input ref="dateFinInput" class="form-input" type="text" placeholder="Sélectionner une date" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Heure de début</label>
              <input ref="heureDebutInput" class="form-input" type="text" placeholder="Sélectionner une heure" />
            </div>
            <div class="form-group">
              <label class="form-label">Heure de fin</label>
              <input ref="heureFinInput" class="form-input" type="text" placeholder="Sélectionner une heure" />
            </div>
          </div>
        </div>

        <!-- Lieu & Mode -->
        <div class="card">
          <div class="card-section-title">Lieu et accès</div>
          <div class="mode-grid">
            <button
              v-for="mode in modes"
              :key="mode.key"
              class="mode-btn"
              :class="{ active: form.mode === mode.key }"
              @click="form.mode = mode.key"
            >
              <span v-html="mode.icon"></span>
              {{ mode.label }}
            </button>
          </div>
          <div class="form-row mt-12">
            <div class="form-group" v-if="form.mode !== 'en_ligne'">
              <label class="form-label">Lieu</label>
              <input
                v-model="form.lieu"
                class="form-input"
                placeholder="Temple Central CRC, Fatima..."
              />
            </div>
            <div class="form-group" v-if="form.mode !== 'presentiel'">
              <label class="form-label">Lien streaming</label>
              <input
                v-model="form.lien_streaming"
                class="form-input"
                placeholder="https://youtube.com/live/..."
              />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Adresse complète <span class="optional">(optionnel)</span></label>
            <input
              v-model="form.adresse"
              class="form-input"
              placeholder="Rue deux jumeaux Bamboula, Bangui"
            />
          </div>
        </div>

      </div>

      <!-- Colonne latérale -->
      <div class="form-sidebar">

        <!-- Statut -->
        <div class="card">
          <div class="card-section-title">Statut</div>
          <div class="form-group">
            <select v-model="form.statut" class="form-input">
              <option value="a_venir">À venir</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
              <option value="annule">Annulé</option>
            </select>
          </div>
          <div class="toggle-row">
            <span class="toggle-label">Événement gratuit</span>
            <label class="toggle">
              <input type="checkbox" v-model="form.est_gratuit" />
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div v-if="!form.est_gratuit" class="form-row mt-8">
            <div class="form-group">
              <label class="form-label">Prix</label>
              <input v-model="form.prix" class="form-input" type="number" min="0" placeholder="0" />
            </div>
            <div class="form-group">
              <label class="form-label">Devise</label>
              <select v-model="form.devise" class="form-input">
                <option value="XAF">FCFA</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          <div class="toggle-row mt-8">
            <span class="toggle-label">Inscription requise</span>
            <label class="toggle">
              <input type="checkbox" v-model="form.inscription_requise" />
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div v-if="form.inscription_requise" class="form-group mt-8">
            <label class="form-label">Capacité max <span class="optional">(optionnel)</span></label>
            <input v-model="form.capacite_max" class="form-input" type="number" min="1" placeholder="100" />
          </div>
        </div>

        <!-- Intervenants -->
        <div class="card">
          <div class="card-section-title">Intervenants</div>
          <div class="form-group">
            <label class="form-label">Pasteur / Orateur</label>
            <input
              v-model="form.intervenant"
              class="form-input"
              placeholder="Pasteur Bangaya K. Freddy"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Thème principal <span class="optional">(optionnel)</span></label>
            <input
              v-model="form.theme"
              class="form-input"
              placeholder="La foi qui déplace les montagnes"
            />
          </div>
        </div>

        <!-- Image -->
        <div class="card">
          <div class="card-section-title">Image de l'événement</div>
          <div
            class="image-drop"
            :class="{ 'has-image': form.image_preview, dragging }"
            @dragover.prevent="dragging = true"
            @dragleave="dragging = false"
            @drop.prevent="handleDrop"
            @click="$refs.imgInput.click()"
          >
            <img v-if="form.image_preview" :src="form.image_preview" class="image-preview" />
            <div v-else class="image-placeholder">
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span>Cliquer ou glisser</span>
            </div>
          </div>
          <input ref="imgInput" type="file" accept="image/*" style="display:none" @change="handleFile" />
          <button v-if="form.image_preview" class="remove-btn" @click="form.image_preview = null; form.image_file = null">
            Supprimer l'image
          </button>
        </div>

      </div>
    </div>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        <svg v-if="toast.type === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
        {{ toast.message }}
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'
import 'flatpickr/dist/l10n/fr.js'

const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()

// Références pour les inputs Flatpickr
const dateDebutInput = ref(null)
const dateFinInput = ref(null)
const heureDebutInput = ref(null)
const heureFinInput = ref(null)
const dateFinRecurrenceInput = ref(null)

// Instances Flatpickr
let dateDebutPicker = null
let dateFinPicker = null
let heureDebutPicker = null
let heureFinPicker = null
let dateFinRecurrencePicker = null

const isEdit  = computed(() => !!route.params.id)
const saving  = ref(false)
const dragging = ref(false)
const toast   = ref({ show: false, type: 'success', message: '' })

const form = ref({
  titre:              '',
  description:        '',
  categorie:          'ponctuel',
  frequence:          'hebdomadaire',
  jours_semaine:      [],
  date_debut:         '',
  date_fin:           '',
  date_fin_recurrence:'',
  heure_debut:        '',
  heure_fin:          '',
  mode:               'presentiel',
  lieu:               '',
  adresse:            '',
  lien_streaming:     '',
  statut:             'a_venir',
  est_gratuit:        true,
  prix:               0,
  devise:             'XAF',
  inscription_requise:false,
  capacite_max:       null,
  intervenant:        '',
  theme:              '',
  image_preview:      null,
  image_file:         null,
})

const categories = [
  {
    key: 'ponctuel', label: 'Ponctuel', sub: 'Une seule fois',
    color: '#D97706', bg: '#FEF3C7', text: '#92400E',
    icon: `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
    </svg>`,
  },
  {
    key: 'recurrent', label: 'Récurrent', sub: 'Se répète',
    color: '#7C3AED', bg: '#EDE9FE', text: '#6D28D9',
    icon: `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
    </svg>`,
  },
  {
    key: 'permanent', label: 'Permanent', sub: 'Toujours actif',
    color: '#16A34A', bg: '#DCFCE7', text: '#166534',
    icon: `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
    </svg>`,
  },
  {
    key: 'saison', label: 'Saison', sub: 'Période définie',
    color: '#0369A1', bg: '#E0F2FE', text: '#0369A1',
    icon: `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
    </svg>`,
  },
]

const modes = [
  {
    key: 'presentiel', label: 'Présentiel',
    icon: `<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>`,
  },
  {
    key: 'en_ligne', label: 'En ligne',
    icon: `<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
    </svg>`,
  },
  {
    key: 'hybride', label: 'Hybride',
    icon: `<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
    </svg>`,
  },
]

const jours = [
  { key: 'lundi',    label: 'Lun' },
  { key: 'mardi',    label: 'Mar' },
  { key: 'mercredi', label: 'Mer' },
  { key: 'jeudi',    label: 'Jeu' },
  { key: 'vendredi', label: 'Ven' },
  { key: 'samedi',   label: 'Sam' },
  { key: 'dimanche', label: 'Dim' },
]

// Initialisation de Flatpickr
function initDatePickers() {
  // Options communes
  const dateOptions = {
    locale: 'fr',
    dateFormat: 'Y-m-d',
    allowInput: true,
    altInput: true,
    altFormat: 'j F Y',
  }

  const datetimeOptions = {
    locale: 'fr',
    enableTime: true,
    dateFormat: 'Y-m-d H:i',
    allowInput: true,
    altInput: true,
    altFormat: 'j F Y à H:i',
  }

  const timeOptions = {
    locale: 'fr',
    enableTime: true,
    noCalendar: true,
    dateFormat: 'H:i',
    allowInput: true,
    altInput: true,
    altFormat: 'H:i',
  }

  // Date de début
  if (dateDebutInput.value) {
    dateDebutPicker = flatpickr(dateDebutInput.value, {
      ...datetimeOptions,
      onChange: (selectedDates, dateStr) => {
        form.value.date_debut = dateStr
      },
    })
  }

  // Date de fin
  if (dateFinInput.value) {
    dateFinPicker = flatpickr(dateFinInput.value, {
      ...datetimeOptions,
      onChange: (selectedDates, dateStr) => {
        form.value.date_fin = dateStr
      },
    })
  }

  // Heure de début
  if (heureDebutInput.value) {
    heureDebutPicker = flatpickr(heureDebutInput.value, {
      ...timeOptions,
      onChange: (selectedDates, dateStr) => {
        form.value.heure_debut = dateStr
      },
    })
  }

  // Heure de fin
  if (heureFinInput.value) {
    heureFinPicker = flatpickr(heureFinInput.value, {
      ...timeOptions,
      onChange: (selectedDates, dateStr) => {
        form.value.heure_fin = dateStr
      },
    })
  }

  // Date fin récurrence
  if (dateFinRecurrenceInput.value) {
    dateFinRecurrencePicker = flatpickr(dateFinRecurrenceInput.value, {
      ...dateOptions,
      onChange: (selectedDates, dateStr) => {
        form.value.date_fin_recurrence = dateStr
      },
    })
  }
}

// Mise à jour des pickers avec les valeurs du formulaire
function updatePickersFromForm() {
  if (dateDebutPicker && form.value.date_debut) {
    dateDebutPicker.setDate(form.value.date_debut)
  }
  if (dateFinPicker && form.value.date_fin) {
    dateFinPicker.setDate(form.value.date_fin)
  }
  if (heureDebutPicker && form.value.heure_debut) {
    heureDebutPicker.setDate(form.value.heure_debut)
  }
  if (heureFinPicker && form.value.heure_fin) {
    heureFinPicker.setDate(form.value.heure_fin)
  }
  if (dateFinRecurrencePicker && form.value.date_fin_recurrence) {
    dateFinRecurrencePicker.setDate(form.value.date_fin_recurrence)
  }
}

function onCategorieChange() {
  if (form.value.categorie === 'recurrent') {
    form.value.frequence = 'hebdomadaire'
  }
}

function toggleJour(jour) {
  const idx = form.value.jours_semaine.indexOf(jour)
  if (idx === -1) form.value.jours_semaine.push(jour)
  else form.value.jours_semaine.splice(idx, 1)
}

function handleDrop(e) {
  dragging.value = false
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
  // Initialiser Flatpickr après le rendu
  await nextTick()
  initDatePickers()

  if (isEdit.value) {
    try {
      const { data } = await api.get(`/ministry/events/${route.params.id}`)
      const ev = data.data
      Object.assign(form.value, {
        titre:               ev.titre,
        description:         ev.description || '',
        categorie:           ev.categorie,
        frequence:           ev.frequence || 'hebdomadaire',
        jours_semaine:       ev.jours_semaine || [],
        date_debut:          ev.date_debut || '',
        date_fin:            ev.date_fin || '',
        date_fin_recurrence: ev.date_fin_recurrence || '',
        heure_debut:         ev.heure_debut || '',
        heure_fin:           ev.heure_fin || '',
        mode:                ev.mode || 'presentiel',
        lieu:                ev.lieu || '',
        adresse:             ev.adresse || '',
        lien_streaming:      ev.lien_streaming || '',
        statut:              ev.statut,
        est_gratuit:         ev.est_gratuit,
        prix:                ev.prix || 0,
        devise:              ev.devise || 'XAF',
        inscription_requise: ev.inscription_requise,
        capacite_max:        ev.capacite_max || null,
        intervenant:         ev.intervenant || '',
        theme:               ev.theme || '',
        image_preview:       ev.image || null,
      })

      // Mettre à jour les pickers avec les valeurs chargées
      await nextTick()
      updatePickersFromForm()

    } catch (e) {
      console.error(e)
    }
  }
})

async function save() {
  if (!form.value.titre.trim()) {
    showToast('Le titre est obligatoire.', 'error')
    return
  }
  saving.value = true
  try {
    const payload = {
      titre:               form.value.titre,
      description:         form.value.description,
      categorie:           form.value.categorie,
      frequence:           form.value.frequence,
      jours_semaine:       form.value.jours_semaine,
      date_debut:          form.value.date_debut || null,
      date_fin:            form.value.date_fin || null,
      date_fin_recurrence: form.value.date_fin_recurrence || null,
      heure_debut:         form.value.heure_debut,
      heure_fin:           form.value.heure_fin,
      mode:                form.value.mode,
      lieu:                form.value.lieu,
      adresse:             form.value.adresse,
      lien_streaming:      form.value.lien_streaming,
      statut:              form.value.statut,
      est_gratuit:         form.value.est_gratuit,
      prix:                form.value.est_gratuit ? 0 : form.value.prix,
      devise:              form.value.devise,
      inscription_requise: form.value.inscription_requise,
      capacite_max:        form.value.capacite_max,
      intervenant:         form.value.intervenant,
      theme:               form.value.theme,
      ministere_id:        auth.user?.ministere_id || 1,
    }

    if (isEdit.value) {
      await api.put(`/ministry/events/${route.params.id}`, payload)
    } else {
      await api.post('/ministry/events', payload)
    }

    showToast(isEdit.value ? 'Événement mis à jour !' : 'Événement créé !', 'success')
    setTimeout(() => router.push('/events'), 1200)
  } catch (e) {
    showToast(e.response?.data?.message || 'Une erreur est survenue.', 'error')
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; }
.breadcrumb-link { color: #3B82F6; text-decoration: none; }
.breadcrumb-link:hover { color: #1D4ED8; }
.breadcrumb-sep     { color: #CBD5E1; }
.breadcrumb-current { color: #64748B; }
.form-actions { display: flex; gap: 8px; }

.btn-primary {
  display: flex; align-items: center; gap: 6px;
  background: #1E3A8A; color: #fff; border: none;
  padding: 9px 20px; border-radius: 8px;
  font-size: 13px; font-weight: 500; cursor: pointer;
  min-width: 160px; justify-content: center;
  transition: background .12s;
}
.btn-primary:hover:not(:disabled) { background: #1e40af; }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }
.btn-secondary {
  padding: 9px 16px; border: 1px solid #E2E8F0;
  border-radius: 8px; background: #fff;
  font-size: 13px; color: #374151; cursor: pointer;
}
.btn-secondary:hover { background: #F8FAFC; }

.form-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 16px;
  align-items: flex-start;
}
.form-main    { display: flex; flex-direction: column; gap: 16px; }
.form-sidebar { display: flex; flex-direction: column; gap: 16px; }

.card {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 20px;
}
.card-section-title {
  font-size: 11px; font-weight: 600;
  color: #94A3B8; text-transform: uppercase;
  letter-spacing: .06em; margin-bottom: 14px;
}
.mt-12 { margin-top: 12px; }
.mt-8  { margin-top: 8px; }

.title-input {
  width: 100%; border: none; outline: none;
  font-size: 22px; font-weight: 700; color: #0F172A;
  font-family: 'Sora', system-ui, sans-serif;
  background: transparent; padding: 0; line-height: 1.3;
}
.title-input::placeholder { color: #CBD5E1; }

/* Catégorie */
.categorie-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.cat-btn {
  display: flex; flex-direction: column;
  align-items: center; gap: 4px;
  padding: 14px 8px;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px; background: #fff;
  cursor: pointer; transition: all .12s;
  color: #64748B;
}
.cat-btn:hover { border-color: #CBD5E1; background: #F8FAFC; }
.cat-btn.active { font-weight: 500; }
.cat-btn-label { font-size: 12px; font-weight: 600; }
.cat-btn-sub   { font-size: 10px; opacity: .7; }

/* Form groups */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.form-group:last-child { margin-bottom: 0; }
.form-label { font-size: 12px; font-weight: 500; color: #374151; }
.optional   { color: #94A3B8; font-weight: 400; }
.form-input {
  width: 100%; padding: 9px 12px;
  border: 1px solid #E2E8F0; border-radius: 8px;
  font-size: 13px; color: #0F172A; background: #fff;
  outline: none; transition: border-color .15s;
  font-family: inherit;
}
.form-input:focus { border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,.08); }
.form-input::placeholder { color: #CBD5E1; }

/* Jours */
.jours-grid { display: flex; gap: 4px; flex-wrap: wrap; }
.jour-btn {
  width: 36px; height: 36px;
  border-radius: 8px; border: 1.5px solid #E2E8F0;
  background: #fff; font-size: 11px; font-weight: 500;
  color: #64748B; cursor: pointer; transition: all .12s;
}
.jour-btn.active {
  background: #1E3A8A; border-color: #1E3A8A;
  color: #fff;
}
.jour-btn:hover:not(.active) { border-color: #93C5FD; color: #1D4ED8; }

/* Mode */
.mode-grid { display: flex; gap: 8px; }
.mode-btn {
  display: flex; align-items: center; gap: 6px;
  flex: 1; justify-content: center;
  padding: 9px 12px; border: 1.5px solid #E2E8F0;
  border-radius: 8px; background: #fff;
  font-size: 12px; font-weight: 500; color: #64748B;
  cursor: pointer; transition: all .12s;
}
.mode-btn:hover { border-color: #93C5FD; color: #1D4ED8; }
.mode-btn.active {
  border-color: #3B82F6; background: #EFF6FF; color: #1D4ED8;
}

/* Toggle */
.toggle-row {
  display: flex; align-items: center;
  justify-content: space-between; font-size: 13px;
  margin-bottom: 10px;
}
.toggle-row:last-child { margin-bottom: 0; }
.toggle-label { color: #374151; }
.toggle { position: relative; width: 36px; height: 20px; cursor: pointer; }
.toggle input { display: none; }
.toggle-slider {
  position: absolute; inset: 0;
  background: #E2E8F0; border-radius: 10px; transition: background .2s;
}
.toggle-slider::after {
  content: ''; position: absolute;
  top: 2px; left: 2px;
  width: 16px; height: 16px;
  background: #fff; border-radius: 50%;
  transition: transform .2s;
  box-shadow: 0 1px 3px rgba(0,0,0,.2);
}
.toggle input:checked + .toggle-slider { background: #1E3A8A; }
.toggle input:checked + .toggle-slider::after { transform: translateX(16px); }

/* Image */
.image-drop {
  border: 2px dashed #E2E8F0; border-radius: 10px;
  overflow: hidden; cursor: pointer; transition: all .15s;
  min-height: 90px; display: flex;
  align-items: center; justify-content: center;
}
.image-drop:hover, .image-drop.dragging { border-color: #3B82F6; background: #EFF6FF; }
.image-drop.has-image { border-style: solid; }
.image-preview { width: 100%; height: 120px; object-fit: cover; display: block; }
.image-placeholder {
  display: flex; flex-direction: column;
  align-items: center; gap: 6px;
  color: #CBD5E1; font-size: 11px; padding: 20px;
}
.remove-btn {
  width: 100%; margin-top: 8px; padding: 7px;
  border: 1px solid #FECACA; border-radius: 6px;
  background: #FEF2F2; color: #DC2626;
  font-size: 12px; cursor: pointer;
}

/* Toast */
.toast {
  position: fixed; bottom: 24px; right: 24px;
  display: flex; align-items: center; gap: 8px;
  padding: 12px 18px; border-radius: 10px;
  font-size: 13px; font-weight: 500; z-index: 200;
  box-shadow: 0 4px 20px rgba(0,0,0,.15);
}
.toast.success { background: #0F172A; color: #fff; }
.toast.error   { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }
.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from { opacity: 0; transform: translateY(10px); }
.toast-leave-to   { opacity: 0; transform: translateY(10px); }

.spinner-sm {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff; border-radius: 50%;
  animation: spin .6s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>