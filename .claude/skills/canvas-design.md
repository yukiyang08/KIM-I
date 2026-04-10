# SKILL: Canvas 視覺設計 — KIM-I 遊戲美術

## 用途
使用 HTML5 Canvas 繪製 KIM-I 的遊戲海報、UI 圖形、遊戲內視覺元素。
風格：懷舊台灣 / 廟口文化 / 復古金色。

---

## Canvas 初始化（Vue 3 標準模式）

```vue
<template>
  <canvas ref="canvasRef" class="game-canvas" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let ctx = null
let animId = null

onMounted(() => {
  const canvas = canvasRef.value
  const dpr = window.devicePixelRatio || 1

  // 高清螢幕支援
  canvas.width = canvas.offsetWidth * dpr
  canvas.height = canvas.offsetHeight * dpr
  ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  drawFrame()
})

function drawFrame() {
  // 清除
  ctx.clearRect(0, 0, canvasRef.value.offsetWidth, canvasRef.value.offsetHeight)
  // 繪製內容...
  animId = requestAnimationFrame(drawFrame)
}

onUnmounted(() => cancelAnimationFrame(animId))
</script>

<style scoped>
.game-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
```

---

## 懷舊風格繪圖工具函式

### 復古邊框（黃銅質感）
```js
function drawVintageBorder(ctx, x, y, w, h, radius = 12) {
  ctx.save()
  ctx.strokeStyle = '#F0A500'
  ctx.lineWidth = 3
  ctx.shadowColor = 'rgba(240, 165, 0, 0.5)'
  ctx.shadowBlur = 12

  // 圓角矩形
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, radius)
  ctx.stroke()

  // 內層細線
  ctx.lineWidth = 1
  ctx.strokeStyle = 'rgba(240,165,0,0.3)'
  ctx.beginPath()
  ctx.roundRect(x + 6, y + 6, w - 12, h - 12, radius - 4)
  ctx.stroke()

  ctx.restore()
}
```

### 復古標題文字
```js
function drawRetroTitle(ctx, text, x, y, size = 32) {
  ctx.save()
  ctx.font = `bold ${size}px 'Noto Serif TC', serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // 金色光暈
  ctx.shadowColor = 'rgba(240, 165, 0, 0.7)'
  ctx.shadowBlur = 16
  ctx.fillStyle = '#F0A500'
  ctx.fillText(text, x, y)

  // 加深描邊
  ctx.shadowBlur = 0
  ctx.strokeStyle = '#CF7500'
  ctx.lineWidth = 1
  ctx.strokeText(text, x, y)

  ctx.restore()
}
```

### 棋盤格 / 圖案背景
```js
function drawCheckerBackground(ctx, w, h, size = 40) {
  for (let row = 0; row < Math.ceil(h / size); row++) {
    for (let col = 0; col < Math.ceil(w / size); col++) {
      const isEven = (row + col) % 2 === 0
      ctx.fillStyle = isEven
        ? 'rgba(240,165,0,0.04)'
        : 'rgba(240,165,0,0.02)'
      ctx.fillRect(col * size, row * size, size, size)
    }
  }
}
```

### 膠片邊條（懷舊電影感）
```js
function drawFilmStrip(ctx, x, y, w, h) {
  const holeSize = 10
  const holeGap = 20
  const holeCount = Math.floor(h / holeGap)

  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(x, y, w, h)

  ctx.fillStyle = '#0A0704'
  for (let i = 0; i < holeCount; i++) {
    const hy = y + i * holeGap + holeGap / 2 - holeSize / 2
    ctx.beginPath()
    ctx.roundRect(x + 4, hy, holeSize, holeSize, 2)
    ctx.fill()
  }
}
```

---

## 遊戲海報繪製（完整範例）

```js
// 繪製「懷舊音樂節拍」遊戲海報
function drawMusicGamePoster(ctx, w, h) {
  // 1. 深色背景
  ctx.fillStyle = '#0A0704'
  ctx.fillRect(0, 0, w, h)

  // 2. 棋盤紋
  drawCheckerBackground(ctx, w, h)

  // 3. 膠片邊條
  drawFilmStrip(ctx, 0, 0, 24, h)
  drawFilmStrip(ctx, w - 24, 0, 24, h)

  // 4. 中央黑膠唱片
  const cx = w / 2, cy = h / 2
  ctx.save()
  // 唱片本體
  ctx.fillStyle = '#111'
  ctx.beginPath()
  ctx.arc(cx, cy, 80, 0, Math.PI * 2)
  ctx.fill()
  // 唱片紋路
  for (let r = 30; r < 78; r += 6) {
    ctx.strokeStyle = `rgba(240,165,0,${0.05 + (r/80)*0.1})`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()
  }
  // 中心孔
  ctx.fillStyle = '#F0A500'
  ctx.beginPath()
  ctx.arc(cx, cy, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // 5. 邊框
  drawVintageBorder(ctx, 16, 16, w - 32, h - 32)

  // 6. 標題
  drawRetroTitle(ctx, '懷舊音樂節拍', cx, 40, 22)
  drawRetroTitle(ctx, '🎵', cx, cy - 110, 28)
}
```

---

## 遊戲內 UI 元素

### 血條 / 進度條
```js
function drawProgressBar(ctx, x, y, w, h, percent, color = '#F0A500') {
  // 背景
  ctx.fillStyle = 'rgba(255,255,255,0.1)'
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, h / 2)
  ctx.fill()

  // 進度
  if (percent > 0) {
    ctx.fillStyle = color
    ctx.shadowColor = color
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.roundRect(x, y, w * percent, h, h / 2)
    ctx.fill()
    ctx.shadowBlur = 0
  }
}
```

### 分數彈出數字
```js
class ScorePopup {
  constructor(x, y, value) {
    this.x = x
    this.y = y
    this.value = value
    this.alpha = 1
    this.vy = -2
  }
  update() {
    this.y += this.vy
    this.vy *= 0.95
    this.alpha -= 0.025
  }
  draw(ctx) {
    if (this.alpha <= 0) return
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.font = 'bold 24px Outfit, sans-serif'
    ctx.fillStyle = '#F0A500'
    ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(240,165,0,0.8)'
    ctx.shadowBlur = 10
    ctx.fillText(`+${this.value}`, this.x, this.y)
    ctx.restore()
  }
  get isDone() { return this.alpha <= 0 }
}
```

---

## 輸出靜態圖片（遊戲海報存檔）

```js
function exportPoster(canvasRef, filename = 'poster.png') {
  const canvas = canvasRef.value
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}
```

---

## 風格速查

| 元素 | 顏色 | 效果 |
|------|------|------|
| 主要邊框 | `#F0A500` | `shadowBlur: 12` |
| 標題文字 | `#F0A500` | `shadowBlur: 16` |
| 背景底色 | `#0A0704` | 無 |
| 成功色 | `#4ADE80` | `shadowBlur: 8` |
| 危險色 | `#F87171` | `shadowBlur: 8` |
| 次要線條 | `rgba(240,165,0,0.3)` | 無 |
