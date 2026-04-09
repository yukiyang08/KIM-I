<template>
  <div class="h-full w-full flex flex-col font-['Outfit','Noto_Sans_TC'] overflow-y-auto overflow-x-hidden select-none"
       style="background: #080810;">

    <!-- Decorative top strip -->
    <div class="shrink-0 h-4 z-10" style="background: repeating-linear-gradient(90deg, #6080B0 0 32px, #3A4A70 32px 36px);"></div>

    <!-- Header -->
    <header class="shrink-0 px-10 py-5 flex justify-between items-center border-b z-10 relative"
            style="background:rgba(5,5,10,0.97);border-color:rgba(255,255,255,0.05);">
      <div>
        <button @click="router.push('/')"
                class="flex items-center gap-2 mb-3 text-lg font-bold transition-colors"
                style="color:rgba(96,128,176,0.5);"
                @mouseover="e => e.currentTarget.style.color='#6080B0'"
                @mouseleave="e => e.currentTarget.style.color='rgba(96,128,176,0.5)'">
          ← 離開遊戲
        </button>
        <h1 class="text-5xl font-black" style="color:#7090C0;text-shadow:0 0 40px rgba(96,128,176,0.35);">
          <span style="color:#A080D0;">🧩</span> 廟口大拼圖
        </h1>
        <p class="text-xl mt-1.5 italic font-medium" style="color:rgba(255,255,255,0.3);">
          記住圖片的排列，再把拼圖復原！
        </p>
      </div>
      <div class="text-right" v-if="gameState === 'playing'">
        <div class="text-base font-bold uppercase tracking-widest mb-1" style="color:rgba(255,255,255,0.2);">移動步數</div>
        <div class="text-6xl font-black text-white tabular-nums">{{ moves }}</div>
        <div class="text-xl mt-1 font-bold tabular-nums" style="color:rgba(255,255,255,0.35);">
          {{ formatTime(elapsed) }}
        </div>
      </div>
    </header>

    <!-- Main -->
    <main class="flex-1 relative overflow-y-auto overflow-x-hidden flex flex-col items-center justify-center px-8 py-6 gap-6">

      <!-- ── IDLE ── -->
      <div v-if="gameState === 'idle'" class="flex flex-col items-center text-center gap-8">
        <div class="text-[110px] drop-shadow-2xl">🧩</div>
        <h2 class="text-6xl font-black text-white tracking-widest" style="text-shadow:0 4px 20px rgba(0,0,0,0.9);">
          廟口大拼圖
        </h2>
        <p class="text-2xl max-w-[580px] leading-relaxed" style="color:rgba(255,255,255,0.4);">
          先記住圖片排列（3 秒）<br>
          然後滑動方塊，將拼圖復原！
        </p>
        <button @click="beginPreview"
          class="mt-4 px-20 py-8 rounded-full text-black text-4xl font-black active:scale-95 transition-transform"
          style="background:linear-gradient(135deg,#7090C0,#3A5080);box-shadow:0 20px 60px rgba(96,128,176,0.3);">
          開始拼圖
        </button>
      </div>

      <!-- ── PREVIEW ── -->
      <div v-if="gameState === 'preview'" class="flex flex-col items-center gap-6">
        <div class="text-3xl font-bold" style="color:#7090C0;">
          請記住拼圖的排列！
        </div>
        <!-- Countdown ring -->
        <div class="relative w-20 h-20">
          <svg class="w-full h-full -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="6"/>
            <circle cx="40" cy="40" r="34" fill="none" stroke="#7090C0" stroke-width="6"
                    stroke-linecap="round" stroke-dasharray="213.6"
                    :stroke-dashoffset="213.6 * (1 - countdown / PREVIEW_DURATION)"/>
          </svg>
          <div class="absolute inset-0 flex items-center justify-center text-3xl font-black text-white">
            {{ countdown }}
          </div>
        </div>
        <!-- Solved puzzle preview -->
        <div class="grid gap-2" style="grid-template-columns:repeat(3,1fr);width:420px;height:420px;">
          <div v-for="(tile, i) in SOLVED" :key="i"
               class="rounded-[20px] flex flex-col items-center justify-center gap-1 border-2"
               :style="tileStyle(tile, true)">
            <span class="text-5xl drop-shadow-lg">{{ tile.icon }}</span>
            <span class="text-xl font-black" :style="{ color: tile.numColor }">{{ tile.label }}</span>
          </div>
        </div>
      </div>

      <!-- ── PLAYING ── -->
      <div v-if="gameState === 'playing'" class="flex flex-col items-center gap-5">
        <!-- Hint button -->
        <div class="flex items-center gap-4">
          <button @click="showHint" :disabled="hintUsed"
            class="px-8 py-3 rounded-full font-bold text-xl transition-all active:scale-95"
            :style="hintUsed
              ? 'background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.1);'
              : 'background:rgba(112,144,192,0.15);color:#7090C0;border:1px solid rgba(112,144,192,0.4);'">
            💡 提示 {{ hintUsed ? '(已使用)' : '(-20分)' }}
          </button>
          <div class="text-xl font-medium" style="color:rgba(255,255,255,0.3);">
            目標：最少步數復原拼圖
          </div>
        </div>

        <!-- Puzzle grid -->
        <div class="grid gap-2 relative" style="grid-template-columns:repeat(3,1fr);width:420px;height:420px;">
          <!-- Hint overlay -->
          <transition name="hint-fade">
            <div v-if="showingHint" class="absolute inset-0 z-30 grid gap-2 rounded-[24px] overflow-hidden"
                 style="grid-template-columns:repeat(3,1fr);">
              <div v-for="(tile, i) in SOLVED" :key="i"
                   class="flex flex-col items-center justify-center gap-1"
                   :style="tileStyle(tile, true)">
                <span class="text-5xl">{{ tile.icon }}</span>
                <span class="text-xl font-black" :style="{ color: tile.numColor }">{{ tile.label }}</span>
              </div>
            </div>
          </transition>

          <div v-for="(tile, i) in board" :key="i"
               class="rounded-[20px] flex flex-col items-center justify-center gap-1 transition-all duration-150 border-2 cursor-pointer"
               :class="tile ? 'active:scale-95' : ''"
               :style="tile ? tileStyle(tile, isCorrectPosition(tile, i)) : emptyStyle"
               @click="tile ? tryMove(i) : null">
            <template v-if="tile">
              <span class="text-5xl drop-shadow-lg">{{ tile.icon }}</span>
              <span class="text-xl font-black" :style="{ color: tile.numColor }">{{ tile.label }}</span>
            </template>
            <!-- Empty slot indicator -->
            <template v-else>
              <div class="w-12 h-12 rounded-full border-2 border-dashed" style="border-color:rgba(255,255,255,0.15);"></div>
            </template>
          </div>
        </div>
      </div>

      <!-- ── FINISHED ── -->
      <div v-if="gameState === 'finished'" class="flex flex-col items-center text-center gap-6">
        <div class="text-[100px] drop-shadow-2xl">🎊</div>
        <h2 class="text-7xl font-black tracking-widest" style="color:#7090C0;text-shadow:0 0 40px rgba(96,128,176,0.4);">
          拼圖完成！
        </h2>
        <div class="flex gap-12 text-center my-2">
          <div>
            <div class="text-5xl font-black text-white">{{ moves }}</div>
            <div class="text-xl mt-1" style="color:rgba(255,255,255,0.4);">步數</div>
          </div>
          <div>
            <div class="text-5xl font-black" style="color:#7090C0;">{{ formatTime(elapsed) }}</div>
            <div class="text-xl mt-1" style="color:rgba(255,255,255,0.4);">時間</div>
          </div>
          <div>
            <div class="text-5xl font-black" style="color:#C8961E;">{{ finalScore }}</div>
            <div class="text-xl mt-1" style="color:rgba(255,255,255,0.4);">得分</div>
          </div>
        </div>
        <div class="flex gap-6 mt-2">
          <button @click="beginPreview"
            class="px-14 py-6 rounded-full text-black text-3xl font-black active:scale-95 transition-transform"
            style="background:linear-gradient(135deg,#7090C0,#3A5080);">
            再拼一次
          </button>
          <button @click="router.push('/')"
            class="px-14 py-6 rounded-full text-white text-3xl font-bold active:scale-95 transition-transform"
            style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);">
            離開
          </button>
        </div>
      </div>

    </main>

  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'

const router = useRouter()
const gameStore = useGameStore()

// ── Tile definitions (solved order, index 0–7, null = empty at 8) ────
const SOLVED = [
  { id: 0, icon: '🏮', label: '一', bg: 'rgba(160,40,30,0.3)',  border: '#C04030', numColor: '#E08070' },
  { id: 1, icon: '🎭', label: '二', bg: 'rgba(160,100,10,0.3)', border: '#C08010', numColor: '#E0B040' },
  { id: 2, icon: '🥁', label: '三', bg: 'rgba(80,120,40,0.3)',  border: '#608030', numColor: '#90B060' },
  { id: 3, icon: '🍢', label: '四', bg: 'rgba(40,100,40,0.3)',  border: '#408040', numColor: '#60B060' },
  { id: 4, icon: '🎵', label: '五', bg: 'rgba(30,80,140,0.3)',  border: '#3060A0', numColor: '#5090D0' },
  { id: 5, icon: '🧧', label: '六', bg: 'rgba(120,30,120,0.3)', border: '#903090', numColor: '#C060C0' },
  { id: 6, icon: '🌙', label: '七', bg: 'rgba(30,60,120,0.3)',  border: '#204080', numColor: '#4070B0' },
  { id: 7, icon: '🪔', label: '八', bg: 'rgba(140,80,20,0.3)',  border: '#A06010', numColor: '#D09030' },
]

// ── Constants ─────────────────────────────────────────────────
const PREVIEW_DURATION = 4  // seconds to show preview
const SHUFFLE_MOVES = 22    // random valid moves from solved = always solvable

// ── State ─────────────────────────────────────────────────────
const gameState = ref('idle')
const board = ref([])        // 9 elements: tile object | null
const moves = ref(0)
const elapsed = ref(0)       // seconds
const countdown = ref(PREVIEW_DURATION)
const hintUsed = ref(false)
const showingHint = ref(false)
const finalScore = ref(0)

let timer = null
let cdTimer = null

// ── Helpers ───────────────────────────────────────────────────
const emptyStyle = 'background:rgba(255,255,255,0.03);border-color:rgba(255,255,255,0.08);cursor:default;'

const tileStyle = (tile, correct) => ({
  background: tile.bg,
  borderColor: correct ? '#4ADE80' : tile.border,
  boxShadow: correct ? '0 0 16px rgba(74,222,128,0.25)' : '0 4px 20px rgba(0,0,0,0.4)',
})

const isCorrectPosition = (tile, idx) => tile && tile.id === idx

const formatTime = (secs) => {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

const getAdjacentIndices = (idx) => {
  const row = Math.floor(idx / 3), col = idx % 3
  const adj = []
  if (row > 0) adj.push(idx - 3)
  if (row < 2) adj.push(idx + 3)
  if (col > 0) adj.push(idx - 1)
  if (col < 2) adj.push(idx + 1)
  return adj
}

// ── Solved detection ──────────────────────────────────────────
const isSolved = computed(() =>
  board.value.length === 9 &&
  board.value.every((tile, i) => i === 8 ? tile === null : tile?.id === i)
)

// ── Game flow ─────────────────────────────────────────────────
const beginPreview = () => {
  clearInterval(timer)
  clearInterval(cdTimer)
  moves.value = 0
  elapsed.value = 0
  hintUsed.value = false
  showingHint.value = false
  countdown.value = PREVIEW_DURATION
  gameState.value = 'preview'

  cdTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(cdTimer)
      startPlaying()
    }
  }, 1000)
}

const startPlaying = () => {
  board.value = shuffleBoard()
  gameState.value = 'playing'
  timer = setInterval(() => { elapsed.value++ }, 1000)
}

const shuffleBoard = () => {
  // Start from solved state, make N random valid moves (always solvable)
  const arr = [...SOLVED, null]  // index 8 = null (empty)
  let emptyIdx = 8
  let prev = -1

  for (let i = 0; i < SHUFFLE_MOVES; i++) {
    const neighbors = getAdjacentIndices(emptyIdx).filter(n => n !== prev)
    const chosen = neighbors[Math.floor(Math.random() * neighbors.length)]
    arr[emptyIdx] = arr[chosen]
    arr[chosen] = null
    prev = emptyIdx
    emptyIdx = chosen
  }
  return arr
}

const tryMove = (idx) => {
  if (gameState.value !== 'playing') return
  const emptyIdx = board.value.indexOf(null)
  if (!getAdjacentIndices(emptyIdx).includes(idx)) return

  const newBoard = [...board.value]
  newBoard[emptyIdx] = newBoard[idx]
  newBoard[idx] = null
  board.value = newBoard
  moves.value++

  if (isSolved.value) endGame()
}

const showHint = () => {
  if (hintUsed.value || showingHint.value) return
  hintUsed.value = true
  showingHint.value = true
  setTimeout(() => { showingHint.value = false }, 2000)
}

const endGame = () => {
  clearInterval(timer)
  // Score: base 100, -2 per move beyond 15, -1 per 5 seconds, -20 if hint used
  const score = Math.max(10, 100 - Math.max(0, moves.value - 15) * 2 - Math.floor(elapsed.value / 5) - (hintUsed.value ? 20 : 0))
  finalScore.value = score
  gameStore.addSession('puzzle', score, { moves: moves.value, time: elapsed.value, hintUsed: hintUsed.value })
  gameState.value = 'finished'
}

onUnmounted(() => {
  clearInterval(timer)
  clearInterval(cdTimer)
})
</script>

<style scoped>
.hint-fade-enter-active, .hint-fade-leave-active { transition: opacity 0.3s ease; }
.hint-fade-enter-from, .hint-fade-leave-to { opacity: 0; }
</style>
