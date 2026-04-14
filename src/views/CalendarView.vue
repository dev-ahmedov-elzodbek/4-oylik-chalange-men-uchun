<template>
  <div class="page">
    <div class="page-header"><h1>{{ t('nav.calendar') }}</h1></div>

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
        <div v-for="(day, i) in calDays" :key="i" class="cal-day"
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

    <div v-if="selectedDay" class="card">
      <div class="card-title">
        📅 {{ formatDay(selectedDay) }}
        <span class="sel-pct" :style="{ color: barColor(selectedDay) }">{{ tasks.getDayCompletion(dateStr(selectedDay)) }}%</span>
      </div>
      <div class="sel-tasks">
        <div v-for="task in tasks.tasks" :key="task.id" class="sel-task"
          :class="{ done: tasks.isCompleted(task.id, dateStr(selectedDay)) }"
          @click="toggleTask(task.id)">
          <span class="sel-check">{{ tasks.isCompleted(task.id, dateStr(selectedDay)) ? '✓' : '○' }}</span>
          {{ task.icon }} {{ task.title }}
        </div>
        <div v-if="!tasks.tasks?.length" class="empty-state">Vazifalar yo'q</div>
      </div>
    </div>

    <div style="height:20px"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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

function prevMonth() { if (currentMonth.value===0){currentMonth.value=11;currentYear.value--} else currentMonth.value-- }
function nextMonth() { if (currentMonth.value===11){currentMonth.value=0;currentYear.value++} else currentMonth.value++ }

const calDays = computed(() => {
  const first = new Date(currentYear.value, currentMonth.value, 1)
  const last = new Date(currentYear.value, currentMonth.value + 1, 0)
  let startDow = first.getDay() - 1; if (startDow < 0) startDow = 6
  const days = []
  for (let i=0;i<startDow;i++) days.push(null)
  for (let d=1;d<=last.getDate();d++) days.push(new Date(currentYear.value, currentMonth.value, d))
  return days
})

function dateStr(d) { return d.toISOString().split('T')[0] }
function isToday(d) { return d.toDateString() === today.toDateString() }
function isSelected(d) { return selectedDay.value && d.toDateString() === selectedDay.value.toDateString() }
function barColor(d) {
  const p = tasks.getDayCompletion(dateStr(d))
  if (p>=80) return '#00d4aa'; if (p>=50) return '#f59e0b'; if (p>0) return '#6c63ff'; return 'var(--surface3)'
}
function formatDay(d) { return `${dayNames[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}` }

async function selectDay(d) {
  selectedDay.value = d
  await tasks.fetchCompletions(dateStr(d))
}

async function toggleTask(taskId) {
  if (!selectedDay.value) return
  await tasks.toggleCompletion(taskId, dateStr(selectedDay.value))
}

onMounted(async () => {
  await tasks.fetchTasks()
  await tasks.fetchCompletions(dateStr(today))
})
</script>

<style scoped>
.page { padding: 20px 16px; max-width: 700px; margin: 0 auto; }
@media(min-width:768px){ .page { padding: 32px 40px; max-width: 860px; } }
.page-header { margin-bottom: 24px; }
.page-header h1 { font-family: var(--font-display); font-weight: 800; font-size: 24px; }

.month-nav { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; margin-bottom: 12px; }
.month-title { text-align: center; font-family: var(--font-display); font-weight: 700; font-size: 17px; }
.year-label { display: block; font-size: 12px; color: var(--text-dim); font-weight: 400; margin-top: 2px; }
.nav-btn { background: none; border: none; font-size: 22px; color: var(--text-dim); cursor: pointer; padding: 4px 10px; border-radius: 8px; transition: background 0.2s; }
.nav-btn:hover { background: var(--surface2); }

.cal-card { padding: 14px 10px; }
.cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 6px; }
.wd { text-align: center; font-family: var(--font-mono); font-size: 11px; color: var(--text-dim); padding: 4px 0; }
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
.cal-day { aspect-ratio: 1; border-radius: 8px; padding: 4px 3px 3px; cursor: pointer; position: relative; display: flex; flex-direction: column; align-items: center; transition: background 0.15s; min-height: 36px; }
.cal-day:hover:not(.empty) { background: var(--surface2); }
.cal-day.empty { cursor: default; }
.cal-day.today { background: rgba(108,99,255,0.12); }
.cal-day.selected { background: var(--accent); }
.cal-day.selected .day-num { color: white; }
.day-num { font-family: var(--font-mono); font-size: 12px; font-weight: 600; color: var(--text); line-height: 1; margin-bottom: 3px; }
.day-bar { width: 100%; height: 3px; background: var(--surface2); border-radius: 2px; overflow: hidden; }
.day-bar-fill { height: 100%; border-radius: 2px; transition: width 0.4s; }
.day-star { font-size: 9px; color: #f59e0b; position: absolute; top: 2px; right: 2px; }

.sel-tasks { display: flex; flex-direction: column; gap: 6px; }
.sel-task { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--surface2); border-radius: var(--radius-sm); cursor: pointer; font-size: 14px; transition: opacity 0.2s; }
.sel-task.done { opacity: 0.6; }
.sel-check { font-size: 16px; flex-shrink: 0; width: 20px; color: var(--accent-light); }
.sel-pct { margin-left: auto; font-family: var(--font-mono); font-size: 13px; }
</style>
