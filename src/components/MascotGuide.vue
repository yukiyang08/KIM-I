<template>
  <!-- Inline mode: sits in page flow above form content -->
  <div v-if="inline" class="mascot-inline">
    <div class="mascot-inline-img-wrap">
      <img :src="mascotImg" alt="金寶" class="mascot-inline-img" />
    </div>
    <transition name="bubble">
      <div class="bubble bubble--inline" @click="onMascotClick">
        <div class="bubble-name">{{ name }}</div>
        <p class="bubble-text">{{ currentMessage }}</p>
        <div v-if="messages.length > 1" class="bubble-dots">
          <span v-for="(_, i) in messages" :key="i"
                class="dot" :class="{ 'dot--active': i === msgIndex }"/>
        </div>
        <div v-if="currentActions.length" class="bubble-actions">
          <button v-for="act in currentActions" :key="act.label"
                  class="action-btn"
                  @click.stop="onAction(act)">
            {{ act.label }}
          </button>
        </div>
      </div>
    </transition>
  </div>

  <!-- Default mode: fixed bottom-right floating -->
  <div v-else class="mascot-wrap" :class="{ 'mascot-wrap--open': bubbleOpen }">

    <!-- Speech bubble -->
    <transition name="bubble">
      <div v-if="bubbleOpen" class="bubble" @click.stop>
        <div class="bubble-name">{{ name }}</div>
        <p class="bubble-text">{{ currentMessage }}</p>
        <div v-if="messages.length > 1" class="bubble-dots">
          <span v-for="(_, i) in messages" :key="i"
                class="dot" :class="{ 'dot--active': i === msgIndex }"/>
        </div>
        <!-- Action buttons -->
        <div v-if="currentActions.length" class="bubble-actions">
          <button v-for="act in currentActions" :key="act.label"
                  class="action-btn"
                  @click.stop="onAction(act)">
            {{ act.label }}
          </button>
        </div>
        <button class="bubble-close" @click="bubbleOpen = false">✕</button>
      </div>
    </transition>

    <!-- Mascot image -->
    <div class="mascot-btn" @click="onMascotClick">
      <img :src="mascotImg" alt="金寶" class="mascot-img" />
      <!-- Notification dot when there's a new tip -->
      <span v-if="!bubbleOpen && hasNewTip" class="notif-dot"/>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import mascotImg from '../assets/mascot.svg'

const props = defineProps({
  messages: { type: Array, default: () => ['你好！我是金寶，有什麼需要幫忙的嗎？'] },
  // actions: Array of { label, fn, msgIndex? } — msgIndex means only show on that message
  actions:  { type: Array, default: () => [] },
  name:     { type: String, default: '金寶' },
  autoShow: { type: Boolean, default: true },
  autoNext: { type: Boolean, default: true },
  inline:   { type: Boolean, default: false },
})

const emit = defineEmits(['action'])

const bubbleOpen = ref(false)
const msgIndex   = ref(0)
const hasNewTip  = ref(true)

const currentMessage = computed(() => props.messages[msgIndex.value] ?? '')

const currentActions = computed(() =>
  props.actions.filter(a => a.msgIndex == null || a.msgIndex === msgIndex.value)
)

const onAction = (act) => {
  bubbleOpen.value = false
  if (act.fn) act.fn()
  else emit('action', act)
}

let autoTimer = null

const startAutoNext = () => {
  if (!props.autoNext || props.messages.length <= 1) return
  autoTimer = setInterval(() => {
    msgIndex.value = (msgIndex.value + 1) % props.messages.length
  }, 4000)
}

const stopAutoNext = () => {
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null }
}

const onMascotClick = () => {
  if (bubbleOpen.value) {
    msgIndex.value = (msgIndex.value + 1) % props.messages.length
  } else {
    bubbleOpen.value = true
    hasNewTip.value = false
    startAutoNext()
  }
}

watch(() => props.messages, () => {
  msgIndex.value = 0
  hasNewTip.value = true
  if (bubbleOpen.value) stopAutoNext(), startAutoNext()
})

watch(bubbleOpen, (v) => { if (!v) stopAutoNext() })

onMounted(() => {
  if (props.autoShow) {
    setTimeout(() => {
      bubbleOpen.value = true
      hasNewTip.value = false
      startAutoNext()
    }, 800)
  }
})

onUnmounted(stopAutoNext)
</script>

<style scoped>
.mascot-wrap {
  position: fixed;
  bottom: 24px;
  right: 16px;
  z-index: 70; /* 低於漢堡選單抽屜(90)與遮罩(80)，開選單時會被正確蓋住 */
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  pointer-events: none;
}

.mascot-btn {
  position: relative;
  width: 96px;
  height: 96px;
  cursor: pointer;
  pointer-events: all;
  filter: drop-shadow(0 4px 16px rgba(240,192,64,0.35));
  animation: mascot-float 3s ease-in-out infinite;
  transition: transform 0.15s ease;
}
.mascot-btn:active { transform: scale(0.92); }

.mascot-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.notif-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #FF5050;
  border: 2px solid #1A0D04;
  animation: notif-pulse 1.5s ease-in-out infinite;
}

.bubble {
  position: relative;
  max-width: 220px;
  padding: 14px 16px 12px;
  border-radius: 18px 18px 4px 18px;
  pointer-events: all;
  background: linear-gradient(145deg, rgba(40,24,8,0.97), rgba(26,14,4,0.97));
  border: 1px solid rgba(236,196,122,0.35);
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}

.bubble-name {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #F0C040;
  margin-bottom: 5px;
}

.bubble-text {
  font-size: 13px;
  line-height: 1.6;
  color: rgba(255,231,186,0.92);
  margin: 0;
  padding-right: 16px;
}

.bubble-dots {
  display: flex;
  gap: 4px;
  margin-top: 8px;
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(240,192,64,0.3);
  transition: background 0.3s;
}
.dot--active { background: #F0C040; }

.bubble-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
}

.action-btn {
  width: 100%;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 800;
  text-align: center;
  cursor: pointer;
  background: linear-gradient(135deg, #D4A020, #8B6000);
  color: #1A0D04;
  border: none;
  transition: opacity 0.15s, transform 0.15s;
}
.action-btn:active { transform: scale(0.96); opacity: 0.85; }

.bubble-close {
  position: absolute;
  top: 8px;
  right: 10px;
  font-size: 10px;
  color: rgba(255,200,100,0.4);
  background: none;
  border: none;
  cursor: pointer;
  line-height: 1;
  padding: 2px;
}
.bubble-close:hover { color: rgba(255,200,100,0.8); }

/* Animations */
@keyframes mascot-float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}

@keyframes notif-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(1.3); opacity: 0.7; }
}

.bubble-enter-active {
  animation: bubble-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.bubble-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.bubble-leave-to {
  opacity: 0;
  transform: scale(0.85) translateY(8px);
}

@keyframes bubble-in {
  from { opacity: 0; transform: scale(0.75) translateY(12px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* ── Inline mode ── */
.mascot-inline {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  max-width: 480px;
  margin: 0 auto 20px;
  padding: 0 4px;
}

.mascot-inline-img-wrap {
  flex-shrink: 0;
  width: 130px;
  height: 130px;
  animation: mascot-float 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 12px rgba(240,192,64,0.3));
}

.mascot-inline-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.bubble--inline {
  flex: 1;
  position: relative;
  border-radius: 18px 18px 18px 4px;
  cursor: pointer;
  user-select: none;
}
.bubble--inline:active { opacity: 0.88; }
</style>
