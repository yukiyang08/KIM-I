<template>
  <!-- Hamburger Button -->
  <button
    @click="isOpen = !isOpen"
    class="fixed top-3 right-3 sm:top-4 sm:right-4 z-[100] w-14 h-14 sm:w-16 sm:h-16 flex flex-col items-center justify-center gap-2 transition-all duration-300 group"
    style="background: linear-gradient(135deg, rgba(242,196,78,0.96), rgba(184,128,12,0.96)); 
            border: 2px solid rgba(255,229,160,0.75);
            border-radius: 14px;
            backdrop-filter: blur(12px);
            box-shadow: 0 12px 34px rgba(200,150,30,0.35), 0 0 0 1px rgba(255,244,209,0.28);">
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
      style="background: rgba(22, 14, 8, 0.24);"
    ></div>
  </transition>

  <!-- Sidebar Menu -->
  <transition name="sidebar-slide">
    <div
      v-if="isOpen"
      class="fixed top-0 right-0 h-full w-[78vw] max-w-[320px] z-[90] overflow-y-auto"
          style="background: linear-gradient(to bottom, #4B2A12, #2E1A0C);
            border-left: 2px solid rgba(242,198,106,0.45);
            box-shadow: -20px 0 60px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,229,170,0.16);">
      
      <!-- Film strip decoration -->
      <div class="h-2 flex" style="background: #140C06;">
        <div v-for="i in 24" :key="i" class="flex-1 my-0.5 mx-px rounded-sm"
             style="background: rgba(0,0,0,0.65);"></div>
      </div>

      <!-- Menu content -->
      <div class="pt-20 px-6 pb-8 space-y-5">

        <!-- Brand text only -->
        <div class="text-center mb-6 pb-6 border-b" style="border-color: rgba(242,198,106,0.25);">
          <h2 class="text-[2.05rem] font-black tracking-[0.08em]" style="color: #E9C37A; text-shadow: 0 2px 12px rgba(0,0,0,0.35);">
            金憶 KIM-I
          </h2>
        </div>

        <!-- Menu items -->
        <router-link
          to="/"
          class="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200"
          :class="route.path === '/' 
            ? 'bg-gradient-to-r from-amber-300/35 to-transparent' 
            : 'hover:bg-white/10'"
          @click="isOpen = false"
          :style="{ color: route.path === '/' ? '#F7D58A' : 'rgba(255,244,220,0.88)' }">
          <svg class="w-7 h-7 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="text-[1.65rem] leading-none font-black tracking-[0.02em]">遊戲大廳</span>
        </router-link>

        <router-link
          to="/dashboard"
          class="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200"
          :class="route.path === '/dashboard' 
            ? 'bg-gradient-to-r from-amber-300/35 to-transparent' 
            : 'hover:bg-white/10'"
          @click="isOpen = false"
          :style="{ color: route.path === '/dashboard' ? '#F7D58A' : 'rgba(255,244,220,0.88)' }">
          <svg class="w-7 h-7 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          <span class="text-[1.65rem] leading-none font-black tracking-[0.02em]">數據報表</span>
        </router-link>

        <!-- Version info -->
        <div class="mt-8 pt-6 border-t text-xs px-2 py-4 text-center" style="color: rgba(255,237,198,0.68); border-color: rgba(242,198,106,0.32);">
          <p class="mb-1">v0.0.0</p>
          <p>認知訓練平台</p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const isOpen = ref(false)
const route = useRoute()
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
