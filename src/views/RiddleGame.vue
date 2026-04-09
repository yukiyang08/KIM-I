<template>
  <div class="h-full w-full flex flex-col font-['Outfit','Noto_Sans_TC'] overflow-y-auto overflow-x-hidden select-none"
       style="background: #0D0407;">

    <!-- Stage curtain top strip -->
    <div class="shrink-0 h-5 flex justify-around items-center px-2 z-20"
         style="background: linear-gradient(to bottom, #7A1010, #5A0808); border-bottom: 4px solid #C8961E;">
      <div v-for="i in 14" :key="i" class="h-4 w-5 rounded-b-full opacity-60" style="background:#4A0606;"></div>
    </div>

    <!-- Header -->
    <header class="shrink-0 px-10 py-5 flex justify-between items-center border-b z-10 relative"
            style="background: rgba(8,2,4,0.97); border-color: rgba(255,255,255,0.05);">
      <div>
        <button @click="router.push('/')"
                class="flex items-center gap-2 mb-3 text-lg font-bold transition-colors"
                style="color: rgba(200,150,30,0.45);"
                @mouseover="e => e.currentTarget.style.color='#C8961E'"
                @mouseleave="e => e.currentTarget.style.color='rgba(200,150,30,0.45)'">
          ← 離開遊戲
        </button>
        <h1 class="text-5xl font-black" style="color:#C8961E; text-shadow:0 0 40px rgba(200,150,30,0.3);">
          <span style="color:#E04040;">🎶</span> 老歌猜謎
        </h1>
        <p class="text-xl mt-1.5 italic font-medium" style="color:rgba(255,255,255,0.3);">
          聽歌詞，猜出這首懷舊老歌的歌名！
        </p>
      </div>
      <div class="text-right">
        <div class="text-base font-bold uppercase tracking-widest mb-1" style="color:rgba(255,255,255,0.2);">得分</div>
        <div class="text-6xl font-black text-white tabular-nums">{{ score }}</div>
      </div>
    </header>

    <!-- Main -->
    <main class="flex-1 relative overflow-y-auto overflow-x-hidden flex flex-col items-center justify-center px-10 py-6">

      <!-- ── IDLE ── -->
      <div v-if="gameState === 'idle'"
           class="flex flex-col items-center text-center gap-8">
        <div class="text-[110px] drop-shadow-2xl">🎙️</div>
        <h2 class="text-6xl font-black text-white tracking-widest" style="text-shadow:0 4px 20px rgba(0,0,0,0.9);">
          老歌猜謎
        </h2>
        <p class="text-2xl max-w-[580px] leading-relaxed" style="color:rgba(255,255,255,0.45);">
          聆聽 10 道懷舊台語老歌歌詞提示<br>猜出正確的歌名得 100 分，猜錯扣 20 分
        </p>
        <button @click="startGame"
          class="mt-4 px-20 py-8 rounded-full text-black text-4xl font-black active:scale-95 transition-transform"
          style="background:linear-gradient(135deg,#D4A020,#8B6000);box-shadow:0 20px 60px rgba(200,150,30,0.35);">
          開始猜謎
        </button>
      </div>

      <!-- ── PLAYING ── -->
      <div v-if="gameState === 'playing'" class="w-full max-w-[860px] flex flex-col gap-6">

        <!-- Progress bar -->
        <div class="flex items-center gap-4">
          <div class="flex-1 h-2 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.08);">
            <div class="h-full rounded-full transition-all duration-500" style="background:#C8961E;"
                 :style="{ width: ((currentIdx) / QUESTIONS.length * 100) + '%' }"></div>
          </div>
          <span class="text-xl font-bold tabular-nums shrink-0" style="color:rgba(255,255,255,0.4);">
            {{ currentIdx + 1 }} / {{ QUESTIONS.length }}
          </span>
        </div>

        <!-- Question card (parchment style) -->
        <div class="rounded-[32px] p-10 text-center relative overflow-hidden"
             style="background:linear-gradient(160deg,#FDF6E3,#F5E6C0);box-shadow:0 30px 80px rgba(0,0,0,0.7);border:6px solid #3D2310;">
          <!-- Aged texture lines -->
          <div class="absolute inset-0 opacity-[0.04] pointer-events-none"
               style="background:repeating-linear-gradient(0deg,#000 0 1px,transparent 1px 28px);"></div>

          <div class="text-5xl mb-6">🎵</div>
          <p class="text-3xl font-bold leading-relaxed text-gray-700 tracking-wide mb-4">
            {{ q.hint }}
          </p>
          <p class="text-lg font-semibold tracking-widest uppercase" style="color:rgba(0,0,0,0.3);">
            — 猜猜是哪首歌？ —
          </p>
        </div>

        <!-- 4 Option buttons -->
        <div class="grid grid-cols-2 gap-4">
          <button
            v-for="opt in q.options" :key="opt"
            class="rounded-[24px] py-6 px-8 text-3xl font-black text-left transition-all active:scale-[0.97] relative overflow-hidden"
            :style="optionStyle(opt)"
            :disabled="answered"
            @click="guess(opt)">
            <span class="relative z-10">{{ opt }}</span>
            <!-- Correct / wrong indicator -->
            <span v-if="answered && opt === q.answer" class="absolute right-6 top-1/2 -translate-y-1/2 text-4xl z-10">✅</span>
            <span v-if="answered && wrongGuesses.includes(opt)" class="absolute right-6 top-1/2 -translate-y-1/2 text-4xl z-10">❌</span>
          </button>
        </div>

        <!-- Year / Composer hint (after answer) -->
        <transition name="info-fade">
          <div v-if="answered" class="text-center text-xl font-medium" style="color:rgba(255,255,255,0.4);">
            {{ q.year }} 年 ‧ {{ q.composer }}
          </div>
        </transition>
      </div>

      <!-- ── FINISHED ── -->
      <div v-if="gameState === 'finished'"
           class="flex flex-col items-center text-center gap-6">
        <div class="text-[100px] drop-shadow-2xl">🏆</div>
        <h2 class="text-7xl font-black tracking-widest" style="color:#C8961E;text-shadow:0 0 40px rgba(200,150,30,0.4);">
          猜謎結束！
        </h2>
        <div class="flex gap-12 text-center my-2">
          <div>
            <div class="text-5xl font-black text-green-400">{{ result.correct }}</div>
            <div class="text-xl mt-1" style="color:rgba(255,255,255,0.4);">答對</div>
          </div>
          <div>
            <div class="text-5xl font-black text-red-400">{{ result.wrong }}</div>
            <div class="text-xl mt-1" style="color:rgba(255,255,255,0.4);">答錯</div>
          </div>
          <div>
            <div class="text-5xl font-black text-white">{{ score }}</div>
            <div class="text-xl mt-1" style="color:rgba(255,255,255,0.4);">總分</div>
          </div>
        </div>
        <div class="flex gap-6 mt-4">
          <button @click="startGame"
            class="px-14 py-6 rounded-full text-black text-3xl font-black active:scale-95 transition-transform"
            style="background:linear-gradient(135deg,#D4A020,#8B6000);">
            再猜一次
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
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'

const router = useRouter()
const gameStore = useGameStore()

// ── Question bank ─────────────────────────────────────────────
const ALL_QUESTIONS = [
  {
    hint: '「獨夜無伴守燈下，清風對面吹…」',
    answer: '望春風',
    options: ['望春風', '月夜愁', '雨夜花', '四季紅'],
    year: '1933', composer: '鄧雨賢',
  },
  {
    hint: '「秋風夜雨若絲，長相思入夢境…」',
    answer: '月夜愁',
    options: ['月夜愁', '白牡丹', '補破網', '望春風'],
    year: '1933', composer: '鄧雨賢',
  },
  {
    hint: '「雨夜花，雨夜花，受風雨吹落地…」',
    answer: '雨夜花',
    options: ['雨夜花', '夜來香', '月夜愁', '四季紅'],
    year: '1934', composer: '鄧雨賢',
  },
  {
    hint: '「燒肉粽！燒肉粽！欲買燒肉粽…」',
    answer: '燒肉粽',
    options: ['燒肉粽', '天黑黑', '農村曲', '四季紅'],
    year: '1949', composer: '張邱東松',
  },
  {
    hint: '「天黑黑，欲落雨，阿公仔舉鋤頭欲掘芋…」',
    answer: '天黑黑',
    options: ['天黑黑', '農村曲', '雨夜花', '月夜愁'],
    year: '傳統童謠', composer: '民謠',
  },
  {
    hint: '「四季紅花四季春，是誰人的少年郎…」',
    answer: '四季紅',
    options: ['四季紅', '望春風', '月夜愁', '白牡丹'],
    year: '1938', composer: '李臨秋',
  },
  {
    hint: '「補破網，看著網，目眶紅，誰人知阮苦痛…」',
    answer: '補破網',
    options: ['補破網', '望春風', '燒肉粽', '四季紅'],
    year: '1948', composer: '李臨秋',
  },
  {
    hint: '「夜來香，我為你相思著迷，夜來香…」',
    answer: '夜來香',
    options: ['夜來香', '月夜愁', '雨夜花', '望春風'],
    year: '1944', composer: '黎錦光',
  },
  {
    hint: '「黃昏的故鄉啊，山頂嗎的雲飄去飄去…」',
    answer: '黃昏的故鄉',
    options: ['黃昏的故鄉', '望春風', '月夜愁', '安平追想曲'],
    year: '1957', composer: '慎芝',
  },
  {
    hint: '「安平追想曲，思念的港都，波浪拍岸聲…」',
    answer: '安平追想曲',
    options: ['安平追想曲', '黃昏的故鄉', '望春風', '補破網'],
    year: '1951', composer: '許丙丁',
  },
  {
    hint: '「白牡丹，白牡丹，半開的白牡丹…」',
    answer: '白牡丹',
    options: ['白牡丹', '雨夜花', '望春風', '月夜愁'],
    year: '1936', composer: '周添旺',
  },
  {
    hint: '「農村曲，唱出咱農村的美麗風景…」',
    answer: '農村曲',
    options: ['農村曲', '燒肉粽', '四季紅', '天黑黑'],
    year: '1933', composer: '陳達儒',
  },
]

const QUESTIONS = ref([])

// ── Game state ────────────────────────────────────────────────
const gameState = ref('idle')
const currentIdx = ref(0)
const score = ref(0)
const answered = ref(false)
const wrongGuesses = ref([])
const questionPts = ref(100)
const result = reactive({ correct: 0, wrong: 0 })

const q = computed(() => QUESTIONS.value[currentIdx.value] ?? ALL_QUESTIONS[0])

// ── Styling for option buttons ────────────────────────────────
const optionStyle = (opt) => {
  const base = {
    border: '2px solid transparent',
    color: 'white',
    background: 'rgba(255,255,255,0.07)',
  }
  if (!answered.value) return base
  if (opt === q.value.answer) {
    return { ...base, background: 'rgba(74,222,128,0.2)', border: '2px solid #4ADE80', color: '#4ADE80' }
  }
  if (wrongGuesses.value.includes(opt)) {
    return { ...base, background: 'rgba(248,113,113,0.15)', border: '2px solid #F87171', color: '#F87171' }
  }
  return { ...base, opacity: '0.4' }
}

// ── Logic ─────────────────────────────────────────────────────
const startGame = () => {
  // Shuffle and pick 10 questions
  QUESTIONS.value = [...ALL_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10)
  currentIdx.value = 0
  score.value = 0
  answered.value = false
  wrongGuesses.value = []
  questionPts.value = 100
  result.correct = result.wrong = 0
  gameState.value = 'playing'
}

const guess = (opt) => {
  if (answered.value) return

  if (opt === q.value.answer) {
    score.value += questionPts.value
    result.correct++
    answered.value = true
    setTimeout(nextQuestion, 1600)
  } else {
    wrongGuesses.value.push(opt)
    questionPts.value = Math.max(20, questionPts.value - 20)
    result.wrong++
    // Slight shake feedback via scale + immediate reset (CSS handles it)
  }
}

const nextQuestion = () => {
  if (currentIdx.value + 1 >= QUESTIONS.value.length) {
    endGame()
    return
  }
  currentIdx.value++
  answered.value = false
  wrongGuesses.value = []
  questionPts.value = 100
}

const endGame = () => {
  gameStore.addSession('riddle', Math.round(score.value / QUESTIONS.value.length), {
    correct: result.correct,
    wrong: result.wrong,
  })
  gameState.value = 'finished'
}
</script>

<style scoped>
.info-fade-enter-active { transition: opacity 0.5s ease, transform 0.5s ease; }
.info-fade-enter-from   { opacity: 0; transform: translateY(8px); }
</style>
