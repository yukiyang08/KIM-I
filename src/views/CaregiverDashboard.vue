<template>
  <div class="h-full w-full overflow-y-auto font-['Outfit','Noto_Sans_TC']"
       style="background: #F2F4F7;">

    <!-- Sticky header -->
    <header class="sticky top-0 z-20 px-5 sm:px-8 py-4 flex items-center justify-between gap-4"
            style="background: #1A160E; border-bottom: 1px solid rgba(200,148,40,0.14);">
      <div>
        <div class="text-[10px] sm:text-xs font-bold tracking-[0.22em] uppercase mb-0.5"
             style="color: rgba(242,207,134,0.38);">機構照護系統</div>
        <h1 class="font-black text-lg sm:text-2xl" style="color: #F2CF86; font-family:'Noto Serif TC',serif;">
          樂活日照中心
        </h1>
      </div>
      <div class="flex items-center gap-2 sm:gap-3">
        <span class="text-xs sm:text-sm hidden sm:block" style="color: rgba(242,207,134,0.32);">{{ todayLabel }}</span>
        <a href="/dashboard/family"
           class="text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full"
           style="background:rgba(242,207,134,0.08); color:rgba(242,207,134,0.62); border:1px solid rgba(242,207,134,0.14);">
          個人版 ↗
        </a>
        <button class="text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full"
                style="background:rgba(200,150,30,0.18); color:#F2CF86; border:1px solid rgba(200,150,30,0.3);">
          📋 匯出
        </button>
      </div>
    </header>

    <div class="px-4 sm:px-8 pt-5 pb-10 max-w-[1280px] mx-auto">

      <!-- Summary stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div class="rounded-2xl p-4 sm:p-5"
             style="background:white; border:1px solid rgba(0,0,0,0.06); box-shadow:0 2px 12px rgba(0,0,0,0.04);">
          <div class="text-3xl sm:text-4xl font-black leading-none mb-1" style="color:#3D2010;">{{ patients.length }}</div>
          <div class="text-xs sm:text-sm font-semibold" style="color:#9B7040;">服務人數</div>
        </div>
        <div class="rounded-2xl p-4 sm:p-5"
             style="background:white; border:1px solid rgba(0,0,0,0.06); box-shadow:0 2px 12px rgba(0,0,0,0.04);">
          <div class="text-3xl sm:text-4xl font-black leading-none mb-1" style="color:#1E9E6A;">{{ todayActiveCount }}</div>
          <div class="text-xs sm:text-sm font-semibold" style="color:#9B7040;">今日出席</div>
          <div class="text-[10px] sm:text-xs mt-0.5" style="color:#9B9080;">共 {{ patients.length }} 位</div>
        </div>
        <div class="rounded-2xl p-4 sm:p-5"
             style="background:white; border:1px solid rgba(0,0,0,0.06); box-shadow:0 2px 12px rgba(0,0,0,0.04);">
          <div class="text-3xl sm:text-4xl font-black leading-none mb-1" style="color:#C8961E;">{{ lowEngagementCount }}</div>
          <div class="text-xs sm:text-sm font-semibold" style="color:#9B7040;">本週低參與</div>
          <div class="text-[10px] sm:text-xs mt-0.5" style="color:#9B9080;">週場次 &lt; 2</div>
        </div>
        <div class="rounded-2xl p-4 sm:p-5"
             style="background:white; border:1px solid rgba(0,0,0,0.06); box-shadow:0 2px 12px rgba(0,0,0,0.04);">
          <div class="text-3xl sm:text-4xl font-black leading-none mb-1" style="color:#3D2010;">{{ avgWeeklySessions }}</div>
          <div class="text-xs sm:text-sm font-semibold" style="color:#9B7040;">平均週場次</div>
          <div class="text-[10px] sm:text-xs mt-0.5" style="color:#9B9080;">每位使用者</div>
        </div>
      </div>

      <!-- Alert strip -->
      <div v-if="inactivePatients.length"
           class="rounded-2xl px-5 py-3.5 mb-4 flex flex-wrap items-center gap-x-4 gap-y-2"
           style="background:rgba(200,140,20,0.07); border:1.5px solid rgba(200,140,20,0.25);">
        <span class="text-sm font-black shrink-0" style="color:#7A4C00;">⚠ 長期未使用</span>
        <div v-for="p in inactivePatients" :key="p.id"
             class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold"
             style="background:rgba(200,140,20,0.12); color:#6A3C00;">
          {{ p.avatar }} {{ p.name }}
          <span class="font-normal opacity-60">· {{ p.lastActiveDays }} 天</span>
        </div>
      </div>

      <!-- Filter tabs -->
      <div class="flex items-center gap-2 mb-3">
        <button v-for="tab in TABS" :key="tab.key"
                @click="activeFilter = tab.key"
                class="px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all"
                :style="activeFilter === tab.key
                  ? 'background:#3D2010; color:white; box-shadow:0 2px 8px rgba(0,0,0,0.18);'
                  : 'background:rgba(0,0,0,0.05); color:#9B7040;'">
          {{ tab.label }}
          <span v-if="tab.key !== 'all'" class="ml-1 opacity-60">({{ tabCount(tab.key) }})</span>
        </button>
      </div>

      <!-- Patient table -->
      <div class="rounded-2xl overflow-hidden"
           style="background:white; border:1px solid rgba(0,0,0,0.07); box-shadow:0 2px 16px rgba(0,0,0,0.05);">

        <!-- Desktop header -->
        <div class="hidden sm:grid px-5 py-3 text-xs font-black uppercase tracking-[0.14em] border-b"
             style="color:#A08050; border-color:rgba(0,0,0,0.06);
                    grid-template-columns: 2fr 1fr 1fr 1.6fr 2.2fr auto;">
          <div>姓名</div>
          <div class="text-center">上次使用</div>
          <div class="text-center">本週場次</div>
          <div class="text-center">7 天活動</div>
          <div class="text-center">認知五維</div>
          <div></div>
        </div>

        <!-- Rows -->
        <template v-if="filteredPatients.length">
          <div v-for="p in filteredPatients" :key="p.id">

            <!-- Desktop row -->
            <div class="hidden sm:grid px-5 py-4 border-b last:border-0 items-center transition-colors hover:bg-[#FDFAF6]"
                 style="border-color:rgba(0,0,0,0.04); grid-template-columns: 2fr 1fr 1fr 1.6fr 2.2fr auto;">

              <!-- Name -->
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
                     style="background:#F5E8C8;">{{ p.avatar }}</div>
                <div class="min-w-0">
                  <div class="font-black text-sm truncate" style="color:#3D2010;">{{ p.name }}</div>
                  <div class="text-xs" style="color:#9B7040;">{{ p.age }} 歲</div>
                </div>
              </div>

              <!-- Last active -->
              <div class="text-center text-sm font-semibold" :style="lastActiveStyle(p.lastActiveDays)">
                {{ p.lastActiveLabel }}
              </div>

              <!-- Weekly count -->
              <div class="text-center">
                <span class="text-xl font-black"
                      :style="{ color: p.weeklyCount >= 4 ? '#1E9E6A' : p.weeklyCount >= 2 ? '#B8860B' : '#C04030' }">
                  {{ p.weeklyCount }}
                </span>
                <span class="text-xs ml-0.5" style="color:#9B7040;">場</span>
              </div>

              <!-- 7-day dots -->
              <div class="flex items-center justify-center gap-1.5">
                <div v-for="(active, di) in patientWeekDays(p)" :key="di"
                     class="w-4 h-4 rounded-full"
                     :title="WEEK_LABELS[di]"
                     :style="active ? 'background:#1E9E6A;' : 'background:rgba(0,0,0,0.08);'">
                </div>
              </div>

              <!-- Dimension micro-bars -->
              <div class="flex flex-col gap-1 px-2">
                <div v-for="(score, di) in p.dimensions" :key="di"
                     class="flex items-center gap-1.5">
                  <div class="text-[9px] shrink-0 text-right" style="width:2rem; color:#C8A86A;">
                    {{ DIMENSION_LABELS[di] }}
                  </div>
                  <div class="flex-1 h-1.5 rounded-full overflow-hidden" style="background:rgba(0,0,0,0.07);">
                    <div class="h-full rounded-full transition-all duration-500"
                         :style="{
                           width: score + '%',
                           background: score >= 75 ? '#1E9E6A' : score >= 55 ? '#C8961E' : '#C04030',
                         }"></div>
                  </div>
                  <div class="text-[9px] shrink-0" :style="{ color: score >= 75 ? '#1E9E6A' : score >= 55 ? '#B8860B' : '#C04030' }">
                    {{ score }}
                  </div>
                </div>
              </div>

              <!-- Detail -->
              <button class="text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg whitespace-nowrap"
                      style="color:#C8961E; background:rgba(200,150,30,0.09); border:1px solid rgba(200,150,30,0.18);"
                      @click="goDetail(p)">
                詳細 →
              </button>
            </div>

            <!-- Mobile card -->
            <div class="sm:hidden px-4 py-4 border-b last:border-0"
                 style="border-color:rgba(0,0,0,0.06);">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0"
                     style="background:#F5E8C8;">{{ p.avatar }}</div>
                <div class="flex-1 min-w-0">
                  <div class="font-black text-base truncate" style="color:#3D2010;">{{ p.name }}</div>
                  <div class="text-sm" :style="lastActiveStyle(p.lastActiveDays)">{{ p.age }} 歲 · {{ p.lastActiveLabel }}</div>
                </div>
                <div class="text-right shrink-0">
                  <span class="text-xl font-black"
                        :style="{ color: p.weeklyCount >= 4 ? '#1E9E6A' : p.weeklyCount >= 2 ? '#B8860B' : '#C04030' }">
                    {{ p.weeklyCount }}
                  </span>
                  <div class="text-xs" style="color:#9B7040;">場/週</div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-1 shrink-0">
                  <div v-for="(active, di) in patientWeekDays(p)" :key="di"
                       class="w-3 h-3 rounded-full"
                       :style="active ? 'background:#1E9E6A;' : 'background:rgba(0,0,0,0.08);'">
                  </div>
                </div>
                <div class="flex-1 flex items-end gap-0.5 h-6">
                  <div v-for="(score, di) in p.dimensions" :key="di"
                       class="flex-1 rounded-sm"
                       :style="{
                         height: Math.max(3, score / 100 * 22) + 'px',
                         background: score >= 75 ? '#1E9E6A' : score >= 55 ? '#C8961E' : '#C04030',
                         opacity: 0.8,
                       }"></div>
                </div>
                <button class="text-sm font-bold px-3 py-1.5 rounded-lg shrink-0"
                        style="color:#C8961E; background:rgba(200,150,30,0.09); border:1px solid rgba(200,150,30,0.18);"
                        @click="goDetail(p)">
                  詳細 →
                </button>
              </div>
            </div>

          </div>
        </template>

        <!-- Empty state -->
        <div v-else class="py-12 text-center" style="color:#9B7040;">
          <div class="text-3xl mb-2">🔍</div>
          <div class="font-semibold text-sm">此篩選條件無符合的使用者</div>
        </div>

      </div>

      <!-- Legend -->
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-4 text-xs" style="color:#A08050;">
        <span class="font-bold">認知五維（上→下）：</span>
        <span v-for="l in DIMENSION_LABELS_FULL" :key="l">{{ l }}</span>
      </div>
      <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs" style="color:#A08050;">
        <span class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-sm inline-block" style="background:#1E9E6A;"></span>良好 ≥ 75
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-sm inline-block" style="background:#C8961E;"></span>觀察 55–74
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-sm inline-block" style="background:#C04030;"></span>偏低 &lt; 55
        </span>
        <span class="flex items-center gap-1.5 ml-4">
          <span class="w-4 h-4 rounded-full inline-block" style="background:#1E9E6A;"></span>7天有使用
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-4 h-4 rounded-full inline-block" style="background:rgba(0,0,0,0.08);"></span>未使用
        </span>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'

const router = useRouter()
const store  = useGameStore()

const DIMENSION_LABELS      = ['記憶','注意','執行','視覺','反應']
const DIMENSION_LABELS_FULL = ['記憶力','注意力','執行力','視覺空間','反應力']
const WEEK_LABELS = ['一','二','三','四','五','六','日']

const TABS = [
  { key: 'all',       label: '全部' },
  { key: 'attention', label: '需關注' },
  { key: 'active',    label: '活躍中' },
]

const activeFilter = ref('all')

const todayLabel = computed(() => {
  const d = new Date()
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`
})

// Live patient (陳金美) from store
const liveWeeklyCount    = computed(() => store.sessions.filter(s => s.timestamp >= Date.now() - 7 * 86400000).length)
const liveLastActiveDays = computed(() => {
  if (!store.sessions.length) return 99
  return Math.floor((Date.now() - store.sessions.slice(-1)[0].timestamp) / 86400000)
})
const liveDimensions = computed(() => store.radarCurrent.map(Math.round))

const STATIC_PATIENTS = [
  { id:2, name:'林阿義', age:81, avatar:'👴', weeklyCount:2, lastActiveDays:2,  dimensions:[70,58,72,68,55] },
  { id:3, name:'王秀英', age:68, avatar:'👵', weeklyCount:5, lastActiveDays:0,  dimensions:[85,78,90,80,75] },
  { id:4, name:'黃德明', age:77, avatar:'👴', weeklyCount:0, lastActiveDays:8,  dimensions:[52,48,60,55,45] },
  { id:5, name:'李春花', age:72, avatar:'👵', weeklyCount:3, lastActiveDays:1,  dimensions:[75,62,80,70,65] },
  { id:6, name:'張清水', age:85, avatar:'👴', weeklyCount:1, lastActiveDays:4,  dimensions:[48,44,55,50,42] },
]

const lastActiveLabel = (days) => days === 0 ? '今天' : days === 1 ? '昨天' : `${days} 天前`

const patients = computed(() => [
  {
    id:1, name:'陳金美', age:75, avatar:'👵',
    weeklyCount: liveWeeklyCount.value,
    lastActiveDays: liveLastActiveDays.value,
    lastActiveLabel: lastActiveLabel(liveLastActiveDays.value),
    dimensions: liveDimensions.value,
  },
  ...STATIC_PATIENTS.map(p => ({ ...p, lastActiveLabel: lastActiveLabel(p.lastActiveDays) })),
])

// Filters
const filteredPatients = computed(() => {
  if (activeFilter.value === 'attention') return patients.value.filter(p => p.lastActiveDays >= 3 || p.weeklyCount < 2)
  if (activeFilter.value === 'active')    return patients.value.filter(p => p.weeklyCount >= 3)
  return patients.value
})

const tabCount = (key) => {
  if (key === 'attention') return patients.value.filter(p => p.lastActiveDays >= 3 || p.weeklyCount < 2).length
  if (key === 'active')    return patients.value.filter(p => p.weeklyCount >= 3).length
  return patients.value.length
}

// 7-day dots per patient (Mon–Sun of current week)
const patientWeekDays = (p) => {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const dow = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))
  const todayIdx = dow === 0 ? 6 : dow - 1  // Mon=0 index in current week

  if (p.id === 1) {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday); date.setDate(monday.getDate() + i)
      if (date.getTime() > today.getTime()) return false
      return store.sessions.some(s => {
        const sd = new Date(s.timestamp); sd.setHours(0, 0, 0, 0)
        return sd.getTime() === date.getTime()
      })
    })
  }
  // Static patients: spread weeklyCount days deterministically
  const days = Array(7).fill(false)
  const seed = p.id % 7
  for (let i = 0; i < p.weeklyCount && i < 7; i++) {
    days[(i * 3 + seed) % 7] = true
  }
  // Don't mark future days
  for (let i = todayIdx + 1; i < 7; i++) days[i] = false
  return days
}

// Aggregates
const inactivePatients   = computed(() => patients.value.filter(p => p.lastActiveDays >= 7))
const todayActiveCount   = computed(() => patients.value.filter(p => p.lastActiveDays === 0).length)
const lowEngagementCount = computed(() => patients.value.filter(p => p.weeklyCount < 2).length)
const avgWeeklySessions  = computed(() => {
  const total = patients.value.reduce((sum, p) => sum + p.weeklyCount, 0)
  return (total / patients.value.length).toFixed(1)
})

const lastActiveStyle = (days) => {
  if (days >= 7) return 'color:#C04030; font-weight:700;'
  if (days >= 3) return 'color:#C8961E;'
  return 'color:#1E9E6A;'
}

const goDetail = (p) => router.push({ name: 'dashboard-family' })
</script>
