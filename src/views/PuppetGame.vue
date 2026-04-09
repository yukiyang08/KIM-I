<template>
  <div class="h-full w-full bg-[#1A0909] flex flex-col font-['Outfit',_'Noto_Sans_TC'] overflow-y-auto overflow-x-hidden text-white relative">
    
    <!-- Stage Curtain Background -->
    <div class="absolute inset-x-0 top-0 h-40 bg-[#D32F2F] shadow-lg flex justify-around p-4 z-20 border-b-8 border-[#F0A500]">
       <div v-for="i in 10" :key="i" class="w-8 h-full bg-[#B71C1C] rounded-full opacity-50"></div>
    </div>

    <!-- Header Section -->
    <header class="px-12 py-10 pt-20 flex justify-between items-end relative z-30 border-b border-white/5 bg-black/40">
      <div>
        <button @click="router.push('/')" class="flex items-center gap-2 text-white/40 hover:text-[#F0A500] transition-colors text-xl font-bold mb-4">
          ← 離開遊戲
        </button>
        <h1 class="text-6xl font-black tracking-widest text-[#F0A500] drop-shadow-lg">
          <span class="text-[#FF4D4D]">●</span> 廟口布袋戲
        </h1>
        <p class="text-2xl text-white/50 mt-4 font-medium italic">奶奶，請盯好這位主角，別讓他跑掉囉！</p>
      </div>
      <div class="text-right">
        <div class="text-xl font-bold opacity-40 uppercase tracking-widest mb-2">正確次數</div>
        <div class="text-7xl font-black text-[#4ADE80] tabular-nums">{{ score }}</div>
      </div>
    </header>

    <!-- The Play Area -->
    <main class="flex-1 relative flex flex-col justify-center items-center px-12 py-8 overflow-y-auto overflow-x-hidden">
      <!-- The Puppet Stage -->
      <div 
        ref="stageRef" 
        class="w-full h-full max-w-[1200px] max-h-[600px] bg-gradient-to-b from-[#2A1B1B] to-[#1A0909] rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] border-[12px] border-[#F0A500] relative overflow-hidden"
      >
        <!-- The Puppets -->
        <div 
          v-for="p in puppets" 
          :key="p.id"
          class="puppet absolute w-48 h-64 flex flex-col items-center justify-center cursor-pointer transition-transform active:scale-90"
          :ref="el => { if (el) puppetRefs[p.id] = el }"
          @click="onSelect(p)"
        >
          <!-- Special Glow for Target -->
          <div v-show="p.id === targetId && isIdentifying" class="absolute inset-0 bg-[#F0A500]/40 rounded-full blur-3xl animate-pulse"></div>
          
          <div class="text-[140px] filter drop-shadow-2xl relative z-10">{{ p.icon }}</div>
          <div v-if="p.id === targetId && isIdentifying" class="absolute -top-12 bg-[#F0A500] text-black px-6 py-2 rounded-full font-black text-2xl animate-bounce">
             就是他！
          </div>
          <div class="mt-4 text-3xl font-black text-white/80 bg-black/40 px-4 py-1 rounded-lg">{{ p.name }}</div>
        </div>

        <!-- Start Overlay -->
        <div v-if="gameState === 'idle'" class="absolute inset-0 bg-black/60 flex flex-col items-center justify-center space-y-8 z-40">
           <div class="text-center">
              <div class="text-9xl mb-8">🥁</div>
              <h2 class="text-6xl font-black text-white mb-12 tracking-widest">好戲即將開鑼！</h2>
              <button @click="startGame" class="px-20 py-8 bg-[#F0A500] text-black rounded-full text-5xl font-black shadow-[0_20px_50px_rgba(240,165,0,0.4)] active:scale-95 transition-transform leading-none">
                 開始看戲
              </button>
           </div>
        </div>
        
        <!-- Big Result Text -->
        <div v-if="gameState === 'selecting'" class="absolute top-12 left-1/2 -translate-x-1/2 z-40 bg-white/10 px-12 py-4 rounded-full border border-white/20 backdrop-blur-md">
           <span class="text-4xl font-black text-[#F0A500] tracking-widest italic animate-pulse">「剛才閃閃發亮的主角，是哪一位？」</span>
        </div>

        <!-- Completion Overlay -->
        <div v-if="gameState === 'finished'" class="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
          <div class="text-[140px] mb-4">🎊</div>
          <h2 class="text-7xl font-black text-[#F0A500] mb-6 tracking-widest">好眼力！</h2>
          <p class="text-3xl text-white/60 mb-4">第 {{ maxRounds }} 關全過，共答錯 {{ totalErrors }} 次</p>
          <p class="text-2xl text-white/40 mb-12">得分：{{ finalScore }} 分</p>
          <button @click="restartGame" class="px-20 py-8 bg-[#F0A500] text-black rounded-full text-5xl font-black shadow-[0_20px_50px_rgba(240,165,0,0.4)] active:scale-95 transition-transform leading-none">
            再看一場
          </button>
        </div>
      </div>

      <!-- Error Toast -->
      <transition name="fade-toast">
        <div v-if="errorMsg" class="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-10 py-4 rounded-full font-bold text-2xl shadow-2xl pointer-events-none">
          {{ errorMsg }}
        </div>
      </transition>

      <!-- Round Progress -->
      <div v-if="gameState !== 'idle' && gameState !== 'finished'" class="mt-6 flex items-center gap-3">
        <div v-for="r in maxRounds" :key="r" class="w-6 h-6 rounded-full border-2 border-white/30 transition-all"
          :class="r <= score ? 'bg-[#F0A500] border-[#F0A500]' : 'bg-transparent'"></div>
        <span class="text-white/40 text-xl font-bold ml-2">{{ score }} / {{ maxRounds }} 關</span>
      </div>

    </main>

  </div>
</template>

<script setup>
import { ref, reactive, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { useGameStore } from '../stores/gameStore'

const router = useRouter()
const gameStore = useGameStore()

const puppetList = [
  { id: 1, name: '史艷文', icon: '👘' },
  { id: 2, name: '藏鏡人', icon: '🥷' },
  { id: 3, name: '黑白郎君', icon: '🎭' },
  { id: 4, name: '小旦', icon: '👩‍🎤' },
  { id: 5, name: '武生', icon: '🤺' },
  { id: 6, name: '淨角', icon: '👺' }
]

const maxRounds = 5
const puppets = ref([])
const puppetRefs = reactive({})
const gameState = ref('idle') // idle, moving, selecting, finished
const targetId = ref(null)
const isIdentifying = ref(false)
const score = ref(0)
const stageRef = ref(null)
const errorMsg = ref('')
const totalErrors = ref(0)
const finalScore = ref(0)

const showError = (msg) => {
  errorMsg.value = msg
  setTimeout(() => { errorMsg.value = '' }, 2200)
}

const startGame = () => {
  score.value = 0
  totalErrors.value = 0
  gameState.value = 'idle'
  nextRound()
}

const restartGame = () => {
  score.value = 0
  totalErrors.value = 0
  gameState.value = 'idle'
  nextRound()
}

const nextRound = () => {
  puppets.value = [...puppetList].sort(() => 0.5 - Math.random()).slice(0, 5)
  setTimeout(() => {
    puppets.value.forEach((p, i) => {
      gsap.set(puppetRefs[p.id], { x: 100 + i * 180, y: 150 })
    })
    identifyTarget()
  }, 100)
}

const identifyTarget = () => {
  gameState.value = 'idle'
  targetId.value = puppets.value[Math.floor(Math.random() * puppets.value.length)].id
  isIdentifying.value = true
  
  setTimeout(() => {
    isIdentifying.value = false
    shufflePuppets()
  }, 3000)
}

const shufflePuppets = () => {
  gameState.value = 'moving'
  
  const tl = gsap.timeline({
    onComplete: () => {
      gameState.value = 'selecting'
    }
  })

  // 10 rounds of random movement
  for (let r = 0; r < 6; r++) {
    puppets.value.forEach(p => {
      tl.to(puppetRefs[p.id], {
        x: Math.random() * (stageRef.value.clientWidth - 200),
        y: Math.random() * (stageRef.value.clientHeight - 300),
        duration: 0.8,
        ease: "power2.inOut"
      }, r * 0.6)
    })
  }
}

const onSelect = (p) => {
  if (gameState.value !== 'selecting') return

  if (p.id === targetId.value) {
    score.value++
    gsap.to(puppetRefs[p.id], { scale: 1.5, duration: 0.5, ease: "back.out", yoyo: true, repeat: 1 })
    if (score.value >= maxRounds) {
      // Game complete
      setTimeout(() => {
        finalScore.value = Math.max(40, 100 - totalErrors.value * 10)
        gameStore.addSession('puppet', finalScore.value, { rounds: maxRounds, errors: totalErrors.value })
        gameState.value = 'finished'
      }, 1000)
    } else {
      setTimeout(nextRound, 1500)
    }
  } else {
    totalErrors.value++
    gsap.to(puppetRefs[p.id], { x: '+=20', duration: 0.05, repeat: 5, yoyo: true })
    showError('奶奶，再仔細看看，不是這一位喔！')
  }
}

onUnmounted(() => {
  gsap.killTweensOf(".puppet")
})
</script>

<style scoped>
.fade-toast-enter-active, .fade-toast-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-toast-enter-from, .fade-toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(-12px); }

.puppet {
  transition: opacity 0.3s ease;
}

.animate-pulse {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.2); opacity: 0.7; }
}

.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}
</style>
