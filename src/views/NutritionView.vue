<template>
  <div class="page">
    <div class="nut-header anim-fade-up">
      <h1 class="nut-title">{{ t('nutrition.title') }}</h1>
      <div class="nut-date">{{ todayFormatted }}</div>
    </div>

    <!-- ── Calorie hero ── -->
    <div class="calorie-card anim-fade-up">
      <div class="cal-bg-accent" :style="{ background: `radial-gradient(circle, ${calRingColor}22 0%, transparent 70%)` }"></div>
      <div class="cal-top">
        <div class="cal-ring-wrap">
          <svg viewBox="0 0 120 120" class="cal-svg">
            <circle cx="60" cy="60" r="48" fill="none" stroke="var(--surface3)" stroke-width="10"/>
            <circle cx="60" cy="60" r="48" fill="none" :stroke="calRingColor" stroke-width="10"
              stroke-linecap="round" :stroke-dasharray="301.6"
              :stroke-dashoffset="301.6 - (301.6 * Math.min(calPercent,100) / 100)"
              transform="rotate(-90 60 60)" style="transition:stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1); filter: drop-shadow(0 0 6px currentColor)"/>
            <text x="60" y="54" text-anchor="middle" fill="currentColor" font-size="22" font-family="Space Mono" font-weight="700">{{ totals.calories }}</text>
            <text x="60" y="73" text-anchor="middle" fill="var(--text-dim)" font-size="10" font-family="DM Sans">kcal</text>
          </svg>
        </div>
        <div class="cal-info">
          <div class="ci-row"><span>{{ t('nutrition.goal') }}</span><b>{{ dailyCalGoal }} kcal</b></div>
          <div class="ci-row"><span>{{ t('nutrition.consumed') }}</span><b :style="{color:calRingColor}">{{ totals.calories }} kcal</b></div>
          <div class="ci-row"><span>{{ t('nutrition.remaining') }}</span><b>{{ Math.max(0, dailyCalGoal - totals.calories) }} kcal</b></div>
        </div>
      </div>
      <div class="macros">
        <div v-for="m in macroItems" :key="m.label" class="macro-item">
          <div class="macro-footer"><span>{{ m.label }}</span><span class="macro-num">{{ m.val }}/{{ m.goal }}g</span></div>
          <div class="progress-track macro-track"><div class="macro-bar" :style="{ width: m.pct + '%', background: m.color, boxShadow: `0 0 8px ${m.color}` }"></div></div>
        </div>
      </div>
    </div>

    <!-- ── Recommendation ── -->
    <div class="rec-card anim-fade-up stagger-1">
      <div class="rec-icon">💡</div>
      <div>
        <div class="rec-title">{{ t('nutrition.recommendation') }}</div>
        <p class="rec-text">{{ recommendation }}</p>
      </div>
    </div>

    <!-- ── Meals ── -->
    <div v-for="(mealType, mi) in mealTypes" :key="mealType" class="meal-card anim-fade-up" :style="{ '--meal-color': mealColor(mealType), animationDelay: (0.1 + mi * 0.06) + 's' }">
      <div class="meal-header">
        <div class="meal-title-wrap">
          <span class="meal-emoji">{{ mealEmoji(mealType) }}</span>
          <span class="meal-title">{{ t(`nutrition.meals.${mealType}`) }}</span>
        </div>
        <span class="meal-cal-badge">{{ mealCalories(mealType) }} kcal</span>
      </div>
      <div class="meal-list">
        <div v-for="log in logsByMeal(mealType)" :key="log.id" class="meal-item">
          <div class="mi-body">
            <div class="mi-name">{{ log.meal_name }}</div>
            <div class="mi-macros">P:{{ log.protein_g }}g U:{{ log.carbs_g }}g Y:{{ log.fat_g }}g</div>
          </div>
          <span class="mi-cal">{{ log.calories }} kcal</span>
          <button class="del-btn" @click="nutrition.deleteLog(log.id)">✕</button>
        </div>
        <div v-if="!logsByMeal(mealType).length" class="meal-empty">Hali qo'shilmagan</div>
      </div>
      <button class="btn meal-add-btn" @click="openAdd(mealType)">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Qo'shish
      </button>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal=false">
      <div class="modal">
        <div style="font-family:var(--font-display);font-weight:700;font-size:17px;margin-bottom:16px">
          {{ mealIcon(addForm.meal_type) }} {{ t(`nutrition.meals.${addForm.meal_type}`) }}
        </div>

        <!-- AI Rasm tahlil -->
        <div class="ai-section">
          <div class="ai-label">
            📸 Rasm orqali aniqlash (AI)
            <span v-if="!auth.isPro" class="ai-pro-tag">👑 PRO</span>
          </div>
          <div v-if="previewImg" class="ai-preview-wrap">
            <img :src="previewImg" class="ai-preview-img" />
            <button class="ai-clear-btn" @click.stop="clearImage">✕</button>
          </div>
          <div v-else class="ai-actions" @dragover.prevent @drop.prevent="onDrop">
            <button class="ai-action-btn" @click="openCamera">
              <span class="ai-action-icon">📷</span>
              <span>Kamera</span>
            </button>
            <button class="ai-action-btn" @click="triggerGallery">
              <span class="ai-action-icon">🖼️</span>
              <span>Galereya</span>
            </button>
          </div>
          <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />
          <button v-if="previewImg && !aiLoading" class="btn btn-primary" style="width:100%;margin-top:8px" @click="analyzeImage">
            🔍 AI bilan tahlil qilish
          </button>
          <div v-if="aiLoading" class="ai-loading">
            <div class="ai-spinner"></div>
            <span>AI tahlil qilmoqda...</span>
          </div>
          <div v-if="aiError" class="ai-error">⚠️ {{ aiError }}</div>
          <div v-if="aiSuccess" class="ai-success">{{ aiSuccess }}</div>
        </div>

        <div class="divider"><span>yoki qo'lda kiriting</span></div>

        <div class="form-group">
          <label class="label">Ovqat nomi</label>
          <input v-model="addForm.meal_name" class="input" placeholder="Palov, Tuxum..." />
        </div>
        <div class="modal-grid">
          <div class="form-group"><label class="label">Kaloriya</label><input v-model.number="addForm.calories" class="input" type="number" placeholder="350" /></div>
          <div class="form-group"><label class="label">Oqsil (g)</label><input v-model.number="addForm.protein_g" class="input" type="number" placeholder="20" /></div>
          <div class="form-group"><label class="label">Uglevod (g)</label><input v-model.number="addForm.carbs_g" class="input" type="number" placeholder="40" /></div>
          <div class="form-group"><label class="label">Yog' (g)</label><input v-model.number="addForm.fat_g" class="input" type="number" placeholder="15" /></div>
        </div>
        <div style="margin-top:12px">
          <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:var(--text-dim)">⚡ Tez tanlash</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            <button v-for="f in quickFoods" :key="f.name" class="chip" style="font-size:12px;padding:5px 10px" @click="applyQuick(f)">{{ f.name }}</button>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:16px">
          <button class="btn btn-primary" style="flex:1" @click="saveLog">Saqlash</button>
          <button class="btn btn-outline" @click="showModal=false">Bekor</button>
        </div>
      </div>
    </div>

    <!-- Jonli kamera -->
    <div v-if="cameraOn" class="camera-overlay" @click.self="closeCamera">
      <div class="camera-box">
        <video ref="videoEl" class="camera-video" autoplay playsinline muted></video>
        <div v-if="cameraErr" class="camera-err">{{ cameraErr }}</div>
        <div class="camera-controls">
          <button class="camera-cancel" @click="closeCamera">✕</button>
          <button class="camera-shot" :disabled="!!cameraErr" @click="capturePhoto">
            <span class="camera-shot-inner"></span>
          </button>
          <button v-if="canFlip" class="camera-flip" @click="flipCamera">🔄</button>
          <span v-else style="width:44px"></span>
        </div>
      </div>
    </div>

    <ProUpsell
      :open="showUpsell"
      title="AI ovqat tahlili"
      desc="Rasmdan kaloriya va makroslarni avtomatik aniqlash — Pro imkoniyat."
      @close="showUpsell = false"
    />

    <div style="height:20px"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth.js'
import { useNutritionStore } from '../stores/nutrition.js'
import { supabase } from '../supabase.js'
import ProUpsell from '../components/ProUpsell.vue'

const showUpsell = ref(false)

const { t } = useI18n()
const auth = useAuthStore()
const nutrition = useNutritionStore()

const today = new Date()
const todayStr = today.toISOString().split('T')[0]
const months = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']
const todayFormatted = `${today.getDate()} ${months[today.getMonth()]}`
const mealTypes = ['breakfast','lunch','dinner','snack']
function mealIcon(t) { return {breakfast:'Nonushta',lunch:'Tushlik',dinner:'Kechki',snack:'Gazak'}[t]||'Ovqat' }
function mealEmoji(t) { return {breakfast:'🌅',lunch:'☀️',dinner:'🌙',snack:'🍎'}[t]||'🍽️' }
function mealColor(t) { return {breakfast:'#f59e0b',lunch:'#00d4aa',dinner:'#6c63ff',snack:'#ec4899'}[t]||'#6c63ff' }

const dailyCalGoal = computed(() => nutrition.calcDailyCalories(auth.profile) || 2000)
const macroGoals = computed(() => nutrition.getMacroRecommendation(dailyCalGoal.value, 'maintain'))
const totals = computed(() => nutrition.getDayTotals())
const calPercent = computed(() => dailyCalGoal.value ? (totals.value.calories / dailyCalGoal.value) * 100 : 0)
const calRingColor = computed(() => {
  const p = calPercent.value
  if (p > 110) return '#ef4444'; if (p >= 90) return '#00d4aa'; if (p >= 60) return '#f59e0b'; return '#6c63ff'
})
const macroItems = computed(() => [
  { label: '🥩 Oqsil', val: totals.value.protein.toFixed(0), goal: macroGoals.value.protein, pct: Math.min(100, totals.value.protein/(macroGoals.value.protein||1)*100), color: '#6c63ff' },
  { label: '🍞 Uglevod', val: totals.value.carbs.toFixed(0), goal: macroGoals.value.carbs, pct: Math.min(100, totals.value.carbs/(macroGoals.value.carbs||1)*100), color: '#f59e0b' },
  { label: '🫒 Yog\'', val: totals.value.fat.toFixed(0), goal: macroGoals.value.fat, pct: Math.min(100, totals.value.fat/(macroGoals.value.fat||1)*100), color: '#10b981' },
])
const recommendation = computed(() => {
  const rem = dailyCalGoal.value - totals.value.calories
  if (rem < 0) return `⚠️ Kunlik me'yordan ${Math.abs(rem)} kcal oshib ketdingiz.`
  if (rem < 200) return `Ajoyib! Faqat ${rem} kcal qoldi.`
  if (rem < 500) return `Yaxshi! Yana ${rem} kcal iste'mol qilishingiz mumkin.`
  return `🍽️ Bugun yana ${rem} kcal iste'mol qilishingiz kerak.`
})

function logsByMeal(type) {
  const logs = nutrition.logs
  if (!logs || !Array.isArray(logs)) return []
  return logs.filter(l => l.meal_type === type)
}
function mealCalories(type) { return logsByMeal(type).reduce((s,l) => s+(l.calories||0), 0) }

const showModal = ref(false)
const addForm = ref({ meal_name:'', meal_type:'breakfast', calories:null, protein_g:null, carbs_g:null, fat_g:null })
function openAdd(mealType) {
  addForm.value = { meal_name:'', meal_type:mealType, calories:null, protein_g:null, carbs_g:null, fat_g:null }
  clearImage()
  showModal.value = true
}

// === AI IMAGE ===
const fileInput = ref(null)
const previewImg = ref(null)
const imageBase64 = ref(null)
const aiLoading = ref(false)
const aiError = ref('')
const aiSuccess = ref('')

function triggerGallery() { fileInput.value?.click() }
function onFileChange(e) { const f = e.target.files[0]; if (f) processFile(f) }
function onDrop(e) { const f = e.dataTransfer.files[0]; if (f) processFile(f) }

// === Jonli kamera ===
const cameraOn = ref(false)
const videoEl = ref(null)
const cameraErr = ref('')
const canFlip = ref(false)
let stream = null
let facing = 'environment'

async function startStream() {
  cameraErr.value = ''
  try {
    if (stream) stream.getTracks().forEach(t => t.stop())
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facing }, audio: false,
    })
    if (videoEl.value) videoEl.value.srcObject = stream
    // Old/orqa kamera bor-yo'qligini tekshirish
    const cams = await navigator.mediaDevices.enumerateDevices()
    canFlip.value = cams.filter(d => d.kind === 'videoinput').length > 1
  } catch (e) {
    cameraErr.value = "Kameraga ruxsat berilmadi yoki topilmadi. Galereyadan tanlang."
    console.error(e)
  }
}

async function openCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    // Eski qurilma — capture bilan fayl tanlash
    fileInput.value?.setAttribute('capture', 'environment')
    fileInput.value?.click()
    return
  }
  cameraOn.value = true
  await nextTick()
  startStream()
}

function closeCamera() {
  cameraOn.value = false
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null }
}

async function flipCamera() {
  facing = facing === 'environment' ? 'user' : 'environment'
  await startStream()
}

function capturePhoto() {
  const v = videoEl.value
  if (!v) return
  const canvas = document.createElement('canvas')
  canvas.width = v.videoWidth || 640
  canvas.height = v.videoHeight || 480
  canvas.getContext('2d').drawImage(v, 0, 0, canvas.width, canvas.height)
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
  previewImg.value = dataUrl
  imageBase64.value = dataUrl.split(',')[1]
  aiError.value = ''; aiSuccess.value = ''
  closeCamera()
}

function processFile(file) {
  aiError.value = ''; aiSuccess.value = ''
  const reader = new FileReader()
  reader.onload = ev => {
    previewImg.value = ev.target.result
    imageBase64.value = ev.target.result.split(',')[1]
  }
  reader.readAsDataURL(file)
}

function clearImage() {
  previewImg.value = null; imageBase64.value = null
  aiError.value = ''; aiSuccess.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

async function analyzeImage() {
  if (!imageBase64.value) return
  if (!auth.isPro) { showUpsell.value = true; return }
  aiLoading.value = true; aiError.value = ''; aiSuccess.value = ''
  try {
    // AI kaliti serverda (Edge Function) — brauzerdan chaqirmaymiz
    const { data, error } = await supabase.functions.invoke('analyze-food', {
      body: { image_base64: imageBase64.value, media_type: 'image/jpeg' }
    })
    if (error) throw error
    if (data?.error) throw new Error(data.error)

    addForm.value.meal_name = data.meal_name || ''
    addForm.value.calories = data.calories || null
    addForm.value.protein_g = data.protein_g || null
    addForm.value.carbs_g = data.carbs_g || null
    addForm.value.fat_g = data.fat_g || null
    aiSuccess.value = `"${data.meal_name}" aniqlandi — ${data.calories} kcal`
  } catch (e) {
    aiError.value = 'Tahlil qilib bo\'lmadi. Qo\'lda kiriting.'
  } finally {
    aiLoading.value = false
  }
}

const quickFoods = [
  { name:'Tuxum',calories:78,protein_g:6,carbs_g:1,fat_g:5 },
  { name:'Non',calories:80,protein_g:3,carbs_g:15,fat_g:1 },
  { name:'Guruch 100g',calories:130,protein_g:3,carbs_g:28,fat_g:0 },
  { name:'Tovuq 100g',calories:165,protein_g:31,carbs_g:0,fat_g:4 },
  { name:'Palov 200g',calories:320,protein_g:12,carbs_g:40,fat_g:12 },
  { name:'Olma',calories:52,protein_g:0,carbs_g:14,fat_g:0 },
  { name:'Sut 200ml',calories:120,protein_g:6,carbs_g:10,fat_g:5 },
  { name:'Banan',calories:89,protein_g:1,carbs_g:23,fat_g:0 },
]
function applyQuick(f) {
  addForm.value.meal_name = f.name
  addForm.value.calories = f.calories
  addForm.value.protein_g = f.protein_g
  addForm.value.carbs_g = f.carbs_g
  addForm.value.fat_g = f.fat_g
}
async function saveLog() {
  if (!addForm.value.meal_name) return
  await nutrition.addLog({ ...addForm.value, log_date: todayStr })
  showModal.value = false
}

onMounted(() => nutrition.fetchLogs(todayStr))
onUnmounted(() => { if (stream) stream.getTracks().forEach(t => t.stop()) })
</script>

<style scoped>
.page { padding: 16px; max-width: 700px; margin: 0 auto; }
@media(min-width:768px){ .page { padding: 28px 40px; max-width: 860px; } }

.nut-header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 16px; }
.nut-title {
  font-family: var(--font-display); font-weight: 800; font-size: 26px;
  background: linear-gradient(135deg, var(--text) 50%, var(--accent2));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.nut-date { font-size: 13px; color: var(--text-dim); font-weight: 500; }

/* ── Calorie hero ── */
.calorie-card {
  position: relative;
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 12px;
  box-shadow: var(--shadow);
  overflow: hidden;
}
.cal-bg-accent {
  position: absolute;
  top: -60px; left: -40px;
  width: 200px; height: 200px;
  border-radius: 50%;
  pointer-events: none;
}
.cal-top { position: relative; display: flex; align-items: center; gap: 22px; margin-bottom: 18px; flex-wrap: wrap; }
.cal-ring-wrap { flex-shrink: 0; }
.cal-svg { width: 108px; height: 108px; color: var(--text); }
.cal-info { flex: 1; min-width: 140px; display: flex; flex-direction: column; gap: 10px; }
.ci-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--text-dim); }
.ci-row b { color: var(--text); font-family: var(--font-mono); font-size: 14px; }

.macros { position: relative; display: flex; flex-direction: column; gap: 12px; }
.macro-item { display: flex; flex-direction: column; gap: 5px; }
.macro-track { height: 7px; }
.macro-bar { height: 100%; border-radius: 10px; transition: width 1s var(--ease-out); animation: progressFill 1.2s var(--ease-out) both; }
.macro-footer { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--text); font-weight: 500; }
.macro-num { font-family: var(--font-mono); font-size: 11px; color: var(--text-dim); }

/* ── Recommendation ── */
.rec-card {
  display: flex; align-items: flex-start; gap: 14px;
  background: linear-gradient(135deg, rgba(108,99,255,0.08), transparent);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: var(--radius);
  padding: 16px 18px;
  margin-bottom: 12px;
}
.rec-icon { font-size: 24px; animation: float 3s ease-in-out infinite; }
.rec-title { font-family: var(--font-display); font-weight: 700; font-size: 14px; margin-bottom: 4px; }
.rec-text { font-size: 13px; line-height: 1.6; color: var(--text-dim); }

/* ── Meal cards ── */
.meal-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-top: 3px solid var(--meal-color, var(--accent));
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s;
}
.meal-card:hover { box-shadow: var(--shadow); }
.meal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.meal-title-wrap { display: flex; align-items: center; gap: 8px; }
.meal-emoji { font-size: 18px; }
.meal-title { font-family: var(--font-display); font-weight: 700; font-size: 15px; }
.meal-cal-badge {
  font-family: var(--font-mono); font-size: 12px; font-weight: 700;
  color: var(--meal-color, var(--warning));
  background: color-mix(in srgb, var(--meal-color, var(--warning)) 14%, transparent);
  padding: 3px 10px; border-radius: 8px;
}
.meal-list { display: flex; flex-direction: column; gap: 6px; }
.meal-item {
  display: flex; align-items: center; gap: 10px;
  padding: 11px 12px; background: var(--surface2);
  border-radius: var(--radius-sm);
  transition: background 0.18s, transform 0.18s;
}
.meal-item:hover { background: var(--surface3); transform: translateX(2px); }
.mi-body { flex: 1; min-width: 0; }
.mi-name { font-size: 14px; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mi-macros { font-size: 11px; color: var(--text-dim); font-family: var(--font-mono); }
.mi-cal { font-family: var(--font-mono); font-size: 12px; color: var(--accent-light); flex-shrink: 0; font-weight: 700; }
.meal-empty { font-size: 13px; color: var(--text-dim); text-align: center; padding: 14px; }
.meal-add-btn {
  width: 100%; margin-top: 10px;
  background: transparent;
  border: 1.5px dashed color-mix(in srgb, var(--meal-color, var(--accent)) 40%, transparent);
  color: var(--meal-color, var(--accent-light));
  font-size: 13px;
  gap: 6px;
}
.meal-add-btn:hover { background: color-mix(in srgb, var(--meal-color, var(--accent)) 8%, transparent); transform: none; }
.del-btn { background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: 14px; padding: 4px 6px; flex-shrink: 0; border-radius: var(--radius-xs); transition: all 0.18s; }
.del-btn:hover { background: rgba(239,68,68,0.1); color: var(--danger); }

@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@keyframes progressFill { from { width: 0 !important; } }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: flex-end; justify-content: center; z-index: 300; backdrop-filter: blur(4px); }
.modal { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius) var(--radius) 0 0; padding: 20px 16px 32px; width: 100%; max-width: 520px; max-height: 88vh; overflow-y: auto; }
.modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ai-section { margin-bottom: 4px; }
.ai-label { font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--accent-light); display: flex; align-items: center; gap: 8px; }
.ai-pro-tag { font-size: 10px; font-weight: 800; color: #f59e0b; background: rgba(245,158,11,0.15); padding: 2px 8px; border-radius: 8px; letter-spacing: 0.05em; }
.ai-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ai-action-btn {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 20px 12px;
  border: 2px dashed var(--border2); border-radius: var(--radius-sm);
  background: var(--surface2); color: var(--text);
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all 0.2s var(--ease-spring);
}
.ai-action-btn:hover { border-color: var(--accent); background: rgba(108,99,255,0.06); transform: translateY(-2px); }
.ai-action-icon { font-size: 30px; }

/* Jonli kamera */
.camera-overlay {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(0,0,0,0.92);
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.camera-box { width: 100%; max-width: 460px; }
.camera-video {
  width: 100%; border-radius: 18px;
  aspect-ratio: 3/4; object-fit: cover;
  background: #000;
}
.camera-err { color: #fca5a5; font-size: 13px; text-align: center; padding: 12px; }
.camera-controls {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 18px; padding: 0 20px;
}
.camera-cancel {
  width: 44px; height: 44px; border-radius: 50%; border: none;
  background: rgba(255,255,255,0.15); color: white; font-size: 18px; cursor: pointer;
}
.camera-shot {
  width: 70px; height: 70px; border-radius: 50%;
  border: 4px solid white; background: transparent; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.15s;
}
.camera-shot:active { transform: scale(0.92); }
.camera-shot:disabled { opacity: 0.4; }
.camera-shot-inner { width: 54px; height: 54px; border-radius: 50%; background: white; }
.camera-flip {
  width: 44px; height: 44px; border-radius: 50%; border: none;
  background: rgba(255,255,255,0.15); font-size: 18px; cursor: pointer;
}
.ai-preview-wrap { position: relative; width: 100%; }
.ai-preview-img { width: 100%; max-height: 180px; object-fit: cover; border-radius: 8px; }
.ai-clear-btn { position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; }
.ai-loading { display: flex; align-items: center; gap: 10px; padding: 10px; color: var(--text-dim); font-size: 13px; }
.ai-spinner { width: 20px; height: 20px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.ai-error { color: #ef4444; font-size: 13px; padding: 8px; background: rgba(239,68,68,0.1); border-radius: var(--radius-xs); margin-top: 6px; }
.ai-success { color: #10b981; font-size: 13px; padding: 8px; background: rgba(16,185,129,0.1); border-radius: var(--radius-xs); margin-top: 6px; }
.divider { display: flex; align-items: center; gap: 10px; margin: 14px 0; color: var(--text-dim); font-size: 12px; }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
</style>
