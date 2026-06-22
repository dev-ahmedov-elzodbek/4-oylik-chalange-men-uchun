<template>
  <div class="app-wrap" :data-theme="theme">

    <!-- Splash screen -->
    <div v-if="auth.loading" class="splash">
      <div class="splash-logo">GF</div>
      <div class="splash-name">GoalFlow</div>
      <div class="splash-sub">Har kuni 1% yaxshilan</div>
      <div class="splash-loader"><div class="loader-bar"></div></div>
    </div>

    <template v-else>
      <div class="app-layout">
        <!-- Desktop Sidebar -->
        <SideNav
          v-if="auth.isLoggedIn && !auth.needsOnboarding"
          :theme="theme"
          :collapsed="sideCollapsed"
          @toggle-theme="toggleTheme"
          @toggle-collapse="sideCollapsed = !sideCollapsed"
        />

        <!-- Main Content -->
        <div
          class="app-content"
          :class="{ 'has-sidebar': auth.isLoggedIn && !auth.needsOnboarding, 'sidebar-collapsed': sideCollapsed }"
        >
          <!-- Guest / onboarding theme toggle -->
          <button
            v-if="!auth.isLoggedIn || auth.needsOnboarding || isSuperAdminPage"
            class="guest-theme-btn"
            @click="toggleTheme"
            :title="theme === 'dark' ? 'Light mode' : 'Dark mode'"
          >
            <span v-html="theme === 'dark' ? sunSvg : moonSvg"></span>
          </button>

          <router-view v-slot="{ Component, route }">
            <transition name="page" mode="out-in">
              <component :is="Component" :key="route.path" />
            </transition>
          </router-view>
        </div>
      </div>

      <!-- Mobile Bottom Nav -->
      <BottomNav
        v-if="auth.isLoggedIn && !auth.needsOnboarding"
        :theme="theme"
        @toggle-theme="toggleTheme"
      />
    </template>

    <!-- Vercel Speed Insights -->
    <SpeedInsights />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth.js'
import BottomNav from './components/BottomNav.vue'
import SideNav from './components/SideNav.vue'
import { SpeedInsights } from '@vercel/speed-insights/vue'

const auth = useAuthStore()
const route = useRoute()
const isSuperAdminPage = computed(() =>
  route.path === '/superadmin' || route.path === '/superadmin-login'
)

const saved = localStorage.getItem('gf_theme') || 'dark'
const theme = ref(saved)
const sideCollapsed = ref(localStorage.getItem('gf_side_collapsed') === '1')

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem('gf_theme', theme.value)
}

watch(sideCollapsed, v => localStorage.setItem('gf_side_collapsed', v ? '1' : '0'))

const sunSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="4" fill="currentColor" fill-opacity="0.3" stroke="currentColor" stroke-width="1.8"/>
  <path d="M12 2V4M12 20V22M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M2 12H4M20 12H22M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
</svg>`

const moonSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 3A6 6 0 0 0 21 12A9 9 0 1 1 12 3Z" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
</script>

<style>
.app-wrap { min-height: 100vh; background: var(--bg); transition: background 0.3s; }

.guest-theme-btn {
  position: fixed; top: 14px; right: 16px; z-index: 200;
  width: 40px; height: 40px; border-radius: 12px;
  border: 1px solid var(--border2);
  background: var(--surface);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: var(--text-dim);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s var(--ease-out);
}
.guest-theme-btn:hover {
  background: var(--surface2); transform: scale(1.08) rotate(15deg);
  box-shadow: var(--shadow); color: var(--text);
  border-color: var(--border3);
}

/* Sidebar collapsed: narrow the margin */
@media (min-width: 768px) {
  .app-content.has-sidebar { margin-left: var(--sidebar-w); }
  .app-content.has-sidebar.sidebar-collapsed { margin-left: 64px; }
}

/* Page transitions */
.page-enter-active {
  animation: fadeUp 0.28s var(--ease-out);
}
.page-leave-active {
  animation: fadeIn 0.18s ease reverse;
  pointer-events: none;
}
</style>
