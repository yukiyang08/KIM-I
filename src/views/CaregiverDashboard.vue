<template>
  <div class="h-full w-full bg-[#f9fafb] text-gray-800 overflow-y-auto pb-[100px] px-5 pt-8">

    <!-- User Profile Header -->
    <header class="flex items-center gap-4 mb-8">
      <div class="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-200 to-amber-500 overflow-hidden shadow-lg p-[2px] flex items-center justify-center">
        <span class="text-4xl">👵</span>
      </div>
      <div>
        <h2 class="text-2xl font-bold text-gray-900 tracking-tight">陳金美 奶奶</h2>
        <p class="text-sm font-medium text-gray-500 mt-0.5">
          {{ hasData ? `上次遊玩: ${lastPlayedLabel}` : '尚未開始遊玩' }}
        </p>
      </div>
    </header>

    <!-- Alert Card (Dynamic) -->
    <section v-if="alertMessage" class="bg-white rounded-3xl p-5 mb-6 shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-rose-100 relative overflow-hidden">
      <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500"></div>
      <div class="flex items-start gap-4 pl-2">
        <div class="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <div>
          <h3 class="text-lg font-bold text-gray-900 leading-tight">AI 分析提示</h3>
          <p class="text-sm text-gray-600 mt-1 opacity-90 leading-relaxed">{{ alertMessage }}</p>
        </div>
      </div>
    </section>

    <!-- No Data Prompt -->
    <section v-if="!hasData" class="bg-white rounded-3xl p-8 mb-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100 text-center">
      <div class="text-6xl mb-4">🎮</div>
      <p class="text-xl font-semibold text-gray-500">奶奶還沒有遊玩紀錄</p>
      <p class="text-sm text-gray-400 mt-2">完成任一遊戲後，認知評估圖表就會自動更新</p>
    </section>

    <!-- Radar Chart Section -->
    <section class="bg-white rounded-3xl p-6 mb-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100">
      <h3 class="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
        <svg class="w-5 h-5 text-[#F0A500]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        五維度認知評估
        <span v-if="hasData" class="ml-auto text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">即時數據</span>
        <span v-else class="ml-auto text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">基準線</span>
      </h3>
      <div class="relative w-full h-[280px] flex justify-center items-center">
        <Radar :data="chartData" :options="chartOptions" />
      </div>
    </section>

    <!-- Recent Sessions -->
    <section v-if="hasData" class="bg-white rounded-3xl p-5 mb-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100">
      <h4 class="text-[13px] font-semibold text-gray-500 mb-3">最近遊玩紀錄</h4>
      <div class="space-y-2">
        <div v-for="s in recentSessions" :key="s.timestamp" class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
          <div class="flex items-center gap-3">
            <span class="text-2xl">{{ gameEmoji[s.gameId] }}</span>
            <span class="text-sm font-semibold text-gray-700">{{ gameName[s.gameId] }}</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all" :style="{ width: s.score + '%', background: scoreColor(s.score) }"></div>
            </div>
            <span class="text-sm font-bold w-10 text-right" :style="{ color: scoreColor(s.score) }">{{ s.score }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Additional Vitals -->
    <div class="grid grid-cols-2 gap-4">
      <section class="bg-white rounded-3xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100">
        <h4 class="text-[13px] font-semibold text-gray-500 mb-2">手部穩定度</h4>
        <div class="text-2xl font-bold" :class="handScore >= 75 ? 'text-emerald-500' : 'text-amber-500'">
          {{ handScore !== null ? `優於 ${handScore}%` : '資料不足' }}
        </div>
        <p class="text-[11px] text-gray-400 mt-1">同齡長者對比</p>
      </section>
      <section class="bg-white rounded-3xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100">
        <h4 class="text-[13px] font-semibold text-gray-500 mb-2">本週完成度</h4>
        <div class="text-2xl font-bold text-blue-500">{{ weeklyCount }} 場</div>
        <p class="text-[11px] text-gray-400 mt-1">本週遊玩場次</p>
      </section>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js'
import { Radar } from 'vue-chartjs'
import { useGameStore } from '../stores/gameStore'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const store = useGameStore()

const hasData = computed(() => store.hasData)
const alertMessage = computed(() => store.alertMessage)
const recentSessions = computed(() => store.recentSessions)

const gameEmoji = { music: '🎵', shopping: '🥫', cooking: '🍲', puppet: '🎭', riddle: '🎶', puzzle: '🧩' }
const gameName  = { music: '懷舊音樂節拍', shopping: '柑仔店採買記', cooking: '阿嬤的家常菜', puppet: '廟口布袋戲', riddle: '老歌猜謎', puzzle: '廟口大拼圖' }

const scoreColor = (score) => {
  if (score >= 80) return '#10b981'
  if (score >= 60) return '#f59e0b'
  return '#ef4444'
}

const lastPlayedLabel = computed(() => {
  if (!store.recentSessions.length) return ''
  const ts = store.recentSessions[0].timestamp
  const diff = Date.now() - ts
  if (diff < 60000) return '剛才'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分鐘前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小時前`
  return `${Math.floor(diff / 86400000)} 天前`
})

// Hand stability: derived from pinball score
const handScore = computed(() => {
  const d = store.latestByDimension
  return d.reactionSpeed != null ? Math.min(99, 50 + Math.round(d.reactionSpeed / 4)) : null
})

// Weekly session count (past 7 days)
const weeklyCount = computed(() => {
  const cutoff = Date.now() - 7 * 86400000
  return store.sessions.filter(s => s.timestamp >= cutoff).length
})

// Chart data
const chartData = computed(() => ({
  labels: ['記憶力', '注意力', '執行力', '視覺空間', '反應力'],
  datasets: [
    ...(hasData.value ? [{
      label: '當前指數',
      backgroundColor: 'rgba(240, 165, 0, 0.25)',
      borderColor: '#F0A500',
      pointBackgroundColor: '#F0A500',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#F0A500',
      pointBorderWidth: 2,
      pointRadius: 4,
      data: store.radarCurrent,
      borderWidth: 2,
    }] : []),
    {
      label: '基準線 (上月)',
      backgroundColor: 'rgba(156, 163, 175, 0.1)',
      borderColor: '#9ca3af',
      pointBackgroundColor: '#9ca3af',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#9ca3af',
      borderDash: [5, 5],
      data: store.radarBaseline,
      borderWidth: 2,
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      angleLines: { color: 'rgba(0, 0, 0, 0.05)' },
      grid: { color: 'rgba(0, 0, 0, 0.05)' },
      pointLabels: {
        font: { family: 'Outfit, Noto Sans TC', size: 12, weight: '500' },
        color: '#4b5563'
      },
      ticks: { display: false, min: 0, max: 100 }
    }
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        font: { family: 'Outfit, Noto Sans TC', size: 11 },
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.9)',
      titleFont: { size: 13, family: 'Outfit, Noto Sans TC' },
      bodyFont: { size: 12, family: 'Outfit, Noto Sans TC' },
      padding: 10,
      cornerRadius: 8,
    }
  }
}
</script>
