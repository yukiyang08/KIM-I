<template>
  <div class="h-full w-full flex flex-col overflow-y-auto pb-[90px] font-['Outfit','Noto_Sans_TC'] relative select-none"
       :style="{
         background: `url('${vintageBackground}') center/cover fixed, linear-gradient(135deg, #0A0704 0%, #1A0F08 100%)`,
         backgroundAttachment: 'fixed, scroll',
         backgroundPosition: 'center, 0 0',
         backgroundSize: 'cover, auto'
       }">

    <!-- Soften background details so game cards stay dominant -->
    <div class="absolute inset-0 z-0 pointer-events-none"
          style="backdrop-filter: blur(2px) saturate(1.02);
           background: radial-gradient(ellipse at center, rgba(12,8,4,0.08), rgba(8,5,2,0.3));"></div>
    <div class="absolute inset-0 z-0 pointer-events-none"
          style="background: linear-gradient(to bottom, rgba(8,5,2,0.22), rgba(8,5,2,0.34));"></div>
    <div
      class="absolute inset-0 z-[5] pointer-events-none transition-opacity duration-700 ease-out"
      :style="{
        background: 'linear-gradient(to bottom, rgba(8,5,2,0.08), rgba(8,5,2,0.28))',
        opacity: introDimOpacity,
      }"
    ></div>

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

    <SongSelector
      :is-open="showSongModal"
      :songs="musicSongs"
      @confirm="handleSongConfirm"
      @cancel="showSongModal = false"
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
              <h1 class="kimi-brand-title truncate">金憶 KIM-I</h1>
              <p class="mt-1 text-[1rem] sm:text-[0.9rem] md:text-[1rem] tracking-[0.08em] text-[#E7D4A3] truncate opacity-95">為樂齡者打造的認知訓練平台</p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- ── Game Grid (3 × 2 Layout) ── -->
    <main class="flex-1 px-3 sm:px-4 md:px-6 lg:px-10 py-3 sm:py-4 md:py-6 grid gap-3 sm:gap-4 md:gap-6 relative z-10"
          style="grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-rows: repeat(2, minmax(0, 1fr)); max-width: 1400px; margin: 0 auto; width: 100%; height: calc(100% - 100px);">
      <div
        v-for="(game, index) in games"
        :key="game.id"
        class="relative rounded-[16px] md:rounded-[20px] overflow-hidden cursor-pointer group active:scale-[0.98] hover:-translate-y-1 transition-transform duration-200 night-card intro-card"
        :class="{ 'intro-card-visible': cardsVisible }"
        :style="{ transitionDelay: cardsVisible ? `${index * 120}ms` : '0ms' }"
        @click="goToGame(game)"
      >
        <!-- Outer brass frame -->
        <div class="absolute inset-0 rounded-[16px] md:rounded-[20px] pointer-events-none"
             style="border: 3px solid rgba(170,128,56,0.95);
                    box-shadow: inset 0 0 0 1px rgba(245,220,150,0.42),
                                inset 0 -10px 18px rgba(40,18,8,0.38),
                                0 0 0 2px rgba(160,120,52,0.38),
                                0 18px 44px rgba(0,0,0,0.52),
                                0 0 28px rgba(220,176,78,0.2);"></div>

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
             style="background: radial-gradient(circle at 50% 35%, rgba(233,195,108,0.14), transparent 60%);"></div>

           <!-- Click hint rim -->
           <div class="absolute inset-[6px] md:inset-[8px] rounded-[12px] md:rounded-[14px] pointer-events-none opacity-75 group-hover:opacity-100 transition-opacity duration-300"
             style="box-shadow: inset 0 0 0 1px rgba(245,220,150,0.22), 0 0 16px rgba(220,176,78,0.16);"></div>
      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import DifficultySelector from '../components/DifficultySelector.vue'
import SongSelector from '../components/SongSelector.vue'
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
const showSongModal = ref(false)
const selectedGameName = ref('')
const selectedGameId = ref(null)
const introDimOpacity = ref(0)
const cardsVisible = ref(false)

let introDimTimer = null
let introCardTimer = null

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

const musicSongs = [
  {
    id: 'music-rhythm2',
    name: '【月亮代表我的心】',
    meta: '慢板、舒緩',
    cardBg: 'linear-gradient(145deg, #35669A, #204A79)',
    poster: game1Poster,
  },
  {
    id: 'music-rhythm1',
    name: '【愛拚才會贏】',
    meta: '中板、振奮',
    cardBg: 'linear-gradient(145deg, #8D3F3F, #6E2E2E)',
    poster: game4Poster,
  },
]

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

const handleDifficultyConfirm = () => {
  showDifficultyModal.value = false

  if (selectedGameId.value === 'music') {
    showSongModal.value = true
    return
  }

  router.push({ name: selectedGameId.value })
}

const handleSongConfirm = (song) => {
  showSongModal.value = false
  router.push({
    name: 'music',
    query: { track: song.id },
  })
}

onMounted(() => {
  introDimTimer = setTimeout(() => {
    introDimOpacity.value = 1
  }, 260)

  introCardTimer = setTimeout(() => {
    cardsVisible.value = true
  }, 760)
})

onUnmounted(() => {
  if (introDimTimer) clearTimeout(introDimTimer)
  if (introCardTimer) clearTimeout(introCardTimer)
})
</script>

<style scoped>
.toast-fade-enter-active, .toast-fade-leave-active { transition: opacity 0.4s ease, transform 0.4s ease; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translateX(-50%) translateY(-10px); }

.night-card {
  min-height: 0;
}

.intro-card {
  opacity: 0;
  transform: translateY(24px) scale(0.97);
  filter: blur(2px);
  pointer-events: none;
  transition:
    opacity 0.46s ease,
    transform 0.46s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.46s ease;
}

.intro-card-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
  pointer-events: auto;
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
