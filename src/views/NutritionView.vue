<template>
  <div class="page">
    <div class="page-header">
      <h1>{{ t('nutrition.title') }}</h1>
      <div class="today-date">{{ todayFormatted }}</div>
    </div>

    <!-- Calorie Summary -->
    <div class="card calorie-summary">
      <div class="cal-ring-wrap">
        <svg viewBox="0 0 120 120" class="cal-svg">
          <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="10"/>
          <circle cx="60" cy="60" r="48" fill="none" :stroke="calRingColor" stroke-width="10"
            stroke-linecap="round"
            :stroke-dasharray="301.6"
            :stroke-dashoffset="301.6 - (301.6 * Math.min(calPercent,100) / 100)"
            transform="rotate(-90 60 60)"
            style="transition:stroke-dashoffset 0.6s"/>
          <text x="60" y="55" text-anchor="middle" fill="white" font-size="20" font-family="Space Mono" font-weight="700">{{ totals.calories }}</text>
          <text x="60" y="72" text-anchor="middle" fill="#6b7280" font-size="10" font-family="DM Sans">kcal</text>
        </svg>
        <div class="cal-info">
          <div class="cal-goal-row">
            <span class="cal-label">{{ t('nutrition.goal') }}</span>
            <span class="cal-val">{{ dailyCalGoal }} kcal</span>
          </div>
          <div class="cal-goal-row">
            <span class="cal-label">{{ t('nutrition.consumed') }}</span>
            <span class="cal-val" :style="{ color: calRingColor }">{{ totals.calories }} kcal</span>
          </div>
          <div class="cal-goal-row">
            <span class="cal-label">{{ t('nutrition.remaining') }}</span>
            <span class="cal-val">{{ Math.max(0, dailyCalGoal - totals.calories) }} kcal</span>
          </div>
        </div>
      </div>

      <!-- Macros -->
      <div class="macros-row">
        <div class="macro-item">
          <div class="macro-bar-wrap">
            <div class="macro-bar" :style="{ width: Math.min(100, (totals.protein / (macroGoals.protein||1)) * 100) + '%', background: '#6c63ff' }"></div>
          </div>
          <div class="macro-footer">
            <span class="macro-label">🥩 {{ t('nutrition.protein') }}</span>
            <span class="macro-val">{{ totals.protein.toFixed(0) }}/{{ macroGoals.protein }}g</span>
          </div>
        </div>
        <div class="macro-item">
          <div class="macro-bar-wrap">
            <div class="macro-bar" :style="{ width: Math.min(100, (totals.carbs / (macroGoals.carbs||1)) * 100) + '%', background: '#f59e0b' }"></div>
          </div>
          <div class="macro-footer">
            <span class="macro-label">🍞 {{ t('nutrition.carbs') }}</span>
            <span class="macro-val">{{ totals.carbs.toFixed(0) }}/{{ macroGoals.carbs }}g</span>
          </div>
        </div>
        <div class="macro-item">
          <div class="macro-bar-wrap">
            <div class="macro-bar" :style="{ width: Math.min(100, (totals.fat / (macroGoals.fat||1)) * 100) + '%', background: '#10b981' }"></div>
          </div>
          <div class="macro-footer">
            <span class="macro-label">🫒 {{ t('nutrition.fat') }}</span>
            <span class="macro-val">{{ totals.fat.toFixed(0) }}/{{ macroGoals.fat }}g</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recommendation -->
    <div class="card rec-card">
      <div class="card-title">💡 {{ t('nutrition.recommendation') }}</div>
      <div class="rec-text">{{ recommendation }}</div>
    </div>

    <!-- Meals -->
    <div v-for="mealType in mealTypes" :key="mealType" class="card">
      <div class="card-title-row">
        <span>{{ mealIcon(mealType) }} {{ t(`nutrition.meals.${mealType}`) }}</span>
        <span class="meal-cal">{{ mealCalories(mealType) }} kcal</span>
      </div>
      <div class="meal-list">
        <div v-for="log in logsByMeal(mealType)" :key="log.id" class="meal-item">
          <div class="meal-info">
            <div class="meal-name">{{ log.meal_name }}</div>
            <div class="meal-macros">P:{{ log.protein_g }}g U:{{ log.carbs_g }}g Y:{{ log.fat_g }}g</div>
          </div>
          <div class="meal-right">
            <span class="meal-kcal">{{ log.calories }} kcal</span>
            <button class="del-btn" @click="nutrition.deleteLog(log.id)">✕</button>
          </div>
        </div>
        <div v-if="!logsByMeal(mealType).length" class="empty-meal">Hali qo'shilmagan</div>
      </div>
      <button class="btn btn-outline btn-sm" style="margin-top:10px;width:100%" @click="openAdd(mealType)">+ Qo'shish</button>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal=false">
      <div class="modal">
        <div class="modal-title">{{ mealIcon(addForm.meal_type) }} {{ t(`nutrition.meals.${addForm.meal_type}`) }}</div>
        <div class="form-group">
          <label class="label">Ovqat nomi</label>
          <input v-model="addForm.meal_name" class="input" placeholder="Masalan: Palov, Tuxum..." />
        </div>
        <div class="modal-grid">
          <div class="form-group">
            <label class="label">Kaloriya</label>
            <input v-model.number="addForm.calories" class="input" type="number" placeholder="350" />
          </div>
          <div class="form-group">
            <label class="label">Oqsil (g)</label>
            <input v-model.number="addForm.protein_g" class="input" type="number" placeholder="20" />
          </div>
          <div class="form-group">
            <label class="label">Uglevod (g)</label>
            <input v-model.number="addForm.carbs_g" class="input" type="number" placeholder="40" />
          </div>
          <div class="form-group">
            <label class="label">Yog' (g)</label>
            <input v-model.number="addForm.fat_g" class="input" type="number" placeholder="15" />
          </div>
        </div>

        <div class="quick-foods">
          <div style="font-size:13px;font-weight:600;margin-bottom:8px">⚡ Tez tanlash</div>
          <div class="quick-grid">
            <button v-for="f in quickFoods" :key="f.name" class="chip chip-sm" @click="applyQuick(f)">{{ f.name }}</button>
          </div>
        </div>

        <div style="display:flex;gap:8px;margin-top:16px">
          <button class="btn btn-primary" style="flex:1" @click="saveLog">Saqlash</button>
          <button class="btn btn-outline" @click="showModal=false">Bekor</button>
        </div>
      </div>
    </div>

    <div style="height:80px"></div>
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

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack']
function mealIcon(type) { return { breakfast:'🌅', lunch:'☀️', dinner:'🌙', snack:'🍎' }[type] || '🍽️' }

// BUG FIX: auth.profile.value → auth.profile
const dailyCalGoal = computed(() => {
  if (!auth.profile) return 2000
  return nutrition.calcDailyCalories(auth.profile) || 2000
})
const macroGoals = computed(() => nutrition.getMacroRecommendation(dailyCalGoal.value, 'maintain') || { protein: 150, carbs: 250, fat: 65 })
const totals = computed(() => nutrition.getDayTotals() || { calories: 0, protein: 0, carbs: 0, fat: 0 })

const calPercent = computed(() => dailyCalGoal.value ? (totals.value.calories / dailyCalGoal.value) * 100 : 0)
const calRingColor = computed(() => {
  if (calPercent.value > 110) return '#ef4444'
  if (calPercent.value >= 90) return '#00d4aa'
  if (calPercent.value >= 60) return '#f59e0b'
  return '#6c63ff'
})

const recommendation = computed(() => {
  const rem = dailyCalGoal.value - totals.value.calories
  if (rem < 0) return `⚠️ Kunlik me'yordan ${Math.abs(rem)} kcal oshib ketdingiz.`
  if (rem < 200) return `✅ Ajoyib! Faqat ${rem} kcal qoldi.`
  if (rem < 500) return `💪 Yaxshi! Yana ${rem} kcal iste'mol qilishingiz mumkin.`
  return `🍽️ Bugun ${rem} kcal iste'mol qilishingiz kerak.`
})

// BUG FIX: nutrition.logs.value → nutrition.logs
function logsByMeal(type) {
  const logs = nutrition.logs
  if (!logs || !Array.isArray(logs)) return []
  return logs.filter(l => l.meal_type === type)
}
function mealCalories(type) { return logsByMeal(type).reduce((s, l) => s + (l.calories || 0), 0) }

const showModal = ref(false)
const addForm = ref({ meal_name: '', meal_type: 'breakfast', calories: null, protein_g: null, carbs_g: null, fat_g: null })

function openAdd(mealType) {
  addForm.value = { meal_name: '', meal_type: mealType, calories: null, protein_g: null, carbs_g: null, fat_g: null }
  showModal.value = true
}

const quickFoods = [
  { name: 'Tuxum (1)', calories: 78, protein_g: 6, carbs_g: 1, fat_g: 5 },
  { name: 'Non (1 til.)', calories: 80, protein_g: 3, carbs_g: 15, fat_g: 1 },
  { name: 'Guruch 100g', calories: 130, protein_g: 3, carbs_g: 28, fat_g: 0 },
  { name: 'Tovuq 100g', calories: 165, protein_g: 31, carbs_g: 0, fat_g: 4 },
  { name: 'Palov 200g', calories: 320, protein_g: 12, carbs_g: 40, fat_g: 12 },
  { name: 'Olma', calories: 52, protein_g: 0, carbs_g: 14, fat_g: 0 },
  { name: 'Sut 200ml', calories: 120, protein_g: 6, carbs_g: 10, fat_g: 5 },
  { name: 'Yogurt 150g', calories: 90, protein_g: 8, carbs_g: 10, fat_g: 2 },
  { name: 'Banan', calories: 89, protein_g: 1, carbs_g: 23, fat_g: 0 },
  { name: 'Somsa (1)', calories: 280, protein_g: 10, carbs_g: 30, fat_g: 14 },
]

function applyQuick(food) {
  addForm.value.meal_name = food.name
  addForm.value.calories = food.calories
  addForm.value.protein_g = food.protein_g
  addForm.value.carbs_g = food.carbs_g
  addForm.value.fat_g = food.fat_g
}

async function saveLog() {
  if (!addForm.value.meal_name) return
  await nutrition.addLog({ ...addForm.value, log_date: todayStr })
  showModal.value = false
}

onMounted(() => nutrition.fetchLogs(todayStr))
</script>

<style scoped>
.page { padding: 16px; max-width: 600px; margin: 0 auto; }
.page-header { margin-bottom: 16px; }
.page-header h1 { font-family: var(--font-display); font-weight: 800; font-size: 22px; }
.today-date { font-size: 13px; color: var(--text-dim); }

/* Cal ring responsive */
.cal-ring-wrap { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
.cal-svg { width: 100px; height: 100px; flex-shrink: 0; }
.cal-info { flex: 1; min-width: 140px; display: flex; flex-direction: column; gap: 8px; }
.cal-goal-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.cal-label { font-size: 12px; color: var(--text-dim); }
.cal-val { font-family: var(--font-mono); font-weight: 700; font-size: 13px; }

/* Macros */
.macros-row { display: flex; flex-direction: column; gap: 8px; }
.macro-item { }
.macro-bar-wrap { height: 6px; background: var(--surface2); border-radius: 3px; overflow: hidden; margin-bottom: 4px; }
.macro-bar { height: 100%; border-radius: 3px; transition: width 0.5s; }
.macro-footer { display: flex; justify-content: space-between; align-items: center; }
.macro-label { font-size: 12px; color: var(--text-dim); }
.macro-val { font-family: var(--font-mono); font-size: 12px; color: var(--text); }

.rec-card { border-left: 3px solid var(--accent); }
.rec-text { font-size: 13px; line-height: 1.6; }

/* Meal card title */
.card-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-weight: 600; font-size: 15px; }
.meal-cal { font-family: var(--font-mono); font-size: 12px; color: var(--warning); }

.meal-list { display: flex; flex-direction: column; gap: 6px; }
.meal-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: var(--surface2); border-radius: var(--radius-sm); gap: 8px; }
.meal-info { flex: 1; min-width: 0; }
.meal-name { font-size: 14px; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.meal-macros { font-size: 11px; color: var(--text-dim); font-family: var(--font-mono); }
.meal-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.meal-kcal { font-family: var(--font-mono); font-size: 13px; color: var(--accent-light); }
.del-btn { background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: 14px; padding: 4px; }
.empty-meal { font-size: 13px; color: var(--text-dim); text-align: center; padding: 12px; }

.quick-foods { margin-top: 12px; }
.quick-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.chip-sm { padding: 6px 10px; font-size: 12px; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex; align-items: flex-end; justify-content: center;
  z-index: 200; backdrop-filter: blur(4px);
}
.modal {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius) var(--radius) 0 0;
  padding: 20px 16px 32px; width: 100%; max-width: 500px;
  max-height: 88vh; overflow-y: auto;
}
.modal-title { font-family: var(--font-display); font-weight: 700; font-size: 17px; margin-bottom: 16px; }
.modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
</style>
