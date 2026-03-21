<template>
  <div class="page">
    <div class="page-header">
      <div class="header-row">
        <div>
          <h1>👑 SuperAdmin Panel</h1>
          <p class="header-sub">Salom, {{ auth.profile?.full_name || auth.profile?.email }}</p>
        </div>
        <button class="btn btn-outline btn-sm" @click="goLogout">Chiqish</button>
      </div>
    </div>

    <!-- Global stats -->
    <div class="stats-overview">
      <div class="stat-card" v-for="s in globalStats" :key="s.label">
        <div class="sc-icon">{{ s.icon }}</div>
        <div class="sc-val" :style="{ color: s.color }">{{ s.value }}</div>
        <div class="sc-label">{{ s.label }}</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="admin-tabs">
      <button v-for="tab in tabs" :key="tab.id" class="admin-tab"
        :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <!-- USERS TAB -->
    <div v-if="activeTab === 'users'">
      <div class="card">
        <div class="card-title-row">
          <div class="card-title">👥 Barcha foydalanuvchilar ({{ users.length }})</div>
          <input v-model="search" class="search-input" placeholder="🔍 Qidirish..." />
        </div>
        <div class="users-list">
          <div v-for="user in filteredUsers" :key="user.id" class="user-item">
            <div class="user-avatar" :class="avatarClass(user.role)">{{ userInitials(user) }}</div>
            <div class="user-info">
              <div class="user-name">{{ user.full_name || 'Nomsiz' }}</div>
              <div class="user-email">{{ user.email }}</div>
              <div class="user-meta">
                <span class="badge" :class="roleBadgeClass(user.role)">{{ user.role }}</span>
                <span class="user-dir">{{ user.direction || '—' }}</span>
                <span class="user-date">{{ formatDate(user.created_at) }}</span>
              </div>
            </div>
            <div class="user-actions">
              <select class="select select-sm" :value="user.role" @change="changeRole(user.id, $event.target.value)">
                <option value="user">user</option>
                <option value="admin">admin</option>
                <option value="superadmin">superadmin</option>
              </select>
            </div>
          </div>
          <div v-if="!filteredUsers.length" class="empty-state">Natija topilmadi</div>
        </div>
      </div>
    </div>

    <!-- ADMINS TAB -->
    <div v-if="activeTab === 'admins'">
      <div class="card">
        <div class="card-title">🛡️ Adminlar ({{ adminUsers.length }})</div>
        <div class="users-list">
          <div v-for="admin in adminUsers" :key="admin.id" class="user-item">
            <div class="user-avatar avatar-admin">{{ userInitials(admin) }}</div>
            <div class="user-info">
              <div class="user-name">{{ admin.full_name || 'Nomsiz' }}</div>
              <div class="user-email">{{ admin.email }}</div>
              <div class="user-meta">
                <span class="badge badge-accent">{{ admin.role }}</span>
                <span class="user-date">{{ formatDate(admin.created_at) }}</span>
              </div>
            </div>
            <button v-if="admin.id !== auth.user?.id" class="btn btn-outline btn-sm" @click="changeRole(admin.id, 'user')">
              Userga tushir
            </button>
          </div>
          <div v-if="!adminUsers.length" class="empty-state">Admin topilmadi</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">📋 Barcha admin namunalari ({{ allTemplates.length }})</div>
        <div class="template-list">
          <div v-for="task in allTemplates" :key="task.id" class="template-item">
            <span class="task-icon">{{ task.icon }}</span>
            <div class="template-info">
              <div class="template-title">{{ task.title }}</div>
              <div class="template-meta">
                <span class="badge badge-accent">{{ task.category }}</span>
                <span class="task-pts">{{ task.points }} pt</span>
                <span class="task-creator">{{ getCreatorEmail(task.user_id) }}</span>
              </div>
            </div>
            <button class="btn btn-danger btn-sm" @click="deleteTemplate(task.id)">✕</button>
          </div>
          <div v-if="!allTemplates.length" class="empty-state">Namuna topilmadi</div>
        </div>
      </div>
    </div>

    <!-- STATS TAB -->
    <div v-if="activeTab === 'stats'">
      <div class="card">
        <div class="card-title">📊 Yo'nalishlar bo'yicha</div>
        <div class="dir-bars">
          <div v-for="(count, dir) in directionStats" :key="dir" class="dir-row">
            <div class="dir-label">{{ dir }}</div>
            <div class="dir-bar-wrap">
              <div class="dir-bar" :style="{ width: (count / Math.max(users.length, 1) * 100) + '%' }"></div>
            </div>
            <span class="dir-count">{{ count }}</span>
          </div>
          <div v-if="!Object.keys(directionStats).length" class="empty-state">Ma'lumot yo'q</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">👥 Rol taqsimoti</div>
        <div class="dir-bars">
          <div v-for="r in roleStats" :key="r.role" class="dir-row">
            <div class="dir-label"><span class="badge" :class="roleBadgeClass(r.role)">{{ r.role }}</span></div>
            <div class="dir-bar-wrap">
              <div class="dir-bar" :style="{ width: (r.count / Math.max(users.length, 1) * 100) + '%', background: r.color }"></div>
            </div>
            <span class="dir-count">{{ r.count }}</span>
          </div>
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

const activeTab = ref('users')
const users = ref([])
const allTemplates = ref([])
const search = ref('')

const tabs = [
  { id: 'users', icon: '👥', label: 'Foydalanuvchilar' },
  { id: 'admins', icon: '🛡️', label: 'Adminlar' },
  { id: 'stats', icon: '📊', label: 'Statistika' },
]

const filteredUsers = computed(() => {
  if (!search.value) return users.value
  const q = search.value.toLowerCase()
  return users.value.filter(u =>
    (u.full_name || '').toLowerCase().includes(q) ||
    (u.email || '').toLowerCase().includes(q) ||
    (u.role || '').includes(q)
  )
})

const adminUsers = computed(() => users.value.filter(u => u.role === 'admin' || u.role === 'superadmin'))

const globalStats = computed(() => [
  { icon: '👥', label: 'Jami foydalanuvchi', value: users.value.length, color: '#6c63ff' },
  { icon: '🛡️', label: 'Adminlar', value: users.value.filter(u => u.role === 'admin').length, color: '#f59e0b' },
  { icon: '✅', label: 'Onboarding', value: users.value.filter(u => u.onboarding_done).length, color: '#00d4aa' },
  { icon: '📋', label: 'Namunalar', value: allTemplates.value.length, color: '#ec4899' },
])

const directionStats = computed(() => {
  const stats = {}
  users.value.forEach(u => { if (u.direction) stats[u.direction] = (stats[u.direction] || 0) + 1 })
  return stats
})

const roleStats = computed(() => [
  { role: 'user', count: users.value.filter(u => u.role === 'user').length, color: '#00d4aa' },
  { role: 'admin', count: users.value.filter(u => u.role === 'admin').length, color: '#6c63ff' },
  { role: 'superadmin', count: users.value.filter(u => u.role === 'superadmin').length, color: '#f59e0b' },
])

function userInitials(u) { return (u.full_name || u.email || 'U').slice(0, 2).toUpperCase() }
function avatarClass(role) { if (role === 'superadmin') return 'avatar-super'; if (role === 'admin') return 'avatar-admin'; return '' }
function roleBadgeClass(role) { if (role === 'superadmin') return 'badge-warning'; if (role === 'admin') return 'badge-accent'; return 'badge-success' }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('uz-UZ') : '—' }
function getCreatorEmail(uid) { const u = users.value.find(u => u.id === uid); return u?.email || '—' }

async function changeRole(userId, newRole) {
  if (userId === auth.user?.id && newRole !== 'superadmin') {
    if (!confirm("O'z rolingizni o'zgartirmoqchimisiz?")) return
  }
  const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
  if (!error) { const u = users.value.find(u => u.id === userId); if (u) u.role = newRole }
}

async function deleteTemplate(id) {
  if (!confirm("Bu namunani o'chirmoqchimisiz?")) return
  await supabase.from('tasks').delete().eq('id', id)
  allTemplates.value = allTemplates.value.filter(t => t.id !== id)
}

async function goLogout() {
  await auth.logout()
  router.push('/superadmin-login')
}

onMounted(async () => {
  const { data: u } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  users.value = u || []
  const { data: t } = await supabase.from('tasks').select('*').eq('is_template', true).order('created_at', { ascending: false })
  allTemplates.value = t || []
})
</script>

<style scoped>
.page { padding: 20px 16px; max-width: 750px; margin: 0 auto; }
.page-header { margin-bottom: 20px; }
.header-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.page-header h1 { font-family: var(--font-display); font-weight: 800; font-size: 24px; }
.header-sub { font-size: 13px; color: var(--text-dim); margin-top: 2px; }
.stats-overview { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px; }
@media(min-width:500px){ .stats-overview { grid-template-columns: repeat(4, 1fr); } }
.stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; text-align: center; }
.sc-icon { font-size: 22px; margin-bottom: 6px; }
.sc-val { font-family: var(--font-display); font-weight: 800; font-size: 26px; }
.sc-label { font-size: 11px; color: var(--text-dim); margin-top: 2px; }
.admin-tabs { display: flex; gap: 6px; margin-bottom: 20px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 4px; }
.admin-tab { flex: 1; padding: 10px; background: none; border: none; color: var(--text-dim); font-family: var(--font-body); font-size: 13px; font-weight: 500; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
.admin-tab.active { background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; font-weight: 700; }
.card-title-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
.card-title-row .card-title { margin-bottom: 0; }
.search-input { padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface2); color: var(--text); font-size: 13px; width: 180px; }
.users-list { display: flex; flex-direction: column; gap: 8px; }
.user-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--surface2); border-radius: var(--radius-sm); }
.user-avatar { width: 40px; height: 40px; background: var(--accent); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
.avatar-admin { background: linear-gradient(135deg, #6c63ff, #00d4aa); }
.avatar-super { background: linear-gradient(135deg, #f59e0b, #ef4444); }
.user-info { flex: 1; min-width: 0; }
.user-name { font-weight: 600; font-size: 14px; }
.user-email { font-size: 12px; color: var(--text-dim); }
.user-meta { display: flex; align-items: center; gap: 8px; margin-top: 4px; flex-wrap: wrap; }
.user-dir { font-size: 11px; color: var(--text-dim); }
.user-date { font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); }
.user-actions { flex-shrink: 0; }
.select-sm { width: 110px; padding: 6px 8px; font-size: 12px; }
.template-list { display: flex; flex-direction: column; gap: 8px; }
.template-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: var(--surface2); border-radius: var(--radius-sm); }
.task-icon { font-size: 20px; flex-shrink: 0; }
.template-info { flex: 1; }
.template-title { font-size: 14px; margin-bottom: 4px; }
.template-meta { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.task-pts { font-family: var(--font-mono); font-size: 12px; color: var(--accent-light); }
.task-creator { font-size: 11px; color: var(--text-muted); }
.dir-bars { display: flex; flex-direction: column; gap: 10px; }
.dir-row { display: flex; align-items: center; gap: 10px; }
.dir-label { font-size: 12px; width: 120px; flex-shrink: 0; }
.dir-bar-wrap { flex: 1; height: 8px; background: var(--surface2); border-radius: 4px; overflow: hidden; }
.dir-bar { height: 100%; background: linear-gradient(135deg, #f59e0b, #ef4444); border-radius: 4px; transition: width 0.5s; }
.dir-count { font-family: var(--font-mono); font-size: 12px; color: var(--text-dim); width: 24px; }
.badge-warning { background: rgba(245,158,11,0.2); color: #f59e0b; border: 1px solid rgba(245,158,11,0.3); }
.empty-state { text-align: center; padding: 24px; color: var(--text-dim); font-size: 14px; }
</style>
