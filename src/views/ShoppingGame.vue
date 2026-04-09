<template>
  <div class="h-full w-full bg-[#1A1209] flex flex-col font-['Outfit',_'Noto_Sans_TC'] overflow-y-auto overflow-x-hidden text-white relative">
    
    <!-- Background Grid Pattern (local, no external dependency) -->
    <div class="absolute inset-0 opacity-5 pointer-events-none" style="background-image: repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px);"></div>

    <!-- Header Section -->
    <header class="px-12 py-10 flex justify-between items-end relative z-10 border-b border-white/5 bg-black/40">
      <div>
        <button @click="router.push('/')" class="flex items-center gap-2 text-white/40 hover:text-[#F0A500] transition-colors text-xl font-bold mb-4">
          ← 離開遊戲
        </button>
        <h1 class="text-6xl font-black tracking-widest text-[#F0A500] drop-shadow-lg">
          <span class="text-[#FF4D4D]">●</span> 柑仔店採買記
        </h1>
        <p class="text-2xl text-white/50 mt-4 font-medium italic">奶奶，今天阿公想喝沙士喔！</p>
      </div>
      <div class="text-right">
        <div class="text-xl font-bold opacity-40 uppercase tracking-widest mb-2">正確次數</div>
        <div class="text-7xl font-black text-[#4ADE80] tabular-nums">{{ correctCount }}</div>
      </div>
    </header>

    <!-- Game Stages -->
    <main class="flex-1 relative flex justify-center items-center px-12 py-8">
      
      <!-- Stage 1: Memorization (The Shopping List) -->
      <transition name="scale">
        <div v-if="stage === 'memo'" class="w-[600px] bg-[#FDF5E6] p-12 rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.8)] border-[12px] border-[#3D2F1B] text-gray-800 text-center">
          <h2 class="text-5xl font-black mb-8 border-b-4 border-dashed border-gray-300 pb-6 uppercase tracking-[0.2em]">採買清單</h2>
          <div class="flex flex-wrap justify-center gap-10 py-6">
            <div v-for="item in currentTarget" :key="item.id" class="flex flex-col items-center">
              <span class="text-[120px] filter drop-shadow-md mb-4">{{ item.icon }}</span>
              <span class="text-4xl font-bold text-gray-700">{{ item.name }}</span>
            </div>
          </div>
          <div class="mt-12">
            <div class="text-2xl font-bold text-gray-400 mb-4 tracking-widest">請在倒數結束前記住它們</div>
            <div class="text-6xl font-black text-[#FF4D4D]">{{ timer }}</div>
          </div>
        </div>
      </transition>

      <!-- Stage 2: Selection (The Shelf) -->
      <transition name="fade">
        <div v-if="stage === 'play'" class="w-full h-full flex flex-col items-center">
          <div class="text-4xl font-black text-[#F0A500] mb-12 py-4 px-12 bg-white/5 rounded-full border border-white/10 italic">
            「請在架上點擊您剛才記下的商品」
          </div>
          
          <div class="grid grid-cols-4 gap-12 max-w-[1200px]">
            <button 
              v-for="item in shelfItems" 
              :key="item.id"
              class="group relative aspect-square w-full rounded-[40px] bg-white/5 border-4 border-white/10 flex flex-col items-center justify-center p-8 transition-all active:scale-90 hover:bg-white/10"
              @click="onSelect(item)"
              :disabled="selectedIds.includes(item.id)"
            >
              <span class="text-[100px] mb-6 filter drop-shadow-lg">{{ item.icon }}</span>
              <span class="text-3xl font-bold text-white/80 transition-colors group-hover:text-[#F0A500]">{{ item.name }}</span>
              
              <!-- Selected Overlay -->
              <div v-if="selectedIds.includes(item.id)" class="absolute inset-0 bg-black/60 flex items-center justify-center rounded-[36px]">
                <span class="text-7xl">✔️</span>
              </div>
            </button>
          </div>
        </div>
      </transition>

      <!-- Stage 3: Score / Success -->
      <transition name="scale">
        <div v-if="stage === 'success'" class="text-center">
          <div class="text-[200px] mb-8">🏆</div>
          <h2 class="text-8xl font-black text-[#F0A500] mb-6 tracking-widest">採買大成功！</h2>
          <p class="text-3xl text-white/60 mb-12 font-medium">您只花了 {{ totalTime }} 秒，記憶力非常好喔！</p>
          <button @click="resetGame" class="px-16 py-8 bg-[#F0A500] rounded-full text-black text-4xl font-black shadow-[0_20px_40px_rgba(240,165,0,0.3)] hover:scale-105 transition-transform active:scale-95 leading-none">
             再次挑戰
          </button>
        </div>
      </transition>

    </main>

    <!-- AI Toast (Hidden Data Collection Feedback) -->
    <div id="ai-toast" class="fixed bottom-32 left-1/2 -translate-x-1/2 bg-[#4ADE80] text-black px-8 py-3 rounded-full font-bold text-xl shadow-lg opacity-0 transition-opacity pointer-events-none">
       AI 正在分析您的決策時長...
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { useGameStore } from '../stores/gameStore'

const router = useRouter()
const gameStore = useGameStore()

// Game Data
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
  { id: 12, name: '中藥貼布', icon: '🩹' }
]

const stage = ref('memo') // memo, play, success
const currentTarget = ref([])
const shelfItems = ref([])
const selectedIds = ref([])
const timer = ref(10)
const correctCount = ref(0)
const totalTime = ref(0)
let startTime = 0
let errorCount = 0

// Game logic
const resetGame = () => {
  stage.value = 'memo'
  selectedIds.value = []
  correctCount.value = 0
  timer.value = 10
  errorCount = 0
  
  // Randomly pick 3 targets
  const shuffled = [...allItems].sort(() => 0.5 - Math.random())
  currentTarget.value = shuffled.slice(0, 3)
  
  // Mixed shelf (All items)
  shelfItems.value = [...allItems].sort(() => 0.5 - Math.random())
  
  startMemoTimer()
}

const startMemoTimer = () => {
  const intv = setInterval(() => {
    timer.value--
    if (timer.value <= 0) {
      clearInterval(intv)
      startPlay()
    }
  }, 1000)
}

const startPlay = () => {
  stage.value = 'play'
  startTime = Date.now()
}

const onSelect = (item) => {
  // Check if correct
  const isTarget = currentTarget.value.find(t => t.id === item.id)
  
  if (isTarget) {
    selectedIds.value.push(item.id)
    correctCount.value++
    
    // AI Feedback simulation
    showAIFeedback()
    
    if (selectedIds.value.length === currentTarget.value.length) {
      setTimeout(finishGame, 800)
    }
  } else {
    errorCount++
    gsap.to('main', { x: 10, duration: 0.1, repeat: 5, yoyo: true })
  }
}

const finishGame = () => {
  const elapsed = (Date.now() - startTime) / 1000
  totalTime.value = elapsed.toFixed(1)
  // Score: up to 80 pts for speed (lose 2 pts/sec after 5s), up to 20 pts for no errors
  const speedScore = Math.max(0, 80 - Math.max(0, elapsed - 5) * 2)
  const errorPenalty = Math.min(20, errorCount * 5)
  gameStore.addSession('shopping', speedScore + (20 - errorPenalty), {
    correctCount: correctCount.value,
    totalTime: elapsed,
    errors: errorCount,
  })
  stage.value = 'success'
}

const showAIFeedback = () => {
  const t = document.getElementById('ai-toast')
  if (!t) return
  gsap.to(t, { opacity: 1, y: -20, duration: 0.4 })
  gsap.to(t, { opacity: 0, y: 0, duration: 0.4, delay: 1.5 })
}

onMounted(() => {
  resetGame()
})
</script>

<style scoped>
/* State Transitions */
.scale-enter-active, .scale-leave-active {
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scale-enter-from, .scale-leave-to {
  transform: scale(0.6);
  opacity: 0;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.animate-bounce-slow {
  animation: bounce-slow 2s infinite;
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(-5%); }
  50% { transform: translateY(0); }
}
</style>
