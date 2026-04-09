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

    <!-- ── Header ── -->
    <header class="shrink-0 px-12 pt-10 pb-8 relative z-10 border-b"
            style="border-color:rgba(255,255,255,0.05);">

      <div class="flex items-center gap-6">
        <!-- Accent bar -->
        <div class="w-2 h-20 rounded-full shrink-0"
             style="background:linear-gradient(to bottom,#C8961E,#8B6000);box-shadow:0 0 20px rgba(200,150,30,0.5);"></div>

        <div>
          <div class="flex items-center gap-4 mb-2">
            <!-- Record icon -->
            <div class="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0"
                 style="background:radial-gradient(circle at 40% 35%,#2A1508,#0E0704);border:2px solid rgba(200,150,30,0.3);">
              🎵
            </div>
            <h1 class="font-black tracking-widest"
                style="font-size:clamp(2.5rem,5vw,4rem);color:#C8961E;text-shadow:0 0 40px rgba(200,150,30,0.3);">
              金憶夜市
            </h1>
          </div>

        </div>
      </div>
    </header>

    <!-- ── Game Grid (3 × 2) ── -->
    <main class="flex-1 px-10 py-6 grid grid-cols-3 gap-6" style="grid-template-rows: repeat(2, minmax(0, 1fr));">
      <div
        v-for="game in games"
        :key="game.id"
        class="relative rounded-[36px] overflow-hidden cursor-pointer group active:scale-[0.97] transition-transform duration-200"
        :style="{ background: game.bg, boxShadow: '0 20px 50px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)' }"
        @click="goToGame(game)"
      >
        <!-- Film perforation strip -->
        <div class="absolute left-0 top-0 bottom-0 w-5 flex flex-col justify-around py-3 z-10">
          <div v-for="h in 7" :key="h" class="w-3 h-2 rounded-sm mx-auto"
               style="background:rgba(0,0,0,0.45);"></div>
        </div>

        <!-- Hover/active highlight -->
        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
             style="background:rgba(255,255,255,0.05);"></div>

        <!-- Diagonal stripe texture -->
        <div class="absolute inset-0 pointer-events-none opacity-[0.04]"
             style="background:repeating-linear-gradient(135deg,#fff 0 1px,transparent 1px 8px);"></div>

        <!-- Category badge -->
        <div class="absolute top-4 right-4 px-3 py-1 rounded text-sm font-bold uppercase tracking-widest z-10"
             style="background:rgba(0,0,0,0.45);color:rgba(255,255,255,0.55);">
          {{ game.category }}
        </div>

        <!-- Content area -->
        <div class="h-full flex flex-col items-center justify-center pl-6 pr-4 py-6 gap-4 z-10 relative">

          <!-- Icon with glow -->
          <div class="text-[72px] drop-shadow-2xl transition-transform duration-300 group-hover:scale-110 group-active:scale-95"
               :style="{ filter: `drop-shadow(0 0 16px ${game.accent}60)` }">
            {{ game.icon }}
          </div>

          <!-- Game name -->
          <div class="text-3xl font-black text-white text-center leading-tight tracking-wide drop-shadow-md">
            {{ game.name }}
          </div>

          <!-- Availability -->
          <div v-if="availableIds.has(game.id)" class="flex items-center gap-2">
            <span class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-70"
                    :style="{ background: game.accent }"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5"
                    :style="{ background: game.accent }"></span>
            </span>
            <span class="text-sm font-bold tracking-widest" :style="{ color: game.accent }">已開放</span>
          </div>
          <div v-else class="text-sm font-bold tracking-widest" style="color:rgba(255,255,255,0.25);">
            即將推出
          </div>
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
    router.push({ name: game.id })
  } else {
    comingSoon.value = game.name
    setTimeout(() => { comingSoon.value = null }, 2500)
  }
}
</script>

<style scoped>
.toast-fade-enter-active, .toast-fade-leave-active { transition: opacity 0.4s ease, transform 0.4s ease; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translateX(-50%) translateY(-10px); }
</style>
