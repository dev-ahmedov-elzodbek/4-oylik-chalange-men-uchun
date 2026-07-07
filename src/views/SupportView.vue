<template>
  <div class="page support-page">
    <div class="sup-header anim-fade-up">
      <h1 class="sup-h1">💬 Yordam</h1>
      <p class="sup-sub">Savolingiz bo'lsa yozing — tez orada javob beramiz</p>
    </div>

    <div class="chat-box anim-fade-up">
      <div ref="scrollEl" class="chat-scroll">
        <div v-if="loading" class="chat-loading">
          <div class="loading-spinner"></div>
        </div>

        <template v-else>
          <div v-if="!messages.length" class="chat-empty">
            <div class="chat-empty-icon">👋</div>
            <div class="chat-empty-title">Salom!</div>
            <div class="chat-empty-sub">Bu yerda biz bilan bog'lanishingiz mumkin.<br>Savol yoki muammoingizni yozing.</div>
          </div>

          <div
            v-for="m in messages"
            :key="m.id"
            class="chat-msg"
            :class="m.sender === 'user' ? 'from-user' : 'from-admin'"
          >
            <div v-if="m.sender === 'admin'" class="chat-avatar">GF</div>
            <div class="chat-bubble">
              <div class="chat-text">{{ m.message }}</div>
              <div class="chat-time">{{ fmtTime(m.created_at) }}</div>
            </div>
          </div>
        </template>
      </div>

      <div class="chat-input-row">
        <input
          v-model="draft"
          class="chat-input"
          placeholder="Xabar yozing..."
          @keydown.enter="send"
        />
        <button class="chat-send" :disabled="!draft.trim() || sending" @click="send">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>

    <div style="height:20px"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { supabase } from '../supabase.js'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()
const messages = ref([])
const draft = ref('')
const loading = ref(true)
const sending = ref(false)
const scrollEl = ref(null)
let channel = null

function fmtTime(ts) {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

async function scrollBottom() {
  await nextTick()
  if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight
}

async function load() {
  if (!auth.user?.id) return
  loading.value = true
  const { data } = await supabase
    .from('support_messages')
    .select('*')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: true })
  messages.value = data || []
  loading.value = false
  scrollBottom()

  // Admin javoblarini o'qilgan deb belgilash
  await supabase.from('support_messages')
    .update({ is_read: true })
    .eq('user_id', auth.user.id)
    .eq('sender', 'admin')
    .eq('is_read', false)
}

async function send() {
  const text = draft.value.trim()
  if (!text || !auth.user?.id) return
  sending.value = true
  draft.value = ''
  const { error } = await supabase.from('support_messages').insert({
    user_id: auth.user.id,
    sender: 'user',
    message: text,
  })
  if (error) { draft.value = text; console.error(error) }
  else await poll()
  sending.value = false
}

// Jim yangilash (polling) — yangi xabar bo'lsa qo'shamiz
async function poll() {
  if (!auth.user?.id) return
  const { data } = await supabase
    .from('support_messages')
    .select('*')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: true })
  if (!data) return
  if (data.length !== messages.value.length) {
    const hadMore = data.length > messages.value.length
    messages.value = data
    if (hadMore) {
      scrollBottom()
      // Admin javoblarini o'qilgan deb belgilash
      await supabase.from('support_messages').update({ is_read: true })
        .eq('user_id', auth.user.id).eq('sender', 'admin').eq('is_read', false)
    }
  }
}

let pollTimer = null
onMounted(() => { load(); pollTimer = setInterval(poll, 3000) })
onUnmounted(() => { if (pollTimer) clearInterval(pollTimer); if (channel) supabase.removeChannel(channel) })
</script>

<style scoped>
.support-page { padding: 16px; max-width: 700px; margin: 0 auto; display: flex; flex-direction: column; }
@media(min-width:768px){ .support-page { padding: 28px 40px; } }

.sup-header { margin-bottom: 16px; }
.sup-h1 {
  font-family: var(--font-display); font-weight: 800; font-size: 26px;
  background: linear-gradient(135deg, var(--text) 50%, var(--accent-light));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.sup-sub { font-size: 13px; color: var(--text-dim); margin-top: 4px; }

.chat-box {
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column;
  height: 62vh; min-height: 380px;
}
.chat-scroll { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.chat-loading { display: flex; justify-content: center; padding: 40px; }

.chat-empty { text-align: center; margin: auto; color: var(--text-dim); }
.chat-empty-icon { font-size: 44px; animation: float 3s ease-in-out infinite; }
.chat-empty-title { font-family: var(--font-display); font-weight: 700; font-size: 18px; color: var(--text); margin-top: 8px; }
.chat-empty-sub { font-size: 13px; line-height: 1.6; margin-top: 6px; }

.chat-msg { display: flex; align-items: flex-end; gap: 8px; max-width: 82%; animation: msgIn 0.25s var(--ease-out); }
.chat-msg.from-user { align-self: flex-end; flex-direction: row-reverse; }
.chat-msg.from-admin { align-self: flex-start; }
.chat-avatar {
  width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
  background: linear-gradient(135deg, var(--accent), #8b5cf6);
  color: white; display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-weight: 800; font-size: 11px;
}
.chat-bubble { padding: 10px 14px; border-radius: 16px; }
.from-user .chat-bubble {
  background: linear-gradient(135deg, var(--accent), #8b5cf6);
  color: white; border-bottom-right-radius: 5px;
}
.from-admin .chat-bubble {
  background: var(--surface3); color: var(--text);
  border-bottom-left-radius: 5px;
}
.chat-text { font-size: 14px; line-height: 1.45; white-space: pre-wrap; word-break: break-word; }
.chat-time { font-size: 10px; opacity: 0.6; margin-top: 3px; text-align: right; font-family: var(--font-mono); }

.chat-input-row {
  display: flex; gap: 8px; padding: 12px;
  border-top: 1px solid var(--border);
  background: var(--surface2);
}
.chat-input {
  flex: 1; background: var(--surface); border: 1px solid var(--border2);
  border-radius: 12px; padding: 11px 14px; color: var(--text);
  font-family: var(--font-body); font-size: 14px; outline: none;
  transition: border-color 0.2s;
}
.chat-input:focus { border-color: var(--accent); }
.chat-send {
  width: 44px; height: 44px; flex-shrink: 0; border: none; cursor: pointer;
  border-radius: 12px; color: white;
  background: linear-gradient(135deg, var(--accent), #8b5cf6);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s var(--ease-spring);
}
.chat-send:hover:not(:disabled) { transform: scale(1.08); }
.chat-send:disabled { opacity: 0.5; cursor: default; }

@keyframes msgIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
</style>
