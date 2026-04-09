<template>
  <div class="h-full w-full flex flex-col overflow-y-auto pb-[90px] font-['Outfit','Noto_Sans_TC'] relative select-none"
       :style="{
         background: `url('${vintageBackground}') center/cover fixed, linear-gradient(135deg, #0A0704 0%, #1A0F08 100%)`,
         backgroundAttachment: 'fixed, scroll',
         backgroundPosition: 'center, 0 0',
         backgroundSize: 'cover, auto'
       }">

    <!-- Film strip top border -->
    <div class="flex shrink-0 h-4 z-20" style="background: #140C06;">
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
    <header class="shrink-0 px-4 sm:px-6 md:px-8 lg:px-12 pt-6 sm:pt-8 md:pt-10 pb-4 sm:pb-6 md:pb-8 relative z-20 border-b"
            style="border-color:rgba(255,255,255,0.05); background: rgba(10,7,4,0.5); backdrop-filter: blur(8px);">

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
            <div class="truncate leading-none">
              <h1 class="kimi-brand-title truncate">金憶 <span class="kimi-brand-en">KIM-I</span></h1>
              <p class="kimi-brand-sub">memory night market collection</p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- ── Game Grid (3 × 2 Layout) ── -->
    <main class="flex-1 px-3 sm:px-4 md:px-6 lg:px-10 py-3 sm:py-4 md:py-6 grid gap-3 sm:gap-4 md:gap-6 relative z-10"
          style="grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-rows: repeat(2, minmax(0, 1fr)); max-width: 1400px; margin: 0 auto; width: 100%; height: calc(100% - 100px);">
      <div
        v-for="game in games"
        :key="game.id"
        class="relative rounded-[16px] md:rounded-[20px] overflow-hidden cursor-pointer group active:scale-[0.98] transition-transform duration-200 night-card"
        @click="goToGame(game)"
      >
        <!-- Outer brass frame -->
        <div class="absolute inset-0 rounded-[16px] md:rounded-[20px] pointer-events-none"
             style="border: 3px solid rgba(138,103,47,0.88); box-shadow: inset 0 0 0 1px rgba(231,203,136,0.32), 0 16px 36px rgba(0,0,0,0.45);"></div>

        <!-- Inner engraved frame -->
        <div class="absolute inset-[8px] md:inset-[10px] rounded-[12px] md:rounded-[14px] pointer-events-none"
             style="border: 2px solid rgba(96,72,33,0.9); box-shadow: inset 0 0 0 1px rgba(210,170,93,0.28);"></div>

        <!-- Card image -->
        <div class="absolute inset-[12px] md:inset-[14px] rounded-[10px] md:rounded-[12px] overflow-hidden"
             :style="game.poster
               ? {
                   backgroundImage: `url('${game.poster}')`,
                   backgroundSize: 'cover',
                   backgroundPosition: 'center'
                 }
               : {
                   background: game.bg
                 }"
        >
          <div class="absolute inset-0" style="background: linear-gradient(to top, rgba(12,7,4,0.75) 0%, rgba(12,7,4,0.15) 40%, rgba(0,0,0,0.08) 100%);"></div>

          <div v-if="!game.poster" class="absolute inset-0 flex items-center justify-center">
            <div class="text-[72px] md:text-[86px] transition-transform duration-300 group-hover:scale-110"
                 :style="{ filter: `drop-shadow(0 0 16px ${game.accent}70)` }">
              {{ game.icon }}
            </div>
          </div>
        </div>

        <!-- Vintage title plate -->
        <div class="absolute left-[16px] right-[16px] bottom-[18px] md:bottom-[22px] z-20">
          <div class="px-3 py-2 rounded-[10px] text-center night-card-title"
               style="background: linear-gradient(to bottom, rgba(40,24,10,0.7), rgba(18,10,4,0.8)); border: 1px solid rgba(170,125,64,0.45);">
            {{ game.name }}
          </div>
        </div>

        <!-- Hover glow -->
        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
             style="background: radial-gradient(circle at 50% 35%, rgba(233,195,108,0.08), transparent 60%);"></div>
      </div>
    </main>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DifficultySelector from '../components/DifficultySelector.vue'
import vintageBackground from '../assets/懷舊背景3.png'
import game1Poster from '../assets/Game1.png'
import game2Poster from '../assets/Game2.png'
import game3Poster from '../assets/Game3.png'
import game4Poster from '../assets/Game4.png'
import game5Poster from '../assets/Game5.png'
import game6Poster from '../assets/Game6.png'

const router = useRouter()
const comingSoon = ref(null)
const showDifficultyModal = ref(false)
const selectedGameName = ref('')
const selectedGameId = ref(null)

const games = [
  {
    id: 'music',
    name: '懷舊音樂',
    icon: '🎵',
    bg: 'linear-gradient(155deg, #230D10, #3A1508)',
    accent: '#E06030',
    poster: game1Poster,
  },
  {
    id: 'shopping',
    name: '柑仔店採買',
    icon: '🥫',
    bg: 'linear-gradient(155deg, #231508, #3D2608)',
    accent: '#C8961E',
    poster: game2Poster,
  },
  {
    id: 'cooking',
    name: '阿嬤家常菜',
    icon: '🍲',
    bg: 'linear-gradient(155deg, #0D2010, #162818)',
    accent: '#6ABE50',
    poster: game3Poster,
  },
  {
    id: 'puppet',
    name: '廟口布袋戲',
    icon: '🎭',
    bg: 'linear-gradient(155deg, #080F20, #0E1C38)',
    accent: '#50A0D8',
    poster: game4Poster,
  },
  {
    id: 'riddle',
    name: '老歌猜謎',
    icon: '🎶',
    bg: 'linear-gradient(155deg, #160E22, #241535)',
    accent: '#A070D0',
    poster: game5Poster,
  },
  {
    id: 'puzzle',
    name: '廟口大拼圖',
    icon: '🧩',
    bg: 'linear-gradient(155deg, #121220, #1C1C30)',
    accent: '#6080B0',
    poster: game6Poster,
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

.night-card {
  min-height: 0;
}

.kimi-brand-title {
  font-family: 'Noto Serif TC', 'PMingLiU', serif;
  font-weight: 900;
  font-size: clamp(1.45rem, 4.4vw, 3.3rem);
  letter-spacing: 0.08em;
  color: #f2cf86;
  text-shadow:
    0 2px 0 rgba(88, 51, 16, 0.95),
    0 0 16px rgba(200, 150, 30, 0.3),
    0 8px 24px rgba(0, 0, 0, 0.55);
}

.kimi-brand-en {
  font-family: 'Outfit', 'Noto Sans TC', sans-serif;
  font-size: 0.76em;
  letter-spacing: 0.12em;
  color: #ffd992;
  opacity: 0.96;
}

.kimi-brand-sub {
  margin-top: 0.22rem;
  font-family: 'Outfit', sans-serif;
  font-size: clamp(0.55rem, 1.1vw, 0.85rem);
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: rgba(238, 197, 109, 0.75);
}

.night-card-title {
  font-family: 'Noto Serif TC', 'PMingLiU', serif;
  font-weight: 900;
  font-size: clamp(1.35rem, 2.9vw, 3.2rem);
  line-height: 1.12;
  letter-spacing: 0.03em;
  color: #f7dfb6;
  text-shadow:
    0 1px 0 rgba(58, 32, 10, 0.75),
    0 3px 10px rgba(0, 0, 0, 0.65),
    0 0 10px rgba(232, 183, 86, 0.2);
}

@media (max-width: 1024px) {
  .night-card-title {
    font-size: clamp(1.2rem, 4.2vw, 2.5rem);
  }
}
</style>
