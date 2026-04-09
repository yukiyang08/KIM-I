<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4" 
       style="background: rgba(10,7,4,0.85); backdrop-filter: blur(2px);">
    
    <!-- Film strip decoration -->
    <div class="fixed top-0 left-0 right-0 h-3 flex z-40 pointer-events-none" style="background: #140C06;">
      <div v-for="i in 48" :key="i" class="flex-1 my-0.5 mx-px rounded-sm" style="background:rgba(0,0,0,0.65);"></div>
    </div>

    <!-- Modal Card -->
    <div class="rounded-3xl max-w-sm w-full transform transition-all relative z-50"
         style="background: linear-gradient(135deg, #2A1508 0%, #1E0F06 50%, #261408 100%);
                 box-shadow: 0 0 60px rgba(200,150,30,0.25), 0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.07);
                 border: 2px solid rgba(200,150,30,0.2);
                 animation: slideUp 0.3s ease;">
      
      <!-- Decorative top glows -->
      <div class="absolute -top-2 left-1/2 -translate-x-1/2 w-32 h-8 bg-gradient-to-b from-yellow-600/20 to-transparent blur-xl pointer-events-none"></div>

      <!-- Header -->
      <div class="text-center pt-8 pb-4 px-6 border-b" style="border-color: rgba(200,150,30,0.15);">
        <div class="text-5xl mb-3 animate-bounce-slow">📍</div>
        <h2 class="font-black tracking-wider" style="font-size: clamp(1.25rem, 4vw, 1.75rem); color: #C8961E; text-shadow: 0 2px 8px rgba(200,150,30,0.3);">
          選擇難度
        </h2>
      </div>

      <!-- Difficulty Options -->
      <div class="space-y-2 p-6">
        <!-- Easy -->
        <button
          @click="selectDifficulty('easy')"
          :class="[
            'w-full p-3 rounded-xl font-bold transition-all duration-200 border-2 text-sm',
            selectedDiff === 'easy'
              ? 'border-green-500/50 scale-105 shadow-lg'
              : 'border-transparent hover:border-green-500/30 active:scale-95'
          ]"
          :style="{
            background: selectedDiff === 'easy' 
              ? 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)'
              : 'rgba(76, 175, 80, 0.1)',
            color: selectedDiff === 'easy' ? '#fff' : 'rgba(255,255,255,0.7)'
          }"
        >
          <div class="flex items-center gap-2">
            <span class="text-2xl">🌱</span>
            <span>簡單</span>
          </div>
        </button>

        <!-- Normal -->
        <button
          @click="selectDifficulty('normal')"
          :class="[
            'w-full p-3 rounded-xl font-bold transition-all duration-200 border-2 text-sm',
            selectedDiff === 'normal'
              ? 'border-yellow-600/50 scale-105 shadow-lg'
              : 'border-transparent hover:border-yellow-600/30 active:scale-95'
          ]"
          :style="{
            background: selectedDiff === 'normal'
              ? 'linear-gradient(135deg, #C8961E 0%, #9B7415 100%)'
              : 'rgba(200, 150, 30, 0.1)',
            color: selectedDiff === 'normal' ? '#fff' : 'rgba(255,255,255,0.7)'
          }"
        >
          <div class="flex items-center gap-2">
            <span class="text-2xl">⭐</span>
            <span>普通</span>
          </div>
        </button>

        <!-- Hard -->
        <button
          @click="selectDifficulty('hard')"
          :class="[
            'w-full p-3 rounded-xl font-bold transition-all duration-200 border-2 text-sm',
            selectedDiff === 'hard'
              ? 'border-red-600/50 scale-105 shadow-lg'
              : 'border-transparent hover:border-red-600/30 active:scale-95'
          ]"
          :style="{
            background: selectedDiff === 'hard'
              ? 'linear-gradient(135deg, #E06030 0%, #B84928 100%)'
              : 'rgba(224, 96, 48, 0.1)',
            color: selectedDiff === 'hard' ? '#fff' : 'rgba(255,255,255,0.7)'
          }"
        >
          <div class="flex items-center gap-2">
            <span class="text-2xl">🔥</span>
            <span>困難</span>
          </div>
        </button>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2 p-6 pt-3 border-t" style="border-color: rgba(200,150,30,0.15);">
        <button
          @click="cancel"
          class="flex-1 px-4 py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95"
          style="background: rgba(100,100,100,0.2); color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.1);"
          @mouseover="e => e.target.style.background = 'rgba(100,100,100,0.3)'"
          @mouseleave="e => e.target.style.background = 'rgba(100,100,100,0.2)'"
        >
          返回
        </button>
        <button
          @click="confirm"
          class="flex-1 px-4 py-2.5 rounded-lg font-bold text-sm text-white transition-all active:scale-95 shadow-lg"
          :style="{
            background: difficultyGradient[selectedDiff],
            boxShadow: `0 6px 20px ${difficultyGlow[selectedDiff]}`
          }"
        >
          開始
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

const difficultyGradient = {
  easy: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
  normal: 'linear-gradient(135deg, #C8961E 0%, #9B7415 100%)',
  hard: 'linear-gradient(135deg, #E06030 0%, #B84928 100%)'
}

const difficultyGlow = {
  easy: 'rgba(76, 175, 80, 0.4)',
  normal: 'rgba(200, 150, 30, 0.4)',
  hard: 'rgba(224, 96, 48, 0.4)'
}

const selectDifficulty = (level) => {
  selectedDiff.value = level
}

const confirm = () => {
  gameStore.setDifficulty(selectedDiff.value)
  emit('confirm', selectedDiff.value)
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
</style>
