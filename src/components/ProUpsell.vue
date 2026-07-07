<template>
  <transition name="upsell">
    <div v-if="open" class="upsell-overlay" @click.self="$emit('close')">
      <div class="upsell-card">
        <button class="upsell-close" @click="$emit('close')">✕</button>
        <div class="upsell-crown">👑</div>
        <h3 class="upsell-title">{{ title || 'Pro imkoniyat' }}</h3>
        <p class="upsell-desc">{{ desc || 'Bu funksiya faqat Pro foydalanuvchilar uchun.' }}</p>

        <div class="upsell-perks">
          <div v-for="perk in perks" :key="perk" class="upsell-perk">
            <span class="perk-check">✓</span> {{ perk }}
          </div>
        </div>

        <router-link to="/subscription" class="upsell-btn" @click="$emit('close')">
          Pro'ga o'tish 🚀
        </router-link>
        <button class="upsell-later" @click="$emit('close')">Keyinroq</button>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  open: Boolean,
  title: String,
  desc: String,
  perks: {
    type: Array,
    default: () => [
      'Cheksiz shaxsiy vazifalar',
      'Cheksiz budilniklar',
      'AI ovqat tahlili (rasm orqali)',
      'Haftalik hisobot va tahlil',
      'Ustuvor qo\'llab-quvvatlash',
    ],
  },
})
defineEmits(['close'])
</script>

<style scoped>
.upsell-overlay {
  position: fixed; inset: 0; z-index: 400;
  background: rgba(0,0,0,0.72);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.upsell-card {
  position: relative;
  width: 100%; max-width: 360px;
  background: var(--surface);
  border: 1px solid rgba(245,158,11,0.3);
  border-radius: 22px;
  padding: 32px 26px 24px;
  text-align: center;
  box-shadow: 0 24px 80px rgba(0,0,0,0.5), 0 0 60px rgba(245,158,11,0.1);
  animation: upsellPop 0.35s var(--ease-spring);
}
.upsell-close {
  position: absolute; top: 14px; right: 14px;
  width: 30px; height: 30px; border-radius: 9px; border: none;
  background: var(--surface3); color: var(--text-dim); cursor: pointer;
  transition: all 0.2s;
}
.upsell-close:hover { background: rgba(239,68,68,0.15); color: var(--danger); }
.upsell-crown {
  font-size: 48px; margin-bottom: 8px;
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 12px rgba(245,158,11,0.4));
}
.upsell-title {
  font-family: var(--font-display); font-weight: 800; font-size: 22px;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.upsell-desc { font-size: 14px; color: var(--text-dim); line-height: 1.5; margin: 8px 0 18px; }
.upsell-perks {
  display: flex; flex-direction: column; gap: 8px;
  text-align: left; margin-bottom: 20px;
  background: var(--surface2); border-radius: 14px; padding: 16px;
}
.upsell-perk { display: flex; align-items: center; gap: 10px; font-size: 13px; }
.perk-check {
  width: 20px; height: 20px; flex-shrink: 0;
  background: rgba(16,185,129,0.15); color: var(--success);
  border-radius: 6px; display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
}
.upsell-btn {
  display: block; width: 100%;
  padding: 14px; border-radius: 14px;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: white; text-decoration: none;
  font-weight: 700; font-size: 15px;
  box-shadow: 0 6px 20px rgba(245,158,11,0.4);
  transition: transform 0.2s var(--ease-out);
}
.upsell-btn:hover { transform: translateY(-2px); }
.upsell-later {
  margin-top: 10px; background: none; border: none;
  color: var(--text-dim); font-size: 13px; cursor: pointer;
}

.upsell-enter-active, .upsell-leave-active { transition: opacity 0.25s; }
.upsell-enter-from, .upsell-leave-to { opacity: 0; }

@keyframes upsellPop { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
</style>
