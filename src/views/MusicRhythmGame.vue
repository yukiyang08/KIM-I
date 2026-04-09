<template>
  <div class="h-full w-full flex flex-col font-['Outfit','Noto_Sans_TC'] overflow-y-auto overflow-x-hidden select-none"
       style="background: #0A0704;">

    <!-- Film strip top -->
    <div class="flex shrink-0 h-4" style="background: #140C06;">
      <div v-for="i in 36" :key="i" class="flex-1 my-0.5 mx-px rounded-sm" style="background: rgba(0,0,0,0.6);"></div>
    </div>

    <!-- Header -->
    <header class="shrink-0 px-4 sm:px-6 md:px-10 py-3 sm:py-4 md:py-5 flex justify-between items-start sm:items-center gap-3 sm:gap-0 border-b z-10 relative"
            style="background: rgba(8,5,2,0.97); border-color: rgba(255,255,255,0.05);">
      <div>
        <button @click="goBack" class="flex items-center gap-2 mb-2 sm:mb-3 text-base sm:text-lg font-bold transition-colors"
                style="color: rgba(200,150,30,0.45);"
                @mouseover="e => e.currentTarget.style.color = '#C8961E'"
                @mouseleave="e => e.currentTarget.style.color = 'rgba(200,150,30,0.45)'">
          ← 離開遊戲
        </button>
        <button
          v-if="gameState === 'playing'"
          @click="finishEarly"
          class="mb-2 sm:mb-3 px-4 py-1.5 rounded-full text-sm sm:text-base font-bold transition-colors"
          style="color: rgba(255,226,180,0.9); background: rgba(90,52,20,0.45); border: 1px solid rgba(220,170,90,0.45);"
        >
          提前結束本局
        </button>
        <h1 class="font-black leading-tight" style="font-size: clamp(1.6rem, 7vw, 3rem); color: #C8961E; text-shadow: 0 0 40px rgba(200,150,30,0.3);">
          <span style="color: #C04030;">♪</span> {{ selectedSong.name }}
        </h1>

        <p class="text-xs sm:text-sm md:text-base mt-1 font-semibold" style="color: rgba(240,208,144,0.75);">
          曲目：{{ selectedSong.name }}
        </p>
        <p v-if="isMultiplayer && multiplayerRoom" class="text-[11px] sm:text-sm mt-1"
           style="color: rgba(255,231,179,0.72);">
          多人房號：{{ multiplayerRoom.code }} ・ {{ multiplayerStatusText }}
        </p>
      </div>
      <div class="text-center shrink-0 min-w-[110px] sm:min-w-[140px]">
        <div class="text-xs sm:text-sm md:text-base font-bold uppercase tracking-widest mb-1" style="color: rgba(255,255,255,0.2);">得分</div>
        <div class="font-black text-white tabular-nums drop-shadow-lg" style="font-size: clamp(2rem, 7vw, 3.75rem);">{{ score }}</div>
        <transition name="combo-pop">
          <div v-if="combo > 1" key="combo" class="text-base sm:text-lg md:text-2xl font-black mt-1"
               style="color: #C8961E; text-shadow: 0 0 16px rgba(200,150,30,0.5);">
            {{ combo }}x COMBO！
          </div>
        </transition>
      </div>
    </header>

    <!-- Main game area -->
    <main class="flex-1 relative overflow-y-auto overflow-x-hidden">

      <!-- ── IDLE ── -->
      <div v-if="gameState === 'idle'"
           class="absolute inset-0 flex flex-col items-center justify-center z-20"
           style="background: radial-gradient(ellipse at center, rgba(30,15,5,0.95), rgba(8,5,2,0.98));">

        <!-- Vinyl record -->
        <div class="relative mb-7 sm:mb-10" style="width: min(44vw, 210px); height: min(44vw, 210px);">
          <div class="w-full h-full rounded-full flex items-center justify-center vinyl-spin"
               style="background: conic-gradient(from 0deg, #150A04 0%, #221008 15%, #150A04 30%, #221008 45%, #150A04 60%, #221008 75%, #150A04 90%, #221008 100%); border: 10px solid #1E0E06; box-shadow: 0 0 60px rgba(200,150,30,0.15);">
            <div class="w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-4xl font-black"
                 style="background: radial-gradient(circle at 40% 35%, #F0C040, #7A5A10); box-shadow: 0 0 30px rgba(200,150,30,0.5);">
              金
            </div>
          </div>
          <!-- Tone arm (decorative) -->
          <div class="absolute top-2 right-0 w-1 h-20 rounded-full origin-top"
               style="background: rgba(200,150,30,0.4); transform: rotate(30deg);"></div>
        </div>

        <h2 class="font-black text-white mb-3 sm:mb-4 tracking-widest" style="font-size: clamp(2rem, 9vw, 3.75rem); text-shadow: 0 4px 20px rgba(0,0,0,0.8);">
          懷舊節拍
        </h2>
        <p class="text-base sm:text-xl mb-2 text-center px-6" style="color: rgba(255,255,255,0.4);">限時 60 秒，跟著節奏一起打拍子！</p>
        <p class="text-sm sm:text-lg mb-2 text-center px-6" style="color: rgba(200,150,30,0.5);">完美命中可獲得 Combo 加分</p>
        <p class="text-sm sm:text-base md:text-lg mb-2" style="color: rgba(255,255,255,0.45);">{{ laneModeText }}</p>
        <p class="text-base mb-12" style="color: rgba(240,208,144,0.65);">{{ beatDetectStatus || '尚未分析歌曲節奏' }}</p>

        <p v-if="audioWarning" class="text-lg mb-6 px-6 py-3 rounded-xl"
           style="color: #FFD2B0; background: rgba(120,40,20,0.35); border: 1px solid rgba(255,180,120,0.35);">
          {{ audioWarning }}
        </p>

        <button @click="startGame"
          class="px-10 sm:px-16 md:px-20 py-5 sm:py-7 md:py-8 rounded-full text-black text-2xl sm:text-3xl md:text-4xl font-black active:scale-95 transition-transform"
          style="background: linear-gradient(135deg, #D4A020, #8B6000); box-shadow: 0 20px 60px rgba(200,150,30,0.35);">
          開始演奏
        </button>
      </div>

      <!-- ── PLAYING ── -->
      <div v-if="gameState === 'playing'" class="absolute inset-0 flex flex-col">

        <!-- Timer progress bar -->
        <div class="shrink-0 h-1.5" style="background: rgba(255,255,255,0.06);">
          <div class="h-full transition-none" style="background: linear-gradient(90deg, #C8961E, #E0B030);"
               :style="{ width: timerBarWidth }"></div>
        </div>
        <div class="absolute top-2 right-3 sm:right-5 text-sm sm:text-xl font-bold z-10 tabular-nums"
             style="color: rgba(255,255,255,0.35);">
          {{ Math.ceil(timeLeft / 1000) }}s
        </div>
        <div class="absolute top-2 left-3 sm:left-5 text-[11px] sm:text-sm font-semibold z-10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg"
             style="color: rgba(255,245,214,0.9); background: rgba(60,38,14,0.42); border: 1px solid rgba(230,192,116,0.35);">
          {{ beatDetectStatus || '節奏分析中' }}
        </div>
        <div v-if="audioWarning" class="absolute top-11 sm:top-12 left-3 sm:left-5 text-[11px] sm:text-sm font-semibold z-10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg"
             style="color: #FFD2B0; background: rgba(120,40,20,0.35); border: 1px solid rgba(255,180,120,0.35);">
          {{ audioWarning }}
        </div>

         <!-- Dynamic lane tracks by difficulty -->
        <div class="flex-1 flex">
          <div v-for="(lane, li) in lanes" :key="li"
               class="flex-1 relative overflow-hidden"
           :style="{ background: lane.trackBg, borderRight: li < lanes.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }">

            <!-- Centre guide line -->
            <div class="absolute left-1/2 top-14 pointer-events-none" style="width:1px; bottom: 18%; background: rgba(255,255,255,0.06);"></div>

            <!-- ── Notes ── -->
            <div v-for="note in notesInLane[li]" :key="note.id"
                 class="absolute left-1/2 pointer-events-none z-20"
                 :style="{ top: note.y + '%', transform: 'translate(-50%, -50%)' }">
                <div class="w-12 h-12 sm:w-16 sm:h-16 md:w-30 md:h-30 rounded-full drop-shadow-2xl"
                   :style="{
                     background: `radial-gradient(circle at 38% 32%, ${lane.noteLight}, ${lane.noteDark})`,
                     border: `3px solid ${lane.accent}`,
                     boxShadow: `0 6px 24px ${lane.glow}, 0 0 0 1px rgba(255,255,255,0.1)`,
                   }"></div>
            </div>

            <!-- Hit zone -->
              <div class="absolute left-1/2 pointer-events-none z-10 rounded-full"
                :style="{
                  top: HIT_ZONE_Y + '%',
                  width: '68px',
                  height: '68px',
                  transform: 'translate(-50%, -50%)',
                  border: `3px solid ${lane.accent}B5`,
                  boxShadow: `0 0 18px ${lane.glow}, inset 0 0 16px ${lane.glow}55`,
                  background: 'rgba(255,255,255,0.04)',
                }"></div>
            <div class="absolute inset-x-0 pointer-events-none z-10"
                 :style="{ top: HIT_ZONE_Y + '%', height: '2px', background: `${lane.accent}50` }"></div>
            <div class="absolute inset-x-0 pointer-events-none z-10"
                 :style="{ top: (HIT_ZONE_Y - 4) + '%', height: '40px', background: `linear-gradient(to bottom, transparent, ${lane.glow}25, transparent)` }"></div>

            <!-- Lane flash overlay -->
            <transition name="lane-flash">
              <div v-if="laneFlash[li]" class="absolute inset-0 pointer-events-none z-15"
                   :style="{ background: flashColor(laneFlash[li]) }"></div>
            </transition>

            <!-- Hit result text -->
            <transition name="result-pop">
              <div v-if="laneResult[li]" class="absolute inset-x-0 z-30 text-center font-black text-4xl sm:text-5xl md:text-6xl pointer-events-none"
                   :style="{ top: '54%', color: laneResult[li].color,
                             textShadow: `0 0 20px ${laneResult[li].color}` }">
                {{ laneResult[li].text }}
              </div>
            </transition>

            <!-- TAP BUTTON -->
            <button class="absolute bottom-0 inset-x-0 z-20 flex items-center justify-center"
                    :style="{ height: '18%', background: lane.btnBg,
                              borderTop: `1px solid ${lane.accent}30` }"
                    @pointerdown.prevent="onTap(li)"></button>
          </div>
        </div>
      </div>

      <!-- ── FINISHED ── -->
      <div v-if="gameState === 'finished'"
           class="absolute inset-0 flex flex-col items-center justify-center z-20"
           style="background: rgba(5,3,1,0.85); backdrop-filter: blur(4px);">
        <div class="text-[56px] sm:text-[78px] md:text-[100px] mb-3 drop-shadow-2xl">🎼</div>
        <h2 class="font-black mb-5 sm:mb-6 tracking-widest text-center px-4"
            style="font-size: clamp(2rem, 9vw, 4.5rem); color: #C8961E; text-shadow: 0 0 40px rgba(200,150,30,0.4);">
          演奏結束！
        </h2>

        <div class="grid grid-cols-2 sm:flex gap-5 sm:gap-10 md:gap-12 mb-8 text-center">
          <div>
            <div class="text-3xl sm:text-4xl md:text-5xl font-black" style="color: #F0C040;">{{ accuracy.perfect }}</div>
            <div class="text-sm sm:text-base md:text-xl mt-1" style="color: rgba(255,255,255,0.35);">完美</div>
          </div>
          <div>
            <div class="text-3xl sm:text-4xl md:text-5xl font-black text-green-400">{{ accuracy.good }}</div>
            <div class="text-sm sm:text-base md:text-xl mt-1" style="color: rgba(255,255,255,0.35);">好</div>
          </div>
          <div>
            <div class="text-3xl sm:text-4xl md:text-5xl font-black text-red-400">{{ accuracy.miss }}</div>
            <div class="text-sm sm:text-base md:text-xl mt-1" style="color: rgba(255,255,255,0.35);">漏拍</div>
          </div>
          <div>
            <div class="text-3xl sm:text-4xl md:text-5xl font-black text-white">{{ maxCombo }}</div>
            <div class="text-sm sm:text-base md:text-xl mt-1" style="color: rgba(255,255,255,0.35);">最大 Combo</div>
          </div>
        </div>

        <div class="text-lg sm:text-2xl md:text-3xl mb-8 sm:mb-10" style="color: rgba(255,255,255,0.45);">
          總得分
          <span class="font-black text-3xl sm:text-4xl md:text-5xl text-white ml-2 sm:ml-3">{{ score }}</span>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-[520px] px-4">
          <button v-if="!isMultiplayer" @click="startGame"
            class="px-10 sm:px-14 py-4 sm:py-6 rounded-full text-black text-xl sm:text-2xl md:text-3xl font-black active:scale-95 transition-transform"
            style="background: linear-gradient(135deg, #D4A020, #8B6000);">
            再演一曲
          </button>
          <button v-else @click="goBack"
            class="px-10 sm:px-14 py-4 sm:py-6 rounded-full text-black text-xl sm:text-2xl md:text-3xl font-black active:scale-95 transition-transform"
            style="background: linear-gradient(135deg, #D4A020, #8B6000);">
            回多人房間
          </button>
          <button @click="exitGame"
            class="px-10 sm:px-14 py-4 sm:py-6 rounded-full text-white text-xl sm:text-2xl md:text-3xl font-bold active:scale-95 transition-transform"
            style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);">
            {{ isMultiplayer ? '回遊戲大廳' : '離開' }}
          </button>
        </div>
      </div>

    </main>

    <!-- Film strip bottom -->
    <div class="flex shrink-0 h-4" style="background: #140C06;">
      <div v-for="i in 36" :key="i" class="flex-1 my-0.5 mx-px rounded-sm" style="background: rgba(0,0,0,0.6);"></div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import { guess } from 'web-audio-beat-detector'
import { getRoom, submitRoomScore } from '../utils/multiplayerRoom'

const router = useRouter()
const route = useRoute()
const gameStore = useGameStore()

// ── Lane definitions ──────────────────────────────────────────
const ALL_LANES = [
  {
    trackBg: 'rgba(100,20,10,0.14)',
    btnBg: 'rgba(160,30,15,0.45)',
    accent: '#E06030', glow: 'rgba(220,80,40,0.5)',
    noteLight: '#F09860', noteDark: '#803010',
  },
  {
    trackBg: 'rgba(140,100,10,0.12)',
    btnBg: 'rgba(180,130,10,0.42)',
    accent: '#C8961E', glow: 'rgba(200,150,30,0.5)',
    noteLight: '#F0C040', noteDark: '#906A10',
  },
  {
    trackBg: 'rgba(30,80,30,0.12)',
    btnBg: 'rgba(40,100,40,0.42)',
    accent: '#6ABE50', glow: 'rgba(100,190,70,0.5)',
    noteLight: '#90D870', noteDark: '#306A20',
  },
  {
    trackBg: 'rgba(20,60,120,0.12)',
    btnBg: 'rgba(25,80,155,0.42)',
    accent: '#50A0D8', glow: 'rgba(60,150,220,0.5)',
    noteLight: '#80C8F0', noteDark: '#205880',
  },
]

// ── Constants ─────────────────────────────────────────────────
const audioSrc = (fileName) => `/audio/${encodeURIComponent(fileName)}`

const SONG_LIBRARY = {
  'music-rhythm1': {
    name: '愛拚才會贏',
    src: audioSrc('music-rhythm1.mp3'),
    fallbackBpm: 92,
    fallbackFirstBeatOffsetMs: 600,
  },
  'music-rhythm2': {
    name: '月亮代表我的心',
    src: audioSrc('music-rhythm2.mp3'),
    fallbackBpm: 70,
    fallbackFirstBeatOffsetMs: 900,
  },
  'music-yijianmei': {
    name: '一剪梅',
    src: audioSrc('一剪梅~費玉清的經典好歌(新版高清) - 王志平 (youtube).mp3'),
    fallbackBpm: 74,
    fallbackFirstBeatOffsetMs: 900,
  },
  'music-jiahou': {
    name: '家後',
    src: audioSrc('江蕙 - 家後 - 影音娛樂台Fujit Music (youtube).mp3'),
    fallbackBpm: 76,
    fallbackFirstBeatOffsetMs: 850,
  },
  'music-wowentian': {
    name: '我問天',
    src: audioSrc('翁立友-我問天(官方KTV版) - 豪記唱片 HCM Music (youtube).mp3'),
    fallbackBpm: 84,
    fallbackFirstBeatOffsetMs: 750,
  },
  'music-citymoon': {
    name: '城裡的月光',
    src: audioSrc('許美靜 - 城裡的月光 (Lyric Video) [yYwn8k502qY].mp3'),
    fallbackBpm: 72,
    fallbackFirstBeatOffsetMs: 900,
  },
}

const selectedSongKey = computed(() => {
  const key = String(route.query.track || 'music-rhythm2')
  return SONG_LIBRARY[key] ? key : 'music-rhythm2'
})

const selectedSong = computed(() => SONG_LIBRARY[selectedSongKey.value])
const isMultiplayer = computed(() => route.query.mp === '1' && typeof route.query.roomId === 'string')
const multiplayerRoomId = computed(() => String(route.query.roomId || ''))
const multiplayerPlayerId = computed(() => String(route.query.playerId || ''))
const NOTE_DURATION = 2600 // ms to traverse full height

const HIT_ZONE_Y = 76      // % from top — center of hit window
const HIT_PERFECT = 4      // ± % for "完美"
const HIT_GOOD = 9         // ± % for "好"

// Beat patterns: each entry = lanes that spawn a note on that beat
const BEAT_PATTERNS = [
  [0], [2], [1, 3], [0], [3], [1], [0, 2], [1],
  [2], [0, 3], [1], [2, 3], [0, 2], [3], [1, 3], [0],
]

const FALLBACK_TOTAL_BEATS = 64

const getFallbackRhythm = () => ({
  bpm: selectedSong.value.fallbackBpm,
  beatMs: Math.round(60000 / selectedSong.value.fallbackBpm),
  firstBeatOffsetMs: selectedSong.value.fallbackFirstBeatOffsetMs,
  totalBeats: FALLBACK_TOTAL_BEATS,
})

// ── State ─────────────────────────────────────────────────────
const gameState = ref('idle')
const score = ref(0)
const combo = ref(0)
const maxCombo = ref(0)
const gameDurationMs = ref(getFallbackRhythm().firstBeatOffsetMs + (FALLBACK_TOTAL_BEATS * getFallbackRhythm().beatMs) + NOTE_DURATION + 800)
const timeLeft = ref(gameDurationMs.value)
const audioWarning = ref('')
const beatDetectStatus = ref('')
const activeNotes = ref([])
const laneFlash = reactive([null, null, null, null])
const laneResult = reactive([null, null, null, null])
const accuracy = reactive({ perfect: 0, good: 0, miss: 0 })

const laneCountByDifficulty = {
  easy: 2,
  normal: 3,
  hard: 4,
}

const activeLaneCount = computed(() => laneCountByDifficulty[gameStore.difficulty] ?? 3)
const lanes = computed(() => ALL_LANES.slice(0, activeLaneCount.value))
const laneModeText = computed(() => {
  if (activeLaneCount.value === 2) return '初級模式：2 軌道'
  if (activeLaneCount.value === 3) return '中級模式：3 軌道'
  return '高級模式：4 軌道'
})

const timerBarWidth = computed(() => (timeLeft.value / gameDurationMs.value * 100) + '%')
const notesInLane = computed(() =>
  lanes.value.map((_, li) => activeNotes.value.filter(n => n.lane === li))
)

let noteId = 0
let rafId = null
let gameStartTs = 0
let chartStartTs = 0
let nextChartIdx = 0
let sessionSaved = false
let bgmAudio = null
let bgmSource = ''
let analysisPromise = null
let analyzedRhythm = getFallbackRhythm()
let chart = []
let multiplayerSyncTimer = null

const multiplayerRoom = ref(null)

const multiplayerStatusText = computed(() => {
  if (!multiplayerRoom.value) return '同步中'
  if (multiplayerRoom.value.status === 'finished') return '本局結算中'
  const me = (multiplayerRoom.value.players || []).find((player) => player.id === multiplayerPlayerId.value)
  if (me && Number.isFinite(me.score)) return `你的分數：${me.score}`
  return '對局進行中'
})

const syncMultiplayerRoom = () => {
  if (!isMultiplayer.value) return
  multiplayerRoom.value = getRoom(multiplayerRoomId.value)
}

// ── Helpers ───────────────────────────────────────────────────
const flashColor = (type) => {
  if (type === 'perfect') return 'rgba(240,192,64,0.22)'
  if (type === 'good') return 'rgba(100,200,100,0.16)'
  return 'rgba(220,50,50,0.18)'
}

const stopAudio = () => {
  if (!bgmAudio) return
  bgmAudio.pause()
  bgmAudio.currentTime = 0
}

const ensureAudio = () => {
  if (bgmAudio && bgmSource === selectedSong.value.src) return
  if (bgmAudio) {
    bgmAudio.pause()
  }

  bgmAudio = new Audio(selectedSong.value.src)
  bgmSource = selectedSong.value.src
  analysisPromise = null
  bgmAudio.preload = 'auto'
  bgmAudio.volume = 0.85
}

const buildChart = (totalBeats, laneCount) => {
  return Array.from({ length: totalBeats }, (_, beat) => {
    const lanesInPattern = BEAT_PATTERNS[beat % BEAT_PATTERNS.length].filter(li => li < laneCount)
    if (!lanesInPattern.length) lanesInPattern.push(beat % laneCount)
    return { beat, lanes: lanesInPattern }
  })
}

const detectSongRhythm = async () => {
  if (analysisPromise) return analysisPromise

  analysisPromise = (async () => {
    const audioCtx = new AudioContext()
    try {
      const response = await fetch(selectedSong.value.src)
      if (!response.ok) throw new Error('audio file not found')

      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
      const result = await guess(audioBuffer, { minTempo: 60, maxTempo: 170 })

      const fallback = getFallbackRhythm()
      const bpm = Number.isFinite(result.bpm) && result.bpm > 0 ? result.bpm : fallback.bpm
      const beatMs = Math.round(60000 / bpm)
      const firstBeatOffsetMs = Math.max(0, Math.round((result.offset ?? 0) * 1000))
      const remainingMs = Math.max(0, Math.round(audioBuffer.duration * 1000) - firstBeatOffsetMs)
      const totalBeats = Math.max(16, Math.floor(remainingMs / beatMs))

      return {
        bpm: Math.round(bpm),
        beatMs,
        firstBeatOffsetMs,
        totalBeats,
      }
    } finally {
      await audioCtx.close()
    }
  })().catch((err) => {
    analysisPromise = null
    throw err
  })

  return analysisPromise
}

// ── Game flow ─────────────────────────────────────────────────
const startGame = async () => {
  ensureAudio()

  beatDetectStatus.value = '分析節奏中...'
  audioWarning.value = ''

  try {
    analyzedRhythm = await detectSongRhythm()
    beatDetectStatus.value = `已偵測 ${analyzedRhythm.bpm} BPM`
  } catch (err) {
    analyzedRhythm = getFallbackRhythm()
    beatDetectStatus.value = `偵測失敗，改用預設 ${analyzedRhythm.bpm} BPM`
    audioWarning.value = '節奏分析失敗，已使用預設節拍。'
  }

  chart = buildChart(analyzedRhythm.totalBeats, activeLaneCount.value)
  gameDurationMs.value = analyzedRhythm.firstBeatOffsetMs + (analyzedRhythm.totalBeats * analyzedRhythm.beatMs) + NOTE_DURATION + 800

  score.value = 0
  combo.value = 0
  maxCombo.value = 0
  timeLeft.value = gameDurationMs.value
  activeNotes.value = []
  accuracy.perfect = accuracy.good = accuracy.miss = 0
  nextChartIdx = 0
  sessionSaved = false
  laneFlash[0] = laneFlash[1] = laneFlash[2] = laneFlash[3] = null
  laneResult[0] = laneResult[1] = laneResult[2] = laneResult[3] = null

  gameState.value = 'playing'

  stopAudio()
  try {
    bgmAudio.currentTime = 0
    await bgmAudio.play()
  } catch (err) {
    audioWarning.value = '音檔尚未準備好，先以無聲節拍模式進行。'
  }

  gameStartTs = performance.now()
  chartStartTs = gameStartTs + analyzedRhythm.firstBeatOffsetMs

  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(tick)
}

const tick = (now) => {
  const elapsed = now - gameStartTs
  const chartElapsed = now - chartStartTs

  timeLeft.value = Math.max(0, gameDurationMs.value - elapsed)

  for (const n of activeNotes.value) {
    n.y = ((chartElapsed - n.spawnAt) / NOTE_DURATION) * 100
    if (n.y > HIT_ZONE_Y + HIT_GOOD + 4 && !n._miss) {
      // Auto-miss
      n._miss = true
      combo.value = 0
      accuracy.miss++
    }
  }

  // Remove notes that missed or went off-screen
  activeNotes.value = activeNotes.value.filter(n => !n._miss && n.y < 106)

  // Spawn notes based on chart beat time to keep stable song sync.
  while (nextChartIdx < chart.length && chartElapsed >= chart[nextChartIdx].beat * analyzedRhythm.beatMs) {
    const chartBeat = chart[nextChartIdx]
    for (const li of chartBeat.lanes) {
      activeNotes.value.push({
        id: noteId++,
        lane: li,
        y: 0,
        spawnAt: chartBeat.beat * analyzedRhythm.beatMs,
      })
    }
    nextChartIdx++
  }

  if (timeLeft.value <= 0) {
    endGame()
    return
  }

  rafId = requestAnimationFrame(tick)
}

const onTap = (li) => {
  if (gameState.value !== 'playing') return

  const candidates = activeNotes.value
    .filter(n => n.lane === li && n.y >= HIT_ZONE_Y - HIT_GOOD && n.y <= HIT_ZONE_Y + HIT_GOOD)
    .sort((a, b) => Math.abs(a.y - HIT_ZONE_Y) - Math.abs(b.y - HIT_ZONE_Y))

  if (!candidates.length) return

  const note = candidates[0]
  activeNotes.value = activeNotes.value.filter(n => n.id !== note.id)

  const diff = Math.abs(note.y - HIT_ZONE_Y)
  let pts, flash, text, color

  if (diff <= HIT_PERFECT) {
    pts = 100; flash = 'perfect'; text = '完美！'; color = '#F0C040'
    accuracy.perfect++
  } else {
    pts = 50; flash = 'good'; text = '好！'; color = '#6ABE50'
    accuracy.good++
  }

  combo.value++
  if (combo.value > maxCombo.value) maxCombo.value = combo.value
  // Combo multiplier: +1 every 5 combos, max ×4
  const mult = Math.min(4, 1 + Math.floor(combo.value / 5))
  score.value += pts * mult

  laneFlash[li] = flash
  setTimeout(() => { laneFlash[li] = null }, 160)

  laneResult[li] = { text, color }
  setTimeout(() => { laneResult[li] = null }, 520)
}

const endGame = () => {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null }
  stopAudio()
  if (!sessionSaved) {
    sessionSaved = true
    const total = accuracy.perfect + accuracy.good + accuracy.miss
    const hitRate = total > 0 ? (accuracy.perfect + accuracy.good) / total : 0
    const s = Math.round(hitRate * 80 + Math.min(score.value / 3000, 1) * 20)
    gameStore.addSession('music', s, {
      perfect: accuracy.perfect,
      good: accuracy.good,
      miss: accuracy.miss,
      maxCombo: maxCombo.value,
    })
  }

  if (isMultiplayer.value && multiplayerRoomId.value && multiplayerPlayerId.value) {
    submitRoomScore(multiplayerRoomId.value, multiplayerPlayerId.value, score.value)
    syncMultiplayerRoom()
  }

  gameState.value = 'finished'
}

const finishEarly = () => {
  if (gameState.value !== 'playing') return
  endGame()
}

const goBack = () => {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null }
  stopAudio()
  if (gameState.value === 'playing' && !sessionSaved) {
    sessionSaved = true
    const total = accuracy.perfect + accuracy.good + accuracy.miss
    const hitRate = total > 0 ? (accuracy.perfect + accuracy.good) / total : 0
    gameStore.addSession('music', Math.round(hitRate * 80), {})
  }
  if (isMultiplayer.value && multiplayerRoomId.value) {
    router.push({ name: 'multiplayer-room', params: { roomId: multiplayerRoomId.value } })
    return
  }
  router.push('/')
}

const exitGame = () => {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null }
  stopAudio()
  router.push('/')
}

onMounted(() => {
  if (!isMultiplayer.value) return
  syncMultiplayerRoom()
  multiplayerSyncTimer = setInterval(syncMultiplayerRoom, 1000)
})

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  stopAudio()
  if (multiplayerSyncTimer) clearInterval(multiplayerSyncTimer)
})
</script>

<style scoped>
/* Vinyl spin */
.vinyl-spin {
  animation: vspin 4s linear infinite;
}
@keyframes vspin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* Combo pop in */
.combo-pop-enter-active { animation: cpop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.combo-pop-leave-active { transition: opacity 0.2s; }
.combo-pop-leave-to    { opacity: 0; }
@keyframes cpop {
  from { transform: scale(0.4); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

/* Lane flash */
.lane-flash-enter-active, .lane-flash-leave-active { transition: opacity 0.15s ease; }
.lane-flash-enter-from, .lane-flash-leave-to { opacity: 0; }

/* Result pop */
.result-pop-enter-active { animation: rpop 0.18s ease-out; }
.result-pop-leave-active { animation: rout 0.34s ease-in forwards; }
@keyframes rpop {
  from { transform: scale(0.5) translateY(16px); opacity: 0; }
  to   { transform: scale(1)   translateY(0);    opacity: 1; }
}
@keyframes rout {
  to { transform: translateY(-36px); opacity: 0; }
}
</style>
