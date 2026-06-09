<template>
  <div class="h-full w-full overflow-y-auto pb-[110px] px-4 sm:px-8 pt-6 font-['Outfit','Noto_Sans_TC']"
       style="background: #F8F4EE;">

    <!-- Header -->
    <header class="flex items-center gap-4 mb-5">
      <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shrink-0"
           style="background: linear-gradient(135deg, #F5D98A, #C8961E); box-shadow: 0 4px 16px rgba(200,150,30,0.28);">
        <span class="text-2xl sm:text-3xl">👵</span>
      </div>
      <div class="flex-1 min-w-0">
        <h2 class="font-black tracking-tight truncate" style="font-size: clamp(1.4rem, 5vw, 2.2rem); color:#3D2010;">
          陳金美 奶奶
        </h2>
        <p class="text-sm sm:text-base font-medium mt-0.5" style="color:#9B7040;">
          {{ hasData ? `上次活動：${lastPlayedLabel}` : '還沒有開始玩遊戲' }}
        </p>
      </div>
      <a href="/dashboard"
         class="shrink-0 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full transition-all"
         style="color:#9B7040; border:1px solid rgba(155,112,64,0.3);"
         @mouseover="e => e.currentTarget.style.background='rgba(200,150,30,0.08)'"
         @mouseleave="e => e.currentTarget.style.background='transparent'">
        機構版 →
      </a>
    </header>

    <!-- Weekly summary card -->
    <section class="rounded-2xl p-5 sm:p-6 mb-4 overflow-hidden"
             style="background: linear-gradient(135deg, #FFF8EC, #FFF3DC);
                    border: 1.5px solid rgba(200,150,30,0.3);
                    box-shadow: 0 4px 20px rgba(120,70,20,0.09);">
      <div class="flex items-start gap-4">
        <div class="text-4xl sm:text-5xl leading-none shrink-0">{{ weeklyEmoji }}</div>
        <div>
          <div class="text-xs font-bold uppercase tracking-widest mb-1" style="color:#C8961E;">本週總結</div>
          <p class="text-base sm:text-lg leading-relaxed font-medium" style="color:#3D2010;">
            {{ weeklySummary }}
          </p>
        </div>
      </div>
    </section>

    <!-- Four key stats -->
    <div class="grid grid-cols-4 gap-2 sm:gap-3 mb-4">
      <div v-for="stat in keyStats" :key="stat.label"
           class="rounded-xl p-3 sm:p-4 text-center"
           style="background:white; border:1px solid rgba(200,150,30,0.13); box-shadow:0 2px 10px rgba(120,70,20,0.05);">
        <div class="font-black leading-none mb-1" style="font-size:clamp(1.3rem,4vw,1.9rem);"
             :style="{ color: stat.color }">
          {{ stat.value }}<span v-if="stat.unit" class="text-xs font-semibold ml-0.5">{{ stat.unit }}</span>
        </div>
        <div class="text-xs font-semibold" style="color:#9B7040;">{{ stat.label }}</div>
      </div>
    </div>

    <!-- 7-day activity calendar -->
    <section class="rounded-2xl p-5 sm:p-6 mb-4"
             style="background:white; border:1px solid rgba(200,150,30,0.13); box-shadow:0 2px 10px rgba(120,70,20,0.05);">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base sm:text-lg font-black flex items-center gap-2" style="color:#3D2010;">
          <span class="w-1 h-4 rounded-full shrink-0 inline-block" style="background:#C8961E;"></span>
          本週出席紀錄
        </h3>
        <span class="text-xs font-semibold px-2.5 py-1 rounded-full"
              style="background:rgba(200,150,30,0.1); color:#9B7040;">
          {{ weeklyCount }} / 7 天
        </span>
      </div>
      <div class="grid grid-cols-7 gap-1 sm:gap-1.5">
        <div v-for="(day, i) in weekDays" :key="i" class="flex flex-col items-center gap-1">
          <div class="text-[10px] font-semibold" style="color:rgba(155,112,64,0.5);">{{ day.label }}</div>
          <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold transition-all text-sm"
               :style="day.active
                 ? 'background:linear-gradient(135deg,#D4A020,#8B6000);color:white;box-shadow:0 3px 10px rgba(200,120,0,0.28);'
                 : day.isFuture
                   ? 'background:rgba(200,150,30,0.04);color:rgba(155,112,64,0.15);'
                   : 'background:rgba(200,150,30,0.08);color:rgba(155,112,64,0.3);'">
            {{ day.active ? '✓' : day.isFuture ? '' : '·' }}
          </div>
          <div v-if="day.isToday" class="text-[9px] font-bold" style="color:#C8961E;">今天</div>
        </div>
      </div>
    </section>

    <!-- 五個面向：horizontal progress bars -->
    <section class="rounded-2xl p-5 sm:p-6 mb-4"
             style="background:white; border:1px solid rgba(200,150,30,0.13); box-shadow:0 2px 10px rgba(120,70,20,0.05);">
      <h3 class="text-base sm:text-lg font-black mb-5 flex items-center gap-2" style="color:#3D2010;">
        <span class="w-1 h-4 rounded-full shrink-0 inline-block" style="background:#C8961E;"></span>
        腦力狀態一覽
      </h3>
      <div class="space-y-3.5">
        <div v-for="item in dimensionBreakdown" :key="item.key"
             class="flex items-center gap-2 sm:gap-3">
          <div class="text-xs sm:text-sm font-bold text-right shrink-0"
               style="width:3.8rem; color:#7A5030;">{{ item.label }}</div>
          <div class="flex-1 h-2.5 rounded-full overflow-hidden"
               style="background:rgba(200,150,30,0.1);">
            <div class="h-full rounded-full transition-all duration-700"
                 :style="{ width: item.current + '%', background: dimensionColor(item.trend) }">
            </div>
          </div>
          <div class="shrink-0 flex items-center gap-1" style="min-width:4rem; justify-content:flex-end;">
            <span class="text-xs font-black" :style="{ color: dimensionColor(item.trend) }">
              {{ item.trend === 'improving' ? '▲' : item.trend === 'declining' ? '▼' : '—' }}
            </span>
            <span class="text-xs font-bold px-1.5 py-0.5 rounded-full"
                  :style="trendBadgeStyle(item.trend)">
              {{ item.trend === 'improving' ? '進步' : item.trend === 'declining' ? '加強' : '穩定' }}
            </span>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-4 mt-5 pt-4 flex-wrap text-xs"
           style="border-top:1px solid rgba(200,150,30,0.1); color:#9B7040;">
        <span>相較上月基準：</span>
        <span style="color:#1E9E6A;">▲ 進步</span>
        <span style="color:#C8961E;">— 穩定</span>
        <span style="color:#C04030;">▼ 需加強</span>
      </div>
    </section>

    <!-- 家屬建議 -->
    <section class="rounded-2xl p-5 sm:p-6 mb-4"
             style="background:white; border:1px solid rgba(200,150,30,0.13); box-shadow:0 2px 10px rgba(120,70,20,0.05);">
      <h3 class="text-base sm:text-lg font-black mb-4 flex items-center gap-2" style="color:#3D2010;">
        <span class="w-1 h-4 rounded-full shrink-0 inline-block" style="background:#C8961E;"></span>
        家屬可以這樣做
      </h3>
      <div class="space-y-3">
        <div v-for="(s, i) in familySuggestions" :key="i"
             class="flex items-start gap-3 rounded-xl p-4"
             style="background:#FAF5ED; border:1px solid rgba(200,150,30,0.1);">
          <span class="text-2xl shrink-0 leading-none mt-0.5">{{ s.emoji }}</span>
          <div>
            <div class="text-sm sm:text-base font-bold mb-0.5" style="color:#3D2010;">{{ s.title }}</div>
            <div class="text-xs sm:text-sm leading-relaxed" style="color:#7A5030;">{{ s.desc }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 最近遊玩紀錄 -->
    <section v-if="hasData" class="rounded-2xl p-5 sm:p-6 mb-4"
             style="background:white; border:1px solid rgba(200,150,30,0.13); box-shadow:0 2px 10px rgba(120,70,20,0.05);">
      <h3 class="text-base sm:text-lg font-black mb-4 flex items-center gap-2" style="color:#3D2010;">
        <span class="w-1 h-4 rounded-full shrink-0 inline-block" style="background:#C8961E;"></span>
        最近玩了什麼
      </h3>
      <div>
        <div v-for="s in recentSessions" :key="s.timestamp"
             class="flex items-center gap-3 py-3 border-b last:border-0"
             style="border-color:rgba(200,150,30,0.1);">
          <span class="text-xl sm:text-2xl shrink-0">{{ gameEmoji[s.gameId] ?? '🎮' }}</span>
          <span class="flex-1 text-sm sm:text-base font-semibold" style="color:#3D2010;">
            {{ gameName[s.gameId] ?? s.gameId }}
          </span>
          <span class="text-lg shrink-0">{{ scoreEmoji(s.score) }}</span>
          <span class="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
                :style="scoreStyle(s.score)">
            {{ scoreFeeling(s.score) }}
          </span>
        </div>
      </div>
    </section>

    <!-- No data -->
    <section v-if="!hasData" class="rounded-2xl p-8 text-center"
             style="background:white; border:1px solid rgba(200,150,30,0.13);">
      <div class="text-5xl mb-4">🌻</div>
      <p class="text-lg sm:text-xl font-bold mb-1" style="color:#7A5030;">奶奶還沒開始玩遊戲</p>
      <p class="text-sm sm:text-base" style="color:#B89060;">陪她玩一局，數據就會出現囉！</p>
    </section>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'

const store = useGameStore()

const hasData         = computed(() => store.hasData)
const recentSessions  = computed(() => store.recentSessions)
const dimensionBreakdown = computed(() => store.dimensionBreakdown)

const gameEmoji = { music:'🎵', shopping:'🥫', cooking:'🍲', puppet:'🎭', riddle:'🎶', puzzle:'🧩' }
const gameName  = { music:'懷舊音樂', shopping:'柑仔店採買', cooking:'阿嬤家常菜', puppet:'廟口布袋戲', riddle:'老歌猜謎', puzzle:'廟口大拼圖' }

const lastPlayedLabel = computed(() => {
  if (!store.recentSessions.length) return ''
  const diff = Date.now() - store.recentSessions[0].timestamp
  if (diff < 60000)    return '剛才'
  if (diff < 3600000)  return `${Math.floor(diff / 60000)} 分鐘前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小時前`
  return `${Math.floor(diff / 86400000)} 天前`
})

const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
const todaySessions = computed(() => store.sessions.filter(s => s.timestamp >= todayStart.getTime()))
const gameDuration  = { music:1, shopping:2, cooking:2, puppet:3, riddle:3, puzzle:4 }
const todayMinutes  = computed(() => todaySessions.value.reduce((sum, s) => sum + (gameDuration[s.gameId] ?? 3), 0))

const weeklyCount = computed(() => {
  const cutoff = Date.now() - 7 * 86400000
  return store.sessions.filter(s => s.timestamp >= cutoff).length
})

const favoriteGameEmoji = computed(() => {
  if (!store.sessions.length) return '🎮'
  const freq = {}
  store.sessions.forEach(s => { freq[s.gameId] = (freq[s.gameId] ?? 0) + 1 })
  return gameEmoji[Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0]] ?? '🎮'
})

const streak = computed(() => {
  if (!store.sessions.length) return 0
  let count = 0
  const check = new Date(); check.setHours(0, 0, 0, 0)
  while (true) {
    const ms = check.getTime()
    const played = store.sessions.some(s => {
      const d = new Date(s.timestamp); d.setHours(0, 0, 0, 0)
      return d.getTime() === ms
    })
    if (!played) break
    count++
    check.setDate(check.getDate() - 1)
  }
  return count
})

const keyStats = computed(() => [
  { label: '本週場次', value: weeklyCount.value,  unit: '',  color: '#C8961E' },
  { label: '最愛遊戲', value: favoriteGameEmoji.value, unit: '', color: '#3D2010' },
  { label: '今日時長', value: todayMinutes.value,  unit: '分', color: '#1E9E6A' },
  { label: '連續打卡', value: streak.value || 0,   unit: streak.value ? '天' : '',  color: '#C8961E' },
])

// Mon–Sun calendar for current week
const weekDays = computed(() => {
  const LABELS = ['一','二','三','四','五','六','日']
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const dow = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday); date.setDate(monday.getDate() + i)
    const dateMs = date.getTime()
    const isFuture = dateMs > today.getTime()
    const isToday  = dateMs === today.getTime()
    const active   = !isFuture && store.sessions.some(s => {
      const sd = new Date(s.timestamp); sd.setHours(0, 0, 0, 0)
      return sd.getTime() === dateMs
    })
    return { label: isToday ? '今' : LABELS[i], active, isFuture, isToday }
  })
})

const weeklyEmoji = computed(() => {
  if (!hasData.value) return '💤'
  const c = weeklyCount.value
  if (c >= 5) return '🌟'
  if (c >= 3) return '😊'
  if (c >= 1) return '🌱'
  return '😴'
})

const weeklySummary = computed(() => {
  const c = weeklyCount.value
  if (!hasData.value) return '奶奶這週還沒有玩遊戲。可以陪她一起玩一局，讓她感受看看！'
  if (c >= 5) return `這週玩了 ${c} 場，狀態非常積極！記憶和反應都有穩定的練習，繼續保持！`
  if (c >= 3) return `這週玩了 ${c} 場，頻率不錯。有幾項面向持續在進步中，家屬可以多給鼓勵。`
  if (c >= 1) return `這週玩了 ${c} 場，有開始就很好。如果能每天玩一場，效果會更明顯喔。`
  return '這週還沒有遊玩紀錄。試著每天陪奶奶玩一局，動腦最重要！'
})

const familySuggestions = computed(() => {
  const declining = dimensionBreakdown.value.filter(d => d.trend === 'declining').map(d => d.label)
  const list = []
  if (weeklyCount.value < 3)
    list.push({ emoji:'📅', title:'固定時間一起玩', desc:'每天飯後安排 10 分鐘，陪奶奶玩一局採買或烹飪遊戲，讓她有期待感。' })
  if (declining.includes('記憶力'))
    list.push({ emoji:'🧺', title:'多玩採買記憶遊戲', desc:'「柑仔店採買記」對記憶力很有幫助。難度可以從「簡單」開始，讓奶奶有成就感。' })
  else if (declining.includes('反應力'))
    list.push({ emoji:'🎵', title:'試試懷舊音樂節拍', desc:'跟著老歌的節奏打拍子，既能訓練反應速度，又能喚起美好的回憶。' })
  else
    list.push({ emoji:'🏆', title:'稱讚她的進步', desc:`${dimensionBreakdown.value.find(d => d.trend === 'improving')?.label ?? '整體表現'}有在進步，記得告訴奶奶她做得很棒！` })
  list.push({ emoji:'💬', title:'遊戲後問她感受', desc:'每次玩完遊戲，問她「有沒有想起什麼老故事？」——這些對話本身就是最好的認知刺激。' })
  return list.slice(0, 3)
})

const dimensionColor   = (t) => t === 'improving' ? '#1E9E6A' : t === 'declining' ? '#C04030' : '#C8961E'
const trendBadgeStyle  = (t) => {
  if (t === 'improving') return 'background:rgba(30,158,106,0.12);color:#1E6A4E;'
  if (t === 'declining') return 'background:rgba(200,80,70,0.12);color:#9A3328;'
  return 'background:rgba(200,150,30,0.12);color:#7A5000;'
}
const scoreEmoji   = (s) => s >= 80 ? '😄' : s >= 60 ? '🙂' : '😤'
const scoreFeeling = (s) => s >= 80 ? '很順手' : s >= 60 ? '還不錯' : '努力中'
const scoreStyle   = (s) => s >= 80
  ? 'background:rgba(30,158,106,0.12);color:#1E6A4E;'
  : s >= 60 ? 'background:rgba(200,150,30,0.12);color:#7A5000;'
  : 'background:rgba(200,80,70,0.12);color:#9A3328;'
</script>
