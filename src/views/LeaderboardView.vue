<template>
  <div class="page">
    <div class="lb-header anim-fade-up">
      <h1 class="lb-h1">🏆 Reyting</h1>
      <p class="lb-sub">Barcha foydalanuvchilar orasidagi o'rningiz</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>Yuklanmoqda...</span>
    </div>

    <template v-else>
      <!-- Podium (top 3) -->
      <div v-if="top3.length" class="podium anim-fade-up">
        <div
          v-for="p in podiumOrder"
          :key="p.user_id"
          class="podium-spot"
          :class="'spot-' + p.rank"
        >
          <div class="podium-avatar" :class="'medal-' + p.rank">
            {{ initials(p.display_name) }}
            <span class="podium-medal">{{ medal(p.rank) }}</span>
          </div>
          <div class="podium-name">{{ shortName(p.display_name) }}</div>
          <div class="podium-pts">{{ p.points }}</div>
          <div class="podium-bar" :class="'bar-' + p.rank"></div>
        </div>
      </div>

      <!-- My rank card -->
      <div v-if="myRank" class="my-rank-card anim-fade-up stagger-1">
        <div class="mr-left">
          <div class="mr-rank">#{{ myRank.rank }}</div>
          <div class="mr-label">Sizning o'rningiz</div>
        </div>
        <div class="mr-divider"></div>
        <div class="mr-right">
          <div class="mr-pts">{{ myRank.points }} <span>ball</span></div>
          <div class="mr-total">{{ myRank.total_users }} ta ishtirokchidan</div>
        </div>
      </div>

      <!-- Full list -->
      <div class="lb-list anim-fade-up stagger-2">
        <div
          v-for="row in board"
          :key="row.user_id"
          class="lb-row"
          :class="{ me: row.user_id === myId, top: row.rank <= 3 }"
        >
          <div class="lb-rank" :class="'r-' + row.rank">
            <span v-if="row.rank <= 3">{{ medal(row.rank) }}</span>
            <span v-else>{{ row.rank }}</span>
          </div>
          <div class="lb-avatar">{{ initials(row.display_name) }}</div>
          <div class="lb-info">
            <div class="lb-name">{{ row.display_name }}<span v-if="row.user_id === myId" class="lb-you">Siz</span></div>
            <div class="lb-done">{{ row.done_count }} vazifa bajarilgan</div>
          </div>
          <div class="lb-pts">{{ row.points }}<span>ball</span></div>
        </div>

        <div v-if="!board.length" class="empty-state">
          <span class="empty-state-icon">🏆</span>
          Hali reyting bo'sh
        </div>
      </div>
    </template>

    <div style="height:20px"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase.js'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()
const myId = computed(() => auth.user?.id)

const board = ref([])
const myRank = ref(null)
const loading = ref(true)

const top3 = computed(() => board.value.filter(r => r.rank <= 3))
// Podium tartibi: 2 - 1 - 3 (o'rtada birinchi)
const podiumOrder = computed(() => {
  const byRank = {}
  top3.value.forEach(p => { byRank[p.rank] = p })
  return [byRank[2], byRank[1], byRank[3]].filter(Boolean)
})

function initials(name) {
  return (name || 'U').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()
}
function shortName(name) {
  return (name || '').split(' ')[0]
}
function medal(rank) {
  return { 1: '🥇', 2: '🥈', 3: '🥉' }[rank] || rank
}

async function load() {
  loading.value = true
  try {
    const { data } = await supabase.rpc('get_leaderboard', { lim: 50 })
    board.value = data || []
    if (auth.user?.id) {
      const { data: mine } = await supabase.rpc('get_my_rank')
      myRank.value = mine?.[0] || null
    }
  } catch (e) {
    console.error('leaderboard error:', e)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.page { padding: 16px; max-width: 700px; margin: 0 auto; }
@media(min-width:768px){ .page { padding: 28px 40px; max-width: 780px; } }

.lb-header { margin-bottom: 20px; }
.lb-h1 {
  font-family: var(--font-display); font-weight: 800; font-size: 26px;
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.lb-sub { font-size: 13px; color: var(--text-dim); margin-top: 4px; }

/* ── Podium ── */
.podium {
  display: flex; align-items: flex-end; justify-content: center; gap: 12px;
  margin-bottom: 20px; padding: 20px 10px 0;
}
.podium-spot { flex: 1; max-width: 130px; display: flex; flex-direction: column; align-items: center; }
.podium-avatar {
  position: relative;
  width: 56px; height: 56px; border-radius: 18px;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-weight: 800; font-size: 18px; color: white;
  margin-bottom: 8px;
}
.medal-1 { width: 68px; height: 68px; font-size: 22px; background: linear-gradient(135deg, #f59e0b, #fbbf24); box-shadow: 0 6px 20px rgba(245,158,11,0.5); animation: float 3s ease-in-out infinite; }
.medal-2 { background: linear-gradient(135deg, #9ca3af, #d1d5db); box-shadow: 0 4px 14px rgba(156,163,175,0.4); }
.medal-3 { background: linear-gradient(135deg, #b45309, #d97706); box-shadow: 0 4px 14px rgba(180,83,9,0.4); }
.podium-medal { position: absolute; bottom: -6px; right: -6px; font-size: 20px; }
.podium-name { font-size: 13px; font-weight: 600; text-align: center; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.podium-pts { font-family: var(--font-mono); font-size: 14px; font-weight: 700; color: var(--accent-light); margin-top: 2px; }
.podium-bar { width: 100%; margin-top: 10px; border-radius: 10px 10px 0 0; }
.bar-1 { height: 70px; background: linear-gradient(180deg, rgba(245,158,11,0.35), rgba(245,158,11,0.05)); }
.bar-2 { height: 50px; background: linear-gradient(180deg, rgba(156,163,175,0.3), rgba(156,163,175,0.05)); }
.bar-3 { height: 36px; background: linear-gradient(180deg, rgba(180,83,9,0.3), rgba(180,83,9,0.05)); }

/* ── My rank card ── */
.my-rank-card {
  display: flex; align-items: center; gap: 18px;
  background: linear-gradient(135deg, rgba(108,99,255,0.12), rgba(0,212,170,0.05));
  border: 1px solid rgba(108,99,255,0.25);
  border-radius: var(--radius);
  padding: 16px 20px; margin-bottom: 14px;
  box-shadow: var(--shadow-sm);
}
.mr-rank { font-family: var(--font-display); font-weight: 800; font-size: 28px; color: var(--accent-light); }
.mr-label { font-size: 12px; color: var(--text-dim); }
.mr-divider { width: 1px; height: 40px; background: var(--border2); }
.mr-pts { font-family: var(--font-mono); font-weight: 700; font-size: 22px; }
.mr-pts span { font-size: 13px; color: var(--text-dim); font-family: var(--font-body); }
.mr-total { font-size: 12px; color: var(--text-dim); margin-top: 2px; }

/* ── List ── */
.lb-list { display: flex; flex-direction: column; gap: 6px; }
.lb-row {
  display: flex; align-items: center; gap: 12px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-sm); padding: 12px 14px;
  transition: all 0.18s var(--ease-out);
  animation: staggerIn 0.3s var(--ease-out) both;
}
.lb-row:hover { border-color: var(--border2); transform: translateX(2px); box-shadow: var(--shadow-sm); }
.lb-row.me { border-color: rgba(108,99,255,0.4); background: rgba(108,99,255,0.06); }
.lb-row.top { border-color: rgba(245,158,11,0.25); }
.lb-rank {
  width: 32px; text-align: center; flex-shrink: 0;
  font-family: var(--font-mono); font-weight: 700; font-size: 15px; color: var(--text-dim);
}
.lb-rank.r-1, .lb-rank.r-2, .lb-rank.r-3 { font-size: 20px; }
.lb-avatar {
  width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
  background: linear-gradient(135deg, var(--accent), #8b5cf6);
  color: white; display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 13px;
}
.lb-info { flex: 1; min-width: 0; }
.lb-name { font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: flex; align-items: center; gap: 6px; }
.lb-you { font-size: 10px; font-weight: 700; color: white; background: var(--accent); padding: 1px 7px; border-radius: 10px; }
.lb-done { font-size: 11px; color: var(--text-dim); font-family: var(--font-mono); margin-top: 2px; }
.lb-pts { font-family: var(--font-mono); font-weight: 700; font-size: 16px; color: var(--accent-light); flex-shrink: 0; }
.lb-pts span { font-size: 11px; color: var(--text-dim); font-family: var(--font-body); margin-left: 3px; }

@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes staggerIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
</style>
