<template>
  <div class="page">
    <div class="page-header">
      <h1>{{ t('nav.schedule') }}</h1>
    </div>

    <!-- Day selector -->
    <div class="day-tabs card">
      <button v-for="(d,i) in dayNames" :key="i" class="day-tab" :class="{ active: selectedDow === i }" @click="selectedDow = i">{{ d }}</button>
    </div>

    <!-- Time blocks for day -->
    <div class="card">
      <div class="card-title">⏰ {{ dayNames[selectedDow] }} kunlik jadval</div>
      <div class="schedule-list">
        <div v-for="block in dayBlocks" :key="block.id || block.time" class="schedule-item" :style="{ borderLeftColor: block.color || 'var(--accent)' }">
          <div class="si-time">{{ block.start_time || block.time }}</div>
          <div class="si-content">
            <div class="si-title">{{ block.title }}</div>
            <div v-if="block.end_time" class="si-end">— {{ block.end_time }}</div>
          </div>
          <button v-if="block.id" class="del-btn" @click="deleteBlock(block.id)">✕</button>
        </div>
      </div>
    </div>

    <!-- Add time block -->
    <div class="card">
      <div class="card-title">➕ Vaqt bloki qo'shish</div>
      <div class="form-group">
        <label class="label">Nomi</label>
        <input v-model="newBlock.title" class="input" placeholder="Dars, Ish, Sport..." />
      </div>
      <div class="form-group">
        <label class="label">Kunlar</label>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          <button v-for="(d,i) in dayNames" :key="i" class="chip" :class="{ active: newBlock.days.includes(i) }" @click="toggleDay(i)">{{ d }}</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group">
          <label class="label">Boshlanish</label>
          <select v-model="newBlock.start_time" class="select">
            <option v-for="time in timeOptions" :key="time" :value="time">{{ time }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="label">Tugash</label>
          <select v-model="newBlock.end_time" class="select">
            <option v-for="time in timeOptions" :key="time" :value="time">{{ time }}</option>
          </select>
        </div>
      </div>
      <button class="btn btn-primary btn-full" @click="addBlock">Qo'shish</button>
    </div>

    <div style="height:80px"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth.js'
import { supabase } from '../supabase.js'

const { t } = useI18n()
const auth = useAuthStore()

const today = new Date()
const todayDow = today.getDay() === 0 ? 6 : today.getDay() - 1
const selectedDow = ref(todayDow)

const dayNames = ['Du','Se','Ch','Pa','Ju','Sh','Ya']

const timeOptions = []
for (let h = 5; h <= 23; h++) {
  for (let m of ['00','30']) timeOptions.push(`${String(h).padStart(2,'0')}:${m}`)
}

const userBlocks = ref([])

const defaultBlocks = [
  { time: '06:00', title: '☀️ Uyg\'onish + Namoz', color: '#6366f1' },
  { time: '06:30', title: '💪 Sport', color: '#10b981' },
  { time: '07:30', title: '🍳 Nonushta', color: '#9ca3af' },
  { time: '20:00', title: '🪞 Kunlik tahlil', color: '#8b5cf6' },
  { time: '23:00', title: '🌙 Uyqu', color: '#4f46e5' },
]

const dayBlocks = computed(() => {
  const custom = userBlocks.value
    .filter(b => b.day_of_week?.includes(selectedDow.value + 1) || b.day_of_week?.includes(selectedDow.value === 6 ? 0 : selectedDow.value + 1))
    .map(b => ({ ...b, color: b.color || '#6c63ff' }))
  return [...defaultBlocks, ...custom].sort((a, b) => (a.start_time || a.time || '').localeCompare(b.start_time || b.time || ''))
})

const newBlock = ref({ title: '', days: [], start_time: '09:00', end_time: '11:00' })

function toggleDay(i) {
  const idx = newBlock.value.days.indexOf(i)
  if (idx === -1) newBlock.value.days.push(i)
  else newBlock.value.days.splice(idx, 1)
}

async function addBlock() {
  if (!newBlock.value.title) return
  const { data } = await supabase.from('time_blocks').insert({
    user_id: auth.user?.id,
    title: newBlock.value.title,
    day_of_week: newBlock.value.days.map(d => d + 1),
    start_time: newBlock.value.start_time,
    end_time: newBlock.value.end_time,
    color: '#6c63ff'
  }).select().single()
  if (data) userBlocks.value.push(data)
  newBlock.value = { title: '', days: [], start_time: '09:00', end_time: '11:00' }
}

async function deleteBlock(id) {
  await supabase.from('time_blocks').delete().eq('id', id)
  userBlocks.value = userBlocks.value.filter(b => b.id !== id)
}

onMounted(async () => {
  const { data } = await supabase.from('time_blocks').select('*').eq('user_id', auth.user?.id)
  userBlocks.value = data || []
})
</script>

<style scoped>
.page { padding: 20px 16px; max-width: 600px; margin: 0 auto; }
.page-header { margin-bottom: 20px; }
.page-header h1 { font-family: var(--font-display); font-weight: 800; font-size: 24px; }
.day-tabs { display: flex; gap: 4px; padding: 6px; overflow-x: auto; }
.day-tab { flex: 1; background: var(--surface2); border: 1px solid var(--border); color: var(--text-dim); font-family: var(--font-mono); font-size: 12px; font-weight: 700; padding: 10px 4px; border-radius: 10px; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
.day-tab.active { background: var(--accent); color: white; border-color: var(--accent); }
.schedule-list { display: flex; flex-direction: column; gap: 6px; }
.schedule-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: var(--surface2); border-radius: var(--radius-sm); border-left: 3px solid var(--accent); }
.si-time { font-family: var(--font-mono); font-size: 13px; color: var(--text-dim); width: 44px; flex-shrink: 0; }
.si-content { flex: 1; }
.si-title { font-size: 14px; }
.si-end { font-size: 12px; color: var(--text-dim); }
.del-btn { background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: 14px; padding: 4px; }
.del-btn:hover { color: var(--danger); }
</style>
