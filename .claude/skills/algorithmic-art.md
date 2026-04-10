# SKILL: Algorithmic Art — KIM-I 生成視覺系統

## 用途
為 KIM-I 遊戲建立程序生成的視覺效果：粒子系統、節拍視覺化、
背景動畫、成功特效。使用 Canvas API 或 CSS 動畫實現，不依賴 p5.js。

---

## Canvas 粒子系統

### 基礎粒子引擎（Vue Composable）
```js
// src/composables/useParticles.js
import { ref, onUnmounted } from 'vue'

export function useParticles(canvasRef) {
  const particles = []
  let animId = null

  class Particle {
    constructor(x, y, color = '#F0A500') {
      this.x = x
      this.y = y
      this.vx = (Math.random() - 0.5) * 4
      this.vy = (Math.random() - 0.5) * 4 - 2
      this.alpha = 1
      this.size = Math.random() * 6 + 2
      this.color = color
      this.decay = Math.random() * 0.02 + 0.015
    }
    update() {
      this.x += this.vx
      this.y += this.vy
      this.vy += 0.1          // 重力
      this.alpha -= this.decay
    }
    draw(ctx) {
      ctx.save()
      ctx.globalAlpha = this.alpha
      ctx.fillStyle = this.color
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
    get isDead() { return this.alpha <= 0 }
  }

  function burst(x, y, count = 20, color = '#F0A500') {
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(x, y, color))
    }
  }

  function loop() {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update()
      particles[i].draw(ctx)
      if (particles[i].isDead) particles.splice(i, 1)
    }
    animId = requestAnimationFrame(loop)
  }

  function start() { loop() }
  function stop() { cancelAnimationFrame(animId) }

  onUnmounted(stop)

  return { burst, start, stop }
}
```

### 在遊戲中使用
```vue
<template>
  <canvas ref="canvasRef" class="particle-canvas" />
  <button @click="celebrate">答對了！</button>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useParticles } from '@/composables/useParticles'

const canvasRef = ref(null)
const { burst, start } = useParticles(canvasRef)

onMounted(() => {
  const canvas = canvasRef.value
  canvas.width = canvas.offsetWidth
  canvas.height = canvas.offsetHeight
  start()
})

function celebrate() {
  const canvas = canvasRef.value
  const cx = canvas.width / 2
  const cy = canvas.height / 2
  burst(cx, cy, 40, '#F0A500')
  burst(cx, cy, 20, '#4ADE80')
  burst(cx, cy, 20, '#F5F5F5')
}
</script>

<style scoped>
.particle-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}
</style>
```

---

## 節拍視覺化（MusicRhythmGame 專用）

### 音波環形動畫
```js
// 根據 BPM 產生脈衝動畫
function drawBeatRing(ctx, cx, cy, beat, bpm) {
  const maxRadius = 120
  const progress = (Date.now() % (60000 / bpm)) / (60000 / bpm)
  const radius = progress * maxRadius
  const alpha = 1 - progress

  ctx.save()
  ctx.strokeStyle = `rgba(240, 165, 0, ${alpha})`
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}
```

### 波形條狀視覺化
```js
function drawWaveform(ctx, analyser, width, height) {
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  analyser.getByteFrequencyData(dataArray)

  const barWidth = width / bufferLength * 2.5
  let x = 0

  for (let i = 0; i < bufferLength; i++) {
    const barHeight = (dataArray[i] / 255) * height
    const hue = (dataArray[i] / 255) * 40 + 30  // 金色到橙色
    ctx.fillStyle = `hsla(${hue}, 90%, 55%, 0.8)`
    ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight)
    x += barWidth
  }
}
```

---

## CSS 程序生成動畫

### 背景浮動粒子（純 CSS）
```vue
<template>
  <div class="bg-particles">
    <span v-for="i in 12" :key="i" class="particle"
          :style="particleStyle(i)" />
  </div>
</template>

<script setup>
function particleStyle(i) {
  return {
    '--x': `${Math.random() * 100}%`,
    '--duration': `${8 + Math.random() * 12}s`,
    '--delay': `${Math.random() * 8}s`,
    '--size': `${4 + Math.random() * 8}px`,
    '--opacity': 0.1 + Math.random() * 0.2
  }
}
</script>

<style scoped>
.bg-particles {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.particle {
  position: absolute;
  bottom: -20px;
  left: var(--x);
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background: #F0A500;
  opacity: var(--opacity);
  animation: float-up var(--duration) var(--delay) ease-in infinite;
}
@keyframes float-up {
  0%   { transform: translateY(0) scale(1); opacity: var(--opacity); }
  100% { transform: translateY(-100vh) scale(0.3); opacity: 0; }
}
</style>
```

---

## 遊戲特效清單

| 場景 | 特效 | 實作方式 |
|------|------|---------|
| 答對 | 金色粒子爆炸 | Canvas Particle burst |
| Combo | 光暈 + 文字縮放 | CSS animation + GSAP |
| 遊戲結束 | 彩帶飄落 | Canvas 多色粒子 |
| 節拍命中 | 圓環擴散 | Canvas arc + alpha |
| 背景 | 浮動光點 | CSS @keyframes |
| 計時到期 | 紅色閃爍 | CSS box-shadow pulse |

---

## 效能注意事項
- 粒子超過 200 個時需要 object pool 重用
- `requestAnimationFrame` 必須在 `onUnmounted` 中 cancel
- Canvas 尺寸在 resize 時需要重設（避免模糊）：
```js
const observer = new ResizeObserver(() => {
  canvas.width = canvas.offsetWidth * devicePixelRatio
  canvas.height = canvas.offsetHeight * devicePixelRatio
  ctx.scale(devicePixelRatio, devicePixelRatio)
})
observer.observe(canvas)
```
