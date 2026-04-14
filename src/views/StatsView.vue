<template>
  <div class="page">
    <div class="page-header"><h1>{{ t('nav.stats') }}</h1></div>

    <div class="stats-grid">
      <div class="stat-card" v-for="s in mainStats" :key="s.label">
        <div class="sc-icon">{{ s.icon }}</div>
        <div class="sc-val" :style="{ color: s.color }">{{ s.value }}</div>
        <div class="sc-label">{{ s.label }}</div>
      </div>
    </div>

    <div class="card level-card">
      <div class="level-badge" :style="{ background: currentLevel.color }">{{ currentLevel.icon }}</div>
      <div class="level-info">
        <div class="level-name">{{ currentLevel.name }}</div>
        <div class="level-desc">{{ currentLevel.desc }}</div>
        <div class="level-bar"><div class="level-fill" :style="{ width: levelPct + '%', background: currentLevel.color }"></div></div>
        <div class="level-next">Keyingi: {{ nextLevel.name }} ({{ pointsToNext }} pt qoldi)</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🏁 Challenge: {{ challengeDaysPassed }}/{{ auth.profile?.challenge_duration || 90 }} kun</div>
      <div class="challenge-bar-wrap">
        <div class="ch-bar"><div class="ch-fill" :style="{ width: challengePct + '%' }"></div></div>
        <span class="ch-pct">{{ challengePct }}%</span>
      </div>
      <div class="ch-info">
        <span>Boshlanish: {{ auth.profile?.challenge_start || '—' }}</span>
        <span>Tugash: {{ auth.profile?.challenge_end || '—' }}</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title">📈 So'nggi 7 kun</div>
      <div class="week-chart">
        <div v-for="(day, i) in last7" :key="i" class="wc-col">
          <div class="wc-pct">{{ tasks.getDayCompletion(ds(day)) }}%</div>
          <div class="wc-bar-wrap">
            <div class="wc-bar" :style="{ height: Math.max(4, tasks.getDayCompletion(ds(day))) + '%', background: barColor(day) }"></div>
          </div>
          <div class="wc-day" :class="{ today: isToday(day) }">{{ dayShort(day) }}</div>
        </div>
      </div>
    </div>

    <div class="card quote-card">
      <div class="quote-text">"{{ quote }}"</div>
      <button class="btn btn-outline btn-sm" @click="nextQuote">Yangi hikmat ✨</button>
    </div>

    <div style="height:20px"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth.js'
import { useTasksStore } from '../stores/tasks.js'

const { t } = useI18n()
const auth = useAuthStore()
const tasks = useTasksStore()

const today = new Date()
function ds(d) { return d.toISOString().split('T')[0] }
function isToday(d) { return d.toDateString() === today.toDateString() }
function dayShort(d) { return ['Ya','Du','Se','Ch','Pa','Ju','Sh'][d.getDay()] }
function barColor(d) {
  const p = tasks.getDayCompletion(ds(d))
  if (p >= 80) return '#00d4aa'; if (p >= 50) return '#f59e0b'; if (p > 0) return '#6c63ff'; return 'var(--surface3)'
}

const last7 = computed(() => Array.from({length:7},(_,i)=>{ const d=new Date(today); d.setDate(d.getDate()-6+i); return d }))

const LEVELS = [
  { name: "Boshlang'ich", icon: '🌱', color: '#6b7280', desc: 'Sayohat boshlandi', min: 0 },
  { name: 'Harakatchi',   icon: '⚡', color: '#3b82f6', desc: 'Ritm topilmoqda', min: 300 },
  { name: 'Intizomli',    icon: '🔥', color: '#f59e0b', desc: 'Odatlar shakllanmoqda', min: 1000 },
  { name: 'Mard',         icon: '💎', color: '#8b5cf6', desc: 'Kuchli intizom', min: 3000 },
  { name: 'Champion',     icon: '🏆', color: '#f0c040', desc: "Haqiqiy g'olib!", min: 7000 },
]

const totalPts = computed(() => tasks.getTotalPoints())
const currentLevel = computed(() => { let l=LEVELS[0]; LEVELS.forEach(lvl => { if(totalPts.value >= lvl.min) l=lvl }); return l })
const nextLevel = computed(() => { const i=LEVELS.indexOf(currentLevel.value); return LEVELS[Math.min(i+1, LEVELS.length-1)] })
const levelPct = computed(() => { const c=currentLevel.value.min, n=nextLevel.value.min; if(c===n) return 100; return Math.min(100,Math.round(((totalPts.value-c)/(n-c))*100)) })
const pointsToNext = computed(() => Math.max(0, nextLevel.value.min - totalPts.value))

const challengeDaysPassed = computed(() => {
  const start = auth.profile?.challenge_start
  if (!start) return 0
  return Math.max(0, Math.floor((today - new Date(start)) / 86400000))
})
const challengePct = computed(() => {
  const dur = auth.profile?.challenge_duration || 90
  return Math.min(100, Math.round((challengeDaysPassed.value / dur) * 100))
})

const mainStats = computed(() => [
  { icon: '⚡', label: 'Jami ball', value: totalPts.value, color: '#6c63ff' },
  { icon: '📅', label: 'Challenge kuni', value: challengeDaysPassed.value, color: '#f59e0b' },
  { icon: '🏆', label: 'Daraja', value: currentLevel.value.icon + ' ' + currentLevel.value.name, color: currentLevel.value.color },
  { icon: '✅', label: 'Bugun', value: tasks.getDayCompletion(ds(today)) + '%', color: '#00d4aa' },
])

const quotes = [
  "Har kuni bir qadam olg'a yurganlar, oxirida manzilga yetadi.",
  'Intizom — ozodlikdir.',
  'Bugun qilinmagan ish, ertaga yukka aylanadi.',
  "O'zingni engish — dunyoni engishdan katta!",
  "Muvaffaqiyat kichik g'alabalar yig'indisidir.",
  "Qiyinchilik — o'sishning belgisi.",
  "Siz bugungi harakatingiz bilan ertangi o'zingizni yaratmoqdasiz.",
]
const qIdx = ref(0)
const quote = computed(() => quotes[qIdx.value])
function nextQuote() { qIdx.value = (qIdx.value + 1) % quotes.length }

onMounted(async () => {
  await tasks.fetchTasks()
  for (const d of last7.value) await tasks.fetchCompletions(ds(d))
})
</script>

<style scoped>
.page { padding: 20px 16px; max-width: 700px; margin: 0 auto; }
@media(min-width:768px){ .page { padding: 32px 40px; max-width: 860px; } }
.page-header { margin-bottom: 24px; }
.page-header h1 { font-family: var(--font-display); font-weight: 800; font-size: 24px; }

.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px; }
@media(min-width:768px){ .stats-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; } }
.stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px 12px; text-align: center; box-shadow: var(--shadow-sm); }
.sc-icon { font-size: 22px; margin-bottom: 6px; }
.sc-val { font-family: var(--font-display); font-weight: 800; font-size: 18px; word-break: break-word; }
.sc-label { font-size: 11px; color: var(--text-dim); margin-top: 4px; }

.level-card { display: flex; align-items: center; gap: 14px; }
.level-badge { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
.level-info { flex: 1; min-width: 0; }
.level-name { font-family: var(--font-display); font-weight: 700; font-size: 16px; }
.level-desc { font-size: 12px; color: var(--text-dim); margin-bottom: 8px; }
.level-bar { height: 6px; background: var(--surface2); border-radius: 3px; overflow: hidden; margin-bottom: 4px; }
.level-fill { height: 100%; border-radius: 3px; transition: width 0.6s; }
.level-next { font-size: 11px; color: var(--text-dim); font-family: var(--font-mono); }

.challenge-bar-wrap { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.ch-bar { flex: 1; height: 8px; background: var(--surface2); border-radius: 4px; overflow: hidden; }
.ch-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent2)); border-radius: 4px; transition: width 0.5s; }
.ch-pct { font-family: var(--font-mono); font-size: 13px; color: var(--accent-light); flex-shrink: 0; }
.ch-info { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-dim); font-family: var(--font-mono); flex-wrap: wrap; gap: 4px; }

.week-chart { display: flex; gap: 6px; height: 120px; align-items: flex-end; }
.wc-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; min-width: 0; }
.wc-pct { font-family: var(--font-mono); font-size: 9px; color: var(--text-dim); margin-bottom: 3px; }
.wc-bar-wrap { flex: 1; width: 100%; background: var(--surface2); border-radius: 4px; overflow: hidden; display: flex; align-items: flex-end; }
.wc-bar { width: 100%; border-radius: 4px; transition: height 0.5s; }
.wc-day { font-family: var(--font-mono); font-size: 10px; color: var(--text-dim); margin-top: 5px; }
.wc-day.today { color: var(--accent-light); font-weight: 700; }

.quote-card { text-align: center; }
.quote-text { font-size: 14px; font-style: italic; line-height: 1.6; margin-bottom: 16px; color: var(--text-dim); }
</style>
