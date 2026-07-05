<template>
  <div class="page">
    <div class="sch-header anim-fade-up">
      <h1 class="sch-h1">{{ t('nav.schedule') }}</h1>
    </div>

    <!-- Day selector -->
    <div class="day-tabs anim-fade-up">
      <button v-for="(d,i) in dayNames" :key="i" class="day-tab" :class="{ active: selectedDow === i, today: i === todayDow }" @click="selectedDow = i">{{ d }}</button>
    </div>

    <!-- Time blocks for day -->
    <div class="sch-card card-schedule anim-fade-up stagger-1">
      <div class="sch-card-title">
        <span class="sct-icon">🗓️</span>
        {{ dayNames[selectedDow] }} kunlik jadval
      </div>
      <div class="schedule-list">
        <div v-for="(block, bi) in dayBlocks" :key="block.id || block.time" class="schedule-item" :style="{ '--block-color': block.color || 'var(--accent)', animationDelay: (bi * 0.04) + 's' }">
          <div class="si-time">{{ block.start_time || block.time }}</div>
          <div class="si-dot"></div>
          <div class="si-content">
            <div class="si-title">{{ block.title }}</div>
            <div v-if="block.end_time" class="si-end">— {{ block.end_time }}</div>
          </div>
          <button v-if="block.id" class="del-btn" @click="deleteBlock(block.id)">✕</button>
        </div>
      </div>
    </div>

    <!-- Add time block -->
    <div class="sch-card card-add anim-fade-up stagger-2">
      <div class="sch-card-title"><span class="sct-icon">➕</span> Vaqt bloki qo'shish</div>
      <div class="form-group">
        <label class="label">Nomi</label>
        <input v-model="newBlock.title" class="input" placeholder="Dars, Ish, Sport..." />
      </div>
      <div class="form-group">
        <label class="label">Kunlar</label>
        <div class="chip-row">
          <button v-for="(d,i) in dayNames" :key="i" class="chip" :class="{ active: newBlock.days.includes(i) }" @click="toggleDay(i)">{{ d }}</button>
        </div>
      </div>
      <div class="time-twin">
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
      <button class="btn btn-primary btn-full btn-ripple" @click="addBlock">Qo'shish</button>
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
  { time: '06:00', title: ' Uyg\'onish + Namoz', color: '#6366f1' },
  { time: '06:30', title: ' Sport', color: '#10b981' },
  { time: '07:30', title: '🍳 Nonushta', color: '#9ca3af' },
  { time: '20:00', title: ' Kunlik tahlil', color: '#8b5cf6' },
  { time: '23:00', title: ' Uyqu', color: '#4f46e5' },
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
  }).select()
  if (data) userBlocks.value.push(data?.[0] || data)
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
.page { padding: 16px; max-width: 600px; margin: 0 auto; }
.sch-header { margin-bottom: 16px; }
.sch-h1 {
  font-family: var(--font-display); font-weight: 800; font-size: 26px;
  background: linear-gradient(135deg, var(--text) 50%, var(--accent-light));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

/* ── Day tabs ── */
.day-tabs {
  display: flex; gap: 5px; padding: 6px;
  overflow-x: auto;
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
}
.day-tab {
  flex: 1; background: var(--surface2); border: 1px solid var(--border);
  color: var(--text-dim); font-family: var(--font-mono); font-size: 12px; font-weight: 700;
  padding: 11px 4px; border-radius: 10px; cursor: pointer;
  transition: all 0.2s var(--ease-spring); white-space: nowrap;
  position: relative;
}
.day-tab:hover:not(.active) { background: var(--surface3); transform: translateY(-1px); }
.day-tab.today:not(.active) { border-color: rgba(108,99,255,0.3); color: var(--accent-light); }
.day-tab.active {
  background: linear-gradient(135deg, var(--accent), #8b5cf6);
  color: white; border-color: transparent;
  box-shadow: 0 3px 12px rgba(108,99,255,0.4);
}

/* ── Cards ── */
.sch-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
}
.card-schedule { border-top: 3px solid var(--accent); }
.card-add { border-top: 3px solid var(--accent2); }
.sch-card-title {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--font-display); font-weight: 700; font-size: 15px;
  margin-bottom: 14px;
}
.sct-icon { font-size: 16px; }

/* ── Schedule list ── */
.schedule-list { display: flex; flex-direction: column; gap: 6px; }
.schedule-item {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 14px; background: var(--surface2);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--block-color, var(--accent));
  transition: all 0.18s;
  animation: staggerIn 0.3s var(--ease-out) both;
}
.schedule-item:hover { background: var(--surface3); transform: translateX(3px); }
.si-time { font-family: var(--font-mono); font-size: 13px; color: var(--text); font-weight: 700; width: 44px; flex-shrink: 0; }
.si-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--block-color, var(--accent)); flex-shrink: 0; box-shadow: 0 0 6px var(--block-color, var(--accent)); }
.si-content { flex: 1; min-width: 0; }
.si-title { font-size: 14px; font-weight: 500; }
.si-end { font-size: 12px; color: var(--text-dim); }
.del-btn { background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: 14px; padding: 4px 6px; border-radius: var(--radius-xs); transition: all 0.18s; }
.del-btn:hover { color: var(--danger); background: rgba(239,68,68,0.1); }

/* ── Add form ── */
.chip-row { display: flex; flex-wrap: wrap; gap: 6px; }
.time-twin { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

@keyframes staggerIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
</style>
