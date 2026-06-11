<template>
  <div class="h-full w-full overflow-y-auto font-['Outfit','Noto_Sans_TC'] explore-bg">
    <div class="max-w-[1720px] mx-auto px-3 sm:px-5 pt-4 pb-24 flex flex-col gap-4 min-h-full">

      <!-- ═══ 頂部列 ═══ -->
      <div class="flex flex-wrap items-stretch gap-3">
        <!-- Logo -->
        <div class="flex items-center gap-3 pr-2">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center"
               style="background:linear-gradient(145deg,#F6E7C8,#EAD49E); border:2px solid #D8BC82;">
            <Icon icon="mdi:home-city" width="26" style="color:#8B5A2B;" />
          </div>
          <div>
            <div class="font-black text-xl leading-tight" style="font-family:'Noto Serif TC',serif; color:#4A3520;">金憶街區</div>
            <div class="text-xs font-bold" style="color:#A08555;">文山區探索地圖</div>
          </div>
        </div>

        <!-- 今日步數 -->
        <div class="top-card flex-1 min-w-[240px]">
          <Icon icon="mdi:shoe-sneaker" width="28" style="color:#C8842C;" />
          <div class="flex-1">
            <div class="flex items-baseline justify-between">
              <span class="text-xs font-bold" style="color:#A08555;">今日步數</span>
              <span class="text-xs font-black" style="color:#C8842C;">{{ goalProgress }}%</span>
            </div>
            <div class="font-black text-lg leading-tight tabular-nums" style="color:#4A3520;">
              {{ todaySteps.toLocaleString() }} <span class="text-sm font-bold" style="color:#A08555;">/ {{ DAILY_GOAL.toLocaleString() }} 步</span>
            </div>
            <div class="h-2 rounded-full mt-1 overflow-hidden" style="background:#EDE3CC;">
              <div class="h-full rounded-full transition-all duration-700"
                   :style="{ width: goalProgress + '%', background: 'linear-gradient(90deg,#E0A33A,#C8842C)' }"></div>
            </div>
          </div>
        </div>

        <!-- 解鎖下一區域 -->
        <div class="top-card flex-1 min-w-[240px]">
          <Icon icon="mdi:gift" width="28" style="color:#C0392B;" />
          <div class="flex-1">
            <div class="text-sm font-black" style="color:#4A3520;">
              連續達成 <span style="color:#C0392B;">{{ streak }} 天</span>
            </div>
            <div class="text-sm font-bold mt-0.5" style="color:#7A6238;">
              <template v-if="nextTarget">
                再 <span class="font-black" style="color:#C8842C;">{{ Math.max(0, nextTarget.requiredSteps - todaySteps).toLocaleString() }}</span> 步解鎖下一區域
              </template>
              <template v-else>全部區域已解鎖！</template>
            </div>
          </div>
        </div>

        <!-- 探索指南 -->
        <button class="top-card font-black text-sm gap-2 cursor-pointer active:scale-95 transition-transform"
                style="color:#4A3520;" @click="guideOpen = true">
          <Icon icon="mdi:information" width="24" style="color:#4A3520;" />
          探索指南
        </button>
      </div>

      <!-- ═══ 主區域：地圖 + 側欄 ═══ -->
      <div class="flex-1 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_400px] gap-4 items-stretch">

        <!-- ── 地圖 ── -->
        <div class="relative rounded-3xl overflow-hidden map-shell">
          <div ref="mapEl" class="absolute inset-0 z-0"></div>

          <!-- 探索半徑 -->
          <div class="absolute top-4 left-1/2 -translate-x-1/2 z-[40] map-pill flex items-center gap-3">
            <span class="text-sm font-black whitespace-nowrap" style="color:#4A3520;">探索半徑：{{ radiusKm.toFixed(1) }} 公里</span>
            <input type="range" min="0.5" max="2.5" step="0.1" v-model.number="radiusKm" class="radius-slider" />
          </div>

          <!-- 顯示已探索 -->
          <button class="absolute top-4 right-4 z-[40] px-4 py-2 rounded-full text-sm font-black flex items-center gap-1.5 active:scale-95 transition-transform"
                  :style="showExplored
                    ? 'background:#3E6B2A; color:#F6EDD8; box-shadow:0 4px 12px rgba(62,107,42,0.35);'
                    : 'background:rgba(255,255,255,0.95); color:#7A6238; border:1.5px solid #D8C9A8;'"
                  @click="showExplored = !showExplored">
            <Icon :icon="showExplored ? 'mdi:eye' : 'mdi:eye-off'" width="18" />
            顯示已探索
          </button>

          <!-- 地圖控制鍵 -->
          <div class="absolute left-4 top-1/2 -translate-y-1/2 z-[40] flex flex-col gap-2.5">
            <button class="map-ctrl" @click="recenter" title="回到目前位置"><Icon icon="mdi:crosshairs-gps" width="20" /></button>
            <button class="map-ctrl" @click="map?.zoomIn()"><Icon icon="mdi:plus" width="22" /></button>
            <button class="map-ctrl" @click="map?.zoomOut()"><Icon icon="mdi:minus" width="22" /></button>
          </div>

          <!-- 探索任務卡 -->
          <div class="absolute left-4 bottom-4 z-[40] map-pill flex items-center gap-3 cursor-pointer active:scale-95 transition-transform"
               @click="openQuiz">
            <Icon icon="mdi:flag-variant" width="24" style="color:#C0392B;" />
            <div>
              <div class="text-sm font-black" style="color:#4A3520;">探索任務</div>
              <div class="text-xs font-bold" style="color:#A08555;">造訪 3 個景點</div>
              <div class="w-32 h-1.5 rounded-full mt-1 overflow-hidden" style="background:#EDE3CC;">
                <div class="h-full rounded-full transition-all duration-500"
                     :style="{ width: Math.min(100, completedIds.length / 3 * 100) + '%', background:'#C8842C' }"></div>
              </div>
            </div>
            <span class="text-sm font-black tabular-nums" style="color:#7A6238;">{{ Math.min(3, completedIds.length) }} / 3</span>
            <Icon icon="mdi:gift" width="24" style="color:#C8842C;" />
          </div>
        </div>

        <!-- ── 附近景點側欄 ── -->
        <div class="rounded-3xl p-4 flex flex-col gap-3 sidebar-shell xl:max-h-[calc(100vh-170px)] xl:overflow-y-auto">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Icon icon="mdi:map-marker" width="22" style="color:#C0392B;" />
              <span class="font-black text-lg" style="font-family:'Noto Serif TC',serif; color:#4A3520;">附近景點</span>
            </div>
            <div class="px-3 py-1.5 rounded-xl text-xs font-black" style="background:#F6EDD8; border:1.5px solid #D8C9A8; color:#7A6238;">
              距離近到遠 ▾
            </div>
          </div>

          <div v-for="loc in LOCATIONS" :key="loc.id"
               class="spot-card" :class="{ 'spot-card--locked': !isUnlocked(loc) }"
               @click="onLocationClick(loc)">
            <!-- 實景縮圖 -->
            <div class="spot-thumb">
              <img :src="loc.photo" :alt="loc.name"
                   :style="!isUnlocked(loc) && !isArrived(loc) ? 'filter:grayscale(0.85); opacity:0.8;' : ''" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-black text-base" style="color:#4A3520;">{{ loc.name }}</span>
                <span v-if="statusOf(loc) === 'completed'" class="tag tag--done">已完成</span>
                <span v-else-if="statusOf(loc) === 'unlocked'" class="tag tag--open">已解鎖</span>
                <span v-else-if="isArrived(loc)" class="tag tag--checkin">可打卡！</span>
                <span v-else class="tag tag--locked">尚未探索</span>
              </div>
              <div class="text-xs font-bold mt-1" style="color:#A08555;">
                距離 {{ loc.distance }}・步行約 {{ loc.walkMin }} 分鐘
              </div>
              <div class="text-sm font-semibold mt-0.5 truncate" style="color:#7A6238;">{{ loc.desc }}</div>
              <div v-if="isArrived(loc)" class="mt-2">
                <button class="px-4 py-2 rounded-xl text-sm font-black active:scale-95 transition-transform flex items-center gap-1.5"
                        style="background:linear-gradient(135deg,#D14836,#A82E1F); color:#FFF7E0; box-shadow:0 4px 12px rgba(160,50,30,0.35);"
                        @click.stop="openCheckin(loc)">
                  <Icon icon="mdi:map-marker-check" width="16" /> 立即打卡
                </button>
              </div>
              <div v-else class="text-xs font-bold mt-1.5 flex items-center gap-1" :style="isUnlocked(loc) ? `color:${loc.color};` : 'color:#B8A988;'">
                <template v-if="isUnlocked(loc)">
                  <Icon icon="mdi:gamepad-variant" width="15" />{{ loc.gameName }}
                </template>
                <template v-else>再走 {{ Math.max(0, loc.requiredSteps - todaySteps).toLocaleString() }} 步可打卡</template>
              </div>
            </div>
            <Icon :icon="isUnlocked(loc) ? 'mdi:chevron-right' : isArrived(loc) ? 'mdi:map-marker-check' : 'mdi:lock'"
                  :width="isUnlocked(loc) ? 26 : 20"
                  class="shrink-0" :style="isArrived(loc) ? 'color:#C0392B;' : 'color:#C8B68A;'" />
          </div>

          <button class="w-full py-3 rounded-2xl text-sm font-black active:scale-[0.98] transition-transform"
                  style="background:#F6EDD8; border:1.5px solid #D8C9A8; color:#7A6238;"
                  @click="badgesOpen = true">
            查看全部景點 ›
          </button>
        </div>
      </div>

    </div>

    <!-- ═══ 固定底部導覽列 ═══ -->
    <div class="fixed bottom-3 left-1/2 -translate-x-1/2 z-[60] flex items-center justify-center gap-2 sm:gap-6 rounded-3xl px-4 py-2.5 nav-shell">
      <button class="nav-item nav-item--active">
        <Icon icon="mdi:map" width="20" /> 探索地圖
      </button>
      <span class="nav-sep"></span>
      <button class="nav-item" @click="openQuiz">
        <Icon icon="mdi:clipboard-text" width="20" /> 任務
      </button>
      <span class="nav-sep"></span>
      <button class="nav-item" @click="badgesOpen = true">
        <Icon icon="mdi:medal" width="20" /> 徽章收藏
      </button>
    </div>

    <!-- ═══ 探索指南 Modal ═══ -->
    <transition name="story-fade">
      <div v-if="guideOpen" class="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4"
           style="background:rgba(40,28,10,0.55); backdrop-filter:blur(4px);"
           @click.self="guideOpen = false">
        <div class="modal-paper">
          <h3 class="font-black text-xl mb-4" style="font-family:'Noto Serif TC',serif; color:#4A3520;">探索指南</h3>
          <ol class="space-y-2.5 text-base font-semibold mb-5" style="color:#5A4528;">
            <li v-for="(tip, i) in ['帶著手機出門走路，步數會自動累計', '走到景點後，按「立即打卡」完成現場小挑戰', '打卡成功，景點點亮、永久解鎖新遊戲！', '打卡 3 個景點，獲得今日獎勵！']"
                :key="i" class="flex items-start gap-2.5">
              <span class="w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-black"
                    style="background:#C8842C; color:#FFF7E0;">{{ i + 1 }}</span>
              {{ tip }}
            </li>
          </ol>
          <button class="w-full py-3.5 rounded-2xl font-black text-base mb-3 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                  style="background:linear-gradient(135deg,#5B8C3E,#3E6B2A); color:#F6EDD8;"
                  @click="speakGuide">
            <Icon icon="mdi:volume-high" width="22" /> 語音導引（唸給我聽）
          </button>
          <button v-if="permissionState !== 'granted'"
                  class="w-full py-3.5 rounded-2xl font-black text-base mb-4 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                  style="background:#F6EDD8; border:2px solid #C8A86B; color:#7A6238;"
                  @click="stepStore.start()">
            <Icon icon="mdi:cellphone" width="20" /> 啟用手機計步
          </button>
          <div class="rounded-2xl p-3.5" style="background:#FAF4E4; border:1.5px dashed #C8A86B;">
            <div class="text-xs font-black tracking-widest mb-2" style="color:#A08555;">DEMO 測試（電腦展示用）</div>
            <div class="flex gap-2 flex-wrap">
              <button v-for="n in [500, 1000, 3000]" :key="n" class="demo-chip" @click="addTestSteps(n)">
                ＋{{ n.toLocaleString() }} 步
              </button>
              <button class="demo-chip demo-chip--danger" @click="stepStore.resetAll()">重設</button>
            </div>
          </div>
          <button class="w-full mt-4 py-3 rounded-2xl font-black text-base active:scale-[0.98] transition-transform"
                  style="background:#4A3520; color:#F6EDD8;" @click="guideOpen = false">
            開始探索！
          </button>
        </div>
      </div>
    </transition>

    <!-- ═══ 徽章收藏 Modal ═══ -->
    <transition name="story-fade">
      <div v-if="badgesOpen" class="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4"
           style="background:rgba(40,28,10,0.55); backdrop-filter:blur(4px);"
           @click.self="badgesOpen = false">
        <div class="modal-paper">
          <h3 class="font-black text-xl mb-1" style="font-family:'Noto Serif TC',serif; color:#4A3520;">徽章收藏</h3>
          <p class="text-sm font-bold mb-5" style="color:#A08555;">
            已收集 {{ checkedInIds.length }} / {{ LOCATIONS.length }} 枚景點徽章
          </p>
          <div class="grid grid-cols-3 gap-4 mb-5">
            <div v-for="loc in LOCATIONS" :key="loc.id" class="text-center">
              <div class="relative w-16 h-16 mx-auto rounded-full overflow-hidden mb-1.5 transition-all"
                   :style="isUnlocked(loc)
                     ? `border:3px solid ${loc.color}; box-shadow:0 4px 14px ${loc.color}55;`
                     : 'border:3px solid #D8C9A8; opacity:0.75;'">
                <img :src="loc.photo" :alt="loc.name" class="w-full h-full object-cover"
                     :style="!isUnlocked(loc) ? 'filter:grayscale(1);' : ''" />
                <div v-if="!isUnlocked(loc)" class="absolute inset-0 flex items-center justify-center"
                     style="background:rgba(60,45,20,0.45);">
                  <Icon icon="mdi:lock" width="20" style="color:#FFF7E0;" />
                </div>
              </div>
              <div class="text-xs font-black" :style="isUnlocked(loc) ? 'color:#4A3520;' : 'color:#B8A988;'">
                {{ loc.name }}
              </div>
            </div>
          </div>
          <button class="w-full py-3 rounded-2xl font-black text-base active:scale-[0.98] transition-transform"
                  style="background:#4A3520; color:#F6EDD8;" @click="badgesOpen = false">
            關閉
          </button>
        </div>
      </div>
    </transition>

    <!-- ═══ 故事 Modal ═══ -->
    <transition name="story-fade">
      <div v-if="activeStory" class="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4"
           style="background:rgba(40,28,10,0.55); backdrop-filter:blur(4px);"
           @click.self="activeStory = null">
        <div class="modal-paper">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-20 h-16 rounded-2xl overflow-hidden shrink-0"
                 :style="`border:2px solid ${activeStory.color}66;`">
              <img :src="activeStory.photo" :alt="activeStory.name" class="w-full h-full object-cover" />
            </div>
            <div>
              <div class="font-black text-xl" style="color:#4A3520;">{{ activeStory.storyTitle }}</div>
              <div class="text-sm font-bold" :style="`color:${activeStory.color};`">
                {{ activeStory.name }}・距離 {{ activeStory.distance }}
              </div>
            </div>
          </div>
          <p class="text-base leading-relaxed mb-5 font-medium" style="color:#5A4528;">
            {{ activeStory.story }}
          </p>
          <div class="flex gap-3">
            <button @click="goToGame(activeStory)"
                    class="flex-1 py-4 rounded-2xl font-black text-base active:scale-[0.98] transition-transform"
                    style="background:linear-gradient(135deg,#D14836,#A82E1F); color:#FFF7E0; box-shadow:0 5px 14px rgba(160,50,30,0.35);">
              開始{{ activeStory.gameName }} ›
            </button>
            <button @click="activeStory = null"
                    class="px-5 py-4 rounded-2xl font-black text-base"
                    style="background:#F6EDD8; border:1.5px solid #D8C9A8; color:#7A6238;">
              稍後
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ═══ 在地問答 Modal ═══ -->
    <transition name="story-fade">
      <div v-if="quizOpen" class="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4"
           style="background:rgba(40,28,10,0.55); backdrop-filter:blur(4px);"
           @click.self="closeQuiz">
        <div class="modal-paper">

          <div v-if="quizLoading" class="text-center py-10">
            <div class="mb-4 animate-bounce flex justify-center">
              <Icon icon="mdi:brain" width="56" style="color:#C8842C;" />
            </div>
            <div class="font-black text-lg" style="color:#4A3520;">金寶出題中…</div>
            <div class="text-sm mt-1 font-semibold" style="color:#A08555;">正在準備{{ district }}的在地題目</div>
          </div>

          <div v-else-if="quizIdx >= quizQuestions.length" class="text-center py-6">
            <div class="mb-3 flex justify-center">
              <Icon :icon="quizScore === quizQuestions.length ? 'mdi:trophy' : 'mdi:star'"
                    width="64" :style="quizScore === quizQuestions.length ? 'color:#D4A020;' : 'color:#C8842C;'" />
            </div>
            <div class="font-black text-2xl mb-2" style="color:#4A3520;">
              答對 {{ quizScore }} / {{ quizQuestions.length }} 題！
            </div>
            <p class="text-base font-semibold mb-6" style="color:#A08555;">
              {{ quizScore === quizQuestions.length ? '你是真正的在地智多星！' : '繼續散步、繼續挑戰！' }}
            </p>
            <button class="w-full py-4 rounded-2xl font-black text-base"
                    style="background:#4A3520; color:#F6EDD8;" @click="closeQuiz">完成</button>
          </div>

          <div v-else>
            <div class="flex items-center justify-between mb-3">
              <span class="tag tag--locked">第 {{ quizIdx + 1 }} / {{ quizQuestions.length }} 題</span>
              <span class="tag tag--done">
                {{ { memory: '記憶', calculation: '算術', orientation: '方向' }[currentQuiz.category] ?? '問答' }}
              </span>
            </div>
            <p class="font-black text-xl leading-relaxed mb-5" style="color:#4A3520;">
              {{ currentQuiz.question }}
            </p>
            <div class="space-y-3">
              <button v-for="(opt, i) in currentQuiz.options" :key="i"
                      class="quiz-opt"
                      :class="{
                        'quiz-opt--correct': quizAnswered !== null && i === currentQuiz.answer_index,
                        'quiz-opt--wrong':   quizAnswered === i && i !== currentQuiz.answer_index,
                      }"
                      :disabled="quizAnswered !== null"
                      @click="answerQuiz(i)">
                {{ ['❶','❷','❸','❹'][i] }} {{ opt }}
              </button>
            </div>
            <transition name="story-fade">
              <div v-if="quizAnswered !== null" class="mt-4">
                <div class="rounded-xl px-4 py-3 text-base font-semibold leading-relaxed"
                     :style="quizAnswered === currentQuiz.answer_index
                       ? 'background:#5B8C3E1A; border:2px solid #5B8C3E66; color:#3E6B2A;'
                       : 'background:#C0392B14; border:2px solid #C0392B55; color:#9A2E22;'">
                  {{ quizAnswered === currentQuiz.answer_index ? '答對了！👏 ' : '可惜！' }}{{ currentQuiz.explanation }}
                </div>
                <button class="w-full mt-4 py-4 rounded-2xl font-black text-base"
                        style="background:#4A3520; color:#F6EDD8;" @click="nextQuiz">
                  {{ quizIdx + 1 >= quizQuestions.length ? '看成績 ›' : '下一題 ›' }}
                </button>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </transition>

    <!-- Mascot -->
    <MascotGuide :messages="mascotMessages" />

    <!-- 到達提示：點了直接開打卡 -->
    <transition name="unlock-pop">
      <div v-if="justArrived" class="fixed top-20 left-1/2 -translate-x-1/2 z-[70] cursor-pointer"
           @click="openCheckin(justArrived)">
        <div class="flex items-center gap-3 px-5 py-3.5 rounded-2xl arrive-toast">
          <div class="w-12 h-12 rounded-full overflow-hidden shrink-0" :style="`border:3px solid ${justArrived.color};`">
            <img :src="justArrived.photo" :alt="justArrived.name" class="w-full h-full object-cover" />
          </div>
          <div>
            <div class="font-black text-base" style="color:#4A3520;">到達 {{ justArrived.name }}！</div>
            <div class="text-sm font-bold" style="color:#C0392B;">點我馬上打卡 ›</div>
          </div>
          <button class="ml-2 text-sm font-black opacity-40 hover:opacity-80" @click.stop="justArrived = null">✕</button>
        </div>
      </div>
    </transition>

    <!-- ═══ 打卡 Modal：確認 → 現場小挑戰 → 點亮慶祝 ═══ -->
    <transition name="story-fade">
      <div v-if="checkin" class="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4"
           style="background:rgba(40,28,10,0.55); backdrop-filter:blur(4px);"
           @click.self="checkin.stage === 'done' ? closeCheckin() : null">
        <div class="modal-paper text-center">

          <!-- 1. 確認打卡 -->
          <template v-if="checkin.stage === 'confirm'">
            <div class="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden"
                 :style="`border:4px solid ${checkin.loc.color};`">
              <img :src="checkin.loc.photo" :alt="checkin.loc.name" class="w-full h-full object-cover" />
            </div>
            <h3 class="font-black text-2xl mb-1" style="font-family:'Noto Serif TC',serif; color:#4A3520;">
              到達 {{ checkin.loc.name }}！
            </h3>
            <p class="text-base font-semibold mb-6" style="color:#A08555;">
              完成一個小挑戰，就能把這裡點亮！
            </p>
            <button class="w-full py-5 rounded-2xl font-black text-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                    style="background:linear-gradient(135deg,#D14836,#A82E1F); color:#FFF7E0; box-shadow:0 8px 24px rgba(160,50,30,0.4);"
                    @click="startChallenge">
              <Icon icon="mdi:map-marker-check" width="26" /> 立即打卡
            </button>
            <button class="mt-3 text-sm font-bold opacity-50 hover:opacity-80" style="color:#7A6238;" @click="closeCheckin">
              稍後再打卡
            </button>
          </template>

          <!-- 2. 現場小挑戰 -->
          <template v-else-if="checkin.stage === 'challenge'">
            <div class="flex items-center justify-center gap-2 mb-4">
              <Icon icon="mdi:puzzle" width="22" style="color:#C8842C;" />
              <span class="font-black text-base" style="color:#A0612F;">{{ checkin.loc.name }}・打卡小挑戰</span>
            </div>
            <p class="font-black text-xl leading-relaxed mb-6" style="color:#4A3520;">
              {{ CHECKIN_CHALLENGES[checkin.loc.id].q }}
            </p>
            <div class="space-y-3 text-left" :class="{ 'challenge-shake': checkin.wrong }">
              <button v-for="(opt, i) in CHECKIN_CHALLENGES[checkin.loc.id].options" :key="i"
                      class="quiz-opt" @click="answerChallenge(i)">
                {{ ['❶','❷','❸'][i] }} {{ opt }}
              </button>
            </div>
            <p v-if="checkin.wrong" class="mt-3 text-sm font-black" style="color:#C0392B;">
              再想一下喔，沒關係！
            </p>
          </template>

          <!-- 3. 打卡成功：點亮慶祝 -->
          <template v-else>
            <div class="checkin-glow w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden"
                 :style="`border:4px solid ${checkin.loc.color};`">
              <img :src="checkin.loc.photo" :alt="checkin.loc.name" class="w-full h-full object-cover" />
            </div>
            <h3 class="font-black text-2xl mb-1" style="font-family:'Noto Serif TC',serif; color:#4A3520;">
              打卡成功！
            </h3>
            <p class="text-lg font-black mb-1" style="color:#C0392B;">
              {{ CHECKIN_CHALLENGES[checkin.loc.id].done }}
            </p>
            <p class="text-base font-semibold mb-6" style="color:#A08555;">
              解鎖新遊戲：【{{ checkin.loc.gameName }}】隨時都能玩！
            </p>
            <button class="w-full py-4 rounded-2xl font-black text-lg active:scale-[0.98] transition-transform"
                    style="background:linear-gradient(135deg,#D14836,#A82E1F); color:#FFF7E0;"
                    @click="playFromCheckin">
              馬上玩 {{ checkin.loc.gameName }} ›
            </button>
            <button class="w-full mt-3 py-3 rounded-2xl font-black text-base"
                    style="background:#F6EDD8; border:1.5px solid #D8C9A8; color:#7A6238;"
                    @click="closeCheckin">
              繼續探索地圖
            </button>
          </template>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Icon } from '@iconify/vue'
import { useStepStore, LOCATIONS, DAILY_GOAL, USER_POSITION } from '../stores/stepStore'
import { useSpeech } from '../composables/useSpeech'
import { supabase } from '../lib/supabase'
import MascotGuide from '../components/MascotGuide.vue'

const router = useRouter()
const stepStore = useStepStore()
const speech = useSpeech()
const { todaySteps, permissionState, streak, district, arrivedIds, checkedInIds, completedIds, nextTarget, goalProgress } = storeToRefs(stepStore)

const statusOf = (loc) => stepStore.statusOf(loc)
const isUnlocked = (loc) => checkedInIds.value.includes(loc.id)
const isArrived  = (loc) => statusOf(loc) === 'arrived'

// ── Leaflet 地圖 ─────────────────────────────────────────────
const mapEl = ref(null)
let map = null
let radiusCircle = null
const markers = {}

const radiusKm = ref(1.2)
const showExplored = ref(true)

// 圖釘用的 MDI icon path（divIcon 是 Leaflet 注入的原生 HTML，無法放 Vue 元件，用內嵌 SVG）
const PIN_ICONS = {
  park:   'M11,21V16.74C10.53,16.91 10.03,17 9.5,17C7,17 5,15 5,12.5C5,11.23 5.5,10.09 6.36,9.27C6.13,8.73 6,8.13 6,7.5C6,5 8,3 10.5,3C12.06,3 13.44,3.8 14.25,5C14.33,5 14.41,5 14.5,5A5.5,5.5 0 0,1 20,10.5A5.5,5.5 0 0,1 14.5,16C14,16 13.5,15.93 13,15.79V21H11Z',
  store:  'M12,18H6V14H12M21,14V12L20,7H4L3,12V14H4V20H14V14H18V20H20V14M20,4H4V6H20V4Z',
  camera: 'M4,4H7L9,2H15L17,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z',
  market: 'M11,9H9V2H7V9H5V2H3V9C3,11.12 4.66,12.84 6.75,12.97V22H9.25V12.97C11.34,12.84 13,11.12 13,9V2H11V9M16,6V14H18.5V22H21V2C18.24,2 16,4.24 16,6Z',
  stage:  'M21,3V15.5A3.5,3.5 0 0,1 17.5,19A3.5,3.5 0 0,1 14,15.5A3.5,3.5 0 0,1 17.5,12C18.04,12 18.55,12.12 19,12.34V6.47L9,8.6V17.5A3.5,3.5 0 0,1 5.5,21A3.5,3.5 0 0,1 2,17.5A3.5,3.5 0 0,1 5.5,14C6.04,14 6.55,14.12 7,14.34V6L21,3Z',
  temple: 'M11.5,1L2,6V8H21V6M16,10V17H19V10M2,22H21V19H2M10,10V17H13V10M4,10V17H7V10H4Z',
}

const pinHtml = (loc) => {
  const st = statusOf(loc)
  const locked  = st === 'locked' || st === 'in_progress'
  const arrived = st === 'arrived'
  const lockSvg = '<svg viewBox="0 0 24 24" width="11" height="11" fill="#FFF7E0"><path d="M12 17a2 2 0 0 0 2-2 2 2 0 0 0-2-2 2 2 0 0 0-2 2 2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5 5 5 0 0 1 5 5v2h1m-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3Z"/></svg>'
  const checkSvg = '<svg viewBox="0 0 24 24" width="12" height="12" fill="#FFFFFF"><path d="M21 7 9 19l-5.5-5.5 1.41-1.41L9 16.17 19.59 5.59 21 7Z"/></svg>'
  const stampSvg = '<svg viewBox="0 0 24 24" width="12" height="12" fill="#FFFFFF"><path d="M12,3A4,4 0 0,1 16,7C16,8.95 14.6,10.58 12.75,10.93L13,12H17A2,2 0 0,1 19,14V16H5V14A2,2 0 0,1 7,12H11L11.25,10.93C9.4,10.58 8,8.95 8,7A4,4 0 0,1 12,3M5,18H19V21H5V18Z"/></svg>'
  const badge = st === 'completed'
    ? `<span class="ki-badge ki-badge--done">${checkSvg}</span>`
    : arrived ? `<span class="ki-badge ki-badge--stamp">${stampSvg}</span>`
    : locked ? `<span class="ki-badge ki-badge--lock">${lockSvg}</span>` : ''
  const iconSvg = `<svg viewBox="0 0 24 24" width="28" height="28" fill="${locked ? '#A89878' : loc.color}"><path d="${PIN_ICONS[loc.id] ?? PIN_ICONS.park}"/></svg>`
  // 到達可打卡：金色呼吸光圈 + 「可打卡」標籤
  const tagHtml = arrived ? '<span class="ki-tag-checkin">可打卡！</span>' : ''
  return `
    <div class="ki-pin ${locked ? 'ki-pin--locked' : ''} ${arrived ? 'ki-pin--arrived' : ''}">
      ${tagHtml}
      <div class="ki-circle" style="--c:${arrived ? '#D4A020' : loc.color};">
        ${iconSvg}
        ${badge}
      </div>
      <div class="ki-label">
        <b>${loc.name}</b>
        <span>${loc.distance}</span>
      </div>
    </div>`
}

const makeIcon = (loc) => L.divIcon({
  className: 'ki-pin-wrap',
  html: pinHtml(loc),
  iconSize: [0, 0],
  iconAnchor: [28, 28],
})

const refreshMarkers = () => {
  if (!map) return
  for (const loc of LOCATIONS) {
    const m = markers[loc.id]
    if (!m) continue
    m.setIcon(makeIcon(loc))
    const visible = showExplored.value || !isUnlocked(loc)
    if (visible && !map.hasLayer(m)) m.addTo(map)
    if (!visible && map.hasLayer(m)) m.remove()
  }
}

const initMap = () => {
  map = L.map(mapEl.value, { zoomControl: false, attributionControl: true })

  // 淺色地圖底圖（接近 mockup 的紙感）
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap © CARTO',
    maxZoom: 19,
  }).addTo(map)

  // 目前位置：藍點＋脈衝
  L.marker([USER_POSITION.lat, USER_POSITION.lng], {
    icon: L.divIcon({
      className: 'ki-pin-wrap',
      html: '<div class="ki-user"><span class="ki-user-pulse"></span><span class="ki-user-dot"></span></div>',
      iconSize: [0, 0],
      iconAnchor: [12, 12],
    }),
    zIndexOffset: -100,
  }).addTo(map)

  // 探索半徑圈
  radiusCircle = L.circle([USER_POSITION.lat, USER_POSITION.lng], {
    radius: radiusKm.value * 1000,
    color: '#5B8CC8',
    weight: 1.5,
    fillColor: '#5B8CC8',
    fillOpacity: 0.07,
    dashArray: '6 6',
  }).addTo(map)

  // 景點圖釘
  for (const loc of LOCATIONS) {
    markers[loc.id] = L.marker([loc.lat, loc.lng], { icon: makeIcon(loc) })
      .addTo(map)
      .on('click', () => onLocationClick(loc))
  }

  // 視野涵蓋所有點
  const bounds = L.latLngBounds([[USER_POSITION.lat, USER_POSITION.lng], ...LOCATIONS.map(l => [l.lat, l.lng])])
  map.fitBounds(bounds, { padding: [60, 60] })
}

const recenter = () => map?.setView([USER_POSITION.lat, USER_POSITION.lng], 15, { animate: true })

watch(radiusKm, (km) => radiusCircle?.setRadius(km * 1000))
watch(showExplored, refreshMarkers)
watch([arrivedIds, checkedInIds, completedIds], refreshMarkers)

// ── 語音導引 ─────────────────────────────────────────────────
const latestUnlockedLoc = computed(() => {
  const ids = checkedInIds.value.filter(id => !completedIds.value.includes(id))
  if (!ids.length) return null
  return LOCATIONS.find(l => l.id === ids[ids.length - 1]) ?? null
})

const speakGuide = () => {
  const parts = [`你今天走了 ${todaySteps.value} 步。`]
  const toCheckIn = LOCATIONS.find(l => stepStore.statusOf(l) === 'arrived')
  if (toCheckIn) parts.push(`你已經走到${toCheckIn.name}了，快來打卡！`)
  if (latestUnlockedLoc.value) parts.push(`${latestUnlockedLoc.value.name}已經點亮，隨時可以玩${latestUnlockedLoc.value.gameName}！`)
  if (nextTarget.value) parts.push(`再走 ${Math.max(0, nextTarget.value.requiredSteps - todaySteps.value)} 步，就到${nextTarget.value.name}了。加油！`)
  else if (!toCheckIn) parts.push('所有地點都打卡完成了，你太厲害了！')
  speech.speak(parts.join(''))
}

// ── 在地問答 ─────────────────────────────────────────────────
const FALLBACK_QUIZ = [
  { question: '指南宮主要供奉的是哪位神明？', options: ['呂洞賓', '媽祖', '關公'], answer_index: 0, explanation: '指南宮是有名的「仙公廟」，主祀呂洞賓，以前很多人專程上山拜拜呢！', category: 'memory' },
  { question: '貓空最有名的特產是什麼？', options: ['茶葉', '鳳梨', '竹筍'], answer_index: 0, explanation: '貓空種茶超過百年，鐵觀音最出名，泡一壺配山景上讚的啦！', category: 'memory' },
  { question: '柑仔店的糖果一顆 5 元，30 元可以買幾顆？', options: ['6 顆', '5 顆', '7 顆'], answer_index: 0, explanation: '30 除以 5 等於 6，買 6 顆剛剛好，跟孫子一人一半！', category: 'calculation' },
  { question: '蚵仔煎一份 65 元，買 2 份付 200 元，要找多少？', options: ['70 元', '60 元', '80 元'], answer_index: 0, explanation: '兩份 130 元，200 減 130 找 70 元。夜市算帳你最內行！', category: 'calculation' },
  { question: '從木柵要上指南宮，應該往哪個方向走？', options: ['往山上走', '往河堤走', '往捷運站走'], answer_index: 0, explanation: '指南宮在猴山岳的山腰上，要爬好幾百階樓梯，以前是有名的健行路線！', category: 'orientation' },
]

const quizOpen = ref(false)
const quizLoading = ref(false)
const quizQuestions = ref([])
const quizIdx = ref(0)
const quizAnswered = ref(null)
const quizScore = ref(0)

const currentQuiz = computed(() => quizQuestions.value[quizIdx.value] ?? {})

const openQuiz = async () => {
  quizOpen.value = true
  quizLoading.value = true
  quizIdx.value = 0
  quizScore.value = 0
  quizAnswered.value = null
  try {
    const { data, error } = await supabase.functions.invoke('local-quiz', {
      body: { district: district.value, count: 3 },
    })
    if (error || data?.error || !data?.questions?.length) throw new Error('quiz backend failed')
    quizQuestions.value = data.questions
  } catch {
    quizQuestions.value = [...FALLBACK_QUIZ].sort(() => Math.random() - 0.5).slice(0, 3)
  }
  quizLoading.value = false
}

const answerQuiz = (i) => {
  quizAnswered.value = i
  if (i === currentQuiz.value.answer_index) quizScore.value++
}

const nextQuiz = () => {
  quizAnswered.value = null
  quizIdx.value++
}

const closeQuiz = () => {
  quizOpen.value = false
  speech.stopSpeaking()
}

// ── 打卡流程：到達 → 打卡 → 現場小挑戰 → 點亮慶祝 ──────────
// 每個景點專屬的現場挑戰（一題，答對才算打卡成功）
const CHECKIN_CHALLENGES = {
  park:   { q: '涼亭裡的阿伯們最常下的是什麼棋？',          options: ['象棋', '西洋棋', '跳棋'],                       answer: 0, done: '公園的涼亭熱鬧起來了！' },
  store:  { q: '糖果一顆 5 元，買 4 顆要多少錢？',          options: ['20 元', '15 元', '25 元'],                      answer: 0, done: '柑仔店重新開張了！' },
  camera: { q: '以前拍照的時候，攝影師會喊什麼？',          options: ['看這裡，笑一個！', '大家來跳舞！', '請閉眼睛！'], answer: 0, done: '相機館的燈亮起來了！' },
  market: { q: '蚵仔煎裡面一定會有什麼？',                  options: ['蚵仔', '牛肉', '起司'],                         answer: 0, done: '夜市的攤位開張了！' },
  stage:  { q: '「獨夜無伴守燈下」是哪首歌的歌詞？',        options: ['望春風', '甜蜜蜜', '高山青'],                   answer: 0, done: '河堤的音樂響起來了！' },
  temple: { q: '上指南宮要走什麼上山？',                    options: ['千階步道', '手扶梯', '溜滑梯'],                 answer: 0, done: '指南宮的香火旺起來了！' },
}

const activeStory = ref(null)
const justArrived  = ref(null)   // 剛到達可打卡的提示
const guideOpen = ref(false)
const badgesOpen = ref(false)
// checkin: { loc, stage: 'confirm' | 'challenge' | 'done', wrong: boolean }
const checkin = ref(null)
let prevArrived = [...arrivedIds.value]

const onLocationClick = (loc) => {
  const st = statusOf(loc)
  if (st === 'arrived') {
    openCheckin(loc)
  } else if (st === 'unlocked' || st === 'completed') {
    activeStory.value = loc
  } else {
    speech.speak(`${loc.name}還沒到喔，再走 ${Math.max(0, loc.requiredSteps - todaySteps.value)} 步就到了，加油！`)
  }
}

const openCheckin = (loc) => {
  justArrived.value = null
  checkin.value = { loc, stage: 'confirm', wrong: false }
}

const startChallenge = () => {
  if (checkin.value) checkin.value.stage = 'challenge'
}

const answerChallenge = (i) => {
  if (!checkin.value) return
  const ch = CHECKIN_CHALLENGES[checkin.value.loc.id]
  if (i === ch.answer) {
    stepStore.checkIn(checkin.value.loc.id)
    checkin.value.stage = 'done'
    speech.speak(`恭喜！${ch.done}解鎖${checkin.value.loc.gameName}！`)
  } else {
    checkin.value.wrong = true
    speech.speak('再想一下喔，沒關係！')
    setTimeout(() => { if (checkin.value) checkin.value.wrong = false }, 900)
  }
}

const closeCheckin = () => { checkin.value = null }

const playFromCheckin = () => {
  const loc = checkin.value?.loc
  checkin.value = null
  if (loc) goToGame(loc)
}

const addTestSteps = (n) => stepStore.setSteps(todaySteps.value + n)

const goToGame = (loc) => {
  activeStory.value = null
  stepStore.completeLocation(loc.id)
  router.push({ name: loc.game })
}

// 剛走到新地點 → 跳「可以打卡了」提示
watch(arrivedIds, (ids) => {
  const newly = ids.filter(id => !prevArrived.includes(id) && !checkedInIds.value.includes(id))
  if (newly.length > 0) {
    const loc = LOCATIONS.find(l => l.id === newly[0])
    if (loc) {
      justArrived.value = loc
      speech.speak(`你走到${loc.name}了！快來打卡！`)
      map?.flyTo([loc.lat, loc.lng], 15, { duration: 1.2 })
    }
  }
  prevArrived = [...ids]
})

const mascotMessages = computed(() => {
  const steps = todaySteps.value
  const toCheckIn = LOCATIONS.find(l => statusOf(l) === 'arrived')
  if (steps === 0) return [
    '歡迎來到金憶街區！',
    '出門走 500 步，走到木柵公園就可以打卡囉！',
    '按右上角「探索指南」看怎麼玩！',
  ]
  if (toCheckIn) return [
    `你已經走到「${toCheckIn.name}」了！`,
    '點地圖上發亮的地點，馬上打卡！',
    '打卡成功就能把它點亮、解鎖新遊戲！',
  ]
  if (nextTarget.value) return [
    `今天走了 ${steps.toLocaleString()} 步，真不錯！`,
    `再走 ${Math.max(0, nextTarget.value.requiredSteps - steps).toLocaleString()} 步就到「${nextTarget.value.name}」了！`,
    '也可以按「任務」挑戰在地問答喔！',
  ]
  return [
    '哇！全部地點都打卡完成了！',
    '你今天是金憶街區的探險王！',
    '來「徽章收藏」看看你的成果吧！',
  ]
})

onMounted(async () => {
  stepStore.start()
  await nextTick()
  initMap()
  // 進場後修正容器尺寸
  setTimeout(() => map?.invalidateSize(), 200)
})

onUnmounted(() => {
  stepStore.stop()
  speech.stopSpeaking()
  map?.remove()
  map = null
})
</script>

<style scoped>
/* ═══ 淺色探索主題：戶外防眩光高對比 ═══ */
.explore-bg {
  background: linear-gradient(170deg, #F4EDDC 0%, #EFE6CF 60%, #EAE0C6 100%);
}

/* 頂部卡片 */
.top-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 18px;
  background: rgba(255, 252, 244, 0.92);
  border: 1.5px solid #E2D5B4;
  box-shadow: 0 3px 10px rgba(120, 90, 40, 0.08);
}

/* 地圖外殼 */
.map-shell {
  min-height: 420px;
  height: clamp(420px, calc(100vh - 230px), 820px);
  border: 2px solid #E2D5B4;
  box-shadow: 0 8px 28px rgba(120, 90, 40, 0.14);
  background: #EDEAE0;
}

/* 地圖上的浮動膠囊 */
.map-pill {
  padding: 10px 16px;
  border-radius: 18px;
  background: rgba(255, 252, 244, 0.95);
  border: 1.5px solid #E2D5B4;
  box-shadow: 0 4px 14px rgba(80, 60, 20, 0.15);
}

/* 半徑滑桿 */
.radius-slider {
  width: 110px;
  accent-color: #3B82C4;
}

/* 地圖控制鍵 */
.map-ctrl {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: 1.5px solid #E2D5B4;
  background: rgba(255, 252, 244, 0.95);
  color: #4A3520;
  font-size: 20px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(80, 60, 20, 0.15);
  transition: transform 0.12s;
}
.map-ctrl:active { transform: scale(0.92); }

/* 側欄 */
.sidebar-shell {
  background: rgba(255, 252, 244, 0.92);
  border: 1.5px solid #E2D5B4;
  box-shadow: 0 8px 28px rgba(120, 90, 40, 0.1);
}
.sidebar-shell::-webkit-scrollbar { width: 8px; }
.sidebar-shell::-webkit-scrollbar-thumb { background: #D8C9A8; border-radius: 4px; }
.sidebar-shell::-webkit-scrollbar-track { background: transparent; }

/* 景點卡片 */
.spot-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 18px;
  background: #FFFDF7;
  border: 1.5px solid #E8DDC2;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.spot-card:hover { box-shadow: 0 4px 14px rgba(120, 90, 40, 0.12); }
.spot-card:active { transform: scale(0.98); }
.spot-card--locked { opacity: 0.75; }

.spot-thumb {
  width: 84px;
  height: 76px;
  border-radius: 14px;
  flex-shrink: 0;
  overflow: hidden;
  border: 1.5px solid rgba(120, 90, 40, 0.18);
  background: #EDE3CC;
}
.spot-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 標籤 */
.tag {
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 900;
  border: 1.5px solid transparent;
}
.tag--done   { background: #5B8C3E1F; color: #3E6B2A; border-color: #5B8C3E55; }
.tag--open   { background: #C8842C1F; color: #A0612F; border-color: #C8842C66; }
.tag--locked { background: #EDE3CC; color: #A08555; border-color: #D8C9A8; }
.tag--checkin {
  background: #C0392B;
  color: #FFF7E0;
  border-color: #C0392B;
  animation: tag-blink 1.4s ease-in-out infinite;
}
@keyframes tag-blink {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.65; }
}

/* 到達提示浮窗 */
.arrive-toast {
  background: rgba(255, 251, 240, 0.98);
  border: 2px solid #C8842C;
  box-shadow: 0 12px 36px rgba(60, 40, 10, 0.35);
  animation: toast-drop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes toast-drop {
  from { opacity: 0; transform: translateY(-20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* 打卡成功：點亮光暈 */
.checkin-glow {
  animation: glow-pop 1.2s ease-out;
  box-shadow: 0 0 0 0 rgba(212, 160, 32, 0.7);
}
@keyframes glow-pop {
  0%   { transform: scale(0.6); filter: grayscale(1) brightness(0.7); box-shadow: 0 0 0 0 rgba(212,160,32,0.7); }
  55%  { transform: scale(1.08); filter: grayscale(0) brightness(1.15); }
  100% { transform: scale(1); filter: none; box-shadow: 0 0 0 28px rgba(212,160,32,0); }
}

/* 答錯搖一下 */
.challenge-shake { animation: shake 0.4s ease; }
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}

/* 固定底部導覽列 */
.nav-shell {
  width: max-content;
  max-width: calc(100vw - 24px);
  background: rgba(255, 252, 244, 0.92);
  backdrop-filter: blur(10px);
  border: 1.5px solid #E2D5B4;
  box-shadow: 0 10px 32px rgba(60, 40, 10, 0.22);
}

/* 金寶往上移，避開固定導覽列 */
:deep(.mascot-wrap) {
  bottom: 92px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 18px;
  border-radius: 999px;
  border: 2px solid transparent;
  background: none;
  font-weight: 900;
  font-size: clamp(0.85rem, 2.4vw, 1rem);
  color: #A08555;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.nav-item:active { transform: scale(0.95); }
.nav-item--active {
  background: #FFFDF7;
  border-color: #4A3520;
  color: #4A3520;
}
.nav-sep { width: 1.5px; height: 22px; background: #E2D5B4; }

/* Modal 紙張 */
.modal-paper {
  width: 100%;
  max-width: min(520px, 94vw);
  border-radius: 24px;
  padding: clamp(18px, 3.5vw, 26px) clamp(16px, 3vw, 24px);
  background: #FFFBF0;
  border: 2px solid #D8C9A8;
  box-shadow: 0 24px 64px rgba(40, 25, 5, 0.4);
  max-height: 86vh;
  overflow-y: auto;
}

/* 問答選項 */
.quiz-opt {
  display: block;
  width: 100%;
  text-align: left;
  padding: clamp(13px, 2.8vw, 17px) clamp(14px, 3vw, 18px);
  border-radius: 16px;
  background: #FAF4E4;
  border: 2px solid #D8C9A8;
  color: #4A3520;
  font-weight: 800;
  font-size: clamp(0.98rem, 2.6vw, 1.08rem);
  cursor: pointer;
  transition: transform 0.12s, border-color 0.2s, background 0.2s;
}
.quiz-opt:not(:disabled):active { transform: scale(0.97); }
.quiz-opt--correct { background: #5B8C3E22; border-color: #5B8C3E; color: #3E6B2A; }
.quiz-opt--wrong   { background: #C0392B14; border-color: #C0392B; color: #9A2E22; }

/* Demo chips */
.demo-chip {
  padding: 8px 14px;
  border-radius: 10px;
  border: 1.5px solid #C8A86B;
  background: #FFFDF7;
  color: #7A6238;
  font-weight: 800;
  font-size: 0.85rem;
  cursor: pointer;
}
.demo-chip:active { transform: scale(0.94); }
.demo-chip--danger { border-color: #C0392B88; color: #A82E1F; }

/* 轉場 */
.story-fade-enter-active, .story-fade-leave-active { transition: all 0.3s ease; }
.story-fade-enter-from { opacity: 0; transform: translateY(40px); }
.story-fade-leave-to   { opacity: 0; transform: translateY(40px); }

.unlock-pop-enter-active { animation: unlockPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
.unlock-pop-leave-active { transition: opacity 0.4s ease; }
.unlock-pop-leave-to     { opacity: 0; }

@keyframes unlockPop {
  from { opacity: 0; transform: scale(0.5); }
  to   { opacity: 1; transform: scale(1); }
}
</style>

<!-- Leaflet divIcon 的 HTML 在元件 scope 之外，需用全域樣式 -->
<style>
.ki-pin-wrap { background: none; border: none; }

.ki-pin {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  filter: drop-shadow(0 4px 10px rgba(60, 40, 10, 0.3));
}

.ki-circle {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #FFFFFF;
  border: 4px solid var(--c);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.9);
}

.ki-pin--locked .ki-circle {
  border-color: #B8A988;
  background: #F2EDE0;
}

.ki-badge {
  position: absolute;
  top: -7px;
  right: -7px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #FFFFFF;
  z-index: 2;
}
.ki-badge--lock { background: #6B5A40; }
.ki-badge--done { background: #3E8E4E; }
.ki-badge--stamp { background: #C0392B; }

/* 到達可打卡：金色呼吸光圈 + 紅色「可打卡」標籤 */
.ki-pin--arrived .ki-circle {
  animation: ki-arrive-pulse 1.6s ease-in-out infinite;
}
@keyframes ki-arrive-pulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(255,255,255,0.9), 0 0 0 0 rgba(212,160,32,0.55); }
  50%      { box-shadow: 0 0 0 3px rgba(255,255,255,0.9), 0 0 0 14px rgba(212,160,32,0); }
}

.ki-tag-checkin {
  padding: 2px 10px;
  margin-bottom: 2px;
  border-radius: 999px;
  background: #C0392B;
  color: #FFF7E0;
  font-size: 11px;
  font-weight: 900;
  font-family: 'Noto Sans TC', sans-serif;
  white-space: nowrap;
  animation: tag-blink 1.4s ease-in-out infinite;
}
@keyframes tag-blink {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.6; }
}

.ki-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 12px;
  border-radius: 12px;
  background: rgba(255, 253, 247, 0.96);
  border: 1.5px solid #E2D5B4;
  text-align: center;
  line-height: 1.25;
  white-space: nowrap;
}
.ki-label b { font-size: 13px; font-weight: 900; color: #4A3520; font-family: 'Noto Sans TC', sans-serif; }
.ki-label span { font-size: 11px; font-weight: 700; color: #A08555; }

/* 目前位置藍點 */
.ki-user {
  position: relative;
  width: 24px;
  height: 24px;
}
.ki-user-dot {
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background: #3B82C4;
  border: 3px solid #FFFFFF;
  box-shadow: 0 2px 8px rgba(40, 90, 160, 0.5);
}
.ki-user-pulse {
  position: absolute;
  inset: -14px;
  border-radius: 50%;
  background: rgba(59, 130, 196, 0.25);
  animation: ki-pulse 2s ease-out infinite;
}
@keyframes ki-pulse {
  0%   { transform: scale(0.5); opacity: 0.8; }
  100% { transform: scale(1.6); opacity: 0; }
}
</style>
