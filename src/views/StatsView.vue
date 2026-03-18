<template>
  <div class="stats-view">
    <!-- Overall Stats -->
    <div class="stats-grid">
      <div class="stat-card" v-for="s in mainStats" :key="s.label">
        <div class="sc-icon">{{ s.icon }}</div>
        <div class="sc-val" :style="{ color: s.color }">{{ s.value }}</div>
        <div class="sc-label">{{ s.label }}</div>
      </div>
    </div>

    <!-- Level -->
    <div class="card level-card">
      <div class="level-badge" :style="{ background: currentLevel.color }">
        {{ currentLevel.icon }}
      </div>
      <div class="level-info">
        <div class="level-name">{{ currentLevel.name }}</div>
        <div class="level-desc">{{ currentLevel.desc }}</div>
        <div class="level-bar">
          <div class="level-fill" :style="{ width: levelProgress + '%', background: currentLevel.color }"></div>
        </div>
        <div class="level-next">Keyingi: {{ nextLevel.name }} ({{ pointsToNext }} ball qoldi)</div>
      </div>
    </div>

    <!-- Category Progress -->
    <div class="card">
      <div class="card-title">📊 Kategoriya bo'yicha progress</div>
      <div class="cat-bars">
        <div v-for="(cat, key) in CATEGORIES" :key="key" class="cat-row">
          <div class="cat-row-label">
            <span>{{ catIcon(key) }} {{ cat.label }}</span>
            <span class="cat-pct" :style="{ color: cat.color }">{{ getCatCompletion(key) }}%</span>
          </div>
          <div class="cat-bar">
            <div class="cat-bar-fill" :style="{ width: getCatCompletion(key) + '%', background: cat.color }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly Chart -->
    <div class="card">
      <div class="card-title">📈 So'nggi 7 kun</div>
      <div class="week-chart">
        <div v-for="(day, i) in last7Days" :key="i" class="wc-col">
          <div class="wc-pct">{{ store.getDayCompletion(day) }}%</div>
          <div class="wc-bar-wrap">
            <div 
              class="wc-bar" 
              :style="{ 
                height: Math.max(4, store.getDayCompletion(day)) + '%',
                background: getBarColor(day)
              }"
            ></div>
          </div>
          <div class="wc-day" :class="{ today: isToday(day) }">{{ dayShort(day) }}</div>
        </div>
      </div>
    </div>

    <!-- Motivational Quote -->
    <div class="card quote-card">
      <div class="quote-text">"{{ currentQuote }}"</div>
      <button class="quote-btn" @click="nextQuote">Yangi hikmat</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useChallengeStore, DAILY_TASKS, CATEGORIES } from '../stores/challenge.js'

const store = useChallengeStore()

const LEVELS = [
  { name: 'Boshlang\'ich', icon: '🌱', color: '#6b7280', desc: 'Sayohat boshlandi', min: 0 },
  { name: 'Harakatchi', icon: '⚡', color: '#3b82f6', desc: 'Ritm topilmoqda', min: 500 },
  { name: 'Intizomli', icon: '🔥', color: '#f59e0b', desc: 'Odatlar shakllanmoqda', min: 2000 },
  { name: 'Mard', icon: '💎', color: '#8b5cf6', desc: 'Kuchli intizom', min: 5000 },
  { name: 'Champion', icon: '🏆', color: '#f0c040', desc: 'Haqiqiy g\'olib!', min: 10000 },
]

const currentLevel = computed(() => {
  const pts = store.totalPointsEarned
  let level = LEVELS[0]
  for (const l of LEVELS) {
    if (pts >= l.min) level = l
  }
  return level
})

const nextLevel = computed(() => {
  const idx = LEVELS.indexOf(currentLevel.value)
  return LEVELS[Math.min(idx + 1, LEVELS.length - 1)]
})

const levelProgress = computed(() => {
  const pts = store.totalPointsEarned
  const curr = currentLevel.value.min
  const next = nextLevel.value.min
  if (curr === next) return 100
  return Math.min(100, Math.round(((pts - curr) / (next - curr)) * 100))
})

const pointsToNext = computed(() => {
  return Math.max(0, nextLevel.value.min - store.totalPointsEarned)
})

const mainStats = computed(() => [
  { icon: '📅', label: 'Kunlar o\'tdi', value: store.daysPassed, color: '#f0c040' },
  { icon: '🔥', label: 'Ketma-ket kun', value: store.currentStreak, color: '#f59e0b' },
  { icon: '⚡', label: 'Jami ball', value: store.totalPointsEarned, color: '#40e0c0' },
  { icon: '📈', label: 'Umumiy progress', value: store.overallProgress + '%', color: '#8b5cf6' },
])

const today = new Date()

const last7Days = computed(() => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - 6 + i)
    return d
  })
})

function isToday(d) { return d.toDateString() === today.toDateString() }

function dayShort(d) {
  const days = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh']
  return days[d.getDay()]
}

function getBarColor(d) {
  const p = store.getDayCompletion(d)
  if (p >= 80) return '#40e0c0'
  if (p >= 50) return '#f0c040'
  if (p > 0) return '#e040b0'
  return '#374151'
}

function catIcon(cat) {
  const icons = { sleep: '🌙', sport: '💪', code: '💻', english: '🌍', uzbek: '📚', self: '🌟' }
  return icons[cat] || ''
}

function getCatCompletion(cat) {
  const tasks = DAILY_TASKS.filter(t => t.category === cat)
  const total = tasks.reduce((s, t) => s + t.points, 0)
  const maxPossible = total * store.daysPassed
  if (maxPossible === 0) return 0

  let earned = 0
  for (let i = 0; i < store.daysPassed; i++) {
    const d = new Date(store.CHALLENGE_START)
    d.setDate(d.getDate() + i)
    tasks.forEach(task => {
      if (store.isTaskDone(d, task.id)) earned += task.points
    })
  }
  return Math.round((earned / maxPossible) * 100)
}

const quotes = [
  'Har kuni bir qadam olg\'a yurganlar, oxirida manzilga yetadi.',
  'Intizom — ozodlikdir. Tartib — kuchdir.',
  'Bugun qilinmagan ish, ertaga yukka aylanadi.',
  'O\'zingni engish — dunyoni engishdan katta!',
  'Muvaffaqiyat — har kuni takrorlanuvchi kichik g\'alabalar yig\'indisidir.',
  'Qiyinchilik — o\'sishning belgisi.',
  'Uyqusiz kecha emas, intizomli tong muhim.',
  'Siz bugungi harakatingiz bilan ertangi o\'zingizni yaratmoqdasiz.',
]

const quoteIdx = ref(0)
const currentQuote = computed(() => quotes[quoteIdx.value])
function nextQuote() {
  quoteIdx.value = (quoteIdx.value + 1) % quotes.length
}
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
}

.sc-icon { font-size: 24px; margin-bottom: 8px; }
.sc-val {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 28px;
  line-height: 1;
  margin-bottom: 4px;
}
.sc-label {
  font-size: 12px;
  color: var(--text-dim);
}

/* LEVEL */
.level-card {
  display: flex;
  align-items: center;
  gap: 20px;
}

.level-badge {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  flex-shrink: 0;
}

.level-info { flex: 1; }

.level-name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 2px;
}

.level-desc {
  font-size: 12px;
  color: var(--text-dim);
  margin-bottom: 10px;
}

.level-bar {
  height: 6px;
  background: var(--surface2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.level-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
}

.level-next {
  font-size: 11px;
  color: var(--text-dim);
  font-family: var(--font-mono);
}

/* CAT BARS */
.cat-bars { display: flex; flex-direction: column; gap: 12px; }

.cat-row-label {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 5px;
}

.cat-pct {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 12px;
}

.cat-bar {
  height: 8px;
  background: var(--surface2);
  border-radius: 4px;
  overflow: hidden;
}

.cat-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}

/* WEEK CHART */
.week-chart {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  height: 140px;
}

.wc-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.wc-pct {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-dim);
  margin-bottom: 4px;
}

.wc-bar-wrap {
  flex: 1;
  width: 100%;
  background: var(--surface2);
  border-radius: 6px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.wc-bar {
  width: 100%;
  border-radius: 6px;
  transition: height 0.6s ease;
  min-height: 4px;
}

.wc-day {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-dim);
  margin-top: 6px;
}

.wc-day.today { color: var(--accent); font-weight: 700; }

/* QUOTE */
.quote-card { text-align: center; }

.quote-text {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text);
  font-style: italic;
  margin-bottom: 16px;
  padding: 0 8px;
}

.quote-btn {
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.quote-btn:hover { background: var(--accent); color: #000; }
</style>
