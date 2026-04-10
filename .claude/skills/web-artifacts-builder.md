# SKILL: Web Artifacts Builder — KIM-I 多元件應用

## 用途
在 KIM-I 專案中構建複雜的多元件頁面（Dashboard、遊戲大廳、多人房間）。
整合 Vue 3 Composition API、Pinia store、Chart.js、GSAP 動畫。

---

## 元件組合架構

### 典型頁面結構
```
Page View (.vue)
├── PageHeader         → 標題 + 返回按鈕 + 狀態資訊
├── MainContent
│   ├── LeftPanel      → 導覽 / 篩選 / 玩家清單
│   └── RightPanel     → 主要內容區（遊戲 / 圖表 / 卡片）
└── BottomActions      → 操作按鈕列
```

### 元件通訊模式
```js
// 父 → 子：props
defineProps({ score: Number, difficulty: String })

// 子 → 父：emits
const emit = defineEmits(['game-start', 'score-update'])
emit('game-start', { difficulty: 'normal' })

// 跨元件：Pinia store
const gameStore = useGameStore()
gameStore.recordScore({ gameId, score, cognitiveSkill })

// 兄弟元件：provide / inject（適合遊戲內部狀態）
provide('gameState', readonly(gameState))
const gameState = inject('gameState')
```

---

## Pinia Store 整合

### 讀取遊戲紀錄
```js
import { useGameStore } from '@/stores/gameStore'
import { storeToRefs } from 'pinia'

const gameStore = useGameStore()
const { scores, currentSession, cognitiveMetrics } = storeToRefs(gameStore)

// 取得特定遊戲的歷史分數
const musicScores = computed(() =>
  scores.value.filter(s => s.gameId === 'music')
)
```

### 儲存成績
```js
gameStore.recordScore({
  gameId: 'shopping',        // 遊戲 ID
  score: 850,                // 分數
  difficulty: 'normal',      // 難度
  cognitiveSkill: 'memory',  // 認知技能
  duration: 60,              // 遊戲秒數
  timestamp: Date.now()
})
```

---

## Chart.js 圖表整合

### 認知能力雷達圖（照護者 Dashboard 風格）
```vue
<template>
  <Radar :data="radarData" :options="radarOptions" />
</template>

<script setup>
import { Radar } from 'vue-chartjs'
import { Chart as ChartJS, RadialLinearScale, PointElement,
         LineElement, Filler, Tooltip, Legend } from 'chart.js'

ChartJS.register(RadialLinearScale, PointElement, LineElement,
                 Filler, Tooltip, Legend)

const radarData = computed(() => ({
  labels: ['記憶力', '注意力', '反應力', '執行力', '視覺空間', '語意理解'],
  datasets: [
    {
      label: '本週',
      data: [85, 72, 90, 68, 75, 80],
      backgroundColor: 'rgba(240, 165, 0, 0.2)',
      borderColor: '#F0A500',
      pointBackgroundColor: '#F0A500',
    },
    {
      label: '基準值',
      data: [70, 70, 70, 70, 70, 70],
      backgroundColor: 'rgba(74, 222, 128, 0.1)',
      borderColor: '#4ADE80',
      borderDash: [5, 5],
    }
  ]
}))

const radarOptions = {
  scales: {
    r: {
      min: 0, max: 100,
      grid: { color: 'rgba(240,165,0,0.15)' },
      ticks: { color: '#A0926A', backdropColor: 'transparent' },
      pointLabels: { color: '#F5F5F5', font: { size: 13 } }
    }
  },
  plugins: {
    legend: { labels: { color: '#F5F5F5' } }
  }
}
</script>
```

### 週活動長條圖
```js
const barData = computed(() => ({
  labels: ['週一', '週二', '週三', '週四', '週五', '週六', '週日'],
  datasets: [{
    label: '遊戲次數',
    data: weeklyActivity.value,
    backgroundColor: 'rgba(240, 165, 0, 0.6)',
    borderColor: '#F0A500',
    borderWidth: 1,
    borderRadius: 4,
  }]
}))
```

---

## GSAP 動畫模式

### 頁面進場動畫
```js
import { gsap } from 'gsap'
import { onMounted } from 'vue'

onMounted(() => {
  // 卡片逐一出現
  gsap.from('.game-card', {
    y: 40,
    opacity: 0,
    duration: 0.5,
    stagger: 0.1,
    ease: 'power2.out'
  })
})
```

### 分數跳動動畫
```js
function animateScore(targetScore) {
  const obj = { val: 0 }
  gsap.to(obj, {
    val: targetScore,
    duration: 1.2,
    ease: 'power2.out',
    onUpdate: () => {
      displayScore.value = Math.round(obj.val)
    }
  })
}
```

---

## 多元件頁面建構步驟

1. **規劃資料流** — 確認哪些狀態放 store、哪些放 local ref
2. **建立子元件** — 每個視覺區塊獨立成 `.vue` 檔
3. **定義 Props/Emits 介面** — 用 TypeScript-style JSDoc 標註
4. **整合 store** — 用 `storeToRefs` 保持響應性
5. **加入過場動畫** — 用 `<Transition>` + GSAP
6. **測試無障礙** — 確認 focus 順序、aria-label、對比度

---

## 常用 Vue 3 模式

### 非同步資料載入
```js
const isLoading = ref(true)
const data = ref(null)

onMounted(async () => {
  try {
    data.value = await fetchCognitiveData()
  } finally {
    isLoading.value = false
  }
})
```

### 條件渲染骨架屏
```vue
<template>
  <div v-if="isLoading" class="skeleton-card" />
  <div v-else class="data-card">{{ data }}</div>
</template>
```
