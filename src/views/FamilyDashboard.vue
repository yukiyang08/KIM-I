<template>
  <div class="h-full flex overflow-hidden" style="background:#F5F0E8; font-family:'Outfit','Noto Sans TC',sans-serif;">

    <!-- ══════════════════════ LEFT SIDEBAR ══════════════════════ -->
    <aside class="w-[200px] shrink-0 flex flex-col bg-white"
      style="border-right:1px solid #EDE8E0; box-shadow:2px 0 8px rgba(0,0,0,0.04);">

      <!-- Logo -->
      <div class="px-5 pt-6 pb-5 flex items-center gap-3 border-b" style="border-color:#EDE8E0;">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style="background:linear-gradient(135deg,#FFA040,#E8701A);">
          <Icon icon="solar:user-heart-bold" width="20" height="20" style="color:white;" />
        </div>
        <div>
          <div class="font-black text-[13px] leading-tight" style="color:#2D2010;">我的腦力日記</div>
          <div class="text-[11px] mt-0.5" style="color:#9B7040;">個人訓練報表</div>
        </div>
      </div>

      <!-- User card -->
      <div class="mx-3 mt-4 mb-3 p-3 rounded-2xl" style="background:#FFF8F0; border:1px solid #EDE8E0;">
        <div class="flex items-center gap-2.5 mb-2">
          <img :src="defaultAvatar" class="w-10 h-10 rounded-full object-cover shrink-0"
            style="border:2px solid #E8974A;" />
          <div class="flex-1 min-w-0">
            <div class="font-black text-[13px] truncate" style="color:#2D2010;">
              {{ profileStore.isSetup ? profileStore.name : '您好' }}
            </div>
            <div class="text-[10px]" style="color:#9B7040;">{{ greeting }}</div>
          </div>
        </div>
        <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
          :style="{ background: brainLevel.bg }">
          <span class="text-[13px]">{{ brainLevel.emoji }}</span>
          <span class="font-black text-[11px]" :style="{ color: brainLevel.color }">{{ brainLevel.label }}</span>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
        <button v-for="item in navItems" :key="item.key"
          @click="activeNav = item.key"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all text-left"
          :style="activeNav === item.key
            ? 'background:#FFF1E0; color:#C87820; font-weight:700;'
            : 'color:#6B5B40;'">
          <Icon :icon="item.icon" width="17" height="17" class="shrink-0"
            :style="activeNav === item.key ? 'color:#C87820;' : 'color:#9B7040;'" />
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <!-- Bottom -->
      <div class="px-4 pb-5 pt-3 border-t space-y-2" style="border-color:#EDE8E0;">
        <button @click="router.push('/')"
          class="w-full py-2 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5"
          style="background:#FFF1E0; color:#C87820; border:1px solid rgba(232,151,74,0.25);">
          <Icon icon="solar:gamepad-bold" width="14" height="14" />
          回遊戲大廳
        </button>
      </div>
    </aside>

    <!-- ══════════════════════ MAIN AREA ══════════════════════ -->
    <div class="flex-1 flex flex-col overflow-hidden">

      <!-- Top bar -->
      <header class="shrink-0 px-6 py-4 flex items-center justify-between bg-white"
        style="border-bottom:1px solid #EDE8E0; box-shadow:0 1px 4px rgba(0,0,0,0.05);">
        <div>
          <h2 class="font-black text-[18px] leading-tight" style="color:#2D2010;">
            {{ navItems.find(n=>n.key===activeNav)?.label }}
          </h2>
          <p class="text-[12px] mt-0.5" style="color:#9B7040;">{{ navItems.find(n=>n.key===activeNav)?.desc }}</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5 text-[13px]" style="color:#9B7040;">
            <Icon icon="solar:calendar-bold" width="16" height="16" />
            <span>{{ todayLabel }}</span>
          </div>
          <button @click="router.push('/')"
            class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold"
            style="background:#FFF1E0; color:#C87820; border:1px solid rgba(232,151,74,0.3);">
            <Icon icon="solar:gamepad-bold" width="14" height="14" />
            去訓練
          </button>
        </div>
      </header>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto p-5 space-y-4">

        <!-- ══════════════════ 我的概覽 ══════════════════ -->
        <template v-if="activeNav === 'overview'">

          <!-- KPI cards -->
          <div class="grid grid-cols-5 gap-3">
            <div v-for="stat in statCards" :key="stat.label"
              class="bg-white rounded-2xl p-4 flex flex-col gap-2"
              style="border:1px solid #EDE8E0; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  :style="{ background: stat.iconBg }">
                  <Icon :icon="stat.icon" width="20" height="20" :style="{ color: stat.iconColor }" />
                </div>
                <span class="text-[12px] leading-tight" style="color:#9B7040;">{{ stat.label }}</span>
              </div>
              <div class="font-black leading-none" style="font-size:26px; color:#2D2010;">
                {{ stat.value }}<span style="font-size:14px; margin-left:2px; color:#9B7040;">{{ stat.unit }}</span>
              </div>
              <div class="text-[11px] font-semibold" :style="{ color: stat.subColor ?? '#9B7040' }">
                {{ stat.sub }}
              </div>
              <div v-if="stat.progress != null" class="h-1.5 rounded-full overflow-hidden" style="background:#F0EBE0;">
                <div class="h-full rounded-full transition-all" style="background:#E8974A;"
                  :style="{ width: (stat.progress * 100) + '%' }"></div>
              </div>
            </div>

            <!-- 鼓勵卡 -->
            <div class="bg-white rounded-2xl p-4 flex flex-col justify-center"
              style="border:1px solid #EDE8E0; background:linear-gradient(135deg,#FFF8F0,#FFECD8);">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
                style="background:#FFF1E0;">
                <Icon icon="solar:sun-bold" width="20" height="20" style="color:#E8974A;" />
              </div>
              <div class="font-black text-[14px] mb-1" style="color:#2D2010;">{{ encourageTitle }}</div>
              <div class="text-[11px] leading-relaxed" style="color:#9B7040;">{{ encourageDesc }}</div>
            </div>
          </div>

          <!-- 雷達 ＋ 趨勢 ＋ 本週出席 -->
          <div class="grid gap-4" style="grid-template-columns:260px 1fr 240px;">

            <!-- 雷達圖 -->
            <div class="bg-white rounded-2xl p-4 flex flex-col" style="border:1px solid #EDE8E0;">
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-black text-[13px]" style="color:#2D2010;">認知能力雷達</h3>
              </div>
              <div class="flex items-center gap-4 mb-2" style="color:#9B7040;">
                <span class="flex items-center gap-1.5 text-[11px]">
                  <span class="inline-block w-5 h-0.5 rounded" style="background:#E8974A;"></span>本次
                </span>
                <span class="flex items-center gap-1.5 text-[11px]">
                  <span class="inline-block w-5" style="border-top:1.5px dashed #9B9080; margin-top:1px;"></span>上次
                </span>
              </div>
              <div class="flex-1 flex items-center justify-center">
                <Radar v-if="hasData" :data="radarData" :options="radarOptions" style="max-height:200px; width:100%;" />
                <div v-else class="flex flex-col items-center gap-2">
                  <Icon icon="solar:radar-bold" width="32" height="32" style="color:#EDE8E0;" />
                  <div class="text-[11px] text-center" style="color:#9B7040;">玩一局後<br>雷達圖就會出現</div>
                </div>
              </div>
            </div>

            <!-- 趨勢折線 -->
            <div class="bg-white rounded-2xl p-4" style="border:1px solid #EDE8E0;">
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-black text-[13px]" style="color:#2D2010;">能力趨勢變化</h3>
                <span class="text-[11px] px-2 py-1 rounded-lg" style="background:#F5F0E8; color:#9B7040;">近 7 天</span>
              </div>
              <div class="flex flex-wrap gap-x-3 gap-y-1 mb-3">
                <span v-for="d in dimMeta" :key="d.key" class="flex items-center gap-1 text-[11px]" style="color:#6B6B6B;">
                  <span class="w-2 h-2 rounded-full" :style="{ background: d.color }"></span>
                  {{ d.label }}
                </span>
              </div>
              <div v-if="hasData" style="height:180px;">
                <Line :data="trendChartData" :options="trendOptions" />
              </div>
              <div v-else class="flex flex-col items-center justify-center" style="height:180px;">
                <Icon icon="solar:graph-up-bold" width="36" height="36" style="color:#EDE8E0;" class="mb-2" />
                <div class="text-[12px]" style="color:#9B7040;">開始玩遊戲後趨勢圖會出現在這裡</div>
              </div>
            </div>

            <!-- 本週出席 -->
            <div class="bg-white rounded-2xl p-4" style="border:1px solid #EDE8E0;">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-black text-[13px]" style="color:#2D2010;">本週出席</h3>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style="background:#FFF1E0; color:#C87820;">{{ weeklyCount }}/7 天</span>
              </div>
              <div class="grid grid-cols-7 gap-1.5">
                <div v-for="(day, i) in weekDays" :key="i" class="flex flex-col items-center gap-1">
                  <div class="text-[9px] font-semibold" style="color:rgba(155,112,64,0.5);">{{ day.label }}</div>
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all"
                    :style="day.active
                      ? 'background:#E8974A; color:white; box-shadow:0 2px 6px rgba(232,151,74,0.4);'
                      : day.isFuture
                        ? 'background:#F5F0E8; color:rgba(155,112,64,0.2);'
                        : 'background:#F0EBE0; color:rgba(155,112,64,0.35);'">
                    {{ day.active ? '✓' : '' }}
                  </div>
                  <div v-if="day.isToday" class="text-[8px] font-black" style="color:#E8974A;">今</div>
                </div>
              </div>
              <!-- 能力長條 -->
              <div class="mt-4 space-y-2.5">
                <div v-for="(item, i) in dimensionBreakdown" :key="item.key" class="flex items-center gap-2">
                  <div class="text-[10px] shrink-0 w-10 text-right" style="color:#9B7040;">{{ item.label }}</div>
                  <div class="flex-1 h-1.5 rounded-full relative" style="background:#F0EBE0;">
                    <div class="h-full rounded-full transition-all duration-700"
                      :style="{ width: item.current+'%', background: dimMeta[i]?.color ?? '#E8974A' }"></div>
                  </div>
                  <div class="shrink-0 text-[10px] font-black w-6 text-right"
                    :style="{ color: dimensionColor(item.trend) }">{{ item.current }}</div>
                  <div class="shrink-0 text-[9px] font-black" :style="{ color: dimensionColor(item.trend) }">
                    {{ item.trend === 'improving' ? '▲' : item.trend === 'declining' ? '▼' : '—' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </template>

        <!-- ══════════════════ 訓練紀錄 ══════════════════ -->
        <template v-else-if="activeNav === 'records'">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-black text-[17px]" style="color:#2D2010;">訓練紀錄</h2>
              <p class="text-[12px]" style="color:#9B7040;">所有遊戲訓練歷史</p>
            </div>
          </div>

          <!-- 遊戲分類統計 -->
          <div class="grid grid-cols-6 gap-3">
            <div v-for="g in gameOverview" :key="g.id"
              class="bg-white rounded-2xl p-4 text-center" style="border:1px solid #EDE8E0;">
              <div class="flex justify-center mb-2">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center" :style="{ background: g.iconBg }">
                  <Icon :icon="g.icon" width="20" height="20" :style="{ color: g.iconColor }" />
                </div>
              </div>
              <div class="font-black text-[15px] mb-0.5" style="color:#2D2010;">
                {{ store.sessions.filter(s=>s.gameId===g.id).length }}
              </div>
              <div class="text-[10px] font-semibold mb-1" style="color:#6B6B6B;">{{ g.name }}</div>
              <div class="text-[10px]" :style="{ color: avgGameScore(g.id) >= 80 ? '#1E9E6A' : '#E8974A' }">
                均 {{ avgGameScore(g.id) }} 分
              </div>
            </div>
          </div>

          <!-- 紀錄表 -->
          <div class="bg-white rounded-2xl overflow-hidden" style="border:1px solid #EDE8E0;">
            <div class="px-4 py-3 border-b" style="border-color:#EDE8E0;">
              <h3 class="font-black text-[13px]" style="color:#2D2010;">所有訓練記錄</h3>
            </div>
            <div v-if="hasData">
              <table class="w-full">
                <thead style="background:#FAFAF7;">
                  <tr class="text-[11px]" style="color:#9B7040;">
                    <th class="text-left px-4 py-2.5 font-semibold">時間</th>
                    <th class="text-left px-4 py-2.5 font-semibold">遊戲</th>
                    <th class="text-center px-3 py-2.5 font-semibold">分數</th>
                    <th class="text-center px-3 py-2.5 font-semibold">強化維度</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="s in [...store.sessions].reverse().slice(0,20)" :key="s.timestamp"
                    class="transition-colors" style="border-top:1px solid #EDE8E0;"
                    :style="hoveredRow === s.timestamp ? 'background:#FFF8F0;' : ''"
                    @mouseenter="hoveredRow = s.timestamp" @mouseleave="hoveredRow = null">
                    <td class="px-4 py-3 text-[12px]" style="color:#9B7040;">{{ timeLabel(s.timestamp) }}</td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <Icon :icon="gameOverview.find(g=>g.id===s.gameId)?.icon || 'solar:gamepad-bold'"
                          width="14" height="14"
                          :style="{ color: gameOverview.find(g=>g.id===s.gameId)?.iconColor || '#9B7040' }" />
                        <span class="text-[13px]" style="color:#2D2010;">{{ gameName[s.gameId] ?? s.gameId }}</span>
                      </div>
                    </td>
                    <td class="text-center px-3 py-3">
                      <span class="font-black text-[13px]" :style="{ color: scoreColor(s.score) }">{{ s.score }} 分</span>
                    </td>
                    <td class="text-center px-3 py-3">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style="background:#EEF4FB; color:#2C7BC8;">{{ dimLabelOf[s.gameId] ?? '—' }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="flex flex-col items-center py-16">
              <Icon icon="solar:gamepad-bold" width="40" height="40" style="color:#EDE8E0;" class="mb-3" />
              <div class="text-[13px] font-semibold mb-1" style="color:#9B7040;">還沒有訓練記錄</div>
              <button @click="router.push('/')" class="mt-2 px-4 py-2 rounded-xl text-[12px] font-semibold text-white"
                style="background:#E8974A;">去玩遊戲</button>
            </div>
          </div>
        </template>

        <!-- ══════════════════ 成就徽章 ══════════════════ -->
        <template v-else-if="activeNav === 'achievements'">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-black text-[17px]" style="color:#2D2010;">成就徽章</h2>
              <p class="text-[12px]" style="color:#9B7040;">已獲得 {{ earnedCount }} / {{ achievements.length }} 個徽章</p>
            </div>
          </div>

          <!-- 進度摘要 -->
          <div class="grid grid-cols-4 gap-3">
            <div v-for="s in achieveSummary" :key="s.label" class="bg-white rounded-2xl p-4" style="border:1px solid #EDE8E0;">
              <div class="text-[12px] mb-1" style="color:#9B7040;">{{ s.label }}</div>
              <div class="font-black text-[22px] leading-none mb-1" :style="{ color: s.color }">{{ s.value }}</div>
              <div class="text-[11px]" style="color:#9B7040;">{{ s.sub }}</div>
            </div>
          </div>

          <!-- 徽章格 -->
          <div class="grid grid-cols-4 gap-3">
            <div v-for="badge in achievements" :key="badge.id"
              class="bg-white rounded-2xl p-4 flex flex-col items-center text-center transition-all"
              style="border:1px solid #EDE8E0;"
              :style="badge.earned ? 'box-shadow:0 4px 16px rgba(232,151,74,0.18); border-color:#E8974A;' : ''">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3"
                :style="badge.earned
                  ? 'background:linear-gradient(135deg,#FFE0A0,#E8974A); box-shadow:0 4px 14px rgba(232,151,74,0.3);'
                  : 'background:#F5F0E8;'">
                <span :style="badge.earned ? '' : 'filter:grayscale(1) opacity(0.3)'">{{ badge.emoji }}</span>
              </div>
              <div class="font-black text-[13px] mb-1" :style="badge.earned ? 'color:#2D2010;' : 'color:#9B7040;'">
                {{ badge.title }}</div>
              <div v-if="badge.earned" class="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style="background:#E8F5EF; color:#1E9E6A;">已獲得</div>
              <div v-else-if="badge.progress != null" class="w-full mt-2">
                <div class="h-1.5 rounded-full overflow-hidden" style="background:#F0EBE0;">
                  <div class="h-full rounded-full" style="background:#E8974A;"
                    :style="{ width: (badge.progress * 100) + '%' }"></div>
                </div>
                <div class="text-[10px] mt-1" style="color:#9B7040;">{{ badge.progressLabel }}</div>
              </div>
            </div>
          </div>
        </template>

        <!-- ══════════════════ 訓練建議 ══════════════════ -->
        <template v-else-if="activeNav === 'suggest'">
          <div>
            <h2 class="font-black text-[17px]" style="color:#2D2010;">訓練建議</h2>
            <p class="text-[12px]" style="color:#9B7040;">根據你的表現，為你量身推薦</p>
          </div>

          <!-- 能力分析 -->
          <div class="bg-white rounded-2xl p-5" style="border:1px solid #EDE8E0;">
            <h3 class="font-black text-[13px] mb-4" style="color:#2D2010;">五大能力現況</h3>
            <div class="space-y-4">
              <div v-for="(item, i) in dimensionBreakdown" :key="item.key">
                <div class="flex items-center justify-between mb-1.5">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg flex items-center justify-center"
                      :style="{ background: dimMeta[i]?.color+'22' }">
                      <Icon :icon="dimIcons[i]" width="14" height="14" :style="{ color: dimMeta[i]?.color }" />
                    </div>
                    <span class="font-semibold text-[13px]" style="color:#2D2010;">{{ item.label }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="font-black text-[15px]" :style="{ color: dimMeta[i]?.color }">{{ item.current }}</span>
                    <span class="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                      :style="item.trend==='improving'
                        ? 'background:#E8F5EF; color:#1E9E6A;'
                        : item.trend==='declining'
                          ? 'background:#FEF0F0; color:#C04030;'
                          : 'background:#F5F0E8; color:#9B7040;'">
                      {{ item.trend==='improving'?'↑ 進步中':item.trend==='declining'?'↓ 需加強':'→ 持平' }}
                    </span>
                  </div>
                </div>
                <div class="h-2 rounded-full relative" style="background:#F0EBE0;">
                  <div class="h-full rounded-full transition-all duration-700"
                    :style="{ width: item.current+'%', background: dimMeta[i]?.color }"></div>
                  <div class="absolute top-0 h-full w-0.5 rounded"
                    :style="{ left: item.baseline+'%', background: 'rgba(0,0,0,0.2)' }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 建議卡片 -->
          <div class="grid grid-cols-3 gap-4">
            <div v-for="rec in recommendations" :key="rec.gameId"
              class="bg-white rounded-2xl p-5" style="border:1px solid #EDE8E0;">
              <div class="text-2xl mb-3">{{ rec.icon }}</div>
              <div class="font-black text-[14px] mb-2" style="color:#2D2010;">{{ rec.title }}</div>
              <div class="text-[12px] leading-relaxed mb-4" style="color:#9B7040;">{{ rec.desc }}</div>
              <button @click="router.push({ name: rec.gameId })"
                class="w-full py-2 rounded-xl text-[13px] font-semibold text-white"
                style="background:#E8974A;">
                開始訓練 →
              </button>
            </div>
          </div>
        </template>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { Radar, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { useGameStore } from '../stores/gameStore'
import { useProfileStore } from '../stores/profileStore'
import av1 from '../assets/avatars/avatar-1-grandma-traditional.jpg'
import av2 from '../assets/avatars/avatar-2-grandpa-shirt.jpg'
import av3 from '../assets/avatars/avatar-3-grandma-floral.jpg'
import av4 from '../assets/avatars/avatar-4-grandpa-polo.jpg'
import av5 from '../assets/avatars/avatar-5-grandma-bun.jpg'
import av6 from '../assets/avatars/avatar-6-grandpa-tang.jpg'

ChartJS.register(RadialLinearScale, PointElement, LineElement, CategoryScale, LinearScale, Filler, Tooltip, Legend)

const store        = useGameStore()
const profileStore = useProfileStore()
const router       = useRouter()

// ── Nav ───────────────────────────────────────────────────────
const activeNav = ref('overview')
const navItems = [
  { key:'overview',     icon:'solar:home-2-bold',            label:'我的概覽',   desc:'整體認知能力概況' },
  { key:'records',      icon:'solar:clipboard-list-bold',    label:'訓練紀錄',   desc:'所有遊戲訓練歷史' },
  { key:'achievements', icon:'solar:medal-ribbons-star-bold',label:'成就徽章',   desc:'解鎖的訓練成就' },
  { key:'suggest',      icon:'solar:lightbulb-bold',         label:'訓練建議',   desc:'根據表現量身推薦' },
]

const hoveredRow = ref(null)

// ── Game overview ─────────────────────────────────────────────
const gameOverview = [
  { id:'music',    name:'懷舊音樂', icon:'solar:music-note-bold',   iconColor:'#2C7BC8', iconBg:'#EEF4FB' },
  { id:'shopping', name:'柑仔店採買', icon:'solar:bag-2-bold',       iconColor:'#C87820', iconBg:'#FEF3E8' },
  { id:'cooking',  name:'阿嬤家常菜', icon:'solar:cup-hot-bold',     iconColor:'#1E9E6A', iconBg:'#E8F5EF' },
  { id:'puppet',   name:'廟口布袋戲', icon:'solar:masks-theatre-bold',iconColor:'#7B4EA0', iconBg:'#F5EEF8' },
  { id:'riddle',   name:'老歌猜謎',  icon:'solar:star-bold',         iconColor:'#E8974A', iconBg:'#FEF0D8' },
  { id:'puzzle',   name:'廟口大拼圖', icon:'solar:widget-2-bold',    iconColor:'#C04030', iconBg:'#FEF0F0' },
]

const avgGameScore = (gameId) => {
  const s = store.sessions.filter(s => s.gameId === gameId)
  if (!s.length) return 0
  return Math.round(s.reduce((sum, s) => sum + s.score, 0) / s.length)
}

// ── Dim icons ─────────────────────────────────────────────────
const dimIcons = [
  'solar:brain-bold',
  'solar:eye-bold',
  'solar:bolt-bold',
  'solar:layers-bold',
  'solar:stopwatch-bold',
]

// 根據使用者名字穩定分配一張預設頭像，名字相同永遠顯示同一張
const AVATARS = [av1, av2, av3, av4, av5, av6]
const defaultAvatar = computed(() => {
  const name = profileStore.name || ''
  const idx = name.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % AVATARS.length
  return AVATARS[idx]
})

const hasData            = computed(() => store.hasData)
const recentSessions     = computed(() => store.recentSessions)
const dimensionBreakdown = computed(() => store.dimensionBreakdown)

// ── Dimension metadata ────────────────────────────────────────
const dimMeta = [
  { key: 'memory',       label: '記憶力', icon: '🧺', color: '#E8834A' },
  { key: 'attention',    label: '注意力', icon: '🎯', color: '#6B8DE8' },
  { key: 'execution',    label: '執行力', icon: '⚡', color: '#4CBF7A' },
  { key: 'visual',       label: '視覺空間', icon: '👁', color: '#A67BDB' },
  { key: 'reactionSpeed',label: '反應力', icon: '🎵', color: '#F06080' },
]

const dimOf = {
  music: 'reactionSpeed', shopping: 'memory', cooking: 'execution',
  puppet: 'attention', riddle: 'memory', puzzle: 'visual',
}

const dimLabelOf = {
  music: '反應力', shopping: '記憶力', cooking: '執行力',
  puppet: '注意力', riddle: '記憶力', puzzle: '視覺空間',
}

const gameEmoji = { music:'🎵', shopping:'🥫', cooking:'🍲', puppet:'🎭', riddle:'🎶', puzzle:'🧩' }
const gameName  = { music:'懷舊音樂', shopping:'柑仔店採買', cooking:'阿嬤家常菜', puppet:'廟口布袋戲', riddle:'老歌猜謎', puzzle:'廟口大拼圖' }

// ── Greeting / date ───────────────────────────────────────────
const greeting = computed(() => {
  const h = new Date().getHours()
  return h < 12 ? '早安' : h < 18 ? '午安' : '晚安'
})

const todayLabel = computed(() => {
  const d = new Date()
  const days = ['日','一','二','三','四','五','六']
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `今天是 ${d.getFullYear()}/${m}/${day} (${days[d.getDay()]})`
})

// ── Stats ─────────────────────────────────────────────────────
const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
const todaySessions = computed(() => store.sessions.filter(s => s.timestamp >= todayStart.getTime()))
const gameDuration  = { music:1, shopping:2, cooking:2, puppet:3, riddle:3, puzzle:4 }
const todayMinutes  = computed(() => todaySessions.value.reduce((sum, s) => sum + (gameDuration[s.gameId] ?? 3), 0))

const weeklyCount = computed(() => {
  const cutoff = Date.now() - 7 * 86400000
  return store.sessions.filter(s => s.timestamp >= cutoff).length
})

const totalMinutes = computed(() =>
  store.sessions.reduce((sum, s) => sum + (gameDuration[s.gameId] ?? 3), 0)
)

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

// overall score = average of all dimensions
const overallScore = computed(() => {
  const scores = dimensionBreakdown.value.map(d => d.current)
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
})

const statCards = computed(() => [
  {
    label: '認知總分',
    icon: 'solar:star-bold', iconColor:'#7B4EA0', iconBg:'#F0EBF8',
    value: overallScore.value, unit: '分',
    sub: `${dimensionBreakdown.value.filter(d => d.trend === 'improving').length} 項進步中`,
    subColor: '#1E9E6A',
  },
  {
    label: '本週訓練',
    icon: 'solar:calendar-bold', iconColor:'#2C7BC8', iconBg:'#EEF4FB',
    value: weeklyCount.value, unit: '天',
    sub: `目標 ${weeklyCount.value}/7 天`,
    progress: Math.min(weeklyCount.value / 7, 1),
  },
  {
    label: '訓練時間',
    icon: 'solar:stopwatch-bold', iconColor:'#1E9E6A', iconBg:'#E8F5EF',
    value: totalMinutes.value, unit: '分鐘',
    sub: `今日 +${todayMinutes.value} 分鐘`,
    subColor: '#C8961E',
  },
  {
    label: '完成關卡',
    icon: 'solar:gamepad-bold', iconColor:'#C87820', iconBg:'#FEF0D8',
    value: store.sessions.length, unit: '關',
    sub: streak.value ? `連續打卡 ${streak.value} 天` : '快來挑戰吧！',
    subColor: streak.value >= 3 ? '#C04030' : '#9B7040',
  },
])

const encourageTitle = computed(() => {
  if (!hasData.value) return '今天來玩一局吧！'
  const improving = dimensionBreakdown.value.filter(d => d.trend === 'improving')
  if (improving.length >= 3) return '太棒了！'
  if (streak.value >= 3) return `連續 ${streak.value} 天，很厲害！`
  if (weeklyCount.value >= 5) return '這週很積極！'
  return '繼續加油！'
})

const encourageDesc = computed(() => {
  if (!hasData.value) return '動動腦，一天更有活力，選個喜歡的遊戲試試看！'
  const improving = dimensionBreakdown.value.filter(d => d.trend === 'improving')
  if (improving.length > 0) return `${improving[0].label}有在進步，持續保持這個好習慣！`
  return '每天玩一局，讓大腦越來越靈活！'
})

// ── Weekly calendar ───────────────────────────────────────────
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

// ── Radar chart ───────────────────────────────────────────────
const radarData = computed(() => ({
  labels: ['記憶力', '注意力', '執行力', '視覺空間', '反應力'],
  datasets: [
    {
      label: '上次表現',
      data: store.radarBaseline,
      backgroundColor: 'rgba(200,150,30,0.06)',
      borderColor: 'rgba(200,150,30,0.3)',
      borderWidth: 1.5,
      borderDash: [5, 4],
      pointRadius: 0,
      fill: true,
    },
    {
      label: '本次表現',
      data: store.radarCurrent,
      backgroundColor: 'rgba(200,150,30,0.2)',
      borderColor: '#C8961E',
      borderWidth: 2.5,
      pointBackgroundColor: '#C8961E',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      fill: true,
    },
  ],
}))

const radarOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    r: {
      min: 0,
      max: 100,
      ticks: { stepSize: 25, display: false },
      grid: { color: 'rgba(200,150,30,0.15)' },
      angleLines: { color: 'rgba(200,150,30,0.22)' },
      pointLabels: {
        font: { size: 12, weight: 'bold', family: "'Noto Sans TC', sans-serif" },
        color: '#7A5030',
        callback: (label, index) => {
          const score = store.radarCurrent[index]
          return [label, String(score)]
        },
      },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: { label: (ctx) => ` ${ctx.dataset.label}：${ctx.raw} 分` },
    },
  },
}))

// ── 7-day trend line chart ────────────────────────────────────
const trendDayLabels = computed(() => {
  const labels = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0)
    labels.push(`${d.getMonth() + 1}/${d.getDate()}`)
  }
  return labels
})

const trendChartData = computed(() => {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0, 0, 0, 0)
    return d.getTime()
  })

  const datasets = dimMeta.map(meta => {
    const data = days.map(dayMs => {
      const daySessions = store.sessions.filter(s => {
        const sd = new Date(s.timestamp); sd.setHours(0, 0, 0, 0)
        return sd.getTime() === dayMs && dimOf[s.gameId] === meta.key
      })
      if (!daySessions.length) return null
      return Math.round(daySessions.reduce((sum, s) => sum + s.score, 0) / daySessions.length)
    })
    return {
      label: meta.label,
      data,
      borderColor: meta.color,
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointRadius: 3,
      pointBackgroundColor: meta.color,
      tension: 0.35,
      spanGaps: true,
    }
  })

  return { labels: trendDayLabels.value, datasets }
})

const trendOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      min: 0,
      max: 100,
      ticks: { stepSize: 25, font: { size: 10 }, color: '#B89060' },
      grid: { color: 'rgba(200,150,30,0.1)' },
      border: { display: false },
    },
    x: {
      ticks: { font: { size: 10 }, color: '#B89060' },
      grid: { display: false },
      border: { display: false },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label}：${ctx.raw ?? '—'} 分` } },
  },
}

// ── Recommendations ───────────────────────────────────────────
const recommendations = computed(() => {
  const list = []
  const declining = dimensionBreakdown.value.filter(d => d.trend === 'declining')
  const low = dimensionBreakdown.value.filter(d => d.current < 70)

  const push = (gameId, icon, title, desc) => {
    if (list.length < 3 && !list.find(r => r.gameId === gameId))
      list.push({ gameId, icon, title, desc })
  }

  declining.forEach(d => {
    if (d.key === 'memory')       push('shopping', '🧺', '加強記憶力訓練', '「柑仔店採買記」有助提升記憶力，從簡單難度開始試試看。')
    if (d.key === 'attention')    push('puppet',   '🎭', '加強注意力訓練', '「廟口布袋戲」能訓練注意力，專注看戲中細節。')
    if (d.key === 'execution')    push('cooking',  '🍲', '挑戰執行力遊戲', '「阿嬤家常菜」考驗步驟規劃能力，突破自我！')
    if (d.key === 'visual')       push('puzzle',   '🧩', '視覺空間來挑戰', '「廟口大拼圖」訓練視覺空間感，難度可以自選。')
    if (d.key === 'reactionSpeed') push('music',   '🎵', '音樂節拍訓練反應', '跟著懷舊老歌打拍子，輕鬆又有趣！')
  })

  low.forEach(d => {
    if (d.key === 'memory' && !list.find(r => r.gameId === 'riddle'))
      push('riddle', '🎶', '老歌猜謎練記憶', '「老歌猜謎」喚起熟悉旋律，同時鍛鍊長期記憶。')
  })

  if (list.length < 3) push('music',    '🎵', '維持音樂節拍練習', '定期跟老歌打拍子，維持反應速度！')
  if (list.length < 3) push('shopping', '🧺', '多玩採買鞏固記憶', '每次採買都是一次記憶力的小測驗。')
  if (list.length < 3) push('puzzle',   '🧩', '拼圖來放鬆動腦', '輕鬆又有挑戰性，每天來一局！')

  return list.slice(0, 3)
})

// ── Achievements ──────────────────────────────────────────────
const totalSessions = computed(() => store.sessions.length)

const achievements = computed(() => [
  {
    id: 'first_game',
    emoji: '🌱',
    title: '初次嘗試',
    earned: totalSessions.value >= 1,
    progress: Math.min(totalSessions.value, 1),
    progressLabel: `0/1`,
  },
  {
    id: 'streak_3',
    emoji: '🔥',
    title: '三天連續',
    earned: streak.value >= 3,
    progress: Math.min(streak.value / 3, 1),
    progressLabel: `${streak.value}/3天`,
  },
  {
    id: 'streak_7',
    emoji: '👑',
    title: '週週出席',
    earned: streak.value >= 7,
    progress: Math.min(streak.value / 7, 1),
    progressLabel: `${streak.value}/7天`,
  },
  {
    id: 'play_10',
    emoji: '🎮',
    title: '遊戲達人',
    earned: totalSessions.value >= 10,
    progress: Math.min(totalSessions.value / 10, 1),
    progressLabel: `${totalSessions.value}/10關`,
  },
  {
    id: 'music_fan',
    emoji: '🎵',
    title: '音樂愛好者',
    earned: store.sessions.filter(s => s.gameId === 'music' || s.gameId === 'riddle').length >= 5,
    progress: Math.min(store.sessions.filter(s => s.gameId === 'music' || s.gameId === 'riddle').length / 5, 1),
    progressLabel: `${store.sessions.filter(s => s.gameId === 'music' || s.gameId === 'riddle').length}/5次`,
  },
  {
    id: 'memory_master',
    emoji: '🧺',
    title: '採買高手',
    earned: store.sessions.some(s => s.gameId === 'shopping' && s.score >= 80),
    progress: null,
  },
  {
    id: 'all_games',
    emoji: '🌈',
    title: '全場體驗',
    earned: ['music','shopping','cooking','puppet','riddle','puzzle'].every(g =>
      store.sessions.some(s => s.gameId === g)
    ),
    progress: Math.min(['music','shopping','cooking','puppet','riddle','puzzle'].filter(g =>
      store.sessions.some(s => s.gameId === g)
    ).length / 6, 1),
    progressLabel: `${['music','shopping','cooking','puppet','riddle','puzzle'].filter(g =>
      store.sessions.some(s => s.gameId === g)).length}/6種`,
  },
  {
    id: 'top_score',
    emoji: '💎',
    title: '滿分達人',
    earned: store.sessions.some(s => s.score >= 95),
    progress: null,
  },
])

const earnedCount = computed(() => achievements.value.filter(a => a.earned).length)

const achieveSummary = computed(() => [
  { label:'已獲得徽章', value:earnedCount.value,                   color:'#E8974A', sub:`共 ${achievements.value.length} 個` },
  { label:'連續打卡',   value:streak.value + ' 天',                color:'#1E9E6A', sub: streak.value>=3?'持續保持！':'加油繼續！' },
  { label:'完成遊戲種',  value:gameOverview.filter(g=>store.sessions.some(s=>s.gameId===g.id)).length + ' 種', color:'#7B4EA0', sub:'共 6 種遊戲' },
  { label:'最高分',     value:store.sessions.length ? Math.max(...store.sessions.map(s=>s.score)) + ' 分' : '—', color:'#2C7BC8', sub:'單局最佳成績' },
])

// ── Brain level ───────────────────────────────────────────────
const brainLevel = computed(() => {
  const n = earnedCount.value
  if (n >= 6) return { label: '金冠腦王', emoji: '👑', color: '#8B5E00', bg: 'rgba(200,150,30,0.18)' }
  if (n >= 4) return { label: '銀杯腦力', emoji: '🏆', color: '#5A6A80', bg: 'rgba(100,130,170,0.14)' }
  if (n >= 2) return { label: '銅牌探索', emoji: '🥉', color: '#7A5030', bg: 'rgba(180,120,60,0.14)' }
  if (n >= 1) return { label: '腦力新星', emoji: '🌱', color: '#2E7D32', bg: 'rgba(46,125,50,0.13)' }
  return         { label: '待啟動',   emoji: '💤', color: '#9B7040', bg: 'rgba(155,112,64,0.1)' }
})

// ── Helpers ───────────────────────────────────────────────────
const dimensionColor = (t) => t === 'improving' ? '#1E9E6A' : t === 'declining' ? '#C04030' : '#C8961E'

const scoreColor = (s) => s >= 80 ? '#1E9E6A' : s >= 60 ? '#C8961E' : '#C04030'

const timeLabel = (ts) => {
  const diff = Date.now() - ts
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分鐘前`
  if (diff < 86400000) return '今天'
  if (diff < 172800000) return '昨天'
  return `${Math.floor(diff / 86400000)} 天前`
}

const lastPlayedLabel = computed(() => {
  if (!recentSessions.value.length) return ''
  return timeLabel(recentSessions.value[0].timestamp)
})
</script>
