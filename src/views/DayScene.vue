<template>
  <div class="h-full w-full flex flex-col relative overflow-hidden text-white select-none"
       :style="{ background: scene.bg }">

    <!-- Grain overlay -->
    <div class="absolute inset-0 pointer-events-none opacity-[0.04]"
         style="background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.7%22 numOctaves=%224%22 stitchTiles=%22stitch%22/><feColorMatrix type=%22saturate%22 values=%220%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>');"></div>

    <!-- Vignette -->
    <div class="absolute inset-0 pointer-events-none"
         style="background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%);"></div>

    <!-- Top bar -->
    <div class="shrink-0 flex items-center justify-between px-5 sm:px-8 pt-5 sm:pt-7 relative z-20">
      <button @click="exitDay"
              class="text-sm font-semibold transition-opacity"
              style="color: rgba(255,231,186,0.45);"
              @mouseover="e => e.currentTarget.style.opacity = '1'"
              @mouseleave="e => e.currentTarget.style.opacity = '0.45'">
        ← 離開
      </button>
      <transition name="time-fade" mode="out-in">
        <div :key="scene.id"
             class="flex items-center gap-2 px-4 py-1.5 rounded-full"
             style="background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12);">
          <span class="text-base leading-none">{{ scene.timeEmoji }}</span>
          <span class="text-sm font-bold tracking-widest"
                style="color: rgba(255,231,186,0.82);">{{ scene.timeLabel }}</span>
        </div>
      </transition>
    </div>

    <!-- Narrative content -->
    <div class="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 py-8 relative z-10">
      <transition name="scene-fade" mode="out-in">
        <div :key="scene.id" class="max-w-md w-full text-center">

          <h1 v-if="scene.title"
              class="mb-8 font-black tracking-widest leading-tight"
              style="font-family: 'Noto Serif TC', serif;
                     font-size: clamp(2rem, 8vw, 3.2rem);
                     color: #F2CF86;
                     text-shadow: 0 2px 0 rgba(80,40,0,0.85), 0 0 48px rgba(210,150,20,0.35);">
            {{ scene.title }}
          </h1>

          <p class="leading-[2.1] mb-10 sm:mb-12"
             style="font-family: 'Noto Serif TC', serif;
                    font-size: clamp(1rem, 2.8vw, 1.2rem);
                    color: rgba(255,231,190,0.88);
                    letter-spacing: 0.04em;">
            {{ scene.narration }}
          </p>

          <template v-if="!scene.isEnding">
            <button @click="advance"
                    class="px-10 sm:px-14 py-4 sm:py-5 rounded-full text-black font-black active:scale-95 transition-transform"
                    style="font-size: clamp(1rem, 3vw, 1.25rem);
                           background: linear-gradient(135deg, #D4A020, #8B6000);
                           box-shadow: 0 14px 44px rgba(200,120,0,0.38), inset 0 1px 0 rgba(255,220,120,0.25);">
              {{ scene.ctaLabel }}
            </button>
          </template>

          <template v-else>
            <div class="text-3xl mb-8" style="color: rgba(255,231,186,0.3);">✦</div>
            <p class="text-sm mb-8 tracking-[0.18em] uppercase"
               style="color: rgba(255,231,186,0.35); font-family: 'Noto Serif TC', serif;">
              今天結束了
            </p>
            <button @click="exitDay"
                    class="px-10 py-4 rounded-full font-bold active:scale-95 transition-transform"
                    style="font-size: clamp(1rem, 2.8vw, 1.15rem);
                           background: rgba(255,255,255,0.08);
                           border: 1px solid rgba(255,255,255,0.18);
                           color: rgba(255,231,186,0.82);">
              回到遊戲大廳
            </button>
          </template>

        </div>
      </transition>
    </div>

    <!-- Progress dots -->
    <div class="shrink-0 flex items-center justify-center gap-2 pb-8 relative z-10">
      <div v-for="s in progressScenes" :key="s.id"
           class="rounded-full transition-all duration-500"
           :style="{
             width: s.id === scene.id ? '26px' : '7px',
             height: '7px',
             background: s.id === scene.id ? '#F2CF86' : 'rgba(255,255,255,0.16)',
           }">
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import { useProfileStore } from '../stores/profileStore'

const router  = useRouter()
const route   = useRoute()
const gameStore   = useGameStore()
const profile = useProfileStore()

// Personalised narration helpers
const n = computed(() => profile.displayName)

const morningWakeup = computed(() => {
  if (profile.region === 'south')    return '窗外的雞鳴聲和廟口的鐘聲'
  if (profile.region === 'military') return '眷村廣播的播音聲'
  if (profile.region === 'east')     return '山裡傳來的鳥鳴聲'
  return '窗外的鳥鳴聲'
})

const marketDesc = computed(() => {
  if (profile.region === 'south')    return '巷口柑仔店，攤子上還擺著新鮮的虱目魚'
  if (profile.region === 'military') return '眷村旁的雜貨舖，老闆娘一早就開攤了'
  if (profile.region === 'central')  return '傳統市場，賣菜的阿姨正用台語喊價'
  return '巷口的柑仔店，攤子上擺著各式零食和日用品'
})

const occupationReturn = computed(() => {
  if (profile.occupation === 'farming')   return '從田邊回來，手上還帶著泥土的香氣'
  if (profile.occupation === 'factory')   return '今天換班，難得有時間好好煮一頓飯'
  if (profile.occupation === 'trade')     return '收攤回來，算了一天的帳，終於可以歇一歇'
  if (profile.occupation === 'teacher')   return '放學後回到家，脫下皮鞋，換上拖鞋'
  if (profile.occupation === 'homemaker') return '逛完菜市場，拎著兩袋菜走回家'
  return '提著滿滿的籃子回到家'
})

const cookingAroma = computed(() => {
  if (profile.region === 'south') return '魚湯和薑的香氣'
  if (profile.region === 'east')  return '山裡野菜和醬油的香氣'
  return '熟悉的飯菜香氣'
})

const SCENE_DATA = computed(() => [
  {
    id: 'intro',
    timeLabel: '清晨',
    timeEmoji: '🌅',
    bg: 'radial-gradient(ellipse at 50% 0%, #221A0C 0%, #130E06 55%, #0A0804 100%)',
    title: '今天的一天',
    narration: `天才剛亮，${morningWakeup.value}把${n.value}叫醒。空氣裡帶著早晨的清涼，今天，還有幾件事要做。`,
    ctaLabel: '出門去',
    next: 'morning',
  },
  {
    id: 'morning',
    timeLabel: '早上 8:00',
    timeEmoji: '🧺',
    bg: 'radial-gradient(ellipse at 50% 0%, #2A1E0C 0%, #180E06 55%, #0E0904 100%)',
    narration: `${n.value}走進${marketDesc.value}。得把今天要買的東西記清楚才行……`,
    ctaLabel: '走進店裡',
    game: 'shopping',
    next: 'midday',
  },
  {
    id: 'midday',
    timeLabel: '中午 12:00',
    timeEmoji: '🍳',
    bg: 'radial-gradient(ellipse at 50% 0%, #182A08 0%, #101C06 55%, #080C04 100%)',
    narration: `採買完成，${n.value}${occupationReturn.value}。廚房的爐子一點上，${cookingAroma.value}開始飄出來……`,
    ctaLabel: '開始煮飯',
    game: 'cooking',
    next: 'evening',
  },
  {
    id: 'evening',
    timeLabel: '傍晚 6:00',
    timeEmoji: '🎵',
    bg: 'radial-gradient(ellipse at 50% 0%, #160A24 0%, #0E0618 55%, #04030C 100%)',
    narration: `吃完飯，碗洗好了。窗外的光線漸漸轉橘，廣播裡傳來一首再熟悉不過的老歌，手指不自覺地跟著節奏輕敲桌面……`,
    ctaLabel: '跟著唱',
    game: 'music',
    next: 'ending',
  },
  {
    id: 'ending',
    timeLabel: '夜晚',
    timeEmoji: '🌙',
    bg: 'radial-gradient(ellipse at 50% 0%, #080618 0%, #04030C 55%, #020208 100%)',
    narration: `夜深了。燈光暈黃，周圍靜了下來。今天出門採買、煮了頓飯、哼了首歌——這樣的一天，值得好好記著。`,
    isEnding: true,
  },
])

const progressScenes = computed(() => SCENE_DATA.value.filter(s => !s.isEnding))
const scene = computed(() => SCENE_DATA.value.find(s => s.id === (route.query.scene || 'intro')) ?? SCENE_DATA.value[0])

const advance = () => {
  if (scene.value.game) {
    gameStore.setDifficulty('easy')
    const query = { returnTo: 'day', next: scene.value.next }
    if (scene.value.game === 'music') query.track = 'music-rhythm2'
    router.push({ name: scene.value.game, query })
  } else {
    router.push({ name: 'day', query: { scene: scene.value.next } })
  }
}

const exitDay = () => router.push({ name: 'lobby' })
</script>

<style scoped>
.scene-fade-enter-active,
.scene-fade-leave-active {
  transition: opacity 0.52s ease, transform 0.52s cubic-bezier(0.22, 1, 0.36, 1);
}
.scene-fade-enter-from { opacity: 0; transform: translateY(14px); }
.scene-fade-leave-to   { opacity: 0; transform: translateY(-8px); }

.time-fade-enter-active,
.time-fade-leave-active { transition: opacity 0.36s ease; }
.time-fade-enter-from,
.time-fade-leave-to { opacity: 0; }
</style>
