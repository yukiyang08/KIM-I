<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center" style="background: rgba(0,0,0,0.7);">
    <div class="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full mx-4 transform transition-all"
         style="animation: slideUp 0.3s ease;">
      
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="text-6xl mb-4">⏱️</div>
        <h2 class="text-3xl font-black text-gray-800 mb-2">選擇難度</h2>
        <p class="text-gray-600 text-lg">{{ gameName }}</p>
      </div>

      <!-- Difficulty Options -->
      <div class="space-y-3 mb-8">
        <!-- Easy -->
        <button
          @click="selectDifficulty('easy')"
          :class="[
            'w-full p-4 rounded-2xl font-bold text-lg transition-all duration-200',
            selectedDiff === 'easy'
              ? 'bg-green-500 text-white scale-105 shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-green-100 active:scale-95'
          ]"
        >
          <div class="flex items-center gap-3">
            <span class="text-2xl">🌱</span>
            <div class="text-left">
              <div class="font-bold">簡單</div>
              <div class="text-sm opacity-75">適合初學者</div>
            </div>
          </div>
        </button>

        <!-- Normal -->
        <button
          @click="selectDifficulty('normal')"
          :class="[
            'w-full p-4 rounded-2xl font-bold text-lg transition-all duration-200',
            selectedDiff === 'normal'
              ? 'bg-yellow-500 text-white scale-105 shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-yellow-100 active:scale-95'
          ]"
        >
          <div class="flex items-center gap-3">
            <span class="text-2xl">⭐</span>
            <div class="text-left">
              <div class="font-bold">普通</div>
              <div class="text-sm opacity-75">標準難度</div>
            </div>
          </div>
        </button>

        <!-- Hard -->
        <button
          @click="selectDifficulty('hard')"
          :class="[
            'w-full p-4 rounded-2xl font-bold text-lg transition-all duration-200',
            selectedDiff === 'hard'
              ? 'bg-red-500 text-white scale-105 shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-red-100 active:scale-95'
          ]"
        >
          <div class="flex items-center gap-3">
            <span class="text-2xl">🔥</span>
            <div class="text-left">
              <div class="font-bold">困難</div>
              <div class="text-sm opacity-75">挑戰高手</div>
            </div>
          </div>
        </button>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3">
        <button
          @click="cancel"
          class="flex-1 px-6 py-3 rounded-2xl font-bold text-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors active:scale-95"
        >
          返回
        </button>
        <button
          @click="confirm"
          class="flex-1 px-6 py-3 rounded-2xl font-bold text-lg text-white transition-all active:scale-95"
          :style="{
            background: difficultyColor[selectedDiff]
          }"
        >
          開始遊戲
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

const difficultyColor = {
  easy: '#22c55e',
  normal: '#eab308',
  hard: '#ef4444'
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
