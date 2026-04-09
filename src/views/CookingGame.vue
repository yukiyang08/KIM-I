<template>
  <div class="h-full w-full bg-[#2D1B1B] flex flex-col font-['Outfit',_'Noto_Sans_TC'] overflow-y-auto overflow-x-hidden text-white relative">
    
    <!-- Kitchen Background Glow -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#FF4D4D]/5 rounded-full blur-[150px] pointer-events-none"></div>

    <!-- Header Section -->
    <header class="px-12 py-10 flex justify-between items-end relative z-10 border-b border-white/5 bg-black/40">
      <div>
        <button @click="router.push('/')" class="flex items-center gap-2 text-white/40 hover:text-[#F0A500] transition-colors text-xl font-bold mb-4">
          ← 離開遊戲
        </button>
        <h1 class="text-6xl font-black tracking-widest text-[#F0A500] drop-shadow-lg">
          <span class="text-[#FF4D4D]">●</span> 阿嬤的家常菜
        </h1>
        <p class="text-2xl text-white/50 mt-4 font-medium italic">奶奶，今天來煮一鍋好噴香的滷肉飯喔！</p>
      </div>
      <div class="text-right">
        <div class="text-xl font-bold opacity-40 uppercase tracking-widest mb-2">當前進度</div>
        <div class="text-7xl font-black text-[#4ADE80] tabular-nums">{{ Math.floor((stepIndex / steps.length) * 100) }}%</div>
      </div>
    </header>

    <!-- Main Cooking Area -->
    <main class="flex-1 relative flex flex-col justify-center items-center px-12 py-8 overflow-y-auto overflow-x-hidden">
      
      <!-- The Big Pot (Central Interaction) -->
      <div class="relative mb-12">
        <div 
          ref="potRef"
          class="w-[450px] h-[350px] bg-gradient-to-b from-gray-600 to-gray-900 rounded-[80px] shadow-[0_40px_80px_rgba(0,0,0,0.8),inset_0_-10px_30px_rgba(0,0,0,0.6)] border-x-[15px] border-gray-700 relative"
        >
          <!-- Pot Lid Handle -->
          <div class="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-10 bg-gray-500 rounded-full border-b-4 border-gray-700"></div>
          
          <!-- Steam Animation -->
          <div v-show="isCooking" class="absolute -top-20 left-1/2 -translate-x-1/2 flex gap-4">
            <div class="w-4 h-20 bg-white/20 blur-xl animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-4 h-24 bg-white/10 blur-xl animate-bounce" style="animation-delay: 0.3s"></div>
            <div class="w-4 h-20 bg-white/20 blur-xl animate-bounce" style="animation-delay: 0.2s"></div>
          </div>

          <!-- Inside the pot content display -->
          <div class="absolute inset-x-12 inset-y-8 bg-black/40 rounded-[40px] flex flex-col items-center justify-center border-2 border-white/5 shadow-inner overflow-hidden">
             <div v-if="stepIndex === 0" class="text-5xl font-bold text-white/30 tracking-widest">尚未下鍋</div>
             <div v-if="stepIndex > 0" class="text-[120px] filter drop-shadow-lg transition-transform duration-500 scale-125">
                 {{ stepIndex === 1 ? '🧄' : (stepIndex === 2 ? '🥩' : '🥘') }}
             </div>
             <div v-if="stepIndex > 0" class="mt-8 text-3xl font-black text-[#4ADE80]">已添加：{{ steps[stepIndex-1].name }}</div>
          </div>
        </div>
        
        <!-- Flame below pot -->
        <div v-show="stepIndex >= 2" class="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
           <div class="w-8 h-20 bg-orange-600 blur-lg animate-pulse opacity-60"></div>
           <div class="w-10 h-24 bg-red-600 blur-lg animate-pulse opacity-40"></div>
           <div class="w-8 h-20 bg-orange-600 blur-lg animate-pulse opacity-60"></div>
        </div>
      </div>

      <!-- Steps Selector (The Logic Part) -->
      <div v-if="!finished" class="flex gap-12 mt-8">
        <button 
          v-for="(step, index) in steps" 
          :key="index"
          class="group w-80 h-96 bg-white/5 rounded-[60px] border-4 border-white/10 flex flex-col items-center justify-center p-10 transition-all hover:bg-white/10 active:scale-95 disabled:opacity-30"
          @click="performStep(step)"
          :disabled="isCooking"
        >
          <div class="text-[100px] mb-8 filter drop-shadow-xl">{{ step.icon }}</div>
          <div class="text-4xl font-black text-white group-hover:text-[#F0A500]">{{ step.name }}</div>
          <div class="mt-4 text-xl font-bold text-white/40 uppercase tracking-widest italic">{{ step.desc }}</div>
        </button>
      </div>

      <!-- Success Interaction -->
      <div v-else class="text-center">
         <div class="text-[180px] mb-4">🍚🥢</div>
         <h2 class="text-8xl font-black text-[#F0A500] mb-8 tracking-widest">滷肉飯大功告成！</h2>
         <p class="text-3xl text-white/60 mb-12">奶奶，這鍋滷肉油亮噴香，阿公一定很滿意！</p>
         <button @click="resetGame" class="px-20 py-8 bg-[#F0A500] rounded-full text-black text-5xl font-black shadow-[0_20px_50px_rgba(240,165,0,0.4)] hover:scale-105 active:scale-95 transition-all">
            再煮一鍋
         </button>
      </div>

      <!-- Error Toast -->
      <transition name="fade-toast">
        <div v-if="errorMsg" class="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-10 py-4 rounded-full font-bold text-2xl shadow-2xl pointer-events-none">
          {{ errorMsg }}
        </div>
      </transition>

    </main>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { useGameStore } from '../stores/gameStore'

const router = useRouter()
const gameStore = useGameStore()

const steps = [
  { id: 'prep', name: '洗切爆香', icon: '🧄', desc: '蒜頭與蔥段' },
  { id: 'meat', name: '下肉拌炒', icon: '🥩', desc: '五花肉與豬油' },
  { id: 'stew', name: '文火燉煮', icon: '🍲', desc: '加入醬油與水' }
]

const stepIndex = ref(0)
const isCooking = ref(false)
const finished = ref(false)
const potRef = ref(null)
const errorMsg = ref('')
let errorCount = 0

const showError = (msg) => {
  errorMsg.value = msg
  setTimeout(() => { errorMsg.value = '' }, 2200)
}

const resetGame = () => {
  stepIndex.value = 0
  isCooking.value = false
  finished.value = false
  errorCount = 0
}

const performStep = (step) => {
  // Check sequence logic
  const expected = steps[stepIndex.value]
  
  if (step.id === expected.id) {
    // Correct
    isCooking.value = true
    
    // Pot Shake
    gsap.to(potRef.value, { y: -10, duration: 0.1, repeat: 10, yoyo: true })
    
    setTimeout(() => {
      isCooking.value = false
      stepIndex.value++
      
      if (stepIndex.value === steps.length) {
        setTimeout(() => {
          // Score: 100 - 25 per wrong attempt (min 25)
          const score = Math.max(25, 100 - errorCount * 25)
          gameStore.addSession('cooking', score, { errors: errorCount })
          finished.value = true
        }, 800)
      }
    }, 1500)
  } else {
    errorCount++
    gsap.to(potRef.value, { x: 20, duration: 0.05, repeat: 5, yoyo: true, onComplete: () => {
      showError('哎呀！順序不對喔，滷肉飯要先「爆香」，香味才會出來唷！')
    } })
  }
}
</script>

<style scoped>
.fade-toast-enter-active, .fade-toast-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-toast-enter-from, .fade-toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(-12px); }

.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); opacity: 0; }
  50% { transform: translateY(-20px); opacity: 1; }
}

.animate-pulse {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1) translateY(0); }
  50% { transform: scale(1.1) translateY(-5px); }
}
</style>
