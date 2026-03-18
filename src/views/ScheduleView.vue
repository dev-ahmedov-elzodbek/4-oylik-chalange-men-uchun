<template>
  <div class="schedule-view">
    <!-- Week selector -->
    <div class="day-tabs card">
      <button 
        v-for="(d, i) in weekDaysList" 
        :key="i"
        class="day-tab"
        :class="{ active: selectedDow === i }"
        @click="selectedDow = i"
      >
        <span class="dt-short">{{ d.short }}</span>
      </button>
    </div>

    <!-- Day Schedule -->
    <div class="card schedule-detail">
      <div class="sd-header">
        <div class="sd-day">{{ weekDaysList[selectedDow].full }}</div>
        <div v-if="getDayClass(selectedDow)" class="sd-class-badge">
          📚 {{ getDayClass(selectedDow).start }}–{{ getDayClass(selectedDow).end }}
        </div>
        <div v-else-if="selectedDow === 6" class="sd-class-badge sunday">🌟 Dam olish kuni</div>
      </div>

      <div class="time-blocks">
        <div 
          v-for="block in getScheduleBlocks(selectedDow)" 
          :key="block.time"
          class="time-block"
          :style="{ borderLeftColor: block.color }"
        >
          <div class="tb-time">{{ block.time }}</div>
          <div class="tb-content">
            <div class="tb-title">{{ block.title }}</div>
            <div v-if="block.desc" class="tb-desc">{{ block.desc }}</div>
            <div v-if="block.duration" class="tb-dur">{{ block.duration }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly Overview -->
    <div class="card">
      <div class="card-title">📋 Haftalik umumiy ko'rinish</div>
      <div class="weekly-overview">
        <div v-for="(d, i) in weekDaysList" :key="i" class="wo-row">
          <div class="wo-day">{{ d.short }}</div>
          <div class="wo-items">
            <span v-for="tag in getDayTags(i)" :key="tag.label" class="wo-tag" :style="{ background: tag.color + '22', color: tag.color, border: '1px solid ' + tag.color + '44' }">
              {{ tag.label }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Rules -->
    <div class="card rules-card">
      <div class="card-title">📜 Challenge qoidalari</div>
      <div class="rules-list">
        <div v-for="rule in rules" :key="rule" class="rule-item">
          <span class="rule-dot">▸</span>
          {{ rule }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const today = new Date()
const selectedDow = ref(today.getDay() === 0 ? 6 : today.getDay() - 1) // Monday-first

const weekDaysList = [
  { short: 'Du', full: 'Dushanba' },
  { short: 'Se', full: 'Seshanba' },
  { short: 'Ch', full: 'Chorshanba' },
  { short: 'Pa', full: 'Payshanba' },
  { short: 'Ju', full: 'Juma' },
  { short: 'Sh', full: 'Shanba' },
  { short: 'Ya', full: 'Yakshanba' },
]

// Monday=0...Sunday=6
function getDayClass(dow) {
  if ([0, 2, 4].includes(dow)) return { start: '13:00', end: '15:00', name: 'Kurs A' }
  if ([1, 3, 5].includes(dow)) return { start: '10:00', end: '12:00', name: 'Kurs B' }
  return null
}

function getScheduleBlocks(dow) {
  const cls = getDayClass(dow)
  const isSunday = dow === 6
  const isMorningClass = [1, 3, 5].includes(dow) // Se, Pa, Sh
  const isAfternoonClass = [0, 2, 4].includes(dow) // Du, Ch, Ju

  const blocks = [
    { time: '06:00', title: 'Uyg\'onish', desc: 'Bomdod namozi + yuvunish', color: '#6366f1', duration: '30 daq' },
    { time: '06:30', title: '💪 Sport', desc: 'Push-up 3x20 | Pike push-up 3x15 | Plank 3x45s | Tortish 3x8', color: '#10b981', duration: '45 daq' },
    { time: '07:15', title: 'Nonushta', desc: 'Sog\'lom ovqat + tayyorgarlik', color: '#9ca3af', duration: '45 daq' },
  ]

  if (isMorningClass) {
    blocks.push({ time: '08:00', title: '📖 Ingliz tili', desc: 'So\'zlar (20 ta) + podcast tinglash', color: '#3b82f6', duration: '1 soat' })
    blocks.push({ time: '09:00', title: '📚 Ona tili', desc: 'Kitob o\'qish yoki insho mashqi', color: '#ec4899', duration: '1 soat' })
    blocks.push({ time: '10:00', title: '🏫 DARS', desc: cls?.name, color: '#f59e0b', duration: '2 soat' })
    blocks.push({ time: '12:00', title: 'Tushlik + Peshin', desc: 'Ovqat, namoz, dam olish', color: '#9ca3af', duration: '1 soat' })
    blocks.push({ time: '13:00', title: '💻 Dasturlash: nazariya', desc: 'Vue.js, JS kurs, video darslar', color: '#f59e0b', duration: '1.5 soat' })
    blocks.push({ time: '14:30', title: '🌍 Ingliz tili: grammatika', desc: 'Grammar mashqlari, test', color: '#3b82f6', duration: '1 soat' })
    blocks.push({ time: '15:30', title: '💻 Dasturlash: amaliyot', desc: 'Loyha yoki kodelash mashqi', color: '#f0c040', duration: '1.5 soat' })
  } else if (isAfternoonClass) {
    blocks.push({ time: '08:00', title: '💻 Dasturlash: nazariya', desc: 'Vue.js, JS kurs, video darslar', color: '#f59e0b', duration: '1.5 soat' })
    blocks.push({ time: '09:30', title: '📖 Ingliz tili', desc: 'So\'zlar (20 ta) + podcast tinglash', color: '#3b82f6', duration: '1 soat' })
    blocks.push({ time: '10:30', title: '📚 Ona tili', desc: 'Kitob o\'qish yoki insho mashqi', color: '#ec4899', duration: '1 soat' })
    blocks.push({ time: '11:30', title: 'Tushlik + tayyorgarlik', desc: 'Ovqat, kurs uchun tayyorgarlik', color: '#9ca3af', duration: '1 soat' })
    blocks.push({ time: '13:00', title: '🏫 DARS', desc: cls?.name, color: '#f59e0b', duration: '2 soat' })
    blocks.push({ time: '15:00', title: 'Peshin + dam', desc: 'Namoz, 15 daqiqa dam', color: '#9ca3af', duration: '30 daq' })
    blocks.push({ time: '15:30', title: '🌍 Ingliz tili: grammatika', desc: 'Grammar + sertifikat tayyorgarligi', color: '#3b82f6', duration: '1 soat' })
    blocks.push({ time: '16:30', title: '💻 Dasturlash: amaliyot', desc: 'Loyha, portfolio', color: '#f0c040', duration: '1.5 soat' })
  } else {
    // Sunday
    blocks.push({ time: '08:00', title: '📖 Erkin o\'qish', desc: 'Hafta davomidagi mavzularni takrorlash', color: '#8b5cf6', duration: '1.5 soat' })
    blocks.push({ time: '09:30', title: '💻 Dasturlash: amaliyot', desc: 'Portfolio loyha yoki yangi feature', color: '#f0c040', duration: '2 soat' })
    blocks.push({ time: '11:30', title: 'Tushlik + Peshin', desc: 'Ovqat, namoz, dam', color: '#9ca3af', duration: '1 soat' })
    blocks.push({ time: '12:30', title: '🌍 Ingliz tili: film/serial', desc: 'Inglizcha kontent bilan vaqt', color: '#3b82f6', duration: '1 soat' })
    blocks.push({ time: '13:30', title: '📚 Ona tili: kitob', desc: 'Badiiy adabiyot o\'qish', color: '#ec4899', duration: '1 soat' })
    blocks.push({ time: '14:30', title: '💪 Sport + yurish', desc: 'Ko\'cha sport yoki uy sporni', color: '#10b981', duration: '1 soat' })
    blocks.push({ time: '15:30', title: '🌟 Erkin vaqt', desc: 'Oila, do\'stlar, dam olish', color: '#6b7280', duration: '2 soat' })
  }

  blocks.push({ time: '18:00', title: 'Asr namozi', desc: '', color: '#6366f1', duration: '15 daq' })
  blocks.push({ time: '19:00', title: 'Kechki ovqat + Shom', desc: 'Oila bilan kechki ovqat', color: '#9ca3af', duration: '1 soat' })
  blocks.push({ time: '20:00', title: '🪞 Kunlik tahlil', desc: 'Daftarga yozish: nima qildim, nima qoldi', color: '#8b5cf6', duration: '30 daq' })
  blocks.push({ time: '20:30', title: '📵 Ekransiz vaqt', desc: 'Ijtimoiy tarmoq yo\'q, kitob/fikr', color: '#6b7280', duration: '1.5 soat' })
  blocks.push({ time: '22:00', title: 'Xufton namozi', desc: 'Namoz + ertangi rejani ko\'rish', color: '#6366f1', duration: '30 daq' })
  blocks.push({ time: '23:00', title: '🌙 Uyqu', desc: 'Sifatli uyqu — 7 soat', color: '#4f46e5', duration: '7 soat' })

  return blocks
}

function getDayTags(dow) {
  const tags = []
  const cls = getDayClass(dow)
  if (cls) tags.push({ label: `📚 Dars ${cls.start}-${cls.end}`, color: '#f59e0b' })
  tags.push({ label: '💪 Sport', color: '#10b981' })
  tags.push({ label: '💻 Kod', color: '#f0c040' })
  tags.push({ label: '🌍 Ingliz', color: '#3b82f6' })
  if (dow === 6) tags.push({ label: '🌟 Dam olish', color: '#8b5cf6' })
  return tags
}

const rules = [
  'Har kuni 23:00 da yotish, 06:00 da turish — murosasiz!',
  'Sport — hech qachon o\'tkazib yuborilmaydi, hatto 10 daqiqa ham bajarilsin',
  'Telefon ijtimoiy tarmoqlari — kuniga 1 soatdan oshmasin',
  'Namozlar o\'z vaqtida o\'qilsin',
  'Har kuni kamida 1 ta yangi kod yozilsin',
  'Kun oxirida daftarga tahlil yozilsin',
  'Yakshanba — dam olish, lekin sport va o\'qish to\'xtatilmaydi',
  'Agar kun 50% dan kam bo\'lsa — ertasiga ikki barobar harakat',
  '4 oy davomida bu rejadan chiqilmaydi — bu va\'da!',
]
</script>

<style scoped>
.day-tabs {
  display: flex;
  gap: 4px;
  padding: 6px;
  overflow-x: auto;
}

.day-tab {
  flex: 1;
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  padding: 10px 4px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.day-tab:hover { color: var(--text); }
.day-tab.active {
  background: var(--accent);
  color: #000;
  border-color: var(--accent);
}

.sd-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 8px;
}

.sd-day {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 22px;
}

.sd-class-badge {
  background: rgba(240, 192, 64, 0.15);
  border: 1px solid rgba(240, 192, 64, 0.3);
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 20px;
}

.sd-class-badge.sunday {
  background: rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.3);
  color: #a78bfa;
}

.time-blocks { display: flex; flex-direction: column; gap: 6px; }

.time-block {
  display: flex;
  gap: 12px;
  padding: 10px 12px;
  background: var(--surface2);
  border-radius: 10px;
  border-left: 3px solid;
}

.tb-time {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-dim);
  width: 44px;
  flex-shrink: 0;
  padding-top: 2px;
}

.tb-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
}

.tb-desc {
  font-size: 12px;
  color: var(--text-dim);
}

.tb-dur {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--accent);
  margin-top: 2px;
}

/* Weekly Overview */
.weekly-overview { display: flex; flex-direction: column; gap: 8px; }

.wo-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.wo-day {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  color: var(--text-dim);
  width: 24px;
  flex-shrink: 0;
}

.wo-items { display: flex; flex-wrap: wrap; gap: 4px; }

.wo-tag {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 20px;
  white-space: nowrap;
}

/* Rules */
.rules-list { display: flex; flex-direction: column; gap: 8px; }

.rule-item {
  display: flex;
  gap: 8px;
  font-size: 13px;
  line-height: 1.5;
}

.rule-dot {
  color: var(--accent);
  flex-shrink: 0;
  margin-top: 1px;
}
</style>
