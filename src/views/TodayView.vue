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
        <svg viewBox="0 0 60 60" width="64" height="64">
          <circle cx="30" cy="30" r="24" fill="none" stroke="var(--surface3)" stroke-width="5"/>
          <circle cx="30" cy="30" r="24" fill="none" :stroke="ringColor" stroke-width="5"
            stroke-linecap="round" :stroke-dasharray="150.8"
            :stroke-dashoffset="150.8 - (150.8 * completion / 100)"
            transform="rotate(-90 30 30)" style="transition:stroke-dashoffset 0.6s"/>
          <text x="30" y="35" text-anchor="middle" fill="currentColor" font-size="11" font-family="Space Mono" font-weight="700">{{ completion }}%</text>
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
        <span class="qs-val" style="color:var(--warning)">🔥 {{ challengeDays }}</span>
        <span class="qs-label">kun challenge</span>
      </div>
      <div class="qs-divider"></div>
      <div class="qs-item">
        <span class="qs-val" style="color:var(--success)">{{ completedCount }}/{{ taskList.length }}</span>
        <span class="qs-label">vazifa</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loadingTasks" class="loading-state">
      <div class="loading-spinner"></div>
      <span>Yuklanmoqda...</span>
    </div>

    <template v-else>
      <!-- Template tasks -->
      <div v-for="(group, cat) in groupedTemplateTasks" :key="'t-' + cat" class="card">
        <div class="card-title" :style="{ color: catColor(cat) }">
          {{ catIcon(cat) }} {{ catLabel(cat) }}
        </div>
        <div class="task-list">
          <div
            v-for="task in group" :key="task.id"
            class="task-item"
            :class="{ done: doneIds.includes(task.id) }"
            @click="handleTaskClick(task.id)">
            <div class="task-check"
              :style="doneIds.includes(task.id)
                ? { background: catColor(cat), borderColor: catColor(cat) }
                : { borderColor: catColor(cat) }">
              <span v-if="doneIds.includes(task.id)">✓</span>
            </div>
            <span class="task-icon-emoji">{{ task.icon }}</span>
            <span class="task-name">{{ task.title }}</span>
            <span class="task-pts">+{{ task.points }}</span>
          </div>
        </div>
      </div>

      <!-- My Personal Tasks -->
      <div class="card my-tasks-card">
        <div class="card-title">
          <span>✏️ Mening shaxsiy vazifalarim</span>
          <span class="badge badge-accent" style="margin-left:auto">{{ myTasks.length }}</span>
        </div>

        <div v-if="myTasks.length" class="task-list" style="margin-bottom:12px">
          <div
            v-for="task in myTasks" :key="task.id"
            class="task-item task-item-personal"
            :class="{ done: doneIds.includes(task.id) }">

            <!-- Checkbox -->
            <div class="task-check personal-check"
              :style="doneIds.includes(task.id)
                ? { background: '#6c63ff', borderColor: '#6c63ff' }
                : { borderColor: '#6c63ff' }"
              @click="handleTaskClick(task.id)">
              <span v-if="doneIds.includes(task.id)">✓</span>
            </div>

            <!-- Content -->
            <span class="task-icon-emoji" @click="handleTaskClick(task.id)">{{ task.icon }}</span>
            <span class="task-name" @click="handleTaskClick(task.id)">{{ task.title }}</span>
            <span class="task-pts" @click="handleTaskClick(task.id)">+{{ task.points }}</span>

            <!-- ALWAYS VISIBLE action buttons -->
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
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div v-else class="empty-my-tasks">
          <span>Hali shaxsiy vazifa qo'shilmagan</span>
        </div>

        <!-- Add task form -->
        <div v-if="showAddTask" class="add-task-form">
          <div class="add-task-form-label">Yangi vazifa</div>
          <div class="add-row">
            <input v-model="newTask.icon" class="input icon-input" placeholder="✅" maxlength="2" />
            <input v-model="newTask.title" class="input" placeholder="Vazifa nomi..." @keyup.enter="saveTask" style="flex:1" ref="newTitleRef" />
          </div>
          <div class="add-row" style="margin-top:8px">
            <select v-model="newTask.category" class="select" style="flex:1">
              <option value="study">📚 O'quv</option>
              <option value="sport">💪 Sport</option>
              <option value="language">🌍 Til</option>
              <option value="self">🌟 O'z ustida</option>
              <option value="nutrition">🍽️ Ovqat</option>
              <option value="custom">✏️ Boshqa</option>
            </select>
            <input v-model.number="newTask.points" class="input" type="number" placeholder="Ball" style="width:80px" min="1" max="100" />
          </div>
          <div class="add-actions">
            <button class="btn btn-primary btn-sm" :disabled="saving" @click="saveTask">
              <span v-if="saving">...</span>
              <span v-else>+ Qo'shish</span>
            </button>
            <button class="btn btn-outline btn-sm" @click="cancelAdd">Bekor</button>
          </div>
        </div>

        <button v-else class="btn btn-outline btn-full add-trigger" @click="openAddTask">
          + Shaxsiy vazifa qo'shish
        </button>
      </div>
    </template>

    <!-- ===== DELETE CONFIRM MODAL ===== -->
    <Teleport to="body">
      <div v-if="deletingTask" class="modal-overlay" @click.self="deletingTask = null">
        <div class="confirm-modal">
          <div class="confirm-icon">🗑️</div>
          <h3>Vazifani o'chirish</h3>
          <p>
            <strong>"{{ deletingTask.title }}"</strong> vazifasini
            o'chirmoqchimisiz? Bu amal qaytarib bo'lmaydi.
          </p>
          <div class="confirm-actions">
            <button class="btn btn-danger" :disabled="deleting" @click="doDelete">
              <span v-if="deleting">O'chirilmoqda...</span>
              <span v-else>🗑️ O'chirish</span>
            </button>
            <button class="btn btn-outline" @click="deletingTask = null">Bekor</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== EDIT MODAL ===== -->
    <Teleport to="body">
      <div v-if="editingTask" class="modal-overlay" @click.self="cancelEdit">
        <div class="edit-modal">
          <div class="edit-modal-header">
            <h3>✎ Vazifani tahrirlash</h3>
            <button class="close-btn" @click="cancelEdit">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="edit-modal-body">
            <div class="add-row">
              <input v-model="editingTask.icon" class="input icon-input" placeholder="✅" maxlength="2" />
              <input v-model="editingTask.title" class="input" placeholder="Vazifa nomi..." @keyup.enter="saveEdit" style="flex:1" ref="editTitleRef" />
            </div>
            <div class="add-row" style="margin-top:10px">
              <select v-model="editingTask.category" class="select" style="flex:1">
                <option value="study">📚 O'quv</option>
                <option value="sport">💪 Sport</option>
                <option value="language">🌍 Til</option>
                <option value="self">🌟 O'z ustida</option>
                <option value="nutrition">🍽️ Ovqat</option>
                <option value="custom">✏️ Boshqa</option>
              </select>
              <input v-model.number="editingTask.points" class="input" type="number" placeholder="Ball" style="width:80px" min="1" max="100" />
            </div>
          </div>
          <div class="edit-modal-footer">
            <button class="btn btn-primary" :disabled="editSaving" @click="saveEdit">
              <span v-if="editSaving">Saqlanmoqda...</span>
              <span v-else>💾 Saqlash</span>
            </button>
            <button class="btn btn-outline" @click="cancelEdit">Bekor</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== LOGIN PROMPT MODAL ===== -->
    <Teleport to="body">
      <div v-if="showLoginPrompt" class="modal-overlay" @click.self="showLoginPrompt=false">
        <div class="login-prompt">
          <div class="lp-icon">🔐</div>
          <h3>Kirish kerak</h3>
          <p>Vazifalarni belgilash uchun akkauntga kiring</p>
          <router-link to="/auth" class="btn btn-primary btn-full" @click="showLoginPrompt=false">
            Kirish / Ro'yxatdan o'tish
          </router-link>
          <button class="btn btn-outline btn-full" @click="showLoginPrompt=false">Keyinroq</button>
        </div>
      </div>
    </Teleport>

    <div style="height:20px"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
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
const challengeDays = computed(() => authStore.profile?.challenge_duration || 90)

// State
const allTasks   = ref([])
const myTasks    = ref([])
const doneIds    = ref([])
const loadingTasks = ref(true)
const showLoginPrompt = ref(false)
const showAddTask = ref(false)
const saving = ref(false)
const newTask = ref({ title: '', category: 'custom', points: 10, icon: '✅' })
const newTitleRef = ref(null)

// Edit state
const editingTask = ref(null)
const editSaving = ref(false)
const editTitleRef = ref(null)

// Delete state
const deletingTask = ref(null)
const deleting = ref(false)

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

// Helpers
function catLabel(c) {
  return { study:"O'quv", sport:'Sport', language:'Til', self:"O'z ustida", nutrition:'Ovqat', custom:'Boshqa' }[c] || c
}
function catIcon(c) {
  return { study:'📚', sport:'💪', language:'🌍', self:'🌟', nutrition:'🍽️', custom:'✏️' }[c] || '✅'
}
function catColor(c) {
  return { study:'#6c63ff', sport:'#10b981', language:'#3b82f6', self:'#8b5cf6', nutrition:'#f59e0b', custom:'#ec4899' }[c] || '#6c63ff'
}

// Load
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

// Toggle completion
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

// Add task
function openAddTask() {
  showAddTask.value = true
  nextTick(() => newTitleRef.value?.focus())
}
async function saveTask() {
  if (!newTask.value.title.trim() || !authStore.user?.id) return
  saving.value = true
  try {
    const { data, error } = await supabase.from('tasks').insert({
      title: newTask.value.title.trim(),
      category: newTask.value.category,
      points: newTask.value.points || 10,
      icon: newTask.value.icon || catIcon(newTask.value.category),
      user_id: authStore.user.id,
      is_template: false,
      is_active: true,
    }).select()
    if (!error && data) { myTasks.value.unshift(data?.[0] || data); cancelAdd() }
  } catch (e) { console.error(e) }
  finally { saving.value = false }
}
function cancelAdd() {
  showAddTask.value = false
  newTask.value = { title: '', category: 'custom', points: 10, icon: '✅' }
}

// Delete (with confirm modal)
function confirmDelete(task) {
  deletingTask.value = task
}
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

// Edit
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
      title: editingTask.value.title.trim(),
      icon: editingTask.value.icon || '✅',
      category: editingTask.value.category,
      points: editingTask.value.points || 10,
    }).eq('id', editingTask.value.id).eq('user_id', authStore.user.id)
    if (!error) {
      const idx = myTasks.value.findIndex(t => t.id === editingTask.value.id)
      if (idx !== -1) myTasks.value[idx] = { ...myTasks.value[idx], ...editingTask.value }
      cancelEdit()
    }
  } catch (e) { console.error(e) }
  finally { editSaving.value = false }
}

onMounted(() => loadTasks())
</script>

<style scoped>
.page { padding: 20px 16px; max-width: 680px; margin: 0 auto; width: 100%; }
@media (min-width: 768px) { .page { padding: 32px 40px; max-width: 780px; } }

/* ── Guest Banner ── */
.guest-banner {
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(108,99,255,0.08); border: 1px solid rgba(108,99,255,0.2);
  border-radius: var(--radius); padding: 14px 16px; margin-bottom: 16px; gap: 12px;
}
.guest-text span { font-weight: 600; font-size: 14px; display: block; margin-bottom: 2px; }
.guest-text p { font-size: 12px; color: var(--text-dim); margin: 0; }

/* ── Header ── */
.today-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.greeting { font-family: var(--font-display); font-weight: 700; font-size: 22px; margin-bottom: 4px; }
.today-date { font-size: 13px; color: var(--text-dim); }
@media (min-width: 768px) { .greeting { font-size: 28px; } }
.today-ring svg text { fill: var(--text); }

/* ── Quick Stats ── */
.quick-stats {
  display: flex; align-items: center;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 14px 20px;
  margin-bottom: 18px; box-shadow: var(--shadow-sm);
}
.qs-item { flex: 1; text-align: center; }
.qs-val { display: block; font-family: var(--font-mono); font-weight: 700; font-size: 18px; }
.qs-label { font-size: 11px; color: var(--text-dim); }
.qs-divider { width: 1px; height: 32px; background: var(--border); }

/* ── Loading ── */
.loading-state { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 40px; color: var(--text-dim); }
.loading-spinner { width: 20px; height: 20px; border: 2px solid var(--border2); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Task List ── */
.task-list { display: flex; flex-direction: column; gap: 6px; }

.task-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; background: var(--surface2);
  border-radius: var(--radius-sm); cursor: pointer;
  transition: all 0.18s; border: 1px solid transparent; user-select: none;
}
.task-item:hover { border-color: var(--border2); background: var(--surface3); }
.task-item.done { opacity: 0.55; background: rgba(0,212,170,0.05); border-color: rgba(0,212,170,0.12); }

/* Personal task: cursor default because actions are separate */
.task-item-personal { border: 1px solid rgba(108,99,255,0.1); cursor: default; }
.task-item-personal:hover { border-color: rgba(108,99,255,0.22); background: var(--surface3); }

.task-check {
  width: 20px; height: 20px; border-radius: 6px; border: 2px solid;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-size: 11px; font-weight: 700; color: white; transition: all 0.2s;
}
.personal-check { cursor: pointer; }

.task-icon-emoji { font-size: 16px; flex-shrink: 0; }
.task-name { flex: 1; font-size: 14px; color: var(--text); min-width: 0; word-break: break-word; }
.task-item.done .task-name { text-decoration: line-through; color: var(--text-dim); }
.task-pts { font-family: var(--font-mono); font-size: 11px; color: var(--accent-light); flex-shrink: 0; }

/* ── Always-visible action buttons ── */
.task-actions { display: flex; gap: 4px; flex-shrink: 0; }

.task-btn {
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  border: none; border-radius: 7px; cursor: pointer;
  transition: all 0.18s; flex-shrink: 0;
}
.task-edit-btn {
  background: rgba(108,99,255,0.1);
  color: var(--accent-light);
}
.task-edit-btn:hover {
  background: rgba(108,99,255,0.22);
  color: var(--accent-light);
  transform: scale(1.08);
}
.task-delete-btn {
  background: rgba(239,68,68,0.08);
  color: #ef4444;
}
.task-delete-btn:hover {
  background: rgba(239,68,68,0.18);
  color: #dc2626;
  transform: scale(1.08);
}

[data-theme="light"] .task-edit-btn { background: rgba(108,99,255,0.08); }
[data-theme="light"] .task-delete-btn { background: rgba(239,68,68,0.06); }

/* ── My Tasks Card ── */
.my-tasks-card { border: 1px solid rgba(108,99,255,0.15); }
.empty-my-tasks {
  text-align: center; padding: 16px; color: var(--text-dim); font-size: 13px;
  border: 1px dashed var(--border2); border-radius: var(--radius-sm); margin-bottom: 12px;
}

/* ── Add task form ── */
.add-task-form-label { font-size: 11px; font-weight: 600; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; }
.add-task-form { background: var(--surface2); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 4px; border: 1px solid var(--border2); }
.add-row { display: flex; gap: 8px; }
.icon-input { width: 56px; flex-shrink: 0; text-align: center; font-size: 18px; padding: 10px 8px; }
.add-actions { display: flex; gap: 8px; margin-top: 10px; }
.add-trigger { border-style: dashed; color: var(--accent-light); border-color: rgba(108,99,255,0.3); }
.add-trigger:hover { background: rgba(108,99,255,0.06); border-color: rgba(108,99,255,0.5); }
[data-theme="light"] .add-trigger { color: var(--accent); }

/* ── Modal overlay (Teleport to body — no scoping issue) ── */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.75);
  display: flex; align-items: center; justify-content: center;
  z-index: 500; backdrop-filter: blur(8px); padding: 20px;
}

/* ── Delete Confirm Modal ── */
.confirm-modal {
  background: var(--surface); border: 1px solid var(--border2);
  border-radius: var(--radius); padding: 32px 28px;
  width: 100%; max-width: 380px;
  text-align: center; display: flex; flex-direction: column; gap: 14px;
  box-shadow: var(--shadow-lg);
  animation: modalIn 0.2s ease;
}
.confirm-icon { font-size: 48px; line-height: 1; }
.confirm-modal h3 { font-family: var(--font-display); font-weight: 700; font-size: 20px; }
.confirm-modal p { font-size: 14px; color: var(--text-dim); line-height: 1.6; }
.confirm-modal p strong { color: var(--text); }
.confirm-actions { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }

/* ── Edit Modal ── */
.edit-modal {
  background: var(--surface); border: 1px solid var(--border2);
  border-radius: var(--radius); width: 100%; max-width: 460px;
  box-shadow: var(--shadow-lg); overflow: hidden;
  animation: modalIn 0.2s ease;
}
@keyframes modalIn {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.edit-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px 16px; border-bottom: 1px solid var(--border);
  background: linear-gradient(135deg, rgba(108,99,255,0.07), rgba(0,212,170,0.03));
}
.edit-modal-header h3 { font-family: var(--font-display); font-weight: 700; font-size: 16px; }
.close-btn {
  width: 30px; height: 30px; border-radius: 8px; border: none;
  background: var(--surface3); color: var(--text-dim); cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: all 0.18s;
}
.close-btn:hover { background: rgba(239,68,68,0.15); color: #ef4444; }
.edit-modal-body { padding: 20px; }
.edit-modal-footer {
  display: flex; gap: 8px; padding: 16px 20px;
  border-top: 1px solid var(--border); background: var(--surface2);
}

/* ── Login Prompt ── */
.login-prompt {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 32px 24px;
  width: 100%; max-width: 360px;
  text-align: center; display: flex; flex-direction: column; gap: 12px;
  box-shadow: var(--shadow-lg); animation: modalIn 0.2s ease;
}
.lp-icon { font-size: 48px; }
.login-prompt h3 { font-family: var(--font-display); font-weight: 700; font-size: 20px; }
.login-prompt p { font-size: 14px; color: var(--text-dim); line-height: 1.5; }
</style>
