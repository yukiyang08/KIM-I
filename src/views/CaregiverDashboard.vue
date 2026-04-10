<template>
  <div class="h-full w-full overflow-y-auto pb-[110px] px-6 sm:px-8 md:px-10 pt-7 font-['Outfit','Noto_Sans_TC']"
       style="background: #FAF5ED;">

    <!-- ── User Profile Header ── -->
    <header class="flex items-center gap-5 mb-7">
      <div class="w-18 h-18 rounded-full flex items-center justify-center shrink-0 shadow-lg"
           style="background: linear-gradient(135deg, #F5D98A, #C8961E);">
        <span class="text-4xl">👵</span>
      </div>
      <div>
        <h2 class="text-4xl sm:text-5xl font-black tracking-tight" style="color:#3D2010;">陳金美 奶奶</h2>
        <p class="text-xl font-medium mt-1" style="color:#9B7040;">
          {{ hasData ? `上次遊玩：${lastPlayedLabel}` : '尚未開始遊玩' }}
        </p>
      </div>
      <!-- Weekly badge -->
      <div class="ml-auto text-right">
        <div class="text-5xl sm:text-6xl leading-none font-black" style="color:#C8961E;">{{ weeklyCount }}</div>
        <div class="text-lg font-semibold mt-1" style="color:#9B7040;">本週場次</div>
      </div>
    </header>

    <!-- ── Kim-I AI 分析 ── -->
    <section class="rounded-3xl p-7 mb-7 relative overflow-hidden"
             style="background:#FFFDF8;border:1px solid rgba(200,150,30,0.2);box-shadow:0 8px 32px rgba(120,70,20,0.08);">
      <!-- AI badge (top-right) -->
      <div class="absolute top-4 right-4 px-3.5 py-2 rounded-lg text-xl font-black text-white tracking-widest"
           style="background:#C8961E;">AI</div>

      <div class="flex items-start gap-4 pr-16">
        <!-- Brain icon -->
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-3xl"
             style="background:rgba(200,150,30,0.12);border:1px solid rgba(200,150,30,0.25);">
          🧠
        </div>
        <div>
          <h3 class="text-3xl font-black mb-1.5" style="color:#3D2010;">Kim-I AI 分析</h3>
          <p class="text-xl leading-relaxed" style="color:#7A5030;">{{ aiInsight }}</p>
        </div>
      </div>
    </section>

    <!-- ── 今日康復數據價值 ── -->
    <section class="rounded-3xl p-7 mb-7"
             style="background:#FFFDF8;border:1px solid rgba(200,150,30,0.2);box-shadow:0 8px 32px rgba(120,70,20,0.08);">

      <h3 class="text-2xl sm:text-3xl font-black mb-6 flex items-center gap-2" style="color:#3D2010;">
        <span class="w-1 h-5 rounded-full inline-block" style="background:#C8961E;"></span>
        今日數據
      </h3>

      <div class="grid grid-cols-2 gap-5">

        <!-- 康復時長 -->
        <div class="rounded-2xl p-6" style="background:#FAF5ED;border:1px solid rgba(200,150,30,0.12);">
          <div class="text-lg font-semibold mb-2" style="color:#9B7040;">遊玩時長</div>
          <div class="flex items-end gap-1">
            <span class="text-6xl sm:text-7xl font-black leading-none" style="color:#3D2010;">{{ todayMinutes }}</span>
            <span class="text-2xl font-bold mb-1" style="color:#9B7040;">分鐘</span>
          </div>
          <div class="text-lg mt-2" style="color:#B89060;">今日遊玩 {{ todayCount }} 場</div>
        </div>

        <!-- 手眼協調度 -->
        <div class="rounded-2xl p-6" style="background:#FAF5ED;border:1px solid rgba(200,150,30,0.12);">
          <div class="text-lg font-semibold mb-2" style="color:#9B7040;">手眼協調度</div>
          <!-- Progress bar -->
          <div class="h-5 rounded-full overflow-hidden mb-2" style="background:rgba(200,150,30,0.12);">
            <div class="h-full rounded-full transition-all duration-700"
                 :style="{ width: handEyeScore + '%', background: 'linear-gradient(90deg, #C8961E, #E06030)' }">
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-lg" style="color:#B89060;">同齡比較</span>
            <span class="text-3xl font-black leading-none" style="color:#C8961E;">{{ handEyeScore }}%</span>
          </div>
        </div>

        <!-- 精細動作穩定度 -->
        <div class="rounded-2xl p-6" style="background:#FAF5ED;border:1px solid rgba(200,150,30,0.12);">
          <div class="text-lg font-semibold mb-2" style="color:#9B7040;">精細動作穩定度</div>
          <div class="h-12 w-full">
            <svg viewBox="0 0 120 48" class="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#C8961E" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="#C8961E" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <!-- Fill area -->
              <polygon v-if="sparkPoints.length >= 2"
                       :points="`0,48 ${sparkPoints.map(p=>p.join(',')).join(' ')} 120,48`"
                       fill="url(#sparkFill)"/>
              <!-- Line -->
              <polyline v-if="sparkPoints.length >= 2"
                        :points="sparkPoints.map(p=>p.join(',')).join(' ')"
                        fill="none" stroke="#C8961E" stroke-width="2.5"
                        stroke-linecap="round" stroke-linejoin="round"/>
              <!-- Dots -->
              <circle v-for="(p,i) in sparkPoints" :key="i"
                      :cx="p[0]" :cy="p[1]" r="2.5" fill="#C8961E"/>
              <!-- Flat line placeholder -->
              <line v-if="sparkPoints.length < 2"
                    x1="10" y1="32" x2="110" y2="32"
                    stroke="rgba(200,150,30,0.2)" stroke-width="2" stroke-dasharray="4,4"/>
            </svg>
          </div>
          <div class="flex items-center gap-1 mt-1">
            <span class="text-2xl" :style="{ color: trendUp ? '#10b981' : '#C8961E' }">
              {{ trendUp ? '↗' : '→' }}
            </span>
            <span class="text-lg" style="color:#B89060;">{{ trendUp ? '持續上升' : '保持穩定' }}</span>
          </div>
        </div>

        <!-- 認知得分 (Gauge) -->
        <div class="rounded-2xl p-6 flex flex-col items-center justify-center"
             style="background:#FAF5ED;border:1px solid rgba(200,150,30,0.12);">
          <div class="text-lg font-semibold mb-2 self-start" style="color:#9B7040;">認知得分</div>
          <div class="relative" style="width:170px;height:104px;">
            <svg viewBox="0 0 120 68" class="w-full h-full">
              <defs>
                <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#C8961E"/>
                  <stop offset="100%" stop-color="#E06030"/>
                </linearGradient>
              </defs>
              <!-- Track -->
              <path d="M 12,60 A 48,48 0 0 1 108,60"
                    fill="none" stroke="rgba(200,150,30,0.12)" stroke-width="9" stroke-linecap="round"/>
              <!-- Fill -->
              <path d="M 12,60 A 48,48 0 0 1 108,60"
                    fill="none" stroke="url(#gaugeGrad)" stroke-width="9" stroke-linecap="round"
                    stroke-dasharray="150.8"
                    :stroke-dashoffset="150.8 * (1 - cognitiveScore / 100)"/>
            </svg>
            <!-- Score text -->
            <div class="absolute inset-0 flex flex-col items-center justify-end pb-1">
              <span class="text-6xl font-black leading-none" style="color:#3D2010;">{{ cognitiveScore }}</span>
            </div>
          </div>
          <div class="text-lg mt-1" style="color:#B89060;">滿分 100 分</div>
        </div>

      </div>
    </section>

    <!-- ── 五維度認知評估 ── -->
    <section class="rounded-3xl p-7 mb-7"
             style="background:#FFFDF8;border:1px solid rgba(200,150,30,0.2);box-shadow:0 8px 32px rgba(120,70,20,0.08);">
      <h3 class="text-2xl sm:text-3xl font-black mb-4 flex items-center gap-2" style="color:#3D2010;">
        <span class="w-1 h-5 rounded-full inline-block" style="background:#C8961E;"></span>
        五維度認知評估
        <span class="ml-auto text-lg font-semibold px-3 py-0.5 rounded-full"
              :style="hasData
                ? 'background:rgba(200,150,30,0.12);color:#C8961E;'
                : 'background:rgba(0,0,0,0.05);color:#9B7040;'">
          {{ hasData ? '即時數據' : '基準線' }}
        </span>
      </h3>
      <div class="grid grid-cols-1 lg:grid-cols-[1.05fr_1.2fr] gap-4 lg:gap-5 items-start">
        <div class="rounded-2xl p-4 sm:p-5" style="background:#FAF5ED;border:1px solid rgba(200,150,30,0.12);">
          <div class="relative w-full h-[300px] lg:h-[390px] flex justify-center items-center">
            <Radar :data="chartData" :options="chartOptions" />
          </div>
        </div>

        <div>
          <div class="grid gap-2.5">
            <div v-for="item in dimensionBreakdown" :key="item.key"
                 class="rounded-2xl px-5 py-4"
                 style="background:#FAF5ED;border:1px solid rgba(200,150,30,0.12);">
              <div class="flex items-center justify-between gap-3 mb-1.5">
                <div class="text-xl font-black" style="color:#3D2010;">{{ item.label }}</div>
                <div class="flex items-center gap-2">
                  <span class="text-lg font-semibold" style="color:#9B7040;">{{ item.current }} / {{ item.baseline }}</span>
                  <span class="text-lg font-black px-2.5 py-0.5 rounded-full"
                        :style="trendBadgeStyle(item.trend)">
                    {{ trendLabel(item.trend) }}
                  </span>
                </div>
              </div>
              <div class="h-2.5 rounded-full overflow-hidden" style="background:rgba(200,150,30,0.12);">
                <div class="h-full rounded-full transition-all duration-500"
                     :style="{ width: item.current + '%', background: trendBarColor(item.trend) }"></div>
              </div>
            </div>
          </div>

          <div class="mt-4 text-lg sm:text-xl leading-relaxed" style="color:#7A5030;">
            <span class="font-bold">進步：</span>{{ improvingSummary }}
            <span class="mx-2">|</span>
            <span class="font-bold">卡住：</span>{{ stuckSummary }}
          </div>
        </div>
      </div>
    </section>

    <!-- ── 最近遊玩紀錄 ── -->
    <section v-if="hasData" class="rounded-3xl p-7 mb-7"
             style="background:#FFFDF8;border:1px solid rgba(200,150,30,0.2);box-shadow:0 8px 32px rgba(120,70,20,0.08);">
      <h3 class="text-2xl sm:text-3xl font-black mb-4 flex items-center gap-2" style="color:#3D2010;">
        <span class="w-1 h-5 rounded-full inline-block" style="background:#C8961E;"></span>
        最近遊玩紀錄
      </h3>
      <div class="space-y-2.5">
        <div v-for="s in recentSessions" :key="s.timestamp"
             class="flex items-center justify-between py-3 border-b last:border-0"
             style="border-color:rgba(200,150,30,0.1);">
          <div class="flex items-center gap-3">
            <span class="text-3xl">{{ gameEmoji[s.gameId] ?? '🎮' }}</span>
            <span class="text-xl font-semibold" style="color:#3D2010;">{{ gameName[s.gameId] ?? s.gameId }}</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-28 h-2.5 rounded-full overflow-hidden" style="background:rgba(200,150,30,0.12);">
              <div class="h-full rounded-full transition-all"
                   :style="{ width: s.score + '%', background: scoreGradient(s.score) }"></div>
            </div>
            <span class="text-3xl font-black w-14 text-right leading-none" :style="{ color: scoreColor(s.score) }">
              {{ s.score }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── No data placeholder ── -->
    <section v-if="!hasData" class="rounded-3xl p-9 text-center"
             style="background:#FFFDF8;border:1px solid rgba(200,150,30,0.2);box-shadow:0 8px 32px rgba(120,70,20,0.08);">
      <div class="text-6xl mb-4">🎮</div>
      <p class="text-3xl font-bold" style="color:#7A5030;">尚無遊玩紀錄</p>
      <p class="text-xl mt-1" style="color:#B89060;">完成任一遊戲後，數據將自動更新</p>
    </section>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS, RadialLinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend,
} from 'chart.js'
import { Radar } from 'vue-chartjs'
import { useGameStore } from '../stores/gameStore'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const store = useGameStore()

// ── Basic computed ─────────────────────────────────────────────
const hasData = computed(() => store.hasData)
const recentSessions = computed(() => store.recentSessions)

const gameEmoji = { music: '🎵', shopping: '🥫', cooking: '🍲', puppet: '🎭', riddle: '🎶', puzzle: '🧩' }
const gameName  = { music: '懷舊音樂節拍', shopping: '柑仔店採買記', cooking: '阿嬤的家常菜', puppet: '廟口布袋戲', riddle: '老歌猜謎', puzzle: '廟口大拼圖' }

const lastPlayedLabel = computed(() => {
  if (!store.recentSessions.length) return ''
  const diff = Date.now() - store.recentSessions[0].timestamp
  if (diff < 60000)    return '剛才'
  if (diff < 3600000)  return `${Math.floor(diff / 60000)} 分鐘前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小時前`
  return `${Math.floor(diff / 86400000)} 天前`
})

// ── Today stats ────────────────────────────────────────────────
const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
const todaySessions = computed(() =>
  store.sessions.filter(s => s.timestamp >= todayStart.getTime())
)
const gameDuration = { music: 1, shopping: 2, cooking: 2, puppet: 3, riddle: 3, puzzle: 4 }
const todayMinutes = computed(() =>
  todaySessions.value.reduce((sum, s) => sum + (gameDuration[s.gameId] ?? 3), 0)
)
const todayCount = computed(() => todaySessions.value.length)
const weeklyCount = computed(() => {
  const cutoff = Date.now() - 7 * 86400000
  return store.sessions.filter(s => s.timestamp >= cutoff).length
})

// ── Dimension scores ───────────────────────────────────────────
const d = computed(() => store.latestByDimension)
const dimensionBreakdown = computed(() => store.dimensionBreakdown)

const handEyeScore = computed(() => {
  const vals = [d.value.reactionSpeed, d.value.attention].filter(v => v != null)
  return vals.length ? Math.round(vals.reduce((a, b) => a + b) / vals.length) : 72
})

const cognitiveScore = computed(() => {
  const baseline = [82, 65, 88, 75, 70]
  const live = store.radarCurrent
  return Math.round(live.reduce((a, b) => a + b, 0) / live.length)
})

// ── Sparkline (last 6 sessions) ────────────────────────────────
const sparkPoints = computed(() => {
  const data = store.sessions.length >= 2
    ? store.sessions.slice(-6).map(s => s.score)
    : []
  if (data.length < 2) return []
  return data.map((v, i) => [
    10 + (i / (data.length - 1)) * 100,
    6 + (1 - v / 100) * 36,
  ])
})

const trendUp = computed(() => {
  if (sparkPoints.value.length < 2) return false
  const pts = sparkPoints.value
  return pts[pts.length - 1][1] < pts[0][1] // lower y = higher score
})

// ── AI insight text ────────────────────────────────────────────
const aiInsight = computed(() => {
  if (!hasData.value) return '歡迎使用金憶！開始遊玩後，AI 將為您分析認知健康狀態。'
  if (store.alertMessage) return store.alertMessage
  const improvingCount = dimensionBreakdown.value.filter(item => item.trend === 'improving').length
  const stuckCount = dimensionBreakdown.value.filter(item => item.trend !== 'improving').length
  const s = cognitiveScore.value
  if (s >= 85) return `各項認知指標表現優異！目前 ${improvingCount} 項能力正在進步，請持續維持練習節奏。`
  if (s >= 70) return `整體表現良好。目前 ${improvingCount} 項進步、${stuckCount} 項卡住，建議優先加強卡住面向。`
  return '認知訓練有進步空間，建議每天進行 2–3 場遊戲，並優先選擇「記憶類」遊戲練習。'
})

const trendLabel = (trend) => {
  if (trend === 'improving') return '進步'
  if (trend === 'declining') return '下滑'
  return '穩定'
}

const trendBadgeStyle = (trend) => {
  if (trend === 'improving') return 'background:rgba(40,170,110,0.16);color:#10905E;'
  if (trend === 'declining') return 'background:rgba(200,80,70,0.15);color:#B44335;'
  return 'background:rgba(200,150,30,0.16);color:#9A6A10;'
}

const trendBarColor = (trend) => {
  if (trend === 'improving') return 'linear-gradient(90deg, #1E9E6A, #2FC28A)'
  if (trend === 'declining') return 'linear-gradient(90deg, #C95445, #E07A66)'
  return 'linear-gradient(90deg, #C8961E, #D9AE49)'
}

const improvingSummary = computed(() => {
  const items = dimensionBreakdown.value.filter(item => item.trend === 'improving').map(item => item.label)
  return items.length ? items.join('、') : '目前尚無明顯進步面向'
})

const stuckSummary = computed(() => {
  const items = dimensionBreakdown.value
    .filter(item => item.trend !== 'improving')
    .map(item => item.label)
  return items.length ? items.join('、') : '目前全部面向皆穩定進步'
})

// ── Score color helpers ─────────────────────────────────────────
const scoreColor = (score) =>
  score >= 80 ? '#C8961E' : score >= 60 ? '#D4804A' : '#C04030'
const scoreGradient = (score) =>
  score >= 80
    ? 'linear-gradient(90deg, #C8961E, #E0B030)'
    : score >= 60
    ? 'linear-gradient(90deg, #D4804A, #E06030)'
    : 'linear-gradient(90deg, #C04030, #E04040)'

// ── Radar chart ─────────────────────────────────────────────────
const chartData = computed(() => ({
  labels: ['記憶力', '注意力', '執行力', '視覺空間', '反應力'],
  datasets: [
    ...(hasData.value ? [{
      label: '當前指數',
      backgroundColor: 'rgba(200,150,30,0.18)',
      borderColor: '#C8961E',
      pointBackgroundColor: '#C8961E',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      data: store.radarCurrent,
      borderWidth: 2,
    }] : []),
    {
      label: '基準線 (上月)',
      backgroundColor: 'rgba(155,112,64,0.06)',
      borderColor: 'rgba(155,112,64,0.4)',
      pointBackgroundColor: 'rgba(155,112,64,0.4)',
      pointBorderColor: '#fff',
      borderDash: [5, 5],
      data: store.radarBaseline,
      borderWidth: 1.5,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      angleLines: { color: 'rgba(100,60,20,0.08)' },
      grid:       { color: 'rgba(100,60,20,0.08)' },
      pointLabels: {
        font: { family: 'Outfit, Noto Sans TC', size: 19, weight: '700' },
        color: '#7A5030',
      },
      ticks: { display: false, min: 0, max: 100 },
    },
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        font: { family: 'Outfit, Noto Sans TC', size: 17 },
        usePointStyle: true,
        padding: 20,
        color: '#9B7040',
      },
    },
    tooltip: {
      backgroundColor: 'rgba(61,32,16,0.92)',
      titleFont: { size: 18, family: 'Outfit, Noto Sans TC' },
      bodyFont:  { size: 17, family: 'Outfit, Noto Sans TC' },
      padding: 14,
      cornerRadius: 10,
    },
  },
}
</script>
