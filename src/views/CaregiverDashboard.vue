<template>
  <div class="h-full flex overflow-hidden" style="background:#F5F0E8; font-family:'Outfit','Noto Sans TC',sans-serif;">

    <!-- ══════════════════════ LEFT SIDEBAR ══════════════════════ -->
    <aside class="w-[200px] shrink-0 flex flex-col bg-white"
      style="border-right:1px solid #EDE8E0; box-shadow:2px 0 8px rgba(0,0,0,0.04);">

      <!-- Logo -->
      <div class="px-5 pt-6 pb-5 flex items-center gap-3 border-b" style="border-color:#EDE8E0;">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style="background:linear-gradient(135deg,#FFA040,#E8701A);">
          <Icon icon="solar:home-smile-bold" width="20" height="20" style="color:white;" />
        </div>
        <div>
          <div class="font-black text-[13px] leading-tight" style="color:#2D2010;">認知訓練平台</div>
          <div class="text-[11px] mt-0.5" style="color:#9B7040;">XX長照中心</div>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
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
        <div class="flex justify-center gap-2 py-1">
          <Icon icon="solar:accessibility-bold" width="28" height="28" style="color:#E8974A; opacity:0.7;" />
          <Icon icon="solar:heart-bold" width="28" height="28" style="color:#E8974A; opacity:0.5;" />
        </div>
        <button class="w-full py-2 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5"
          style="background:#FFF1E0; color:#C87820; border:1px solid rgba(232,151,74,0.25);">
          <Icon icon="solar:question-circle-bold" width="14" height="14" />
          使用教學
        </button>
        <button @click="$router.push('/')"
          class="w-full py-2 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5"
          style="background:#F5F0E8; color:#9B7040;">
          <Icon icon="solar:arrow-left-bold" width="14" height="14" />
          回遊戲主頁
        </button>
      </div>
    </aside>

    <!-- ══════════════════════ MAIN AREA ══════════════════════ -->
    <div class="flex-1 flex flex-col overflow-hidden">

      <!-- Top bar -->
      <header class="shrink-0 px-6 py-4 flex items-center justify-between bg-white"
        style="border-bottom:1px solid #EDE8E0; box-shadow:0 1px 4px rgba(0,0,0,0.05);">
        <div>
          <h2 class="font-black text-[18px] leading-tight" style="color:#2D2010;">早安，王小明</h2>
          <p class="text-[12px] mt-0.5" style="color:#9B7040;">歡迎回到 XX長照中心管理後台</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5 text-[13px]" style="color:#9B7040;">
            <Icon icon="solar:calendar-bold" width="16" height="16" />
            <span>今天是 {{ todayLabel }}</span>
          </div>
          <div class="relative cursor-pointer">
            <div class="w-9 h-9 rounded-full flex items-center justify-center"
              style="background:#FFF1E0;">
              <Icon icon="solar:bell-bold" width="18" height="18" style="color:#C87820;" />
            </div>
            <div class="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] rounded-full text-[10px] flex items-center justify-center font-black text-white"
              style="background:#E05030;">3</div>
          </div>
          <div class="flex items-center gap-1.5 cursor-pointer">
            <div class="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center"
              style="background:#FFF1E0; border:2px solid #EDE8E0;">
              <Icon icon="solar:stethoscope-bold" width="18" height="18" style="color:#C87820;" />
            </div>
            <Icon icon="solar:alt-arrow-down-bold" width="12" height="12" style="color:#9B7040;" />
          </div>
        </div>
      </header>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto p-5 space-y-4">

        <!-- ══════════════════ 總覽首頁 ══════════════════ -->
        <template v-if="activeNav === 'overview'">

        <!-- ── KPI cards ── -->
        <div class="grid grid-cols-5 gap-3">
          <div v-for="kpi in kpiCards" :key="kpi.label"
            class="bg-white rounded-2xl p-4 flex flex-col gap-2"
            style="border:1px solid #EDE8E0; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                :style="{ background: kpi.iconBg }">
                <Icon :icon="kpi.icon" width="20" height="20" :style="{ color: kpi.iconColor }" />
              </div>
              <span class="text-[12px] leading-tight" style="color:#9B7040;">{{ kpi.label }}</span>
            </div>
            <div class="font-black leading-none" style="font-size:26px;" :style="{ color: kpi.color }">
              {{ kpi.value }}<span style="font-size:14px; margin-left:2px;">{{ kpi.unit }}</span>
            </div>
            <div class="text-[12px] font-semibold" :style="{ color: kpi.positive ? '#1E9E6A' : '#C04030' }">
              {{ kpi.positive ? '↑' : '↓' }} {{ kpi.changeText }}
            </div>
          </div>
        </div>

        <!-- ══ 外層兩欄：左側主要內容 ｜ 右側統一欄 ══ -->
        <div class="grid gap-4" style="grid-template-columns:1fr 300px; align-items:start;">

          <!-- ────── 左側主要內容 ────── -->
          <div class="space-y-4">

            <!-- 雷達圖 ＋ 狀態分布/趨勢 -->
            <div class="grid gap-4" style="grid-template-columns:264px 1fr;">

              <!-- 雷達圖 -->
              <div class="bg-white rounded-2xl p-4 flex flex-col" style="border:1px solid #EDE8E0;">
                <div class="flex items-center justify-between mb-1">
                  <h3 class="font-black text-[13px]" style="color:#2D2010;">中心整體能力分析</h3>
                  <span class="text-[11px] cursor-pointer" style="color:#9B7040;">ⓘ</span>
                </div>
                <div class="flex items-center gap-4 mb-2" style="color:#9B7040;">
                  <span class="flex items-center gap-1.5 text-[11px]">
                    <span class="inline-block w-5 h-0.5 rounded" style="background:#E8974A;"></span>本中心平均
                  </span>
                  <span class="flex items-center gap-1.5 text-[11px]">
                    <span class="inline-block w-5" style="border-top:1.5px dashed #9B9080; margin-top:1px;"></span>上月平均
                  </span>
                </div>
                <div class="flex-1 flex items-center justify-center">
                  <Radar :data="radarChartData" :options="radarChartOptions" style="max-height:220px; width:100%;" />
                </div>
                <button class="mt-3 w-full py-2 rounded-xl text-[12px] font-semibold"
                  style="background:#FFF1E0; color:#C87820; border:1px solid rgba(232,151,74,0.25);">
                  查看詳細分析 →
                </button>
              </div>

              <!-- 狀態分布 + 趨勢折線 -->
              <div class="space-y-4">
                <div class="bg-white rounded-2xl p-4" style="border:1px solid #EDE8E0;">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="font-black text-[13px]" style="color:#2D2010;">長者狀態分布 <span class="font-normal text-[11px]" style="color:#9B7040;">ⓘ</span></h3>
                    <a href="#" class="text-[11px]" style="color:#E8974A;">查看全部 →</a>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="relative shrink-0" style="width:120px; height:120px;">
                      <Doughnut :data="statusDonutData" :options="donutChartOptions" />
                      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div class="text-[11px]" style="color:#9B7040;">總計</div>
                        <div class="font-black text-[18px] leading-tight" style="color:#2D2010;">{{ patients.length }}</div>
                        <div class="text-[11px]" style="color:#9B7040;">位</div>
                      </div>
                    </div>
                    <div class="grid grid-cols-2 gap-x-4 gap-y-2 flex-1">
                      <div v-for="s in statusDistribution" :key="s.label" class="flex items-center gap-1.5 text-[11px]">
                        <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: s.color }"></span>
                        <span style="color:#6B6B6B;">{{ s.label }}</span>
                        <span class="font-bold ml-auto" style="color:#2D2010;">{{ s.count }}</span>
                        <span style="color:#9B7040;">({{ s.pct }}%)</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="bg-white rounded-2xl p-4" style="border:1px solid #EDE8E0;">
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="font-black text-[13px]" style="color:#2D2010;">能力趨勢變化</h3>
                    <span class="text-[11px]" style="color:#9B7040;">近30天</span>
                  </div>
                  <div style="height:140px;">
                    <Line :data="trendLineData" :options="lineChartOptions" />
                  </div>
                </div>
              </div>
            </div>

            <!-- 長者列表 -->
            <div class="bg-white rounded-2xl overflow-hidden" style="border:1px solid #EDE8E0;">
              <div class="px-4 py-3 flex items-center justify-between border-b" style="border-color:#EDE8E0;">
                <h3 class="font-black text-[13px]" style="color:#2D2010;">長者列表</h3>
                <div class="flex items-center gap-2">
                  <div class="relative">
                    <input v-model="searchQuery" placeholder="搜尋長者姓名"
                      class="text-[12px] pl-6 pr-3 py-1.5 rounded-lg outline-none"
                      style="background:#F5F0E8; color:#2D2010; width:120px; border:1px solid #EDE8E0;" />
                    <Icon icon="solar:magnifer-bold" width="13" height="13" class="absolute left-2 top-1/2 -translate-y-1/2" style="color:#9B7040;" />
                  </div>
                  <select v-model="statusFilter" class="text-[12px] px-2 py-1.5 rounded-lg outline-none cursor-pointer"
                    style="background:#F5F0E8; color:#6B6B6B; border:1px solid #EDE8E0;">
                    <option value="all">全部狀態</option>
                    <option value="穩定表現">穩定表現</option>
                    <option value="持續進步">持續進步</option>
                    <option value="建議加強">建議加強</option>
                    <option value="近期較少參與">近期較少參與</option>
                  </select>
                  <select class="text-[12px] px-2 py-1.5 rounded-lg outline-none cursor-pointer"
                    style="background:#F5F0E8; color:#6B6B6B; border:1px solid #EDE8E0;">
                    <option>全部年齡</option><option>65-70歲</option><option>71-80歲</option><option>80歲以上</option>
                  </select>
                </div>
              </div>
              <table class="w-full">
                <thead style="background:#FAFAF7;">
                  <tr class="text-[11px]" style="color:#9B7040;">
                    <th class="text-left px-4 py-2.5 font-semibold">姓名</th>
                    <th class="text-center px-2 py-2.5 font-semibold">年齡</th>
                    <th class="text-center px-2 py-2.5 font-semibold">本週分數</th>
                    <th class="text-center px-2 py-2.5 font-semibold">較上週</th>
                    <th class="text-center px-2 py-2.5 font-semibold">訓練天數</th>
                    <th class="text-center px-2 py-2.5 font-semibold">狀態</th>
                    <th class="text-center px-2 py-2.5 font-semibold">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in filteredPatientsList" :key="p.id"
                    class="transition-colors cursor-pointer" style="border-top:1px solid #EDE8E0;"
                    :style="hoveredRow === p.id ? 'background:#FFF8F0;' : ''"
                    @mouseenter="hoveredRow = p.id" @mouseleave="hoveredRow = null" @click="goDetail(p)">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2.5">
                        <img :src="avatarSrc(p)" class="w-8 h-8 rounded-full object-cover shrink-0" />
                        <span class="font-semibold text-[13px]" style="color:#2D2010;">{{ p.name }}</span>
                      </div>
                    </td>
                    <td class="text-center px-2 py-3 text-[13px]" style="color:#6B6B6B;">{{ p.age }}</td>
                    <td class="text-center px-2 py-3">
                      <span class="font-bold text-[13px]" :style="{ color: p.weekScore >= 80 ? '#1E9E6A' : p.weekScore >= 65 ? '#E8974A' : '#C04030' }">{{ p.weekScore }} 分</span>
                    </td>
                    <td class="text-center px-2 py-3">
                      <span class="text-[12px] font-bold" :style="{ color: p.weekDelta > 0 ? '#1E9E6A' : p.weekDelta < 0 ? '#C04030' : '#9B7040' }">
                        {{ p.weekDelta > 0 ? '↑' : p.weekDelta < 0 ? '↓' : '—' }} {{ Math.abs(p.weekDelta) }}
                      </span>
                    </td>
                    <td class="text-center px-2 py-3 text-[13px]" style="color:#6B6B6B;">{{ p.weeklyCount }} 天</td>
                    <td class="text-center px-2 py-3">
                      <span class="px-2 py-0.5 rounded-full text-[11px] font-bold" :style="getStatusBadge(p)">{{ p.statusLabel }}</span>
                    </td>
                    <td class="text-center px-2 py-3">
                      <button class="text-[11px] px-2.5 py-1 rounded-lg font-semibold"
                        style="background:#FFF1E0; color:#C87820;" @click.stop="goDetail(p)">查看詳情</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 最近訓練記錄 -->
            <div class="bg-white rounded-2xl p-4" style="border:1px solid #EDE8E0;">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-black text-[13px]" style="color:#2D2010;">最近訓練記錄</h3>
                <a href="#" class="text-[11px]" style="color:#E8974A;">查看全部 →</a>
              </div>
              <div class="grid grid-cols-3 gap-3">
                <div v-for="rec in recentTrainingRecords" :key="rec.id"
                  class="flex items-center gap-3 p-3 rounded-xl" style="background:#FAFAF7;">
                  <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" :style="{ background: rec.iconBg }">
                    <Icon :icon="rec.icon" width="18" height="18" :style="{ color: rec.iconColor }" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-[13px] font-semibold" style="color:#2D2010;">{{ rec.name }}</div>
                    <div class="text-[11px]" style="color:#9B7040;">{{ rec.game }}</div>
                  </div>
                  <div class="text-right shrink-0">
                    <div class="font-black text-[13px]" :style="{ color: rec.score >= 80 ? '#1E9E6A' : '#E8974A' }">{{ rec.score }} 分</div>
                    <div class="text-[11px]" style="color:#9B7040;">{{ rec.time }}</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- ────── 右側統一欄（300px，一條到底）────── -->
          <div class="space-y-4">

            <!-- 本週關注名單 -->
            <div class="bg-white rounded-2xl p-4" style="border:1px solid #EDE8E0;">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-black text-[13px]" style="color:#2D2010;">本週關注名單</h3>
                <a href="#" class="text-[11px]" style="color:#E8974A;">查看全部 →</a>
              </div>
              <div class="space-y-2">
                <div v-for="w in watchList" :key="w.name"
                  class="flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer"
                  style="background:#FAFAF7;" @click="goDetail(w)">
                  <img :src="avatarSrc(w)" class="w-9 h-9 rounded-full object-cover shrink-0" />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5 mb-0.5">
                      <span class="font-bold text-[13px]" style="color:#2D2010;">{{ w.name }}</span>
                      <span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold" :style="w.tagStyle">{{ w.tag }}</span>
                    </div>
                    <p class="text-[11px] leading-snug" style="color:#9B7040;">{{ w.note }}</p>
                  </div>
                  <span class="text-[18px] shrink-0" style="color:#C8C0B0; line-height:1.4;">›</span>
                </div>
              </div>
            </div>

            <!-- 活動參與分析 -->
            <div class="bg-white rounded-2xl p-4" style="border:1px solid #EDE8E0;">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-black text-[13px]" style="color:#2D2010;">
                  活動參與分析<span class="text-[11px] font-normal ml-1" style="color:#9B7040;">本月</span>
                </h3>
                <a href="#" class="text-[11px]" style="color:#E8974A;">查看全部 →</a>
              </div>
              <div class="flex items-center gap-3">
                <div class="relative shrink-0" style="width:88px; height:88px;">
                  <Doughnut :data="activityDonutData" :options="donutChartOptions" />
                </div>
                <div class="flex-1 space-y-1.5">
                  <div v-for="a in activityDistribution" :key="a.label" class="flex items-center justify-between text-[11px]">
                    <div class="flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-sm shrink-0" :style="{ background: a.color }"></span>
                      <span style="color:#6B6B6B;">{{ a.label }}</span>
                    </div>
                    <span class="font-bold" style="color:#2D2010;">{{ a.pct }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 本月參與之星 -->
            <div class="bg-white rounded-2xl p-4" style="border:1px solid #EDE8E0;">
              <h3 class="font-black text-[13px] mb-3" style="color:#2D2010;">本月參與之星</h3>
              <div class="flex items-end justify-center gap-3">
                <div class="flex flex-col items-center gap-1">
                  <img :src="avatarSrc(starPodium[1])" class="w-9 h-9 rounded-full object-cover" />
                  <div class="text-[10px] font-bold" style="color:#6B6B6B;">{{ starPodium[1]?.name }}</div>
                  <div class="w-10 rounded-t flex items-center justify-center" style="height:36px; background:#E8E0D0;">
                    <span class="text-[12px] font-black" style="color:#7B6B50;">2</span>
                  </div>
                </div>
                <div class="flex flex-col items-center gap-1">
                  <div class="text-[12px]">👑</div>
                  <img :src="avatarSrc(starPodium[0])" class="w-9 h-9 rounded-full object-cover" />
                  <div class="text-[10px] font-bold" style="color:#C87820;">{{ starPodium[0]?.name }}</div>
                  <div class="w-10 rounded-t flex items-center justify-center" style="height:50px; background:#FEE8C0;">
                    <span class="text-[12px] font-black" style="color:#C87820;">1</span>
                  </div>
                </div>
                <div class="flex flex-col items-center gap-1">
                  <img :src="avatarSrc(starPodium[2])" class="w-9 h-9 rounded-full object-cover" />
                  <div class="text-[10px] font-bold" style="color:#6B6B6B;">{{ starPodium[2]?.name }}</div>
                  <div class="w-10 rounded-t flex items-center justify-center" style="height:26px; background:#EDE8DC;">
                    <span class="text-[12px] font-black" style="color:#8B7B60;">3</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 連續訓練排行榜 -->
            <div class="bg-white rounded-2xl p-4" style="border:1px solid #EDE8E0;">
              <h3 class="font-black text-[13px] mb-3" style="color:#2D2010;">連續訓練排行榜</h3>
              <div class="space-y-2.5">
                <div v-for="(p, i) in streakRanking" :key="p.name" class="flex items-center gap-2">
                  <div class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 text-white"
                    :style="{ background: i === 0 ? '#E8974A' : i === 1 ? '#9B7040' : '#C8B898' }">{{ i + 1 }}</div>
                  <img :src="avatarSrc(p)" class="w-7 h-7 rounded-full object-cover shrink-0" />
                  <span class="flex-1 text-[12px] font-semibold" style="color:#2D2010;">{{ p.name }}</span>
                  <span class="text-[11px] font-bold" style="color:#E8974A;">{{ p.days }} 天</span>
                </div>
              </div>
              <a href="#" class="block text-center text-[11px] mt-3 pt-2.5 font-semibold border-t"
                style="border-color:#EDE8E0; color:#E8974A;">查看完整排行榜 →</a>
            </div>

          </div>
        </div>

        </template><!-- end overview -->

        <!-- ══════════════════ 長者管理 ══════════════════ -->
        <template v-else-if="activeNav === 'seniors'">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-black text-[17px]" style="color:#2D2010;">長者管理</h2>
              <p class="text-[12px]" style="color:#9B7040;">共 {{ patients.length }} 位長者</p>
            </div>
            <button class="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold text-white"
              style="background:#E8974A; box-shadow:0 2px 8px rgba(232,151,74,0.35);">
              ＋ 新增長者
            </button>
          </div>

          <!-- 搜尋列 -->
          <div class="flex items-center gap-3 bg-white rounded-2xl p-3" style="border:1px solid #EDE8E0;">
            <div class="relative flex-1 max-w-xs">
              <input v-model="searchQuery" placeholder="搜尋姓名…"
                class="w-full text-[13px] pl-8 pr-3 py-2 rounded-xl outline-none"
                style="background:#F5F0E8; border:1px solid #EDE8E0; color:#2D2010;" />
              <Icon icon="solar:magnifer-bold" width="13" height="13" class="absolute left-2.5 top-1/2 -translate-y-1/2" style="color:#9B7040;" />
            </div>
            <select v-model="statusFilter" class="text-[12px] px-3 py-2 rounded-xl outline-none cursor-pointer"
              style="background:#F5F0E8; border:1px solid #EDE8E0; color:#6B6B6B;">
              <option value="all">全部狀態</option>
              <option value="穩定表現">穩定表現</option>
              <option value="持續進步">持續進步</option>
              <option value="建議加強">建議加強</option>
              <option value="近期較少參與">近期較少參與</option>
            </select>
            <span class="text-[12px]" style="color:#9B7040;">共 {{ filteredPatientsList.length }} 筆結果</span>
          </div>

          <!-- 長者卡片 grid -->
          <div class="grid grid-cols-3 gap-4">
            <div v-for="p in filteredPatientsList" :key="p.id"
              class="bg-white rounded-2xl p-5 cursor-pointer transition-all"
              style="border:1px solid #EDE8E0; box-shadow:0 2px 8px rgba(0,0,0,0.04);"
              :style="hoveredRow === p.id ? 'box-shadow:0 4px 20px rgba(232,151,74,0.18); border-color:#E8974A;' : ''"
              @mouseenter="hoveredRow = p.id" @mouseleave="hoveredRow = null"
              @click="goDetail(p)">
              <!-- Header -->
              <div class="flex items-center gap-3 mb-4">
                <img :src="avatarSrc(p)" class="w-12 h-12 rounded-full object-cover shrink-0" />
                <div class="flex-1 min-w-0">
                  <div class="font-black text-[15px]" style="color:#2D2010;">{{ p.name }}</div>
                  <div class="text-[12px]" style="color:#9B7040;">{{ p.age }} 歲</div>
                </div>
                <span class="px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0" :style="getStatusBadge(p)">{{ p.statusLabel }}</span>
              </div>
              <!-- 五維 mini bars -->
              <div class="space-y-1.5 mb-4">
                <div v-for="(score, di) in p.dimensions" :key="di" class="flex items-center gap-2">
                  <div class="text-[10px] w-10 shrink-0 text-right" style="color:#9B7040;">{{ ['記憶','注意','執行','視覺','反應'][di] }}</div>
                  <div class="flex-1 h-1.5 rounded-full" style="background:#F0EBE0;">
                    <div class="h-full rounded-full transition-all"
                      :style="{ width: score+'%', background: score>=75?'#1E9E6A':score>=55?'#E8974A':'#C04030' }"></div>
                  </div>
                  <div class="text-[10px] w-6 shrink-0 font-bold" :style="{ color: score>=75?'#1E9E6A':score>=55?'#E8974A':'#C04030' }">{{ score }}</div>
                </div>
              </div>
              <!-- Footer stats -->
              <div class="flex items-center justify-between pt-3 border-t" style="border-color:#EDE8E0;">
                <div class="text-center">
                  <div class="font-black text-[15px]" style="color:#2D2010;">{{ p.weeklyCount }}</div>
                  <div class="text-[10px]" style="color:#9B7040;">本週場次</div>
                </div>
                <div class="text-center">
                  <div class="font-black text-[15px]" :style="{ color: p.weekScore>=80?'#1E9E6A':'#E8974A' }">{{ p.weekScore }}</div>
                  <div class="text-[10px]" style="color:#9B7040;">平均分數</div>
                </div>
                <div class="text-center">
                  <div class="font-black text-[15px]" :style="{ color: p.weekDelta>0?'#1E9E6A':p.weekDelta<0?'#C04030':'#9B7040' }">
                    {{ p.weekDelta>0?'↑':p.weekDelta<0?'↓':'—' }}{{ Math.abs(p.weekDelta) }}
                  </div>
                  <div class="text-[10px]" style="color:#9B7040;">週變化</div>
                </div>
                <button class="text-[11px] px-3 py-1.5 rounded-lg font-semibold"
                  style="background:#FFF1E0; color:#C87820;" @click.stop="goDetail(p)">詳情</button>
              </div>
            </div>
          </div>
        </template>

        <!-- ══════════════════ 訓練紀錄 ══════════════════ -->
        <template v-else-if="activeNav === 'records'">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-black text-[17px]" style="color:#2D2010;">訓練紀錄</h2>
              <p class="text-[12px]" style="color:#9B7040;">所有長者的遊戲訓練歷史</p>
            </div>
            <button class="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold"
              style="background:#FFF1E0; color:#C87820; border:1px solid rgba(232,151,74,0.3);">
              ⬇ 匯出 CSV
            </button>
          </div>

          <!-- 活動參與概覽卡片 -->
          <div class="grid grid-cols-5 gap-3">
            <div v-for="game in gameStats" :key="game.name"
              class="bg-white rounded-2xl p-4 text-center" style="border:1px solid #EDE8E0;">
              <div class="flex justify-center mb-2">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center" :style="{ background: game.iconBg }">
                  <Icon :icon="game.icon" width="22" height="22" :style="{ color: game.iconColor }" />
                </div>
              </div>
              <div class="font-black text-[15px] mb-0.5" style="color:#2D2010;">{{ game.sessions }}</div>
              <div class="text-[11px] font-semibold mb-1" style="color:#6B6B6B;">{{ game.name }}</div>
              <div class="text-[11px]" :style="{ color: game.avgScore>=80?'#1E9E6A':'#E8974A' }">均 {{ game.avgScore }} 分</div>
            </div>
          </div>

          <!-- 紀錄表 -->
          <div class="bg-white rounded-2xl overflow-hidden" style="border:1px solid #EDE8E0;">
            <div class="px-4 py-3 flex items-center justify-between border-b" style="border-color:#EDE8E0;">
              <h3 class="font-black text-[13px]" style="color:#2D2010;">所有訓練記錄</h3>
              <div class="flex items-center gap-2">
                <select class="text-[12px] px-2 py-1.5 rounded-lg outline-none cursor-pointer"
                  style="background:#F5F0E8; color:#6B6B6B; border:1px solid #EDE8E0;">
                  <option>全部長者</option>
                  <option v-for="p in patients" :key="p.id">{{ p.name }}</option>
                </select>
                <select class="text-[12px] px-2 py-1.5 rounded-lg outline-none cursor-pointer"
                  style="background:#F5F0E8; color:#6B6B6B; border:1px solid #EDE8E0;">
                  <option>全部遊戲</option>
                  <option v-for="g in gameStats" :key="g.name">{{ g.name }}</option>
                </select>
              </div>
            </div>
            <table class="w-full">
              <thead style="background:#FAFAF7;">
                <tr class="text-[11px]" style="color:#9B7040;">
                  <th class="text-left px-4 py-2.5 font-semibold">時間</th>
                  <th class="text-left px-4 py-2.5 font-semibold">長者</th>
                  <th class="text-left px-4 py-2.5 font-semibold">遊戲項目</th>
                  <th class="text-center px-3 py-2.5 font-semibold">分數</th>
                  <th class="text-center px-3 py-2.5 font-semibold">訓練時長</th>
                  <th class="text-center px-3 py-2.5 font-semibold">強化維度</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="rec in allTrainingRecords" :key="rec.id"
                  class="transition-colors" style="border-top:1px solid #EDE8E0;"
                  :style="hoveredRow === rec.id ? 'background:#FFF8F0;' : ''"
                  @mouseenter="hoveredRow = rec.id" @mouseleave="hoveredRow = null">
                  <td class="px-4 py-3 text-[12px]" style="color:#9B7040;">{{ rec.datetime }}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <img :src="avatarSrc(rec.patient)" class="w-7 h-7 rounded-full object-cover shrink-0" />
                      <span class="font-semibold text-[13px]" style="color:#2D2010;">{{ rec.patient.name }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <Icon :icon="rec.icon" width="16" height="16" :style="{ color: rec.iconColor }" />
                      <span class="text-[13px]" style="color:#2D2010;">{{ rec.game }}</span>
                    </div>
                  </td>
                  <td class="text-center px-3 py-3">
                    <span class="font-black text-[13px]" :style="{ color: rec.score>=80?'#1E9E6A':'#E8974A' }">{{ rec.score }} 分</span>
                  </td>
                  <td class="text-center px-3 py-3 text-[12px]" style="color:#6B6B6B;">{{ rec.duration }} 分鐘</td>
                  <td class="text-center px-3 py-3">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold" style="background:#EEF4FB; color:#2C7BC8;">{{ rec.dimension }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <!-- ══════════════════ 報表分析 ══════════════════ -->
        <template v-else-if="activeNav === 'analysis'">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-black text-[17px]" style="color:#2D2010;">報表分析</h2>
              <p class="text-[12px]" style="color:#9B7040;">中心整體表現與趨勢</p>
            </div>
            <div class="flex items-center gap-2">
              <div v-for="r in ['本週','本月','近3月']" :key="r"
                class="px-3 py-1.5 rounded-xl text-[12px] font-semibold cursor-pointer transition-all"
                :style="analysisRange===r ? 'background:#E8974A; color:white;' : 'background:#F5F0E8; color:#9B7040;'"
                @click="analysisRange=r">{{ r }}</div>
              <button class="px-4 py-2 rounded-xl text-[13px] font-semibold ml-2"
                style="background:#FFF1E0; color:#C87820; border:1px solid rgba(232,151,74,0.3);">⬇ 匯出報表</button>
            </div>
          </div>

          <!-- 摘要 -->
          <div class="grid grid-cols-4 gap-3">
            <div v-for="s in analysisSummary" :key="s.label" class="bg-white rounded-2xl p-4" style="border:1px solid #EDE8E0;">
              <div class="text-[12px] mb-1" style="color:#9B7040;">{{ s.label }}</div>
              <div class="font-black text-[22px] leading-none mb-1" :style="{ color: s.color }">{{ s.value }}</div>
              <div class="text-[11px] font-semibold" :style="{ color: s.positive?'#1E9E6A':'#C04030' }">
                {{ s.positive?'↑':'↓' }} {{ s.change }}
              </div>
            </div>
          </div>

          <!-- 圖表區 -->
          <div class="grid grid-cols-2 gap-4">
            <!-- 整體趨勢 -->
            <div class="bg-white rounded-2xl p-4" style="border:1px solid #EDE8E0;">
              <h3 class="font-black text-[13px] mb-3" style="color:#2D2010;">整體能力趨勢</h3>
              <div style="height:200px;">
                <Line :data="trendLineData" :options="lineChartOptions" />
              </div>
            </div>
            <!-- 遊戲參與 -->
            <div class="bg-white rounded-2xl p-4" style="border:1px solid #EDE8E0;">
              <h3 class="font-black text-[13px] mb-3" style="color:#2D2010;">遊戲活動參與分布</h3>
              <div class="flex items-center gap-4">
                <div class="relative shrink-0" style="width:160px; height:160px;">
                  <Doughnut :data="activityDonutData" :options="donutChartOptions" />
                </div>
                <div class="flex-1 space-y-2">
                  <div v-for="a in activityDistribution" :key="a.label">
                    <div class="flex items-center justify-between mb-1 text-[12px]">
                      <div class="flex items-center gap-1.5">
                        <span class="w-2.5 h-2.5 rounded-sm" :style="{ background: a.color }"></span>
                        <span style="color:#6B6B6B;">{{ a.label }}</span>
                      </div>
                      <span class="font-bold" style="color:#2D2010;">{{ a.pct }}%</span>
                    </div>
                    <div class="h-1.5 rounded-full" style="background:#F0EBE0;">
                      <div class="h-full rounded-full" :style="{ width: a.pct+'%', background: a.color }"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 長者個別比較 -->
          <div class="bg-white rounded-2xl p-4" style="border:1px solid #EDE8E0;">
            <h3 class="font-black text-[13px] mb-4" style="color:#2D2010;">長者表現比較</h3>
            <div class="space-y-3">
              <div v-for="p in patients" :key="p.id" class="flex items-center gap-4">
                <img :src="avatarSrc(p)" class="w-7 h-7 rounded-full object-cover shrink-0" />
                <div class="w-16 text-[12px] font-semibold shrink-0" style="color:#2D2010;">{{ p.name }}</div>
                <div class="flex-1 flex gap-1">
                  <div v-for="(score, di) in p.dimensions" :key="di"
                    class="flex-1 rounded-sm transition-all"
                    :title="['記憶力','注意力','執行力','視覺空間','反應力'][di]+': '+score"
                    :style="{ height:'20px', background: score>=75?'#1E9E6A':score>=55?'#E8974A':'#C04030', opacity: 0.7+score/333 }"></div>
                </div>
                <div class="w-12 text-right font-black text-[13px]" :style="{ color: p.weekScore>=80?'#1E9E6A':'#E8974A' }">{{ p.weekScore }}</div>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold w-20 text-center" :style="getStatusBadge(p)">{{ p.statusLabel }}</span>
              </div>
            </div>
            <div class="flex gap-4 mt-3 pt-3 border-t text-[11px]" style="border-color:#EDE8E0; color:#9B7040;">
              <span>← 記憶力</span><span>注意力</span><span>執行力</span><span>視覺空間</span><span>反應力 →</span>
            </div>
          </div>
        </template>

        <!-- ══════════════════ 設定 ══════════════════ -->
        <template v-else-if="activeNav === 'settings'">
          <div>
            <h2 class="font-black text-[17px]" style="color:#2D2010;">設定管理</h2>
            <p class="text-[12px]" style="color:#9B7040;">機構與帳號相關設定</p>
          </div>

          <div class="grid grid-cols-2 gap-4">

            <!-- 機構資訊 -->
            <div class="bg-white rounded-2xl p-5" style="border:1px solid #EDE8E0;">
              <h3 class="font-black text-[14px] mb-4 pb-3 border-b flex items-center gap-2" style="color:#2D2010; border-color:#EDE8E0;">
                <Icon icon="solar:buildings-3-bold" width="16" height="16" style="color:#E8974A;" /> 機構資訊</h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-[11px] font-semibold mb-1" style="color:#9B7040;">機構名稱</label>
                  <input value="XX長照中心" class="w-full text-[13px] px-3 py-2 rounded-xl outline-none"
                    style="background:#F5F0E8; border:1px solid #EDE8E0; color:#2D2010;" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold mb-1" style="color:#9B7040;">聯絡電話</label>
                  <input value="(02) 1234-5678" class="w-full text-[13px] px-3 py-2 rounded-xl outline-none"
                    style="background:#F5F0E8; border:1px solid #EDE8E0; color:#2D2010;" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold mb-1" style="color:#9B7040;">地址</label>
                  <input value="台北市信義區XX路XX號" class="w-full text-[13px] px-3 py-2 rounded-xl outline-none"
                    style="background:#F5F0E8; border:1px solid #EDE8E0; color:#2D2010;" />
                </div>
                <button class="w-full py-2 rounded-xl text-[13px] font-semibold text-white mt-2"
                  style="background:#E8974A;">儲存變更</button>
              </div>
            </div>

            <!-- 帳號設定 -->
            <div class="bg-white rounded-2xl p-5" style="border:1px solid #EDE8E0;">
              <h3 class="font-black text-[14px] mb-4 pb-3 border-b flex items-center gap-2" style="color:#2D2010; border-color:#EDE8E0;">
                <Icon icon="solar:user-bold" width="16" height="16" style="color:#E8974A;" /> 帳號設定</h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-[11px] font-semibold mb-1" style="color:#9B7040;">管理員姓名</label>
                  <input value="王小明" class="w-full text-[13px] px-3 py-2 rounded-xl outline-none"
                    style="background:#F5F0E8; border:1px solid #EDE8E0; color:#2D2010;" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold mb-1" style="color:#9B7040;">電子信箱</label>
                  <input value="admin@xxltc.com.tw" class="w-full text-[13px] px-3 py-2 rounded-xl outline-none"
                    style="background:#F5F0E8; border:1px solid #EDE8E0; color:#2D2010;" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold mb-1" style="color:#9B7040;">新密碼</label>
                  <input type="password" placeholder="留空則不修改" class="w-full text-[13px] px-3 py-2 rounded-xl outline-none"
                    style="background:#F5F0E8; border:1px solid #EDE8E0; color:#2D2010;" />
                </div>
                <button class="w-full py-2 rounded-xl text-[13px] font-semibold text-white mt-2"
                  style="background:#E8974A;">儲存變更</button>
              </div>
            </div>

            <!-- 通知設定 -->
            <div class="bg-white rounded-2xl p-5" style="border:1px solid #EDE8E0;">
              <h3 class="font-black text-[14px] mb-4 pb-3 border-b flex items-center gap-2" style="color:#2D2010; border-color:#EDE8E0;">
                <Icon icon="solar:bell-bold" width="16" height="16" style="color:#E8974A;" /> 通知設定</h3>
              <div class="space-y-4">
                <div v-for="n in notificationSettings" :key="n.key"
                  class="flex items-center justify-between">
                  <div>
                    <div class="text-[13px] font-semibold" style="color:#2D2010;">{{ n.label }}</div>
                    <div class="text-[11px]" style="color:#9B7040;">{{ n.desc }}</div>
                  </div>
                  <div class="relative w-11 h-6 rounded-full cursor-pointer transition-all shrink-0"
                    :style="n.on ? 'background:#E8974A;' : 'background:#DDD8D0;'"
                    @click="n.on = !n.on">
                    <div class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                      :style="n.on ? 'left:22px;' : 'left:2px;'"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 系統資訊 -->
            <div class="bg-white rounded-2xl p-5" style="border:1px solid #EDE8E0;">
              <h3 class="font-black text-[14px] mb-4 pb-3 border-b flex items-center gap-2" style="color:#2D2010; border-color:#EDE8E0;">
                <Icon icon="solar:settings-bold" width="16" height="16" style="color:#E8974A;" /> 系統資訊</h3>
              <div class="space-y-3 text-[13px]">
                <div class="flex justify-between py-2 border-b" style="border-color:#EDE8E0;">
                  <span style="color:#9B7040;">系統版本</span>
                  <span class="font-semibold" style="color:#2D2010;">KIM-I v1.0.0</span>
                </div>
                <div class="flex justify-between py-2 border-b" style="border-color:#EDE8E0;">
                  <span style="color:#9B7040;">最後更新</span>
                  <span class="font-semibold" style="color:#2D2010;">2024/05/28</span>
                </div>
                <div class="flex justify-between py-2 border-b" style="border-color:#EDE8E0;">
                  <span style="color:#9B7040;">資料儲存</span>
                  <span class="font-semibold" style="color:#1E9E6A;">正常</span>
                </div>
                <div class="flex justify-between py-2">
                  <span style="color:#9B7040;">長者總數</span>
                  <span class="font-semibold" style="color:#2D2010;">{{ patients.length }} 位</span>
                </div>
              </div>
              <button class="w-full mt-4 py-2 rounded-xl text-[13px] font-semibold"
                style="background:#FFF1E0; color:#C87820; border:1px solid rgba(232,151,74,0.3);">
                ⬇ 備份資料
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
import avatar1 from '../assets/avatars/avatar-1-grandma-traditional.jpg'
import avatar2 from '../assets/avatars/avatar-2-grandpa-shirt.jpg'
import avatar3 from '../assets/avatars/avatar-3-grandma-floral.jpg'
import avatar4 from '../assets/avatars/avatar-4-grandpa-polo.jpg'
import avatar5 from '../assets/avatars/avatar-5-grandma-bun.jpg'
import avatar6 from '../assets/avatars/avatar-6-grandpa-tang.jpg'
import { useGameStore } from '../stores/gameStore'
import {
  Chart as ChartJS,
  RadialLinearScale, PointElement, LineElement, Filler,
  Tooltip, Legend, CategoryScale, LinearScale, ArcElement, Title,
} from 'chart.js'
import { Radar, Line, Doughnut } from 'vue-chartjs'

ChartJS.register(
  RadialLinearScale, PointElement, LineElement, Filler,
  Tooltip, Legend, CategoryScale, LinearScale, ArcElement, Title,
)

const router = useRouter()
const store  = useGameStore()

// ─── Nav ────────────────────────────────────────────────────────────────────
const activeNav = ref('overview')
const navItems = [
  { key:'overview',  icon:'solar:home-2-bold',                 label:'總覽首頁' },
  { key:'seniors',   icon:'solar:users-group-rounded-bold',    label:'長者管理' },
  { key:'records',   icon:'solar:clipboard-list-bold',         label:'訓練紀錄' },
  { key:'analysis',  icon:'solar:chart-square-bold',           label:'報表分析' },
  { key:'settings',  icon:'solar:settings-bold',               label:'設定管理' },
]

// ─── State ───────────────────────────────────────────────────────────────────
const hoveredRow   = ref(null)
const searchQuery  = ref('')
const statusFilter = ref('all')
const analysisRange = ref('本週')

// ─── Notification settings ────────────────────────────────────────────────────
const notificationSettings = ref([
  { key:'inactive',   label:'長者未登入提醒',   desc:'連續 3 天未參與時通知',      on:true  },
  { key:'decline',    label:'認知分數下降警示', desc:'分數降幅超過 10 分時通知',   on:true  },
  { key:'weekly',     label:'每週報表寄送',     desc:'每週一自動寄送週報至信箱',   on:false },
  { key:'milestone',  label:'里程碑達成通知',   desc:'長者達成訓練目標時提醒',     on:true  },
])

// ─── Game stats ───────────────────────────────────────────────────────────────
const gameStats = [
  { name:'記憶音樂', icon:'solar:music-note-bold',        iconColor:'#2C7BC8', iconBg:'#EEF4FB', sessions:42, avgScore:83 },
  { name:'購物清單', icon:'solar:bag-2-bold',              iconColor:'#C87820', iconBg:'#FEF3E8', sessions:38, avgScore:76 },
  { name:'廚房烹飪', icon:'solar:cup-hot-bold',            iconColor:'#1E9E6A', iconBg:'#E8F5EF', sessions:31, avgScore:81 },
  { name:'布袋戲謎', icon:'solar:masks-theatre-bold',      iconColor:'#7B4EA0', iconBg:'#F5EEF8', sessions:25, avgScore:69 },
  { name:'拼圖謎題', icon:'solar:widget-2-bold',           iconColor:'#C04030', iconBg:'#FEF0F0', sessions:29, avgScore:74 },
]

// ─── All training records ─────────────────────────────────────────────────────
const allTrainingRecords = computed(() => {
  const gamesPool = [
    { game:'記憶音樂', icon:'solar:music-note-bold',   iconColor:'#2C7BC8', dimension:'記憶力' },
    { game:'購物清單', icon:'solar:bag-2-bold',         iconColor:'#C87820', dimension:'執行力' },
    { game:'廚房烹飪', icon:'solar:cup-hot-bold',       iconColor:'#1E9E6A', dimension:'注意力' },
    { game:'布袋戲謎', icon:'solar:masks-theatre-bold', iconColor:'#7B4EA0', dimension:'反應力' },
    { game:'拼圖謎題', icon:'solar:widget-2-bold',      iconColor:'#C04030', dimension:'視覺空間' },
  ]
  const datetimes = [
    '今天 10:20','今天 09:45','今天 09:10',
    '昨天 16:30','昨天 15:20','昨天 14:00',
    '前天 17:10','前天 15:50',
  ]
  return patients.value.flatMap((p, pi) =>
    [0,1].map((j) => {
      const g = gamesPool[(pi+j) % gamesPool.length]
      return {
        id: pi*2+j,
        datetime: datetimes[(pi*2+j) % datetimes.length],
        patient: p,
        ...g,
        score: Math.min(100, p.weekScore + (j%3-1)*5),
        duration: 10 + (pi+j)%8,
      }
    })
  )
})

// ─── Analysis summary ─────────────────────────────────────────────────────────
const analysisSummary = computed(() => {
  const total   = patients.value.length
  const avgScore = Math.round(patients.value.reduce((s,p) => s+p.weekScore,0) / total)
  const sessions = gameStats.reduce((s,g) => s+g.sessions, 0)
  const improved = patients.value.filter(p => (p.weekDelta||0) > 0).length
  return [
    { label:'平均認知分數', value:avgScore,         color:'#E8974A', change:'較上月 +3 分',   positive:true  },
    { label:'本週訓練場次', value:sessions,          color:'#5B9BD5', change:'較上週 +12 場', positive:true  },
    { label:'進步長者人數', value:improved,          color:'#52B788', change:'較上週 +2 位',  positive:true  },
    { label:'平均出席率',   value:'78%',             color:'#9B6DCF', change:'較上月 -2%',    positive:false },
  ]
})

// ─── Date ────────────────────────────────────────────────────────────────────
const todayLabel = computed(() => {
  const d = new Date()
  const days = ['日','一','二','三','四','五','六']
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} (${days[d.getDay()]})`
})

// ─── Patients ────────────────────────────────────────────────────────────────
const liveWeeklyCount    = computed(() => store.sessions.filter(s => s.timestamp >= Date.now() - 7*86400000).length)
const liveLastActiveDays = computed(() => {
  if (!store.sessions.length) return 99
  return Math.floor((Date.now() - store.sessions.slice(-1)[0].timestamp) / 86400000)
})
const liveDimensions = computed(() => store.radarCurrent.map(Math.round))

const STATIC_PATIENTS = [
  { id:2, name:'王伯伯', age:82, weeklyCount:5, lastActiveDays:0,  dimensions:[82,75,80,78,70], weekDelta:6  },
  { id:3, name:'李阿姨', age:78, weeklyCount:7, lastActiveDays:0,  dimensions:[88,82,84,80,76], weekDelta:12 },
  { id:4, name:'陳奶奶', age:85, weeklyCount:2, lastActiveDays:1,  dimensions:[65,60,68,62,58], weekDelta:-8 },
  { id:5, name:'林爺爺', age:80, weeklyCount:4, lastActiveDays:0,  dimensions:[72,68,76,70,65], weekDelta:2  },
  { id:6, name:'張奶奶', age:76, weeklyCount:3, lastActiveDays:1,  dimensions:[70,65,72,68,62], weekDelta:0  },
]

const AVATAR_COLORS = [
  { bg:'#FEE8D0', color:'#C87820' },
  { bg:'#E8F5EF', color:'#1E7A50' },
  { bg:'#EEF4FB', color:'#2C5FA0' },
  { bg:'#F5EEF8', color:'#7030A0' },
  { bg:'#FEF0F0', color:'#C03030' },
  { bg:'#F0F4EE', color:'#3A6030' },
]

const avatarStyle = (p) => {
  if (!p) return ''
  const c = AVATAR_COLORS[(p.id || 0) % AVATAR_COLORS.length]
  return `background:${c.bg}; color:${c.color};`
}

const AVATAR_IMAGES = { 1:avatar1, 2:avatar2, 3:avatar3, 4:avatar4, 5:avatar5, 6:avatar6 }
const avatarSrc = (p) => AVATAR_IMAGES[p?.id] || avatar1

const patients = computed(() => {
  const live = {
    id:1, name:'陳金美', age:75,
    weeklyCount: liveWeeklyCount.value,
    lastActiveDays: liveLastActiveDays.value,
    dimensions: liveDimensions.value.length ? liveDimensions.value : [68,62,70,66,60],
    weekDelta: 4,
  }
  return [live, ...STATIC_PATIENTS].map(p => {
    const avg = Math.round(p.dimensions.reduce((s,d) => s+d, 0) / p.dimensions.length)
    let statusLabel
    if (p.lastActiveDays >= 5)       statusLabel = '近期較少參與'
    else if (avg < 62)               statusLabel = '建議加強'
    else if ((p.weekDelta||0) > 3)   statusLabel = '持續進步'
    else                             statusLabel = '穩定表現'
    return { ...p, weekScore: avg, statusLabel }
  })
})

const filteredPatientsList = computed(() =>
  patients.value.filter(p => {
    const matchSearch = !searchQuery.value || p.name.includes(searchQuery.value)
    const matchStatus = statusFilter.value === 'all' || p.statusLabel === statusFilter.value
    return matchSearch && matchStatus
  })
)

// ─── KPI cards ───────────────────────────────────────────────────────────────
const kpiCards = computed(() => {
  const total      = patients.value.length
  const activeRate = Math.round(patients.value.filter(p => p.lastActiveDays === 0).length / total * 100)
  const avgScore   = Math.round(patients.value.reduce((s,p) => s+p.weekScore,0) / total)
  const trained    = patients.value.filter(p => p.weeklyCount > 0).length
  const improved   = patients.value.filter(p => (p.weekDelta||0) > 0).length
  return [
    { label:'長者總數',     icon:'solar:users-group-rounded-bold',    iconColor:'#C87820', iconBg:'#FEF0D8', value:total,      unit:'位', color:'#2D2010', positive:true,  changeText:'較上月 +5 位' },
    { label:'本週活躍率',   icon:'solar:heart-pulse-bold',            iconColor:'#1E9E6A', iconBg:'#E8F5EF', value:activeRate, unit:'%',  color:'#1E9E6A', positive:true,  changeText:'較上週 +6%'   },
    { label:'平均認知分數', icon:'solar:star-bold',                   iconColor:'#7B4EA0', iconBg:'#F0EBF8', value:avgScore,   unit:'分', color:'#7B4EA0', positive:true,  changeText:'較上週 +2 分' },
    { label:'完成訓練人數', icon:'solar:checklist-minimalistic-bold', iconColor:'#2C7BC8', iconBg:'#EEF4FB', value:trained,    unit:'位', color:'#2D2010', positive:true,  changeText:'本週完成'      },
    { label:'本週進步人數', icon:'solar:graph-up-bold',               iconColor:'#E8974A', iconBg:'#FEF0D8', value:improved,   unit:'位', color:'#E8974A', positive:true,  changeText:'較上週 +8 位' },
  ]
})

// ─── Status distribution ──────────────────────────────────────────────────────
const STATUS_COLORS = {
  '穩定表現':'#52B788', '持續進步':'#5B9BD5', '建議加強':'#E8974A', '近期較少參與':'#9B6DCF',
}
const statusDistribution = computed(() => {
  const total = patients.value.length
  const counts = { '穩定表現':0,'持續進步':0,'建議加強':0,'近期較少參與':0 }
  patients.value.forEach(p => { counts[p.statusLabel] = (counts[p.statusLabel]||0)+1 })
  return Object.entries(counts).map(([label, count]) => ({
    label, count, color: STATUS_COLORS[label],
    pct: Math.round(count/total*100),
  }))
})

const statusDonutData = computed(() => ({
  labels: statusDistribution.value.map(s => s.label),
  datasets: [{ data: statusDistribution.value.map(s => s.count),
    backgroundColor: statusDistribution.value.map(s => s.color),
    borderWidth:2, borderColor:'#fff', hoverOffset:4 }],
}))

// ─── Activity donut ───────────────────────────────────────────────────────────
const activityDistribution = [
  { label:'記憶力訓練', color:'#E8974A', pct:35 },
  { label:'注意力訓練', color:'#5B9BD5', pct:28 },
  { label:'反應力訓練', color:'#52B788', pct:15 },
  { label:'執行力訓練', color:'#9B6DCF', pct:12 },
  { label:'視覺空間',   color:'#9B9080', pct:10 },
]
const activityDonutData = {
  labels: activityDistribution.map(a => a.label),
  datasets: [{ data: activityDistribution.map(a => a.pct),
    backgroundColor: activityDistribution.map(a => a.color),
    borderWidth:2, borderColor:'#fff', hoverOffset:4 }],
}

// ─── Radar ────────────────────────────────────────────────────────────────────
const radarChartData = computed(() => {
  const avg = [0,0,0,0,0]
  patients.value.forEach(p => p.dimensions.forEach((d,i) => avg[i]+=d))
  const n = patients.value.length
  const cur  = avg.map(v => Math.round(v/n))
  const prev = cur.map(v => Math.round(v*0.93))
  return {
    labels: ['記憶力','注意力','執行力','視覺空間','反應力'],
    datasets: [
      { label:'本中心平均', data:cur,  borderColor:'#E8974A', backgroundColor:'rgba(232,151,74,0.18)',
        pointBackgroundColor:'#E8974A', pointRadius:4, borderWidth:2 },
      { label:'上月平均',   data:prev, borderColor:'#9B9080', backgroundColor:'transparent',
        borderDash:[4,4], pointRadius:3, pointBackgroundColor:'#9B9080', borderWidth:1.5 },
    ],
  }
})

const radarChartOptions = {
  responsive:true, maintainAspectRatio:true,
  plugins:{ legend:{ display:false } },
  scales:{
    r:{
      min:0, max:100,
      ticks:{ stepSize:25, font:{size:9}, color:'#9B7040', backdropColor:'transparent' },
      grid:{ color:'rgba(0,0,0,0.07)' }, angleLines:{ color:'rgba(0,0,0,0.07)' },
      pointLabels:{ font:{size:11,weight:'600'}, color:'#6B5030' },
    },
  },
}

// ─── Trend line ───────────────────────────────────────────────────────────────
const trendLineData = computed(() => {
  const labels = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate()-i)
    labels.push(`${d.getMonth()+1}/${d.getDate()}`)
  }
  const seed = (base, offset, trend) =>
    Array.from({length:30}, (_,i) => Math.min(100, Math.round(base + trend*i + Math.sin(i+offset)*2.5)))
  const series = [
    { label:'記憶力',   data:seed(66,0,0.38), color:'#E8974A' },
    { label:'注意力',   data:seed(61,1,0.33), color:'#5B9BD5' },
    { label:'執行力',   data:seed(71,2,0.28), color:'#52B788' },
    { label:'視覺空間', data:seed(59,3,0.35), color:'#9B6DCF' },
    { label:'反應力',   data:seed(56,4,0.30), color:'#E8684A' },
  ]
  return {
    labels,
    datasets: series.map(d => ({
      label:d.label, data:d.data, borderColor:d.color,
      backgroundColor:'transparent', tension:0.4, pointRadius:0, borderWidth:1.8,
    })),
  }
})

const lineChartOptions = {
  responsive:true, maintainAspectRatio:false,
  plugins:{
    legend:{ display:true, position:'bottom', labels:{ boxWidth:10,font:{size:9},padding:6,usePointStyle:true } },
    tooltip:{ mode:'index', intersect:false },
  },
  scales:{
    x:{ ticks:{ maxTicksLimit:6,font:{size:9},color:'#9B7040',maxRotation:0 }, grid:{display:false} },
    y:{ min:40,max:100, ticks:{ stepSize:20,font:{size:9},color:'#9B7040' }, grid:{color:'rgba(0,0,0,0.05)'} },
  },
}

const donutChartOptions = {
  responsive:true, maintainAspectRatio:true, cutout:'68%',
  plugins:{
    legend:{ display:false },
    tooltip:{ callbacks:{ label: ctx => ` ${ctx.label}: ${ctx.parsed}` } },
  },
}

// ─── Watch list ───────────────────────────────────────────────────────────────
const watchList = computed(() => {
  const TAG_MAP = {
    '穩定表現':   { style:'background:#E8F5EF; color:#1E9E6A;', tag:'穩定表現' },
    '持續進步':   { style:'background:#EEF4FB; color:#2C7BC8;', tag:'進步明顯' },
    '建議加強':   { style:'background:#FEF3E8; color:#C87820;', tag:'建議加強' },
    '近期較少參與':{ style:'background:#F5EEF8; color:#7B4EA0;', tag:'較少參與' },
  }
  return patients.value
    .filter(p => p.lastActiveDays >= 1 || p.weekDelta < 0 || p.weekScore < 70)
    .slice(0,3)
    .map(p => ({
      ...p,
      tagStyle: TAG_MAP[p.statusLabel]?.style || TAG_MAP['穩定表現'].style,
      tag:      TAG_MAP[p.statusLabel]?.tag   || p.statusLabel,
      note: p.weekDelta < 0
        ? `本週分數下降 ${Math.abs(p.weekDelta)} 分，建議安排更多訓練活動`
        : p.lastActiveDays >= 3
        ? `${p.lastActiveDays} 天未登入，請確認長者狀況`
        : `本週參與穩定，表現良好，請繼續保持！`,
    }))
})

// ─── Recent records ───────────────────────────────────────────────────────────
const recentTrainingRecords = computed(() => {
  const games = [
    { game:'記憶配對', icon:'solar:widget-2-bold',         iconColor:'#2C7BC8', iconBg:'#EEF4FB' },
    { game:'找不同',   icon:'solar:magnifer-bold',          iconColor:'#C87820', iconBg:'#FEF3E8' },
    { game:'快速反應', icon:'solar:bolt-bold',              iconColor:'#1E9E6A', iconBg:'#E8F5EF' },
    { game:'拼圖遊戲', icon:'solar:target-bold',            iconColor:'#7B4EA0', iconBg:'#F5EEF8' },
    { game:'記憶翻牌', icon:'solar:card-2-bold',            iconColor:'#C87820', iconBg:'#FEF3E8' },
  ]
  const times = ['今天 09:30','今天 09:10','昨天 15:20','昨天 14:30','前天 16:00']
  return patients.value.slice(0,5).map((p,i) => ({
    id:i, name:p.name,
    ...games[i % games.length],
    score: Math.min(100, p.weekScore + (i%3-1)*4),
    time:  times[i],
  }))
})

// ─── Podium / ranking ────────────────────────────────────────────────────────
const starPodium = computed(() =>
  [...patients.value].sort((a,b) => b.weeklyCount - a.weeklyCount).slice(0,3)
)
const streakRanking = computed(() =>
  [...patients.value].sort((a,b) => b.weeklyCount - a.weeklyCount).slice(0,3)
    .map(p => ({ ...p, days: p.weeklyCount*4 + Math.round(p.weekScore/10) }))
)

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getStatusBadge = (p) => ({
  '穩定表現':   'background:#E8F5EF; color:#1E9E6A;',
  '持續進步':   'background:#EEF4FB; color:#2C7BC8;',
  '建議加強':   'background:#FEF3E8; color:#C87820;',
  '近期較少參與':'background:#F5EEF8; color:#7B4EA0;',
}[p.statusLabel] || 'background:#E8F5EF; color:#1E9E6A;')

const goDetail = (p) => router.push({ name:'dashboard-family' })
</script>
