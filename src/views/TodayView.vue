<template>
  <div class="page today-page">

    <!-- ── Guest Banner ── -->
    <div v-if="!isLoggedIn" class="guest-banner anim-fade-up">
      <div class="guest-text">
        <span>Xush kelibsiz! 👋</span>
        <p>Vazifalarni belgilash uchun akkauntga kiring</p>
      </div>
      <router-link to="/auth" class="btn btn-primary btn-sm btn-ripple">Kirish →</router-link>
    </div>

    <!-- ── Hero Header ── -->
    <div class="hero-card anim-fade-up">
      <div class="hero-bg-accent"></div>
      <div class="hero-content">
        <div class="hero-left">
          <div class="hero-date">{{ todayFormatted }}</div>
          <h1 class="hero-greeting">Salom, <span class="hero-name">{{ firstName }}</span>! 👋</h1>
          <div class="hero-motivation">
            <span v-if="completion >= 80" class="hero-mot-text hero-mot-fire">🔥 Ajoyib! Davom et!</span>
            <span v-else-if="completion >= 50" class="hero-mot-text hero-mot-mid">⚡ Yaxshi ketmoqda!</span>
            <span v-else-if="completion > 0"  class="hero-mot-text hero-mot-start">💪 Boshlandi, olg'a!</span>
            <span v-else                       class="hero-mot-text hero-mot-default">🎯 Bugun nima qilasan?</span>
          </div>

          <!-- Mini progress bar -->
          <div class="hero-progress-wrap">
            <div class="hero-progress-track">
              <div
                class="hero-progress-bar"
                :style="{ width: completion + '%', background: completion >= 80 ? 'linear-gradient(90deg,#00d4aa,#10b981)' : completion >= 50 ? 'linear-gradient(90deg,#f59e0b,#f97316)' : 'linear-gradient(90deg,#6c63ff,#8b5cf6)' }"
              ></div>
            </div>
            <span class="hero-progress-label">{{ completion }}% bajarildi</span>
          </div>
        </div>

        <!-- Ring -->
        <div class="hero-ring-wrap" @click="ringPulse = !ringPulse" :class="{ 'ring-pulse': ringPulse }">
          <svg viewBox="0 0 80 80" width="90" height="90" class="hero-ring-svg">
            <!-- Track -->
            <circle cx="40" cy="40" r="32" fill="none" stroke="var(--surface3)" stroke-width="6"/>
            <!-- Progress -->
            <circle
              cx="40" cy="40" r="32" fill="none"
              :stroke="ringColor" stroke-width="6"
              stroke-linecap="round"
              :stroke-dasharray="201"
              :stroke-dashoffset="201 - (201 * completion / 100)"
              transform="rotate(-90 40 40)"
              style="transition: stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1), stroke 0.4s; filter: drop-shadow(0 0 8px currentColor)"
            />
            <!-- Inner glow circle -->
            <circle cx="40" cy="40" r="25" :fill="ringColor + '10'"/>
            <!-- Text -->
            <text x="40" y="37" text-anchor="middle" fill="currentColor" font-size="13" font-family="Space Mono" font-weight="700">{{ completion }}%</text>
            <text x="40" y="51" text-anchor="middle" fill="var(--text-dim)" font-size="8" font-family="DM Sans">bajarildi</text>
          </svg>
        </div>
      </div>

      <!-- Stats row -->
      <div class="hero-stats">
        <div class="hs-item">
          <div class="hs-icon" style="background:rgba(108,99,255,0.15);color:#8b83ff">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.8 6.2L22 9.3l-5.5 5 1.6 7.7L12 18.5l-6.1 3.5 1.6-7.2L2 9.3l7.2-1.1z" fill="currentColor" fill-opacity="0.3" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
          </div>
          <div class="hs-body">
            <div class="hs-val" style="color:var(--accent-light)">{{ dayPoints }}</div>
            <div class="hs-label">ball</div>
          </div>
        </div>
        <div class="hs-divider"></div>
        <div class="hs-item hs-streak" :title="'Ketma-ketlik: ' + streakInfo.label">
          <div class="hs-streak-emoji" :class="{ ablaze: streak.current >= 3 }">{{ streakInfo.emoji }}</div>
          <div class="hs-body">
            <div class="hs-val" :style="{ color: streakInfo.color }">{{ streak.current }}</div>
            <div class="hs-label">kun streak</div>
          </div>
        </div>
        <div class="hs-divider"></div>
        <div class="hs-item">
          <div class="hs-icon" style="background:rgba(16,185,129,0.15);color:#10b981">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="hs-body">
            <div class="hs-val" style="color:var(--success)">{{ completedCount }}<span class="hs-total">/{{ taskList.length }}</span></div>
            <div class="hs-label">vazifa</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Quick links ── -->
    <div class="quick-links anim-fade-up stagger-1">
      <router-link to="/finance" class="ql-btn">
        <span class="ql-emoji">💵</span>
        <span class="ql-text">Moliya</span>
      </router-link>
      <router-link to="/leaderboard" class="ql-btn">
        <span class="ql-emoji">🏆</span>
        <span class="ql-text">Reyting</span>
      </router-link>
      <router-link to="/stats" class="ql-btn">
        <span class="ql-emoji">📊</span>
        <span class="ql-text">Statistika</span>
      </router-link>
      <router-link to="/schedule" class="ql-btn">
        <span class="ql-emoji">🗓️</span>
        <span class="ql-text">Jadval</span>
      </router-link>
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
        class="task-card anim-fade-up"
        :style="{ '--cat-color': catColor(cat) }"
      >
        <!-- Category header -->
        <div class="tc-header">
          <div class="tc-icon-wrap" :style="{ background: catColor(cat) + '22', color: catColor(cat) }" v-html="catIcon(cat)"></div>
          <span class="tc-label">{{ catLabel(cat) }}</span>
          <div class="tc-badge" :style="{ background: catColor(cat) + '20', color: catColor(cat) }">
            {{ group.filter(t => doneIds.includes(t.id)).length }}/{{ group.length }}
          </div>
        </div>
        <!-- Category mini progress -->
        <div class="tc-progress-track">
          <div
            class="tc-progress-fill"
            :style="{
              width: (group.length ? group.filter(t => doneIds.includes(t.id)).length / group.length * 100 : 0) + '%',
              background: catColor(cat)
            }"
          ></div>
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
      <div class="my-tasks-card anim-fade-up">
        <div class="tc-header my-header">
          <div class="tc-icon-wrap" style="background:rgba(108,99,255,0.15);color:var(--accent-light)" v-html="icons.pencil"></div>
          <span class="tc-label">Shaxsiy vazifalar</span>
          <div class="tc-badge" style="background:rgba(108,99,255,0.12);color:var(--accent-light)">
            {{ myTasks.length }}
          </div>
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

    <ProUpsell
      :open="showUpsell"
      title="Ko'proq vazifa qo'shing"
      :desc="`Free rejada ${FREE_TASK_LIMIT} ta shaxsiy vazifa. Pro bilan cheksiz!`"
      @close="showUpsell = false"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { supabase } from '../supabase.js'
import { useAuthStore } from '../stores/auth.js'
import { icons } from '../icons.js'
import { playCheck, playUncheck, celebrate } from '../utils/feedback.js'
import { getStreak, streakTier } from '../utils/streak.js'
import ProUpsell from '../components/ProUpsell.vue'

const authStore = useAuthStore()

// ── Streak ──
const streak = ref({ current: 0, longest: 0 })
const streakInfo = computed(() => streakTier(streak.value.current))
const MILESTONES = [3, 7, 14, 30, 60, 100]
async function loadStreak() {
  if (!authStore.user?.id) return
  streak.value = await getStreak(authStore.user.id, authStore.isPro)
  // Yangi bosqichga yetdi — nishonlaymiz (bir marta)
  const cur = streak.value.current
  const reached = MILESTONES.filter(m => cur >= m).pop()
  if (reached) {
    const key = `gf_streak_ms_${authStore.user.id}`
    const last = Number(localStorage.getItem(key) || 0)
    if (reached > last) {
      localStorage.setItem(key, String(reached))
      if (last > 0) setTimeout(() => celebrate({ count: 110 }), 300)
    }
  }
}

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
  const wasComplete = completion.value >= 100
  if (isDone) {
    playUncheck()
    await supabase.from('task_completions').delete()
      .eq('user_id', uid).eq('task_id', taskId).eq('completed_date', todayStr)
    doneIds.value = doneIds.value.filter(id => id !== taskId)
  } else {
    playCheck()
    await supabase.from('task_completions').insert({ user_id: uid, task_id: taskId, completed_date: todayStr })
    doneIds.value.push(taskId)
    // Endigina 100% ga yetdi — nishonlaymiz!
    if (!wasComplete && completion.value >= 100) {
      celebrate({ origin: { x: 0.5, y: 0.3 } })
    }
    loadStreak()
  }
}

// ── Add task ─────────────────────────────────────────────────────
const FREE_TASK_LIMIT = 5
const showUpsell = ref(false)
function openAddTask() {
  // Free foydalanuvchi uchun limit
  if (!authStore.isPro && myTasks.value.length >= FREE_TASK_LIMIT) {
    showUpsell.value = true
    return
  }
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
  loadStreak()
  requestNotificationPermission()
  alarmInterval = setInterval(checkAlarms, 10000)
  checkAlarms()
})
onUnmounted(() => { if (alarmInterval) clearInterval(alarmInterval) })
</script>

<style scoped>
.page { padding: 16px; max-width: 680px; margin: 0 auto; width: 100%; }
@media (min-width: 768px) { .page { padding: 28px 40px; max-width: 780px; } }

/* ── Guest Banner ── */
.guest-banner {
  display: flex; align-items: center; justify-content: space-between;
  background: linear-gradient(135deg, rgba(108,99,255,0.08), rgba(0,212,170,0.04));
  border: 1px solid rgba(108,99,255,0.2);
  border-radius: var(--radius); padding: 14px 18px; margin-bottom: 16px; gap: 12px;
}
.guest-text span { font-weight: 700; font-size: 14px; display: block; margin-bottom: 2px; }
.guest-text p { font-size: 12px; color: var(--text-dim); margin: 0; }

/* ── Hero Card ── */
.hero-card {
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: 20px;
  margin-bottom: 16px;
  box-shadow: var(--shadow);
  overflow: hidden;
  position: relative;
}
[data-theme="light"] .hero-card { box-shadow: 0 4px 24px rgba(108,99,255,0.1); }

.hero-bg-accent {
  position: absolute;
  top: -60px; right: -60px;
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%);
  pointer-events: none;
  border-radius: 50%;
}

.hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  gap: 12px;
}

.hero-left { flex: 1; min-width: 0; }
.hero-date { font-size: 12px; color: var(--text-dim); font-weight: 500; margin-bottom: 6px; text-transform: capitalize; }
.hero-greeting {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 22px;
  line-height: 1.2;
  color: var(--text);
  margin-bottom: 8px;
}
@media (min-width: 768px) { .hero-greeting { font-size: 28px; } }
.hero-name {
  background: linear-gradient(135deg, var(--accent-light) 0%, var(--accent2) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-motivation { margin-bottom: 12px; }
.hero-mot-text {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
}
.hero-mot-fire   { background: rgba(245,158,11,0.12); color: #f59e0b; }
.hero-mot-mid    { background: rgba(108,99,255,0.1); color: var(--accent-light); }
.hero-mot-start  { background: rgba(16,185,129,0.1); color: var(--success); }
.hero-mot-default{ background: var(--surface2); color: var(--text-dim); }

.hero-progress-wrap { display: flex; align-items: center; gap: 10px; }
.hero-progress-track {
  flex: 1; height: 5px;
  background: var(--surface3);
  border-radius: 10px; overflow: hidden;
}
.hero-progress-bar {
  height: 100%; border-radius: 10px;
  transition: width 1s var(--ease-out);
  box-shadow: 0 0 8px currentColor;
  animation: progressFill 1.2s var(--ease-out) both;
}
.hero-progress-label { font-size: 11px; font-family: var(--font-mono); color: var(--text-dim); flex-shrink: 0; }

/* Ring */
.hero-ring-wrap {
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.2s var(--ease-spring);
}
.hero-ring-wrap:hover { transform: scale(1.05); }
.hero-ring-wrap.ring-pulse { animation: glowPulse 1s ease; }
.hero-ring-svg text { fill: var(--text); }

/* Stats row */
.hero-stats {
  display: flex;
  align-items: center;
  padding: 12px 20px 16px;
  border-top: 1px solid var(--border);
  background: rgba(255,255,255,0.015);
}
[data-theme="light"] .hero-stats { background: rgba(108,99,255,0.02); }
.hs-item { flex: 1; display: flex; align-items: center; gap: 10px; justify-content: center; }
.hs-icon {
  width: 32px; height: 32px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.hs-body { display: flex; flex-direction: column; }
.hs-val {
  font-family: var(--font-mono);
  font-weight: 700; font-size: 18px; line-height: 1.1;
}
.hs-total { font-size: 12px; opacity: 0.45; }
.hs-label { font-size: 11px; color: var(--text-dim); }
.hs-divider { width: 1px; height: 32px; background: var(--border); }

/* ── Quick links ── */
.quick-links { display: flex; gap: 8px; margin-bottom: 14px; }
.ql-btn {
  flex: 1;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  padding: 12px 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--text);
  font-size: 13px; font-weight: 600;
  transition: all 0.2s var(--ease-spring);
  box-shadow: var(--shadow-sm);
}
.ql-btn:hover {
  transform: translateY(-2px);
  border-color: var(--border2);
  box-shadow: var(--shadow);
}
.ql-emoji { font-size: 16px; }
@media (max-width: 380px) { .ql-text { font-size: 12px; } }

/* ── Streak ── */
.hs-streak-emoji { font-size: 22px; line-height: 1; flex-shrink: 0; }
.hs-streak-emoji.ablaze { animation: flameFlicker 1.2s ease-in-out infinite; }
@keyframes flameFlicker {
  0%, 100% { transform: scale(1) rotate(-3deg); filter: drop-shadow(0 0 3px rgba(245,158,11,0.5)); }
  50%       { transform: scale(1.15) rotate(3deg); filter: drop-shadow(0 0 8px rgba(239,68,68,0.7)); }
}

/* ── Task Cards (categories) ── */
.task-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-top: 3px solid var(--cat-color, var(--accent));
  border-radius: var(--radius);
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  animation: fadeUp 0.35s var(--ease-out) both;
  transition: box-shadow 0.2s, border-color 0.2s;
}
.task-card:hover { box-shadow: var(--shadow); }
[data-theme="light"] .task-card { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }

.tc-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px 10px;
}
.tc-icon-wrap {
  width: 30px; height: 30px;
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.tc-icon-wrap svg { width: 16px; height: 16px; }
.tc-label {
  flex: 1;
  font-family: var(--font-display);
  font-weight: 700; font-size: 14px; color: var(--text);
}
.tc-badge {
  font-family: var(--font-mono);
  font-size: 11px; font-weight: 700;
  padding: 3px 8px;
  border-radius: 8px;
}

.tc-progress-track {
  height: 3px;
  background: var(--surface3);
  margin: 0 16px 12px;
  border-radius: 10px;
  overflow: hidden;
}
.tc-progress-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.8s var(--ease-out);
  animation: progressFill 1s var(--ease-out) both;
  opacity: 0.7;
}

/* ── cat icon legacy wrapper ── */
.cat-icon-wrap {
  width: 28px; height: 28px; border-radius: 8px;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

/* ── Task list ── */
.task-list { display: flex; flex-direction: column; gap: 5px; padding: 0 12px 12px; }

.task-item {
  display: flex; align-items: center; gap: 10px;
  padding: 11px 12px;
  background: var(--surface2);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.18s var(--ease-out);
  border: 1px solid transparent;
  user-select: none;
  animation: staggerIn 0.3s var(--ease-out) both;
  position: relative;
  overflow: hidden;
}
.task-item::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 0;
  background: var(--cat-color, var(--accent));
  opacity: 0.08;
  transition: width 0.2s;
}
.task-item:hover::before { width: 3px; }
.task-item:hover { border-color: var(--border2); background: var(--surface3); transform: translateX(3px); }
.task-item.done {
  opacity: 0.5;
  background: rgba(0,212,170,0.03);
  border-color: rgba(0,212,170,0.08);
}
.task-item.done::before { width: 3px; background: var(--success); opacity: 0.5; }
.task-item-personal { border: 1px solid rgba(108,99,255,0.09); cursor: default; }
.task-item-personal:hover { border-color: rgba(108,99,255,0.2); transform: translateX(3px); }

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
.my-tasks-card {
  background: var(--surface);
  border: 1px solid rgba(108,99,255,0.18);
  border-top: 3px solid var(--accent);
  border-radius: var(--radius);
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.my-tasks-card .task-list { padding: 0 12px 12px; }
.empty-my-tasks {
  text-align: center; padding: 24px 16px; color: var(--text-dim); font-size: 13px;
  border: 1.5px dashed rgba(108,99,255,0.2); border-radius: var(--radius-sm);
  margin: 0 12px 12px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}

/* ── Add task form ── */
.add-task-form-label {
  font-size: 11px; font-weight: 700; color: var(--text-dim);
  text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;
}
.add-task-form {
  background: rgba(108,99,255,0.04);
  border-radius: var(--radius-sm);
  padding: 14px 12px;
  margin: 0 12px 8px;
  border: 1px solid rgba(108,99,255,0.15);
  animation: slideDown 0.25s var(--ease-out);
}
.add-row { display: flex; gap: 8px; }
.icon-picker-wrap { position: relative; width: 54px; flex-shrink: 0; }
.icon-input { width: 100%; text-align: center; font-size: 18px; padding: 10px 4px; }
.icon-preview {
  position: absolute; inset: 0; pointer-events: none;
  display: flex; align-items: center; justify-content: center; opacity: 0.35;
}
.add-actions { display: flex; gap: 8px; margin-top: 10px; }
.add-trigger {
  margin: 0 12px 12px;
  border: 1.5px dashed rgba(108,99,255,0.3);
  color: var(--accent-light);
  background: transparent;
  font-size: 13px;
}
.add-trigger:hover {
  background: rgba(108,99,255,0.06);
  border-color: rgba(108,99,255,0.5);
  transform: none !important;
}

/* ── My tasks header ── */
.tc-header.my-header {
  background: linear-gradient(135deg, rgba(108,99,255,0.07), transparent);
  border-bottom: 1px solid rgba(108,99,255,0.1);
  padding-bottom: 12px;
  margin-bottom: 0;
}

/* ── Slide down transition ── */
.slide-down-enter-active { animation: slideDown 0.25s var(--ease-out); }
.slide-down-leave-active { animation: fadeIn 0.18s ease reverse; }

/* ── Modals ── */
.confirm-modal {
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: 20px;
  padding: 32px 28px;
  width: 100%; max-width: 380px;
  text-align: center;
  display: flex; flex-direction: column; gap: 14px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.5);
  backdrop-filter: blur(20px);
}
.confirm-icon-wrap {
  width: 64px; height: 64px; border-radius: 20px;
  background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.25);
  display: flex; align-items: center; justify-content: center; margin: 0 auto;
  animation: badge-pop 0.4s var(--ease-spring);
}
.confirm-icon-wrap svg { width: 28px; height: 28px; }
.confirm-modal h3 { font-family: var(--font-display); font-weight: 700; font-size: 20px; }
.confirm-modal p { font-size: 14px; color: var(--text-dim); line-height: 1.65; }
.confirm-modal p strong { color: var(--text); }
.confirm-actions { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }

.edit-modal {
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: 20px;
  width: 100%; max-width: 460px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.5);
  overflow: hidden;
  backdrop-filter: blur(20px);
}
.edit-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px 16px;
  border-bottom: 1px solid var(--border);
  background: linear-gradient(135deg, rgba(108,99,255,0.07), rgba(0,212,170,0.03));
}
.edit-modal-header h3 { font-family: var(--font-display); font-weight: 700; font-size: 16px; }
.close-btn {
  width: 32px; height: 32px; border-radius: 9px; border: none;
  background: var(--surface3); color: var(--text-dim); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s var(--ease-spring);
}
.close-btn:hover { background: rgba(239,68,68,0.15); color: #ef4444; transform: rotate(90deg) scale(1.1); }
.edit-modal-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.edit-modal-footer {
  display: flex; gap: 8px; padding: 14px 20px;
  border-top: 1px solid var(--border); background: var(--surface2);
}

.login-prompt {
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: 20px; padding: 36px 28px;
  width: 100%; max-width: 360px;
  text-align: center; display: flex; flex-direction: column; gap: 14px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.5);
}
.lp-icon-wrap {
  width: 70px; height: 70px; border-radius: 22px;
  background: linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,212,170,0.08));
  border: 1px solid rgba(108,99,255,0.2);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto; color: var(--accent-light);
  animation: badge-pop 0.4s var(--ease-spring);
}
.lp-icon-wrap svg { width: 32px; height: 32px; }
.login-prompt h3 { font-family: var(--font-display); font-weight: 700; font-size: 22px; }
.login-prompt p { font-size: 14px; color: var(--text-dim); line-height: 1.6; }

.alarm-modal {
  background: var(--surface);
  border: 1px solid rgba(245,158,11,0.25);
  border-radius: 20px; padding: 36px 28px;
  width: 100%; max-width: 360px;
  text-align: center; display: flex; flex-direction: column; gap: 14px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.5), 0 0 60px rgba(245,158,11,0.1);
}
.alarm-ring-icon { font-size: 64px; animation: float 0.8s ease-in-out infinite; }
.alarm-modal h3 { font-family: var(--font-mono); font-size: 36px; font-weight: 700; color: var(--warning); }
.alarm-modal p { font-size: 15px; color: var(--text-dim); }

@keyframes staggerIn {
  from { opacity: 0; transform: translateX(-10px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes bounceIn {
  0%   { transform: scale(0.3); opacity: 0; }
  60%  { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50%       { transform: translateY(-10px) rotate(5deg); }
}
@keyframes progressFill {
  from { width: 0 !important; }
}
@keyframes glowPulse {
  0%, 100% { filter: drop-shadow(0 0 0 transparent); }
  50%       { filter: drop-shadow(0 0 12px rgba(108,99,255,0.6)); }
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes badge-pop {
  0%   { transform: scale(0.6); }
  70%  { transform: scale(1.1); }
  100% { transform: scale(1); }
}
</style>
