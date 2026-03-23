<template>
  <div class="page">
    <div class="page-header">
      <h1>{{ t('nav.profile') }}</h1>
    </div>

    <!-- Avatar & Name -->
    <div class="card profile-card">
      <div class="avatar">{{ initials }}</div>
      <div class="profile-info">
        <div class="profile-name">{{ auth.profile?.full_name || 'Foydalanuvchi' }}</div>
        <div class="profile-email">{{ auth.user?.email }}</div>
        <span class="badge" :class="roleBadge">{{ roleLabel }}</span>
      </div>
    </div>

    <!-- Challenge Progress -->
    <div class="card">
      <div class="card-title">🏆 Challenge progress</div>
      <div class="challenge-info">
        <div class="ch-row">
          <span class="ch-label">Boshlanish</span>
          <span class="ch-val">{{ auth.profile?.challenge_start || '—' }}</span>
        </div>
        <div class="ch-row">
          <span class="ch-label">Tugash</span>
          <span class="ch-val">{{ auth.profile?.challenge_end || '—' }}</span>
        </div>
        <div class="ch-row">
          <span class="ch-label">Davomiylik</span>
          <span class="ch-val">{{ auth.profile?.challenge_duration || 90 }} kun</span>
        </div>
        <div class="ch-row">
          <span class="ch-label">Maqsad</span>
          <span class="ch-val goal-text">{{ auth.profile?.goal || '—' }}</span>
        </div>
      </div>
      <div class="challenge-bar-wrap">
        <div class="challenge-bar">
          <div class="challenge-fill" :style="{ width: challengeProgress + '%' }"></div>
        </div>
        <span class="challenge-pct">{{ challengeProgress }}%</span>
      </div>
    </div>

    <!-- Health Info -->
    <div class="card">
      <div class="card-title">💪 Sog'liq ma'lumotlari</div>
      <div class="health-grid">
        <div class="health-item">
          <div class="hi-val">{{ auth.profile?.height_cm || '—' }}</div>
          <div class="hi-label">Bo'y (sm)</div>
        </div>
        <div class="health-item">
          <div class="hi-val">{{ auth.profile?.weight_kg || '—' }}</div>
          <div class="hi-label">Vazn (kg)</div>
        </div>
        <div class="health-item">
          <div class="hi-val">{{ age || '—' }}</div>
          <div class="hi-label">Yosh</div>
        </div>
        <div class="health-item">
          <div class="hi-val" style="font-size:14px">{{ bmi || '—' }}</div>
          <div class="hi-label">BMI</div>
        </div>
      </div>
      <div v-if="bmiStatus" class="bmi-status" :style="{ color: bmiColor }">{{ bmiStatus }}</div>
    </div>

    <!-- Settings -->
    <div class="card">
      <div class="card-title">⚙️ Sozlamalar</div>
      <div class="settings-list">
        <div class="setting-item">
          <span>Til</span>
          <div class="lang-btns">
            <button v-for="l in langs" :key="l.code" class="lang-btn-sm" :class="{ active: locale === l.code }" @click="setLang(l.code)">{{ l.flag }}</button>
          </div>
        </div>
        <div class="setting-item">
          <span>Yo'nalish</span>
          <span class="setting-val">{{ auth.profile?.direction ? t(`onboarding.directions.${auth.profile.value.direction}`) : '—' }}</span>
        </div>
      </div>
    </div>

    <!-- Edit Profile -->
    <div class="card">
      <div class="card-title">✏️ Profilni tahrirlash</div>
      <div class="form-group">
        <label class="label">To'liq ism</label>
        <input v-model="editForm.full_name" class="input" />
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group">
          <label class="label">Bo'y (sm)</label>
          <input v-model.number="editForm.height_cm" class="input" type="number" />
        </div>
        <div class="form-group">
          <label class="label">Vazn (kg)</label>
          <input v-model.number="editForm.weight_kg" class="input" type="number" step="0.1" />
        </div>
      </div>
      <div v-if="saveMsg" class="success-msg" style="margin-bottom:12px">✅ {{ saveMsg }}</div>
      <button class="btn btn-primary btn-full" :disabled="saving" @click="saveProfile">
        {{ saving ? t('common.loading') : t('common.save') }}
      </button>
    </div>

    <!-- Logout -->
    <button class="btn btn-outline btn-full" style="margin-bottom:8px;border-color:rgba(239,68,68,0.3);color:var(--danger)" @click="logout">
      🚪 Chiqish
    </button>

    <div style="height:80px"></div>
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

const langs = [
  { code: 'uz', flag: '🇺🇿' },
  { code: 'en', flag: '🇬🇧' },
  { code: 'ru', flag: '🇷🇺' },
]

function setLang(code) {
  locale.value = code
  localStorage.setItem('gf_lang', code)
}

const initials = computed(() => {
  const name = auth.profile?.full_name || 'U'
  return name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()
})

const roleLabel = computed(() => {
  const r = auth.profile?.role
  return r === 'superadmin' ? '👑 SuperAdmin' : r === 'admin' ? '🛡️ Admin' : '👤 User'
})

const roleBadge = computed(() => {
  const r = auth.profile?.role
  return r === 'superadmin' ? 'badge-warning' : r === 'admin' ? 'badge-accent' : 'badge-success'
})

const age = computed(() => {
  const y = auth.profile?.birth_year
  return y ? new Date().getFullYear() - y : null
})

const bmi = computed(() => {
  const h = auth.profile?.height_cm
  const w = auth.profile?.weight_kg
  if (!h || !w) return null
  return (w / ((h/100) ** 2)).toFixed(1)
})

const bmiStatus = computed(() => {
  const b = parseFloat(bmi.value)
  if (!b) return null
  if (b < 18.5) return '🔵 Kam vazn'
  if (b < 25) return '🟢 Normal vazn'
  if (b < 30) return '🟡 Ortiqcha vazn'
  return '🔴 Semizlik'
})

const bmiColor = computed(() => {
  const b = parseFloat(bmi.value)
  if (!b) return 'var(--text-dim)'
  if (b < 18.5) return '#3b82f6'
  if (b < 25) return '#10b981'
  if (b < 30) return '#f59e0b'
  return '#ef4444'
})

const challengeProgress = computed(() => {
  const start = auth.profile?.challenge_start
  const dur = auth.profile?.challenge_duration || 90
  if (!start) return 0
  const days = Math.floor((new Date() - new Date(start)) / 86400000)
  return Math.min(100, Math.round((days / dur) * 100))
})

const editForm = ref({
  full_name: auth.profile?.full_name || '',
  height_cm: auth.profile?.height_cm || null,
  weight_kg: auth.profile?.weight_kg || null,
})

const saving = ref(false)
const saveMsg = ref('')

async function saveProfile() {
  saving.value = true
  try {
    await auth.updateProfile(editForm.value)
    saveMsg.value = t('common.success')
    setTimeout(() => saveMsg.value = '', 3000)
  } catch (e) { console.error(e) }
  finally { saving.value = false }
}

async function logout() {
  await auth.logout()
  router.push('/auth')
}
</script>

<style scoped>
.page { padding: 20px 16px; max-width: 600px; margin: 0 auto; }
.page-header { margin-bottom: 20px; }
.page-header h1 { font-family: var(--font-display); font-weight: 800; font-size: 24px; }

.profile-card { display: flex; align-items: center; gap: 16px; }
.avatar {
  width: 64px; height: 64px;
  background: var(--accent);
  border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  font-weight: 800; font-size: 22px;
  flex-shrink: 0;
}
.profile-name { font-family: var(--font-display); font-weight: 700; font-size: 18px; margin-bottom: 4px; }
.profile-email { font-size: 13px; color: var(--text-dim); margin-bottom: 8px; }

.challenge-info { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.ch-row { display: flex; justify-content: space-between; align-items: flex-start; }
.ch-label { font-size: 13px; color: var(--text-dim); }
.ch-val { font-size: 13px; font-family: var(--font-mono); }
.goal-text { max-width: 200px; text-align: right; font-size: 12px; }
.challenge-bar-wrap { display: flex; align-items: center; gap: 10px; }
.challenge-bar { flex: 1; height: 8px; background: var(--surface2); border-radius: 4px; overflow: hidden; }
.challenge-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent2)); border-radius: 4px; transition: width 0.5s; }
.challenge-pct { font-family: var(--font-mono); font-size: 13px; color: var(--accent-light); width: 36px; }

.health-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 10px; }
.health-item { text-align: center; background: var(--surface2); border-radius: var(--radius-sm); padding: 12px 8px; }
.hi-val { font-family: var(--font-mono); font-weight: 700; font-size: 20px; color: var(--accent-light); }
.hi-label { font-size: 11px; color: var(--text-dim); margin-top: 4px; }
.bmi-status { font-size: 14px; font-weight: 500; text-align: center; }

.settings-list { display: flex; flex-direction: column; gap: 12px; }
.setting-item { display: flex; justify-content: space-between; align-items: center; font-size: 14px; }
.setting-val { font-size: 13px; color: var(--text-dim); }
.lang-btns { display: flex; gap: 6px; }
.lang-btn-sm { background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 4px 10px; cursor: pointer; font-size: 16px; transition: all 0.2s; }
.lang-btn-sm.active { border-color: var(--accent); background: rgba(108,99,255,0.15); }

.success-msg { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: var(--success); padding: 10px 12px; border-radius: var(--radius-sm); font-size: 13px; }
</style>
