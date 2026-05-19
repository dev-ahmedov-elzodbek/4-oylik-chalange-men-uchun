<template>
  <div class="page">
    <div class="page-header">
      <div class="header-row">
        <div>
          <h1>🛡️ Admin Panel</h1>
          <p class="header-sub">Salom, {{ auth.profile?.full_name || auth.profile?.email }}</p>
        </div>
        <button class="btn btn-outline btn-sm" @click="goLogout">Chiqish</button>
      </div>
    </div>

    <div class="admin-tabs">
      <button v-for="tab in adminTabs" :key="tab.id" class="admin-tab"
        :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <!-- TEMPLATES TAB -->
    <div v-if="activeTab === 'templates'">
      <div class="card">
        <div class="card-title">📋 Mening namuna vazifalarim</div>
        <div class="template-list">
          <div v-for="task in myTemplateTasks" :key="task.id" class="template-item">
            <span class="task-icon">{{ task.icon }}</span>
            <div class="template-info">
              <div class="template-title">{{ task.title }}</div>
              <div class="template-meta">
                <span class="badge badge-accent">{{ task.category }}</span>
                <span class="task-pts">{{ task.points }} pt</span>
              </div>
            </div>
            <div class="template-actions">
              <button class="btn btn-outline btn-sm" @click="editTemplate(task)">✏️</button>
              <button class="btn btn-danger btn-sm" @click="deleteTemplate(task.id)">✕</button>
            </div>
          </div>
          <div v-if="!myTemplateTasks.length" class="empty-state">Hali namuna qo'shilmagan</div>
        </div>
        <button class="btn btn-primary btn-full" style="margin-top:12px" @click="showTemplateForm=true">
          + Yangi namuna qo'shish
        </button>
      </div>

      <div v-if="showTemplateForm" class="card">
        <div class="card-title">{{ editingTemplate ? '✏️ Tahrirlash' : '➕ Yangi namuna' }}</div>
        <div class="form-group">
          <label class="label">Nomi</label>
          <input v-model="tForm.title" class="input" placeholder="Vazifa nomi" />
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
          <div class="form-group">
            <label class="label">Kategoriya</label>
            <select v-model="tForm.category" class="select">
              <option value="study">📚 O'quv</option>
              <option value="sport">💪 Sport</option>
              <option value="language">🌍 Til</option>
              <option value="self">🌟 O'z ustida</option>
              <option value="nutrition">🍽️ Ovqat</option>
              <option value="custom">✏️ Boshqa</option>
            </select>
          </div>
          <div class="form-group">
            <label class="label">Ikonka</label>
            <input v-model="tForm.icon" class="input" placeholder="✅" />
          </div>
          <div class="form-group">
            <label class="label">Ball</label>
            <input v-model.number="tForm.points" class="input" type="number" />
          </div>
        </div>
        <div v-if="formError" class="error-msg">⚠️ {{ formError }}</div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary btn-sm" :disabled="saving" @click="saveTemplate">
            {{ saving ? 'Saqlanmoqda...' : 'Saqlash' }}
          </button>
          <button class="btn btn-outline btn-sm" @click="cancelTemplate">Bekor</button>
        </div>
      </div>
    </div>

    <!-- STATS TAB -->
    <div v-if="activeTab === 'stats'">
      <div class="stats-overview">
        <div class="stat-card" v-for="s in myStats" :key="s.label">
          <div class="sc-icon">{{ s.icon }}</div>
          <div class="sc-val" :style="{ color: s.color }">{{ s.value }}</div>
          <div class="sc-label">{{ s.label }}</div>
        </div>
      </div>
      <div class="card">
        <div class="card-title">ℹ️ Admin huquqlari</div>
        <div class="info-list">
          <div class="info-row">✅ Namuna vazifalar yaratish va tahrirlash</div>
          <div class="info-row">✅ O'z namunalarini o'chirish</div>
          <div class="info-row">❌ Boshqa foydalanuvchilarni ko'rish — faqat SuperAdmin</div>
          <div class="info-row">❌ Rol o'zgartirish — faqat SuperAdmin</div>
        </div>
      </div>
    </div>

    <div style="height:80px"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { supabase } from '../supabase.js'

const router = useRouter()
const auth = useAuthStore()

const activeTab = ref('templates')
const myTemplateTasks = ref([])
const showTemplateForm = ref(false)
const editingTemplate = ref(null)
const saving = ref(false)
const formError = ref('')
const tForm = ref({ title: '', category: 'study', icon: '✅', points: 10 })

const adminTabs = [
  { id: 'templates', icon: '📋', label: 'Namunalar' },
  { id: 'stats', icon: '📊', label: 'Statistika' },
]

const myStats = computed(() => [
  { icon: '📋', label: 'Jami namunalar', value: myTemplateTasks.value.length, color: '#f59e0b' },
  { icon: '✅', label: 'Faol namunalar', value: myTemplateTasks.value.filter(t => t.is_active !== false).length, color: '#00d4aa' },
])

function editTemplate(task) {
  editingTemplate.value = task
  tForm.value = { title: task.title, category: task.category, icon: task.icon, points: task.points }
  showTemplateForm.value = true
}

async function saveTemplate() {
  formError.value = ''
  if (!tForm.value.title?.trim()) { formError.value = 'Vazifa nomini kiriting'; return }
  saving.value = true
  try {
    if (editingTemplate.value) {
      const { data, error } = await supabase.from('tasks').update({ ...tForm.value }).eq('id', editingTemplate.value.id).select()
      if (error) throw error
      const idx = myTemplateTasks.value.findIndex(t => t.id === editingTemplate.value.id)
      if (idx !== -1) myTemplateTasks.value[idx] = data
    } else {
      const { data, error } = await supabase.from('tasks').insert({ ...tForm.value, is_template: true, user_id: auth.user.id }).select()
      if (error) throw error
      myTemplateTasks.value.unshift(data)
    }
    cancelTemplate()
  } catch (e) {
    formError.value = e.message || 'Xatolik yuz berdi'
  } finally {
    saving.value = false
  }
}

async function deleteTemplate(id) {
  if (!confirm("Namunani o'chirmoqchimisiz?")) return
  await supabase.from('tasks').delete().eq('id', id)
  myTemplateTasks.value = myTemplateTasks.value.filter(t => t.id !== id)
}

function cancelTemplate() {
  showTemplateForm.value = false
  editingTemplate.value = null
  formError.value = ''
  tForm.value = { title: '', category: 'study', icon: '✅', points: 10 }
}

async function goLogout() {
  await auth.logout()
  router.push('/admin-login')
}

onMounted(async () => {
  if (!auth.user?.id) return
  const { data } = await supabase.from('tasks').select('*').eq('is_template', true).eq('user_id', auth.user.id).order('created_at', { ascending: false })
  myTemplateTasks.value = data || []
})
</script>

<style scoped>
.page { padding: 20px 16px; max-width: 700px; margin: 0 auto; }
.page-header { margin-bottom: 20px; }
.header-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.page-header h1 { font-family: var(--font-display); font-weight: 800; font-size: 24px; }
.header-sub { font-size: 13px; color: var(--text-dim); margin-top: 2px; }
.admin-tabs { display: flex; gap: 6px; margin-bottom: 20px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 4px; }
.admin-tab { flex: 1; padding: 10px; background: none; border: none; color: var(--text-dim); font-family: var(--font-body); font-size: 13px; font-weight: 500; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
.admin-tab.active { background: var(--accent); color: white; font-weight: 700; }
.template-list { display: flex; flex-direction: column; gap: 8px; }
.template-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: var(--surface2); border-radius: var(--radius-sm); }
.task-icon { font-size: 20px; flex-shrink: 0; }
.template-info { flex: 1; }
.template-title { font-size: 14px; margin-bottom: 4px; }
.template-meta { display: flex; gap: 8px; align-items: center; }
.task-pts { font-family: var(--font-mono); font-size: 12px; color: var(--accent-light); }
.template-actions { display: flex; gap: 6px; }
.stats-overview { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px; }
.stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; text-align: center; }
.sc-icon { font-size: 24px; margin-bottom: 8px; }
.sc-val { font-family: var(--font-display); font-weight: 800; font-size: 28px; }
.sc-label { font-size: 12px; color: var(--text-dim); margin-top: 4px; }
.info-list { display: flex; flex-direction: column; gap: 8px; }
.info-row { font-size: 13px; padding: 8px 12px; background: var(--surface2); border-radius: var(--radius-sm); }
.error-msg { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #ef4444; padding: 10px 12px; border-radius: var(--radius-sm); font-size: 13px; margin-bottom: 12px; }
.empty-state { text-align: center; padding: 24px; color: var(--text-dim); font-size: 14px; }
</style>
