<template>
  <div class="page">

    <!-- ── Hero profile card ── -->
    <div class="prof-hero anim-fade-up">
      <div class="prof-hero-bg"></div>
      <div class="prof-hero-content">
        <div class="prof-avatar">
          {{ initials }}
          <div class="prof-avatar-ring"></div>
        </div>
        <div class="prof-info">
          <div class="prof-name">{{ auth.profile?.full_name || 'Foydalanuvchi' }}</div>
          <div class="prof-email">{{ auth.user?.email }}</div>
          <div class="prof-badges">
            <span class="prof-role-badge" :class="roleBadge">{{ roleLabel }}</span>
            <span v-if="auth.isPro && auth.profile?.role === 'user'" class="prof-plan-badge">
              {{ auth.isPremium ? '👑 Premium' : '💎 Pro' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Challenge progress ── -->
    <div class="prof-card card-challenge anim-fade-up stagger-1">
      <div class="pc-header">
        <div class="pc-icon" style="background:rgba(245,158,11,0.15);color:#f59e0b" v-html="icons.trophy"></div>
        <span class="pc-title">Challenge progress</span>
        <span class="pc-pct-badge">{{ challengeProgress }}%</span>
      </div>
      <div class="challenge-info">
        <div class="ch-row"><span class="ch-label">Boshlanish</span><span class="ch-val">{{ auth.profile?.challenge_start || '—' }}</span></div>
        <div class="ch-row"><span class="ch-label">Tugash</span><span class="ch-val">{{ auth.profile?.challenge_end || '—' }}</span></div>
        <div class="ch-row"><span class="ch-label">Davomiylik</span><span class="ch-val">{{ auth.profile?.challenge_duration || 90 }} kun</span></div>
        <div class="ch-row"><span class="ch-label">Maqsad</span><span class="ch-val goal-text">{{ auth.profile?.goal || '—' }}</span></div>
      </div>
      <div class="challenge-bar-wrap">
        <div class="progress-track"><div class="progress-fill-bar" :style="{ width: challengeProgress + '%' }"></div></div>
        <span class="challenge-pct">{{ challengeProgress }}%</span>
      </div>
    </div>

    <!-- ── Health data ── -->
    <div class="prof-card card-health anim-fade-up stagger-2">
      <div class="pc-header">
        <div class="pc-icon" style="background:rgba(16,185,129,0.15);color:#10b981" v-html="icons.heart || icons.trophy"></div>
        <span class="pc-title">Sog'liq ma'lumotlari</span>
      </div>
      <div class="health-grid">
        <div class="health-item">
          <div class="hi-icon">📏</div>
          <div class="hi-val">{{ auth.profile?.height_cm || '—' }}</div>
          <div class="hi-label">Bo'y (sm)</div>
        </div>
        <div class="health-item">
          <div class="hi-icon">⚖️</div>
          <div class="hi-val">{{ auth.profile?.weight_kg || '—' }}</div>
          <div class="hi-label">Vazn (kg)</div>
        </div>
        <div class="health-item">
          <div class="hi-icon">🎂</div>
          <div class="hi-val">{{ age || '—' }}</div>
          <div class="hi-label">Yosh</div>
        </div>
        <div class="health-item">
          <div class="hi-icon">💫</div>
          <div class="hi-val" :style="{ color: bmiColor }" style="font-size:16px">{{ bmi || '—' }}</div>
          <div class="hi-label">BMI</div>
        </div>
      </div>
      <div v-if="bmiStatus" class="bmi-status" :style="{ color: bmiColor, background: bmiColor + '15' }">{{ bmiStatus }}</div>
    </div>

    <!-- ── Settings ── -->
    <div class="prof-card card-settings anim-fade-up stagger-3">
      <div class="pc-header">
        <div class="pc-icon" style="background:rgba(108,99,255,0.15);color:var(--accent-light)" v-html="icons.settings"></div>
        <span class="pc-title">Sozlamalar</span>
      </div>
      <div class="settings-list">
        <div class="setting-item">
          <span>Til</span>
          <div class="lang-btns">
            <button v-for="l in langs" :key="l.code" class="lang-btn-sm" :class="{ active: locale === l.code }" @click="setLang(l.code)">{{ l.flag }}</button>
          </div>
        </div>
        <div class="setting-item">
          <span>Yo'nalish</span>
          <span class="setting-val">{{ auth.profile?.direction ? t(`onboarding.directions.${auth.profile?.direction}`) : '—' }}</span>
        </div>

        <div class="setting-item">
          <div class="setting-label-wrap">
            <span>🔊 Effekt va tebranish</span>
            <span class="setting-hint">Vazifa belgilanganda tovush</span>
          </div>
          <label class="pf-toggle">
            <input type="checkbox" :checked="fxOn" @change="setFx($event.target.checked)" />
            <span class="pf-slider"></span>
          </label>
        </div>

        <div class="setting-item">
          <div class="setting-label-wrap">
            <span>🔔 Kunlik eslatmalar</span>
            <span class="setting-hint">Ertalab va kechqurun turtki</span>
          </div>
          <label class="pf-toggle">
            <input type="checkbox" :checked="remOn" @change="setRem($event.target.checked)" />
            <span class="pf-slider"></span>
          </label>
        </div>

        <router-link to="/support" class="setting-link">
          <span>💬 Yordam va qo'llab-quvvatlash</span>
          <span class="setting-arrow">›</span>
        </router-link>
        <router-link v-if="!auth.isPro" to="/subscription" class="setting-link pro-link">
          <span>👑 Pro rejaga o'tish</span>
          <span class="setting-arrow">›</span>
        </router-link>
      </div>
    </div>

    <!-- ── Referral / Invite ── -->
    <div class="prof-card card-referral anim-fade-up stagger-4">
      <div class="pc-header">
        <div class="pc-icon" style="background:rgba(236,72,153,0.15);color:#ec4899">🎁</div>
        <span class="pc-title">Do'stlarni taklif qil</span>
      </div>
      <p class="ref-desc">Do'stingiz kodingizni kiritsa — <b>ikkalangizga +50 ball</b> 🎉</p>

      <div class="ref-code-box">
        <div class="ref-code-label">Sizning kodingiz</div>
        <div class="ref-code-value">{{ referral.code || '••••••' }}</div>
        <div class="ref-code-actions">
          <button class="ref-mini-btn" @click="copyCode">{{ copiedCode ? '✓ Nusxa olindi' : '📋 Nusxa' }}</button>
          <button class="ref-mini-btn primary" @click="shareCode">📤 Ulashish</button>
        </div>
      </div>

      <div v-if="referral.invited_count > 0" class="ref-stat">
        👥 Siz <b>{{ referral.invited_count }}</b> ta do'st taklif qilgansiz
        <span class="ref-bonus">+{{ referral.invited_count * 50 }} ball</span>
      </div>

      <!-- Redeem (agar hali taklif qilinmagan bo'lsa) -->
      <div v-if="!referral.was_referred" class="ref-redeem">
        <div class="ref-redeem-label">Do'st kodini kiriting</div>
        <div class="ref-redeem-row">
          <input v-model="redeemCode" class="input ref-input" placeholder="MASALAN: 6B39A8" maxlength="6" />
          <button class="btn btn-primary" @click="submitRedeem">Kiritish</button>
        </div>
        <div v-if="redeemMsg" class="ref-msg" :class="{ ok: redeemOk }">{{ redeemMsg }}</div>
      </div>
      <div v-else class="ref-done">✓ Siz taklif kodini kiritgansiz</div>
    </div>

    <!-- ── Edit profile ── -->
    <div class="prof-card card-edit anim-fade-up stagger-5">
      <div class="pc-header">
        <div class="pc-icon" style="background:rgba(0,212,170,0.15);color:var(--accent2)" v-html="icons.edit"></div>
        <span class="pc-title">Profilni tahrirlash</span>
      </div>
      <div class="form-group">
        <label class="label">To'liq ism</label>
        <input v-model="editForm.full_name" class="input" />
      </div>
      <div class="edit-twin">
        <div class="form-group">
          <label class="label">Bo'y (sm)</label>
          <input v-model.number="editForm.height_cm" class="input" type="number" />
        </div>
        <div class="form-group">
          <label class="label">Vazn (kg)</label>
          <input v-model.number="editForm.weight_kg" class="input" type="number" step="0.1" />
        </div>
      </div>
      <transition name="fade">
        <div v-if="saveMsg" class="success-msg" style="margin-bottom:12px">{{ saveMsg }}</div>
      </transition>
      <button class="btn btn-primary btn-full btn-ripple" :disabled="saving" @click="saveProfile">
        {{ saving ? t('common.loading') : t('common.save') }}
      </button>
    </div>

    <button class="btn btn-logout btn-full anim-fade-up stagger-6" @click="logout">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      Chiqish
    </button>

    <div style="height:20px"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { icons } from '../icons.js'
import { feedbackEnabled, toggleFeedback, playCheck } from '../utils/feedback.js'
import { remindersEnabled, toggleReminders } from '../utils/reminders.js'
import { supabase } from '../supabase.js'
import { onMounted } from 'vue'

const { t, locale } = useI18n()
const router = useRouter()
const auth = useAuthStore()

// ── Referral (do'st taklif) ──
const referral = ref({ code: '', invited_count: 0, was_referred: false })
const redeemCode = ref('')
const redeemMsg = ref('')
const redeemOk = ref(false)
const copiedCode = ref(false)

async function loadReferral() {
  if (!auth.user?.id) return
  const { data } = await supabase.rpc('get_my_referral')
  if (data?.[0]) referral.value = data[0]
}
function copyCode() {
  navigator.clipboard?.writeText(referral.value.code)
  copiedCode.value = true
  setTimeout(() => copiedCode.value = false, 1500)
}
async function shareCode() {
  const text = `GoalFlow'ga qo'shil! Mening taklif kodim: ${referral.value.code}\nHar kuni 1% yaxshilan 🚀`
  if (navigator.share) {
    try { await navigator.share({ title: 'GoalFlow', text }) } catch {}
  } else {
    copyCode()
  }
}
async function submitRedeem() {
  redeemMsg.value = ''
  const code = redeemCode.value.trim().toUpperCase()
  if (!code) return
  const { data, error } = await supabase.rpc('redeem_referral', { code })
  if (error) { redeemMsg.value = 'Xatolik yuz berdi'; redeemOk.value = false; return }
  const msgs = {
    'ok': "✓ Muvaffaqiyatli! Ikkalangizga +50 ball qo'shildi",
    'error:notfound': 'Bunday kod topilmadi',
    'error:self': "O'z kodingizni kirita olmaysiz",
    'error:already': 'Siz allaqachon kod kiritgansiz',
    'error:auth': 'Avval tizimga kiring',
  }
  redeemOk.value = data === 'ok'
  redeemMsg.value = msgs[data] || 'Xatolik'
  if (data === 'ok') { playCheck(); loadReferral() }
}

onMounted(loadReferral)

// ── Sozlamalar ──
const fxOn = ref(feedbackEnabled())
const remOn = ref(remindersEnabled())
function setFx(v) {
  fxOn.value = v
  toggleFeedback(v)
  if (v) playCheck()  // yoqilganda namuna
}
async function setRem(v) {
  remOn.value = v
  toggleReminders(v)
  if (v && 'Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission()
  }
}

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
  const n = auth.profile?.full_name || 'U'
  return n.split(' ').map(x => x[0]).slice(0,2).join('').toUpperCase()
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
  const h = auth.profile?.height_cm, w = auth.profile?.weight_kg
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

const editForm = ref({ full_name: '', height_cm: null, weight_kg: null })
watch(() => auth.profile, (p) => {
  if (p) {
    editForm.value.full_name = p.full_name || ''
    editForm.value.height_cm = p.height_cm || null
    editForm.value.weight_kg = p.weight_kg || null
  }
}, { immediate: true, deep: true })

const saving = ref(false)
const saveMsg = ref('')
async function saveProfile() {
  saving.value = true
  try {
    await auth.updateProfile(editForm.value)
    saveMsg.value = t('common.success')
    setTimeout(() => saveMsg.value = '', 3000)
  } catch(e) { console.error(e) }
  finally { saving.value = false }
}
async function logout() {
  await auth.logout()
  router.push('/auth')
}
</script>

<style scoped>
.page { padding: 16px; max-width: 700px; margin: 0 auto; }
@media(min-width:768px){ .page { padding: 28px 40px; max-width: 860px; } }

/* ── Hero profile ── */
.prof-hero {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 14px;
  border: 1px solid var(--border2);
  box-shadow: var(--shadow);
}
.prof-hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(108,99,255,0.18), rgba(0,212,170,0.08) 60%, transparent);
}
.prof-hero-bg::after {
  content: '';
  position: absolute;
  top: -80px; right: -60px;
  width: 220px; height: 220px;
  background: radial-gradient(circle, rgba(108,99,255,0.25) 0%, transparent 70%);
  border-radius: 50%;
}
.prof-hero-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px 20px;
}
.prof-avatar {
  position: relative;
  width: 72px; height: 72px;
  background: linear-gradient(135deg, var(--accent), #8b5cf6);
  border-radius: 22px;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-weight: 800; font-size: 26px; color: white;
  flex-shrink: 0;
  box-shadow: 0 8px 24px rgba(108,99,255,0.5);
  animation: float 3.5s ease-in-out infinite;
}
.prof-avatar-ring {
  position: absolute;
  inset: -4px;
  border-radius: 26px;
  border: 2px solid rgba(108,99,255,0.4);
  animation: glowPulse 2.5s ease infinite;
}
.prof-name {
  font-family: var(--font-display); font-weight: 800; font-size: 20px;
  margin-bottom: 3px;
  background: linear-gradient(135deg, var(--text) 50%, var(--accent-light));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.prof-email { font-size: 13px; color: var(--text-dim); margin-bottom: 10px; }
.prof-role-badge {
  display: inline-flex; align-items: center;
  font-family: var(--font-mono); font-size: 11px; font-weight: 700;
  padding: 4px 12px; border-radius: 20px;
  animation: badge-pop 0.5s var(--ease-spring);
}
.prof-role-badge.badge-warning { background: rgba(245,158,11,0.18); color: #f59e0b; box-shadow: 0 0 16px rgba(245,158,11,0.2); }
.prof-role-badge.badge-accent  { background: rgba(108,99,255,0.18); color: var(--accent-light); box-shadow: 0 0 16px rgba(108,99,255,0.2); }
.prof-role-badge.badge-success { background: rgba(16,185,129,0.18); color: var(--success); }
.prof-badges { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.prof-plan-badge {
  display: inline-flex; align-items: center;
  font-family: var(--font-mono); font-size: 11px; font-weight: 700;
  padding: 4px 12px; border-radius: 20px;
  background: linear-gradient(135deg, rgba(245,158,11,0.2), rgba(249,115,22,0.1));
  color: #f59e0b;
  box-shadow: 0 0 16px rgba(245,158,11,0.2);
}

/* ── Cards ── */
.prof-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px 18px 20px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s, border-color 0.2s;
}
.prof-card:hover { box-shadow: var(--shadow); }
.card-challenge { border-top: 3px solid #f59e0b; }
.card-health    { border-top: 3px solid #10b981; }
.card-settings  { border-top: 3px solid var(--accent); }
.card-referral  { border-top: 3px solid #ec4899; }
.card-edit      { border-top: 3px solid var(--accent2); }

/* ── Referral ── */
.ref-desc { font-size: 13px; color: var(--text-dim); line-height: 1.5; margin-bottom: 14px; }
.ref-desc b { color: var(--text); }
.ref-code-box {
  background: linear-gradient(135deg, rgba(236,72,153,0.08), rgba(139,92,246,0.04));
  border: 1px dashed rgba(236,72,153,0.35);
  border-radius: var(--radius-sm);
  padding: 16px; text-align: center; margin-bottom: 12px;
}
.ref-code-label { font-size: 11px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.08em; }
.ref-code-value {
  font-family: var(--font-mono); font-weight: 700; font-size: 30px; letter-spacing: 4px;
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  margin: 6px 0 12px;
}
.ref-code-actions { display: flex; gap: 8px; justify-content: center; }
.ref-mini-btn {
  padding: 8px 16px; border-radius: var(--radius-sm);
  border: 1px solid var(--border2); background: var(--surface2);
  color: var(--text); font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
}
.ref-mini-btn:hover { background: var(--surface3); }
.ref-mini-btn.primary { background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; border-color: transparent; }
.ref-mini-btn.primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(236,72,153,0.35); }

.ref-stat {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  font-size: 13px; color: var(--text-dim);
  background: var(--surface2); border-radius: var(--radius-sm);
  padding: 10px 14px; margin-bottom: 12px;
}
.ref-stat b { color: var(--text); }
.ref-bonus { margin-left: auto; font-family: var(--font-mono); font-weight: 700; color: #10b981; font-size: 12px; }

.ref-redeem-label { font-size: 12px; color: var(--text-dim); margin-bottom: 8px; font-weight: 600; }
.ref-redeem-row { display: flex; gap: 8px; }
.ref-input { text-transform: uppercase; letter-spacing: 3px; font-family: var(--font-mono); font-weight: 700; }
.ref-msg { font-size: 13px; margin-top: 8px; color: var(--danger); }
.ref-msg.ok { color: var(--success); }
.ref-done { font-size: 13px; color: var(--success); background: rgba(16,185,129,0.08); border-radius: var(--radius-sm); padding: 10px 14px; text-align: center; }

.pc-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.pc-icon {
  width: 32px; height: 32px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.pc-icon :deep(svg) { width: 17px; height: 17px; }
.pc-title { font-family: var(--font-display); font-weight: 700; font-size: 15px; flex: 1; }
.pc-pct-badge {
  font-family: var(--font-mono); font-size: 12px; font-weight: 700;
  color: #f59e0b; background: rgba(245,158,11,0.14);
  padding: 3px 10px; border-radius: 8px;
}

.challenge-info { display: flex; flex-direction: column; gap: 9px; margin-bottom: 16px; }
.ch-row { display: flex; justify-content: space-between; align-items: flex-start; }
.ch-label { font-size: 13px; color: var(--text-dim); }
.ch-val { font-size: 13px; font-family: var(--font-mono); }
.goal-text { max-width: 200px; text-align: right; font-size: 12px; }
.challenge-bar-wrap { display: flex; align-items: center; gap: 12px; }
.challenge-bar-wrap .progress-track { flex: 1; height: 8px; }
.challenge-pct { font-family: var(--font-mono); font-size: 13px; color: var(--accent-light); width: 40px; text-align: right; font-weight: 700; }

/* ── Health grid ── */
.health-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 12px; }
.health-item {
  text-align: center;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 14px 8px;
  transition: transform 0.2s var(--ease-spring), box-shadow 0.2s;
}
.health-item:hover { transform: translateY(-3px); box-shadow: var(--shadow-sm); }
.hi-icon { font-size: 18px; margin-bottom: 6px; }
.hi-val { font-family: var(--font-mono); font-weight: 700; font-size: 20px; color: var(--accent-light); }
.hi-label { font-size: 11px; color: var(--text-dim); margin-top: 4px; }
.bmi-status {
  font-size: 14px; font-weight: 600; text-align: center;
  padding: 8px; border-radius: var(--radius-sm);
}

/* ── Settings ── */
.settings-list { display: flex; flex-direction: column; gap: 4px; }
.setting-item {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 14px; padding: 10px 12px;
  border-radius: var(--radius-sm);
  transition: background 0.2s;
}
.setting-item:hover { background: var(--surface2); }
.setting-val { font-size: 13px; color: var(--text-dim); }
.setting-label-wrap { display: flex; flex-direction: column; gap: 2px; }
.setting-hint { font-size: 11px; color: var(--text-dim); }
.setting-link {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px; border-radius: var(--radius-sm);
  text-decoration: none; color: var(--text); font-size: 14px;
  transition: background 0.2s;
}
.setting-link:hover { background: var(--surface2); }
.setting-arrow { color: var(--text-dim); font-size: 20px; }
.pro-link { color: #f59e0b; font-weight: 600; }

/* ── Toggle switch ── */
.pf-toggle { position: relative; display: inline-block; width: 46px; height: 26px; cursor: pointer; flex-shrink: 0; }
.pf-toggle input { opacity: 0; width: 0; height: 0; }
.pf-slider { position: absolute; inset: 0; background: var(--surface3); border-radius: 14px; transition: 0.25s; }
.pf-slider::before {
  content: ''; position: absolute;
  height: 20px; width: 20px; left: 3px; bottom: 3px;
  background: white; border-radius: 50%; transition: 0.25s var(--ease-spring);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.pf-toggle input:checked + .pf-slider { background: linear-gradient(135deg, var(--accent), #8b5cf6); }
.pf-toggle input:checked + .pf-slider::before { transform: translateX(20px); }

.lang-btns { display: flex; gap: 6px; }
.lang-btn-sm {
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 9px; padding: 5px 11px; cursor: pointer; font-size: 16px;
  transition: all 0.2s var(--ease-spring);
}
.lang-btn-sm:hover { transform: scale(1.1); }
.lang-btn-sm.active { border-color: var(--accent); background: rgba(108,99,255,0.15); box-shadow: 0 0 12px rgba(108,99,255,0.25); }

/* ── Edit ── */
.edit-twin { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.success-msg {
  background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3);
  color: var(--success); padding: 10px 12px; border-radius: var(--radius-sm); font-size: 13px;
}

/* ── Logout ── */
.btn-logout {
  background: transparent;
  border: 1.5px solid rgba(239,68,68,0.3);
  color: var(--danger);
  margin-bottom: 8px;
  transition: all 0.2s var(--ease-out);
}
.btn-logout:hover {
  background: rgba(239,68,68,0.08);
  border-color: rgba(239,68,68,0.5);
  transform: translateY(-1px);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes glowPulse { 0%,100% { opacity: 0.3; } 50% { opacity: 0.7; } }
@keyframes badge-pop { 0% { transform: scale(0.6); } 70% { transform: scale(1.1); } 100% { transform: scale(1); } }
</style>
