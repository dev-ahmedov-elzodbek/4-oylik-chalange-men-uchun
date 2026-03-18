<template>
  <div class="calendar-view">
    <!-- Month Nav -->
    <div class="month-nav card">
      <button class="nav-btn" @click="prevMonth">‹</button>
      <div class="month-title">
        <span class="month-name">{{ monthNames[currentMonth] }}</span>
        <span class="year">{{ currentYear }}</span>
      </div>
      <button class="nav-btn" @click="nextMonth">›</button>
    </div>

    <!-- Calendar Grid -->
    <div class="card cal-card">
      <div class="cal-weekdays">
        <div v-for="d in weekDays" :key="d" class="wd">{{ d }}</div>
      </div>
      <div class="cal-grid">
        <div 
          v-for="(day, i) in calDays" 
          :key="i"
          class="cal-day"
          :class="{
            empty: !day,
            today: day && isToday(day),
            selected: day && isSelected(day),
            'in-challenge': day && isInChallenge(day),
            'out-challenge': day && !isInChallenge(day)
          }"
          @click="day && selectDay(day)"
        >
          <template v-if="day">
            <span class="day-num">{{ day.getDate() }}</span>
            <div v-if="isInChallenge(day)" class="day-bar">
              <div 
                class="day-bar-fill" 
                :style="{ 
                  width: store.getDayCompletion(day) + '%',
                  background: getBarColor(day)
                }"
              ></div>
            </div>
            <div v-if="store.getDayCompletion(day) === 100" class="day-star">★</div>
          </template>
        </div>
      </div>
    </div>

    <!-- Selected Day Detail -->
    <div v-if="selectedDay" class="card selected-day-card">
      <div class="card-title">
        📅 {{ formatDate(selectedDay) }}
        <span class="sel-pct" :style="{ color: getBarColor(selectedDay) }">
          {{ store.getDayCompletion(selectedDay) }}%
        </span>
      </div>
      
      <div v-if="isInChallenge(selectedDay)">
        <div class="sel-points">
          <span>{{ store.getDayPoints(selectedDay) }}</span> / {{ store.MAX_DAILY_POINTS }} ball
        </div>

        <div class="sel-tasks">
          <div 
            v-for="task in DAILY_TASKS" 
            :key="task.id"
            class="sel-task"
            :class="{ done: store.isTaskDone(selectedDay, task.id) }"
            @click="store.toggleTask(selectedDay, task.id)"
          >
            <span class="sel-check">{{ store.isTaskDone(selectedDay, task.id) ? '✓' : '○' }}</span>
            <span>{{ task.icon }} {{ task.label }}</span>
          </div>
        </div>

        <div v-if="store.getNote(selectedDay)" class="sel-note">
          <div class="sel-note-label">Eslatma:</div>
          {{ store.getNote(selectedDay) }}
        </div>
      </div>
      <div v-else class="not-in-challenge">Bu kun challenge doirasida emas</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useChallengeStore, DAILY_TASKS } from '../stores/challenge.js'

const store = useChallengeStore()

const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())
const selectedDay = ref(today)

const monthNames = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']
const weekDays = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']

function prevMonth() {
  if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- }
  else currentMonth.value--
}

function nextMonth() {
  if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ }
  else currentMonth.value++
}

const calDays = computed(() => {
  const first = new Date(currentYear.value, currentMonth.value, 1)
  const last = new Date(currentYear.value, currentMonth.value + 1, 0)
  
  // Monday-first: 0=Mon,...,6=Sun
  let startDow = first.getDay() - 1
  if (startDow < 0) startDow = 6

  const days = []
  for (let i = 0; i < startDow; i++) days.push(null)
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(currentYear.value, currentMonth.value, d))
  }
  return days
})

function isToday(d) {
  return d.toDateString() === today.toDateString()
}

function isSelected(d) {
  return selectedDay.value && d.toDateString() === selectedDay.value.toDateString()
}

function isInChallenge(d) {
  return d >= store.CHALLENGE_START && d <= store.CHALLENGE_END
}

function selectDay(d) {
  selectedDay.value = d
}

function getBarColor(d) {
  const p = store.getDayCompletion(d)
  if (p >= 80) return '#40e0c0'
  if (p >= 50) return '#f0c040'
  if (p > 0) return '#e040b0'
  return '#374151'
}

function formatDate(d) {
  const days = ['Yakshanba','Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba']
  return `${days[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]}`
}
</script>

<style scoped>
.month-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-btn {
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text);
  width: 36px;
  height: 36px;
  border-radius: 10px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.nav-btn:hover { background: var(--accent); color: #000; }

.month-title {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.month-name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
}

.year {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-dim);
}

.cal-card { padding: 16px; }

.cal-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.wd {
  text-align: center;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-dim);
  padding: 4px;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.cal-day {
  aspect-ratio: 1;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  background: var(--surface2);
  border: 1px solid transparent;
  padding: 2px;
  min-height: 44px;
}

.cal-day.empty { background: transparent; cursor: default; border: none; }

.cal-day.out-challenge {
  opacity: 0.3;
}

.cal-day:hover:not(.empty):not(.out-challenge) {
  border-color: var(--accent);
}

.cal-day.today {
  border-color: var(--accent) !important;
  background: rgba(240, 192, 64, 0.1);
}

.cal-day.selected {
  border-color: var(--accent2) !important;
  background: rgba(64, 224, 192, 0.1);
}

.day-num {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
}

.day-bar {
  position: absolute;
  bottom: 4px;
  left: 4px;
  right: 4px;
  height: 3px;
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
  overflow: hidden;
}

.day-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s;
}

.day-star {
  position: absolute;
  top: 2px;
  right: 4px;
  font-size: 9px;
  color: var(--accent);
}

/* Selected Day */
.sel-pct {
  margin-left: auto;
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 16px;
}

.sel-points {
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--text-dim);
  margin-bottom: 12px;
}

.sel-points span {
  font-size: 24px;
  font-weight: 700;
  color: var(--accent);
}

.sel-tasks {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.sel-task {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--surface2);
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.sel-task.done { opacity: 0.5; text-decoration: line-through; }

.sel-check {
  font-family: var(--font-mono);
  color: var(--accent2);
  width: 16px;
}

.sel-note {
  margin-top: 12px;
  padding: 12px;
  background: var(--surface2);
  border-radius: 10px;
  font-size: 13px;
  color: var(--text-dim);
  font-style: italic;
}

.sel-note-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-dim);
  margin-bottom: 4px;
  font-style: normal;
}

.not-in-challenge {
  color: var(--text-dim);
  font-size: 13px;
  text-align: center;
  padding: 16px;
}
</style>
