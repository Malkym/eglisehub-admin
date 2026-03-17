<template>
  <div class="login-page">

    <!-- Panel gauche — Branding -->
    <div class="login-branding">
      <div class="branding-content">
        <div class="branding-logo">
          <div class="branding-logo-icon">EH</div>
          <span class="branding-logo-text">EgliseHub</span>
        </div>
        <div class="branding-tagline">
          Plateforme digitale pour<br>les ministères chrétiens
        </div>
        <div class="branding-desc">
          Gérez votre site, publiez vos enseignements,<br>
          organisez vos événements — tout en un.
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth   = useAuthStore()

const form = ref({ email: '', password: '' })
const error        = ref('')
const loading      = ref(false)
const showPassword = ref(false)

async function handleLogin() {
  error.value   = ''
  loading.value = true
  try {
    await auth.login(form.value.email, form.value.password)
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
}

/* Branding */
.login-branding {
  width: 420px;
  min-width: 420px;
  background: #0F172A;
  display: flex;
  flex-direction: column;
  padding: 40px;
  position: relative;
  overflow: hidden;
}
.login-branding::before {
  content: '';
  position: absolute;
  top: -60px;
  left: -60px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(30,58,138,0.4) 0%, transparent 70%);
  pointer-events: none;
}
.login-branding::after {
  content: '';
  position: absolute;
  bottom: -40px;
  right: -40px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(196,30,58,0.2) 0%, transparent 70%);
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
.branding-logo-icon {
  width: 44px;
  height: 44px;
  background: #1E3A8A;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #93C5FD;
}
.branding-logo-text {
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  font-family: 'Sora', system-ui, sans-serif;
  letter-spacing: -.02em;
}
.branding-tagline {
  color: #fff;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -.02em;
  font-family: 'Sora', system-ui, sans-serif;
  margin-bottom: 16px;
}
.branding-desc {
  color: #64748B;
  font-size: 14px;
  line-height: 1.7;
  margin-bottom: 40px;
}
.branding-stats {
  display: flex;
  gap: 24px;
}
.branding-stat-n {
  color: #93C5FD;
  font-size: 22px;
  font-weight: 700;
}
.branding-stat-l {
  color: #475569;
  font-size: 11px;
  margin-top: 2px;
}
.branding-footer {
  color: #334155;
  font-size: 11px;
  position: relative;
  z-index: 1;
}

/* Form panel */
.login-form-panel {
  flex: 1;
  background: #F8FAFC;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}
.login-form-wrap {
  width: 100%;
  max-width: 400px;
}
.login-header { margin-bottom: 32px; }
.login-title {
  font-size: 26px;
  font-weight: 700;
  color: #0F172A;
  font-family: 'Sora', system-ui, sans-serif;
  letter-spacing: -.02em;
  margin-bottom: 6px;
}
.login-sub {
  color: #64748B;
  font-size: 14px;
}

/* Form */
.login-form { display: flex; flex-direction: column; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; font-weight: 500; color: #374151; }
.input-wrap { position: relative; display: flex; align-items: center; }
.input-icon {
  position: absolute;
  left: 12px;
  color: #94A3B8;
  display: flex;
  align-items: center;
  pointer-events: none;
}
.form-input {
  width: 100%;
  padding: 12px 40px;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  font-size: 14px;
  color: #0F172A;
  background: #fff;
  outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.form-input:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59,130,246,.1);
}
.form-input::placeholder { color: #CBD5E1; }
.input-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #94A3B8;
  cursor: pointer;
  display: flex;
  padding: 0;
  transition: color .12s;
}
.input-toggle:hover { color: #64748B; }

/* Error */
.login-error {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  color: #DC2626;
  font-size: 13px;
  padding: 10px 14px;
  border-radius: 8px;
}

/* Button */
.login-btn {
  width: 100%;
  padding: 13px;
  background: #1E3A8A;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s, transform .1s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
}
.login-btn:hover:not(:disabled) { background: #1e40af; }
.login-btn:active:not(:disabled) { transform: scale(.99); }
.login-btn:disabled { opacity: .7; cursor: not-allowed; }

/* Spinner */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Shake animation */
.shake-enter-active { animation: shake .3s; }
@keyframes shake {
  0%,100% { transform: translateX(0); }
  25%      { transform: translateX(-6px); }
  75%      { transform: translateX(6px); }
}

.login-footer-text {
  text-align: center;
  color: #CBD5E1;
  font-size: 11px;
  margin-top: 28px;
}
</style>