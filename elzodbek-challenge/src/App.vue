<template>
  <div class="app-wrap">
    <div v-if="auth.loading" class="splash">
      <div class="splash-logo">GF</div>
      <div class="splash-name">GoalFlow</div>
      <div class="splash-loader"><div class="loader-bar"></div></div>
    </div>

    <template v-else>
      <router-view v-slot="{ Component }">
        <transition name="fade">
          <component :is="Component" />
        </transition>
      </router-view>
      <BottomNav v-if="auth.isLoggedIn && !auth.needsOnboarding" />
    </template>
  </div>
</template>

<script setup>
import { useAuthStore } from './stores/auth.js'
import BottomNav from './components/BottomNav.vue'

const auth = useAuthStore()
</script>

<style>
.app-wrap { min-height: 100vh; }
.splash { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--bg); gap: 12px; }
.splash-logo { width: 72px; height: 72px; background: var(--accent); border-radius: 20px; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 800; font-size: 28px; color: white; box-shadow: 0 0 40px rgba(108,99,255,0.4); }
.splash-name { font-family: var(--font-display); font-weight: 800; font-size: 28px; color: var(--text); }
.splash-loader { width: 120px; height: 3px; background: var(--surface2); border-radius: 2px; overflow: hidden; margin-top: 16px; }
.loader-bar { height: 100%; background: var(--accent); border-radius: 2px; animation: loading 1.2s ease infinite; }
@keyframes loading { 0% { width: 0%; margin-left: 0; } 50% { width: 60%; margin-left: 20%; } 100% { width: 0%; margin-left: 100%; } }
</style>
