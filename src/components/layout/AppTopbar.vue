<template>
  <header class="topbar">
    <div class="topbar-left">
      <div class="topbar-title">{{ pageTitle }}</div>
      <div class="topbar-sub">{{ pageSubtitle }}</div>
    </div>
    <div class="topbar-right">
      <!-- Bouton principal selon la page -->
      <button v-if="primaryAction" class="btn-primary" @click="primaryAction.handler">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
        </svg>
        {{ primaryAction.label }}
      </button>

      <!-- Notifications -->
      <div class="topbar-notif" @click="toggleNotifs">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        <span v-if="unreadCount > 0" class="notif-dot">{{ unreadCount }}</span>
      </div>

      <!-- Avatar -->
      <div class="topbar-avatar">
        {{ userInitials }}
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()

const unreadCount = 0

const userInitials = computed(() => {
  const n = auth.user?.name?.[0] || ''
  const p = auth.user?.prenom?.[0] || ''
  return (n + p).toUpperCase()
})

const pageTitles = {
  '/dashboard':        { title: 'Tableau de bord',  sub: null },
  '/pages':            { title: 'Pages',             sub: 'Gérez les pages de votre site' },
  '/articles':         { title: 'Articles',          sub: 'Prédications et enseignements' },
  '/events':           { title: 'Événements',        sub: 'Cultes et activités' },
  '/media':            { title: 'Médiathèque',       sub: 'Images, vidéos, documents' },
  '/messages':         { title: 'Messages',          sub: 'Messages de contact' },
  '/faq':              { title: 'FAQ',               sub: 'Questions fréquentes' },
  '/sliders':          { title: 'Sliders',           sub: 'Bannières de la page accueil' },
  '/settings':         { title: 'Paramètres',        sub: 'Thème, SEO, réseaux sociaux' },
  '/users':            { title: 'Utilisateurs',      sub: 'Comptes et accès' },
  '/admin/ministeres': { title: 'Ministères',        sub: 'Gérer tous les ministères' },
}

const pageInfo = computed(() => {
  const path = route.path
  for (const [key, val] of Object.entries(pageTitles)) {
    if (path.startsWith(key)) return val
  }
  return { title: 'EgliseHub', sub: null }
})

const pageTitle = computed(() => pageInfo.value.title)
const pageSubtitle = computed(() => {
  if (pageInfo.value.sub) return pageInfo.value.sub
  const now = new Date()
  return now.toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
})

const primaryActionMap = {
  '/articles': { label: 'Nouvel article',    handler: () => router.push('/articles/new') },
  '/pages':    { label: 'Nouvelle page',     handler: () => router.push('/pages/new') },
  '/events':   { label: 'Nouvel événement',  handler: () => router.push('/events/new') },
  '/media':    { label: 'Uploader',          handler: () => {} },
}

const primaryAction = computed(() => {
  for (const [key, val] of Object.entries(primaryActionMap)) {
    if (route.path === key) return val
  }
  return null
})

function toggleNotifs() {}
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #E2E8F0;
  position: sticky;
  top: 0;
  z-index: 20;
}
.topbar-title {
  font-size: 18px;
  font-weight: 600;
  color: #0F172A;
  font-family: 'Sora', system-ui, sans-serif;
}
.topbar-sub {
  font-size: 12px;
  color: #64748B;
  margin-top: 2px;
  text-transform: capitalize;
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.btn-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #1E3A8A;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.12s;
}
.btn-primary:hover { background: #1e40af; }
.topbar-notif {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #F1F5F9;
  border: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  color: #64748B;
  transition: all .12s;
}
.topbar-notif:hover { background: #E2E8F0; }
.notif-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  background: #C41E3A;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
}
.topbar-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #1E3A8A;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #93C5FD;
  cursor: pointer;
}
</style>