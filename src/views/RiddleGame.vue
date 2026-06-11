<template>
  <div class="h-full w-full flex flex-col font-['Noto_Serif_TC','Noto_Sans_TC'] overflow-y-auto overflow-x-hidden select-none"
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
        <h1 class="text-6xl font-black" style="color:#C8961E; text-shadow:0 0 40px rgba(200,150,30,0.3);">
          <span style="color:#E04040;">🎶</span> 老歌猜謎
        </h1>
        <p class="text-2xl mt-2 italic font-semibold" style="color:rgba(255,255,255,0.38);">
          聽歌詞，猜出這首懷舊老歌的歌名！
        </p>
      </div>
      <div class="text-right">
        <div class="text-lg font-bold uppercase tracking-widest mb-1" style="color:rgba(255,255,255,0.24);">得分</div>
        <div class="text-7xl font-black text-white tabular-nums">{{ score }}</div>
      </div>
    </header>

    <!-- Main -->
    <main class="flex-1 relative overflow-y-auto overflow-x-hidden flex flex-col items-center justify-center px-10 py-6">

      <!-- ── IDLE ── -->
      <div v-if="gameState === 'idle'"
           class="flex flex-col items-center text-center gap-8">
        <div class="text-[110px] drop-shadow-2xl">🎙️</div>
        <h2 class="text-7xl font-black text-white tracking-widest" style="text-shadow:0 4px 20px rgba(0,0,0,0.9);">
          老歌猜謎
        </h2>
        <p class="text-3xl max-w-[680px] leading-relaxed" style="color:rgba(255,255,255,0.5);">
          從 {{ ALL_QUESTIONS.length }} 首懷舊老歌中隨機出 10 題<br>猜出正確的歌名得 100 分，猜錯扣 20 分
        </p>
        <div class="flex gap-4 text-xl" style="color:rgba(255,255,255,0.3);">
          <span>🎵 台語名曲</span>
          <span>🌾 傳統民謠</span>
          <span>🌙 早期國語</span>
        </div>
        <button @click="startGame"
          class="mt-4 px-20 py-8 rounded-full text-black text-4xl font-black active:scale-95 transition-transform"
          style="background:linear-gradient(135deg,#D4A020,#8B6000);box-shadow:0 20px 60px rgba(200,150,30,0.35);">
          開始猜謎
        </button>
      </div>

      <!-- ── PLAYING ── -->
      <div v-if="gameState === 'playing'" class="w-full max-w-[960px] flex flex-col gap-6">

        <!-- Progress bar -->
        <div class="flex items-center gap-4">
          <div class="flex-1 h-2 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.08);">
            <div class="h-full rounded-full transition-all duration-500" style="background:#C8961E;"
                 :style="{ width: ((currentIdx) / QUESTIONS.length * 100) + '%' }"></div>
          </div>
          <span class="text-2xl font-bold tabular-nums shrink-0" style="color:rgba(255,255,255,0.45);">
            {{ currentIdx + 1 }} / {{ QUESTIONS.length }}
          </span>
        </div>

        <!-- Question card (parchment style) -->
           <div class="rounded-[32px] p-12 text-center relative overflow-hidden"
             style="background:linear-gradient(160deg,#FAEFCF,#F1DEAE);box-shadow:0 30px 80px rgba(0,0,0,0.7);border:7px solid #4A2A12;">
          <!-- Aged texture lines -->
          <div class="absolute inset-0 opacity-[0.04] pointer-events-none"
               style="background:repeating-linear-gradient(0deg,#000 0 1px,transparent 1px 28px);"></div>

          <div class="text-6xl mb-7">🎵</div>
          <p class="text-4xl font-black leading-relaxed tracking-wide mb-5" style="color:#4A2A12;">
            {{ q.hint }}
          </p>
          <p class="text-xl font-bold tracking-widest uppercase" style="color:rgba(60,35,16,0.5);">
            — 猜猜是哪首歌？ —
          </p>
        </div>

        <!-- 4 Option buttons -->
        <div class="grid grid-cols-2 gap-4">
          <button
            v-for="opt in q.options" :key="opt"
            class="rounded-[24px] py-6 px-8 text-4xl font-black text-left transition-all active:scale-[0.97] relative overflow-hidden vintage-option"
            :style="optionStyle(opt)"
            :disabled="answered"
            @click="guess(opt)">
            <span class="relative z-10">{{ opt }}</span>
            <!-- Correct / wrong indicator -->
            <span v-if="answered && opt === q.answer" class="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-black z-10 px-3 py-1 rounded-full"
              style="color:#3D2310;background:rgba(245,214,126,0.9);border:1px solid rgba(120,78,24,0.5);">正解</span>
            <span v-if="answered && wrongGuesses.includes(opt)" class="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-black z-10 px-3 py-1 rounded-full"
              style="color:#FFF2E9;background:rgba(157,62,46,0.85);border:1px solid rgba(255,181,160,0.35);">再想想</span>
          </button>
        </div>

        <!-- Year / Composer hint (after answer) -->
        <transition name="info-fade">
          <div v-if="answered" class="text-center text-2xl font-semibold" style="color:rgba(255,255,255,0.48);">
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
  // ── 鄧雨賢四月望雨 ──
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
    hint: '「春宵月朦朧，花蕊吐清芳，月色映花影…」',
    answer: '春宵吟',
    options: ['春宵吟', '望春風', '月夜愁', '河邊春夢'],
    year: '1935', composer: '鄧雨賢',
  },
  // ── 李臨秋 ──
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
  // ── 周添旺 ──
  {
    hint: '「白牡丹，白牡丹，半開的白牡丹…」',
    answer: '白牡丹',
    options: ['白牡丹', '雨夜花', '望春風', '月夜愁'],
    year: '1936', composer: '周添旺',
  },
  {
    hint: '「河邊春夢，夢中思君情難斷，水流東去君何在…」',
    answer: '河邊春夢',
    options: ['河邊春夢', '春宵吟', '月夜愁', '望春風'],
    year: '1940', composer: '周添旺',
  },
  // ── 陳達儒 ──
  {
    hint: '「農村曲，唱出咱農村的美麗風景…」',
    answer: '農村曲',
    options: ['農村曲', '燒肉粽', '四季紅', '天黑黑'],
    year: '1933', composer: '陳達儒',
  },
  {
    hint: '「青春嶺，青春嶺，青春真珍貴，莫等花謝才知影…」',
    answer: '青春嶺',
    options: ['青春嶺', '四季紅', '望春風', '農村曲'],
    year: '1939', composer: '陳達儒',
  },
  // ── 許丙丁 ──
  {
    hint: '「安平追想曲，思念的港都，波浪拍岸聲…」',
    answer: '安平追想曲',
    options: ['安平追想曲', '黃昏的故鄉', '望春風', '補破網'],
    year: '1951', composer: '許丙丁',
  },
  {
    hint: '「賣青蚵，阿嫂仔叫賣聲，透早就出門，滿街穿去走…」',
    answer: '青蚵仔嫂',
    options: ['青蚵仔嫂', '燒肉粽', '農村曲', '孤女的願望'],
    year: '1956', composer: '許丙丁',
  },
  // ── 其他台語名曲 ──
  {
    hint: '「燒肉粽！燒肉粽！欲買燒肉粽…」',
    answer: '燒肉粽',
    options: ['燒肉粽', '天黑黑', '農村曲', '四季紅'],
    year: '1949', composer: '張邱東松',
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
    hint: '「人生親像桃花枝，有時開花有時死，有時落土隨流水…」',
    answer: '桃花泣血記',
    options: ['桃花泣血記', '雨夜花', '白牡丹', '四季紅'],
    year: '1932', composer: '陳君玉',
  },
  {
    hint: '「港都夜雨，雨水淋濕衫，思念故鄉親人心悲酸…」',
    answer: '港都夜雨',
    options: ['港都夜雨', '黃昏的故鄉', '安平追想曲', '舊情綿綿'],
    year: '1952', composer: '呂傳梓',
  },
  {
    hint: '「坐著車，行過彎彎的山路，流浪到淡水，欲看日頭落海…」',
    answer: '流浪到淡水',
    options: ['流浪到淡水', '黃昏的故鄉', '港都夜雨', '舊情綿綿'],
    year: '1957', composer: '洪一峰',
  },
  {
    hint: '「愛你情難了斷，舊情綿綿，再會吧再會吧…」',
    answer: '舊情綿綿',
    options: ['舊情綿綿', '流浪到淡水', '補破網', '港都夜雨'],
    year: '1958', composer: '洪一峰',
  },
  {
    hint: '「我是孤女，無人疼痛，也無人來了解，心內的苦…」',
    answer: '孤女的願望',
    options: ['孤女的願望', '補破網', '港都夜雨', '安平追想曲'],
    year: '1960', composer: '葉俊麟',
  },
  {
    hint: '「媽媽請你也保重，孩兒在外拼生活，身體要健康…」',
    answer: '媽媽請你也保重',
    options: ['媽媽請你也保重', '孤女的願望', '黃昏的故鄉', '流浪到淡水'],
    year: '1964', composer: '文夏',
  },
  {
    hint: '「夜霧罩南都，燈光閃閃，往事如夢，親像霧中花…」',
    answer: '南都夜曲',
    options: ['南都夜曲', '港都夜雨', '黃昏的故鄉', '舊情綿綿'],
    year: '1958', composer: '文夏',
  },
  // ── 傳統民謠 ──
  {
    hint: '「天黑黑，欲落雨，阿公仔舉鋤頭欲掘芋…」',
    answer: '天黑黑',
    options: ['天黑黑', '農村曲', '雨夜花', '月夜愁'],
    year: '傳統童謠', composer: '民謠',
  },
  {
    hint: '「西北雨直直落，鯽仔魚欲娶某，鮕鮐兄弄鑼鼓…」',
    answer: '西北雨直直落',
    options: ['西北雨直直落', '六月茉莉', '天黑黑', '丟丟銅仔'],
    year: '傳統童謠', composer: '民謠',
  },
  {
    hint: '「丟丟銅仔，伊都阿末仔伊都濱，火車行到伊都丟仔擱丟…」',
    answer: '丟丟銅仔',
    options: ['丟丟銅仔', '西北雨直直落', '一隻鳥仔哮救救', '天黑黑'],
    year: '傳統民謠', composer: '民謠',
  },
  {
    hint: '「六月茉莉真正芳，插在頭髻真正香，採一枝，插一枝…」',
    answer: '六月茉莉',
    options: ['六月茉莉', '四季紅', '白牡丹', '雨夜花'],
    year: '傳統民謠', composer: '民謠',
  },
  {
    hint: '「草螟仔弄雞公，雞公咯咯啼，頭家娘請阮食點心…」',
    answer: '草螟弄雞公',
    options: ['草螟弄雞公', '天黑黑', '西北雨直直落', '丟丟銅仔'],
    year: '傳統童謠', composer: '民謠',
  },
  {
    hint: '「一隻鳥仔哮救救，找無巢，冬天風雨寒…」',
    answer: '一隻鳥仔哮救救',
    options: ['一隻鳥仔哮救救', '草螟弄雞公', '丟丟銅仔', '天黑黑'],
    year: '傳統童謠', composer: '民謠',
  },
  {
    hint: '「牛犁歌，唱出農家的好景致，牛兒辛苦耕田地…」',
    answer: '牛犁歌',
    options: ['牛犁歌', '農村曲', '草螟弄雞公', '六月茉莉'],
    year: '傳統民謠', composer: '民謠',
  },
  // ── 早期國語名曲 ──
  {
    hint: '「好花不常開，好景不常在，愁堆解笑眉，淚灑相思帶…」',
    answer: '何日君再來',
    options: ['何日君再來', '夜來香', '月夜愁', '夜上海'],
    year: '1938', composer: '劉雪庵',
  },
  {
    hint: '「夜上海，夜上海，你是個不夜城，燈紅酒綠，夜未央…」',
    answer: '夜上海',
    options: ['夜上海', '何日君再來', '夜來香', '玫瑰玫瑰我愛你'],
    year: '1947', composer: '陳歌辛',
  },
  {
    hint: '「玫瑰玫瑰最嬌美，玫瑰玫瑰最艷麗，長在枝頭放光輝…」',
    answer: '玫瑰玫瑰我愛你',
    options: ['玫瑰玫瑰我愛你', '夜來香', '夜上海', '何日君再來'],
    year: '1940', composer: '陳歌辛',
  },
  {
    hint: '「每條大街小巷，每個人的嘴裡，見面第一句話，就是恭喜恭喜…」',
    answer: '恭喜恭喜',
    options: ['恭喜恭喜', '何日君再來', '玫瑰玫瑰我愛你', '夜上海'],
    year: '1946', composer: '陳歌辛',
  },
  {
    hint: '「我有一段情，唱給你聽，你莫笑我癡，你莫笑我迷…」',
    answer: '一段情',
    options: ['一段情', '舊情綿綿', '何日君再來', '補破網'],
    year: '1966', composer: '葉俊麟',
  },
  {
    hint: '「送你送到大門外，有話兒還沒有說完，怎麼說再見…」',
    answer: '送你一把泥土',
    options: ['送你一把泥土', '何日君再來', '黃昏的故鄉', '媽媽請你也保重'],
    year: '1972', composer: '古月',
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
    border: '2px solid rgba(197,148,73,0.45)',
    color: '#F8E9C6',
    background: 'linear-gradient(180deg, rgba(58,29,12,0.9), rgba(39,20,9,0.94))',
  }
  if (!answered.value) return base
  if (opt === q.value.answer) {
    return { ...base, background: 'linear-gradient(180deg, rgba(240,203,112,0.95), rgba(203,147,43,0.9))', border: '2px solid #F8E0A0', color: '#3D2310' }
  }
  if (wrongGuesses.value.includes(opt)) {
    return { ...base, background: 'linear-gradient(180deg, rgba(116,38,27,0.9), rgba(88,24,17,0.92))', border: '2px solid #D48775', color: '#FFD9CD' }
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
    wrongGuesses.value = [opt]
    score.value = Math.max(0, score.value - 20)
    result.wrong++
    answered.value = true
    setTimeout(nextQuestion, 1600)
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

.vintage-option {
  box-shadow: inset 0 0 0 1px rgba(255, 226, 164, 0.12), 0 8px 18px rgba(0, 0, 0, 0.35);
}
</style>
