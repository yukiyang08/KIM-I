<template>
  <!-- Responsive Game Template -->
  <div class="h-full w-full flex flex-col font-['Outfit','Noto_Sans_TC'] overflow-hidden select-none"
       style="background: #0A0704;">

    <!-- Film strip top -->
    <div class="flex shrink-0 h-3 sm:h-4 z-10" style="background: #140C06;">
      <div v-for="i in 36" :key="i" class="flex-1 my-0.5 mx-px rounded-sm" style="background: rgba(0,0,0,0.6);"></div>
    </div>

    <!-- Responsive Header -->
    <header class="shrink-0 px-3 sm:px-4 md:px-6 lg:px-10 py-3 sm:py-4 md:py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 border-b z-10 relative"
            style="background: rgba(8,5,2,0.97); border-color: rgba(255,255,255,0.05);">
      
      <!-- Left section -->
      <div class="w-full sm:flex-1">
        <button @click="goBack" class="flex items-center gap-1.5 sm:gap-2 mb-2 text-sm sm:text-base font-bold transition-colors"
                style="color: rgba(200,150,30,0.45);"
                @mouseover="e => e.currentTarget.style.color = '#C8961E'"
                @mouseleave="e => e.currentTarget.style.color = 'rgba(200,150,30,0.45)'">
          ← <span class="hidden sm:inline">離開</span>
        </button>
        <h1 class="font-black tracking-widest"
            style="font-size: clamp(1.5rem, 4vw, 2.5rem); color: #C8961E; text-shadow: 0 0 40px rgba(200,150,30,0.3);">
          遊戲名稱
        </h1>
        <p class="text-xs sm:text-sm md:text-base mt-1 italic font-medium" style="color: rgba(255,255,255,0.3);">
          遊戲描述
        </p>
      </div>

      <!-- Right section - Score -->
      <div class="text-right">
        <div class="text-xs sm:text-sm font-bold uppercase tracking-widest mb-0.5 sm:mb-1" style="color: rgba(255,255,255,0.2);">得分</div>
        <div class="font-black text-white tabular-nums drop-shadow-lg"
             style="font-size: clamp(2rem, 5vw, 3rem);">
          {{ score }}
        </div>
        <transition name="combo-pop">
          <div v-if="combo > 1" key="combo" class="text-lg sm:text-xl font-black mt-0.5 sm:mt-1"
               style="color: #C8961E; text-shadow: 0 0 16px rgba(200,150,30,0.5);">
            {{ combo }}x COMBO！
          </div>
        </transition>
      </div>
    </header>

    <!-- Main Game Area (Responsive) -->
    <main class="flex-1 relative overflow-hidden">
      <!-- Game content goes here -->
      <div class="w-full h-full flex items-center justify-center text-center text-white p-4">
        <p style="font-size: clamp(1rem, 3vw, 1.5rem);">遊戲內容區域</p>
      </div>
    </main>

    <!-- Responsive Controls Footer -->
    <footer class="shrink-0 px-3 sm:px-4 md:px-6 lg:px-10 py-3 sm:py-4 md:py-5 border-t z-10 relative"
            style="background: rgba(8,5,2,0.97); border-color: rgba(255,255,255,0.05);">
      
      <!-- Control buttons (responsive grid) -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
        <button class="px-3 sm:px-4 md:px-6 py-2 sm:py-2 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold"
                style="background: rgba(200,150,30,0.2); color: #C8961E;">
          提示
        </button>
        <button class="px-3 sm:px-4 md:px-6 py-2 sm:py-2 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold"
                style="background: rgba(100,150,220,0.2); color: #50A0D8;">
          暫停
        </button>
        <button class="px-3 sm:px-4 md:px-6 py-2 sm:py-2 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold"
                style="background: rgba(220,80,40,0.2); color: #E06030;">
          重試
        </button>
      </div>

      <!-- Info text (hidden on very small screens) -->
      <p class="hidden sm:block text-xs md:text-sm mt-3 sm:mt-4 text-center"
         style="color: rgba(255,255,255,0.3);">
        難度: {{ difficulty }} | 時間: {{ timeElapsed }}s
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'

const router = useRouter()
const gameStore = useGameStore()

const score = ref(0)
const combo = ref(1)
const timeElapsed = ref(0)

// 訪問當前難度
const difficulty = computed(() => gameStore.difficulty)

// 根據難度調整遊戲參數
const gameConfig = computed(() => {
  const configs = {
    easy: {
      speed: 1.0,
      lives: 5,
      scoreMultiplier: 1.0,
      timeLimit: 180  // 3分鐘
    },
    normal: {
      speed: 1.5,
      lives: 3,
      scoreMultiplier: 1.5,
      timeLimit: 120  // 2分鐘
    },
    hard: {
      speed: 2.0,
      lives: 1,
      scoreMultiplier: 2.0,
      timeLimit: 60   // 1分鐘
    }
  }
  return configs[difficulty.value]
})

const goBack = () => {
  if (confirm('確定要離開遊戲嗎？進度將不被保存。')) {
    router.push('/')
  }
}

const endGame = () => {
  // 保存遊戲結果到 store（難度會自動包含）
  gameStore.addSession('game-id', score.value, {
    combo: combo.value,
    timeElapsed: timeElapsed.value
  })
  router.push('/')
}
</script>

<style scoped>
.combo-pop-enter-active, .combo-pop-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.combo-pop-enter-from, .combo-pop-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* 隱藏詳細信息在極小屏幕上 */
@media (max-width: 320px) {
  .hidden-xs {
    display: none;
  }
}

/* 橫屏優化 */
@media (orientation: landscape) and (max-height: 500px) {
  header {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
  footer {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
}
</style>
