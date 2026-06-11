<template>
  <div class="h-full w-full flex flex-col relative overflow-hidden font-['Outfit','Noto_Sans_TC'] text-white select-none"
       style="background: radial-gradient(ellipse at 50% 30%, #2A1C0A 0%, #150E05 55%, #0A0703 100%);">

    <!-- Browser not supported -->
    <div v-if="!speech.isSupported" class="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4 relative z-10">
      <div class="text-5xl">😅</div>
      <p class="text-lg leading-relaxed" style="color:rgba(255,231,190,0.8);">
        這個瀏覽器不支援語音功能<br>建議使用 <b style="color:#F2CF86;">Chrome</b> 或 <b style="color:#F2CF86;">Edge</b>
      </p>
      <button @click="goFormMode" class="px-8 py-4 rounded-full text-black text-lg font-black active:scale-95 transition-transform"
              style="background:linear-gradient(135deg,#D4A020,#8B6000);">
        改用點選的方式設定 →
      </button>
    </div>

    <!-- ═══════════ 開始畫面 ═══════════ -->
    <template v-else-if="phase === 'idle'">
      <div class="flex-1 flex flex-col items-center justify-center gap-7 relative z-10 px-6">
        <div class="mascot-stage">
          <img :src="mascotImg" alt="金寶" class="mascot" />
        </div>
        <div class="text-center">
          <div class="font-black text-2xl mb-2" style="font-family:'Noto Serif TC',serif; color:#F2CF86;">跟金寶聊聊天</div>
          <p class="text-base leading-relaxed" style="color:rgba(255,231,190,0.65);">
            聊聊你的興趣、家人、常去的地方
          </p>
        </div>
        <button @click="startCall"
                class="w-full max-w-xs py-5 rounded-full text-black text-xl font-black active:scale-95 transition-transform"
                style="background:linear-gradient(135deg,#D4A020,#8B6000); box-shadow:0 14px 44px rgba(200,120,0,0.38);">
          開始聊天
        </button>
        <button @click="goFormMode" class="text-sm font-semibold opacity-45 hover:opacity-80 transition-opacity"
                style="color:rgba(255,231,186,0.9);">
          改用點選的方式設定
        </button>
      </div>
    </template>

    <!-- ═══════════ 對話模式 ═══════════ -->
    <template v-else-if="phase === 'call'">

      <!-- Top -->
      <div class="shrink-0 flex flex-col items-center pt-8 pb-2 relative z-20">
        <div class="font-black text-xl tracking-wide" style="font-family:'Noto Serif TC',serif; color:#F2CF86;">
          跟金寶聊聊天
        </div>
        <div class="text-sm font-bold tabular-nums mt-1"
             :style="{ color: remainSeconds <= 60 ? '#FF9070' : 'rgba(255,231,186,0.4)' }">
          剩餘 {{ timerLabel }}
        </div>
        <div v-if="remainSeconds <= 60"
             class="text-xs font-bold mt-0.5" style="color:#FF9070;">
          快結束囉，金寶會幫你做總結
        </div>
      </div>

      <!-- Center: mascot avatar -->
      <div class="flex-1 flex flex-col items-center justify-center gap-5 relative z-10 px-6">
        <div class="mascot-stage"
             :class="{
               'mascot-stage--speaking': speech.isSpeaking.value,
               'mascot-stage--listening': speech.isListening.value,
             }">
          <img :src="mascotImg" alt="金寶" class="mascot" />
        </div>

        <div class="text-center">
          <div class="font-black text-2xl mb-1" style="font-family:'Noto Serif TC',serif; color:#F2CF86;">金寶</div>
          <div class="text-base font-bold flex items-center justify-center gap-2" style="color:rgba(255,231,186,0.65);">
            <template v-if="speech.isSpeaking.value">金寶說話中…</template>
            <template v-else-if="speech.isListening.value">
              <span class="wave-bars"><i/><i/><i/><i/><i/></span> 我在聽，請說～
            </template>
            <template v-else-if="state === 'thinking'">金寶想一下…</template>
            <template v-else>…</template>
          </div>
        </div>

        <!-- 即時字幕 -->
        <div class="caption" v-show="captionText">
          {{ captionText }}
        </div>
      </div>

      <!-- Bottom controls -->
      <div class="shrink-0 flex flex-col items-center pb-9 pt-4 px-6 relative z-20">
        <button @click="hangUp"
                class="w-full max-w-xs py-4 rounded-full text-lg font-black active:scale-95 transition-transform"
                style="background:rgba(255,255,255,0.07); border:2px solid rgba(255,231,186,0.4); color:#F2CF86;">
          結束聊天
        </button>
      </div>
    </template>

    <!-- ═══════════ 通話結束：整理好的個人資訊 ═══════════ -->
    <template v-else>
      <div class="flex-1 overflow-y-auto px-5 py-8 relative z-10">
        <div class="max-w-md mx-auto">
          <div class="text-center mb-6">
            <img :src="mascotImg" alt="金寶" class="w-24 h-24 object-contain mx-auto mb-3" />
            <h2 class="font-black text-2xl" style="font-family:'Noto Serif TC',serif; color:#F2CF86;">
              聊天結束
            </h2>
            <p class="mt-1 text-base" style="color:rgba(255,231,190,0.6);">
              金寶幫你整理好了！這是我認識的你：
            </p>
          </div>

          <!-- 整理後的個人資訊卡 -->
          <div class="space-y-3 mb-7">
            <div v-for="f in summaryFields" :key="f.key" class="summary-card">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-2xl">{{ f.emoji }}</span>
                <span class="font-black text-base" style="color:#F2CF86;">{{ f.label }}</span>
              </div>
              <div v-if="f.items.length" class="flex flex-wrap gap-2">
                <span v-for="(item, i) in f.items" :key="i" class="summary-chip">{{ item }}</span>
              </div>
              <div v-else class="text-sm font-semibold" style="color:rgba(255,231,186,0.35);">
                這次沒聊到，下次再跟金寶說～
              </div>
            </div>
          </div>

          <button @click="finishAndGo"
                  class="w-full py-5 rounded-full text-black text-xl font-black active:scale-95 transition-transform"
                  style="background:linear-gradient(135deg,#D4A020,#8B6000); box-shadow:0 14px 44px rgba(200,120,0,0.38);">
            開始玩遊戲
          </button>
          <button @click="restartCall"
                  class="w-full mt-3 py-3.5 rounded-full text-base font-black active:scale-95 transition-transform"
                  style="background:rgba(242,207,134,0.1); border:2px solid rgba(242,207,134,0.4); color:#F2CF86;">
            跟金寶聊天
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { useProfileStore } from '../stores/profileStore'
import { useSpeech } from '../composables/useSpeech'
import mascotImg from '../assets/mascot.svg'

const router  = useRouter()
const profile = useProfileStore()
const speech  = useSpeech()

const MAX_CALL_SECONDS = 5 * 60   // 最長通話 5 分鐘

const phase     = ref('idle')       // idle | call | summary
const state     = ref('idle')       // idle | thinking
const messages  = ref([])
const elapsed   = ref(0)

const profileData = ref({
  interests: [],
  family_members: [],
  favorite_places: [],
  favorite_snacks: [],
})

const fallbackMode = ref(false)
const fallbackStep = ref(0)
let callEnding = false
let silenceCount = 0
let timerId = null

const FIELDS = [
  { key: 'interests',       emoji: '🎨', label: '興趣嗜好' },
  { key: 'family_members',  emoji: '👨‍👩‍👧', label: '家人' },
  { key: 'favorite_places', emoji: '📍', label: '常去的地方' },
  { key: 'favorite_snacks', emoji: '🍢', label: '愛吃的小吃' },
]

const FALLBACK_QUESTIONS = [
  { key: 'interests',       q: '你平常上愛做啥物？唱歌、下棋還是種花？' },
  { key: 'family_members',  q: '足好的啦！那你的孫子或家人叫什麼名字呢？' },
  { key: 'favorite_places', q: '你平常最常去佗位行行？廟口還是公園？' },
  { key: 'favorite_snacks', q: '最後一題！你上愛食啥物台灣小吃？' },
]

// ── 計時 ─────────────────────────────────────────────────────
const remainSeconds = computed(() => Math.max(0, MAX_CALL_SECONDS - elapsed.value))
const timerLabel = computed(() => {
  const m = Math.floor(remainSeconds.value / 60)
  const s = remainSeconds.value % 60
  return `${m}:${String(s).padStart(2, '0')}`
})

// ── 即時字幕：金寶說話顯示回覆、長輩說話顯示辨識文字 ─────────
const lastReply = ref('')
const captionText = computed(() => {
  if (speech.interimText.value) return speech.interimText.value
  if (speech.isSpeaking.value || state.value !== 'thinking') return lastReply.value
  return ''
})

// ── 通話結束摘要 ─────────────────────────────────────────────
const summaryFields = computed(() =>
  FIELDS.map(f => ({
    ...f,
    items: profileData.value[f.key].map(item =>
      typeof item === 'string' ? item : `${item.name}${item.relation ? `（${item.relation}）` : ''}`
    ),
  }))
)

// ── 後端 ─────────────────────────────────────────────────────
const callBackend = async (msgs) => {
  const { data, error } = await supabase.functions.invoke('voice-profile-chat', {
    body: { messages: msgs, profile: profileData.value },
  })
  if (error || data?.error) throw new Error(error?.message ?? data.error)
  return data
}

const mergeProfile = (p) => {
  if (!p) return
  profileData.value = {
    interests:       p.interests       ?? [],
    family_members:  p.family_members  ?? [],
    favorite_places: p.favorite_places ?? [],
    favorite_snacks: p.favorite_snacks ?? [],
  }
}

// ── 通話迴圈：金寶講完 → 自動開麥 → 長輩講完 → 送後端 → 金寶講 ──
const say = async (text) => {
  lastReply.value = text
  messages.value.push({ role: 'assistant', content: text })
  await speech.speak(text)
}

const listen = () => {
  if (callEnding || phase.value !== 'call') return
  speech.startListening(onUserSpoke, onSilence)
}

const onSilence = async () => {
  if (callEnding || phase.value !== 'call') return
  silenceCount++
  if (silenceCount === 3) {
    await say('還在嗎？免緊張，慢慢說就好喔～')
  } else if (silenceCount >= 6) {
    return endCall(true)   // 太久沒回應，溫柔結束
  }
  listen()
}

const onUserSpoke = async (text) => {
  if (callEnding) return
  silenceCount = 0
  messages.value.push({ role: 'user', content: text })
  state.value = 'thinking'

  let data
  if (fallbackMode.value) {
    data = fallbackTurn(text)
  } else {
    try {
      data = await callBackend(messages.value)
    } catch {
      fallbackMode.value = true
      fallbackStep.value = FIELDS.findIndex(f => profileData.value[f.key].length === 0)
      if (fallbackStep.value < 0) fallbackStep.value = FALLBACK_QUESTIONS.length
      data = fallbackTurn(text)
    }
  }

  mergeProfile(data.profile)
  state.value = 'idle'
  await say(data.reply)

  if (data.completed || remainSeconds.value <= 0) return endCall(false)
  listen()
}

// 腳本模式（後端不可用）：依序問四題
const fallbackTurn = (userText) => {
  const field = FALLBACK_QUESTIONS[fallbackStep.value]?.key
  if (field) {
    const item = field === 'family_members' ? { name: userText, relation: '' } : userText
    profileData.value[field] = [...profileData.value[field], item]
  }
  fallbackStep.value++
  if (fallbackStep.value < FALLBACK_QUESTIONS.length) {
    return { reply: FALLBACK_QUESTIONS[fallbackStep.value].q, profile: profileData.value, completed: false }
  }
  return { reply: '攏設定好啊！足讚的啦～我已經記住你說的話了！', profile: profileData.value, completed: true }
}

// ── 結束通話 ─────────────────────────────────────────────────
const endCall = async (sayGoodbye) => {
  if (callEnding) return
  callEnding = true
  speech.stopListening()
  if (timerId) { clearInterval(timerId); timerId = null }
  if (sayGoodbye) {
    await say('今天跟你聊天真開心！我幫你把資料整理好囉～')
  }
  await saveProfile()
  phase.value = 'summary'
}

const hangUp = () => {
  speech.stopSpeaking()
  endCall(false)
}

const saveProfile = async () => {
  try {
    await supabase.from('user_voice_profiles').upsert({
      user_id:         profile.userId,
      interests:       profileData.value.interests,
      family_members:  profileData.value.family_members,
      favorite_places: profileData.value.favorite_places,
      favorite_snacks: profileData.value.favorite_snacks,
      transcript:      messages.value,
      is_complete:     FIELDS.every(f => profileData.value[f.key].length > 0),
    }, { onConflict: 'user_id' })
  } catch (e) {
    console.warn('voice profile save failed', e)
  }
}

const finishAndGo = () => {
  profile.completeSetup()
  router.push({ name: 'lobby' })
}

const goFormMode = () => {
  callEnding = true
  speech.stopSpeaking()
  speech.stopListening()
  router.push({ name: 'profile' })
}

// ── 開始通話 ─────────────────────────────────────────────────
const startCall = async () => {
  phase.value = 'call'
  callEnding = false
  silenceCount = 0
  elapsed.value = 0
  messages.value = []
  state.value = 'idle'

  timerId = setInterval(() => {
    elapsed.value++
    // 時間到且金寶沒在講話 → 收尾
    if (remainSeconds.value <= 0 && !callEnding && !speech.isSpeaking.value && state.value !== 'thinking') {
      endCall(true)
    }
  }, 1000)

  try {
    const data = await callBackend([])
    await say(data.reply)
  } catch {
    fallbackMode.value = true
    fallbackStep.value = 0
    await say('哈囉！食飽未？我是金寶！咱來聊聊天，我才知道你愛啥～你平常上愛做啥物？')
  }
  listen()
}

const restartCall = () => {
  profileData.value = { interests: [], family_members: [], favorite_places: [], favorite_snacks: [] }
  fallbackMode.value = false
  startCall()
}

onUnmounted(() => {
  callEnding = true
  if (timerId) clearInterval(timerId)
  speech.stopListening()
  speech.stopSpeaking()
})
</script>

<style scoped>
/* ── 金寶：依通話狀態變化動作與光暈 ── */
.mascot-stage {
  animation: mascot-float 3.2s ease-in-out infinite;
}

.mascot {
  width: 200px;
  height: 200px;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 14px 36px rgba(240, 192, 64, 0.3));
  transition: filter 0.3s ease;
}
@media (min-width: 640px) {
  .mascot { width: 250px; height: 250px; }
}

/* 待機：輕輕飄浮 */
@keyframes mascot-float {
  0%, 100% { transform: translateY(0) rotate(-1.5deg); }
  50%      { transform: translateY(-12px) rotate(1.5deg); }
}

/* 金寶說話：上下彈跳 + 金色光暈 */
.mascot-stage--speaking {
  animation: mascot-talk 0.55s ease-in-out infinite;
}
.mascot-stage--speaking .mascot {
  filter: drop-shadow(0 14px 40px rgba(240, 192, 64, 0.65));
}
@keyframes mascot-talk {
  0%, 100% { transform: translateY(0)    scale(1, 1); }
  30%      { transform: translateY(-8px) scale(1.03, 0.97); }
  60%      { transform: translateY(0)    scale(0.98, 1.03); }
}

/* 長輩說話：左右搖擺聆聽 + 綠色光暈 */
.mascot-stage--listening {
  animation: mascot-listen 1.6s ease-in-out infinite;
}
.mascot-stage--listening .mascot {
  filter: drop-shadow(0 14px 40px rgba(111, 207, 124, 0.55));
}
@keyframes mascot-listen {
  0%, 100% { transform: rotate(-3deg); }
  50%      { transform: rotate(3deg) translateY(-4px); }
}

/* 即時字幕 */
.caption {
  max-width: 420px;
  min-height: 52px;
  padding: 12px 20px;
  border-radius: 16px;
  text-align: center;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.6;
  color: rgba(255, 231, 186, 0.92);
  background: rgba(40, 24, 8, 0.85);
  border: 1px solid rgba(236, 196, 122, 0.3);
}

/* 聆聽中的音波動畫 */
.wave-bars {
  display: inline-flex;
  align-items: flex-end;
  gap: 2.5px;
  height: 16px;
}
.wave-bars i {
  width: 3px;
  border-radius: 2px;
  background: #6FCF7C;
  animation: wave 1s ease-in-out infinite;
}
.wave-bars i:nth-child(1) { height: 6px;  animation-delay: 0s; }
.wave-bars i:nth-child(2) { height: 12px; animation-delay: 0.15s; }
.wave-bars i:nth-child(3) { height: 16px; animation-delay: 0.3s; }
.wave-bars i:nth-child(4) { height: 12px; animation-delay: 0.45s; }
.wave-bars i:nth-child(5) { height: 6px;  animation-delay: 0.6s; }
@keyframes wave {
  0%, 100% { transform: scaleY(0.5); }
  50%      { transform: scaleY(1.4); }
}

/* 摘要卡片 */
.summary-card {
  border-radius: 16px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(242, 207, 134, 0.25);
}
.summary-chip {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 800;
  color: #FFEFD0;
  background: rgba(242, 207, 134, 0.15);
  border: 1.5px solid rgba(242, 207, 134, 0.4);
}
</style>
