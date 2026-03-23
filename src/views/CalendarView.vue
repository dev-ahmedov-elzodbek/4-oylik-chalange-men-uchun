<template>
  <div class="page">
    <div class="page-header">
      <h1>{{ t('nav.calendar') }}</h1>
    </div>

    <div class="month-nav card">
      <button class="nav-btn" @click="prevMonth">‹</button>
      <div class="month-title">
        <span>{{ months[currentMonth] }}</span>
        <span class="year-label">{{ currentYear }}</span>
      </div>
      <button class="nav-btn" @click="nextMonth">›</button>
    </div>

    <div class="card cal-card">
      <div class="cal-weekdays">
        <div v-for="d in ['Du','Se','Ch','Pa','Ju','Sh','Ya']" :key="d" class="wd">{{ d }}</div>
      </div>
      <div class="cal-grid">
        <div v-for="(day, i) in calDays" :key="i"
          class="cal-day"
          :class="{ empty: !day, today: day && isToday(day), selected: day && isSelected(day) }"
          @click="day && selectDay(day)">
          <template v-if="day">
            <span class="day-num">{{ day.getDate() }}</span>
            <div class="day-bar">
              <div class="day-bar-fill" :style="{ width: tasks.getDayCompletion(dateStr(day)) + '%', background: barColor(day) }"></div>
            </div>
            <div v-if="tasks.getDayCompletion(dateStr(day)) === 100" class="day-star">★</div>
          </template>
        </div>
      </div>
    </div>

    <!-- Selected Day -->
    <div v-if="selectedDay" class="card">
      <div class="card-title">
        📅 {{ formatDay(selectedDay) }}
        <span class="sel-pct" :style="{ color: barColor(selectedDay) }">{{ tasks.getDayCompletion(dateStr(selectedDay)) }}%</span>
      </div>
      <div class="sel-tasks">
        <div v-for="task in tasks.tasks.value" :key="task.id"
          class="sel-task"
          :class="{ done: tasks.isCompleted(task.id, dateStr(selectedDay)) }"
          @click="toggle(task.id)">
          <span class="sel-check">{{ tasks.isCompleted(task.id, dateStr(selectedDay)) ? '✓' : '○' }}</span>
          {{ task.icon }} {{ task.title }}
        </div>
      </div>
    </div>

    <div style="height:80px"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTasksStore } from '../stores/tasks.js'

const { t } = useI18n()
const tasks = useTasksStore()

const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())
const selectedDay = ref(today)

const months = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']
const dayNames = ['Yakshanba','Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba']

function prevMonth() { if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- } else currentMonth.value-- }
function nextMonth() { if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ } else currentMonth.value++ }

const calDays = computed(() => {
  const first = new Date(currentYear.value, currentMonth.value, 1)
  const last = new Date(currentYear.value, currentMonth.value + 1, 0)
  let startDow = first.getDay() - 1; if (startDow < 0) startDow = 6
  const days = []
  for (let i = 0; i < startDow; i++) days.push(null)
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(currentYear.value, currentMonth.value, d))
  return days
})

function dateStr(d) { return d.toISOString().split('T')[0] }
function isToday(d) { return d.toDateString() === today.toDateString() }
function isSelected(d) { return selectedDay.value && d.toDateString() === selectedDay.value.toDateString() }

function barColor(d) {
  const p = tasks.getDayCompletion(dateStr(d))
  if (p >= 80) return '#00d4aa'
  if (p >= 50) return '#f59e0b'
  if (p > 0) return '#6c63ff'
  return '#374151'
}

function formatDay(d) { return `${dayNames[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}` }

async function selectDay(d) {
  selectedDay.value = d
  await tasks.fetchCompletions(dateStr(d))
}

async function toggle(taskId) {
  await tasks.toggleCompletion(taskId, dateStr(selectedDay.value))
}

onMounted(async () => {
  await tasks.fetchTasks()
  await tasks.fetchCompletions(dateStr(today))
})
</script>

<style scoped>
.page { padding: 20px 16px; max-width: 600px; margin: 0 auto; }
.page-header { margin-bottom: 20px; }
.page-header h1 { font-family: var(--font-display); font-weight: 800; font-size: 24px; }
.month-nav { display: flex; align-items: center; justify-content: space-between; }
.nav-btn { background: var(--surface2); border: 1px solid var(--border); color: var(--text); width: 36px; height: 36px; border-radius: 10px; font-size: 20px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
.nav-btn:hover { background: var(--accent); color: white; }
.month-title { display: flex; flex-direction: column; align-items: center; font-family: var(--font-display); font-weight: 700; font-size: 18px; }
.year-label { font-size: 12px; color: var(--text-dim); font-family: var(--font-mono); font-weight: 400; }
.cal-card { padding: 16px; }
.cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 8px; }
.wd { text-align: center; font-family: var(--font-mono); font-size: 11px; color: var(--text-dim); }
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.cal-day { aspect-ratio: 1; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; position: relative; transition: all 0.2s; background: var(--surface2); border: 1px solid transparent; min-height: 44px; }
.cal-day.empty { background: transparent; cursor: default; }
.cal-day:hover:not(.empty) { border-color: var(--border2); }
.cal-day.today { border-color: var(--accent) !important; background: rgba(108,99,255,0.1); }
.cal-day.selected { border-color: var(--accent2) !important; background: rgba(0,212,170,0.1); }
.day-num { font-family: var(--font-mono); font-size: 12px; font-weight: 700; }
.day-bar { position: absolute; bottom: 4px; left: 4px; right: 4px; height: 3px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; }
.day-bar-fill { height: 100%; border-radius: 2px; transition: width 0.3s; }
.day-star { position: absolute; top: 2px; right: 4px; font-size: 9px; color: var(--warning); }
.sel-pct { margin-left: auto; font-family: var(--font-mono); font-weight: 700; }
.sel-tasks { display: flex; flex-direction: column; gap: 4px; }
.sel-task { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: var(--surface2); border-radius: 8px; cursor: pointer; font-size: 13px; transition: all 0.2s; }
.sel-task.done { opacity: 0.5; text-decoration: line-through; }
.sel-check { font-family: var(--font-mono); color: var(--accent2); width: 16px; }
</style>
