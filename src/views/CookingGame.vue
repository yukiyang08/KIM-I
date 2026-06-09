<template>
  <div class="h-full w-full flex flex-col font-['Outfit','Noto_Sans_TC'] overflow-y-auto overflow-x-hidden text-white select-none"
       style="background: radial-gradient(ellipse at top, #221A0A 0%, #130E06 50%, #0A0804 100%);">

    <!-- Header -->
    <header class="shrink-0 px-4 sm:px-8 py-3 sm:py-5 flex justify-between items-center border-b z-10"
            style="border-color: rgba(255,255,255,0.06); background: rgba(14,10,4,0.88); backdrop-filter: blur(8px);">
      <div>
        <button @click="router.push('/')"
                class="flex items-center gap-2 text-sm sm:text-base font-bold mb-1 sm:mb-2 transition-colors"
                style="color: rgba(255,255,255,0.38);"
                @mouseover="e => e.currentTarget.style.color='#F0A500'"
                @mouseleave="e => e.currentTarget.style.color='rgba(255,255,255,0.38)'">
          ← 離開遊戲
        </button>
        <h1 class="font-black tracking-wide" style="font-size: clamp(1.4rem, 5vw, 2.8rem); color: #F0A500;">
          <span style="color:#FF4D4D;">●</span> 阿嬤的家常菜
        </h1>
      </div>
      <div class="text-center shrink-0 min-w-[80px]">
        <div class="text-xs sm:text-sm font-bold uppercase tracking-widest" style="color: rgba(255,255,255,0.28);">得分</div>
        <div class="font-black tabular-nums" style="font-size: clamp(2rem, 6vw, 3.5rem);">{{ score }}</div>
        <transition name="combo-pop">
          <div v-if="combo > 1" key="combo" class="text-xs sm:text-sm font-black" style="color: #F0A500;">
            {{ combo }}x 連答！
          </div>
        </transition>
      </div>
    </header>

    <main class="flex-1 relative overflow-hidden">

      <!-- ── IDLE ── -->
      <div v-if="gameState === 'idle'"
           class="absolute inset-0 flex flex-col items-center justify-center p-6 overflow-y-auto"
           style="background: radial-gradient(ellipse at center, rgba(40,18,6,0.92), rgba(8,4,2,0.99));">
        <div class="mb-5" style="font-size: clamp(4rem, 16vw, 7rem);">🍳</div>
        <h2 class="font-black text-center mb-3" style="font-size: clamp(1.8rem, 7vw, 3.2rem); color: #F0A500;">
          懷舊家常菜
        </h2>
        <p class="text-center mb-2 max-w-sm" style="font-size: clamp(0.95rem, 2.8vw, 1.25rem); color: rgba(255,255,255,0.5);">
          看清楚食譜步驟，從 4 個選項中選出正確的下一步！
        </p>
        <p class="text-center mb-8" style="font-size: clamp(0.8rem, 2.2vw, 1rem); color: rgba(240,165,0,0.55);">
          共 {{ RECIPES.length }} 道菜 · 每步限時 {{ STEP_TIME_MS / 1000 }} 秒 · 快答有時間加分
        </p>
        <div class="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10 max-w-md">
          <div v-for="r in RECIPES" :key="r.id"
               class="flex items-center gap-2 px-4 py-2 rounded-xl"
               style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);">
            <span style="font-size: 1.5rem;">{{ r.icon }}</span>
            <span class="font-bold text-sm sm:text-base">{{ r.name }}</span>
          </div>
        </div>
        <button @click="startGame"
          class="px-10 sm:px-16 py-5 sm:py-7 rounded-full text-black font-black active:scale-95 transition-transform"
          style="font-size: clamp(1.2rem, 3.5vw, 1.8rem); background: linear-gradient(135deg, #D4A020, #8B6000); box-shadow: 0 16px 50px rgba(200,130,0,0.4);">
          開始煮菜
        </button>
      </div>

      <!-- ── PLAYING ── -->
      <div v-if="gameState === 'playing'" class="absolute inset-0 flex flex-col overflow-y-auto">

        <!-- Timer bar -->
        <div class="shrink-0 h-2" style="background: rgba(255,255,255,0.06);">
          <div class="h-full transition-none"
               :style="{ width: timerBarWidth, background: timerPct > 0.4 ? '#4ADE80' : timerPct > 0.2 ? '#F0A500' : '#FF4D4D' }"></div>
        </div>

        <!-- Recipe + step progress -->
        <div class="shrink-0 px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-4"
             style="background: rgba(0,0,0,0.35); border-bottom: 1px solid rgba(255,255,255,0.05);">
          <div class="flex items-center gap-2">
            <span style="font-size: clamp(1.2rem, 4vw, 1.8rem);">{{ currentRecipe.icon }}</span>
            <span class="font-black" style="font-size: clamp(0.9rem, 2.8vw, 1.3rem); color: #F0A500;">{{ currentRecipe.name }}</span>
          </div>
          <div class="flex items-center gap-1">
            <div v-for="(s, i) in currentRecipe.steps" :key="i"
                 class="rounded-full transition-all duration-300"
                 :style="{
                   width: i < currentStepIdx ? '18px' : '10px',
                   height: '7px',
                   background: i < currentStepIdx ? '#4ADE80' : i === currentStepIdx ? '#F0A500' : 'rgba(255,255,255,0.15)'
                 }"></div>
            <span class="ml-2 text-xs sm:text-sm font-bold tabular-nums" style="color: rgba(255,255,255,0.38);">
              {{ currentStepIdx + 1 }}/{{ currentRecipe.steps.length }}
            </span>
          </div>
          <div class="text-right shrink-0">
            <div class="text-xs font-bold" style="color: rgba(255,255,255,0.3);">道菜</div>
            <div class="font-black text-sm sm:text-lg tabular-nums">{{ recipeIdx + 1 }}/{{ RECIPES.length }}</div>
          </div>
        </div>

        <!-- Main game content -->
        <div class="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-4 gap-4 sm:gap-5">

          <!-- Pot visual -->
          <div class="relative shrink-0" style="width: min(240px, 55vw); height: min(175px, 40vw);">
            <div ref="potRef" class="w-full h-full relative"
                 style="border-radius: 35%; background: linear-gradient(160deg, #5A5A5A, #2A2A2A);
                        box-shadow: 0 16px 40px rgba(0,0,0,0.8), inset 0 -6px 16px rgba(0,0,0,0.5);
                        border: 6px solid #404040;">
              <div class="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full"
                   style="width: 38%; height: 16px; background: #505050; border-bottom: 2px solid #333;"></div>
              <div class="absolute inset-x-5 inset-y-3 flex flex-wrap items-center justify-center gap-1 overflow-hidden"
                   style="border-radius: 28%; background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.04);">
                <span v-if="potContents.length === 0" class="text-xs font-bold" style="color: rgba(255,255,255,0.2);">尚未下鍋</span>
                <span v-for="(item, i) in potContents" :key="i" style="font-size: clamp(1rem, 3.5vw, 1.5rem);">{{ item }}</span>
              </div>
            </div>
            <div v-show="isCooking" class="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none">
              <div class="w-2 h-10 bg-white/15 blur-sm steam-anim" style="animation-delay:0.1s"></div>
              <div class="w-2 h-12 bg-white/10 blur-sm steam-anim" style="animation-delay:0.3s"></div>
              <div class="w-2 h-10 bg-white/15 blur-sm steam-anim" style="animation-delay:0.2s"></div>
            </div>
            <div v-show="potContents.length >= 2" class="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
              <div class="w-4 h-10 bg-orange-600 blur-md flame-anim opacity-50"></div>
              <div class="w-5 h-12 bg-red-600 blur-md flame-anim opacity-40" style="animation-delay:0.2s"></div>
              <div class="w-4 h-10 bg-orange-600 blur-md flame-anim opacity-50" style="animation-delay:0.4s"></div>
            </div>
          </div>

          <!-- Question prompt -->
          <div class="text-center">
            <p class="font-bold mb-1" style="font-size: clamp(0.8rem, 2.2vw, 1rem); color: rgba(255,255,255,0.4);">
              第 {{ currentStepIdx + 1 }} 步
            </p>
            <p class="font-black" style="font-size: clamp(1.1rem, 3.5vw, 1.6rem);">
              接下來應該做什麼？
            </p>
          </div>

          <!-- 4 choices -->
          <div class="w-full max-w-xl grid grid-cols-2 gap-2 sm:gap-3">
            <button v-for="choice in currentChoices" :key="choice.id"
                    @click="onChoose(choice)"
                    :disabled="answerState !== null"
                    class="rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-1 sm:gap-2 transition-all active:scale-95 disabled:cursor-default"
                    :style="choiceStyle(choice)">
              <span style="font-size: clamp(1.8rem, 6vw, 3rem);">{{ choice.icon }}</span>
              <span class="font-black text-center leading-tight" style="font-size: clamp(0.85rem, 2.5vw, 1.1rem);">{{ choice.action }}</span>
              <span class="font-medium text-center leading-tight opacity-60" style="font-size: clamp(0.65rem, 1.8vw, 0.85rem);">{{ choice.desc }}</span>
            </button>
          </div>

          <!-- Answer feedback -->
          <transition name="result-pop">
            <div v-if="answerState" key="feedback"
                 class="font-black" style="font-size: clamp(1.3rem, 4vw, 1.8rem);"
                 :style="{ color: answerState === 'correct' ? '#4ADE80' : answerState === 'timeout' ? '#F0A500' : '#FF6B6B' }">
              {{ answerState === 'correct' ? '答對了！' : answerState === 'timeout' ? '時間到！' : '不對喔！' }}
            </div>
          </transition>

        </div>
      </div>

      <!-- ── BETWEEN RECIPES ── -->
      <div v-if="gameState === 'between'"
           class="absolute inset-0 flex flex-col items-center justify-center p-6"
           style="background: rgba(5,3,1,0.92); backdrop-filter: blur(6px);">
        <div class="mb-4" style="font-size: clamp(4rem, 16vw, 7rem);">{{ completedRecipe?.icon }}</div>
        <h2 class="font-black mb-2 text-center" style="font-size: clamp(1.6rem, 6vw, 2.8rem); color: #F0A500;">
          {{ completedRecipe?.name }}完成！
        </h2>
        <p class="mb-2 text-center" style="font-size: clamp(0.9rem, 2.8vw, 1.2rem); color: rgba(255,255,255,0.45);">
          下一道菜
        </p>
        <p class="mb-8 font-black text-center" style="font-size: clamp(1.2rem, 4vw, 1.8rem);">
          {{ RECIPES[recipeIdx]?.icon }} {{ RECIPES[recipeIdx]?.name }}
        </p>
        <button @click="nextRecipe"
          class="px-10 py-5 rounded-full text-black font-black active:scale-95 transition-transform"
          style="font-size: clamp(1rem, 3vw, 1.4rem); background: linear-gradient(135deg, #D4A020, #8B6000); box-shadow: 0 12px 40px rgba(200,130,0,0.4);">
          繼續煮菜 →
        </button>
      </div>

      <!-- ── FINISHED ── -->
      <div v-if="gameState === 'finished'"
           class="absolute inset-0 flex flex-col items-center justify-center p-6 overflow-y-auto"
           style="background: rgba(5,3,1,0.9); backdrop-filter: blur(6px);">
        <div class="mb-4" style="font-size: clamp(3.5rem, 14vw, 6rem);">🍽️</div>
        <h2 class="font-black mb-5 text-center" style="font-size: clamp(1.8rem, 6vw, 3.2rem); color: #F0A500;">
          今天的菜煮完啦！
        </h2>
        <div class="grid grid-cols-2 gap-4 sm:gap-8 mb-8 text-center">
          <div>
            <div class="font-black text-green-400" style="font-size: clamp(1.8rem, 5vw, 2.8rem);">{{ totalCorrect }}</div>
            <div class="text-sm sm:text-base mt-1" style="color: rgba(255,255,255,0.35);">答對</div>
          </div>
          <div>
            <div class="font-black text-red-400" style="font-size: clamp(1.8rem, 5vw, 2.8rem);">{{ totalWrong }}</div>
            <div class="text-sm sm:text-base mt-1" style="color: rgba(255,255,255,0.35);">答錯/超時</div>
          </div>
          <div>
            <div class="font-black" style="font-size: clamp(1.8rem, 5vw, 2.8rem); color: #F0A500;">{{ maxCombo }}</div>
            <div class="text-sm sm:text-base mt-1" style="color: rgba(255,255,255,0.35);">最大連答</div>
          </div>
          <div>
            <div class="font-black text-white" style="font-size: clamp(1.8rem, 5vw, 2.8rem);">{{ score }}</div>
            <div class="text-sm sm:text-base mt-1" style="color: rgba(255,255,255,0.35);">總分</div>
          </div>
        </div>
        <div class="flex flex-col gap-3 w-full max-w-sm px-4">
          <button v-if="isDayFlow" @click="continueStory"
            class="py-4 sm:py-5 rounded-full text-black font-black active:scale-95 transition-transform"
            style="font-size: clamp(1rem, 3vw, 1.3rem); background: linear-gradient(135deg, #D4A020, #8B6000);">
            繼續今天的故事 →
          </button>
          <template v-else>
            <button @click="startGame"
              class="py-4 sm:py-5 rounded-full text-black font-black active:scale-95 transition-transform"
              style="font-size: clamp(1rem, 3vw, 1.3rem); background: linear-gradient(135deg, #D4A020, #8B6000);">
              再煮一次
            </button>
            <button @click="router.push('/')"
              class="py-4 sm:py-5 rounded-full font-bold active:scale-95 transition-transform"
              style="font-size: clamp(1rem, 3vw, 1.3rem); background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.14);">
              離開
            </button>
          </template>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import gsap from 'gsap'
import { useGameStore } from '../stores/gameStore'

const router = useRouter()
const route = useRoute()

const isDayFlow = computed(() => route.query.returnTo === 'day')
const continueStory = () => router.push({ name: 'day', query: { scene: route.query.next || 'ending' } })
const gameStore = useGameStore()

const RECIPES = [
  {
    id: 'lu_rou_fan',
    name: '滷肉飯',
    icon: '🍚',
    steps: [
      { id: 'prep',  action: '蒜蔥爆香', icon: '🧄', desc: '蒜頭與蔥段熱油爆香' },
      { id: 'meat',  action: '五花肉下鍋', icon: '🥩', desc: '切塊五花肉炒至上色' },
      { id: 'sauce', action: '加醬油滷煮', icon: '🫙', desc: '醬油、冰糖、水慢火燉' },
      { id: 'serve', action: '盛飯淋肉汁', icon: '🍚', desc: '白飯盛碗，淋上肉燥汁' },
    ],
    distractors: [
      { id: 'x1', action: '加入牛奶', icon: '🥛', desc: '不適合這道菜' },
      { id: 'x2', action: '放入起司', icon: '🧀', desc: '不適合這道菜' },
      { id: 'x3', action: '打散雞蛋', icon: '🥚', desc: '不是這個步驟' },
      { id: 'x4', action: '切水果盤', icon: '🍎', desc: '不是現在的步驟' },
      { id: 'x5', action: '加咖哩粉', icon: '🍛', desc: '不適合這道菜' },
    ],
  },
  {
    id: 'san_bei_ji',
    name: '三杯雞',
    icon: '🍗',
    steps: [
      { id: 'heat',    action: '麻油熱鍋', icon: '🫕', desc: '大火熱鍋，倒入麻油' },
      { id: 'ginger',  action: '薑蒜爆香', icon: '🧅', desc: '老薑片與蒜頭爆出香氣' },
      { id: 'chicken', action: '雞塊炒香', icon: '🍗', desc: '雞塊下鍋炒至表面金黃' },
      { id: 'sauce',   action: '加三杯調料', icon: '🍶', desc: '醬油、米酒、麻油各一杯' },
      { id: 'basil',   action: '九層塔起鍋', icon: '🌿', desc: '關火前加九層塔拌勻' },
    ],
    distractors: [
      { id: 'x1', action: '加番茄醬', icon: '🍅', desc: '不適合這道菜' },
      { id: 'x2', action: '放冰塊', icon: '🧊', desc: '不是這個步驟' },
      { id: 'x3', action: '加麵粉', icon: '🌾', desc: '不適合這道菜' },
      { id: 'x4', action: '倒果汁', icon: '🧃', desc: '不是這個步驟' },
      { id: 'x5', action: '撒胡椒鹽', icon: '🧂', desc: '不是現在的步驟' },
    ],
  },
  {
    id: 'cai_pu_dan',
    name: '菜脯蛋',
    icon: '🍳',
    steps: [
      { id: 'egg',  action: '打散雞蛋', icon: '🥚', desc: '3顆雞蛋打入碗中攪散' },
      { id: 'mix',  action: '加入菜脯', icon: '🥬', desc: '蘿蔔乾切碎拌入蛋液' },
      { id: 'heat', action: '熱鍋加油', icon: '🫕', desc: '平底鍋熱油備用' },
      { id: 'fry',  action: '煎至兩面金黃', icon: '🍳', desc: '倒入蛋液，煎至兩面金黃' },
    ],
    distractors: [
      { id: 'x1', action: '加入奶油', icon: '🧈', desc: '不適合這道菜' },
      { id: 'x2', action: '放入培根', icon: '🥓', desc: '不是這個步驟' },
      { id: 'x3', action: '加糖調味', icon: '🍬', desc: '不適合這道菜' },
      { id: 'x4', action: '加辣椒醬', icon: '🌶️', desc: '不是這個步驟' },
      { id: 'x5', action: '下鍋水煮', icon: '💧', desc: '不是這個步驟' },
    ],
  },
]

const STEP_TIME_MS = 12000

const gameState = ref('idle')
const score = ref(0)
const combo = ref(0)
const maxCombo = ref(0)
const totalCorrect = ref(0)
const totalWrong = ref(0)
const recipeIdx = ref(0)
const currentStepIdx = ref(0)
const potContents = ref([])
const isCooking = ref(false)
const answerState = ref(null)
const chosenId = ref(null)
const currentChoices = ref([])
const completedRecipe = ref(null)
const timeLeft = ref(STEP_TIME_MS)
const potRef = ref(null)

let timerInterval = null

const currentRecipe = computed(() => RECIPES[recipeIdx.value])
const timerPct = computed(() => timeLeft.value / STEP_TIME_MS)
const timerBarWidth = computed(() => (timerPct.value * 100) + '%')

const shuffleArray = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const buildChoices = () => {
  const recipe = currentRecipe.value
  const correct = recipe.steps[currentStepIdx.value]
  const distractors = shuffleArray(recipe.distractors).slice(0, 3)
  currentChoices.value = shuffleArray([correct, ...distractors])
}

const startTimer = () => {
  clearTimer()
  timeLeft.value = STEP_TIME_MS
  timerInterval = setInterval(() => {
    timeLeft.value -= 100
    if (timeLeft.value <= 0) {
      clearTimer()
      handleTimeout()
    }
  }, 100)
}

const clearTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const handleTimeout = () => {
  combo.value = 0
  totalWrong.value++
  answerState.value = 'timeout'
  chosenId.value = null
  setTimeout(() => advanceStep(), 1400)
}

const startGame = () => {
  score.value = 0
  combo.value = 0
  maxCombo.value = 0
  totalCorrect.value = 0
  totalWrong.value = 0
  recipeIdx.value = 0
  currentStepIdx.value = 0
  potContents.value = []
  answerState.value = null
  chosenId.value = null
  completedRecipe.value = null
  gameState.value = 'playing'
  buildChoices()
  startTimer()
}

const onChoose = (choice) => {
  if (answerState.value !== null) return
  clearTimer()
  chosenId.value = choice.id

  const correct = currentRecipe.value.steps[currentStepIdx.value]
  if (choice.id === correct.id) {
    const timeBonus = Math.floor((timeLeft.value / STEP_TIME_MS) * 50)
    combo.value++
    if (combo.value > maxCombo.value) maxCombo.value = combo.value
    const mult = Math.min(3, 1 + Math.floor(combo.value / 3))
    score.value += (100 + timeBonus) * mult
    totalCorrect.value++
    answerState.value = 'correct'
    potContents.value = [...potContents.value, correct.icon]
    isCooking.value = true
    if (potRef.value) gsap.to(potRef.value, { y: -8, duration: 0.08, repeat: 8, yoyo: true })
    setTimeout(() => {
      isCooking.value = false
      advanceStep()
    }, 1000)
  } else {
    combo.value = 0
    totalWrong.value++
    answerState.value = 'wrong'
    if (potRef.value) gsap.to(potRef.value, { x: 12, duration: 0.05, repeat: 6, yoyo: true })
    setTimeout(() => advanceStep(), 1400)
  }
}

const advanceStep = () => {
  answerState.value = null
  chosenId.value = null
  const recipe = currentRecipe.value
  if (currentStepIdx.value + 1 >= recipe.steps.length) {
    completedRecipe.value = recipe
    potContents.value = []
    if (recipeIdx.value + 1 >= RECIPES.length) {
      clearTimer()
      const totalSteps = RECIPES.reduce((sum, r) => sum + r.steps.length, 0)
      gameStore.addSession('cooking', Math.round((totalCorrect.value / totalSteps) * 100), {
        correct: totalCorrect.value,
        wrong: totalWrong.value,
        maxCombo: maxCombo.value,
      })
      gameState.value = 'finished'
    } else {
      recipeIdx.value++
      currentStepIdx.value = 0
      gameState.value = 'between'
    }
  } else {
    currentStepIdx.value++
    buildChoices()
    startTimer()
  }
}

const nextRecipe = () => {
  gameState.value = 'playing'
  buildChoices()
  startTimer()
}

const choiceStyle = (choice) => {
  const correct = currentRecipe.value.steps[currentStepIdx.value]
  const isCorrect = choice.id === correct.id
  const isChosen = choice.id === chosenId.value

  if (answerState.value === null) {
    return 'background: rgba(255,255,255,0.06); border: 2px solid rgba(255,255,255,0.1); color: white;'
  }
  if (isCorrect) {
    return 'background: rgba(74,222,128,0.2); border: 2px solid #4ADE80; color: white;'
  }
  if (isChosen) {
    return 'background: rgba(255,77,77,0.18); border: 2px solid rgba(255,100,100,0.6); color: rgba(255,255,255,0.7);'
  }
  return 'background: rgba(255,255,255,0.03); border: 2px solid rgba(255,255,255,0.06); color: rgba(255,255,255,0.3);'
}

onUnmounted(() => clearTimer())
</script>

<style scoped>
.steam-anim {
  animation: steamUp 1.2s infinite;
}
@keyframes steamUp {
  0%, 100% { transform: translateY(0); opacity: 0; }
  50% { transform: translateY(-18px); opacity: 1; }
}

.flame-anim {
  animation: flamePulse 1.5s infinite;
}
@keyframes flamePulse {
  0%, 100% { transform: scale(1) translateY(0); }
  50% { transform: scale(1.1) translateY(-4px); }
}

.combo-pop-enter-active { animation: cpop 0.28s cubic-bezier(0.34, 1.56, 0.64, 1); }
.combo-pop-leave-active { transition: opacity 0.2s; }
.combo-pop-leave-to { opacity: 0; }
@keyframes cpop {
  from { transform: scale(0.4); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

.result-pop-enter-active { animation: rpop 0.2s ease-out; }
.result-pop-leave-active { transition: opacity 0.22s; }
.result-pop-leave-to { opacity: 0; }
@keyframes rpop {
  from { transform: scale(0.6); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}
</style>
