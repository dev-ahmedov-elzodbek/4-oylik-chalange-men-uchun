<template>
  <div class="ob-wrap" :data-theme="theme">
    <!-- Animated background -->
    <div class="ob-bg">
      <div class="ob-orb ob-orb1"></div>
      <div class="ob-orb ob-orb2"></div>
      <div class="ob-orb ob-orb3"></div>
    </div>

    <div class="ob-shell">
      <!-- Header progress -->
      <div class="ob-header">
        <div class="ob-logo">
          <span class="ob-logo-mark">GF</span>
          <span class="ob-logo-name">GoalFlow</span>
        </div>
        <div class="ob-progress-wrap">
          <div class="ob-progress-bar">
            <div class="ob-progress-fill" :style="{ width: (step / 6 * 100) + '%' }"></div>
          </div>
          <span class="ob-step-counter">{{ step }}<span class="ob-step-total">/6</span></span>
        </div>
      </div>

      <!-- Step panel -->
      <transition :name="transDir" mode="out-in">

        <!-- ── Step 1: Yo'nalish ─────────────────────────────── -->
        <div v-if="step === 1" key="s1" class="ob-panel">
          <div class="ob-panel-head">
            <div class="ob-step-icon">🎯</div>
            <h1 class="ob-title">Qaysi yo'nalishda <span class="ob-title-accent">rivojlanmoqchisiz?</span></h1>
            <p class="ob-sub">Biz siz uchun shaxsiy reja tuzib beramiz</p>
          </div>
          <div class="dir-grid">
            <button
              v-for="(label, key) in directions"
              :key="key"
              class="dir-card"
              :class="{ active: form.direction === key }"
              @click="form.direction = key"
            >
              <span class="dir-icon">{{ label.icon }}</span>
              <span class="dir-label">{{ label.text }}</span>
              <span v-if="form.direction === key" class="dir-check">✓</span>
            </button>
          </div>
        </div>

        <!-- ── Step 2: Fanlar ────────────────────────────────── -->
        <div v-else-if="step === 2" key="s2" class="ob-panel">
          <div class="ob-panel-head">
            <div class="ob-step-icon">📚</div>
            <h1 class="ob-title">Qaysi fanlarni <span class="ob-title-accent">o'qiyapsiz?</span></h1>
            <p class="ob-sub">Bir yoki bir nechta tanlashingiz mumkin</p>
          </div>
          <div class="chip-grid">
            <button
              v-for="s in subjects" :key="s.key"
              class="ob-chip" :class="{ active: form.subjects.includes(s.key) }"
              @click="toggleArr(form.subjects, s.key)"
            >
              <span>{{ s.icon }}</span> {{ s.label }}
            </button>
          </div>
          <div v-if="form.subjects.length" class="ob-selected-hint">
            {{ form.subjects.length }} ta tanlandi ✓
          </div>
        </div>

        <!-- ── Step 3: Sport ─────────────────────────────────── -->
        <div v-else-if="step === 3" key="s3" class="ob-panel">
          <div class="ob-panel-head">
            <div class="ob-step-icon">💪</div>
            <h1 class="ob-title">Qaysi sportga <span class="ob-title-accent">qiziqasiz?</span></h1>
            <p class="ob-sub">Aktiv turmush tarzi — maqsadga tezroq yetishtiadi</p>
          </div>
          <div class="chip-grid">
            <button
              v-for="(label, key) in tm('onboarding.sportsList')" :key="key"
              class="ob-chip" :class="{ active: form.sports.includes(key) }"
              @click="toggleArr(form.sports, key)"
            >{{ label }}</button>
          </div>
          <div v-if="form.sports.length" class="ob-selected-hint">
            {{ form.sports.length }} ta sport tanlandi ✓
          </div>
        </div>

        <!-- ── Step 4: Vaqt bloklari ─────────────────────────── -->
        <div v-else-if="step === 4" key="s4" class="ob-panel">
          <div class="ob-panel-head">
            <div class="ob-step-icon">🕐</div>
            <h1 class="ob-title">Band <span class="ob-title-accent">vaqtlaringiz</span></h1>
            <p class="ob-sub">Jadval tuzishda hisobga olamiz (ixtiyoriy)</p>
          </div>
          <div class="time-list">
            <div v-for="(block, i) in form.timeBlocks" :key="i" class="time-card">
              <div class="time-card-header">
                <input v-model="block.title" class="ob-input" placeholder="Nomi: Dars, Ish, Sport..." />
                <button class="time-del-btn" @click="form.timeBlocks.splice(i,1)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div class="day-chips">
                <button
                  v-for="(d, di) in dayNames" :key="di"
                  class="day-chip" :class="{ active: block.days.includes(di+1) }"
                  @click="toggleArr(block.days, di+1)"
                >{{ d }}</button>
              </div>
              <div class="time-range">
                <div class="time-field">
                  <label class="ob-label">Boshlanish</label>
                  <select v-model="block.start" class="ob-select">
                    <option v-for="tm in timeOptions" :key="tm" :value="tm">{{ tm }}</option>
                  </select>
                </div>
                <div class="time-range-sep">→</div>
                <div class="time-field">
                  <label class="ob-label">Tugash</label>
                  <select v-model="block.end" class="ob-select">
                    <option v-for="tm in timeOptions" :key="tm" :value="tm">{{ tm }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <button class="ob-add-btn" @click="addBlock">
            <span class="ob-add-icon">+</span>
            Yangi vaqt bloki qo'shish
          </button>
          <p v-if="!form.timeBlocks.length" class="ob-skip-hint">
            Vaqt bloklari ixtiyoriy — o'tkazib yuboring
          </p>
        </div>

        <!-- ── Step 5: Sog'liq ───────────────────────────────── -->
        <div v-else-if="step === 5" key="s5" class="ob-panel">
          <div class="ob-panel-head">
            <div class="ob-step-icon">🏥</div>
            <h1 class="ob-title">Sog'liq <span class="ob-title-accent">ma'lumotlari</span></h1>
            <p class="ob-sub">Kaloriya va jadval tavsiyalari uchun</p>
          </div>

          <!-- Jins -->
          <div class="ob-form-group">
            <label class="ob-label">Jins</label>
            <div class="gender-row">
              <button class="gender-btn" :class="{ active: form.gender === 'male' }" @click="form.gender = 'male'">
                <span class="gender-icon">👨</span> Erkak
              </button>
              <button class="gender-btn" :class="{ active: form.gender === 'female' }" @click="form.gender = 'female'">
                <span class="gender-icon">👩</span> Ayol
              </button>
            </div>
          </div>

          <!-- Tug'ilgan sana -->
          <div class="ob-form-group">
            <label class="ob-label">Tug'ilgan sana</label>
            <input v-model="form.birth_date" class="ob-input" type="date" :max="maxBirthDate" :min="minBirthDate" />
            <div v-if="calculatedAge" class="ob-age-pill">
              🎂 {{ calculatedAge }} yosh
            </div>
          </div>

          <!-- Bo'y / Vazn -->
          <div class="ob-twin-grid">
            <div class="ob-form-group">
              <label class="ob-label">Bo'y</label>
              <div class="ob-input-unit">
                <input v-model.number="form.height_cm" class="ob-input" type="number" placeholder="175" min="100" max="250" />
                <span class="ob-unit">sm</span>
              </div>
            </div>
            <div class="ob-form-group">
              <label class="ob-label">Vazn</label>
              <div class="ob-input-unit">
                <input v-model.number="form.weight_kg" class="ob-input" type="number" placeholder="70" step="0.1" min="30" max="300" />
                <span class="ob-unit">kg</span>
              </div>
            </div>
          </div>

          <!-- BMI -->
          <div v-if="bmi" class="ob-bmi-card">
            <div class="ob-bmi-left">
              <div class="ob-bmi-val">{{ bmi }}</div>
              <div class="ob-bmi-sub">BMI indeks</div>
            </div>
            <div class="ob-bmi-divider"></div>
            <div class="ob-bmi-right">
              <div class="ob-bmi-status" :style="{ color: bmiColor }">{{ bmiStatus }}</div>
              <div class="ob-bmi-bar">
                <div class="ob-bmi-fill" :style="{ width: bmiPercent + '%', background: bmiColor }"></div>
              </div>
            </div>
          </div>

          <!-- Faoliyat -->
          <div class="ob-form-group">
            <label class="ob-label">Faoliyat darajasi</label>
            <div class="activity-grid">
              <button
                v-for="(al, key) in activityLevels" :key="key"
                class="activity-btn" :class="{ active: form.activity_level === key }"
                @click="form.activity_level = key"
              >
                <span class="activity-icon">{{ al.icon }}</span>
                <div class="activity-info">
                  <div class="activity-name">{{ al.name }}</div>
                  <div class="activity-desc">{{ al.desc }}</div>
                </div>
              </button>
            </div>
          </div>

          <!-- Kaloriya -->
          <div v-if="calorieEstimate" class="ob-calorie-card">
            <div class="ob-cal-header">
              <span>🔥 Kunlik kaloriya tavsiyasi</span>
            </div>
            <div class="ob-cal-val">{{ calorieEstimate.toLocaleString() }} <span>kcal</span></div>
            <div class="ob-cal-macros">
              <div class="ob-cal-macro">
                <div class="ob-cal-macro-dot" style="background:#ef4444"></div>
                <span>Oqsil ~{{ macros.protein }}g</span>
              </div>
              <div class="ob-cal-macro">
                <div class="ob-cal-macro-dot" style="background:#f59e0b"></div>
                <span>Uglevod ~{{ macros.carbs }}g</span>
              </div>
              <div class="ob-cal-macro">
                <div class="ob-cal-macro-dot" style="background:#6366f1"></div>
                <span>Yog' ~{{ macros.fat }}g</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Step 6: Maqsad ────────────────────────────────── -->
        <div v-else-if="step === 6" key="s6" class="ob-panel">
          <div class="ob-panel-head">
            <div class="ob-step-icon">🚀</div>
            <h1 class="ob-title">Asosiy <span class="ob-title-accent">maqsadingiz</span></h1>
            <p class="ob-sub">Aniq maqsad — tez natija</p>
          </div>

          <!-- Ilhom misollari -->
          <div class="goal-examples">
            <button
              v-for="ex in goalExamples" :key="ex"
              class="goal-example-chip"
              @click="form.goal = ex"
            >{{ ex }}</button>
          </div>

          <textarea
            v-model="form.goal"
            class="ob-textarea"
            placeholder="Masalan: 4 oyda dasturchi bo'lish, ingliz tilini o'rganish..."
            rows="3"
          ></textarea>

          <!-- Challenge davomiyligi -->
          <div class="ob-form-group" style="margin-top:24px">
            <label class="ob-label">Challenge davomiyligi</label>
            <div class="dur-grid">
              <button
                v-for="d in [30, 60, 90, 120]" :key="d"
                class="dur-card" :class="{ active: form.challenge_duration === d }"
                @click="form.challenge_duration = d"
              >
                <span class="dur-days">{{ d }}</span>
                <span class="dur-kun">kun</span>
                <span v-if="d === 90" class="dur-badge">Mashhur</span>
              </button>
            </div>
          </div>

          <!-- Xulosa karta -->
          <div class="ob-summary">
            <div class="ob-summary-title">📋 Xulosa</div>
            <div class="ob-summary-grid">
              <div class="ob-sum-item">
                <span class="ob-sum-label">Yo'nalish</span>
                <span class="ob-sum-val">{{ form.direction ? directions[form.direction]?.icon + ' ' + directions[form.direction]?.text : '—' }}</span>
              </div>
              <div class="ob-sum-item">
                <span class="ob-sum-label">Sportlar</span>
                <span class="ob-sum-val">{{ form.sports.length ? form.sports.length + ' ta' : '—' }}</span>
              </div>
              <div v-if="calculatedAge" class="ob-sum-item">
                <span class="ob-sum-label">Yosh</span>
                <span class="ob-sum-val">{{ calculatedAge }} yosh</span>
              </div>
              <div v-if="calorieEstimate" class="ob-sum-item">
                <span class="ob-sum-label">Kaloriya</span>
                <span class="ob-sum-val">{{ calorieEstimate }} kcal</span>
              </div>
              <div class="ob-sum-item">
                <span class="ob-sum-label">Challenge</span>
                <span class="ob-sum-val">{{ form.challenge_duration }} kun</span>
              </div>
            </div>
          </div>
        </div>

      </transition>

      <!-- Navigation -->
      <div class="ob-nav">
        <button v-if="step > 1" class="ob-back-btn" @click="goBack">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Orqaga
        </button>
        <div v-else></div>

        <button v-if="step < 6" class="ob-next-btn" @click="goNext" :disabled="!canProceed">
          Keyingi
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
        <button v-else class="ob-finish-btn" :disabled="saving || !form.goal" @click="finish">
          <span v-if="saving" class="ob-spinner"></span>
          <span v-else>🚀</span>
          {{ saving ? 'Saqlanmoqda...' : 'Boshlash!' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useNutritionStore } from '../stores/nutrition.js'
import { supabase } from '../supabase.js'

const { tm } = useI18n()
const router  = useRouter()
const auth    = useAuthStore()
const nutrition = useNutritionStore()

const step    = ref(1)
const saving  = ref(false)
const transDir = ref('slide-left')
const theme   = ref(localStorage.getItem('gf_theme') || 'dark')

const form = ref({
  direction: '',
  subjects: [],
  sports: [],
  timeBlocks: [],
  birth_date: '',
  gender: 'male',
  height_cm: null,
  weight_kg: null,
  activity_level: 'moderate',
  goal: '',
  challenge_duration: 90,
})

// ── Statik ma'lumotlar ──────────────────────────────────
const directions = {
  it:          { icon: '💻', text: 'IT / Dasturlash' },
  medicine:    { icon: '🩺', text: 'Tibbiyot' },
  law:         { icon: '⚖️', text: 'Huquq' },
  business:    { icon: '📈', text: 'Biznes' },
  art:         { icon: '🎨', text: 'San\'at' },
  engineering: { icon: '⚙️', text: 'Muhandislik' },
  education:   { icon: '📖', text: 'Ta\'lim' },
  other:       { icon: '🌟', text: 'Boshqa' },
}

const activityLevels = {
  low:       { icon: '🧘', name: 'Past',    desc: 'Asosan o\'tirish' },
  moderate:  { icon: '🚶', name: 'O\'rta',  desc: 'Kundalik yurish' },
  high:      { icon: '🏃', name: 'Yuqori',  desc: 'Haftada 3-5 sport' },
  very_high: { icon: '🏋️', name: 'Intensiv', desc: 'Har kun sport' },
}

const subjects = [
  { key: 'math', icon: '📐', label: 'Matematika' },
  { key: 'physics', icon: '⚡', label: 'Fizika' },
  { key: 'chemistry', icon: '🧪', label: 'Kimyo' },
  { key: 'biology', icon: '🧬', label: 'Biologiya' },
  { key: 'history', icon: '📜', label: 'Tarix' },
  { key: 'english', icon: '🌐', label: 'Ingliz tili' },
  { key: 'uzbek', icon: '🇺🇿', label: 'Ona tili' },
  { key: 'programming', icon: '💻', label: 'Dasturlash' },
  { key: 'economics', icon: '📊', label: 'Iqtisodiyot' },
  { key: 'geography', icon: '🗺️', label: 'Geografiya' },
]

const goalExamples = [
  '4 oyda dasturchi bo\'lish',
  'Ingliz tilini o\'rganish',
  'IELTS 7.0 olish',
  '10 kg ozish',
  'Biznes ochish',
]

const dayNames = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']

const timeOptions = []
for (let h = 5; h <= 23; h++) {
  for (const m of ['00', '30']) {
    timeOptions.push(`${String(h).padStart(2, '0')}:${m}`)
  }
}

// ── Computed ────────────────────────────────────────────
const today = new Date()
const maxBirthDate = `${today.getFullYear() - 10}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
const minBirthDate = `${today.getFullYear() - 100}-01-01`

const calculatedAge = computed(() => {
  if (!form.value.birth_date) return null
  const birth = new Date(form.value.birth_date)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age > 0 ? age : null
})

const birthYear = computed(() => {
  if (!form.value.birth_date) return null
  return new Date(form.value.birth_date).getFullYear()
})

const bmi = computed(() => {
  const { height_cm: h, weight_kg: w } = form.value
  if (!h || !w) return null
  return (w / ((h / 100) ** 2)).toFixed(1)
})

const bmiStatus = computed(() => {
  const b = parseFloat(bmi.value)
  if (!b) return null
  if (b < 18.5) return '🔵 Kam vazn'
  if (b < 25)   return '🟢 Normal'
  if (b < 30)   return '🟡 Ortiqcha'
  return '🔴 Semiz'
})

const bmiColor = computed(() => {
  const b = parseFloat(bmi.value)
  if (!b) return '#6b7280'
  if (b < 18.5) return '#3b82f6'
  if (b < 25)   return '#10b981'
  if (b < 30)   return '#f59e0b'
  return '#ef4444'
})

const bmiPercent = computed(() => {
  const b = parseFloat(bmi.value)
  if (!b) return 0
  return Math.min(100, Math.max(0, ((b - 10) / 30) * 100))
})

const calorieEstimate = computed(() => {
  if (!form.value.height_cm || !form.value.weight_kg || !birthYear.value) return null
  return nutrition.calcDailyCalories({
    height_cm: form.value.height_cm,
    weight_kg: form.value.weight_kg,
    birth_year: birthYear.value,
    gender: form.value.gender,
    activity_level: form.value.activity_level,
  })
})

const macros = computed(() => {
  if (!calorieEstimate.value) return {}
  return nutrition.getMacroRecommendation(calorieEstimate.value, 'maintain')
})

const canProceed = computed(() => {
  if (step.value === 1) return !!form.value.direction
  return true
})

// ── Methods ─────────────────────────────────────────────
function toggleArr(arr, val) {
  const i = arr.indexOf(val)
  if (i === -1) arr.push(val)
  else arr.splice(i, 1)
}

function addBlock() {
  form.value.timeBlocks.push({ title: '', days: [], start: '09:00', end: '11:00' })
}

function goNext() {
  if (!canProceed.value) return
  transDir.value = 'slide-left'
  step.value++
}

function goBack() {
  transDir.value = 'slide-right'
  step.value--
}

async function finish() {
  if (!form.value.goal) return
  saving.value = true
  try {
    const startDate = new Date()
    const endDate   = new Date()
    endDate.setDate(endDate.getDate() + form.value.challenge_duration)

    const { error } = await supabase
      .from('profiles')
      .update({
        onboarding_done:    true,
        direction:          form.value.direction,
        subjects:           form.value.subjects,
        sports:             form.value.sports,
        goal:               form.value.goal,
        challenge_start:    startDate.toISOString().split('T')[0],
        challenge_end:      endDate.toISOString().split('T')[0],
        challenge_duration: form.value.challenge_duration,
        birth_year:         birthYear.value,
        gender:             form.value.gender,
        height_cm:          form.value.height_cm,
        weight_kg:          form.value.weight_kg,
        activity_level:     form.value.activity_level,
        updated_at:         new Date().toISOString(),
      })
      .eq('id', auth.user?.id)

    if (error) throw error

    if (form.value.timeBlocks.length) {
      const valid = form.value.timeBlocks.filter(b => b.title)
      if (valid.length) {
        await supabase.from('time_blocks')
          .insert(valid.map(b => ({ user_id: auth.user?.id, ...b })))
          .catch(() => {})
      }
    }

    await auth.fetchProfile()
    router.push('/today')
  } catch (e) {
    console.error('finish error:', e)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
/* ── Wrap & Background ─────────────────────────── */
.ob-wrap {
  min-height: 100vh; background: var(--bg);
  display: flex; align-items: center; justify-content: center;
  padding: 20px 16px; position: relative; overflow: hidden;
}
.ob-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.ob-orb {
  position: absolute; border-radius: 50%; filter: blur(80px);
  animation: float 8s ease-in-out infinite;
}
.ob-orb1 { width: 400px; height: 400px; background: rgba(108,99,255,0.18); top: -100px; right: -80px; animation-delay: 0s; }
.ob-orb2 { width: 300px; height: 300px; background: rgba(0,212,170,0.12); bottom: -60px; left: -60px; animation-delay: -3s; }
.ob-orb3 { width: 200px; height: 200px; background: rgba(245,158,11,0.1); top: 50%; left: 30%; animation-delay: -6s; }

/* ── Shell ─────────────────────────────────────── */
.ob-shell {
  width: 100%; max-width: 520px; position: relative; z-index: 1;
}

/* ── Header ────────────────────────────────────── */
.ob-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 28px; gap: 16px;
}
.ob-logo { display: flex; align-items: center; gap: 8px; }
.ob-logo-mark {
  width: 32px; height: 32px; border-radius: 9px;
  background: linear-gradient(135deg, var(--accent), #00d4aa);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-weight: 900; font-size: 13px; color: white;
}
.ob-logo-name { font-family: var(--font-display); font-weight: 800; font-size: 16px; color: var(--text); }

.ob-progress-wrap { display: flex; align-items: center; gap: 10px; flex: 1; justify-content: flex-end; }
.ob-progress-bar {
  flex: 1; max-width: 200px; height: 6px; border-radius: 3px;
  background: var(--surface2); overflow: hidden;
}
.ob-progress-fill {
  height: 100%; border-radius: 3px;
  background: linear-gradient(90deg, var(--accent), #00d4aa);
  transition: width 0.4s var(--ease-spring);
}
.ob-step-counter {
  font-family: var(--font-mono); font-size: 14px; font-weight: 700; color: var(--text);
}
.ob-step-total { color: var(--text-dim); font-weight: 400; }

/* ── Panel ─────────────────────────────────────── */
.ob-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 28px;
  box-shadow: var(--shadow-lg);
}
@media (max-width: 480px) { .ob-panel { padding: 20px 16px; } }

.ob-panel-head { text-align: center; margin-bottom: 24px; }
.ob-step-icon {
  font-size: 40px; margin-bottom: 12px;
  display: block; animation: bounceIn 0.4s var(--ease-spring);
}
.ob-title {
  font-family: var(--font-display); font-weight: 800; font-size: 22px;
  line-height: 1.25; margin-bottom: 8px; color: var(--text);
}
@media (max-width: 480px) { .ob-title { font-size: 18px; } }
.ob-title-accent {
  background: linear-gradient(135deg, var(--accent-light), #00d4aa);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.ob-sub { font-size: 14px; color: var(--text-dim); line-height: 1.5; }

/* ── Direction grid ────────────────────────────── */
.dir-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
}
@media (min-width: 400px) { .dir-grid { grid-template-columns: repeat(4, 1fr); } }

.dir-card {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 16px 8px; border-radius: 14px; gap: 6px;
  border: 1.5px solid var(--border);
  background: var(--surface2); cursor: pointer;
  transition: all 0.2s var(--ease-out); position: relative;
  font-family: var(--font-body); color: var(--text);
}
.dir-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: var(--shadow); }
.dir-card.active {
  border-color: var(--accent); background: rgba(108,99,255,0.1);
  box-shadow: 0 0 0 1px var(--accent), var(--shadow);
}
.dir-icon { font-size: 26px; }
.dir-label { font-size: 11px; font-weight: 600; text-align: center; line-height: 1.3; }
.dir-check {
  position: absolute; top: 6px; right: 8px;
  font-size: 11px; color: var(--accent-light); font-weight: 700;
}

/* ── Chip grid ─────────────────────────────────── */
.chip-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.ob-chip {
  padding: 9px 16px; border-radius: 20px;
  border: 1.5px solid var(--border);
  background: var(--surface2); cursor: pointer;
  font-family: var(--font-body); font-size: 13px; font-weight: 600;
  color: var(--text); transition: all 0.18s;
  display: flex; align-items: center; gap: 6px;
}
.ob-chip:hover { border-color: var(--accent); background: var(--surface3); }
.ob-chip.active {
  border-color: var(--accent); background: rgba(108,99,255,0.15);
  color: var(--accent-light); box-shadow: 0 0 0 1px rgba(108,99,255,0.2);
}
.ob-selected-hint {
  margin-top: 12px; font-size: 13px; color: var(--success); font-weight: 600;
  text-align: center;
}

/* ── Time blocks ───────────────────────────────── */
.time-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 12px; }
.time-card {
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 14px; padding: 14px; display: flex; flex-direction: column; gap: 10px;
}
.time-card-header { display: flex; gap: 8px; align-items: center; }
.time-del-btn {
  width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
  border: none; background: rgba(239,68,68,0.1); color: #ef4444;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.18s;
}
.time-del-btn:hover { background: rgba(239,68,68,0.2); }

.day-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.day-chip {
  width: 34px; height: 34px; border-radius: 10px; border: 1.5px solid var(--border);
  background: var(--surface); color: var(--text-dim); font-size: 11px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.day-chip.active { background: var(--accent); border-color: var(--accent); color: white; }

.time-range { display: flex; align-items: flex-end; gap: 8px; }
.time-field { flex: 1; }
.time-range-sep { color: var(--text-dim); font-size: 16px; padding-bottom: 6px; flex-shrink: 0; }

.ob-add-btn {
  width: 100%; padding: 14px;
  border: 1.5px dashed var(--border2);
  border-radius: 14px; background: transparent;
  color: var(--text-dim); font-family: var(--font-body); font-size: 14px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all 0.2s;
}
.ob-add-btn:hover { border-color: var(--accent); color: var(--accent-light); background: rgba(108,99,255,0.05); }
.ob-add-icon { font-size: 18px; }
.ob-skip-hint { text-align: center; font-size: 13px; color: var(--text-dim); margin-top: 12px; }

/* ── Health form ───────────────────────────────── */
.ob-form-group { margin-bottom: 18px; }
.ob-label { font-size: 12px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.06em; display: block; margin-bottom: 8px; }
.ob-input {
  width: 100%; padding: 12px 14px; border-radius: 12px;
  border: 1.5px solid var(--border2);
  background: var(--surface2); color: var(--text);
  font-family: var(--font-body); font-size: 15px;
  transition: border-color 0.18s; box-sizing: border-box;
}
.ob-input:focus { outline: none; border-color: var(--accent); background: var(--surface3); }
.ob-input::-webkit-calendar-picker-indicator { filter: invert(0.5); }
.ob-select {
  width: 100%; padding: 10px 12px; border-radius: 10px;
  border: 1.5px solid var(--border2); background: var(--surface2); color: var(--text);
  font-family: var(--font-body); font-size: 14px;
  transition: border-color 0.18s;
}
.ob-select:focus { outline: none; border-color: var(--accent); }

.ob-twin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.ob-input-unit { position: relative; }
.ob-input-unit .ob-input { padding-right: 40px; }
.ob-unit {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  font-size: 12px; font-weight: 700; color: var(--text-dim);
}

.ob-age-pill {
  margin-top: 8px; display: inline-flex; align-items: center;
  padding: 6px 14px; border-radius: 20px;
  background: rgba(108,99,255,0.12); border: 1px solid rgba(108,99,255,0.25);
  color: var(--accent-light); font-size: 13px; font-weight: 600;
}

.gender-row { display: flex; gap: 10px; }
.gender-btn {
  flex: 1; padding: 12px; border-radius: 12px;
  border: 1.5px solid var(--border2); background: var(--surface2);
  color: var(--text); cursor: pointer; font-family: var(--font-body); font-size: 14px; font-weight: 600;
  transition: all 0.18s; display: flex; align-items: center; justify-content: center; gap: 8px;
}
.gender-btn.active { border-color: var(--accent); background: rgba(108,99,255,0.12); color: var(--accent-light); }
.gender-icon { font-size: 20px; }

.ob-bmi-card {
  display: flex; align-items: center; gap: 16px;
  padding: 14px 16px; border-radius: 14px;
  background: var(--surface2); border: 1px solid var(--border);
  margin-bottom: 18px;
}
.ob-bmi-val { font-family: var(--font-display); font-weight: 800; font-size: 32px; color: var(--accent-light); }
.ob-bmi-sub { font-size: 11px; color: var(--text-dim); }
.ob-bmi-divider { width: 1px; height: 48px; background: var(--border); flex-shrink: 0; }
.ob-bmi-right { flex: 1; }
.ob-bmi-status { font-weight: 700; font-size: 15px; margin-bottom: 8px; }
.ob-bmi-bar { height: 5px; border-radius: 3px; background: var(--border); overflow: hidden; }
.ob-bmi-fill { height: 100%; border-radius: 3px; transition: width 0.4s, background 0.3s; }

.activity-grid { display: flex; flex-direction: column; gap: 8px; }
.activity-btn {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: 12px;
  border: 1.5px solid var(--border2); background: var(--surface2);
  cursor: pointer; text-align: left; transition: all 0.18s;
  font-family: var(--font-body); color: var(--text);
}
.activity-btn:hover { border-color: var(--border3); background: var(--surface3); }
.activity-btn.active { border-color: var(--accent); background: rgba(108,99,255,0.1); }
.activity-icon { font-size: 22px; flex-shrink: 0; }
.activity-name { font-weight: 700; font-size: 14px; }
.activity-desc { font-size: 12px; color: var(--text-dim); margin-top: 2px; }

.ob-calorie-card {
  background: linear-gradient(135deg, rgba(108,99,255,0.1), rgba(0,212,170,0.07));
  border: 1px solid rgba(108,99,255,0.25);
  border-radius: 14px; padding: 16px; margin-top: 4px;
}
.ob-cal-header { font-size: 12px; color: var(--text-dim); margin-bottom: 6px; }
.ob-cal-val {
  font-family: var(--font-display); font-weight: 800; font-size: 34px; color: var(--accent-light);
}
.ob-cal-val span { font-size: 16px; color: var(--text-dim); font-weight: 400; }
.ob-cal-macros { display: flex; gap: 14px; margin-top: 10px; flex-wrap: wrap; }
.ob-cal-macro { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-dim); }
.ob-cal-macro-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

/* ── Goal step ─────────────────────────────────── */
.goal-examples { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.goal-example-chip {
  padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;
  border: 1px solid var(--border2); background: var(--surface2); color: var(--text-dim);
  cursor: pointer; transition: all 0.15s;
}
.goal-example-chip:hover { border-color: var(--accent); color: var(--accent-light); background: rgba(108,99,255,0.08); }

.ob-textarea {
  width: 100%; padding: 14px; border-radius: 14px;
  border: 1.5px solid var(--border2); background: var(--surface2); color: var(--text);
  font-family: var(--font-body); font-size: 15px; line-height: 1.6;
  resize: vertical; min-height: 90px; box-sizing: border-box;
  transition: border-color 0.18s;
}
.ob-textarea:focus { outline: none; border-color: var(--accent); background: var(--surface3); }

.dur-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.dur-card {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 14px 8px; border-radius: 14px;
  border: 1.5px solid var(--border2); background: var(--surface2);
  cursor: pointer; transition: all 0.2s; position: relative;
  font-family: var(--font-body);
}
.dur-card:hover { border-color: var(--accent); transform: translateY(-2px); }
.dur-card.active { border-color: var(--accent); background: rgba(108,99,255,0.12); }
.dur-days { font-family: var(--font-mono); font-size: 22px; font-weight: 800; color: var(--text); }
.dur-kun { font-size: 11px; color: var(--text-dim); font-weight: 600; }
.dur-badge {
  position: absolute; top: -8px; left: 50%; transform: translateX(-50%);
  font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 6px; white-space: nowrap;
  background: linear-gradient(90deg, var(--accent), #00d4aa); color: white;
}

/* ── Summary ───────────────────────────────────── */
.ob-summary {
  margin-top: 20px; padding: 16px; border-radius: 14px;
  background: var(--surface2); border: 1px solid var(--border);
}
.ob-summary-title { font-weight: 700; font-size: 14px; margin-bottom: 12px; color: var(--text); }
.ob-summary-grid { display: flex; flex-direction: column; gap: 8px; }
.ob-sum-item { display: flex; justify-content: space-between; align-items: center; }
.ob-sum-label { font-size: 13px; color: var(--text-dim); }
.ob-sum-val { font-size: 13px; font-weight: 600; color: var(--text); }

/* ── Navigation ────────────────────────────────── */
.ob-nav {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 20px; gap: 12px;
}
.ob-back-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 12px 18px; border-radius: 12px;
  border: 1.5px solid var(--border2); background: var(--surface2);
  color: var(--text-dim); font-family: var(--font-body); font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.18s;
}
.ob-back-btn:hover { border-color: var(--border3); color: var(--text); }

.ob-next-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 12px 24px; border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, var(--accent), #5b52ff);
  color: white; font-family: var(--font-body); font-size: 14px; font-weight: 700;
  cursor: pointer; transition: all 0.2s var(--ease-spring);
  box-shadow: 0 4px 16px rgba(108,99,255,0.35);
}
.ob-next-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(108,99,255,0.45); }
.ob-next-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

.ob-finish-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 13px 28px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white; font-family: var(--font-body); font-size: 15px; font-weight: 700;
  cursor: pointer; transition: all 0.2s var(--ease-spring);
  box-shadow: 0 4px 16px rgba(16,185,129,0.4);
}
.ob-finish-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(16,185,129,0.5); }
.ob-finish-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.ob-spinner {
  width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.35);
  border-top-color: white; border-radius: 50%;
  animation: spin 0.7s linear infinite; display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Step transitions ──────────────────────────── */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.28s var(--ease-out);
}
.slide-left-enter-from  { opacity: 0; transform: translateX(40px); }
.slide-left-leave-to    { opacity: 0; transform: translateX(-30px); }
.slide-right-enter-from { opacity: 0; transform: translateX(-40px); }
.slide-right-leave-to   { opacity: 0; transform: translateX(30px); }
</style>
