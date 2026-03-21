<template>
  <div class="page today-page">

    <!-- Guest Banner -->
    <div v-if="!isLoggedIn" class="guest-banner">
      <div class="guest-text">
        <span>👋 Xush kelibsiz!</span>
        <p>Vazifalarni belgilash uchun kiring</p>
      </div>
      <router-link to="/auth" class="btn btn-primary btn-sm">Kirish</router-link>
    </div>

    <!-- Header -->
    <div class="today-header">
      <div>
        <div class="greeting">Xayrli kun, {{ firstName }}! 👋</div>
        <div class="today-date">{{ todayFormatted }}</div>
      </div>
      <div class="today-ring">
        <svg viewBox="0 0 60 60" width="60" height="60">
          <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="5"/>
          <circle cx="30" cy="30" r="24" fill="none" :stroke="ringColor" stroke-width="5"
            stroke-linecap="round" :stroke-dasharray="150.8"
            :stroke-dashoffset="150.8 - (150.8 * completion / 100)"
            transform="rotate(-90 30 30)" style="transition: stroke-dashoffset 0.6s"/>
          <text x="30" y="35" text-anchor="middle" fill="white" font-size="11" font-family="Space Mono" font-weight="700">{{ completion }}%</text>
        </svg>
      </div>
    </div>

    <!-- Quick stats -->
    <div class="quick-stats">
      <div class="qs-item">
        <span class="qs-val" style="color:var(--accent-light)">{{ dayPoints }}</span>
        <span class="qs-label">ball</span>
      </div>
      <div class="qs-divider"></div>
      <div class="qs-item">
        <span class="qs-val" style="color:var(--warning)">🔥 90</span>
        <span class="qs-label">kun challenge</span>
      </div>
      <div class="qs-divider"></div>
      <div class="qs-item">
        <span class="qs-val" style="color:var(--success)">{{ completedCount }}/{{ taskList.length }}</span>
        <span class="qs-label">vazifa</span>
      </div>
    </div>

    <!-- Tasks -->
    <div v-if="loadingTasks" class="loading-state">Yuklanmoqda...</div>
    <template v-else>
      <div v-for="(group, cat) in groupedTasks" :key="cat" class="card">
        <div class="card-title" :style="{ color: catColor(cat) }">
          {{ catIcon(cat) }} {{ catLabel(cat) }}
        </div>
        <div class="task-list">
          <div v-for="task in group" :key="task.id"
            class="task-item"
            :class="{ done: doneIds.includes(task.id) }"
            @click="handleTaskClick(task.id)">
            <div class="task-check" :style="{ borderColor: catColor(cat) }">
              <span v-if="doneIds.includes(task.id)">✓</span>
            </div>
            <span class="task-icon">{{ task.icon }}</span>
            <span class="task-name">{{ task.title }}</span>
            <span class="task-pts">+{{ task.points }}</span>
          </div>
        </div>
      </div>

      <div v-if="isLoggedIn" class="card">
        <div class="card-title">➕ Vazifa qo'shish</div>
        <div v-if="showAddTask" class="add-task-form">
          <input v-model="newTask.title" class="input" placeholder="Vazifa nomi" style="margin-bottom:8px" />
          <div style="display:flex;gap:8px;margin-bottom:8px">
            <select v-model="newTask.category" class="select">
              <option value="study">📚 O'quv</option>
              <option value="sport">💪 Sport</option>
              <option value="language">🌍 Til</option>
              <option value="self">🌟 O'z ustida</option>
              <option value="nutrition">🍽️ Ovqat</option>
              <option value="custom">✏️ Boshqa</option>
            </select>
            <input v-model.number="newTask.points" class="input" type="number" placeholder="Ball" style="width:90px" />
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-primary btn-sm" @click="saveTask">Saqlash</button>
            <button class="btn btn-outline btn-sm" @click="showAddTask=false">Bekor</button>
          </div>
        </div>
        <button v-else class="btn btn-outline btn-full" @click="showAddTask=true">+ Vazifa qo'shish</button>
      </div>
    </template>

    <!-- Login Modal -->
    <div v-if="showLoginPrompt" class="modal-overlay" @click.self="showLoginPrompt=false">
      <div class="login-prompt">
        <div class="lp-icon">🔐</div>
        <h3>Kirish kerak</h3>
        <p>Vazifalarni belgilash uchun akkauntga kiring</p>
        <router-link to="/auth" class="btn btn-primary btn-full" @click="showLoginPrompt=false">Kirish / Ro'yxatdan o'tish</router-link>
        <button class="btn btn-outline btn-full" @click="showLoginPrompt=false">Keyinroq</button>
      </div>
    </div>

    <div style="height:80px"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase.js'
import { useAuthStore } from '../stores/auth.js'

const authStore = useAuthStore()

const today = new Date()
const todayStr = today.toISOString().split('T')[0]
const months = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']
const days = ['Yakshanba','Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba']
const todayFormatted = `${days[today.getDay()]}, ${today.getDate()} ${months[today.getMonth()]}`

const isLoggedIn = computed(() => authStore.isLoggedIn)
const firstName = computed(() => authStore.profile?.full_name?.split(' ')[0] || 'Mehmon')

const taskList = ref([])
const doneIds = ref([])
const loadingTasks = ref(true)
const showLoginPrompt = ref(false)
const showAddTask = ref(false)
const newTask = ref({ title: '', category: 'custom', points: 10 })

const dayPoints = computed(() => {
  return doneIds.value.reduce((sum, id) => {
    const task = taskList.value.find(t => t.id === id)
    return sum + (task?.points || 0)
  }, 0)
})

const completedCount = computed(() => doneIds.value.length)

const completion = computed(() => {
  const total = taskList.value.reduce((s,t) => s + (t.points||0), 0)
  if (!total) return 0
  return Math.round((dayPoints.value / total) * 100)
})

const ringColor = computed(() => {
  const p = completion.value
  if (p >= 80) return '#00d4aa'
  if (p >= 50) return '#f59e0b'
  return '#6c63ff'
})

function catLabel(cat) {
  return { study:"O'quv", sport:'Sport', language:'Til', self:"O'z ustida", nutrition:'Ovqat', custom:'Boshqa' }[cat] || cat
}
function catIcon(cat) {
  return { study:'📚',sport:'💪',language:'🌍',self:'🌟',nutrition:'🍽️',custom:'✏️' }[cat] || '✅'
}
function catColor(cat) {
  return { study:'#6c63ff',sport:'#10b981',language:'#3b82f6',self:'#8b5cf6',nutrition:'#f59e0b',custom:'#ec4899' }[cat] || '#6c63ff'
}

const groupedTasks = computed(() => {
  const g = {}
  for (const task of taskList.value) {
    if (!g[task.category]) g[task.category] = []
    g[task.category].push(task)
  }
  return g
})

async function loadTasks() {
  loadingTasks.value = true
  try {
    const uid = authStore.user?.id
    let query = supabase.from('tasks').select('*').eq('is_active', true).eq('is_template', true)
    if (uid) {
      query = supabase.from('tasks').select('*').eq('is_active', true).or(`user_id.eq.${uid},is_template.eq.true`)
    }
    const { data } = await query.order('sort_order')
    taskList.value = data || []

    if (uid) {
      const { data: comp } = await supabase
        .from('task_completions')
        .select('task_id')
        .eq('user_id', uid)
        .eq('completed_date', todayStr)
      doneIds.value = comp?.map(c => c.task_id) || []
    }
  } catch(e) {
    console.error(e)
  } finally {
    loadingTasks.value = false
  }
}

async function handleTaskClick(taskId) {
  if (!authStore.user?.id) { showLoginPrompt.value = true; return }
  const uid = authStore.user.id
  const isDone = doneIds.value.includes(taskId)
  if (isDone) {
    await supabase.from('task_completions').delete()
      .eq('user_id', uid).eq('task_id', taskId).eq('completed_date', todayStr)
    doneIds.value = doneIds.value.filter(id => id !== taskId)
  } else {
    await supabase.from('task_completions').insert({ user_id: uid, task_id: taskId, completed_date: todayStr })
    doneIds.value.push(taskId)
  }
}

async function saveTask() {
  if (!newTask.value.title || !authStore.user?.id) return
  const { data } = await supabase.from('tasks').insert({
    title: newTask.value.title,
    category: newTask.value.category,
    points: newTask.value.points,
    icon: catIcon(newTask.value.category),
    user_id: authStore.user.id,
    is_template: false,
    is_active: true
  }).select().single()
  if (data) taskList.value.push(data)
  newTask.value = { title: '', category: 'custom', points: 10 }
  showAddTask.value = false
}

onMounted(() => loadTasks())
</script>

<style scoped>
.page { padding: 20px 16px; max-width: 600px; margin: 0 auto; }
.guest-banner { display: flex; align-items: center; justify-content: space-between; background: rgba(108,99,255,0.12); border: 1px solid rgba(108,99,255,0.3); border-radius: var(--radius); padding: 14px 16px; margin-bottom: 16px; gap: 12px; }
.guest-text span { font-weight: 600; font-size: 14px; display: block; margin-bottom: 2px; }
.guest-text p { font-size: 12px; color: var(--text-dim); margin: 0; }
.today-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.greeting { font-family: var(--font-display); font-weight: 700; font-size: 22px; margin-bottom: 4px; }
.today-date { font-size: 13px; color: var(--text-dim); }
.quick-stats { display: flex; align-items: center; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 20px; margin-bottom: 14px; }
.qs-item { flex: 1; text-align: center; }
.qs-val { display: block; font-family: var(--font-mono); font-weight: 700; font-size: 18px; }
.qs-label { font-size: 11px; color: var(--text-dim); }
.qs-divider { width: 1px; height: 32px; background: var(--border); }
.task-list { display: flex; flex-direction: column; gap: 6px; }
.task-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--surface2); border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s; border: 1px solid transparent; user-select: none; }
.task-item:hover { border-color: var(--border2); }
.task-item.done { opacity: 0.55; background: rgba(0,212,170,0.05); border-color: rgba(0,212,170,0.15); }
.task-check { width: 20px; height: 20px; border-radius: 6px; border: 2px solid; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 12px; font-weight: 700; }
.task-item.done .task-check { background: var(--accent2); border-color: var(--accent2); color: #000; }
.task-icon { font-size: 16px; flex-shrink: 0; }
.task-name { flex: 1; font-size: 14px; }
.task-item.done .task-name { text-decoration: line-through; color: var(--text-dim); }
.task-pts { font-family: var(--font-mono); font-size: 11px; color: var(--accent-light); }
.loading-state { text-align: center; padding: 40px; color: var(--text-dim); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 200; backdrop-filter: blur(4px); padding: 20px; }
.login-prompt { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 32px 24px; width: 100%; max-width: 360px; text-align: center; display: flex; flex-direction: column; gap: 12px; }
.lp-icon { font-size: 48px; }
.login-prompt h3 { font-family: var(--font-display); font-weight: 700; font-size: 20px; }
.login-prompt p { font-size: 14px; color: var(--text-dim); line-height: 1.5; }
</style>
