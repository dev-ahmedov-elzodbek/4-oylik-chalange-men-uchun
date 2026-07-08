<template>
  <div class="page">
    <div class="fin-header anim-fade-up">
      <h1 class="fin-h1">💵 Moliya</h1>
      <button class="fin-add-btn" @click="openAdd('expense')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Qo'shish
      </button>
    </div>

    <!-- Stat tiles -->
    <div class="fin-stats anim-fade-up">
      <div class="fin-stat income">
        <div class="fs-top"><span class="fs-arrow">↑</span> Kirim</div>
        <div class="fs-val">{{ fmtMoney(fin.totalIncome()) }}</div>
        <div class="fs-cur">so'm</div>
      </div>
      <div class="fin-stat expense">
        <div class="fs-top"><span class="fs-arrow">↓</span> Chiqim</div>
        <div class="fs-val">{{ fmtMoney(fin.totalExpense()) }}</div>
        <div class="fs-cur">so'm</div>
      </div>
      <div class="fin-stat balance" :class="{ negative: fin.balance() < 0 }">
        <div class="fs-top">= Balans</div>
        <div class="fs-val">{{ fmtMoney(fin.balance()) }}</div>
        <div class="fs-cur">so'm</div>
      </div>
    </div>

    <!-- Monthly chart -->
    <div class="fin-card anim-fade-up stagger-1">
      <div class="fc-title">
        <span>So'nggi 6 oy</span>
        <div class="fc-legend">
          <span class="lg-item"><span class="lg-dot" style="background:#10b981"></span>Kirim</span>
          <span class="lg-item"><span class="lg-dot" style="background:#ef4444"></span>Chiqim</span>
        </div>
      </div>
      <div class="bar-chart">
        <div v-for="m in months" :key="m.ym" class="bc-col">
          <div class="bc-bars">
            <div class="bc-bar in" :style="{ height: barH(m.income) + '%' }" :title="'Kirim: ' + fmtMoney(m.income)"></div>
            <div class="bc-bar out" :style="{ height: barH(m.expense) + '%' }" :title="'Chiqim: ' + fmtMoney(m.expense)"></div>
          </div>
          <div class="bc-label">{{ m.label }}</div>
        </div>
      </div>
      <div v-if="chartMax === 0" class="fc-empty">Hali ma'lumot yo'q</div>
    </div>

    <!-- Expense by category -->
    <div v-if="expenseCats.length" class="fin-card anim-fade-up stagger-2">
      <div class="fc-title"><span>Chiqim kategoriyalari</span></div>
      <div class="cat-list">
        <div v-for="c in expenseCats" :key="c.key" class="cat-row">
          <span class="cat-icon">{{ catInfo('expense', c.key).icon }}</span>
          <div class="cat-body">
            <div class="cat-top">
              <span class="cat-name">{{ catInfo('expense', c.key).label }}</span>
              <span class="cat-amt">{{ fmtMoney(c.val) }} so'm</span>
            </div>
            <div class="cat-track"><div class="cat-fill" :style="{ width: catPct(c.val) + '%' }"></div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Entries -->
    <div class="fin-card anim-fade-up stagger-3">
      <div class="fc-title"><span>Tarix</span></div>
      <div v-if="fin.loading" class="loading-state"><div class="loading-spinner"></div></div>
      <div v-else class="ent-list">
        <div v-for="e in fin.entries" :key="e.id" class="ent-row">
          <span class="ent-icon" :class="e.type">{{ catInfo(e.type, e.category).icon }}</span>
          <div class="ent-body">
            <div class="ent-name">{{ catInfo(e.type, e.category).label }}</div>
            <div class="ent-meta">{{ e.note || '—' }} · {{ fmtDate(e.entry_date) }}</div>
          </div>
          <span class="ent-amt" :class="e.type">{{ e.type === 'income' ? '+' : '−' }}{{ fmtMoney(e.amount) }}</span>
          <button class="ent-del" @click="fin.deleteEntry(e.id)">✕</button>
        </div>
        <div v-if="!fin.entries.length" class="fc-empty">Hali yozuv yo'q. "Qo'shish" bilan boshlang.</div>
      </div>
    </div>

    <!-- Add modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="fin-modal">
        <div class="fm-title">Yangi yozuv</div>
        <div class="type-toggle">
          <button class="tt-btn" :class="{ active: form.type === 'expense', out: form.type === 'expense' }" @click="setType('expense')">↓ Chiqim</button>
          <button class="tt-btn" :class="{ active: form.type === 'income', in: form.type === 'income' }" @click="setType('income')">↑ Kirim</button>
        </div>

        <div class="form-group">
          <label class="label">Summa (so'm)</label>
          <input v-model.number="form.amount" class="input fm-amount" type="number" inputmode="numeric" placeholder="0" />
        </div>

        <div class="form-group">
          <label class="label">Kategoriya</label>
          <div class="cat-grid">
            <button
              v-for="c in cats" :key="c.key"
              class="cat-chip" :class="{ active: form.category === c.key }"
              @click="form.category = c.key"
            >{{ c.icon }} {{ c.label }}</button>
          </div>
        </div>

        <div class="fm-twin">
          <div class="form-group">
            <label class="label">Sana</label>
            <input v-model="form.entry_date" class="input" type="date" />
          </div>
          <div class="form-group">
            <label class="label">Izoh (ixtiyoriy)</label>
            <input v-model="form.note" class="input" placeholder="..." />
          </div>
        </div>

        <div class="fm-actions">
          <button class="btn btn-primary" style="flex:1" :disabled="!form.amount || saving" @click="save">
            {{ saving ? '...' : 'Saqlash' }}
          </button>
          <button class="btn btn-outline" @click="showModal = false">Bekor</button>
        </div>
      </div>
    </div>

    <div style="height:20px"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFinanceStore, INCOME_CATS, EXPENSE_CATS, catInfo, fmtMoney } from '../stores/finance.js'

const fin = useFinanceStore()

const months = computed(() => fin.monthly(6))
const chartMax = computed(() => Math.max(1, ...months.value.flatMap(m => [m.income, m.expense])))
function barH(v) { return chartMax.value ? Math.max(v > 0 ? 4 : 0, (v / chartMax.value) * 100) : 0 }

const expenseCats = computed(() => fin.byCategory('expense'))
const catMax = computed(() => Math.max(1, ...expenseCats.value.map(c => c.val)))
function catPct(v) { return Math.max(6, (v / catMax.value) * 100) }

const showModal = ref(false)
const saving = ref(false)
const todayStr = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` })()
const form = ref({ type: 'expense', amount: null, category: 'food', note: '', entry_date: todayStr })
const cats = computed(() => form.value.type === 'income' ? INCOME_CATS : EXPENSE_CATS)

function openAdd(type) {
  form.value = { type, amount: null, category: type === 'income' ? 'salary' : 'food', note: '', entry_date: todayStr }
  showModal.value = true
}
function setType(t) {
  form.value.type = t
  form.value.category = t === 'income' ? 'salary' : 'food'
}
async function save() {
  if (!form.value.amount) return
  saving.value = true
  try {
    await fin.addEntry({
      type: form.value.type,
      amount: form.value.amount,
      category: form.value.category,
      note: form.value.note,
      entry_date: form.value.entry_date,
    })
    showModal.value = false
  } catch (e) { console.error(e) }
  finally { saving.value = false }
}

function fmtDate(d) {
  if (!d) return ''
  const dt = new Date(d + 'T00:00:00')
  return `${dt.getDate()} ${['Yan','Fev','Mar','Apr','May','Iyn','Iyl','Avg','Sen','Okt','Noy','Dek'][dt.getMonth()]}`
}

onMounted(() => fin.fetchEntries())
</script>

<style scoped>
.page { padding: 16px; max-width: 700px; margin: 0 auto; }
@media(min-width:768px){ .page { padding: 28px 40px; max-width: 820px; } }

.fin-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.fin-h1 { font-family: var(--font-display); font-weight: 800; font-size: 26px; }
.fin-add-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 16px; border: none; border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--accent), #8b5cf6); color: white;
  font-weight: 600; font-size: 13px; cursor: pointer;
  box-shadow: 0 4px 14px rgba(108,99,255,0.3);
  transition: transform 0.2s;
}
.fin-add-btn:hover { transform: translateY(-2px); }

/* Stat tiles */
.fin-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px; }
.fin-stat {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 14px 12px; text-align: center;
  box-shadow: var(--shadow-sm);
}
.fin-stat.income { border-top: 3px solid #10b981; }
.fin-stat.expense { border-top: 3px solid #ef4444; }
.fin-stat.balance { border-top: 3px solid var(--accent); }
.fs-top { font-size: 12px; color: var(--text-dim); font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 4px; }
.fs-arrow { font-weight: 800; }
.income .fs-arrow { color: #10b981; }
.expense .fs-arrow { color: #ef4444; }
.fs-val { font-family: var(--font-display); font-weight: 800; font-size: 18px; margin-top: 6px; word-break: break-all; }
.income .fs-val { color: #10b981; }
.expense .fs-val { color: #ef4444; }
.balance .fs-val { color: var(--accent-light); }
.balance.negative .fs-val { color: #ef4444; }
.fs-cur { font-size: 10px; color: var(--text-dim); margin-top: 2px; }
@media(max-width:420px){ .fs-val { font-size: 15px; } }

/* Card */
.fin-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 16px; margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
}
.fc-title { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; font-family: var(--font-display); font-weight: 700; font-size: 15px; }
.fc-legend { display: flex; gap: 12px; }
.lg-item { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; color: var(--text-dim); font-weight: 500; font-family: var(--font-body); }
.lg-dot { width: 9px; height: 9px; border-radius: 3px; }
.fc-empty { text-align: center; color: var(--text-dim); font-size: 13px; padding: 16px; }

/* Bar chart */
.bar-chart { display: flex; gap: 8px; height: 150px; align-items: flex-end; padding-top: 8px; }
.bc-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; min-width: 0; }
.bc-bars { flex: 1; width: 100%; display: flex; gap: 3px; align-items: flex-end; justify-content: center; }
.bc-bar { width: 42%; max-width: 22px; border-radius: 5px 5px 2px 2px; transition: height 0.7s var(--ease-out); animation: growUp 0.8s var(--ease-out) both; }
.bc-bar.in { background: linear-gradient(180deg, #10b981, #059669); }
.bc-bar.out { background: linear-gradient(180deg, #ef4444, #dc2626); }
.bc-label { font-family: var(--font-mono); font-size: 10px; color: var(--text-dim); margin-top: 6px; }
@keyframes growUp { from { height: 0 !important; } }

/* Category */
.cat-list { display: flex; flex-direction: column; gap: 12px; }
.cat-row { display: flex; align-items: center; gap: 10px; }
.cat-icon { font-size: 20px; width: 30px; text-align: center; flex-shrink: 0; }
.cat-body { flex: 1; min-width: 0; }
.cat-top { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 5px; }
.cat-name { font-weight: 500; }
.cat-amt { font-family: var(--font-mono); font-size: 12px; color: var(--text-dim); }
.cat-track { height: 8px; background: var(--surface3); border-radius: 10px; overflow: hidden; }
.cat-fill { height: 100%; background: linear-gradient(90deg, #ef4444, #f59e0b); border-radius: 10px; transition: width 0.8s var(--ease-out); animation: growW 1s var(--ease-out) both; }
@keyframes growW { from { width: 0 !important; } }

/* Entries */
.ent-list { display: flex; flex-direction: column; gap: 6px; }
.ent-row { display: flex; align-items: center; gap: 10px; padding: 10px 8px; border-radius: var(--radius-sm); transition: background 0.15s; }
.ent-row:hover { background: var(--surface2); }
.ent-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0; }
.ent-icon.income { background: rgba(16,185,129,0.12); }
.ent-icon.expense { background: rgba(239,68,68,0.12); }
.ent-body { flex: 1; min-width: 0; }
.ent-name { font-size: 14px; font-weight: 500; }
.ent-meta { font-size: 11px; color: var(--text-dim); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ent-amt { font-family: var(--font-mono); font-weight: 700; font-size: 14px; flex-shrink: 0; }
.ent-amt.income { color: #10b981; }
.ent-amt.expense { color: #ef4444; }
.ent-del { background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: 13px; padding: 4px; flex-shrink: 0; border-radius: 6px; }
.ent-del:hover { background: rgba(239,68,68,0.1); color: #ef4444; }

/* Modal */
.fin-modal {
  background: var(--surface); border: 1px solid var(--border2);
  border-radius: 20px; padding: 22px 20px; width: 100%; max-width: 440px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.5); max-height: 90vh; overflow-y: auto;
}
.fm-title { font-family: var(--font-display); font-weight: 700; font-size: 18px; margin-bottom: 16px; }
.type-toggle { display: flex; gap: 8px; margin-bottom: 16px; }
.tt-btn { flex: 1; padding: 12px; border-radius: 12px; border: 1px solid var(--border2); background: var(--surface2); color: var(--text-dim); font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; }
.tt-btn.active.out { background: rgba(239,68,68,0.15); border-color: #ef4444; color: #ef4444; }
.tt-btn.active.in { background: rgba(16,185,129,0.15); border-color: #10b981; color: #10b981; }
.fm-amount { font-family: var(--font-mono); font-size: 22px; font-weight: 700; text-align: center; }
.cat-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.cat-chip { padding: 7px 12px; border-radius: 20px; border: 1px solid var(--border2); background: var(--surface2); color: var(--text); font-size: 13px; cursor: pointer; transition: all 0.2s; }
.cat-chip.active { background: var(--accent); border-color: var(--accent); color: white; }
.fm-twin { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.fm-actions { display: flex; gap: 8px; margin-top: 8px; }
</style>
