<template>
  <div class="h-full w-full bg-[#0d0b0a] flex flex-col font-['Outfit',_'Noto_Sans_TC'] overflow-y-auto overflow-x-hidden relative">
    
    <!-- Background Glows -->
    <div class="absolute top-0 left-0 w-[40%] h-[40%] bg-[#FF4D4D]/5 rounded-full blur-[100px] pointer-events-none"></div>

    <!-- Header: Night Market Optimized -->
    <header class="px-12 py-10 flex justify-between items-end relative z-10 border-b border-white/5 bg-black/20">
      <div class="flex-1">
        <button @click="goBack" class="flex items-center gap-2 text-white/40 hover:text-[#F0A500] transition-colors text-xl font-bold mb-4">
          ← 離開遊戲
        </button>
        <h1 class="text-6xl font-black tracking-[0.2em] text-[#F0A500] drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
          <span class="text-[#FF4D4D] animate-pulse">●</span> 金憶彈珠台攤
        </h1>
        <p class="text-2xl text-white/50 mt-4 font-medium tracking-wide italic">奶奶，今天的手氣看起來大好喔！</p>
      </div>
      <div class="text-right ml-8">
        <div class="text-xl font-bold opacity-60 uppercase tracking-[0.3em] text-[#F0A500] mb-2">當前得分</div>
        <div class="text-7xl font-black text-white tabular-nums drop-shadow-[0_0_20px_rgba(240,165,0,0.5)]">{{ score }}</div>
      </div>
    </header>

    <!-- Main Game Canvas Area -->
    <main class="flex-1 relative overflow-y-auto overflow-x-hidden flex justify-center items-center">
      <!-- Game Container (Phaser will mount here) -->
      <div ref="phaserRef" class="w-full h-full max-w-[1100px] max-h-[750px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] border-[12px] border-[#3D2F1B] rounded-[50px] overflow-hidden bg-black relative">
        <!-- AI Overlay (Hints - Much bolder for elderly) -->
        <div v-show="showHint" class="absolute inset-0 z-10 flex flex-col justify-center items-center pointer-events-none bg-black/40 backdrop-blur-[4px]">
           <div class="bg-[#F0A500] px-12 py-8 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] border-4 border-white animate-bounce-slow">
              <span class="text-5xl font-black text-black tracking-normal">👇 向下輕拉開始遊戲</span>
           </div>
        </div>
      </div>
    </main>

    <!-- Tablet Launcher Area (Huge & Tactile) -->
    <footer class="h-[180px] w-full bg-gradient-to-t from-black/50 to-transparent flex justify-center items-center pb-8 p-4">
      <div 
        class="relative w-[300px] h-[120px] flex justify-center items-start pt-2 cursor-pointer touch-none select-none"
        @mousedown="startPull"
        @touchstart="startPull"
        @mousemove="pull"
        @touchmove="pull"
        @mouseup="release"
        @touchend="release"
        @mouseleave="release"
      >
        <!-- The visual knob -->
        <div 
          ref="launcherRef" 
          class="w-32 h-16 rounded-full bg-gradient-to-b from-[#F0A500] to-[#CF7500] border-b-[10px] border-[#9F5600] shadow-[0_15px_30px_rgba(0,0,0,0.5)] flex justify-center items-center z-20 group active:scale-95 transition-transform"
        >
          <div class="w-16 h-1.5 bg-white/30 rounded-full"></div>
        </div>
        <!-- Visual Spring -->
        <div ref="springRef" class="absolute top-10 w-8 bg-[#444] rounded-b-xl border-x-4 border-gray-600 shadow-inner" style="height: 100px;"></div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Phaser from 'phaser'
import gsap from 'gsap'
import { useGameStore } from '../stores/gameStore'

const router = useRouter()
const gameStore = useGameStore()
let sessionSaved = false

const saveSession = () => {
  if (sessionSaved || score.value === 0) return
  sessionSaved = true
  // normalize: 1500 pts = 100%
  gameStore.addSession('pinball', Math.min(Math.round(score.value / 15), 100))
}

const goBack = () => {
  saveSession()
  router.push('/')
}

const phaserRef = ref(null)
const launcherRef = ref(null)
const springRef = ref(null)
const score = ref(0)
const showHint = ref(true)

let game = null
let mainScene = null

// Vue interaction state
let isPressing = false
let startY = 0
let pullDistance = 0
const maxPull = 100

// Phaser Scene Class
class PinballScene extends Phaser.Scene {
  constructor() {
    super('PinballScene')
    this.ball = null
  }

  create() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // 1. Scene Background Style
    this.add.graphics()
        .fillGradientStyle(0x1a1209, 0x1a1209, 0x000000, 0x000000, 1)
        .fillRect(0, 0, width, height)

    // 2. Map Walls (Boundary)
    this.matter.world.setBounds(0, 0, width, height, 32, true, true, true, true)

    // 3. Generate Pegs (Isometric pattern)
    for (let row = 0; row < 6; row++) {
      const cols = row % 2 === 0 ? 8 : 7
      const spacingX = width / 9
      const offsetX = row % 2 === 0 ? spacingX : spacingX * 1.5
      
      for (let col = 0; col < cols; col++) {
        const peg = this.matter.add.circle(offsetX + col * spacingX, 150 + row * 60, 8, {
          isStatic: true,
          label: 'peg',
          restitution: 0.8,
          friction: 0
        })
        
        // Visual for peg
        const graphics = this.add.graphics()
        graphics.fillStyle(0xF0A500, 1)
        graphics.fillCircle(peg.position.x, peg.position.y, 8)
        graphics.lineStyle(2, 0xFFFFFF, 0.3)
        graphics.strokeCircle(peg.position.x, peg.position.y, 8)
      }
    }

    // 4. Target Baskets (Bottom)
    const basketWidth = width / 5
    for (let i = 0; i < 5; i++) {
        const x = basketWidth * i + basketWidth/2
        const barrier = this.matter.add.rectangle(basketWidth * i, height - 30, 10, 60, { isStatic: true })
        // Basket trigger
        const sensor = this.matter.add.rectangle(x, height - 10, basketWidth - 10, 20, {
            isSensor: true,
            isStatic: true,
            label: `basket_${i}`
        })

        this.add.text(x, height - 80, (i+1)*100, { 
            fontSize: '54px', 
            fontWeight: '900', 
            color: '#F0A500', 
            stroke: '#000000',
            strokeThickness: 6,
            fontFamily: 'Outfit' 
        }).setOrigin(0.5)
    }

    // 5. Collision Event
    this.matter.world.on('collisionstart', (event) => {
        event.pairs.forEach(pair => {
            if (pair.bodyB.label.startsWith('basket')) {
                const points = (parseInt(pair.bodyB.label.split('_')[1]) + 1) * 100
                this.handleScore(points)
                this.resetBall()
            }
        })
    })

    this.resetBall()
  }

  handleScore(points) {
    score.value += points
    // Visual feedback on score
    this.cameras.main.shake(100, 0.005)
  }

  resetBall() {
    if (this.ball) {
        this.ball.destroy()
    }
    const width = this.cameras.main.width
    const height = this.cameras.main.height
    
    // Create new ball at rest position
    this.ball = this.matter.add.circle(width / 2, height - 100, 16, {
        restitution: 0.6,
        friction: 0.005,
        density: 0.01,
        label: 'ball'
    })
    
    // Ball Visual
    this.ballGraphics = this.add.circle(this.ball.position.x, this.ball.position.y, 16, 0xEEEEEE)
    this.ballGraphics.setStrokeStyle(2, 0x999999)
  }

  shoot(power) {
    if (!this.ball) return
    const force = 0.5 * power
    this.matter.body.applyForce(this.ball, this.ball.position, { 
        x: (Math.random() - 0.5) * 0.1 , // subtle random angle
        y: -force 
    })
    showHint.value = false
  }

  update() {
    if (this.ball && this.ballGraphics) {
        this.ballGraphics.setPosition(this.ball.position.x, this.ball.position.y)
        this.ballGraphics.setRotation(this.ball.angle)
    }
  }
}

// Vue Logic
onMounted(() => {
  const config = {
    type: Phaser.AUTO,
    parent: phaserRef.value,
    width: 800,
    height: 600,
    transparent: true,
    physics: {
      default: 'matter',
      matter: {
        gravity: { y: 1 },
        debug: false
      }
    },
    scene: PinballScene
  }
  
  game = new Phaser.Game(config)
  
  // Responsive resize
  const resizeGame = () => {
    if (game && phaserRef.value) {
      const container = phaserRef.value
      const w = container.clientWidth
      const h = container.clientHeight
      game.scale.resize(w, h)
    }
  }
  
  window.addEventListener('resize', resizeGame)
  setTimeout(resizeGame, 500)
})

onUnmounted(() => {
  saveSession()
  if (game) game.destroy(true)
})

const startPull = (e) => {
  isPressing = true
  startY = e.touches ? e.touches[0].clientY : e.clientY
}

const pull = (e) => {
  if (!isPressing) return
  const currentY = e.touches ? e.touches[0].clientY : e.clientY
  let diff = currentY - startY
  if (diff > 0 && diff <= maxPull) {
    pullDistance = diff
    gsap.set(launcherRef.value, { y: pullDistance })
    gsap.set(springRef.value, { height: 100 - (pullDistance * 0.6) })
  }
}

const release = () => {
  if (!isPressing) return
  isPressing = false
  
  const power = pullDistance / maxPull
  pullDistance = 0
  
  // Visual snap back
  gsap.to(launcherRef.value, { y: 0, duration: 0.1, ease: "back.out(2)" })
  gsap.to(springRef.value, { height: 100, duration: 0.1, ease: "back.out(2)" })
  
  // Command Phaser Scene to shoot
  const scene = game.scene.getScene('PinballScene')
  if (scene && power > 0.1) {
    scene.shoot(power)
  }
}
</script>

<style scoped>
.pinball-board {
  /* Subtle depth */
  box-shadow: 0 40px 100px rgba(0,0,0,0.6);
}

.launcher-knob {
  user-select: none;
  -webkit-user-drag: none;
}
</style>
