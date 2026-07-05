<template>
  <div class="page">
    <div class="stats-page-header">
      <h1>{{ t('nav.stats') }}</h1>
      <button class="share-btn" :disabled="sharing" @click="doShare">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        {{ sharing ? '...' : 'Ulashish' }}
      </button>
    </div>

    <div class="stats-grid">
      <div class="stat-card" v-for="s in mainStats" :key="s.label">
        <div class="sc-icon">{{ s.icon }}</div>
        <div class="sc-val" :style="{ color: s.color }">{{ s.value }}</div>
        <div class="sc-label">{{ s.label }}</div>
      </div>
    </div>

    <!-- ── Streak card ── -->
    <div class="card streak-card">
      <div class="streak-flame" :class="{ ablaze: streak.current >= 3 }">{{ streakInfo.emoji }}</div>
      <div class="streak-body">
        <div class="streak-current">
          <span class="streak-num" :style="{ color: streakInfo.color }">{{ streak.current }}</span>
          <span class="streak-unit">kun ketma-ket</span>
        </div>
        <div class="streak-meta">
          <span class="streak-tier" :style="{ color: streakInfo.color, background: streakInfo.color + '18' }">{{ streakInfo.label }}</span>
          <span class="streak-best">🏆 Rekord: {{ streak.longest }} kun</span>
        </div>
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
      <div class="card-title"> So'nggi 7 kun</div>
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
import { getStreak, streakTier } from '../utils/streak.js'
import { shareReport } from '../utils/share.js'

const { t } = useI18n()
const auth = useAuthStore()
const tasks = useTasksStore()

const streak = ref({ current: 0, longest: 0 })
const streakInfo = computed(() => streakTier(streak.value.current))

const sharing = ref(false)
async function doShare() {
  sharing.value = true
  try {
    const weekPct = Math.round(last7.value.reduce((s, d) => s + tasks.getDayCompletion(ds(d)), 0) / 7)
    await shareReport({
      name: auth.profile?.full_name?.split(' ')[0] || 'Men',
      streak: streak.value.current,
      weekPct,
      points: totalPts.value,
      level: currentLevel.value.name,
      days: last7.value.map(d => ({ label: dayShort(d), pct: tasks.getDayCompletion(ds(d)) })),
    })
  } catch (e) { console.error(e) }
  finally { sharing.value = false }
}

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
  { name: 'Intizomli',    icon: '', color: '#f59e0b', desc: 'Odatlar shakllanmoqda', min: 1000 },
  { name: 'Mard',         icon: '💎', color: '#8b5cf6', desc: 'Kuchli intizom', min: 3000 },
  { name: 'Champion',     icon: '', color: '#f0c040', desc: "Haqiqiy g'olib!", min: 7000 },
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
  { icon: '', label: 'Daraja', value: currentLevel.value.icon + ' ' + currentLevel.value.name, color: currentLevel.value.color },
  { icon: '✓', label: 'Bugun', value: tasks.getDayCompletion(ds(today)) + '%', color: '#00d4aa' },
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
  if (auth.user?.id) streak.value = await getStreak(auth.user.id)
})
</script>

<style scoped>
.page { padding: 16px; max-width: 700px; margin: 0 auto; }
@media(min-width:768px){ .page { padding: 28px 40px; max-width: 860px; } }
.stats-page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.stats-page-header h1 {
  font-family: var(--font-display); font-weight: 800; font-size: 26px;
  background: linear-gradient(135deg, var(--text) 0%, var(--text-dim) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.share-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 16px; border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--accent), #8b5cf6);
  color: white; border: none; cursor: pointer;
  font-family: var(--font-body); font-size: 13px; font-weight: 600;
  box-shadow: 0 4px 14px rgba(108,99,255,0.3);
  transition: all 0.2s var(--ease-out);
}
.share-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(108,99,255,0.45); }
.share-btn:disabled { opacity: 0.6; cursor: default; }

/* ── Stat cards ── */
.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px; }
@media(min-width:768px){ .stats-grid { grid-template-columns: repeat(4, 1fr); gap: 14px; } }

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px 12px;
  text-align: center;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s var(--ease-spring), box-shadow 0.2s;
  animation: fadeUp 0.4s var(--ease-out) both;
  position: relative;
  overflow: hidden;
}
.stat-card::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity: 0;
  transition: opacity 0.2s;
}
.stat-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
.stat-card:hover::after { opacity: 1; }

.sc-icon { font-size: 24px; margin-bottom: 8px; display: block; animation: float 3s ease-in-out infinite; }
.stat-card:nth-child(1) .sc-icon { animation-delay: 0s; }
.stat-card:nth-child(2) .sc-icon { animation-delay: 0.5s; }
.stat-card:nth-child(3) .sc-icon { animation-delay: 1s; }
.stat-card:nth-child(4) .sc-icon { animation-delay: 1.5s; }
.sc-val {
  font-family: var(--font-display); font-weight: 800; font-size: 20px;
  word-break: break-word; animation: countUp 0.6s var(--ease-spring) both;
}
.sc-label { font-size: 11px; color: var(--text-dim); margin-top: 5px; font-weight: 500; }

/* ── Streak card ── */
.streak-card {
  display: flex; align-items: center; gap: 16px;
  background: linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.03));
  border: 1px solid rgba(245,158,11,0.18);
}
.streak-flame { font-size: 40px; line-height: 1; flex-shrink: 0; }
.streak-flame.ablaze { animation: flameFlicker 1.2s ease-in-out infinite; }
.streak-body { flex: 1; }
.streak-current { display: flex; align-items: baseline; gap: 8px; }
.streak-num { font-family: var(--font-display); font-weight: 800; font-size: 32px; line-height: 1; }
.streak-unit { font-size: 13px; color: var(--text-dim); }
.streak-meta { display: flex; align-items: center; gap: 12px; margin-top: 8px; flex-wrap: wrap; }
.streak-tier { font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 8px; }
.streak-best { font-size: 12px; color: var(--text-dim); font-family: var(--font-mono); }
@keyframes flameFlicker {
  0%, 100% { transform: scale(1) rotate(-3deg); filter: drop-shadow(0 0 4px rgba(245,158,11,0.5)); }
  50%       { transform: scale(1.12) rotate(3deg); filter: drop-shadow(0 0 10px rgba(239,68,68,0.7)); }
}

/* ── Level card ── */
.level-card {
  display: flex; align-items: center; gap: 16px;
  background: linear-gradient(135deg, rgba(108,99,255,0.04), transparent);
}
.level-badge {
  width: 56px; height: 56px; border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  font-size: 26px; flex-shrink: 0;
  animation: float 3s ease-in-out infinite;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
}
.level-info { flex: 1; min-width: 0; }
.level-name { font-family: var(--font-display); font-weight: 700; font-size: 17px; margin-bottom: 2px; }
.level-desc { font-size: 12px; color: var(--text-dim); margin-bottom: 10px; }
.level-bar {
  height: 7px; background: var(--surface3); border-radius: 10px;
  overflow: hidden; margin-bottom: 5px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
}
.level-fill {
  height: 100%; border-radius: 10px;
  transition: width 1s var(--ease-out);
  animation: progressFill 1.2s var(--ease-out) both;
  box-shadow: 0 0 8px currentColor;
}
.level-next { font-size: 11px; color: var(--text-dim); font-family: var(--font-mono); }

/* ── Challenge bar ── */
.challenge-bar-wrap { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.ch-bar {
  flex: 1; height: 10px; background: var(--surface3);
  border-radius: 10px; overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
}
.ch-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent2));
  border-radius: 10px;
  transition: width 1s var(--ease-out);
  animation: progressFill 1.2s var(--ease-out) both;
  box-shadow: 0 0 12px rgba(108,99,255,0.4);
}
.ch-pct {
  font-family: var(--font-mono); font-size: 13px;
  color: var(--accent-light); flex-shrink: 0; font-weight: 700;
}
.ch-info {
  display: flex; justify-content: space-between;
  font-size: 11px; color: var(--text-dim); font-family: var(--font-mono);
  flex-wrap: wrap; gap: 4px;
}

/* ── Week chart ── */
.week-chart { display: flex; gap: 8px; height: 140px; align-items: flex-end; padding-top: 10px; }
.wc-col {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; height: 100%; min-width: 0;
}
.wc-pct { font-family: var(--font-mono); font-size: 9px; color: var(--text-dim); margin-bottom: 4px; font-weight: 700; }
.wc-bar-wrap {
  flex: 1; width: 100%; background: var(--surface2);
  border-radius: 6px; overflow: hidden; display: flex; align-items: flex-end;
  border: 1px solid var(--border);
}
.wc-bar {
  width: 100%; border-radius: 5px;
  transition: height 0.8s var(--ease-spring);
  animation: progressFill 1s var(--ease-out) both;
}
.wc-day { font-family: var(--font-mono); font-size: 10px; color: var(--text-dim); margin-top: 6px; }
.wc-day.today {
  color: var(--accent-light); font-weight: 700;
  background: rgba(108,99,255,0.1);
  border-radius: 4px; padding: 1px 3px;
}

/* ── Quote card ── */
.quote-card {
  text-align: center;
  background: linear-gradient(135deg, var(--surface), var(--surface2));
}
.quote-text {
  font-size: 15px; font-style: italic; line-height: 1.7;
  margin-bottom: 16px; color: var(--text-dim);
  position: relative; padding: 0 20px;
}
.quote-text::before { content: '"'; font-size: 40px; color: var(--accent); opacity: 0.3; position: absolute; top: -10px; left: 0; line-height: 1; font-style: normal; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-5px); }
}
@keyframes countUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes progressFill {
  from { width: 0 !important; }
}
</style>
