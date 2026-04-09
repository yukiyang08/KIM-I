<template>
  <div class="h-full w-full flex flex-col overflow-y-auto pb-[90px] font-['Outfit','Noto_Sans_TC'] relative select-none"
       style="background: #0A0704;">

    <!-- Ambient background glows -->
    <div class="absolute pointer-events-none" style="top:-10%;left:-8%;width:55%;height:55%;background:radial-gradient(ellipse,rgba(200,150,30,0.07),transparent 70%);"></div>
    <div class="absolute pointer-events-none" style="bottom:10%;right:-10%;width:60%;height:60%;background:radial-gradient(ellipse,rgba(192,64,48,0.06),transparent 70%);"></div>

    <!-- Film strip top border -->
    <div class="flex shrink-0 h-4 z-10" style="background: #140C06;">
      <div v-for="i in 36" :key="i" class="flex-1 my-0.5 mx-px rounded-sm" style="background:rgba(0,0,0,0.65);"></div>
    </div>

    <!-- Coming soon toast -->
    <transition name="toast-fade">
      <div v-if="comingSoon" class="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-10 py-4 rounded-full font-bold text-2xl shadow-2xl text-white"
           style="background:rgba(30,20,10,0.92);border:1px solid rgba(200,150,30,0.4);backdrop-filter:blur(12px);">
        【{{ comingSoon }}】積極開發中，敬請期待！
      </div>
    </transition>

    <!-- Difficulty Selector Modal -->
    <DifficultySelector
      :is-open="showDifficultyModal"
      :game-name="selectedGameName"
      @confirm="handleDifficultyConfirm"
      @cancel="showDifficultyModal = false"
    />

    <!-- ── Header ── -->
    <header class="shrink-0 px-4 sm:px-6 md:px-8 lg:px-12 pt-6 sm:pt-8 md:pt-10 pb-4 sm:pb-6 md:pb-8 relative z-10 border-b"
            style="border-color:rgba(255,255,255,0.05);">

      <div class="flex items-center gap-3 sm:gap-4 md:gap-6">
        <!-- Accent bar -->
        <div class="w-1.5 sm:w-2 rounded-full shrink-0"
             style="height:clamp(3rem, 5vw, 5rem);background:linear-gradient(to bottom,#C8961E,#8B6000);box-shadow:0 0 20px rgba(200,150,30,0.5);"></div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 sm:gap-3 md:gap-4 mb-1 sm:mb-2">
            <!-- Record icon -->
            <div class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 text-lg sm:text-xl md:text-2xl"
                 style="background:radial-gradient(circle at 40% 35%,#2A1508,#0E0704);border:2px solid rgba(200,150,30,0.3);">
              🎵
            </div>
            <h1 class="font-black tracking-widest truncate"
                style="font-size:clamp(1.5rem, 5vw, 4rem);color:#C8961E;text-shadow:0 0 40px rgba(200,150,30,0.3);">
              金憶夜市
            </h1>
          </div>
        </div>
      </div>
    </header>

    <!-- ── Game Grid (Responsive) ── -->
    <main class="flex-1 px-3 sm:px-4 md:px-6 lg:px-10 py-3 sm:py-4 md:py-6 grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 auto-rows-fr"
          style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); max-width: 1400px; margin: 0 auto; width: 100%;">
      <div
        v-for="game in games"
        :key="game.id"
        class="relative rounded-[20px] sm:rounded-[28px] md:rounded-[36px] overflow-hidden cursor-pointer group active:scale-[0.97] transition-transform duration-200 min-h-[300px] sm:min-h-[350px] md:min-h-[400px]"
        :style="{ background: game.bg, boxShadow: '0 20px 50px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)' }"
        @click="goToGame(game)"
      >
        <!-- Film perforation strip (hidden on small screens) -->
        <div class="hidden sm:flex absolute left-0 top-0 bottom-0 w-4 sm:w-5 flex-col justify-around py-2 sm:py-3 z-10">
          <div v-for="h in 7" :key="h" class="w-2 sm:w-3 h-1.5 sm:h-2 rounded-sm mx-auto"
               style="background:rgba(0,0,0,0.45);"></div>
        </div>

        <!-- Hover/active highlight -->
        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
             style="background:rgba(255,255,255,0.05);"></div>

        <!-- Diagonal stripe texture -->
        <div class="absolute inset-0 pointer-events-none opacity-[0.04]"
             style="background:repeating-linear-gradient(135deg,#fff 0 1px,transparent 1px 8px);"></div>

        <!-- Category badge -->
        <div class="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-bold uppercase tracking-widest z-10"
             style="background:rgba(0,0,0,0.45);color:rgba(255,255,255,0.55);">
          {{ game.category }}
        </div>

        <!-- Content area -->
        <div class="h-full flex flex-col items-center justify-center px-2 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6 gap-2 sm:gap-3 md:gap-4 z-10 relative sm:pl-8">

          <!-- Icon with glow (responsive size) -->
          <div class="drop-shadow-2xl transition-transform duration-300 group-hover:scale-110 group-active:scale-95"
               style="font-size: clamp(2.5rem, 8vw, 4.5rem); filter: drop-shadow(0 0 16px {{game.accent}}60)"
               :style="{ filter: `drop-shadow(0 0 16px ${game.accent}60)` }">
            {{ game.icon }}
          </div>

          <!-- Game name (responsive text) -->
          <div class="font-black text-white text-center leading-tight tracking-wide drop-shadow-md"
               style="font-size: clamp(1rem, 2.5vw, 1.875rem);">
            {{ game.name }}
          </div>

          <!-- Availability -->
          
        </div>
      </div>
    </main>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DifficultySelector from '../components/DifficultySelector.vue'

const router = useRouter()
const comingSoon = ref(null)
const showDifficultyModal = ref(false)
const selectedGameName = ref('')
const selectedGameId = ref(null)

const games = [
  {
    id: 'music',
    name: '懷舊音樂節拍',
    icon: '🎵',
    category: '節拍記憶',
    bg: 'linear-gradient(155deg, #230D10, #3A1508)',
    accent: '#E06030',
  },
  {
    id: 'shopping',
    name: '柑仔店採買',
    icon: '🥫',
    category: '工作記憶',
    bg: 'linear-gradient(155deg, #231508, #3D2608)',
    accent: '#C8961E',
  },
  {
    id: 'cooking',
    name: '阿嬤家常菜',
    icon: '🍲',
    category: '執行計畫',
    bg: 'linear-gradient(155deg, #0D2010, #162818)',
    accent: '#6ABE50',
  },
  {
    id: 'puppet',
    name: '廟口布袋戲',
    icon: '🎭',
    category: '注意追蹤',
    bg: 'linear-gradient(155deg, #080F20, #0E1C38)',
    accent: '#50A0D8',
  },
  {
    id: 'riddle',
    name: '老歌猜謎',
    icon: '🎶',
    category: '長期記憶',
    bg: 'linear-gradient(155deg, #160E22, #241535)',
    accent: '#A070D0',
  },
  {
    id: 'puzzle',
    name: '廟口大拼圖',
    icon: '🧩',
    category: '視覺空間',
    bg: 'linear-gradient(155deg, #121220, #1C1C30)',
    accent: '#6080B0',
  },
]

const availableIds = new Set(['music', 'shopping', 'cooking', 'puppet', 'riddle', 'puzzle'])

const goToGame = (game) => {
  if (availableIds.has(game.id)) {
    selectedGameName.value = game.name
    selectedGameId.value = game.id
    showDifficultyModal.value = true
  } else {
    comingSoon.value = game.name
    setTimeout(() => { comingSoon.value = null }, 2500)
  }
}

const handleDifficultyConfirm = (difficulty) => {
  showDifficultyModal.value = false
  router.push({ name: selectedGameId.value })
}
</script>

<style scoped>
.toast-fade-enter-active, .toast-fade-leave-active { transition: opacity 0.4s ease, transform 0.4s ease; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translateX(-50%) translateY(-10px); }
</style>
