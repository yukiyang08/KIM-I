<template>
  <template v-if="showNav">
  <!-- Hamburger Button -->
  <button
    @click="isOpen = !isOpen"
    class="fixed top-3 right-3 sm:top-4 sm:right-4 z-[100] w-14 h-14 sm:w-16 sm:h-16 flex flex-col items-center justify-center gap-2 transition-all duration-300 group"
    style="background: linear-gradient(135deg, rgba(242,196,78,0.96), rgba(184,128,12,0.96));
            border: 2px solid rgba(255,229,160,0.75);
            border-radius: 14px;
            backdrop-filter: blur(12px);
            box-shadow: 0 12px 34px rgba(200,150,30,0.35), 0 0 0 1px rgba(255,244,209,0.28);">
    <!-- Profile not set indicator -->
    <span v-if="!profileStore.isSetup"
          class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black z-10"
          style="background: #E84040; color: #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">!</span>
    <span :class="[
      'w-7 sm:w-8 h-1 rounded-full transition-all duration-300 origin-center',
      isOpen ? 'rotate-45 translate-y-3 bg-[#3A2408]' : 'bg-[#3A2408] group-hover:bg-[#2A1605]'
    ]"></span>
    <span :class="[
      'w-7 sm:w-8 h-1 rounded-full transition-all duration-300',
      isOpen ? 'opacity-0' : 'opacity-100 bg-[#3A2408] group-hover:bg-[#2A1605]'
    ]"></span>
    <span :class="[
      'w-7 sm:w-8 h-1 rounded-full transition-all duration-300 origin-center',
      isOpen ? '-rotate-45 -translate-y-3 bg-[#3A2408]' : 'bg-[#3A2408] group-hover:bg-[#2A1605]'
    ]"></span>
  </button>

  <!-- Sidebar Overlay -->
  <transition name="sidebar-fade">
    <div
      v-if="isOpen"
      @click="isOpen = false"
      class="fixed inset-0 backdrop-blur-sm z-[80]"
      style="background: rgba(0,0,0,0.38);"
    ></div>
  </transition>

  <!-- Sidebar Menu -->
  <transition name="sidebar-slide">
    <div
      v-if="isOpen"
      class="fixed top-0 right-0 h-full w-[78vw] max-w-[320px] z-[90] overflow-y-auto flex flex-col"
      style="background: linear-gradient(180deg, #1E1608 0%, #140E05 100%);
             border-left: 1px solid rgba(200,148,40,0.28);
             box-shadow: -8px 0 40px rgba(0,0,0,0.55);">

      <!-- Film strip decoration -->
      <div class="h-2 flex shrink-0" style="background: #130F08;">
        <div v-for="i in 24" :key="i" class="flex-1 my-0.5 mx-px rounded-sm"
             style="background: rgba(0,0,0,0.65);"></div>
      </div>

      <!-- Menu content -->
      <div class="flex-1 pt-20 px-5 pb-8 flex flex-col gap-1">

        <!-- Brand -->
        <div class="text-center mb-5 pb-5 border-b" style="border-color: rgba(200,148,40,0.2);">
          <h2 class="font-black tracking-[0.1em]"
              style="font-family:'Noto Serif TC',serif; font-size:1.6rem; color:#F2CF86; text-shadow:0 2px 12px rgba(0,0,0,0.5);">
            金憶 KIM-I
          </h2>
        </div>

        <!-- Profile item -->
        <router-link
          to="/profile"
          class="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98]"
          :class="route.path === '/profile' ? '' : 'hover:bg-white/[0.06]'"
          :style="route.path === '/profile'
            ? 'background: rgba(200,150,30,0.15); border: 1px solid rgba(200,148,40,0.35);'
            : !profileStore.isSetup
              ? 'background: rgba(200,148,40,0.14); border: 1px solid rgba(200,148,40,0.4);'
              : 'border: 1px solid transparent;'"
          @click="isOpen = false">
          <span class="text-xl leading-none shrink-0">{{ profileStore.isSetup ? '👵' : '👤' }}</span>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-sm leading-tight"
                 :style="{ color: profileStore.isSetup ? 'rgba(255,231,186,0.9)' : '#F2CF86' }">
              {{ profileStore.isSetup ? (profileStore.name || '個人資料') : '設定個人資料' }}
            </div>
            <div class="text-xs mt-0.5 leading-tight"
                 style="color: rgba(255,215,150,0.45);">
              {{ profileStore.isSetup ? (profileStore.eraLabel + '・' + profileStore.regionLabel) : '讓故事變成你自己的' }}
            </div>
          </div>
          <span v-if="!profileStore.isSetup" class="text-xs font-black shrink-0" style="color:#C8961E;">!</span>
        </router-link>

        <div class="mt-3 mb-1 px-1 text-xs tracking-[0.16em] uppercase font-semibold"
             style="color: rgba(255,255,255,0.28);">遊戲</div>

        <!-- 遊戲大廳 -->
        <router-link
          to="/"
          class="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200"
          :class="route.path === '/' ? '' : 'hover:bg-white/[0.06]'"
          :style="route.path === '/'
            ? 'background: rgba(200,150,30,0.12); border:1px solid rgba(200,148,40,0.28);'
            : 'border:1px solid transparent;'"
          @click="isOpen = false"
          :style-color="route.path === '/' ? '#F7D58A' : 'rgba(255,244,220,0.88)'">
          <span class="text-xl leading-none shrink-0">🎮</span>
          <span class="font-bold text-sm"
                :style="{ color: route.path === '/' ? '#F2CF86' : 'rgba(255,231,186,0.82)' }">遊戲大廳</span>
        </router-link>

        <!-- 今天的一天 -->
        <router-link
          to="/day"
          class="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200"
          :class="route.path === '/day' ? '' : 'hover:bg-white/[0.06]'"
          :style="route.path === '/day'
            ? 'background: rgba(200,150,30,0.12); border:1px solid rgba(200,148,40,0.28);'
            : 'border:1px solid transparent;'"
          @click="isOpen = false">
          <span class="text-xl leading-none shrink-0">🌅</span>
          <span class="font-bold text-sm"
                :style="{ color: route.path === '/day' ? '#F2CF86' : 'rgba(255,231,186,0.82)' }">今天的一天</span>
        </router-link>

        <!-- 多人模式 -->
        <router-link
          to="/multiplayer"
          class="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200"
          :class="route.path.startsWith('/multiplayer') ? '' : 'hover:bg-white/[0.06]'"
          :style="route.path.startsWith('/multiplayer')
            ? 'background: rgba(200,150,30,0.12); border:1px solid rgba(200,148,40,0.28);'
            : 'border:1px solid transparent;'"
          @click="isOpen = false">
          <span class="text-xl leading-none shrink-0">👥</span>
          <span class="font-bold text-sm"
                :style="{ color: route.path.startsWith('/multiplayer') ? '#F2CF86' : 'rgba(255,231,186,0.82)' }">多人模式</span>
        </router-link>

        <div class="mt-3 mb-1 px-1 text-xs tracking-[0.16em] uppercase font-semibold"
             style="color: rgba(255,255,255,0.28);">報表</div>

        <!-- 家屬報表 -->
        <router-link
          to="/dashboard/family"
          class="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200"
          :class="route.path === '/dashboard/family' ? '' : 'hover:bg-white/[0.06]'"
          :style="route.path === '/dashboard/family'
            ? 'background: rgba(200,150,30,0.12); border:1px solid rgba(200,148,40,0.28);'
            : 'border:1px solid transparent;'"
          @click="isOpen = false">
          <span class="text-xl leading-none shrink-0">👨‍👩‍👧</span>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-sm"
                 :style="{ color: route.path === '/dashboard/family' ? '#F2CF86' : 'rgba(255,231,186,0.82)' }">家屬報表</div>
            <div class="text-xs mt-0.5" style="color: rgba(255,215,150,0.4);">適合家人與長輩使用</div>
          </div>
        </router-link>

        <!-- 照顧單位報表 -->
        <router-link
          to="/dashboard"
          class="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200"
          :class="route.path === '/dashboard' ? '' : 'hover:bg-white/[0.06]'"
          :style="route.path === '/dashboard'
            ? 'background: rgba(200,150,30,0.12); border:1px solid rgba(200,148,40,0.28);'
            : 'border:1px solid transparent;'"
          @click="isOpen = false">
          <span class="text-xl leading-none shrink-0">🏥</span>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-sm"
                 :style="{ color: route.path === '/dashboard' ? '#F2CF86' : 'rgba(255,231,186,0.82)' }">照顧單位報表</div>
            <div class="text-xs mt-0.5" style="color: rgba(255,215,150,0.4);">日照中心、照顧機構使用</div>
          </div>
        </router-link>

        <!-- Version -->
        <div class="mt-auto pt-6 border-t text-center" style="color: rgba(255,237,198,0.4); border-color: rgba(200,148,40,0.15);">
          <p class="text-xs">v0.0.0 · 認知訓練平台</p>
        </div>
      </div>
    </div>
  </transition>
  </template>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProfileStore } from '../stores/profileStore'

const isOpen = ref(false)
const route = useRoute()
const profileStore = useProfileStore()

// Hide during active gameplay — those screens have their own "← 離開" button
const showNav = computed(() =>
  !route.path.startsWith('/game/') && !route.path.startsWith('/multiplayer/room')
)
</script>

<style scoped>
.sidebar-fade-enter-active,
.sidebar-fade-leave-active {
  transition: opacity 0.3s ease;
}
.sidebar-fade-enter-from,
.sidebar-fade-leave-to {
  opacity: 0;
}

.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: transform 0.3s ease;
}
.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  transform: translateX(100%);
}
</style>
