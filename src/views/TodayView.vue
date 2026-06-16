<template>
  <div class="page today-page">

    <!-- ── Guest Banner ── -->
    <div v-if="!isLoggedIn" class="guest-banner anim-fade-up">
      <div class="guest-text">
        <span>Xush kelibsiz!</span>
        <p>Vazifalarni belgilash uchun kiring</p>
      </div>
      <router-link to="/auth" class="btn btn-primary btn-sm">Kirish</router-link>
    </div>

    <!-- ── Header ── -->
    <div class="today-header anim-fade-up">
      <div>
        <div class="greeting">Xayrli kun, <span class="accent-text">{{ firstName }}</span>!</div>
        <div class="today-date">{{ todayFormatted }}</div>
      </div>
      <div class="today-ring" @click="ringPulse = !ringPulse">
        <svg viewBox="0 0 60 60" width="68" height="68" class="ring-svg">
          <circle cx="30" cy="30" r="24" fill="none" stroke="var(--surface3)" stroke-width="4.5"/>
          <circle
            cx="30" cy="30" r="24" fill="none"
            :stroke="ringColor" stroke-width="4.5"
            stroke-linecap="round"
            :stroke-dasharray="150.8"
            :stroke-dashoffset="150.8 - (150.8 * completion / 100)"
            transform="rotate(-90 30 30)"
            style="transition: stroke-dashoffset 0.8s cubic-bezier(0.34,1.56,0.64,1), stroke 0.4s"
          />
          <text x="30" y="34" text-anchor="middle" fill="currentColor" font-size="10" font-family="Space Mono" font-weight="700">
            {{ completion }}%
          </text>
        </svg>
      </div>
    </div>

    <!-- ── Quick Stats ── -->
    <div class="quick-stats anim-fade-up stagger-1">
      <div class="qs-item">
        <span class="qs-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l2.8 6.2L22 9.3l-5.5 5 1.6 7.7L12 18.5l-6.1 3.5 1.6-7.2L2 9.3l7.2-1.1z"
              fill="#f59e0b" fill-opacity="0.3" stroke="#f59e0b" stroke-width="1.4" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="qs-val" style="color:var(--accent-light)">{{ dayPoints }}</span>
        <span class="qs-label">ball</span>
      </div>
      <div class="qs-divider"></div>
      <div class="qs-item">
        <span class="qs-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2c0 0-6 5.5-6 11a6 6 0 0 0 12 0c0-2.8-1.5-5-3.5-6.5.3 2-1 3.5-2.5 3.5-1.5 0-2.5-1.5-.5-4.5C11 6 12 2 12 2z"
              fill="#f59e0b" fill-opacity="0.25" stroke="#f59e0b" stroke-width="1.4" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="qs-val" style="color:var(--warning)">{{ challengeDays }}</span>
        <span class="qs-label">kun</span>
      </div>
      <div class="qs-divider"></div>
      <div class="qs-item">
        <span class="qs-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#10b981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="qs-val" style="color:var(--success)">{{ completedCount }}<span style="font-size:12px;opacity:0.5">/{{ taskList.length }}</span></span>
        <span class="qs-label">vazifa</span>
      </div>
    </div>

    <!-- ── Loading ── -->
    <div v-if="loadingTasks" class="loading-state">
      <div class="loading-spinner"></div>
      <span>Yuklanmoqda...</span>
    </div>

    <template v-else>
      <!-- ── Template task groups ── -->
      <div
        v-for="(group, cat) in groupedTemplateTasks"
        :key="'t-' + cat"
        class="card task-card anim-fade-up"
      >
        <div class="card-title" :style="{ color: catColor(cat) }">
          <span class="cat-icon-wrap" :style="{ background: catColor(cat) + '1a', color: catColor(cat) }" v-html="catIcon(cat)"></span>
          {{ catLabel(cat) }}
          <span class="badge" :style="{ background: catColor(cat) + '20', color: catColor(cat), fontFamily: 'var(--font-mono)', fontSize: '10px', marginLeft: 'auto' }">
            {{ group.filter(t => doneIds.includes(t.id)).length }}/{{ group.length }}
          </span>
        </div>

        <div class="task-list">
          <div
            v-for="(task, i) in group"
            :key="task.id"
            class="task-item"
            :class="{ done: doneIds.includes(task.id) }"
            :style="{ animationDelay: i * 0.04 + 's' }"
            @click="handleTaskClick(task.id)"
          >
            <div
              class="task-check"
              :style="doneIds.includes(task.id)
                ? { background: catColor(cat), borderColor: catColor(cat) }
                : { borderColor: catColor(cat) }"
            >
              <span v-if="doneIds.includes(task.id)" class="check-anim" v-html="icons.checkmark"></span>
            </div>
            <span class="task-icon-svg" v-html="getTaskIcon(task.icon, cat)"></span>
            <span class="task-name">{{ task.title }}</span>
            <span class="task-pts">+{{ task.points }}</span>
          </div>
        </div>
      </div>

      <!-- ── Personal Tasks ── -->
      <div class="card my-tasks-card anim-fade-up">
        <div class="card-title">
          <span class="cat-icon-wrap" style="background:rgba(108,99,255,0.12);color:var(--accent-light)" v-html="icons.pencil"></span>
          <span>Shaxsiy vazifalar</span>
          <span class="badge badge-accent" style="margin-left:auto;font-family:var(--font-mono);font-size:10px">
            {{ myTasks.length }}
          </span>
        </div>

        <div v-if="myTasks.length" class="task-list" style="margin-bottom:12px">
          <div
            v-for="(task, i) in myTasks"
            :key="task.id"
            class="task-item task-item-personal"
            :class="{ done: doneIds.includes(task.id) }"
            :style="{ animationDelay: i * 0.04 + 's' }"
          >
            <div
              class="task-check personal-check"
              :style="doneIds.includes(task.id)
                ? { background: 'var(--accent)', borderColor: 'var(--accent)' }
                : { borderColor: 'var(--accent)' }"
              @click="handleTaskClick(task.id)"
            >
              <span v-if="doneIds.includes(task.id)" class="check-anim" v-html="icons.checkmark"></span>
            </div>

            <span class="task-icon-svg" v-html="getTaskIcon(task.icon, task.category)" @click="handleTaskClick(task.id)"></span>
            <span class="task-name" @click="handleTaskClick(task.id)">{{ task.title }}</span>
            <span class="task-pts" @click="handleTaskClick(task.id)">+{{ task.points }}</span>

            <div class="task-actions">
              <button class="task-btn task-edit-btn" @click.stop="openEdit(task)" title="Tahrirlash">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="task-btn task-delete-btn" @click.stop="confirmDelete(task)" title="O'chirish">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div v-else class="empty-my-tasks">
          <span v-html="icons.clipboard" style="opacity:0.4;display:inline-block;margin-bottom:6px"></span>
          <div>Hali shaxsiy vazifa qo'shilmagan</div>
        </div>

        <!-- Add task form -->
        <transition name="slide-down">
          <div v-if="showAddTask" class="add-task-form">
            <div class="add-task-form-label">Yangi vazifa</div>
            <div class="add-row">
              <div class="icon-picker-wrap">
                <input v-model="newTask.icon" class="input icon-input" placeholder="🎯" maxlength="4" />
                <span class="icon-preview" v-html="getTaskIconPreview(newTask.icon)"></span>
              </div>
              <input
                v-model="newTask.title" class="input"
                placeholder="Vazifa nomi..." @keyup.enter="saveTask"
                style="flex:1" ref="newTitleRef"
              />
            </div>
            <div class="add-row" style="margin-top:8px">
              <select v-model="newTask.category" class="select" style="flex:1">
                <option value="study">📚 O'quv</option>
                <option value="sport">💪 Sport</option>
                <option value="language">🌐 Til</option>
                <option value="self">⭐ O'z ustida</option>
                <option value="nutrition">🥗 Ovqat</option>
                <option value="custom">✏️ Boshqa</option>
              </select>
              <input v-model.number="newTask.points" class="input" type="number" placeholder="Ball" style="width:80px" min="1" max="100" />
            </div>
            <div class="add-actions">
              <button class="btn btn-primary btn-sm" :disabled="saving" @click="saveTask">
                <span v-if="saving">Saqlanmoqda...</span>
                <span v-else>+ Qo'shish</span>
              </button>
              <button class="btn btn-outline btn-sm" @click="cancelAdd">Bekor</button>
            </div>
          </div>
        </transition>

        <button v-if="!showAddTask" class="btn btn-outline btn-full add-trigger" @click="openAddTask">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Shaxsiy vazifa qo'shish
        </button>
      </div>
    </template>

    <div style="height:20px"></div>

    <!-- ── DELETE CONFIRM MODAL ── -->
    <Teleport to="body">
      <div v-if="deletingTask" class="modal-overlay" @click.self="deletingTask = null">
        <div class="confirm-modal anim-scale-in">
          <div class="confirm-icon-wrap">
            <span v-html="icons.trash" style="color:#ef4444"></span>
          </div>
          <h3>Vazifani o'chirish</h3>
          <p><strong>"{{ deletingTask.title }}"</strong> vazifasini o'chirmoqchimisiz? Bu amal qaytarib bo'lmaydi.</p>
          <div class="confirm-actions">
            <button class="btn btn-danger btn-full" :disabled="deleting" @click="doDelete">
              <span v-if="deleting">O'chirilmoqda...</span>
              <span v-else>Ha, o'chirish</span>
            </button>
            <button class="btn btn-outline btn-full" @click="deletingTask = null">Bekor qilish</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── EDIT MODAL ── -->
    <Teleport to="body">
      <div v-if="editingTask" class="modal-overlay" @click.self="cancelEdit">
        <div class="edit-modal anim-scale-in">
          <div class="edit-modal-header">
            <h3>
              <span v-html="icons.pencil" style="display:inline-block;margin-right:8px;vertical-align:middle"></span>
              Vazifani tahrirlash
            </h3>
            <button class="close-btn" @click="cancelEdit">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="edit-modal-body">
            <div class="form-group">
              <label class="label">Icon va nom</label>
              <div class="add-row">
                <input v-model="editingTask.icon" class="input icon-input" placeholder="🎯" maxlength="4" />
                <input v-model="editingTask.title" class="input" placeholder="Vazifa nomi..." @keyup.enter="saveEdit" style="flex:1" ref="editTitleRef" />
              </div>
            </div>
            <div class="add-row">
              <div class="form-group" style="flex:1;margin-bottom:0">
                <label class="label">Kategoriya</label>
                <select v-model="editingTask.category" class="select">
                  <option value="study">📚 O'quv</option>
                  <option value="sport">💪 Sport</option>
                  <option value="language">🌐 Til</option>
                  <option value="self">⭐ O'z ustida</option>
                  <option value="nutrition">🥗 Ovqat</option>
                  <option value="custom">✏️ Boshqa</option>
                </select>
              </div>
              <div class="form-group" style="width:90px;margin-bottom:0">
                <label class="label">Ball</label>
                <input v-model.number="editingTask.points" class="input" type="number" min="1" max="100" />
              </div>
            </div>
          </div>
          <div class="edit-modal-footer">
            <button class="btn btn-primary" :disabled="editSaving" @click="saveEdit">
              <span v-if="editSaving">Saqlanmoqda...</span>
              <span v-else>Saqlash</span>
            </button>
            <button class="btn btn-outline" @click="cancelEdit">Bekor</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── LOGIN PROMPT ── -->
    <Teleport to="body">
      <div v-if="showLoginPrompt" class="modal-overlay" @click.self="showLoginPrompt=false">
        <div class="login-prompt anim-scale-in">
          <div class="lp-icon-wrap" v-html="icons.lock"></div>
          <h3>Kirish kerak</h3>
          <p>Vazifalarni belgilash uchun akkauntga kiring</p>
          <router-link to="/auth" class="btn btn-primary btn-full" @click="showLoginPrompt=false">
            Kirish / Ro'yxatdan o'tish
          </router-link>
          <button class="btn btn-outline btn-full" @click="showLoginPrompt=false">Keyinroq</button>
        </div>
      </div>
    </Teleport>

    <!-- ── ALARM RINGING ── -->
    <Teleport to="body">
      <div v-if="ringingAlarm" class="modal-overlay">
        <div class="alarm-modal anim-scale-in">
          <div class="alarm-ring-icon">⏰</div>
          <h3>{{ ringingAlarm.time }}</h3>
          <p>{{ ringingAlarm.label }}</p>
          <div class="confirm-actions">
            <button class="btn btn-primary btn-full" @click="dismissAlarm">Yopish</button>
            <button class="btn btn-outline btn-full" @click="snoozeAlarm">5 daqiqa keyinroq</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { supabase } from '../supabase.js'
import { useAuthStore } from '../stores/auth.js'
import { icons } from '../icons.js'

const authStore = useAuthStore()

const today     = new Date()
const todayStr  = today.toISOString().split('T')[0]
const months    = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']
const days      = ['Yakshanba','Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba']
const todayFormatted = `${days[today.getDay()]}, ${today.getDate()} ${months[today.getMonth()]}`

const isLoggedIn    = computed(() => authStore.isLoggedIn)
const firstName     = computed(() => authStore.profile?.full_name?.split(' ')[0] || 'Mehmon')
const challengeDays = computed(() => authStore.profile?.challenge_duration || 90)

// State
const allTasks       = ref([])
const myTasks        = ref([])
const doneIds        = ref([])
const loadingTasks   = ref(true)
const showLoginPrompt = ref(false)
const showAddTask    = ref(false)
const saving         = ref(false)
const ringPulse      = ref(false)
const newTask        = ref({ title: '', category: 'custom', points: 10, icon: '' })
const newTitleRef    = ref(null)

const editingTask  = ref(null)
const editSaving   = ref(false)
const editTitleRef = ref(null)

const deletingTask = ref(null)
const deleting     = ref(false)

// Computed
const taskList = computed(() => [...allTasks.value, ...myTasks.value])

const dayPoints = computed(() =>
  doneIds.value.reduce((sum, id) => {
    const t = taskList.value.find(x => x.id === id)
    return sum + (t?.points || 0)
  }, 0)
)
const completedCount = computed(() => doneIds.value.length)
const completion = computed(() => {
  const total = taskList.value.reduce((s, t) => s + (t.points || 0), 0)
  return total ? Math.round((dayPoints.value / total) * 100) : 0
})
const ringColor = computed(() => {
  if (completion.value >= 80) return '#00d4aa'
  if (completion.value >= 50) return '#f59e0b'
  return '#6c63ff'
})
const groupedTemplateTasks = computed(() => {
  const g = {}
  for (const task of allTasks.value) {
    if (!g[task.category]) g[task.category] = []
    g[task.category].push(task)
  }
  return g
})

// ── Icon helpers ─────────────────────────────────────────────────
function getTaskIcon(icon, cat) {
  if (!icon || icon === '') return catIcon(cat) || icons['check-task']
  // Named key in icons.js
  if (icons[icon]) return icons[icon]
  // Full SVG string saved in DB
  if (icon.trim().startsWith('<svg')) return icon
  // Emoji or short text
  return `<span style="font-size:15px;line-height:1;display:inline-flex">${icon}</span>`
}

function getTaskIconPreview(icon) {
  if (!icon) return icons['check-task']
  if (icons[icon]) return icons[icon]
  if (icon.trim().startsWith('<svg')) return icon
  return `<span style="font-size:18px;line-height:1">${icon}</span>`
}

function catLabel(c) {
  return { study:"O'quv", sport:'Sport', language:'Til', self:"O'z ustida", nutrition:'Ovqat', custom:'Boshqa' }[c] || c
}

function catIcon(c) {
  return {
    study:     icons.book,
    sport:     icons.dumbbell,
    language:  icons.globe,
    self:      icons.star,
    nutrition: icons.salad,
    custom:    icons.pencil,
  }[c] || icons['check-task']
}

function catColor(c) {
  return {
    study:    '#6c63ff',
    sport:    '#10b981',
    language: '#3b82f6',
    self:     '#8b5cf6',
    nutrition:'#f59e0b',
    custom:   '#ec4899',
  }[c] || '#6c63ff'
}

// ── Data loading ─────────────────────────────────────────────────
async function loadTasks() {
  loadingTasks.value = true
  try {
    const uid = authStore.user?.id
    const { data: templates } = await supabase
      .from('tasks').select('*')
      .eq('is_active', true).eq('is_template', true).order('sort_order')
    allTasks.value = templates || []

    if (uid) {
      const { data: personal } = await supabase
        .from('tasks').select('*')
        .eq('is_active', true).eq('is_template', false).eq('user_id', uid)
        .order('created_at', { ascending: false })
      myTasks.value = personal || []

      const { data: comp } = await supabase
        .from('task_completions').select('task_id')
        .eq('user_id', uid).eq('completed_date', todayStr)
      doneIds.value = comp?.map(c => c.task_id) || []
    }
  } catch (e) { console.error(e) }
  finally { loadingTasks.value = false }
}

// ── Toggle completion ─────────────────────────────────────────────
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

// ── Add task ─────────────────────────────────────────────────────
function openAddTask() {
  showAddTask.value = true
  nextTick(() => newTitleRef.value?.focus())
}

async function saveTask() {
  if (!newTask.value.title.trim() || !authStore.user?.id) return
  saving.value = true
  try {
    const icon = newTask.value.icon.trim() || null
    const { data, error } = await supabase.from('tasks').insert({
      title:       newTask.value.title.trim(),
      category:    newTask.value.category,
      points:      newTask.value.points || 10,
      icon:        icon,
      user_id:     authStore.user.id,
      is_template: false,
      is_active:   true,
    }).select()
    if (!error && data) { myTasks.value.unshift(data[0]); cancelAdd() }
  } catch (e) { console.error(e) }
  finally { saving.value = false }
}

function cancelAdd() {
  showAddTask.value = false
  newTask.value = { title: '', category: 'custom', points: 10, icon: '' }
}

// ── Delete ───────────────────────────────────────────────────────
function confirmDelete(task) { deletingTask.value = task }
async function doDelete() {
  if (!deletingTask.value) return
  deleting.value = true
  try {
    await supabase.from('tasks').update({ is_active: false }).eq('id', deletingTask.value.id)
    myTasks.value = myTasks.value.filter(t => t.id !== deletingTask.value.id)
    doneIds.value = doneIds.value.filter(id => id !== deletingTask.value.id)
    deletingTask.value = null
  } catch (e) { console.error(e) }
  finally { deleting.value = false }
}

// ── Edit ─────────────────────────────────────────────────────────
function openEdit(task) {
  editingTask.value = { ...task }
  nextTick(() => editTitleRef.value?.focus())
}
function cancelEdit() { editingTask.value = null }
async function saveEdit() {
  if (!editingTask.value?.title?.trim()) return
  editSaving.value = true
  try {
    const { error } = await supabase.from('tasks').update({
      title:    editingTask.value.title.trim(),
      icon:     editingTask.value.icon || null,
      category: editingTask.value.category,
      points:   editingTask.value.points || 10,
    }).eq('id', editingTask.value.id).eq('user_id', authStore.user.id)
    if (!error) {
      const idx = myTasks.value.findIndex(t => t.id === editingTask.value.id)
      if (idx !== -1) myTasks.value[idx] = { ...myTasks.value[idx], ...editingTask.value }
      cancelEdit()
    }
  } catch (e) { console.error(e) }
  finally { editSaving.value = false }
}

// ── Alarms ───────────────────────────────────────────────────────
const alarms       = ref(JSON.parse(localStorage.getItem('gf_alarms') || '[]'))
const ringingAlarm = ref(null)
let alarmInterval  = null

function saveAlarms() { localStorage.setItem('gf_alarms', JSON.stringify(alarms.value)) }
function dismissAlarm() { ringingAlarm.value = null }
function snoozeAlarm() {
  if (!ringingAlarm.value) return
  const now = new Date(); now.setMinutes(now.getMinutes() + 5)
  const t = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
  alarms.value.push({ id: Date.now(), time: t, label: `😴 ${ringingAlarm.value.label}`, repeat: 'once', active: true })
  saveAlarms(); ringingAlarm.value = null
}

function playAlarmSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const beep = (f, s, d) => {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.frequency.value = f; o.type = 'sine'
      g.gain.setValueAtTime(0.3, ctx.currentTime + s)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + s + d)
      o.start(ctx.currentTime + s); o.stop(ctx.currentTime + s + d)
    }
    beep(880,0,0.3); beep(1100,0.4,0.3); beep(880,0.8,0.3); beep(1100,1.2,0.3); beep(1320,1.6,0.5)
  } catch(e) {}
}

function showNotification(alarm) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('⏰ GoalFlow', { body: `${alarm.time} — ${alarm.label}`, requireInteraction: true })
  }
}

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission()
}

function checkAlarms() {
  const now = new Date()
  const hhmm = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
  const day = now.getDay()
  alarms.value.forEach(alarm => {
    if (!alarm.active || alarm._fired) return
    if (alarm.time !== hhmm) return
    if (alarm.repeat === 'weekdays' && (day === 0 || day === 6)) return
    alarm._fired = true
    ringingAlarm.value = alarm
    playAlarmSound()
    showNotification(alarm)
    if (alarm.repeat === 'once') { alarm.active = false; saveAlarms() }
  })
  alarms.value.forEach(a => { if (a._fired && a.time !== hhmm) delete a._fired })
}

onMounted(() => {
  loadTasks()
  requestNotificationPermission()
  alarmInterval = setInterval(checkAlarms, 10000)
  checkAlarms()
})
onUnmounted(() => { if (alarmInterval) clearInterval(alarmInterval) })
</script>

<style scoped>
.page { padding: 20px 16px; max-width: 680px; margin: 0 auto; width: 100%; }
@media (min-width: 768px) { .page { padding: 32px 40px; max-width: 780px; } }

/* ── Guest Banner ── */
.guest-banner {
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(108,99,255,0.07);
  border: 1px solid rgba(108,99,255,0.18);
  border-radius: var(--radius); padding: 14px 16px; margin-bottom: 16px; gap: 12px;
}
.guest-text span { font-weight: 600; font-size: 14px; display: block; margin-bottom: 2px; }
.guest-text p { font-size: 12px; color: var(--text-dim); margin: 0; }

/* ── Header ── */
.today-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
}
.greeting {
  font-family: var(--font-display); font-weight: 800; font-size: 24px;
  margin-bottom: 4px; color: var(--text); line-height: 1.2;
}
.today-date { font-size: 13px; color: var(--text-dim); }
@media (min-width: 768px) { .greeting { font-size: 30px; } }

.ring-svg { cursor: pointer; transition: transform 0.2s; }
.ring-svg:hover { transform: scale(1.06); }
.ring-svg text { fill: var(--text); }

/* ── Quick Stats ── */
.quick-stats {
  display: flex; align-items: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius); padding: 16px 20px;
  margin-bottom: 18px; box-shadow: var(--shadow-sm);
}
.qs-item {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; gap: 2px;
}
.qs-icon { line-height: 1; }
.qs-val {
  display: block; font-family: var(--font-mono); font-weight: 700;
  font-size: 20px; line-height: 1.1;
}
.qs-label { font-size: 11px; color: var(--text-dim); }
.qs-divider { width: 1px; height: 36px; background: var(--border); }

/* ── Task cards ── */
.task-card { animation: fadeUp 0.35s var(--ease-out) both; }
.cat-icon-wrap {
  width: 28px; height: 28px; border-radius: 8px;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

/* ── Task list ── */
.task-list { display: flex; flex-direction: column; gap: 6px; }

.task-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; background: var(--surface2);
  border-radius: var(--radius-sm); cursor: pointer;
  transition: all 0.18s var(--ease-out);
  border: 1px solid transparent; user-select: none;
  animation: staggerIn 0.3s var(--ease-out) both;
}
.task-item:hover { border-color: var(--border2); background: var(--surface3); transform: translateX(2px); }
.task-item.done {
  opacity: 0.52; background: rgba(0,212,170,0.04);
  border-color: rgba(0,212,170,0.1);
}
.task-item-personal { border: 1px solid rgba(108,99,255,0.09); cursor: default; }
.task-item-personal:hover { border-color: rgba(108,99,255,0.2); transform: none; }

.task-check {
  width: 22px; height: 22px; border-radius: 7px; border: 2px solid;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; color: white; transition: all 0.2s var(--ease-spring);
}
.personal-check { cursor: pointer; }
.personal-check:hover { transform: scale(1.1); }

.check-anim { display: inline-flex; animation: bounceIn 0.3s var(--ease-spring); }

.task-icon-svg {
  flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  width: 22px; height: 22px;
}
.task-icon-svg svg { width: 18px; height: 18px; }

.task-name { flex: 1; font-size: 14px; color: var(--text); min-width: 0; word-break: break-word; }
.task-item.done .task-name { text-decoration: line-through; color: var(--text-dim); }
.task-pts {
  font-family: var(--font-mono); font-size: 11px;
  color: var(--accent-light); flex-shrink: 0;
  background: rgba(108,99,255,0.1); padding: 2px 6px; border-radius: 6px;
}

/* ── Action buttons ── */
.task-actions { display: flex; gap: 4px; flex-shrink: 0; }
.task-btn {
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  border: none; border-radius: 8px; cursor: pointer;
  transition: all 0.18s; flex-shrink: 0;
}
.task-edit-btn { background: rgba(108,99,255,0.1); color: var(--accent-light); }
.task-edit-btn:hover { background: rgba(108,99,255,0.22); transform: scale(1.1); }
.task-delete-btn { background: rgba(239,68,68,0.08); color: #ef4444; }
.task-delete-btn:hover { background: rgba(239,68,68,0.2); transform: scale(1.1); }
[data-theme="light"] .task-edit-btn { background: rgba(108,99,255,0.08); }
[data-theme="light"] .task-delete-btn { background: rgba(239,68,68,0.06); }

/* ── My Tasks Card ── */
.my-tasks-card { border: 1px solid rgba(108,99,255,0.12); }
.empty-my-tasks {
  text-align: center; padding: 20px; color: var(--text-dim); font-size: 13px;
  border: 1px dashed var(--border2); border-radius: var(--radius-sm); margin-bottom: 12px;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
}

/* ── Add task form ── */
.add-task-form-label {
  font-size: 11px; font-weight: 700; color: var(--text-dim);
  text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;
}
.add-task-form {
  background: var(--surface2); border-radius: var(--radius-sm);
  padding: 16px; margin-bottom: 4px; border: 1px solid var(--border2);
}
.add-row { display: flex; gap: 8px; }

.icon-picker-wrap { position: relative; width: 58px; flex-shrink: 0; }
.icon-input { width: 100%; text-align: center; font-size: 18px; padding: 10px 6px; }
.icon-preview {
  position: absolute; inset: 0; pointer-events: none;
  display: flex; align-items: center; justify-content: center;
  opacity: 0.4;
}

.add-actions { display: flex; gap: 8px; margin-top: 10px; }
.add-trigger {
  border-style: dashed; color: var(--accent-light);
  border-color: rgba(108,99,255,0.3);
  transition: all 0.2s;
}
.add-trigger:hover { background: rgba(108,99,255,0.06); border-color: rgba(108,99,255,0.5); transform: none; }

/* ── Slide down transition ── */
.slide-down-enter-active { animation: fadeUp 0.25s var(--ease-out); }
.slide-down-leave-active { animation: fadeIn 0.18s ease reverse; }

/* ── Modals ── */
.confirm-modal {
  background: var(--surface); border: 1px solid var(--border2);
  border-radius: var(--radius); padding: 32px 28px;
  width: 100%; max-width: 380px;
  text-align: center; display: flex; flex-direction: column; gap: 14px;
  box-shadow: var(--shadow-lg);
}
.confirm-icon-wrap {
  width: 60px; height: 60px; border-radius: 18px;
  background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto;
}
.confirm-icon-wrap svg { width: 28px; height: 28px; }
.confirm-modal h3 { font-family: var(--font-display); font-weight: 700; font-size: 20px; }
.confirm-modal p { font-size: 14px; color: var(--text-dim); line-height: 1.6; }
.confirm-modal p strong { color: var(--text); }
.confirm-actions { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }

.edit-modal {
  background: var(--surface); border: 1px solid var(--border2);
  border-radius: var(--radius); width: 100%; max-width: 460px;
  box-shadow: var(--shadow-lg); overflow: hidden;
}
.edit-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px 16px; border-bottom: 1px solid var(--border);
  background: linear-gradient(135deg, rgba(108,99,255,0.06), rgba(0,212,170,0.02));
}
.edit-modal-header h3 { font-family: var(--font-display); font-weight: 700; font-size: 16px; }
.close-btn {
  width: 32px; height: 32px; border-radius: 9px; border: none;
  background: var(--surface3); color: var(--text-dim); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.18s;
}
.close-btn:hover { background: rgba(239,68,68,0.15); color: #ef4444; transform: rotate(90deg); }
.edit-modal-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.edit-modal-footer {
  display: flex; gap: 8px; padding: 16px 20px;
  border-top: 1px solid var(--border); background: var(--surface2);
}

.login-prompt {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 36px 28px;
  width: 100%; max-width: 360px;
  text-align: center; display: flex; flex-direction: column; gap: 14px;
  box-shadow: var(--shadow-lg);
}
.lp-icon-wrap {
  width: 64px; height: 64px; border-radius: 20px;
  background: rgba(108,99,255,0.1); border: 1px solid rgba(108,99,255,0.2);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto; color: var(--accent-light);
}
.lp-icon-wrap svg { width: 30px; height: 30px; }
.login-prompt h3 { font-family: var(--font-display); font-weight: 700; font-size: 20px; }
.login-prompt p { font-size: 14px; color: var(--text-dim); }

.alarm-modal {
  background: var(--surface); border: 1px solid var(--border2);
  border-radius: var(--radius); padding: 36px 28px;
  width: 100%; max-width: 360px;
  text-align: center; display: flex; flex-direction: column; gap: 14px;
  box-shadow: var(--shadow-lg);
}
.alarm-ring-icon { font-size: 56px; animation: float 1s ease-in-out infinite; }
.alarm-modal h3 { font-family: var(--font-mono); font-size: 32px; font-weight: 700; }
.alarm-modal p { font-size: 15px; color: var(--text-dim); }

@keyframes staggerIn {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes bounceIn {
  0%   { transform: scale(0.3); opacity: 0; }
  60%  { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50%       { transform: translateY(-8px) rotate(5deg); }
}
</style>
