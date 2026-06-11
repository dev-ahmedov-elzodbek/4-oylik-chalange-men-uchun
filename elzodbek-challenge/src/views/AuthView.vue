<template>
  <div class="auth-page">
    <div class="auth-bg">
      <div class="bg-orb orb1"></div>
      <div class="bg-orb orb2"></div>
    </div>

    <div class="auth-container">
      <!-- Logo -->
      <div class="auth-logo">
        <div class="logo-box">GF</div>
        <div class="logo-info">
          <h1>GoalFlow</h1>
          <p>{{ t('app.tagline') }}</p>
        </div>
      </div>

      <!-- Lang selector -->
      <div class="lang-select">
        <button v-for="l in langs" :key="l.code" class="lang-btn" :class="{ active: locale === l.code }" @click="setLang(l.code)">{{ l.flag }} {{ l.label }}</button>
      </div>

      <!-- Tabs -->
      <div class="auth-tabs">
        <button class="auth-tab" :class="{ active: mode === 'login' }" @click="mode = 'login'">{{ t('auth.login') }}</button>
        <button class="auth-tab" :class="{ active: mode === 'register' }" @click="mode = 'register'">{{ t('auth.register') }}</button>
      </div>

      <!-- Form -->
      <div class="auth-form">
        <div v-if="mode === 'register'" class="form-group">
          <label class="label">{{ t('auth.fullName') }}</label>
          <input v-model="fullName" class="input" type="text" :placeholder="t('auth.fullName')" />
        </div>

        <div class="form-group">
          <label class="label">{{ t('auth.email') }}</label>
          <input v-model="email" class="input" type="email" placeholder="email@example.com" />
        </div>

        <div class="form-group">
          <label class="label">{{ t('auth.password') }}</label>
          <div class="password-wrap">
            <input v-model="password" class="input" :type="showPass ? 'text' : 'password'" placeholder="••••••••" />
            <button class="pass-toggle" @click="showPass = !showPass">{{ showPass ? '🙈' : '👁️' }}</button>
          </div>
        </div>

        <div v-if="error" class="error-msg">⚠️ {{ error }}</div>
        <div v-if="success" class="success-msg">✅ {{ success }}</div>

        <button class="btn btn-primary btn-full" :disabled="loading" @click="submit">
          <span v-if="loading" class="spinner"></span>
          {{ mode === 'login' ? t('auth.loginBtn') : t('auth.registerBtn') }}
        </button>

        <div class="auth-divider"><span>{{ t('auth.or') }}</span></div>

        <button class="btn btn-outline btn-full" @click="googleLogin">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" />
          {{ t('auth.google') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const { t, locale } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const mode = ref('login')
const email = ref('')
const password = ref('')
const fullName = ref('')
const showPass = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref('')

const langs = [
  { code: 'uz', flag: '🇺🇿', label: "O'zbek" },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'ru', flag: '🇷🇺', label: 'Русский' },
]

function setLang(code) {
  locale.value = code
  localStorage.setItem('gf_lang', code)
}

async function submit() {
  error.value = ''
  success.value = ''
  if (!email.value || !password.value) return
  loading.value = true
  try {
    if (mode.value === 'login') {
      await auth.login(email.value, password.value)
      router.push('/today')
    } else {
      await auth.register(email.value, password.value, fullName.value)
      success.value = 'Email tasdiqlash uchun xat yuborildi!'
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function googleLogin() {
  try { await auth.loginWithGoogle() } catch (e) { error.value = e.message }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  position: relative;
  overflow: hidden;
}

.auth-bg { position: fixed; inset: 0; pointer-events: none; }
.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
}
.orb1 { width: 400px; height: 400px; background: var(--accent); top: -100px; left: -100px; }
.orb2 { width: 300px; height: 300px; background: var(--accent2); bottom: -50px; right: -50px; }

.auth-container {
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 1;
}

.auth-logo {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
}

.logo-box {
  width: 56px;
  height: 56px;
  background: var(--accent);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 22px;
  color: white;
  box-shadow: 0 0 30px rgba(108,99,255,0.4);
  flex-shrink: 0;
}

.logo-info h1 {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 24px;
}
.logo-info p { font-size: 13px; color: var(--text-dim); }

.lang-select {
  display: flex;
  gap: 6px;
  margin-bottom: 20px;
}

.lang-btn {
  flex: 1;
  padding: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-dim);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.lang-btn.active { border-color: var(--accent); color: var(--accent-light); background: rgba(108,99,255,0.1); }

.auth-tabs {
  display: flex;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 4px;
  margin-bottom: 20px;
}

.auth-tab {
  flex: 1;
  padding: 10px;
  background: none;
  border: none;
  color: var(--text-dim);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.auth-tab.active { background: var(--accent); color: white; font-weight: 700; }

.auth-form {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
}

.password-wrap { position: relative; }
.password-wrap .input { padding-right: 44px; }
.pass-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.error-msg {
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.3);
  color: var(--danger);
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  margin-bottom: 12px;
}

.success-msg {
  background: rgba(16,185,129,0.1);
  border: 1px solid rgba(16,185,129,0.3);
  color: var(--success);
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  margin-bottom: 12px;
}

.auth-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-dim);
  font-size: 13px;
  margin: 16px 0;
}
.auth-divider::before, .auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
