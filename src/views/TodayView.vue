<template>
  <div class="today">
    <!-- Day Header -->
    <div class="day-header card">
      <div class="day-info">
        <div class="day-name">{{ todayName }}</div>
        <div class="day-date">{{ todayDate }}</div>
        <div class="day-num">Challenge: {{ store.daysPassed }}-kun</div>
      </div>
      <div class="day-ring">
        <svg viewBox="0 0 80 80" width="80" height="80">
          <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="6"/>
          <circle cx="40" cy="40" r="32" fill="none" 
            :stroke="ringColor" stroke-width="6"
            stroke-linecap="round"
            :stroke-dasharray="201"
            :stroke-dashoffset="201 - (201 * todayCompletion / 100)"
            transform="rotate(-90 40 40)"
            style="transition: stroke-dashoffset 0.6s ease"
          />
          <text x="40" y="44" text-anchor="middle" fill="white" font-size="14" font-family="Space Mono" font-weight="700">{{ todayCompletion }}%</text>
        </svg>
      </div>
    </div>

    <!-- Schedule for today -->
    <div v-if="todaySchedule" class="card schedule-card">
      <div class="card-title">📚 Bugungi dars</div>
      <div class="schedule-block">
        <div class="sch-time">{{ todaySchedule.start }} — {{ todaySchedule.end }}</div>
        <div class="sch-name">{{ todaySchedule.name }}</div>
      </div>
    </div>
    <div v-else class="card schedule-card sunday">
      <div class="card-title">🌟 Yakshanba — Dam olish + Rejali faoliyat</div>
      <div class="sunday-tip">Bugun dam oling, lekin sport va o'qishni to'xtating!</div>
    </div>

    <!-- Daily Timeline -->
    <div class="card">
      <div class="card-title">⏰ Kunlik jadval</div>
      <div class="timeline">
        <div v-for="slot in dailyTimeline" :key="slot.time" class="tl-row">
          <div class="tl-time">{{ slot.time }}</div>
          <div class="tl-dot" :style="{ background: slot.color }"></div>
          <div class="tl-label">{{ slot.label }}</div>
        </div>
      </div>
    </div>

    <!-- Tasks by Category -->
    <div v-for="(tasks, cat) in tasksByCategory" :key="cat" class="card task-card">
      <div class="card-title" :style="{ color: CATEGORIES[cat].color }">
        {{ catIcon(cat) }} {{ CATEGORIES[cat].label }}
        <span class="cat-score">{{ catScore(cat) }}/{{ catMax(cat) }}</span>
      </div>
      <div class="task-list">
        <div 
          v-for="task in tasks" 
          :key="task.id"
          class="task-item"
          :class="{ done: store.isTaskDone(today, task.id) }"
          @click="store.toggleTask(today, task.id)"
        >
          <div class="task-check" :style="{ borderColor: CATEGORIES[cat].color }">
            <span v-if="store.isTaskDone(today, task.id)" class="check-mark">✓</span>
          </div>
          <span class="task-icon">{{ task.icon }}</span>
          <span class="task-label">{{ task.label }}</span>
          <span class="task-pts">+{{ task.points }}</span>
        </div>
      </div>
    </div>

    <!-- Daily Note -->
    <div class="card">
      <div class="card-title">🪞 Kunlik tahlil</div>
      <textarea 
        class="note-area" 
        placeholder="Bugun nima yaxshi bo'ldi? Nima yaxshilanishi kerak?..."
        v-model="noteText"
        @input="saveNote"
      ></textarea>
    </div>

    <!-- Points Summary -->
    <div class="card points-summary">
      <div class="ps-label">Bugungi ball</div>
      <div class="ps-value">{{ todayPoints }} <span>/ {{ store.MAX_DAILY_POINTS }}</span></div>
      <div class="ps-bar">
        <div class="ps-fill" :style="{ width: todayCompletion + '%', background: ringColor }"></div>
      </div>
      <div class="ps-status">{{ statusMessage }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useChallengeStore, DAILY_TASKS, CATEGORIES } from '../stores/challenge.js'

const store = useChallengeStore()
const today = new Date()

const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']
const months = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']

const todayName = computed(() => days[today.getDay()])
const todayDate = computed(() => `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`)
const todayPoints = computed(() => store.getDayPoints(today))
const todayCompletion = computed(() => store.getDayCompletion(today))
const todaySchedule = computed(() => store.getScheduleForDay(today))

const ringColor = computed(() => {
  const p = todayCompletion.value
  if (p >= 80) return '#40e0c0'
  if (p >= 50) return '#f0c040'
  return '#e040b0'
})

const statusMessage = computed(() => {
  const p = todayCompletion.value
  if (p === 100) return '🏆 Mukammal kun! Siz zo\'rsiz!'
  if (p >= 80) return '💪 Ajoyib! Davom eting!'
  if (p >= 50) return '⚡ Yaxshi ketayapti!'
  if (p >= 20) return '🔥 Boshlang, hali vaqt bor!'
  return '😴 Bugunni ishga solvoring!'
})

const tasksByCategory = computed(() => {
  const result = {}
  for (const cat of Object.keys(CATEGORIES)) {
    result[cat] = DAILY_TASKS.filter(t => t.category === cat)
  }
  return result
})

function catScore(cat) {
  return DAILY_TASKS
    .filter(t => t.category === cat && store.isTaskDone(today, t.id))
    .reduce((s, t) => s + t.points, 0)
}

function catMax(cat) {
  return DAILY_TASKS.filter(t => t.category === cat).reduce((s, t) => s + t.points, 0)
}

function catIcon(cat) {
  const icons = { sleep: '🌙', sport: '💪', code: '💻', english: '🌍', uzbek: '📚', self: '🌟' }
  return icons[cat] || ''
}

const noteText = ref(store.getNote(today))
function saveNote() {
  store.saveNote(today, noteText.value)
}

const dailyTimeline = computed(() => {
  const dow = today.getDay()
  const hasMorningClass = [2, 4, 6].includes(dow)
  const hasAfternoonClass = [1, 3, 5].includes(dow)
  const isSunday = dow === 0

  const slots = [
    { time: '06:00', label: 'Uyg\'onish + Namoz (Bomdod)', color: '#6366f1' },
    { time: '06:30', label: 'Sport: push-up, plank, yelka', color: '#10b981' },
    { time: '07:30', label: 'Nonushta + tayyorgarlik', color: '#9ca3af' },
  ]

  if (hasMorningClass) {
    slots.push({ time: '08:30', label: 'Ingliz tili o\'qish (darsga tayyorgarlik)', color: '#3b82f6' })
    slots.push({ time: '10:00', label: '📚 DARS — 10:00-12:00', color: '#f59e0b' })
    slots.push({ time: '12:00', label: 'Tushlik + namoz (Peshin)', color: '#9ca3af' })
    slots.push({ time: '13:00', label: 'Dasturlash: nazariya', color: '#f59e0b' })
    slots.push({ time: '14:30', label: 'Ona tili: kitob yoki insho', color: '#ec4899' })
    slots.push({ time: '15:30', label: 'Ingliz tili: grammatika', color: '#3b82f6' })
    slots.push({ time: '17:00', label: 'Dasturlash: amaliyot/loyha', color: '#f59e0b' })
  } else if (hasAfternoonClass) {
    slots.push({ time: '08:30', label: 'Dasturlash: nazariya', color: '#f59e0b' })
    slots.push({ time: '10:00', label: 'Ingliz tili: so\'zlar + podcast', color: '#3b82f6' })
    slots.push({ time: '11:30', label: 'Ona tili: kitob o\'qish', color: '#ec4899' })
    slots.push({ time: '12:30', label: 'Tushlik + namoz (Peshin)', color: '#9ca3af' })
    slots.push({ time: '13:00', label: '📚 DARS — 13:00-15:00', color: '#f59e0b' })
    slots.push({ time: '15:30', label: 'Dasturlash: amaliyot/loyha', color: '#f59e0b' })
    slots.push({ time: '17:00', label: 'Ingliz tili: grammatika', color: '#3b82f6' })
  } else if (isSunday) {
    slots.push({ time: '08:00', label: 'Erkin o\'qish / takrorlash', color: '#8b5cf6' })
    slots.push({ time: '10:00', label: 'Dasturlash: amaliyot/loyha', color: '#f59e0b' })
    slots.push({ time: '12:00', label: 'Tushlik + dam olish', color: '#9ca3af' })
    slots.push({ time: '14:00', label: 'Ingliz tili: film/podcast', color: '#3b82f6' })
    slots.push({ time: '16:00', label: 'Sport + yurish', color: '#10b981' })
  }

  slots.push({ time: '19:00', label: 'Kechki ovqat + namoz (Shom)', color: '#9ca3af' })
  slots.push({ time: '20:00', label: 'Kunlik tahlil (daftar)', color: '#8b5cf6' })
  slots.push({ time: '21:30', label: 'Ijtimoiy tarmoqsiz vaqt', color: '#6b7280' })
  slots.push({ time: '22:30', label: 'Namoz (Xufton) + yotishga tayyorgarlik', color: '#6366f1' })
  slots.push({ time: '23:00', label: '🌙 Uyqu', color: '#4f46e5' })

  return slots
})
</script>

<style scoped>
.today { }

.day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.day-name {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 28px;
  color: var(--accent);
}

.day-date {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text-dim);
  margin: 4px 0;
}

.day-num {
  font-size: 12px;
  color: var(--text-dim);
  background: var(--surface2);
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
}

.schedule-card { border-left: 3px solid var(--accent); }
.schedule-card.sunday { border-left-color: #8b5cf6; }

.schedule-block {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sch-time {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 700;
  color: var(--accent);
}

.sch-name {
  font-size: 14px;
  color: var(--text);
}

.sunday-tip {
  font-size: 14px;
  color: #a78bfa;
  font-style: italic;
}

/* TIMELINE */
.timeline { display: flex; flex-direction: column; gap: 0; }

.tl-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 7px 0;
  border-bottom: 1px solid var(--border);
}

.tl-row:last-child { border-bottom: none; }

.tl-time {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-dim);
  width: 44px;
  flex-shrink: 0;
}

.tl-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tl-label {
  font-size: 13px;
  color: var(--text);
}

/* TASK CARD */
.cat-score {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-dim);
}

.task-list { display: flex; flex-direction: column; gap: 6px; }

.task-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--surface2);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  user-select: none;
}

.task-item:hover { border-color: var(--border); }

.task-item.done {
  opacity: 0.6;
  background: rgba(64, 224, 192, 0.05);
  border-color: rgba(64, 224, 192, 0.2);
}

.task-check {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.task-item.done .task-check {
  background: #40e0c0;
  border-color: #40e0c0;
}

.check-mark {
  font-size: 12px;
  color: #000;
  font-weight: 700;
}

.task-icon { font-size: 16px; flex-shrink: 0; }

.task-label {
  font-size: 13px;
  flex: 1;
  text-decoration: none;
}

.task-item.done .task-label {
  text-decoration: line-through;
  color: var(--text-dim);
}

.task-pts {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--accent);
  flex-shrink: 0;
}

/* NOTE */
.note-area {
  width: 100%;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  font-family: var(--font-body);
  font-size: 14px;
  padding: 12px;
  resize: vertical;
  min-height: 100px;
  outline: none;
  transition: border-color 0.2s;
}

.note-area:focus { border-color: var(--accent); }
.note-area::placeholder { color: var(--text-dim); }

/* POINTS SUMMARY */
.points-summary {
  text-align: center;
  background: linear-gradient(135deg, var(--surface), var(--surface2));
}

.ps-label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--text-dim);
  text-transform: uppercase;
  margin-bottom: 8px;
}

.ps-value {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 48px;
  color: var(--accent);
  line-height: 1;
  margin-bottom: 16px;
}

.ps-value span {
  font-size: 24px;
  color: var(--text-dim);
}

.ps-bar {
  height: 8px;
  background: var(--surface2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.ps-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}

.ps-status {
  font-size: 14px;
  color: var(--text);
}
</style>
