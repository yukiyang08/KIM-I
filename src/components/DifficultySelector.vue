<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
       style="background: rgba(14,10,6,0.45); backdrop-filter: blur(4px);">

    <div class="difficulty-panel relative w-full max-w-[760px] rounded-[28px] px-5 sm:px-8 pt-7 sm:pt-9 pb-7 sm:pb-9"
         role="dialog" aria-modal="true" aria-label="選擇難度"
         style="animation: slideUp 0.28s ease;">

      <button @click="cancel"
              class="absolute right-3 top-3 sm:right-4 sm:top-4 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-3xl font-black leading-none transition-transform active:scale-95"
              style="color:#7A4E22; background:rgba(209,184,136,0.55); border:1px solid rgba(131,95,46,0.35);">
        ×
      </button>

      <h2 class="text-center difficulty-title mb-6 sm:mb-7">選擇難度</h2>

      <div class="space-y-4 sm:space-y-5 px-1 sm:px-2">
        <button
          @click="selectDifficulty('easy')"
          class="difficulty-btn difficulty-easy"
          :class="{ 'is-selected': selectedDiff === 'easy' }"
        >
          <span class="difficulty-label">初級</span>
          <span class="difficulty-icon" aria-hidden="true">🌱</span>
        </button>

        <button
          @click="selectDifficulty('normal')"
          class="difficulty-btn difficulty-normal"
          :class="{ 'is-selected': selectedDiff === 'normal' }"
        >
          <span class="difficulty-label">中級</span>
          <span class="difficulty-icon" aria-hidden="true">⚙️</span>
        </button>

        <button
          @click="selectDifficulty('hard')"
          class="difficulty-btn difficulty-hard"
          :class="{ 'is-selected': selectedDiff === 'hard' }"
        >
          <span class="difficulty-label">高級</span>
          <span class="difficulty-icon" aria-hidden="true">🔥</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  gameName: {
    type: String,
    default: '遊戲'
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const selectedDiff = ref('normal')

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
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.difficulty-panel {
  background: linear-gradient(180deg, #f2e4c8 0%, #ecdab7 100%);
  border: 3px solid #8b6436;
  box-shadow:
    inset 0 0 0 2px rgba(250, 238, 208, 0.75),
    0 14px 40px rgba(0, 0, 0, 0.35);
}

.difficulty-title {
  font-family: 'Noto Serif TC', 'PMingLiU', serif;
  font-weight: 900;
  font-size: clamp(2.2rem, 5vw, 3.5rem);
  line-height: 1.08;
  letter-spacing: 0.08em;
  color: #3a2310;
}

.difficulty-btn {
  width: 100%;
  min-height: 92px;
  border-radius: 20px;
  padding: 0.95rem 1.15rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
  border: 3px solid rgba(77, 56, 30, 0.15);
  box-shadow: 0 6px 0 rgba(54, 39, 20, 0.35), 0 10px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.difficulty-btn:active {
  transform: translateY(2px);
  box-shadow: 0 3px 0 rgba(54, 39, 20, 0.35), 0 6px 12px rgba(0, 0, 0, 0.12);
}

.difficulty-btn.is-selected {
  border-color: rgba(78, 56, 24, 0.42);
}

.difficulty-label {
  font-family: 'Noto Serif TC', 'PMingLiU', serif;
  font-size: clamp(2rem, 4.6vw, 3.2rem);
  line-height: 1;
  font-weight: 900;
  letter-spacing: 0.06em;
}

.difficulty-icon {
  font-size: clamp(2rem, 4.4vw, 3rem);
  line-height: 1;
}

.difficulty-easy {
  background: linear-gradient(180deg, #f5efdf 0%, #ebf4fd 100%);
}

.difficulty-normal {
  background: linear-gradient(180deg, #f7edd6 0%, #fee7b6 100%);
}

.difficulty-hard {
  background: linear-gradient(180deg, #f8e6d7 0%, #ffd0bf 100%);
}

.difficulty-easy .difficulty-label { color: #5881ab; }
.difficulty-normal .difficulty-label { color: #c3801c; }
.difficulty-hard .difficulty-label { color: #b44533; }

@media (max-width: 640px) {
  .difficulty-btn {
    min-height: 84px;
    border-radius: 17px;
  }
}
</style>
