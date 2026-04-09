<template>
  <div class="h-full w-full flex flex-col font-['Outfit',_'Noto_Sans_TC'] overflow-y-auto overflow-x-hidden text-white relative"
       style="background: radial-gradient(ellipse at top, #2A180B 0%, #140B05 45%, #0B0603 100%);">

    <div class="absolute inset-0 opacity-[0.07] pointer-events-none"
         style="background-image: repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 44px), repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 44px);"></div>

    <header class="px-4 sm:px-6 md:px-10 lg:px-12 py-4 sm:py-6 md:py-8 border-b relative z-10"
            style="border-color: rgba(255,255,255,0.06); background: rgba(12,8,4,0.62); backdrop-filter: blur(8px);">
      <div class="flex flex-wrap gap-4 sm:gap-6 items-start justify-between">
        <div class="min-w-0">
          <button @click="router.push('/')"
                  class="flex items-center gap-2 text-sm sm:text-base md:text-lg font-bold mb-2 sm:mb-3 transition-colors"
                  style="color: rgba(255,255,255,0.44);"
                  @mouseover="e => e.currentTarget.style.color = '#F0A500'"
                  @mouseleave="e => e.currentTarget.style.color = 'rgba(255,255,255,0.44)'">
            ← 離開遊戲
          </button>
          <h1 class="font-black tracking-[0.08em] leading-tight" style="font-size: clamp(1.7rem, 6vw, 3.6rem); color: #F0B84A;">
            <span style="color:#FF5A45;">●</span> 柑仔店採買記
          </h1>
          <p class="mt-1 sm:mt-2 text-sm sm:text-base md:text-xl italic"
             style="color: rgba(255,231,186,0.7);">
            記住清單，在貨架裡把正確商品找出來。
          </p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full sm:w-auto">
          <div class="rounded-xl px-3 py-2 text-center"
               style="background: rgba(50,32,14,0.65); border: 1px solid rgba(231,185,96,0.3);">
            <div class="text-[10px] sm:text-xs uppercase tracking-[0.18em] opacity-60">關卡</div>
            <div class="text-lg sm:text-2xl font-black tabular-nums">{{ round + 1 }}/{{ totalRounds }}</div>
          </div>
          <div class="rounded-xl px-3 py-2 text-center"
               style="background: rgba(50,32,14,0.65); border: 1px solid rgba(231,185,96,0.3);">
            <div class="text-[10px] sm:text-xs uppercase tracking-[0.18em] opacity-60">正確</div>
            <div class="text-lg sm:text-2xl font-black tabular-nums text-[#7DFFAE]">{{ totalCorrect }}</div>
          </div>
          <div class="rounded-xl px-3 py-2 text-center"
               style="background: rgba(50,32,14,0.65); border: 1px solid rgba(231,185,96,0.3);">
            <div class="text-[10px] sm:text-xs uppercase tracking-[0.18em] opacity-60">失誤</div>
            <div class="text-lg sm:text-2xl font-black tabular-nums text-[#FFB19E]">{{ totalErrors }}</div>
          </div>
          <div class="rounded-xl px-3 py-2 text-center"
               style="background: rgba(50,32,14,0.65); border: 1px solid rgba(231,185,96,0.3);">
            <div class="text-[10px] sm:text-xs uppercase tracking-[0.18em] opacity-60">耗時</div>
            <div class="text-lg sm:text-2xl font-black tabular-nums">{{ elapsedTime.toFixed(1) }}s</div>
          </div>
        </div>
      </div>
    </header>

    <main ref="mainRef" class="flex-1 relative px-3 sm:px-5 md:px-8 lg:px-12 py-4 sm:py-6 md:py-8 z-10">
      <transition name="scale" mode="out-in">
        <section v-if="stage === 'memo'" key="memo"
                 class="max-w-3xl mx-auto rounded-[24px] sm:rounded-[36px] p-5 sm:p-8 md:p-10 text-[#2C1C0D]"
                 style="background: linear-gradient(145deg, #FFF6E9, #F7E4CB); border: 10px solid #6A4823; box-shadow: 0 28px 60px rgba(0,0,0,0.55);">
          <div class="text-center">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-black tracking-[0.14em]"
                 style="background: rgba(160,112,36,0.2); color:#6A4823;">
              記憶階段
            </div>
            <h2 class="mt-4 text-2xl sm:text-4xl md:text-5xl font-black tracking-[0.12em]">本關採買清單</h2>
            <p class="mt-2 text-sm sm:text-base md:text-lg font-semibold text-[#6A5337]">請記住以下 {{ targetItems.length }} 樣商品</p>
          </div>

          <div class="mt-6 sm:mt-8 overflow-x-auto">
            <div class="flex flex-nowrap justify-start sm:justify-center gap-3 sm:gap-5 min-w-max">
              <article v-for="item in targetItems" :key="item.id" class="rounded-2xl px-3 sm:px-4 py-4 sm:py-5 text-center min-w-[150px] sm:min-w-[180px]"
                     style="background: rgba(255,255,255,0.72); border: 1px dashed rgba(106,72,35,0.35);">
                <div class="text-5xl sm:text-7xl">{{ item.icon }}</div>
                <div class="mt-2 text-base sm:text-xl font-black">{{ item.name }}</div>
              </article>
            </div>
          </div>

          <div class="mt-7 sm:mt-9 text-center">
            <div class="text-sm sm:text-base font-bold text-[#6A5337]">倒數</div>
            <div class="text-5xl sm:text-6xl font-black text-[#D14A33] tabular-nums">{{ memoCountdown }}</div>
          </div>
        </section>

        <section v-else-if="stage === 'play'" key="play" class="max-w-6xl mx-auto">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-5">
            <div class="px-4 sm:px-6 py-2.5 rounded-full text-sm sm:text-lg font-black"
                 style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14); color:#F2CB83;">
              請點出清單商品（剩餘 {{ remainTargetCount }} 樣）
            </div>
            <div class="text-sm sm:text-base font-semibold" style="color: rgba(255,236,201,0.78);">
              難度：{{ difficultyLabel }}
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            <button
              v-for="item in shelfItems"
              :key="item.id"
              class="group relative rounded-3xl min-h-[150px] sm:min-h-[190px] p-3 sm:p-4 md:p-5 text-left transition-transform active:scale-[0.96]"
              :class="{ 'pointer-events-none': selectedIds.includes(item.id) }"
              :style="cardStyle(item.id)"
              :ref="el => registerCardRef(item.id, el)"
              @click="onSelect(item)"
            >
              <div class="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"
                   style="background: radial-gradient(circle at 50% 30%, rgba(255,214,131,0.2), transparent 65%);"></div>

              <div class="relative z-10 flex flex-col items-center justify-center h-full text-center">
                <div class="text-5xl sm:text-7xl md:text-8xl leading-none">{{ item.icon }}</div>
                <div class="mt-2 sm:mt-3 text-sm sm:text-lg md:text-xl font-black tracking-[0.02em] text-[#FFE9C5]">{{ item.name }}</div>
              </div>

              <div v-if="selectedIds.includes(item.id)" class="absolute inset-0 rounded-3xl flex items-center justify-center"
                   style="background: rgba(9,7,5,0.68);">
                <span class="text-5xl sm:text-6xl">✔</span>
              </div>
            </button>
          </div>
        </section>

        <section v-else key="result" class="max-w-3xl mx-auto text-center rounded-[28px] sm:rounded-[40px] p-6 sm:p-10"
                 style="background: linear-gradient(145deg, rgba(52,31,15,0.86), rgba(23,14,8,0.94)); border: 1px solid rgba(239,192,101,0.32); box-shadow: 0 28px 60px rgba(0,0,0,0.5);">
          <div class="text-[110px] sm:text-[140px] mb-2">🧺</div>
          <h2 class="text-4xl sm:text-6xl font-black tracking-[0.08em]" style="color:#F0B84A;">採買完成</h2>
          <p class="mt-2 text-base sm:text-xl" style="color: rgba(255,226,169,0.76);">做得很好，今天的採買記憶訓練結束了！</p>

          <div class="mt-6 grid grid-cols-2 gap-3 sm:gap-4 text-left">
            <div class="rounded-2xl px-4 py-3" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);">
              <div class="text-xs uppercase tracking-[0.16em] opacity-65">總分</div>
              <div class="text-3xl sm:text-4xl font-black text-[#7DFFAE]">{{ finalScore }}</div>
            </div>
            <div class="rounded-2xl px-4 py-3" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);">
              <div class="text-xs uppercase tracking-[0.16em] opacity-65">總耗時</div>
              <div class="text-3xl sm:text-4xl font-black">{{ elapsedTime.toFixed(1) }}s</div>
            </div>
            <div class="rounded-2xl px-4 py-3" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);">
              <div class="text-xs uppercase tracking-[0.16em] opacity-65">答對數</div>
              <div class="text-3xl sm:text-4xl font-black">{{ totalCorrect }}</div>
            </div>
            <div class="rounded-2xl px-4 py-3" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);">
              <div class="text-xs uppercase tracking-[0.16em] opacity-65">失誤數</div>
              <div class="text-3xl sm:text-4xl font-black text-[#FFB19E]">{{ totalErrors }}</div>
            </div>
          </div>

          <button @click="resetGame"
                  class="mt-7 sm:mt-9 px-8 sm:px-12 py-4 sm:py-5 rounded-full text-2xl sm:text-3xl font-black active:scale-95 transition-transform"
                  style="background: linear-gradient(135deg, #E4B84D, #A37212); color:#2A1808; box-shadow: 0 18px 40px rgba(240,165,0,0.3);">
            再次挑戰
          </button>
        </section>
      </transition>
    </main>

  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { useGameStore } from '../stores/gameStore'

const router = useRouter()
const gameStore = useGameStore()

const allItems = [
  { id: 1, name: '黑松沙士', icon: '🥫' },
  { id: 2, name: '懷舊乖乖', icon: '🥨' },
  { id: 3, name: '古早味麵茶', icon: '🥣' },
  { id: 4, name: '古早糖葫蘆', icon: '🍢' },
  { id: 5, name: '彈珠汽水', icon: '🍾' },
  { id: 6, name: '廟口鹹酥雞', icon: '🍗' },
  { id: 7, name: '阿嬤冬瓜露', icon: '🧃' },
  { id: 8, name: '鳳梨酥', icon: '🍍' },
  { id: 9, name: '懷舊陀螺', icon: '🪀' },
  { id: 10, name: '發光燈籠', icon: '🏮' },
  { id: 11, name: '紅豆湯圓', icon: '🍡' },
  { id: 12, name: '中藥貼布', icon: '🩹' },
]

const configByDifficulty = {
  easy: { rounds: 2, targetBase: 2, memoSec: 9, shelfSize: 8 },
  normal: { rounds: 3, targetBase: 3, memoSec: 8, shelfSize: 10 },
  hard: { rounds: 4, targetBase: 3, memoSec: 7, shelfSize: 12 },
}

const stage = ref('memo')
const round = ref(0)
const totalRounds = ref(3)
const targetItems = ref([])
const shelfItems = ref([])
const selectedIds = ref([])
const disabledIds = ref([])
const memoCountdown = ref(8)
const totalCorrect = ref(0)
const totalErrors = ref(0)
const elapsedTime = ref(0)
const finalScore = ref(0)

const cardRefs = reactive({})
const mainRef = ref(null)

let memoTimer = null
let playTimer = null
let stageStartAt = 0

const difficultyConfig = computed(() => configByDifficulty[gameStore.difficulty] || configByDifficulty.normal)
const difficultyLabel = computed(() => {
  if (gameStore.difficulty === 'easy') return '簡單'
  if (gameStore.difficulty === 'hard') return '困難'
  return '一般'
})
const remainTargetCount = computed(() => targetItems.value.length - selectedIds.value.length)

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)
const sample = (arr, count) => shuffle(arr).slice(0, count)

const clearTimers = () => {
  if (memoTimer) {
    clearInterval(memoTimer)
    memoTimer = null
  }
  if (playTimer) {
    clearInterval(playTimer)
    playTimer = null
  }
}

const cardStyle = (id) => {
  const picked = selectedIds.value.includes(id)
  return {
    background: picked
      ? 'linear-gradient(145deg, rgba(47,89,50,0.55), rgba(21,45,25,0.8))'
      : 'linear-gradient(145deg, rgba(56,35,16,0.72), rgba(22,14,8,0.88))',
    border: picked
      ? '2px solid rgba(130,230,150,0.5)'
      : '2px solid rgba(238,190,94,0.24)',
    boxShadow: picked
      ? '0 10px 24px rgba(70,140,80,0.28)'
      : '0 10px 24px rgba(0,0,0,0.28)',
  }
}

const registerCardRef = (id, el) => {
  if (el) cardRefs[id] = el
}

const startMemoStage = () => {
  clearTimers()
  stage.value = 'memo'
  selectedIds.value = []
  disabledIds.value = []

  const roundOffset = Math.min(2, round.value)
  const targetCount = Math.min(allItems.length - 2, difficultyConfig.value.targetBase + roundOffset)
  targetItems.value = sample(allItems, targetCount)

  const others = allItems.filter((item) => !targetItems.value.some((target) => target.id === item.id))
  const decoyCount = Math.max(0, difficultyConfig.value.shelfSize - targetItems.value.length)
  shelfItems.value = shuffle([...targetItems.value, ...sample(others, decoyCount)])

  memoCountdown.value = Math.max(4, difficultyConfig.value.memoSec - roundOffset)

  memoTimer = setInterval(() => {
    memoCountdown.value -= 1
    if (memoCountdown.value <= 0) {
      clearInterval(memoTimer)
      memoTimer = null
      startPlayStage()
    }
  }, 1000)
}

const startPlayStage = () => {
  stage.value = 'play'
  stageStartAt = Date.now()
  playTimer = setInterval(() => {
    const sec = (Date.now() - stageStartAt) / 1000
    elapsedTime.value = Number(sec.toFixed(1))
  }, 100)
}

const endRound = () => {
  if (playTimer) {
    clearInterval(playTimer)
    playTimer = null
  }

  if (round.value + 1 >= totalRounds.value) {
    finishGame()
    return
  }

  round.value += 1
  setTimeout(() => {
    startMemoStage()
  }, 800)
}

const finishGame = () => {
  clearTimers()

  const maxTargets = Array.from({ length: totalRounds.value }, (_, idx) => {
    const offset = Math.min(2, idx)
    return Math.min(allItems.length - 2, difficultyConfig.value.targetBase + offset)
  }).reduce((sum, count) => sum + count, 0)

  const accuracyRate = maxTargets > 0 ? totalCorrect.value / maxTargets : 0
  const errorPenalty = Math.min(28, totalErrors.value * 4)
  const speedPenalty = Math.min(24, Math.max(0, elapsedTime.value - totalRounds.value * 6) * 1.2)
  const rawScore = Math.round(72 * accuracyRate + 28 - errorPenalty - speedPenalty)
  finalScore.value = Math.max(0, Math.min(100, rawScore))

  gameStore.addSession('shopping', finalScore.value, {
    rounds: totalRounds.value,
    correctCount: totalCorrect.value,
    totalTime: elapsedTime.value,
    errors: totalErrors.value,
    difficulty: gameStore.difficulty,
  })

  stage.value = 'result'
}

const onSelect = (item) => {
  if (stage.value !== 'play') return
  if (selectedIds.value.includes(item.id)) return
  if (disabledIds.value.includes(item.id)) return

  const isTarget = targetItems.value.some((target) => target.id === item.id)
  if (isTarget) {
    selectedIds.value.push(item.id)
    totalCorrect.value += 1

    if (selectedIds.value.length === targetItems.value.length) {
      setTimeout(endRound, 280)
    }
    return
  }

  totalErrors.value += 1
  disabledIds.value.push(item.id)

  if (cardRefs[item.id]) {
    gsap.fromTo(cardRefs[item.id],
      { x: -8 },
      { x: 8, duration: 0.06, repeat: 5, yoyo: true, clearProps: 'x' }
    )
  } else if (mainRef.value) {
    gsap.fromTo(mainRef.value,
      { x: -4 },
      { x: 4, duration: 0.05, repeat: 5, yoyo: true, clearProps: 'x' }
    )
  }

  setTimeout(() => {
    disabledIds.value = disabledIds.value.filter((id) => id !== item.id)
  }, 700)
}

const resetGame = () => {
  clearTimers()
  if (toastTimer) {
    clearTimeout(toastTimer)
    toastTimer = null
  }

  round.value = 0
  totalRounds.value = difficultyConfig.value.rounds
  totalCorrect.value = 0
  totalErrors.value = 0
  elapsedTime.value = 0
  finalScore.value = 0
  startMemoStage()
}

onMounted(() => {
  resetGame()
})

onUnmounted(() => {
  clearTimers()
})
</script>

<style scoped>
.scale-enter-active, .scale-leave-active {
  transition: all 0.46s cubic-bezier(0.22, 1, 0.36, 1);
}
.scale-enter-from, .scale-leave-to {
  transform: scale(0.95);
  opacity: 0;
}

</style>
