<template>
  <div class="h-full w-full bg-[#0D0B0A] flex flex-col font-['Outfit',_'Noto_Sans_TC'] overflow-y-auto pb-[100px] relative">
    
    <!-- Night Market Glows (Blurred spots) -->
    <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FF4D4D]/10 rounded-full blur-[150px] pointer-events-none"></div>
    <div class="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] bg-[#F0A500]/10 rounded-full blur-[150px] pointer-events-none"></div>

    <!-- Lobby Header with Lantern Feel -->
    <header class="px-12 pt-16 pb-12 relative z-10 border-b border-white/5">
      <div class="flex items-center gap-6">
        <div class="w-2.5 h-16 bg-[#FF4D4D] rounded-full shadow-[0_0_20px_#FF4D4D]"></div>
        <div>
          <h1 class="text-7xl font-black tracking-widest text-[#F0A500] drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">金憶夜市</h1>
          <p class="text-3xl text-white/70 mt-4 font-medium italic">奶奶，今天想在哪一攤玩呢？</p>
        </div>
      </div>
    </header>

    <!-- Coming Soon Toast -->
    <transition name="fade">
      <div v-if="comingSoon" class="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-4 rounded-full font-bold text-2xl shadow-2xl">
        【{{ comingSoon }}】積極開發中，敬請期待！
      </div>
    </transition>

    <!-- 8 Games Grid -->
    <main class="flex-1 px-12 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-12">
      <div 
        v-for="game in games" 
        :key="game.id"
        class="game-card group cursor-pointer relative"
        @click="goToGame(game)"
      >
        <!-- Card Body -->
        <div 
          class="aspect-[4/5] rounded-[50px] overflow-hidden border-8 border-transparent transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative flex flex-col items-center justify-center p-8 active:scale-95"
          :style="{ background: game.color }"
        >
          <!-- Game Icon Placeholder (Using Emoji for demo) -->
          <div class="text-[100px] mb-8 filter drop-shadow-lg">{{ game.icon }}</div>
          
          <!-- Game Name -->
          <div class="text-center font-black text-white text-4xl leading-tight tracking-wide drop-shadow-md">
            {{ game.name }}
          </div>
          
          <!-- Category Badge -->
          <div class="mt-6 bg-black/30 px-6 py-2 rounded-full text-white/90 text-xl font-bold uppercase tracking-widest">
            {{ game.category }}
          </div>

          <!-- Highlight Layer -->
          <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const comingSoon = ref(null)

const games = [
  { id: 'pinball', name: '夜市彈珠台', icon: '🎰', category: '手眼協調', color: 'linear-gradient(135deg, #FF6B6B, #EE5253)' },
  { id: 'shopping', name: '柑仔店採買', icon: '🥫', category: '工作記憶', color: 'linear-gradient(135deg, #feca57, #ff9f43)' },
  { id: 'cooking', name: '阿嬤家常菜', icon: '🍲', category: '執行計畫', color: 'linear-gradient(135deg, #1dd1a1, #10ac84)' },
  { id: 'puppet', name: '廟口布袋戲', icon: '🎭', category: '注意追蹤', color: 'linear-gradient(135deg, #48dbfb, #0abde3)' },
  { id: 'crafting', name: '民俗手作業', icon: '🥟', category: '精細動作', color: 'linear-gradient(135deg, #ff9ff3, #f368e0)' },
  { id: 'riddle', name: '老歌猜謎', icon: '🎵', category: '長期記憶', color: 'linear-gradient(135deg, #54a0ff, #2e86de)' },
  { id: 'puzzle', name: '廟口大拼圖', icon: '🧩', category: '視覺空間', color: 'linear-gradient(135deg, #5f27cd, #341f97)' },
  { id: 'exploration', name: '老巷尋寶', icon: '🗺️', category: '定嚮能力', color: 'linear-gradient(135deg, #8395a7, #222f3e)' }
]

const availableIds = new Set(['pinball', 'shopping', 'cooking', 'puppet'])

const goToGame = (game) => {
  if (availableIds.has(game.id)) {
    router.push({ name: game.id })
  } else {
    comingSoon.value = game.name
    setTimeout(() => { comingSoon.value = null }, 2500)
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.game-card:hover div {
  border-color: rgba(255, 255, 255, 0.4);
}

.game-card div {
  transform: perspective(1000px) rotateX(0deg);
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.game-card:active div {
  transform: perspective(1000px) rotateX(10deg) scale(0.95);
}
</style>
