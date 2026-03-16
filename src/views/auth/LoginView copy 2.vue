<template>
  <div class="login-page" :class="[theme]">
    <!-- Theme toggle button -->
    <button class="theme-toggle" @click="toggleTheme" :aria-label="`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`">
      <svg v-if="theme === 'light'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
      </svg>
      <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
      </svg>
    </button>

    <!-- Panel gauche — Branding -->
    <div class="login-branding">
      <div class="branding-content">
        <div class="branding-logo">
          <!-- Logo EgliseHub Mama - Version corrigée avec import -->
          <img 
            :src="logoImage" 
            alt="EgliseHub Mama"
            class="branding-logo-img"
          />
          <span class="branding-logo-text">EgliseHub Mama</span>
        </div>
        <div class="branding-tagline">
          La puissance du digital<br>au service de l'Église
        </div>
        <div class="branding-desc">
          Une plateforme tout-en-un qui révolutionne la gestion de votre ministère. 
          Créez votre site web dynamique, diffusez vos enseignements en un clic, 
          gérez vos événements et mobilisez votre communauté — le tout depuis une 
          interface intuitive pensée pour les leaders chrétiens d'Afrique et d'ailleurs.
        </div>
        <div class="branding-stats">
          <div class="branding-stat">
            <div class="branding-stat-n">12+</div>
            <div class="branding-stat-l">Ministères</div>
          </div>
          <div class="branding-stat">
            <div class="branding-stat-n">500+</div>
            <div class="branding-stat-l">Membres</div>
          </div>
          <div class="branding-stat">
            <div class="branding-stat-n">RCA</div>
            <div class="branding-stat-l">Bangui</div>
          </div>
        </div>
      </div>
      <div class="branding-footer">
        Centre Révélation du Christ · crc.eglisehub.org
      </div>
    </div>

    <!-- Panel droit — Formulaire -->
    <div class="login-form-panel">
      <div class="login-form-wrap">

        <div class="login-header">
          <h1 class="login-title">Connexion</h1>
          <p class="login-sub">Accédez à votre espace d'administration</p>
        </div>

        <form class="login-form" @submit.prevent="handleLogin">

          <div class="form-group">
            <label class="form-label">Adresse email</label>
            <div class="input-wrap">
              <span class="input-icon">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </span>
              <input
                v-model="form.email"
                type="email"
                class="form-input"
                placeholder="admin@eglisehub.org"
                autocomplete="email"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Mot de passe</label>
            <div class="input-wrap">
              <span class="input-icon">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </span>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="••••••••"
                autocomplete="current-password"
                required
              />
              <button type="button" class="input-toggle" @click="showPassword = !showPassword">
                <svg v-if="!showPassword" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg v-else width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Options supplémentaires -->
          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="rememberMe" class="checkbox-input" />
              <span class="checkbox-text">Se rappeler de moi</span>
            </label>
            <router-link to="/forgot-password" class="forgot-link">
              Mot de passe oublié ?
            </router-link>
          </div>

          <!-- Erreur -->
          <Transition name="shake">
            <div v-if="error" class="login-error">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {{ error }}
            </div>
          </Transition>

          <button type="submit" class="login-btn" :class="{ loading }" :disabled="loading">
            <span v-if="!loading">Se connecter</span>
            <span v-else class="spinner"></span>
          </button>

        </form>

        <div class="login-footer-text">
          EgliseHub · Plateforme multi-ministères · République centrafricaine
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Importer les logos directement (méthode Vite)
import logoLight from '@/assets/logos/eglisehub-mama-light.png'
import logoDark from '@/assets/logos/eglisehub-mama-dark.png'

const router = useRouter()
const auth   = useAuthStore()

const form = ref({ email: '', password: '' })
const error        = ref('')
const loading      = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)
const theme = ref('dark')

// Logo en fonction du thème
const logoImage = computed(() => {
  return theme.value === 'dark' ? logoDark : logoLight
})

// Charger le thème sauvegardé
onMounted(() => {
  const savedTheme = localStorage.getItem('theme') || 'dark'
  theme.value = savedTheme
  document.documentElement.classList.toggle('dark', savedTheme === 'dark')
  
  // Charger l'email sauvegardé si "remember me" était activé
  const savedEmail = localStorage.getItem('rememberedEmail')
  if (savedEmail) {
    form.value.email = savedEmail
    rememberMe.value = true
  }
})

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  localStorage.setItem('theme', theme.value)
  document.documentElement.classList.toggle('dark', theme.value === 'dark')
}

async function handleLogin() {
  error.value   = ''
  loading.value = true
  try {
    await auth.login(form.value.email, form.value.password)
    
    // Gérer l'option "Se rappeler de moi"
    if (rememberMe.value) {
      localStorage.setItem('rememberedEmail', form.value.email)
    } else {
      localStorage.removeItem('rememberedEmail')
    }
    
    router.push('/dashboard')
  } catch (e) {
    error.value = e.response?.data?.message || 'Identifiants incorrects. Veuillez réessayer.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  position: relative;
}

/* Theme toggle button */
.theme-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
  background: transparent;
  border: 2px solid currentColor;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--toggle-color, #64748B);
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.1);
}

.theme-toggle:hover {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.2);
}

/* Light theme variables */
.login-page.light {
  --branding-bg: #0F172A;
  --branding-text: #fff;
  --branding-secondary: #94a3b8;
  --form-bg: #f8fafc;
  --form-text: #0f172a;
  --input-bg: #ffffff;
  --input-border: #e2e8f0;
  --label-color: #334155;
  --toggle-color: #334155;
  --checkbox-border: #cbd5e1;
  --checkbox-bg: #ffffff;
  --gradient-1: rgba(30, 58, 138, 0.4);
  --gradient-2: rgba(196, 30, 58, 0.2);
  --stats-bg: rgba(255, 255, 255, 0.05);
}

/* Dark theme variables */
.login-page.dark {
  --branding-bg: #0a0f1a;
  --branding-text: #ffffff;
  --branding-secondary: #94a3b8;
  --form-bg: #111827;
  --form-text: #f1f5f9;
  --input-bg: #1e293b;
  --input-border: #334155;
  --label-color: #cbd5e1;
  --toggle-color: #94a3b8;
  --checkbox-border: #475569;
  --checkbox-bg: #1e293b;
  --gradient-1: rgba(30, 58, 138, 0.3);
  --gradient-2: rgba(196, 30, 58, 0.15);
  --stats-bg: rgba(255, 255, 255, 0.03);
}

/* Branding */
.login-branding {
  width: 440px;
  min-width: 440px;
  background: var(--branding-bg);
  display: flex;
  flex-direction: column;
  padding: 48px;
  position: relative;
  overflow: hidden;
}

.login-branding::before {
  content: '';
  position: absolute;
  top: -80px;
  left: -80px;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, var(--gradient-1) 0%, transparent 70%);
  pointer-events: none;
}

.login-branding::after {
  content: '';
  position: absolute;
  bottom: -60px;
  right: -60px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, var(--gradient-2) 0%, transparent 70%);
  pointer-events: none;
}

.branding-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.branding-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
}

.branding-logo-img {
  width: 250px ;
  height: 250px ;
  border-radius: 100px 100px 100px 100px;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  transition: transform 0.2s;
}

.branding-logo-img:hover {
  transform: scale(1.05);
}

.branding-logo-text {
  color: var(--branding-text);
  font-size: 22px;
  font-weight: 700;
  font-family: 'Sora', system-ui, sans-serif;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #fff 0%, #e2e8f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.branding-tagline {
  color: var(--branding-text);
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  font-family: 'Sora', system-ui, sans-serif;
  margin-bottom: 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.branding-desc {
  color: var(--branding-secondary);
  font-size: 15px;
  line-height: 1.7;
  margin-bottom: 48px;
  max-width: 90%;
}

.branding-stats {
  display: flex;
  gap: 32px;
  background: var(--stats-bg);
  padding: 24px;
  border-radius: 16px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.branding-stat {
  text-align: center;
}

.branding-stat-n {
  color: #93C5FD;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.branding-stat-l {
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.branding-footer {
  color: #475569;
  font-size: 12px;
  position: relative;
  z-index: 1;
  margin-top: 24px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 24px;
}

/* Form panel */
.login-form-panel {
  flex: 1;
  background: var(--form-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
}

.login-form-wrap {
  width: 100%;
  max-width: 400px;
}

.login-header {
  margin-bottom: 40px;
  text-align: center;
}

.login-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--form-text);
  font-family: 'Sora', system-ui, sans-serif;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}

.login-sub {
  color: var(--branding-secondary);
  font-size: 15px;
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--label-color);
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: var(--branding-secondary);
  display: flex;
  align-items: center;
  pointer-events: none;
  opacity: 0.7;
}

.form-input {
  width: 100%;
  padding: 14px 44px;
  border: 2px solid var(--input-border);
  border-radius: 12px;
  font-size: 15px;
  color: var(--form-text);
  background: var(--input-bg);
  outline: none;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder {
  color: var(--branding-secondary);
  opacity: 0.4;
}

.input-toggle {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  color: var(--branding-secondary);
  cursor: pointer;
  display: flex;
  padding: 0;
  transition: color 0.2s;
  opacity: 0.7;
}

.input-toggle:hover {
  color: var(--form-text);
  opacity: 1;
}

/* Form options */
.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--label-color);
  font-size: 14px;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 2px solid var(--checkbox-border);
  background: var(--checkbox-bg);
  cursor: pointer;
  accent-color: #1E3A8A;
  transition: all 0.2s;
}

.checkbox-input:checked {
  background-color: #1E3A8A;
  border-color: #1E3A8A;
}

.checkbox-text {
  user-select: none;
}

.forgot-link {
  color: #3B82F6;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s;
  font-weight: 500;
}

.forgot-link:hover {
  color: #2563EB;
  text-decoration: underline;
}

/* Error */
.login-error {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  color: #DC2626;
  font-size: 14px;
  padding: 12px 16px;
  border-radius: 10px;
  margin-top: 8px;
}

/* Button */
.login-btn {
  width: 100%;
  padding: 14px;
  background: #1E3A8A;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.login-btn:hover:not(:disabled)::before {
  left: 100%;
}

.login-btn:hover:not(:disabled) {
  background: #1e40af;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: none;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Spinner */
.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Shake animation */
.shake-enter-active {
  animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  10%,
  90% {
    transform: translateX(-1px);
  }
  20%,
  80% {
    transform: translateX(2px);
  }
  30%,
  50%,
  70% {
    transform: translateX(-4px);
  }
  40%,
  60% {
    transform: translateX(4px);
  }
}

.login-footer-text {
  text-align: center;
  color: var(--branding-secondary);
  font-size: 12px;
  margin-top: 32px;
  opacity: 0.7;
}

/* Responsive */
@media (max-width: 1024px) {
  .login-branding {
    width: 380px;
    min-width: 380px;
    padding: 32px;
  }
  
  .branding-tagline {
    font-size: 28px;
  }
}

@media (max-width: 768px) {
  .login-page {
    flex-direction: column;
  }
  
  .login-branding {
    width: 100%;
    min-width: 100%;
    padding: 32px;
  }
  
  .login-form-panel {
    padding: 32px;
  }
  
  .branding-desc {
    max-width: 100%;
  }
}
</style>