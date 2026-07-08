<template>
  <div class="page">
    <div class="cal-page-header anim-fade-up">
      <h1 class="cal-h1">{{ t('nav.calendar') }}</h1>
    </div>

    <div class="month-nav anim-fade-up">
      <button class="nav-btn" @click="prevMonth">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div class="month-title">
        <span class="month-name">{{ months[currentMonth] }}</span>
        <span class="year-label">{{ currentYear }}</span>
      </div>
      <button class="nav-btn" @click="nextMonth">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>

    <div class="cal-card anim-fade-up stagger-1">
      <div class="cal-weekdays">
        <div v-for="d in ['Du','Se','Ch','Pa','Ju','Sh','Ya']" :key="d" class="wd">{{ d }}</div>
      </div>
      <div class="cal-grid">
        <div v-for="(day, i) in calDays" :key="i" class="cal-day"
          :class="{ empty: !day, today: day && isToday(day), selected: day && isSelected(day), complete: day && tasks.getDayCompletion(dateStr(day)) === 100 }"
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

    <transition name="panel-slide">
      <div v-if="selectedDay" class="sel-card anim-fade-up stagger-2" :key="dateStr(selectedDay)">
        <div class="sel-header">
          <div class="sel-icon">📅</div>
          <span class="sel-day-title">{{ formatDay(selectedDay) }}</span>
          <span class="sel-pct" :style="{ color: barColor(selectedDay), background: barColor(selectedDay) + '18' }">{{ tasks.getDayCompletion(dateStr(selectedDay)) }}%</span>
        </div>
        <div class="sel-tasks">
          <div v-for="task in tasks.tasks" :key="task.id" class="sel-task"
            :class="{ done: tasks.isCompleted(task.id, dateStr(selectedDay)) }"
            @click="toggleTask(task.id)">
            <span class="sel-check" :class="{ checked: tasks.isCompleted(task.id, dateStr(selectedDay)) }">
              {{ tasks.isCompleted(task.id, dateStr(selectedDay)) ? '✓' : '' }}
            </span>
            <span class="sel-task-ic" v-html="getTaskIcon(task.icon, task.category)"></span>
            <span class="sel-task-name">{{ task.title }}</span>
          </div>
          <div v-if="!tasks.tasks?.length" class="empty-state">Vazifalar yo'q</div>
        </div>
      </div>
    </transition>

    <div style="height:20px"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTasksStore } from '../stores/tasks.js'
import { icons } from '../icons.js'

const { t } = useI18n()
const tasks = useTasksStore()

// Icon kaliti → SVG
function catIcon(c) {
  return { study: icons.book, sport: icons.dumbbell, language: icons.globe,
    self: icons.star, nutrition: icons.salad, custom: icons.pencil }[c] || icons['check-task']
}
function getTaskIcon(icon, cat) {
  if (!icon || icon === '') return catIcon(cat)
  if (icons[icon]) return icons[icon]
  if (typeof icon === 'string' && icon.trim().startsWith('<svg')) return icon
  return `<span style="font-size:14px">${icon}</span>`
}

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
.page { padding: 16px; max-width: 700px; margin: 0 auto; }
@media(min-width:768px){ .page { padding: 28px 40px; max-width: 860px; } }
.cal-page-header { margin-bottom: 16px; }
.cal-h1 {
  font-family: var(--font-display); font-weight: 800; font-size: 26px;
  background: linear-gradient(135deg, var(--text) 50%, var(--accent-light));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

/* ── Month nav ── */
.month-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; margin-bottom: 12px;
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
}
.month-title { text-align: center; }
.month-name { font-family: var(--font-display); font-weight: 700; font-size: 18px; }
.year-label { display: block; font-size: 12px; color: var(--text-dim); font-weight: 400; margin-top: 2px; font-family: var(--font-mono); }
.nav-btn {
  width: 38px; height: 38px;
  display: flex; align-items: center; justify-content: center;
  background: var(--surface2); border: 1px solid var(--border);
  color: var(--text-dim); cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s var(--ease-spring);
}
.nav-btn:hover { background: rgba(108,99,255,0.12); color: var(--accent-light); border-color: rgba(108,99,255,0.3); transform: scale(1.08); }

/* ── Calendar grid ── */
.cal-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px 12px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
}
.cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 8px; }
.wd { text-align: center; font-family: var(--font-mono); font-size: 11px; color: var(--text-dim); padding: 4px 0; font-weight: 700; }
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.cal-day {
  aspect-ratio: 1; border-radius: 10px;
  padding: 5px 3px 4px; cursor: pointer; position: relative;
  display: flex; flex-direction: column; align-items: center;
  transition: all 0.18s var(--ease-spring);
  min-height: 38px;
  border: 1px solid transparent;
}
.cal-day:hover:not(.empty) { background: var(--surface2); transform: scale(1.06); border-color: var(--border2); }
.cal-day.empty { cursor: default; }
.cal-day.today {
  background: rgba(108,99,255,0.12);
  border-color: rgba(108,99,255,0.35);
  box-shadow: 0 0 12px rgba(108,99,255,0.2);
}
.cal-day.selected {
  background: linear-gradient(135deg, var(--accent), #8b5cf6);
  box-shadow: 0 4px 14px rgba(108,99,255,0.45);
}
.cal-day.selected .day-num { color: white; }
.cal-day.complete .day-num { color: #f59e0b; }
.day-num { font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: var(--text); line-height: 1; margin-bottom: 4px; }
.day-bar { width: 100%; height: 3px; background: var(--surface3); border-radius: 3px; overflow: hidden; }
.day-bar-fill { height: 100%; border-radius: 3px; transition: width 0.6s var(--ease-out); }
.day-star { font-size: 10px; color: #f59e0b; position: absolute; top: 2px; right: 3px; animation: starPop 0.4s var(--ease-spring), starGlow 2s ease infinite; }

/* ── Selected day ── */
.sel-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-top: 3px solid var(--accent);
  border-radius: var(--radius);
  padding: 16px;
  box-shadow: var(--shadow-sm);
}
.sel-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.sel-icon { font-size: 18px; }
.sel-day-title { font-family: var(--font-display); font-weight: 700; font-size: 15px; flex: 1; }
.sel-pct { font-family: var(--font-mono); font-size: 13px; font-weight: 700; padding: 3px 10px; border-radius: 8px; }
.sel-tasks { display: flex; flex-direction: column; gap: 6px; }
.sel-task {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 12px; background: var(--surface2);
  border-radius: var(--radius-sm); cursor: pointer;
  font-size: 14px; transition: all 0.18s;
}
.sel-task:hover { background: var(--surface3); transform: translateX(2px); }
.sel-task.done { opacity: 0.55; }
.sel-task.done .sel-task-name { text-decoration: line-through; color: var(--text-dim); }
.sel-check {
  width: 22px; height: 22px; flex-shrink: 0;
  border: 2px solid var(--border3); border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; color: white; font-weight: 700;
  transition: all 0.2s var(--ease-spring);
}
.sel-check.checked { background: var(--accent); border-color: var(--accent); }
.sel-task-ic {
  width: 28px; height: 28px; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  background: rgba(108,99,255,0.12); color: var(--accent-light);
  border-radius: 8px;
}
.sel-task-ic :deep(svg) { width: 15px; height: 15px; }
.sel-task-name { flex: 1; color: var(--text); font-weight: 500; }

/* ── Transitions ── */
.panel-slide-enter-active { animation: panelSlide 0.3s var(--ease-out); }
.panel-slide-leave-active { animation: fadeIn 0.15s ease reverse; }

@keyframes panelSlide { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes starPop { 0% { transform: scale(0) rotate(-30deg); } 70% { transform: scale(1.4); } 100% { transform: scale(1); } }
@keyframes starGlow { 0%,100% { filter: drop-shadow(0 0 0 transparent); } 50% { filter: drop-shadow(0 0 4px #f59e0b); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
