<template>
  <div class="caregiver-root">

    <!-- Mobile sidebar overlay -->
    <transition name="overlay-fade">
      <div v-if="mobileSidebarOpen" class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        @click="mobileSidebarOpen = false"></div>
    </transition>

    <!-- ══════════════════════ LEFT SIDEBAR ══════════════════════ -->
    <aside class="sidebar-panel" :class="{ 'mobile-open': mobileSidebarOpen, 'collapsed': sidebarCollapsed }"
      style="border-right:1px solid #EDE8E0; box-shadow:2px 0 8px rgba(0,0,0,0.04);">

      <!-- Logo -->
      <div class="px-4 pt-5 pb-4 flex items-center gap-3 border-b" style="border-color:#EDE8E0; min-height:72px;">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style="background:linear-gradient(135deg,#FFA040,#E8701A);">
          <Icon icon="solar:home-smile-bold" width="20" height="20" style="color:white;" />
        </div>
        <div class="logo-text flex-1 min-w-0 overflow-hidden">
          <div class="font-black text-[13px] leading-tight whitespace-nowrap" style="color:#2D2010;">認知訓練平台</div>
          <div class="text-[11px] mt-0.5 whitespace-nowrap" style="color:#9B7040;">XX長照中心</div>
        </div>
        <button class="collapse-btn shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all"
          style="background:#F5F0E8;"
          @click="sidebarCollapsed = !sidebarCollapsed">
          <Icon :icon="sidebarCollapsed ? 'solar:alt-arrow-right-bold' : 'solar:alt-arrow-left-bold'"
            width="12" height="12" style="color:#9B7040;" />
        </button>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <button v-for="item in navItems" :key="item.key"
          @click="activeNav = item.key; mobileSidebarOpen = false"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all text-left"
          :style="activeNav === item.key
            ? 'background:#FFF1E0; color:#C87820; font-weight:700;'
            : 'color:#6B5B40;'"
          :title="sidebarCollapsed ? item.label : ''">
          <Icon :icon="item.icon" width="17" height="17" class="shrink-0"
            :style="activeNav === item.key ? 'color:#C87820;' : 'color:#9B7040;'" />
          <span class="nav-label truncate">{{ item.label }}</span>
          <span v-if="sidebarCollapsed && activeNav === item.key"
            class="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style="background:#C87820;"></span>
        </button>
      </nav>

      <!-- Bottom -->
      <div class="px-3 pb-4 pt-3 border-t space-y-2" style="border-color:#EDE8E0;">
        <div class="flex justify-center gap-2 py-1">
          <Icon icon="solar:accessibility-bold" width="24" height="24" style="color:#E8974A; opacity:0.7;" />
          <Icon icon="solar:heart-bold" width="24" height="24" style="color:#E8974A; opacity:0.5;" class="nav-label" />
        </div>
        <button class="w-full py-2 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all hover:opacity-80"
          style="background:#FFF1E0; color:#C87820; border:1px solid rgba(232,151,74,0.25);"
          @click="showToast('使用教學功能開發中 🚀')">
          <Icon icon="solar:question-circle-bold" width="14" height="14" />
          <span class="nav-label">使用教學</span>
        </button>
        <button @click="$router.push('/')"
          class="w-full py-2 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all hover:opacity-80"
          style="background:#F5F0E8; color:#9B7040;">
          <Icon icon="solar:arrow-left-bold" width="14" height="14" />
          <span class="nav-label">回遊戲主頁</span>
        </button>
      </div>
    </aside>

    <!-- ══════════════════════ MAIN AREA ══════════════════════ -->
    <div class="main-panel flex flex-col overflow-hidden">

      <!-- Top bar -->
      <header class="shrink-0 px-4 flex items-center justify-between bg-white"
        style="border-bottom:1px solid #EDE8E0; box-shadow:0 1px 4px rgba(0,0,0,0.05); min-height:64px; gap:12px;">

        <!-- Mobile hamburger -->
        <button class="mobile-menu-btn shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-all"
          :style="mobileSidebarOpen ? 'background:#FFF1E0;' : 'background:#F5F0E8;'"
          @click="mobileSidebarOpen = !mobileSidebarOpen">
          <Icon :icon="mobileSidebarOpen ? 'solar:close-bold' : 'solar:hamburger-menu-bold'"
            width="18" height="18" style="color:#9B7040;" />
        </button>

        <div class="flex-1 min-w-0">
          <h2 class="font-black leading-tight truncate" style="font-size:clamp(14px,2.5vw,18px); color:#2D2010;">
            早安，王小明
          </h2>
          <p class="header-subtitle text-[12px] mt-0.5" style="color:#9B7040;">歡迎回到 XX長照中心管理後台</p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <div class="header-date flex items-center gap-1.5 text-[13px]" style="color:#9B7040;">
            <Icon icon="solar:calendar-bold" width="16" height="16" />
            <span>{{ todayLabel }}</span>
          </div>

          <!-- Bell + notification panel -->
          <div class="relative" ref="notifRef">
            <button class="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              :style="showNotifications ? 'background:#FFF1E0; box-shadow:0 0 0 2px #E8974A;' : 'background:#FFF1E0;'"
              @click.stop="showNotifications = !showNotifications">
              <Icon icon="solar:bell-bold" width="18" height="18" style="color:#C87820;" />
            </button>
            <div v-if="unreadCount > 0"
              class="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] rounded-full text-[10px] flex items-center justify-center font-black text-white notif-badge"
              style="background:#E05030;">{{ unreadCount }}</div>

            <!-- Notification dropdown -->
            <transition name="panel-drop">
              <div v-if="showNotifications"
                class="absolute right-0 w-80 bg-white rounded-2xl overflow-hidden z-50"
                style="top:calc(100% + 8px); border:1px solid #EDE8E0; box-shadow:0 20px 60px rgba(0,0,0,0.15);"
                @click.stop>
                <div class="px-4 py-3 flex items-center justify-between border-b" style="border-color:#EDE8E0;">
                  <h3 class="font-black text-[13px]" style="color:#2D2010;">通知中心</h3>
                  <button class="text-[11px] font-semibold transition-opacity hover:opacity-70" style="color:#E8974A;"
                    @click="markAllRead">全部已讀</button>
                </div>
                <div class="overflow-y-auto" style="max-height:280px;">
                  <div v-for="notif in notifications" :key="notif.id"
                    class="px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors"
                    :style="!notif.read ? 'background:#FFFCF8;' : ''"
                    @mouseenter="$event.currentTarget.style.background='#FFF8F0'"
                    @mouseleave="$event.currentTarget.style.background=notif.read?'':'#FFFCF8'"
                    @click="notif.read = true">
                    <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      :style="{ background: notif.iconBg }">
                      <Icon :icon="notif.icon" width="15" height="15" :style="{ color: notif.iconColor }" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-[12px] leading-snug" style="color:#2D2010;">{{ notif.message }}</p>
                      <p class="text-[11px] mt-0.5" style="color:#9B7040;">{{ notif.time }}</p>
                    </div>
                    <div v-if="!notif.read" class="w-2 h-2 rounded-full mt-1.5 shrink-0 notif-dot" style="background:#E8974A;"></div>
                  </div>
                </div>
                <div class="px-4 py-2.5 border-t text-center" style="border-color:#EDE8E0;">
                  <button class="text-[12px] font-semibold transition-opacity hover:opacity-70" style="color:#9B7040;">查看所有通知</button>
                </div>
              </div>
            </transition>
          </div>

          <div class="flex items-center gap-1.5 cursor-pointer">
            <div class="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center"
              style="background:#FFF1E0; border:2px solid #EDE8E0;">
              <Icon icon="solar:stethoscope-bold" width="18" height="18" style="color:#C87820;" />
            </div>
            <Icon icon="solar:alt-arrow-down-bold" width="12" height="12" style="color:#9B7040;" class="header-date" />
          </div>
        </div>
      </header>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4" @click="showNotifications = false">

        <!-- ══════════════════ 總覽首頁 ══════════════════ -->
        <transition name="tab-fade" mode="out-in">
        <div v-if="activeNav === 'overview'" key="overview" class="space-y-4">

          <!-- KPI cards -->
          <div class="kpi-grid">
            <div v-for="(kpi, ki) in kpiCards" :key="kpi.label"
              class="bg-white rounded-2xl p-4 flex flex-col gap-2 kpi-card"
              :style="`border:1px solid #EDE8E0; box-shadow:0 2px 8px rgba(0,0,0,0.04); animation-delay:${ki*80}ms`">
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

          <!-- Two-column overview -->
          <div class="overview-grid gap-4">

            <!-- Left -->
            <div class="space-y-4 min-w-0">

              <!-- Radar + status/trend -->
              <div class="charts-grid gap-4">
                <div class="bg-white rounded-2xl p-4 flex flex-col" style="border:1px solid #EDE8E0;">
                  <div class="flex items-center justify-between mb-1">
                    <h3 class="font-black text-[13px]" style="color:#2D2010;">中心整體能力分析</h3>
                    <span class="text-[11px]" style="color:#9B7040;">ⓘ</span>
                  </div>
                  <div class="flex items-center gap-4 mb-2">
                    <span class="flex items-center gap-1.5 text-[11px]" style="color:#9B7040;">
                      <span class="inline-block w-5 h-0.5 rounded" style="background:#E8974A;"></span>本中心平均
                    </span>
                    <span class="flex items-center gap-1.5 text-[11px]" style="color:#9B7040;">
                      <span class="inline-block w-5" style="border-top:1.5px dashed #9B9080; margin-top:1px;"></span>上月平均
                    </span>
                  </div>
                  <div class="flex-1 flex items-center justify-center">
                    <Radar :data="radarChartData" :options="radarChartOptions" style="max-height:220px; width:100%;" />
                  </div>
                  <button class="mt-3 w-full py-2 rounded-xl text-[12px] font-semibold transition-all hover:opacity-80 active:scale-[0.98]"
                    style="background:#FFF1E0; color:#C87820; border:1px solid rgba(232,151,74,0.25);"
                    @click="activeNav = 'analysis'">查看詳細分析 →</button>
                </div>

                <div class="space-y-4">
                  <div class="bg-white rounded-2xl p-4" style="border:1px solid #EDE8E0;">
                    <div class="flex items-center justify-between mb-3">
                      <h3 class="font-black text-[13px]" style="color:#2D2010;">長者狀態分布</h3>
                      <button class="text-[11px] transition-opacity hover:opacity-70" style="color:#E8974A;"
                        @click="activeNav = 'seniors'">查看全部 →</button>
                    </div>
                    <div class="flex items-center gap-4">
                      <div class="relative shrink-0" style="width:110px; height:110px;">
                        <Doughnut :data="statusDonutData" :options="donutChartOptions" />
                        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <div class="text-[11px]" style="color:#9B7040;">總計</div>
                          <div class="font-black text-[18px] leading-tight" style="color:#2D2010;">{{ DISPLAY_TOTAL_PATIENTS }}</div>
                          <div class="text-[11px]" style="color:#9B7040;">位</div>
                        </div>
                      </div>
                      <div class="grid grid-cols-2 gap-x-3 gap-y-2 flex-1">
                        <div v-for="s in statusDistribution" :key="s.label"
                          class="flex items-center gap-1.5 cursor-pointer transition-opacity hover:opacity-70"
                          @click="statusFilter = s.label; activeNav = 'seniors'">
                          <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: s.color }"></span>
                          <span style="color:#6B6B6B; font-size:10px;">{{ s.label }}</span>
                          <span class="font-bold ml-auto text-[11px]" style="color:#2D2010;">{{ s.count }}</span>
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

              <!-- Patient table -->
              <div class="bg-white rounded-2xl overflow-hidden" style="border:1px solid #EDE8E0;">
                <div class="px-4 py-3 flex items-center justify-between border-b flex-wrap gap-2" style="border-color:#EDE8E0;">
                  <h3 class="font-black text-[13px]" style="color:#2D2010;">長者列表</h3>
                  <div class="flex items-center gap-2 flex-wrap">
                    <div class="relative">
                      <input v-model="searchQuery" placeholder="搜尋長者"
                        class="text-[12px] pl-6 pr-3 py-1.5 rounded-lg outline-none transition-all"
                        style="background:#F5F0E8; color:#2D2010; width:110px; border:1px solid #EDE8E0;"
                        @focus="$event.target.style.borderColor='#E8974A'; $event.target.style.boxShadow='0 0 0 2px rgba(232,151,74,0.15)'"
                        @blur="$event.target.style.borderColor='#EDE8E0'; $event.target.style.boxShadow='none'" />
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
                  </div>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full" style="min-width:540px;">
                    <thead style="background:#FAFAF7; position:sticky; top:0; z-index:1;">
                      <tr class="text-[11px]" style="color:#9B7040;">
                        <th class="text-left px-4 py-2.5 font-semibold">姓名</th>
                        <th class="text-center px-2 py-2.5 font-semibold cursor-pointer select-none transition-colors hover:text-amber-600"
                          @click="toggleSort('age')">
                          年齡 <span class="opacity-50">{{ sortKey === 'age' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅' }}</span>
                        </th>
                        <th class="text-center px-2 py-2.5 font-semibold cursor-pointer select-none transition-colors hover:text-amber-600"
                          @click="toggleSort('weekScore')">
                          本週分數 <span class="opacity-50">{{ sortKey === 'weekScore' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅' }}</span>
                        </th>
                        <th class="text-center px-2 py-2.5 font-semibold cursor-pointer select-none transition-colors hover:text-amber-600"
                          @click="toggleSort('weekDelta')">
                          較上週 <span class="opacity-50">{{ sortKey === 'weekDelta' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅' }}</span>
                        </th>
                        <th class="text-center px-2 py-2.5 font-semibold">訓練天數</th>
                        <th class="text-center px-2 py-2.5 font-semibold">狀態</th>
                        <th class="text-center px-2 py-2.5 font-semibold">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="p in sortedPatientsList" :key="p.id"
                        class="transition-colors cursor-pointer" style="border-top:1px solid #EDE8E0;"
                        :style="hoveredRow === p.id ? 'background:#FFF8F0;' : ''"
                        @mouseenter="hoveredRow = p.id" @mouseleave="hoveredRow = null"
                        @click="openPatient(p)">
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
                          <button class="text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all hover:opacity-80 active:scale-95"
                            style="background:#FFF1E0; color:#C87820;" @click.stop="openPatient(p)">查看詳情</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Recent records -->
              <div class="bg-white rounded-2xl p-4" style="border:1px solid #EDE8E0;">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="font-black text-[13px]" style="color:#2D2010;">最近訓練記錄</h3>
                  <button class="text-[11px] transition-opacity hover:opacity-70" style="color:#E8974A;"
                    @click="activeNav = 'records'">查看全部 →</button>
                </div>
                <div class="recent-grid gap-3">
                  <div v-for="rec in recentTrainingRecords" :key="rec.id"
                    class="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                    style="background:#FAFAF7;"
                    @mouseenter="$event.currentTarget.style.background='#FFF8F0'; $event.currentTarget.style.boxShadow='0 2px 12px rgba(232,151,74,0.12)'"
                    @mouseleave="$event.currentTarget.style.background='#FAFAF7'; $event.currentTarget.style.boxShadow='none'">
                    <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" :style="{ background: rec.iconBg }">
                      <Icon :icon="rec.icon" width="18" height="18" :style="{ color: rec.iconColor }" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-[13px] font-semibold truncate" style="color:#2D2010;">{{ rec.name }}</div>
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

            <!-- Right column -->
            <div class="right-col space-y-4">
              <!-- Watch list -->
              <div class="bg-white rounded-2xl p-4" style="border:1px solid #EDE8E0;">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="font-black text-[13px]" style="color:#2D2010;">本週關注名單</h3>
                  <button class="text-[11px] transition-opacity hover:opacity-70" style="color:#E8974A;">查看全部 →</button>
                </div>
                <div class="space-y-2">
                  <div v-for="w in watchList" :key="w.name"
                    class="flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all"
                    style="background:#FAFAF7;"
                    @mouseenter="$event.currentTarget.style.background='#FFF8F0'"
                    @mouseleave="$event.currentTarget.style.background='#FAFAF7'"
                    @click="openPatient(w)">
                    <img :src="avatarSrc(w)" class="w-9 h-9 rounded-full object-cover shrink-0" />
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-1.5 mb-0.5">
                        <span class="font-bold text-[13px]" style="color:#2D2010;">{{ w.name }}</span>
                        <span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold" :style="w.tagStyle">{{ w.tag }}</span>
                      </div>
                      <p class="text-[11px] leading-snug" style="color:#9B7040;">{{ w.note }}</p>
                    </div>
                    <span style="color:#C8C0B0; line-height:1.4; font-size:18px;">›</span>
                  </div>
                </div>
              </div>

              <!-- Activity donut -->
              <div class="bg-white rounded-2xl p-4" style="border:1px solid #EDE8E0;">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="font-black text-[13px]" style="color:#2D2010;">
                    活動參與分析<span class="text-[11px] font-normal ml-1" style="color:#9B7040;">本月</span>
                  </h3>
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

              <!-- Podium -->
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
                    <img :src="avatarSrc(starPodium[0])" class="w-10 h-10 rounded-full object-cover" style="border:2px solid #E8974A;" />
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

              <!-- Streak ranking -->
              <div class="bg-white rounded-2xl p-4" style="border:1px solid #EDE8E0;">
                <h3 class="font-black text-[13px] mb-3" style="color:#2D2010;">連續訓練排行榜</h3>
                <div class="space-y-2.5">
                  <div v-for="(p, i) in streakRanking" :key="p.name"
                    class="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-70"
                    @click="openPatient(p)">
                    <div class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 text-white"
                      :style="{ background: i === 0 ? '#E8974A' : i === 1 ? '#9B7040' : '#C8B898' }">{{ i + 1 }}</div>
                    <img :src="avatarSrc(p)" class="w-7 h-7 rounded-full object-cover shrink-0" />
                    <span class="flex-1 text-[12px] font-semibold" style="color:#2D2010;">{{ p.name }}</span>
                    <span class="text-[11px] font-bold" style="color:#E8974A;">{{ p.days }} 天</span>
                  </div>
                </div>
                <button class="block w-full text-center text-[11px] mt-3 pt-2.5 font-semibold border-t transition-opacity hover:opacity-70"
                  style="border-color:#EDE8E0; color:#E8974A;">查看完整排行榜 →</button>
              </div>
            </div>
          </div>
        </div>
        </transition>

        <!-- ══════════════════ 長者管理 ══════════════════ -->
        <transition name="tab-fade" mode="out-in">
        <div v-if="activeNav === 'seniors'" key="seniors" class="space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 class="font-black text-[17px]" style="color:#2D2010;">長者管理</h2>
              <p class="text-[12px]" style="color:#9B7040;">共 {{ DISPLAY_TOTAL_PATIENTS }} 位長者</p>
            </div>
            <button class="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style="background:#E8974A; box-shadow:0 2px 8px rgba(232,151,74,0.35);"
              @click="showToast('新增長者功能開發中 🚀')">
              ＋ 新增長者
            </button>
          </div>

          <div class="flex items-center gap-3 bg-white rounded-2xl p-3 flex-wrap" style="border:1px solid #EDE8E0;">
            <div class="relative flex-1" style="min-width:160px; max-width:280px;">
              <input v-model="searchQuery" placeholder="搜尋姓名…"
                class="w-full text-[13px] pl-8 pr-3 py-2 rounded-xl outline-none transition-all"
                style="background:#F5F0E8; border:1px solid #EDE8E0; color:#2D2010;"
                @focus="$event.target.style.borderColor='#E8974A'"
                @blur="$event.target.style.borderColor='#EDE8E0'" />
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

          <div class="seniors-grid gap-4">
            <div v-for="p in filteredPatientsList" :key="p.id"
              class="bg-white rounded-2xl p-5 cursor-pointer senior-card"
              style="border:1px solid #EDE8E0; box-shadow:0 2px 8px rgba(0,0,0,0.04);"
              :style="hoveredRow === p.id ? 'box-shadow:0 4px 20px rgba(232,151,74,0.18); border-color:#E8974A; transform:translateY(-2px);' : ''"
              @mouseenter="hoveredRow = p.id" @mouseleave="hoveredRow = null"
              @click="openPatient(p)">
              <div class="flex items-center gap-3 mb-4">
                <img :src="avatarSrc(p)" class="w-12 h-12 rounded-full object-cover shrink-0" />
                <div class="flex-1 min-w-0">
                  <div class="font-black text-[15px]" style="color:#2D2010;">{{ p.name }}</div>
                  <div class="text-[12px]" style="color:#9B7040;">{{ p.age }} 歲</div>
                </div>
                <span class="px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0" :style="getStatusBadge(p)">{{ p.statusLabel }}</span>
              </div>
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
                <button class="text-[11px] px-3 py-1.5 rounded-lg font-semibold transition-all hover:opacity-80 active:scale-95"
                  style="background:#FFF1E0; color:#C87820;" @click.stop="openPatient(p)">詳情</button>
              </div>
            </div>
          </div>
        </div>
        </transition>

        <!-- ══════════════════ 訓練紀錄 ══════════════════ -->
        <transition name="tab-fade" mode="out-in">
        <div v-if="activeNav === 'records'" key="records" class="space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 class="font-black text-[17px]" style="color:#2D2010;">訓練紀錄</h2>
              <p class="text-[12px]" style="color:#9B7040;">所有長者的遊戲訓練歷史</p>
            </div>
            <button class="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all hover:opacity-80 active:scale-[0.98]"
              style="background:#FFF1E0; color:#C87820; border:1px solid rgba(232,151,74,0.3);"
              @click="showToast('CSV 匯出中...')">⬇ 匯出 CSV</button>
          </div>

          <div class="game-stats-grid gap-3">
            <div v-for="game in gameStats" :key="game.name"
              class="bg-white rounded-2xl p-4 text-center cursor-pointer transition-all"
              style="border:1px solid #EDE8E0;"
              @mouseenter="$event.currentTarget.style.borderColor='#E8974A'; $event.currentTarget.style.boxShadow='0 2px 12px rgba(232,151,74,0.12)'"
              @mouseleave="$event.currentTarget.style.borderColor='#EDE8E0'; $event.currentTarget.style.boxShadow='none'">
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

          <div class="bg-white rounded-2xl overflow-hidden" style="border:1px solid #EDE8E0;">
            <div class="px-4 py-3 flex items-center justify-between border-b flex-wrap gap-2" style="border-color:#EDE8E0;">
              <h3 class="font-black text-[13px]" style="color:#2D2010;">所有訓練記錄</h3>
              <div class="flex items-center gap-2 flex-wrap">
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
            <div class="overflow-x-auto">
              <table class="w-full" style="min-width:500px;">
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
          </div>
        </div>
        </transition>

        <!-- ══════════════════ 報表分析 ══════════════════ -->
        <transition name="tab-fade" mode="out-in">
        <div v-if="activeNav === 'analysis'" key="analysis" class="space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 class="font-black text-[17px]" style="color:#2D2010;">報表分析</h2>
              <p class="text-[12px]" style="color:#9B7040;">中心整體表現與趨勢</p>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <div v-for="r in ['本週','本月','近3月']" :key="r"
                class="px-3 py-1.5 rounded-xl text-[12px] font-semibold cursor-pointer transition-all active:scale-[0.97]"
                :style="analysisRange===r ? 'background:#E8974A; color:white;' : 'background:#F5F0E8; color:#9B7040;'"
                @click="analysisRange=r">{{ r }}</div>
              <button class="px-4 py-2 rounded-xl text-[13px] font-semibold transition-all hover:opacity-80"
                style="background:#FFF1E0; color:#C87820; border:1px solid rgba(232,151,74,0.3);"
                @click="showToast('報表匯出中...')">⬇ 匯出報表</button>
            </div>
          </div>

          <div class="analysis-summary-grid gap-3">
            <div v-for="s in analysisSummary" :key="s.label" class="bg-white rounded-2xl p-4" style="border:1px solid #EDE8E0;">
              <div class="text-[12px] mb-1" style="color:#9B7040;">{{ s.label }}</div>
              <div class="font-black text-[22px] leading-none mb-1" :style="{ color: s.color }">{{ s.value }}</div>
              <div class="text-[11px] font-semibold" :style="{ color: s.positive?'#1E9E6A':'#C04030' }">
                {{ s.positive?'↑':'↓' }} {{ s.change }}
              </div>
            </div>
          </div>

          <div class="analysis-charts-grid gap-4">
            <div class="bg-white rounded-2xl p-4" style="border:1px solid #EDE8E0;">
              <h3 class="font-black text-[13px] mb-3" style="color:#2D2010;">整體能力趨勢</h3>
              <div style="height:200px;"><Line :data="trendLineData" :options="lineChartOptions" /></div>
            </div>
            <div class="bg-white rounded-2xl p-4" style="border:1px solid #EDE8E0;">
              <h3 class="font-black text-[13px] mb-3" style="color:#2D2010;">遊戲活動參與分布</h3>
              <div class="flex items-center gap-4">
                <div class="relative shrink-0" style="width:140px; height:140px;">
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

          <div class="bg-white rounded-2xl p-4" style="border:1px solid #EDE8E0;">
            <h3 class="font-black text-[13px] mb-4" style="color:#2D2010;">長者表現比較</h3>
            <div class="space-y-3">
              <div v-for="p in patients" :key="p.id"
                class="flex items-center gap-4 cursor-pointer transition-opacity hover:opacity-80"
                @click="openPatient(p)">
                <img :src="avatarSrc(p)" class="w-7 h-7 rounded-full object-cover shrink-0" />
                <div class="w-14 text-[12px] font-semibold shrink-0 truncate" style="color:#2D2010;">{{ p.name }}</div>
                <div class="flex-1 flex gap-1">
                  <div v-for="(score, di) in p.dimensions" :key="di"
                    class="flex-1 rounded-sm"
                    :title="['記憶力','注意力','執行力','視覺空間','反應力'][di]+': '+score"
                    :style="{ height:'20px', background: score>=75?'#1E9E6A':score>=55?'#E8974A':'#C04030', opacity: 0.7+score/333 }"></div>
                </div>
                <div class="w-12 text-right font-black text-[13px] shrink-0" :style="{ color: p.weekScore>=80?'#1E9E6A':'#E8974A' }">{{ p.weekScore }}</div>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold w-20 text-center shrink-0" :style="getStatusBadge(p)">{{ p.statusLabel }}</span>
              </div>
            </div>
            <div class="flex gap-4 mt-3 pt-3 border-t text-[11px] flex-wrap" style="border-color:#EDE8E0; color:#9B7040;">
              <span>← 記憶力</span><span>注意力</span><span>執行力</span><span>視覺空間</span><span>反應力 →</span>
            </div>
          </div>
        </div>
        </transition>

        <!-- ══════════════════ 設定 ══════════════════ -->
        <transition name="tab-fade" mode="out-in">
        <div v-if="activeNav === 'settings'" key="settings" class="space-y-4">
          <div>
            <h2 class="font-black text-[17px]" style="color:#2D2010;">設定管理</h2>
            <p class="text-[12px]" style="color:#9B7040;">機構與帳號相關設定</p>
          </div>
          <div class="settings-grid gap-4">
            <div class="bg-white rounded-2xl p-5" style="border:1px solid #EDE8E0;">
              <h3 class="font-black text-[14px] mb-4 pb-3 border-b flex items-center gap-2" style="color:#2D2010; border-color:#EDE8E0;">
                <Icon icon="solar:buildings-3-bold" width="16" height="16" style="color:#E8974A;" /> 機構資訊</h3>
              <div class="space-y-3">
                <div v-for="f in [{ label:'機構名稱', val:'XX長照中心' },{ label:'聯絡電話', val:'(02) 1234-5678' },{ label:'地址', val:'台北市信義區XX路XX號' }]" :key="f.label">
                  <label class="block text-[11px] font-semibold mb-1" style="color:#9B7040;">{{ f.label }}</label>
                  <input :value="f.val" class="w-full text-[13px] px-3 py-2 rounded-xl outline-none transition-all"
                    style="background:#F5F0E8; border:1px solid #EDE8E0; color:#2D2010;"
                    @focus="$event.target.style.borderColor='#E8974A'"
                    @blur="$event.target.style.borderColor='#EDE8E0'" />
                </div>
                <button class="w-full py-2 rounded-xl text-[13px] font-semibold text-white mt-2 transition-all hover:opacity-90 active:scale-[0.98]"
                  style="background:#E8974A;" @click="showToast('機構資訊已儲存 ✓')">儲存變更</button>
              </div>
            </div>
            <div class="bg-white rounded-2xl p-5" style="border:1px solid #EDE8E0;">
              <h3 class="font-black text-[14px] mb-4 pb-3 border-b flex items-center gap-2" style="color:#2D2010; border-color:#EDE8E0;">
                <Icon icon="solar:user-bold" width="16" height="16" style="color:#E8974A;" /> 帳號設定</h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-[11px] font-semibold mb-1" style="color:#9B7040;">管理員姓名</label>
                  <input value="王小明" class="w-full text-[13px] px-3 py-2 rounded-xl outline-none transition-all"
                    style="background:#F5F0E8; border:1px solid #EDE8E0; color:#2D2010;"
                    @focus="$event.target.style.borderColor='#E8974A'" @blur="$event.target.style.borderColor='#EDE8E0'" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold mb-1" style="color:#9B7040;">電子信箱</label>
                  <input value="admin@xxltc.com.tw" class="w-full text-[13px] px-3 py-2 rounded-xl outline-none transition-all"
                    style="background:#F5F0E8; border:1px solid #EDE8E0; color:#2D2010;"
                    @focus="$event.target.style.borderColor='#E8974A'" @blur="$event.target.style.borderColor='#EDE8E0'" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold mb-1" style="color:#9B7040;">新密碼</label>
                  <input type="password" placeholder="留空則不修改" class="w-full text-[13px] px-3 py-2 rounded-xl outline-none transition-all"
                    style="background:#F5F0E8; border:1px solid #EDE8E0; color:#2D2010;"
                    @focus="$event.target.style.borderColor='#E8974A'" @blur="$event.target.style.borderColor='#EDE8E0'" />
                </div>
                <button class="w-full py-2 rounded-xl text-[13px] font-semibold text-white mt-2 transition-all hover:opacity-90 active:scale-[0.98]"
                  style="background:#E8974A;" @click="showToast('帳號資訊已儲存 ✓')">儲存變更</button>
              </div>
            </div>
            <div class="bg-white rounded-2xl p-5" style="border:1px solid #EDE8E0;">
              <h3 class="font-black text-[14px] mb-4 pb-3 border-b flex items-center gap-2" style="color:#2D2010; border-color:#EDE8E0;">
                <Icon icon="solar:bell-bold" width="16" height="16" style="color:#E8974A;" /> 通知設定</h3>
              <div class="space-y-4">
                <div v-for="n in notificationSettings" :key="n.key" class="flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <div class="text-[13px] font-semibold" style="color:#2D2010;">{{ n.label }}</div>
                    <div class="text-[11px]" style="color:#9B7040;">{{ n.desc }}</div>
                  </div>
                  <div class="relative w-11 h-6 rounded-full cursor-pointer transition-all shrink-0"
                    :style="n.on ? 'background:#E8974A;' : 'background:#DDD8D0;'"
                    @click="n.on = !n.on; showToast(n.on ? n.label + ' 已開啟' : n.label + ' 已關閉')">
                    <div class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                      :style="n.on ? 'left:22px;' : 'left:2px;'"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-2xl p-5" style="border:1px solid #EDE8E0;">
              <h3 class="font-black text-[14px] mb-4 pb-3 border-b flex items-center gap-2" style="color:#2D2010; border-color:#EDE8E0;">
                <Icon icon="solar:settings-bold" width="16" height="16" style="color:#E8974A;" /> 系統資訊</h3>
              <div class="space-y-3 text-[13px]">
                <div class="flex justify-between py-2 border-b" style="border-color:#EDE8E0;">
                  <span style="color:#9B7040;">系統版本</span><span class="font-semibold" style="color:#2D2010;">KIM-I v1.0.0</span>
                </div>
                <div class="flex justify-between py-2 border-b" style="border-color:#EDE8E0;">
                  <span style="color:#9B7040;">最後更新</span><span class="font-semibold" style="color:#2D2010;">2024/05/28</span>
                </div>
                <div class="flex justify-between py-2 border-b" style="border-color:#EDE8E0;">
                  <span style="color:#9B7040;">資料儲存</span><span class="font-semibold" style="color:#0891B2;">正常</span>
                </div>
                <div class="flex justify-between py-2">
                  <span style="color:#9B7040;">長者總數</span><span class="font-semibold" style="color:#2D2010;">{{ DISPLAY_TOTAL_PATIENTS }} 位</span>
                </div>
              </div>
              <button class="w-full mt-4 py-2 rounded-xl text-[13px] font-semibold transition-all hover:opacity-80"
                style="background:#FFF1E0; color:#C87820; border:1px solid rgba(232,151,74,0.3);"
                @click="showToast('資料備份中...')">⬇ 備份資料</button>
            </div>
          </div>
        </div>
        </transition>

      </div>
    </div>

    <!-- ══════════════════════ PATIENT MODAL ══════════════════════ -->
    <transition name="modal-fade">
      <div v-if="showPatientModal" class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background:rgba(0,0,0,0.45); backdrop-filter:blur(6px);"
        @click.self="showPatientModal = false">
        <div class="patient-modal bg-white rounded-3xl overflow-hidden w-full"
          style="max-width:460px; max-height:88vh; box-shadow:0 40px 100px rgba(0,0,0,0.25); display:flex; flex-direction:column;">

          <div class="px-6 pt-6 pb-4 flex items-center gap-4 shrink-0"
            style="background:linear-gradient(135deg,#FFF8F0,#FFF1E0); border-bottom:1px solid #EDE8E0;">
            <img :src="selectedPatient ? avatarSrc(selectedPatient) : ''"
              class="w-16 h-16 rounded-2xl object-cover shrink-0"
              style="border:3px solid white; box-shadow:0 4px 16px rgba(0,0,0,0.1);" />
            <div class="flex-1 min-w-0">
              <div class="font-black text-[20px]" style="color:#2D2010;">{{ selectedPatient?.name }}</div>
              <div class="text-[13px]" style="color:#9B7040;">{{ selectedPatient?.age }} 歲</div>
              <span class="mt-1 inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                :style="selectedPatient ? getStatusBadge(selectedPatient) : ''">{{ selectedPatient?.statusLabel }}</span>
            </div>
            <button class="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-black/10 shrink-0"
              @click="showPatientModal = false">
              <Icon icon="solar:close-bold" width="18" height="18" style="color:#9B7040;" />
            </button>
          </div>

          <div class="overflow-y-auto flex-1 px-6 py-5 space-y-5">
            <div class="grid grid-cols-3 gap-3">
              <div class="text-center p-3 rounded-2xl" style="background:#FAFAF7;">
                <div class="font-black text-[22px]" :style="{ color: (selectedPatient?.weekScore ?? 0) >= 80 ? '#1E9E6A' : '#E8974A' }">
                  {{ selectedPatient?.weekScore ?? '—' }}
                </div>
                <div class="text-[11px]" style="color:#9B7040;">本週平均分</div>
              </div>
              <div class="text-center p-3 rounded-2xl" style="background:#FAFAF7;">
                <div class="font-black text-[22px]" style="color:#2D2010;">{{ selectedPatient?.weeklyCount ?? '—' }}</div>
                <div class="text-[11px]" style="color:#9B7040;">本週場次</div>
              </div>
              <div class="text-center p-3 rounded-2xl" style="background:#FAFAF7;">
                <div class="font-black text-[22px]" :style="{ color: (selectedPatient?.weekDelta ?? 0) > 0 ? '#1E9E6A' : '#C04030' }">
                  {{ (selectedPatient?.weekDelta ?? 0) > 0 ? '+' : '' }}{{ selectedPatient?.weekDelta ?? 0 }}
                </div>
                <div class="text-[11px]" style="color:#9B7040;">週分數變化</div>
              </div>
            </div>

            <div>
              <h4 class="font-black text-[13px] mb-3" style="color:#2D2010;">認知能力概況</h4>
              <div class="space-y-2.5">
                <div v-for="(score, di) in (selectedPatient?.dimensions ?? [])" :key="di">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-[12px] font-semibold" style="color:#6B6B6B;">{{ ['記憶力','注意力','執行力','視覺空間','反應力'][di] }}</span>
                    <span class="text-[12px] font-black" :style="{ color: score>=75?'#1E9E6A':score>=55?'#E8974A':'#C04030' }">{{ score }}</span>
                  </div>
                  <div class="h-2 rounded-full" style="background:#F0EBE0;">
                    <div class="h-full rounded-full transition-all"
                      :style="{ width: score+'%', background: score>=75?'#1E9E6A':score>=55?'#E8974A':'#C04030' }"></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="p-4 rounded-2xl" style="background:#FFFCF8; border:1px solid #EDE8E0;">
              <div class="flex items-center gap-2 mb-2">
                <Icon icon="solar:notes-bold" width="14" height="14" style="color:#E8974A;" />
                <span class="text-[12px] font-bold" style="color:#2D2010;">照顧者備註</span>
              </div>
              <p class="text-[12px]" style="color:#9B7040; line-height:1.7;">
                {{ selectedPatient ? getPatientNote(selectedPatient) : '' }}
              </p>
            </div>
          </div>

          <div class="px-6 pb-6 pt-4 shrink-0 flex gap-3" style="border-top:1px solid #EDE8E0;">
            <button class="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:opacity-80 active:scale-[0.98]"
              style="background:#F5F0E8; color:#9B7040;" @click="showPatientModal = false">關閉</button>
            <button class="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style="background:#E8974A; box-shadow:0 2px 8px rgba(232,151,74,0.35);"
              @click="showToast('完整報表功能開發中 🚀'); showPatientModal = false">查看完整報表</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ══════════════════════ TOAST ══════════════════════ -->
    <transition name="toast-up">
      <div v-if="toastMessage"
        class="fixed bottom-6 left-1/2 z-50 px-5 py-3 rounded-2xl font-semibold text-[13px] text-white"
        style="transform:translateX(-50%); background:#2D2010; box-shadow:0 8px 30px rgba(0,0,0,0.25); white-space:nowrap;">
        {{ toastMessage }}
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import avatar1 from '../assets/avatars/avatar-1-grandma-traditional.jpg'
import avatar2 from '../assets/avatars/avatar-2-grandpa-shirt.jpg'
import avatar3 from '../assets/avatars/avatar-3-grandma-floral.jpg'
import avatar4 from '../assets/avatars/avatar-4-grandpa-polo.jpg'
import avatar5 from '../assets/avatars/avatar-5-grandma-bun.jpg'
import avatar6 from '../assets/avatars/avatar-6-grandpa-tang.jpg'
import { useGameStore } from '../stores/gameStore'
import { useCaregiverStore } from '../stores/caregiverStore'
import {
  Chart as ChartJS,
  RadialLinearScale, PointElement, LineElement, Filler,
  Tooltip, Legend, CategoryScale, LinearScale, ArcElement, Title,
} from 'chart.js'
import { Radar, Line, Doughnut } from 'vue-chartjs'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, ArcElement, Title)

const router  = useRouter()
const store   = useGameStore()
const cgStore = useCaregiverStore()

onMounted(() => { cgStore.load(); document.addEventListener('keydown', handleKeydown) })
onBeforeUnmount(() => document.removeEventListener('keydown', handleKeydown))

const handleKeydown = (e) => {
  if (e.key === 'Escape') { showPatientModal.value = false; showNotifications.value = false; mobileSidebarOpen.value = false }
}

// ─── UI State ────────────────────────────────────────────────────────────────
const activeNav         = ref('overview')
const hoveredRow        = ref(null)
const searchQuery       = ref('')
const statusFilter      = ref('all')
const analysisRange     = ref('本週')
const sidebarCollapsed  = ref(false)
const mobileSidebarOpen = ref(false)
const showNotifications = ref(false)
const showPatientModal  = ref(false)
const selectedPatient   = ref(null)
const toastMessage      = ref('')
const sortKey  = ref('')
const sortDir  = ref('desc')
let toastTimer = null

const navItems = [
  { key:'overview', icon:'solar:home-2-bold',                 label:'總覽首頁' },
  { key:'seniors',  icon:'solar:users-group-rounded-bold',    label:'長者管理' },
  { key:'records',  icon:'solar:clipboard-list-bold',         label:'訓練紀錄' },
  { key:'analysis', icon:'solar:chart-square-bold',           label:'報表分析' },
  { key:'settings', icon:'solar:settings-bold',               label:'設定管理' },
]

const showToast = (msg) => {
  toastMessage.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMessage.value = '' }, 2500)
}

const openPatient = (p) => { selectedPatient.value = p; showPatientModal.value = true }
const toggleSort  = (key) => {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortDir.value = 'desc' }
}

// ─── Notifications ────────────────────────────────────────────────────────────
const notifications = ref([
  { id:1, icon:'solar:danger-triangle-bold',    iconBg:'#FEF3E8', iconColor:'#C87820', message:'陳奶奶本週分數下降 8 分，建議安排額外訓練', time:'10 分鐘前', read:false },
  { id:2, icon:'solar:user-check-rounded-bold', iconBg:'#EDE9FE', iconColor:'#7C3AED', message:'李阿姨達成連續 7 天訓練里程碑 🎉',         time:'1 小時前',  read:false },
  { id:3, icon:'solar:bell-bing-bold',          iconBg:'#EEF4FB', iconColor:'#2C7BC8', message:'張奶奶已 3 天未登入，請確認狀況',             time:'昨天 16:30',read:false },
  { id:4, icon:'solar:chart-bold',              iconBg:'#F5EEF8', iconColor:'#7B4EA0', message:'本週中心整體平均分數上升 3 分',               time:'2 天前',    read:true  },
])
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)
const markAllRead = () => notifications.value.forEach(n => n.read = true)

const getPatientNote = (p) => {
  if (p.weekDelta < 0) return `本週認知分數下降 ${Math.abs(p.weekDelta)} 分，建議增加訓練頻率，可嘗試「記憶配對」或「廚房烹飪」等較為熟悉的遊戲。`
  if (p.lastActiveDays >= 3) return `已 ${p.lastActiveDays} 天未登入平台，請聯繫家屬或直接關懷長者，確認近況是否良好。`
  return `本週整體表現穩定，訓練參與度良好。繼續保持現有訓練計畫，可適度增加難度以提升挑戰性。`
}

// ─── Notification settings ────────────────────────────────────────────────────
const notificationSettings = ref([
  { key:'inactive',  label:'長者未登入提醒',   desc:'連續 3 天未參與時通知',    on:true  },
  { key:'decline',   label:'認知分數下降警示', desc:'分數降幅超過 10 分時通知', on:true  },
  { key:'weekly',    label:'每週報表寄送',     desc:'每週一自動寄送週報至信箱', on:false },
  { key:'milestone', label:'里程碑達成通知',   desc:'長者達成訓練目標時提醒',   on:true  },
])

// ─── Game stats ───────────────────────────────────────────────────────────────
const gameStats = [
  { name:'記憶音樂', icon:'solar:music-note-bold',   iconColor:'#2C7BC8', iconBg:'#EEF4FB', sessions:42, avgScore:83 },
  { name:'購物清單', icon:'solar:bag-2-bold',         iconColor:'#C87820', iconBg:'#FEF3E8', sessions:38, avgScore:76 },
  { name:'廚房烹飪', icon:'solar:cup-hot-bold',       iconColor:'#0891B2', iconBg:'#E0F2FE', sessions:31, avgScore:81 },
  { name:'布袋戲謎', icon:'solar:masks-theatre-bold', iconColor:'#7B4EA0', iconBg:'#F5EEF8', sessions:25, avgScore:69 },
  { name:'拼圖謎題', icon:'solar:widget-2-bold',      iconColor:'#C04030', iconBg:'#FEF0F0', sessions:29, avgScore:74 },
]

const allTrainingRecords = computed(() => {
  const pool = [
    { game:'記憶音樂', icon:'solar:music-note-bold',   iconColor:'#2C7BC8', dimension:'記憶力'   },
    { game:'購物清單', icon:'solar:bag-2-bold',         iconColor:'#C87820', dimension:'執行力'   },
    { game:'廚房烹飪', icon:'solar:cup-hot-bold',       iconColor:'#0891B2', dimension:'注意力'   },
    { game:'布袋戲謎', icon:'solar:masks-theatre-bold', iconColor:'#7B4EA0', dimension:'反應力'   },
    { game:'拼圖謎題', icon:'solar:widget-2-bold',      iconColor:'#C04030', dimension:'視覺空間' },
  ]
  const dt = ['今天 10:20','今天 09:45','今天 09:10','昨天 16:30','昨天 15:20','昨天 14:00','前天 17:10','前天 15:50']
  return patients.value.flatMap((p, pi) =>
    [0,1].map(j => {
      const g = pool[(pi+j) % pool.length]
      return { id: pi*2+j, datetime: dt[(pi*2+j)%dt.length], patient: p, ...g,
        score: Math.min(100, p.weekScore+(j%3-1)*5), duration: 10+(pi+j)%8 }
    })
  )
})

const analysisSummary = computed(() => {
  const total    = patients.value.length
  const avgScore = Math.round(patients.value.reduce((s,p) => s+p.weekScore,0) / total)
  const sessions = gameStats.reduce((s,g) => s+g.sessions, 0)
  const improved = patients.value.filter(p => (p.weekDelta||0) > 0).length
  return [
    { label:'平均認知分數', value:avgScore, color:'#E8974A', change:'較上月 +3 分',   positive:true  },
    { label:'本週訓練場次', value:sessions, color:'#0891B2', change:'較上週 +12 場', positive:true  },
    { label:'進步長者人數', value:improved, color:'#1E9E6A', change:'較上週 +2 位',  positive:true  },
    { label:'平均出席率',   value:'78%',    color:'#7C3AED', change:'較上月 -2%',    positive:false },
  ]
})

const todayLabel = computed(() => {
  const d = new Date(), days = ['日','一','二','三','四','五','六']
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} (${days[d.getDay()]})`
})

// ─── Patients ────────────────────────────────────────────────────────────────
const liveWeeklyCount    = computed(() => store.sessions.filter(s => s.timestamp >= Date.now()-7*86400000).length)
const liveLastActiveDays = computed(() => !store.sessions.length ? 99 : Math.floor((Date.now()-store.sessions.slice(-1)[0].timestamp)/86400000))
const liveDimensions     = computed(() => store.radarCurrent.map(Math.round))

const STATIC_PATIENTS = [
  { id:'s2', name:'王伯伯', age:82, avatarId:2, weeklyCount:5, lastActiveDays:0, dimensions:[82,75,80,78,70], weekDelta:6,  weekScore:77, statusLabel:'持續進步',    totalSessions:18 },
  { id:'s3', name:'李阿姨', age:78, avatarId:3, weeklyCount:7, lastActiveDays:0, dimensions:[88,82,84,80,76], weekDelta:12, weekScore:82, statusLabel:'持續進步',    totalSessions:25 },
  { id:'s4', name:'陳奶奶', age:85, avatarId:4, weeklyCount:2, lastActiveDays:1, dimensions:[65,60,68,62,58], weekDelta:-8, weekScore:63, statusLabel:'建議加強',    totalSessions:9  },
  { id:'s5', name:'林爺爺', age:80, avatarId:5, weeklyCount:4, lastActiveDays:0, dimensions:[72,68,76,70,65], weekDelta:2,  weekScore:70, statusLabel:'穩定表現',    totalSessions:14 },
  { id:'s6', name:'張奶奶', age:76, avatarId:6, weeklyCount:3, lastActiveDays:1, dimensions:[70,65,72,68,62], weekDelta:0,  weekScore:67, statusLabel:'近期較少參與', totalSessions:11 },
]

const DISPLAY_TOTAL_PATIENTS = 80

const AVATAR_IMAGES = { 1:avatar1, 2:avatar2, 3:avatar3, 4:avatar4, 5:avatar5, 6:avatar6 }
const avatarSrc = (p) => AVATAR_IMAGES[p?.avatarId] || avatar1

const patients = computed(() => {
  if (cgStore.patients.length) return cgStore.patients
  const live = { id:'s1', name:'陳金美', age:75, avatarId:1,
    weeklyCount: liveWeeklyCount.value, lastActiveDays: liveLastActiveDays.value,
    dimensions: liveDimensions.value.length ? liveDimensions.value : [68,62,70,66,60],
    weekDelta:4, totalSessions: store.sessions.length }
  return [live, ...STATIC_PATIENTS].map(p => {
    const avg = Math.round(p.dimensions.reduce((s,d) => s+d,0)/p.dimensions.length)
    let statusLabel
    if (p.lastActiveDays >= 5)     statusLabel = '近期較少參與'
    else if (avg < 62)             statusLabel = '建議加強'
    else if ((p.weekDelta||0) > 3) statusLabel = '持續進步'
    else                           statusLabel = '穩定表現'
    return { ...p, weekScore: p.weekScore ?? avg, statusLabel: p.statusLabel ?? statusLabel }
  })
})

const filteredPatientsList = computed(() =>
  patients.value.filter(p => {
    const matchSearch = !searchQuery.value || p.name.includes(searchQuery.value)
    const matchStatus = statusFilter.value === 'all' || p.statusLabel === statusFilter.value
    return matchSearch && matchStatus
  })
)

const sortedPatientsList = computed(() => {
  if (!sortKey.value) return filteredPatientsList.value
  return [...filteredPatientsList.value].sort((a,b) => {
    const va = a[sortKey.value] ?? 0, vb = b[sortKey.value] ?? 0
    return sortDir.value === 'asc' ? va-vb : vb-va
  })
})

const kpiCards = computed(() => {
  if (cgStore.kpiCards.length) return cgStore.kpiCards.map(c => ({ ...c, positive:true, color:c.iconColor }))
  const total      = patients.value.length
  const activeRate = Math.round(patients.value.filter(p => p.lastActiveDays===0).length/total*100)
  const avgScore   = Math.round(patients.value.reduce((s,p) => s+p.weekScore,0)/total)
  const trained    = patients.value.filter(p => p.weeklyCount>0).length
  const improved   = patients.value.filter(p => (p.weekDelta||0)>0).length
  return [
    { label:'長者總數',     icon:'solar:users-group-rounded-bold',    iconColor:'#C87820', iconBg:'#FEF0D8', value:total,      unit:'位', color:'#2D2010', positive:true, changeText:'' },
    { label:'本週活躍率',   icon:'solar:heart-pulse-bold',            iconColor:'#0891B2', iconBg:'#E0F2FE', value:activeRate, unit:'%',  color:'#0891B2', positive:true, changeText:'' },
    { label:'平均認知分數', icon:'solar:star-bold',                   iconColor:'#7B4EA0', iconBg:'#F0EBF8', value:avgScore,   unit:'分', color:'#7B4EA0', positive:true, changeText:'' },
    { label:'完成訓練人數', icon:'solar:checklist-minimalistic-bold', iconColor:'#2C7BC8', iconBg:'#EEF4FB', value:trained,    unit:'位', color:'#2D2010', positive:true, changeText:'本週完成' },
    { label:'本週進步人數', icon:'solar:graph-up-bold',               iconColor:'#E8974A', iconBg:'#FEF0D8', value:improved,   unit:'位', color:'#E8974A', positive:true, changeText:'' },
  ]
})

const STATUS_COLORS = { '穩定表現':'#0891B2','持續進步':'#7C3AED','建議加強':'#D97706','近期較少參與':'#DC2626' }
const statusDistribution = computed(() => {
  const rawCounts = { '穩定表現':0,'持續進步':0,'建議加強':0,'近期較少參與':0 }
  patients.value.forEach(p => { rawCounts[p.statusLabel] = (rawCounts[p.statusLabel]||0)+1 })
  const rawTotal = patients.value.length
  const scaledCounts = Object.fromEntries(Object.entries(rawCounts).map(([k,v]) => [k, Math.round(v/rawTotal*DISPLAY_TOTAL_PATIENTS)]))
  const scaledTotal = Object.values(scaledCounts).reduce((a,b)=>a+b,0)
  const diff = DISPLAY_TOTAL_PATIENTS - scaledTotal
  if (diff !== 0) scaledCounts['穩定表現'] = (scaledCounts['穩定表現']||0) + diff
  return Object.entries(scaledCounts).map(([label,count]) => ({ label, count, color:STATUS_COLORS[label], pct:Math.round(count/DISPLAY_TOTAL_PATIENTS*100) }))
})
const statusDonutData = computed(() => ({
  labels: statusDistribution.value.map(s => s.label),
  datasets:[{ data:statusDistribution.value.map(s=>s.count), backgroundColor:statusDistribution.value.map(s=>s.color), borderWidth:2, borderColor:'#fff', hoverOffset:4 }],
}))

const activityDistribution = [
  { label:'記憶力訓練', color:'#E8974A', pct:35 },
  { label:'注意力訓練', color:'#0891B2', pct:28 },
  { label:'反應力訓練', color:'#1E9E6A', pct:15 },
  { label:'執行力訓練', color:'#7C3AED', pct:12 },
  { label:'視覺空間',   color:'#9B9080', pct:10 },
]
const activityDonutData = {
  labels: activityDistribution.map(a => a.label),
  datasets:[{ data:activityDistribution.map(a=>a.pct), backgroundColor:activityDistribution.map(a=>a.color), borderWidth:2, borderColor:'#fff', hoverOffset:4 }],
}

const radarChartData = computed(() => {
  const avg=[0,0,0,0,0]; patients.value.forEach(p => p.dimensions.forEach((d,i) => avg[i]+=d))
  const n=patients.value.length, cur=avg.map(v=>Math.round(v/n)), prev=cur.map(v=>Math.round(v*0.93))
  return {
    labels:['記憶力','注意力','執行力','視覺空間','反應力'],
    datasets:[
      { label:'本中心平均', data:cur,  borderColor:'#E8974A', backgroundColor:'rgba(232,151,74,0.18)', pointBackgroundColor:'#E8974A', pointRadius:4, borderWidth:2 },
      { label:'上月平均',   data:prev, borderColor:'#9B9080', backgroundColor:'transparent', borderDash:[4,4], pointRadius:3, pointBackgroundColor:'#9B9080', borderWidth:1.5 },
    ],
  }
})
const radarChartOptions = {
  responsive:true, maintainAspectRatio:true, plugins:{ legend:{ display:false } },
  scales:{ r:{ min:0, max:100, ticks:{ stepSize:25,font:{size:9},color:'#9B7040',backdropColor:'transparent' },
    grid:{ color:'rgba(0,0,0,0.07)' }, angleLines:{ color:'rgba(0,0,0,0.07)' },
    pointLabels:{ font:{size:11,weight:'600'},color:'#6B5030' } } },
}

const trendLineData = computed(() => {
  const labels=[]; for(let i=29;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); labels.push(`${d.getMonth()+1}/${d.getDate()}`) }
  const seed=(base,offset,trend)=>Array.from({length:30},(_,i)=>Math.min(100,Math.round(base+trend*i+((i*7+offset*13)%5-2)*0.3)))
  const series=[
    {label:'記憶力',  data:seed(66,0,0.38),color:'#E8974A'},
    {label:'注意力',  data:seed(61,1,0.33),color:'#0891B2'},
    {label:'執行力',  data:seed(71,2,0.28),color:'#7C3AED'},
    {label:'視覺空間',data:seed(59,3,0.35),color:'#1E9E6A'},
    {label:'反應力',  data:seed(56,4,0.30),color:'#DC2626'},
  ]
  return { labels, datasets:series.map(d=>({ label:d.label,data:d.data,borderColor:d.color,backgroundColor:'transparent',tension:0.4,pointRadius:0,borderWidth:1.8 })) }
})
const lineChartOptions = {
  responsive:true, maintainAspectRatio:false,
  plugins:{ legend:{ display:true,position:'bottom',labels:{ boxWidth:10,font:{size:9},padding:6,usePointStyle:true } }, tooltip:{ mode:'index',intersect:false } },
  scales:{ x:{ ticks:{maxTicksLimit:6,font:{size:9},color:'#9B7040',maxRotation:0},grid:{display:false} },
    y:{ min:40,max:100, ticks:{stepSize:20,font:{size:9},color:'#9B7040'},grid:{color:'rgba(0,0,0,0.05)'} } },
}
const donutChartOptions = {
  responsive:true, maintainAspectRatio:true, cutout:'68%',
  plugins:{ legend:{display:false}, tooltip:{ callbacks:{ label:ctx=>` ${ctx.label}: ${ctx.parsed}` } } },
}

const watchList = computed(() => {
  const TAG_MAP = {
    '穩定表現':   { style:'background:#E0F2FE; color:#0891B2;', tag:'穩定表現' },
    '持續進步':   { style:'background:#EDE9FE; color:#7C3AED;', tag:'進步明顯' },
    '建議加強':   { style:'background:#FEF3C7; color:#D97706;', tag:'建議加強' },
    '近期較少參與':{ style:'background:#FEF2F2; color:#DC2626;', tag:'較少參與' },
  }
  return patients.value.filter(p => p.lastActiveDays>=1||p.weekDelta<0||p.weekScore<70).slice(0,3).map(p => ({
    ...p,
    tagStyle: TAG_MAP[p.statusLabel]?.style||TAG_MAP['穩定表現'].style,
    tag: TAG_MAP[p.statusLabel]?.tag||p.statusLabel,
    note: p.weekDelta<0 ? `本週分數下降 ${Math.abs(p.weekDelta)} 分，建議安排更多訓練活動`
        : p.lastActiveDays>=3 ? `${p.lastActiveDays} 天未登入，請確認長者狀況`
        : `本週參與穩定，表現良好，請繼續保持！`,
  }))
})

const recentTrainingRecords = computed(() => {
  const games=[
    {game:'記憶配對',icon:'solar:widget-2-bold',  iconColor:'#2C7BC8',iconBg:'#EEF4FB'},
    {game:'找不同',  icon:'solar:magnifer-bold',   iconColor:'#C87820',iconBg:'#FEF3E8'},
    {game:'快速反應',icon:'solar:bolt-bold',        iconColor:'#0891B2',iconBg:'#E0F2FE'},
    {game:'拼圖遊戲',icon:'solar:target-bold',      iconColor:'#7B4EA0',iconBg:'#F5EEF8'},
    {game:'記憶翻牌',icon:'solar:card-2-bold',      iconColor:'#C87820',iconBg:'#FEF3E8'},
  ]
  const times=['今天 09:30','今天 09:10','昨天 15:20','昨天 14:30','前天 16:00']
  return patients.value.slice(0,5).map((p,i) => ({ id:i, name:p.name, ...games[i%games.length], score:Math.min(100,p.weekScore+(i%3-1)*4), time:times[i] }))
})

const starPodium    = computed(() => [...patients.value].sort((a,b)=>b.weeklyCount-a.weeklyCount).slice(0,3))
const streakRanking = computed(() => [...patients.value].sort((a,b)=>b.weeklyCount-a.weeklyCount).slice(0,3).map(p=>({...p,days:p.weeklyCount*4+Math.round(p.weekScore/10)})))

const getStatusBadge = (p) => ({
  '穩定表現':    'background:#E0F2FE; color:#0891B2;',
  '持續進步':    'background:#EDE9FE; color:#7C3AED;',
  '建議加強':    'background:#FEF3C7; color:#D97706;',
  '近期較少參與': 'background:#FEF2F2; color:#DC2626;',
}[p.statusLabel] || 'background:#E0F2FE; color:#0891B2;')
</script>

<style scoped>
.caregiver-root {
  display: flex;
  height: 100%;
  overflow: hidden;
  background: #F5F0E8;
  font-family: 'Outfit', 'Noto Sans TC', sans-serif;
  position: relative;
}

/* ── Sidebar ── */
.sidebar-panel {
  width: 200px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: white;
  transition: width 0.28s cubic-bezier(0.4,0,0.2,1), transform 0.32s cubic-bezier(0.4,0,0.2,1);
  z-index: 50;
}
.sidebar-panel.collapsed {
  width: 64px;
}
.sidebar-panel.collapsed .nav-label,
.sidebar-panel.collapsed .logo-text {
  display: none;
}
.sidebar-panel.collapsed nav button {
  justify-content: center;
  padding-left: 0;
  padding-right: 0;
}

@media (max-width: 1023px) {
  .sidebar-panel {
    position: fixed;
    left: 0; top: 0; bottom: 0;
    transform: translateX(-100%);
  }
  .sidebar-panel.mobile-open {
    transform: translateX(0);
    box-shadow: 4px 0 30px rgba(0,0,0,0.15);
  }
  .collapse-btn { display: none; }
  .mobile-menu-btn { display: flex !important; }
}
@media (min-width: 1024px) {
  .mobile-menu-btn { display: none !important; }
}

/* ── Main panel ── */
.main-panel { flex: 1; min-width: 0; overflow: hidden; }

/* ── Header ── */
.header-subtitle { display: none; }
@media (min-width: 640px) { .header-subtitle { display: block; } }
.header-date { display: none; }
@media (min-width: 820px) { .header-date { display: flex; } }

/* ── KPI grid ── */
.kpi-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; }
@media (min-width: 640px)  { .kpi-grid { grid-template-columns: repeat(3,1fr); } }
@media (min-width: 1100px) { .kpi-grid { grid-template-columns: repeat(5,1fr); } }

/* ── Overview layout ── */
.overview-grid { display: grid; grid-template-columns: 1fr; }
@media (min-width: 1200px) { .overview-grid { grid-template-columns: 1fr 290px; } }

.right-col { display: block; }
@media (max-width: 1199px) { .right-col { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; } }
@media (max-width: 640px)  { .right-col { grid-template-columns: 1fr; } }

/* ── Charts (radar + status) ── */
.charts-grid { display: grid; grid-template-columns: 1fr; }
@media (min-width: 768px) { .charts-grid { grid-template-columns: 250px 1fr; } }

/* ── Recent records ── */
.recent-grid { display: grid; grid-template-columns: 1fr; }
@media (min-width: 600px)  { .recent-grid { grid-template-columns: repeat(2,1fr); } }
@media (min-width: 1024px) { .recent-grid { grid-template-columns: repeat(3,1fr); } }

/* ── Seniors cards ── */
.seniors-grid { display: grid; grid-template-columns: 1fr; }
@media (min-width: 560px)  { .seniors-grid { grid-template-columns: repeat(2,1fr); } }
@media (min-width: 1100px) { .seniors-grid { grid-template-columns: repeat(3,1fr); } }
.senior-card { transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease; }

/* ── Game stats ── */
.game-stats-grid { display: grid; grid-template-columns: repeat(3,1fr); }
@media (min-width: 640px) { .game-stats-grid { grid-template-columns: repeat(5,1fr); } }

/* ── Analysis ── */
.analysis-summary-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; }
@media (min-width: 768px) { .analysis-summary-grid { grid-template-columns: repeat(4,1fr); } }
.analysis-charts-grid { display: grid; grid-template-columns: 1fr; }
@media (min-width: 768px) { .analysis-charts-grid { grid-template-columns: repeat(2,1fr); } }

/* ── Settings ── */
.settings-grid { display: grid; grid-template-columns: 1fr; }
@media (min-width: 768px) { .settings-grid { grid-template-columns: repeat(2,1fr); } }

/* ── KPI animation ── */
@keyframes kpi-in {
  from { opacity:0; transform:translateY(12px); }
  to   { opacity:1; transform:translateY(0); }
}
.kpi-card { animation: kpi-in 0.4s ease both; }

/* ── Notification pulse ── */
@keyframes pulse-dot {
  0%,100% { transform: scale(1); }
  50%      { transform: scale(1.25); }
}
.notif-badge { animation: pulse-dot 2s ease-in-out infinite; }
.notif-dot   { animation: pulse-dot 1.5s ease-in-out infinite; }

/* ── Tab transitions ── */
.tab-fade-enter-active { transition: opacity 0.2s ease, transform 0.25s ease; }
.tab-fade-leave-active { transition: opacity 0.15s ease; }
.tab-fade-enter-from   { opacity:0; transform:translateY(8px); }
.tab-fade-leave-to     { opacity:0; }

/* ── Notification dropdown ── */
.panel-drop-enter-active { transition: opacity 0.18s ease, transform 0.22s cubic-bezier(0.34,1.56,0.64,1); }
.panel-drop-leave-active { transition: opacity 0.12s ease, transform 0.15s ease; }
.panel-drop-enter-from   { opacity:0; transform:translateY(-8px) scale(0.96); }
.panel-drop-leave-to     { opacity:0; transform:translateY(-4px) scale(0.97); }

/* ── Patient modal ── */
.modal-fade-enter-active { transition: opacity 0.22s ease; }
.modal-fade-leave-active { transition: opacity 0.18s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity:0; }
.modal-fade-enter-active .patient-modal { animation: modal-in 0.28s cubic-bezier(0.34,1.4,0.64,1); }
@keyframes modal-in {
  from { opacity:0; transform:scale(0.92) translateY(16px); }
  to   { opacity:1; transform:scale(1) translateY(0); }
}

/* ── Overlay ── */
.overlay-fade-enter-active, .overlay-fade-leave-active { transition: opacity 0.25s ease; }
.overlay-fade-enter-from, .overlay-fade-leave-to { opacity:0; }

/* ── Toast ── */
.toast-up-enter-active { transition: opacity 0.22s ease, transform 0.28s cubic-bezier(0.34,1.56,0.64,1); }
.toast-up-leave-active { transition: opacity 0.18s ease, transform 0.2s ease; }
.toast-up-enter-from   { opacity:0; transform:translateX(-50%) translateY(20px); }
.toast-up-leave-to     { opacity:0; transform:translateX(-50%) translateY(10px); }
</style>
