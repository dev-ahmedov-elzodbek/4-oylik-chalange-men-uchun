<template>
  <div class="auth-page">

    <!-- Animated background -->
    <div class="auth-bg">
      <div class="ab-orb ab-orb1"></div>
      <div class="ab-orb ab-orb2"></div>
      <div class="ab-orb ab-orb3"></div>
      <div class="ab-grid"></div>
    </div>

    <!-- Floating particles -->
    <div class="particles" aria-hidden="true">
      <span v-for="i in 12" :key="i" class="particle" :style="particleStyle(i)"></span>
    </div>

    <!-- Desktop: left panel -->
    <div class="auth-left">
      <div class="al-logo">
        <div class="al-logo-icon">GF</div>
        <span class="al-logo-name">GoalFlow</span>
      </div>
      <h2 class="al-headline">Har kuni <span class="al-accent">1% yaxshilan</span>,<br>yil oxirida 37× o'sasan</h2>
      <p class="al-sub">Vazifalar, sog'liq, sport va o'rganish — hammasi bir joyda. Maqsadingga intilishni boshlash uchun ro'yxatdan o't.</p>

      <div class="al-features">
        <div class="alf-item" v-for="f in features" :key="f.label">
          <div class="alf-icon" :style="{ background: f.bg }">
            <span v-html="f.icon"></span>
          </div>
          <div>
            <div class="alf-label">{{ f.label }}</div>
            <div class="alf-desc">{{ f.desc }}</div>
          </div>
        </div>
      </div>

      <div class="al-stats">
        <div class="als-item" v-for="s in heroStats" :key="s.val">
          <div class="als-val">{{ s.val }}</div>
          <div class="als-label">{{ s.label }}</div>
        </div>
      </div>
    </div>

    <!-- Right: auth form -->
    <div class="auth-right">
      <div class="auth-card anim-fade-up">

        <!-- Mobile logo -->
        <div class="auth-mobile-logo">
          <div class="logo-box-sm">GF</div>
          <div>
            <div class="logo-title">GoalFlow</div>
            <div class="logo-tagline">{{ t('app.tagline') }}</div>
          </div>
        </div>

        <!-- Lang selector -->
        <div class="lang-row">
          <button
            v-for="l in langs" :key="l.code"
            class="lang-btn"
            :class="{ active: locale === l.code }"
            @click="setLang(l.code)"
          >
            <span>{{ l.flag }}</span>
            <span>{{ l.label }}</span>
          </button>
        </div>

        <!-- Mode tabs -->
        <div class="auth-tabs-wrap">
          <div class="auth-tabs-slider" :style="{ left: mode === 'login' ? '4px' : 'calc(50% + 0px)' }"></div>
          <button class="auth-tab" :class="{ active: mode === 'login' }" @click="mode = 'login'">
            {{ t('auth.login') }}
          </button>
          <button class="auth-tab" :class="{ active: mode === 'register' }" @click="mode = 'register'">
            {{ t('auth.register') }}
          </button>
        </div>

        <!-- Form -->
        <transition name="form-slide" mode="out-in">
          <div :key="mode" class="auth-form-body">

            <div v-if="mode === 'register'" class="form-group">
              <label class="af-label">{{ t('auth.fullName') }}</label>
              <div class="af-input-wrap">
                <span class="af-input-icon" v-html="personIcon"></span>
                <input v-model="fullName" class="af-input" type="text" :placeholder="t('auth.fullName')" autocomplete="name" />
              </div>
            </div>

            <div class="form-group">
              <label class="af-label">{{ t('auth.email') }}</label>
              <div class="af-input-wrap">
                <span class="af-input-icon" v-html="mailIcon"></span>
                <input v-model="email" class="af-input" type="email" placeholder="email@example.com" autocomplete="email" />
              </div>
            </div>

            <div class="form-group">
              <label class="af-label">{{ t('auth.password') }}</label>
              <div class="af-input-wrap">
                <span class="af-input-icon" v-html="lockIcon"></span>
                <input
                  v-model="password"
                  class="af-input"
                  :type="showPass ? 'text' : 'password'"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  @keyup.enter="submit"
                />
                <button class="af-pass-btn" type="button" @click="showPass = !showPass" tabindex="-1">
                  <span v-html="showPass ? eyeOffIcon : eyeIcon"></span>
                </button>
              </div>
              <div v-if="mode === 'register' && password.length > 0" class="password-strength">
                <div class="ps-bars">
                  <div class="ps-bar" :class="{ active: pwStrength >= 1, danger: pwStrength === 1 }"></div>
                  <div class="ps-bar" :class="{ active: pwStrength >= 2, warn: pwStrength === 2 }"></div>
                  <div class="ps-bar" :class="{ active: pwStrength >= 3, good: pwStrength >= 3 }"></div>
                </div>
                <span class="ps-label" :class="['s'+pwStrength]">{{ pwLabel }}</span>
              </div>
            </div>

            <transition name="fade">
              <div v-if="error" class="af-error">
                <span v-html="alertIcon"></span>
                {{ error }}
              </div>
            </transition>
            <transition name="fade">
              <div v-if="success" class="af-success">
                <span v-html="checkCircleIcon"></span>
                {{ success }}
              </div>
            </transition>

            <button
              class="btn btn-primary btn-full btn-ripple auth-submit"
              :class="{ loading: loading }"
              :disabled="loading"
              @click="submit"
            >
              <span v-if="loading" class="auth-spinner"></span>
              <span v-else>{{ mode === 'login' ? t('auth.loginBtn') : t('auth.registerBtn') }}</span>
              <span v-if="!loading" v-html="arrowRightIcon"></span>
            </button>

            <div class="auth-divider"><span>{{ t('auth.or') }}</span></div>

            <button class="btn-google" @click="googleLogin">
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {{ t('auth.google') }}
            </button>

          </div>
        </transition>

      </div>

      <!-- Bottom hint -->
      <p class="auth-hint">
        {{ mode === 'login' ? "Akkaunt yo'qmi?" : 'Allaqachon ro\'yxatdan o\'tganmisiz?' }}
        <button class="hint-link" @click="mode = mode === 'login' ? 'register' : 'login'">
          {{ mode === 'login' ? "Ro'yxatdan o'tish" : 'Kirish' }}
        </button>
      </p>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const { t, locale } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const mode     = ref('login')
const email    = ref('')
const password = ref('')
const fullName = ref('')
const showPass = ref(false)
const loading  = ref(false)
const error    = ref('')
const success  = ref('')

const langs = [
  { code: 'uz', flag: '🇺🇿', label: "O'zbek" },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'ru', flag: '🇷🇺', label: 'Русский' },
]

const features = [
  { label: 'Kunlik vazifalar', desc: 'Study, sport, ovqat — hammasi', icon: boltSvg(), bg: 'rgba(108,99,255,0.15)' },
  { label: 'Progress kuzatish', desc: 'Grafik va statistika', icon: chartSvg(), bg: 'rgba(0,212,170,0.15)' },
  { label: '90 kun challenge', desc: 'O\'zingni sinab ko\'r', icon: fireSvg(), bg: 'rgba(245,158,11,0.15)' },
]

const heroStats = [
  { val: '90', label: 'kun challenge' },
  { val: '∞', label: 'vazifalar' },
  { val: '100%', label: 'bepul' },
]

const pwStrength = computed(() => {
  const p = password.value
  if (p.length < 6) return 1
  if (p.length < 10 || !/[A-Z]/.test(p) || !/[0-9]/.test(p)) return 2
  return 3
})
const pwLabel = computed(() => ['', 'Zaif', "O'rtacha", 'Kuchli'][pwStrength.value])

function setLang(code) {
  locale.value = code
  localStorage.setItem('gf_lang', code)
}

function particleStyle(i) {
  const size = (i % 3 + 1) * 4 + 'px'
  const left = (i * 8.3) + '%'
  const duration = (8 + i % 6) + 's'
  const delay = (i * 0.7) + 's'
  const colors = ['var(--accent)', 'var(--accent2)', '#8b5cf6']
  return {
    width: size, height: size, left,
    bottom: '-20px',
    background: colors[i % 3],
    animationDuration: duration,
    animationDelay: delay,
    opacity: 0.3 + (i % 3) * 0.1
  }
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

function boltSvg() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" fill-opacity="0.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
}
function chartSvg() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`
}
function fireSvg() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2c0 0-6 5.5-6 11a6 6 0 0 0 12 0c0-2.8-1.5-5-3.5-6.5.3 2-1 3.5-2.5 3.5-1.5 0-2.5-1.5-.5-4.5C11 6 12 2 12 2z" fill="currentColor" fill-opacity="0.3" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>`
}

const personIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`
const mailIcon   = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>`
const lockIcon   = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`
const eyeIcon    = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
const eyeOffIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
const alertIcon  = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
const checkCircleIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
const arrowRightIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`
</script>

<style scoped>
/* ── Page layout ── */
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: stretch;
  position: relative;
  overflow: hidden;
}

/* ── Background ── */
.auth-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.ab-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  animation: orbFloat 12s ease-in-out infinite;
}
.ab-orb1 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(108,99,255,0.25) 0%, transparent 70%);
  top: -150px; left: -100px;
  animation-delay: 0s;
}
.ab-orb2 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(0,212,170,0.18) 0%, transparent 70%);
  bottom: -100px; right: -80px;
  animation-delay: -4s;
}
.ab-orb3 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%);
  top: 50%; left: 40%;
  animation-delay: -8s;
}
.ab-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(108,99,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(108,99,255,0.04) 1px, transparent 1px);
  background-size: 48px 48px;
}

/* ── Particles ── */
.particles { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.particle {
  position: absolute;
  border-radius: 50%;
  animation: particleDrift linear infinite;
}

/* ── Left panel (desktop only) ── */
.auth-left {
  display: none;
  flex-direction: column;
  justify-content: center;
  padding: 60px 56px;
  flex: 1;
  position: relative;
  z-index: 1;
}
@media (min-width: 900px) { .auth-left { display: flex; } }

.al-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 48px;
  animation: slideUp 0.6s var(--ease-out) both;
}
.al-logo-icon {
  width: 48px; height: 48px;
  background: linear-gradient(135deg, var(--accent), #8b5cf6);
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-weight: 800; font-size: 18px; color: white;
  box-shadow: 0 8px 24px rgba(108,99,255,0.4);
  animation: glowPulse 3s ease infinite;
}
.al-logo-name {
  font-family: var(--font-display);
  font-weight: 800; font-size: 22px; color: var(--text);
}

.al-headline {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(28px, 3vw, 40px);
  line-height: 1.2;
  color: var(--text);
  margin-bottom: 16px;
  animation: slideUp 0.6s var(--ease-out) 0.1s both;
}
.al-accent {
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.al-sub {
  font-size: 15px;
  color: var(--text-dim);
  line-height: 1.6;
  max-width: 420px;
  margin-bottom: 40px;
  animation: slideUp 0.6s var(--ease-out) 0.15s both;
}

.al-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 40px;
}
.alf-item {
  display: flex;
  align-items: center;
  gap: 14px;
  animation: slideUp 0.5s var(--ease-out) both;
}
.alf-item:nth-child(1) { animation-delay: 0.2s; }
.alf-item:nth-child(2) { animation-delay: 0.28s; }
.alf-item:nth-child(3) { animation-delay: 0.36s; }
.alf-icon {
  width: 40px; height: 40px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: var(--accent-light);
  flex-shrink: 0;
}
.alf-label { font-weight: 600; font-size: 14px; color: var(--text); }
.alf-desc  { font-size: 12px; color: var(--text-dim); }

.al-stats {
  display: flex;
  gap: 32px;
  animation: slideUp 0.5s var(--ease-out) 0.44s both;
}
.als-val {
  font-family: var(--font-display);
  font-weight: 800; font-size: 28px;
  background: linear-gradient(135deg, var(--accent-light), var(--accent2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.als-label { font-size: 12px; color: var(--text-dim); margin-top: 2px; }

/* ── Right panel ── */
.auth-right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 32px 20px;
  flex: 0 0 100%;
  max-width: 100%;
  position: relative;
  z-index: 1;
}
@media (min-width: 900px) {
  .auth-right {
    flex: 0 0 460px;
    max-width: 460px;
    padding: 40px 40px;
    border-left: 1px solid var(--border);
    background: rgba(8,11,20,0.6);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
  }
}
[data-theme="light"] .auth-right {
  background: rgba(255,255,255,0.7);
  border-color: var(--border2);
}

/* ── Auth card ── */
.auth-card {
  width: 100%;
  max-width: 400px;
}

/* ── Mobile logo ── */
.auth-mobile-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
}
@media (min-width: 900px) { .auth-mobile-logo { display: none; } }
.logo-box-sm {
  width: 44px; height: 44px;
  background: linear-gradient(135deg, var(--accent), #8b5cf6);
  border-radius: 13px;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-weight: 800; font-size: 17px; color: white;
  box-shadow: 0 6px 20px rgba(108,99,255,0.4);
  flex-shrink: 0;
}
.logo-title { font-family: var(--font-display); font-weight: 800; font-size: 20px; }
.logo-tagline { font-size: 12px; color: var(--text-dim); }

/* ── Lang row ── */
.lang-row {
  display: flex;
  gap: 6px;
  margin-bottom: 24px;
}
.lang-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 6px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-dim);
  font-size: 12px; font-weight: 500;
  cursor: pointer;
  transition: all 0.2s var(--ease-out);
}
.lang-btn.active {
  border-color: var(--accent);
  color: var(--accent-light);
  background: rgba(108,99,255,0.1);
  font-weight: 700;
}
.lang-btn:hover:not(.active) { background: var(--surface3); border-color: var(--border2); }

/* ── Tabs ── */
.auth-tabs-wrap {
  position: relative;
  display: flex;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 4px;
  margin-bottom: 24px;
  gap: 0;
}
.auth-tabs-slider {
  position: absolute;
  top: 4px; bottom: 4px;
  width: calc(50% - 4px);
  background: linear-gradient(135deg, var(--accent), #8b5cf6);
  border-radius: calc(var(--radius-sm) - 2px);
  transition: left 0.3s var(--ease-spring);
  box-shadow: 0 2px 10px rgba(108,99,255,0.4);
  pointer-events: none;
}
.auth-tab {
  flex: 1;
  padding: 10px;
  background: none;
  border: none;
  color: var(--text-dim);
  font-family: var(--font-body);
  font-size: 14px; font-weight: 500;
  border-radius: calc(var(--radius-sm) - 2px);
  cursor: pointer;
  transition: color 0.2s;
  position: relative; z-index: 1;
}
.auth-tab.active { color: white; font-weight: 700; }

/* ── Form body ── */
.auth-form-body { }
.form-group { margin-bottom: 16px; }
.af-label {
  display: block;
  font-size: 13px; font-weight: 500;
  color: var(--text-dim);
  margin-bottom: 8px;
}
.af-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.af-input-icon {
  position: absolute;
  left: 13px;
  color: var(--text-dim);
  display: flex;
  align-items: center;
  pointer-events: none;
  transition: color 0.2s;
}
.af-input {
  width: 100%;
  background: var(--surface2);
  border: 1.5px solid var(--border2);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 14px;
  padding: 12px 14px 12px 40px;
  outline: none;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}
.af-input:focus {
  border-color: var(--accent);
  background: var(--surface);
  box-shadow: 0 0 0 3px rgba(108,99,255,0.14);
}
.af-input:focus + .af-input-icon,
.af-input-wrap:focus-within .af-input-icon { color: var(--accent-light); }
.af-input::placeholder { color: var(--text-dim); }
[data-theme="light"] .af-input { background: #f6f8ff; border-color: rgba(108,99,255,0.15); }
[data-theme="light"] .af-input:focus { background: #fff; }

.af-pass-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-dim);
  display: flex; align-items: center;
  padding: 4px;
  transition: color 0.2s;
}
.af-pass-btn:hover { color: var(--accent-light); }

/* ── Password strength ── */
.password-strength {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
.ps-bars { display: flex; gap: 4px; flex: 1; }
.ps-bar {
  height: 3px;
  flex: 1;
  background: var(--surface3);
  border-radius: 2px;
  transition: background 0.3s;
}
.ps-bar.active.danger  { background: var(--danger); }
.ps-bar.active.warn    { background: var(--warning); }
.ps-bar.active.good    { background: var(--success); }
.ps-label { font-size: 11px; font-weight: 600; }
.s1 { color: var(--danger); }
.s2 { color: var(--warning); }
.s3 { color: var(--success); }

/* ── Messages ── */
.af-error, .af-success {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  margin-bottom: 14px;
}
.af-error  { background: rgba(239,68,68,0.1);  border: 1px solid rgba(239,68,68,0.25);  color: var(--danger);  }
.af-success{ background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25); color: var(--success); }

/* ── Submit button ── */
.auth-submit {
  height: 48px;
  font-size: 15px;
  border-radius: var(--radius-sm);
  gap: 8px;
  margin-bottom: 16px;
  position: relative;
}
.auth-spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
}

/* ── Divider ── */
.auth-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-dim);
  font-size: 12px;
  margin-bottom: 16px;
}
.auth-divider::before, .auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border2);
}

/* ── Google button ── */
.btn-google {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  background: var(--surface2);
  border: 1.5px solid var(--border2);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 14px; font-weight: 600;
  cursor: pointer;
  transition: all 0.2s var(--ease-out);
}
.btn-google:hover { background: var(--surface3); border-color: var(--border3); transform: translateY(-1px); box-shadow: var(--shadow-sm); }

/* ── Hint ── */
.auth-hint {
  margin-top: 20px;
  font-size: 13px;
  color: var(--text-dim);
  text-align: center;
}
.hint-link {
  background: none;
  border: none;
  color: var(--accent-light);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0 0 0 4px;
  transition: color 0.2s;
}
.hint-link:hover { color: var(--accent2); text-decoration: underline; }

/* ── Transitions ── */
.form-slide-enter-active { animation: slideUp 0.25s var(--ease-out); }
.form-slide-leave-active { animation: fadeIn 0.15s ease reverse; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
