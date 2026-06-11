<template>
  <div class="game-menu-root h-full w-full flex flex-col overflow-y-auto pb-[90px] font-['Outfit','Noto_Sans_TC'] relative select-none"
       :style="{
         background: `url('${vintageBackground}') center/cover, linear-gradient(135deg, #110E08 0%, #1C170E 100%)`,
         backgroundPosition: 'center, 0 0',
         backgroundSize: 'cover, auto'
       }">

    <!-- Soften background details so game cards stay dominant -->
    <div class="absolute inset-0 z-0 pointer-events-none"
          style="backdrop-filter: blur(2px) saturate(1.04);
           background: radial-gradient(ellipse at center, rgba(14,10,4,0.08), rgba(10,7,3,0.28));"></div>
    <div class="absolute inset-0 z-0 pointer-events-none"
          style="background: linear-gradient(to bottom, rgba(10,7,3,0.2), rgba(10,7,3,0.32));"></div>
    <div
      class="absolute inset-0 z-[5] pointer-events-none transition-opacity duration-700 ease-out"
      :style="{
        background: 'linear-gradient(to bottom, rgba(10,7,3,0.06), rgba(10,7,3,0.24))',
        opacity: introDimOpacity,
      }"
    ></div>

    <!-- Film strip top border -->
    <div class="flex shrink-0 h-4 z-20" style="background: #130F08;">
      <div v-for="i in 36" :key="i" class="flex-1 my-0.5 mx-px rounded-sm" style="background:rgba(0,0,0,0.65);"></div>
    </div>

    <!-- Coming soon toast -->
    <transition name="toast-fade">
      <div v-if="comingSoon" class="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 px-5 sm:px-10 py-3 sm:py-4 rounded-full font-bold text-base sm:text-2xl shadow-2xl text-white whitespace-nowrap"
           style="background:rgba(28,20,8,0.94);border:1px solid rgba(200,150,30,0.4);backdrop-filter:blur(12px);">
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
    <header class="shrink-0 px-4 sm:px-6 md:px-8 lg:px-12 pt-4 sm:pt-8 md:pt-10 pb-3 sm:pb-6 md:pb-8 relative z-20 border-b"
            style="border-color:rgba(255,255,255,0.05); background: rgba(16,12,6,0.58); backdrop-filter: blur(8px);">

      <div class="flex items-center gap-3 sm:gap-4 md:gap-6">
        <!-- Accent bar -->
        <div class="w-1.5 sm:w-2 rounded-full shrink-0"
             style="height:clamp(2.4rem, 5vw, 5rem);background:linear-gradient(to bottom,#C8961E,#8B6000);box-shadow:0 0 20px rgba(200,150,30,0.5);"></div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 sm:gap-3 md:gap-4 mb-0.5 sm:mb-2">
            <div class="truncate leading-none">
              <h1 class="kimi-brand-title truncate">金憶 KIM-I</h1>
              <p class="mt-0.5 sm:mt-1 text-[0.78rem] sm:text-[0.9rem] md:text-[1.15rem] lg:text-[1.25rem] tracking-[0.08em] text-[#E7D4A3] truncate opacity-95">為樂齡者打造的認知訓練平台</p>
            </div>
          </div>
        </div>

      </div>
    </header>

    <!-- ── Today's Day Banner ── -->
    <div class="shrink-0 px-3 sm:px-4 md:px-6 lg:px-10 pt-2 sm:pt-4 relative z-10"
         style="max-width: 1400px; margin: 0 auto; width: 100%;">
      <button @click="router.push('/day')"
              class="w-full rounded-[12px] md:rounded-[18px] px-4 sm:px-8 py-3 sm:py-5 flex items-center gap-3 sm:gap-6 group active:scale-[0.99] transition-transform overflow-hidden relative"
              style="background: linear-gradient(105deg, rgba(38,28,12,0.95) 0%, rgba(26,18,6,0.98) 100%);
                     border: 2px solid rgba(200,148,40,0.55);
                     box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,210,100,0.12);">
        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
             style="background: radial-gradient(ellipse at 30% 50%, rgba(220,168,60,0.12), transparent 60%);"></div>
        <div class="text-2xl sm:text-4xl shrink-0 leading-none">🌅</div>
        <div class="flex-1 text-left min-w-0">
          <div class="font-black tracking-wide leading-tight"
               style="font-family: 'Noto Serif TC', serif; font-size: clamp(0.9rem, 3vw, 1.35rem); color: #F2CF86;">
            今天的一天
          </div>
          <div class="text-[0.72rem] sm:text-sm mt-0.5 truncate"
               style="color: rgba(255,215,150,0.5);">
            採買 · 煮飯 · 聽歌，走過一整天的故事
          </div>
        </div>
        <div class="shrink-0 text-xs sm:text-sm font-bold tracking-widest px-3 sm:px-4 py-1.5 sm:py-2 rounded-full"
             style="background: linear-gradient(135deg, #C88C18, #7A5000); color: #FFF3CC;
                    box-shadow: 0 4px 14px rgba(200,120,0,0.3);">
          開始
        </div>
      </button>
    </div>

    <!-- ── Game Grid (2-col mobile / 3-col tablet+) ── -->
    <main class="shrink-0 px-3 sm:px-4 md:px-6 lg:px-10 py-2 sm:py-4 md:py-6 grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4 md:gap-5 relative z-10"
          style="max-width: 1400px; margin: 0 auto; width: 100%;">
      <div
        v-for="(game, index) in games"
        :key="game.id"
        class="relative rounded-[16px] md:rounded-[20px] overflow-hidden cursor-pointer group active:scale-[0.98] hover:-translate-y-1 transition-transform duration-200 night-card intro-card"
        :class="{ 'intro-card-visible': cardsVisible }"
        :style="{ transitionDelay: cardsVisible ? `${index * 120}ms` : '0ms', aspectRatio: '1/1' }"
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
        <div class="absolute inset-[6px] sm:inset-[8px] md:inset-[10px] rounded-[10px] sm:rounded-[12px] md:rounded-[14px] pointer-events-none"
             style="border: 2px solid rgba(96,72,33,0.9); box-shadow: inset 0 0 0 1px rgba(210,170,93,0.28);"></div>

        <!-- Card image -->
        <div class="absolute inset-[8px] sm:inset-[12px] md:inset-[14px] rounded-[8px] sm:rounded-[10px] md:rounded-[12px] overflow-hidden"
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

          <!-- Skill badge: hidden on mobile to reduce clutter, shown sm+ -->
          <div class="hidden sm:block absolute left-2.5 top-2.5 md:left-3 md:top-3 z-20">
            <span
              class="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[0.85rem] sm:text-[0.96rem] md:text-[1.15rem] font-black tracking-[0.05em] whitespace-nowrap"
              style="background: rgba(22,12,4,0.82); color:#F8DEAC; border: 1px solid rgba(216,172,92,0.56); backdrop-filter: blur(4px); box-shadow: 0 6px 16px rgba(0,0,0,0.3);"
            >
              {{ game.skill }}
            </span>
          </div>

          <!-- Play count: dot on mobile, full badge on sm+ -->
          <template v-if="playCountOf[game.id]">
            <!-- Mobile: green dot only -->
            <div class="sm:hidden absolute right-2 top-2 z-20 w-4 h-4 rounded-full flex items-center justify-center"
                 style="background: rgba(14,36,18,0.9); border: 1.5px solid rgba(80,180,80,0.7);">
              <span class="text-[0.6rem] font-black leading-none" style="color:#6ABE50;">✓</span>
            </div>
            <!-- sm+: full badge -->
            <div class="hidden sm:flex absolute right-2.5 top-2.5 md:right-3 md:top-3 z-20 items-center gap-1 px-2.5 py-1 rounded-full text-[0.82rem] font-black"
                 style="background: rgba(14,36,18,0.88); color:#6ABE50; border: 1px solid rgba(80,180,80,0.4); backdrop-filter: blur(4px);">
              <span>✓</span>
              <span>{{ playCountOf[game.id] }}</span>
            </div>
          </template>

          <div v-if="!game.poster" class="absolute inset-0 flex items-center justify-center">
            <div class="text-[72px] md:text-[86px] transition-transform duration-300 group-hover:scale-110"
                 :style="{ filter: `drop-shadow(0 0 16px ${game.accent}70)` }">
              {{ game.icon }}
            </div>
          </div>
        </div>

        <!-- Vintage title plate -->
        <div class="absolute left-[8px] right-[8px] sm:left-[16px] sm:right-[16px] bottom-[10px] sm:bottom-[18px] md:bottom-[22px] z-20">
          <div class="px-2 sm:px-3 py-1.5 sm:py-2 rounded-[8px] sm:rounded-[10px] text-center night-card-title whitespace-nowrap overflow-hidden"
               style="background: linear-gradient(to bottom, rgba(28,26,22,0.7), rgba(14,13,12,0.82)); border: 1px solid rgba(170,125,64,0.45);">
            {{ game.name }}
          </div>
        </div>

        <!-- Hover glow -->
        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
             style="background: radial-gradient(circle at 50% 35%, rgba(233,195,108,0.14), transparent 60%);"></div>

           <!-- Click hint rim -->
           <div class="absolute inset-[5px] sm:inset-[6px] md:inset-[8px] rounded-[10px] sm:rounded-[12px] md:rounded-[14px] pointer-events-none opacity-75 group-hover:opacity-100 transition-opacity duration-300"
             style="box-shadow: inset 0 0 0 1px rgba(245,220,150,0.22), 0 0 16px rgba(220,176,78,0.16);"></div>
      </div>
    </main>


  <!-- Mascot -->
  <MascotGuide :messages="mascotMessages" :actions="mascotActions" :auto-show="isFirstVisit" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import DifficultySelector from '../components/DifficultySelector.vue'
import SongSelector from '../components/SongSelector.vue'
import MascotGuide from '../components/MascotGuide.vue'
import { useProfileStore } from '../stores/profileStore'
import { useGameStore } from '../stores/gameStore'
import vintageBackground from '../assets/懷舊背景3.png'
import game1Poster from '../assets/Game1.png'
import game2Poster from '../assets/Game2.png'
import game3Poster from '../assets/Game3.png'
import game4Poster from '../assets/Game4.png'
import game5Poster from '../assets/Game5.png'
import game6Poster from '../assets/Game6.png'

const router = useRouter()
const profileStore = useProfileStore()
const gameStore = useGameStore()
const comingSoon = ref(null)

const playCountOf = computed(() => {
  const counts = {}
  gameStore.sessions.forEach(s => {
    counts[s.gameId] = (counts[s.gameId] || 0) + 1
  })
  return counts
})
const showDifficultyModal = ref(false)
const showSongModal = ref(false)
const selectedGameName = ref('')
const selectedGameId = ref(null)
const selectedSongId = ref('music-rhythm2')
const introDimOpacity = ref(0)
const cardsVisible = ref(false)

let introDimTimer = null
let introCardTimer = null

const games = [
  {
    id: 'music',
    name: '懷舊音樂',
    skill: '反應力',
    icon: '🎵',
    bg: 'linear-gradient(155deg, #230D10, #3A1508)',
    accent: '#E06030',
    poster: game1Poster,
  },
  {
    id: 'shopping',
    name: '柑仔店採買',
    skill: '記憶力',
    icon: '🥫',
    bg: 'linear-gradient(155deg, #231508, #3D2608)',
    accent: '#C8961E',
    poster: game2Poster,
  },
  {
    id: 'cooking',
    name: '阿嬤家常菜',
    skill: '執行力',
    icon: '🍲',
    bg: 'linear-gradient(155deg, #0D2010, #162818)',
    accent: '#6ABE50',
    poster: game3Poster,
  },
  {
    id: 'puppet',
    name: '廟口布袋戲',
    skill: '注意力',
    icon: '🎭',
    bg: 'linear-gradient(155deg, #080F20, #0E1C38)',
    accent: '#50A0D8',
    poster: game4Poster,
  },
  {
    id: 'riddle',
    name: '老歌猜謎',
    skill: '語意理解',
    icon: '🎶',
    bg: 'linear-gradient(155deg, #160E22, #241535)',
    accent: '#A070D0',
    poster: game5Poster,
  },
  {
    id: 'puzzle',
    name: '廟口大拼圖',
    skill: '視覺空間',
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
  {
    id: 'music-yijianmei',
    name: '【一剪梅】',
    meta: '抒情、穩拍',
    cardBg: 'linear-gradient(145deg, #5B4A8C, #3B2A67)',
    poster: game5Poster,
  },
  {
    id: 'music-jiahou',
    name: '【家後】',
    meta: '台語、溫暖',
    cardBg: 'linear-gradient(145deg, #2A6D66, #1C4E48)',
    poster: game2Poster,
  },
  {
    id: 'music-wowentian',
    name: '【我問天】',
    meta: '台語、經典',
    cardBg: 'linear-gradient(145deg, #7A5432, #563519)',
    poster: game3Poster,
  },
  {
    id: 'music-citymoon',
    name: '【城裡的月光】',
    meta: '抒情、慢板',
    cardBg: 'linear-gradient(145deg, #355A84, #244066)',
    poster: game1Poster,
  },
]

const goToGame = (game) => {
  if (availableIds.has(game.id)) {
    selectedGameName.value = game.name
    selectedGameId.value = game.id

    if (game.id === 'music') {
      showSongModal.value = true
      return
    }

    showDifficultyModal.value = true
  } else {
    comingSoon.value = game.name
    setTimeout(() => { comingSoon.value = null }, 2500)
  }
}

const handleDifficultyConfirm = () => {
  showDifficultyModal.value = false

  if (selectedGameId.value === 'music') {
    router.push({
      name: 'music',
      query: { track: selectedSongId.value },
    })
    return
  }

  router.push({ name: selectedGameId.value })
}

const handleSongConfirm = (song) => {
  selectedSongId.value = song.id
  showSongModal.value = false
  showDifficultyModal.value = true
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

const FIRST_VISIT_KEY = 'kim-i-first-visit'
const isFirstVisit = !localStorage.getItem(FIRST_VISIT_KEY)
if (isFirstVisit) localStorage.setItem(FIRST_VISIT_KEY, '1')

const totalSessions = computed(() => gameStore.sessions.length)

const todaySessionCount = computed(() => {
  const today = new Date().toDateString()
  return gameStore.sessions.filter(s => new Date(s.timestamp).toDateString() === today).length
})

const lastGameId = computed(() => gameStore.sessions.at(-1)?.gameId ?? null)

const hour = new Date().getHours()
const timeOfDay = hour < 11 ? 'morning' : hour < 14 ? 'noon' : hour < 18 ? 'afternoon' : 'evening'

const GAME_SUGGESTIONS = {
  morning:   { id: 'shopping', name: '購物遊戲', label: '出門買菜去 🛒' },
  noon:      { id: 'cooking',  name: '料理遊戲', label: '來煮午飯吧 🍳' },
  afternoon: { id: 'riddle',   name: '謎題遊戲', label: '動動腦筋 🧩' },
  evening:   { id: 'music',    name: '音樂遊戲', label: '唱首老歌放鬆 🎵' },
}

const suggestion = GAME_SUGGESTIONS[timeOfDay]

const mascotMessages = computed(() => {
  if (isFirstVisit) return [
    '你好！我是金寶！很高興認識你！😊',
    '這裡有很多有趣的遊戲，點圖片就可以開始喔！',
    '記得每天出門走走，到「金憶街區」解鎖更多故事！',
  ]
  if (todaySessionCount.value === 0) {
    if (timeOfDay === 'morning') return [
      '早安！今天的早晨真舒服！',
      '要不要先去買個菜？讓腦袋動一動！',
    ]
    if (timeOfDay === 'noon') return [
      '午安！肚子餓了嗎？',
      '來玩料理遊戲，煮一頓好飯吧！',
    ]
    if (timeOfDay === 'afternoon') return [
      '下午了，動動腦筋精神會更好喔！',
      '要不要來玩個謎題遊戲？',
    ]
    return [
      '晚上好！今天辛苦了！',
      '來唱首老歌放鬆一下吧 🎵',
    ]
  }
  if (lastGameId.value) {
    const names = { shopping:'購物', cooking:'料理', music:'音樂', riddle:'謎題', puzzle:'拼圖', puppet:'布袋戲' }
    return [
      `剛才的${names[lastGameId.value] ?? ''}遊戲玩得很好！`,
      '要繼續玩，還是換一個試試看？',
      '記得出門走走，金憶街區等著你 🗺️',
    ]
  }
  return [
    `今天已經玩了 ${todaySessionCount.value} 局，真棒！`,
    '別忘了出門走走，步數夠了可以解鎖新故事喔！',
  ]
})

const mascotActions = computed(() => {
  if (isFirstVisit) return []
  if (todaySessionCount.value === 0) return [
    { label: suggestion.label, fn: () => router.push({ name: suggestion.id }) },
  ]
  return [
    { label: suggestion.label, fn: () => router.push({ name: suggestion.id }) },
    { label: '去金憶街區走走 🗺️', fn: () => router.push({ name: 'outdoor' }) },
  ]
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
  font-size: clamp(1.25rem, 4.4vw, 3.3rem);
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
  /* Mobile: fixed comfortable size so chars don't squeeze */
  font-size: 0.95rem;
  line-height: 1.2;
  letter-spacing: 0.06em;
  color: #f7dfb6;
  text-shadow:
    0 1px 0 rgba(58, 32, 10, 0.75),
    0 3px 10px rgba(0, 0, 0, 0.65),
    0 0 10px rgba(232, 183, 86, 0.2);
}

@media (min-width: 640px) {
  .night-card-title {
    font-size: clamp(1rem, 3.8vw, 2.5rem);
    letter-spacing: 0.04em;
  }
}

@media (min-width: 1025px) {
  .night-card-title {
    font-size: clamp(1.35rem, 2.9vw, 3.2rem);
    letter-spacing: 0.03em;
  }
}

/* iOS Safari: background-attachment fixed is unsupported, scroll is used by default */
@supports (-webkit-touch-callout: none) {
  .game-menu-root {
    background-attachment: scroll !important;
  }
}
</style>
