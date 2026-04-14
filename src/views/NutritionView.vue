<template>
  <div class="page">
    <div class="page-header">
      <h1>{{ t('nutrition.title') }}</h1>
      <div style="font-size:13px;color:var(--text-dim)">{{ todayFormatted }}</div>
    </div>

    <!-- Calorie Summary -->
    <div class="card calorie-card">
      <div class="cal-top">
        <svg viewBox="0 0 120 120" class="cal-svg">
          <circle cx="60" cy="60" r="48" fill="none" stroke="var(--surface3)" stroke-width="10"/>
          <circle cx="60" cy="60" r="48" fill="none" :stroke="calRingColor" stroke-width="10"
            stroke-linecap="round" :stroke-dasharray="301.6"
            :stroke-dashoffset="301.6 - (301.6 * Math.min(calPercent,100) / 100)"
            transform="rotate(-90 60 60)" style="transition:stroke-dashoffset 0.6s"/>
          <text x="60" y="54" text-anchor="middle" fill="currentColor" font-size="20" font-family="Space Mono" font-weight="700">{{ totals.calories }}</text>
          <text x="60" y="72" text-anchor="middle" fill="#6b7280" font-size="10" font-family="DM Sans">kcal</text>
        </svg>
        <div class="cal-info">
          <div class="ci-row"><span>{{ t('nutrition.goal') }}</span><b>{{ dailyCalGoal }} kcal</b></div>
          <div class="ci-row"><span>{{ t('nutrition.consumed') }}</span><b :style="{color:calRingColor}">{{ totals.calories }} kcal</b></div>
          <div class="ci-row"><span>{{ t('nutrition.remaining') }}</span><b>{{ Math.max(0, dailyCalGoal - totals.calories) }} kcal</b></div>
        </div>
      </div>
      <div class="macros">
        <div v-for="m in macroItems" :key="m.label" class="macro-item">
          <div class="macro-bar-wrap"><div class="macro-bar" :style="{ width: m.pct + '%', background: m.color }"></div></div>
          <div class="macro-footer"><span>{{ m.label }}</span><span style="font-family:var(--font-mono);font-size:11px">{{ m.val }}/{{ m.goal }}g</span></div>
        </div>
      </div>
    </div>

    <!-- Recommendation -->
    <div class="card rec-card">
      <div class="card-title">💡 {{ t('nutrition.recommendation') }}</div>
      <p style="font-size:13px;line-height:1.6">{{ recommendation }}</p>
    </div>

    <!-- Meals -->
    <div v-for="mealType in mealTypes" :key="mealType" class="card">
      <div class="meal-header">
        <span style="font-weight:600;font-size:15px">{{ mealIcon(mealType) }} {{ t(`nutrition.meals.${mealType}`) }}</span>
        <span style="font-family:var(--font-mono);font-size:12px;color:var(--warning)">{{ mealCalories(mealType) }} kcal</span>
      </div>
      <div class="meal-list">
        <div v-for="log in logsByMeal(mealType)" :key="log.id" class="meal-item">
          <div style="flex:1;min-width:0">
            <div style="font-size:14px;margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ log.meal_name }}</div>
            <div style="font-size:11px;color:var(--text-dim);font-family:var(--font-mono)">P:{{ log.protein_g }}g U:{{ log.carbs_g }}g Y:{{ log.fat_g }}g</div>
          </div>
          <span style="font-family:var(--font-mono);font-size:12px;color:var(--accent-light);flex-shrink:0">{{ log.calories }} kcal</span>
          <button class="del-btn" @click="nutrition.deleteLog(log.id)">✕</button>
        </div>
        <div v-if="!logsByMeal(mealType).length" style="font-size:13px;color:var(--text-dim);text-align:center;padding:12px">Hali qo'shilmagan</div>
      </div>
      <button class="btn btn-outline btn-sm" style="width:100%;margin-top:10px" @click="openAdd(mealType)">+ Qo'shish</button>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal=false">
      <div class="modal">
        <div style="font-family:var(--font-display);font-weight:700;font-size:17px;margin-bottom:16px">
          {{ mealIcon(addForm.meal_type) }} {{ t(`nutrition.meals.${addForm.meal_type}`) }}
        </div>
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

    <div style="height:20px"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth.js'
import { useNutritionStore } from '../stores/nutrition.js'

const { t } = useI18n()
const auth = useAuthStore()
const nutrition = useNutritionStore()

const today = new Date()
const todayStr = today.toISOString().split('T')[0]
const months = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']
const todayFormatted = `${today.getDate()} ${months[today.getMonth()]}`
const mealTypes = ['breakfast','lunch','dinner','snack']
function mealIcon(t) { return {breakfast:'🌅',lunch:'☀️',dinner:'🌙',snack:'🍎'}[t]||'🍽️' }

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
  if (rem < 200) return `✅ Ajoyib! Faqat ${rem} kcal qoldi.`
  if (rem < 500) return `💪 Yaxshi! Yana ${rem} kcal iste'mol qilishingiz mumkin.`
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
  showModal.value = true
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
</script>

<style scoped>
.page { padding: 20px 16px; max-width: 700px; margin: 0 auto; }
@media(min-width:768px){ .page { padding: 32px 40px; max-width: 860px; } }
.page-header { margin-bottom: 24px; }
.page-header h1 { font-family: var(--font-display); font-weight: 800; font-size: 24px; }

.cal-top { display: flex; align-items: center; gap: 20px; margin-bottom: 16px; flex-wrap: wrap; }
.cal-svg { width: 100px; height: 100px; flex-shrink: 0; color: var(--text); }
.cal-info { flex: 1; min-width: 140px; display: flex; flex-direction: column; gap: 8px; }
.ci-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--text-dim); }
.ci-row b { color: var(--text); font-family: var(--font-mono); font-size: 13px; }

.macros { display: flex; flex-direction: column; gap: 10px; }
.macro-item {}
.macro-bar-wrap { height: 6px; background: var(--surface2); border-radius: 3px; overflow: hidden; margin-bottom: 4px; }
.macro-bar { height: 100%; border-radius: 3px; transition: width 0.5s; }
.macro-footer { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-dim); }

.rec-card { border-left: 3px solid var(--accent); }

.meal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.meal-list { display: flex; flex-direction: column; gap: 6px; }
.meal-item { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: var(--surface2); border-radius: var(--radius-sm); }
.del-btn { background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: 14px; padding: 4px 6px; flex-shrink: 0; border-radius: var(--radius-xs); }
.del-btn:hover { background: rgba(239,68,68,0.1); color: var(--danger); }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: flex-end; justify-content: center; z-index: 300; backdrop-filter: blur(4px); }
.modal { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius) var(--radius) 0 0; padding: 20px 16px 32px; width: 100%; max-width: 520px; max-height: 88vh; overflow-y: auto; }
.modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
</style>
