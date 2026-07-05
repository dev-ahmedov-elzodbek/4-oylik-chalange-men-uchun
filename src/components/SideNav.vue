<template>
  <aside class="side-nav" :class="{ collapsed }">
    <!-- Logo -->
    <div class="sn-logo" @click="$router.push('/today')">
      <div class="sn-logo-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="white" fill-opacity="0.3"/>
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <transition name="sn-fade">
        <span v-if="!collapsed" class="sn-logo-text">GoalFlow</span>
      </transition>
    </div>

    <!-- Main nav links -->
    <nav class="sn-links">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="sn-item"
        :title="collapsed ? t(item.label) : ''"
      >
        <span class="sn-icon" v-html="item.icon"></span>
        <transition name="sn-fade">
          <span v-if="!collapsed" class="sn-label">{{ t(item.label) }}</span>
        </transition>
        <transition name="sn-fade">
          <span v-if="!collapsed && item.badge" class="sn-badge">{{ item.badge }}</span>
        </transition>
      </router-link>
    </nav>

    <!-- Bottom actions -->
    <div class="sn-bottom">
      <!-- Subscription / Pro upgrade -->
      <router-link
        to="/subscription"
        class="sn-item sn-premium"
        :title="collapsed ? 'Pro rejaga o\'tish' : ''"
      >
        <span class="sn-icon" v-html="crownIcon"></span>
        <transition name="sn-fade">
          <span v-if="!collapsed" class="sn-label">Pro rejaga o'tish</span>
        </transition>
      </router-link>

      <!-- Admin -->
      <router-link
        v-if="auth.isAdmin"
        to="/admin"
        class="sn-item sn-admin"
        :title="collapsed ? 'Admin' : ''"
      >
        <span class="sn-icon" v-html="shieldIcon"></span>
        <transition name="sn-fade">
          <span v-if="!collapsed" class="sn-label">Admin</span>
        </transition>
      </router-link>

      <!-- Theme toggle -->
      <button
        class="sn-item"
        @click="$emit('toggle-theme')"
        :title="collapsed ? (theme === 'dark' ? 'Light mode' : 'Dark mode') : ''"
      >
        <span class="sn-icon" v-html="theme === 'dark' ? sunIcon : moonIcon"></span>
        <transition name="sn-fade">
          <span v-if="!collapsed" class="sn-label">{{ theme === 'dark' ? 'Light' : 'Dark' }}</span>
        </transition>
      </button>

      <!-- Collapse toggle -->
      <button
        class="sn-item sn-collapse-btn"
        @click="$emit('toggle-collapse')"
        :title="collapsed ? 'Kengaytirish' : 'Yig\'ish'"
      >
        <span class="sn-icon" v-html="collapsed ? chevronRightIcon : chevronLeftIcon"></span>
        <transition name="sn-fade">
          <span v-if="!collapsed" class="sn-label">Yig'ish</span>
        </transition>
      </button>

      <!-- User info -->
      <div v-if="auth.profile" class="sn-user">
        <div class="sn-avatar">
          {{ auth.profile.full_name?.[0]?.toUpperCase() || 'U' }}
          <div v-if="isPremium" class="sn-avatar-badge">
            <span v-html="crownIconSm"></span>
          </div>
        </div>
        <transition name="sn-fade">
          <div v-if="!collapsed" class="sn-user-info">
            <div class="sn-user-name">{{ auth.profile.full_name || 'Foydalanuvchi' }}</div>
            <div class="sn-user-role" :class="roleClass">{{ roleLabel }}</div>
          </div>
        </transition>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth.js'

const props = defineProps(['theme', 'collapsed'])
defineEmits(['toggle-theme', 'toggle-collapse'])

const { t } = useI18n()
const auth = useAuthStore()

const roleLabel = computed(() => {
  const r = auth.profile?.role
  return r === 'superadmin' ? 'SuperAdmin' : r === 'admin' ? 'Admin' : 'User'
})
const roleClass = computed(() => {
  const r = auth.profile?.role
  return r === 'superadmin' ? 'role-super' : r === 'admin' ? 'role-admin' : 'role-user'
})
const isPremium = computed(() => auth.profile?.subscription_plan === 'pro' || auth.profile?.subscription_plan === 'premium')

// ── Icons ────────────────────────────────────────────────────────
const boltIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" fill-opacity="0.2"/><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
const calendarIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="15" rx="2" fill="currentColor" fill-opacity="0.2"/><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M3 10H21" stroke="currentColor" stroke-width="1.8"/><path d="M8 2V6M16 2V6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="8" cy="15" r="1" fill="currentColor"/><circle cx="12" cy="15" r="1" fill="currentColor"/><circle cx="16" cy="15" r="1" fill="currentColor"/></svg>`
const alarmIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="13" r="8" fill="currentColor" fill-opacity="0.2"/><circle cx="12" cy="13" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M12 9V13L14.5 15.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 3L2 6M22 6L19 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`
const utensilsIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 2C9 2 9 7 9 9C9 10.66 7.66 12 6 12H4C4 12 4 17.5 4 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M6 2V12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M3 2V12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="14" y="2" width="6" height="10" rx="3" fill="currentColor" fill-opacity="0.2"/><rect x="14" y="2" width="6" height="10" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M17 12V21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`
const barChartIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="12" width="4" height="9" rx="1" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.8"/><rect x="10" y="6" width="4" height="15" rx="1" fill="currentColor" fill-opacity="0.3" stroke="currentColor" stroke-width="1.8"/><rect x="17" y="9" width="4" height="12" rx="1" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.8"/></svg>`
const userIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 21C5 17.134 8.134 14 12 14C15.866 14 19 17.134 19 21" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="8" r="4" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.8"/></svg>`
const crownIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 18h18M3 18L6 8l4.5 4L12 4l1.5 8L18 8l3 10z" fill="currentColor" fill-opacity="0.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="4" r="1.5" fill="currentColor" fill-opacity="0.7"/></svg>`
const crownIconSm = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M3 18h18M3 18L6 8l4.5 4L12 4l1.5 8L18 8l3 10z" fill="#f59e0b" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
const sunIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" fill="currentColor" fill-opacity="0.3" stroke="currentColor" stroke-width="1.8"/><path d="M12 2V4M12 20V22M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M2 12H4M20 12H22M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`
const moonIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3A6 6 0 0 0 21 12A9 9 0 1 1 12 3Z" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
const shieldIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 22C12 22 4 18 4 12V5L12 2L20 5V12C20 18 12 22 12 22Z" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
const chevronLeftIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
const chevronRightIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`

const trophyIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`

const navItems = [
  { path: '/today',       icon: boltIcon,     label: 'nav.today' },
  { path: '/calendar',    icon: calendarIcon, label: 'nav.calendar' },
  { path: '/alarm',       icon: alarmIcon,    label: 'nav.alarm' },
  { path: '/nutrition',   icon: utensilsIcon, label: 'nav.nutrition' },
  { path: '/stats',       icon: barChartIcon, label: 'nav.stats' },
  { path: '/leaderboard', icon: trophyIcon,   label: 'nav.leaderboard' },
  { path: '/profile',     icon: userIcon,     label: 'nav.profile' },
]
</script>

<style scoped>
.side-nav { display: none; }

@media (min-width: 768px) {
  .side-nav {
    display: flex; flex-direction: column;
    position: fixed; left: 0; top: 0; bottom: 0;
    width: var(--sidebar-w, 260px);
    background: rgba(10, 13, 24, 0.95);
    border-right: 1px solid rgba(255,255,255,0.06);
    z-index: 100;
    transition: width 0.3s var(--ease-out);
    overflow: hidden;
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    box-shadow: 4px 0 32px rgba(0,0,0,0.3);
  }
  .side-nav.collapsed { width: 64px; }
}
[data-theme="light"] .side-nav {
  background: rgba(255,255,255,0.95);
  border-right-color: rgba(108,99,255,0.1);
  box-shadow: 4px 0 24px rgba(108,99,255,0.07);
}

/* Logo */
.sn-logo {
  display: flex; align-items: center; gap: 10px;
  padding: 18px 14px 14px; cursor: pointer; overflow: hidden;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
[data-theme="light"] .sn-logo { border-bottom-color: rgba(108,99,255,0.08); }
.sn-logo-icon {
  width: 38px; height: 38px; flex-shrink: 0;
  background: linear-gradient(135deg, var(--accent), #8b5cf6);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba(108,99,255,0.5);
  transition: transform 0.3s var(--ease-spring), box-shadow 0.2s;
}
.sn-logo:hover .sn-logo-icon {
  transform: scale(1.08) rotate(-5deg);
  box-shadow: 0 6px 24px rgba(108,99,255,0.65);
}
.sn-logo-text {
  font-family: var(--font-display); font-weight: 800; font-size: 18px;
  white-space: nowrap;
  background: linear-gradient(135deg, var(--text) 40%, var(--accent-light));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

/* Links */
.sn-links { flex: 1; padding: 8px 8px 4px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; overflow-x: hidden; }
.sn-bottom { padding: 8px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 2px; }
[data-theme="light"] .sn-bottom { border-top-color: rgba(108,99,255,0.08); }

/* Item */
.sn-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 12px;
  text-decoration: none; color: var(--text-dim);
  transition: all 0.2s var(--ease-out);
  border: none; background: none;
  cursor: pointer; font-family: var(--font-body); font-size: 14px; font-weight: 500;
  white-space: nowrap; width: 100%; position: relative;
  overflow: hidden;
}
.sn-item::before {
  content: '';
  position: absolute; left: 0; top: 50%; transform: translateY(-50%);
  width: 3px; height: 0; border-radius: 0 3px 3px 0;
  background: linear-gradient(to bottom, var(--accent), var(--accent2));
  transition: height 0.25s var(--ease-spring);
}
.sn-item:hover { background: rgba(255,255,255,0.05); color: var(--text); transform: translateX(2px); }
[data-theme="light"] .sn-item:hover { background: rgba(108,99,255,0.05); }
.sn-item:hover::before { height: 18px; }
.sn-item.router-link-active {
  background: linear-gradient(135deg, rgba(108,99,255,0.14), rgba(108,99,255,0.05));
  color: var(--accent-light);
  font-weight: 600;
}
.sn-item.router-link-active::before { height: 26px; }
.sn-item.router-link-active .sn-icon { filter: drop-shadow(0 0 6px rgba(108,99,255,0.5)); }
[data-theme="light"] .sn-item.router-link-active { background: rgba(108,99,255,0.09); color: var(--accent); }

/* Premium item */
.sn-premium {
  color: #f59e0b;
  background: rgba(245,158,11,0.07);
  border: 1px solid rgba(245,158,11,0.15);
  margin-bottom: 4px;
}
.sn-premium::before { background: #f59e0b; }
.sn-premium:hover { background: rgba(245,158,11,0.12) !important; color: #f59e0b !important; border-color: rgba(245,158,11,0.3) !important; transform: none; }
.sn-premium .sn-icon { filter: drop-shadow(0 0 5px rgba(245,158,11,0.5)); }

/* Admin item */
.sn-admin { color: #f59e0b; }
.sn-admin::before { background: #f59e0b; }
.sn-admin:hover { background: rgba(245,158,11,0.07) !important; }

.sn-collapse-btn { color: var(--text-dim); }
.sn-collapse-btn:hover { color: var(--text); }

.sn-icon {
  width: 18px; height: 18px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.2s var(--ease-spring);
}
.sn-item:hover .sn-icon { transform: scale(1.12); }
.sn-label { flex: 1; text-align: left; transition: opacity 0.15s; }

.sn-badge {
  font-family: var(--font-mono); font-size: 10px; font-weight: 700;
  padding: 2px 8px; border-radius: 10px;
  background: linear-gradient(135deg, rgba(108,99,255,0.2), rgba(108,99,255,0.1));
  color: var(--accent-light);
  animation: badge-pop 0.4s var(--ease-spring);
}

/* User info */
.sn-user {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 12px 8px; overflow: hidden;
  border-top: 1px solid rgba(255,255,255,0.05);
  margin-top: 4px;
}
[data-theme="light"] .sn-user { border-top-color: rgba(108,99,255,0.08); }
.sn-avatar {
  width: 36px; height: 36px; border-radius: 11px;
  background: linear-gradient(135deg, var(--accent), #8b5cf6);
  color: white; display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 14px; flex-shrink: 0;
  box-shadow: 0 3px 12px rgba(108,99,255,0.45);
  position: relative;
  letter-spacing: 0;
}
.sn-avatar-badge {
  position: absolute; bottom: -3px; right: -3px;
  width: 16px; height: 16px; border-radius: 6px;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  display: flex; align-items: center; justify-content: center;
  border: 2px solid var(--surface);
  box-shadow: 0 2px 6px rgba(245,158,11,0.4);
}
.sn-user-info { overflow: hidden; }
.sn-user-name { font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sn-user-role { font-size: 11px; margin-top: 2px; font-weight: 500; }
.role-super { color: #f59e0b !important; }
.role-admin { color: var(--accent-light) !important; }
.role-user { color: var(--text-dim); }

/* Transitions */
.sn-fade-enter-active { transition: opacity 0.18s, transform 0.18s; }
.sn-fade-leave-active { transition: opacity 0.12s, transform 0.12s; }
.sn-fade-enter-from, .sn-fade-leave-to { opacity: 0; transform: translateX(-8px); }

@keyframes badge-pop {
  0%   { transform: scale(0.6); }
  70%  { transform: scale(1.1); }
  100% { transform: scale(1); }
}
</style>
