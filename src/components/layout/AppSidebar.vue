<template>
  <aside class="sidebar">

    <!-- Logo -->
    <div class="sidebar-logo">
      <div class="sidebar-logo-icon">
        <span>{{ ministereInitials }}</span>
      </div>
      <div class="sidebar-logo-info">
        <div class="sidebar-logo-name">{{ ministereName }}</div>
        <div class="sidebar-logo-url">{{ ministreDomain }}</div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">

      <div class="nav-group">
        <span class="nav-group-label">Principal</span>
        <RouterLink
          v-for="item in mainNav"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="{ active: isActive(item) }"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span class="nav-label">{{ item.label }}</span>
          <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
        </RouterLink>
      </div>

      <div class="nav-group">
        <span class="nav-group-label">Contenu</span>
        <RouterLink
          v-for="item in contentNav"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="{ active: isActive(item) }"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span class="nav-label">{{ item.label }}</span>
        </RouterLink>
      </div>

      <div v-if="auth.isSuperAdmin" class="nav-group">
        <span class="nav-group-label">Administration</span>
        <RouterLink
          v-for="item in adminNav"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="{ active: isActive(item) }"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span class="nav-label">{{ item.label }}</span>
        </RouterLink>
      </div>

    </nav>

    <!-- User footer -->
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="sidebar-avatar">
          {{ userInitials }}
        </div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">{{ userName }}</div>
          <div class="sidebar-user-role">{{ userRole }}</div>
        </div>
        <button class="sidebar-logout" @click="handleLogout" title="Déconnexion">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
        </button>
      </div>
    </div>

  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth   = useAuthStore()
const route  = useRoute()
const router = useRouter()

// User info
const userName      = computed(() => `${auth.user?.name || ''} ${auth.user?.prenom || ''}`.trim())
const userInitials  = computed(() => {
  const n = auth.user?.name?.[0] || ''
  const p = auth.user?.prenom?.[0] || ''
  return (n + p).toUpperCase()
})
const userRole = computed(() => auth.isSuperAdmin ? 'Super Admin' : 'Admin Ministère')

// Ministère info
const ministereName   = computed(() => auth.user?.ministere?.nom || 'EgliseHub')
const ministreDomain  = computed(() => {
  const sub = auth.user?.ministere?.sous_domaine
  return sub ? `${sub}.eglisehub.org` : 'eglisehub.org'
})
const ministereInitials = computed(() => {
  return ministereName.value.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
})

// Nav items
const mainNav = computed(() => [
  {
    to: '/dashboard', label: 'Dashboard',
    icon: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
    </svg>`,
  },
  {
    to: '/pages', label: 'Pages',
    icon: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
    </svg>`,
  },
  {
    to: '/articles', label: 'Articles',
    icon: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
    </svg>`,
  },
  {
    to: '/events', label: 'Événements',
    icon: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
    </svg>`,
  },
  {
    to: '/media', label: 'Médias',
    icon: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
    </svg>`,
  },
  {
    to: '/messages', label: 'Messages',
    icon: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
    </svg>`,
    badge: null,
  },
])

const contentNav = [
  {
    to: '/faq', label: 'FAQ',
    icon: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>`,
  },
  {
    to: '/sliders', label: 'Sliders',
    icon: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
    </svg>`,
  },
  {
    to: '/settings', label: 'Paramètres',
    icon: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>`,
  },
]

const adminNav = [
  {
    to: '/admin/ministeres', label: 'Ministères',
    icon: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
    </svg>`,
  },
  {
    to: '/users', label: 'Utilisateurs',
    icon: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>`,
  },
]

function isActive(item) {
  return route.path.startsWith(item.to)
}

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  min-width: 240px;
  background: #0F172A;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  overflow-y: auto;
  scrollbar-width: none;
}
.sidebar::-webkit-scrollbar { display: none; }

/* Logo */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 16px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  margin-bottom: 8px;
}
.sidebar-logo-icon {
  width: 36px;
  height: 36px;
  min-width: 36px;
  background: #1E3A8A;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sidebar-logo-icon span {
  color: #93C5FD;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .04em;
}
.sidebar-logo-name {
  color: #F1F5F9;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sidebar-logo-url {
  color: #475569;
  font-size: 10px;
  margin-top: 1px;
}

/* Nav */
.sidebar-nav {
  flex: 1;
  padding: 4px 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.nav-group {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.nav-group-label {
  display: block;
  color: #334155;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .08em;
  text-transform: uppercase;
  padding: 4px 8px 6px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  color: #64748B;
  font-size: 13px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.12s ease;
  position: relative;
}
.nav-item:hover {
  background: rgba(255,255,255,0.04);
  color: #CBD5E1;
}
.nav-item.active {
  background: rgba(30,58,138,0.35);
  color: #93C5FD;
  box-shadow: inset 3px 0 0 #3B82F6;
}
.nav-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  opacity: 0.7;
}
.nav-item.active .nav-icon { opacity: 1; }
.nav-item:hover .nav-icon { opacity: 0.9; }
.nav-label { flex: 1; font-weight: 450; }
.nav-badge {
  background: #C41E3A;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

/* Footer */
.sidebar-footer {
  padding: 12px 8px;
  border-top: 1px solid rgba(255,255,255,0.06);
  margin-top: auto;
}
.sidebar-user {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  transition: background .12s;
  cursor: pointer;
}
.sidebar-user:hover { background: rgba(255,255,255,0.04); }
.sidebar-avatar {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
  background: #1E3A8A;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: #93C5FD;
}
.sidebar-user-name {
  color: #E2E8F0;
  font-size: 12px;
  font-weight: 500;
}
.sidebar-user-role {
  color: #475569;
  font-size: 10px;
  margin-top: 1px;
}
.sidebar-logout {
  margin-left: auto;
  background: none;
  border: none;
  color: #475569;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: color .12s;
}
.sidebar-logout:hover { color: #F87171; }
</style>