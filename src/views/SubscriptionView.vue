<template>
  <div class="page sub-page">

    <!-- To'lov natijasi banner -->
    <transition name="faq-slide">
      <div v-if="payStatus" :class="['pay-status-banner', `pay-status-${payStatus}`]">
        <span v-if="payStatus === 'success'" class="pay-status-icon" v-html="checkIconGreen"></span>
        <span v-else class="pay-status-icon" v-html="xIcon"></span>
        {{ payStatusMsg }}
        <button class="pay-status-close" @click="payStatus = null">✕</button>
      </div>
    </transition>

    <!-- Header -->
    <div class="sub-hero anim-fade-up">
      <div class="sub-hero-badge">
        <span v-html="crownIcon" style="color:#f59e0b"></span>
        GoalFlow Pro
      </div>
      <h1 class="sub-hero-title">
        Maqsadlaringizga
        <span class="gradient-text">tezroq</span> yeting
      </h1>
      <p class="sub-hero-desc">
        Kuchli vositalar, cheksiz imkoniyatlar. Har kuni 1% yaxshi bo'lish uchun hamma narsa.
      </p>

      <!-- Billing toggle -->
      <div class="billing-toggle">
        <button :class="['toggle-btn', { active: billing === 'monthly' }]" @click="billing = 'monthly'">Oylik</button>
        <button :class="['toggle-btn', { active: billing === 'yearly' }]" @click="billing = 'yearly'">
          Yillik
          <span class="save-badge">-30%</span>
        </button>
      </div>
    </div>

    <!-- Plans grid -->
    <div class="plans-grid anim-fade-up stagger-1">

      <!-- FREE -->
      <div class="plan-card" :class="{ current: currentPlan === 'free' }">
        <div class="plan-header">
          <div class="plan-icon-wrap" style="background:rgba(99,102,241,0.12)">
            <span v-html="zapIcon" style="color:#6366f1"></span>
          </div>
          <div>
            <div class="plan-name">Free</div>
            <div class="plan-desc">Boshlash uchun</div>
          </div>
          <div v-if="currentPlan === 'free'" class="current-badge">Joriy</div>
        </div>

        <div class="plan-price">
          <span class="price-amount">0</span>
          <span class="price-currency">so'm</span>
          <span class="price-period">/oy</span>
        </div>

        <ul class="plan-features">
          <li v-for="f in freePlanFeatures" :key="f.text" :class="{ disabled: !f.included }">
            <span class="feat-icon" v-html="f.included ? checkIcon : xIcon"></span>
            {{ f.text }}
          </li>
        </ul>

        <button
          class="btn btn-outline btn-full"
          :disabled="currentPlan === 'free'"
          @click="selectPlan('free')"
        >
          {{ currentPlan === 'free' ? 'Joriy reja' : 'Bepul boshlash' }}
        </button>
      </div>

      <!-- PRO -->
      <div class="plan-card plan-featured" :class="{ current: currentPlan === 'pro' }">
        <div class="plan-popular-badge">⭐ Ommabop</div>
        <div class="plan-header">
          <div class="plan-icon-wrap" style="background:rgba(108,99,255,0.15)">
            <span v-html="crownIcon" style="color:var(--accent-light)"></span>
          </div>
          <div>
            <div class="plan-name">Pro</div>
            <div class="plan-desc">Individual foydalanuvchilar uchun</div>
          </div>
          <div v-if="currentPlan === 'pro'" class="current-badge current-pro">Joriy</div>
        </div>

        <div class="plan-price">
          <span class="price-amount">{{ billing === 'yearly' ? '49 000' : '69 000' }}</span>
          <span class="price-currency">so'm</span>
          <span class="price-period">/oy</span>
        </div>
        <div v-if="billing === 'yearly'" class="price-yearly-note">Yillik: 588 000 so'm (168 000 so'm tejaysiz)</div>

        <ul class="plan-features">
          <li v-for="f in proPlanFeatures" :key="f.text" :class="{ disabled: !f.included }">
            <span class="feat-icon" v-html="f.included ? checkIconGreen : xIcon"></span>
            {{ f.text }}
          </li>
        </ul>

        <button
          class="btn btn-primary btn-full"
          :disabled="currentPlan === 'pro' || upgrading"
          @click="selectPlan('pro')"
        >
          <span v-if="upgrading && selectedPlan === 'pro'">To'lov qayta ishlanmoqda...</span>
          <span v-else-if="currentPlan === 'pro'">Joriy reja</span>
          <span v-else>Pro rejaga o'tish</span>
        </button>
      </div>

      <!-- PREMIUM -->
      <div class="plan-card" :class="{ current: currentPlan === 'premium' }">
        <div class="plan-header">
          <div class="plan-icon-wrap" style="background:rgba(245,158,11,0.12)">
            <span v-html="rocketIcon" style="color:#f59e0b"></span>
          </div>
          <div>
            <div class="plan-name">Premium</div>
            <div class="plan-desc">Jamoalar va murabbiylar uchun</div>
          </div>
          <div v-if="currentPlan === 'premium'" class="current-badge current-premium">Joriy</div>
        </div>

        <div class="plan-price">
          <span class="price-amount">{{ billing === 'yearly' ? '119 000' : '169 000' }}</span>
          <span class="price-currency">so'm</span>
          <span class="price-period">/oy</span>
        </div>
        <div v-if="billing === 'yearly'" class="price-yearly-note">Yillik: 1 428 000 so'm (600 000 so'm tejaysiz)</div>

        <ul class="plan-features">
          <li v-for="f in premiumPlanFeatures" :key="f.text" :class="{ disabled: !f.included }">
            <span class="feat-icon" v-html="f.included ? checkIconGold : xIcon"></span>
            {{ f.text }}
          </li>
        </ul>

        <button
          class="btn btn-premium btn-full"
          :disabled="currentPlan === 'premium' || upgrading"
          @click="selectPlan('premium')"
        >
          <span v-if="upgrading && selectedPlan === 'premium'">To'lov qayta ishlanmoqda...</span>
          <span v-else-if="currentPlan === 'premium'">Joriy reja</span>
          <span v-else>Premium rejaga o'tish</span>
        </button>
      </div>
    </div>

    <!-- Feature comparison table -->
    <div class="compare-section anim-fade-up stagger-2">
      <h2 class="compare-title">Batafsil taqqoslash</h2>
      <div class="compare-table">
        <div class="compare-head">
          <div class="compare-feature-col">Xususiyat</div>
          <div class="compare-plan-col">Free</div>
          <div class="compare-plan-col featured-col">Pro</div>
          <div class="compare-plan-col">Premium</div>
        </div>
        <div
          v-for="row in comparisonRows"
          :key="row.feature"
          class="compare-row"
        >
          <div class="compare-feature-col">{{ row.feature }}</div>
          <div class="compare-plan-col" v-html="renderCell(row.free)"></div>
          <div class="compare-plan-col featured-col" v-html="renderCell(row.pro)"></div>
          <div class="compare-plan-col" v-html="renderCell(row.premium)"></div>
        </div>
      </div>
    </div>

    <!-- FAQ -->
    <div class="faq-section anim-fade-up stagger-3">
      <h2 class="compare-title">Ko'p so'raladigan savollar</h2>
      <div class="faq-list">
        <div
          v-for="(faq, i) in faqs"
          :key="i"
          class="faq-item"
          @click="openFaq = openFaq === i ? null : i"
        >
          <div class="faq-question">
            <span>{{ faq.q }}</span>
            <span class="faq-chevron" :class="{ open: openFaq === i }">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>
            </span>
          </div>
          <transition name="faq-slide">
            <div v-if="openFaq === i" class="faq-answer">{{ faq.a }}</div>
          </transition>
        </div>
      </div>
    </div>

    <!-- Payment modal -->
    <Teleport to="body">
      <div v-if="showPayModal" class="modal-overlay" @click.self="showPayModal = false">
        <div class="pay-modal anim-scale-in">
          <div class="pay-modal-header">
            <h3>To'lov usulini tanlang</h3>
            <button class="close-btn" @click="showPayModal = false">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="pay-plan-summary">
            <span class="pay-plan-name">{{ selectedPlan === 'pro' ? 'Pro' : 'Premium' }} reja</span>
            <span class="pay-plan-price">
              {{ selectedPlan === 'pro'
                ? (billing === 'yearly' ? '588 000' : '69 000')
                : (billing === 'yearly' ? '1 428 000' : '169 000') }}
              so'm / {{ billing === 'yearly' ? 'yil' : 'oy' }}
            </span>
          </div>

          <div class="pay-methods">
            <button
              v-for="m in payMethods"
              :key="m.id"
              class="pay-method-btn"
              :class="{ selected: payMethod === m.id }"
              @click="payMethod = m.id"
            >
              <span class="pay-method-logo" v-html="m.logo"></span>
              <span class="pay-method-name">{{ m.name }}</span>
              <span v-if="payMethod === m.id" class="pay-method-check" v-html="checkIconGreen"></span>
            </button>
          </div>

          <button class="btn btn-primary btn-full" :disabled="!payMethod" @click="processPayment">
            To'lovni boshlash
          </button>
          <p class="pay-note">To'lov xavfsiz SSL orqali amalga oshiriladi. Istalgan vaqtda bekor qilish mumkin.</p>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { openPaymeCheckout, openClickCheckout, getPlanAmount, generateOrderId } from '../utils/payment.js'

const auth  = useAuthStore()
const route = useRoute()

const billing      = ref('monthly')
const openFaq      = ref(null)
const upgrading    = ref(false)
const selectedPlan = ref(null)
const showPayModal = ref(false)
const payMethod    = ref(null)
const payStatus    = ref(null)   // 'success' | 'cancel' | null
const payStatusMsg = ref('')

const currentPlan = computed(() => auth.profile?.subscription_plan || 'free')

// URL dan to'lov natijasini ushlash (Payme/Click redirect)
onMounted(() => {
  const status = route.query.payment
  if (status === 'success') {
    payStatus.value = 'success'
    payStatusMsg.value = "To'lov muvaffaqiyatli! Obunangiz faollashtirilmoqda..."
    // Profile ni qayta yuklash (webhook bir necha soniya kechikishi mumkin)
    setTimeout(() => auth.fetchProfile?.(), 3000)
  } else if (status === 'cancel') {
    payStatus.value = 'cancel'
    payStatusMsg.value = "To'lov bekor qilindi."
  }
})

function selectPlan(plan) {
  if (plan === 'free' || !auth.isLoggedIn) return
  selectedPlan.value = plan
  showPayModal.value = true
  payMethod.value    = null
}

async function processPayment() {
  if (!payMethod.value || !selectedPlan.value) return

  const userId  = auth.profile?.id
  const plan    = selectedPlan.value
  const cycle   = billing.value
  const amount  = getPlanAmount(plan, cycle)
  const orderId = generateOrderId(userId, plan, cycle)

  showPayModal.value = false
  upgrading.value    = true

  // payment_logs ga yozish (ixtiyoriy — fail bo'lsa ham to'lov ochiladi)
  try {
    const { supabase } = await import('../supabase.js')
    await supabase.from('payment_logs').insert({
      user_id:        userId,
      payment_method: payMethod.value,
      transaction_id: orderId,
      amount,
      status:         'pending',
    })
  } catch {
    // jadval yo'q bo'lsa ham checkout ochilishi kerak
  }

  // Env kalitlar tekshirish
  const hasPayme  = !!import.meta.env.VITE_PAYME_MERCHANT_ID
  const hasClick  = !!import.meta.env.VITE_CLICK_SERVICE_ID
  const method    = payMethod.value

  // Merchant kalitlari sozlanmagan bo'lsa — demo rejim
  if (!hasPayme && !hasClick) {
    upgrading.value = false
    payStatus.value    = 'info'
    payStatusMsg.value = `🔧 To'lov tizimi sozlanmagan. .env faylga VITE_PAYME_MERCHANT_ID yozing.`
    return
  }

  let opened = false
  if (method === 'payme' || (method === 'uzcard' && hasPayme)) {
    opened = openPaymeCheckout({
      orderId,
      amountSom:   amount,
      description: `GoalFlow ${plan === 'pro' ? 'Pro' : 'Premium'}`,
    })
  } else if (method === 'click' && hasClick) {
    opened = openClickCheckout({ orderId, amountSom: amount })
  } else if (hasPayme) {
    opened = openPaymeCheckout({ orderId, amountSom: amount })
  }

  upgrading.value = false

  if (!opened) {
    payStatus.value    = 'cancel'
    payStatusMsg.value = "Popup bloklandi — brauzer ruxsat bering yoki qayta urinib ko'ring."
  }
}

// ── Icons ──────────────────────────────────────────────────────
const crownIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 18h18M3 18L6 8l4.5 4L12 4l1.5 8L18 8l3 10z" fill="currentColor" fill-opacity="0.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="4" r="1.5" fill="currentColor" fill-opacity="0.7"/></svg>`

const zapIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`

const rocketIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2C12 2 6 6 6 14h12C18 6 12 2 12 2z" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M6 14l-3 3v3h6l1-3M18 14l3 3v3h-6l-1-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="10" r="2" fill="currentColor" fill-opacity="0.4" stroke="currentColor" stroke-width="1.3"/></svg>`

const checkIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`

const checkIconGreen = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#10b981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`

const checkIconGold = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`

const xIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#6b7280" stroke-width="2" stroke-linecap="round"/></svg>`

// ── Plan features ──────────────────────────────────────────────
const freePlanFeatures = [
  { text: 'Kunlik vazifalar (20 ta)', included: true },
  { text: 'Oddiy statistika', included: true },
  { text: 'Ovqatlanish kuzatuvi', included: true },
  { text: 'Cheksiz shaxsiy vazifalar', included: false },
  { text: 'Kengaytirilgan tahlil', included: false },
  { text: 'Export (CSV/PDF)', included: false },
  { text: 'AI tavsiyalar', included: false },
  { text: 'Jamoa rejimi', included: false },
]

const proPlanFeatures = [
  { text: 'Cheksiz kunlik vazifalar', included: true },
  { text: 'Kengaytirilgan statistika', included: true },
  { text: 'Ovqatlanish kuzatuvi (kengaytirilgan)', included: true },
  { text: 'Cheksiz shaxsiy vazifalar', included: true },
  { text: 'Export (CSV/PDF)', included: true },
  { text: 'AI tavsiyalar', included: true },
  { text: 'Ustuvor qo\'llab-quvvatlash', included: true },
  { text: 'Jamoa rejimi', included: false },
]

const premiumPlanFeatures = [
  { text: 'Pro rejaning barcha imkoniyatlari', included: true },
  { text: 'Jamoa boshqaruvi (10 ta a\'zo)', included: true },
  { text: 'Murabbiy paneli', included: true },
  { text: 'API integratsiya', included: true },
  { text: 'Maxsus brending', included: true },
  { text: 'Shaxsiy menejer', included: true },
  { text: 'SLA kafolati', included: true },
  { text: 'Cheksiz storage', included: true },
]

// ── Comparison table ───────────────────────────────────────────
const comparisonRows = [
  { feature: 'Kunlik vazifalar',       free: '20 ta',    pro: 'Cheksiz', premium: 'Cheksiz' },
  { feature: 'Shaxsiy vazifalar',      free: '5 ta',     pro: 'Cheksiz', premium: 'Cheksiz' },
  { feature: 'Statistika',             free: 'Oddiy',    pro: 'To\'liq', premium: 'Pro+' },
  { feature: 'Ovqatlanish kuzatuvi',   free: true,       pro: true,      premium: true },
  { feature: 'Export',                 free: false,      pro: true,      premium: true },
  { feature: 'AI tavsiyalar',          free: false,      pro: true,      premium: true },
  { feature: 'Qo\'llab-quvvatlash',   free: 'Email',    pro: 'Ustuvor', premium: 'Shaxsiy' },
  { feature: 'Jamoa rejimi',           free: false,      pro: false,     premium: '10 nafar' },
  { feature: 'API kirish',             free: false,      pro: false,     premium: true },
  { feature: 'Maxsus brending',        free: false,      pro: false,     premium: true },
]

function renderCell(val) {
  if (val === true)  return `<span style="color:#10b981;display:inline-flex">${checkIconGreen}</span>`
  if (val === false) return `<span style="color:#6b7280;display:inline-flex">${xIcon}</span>`
  return `<span style="font-size:13px;color:var(--text)">${val}</span>`
}

// ── FAQ ────────────────────────────────────────────────────────
const faqs = [
  { q: 'To\'lovni qanday amalga oshiraman?', a: 'Payme, Click yoki bank kartasi orqali to\'lov qilishingiz mumkin. Barcha to\'lovlar SSL orqali himoyalangan.' },
  { q: 'Obunani bekor qilsam nima bo\'ladi?', a: 'Istalgan vaqtda bekor qilishingiz mumkin. Joriy to\'lov davrining oxirigacha Pro/Premium imkoniyatlaridan foydalanishda davom etasiz.' },
  { q: 'Yillik rejani tanlasam qancha tejaymin?', a: 'Yillik rejani tanlasangiz oylik narxga nisbatan 30% tejaysiz. Pro uchun 168,000 so\'m, Premium uchun 600,000 so\'m.' },
  { q: 'Jamoam uchun korporativ narxlar bormi?', a: '10 kishidan ortiq jamoalar uchun alohida narxlar mavjud. Bizga murojaat qiling: info@goalflow.uz' },
  { q: 'Ma\'lumotlarim xavfsizmi?', a: 'Ha. Barcha ma\'lumotlar Supabase PostgreSQL da shifrlangan holda saqlanadi. GDPR talablariga muvofiq.' },
]

// ── Payment methods ────────────────────────────────────────────
const payMethods = [
  { id: 'payme',  name: 'Payme',         logo: paymeLogoSvg },
  { id: 'click',  name: 'Click',         logo: clickLogoSvg },
  { id: 'uzcard', name: 'UzCard / Humo', logo: uzcardLogoSvg },
]

const paymeLogoSvg = `<svg width="56" height="20" viewBox="0 0 56 20" fill="none">
  <rect width="56" height="20" rx="4" fill="#00AAFF" fill-opacity="0.12"/>
  <text x="6" y="14" font-family="Arial,sans-serif" font-weight="800" font-size="11" fill="#00AAFF">payme</text>
</svg>`

const clickLogoSvg = `<svg width="48" height="20" viewBox="0 0 48 20" fill="none">
  <rect width="48" height="20" rx="4" fill="#FF6B00" fill-opacity="0.12"/>
  <text x="7" y="14" font-family="Arial,sans-serif" font-weight="800" font-size="11" fill="#FF6B00">click</text>
</svg>`

const uzcardLogoSvg = `<svg width="64" height="20" viewBox="0 0 64 20" fill="none">
  <rect width="64" height="20" rx="4" fill="#1E88E5" fill-opacity="0.12"/>
  <text x="5" y="14" font-family="Arial,sans-serif" font-weight="700" font-size="10" fill="#1E88E5">UzCard/Humo</text>
</svg>`
</script>

<style scoped>
.sub-page { padding-bottom: 60px; }

/* ── Hero ── */
.sub-hero {
  text-align: center; padding: 20px 0 36px;
  max-width: 560px; margin: 0 auto;
}
.sub-hero-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 20px;
  background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.22);
  color: #f59e0b; font-size: 13px; font-weight: 600;
  margin-bottom: 16px;
}
.sub-hero-title {
  font-family: var(--font-display); font-weight: 800;
  font-size: 36px; line-height: 1.15; margin-bottom: 12px;
  color: var(--text);
}
@media (min-width: 768px) { .sub-hero-title { font-size: 48px; } }

.sub-hero-desc { font-size: 16px; color: var(--text-dim); line-height: 1.6; margin-bottom: 28px; }

.billing-toggle {
  display: inline-flex; gap: 4px;
  background: var(--surface2); border-radius: 12px; padding: 4px;
  border: 1px solid var(--border);
}
.toggle-btn {
  padding: 8px 20px; border-radius: 9px; border: none;
  background: transparent; color: var(--text-dim);
  font-family: var(--font-body); font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px;
}
.toggle-btn.active { background: var(--surface); color: var(--text); box-shadow: var(--shadow-sm); }
.save-badge {
  font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 6px;
  background: rgba(16,185,129,0.2); color: #10b981;
}

/* ── Plans grid ── */
.plans-grid {
  display: grid; grid-template-columns: 1fr; gap: 16px;
  margin-bottom: 48px;
}
@media (min-width: 768px) { .plans-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; } }

.plan-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 24px;
  display: flex; flex-direction: column; gap: 20px;
  transition: all 0.25s var(--ease-out); position: relative; overflow: hidden;
}
.plan-card:hover { transform: translateY(-4px); box-shadow: var(--shadow); border-color: var(--border2); }
.plan-card.current { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent), var(--shadow); }
.plan-featured {
  border-color: rgba(108,99,255,0.4);
  background: linear-gradient(145deg, var(--surface), rgba(108,99,255,0.04));
  box-shadow: 0 0 0 1px rgba(108,99,255,0.2), var(--shadow);
}
.plan-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: transparent; transition: background 0.3s;
}
.plan-card:hover::before { background: linear-gradient(90deg, var(--accent), #00d4aa); }
.plan-featured::before { background: linear-gradient(90deg, var(--accent), #8b5cf6); }

.plan-popular-badge {
  position: absolute; top: 16px; right: 16px;
  font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 10px;
  background: rgba(108,99,255,0.15); color: var(--accent-light);
}

.plan-header { display: flex; align-items: center; gap: 12px; }
.plan-icon-wrap {
  width: 44px; height: 44px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.plan-name {
  font-family: var(--font-display); font-weight: 800; font-size: 18px; color: var(--text);
}
.plan-desc { font-size: 12px; color: var(--text-dim); margin-top: 2px; }

.current-badge {
  margin-left: auto; font-size: 11px; font-weight: 700;
  padding: 3px 10px; border-radius: 10px;
  background: rgba(108,99,255,0.12); color: var(--accent-light);
}
.current-pro { background: rgba(108,99,255,0.15); color: var(--accent-light); }
.current-premium { background: rgba(245,158,11,0.15); color: #f59e0b; }

.plan-price { display: flex; align-items: baseline; gap: 3px; }
.price-amount {
  font-family: var(--font-mono); font-weight: 700; font-size: 32px; color: var(--text);
}
.price-currency { font-size: 14px; color: var(--text-dim); font-weight: 600; }
.price-period { font-size: 13px; color: var(--text-dim); margin-left: 1px; }
.price-yearly-note { font-size: 12px; color: var(--success); margin-top: -14px; }

.plan-features { list-style: none; display: flex; flex-direction: column; gap: 10px; flex: 1; }
.plan-features li {
  display: flex; align-items: center; gap: 10px;
  font-size: 14px; color: var(--text);
}
.plan-features li.disabled { color: var(--text-dim); }
.feat-icon { display: inline-flex; flex-shrink: 0; }

/* ── Comparison table ── */
.compare-section { margin-bottom: 48px; }
.compare-title {
  font-family: var(--font-display); font-weight: 800; font-size: 22px;
  margin-bottom: 20px; color: var(--text); text-align: center;
}
.compare-table { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.compare-head {
  display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
  background: var(--surface2); padding: 12px 16px;
  font-size: 12px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.08em; color: var(--text-dim); gap: 8px;
}
.compare-row {
  display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
  padding: 12px 16px; gap: 8px; align-items: center;
  border-top: 1px solid var(--border);
  font-size: 14px; transition: background 0.15s;
}
.compare-row:hover { background: var(--surface2); }
.compare-feature-col { color: var(--text); }
.compare-plan-col { text-align: center; color: var(--text-dim); }
.featured-col { background: rgba(108,99,255,0.04); }

/* ── FAQ ── */
.faq-section { margin-bottom: 48px; }
.faq-list { display: flex; flex-direction: column; gap: 8px; }
.faq-item {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-sm); overflow: hidden;
  cursor: pointer; transition: border-color 0.2s;
}
.faq-item:hover { border-color: var(--border2); }
.faq-question {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px; font-weight: 600; font-size: 14px; gap: 12px;
}
.faq-chevron { transition: transform 0.25s; color: var(--text-dim); display: inline-flex; }
.faq-chevron.open { transform: rotate(180deg); color: var(--accent-light); }
.faq-answer {
  padding: 0 16px 16px; font-size: 14px; color: var(--text-dim); line-height: 1.7;
}
.faq-slide-enter-active { animation: fadeUp 0.2s var(--ease-out); }
.faq-slide-leave-active { animation: fadeIn 0.15s ease reverse; }

/* ── Payment modal ── */
.pay-modal {
  background: var(--surface); border: 1px solid var(--border2);
  border-radius: var(--radius); padding: 0;
  width: 100%; max-width: 440px;
  box-shadow: var(--shadow-lg); overflow: hidden;
}
.pay-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px; border-bottom: 1px solid var(--border);
  background: linear-gradient(135deg, rgba(108,99,255,0.06), transparent);
}
.pay-modal-header h3 { font-family: var(--font-display); font-weight: 700; font-size: 18px; }
.close-btn {
  width: 32px; height: 32px; border-radius: 9px; border: none;
  background: var(--surface3); color: var(--text-dim); cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: all 0.18s;
}
.close-btn:hover { background: rgba(239,68,68,0.15); color: #ef4444; transform: rotate(90deg); }

.pay-plan-summary {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  background: rgba(108,99,255,0.06); border-bottom: 1px solid var(--border);
}
.pay-plan-name { font-weight: 700; color: var(--accent-light); }
.pay-plan-price { font-family: var(--font-mono); font-size: 14px; font-weight: 700; color: var(--text); }

.pay-methods { display: flex; flex-direction: column; gap: 8px; padding: 16px 20px; }
.pay-method-btn {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; border-radius: var(--radius-sm);
  border: 1px solid var(--border2);
  background: var(--surface2); cursor: pointer;
  transition: all 0.18s; text-align: left; width: 100%;
  font-family: var(--font-body); color: var(--text);
}
.pay-method-btn:hover { border-color: var(--accent); background: var(--surface3); }
.pay-method-btn.selected { border-color: var(--accent); background: rgba(108,99,255,0.08); }
.pay-method-logo { display: inline-flex; align-items: center; flex-shrink: 0; }
.pay-method-name { font-weight: 600; font-size: 15px; flex: 1; }
.pay-method-check { margin-left: auto; display: inline-flex; }

.pay-modal .btn { margin: 0 20px 12px; width: calc(100% - 40px); }
.pay-note { font-size: 12px; color: var(--text-dim); text-align: center; padding: 0 20px 20px; line-height: 1.5; }

/* ── To'lov natijasi banner ── */
.pay-status-banner {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 18px; border-radius: var(--radius-sm);
  font-size: 14px; font-weight: 600; margin-bottom: 20px;
  border: 1px solid transparent;
  animation: fadeUp 0.3s var(--ease-out);
  position: relative;
}
.pay-status-success {
  background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.3); color: #10b981;
}
.pay-status-cancel {
  background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.25); color: #ef4444;
}
.pay-status-info {
  background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.3); color: #f59e0b;
}
.pay-status-icon { display: inline-flex; flex-shrink: 0; }
.pay-status-close {
  margin-left: auto; background: none; border: none;
  cursor: pointer; color: inherit; opacity: 0.6; font-size: 12px; padding: 2px 6px;
  border-radius: 4px; transition: opacity 0.15s;
}
.pay-status-close:hover { opacity: 1; }
</style>
