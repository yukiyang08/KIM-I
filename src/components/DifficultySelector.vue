<template>
  <Transition name="df-modal">
    <div v-if="isOpen" class="df-overlay" @click.self="cancel">
      <div class="df-panel" role="dialog" aria-modal="true" aria-label="選擇難度">

        <!-- Close -->
        <button class="df-close" @click="cancel" aria-label="關閉">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
          </svg>
        </button>

        <!-- Header -->
        <header class="df-header">
          <h2 class="df-title">選擇難度</h2>
        </header>

        <!-- Cards -->
        <div class="df-cards">
          <button
            v-for="(lv, idx) in levels"
            :key="lv.key"
            class="df-card"
            :class="[`df-card--${lv.key}`, { 'df-card--chosen': selectedDiff === lv.key }]"
            :style="`--ci: ${idx};`"
            @click="selectDifficulty(lv.key)"
          >
            <span class="df-bar"></span>
            <span class="df-icon-wrap"><span class="df-icon">{{ lv.icon }}</span></span>
            <span class="df-body">
              <span class="df-name">{{ lv.label }}</span>
              <span class="df-pips">
                <span v-for="p in 3" :key="p" class="df-pip" :class="p <= lv.pips ? 'pip-on' : 'pip-off'"></span>
              </span>
            </span>
            <span class="df-arrow-wrap">
              <svg class="df-arrow" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3.5 9H14.5M14.5 9L9.5 4M14.5 9L9.5 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()

defineProps({
  isOpen: { type: Boolean, default: false },
  gameName: { type: String, default: '遊戲' }
})

const emit = defineEmits(['confirm', 'cancel'])
const selectedDiff = ref('normal')

const levels = [
  {
    key: 'easy',
    icon: '🌿',
    label: '初級',
    pips: 1,
    desc: '輕鬆上手，時間充裕',
    tags: ['新手友善', '放鬆模式'],
  },
  {
    key: 'normal',
    icon: '⚡',
    label: '中級',
    pips: 2,
    desc: '適度挑戰，均衡難度',
    tags: ['推薦', '標準模式'],
  },
  {
    key: 'hard',
    icon: '🔥',
    label: '高級',
    pips: 3,
    desc: '全力挑戰，考驗反應',
    tags: ['高手限定', '快節奏'],
  },
]

const selectDifficulty = (level) => {
  selectedDiff.value = level
  gameStore.setDifficulty(level)
  emit('confirm', level)
}

const cancel = () => {
  selectedDiff.value = 'normal'
  emit('cancel')
}
</script>

<style scoped>
/* ── Overlay ──────────────────────────────────────── */
.df-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  background: rgba(24, 14, 4, 0.55);
  backdrop-filter: blur(6px);
}

/* ── Panel ────────────────────────────────────────── */
.df-panel {
  position: relative;
  width: 100%;
  max-width: 580px;
  border-radius: 28px;
  padding: 2rem 1.75rem 1.5rem;
  background: linear-gradient(160deg, #FFFDF9 0%, #FFF8EF 100%);
  border: 1.5px solid rgba(200, 145, 50, 0.2);
  box-shadow:
    0 40px 100px rgba(16, 8, 0, 0.32),
    inset 0 0 0 3px rgba(255, 255, 255, 0.85),
    inset 0 0 0 5px rgba(200, 145, 50, 0.06);
  animation: panelIn 0.34s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes panelIn {
  from { opacity: 0; transform: scale(0.93) translateY(22px); }
  to   { opacity: 1; transform: none; }
}

/* ── Close ────────────────────────────────────────── */
.df-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(200, 145, 50, 0.09);
  border: 1px solid rgba(200, 145, 50, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9B7040;
  cursor: pointer;
  transition: background 0.15s, transform 0.15s;
}
.df-close:hover { background: rgba(200, 145, 50, 0.17); transform: scale(1.08); }
.df-close:active { transform: scale(0.9); }

/* ── Header ───────────────────────────────────────── */
.df-header {
  text-align: center;
  margin-bottom: 1.2rem;
  padding-right: 2rem;
}
.df-title {
  font-family: 'Noto Serif TC', 'PMingLiU', serif;
  font-weight: 900;
  font-size: clamp(1.9rem, 5vw, 2.6rem);
  color: #2D1A06;
  letter-spacing: 0.14em;
  line-height: 1;
  margin: 0;
}

/* ── Cards ────────────────────────────────────────── */
.df-cards {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-bottom: 1rem;
}

.df-card {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 86px;
  border-radius: 18px;
  padding: 0 1rem 0 0;
  overflow: hidden;
  cursor: pointer;
  background: #fff;
  border: 1.5px solid rgba(200, 145, 50, 0.1);
  box-shadow: 0 2px 10px rgba(0,0,0,0.055), 0 4px 0 rgba(0,0,0,0.035);
  text-align: left;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  animation: cardIn 0.36s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(0.08s + var(--ci) * 0.07s);
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: none; }
}

.df-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1), 0 4px 0 rgba(0,0,0,0.035);
}
.df-card:active {
  transform: translateY(1px);
  box-shadow: 0 1px 6px rgba(0,0,0,0.08);
}

/* ── Bar ──────────────────────────────────────────── */
.df-bar {
  display: block;
  width: 7px;
  flex-shrink: 0;
  align-self: stretch;
}

/* ── Icon ─────────────────────────────────────────── */
.df-icon-wrap {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0.85rem;
}
.df-icon { font-size: 1.65rem; line-height: 1; }

/* ── Body ─────────────────────────────────────────── */
.df-body {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
}
.df-name {
  font-family: 'Noto Serif TC', serif;
  font-weight: 900;
  font-size: clamp(1.3rem, 3.2vw, 1.6rem);
  line-height: 1;
  letter-spacing: 0.06em;
}
.df-pips {
  display: flex;
  gap: 5px;
  padding-top: 2px;
}
.df-pip {
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* ── Arrow ────────────────────────────────────────── */
.df-arrow-wrap {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}
.df-card:hover .df-arrow-wrap { transform: translateX(3px); }

/* ── Easy ─────────────────────────────────────────── */
.df-card--easy .df-bar         { background: linear-gradient(180deg, #5EAF78, #3A8554); }
.df-card--easy .df-icon-wrap   { background: #EAF6EF; }
.df-card--easy .df-name        { color: #2E7A50; }
.df-card--easy .pip-on         { background: #5EAF78; }
.df-card--easy .pip-off        { background: rgba(94,175,120,0.18); }
.df-card--easy .df-tag         { background: rgba(94,175,120,0.11); color: #2A7048; }
.df-card--easy .df-arrow-wrap  { background: rgba(94,175,120,0.1); color: #3A8554; }
.df-card--easy.df-card--chosen {
  background: linear-gradient(96deg, #F0FAF4 0%, #fff 60%);
  border-color: #5EAF78;
  box-shadow: 0 0 0 3px rgba(94,175,120,0.16), 0 6px 20px rgba(94,175,120,0.18);
}
.df-card--easy.df-card--chosen .df-arrow-wrap { background: #5EAF78; color: #fff; }

/* ── Normal ───────────────────────────────────────── */
.df-card--normal .df-bar        { background: linear-gradient(180deg, #F4A345, #C87820); }
.df-card--normal .df-icon-wrap  { background: #FFF4E0; }
.df-card--normal .df-name       { color: #C87820; }
.df-card--normal .pip-on        { background: #F4A345; }
.df-card--normal .pip-off       { background: rgba(244,163,69,0.2); }
.df-card--normal .df-tag        { background: rgba(244,163,69,0.12); color: #B06818; }
.df-card--normal .df-arrow-wrap { background: rgba(244,163,69,0.1); color: #C87820; }
.df-card--normal.df-card--chosen {
  background: linear-gradient(96deg, #FFFBF0 0%, #fff 60%);
  border-color: #F4A345;
  box-shadow: 0 0 0 3px rgba(244,163,69,0.18), 0 6px 20px rgba(244,163,69,0.2);
}
.df-card--normal.df-card--chosen .df-arrow-wrap { background: #F4A345; color: #fff; }

/* ── Hard ─────────────────────────────────────────── */
.df-card--hard .df-bar         { background: linear-gradient(180deg, #E86050, #C03030); }
.df-card--hard .df-icon-wrap   { background: #FFF0EE; }
.df-card--hard .df-name        { color: #C03030; }
.df-card--hard .pip-on         { background: #E86050; }
.df-card--hard .pip-off        { background: rgba(232,96,80,0.18); }
.df-card--hard .df-tag         { background: rgba(232,96,80,0.1); color: #B02828; }
.df-card--hard .df-arrow-wrap  { background: rgba(232,96,80,0.1); color: #C03030; }
.df-card--hard.df-card--chosen {
  background: linear-gradient(96deg, #FFF5F4 0%, #fff 60%);
  border-color: #E86050;
  box-shadow: 0 0 0 3px rgba(232,96,80,0.16), 0 6px 20px rgba(232,96,80,0.18);
}
.df-card--hard.df-card--chosen .df-arrow-wrap { background: #E86050; color: #fff; }


/* ── Transition ───────────────────────────────────── */
.df-modal-enter-active,
.df-modal-leave-active {
  transition: opacity 0.25s ease;
}
.df-modal-enter-from,
.df-modal-leave-to {
  opacity: 0;
}

/* ── Mobile ───────────────────────────────────────── */
@media (max-width: 480px) {
  .df-panel { padding: 1.5rem 1rem 1.25rem; border-radius: 22px; }
  .df-card  { min-height: 78px; }
  .df-icon-wrap { width: 46px; height: 46px; margin: 0 0.65rem; }
  .df-icon  { font-size: 1.4rem; }
}
</style>
