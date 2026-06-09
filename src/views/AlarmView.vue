<template>
  <div class="page">
    <div class="page-header">
      <h1>⏰ Budilnik</h1>
      <button class="btn btn-primary btn-sm" @click="openAdd">+ Qo'shish</button>
    </div>

    <!-- Hozirgi vaqt -->
    <div class="clock-card card">
      <div class="clock-time">{{ currentTime }}</div>
      <div class="clock-date">{{ currentDate }}</div>
      <div class="clock-status" :class="notifGranted ? 'status-ok' : 'status-warn'">
        {{ notifGranted ? '🔔 Bildirishnomalar yoqilgan' : '🔕 Bildirishnomalarni yoqing' }}
      </div>
      <button v-if="!notifGranted" class="btn btn-outline btn-sm" style="margin-top:10px" @click="requestNotif">
        Yoqish
      </button>
    </div>

    <!-- Budilniklar ro'yxati -->
    <div v-if="alarm.alarms.length === 0" class="empty-card card">
      <div style="font-size:48px">⏰</div>
      <div style="font-size:15px;font-weight:600;margin-top:8px">Budilnik yo'q</div>
      <div style="font-size:13px;color:var(--text-dim);margin-top:4px">Yangi budilnik qo'shing</div>
    </div>

    <div v-for="a in alarm.alarms" :key="a.id" class="alarm-item card">
      <div class="alarm-main">
        <div>
          <div class="alarm-time" :class="{ 'alarm-inactive': !a.is_active }">{{ a.time }}</div>
          <div class="alarm-label">{{ a.label || 'Budilnik' }}</div>
          <div class="alarm-days">
            <span v-for="(d,i) in dayNames" :key="i"
              class="day-dot"
              :class="{ active: a.days?.includes(i) }">{{ d }}</span>
          </div>
        </div>
        <div class="alarm-actions">
          <!-- Toggle switch -->
          <label class="toggle">
            <input type="checkbox" :checked="a.is_active" @change="alarm.toggleAlarm(a.id, $event.target.checked)" />
            <span class="toggle-slider"></span>
          </label>
          <button class="del-btn" @click="alarm.deleteAlarm(a.id)"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal=false">
      <div class="modal">
        <div class="modal-title">⏰ Yangi budilnik</div>

        <div class="form-group">
          <label class="label">Vaqt</label>
          <input v-model="form.time" type="time" class="input input-time" />
        </div>

        <div class="form-group">
          <label class="label">Nom (ixtiyoriy)</label>
          <input v-model="form.label" class="input" placeholder="Ertalab turish, Sport..." />
        </div>

        <div class="form-group">
          <label class="label">Kunlar</label>
          <div class="days-row">
            <button v-for="(d,i) in dayNames" :key="i"
              class="day-btn" :class="{ active: form.days.includes(i) }"
              @click="toggleDay(i)">{{ d }}</button>
          </div>
          <div style="display:flex;gap:8px;margin-top:8px">
            <button class="btn btn-outline btn-sm" @click="selectAllDays">Har kun</button>
            <button class="btn btn-outline btn-sm" @click="selectWeekdays">Ish kunlari</button>
            <button class="btn btn-outline btn-sm" @click="form.days=[]">Tozalash</button>
          </div>
        </div>

        <div style="display:flex;gap:8px;margin-top:16px">
          <button class="btn btn-primary" style="flex:1" @click="saveAlarm" :disabled="saving">
            {{ saving ? 'Saqlanmoqda...' : 'Saqlash' }}
          </button>
          <button class="btn btn-outline" @click="showModal=false">Bekor</button>
        </div>
      </div>
    </div>

    <!-- 🔔 Jiringlayotgan budilnik -->
    <div v-if="alarm.activeAlarm" class="ringing-overlay">
      <div class="ringing-card">
        <div class="ringing-anim">⏰</div>
        <div class="ringing-time">{{ alarm.activeAlarm.time }}</div>
        <div class="ringing-label">{{ alarm.activeAlarm.label || 'Budilnik' }}</div>
        <button class="btn btn-primary ringing-btn" @click="alarm.dismissAlarm()">
          ✓ To'xtatish
        </button>
        <button class="btn btn-outline ringing-btn" style="margin-top:8px" @click="snooze">
          💤 5 daqiqa keyinroq
        </button>
      </div>
    </div>

    <div style="height:80px"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAlarmStore } from '../stores/alarm.js'
import { useAuthStore } from '../stores/auth.js'

const alarm = useAlarmStore()
const auth = useAuthStore()

const dayNames = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']
const showModal = ref(false)
const saving = ref(false)
const notifGranted = ref(Notification.permission === 'granted')
const currentTime = ref('')
const currentDate = ref('')

const form = ref({ time: '07:00', label: '', days: [0,1,2,3,4] })

function openAdd() {
  form.value = { time: '07:00', label: '', days: [0,1,2,3,4] }
  showModal.value = true
}

function toggleDay(i) {
  const idx = form.value.days.indexOf(i)
  if (idx >= 0) form.value.days.splice(idx, 1)
  else form.value.days.push(i)
}

function selectAllDays() { form.value.days = [0,1,2,3,4,5,6] }
function selectWeekdays() { form.value.days = [0,1,2,3,4] }

async function saveAlarm() {
  if (!form.value.time) return
  saving.value = true
  await alarm.addAlarm({
    user_id: auth.user.id,
    time: form.value.time,
    label: form.value.label,
    days: form.value.days,
    is_active: true
  })
  showModal.value = false
  saving.value = false
}

async function requestNotif() {
  const perm = await Notification.requestPermission()
  notifGranted.value = perm === 'granted'
}

function snooze() {
  alarm.dismissAlarm()
  const now = new Date()
  now.setMinutes(now.getMinutes() + 5)
  const snoozeTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
  // Vaqtinchalik 5 daqiqa keyingi alarm
  setTimeout(() => {
    alarm.activeAlarm.value = { time: snoozeTime, label: '💤 Snooze' }
    alarm.playAlarmSound()
  }, 5 * 60 * 1000)
}

// Clock update
let clockInterval
function updateClock() {
  const now = new Date()
  const days = ['Yakshanba','Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba']
  const months = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']
  currentTime.value = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
  currentDate.value = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`
}

onMounted(async () => {
  updateClock()
  clockInterval = setInterval(updateClock, 1000)
  await alarm.fetchAlarms(auth.user.id)
  alarm.startChecking(auth.user.id)
  if (Notification.permission === 'default') {
    await Notification.requestPermission()
    notifGranted.value = Notification.permission === 'granted'
  }
})

onUnmounted(() => {
  clearInterval(clockInterval)
})
</script>

<style scoped>
.page { padding: 20px 16px; max-width: 600px; margin: 0 auto; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.page-header h1 { font-family: var(--font-display); font-weight: 800; font-size: 24px; }

.clock-card { text-align: center; padding: 28px 20px; }
.clock-time { font-family: var(--font-mono); font-size: 52px; font-weight: 700; letter-spacing: 4px; background: linear-gradient(135deg, #f59e0b, #ef4444); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.clock-date { font-size: 14px; color: var(--text-dim); margin-top: 6px; }
.clock-status { font-size: 12px; margin-top: 10px; padding: 4px 12px; border-radius: 20px; display: inline-block; }
.status-ok { background: rgba(0,212,170,0.1); color: #00d4aa; }
.status-warn { background: rgba(245,158,11,0.1); color: #f59e0b; }

.empty-card { text-align: center; padding: 48px 20px; }

.alarm-item { padding: 16px; }
.alarm-main { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.alarm-time { font-family: var(--font-mono); font-size: 36px; font-weight: 700; letter-spacing: 2px; }
.alarm-inactive { opacity: 0.4; }
.alarm-label { font-size: 13px; color: var(--text-dim); margin-top: 2px; }
.alarm-days { display: flex; gap: 4px; margin-top: 8px; }
.day-dot { font-size: 11px; width: 26px; height: 26px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: var(--surface2); color: var(--text-dim); font-weight: 600; }
.day-dot.active { background: var(--accent); color: white; }
.alarm-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

/* Toggle switch */
.toggle { position: relative; display: inline-block; width: 48px; height: 26px; cursor: pointer; }
.toggle input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; inset: 0; background: var(--surface3); border-radius: 13px; transition: 0.3s; }
.toggle-slider::before { content: ''; position: absolute; height: 20px; width: 20px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; }
.toggle input:checked + .toggle-slider { background: var(--accent); }
.toggle input:checked + .toggle-slider::before { transform: translateX(22px); }

.del-btn { background: none; border: none; font-size: 18px; cursor: pointer; opacity: 0.6; padding: 4px; }
.del-btn:hover { opacity: 1; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: flex-end; justify-content: center; z-index: 300; backdrop-filter: blur(4px); }
.modal { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius) var(--radius) 0 0; padding: 24px 16px 36px; width: 100%; max-width: 500px; }
.modal-title { font-family: var(--font-display); font-weight: 700; font-size: 18px; margin-bottom: 20px; }
.input-time { font-family: var(--font-mono); font-size: 24px; text-align: center; letter-spacing: 2px; }
.days-row { display: flex; gap: 6px; flex-wrap: wrap; }
.day-btn { width: 40px; height: 40px; border-radius: 10px; border: 1px solid var(--border); background: var(--surface2); color: var(--text-dim); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: var(--font-body); }
.day-btn.active { background: var(--accent); border-color: var(--accent); color: white; }

/* Ringing overlay */
.ringing-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(8px); }
.ringing-card { background: var(--surface); border: 2px solid var(--accent); border-radius: var(--radius); padding: 40px 32px; text-align: center; max-width: 320px; width: 90%; animation: pulse 1s ease-in-out infinite; }
@keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(108,99,255,0.4); } 50% { box-shadow: 0 0 0 20px rgba(108,99,255,0); } }
.ringing-anim { font-size: 64px; animation: shake 0.5s ease-in-out infinite; display: inline-block; }
@keyframes shake { 0%,100% { transform: rotate(-15deg); } 50% { transform: rotate(15deg); } }
.ringing-time { font-family: var(--font-mono); font-size: 48px; font-weight: 700; margin: 16px 0 8px; background: linear-gradient(135deg, #f59e0b, #ef4444); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.ringing-label { font-size: 16px; color: var(--text-dim); margin-bottom: 28px; }
.ringing-btn { width: 100%; font-size: 16px; padding: 14px; }
</style>
