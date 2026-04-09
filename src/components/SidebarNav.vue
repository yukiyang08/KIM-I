<template>
  <!-- Hamburger Button -->
  <button
    @click="isOpen = !isOpen"
    class="fixed top-4 right-4 z-[100] w-12 h-12 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 group"
    style="background: linear-gradient(135deg, rgba(200,150,30,0.8), rgba(139,96,0,0.8)); 
            border: 2px solid rgba(200,150,30,0.4);
            border-radius: 12px;
            backdrop-filter: blur(12px);
            box-shadow: 0 8px 32px rgba(200,150,30,0.2);">
    <span :class="[
      'w-6 h-0.5 rounded-full transition-all duration-300 origin-center',
      isOpen ? 'rotate-45 translate-y-2 bg-white' : 'bg-white group-hover:bg-yellow-200'
    ]"></span>
    <span :class="[
      'w-6 h-0.5 rounded-full transition-all duration-300',
      isOpen ? 'opacity-0' : 'opacity-100 bg-white group-hover:bg-yellow-200'
    ]"></span>
    <span :class="[
      'w-6 h-0.5 rounded-full transition-all duration-300 origin-center',
      isOpen ? '-rotate-45 -translate-y-2 bg-white' : 'bg-white group-hover:bg-yellow-200'
    ]"></span>
  </button>

  <!-- Sidebar Overlay -->
  <transition name="sidebar-fade">
    <div
      v-if="isOpen"
      @click="isOpen = false"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]"
    ></div>
  </transition>

  <!-- Sidebar Menu -->
  <transition name="sidebar-slide">
    <div
      v-if="isOpen"
      class="fixed top-0 right-0 h-full w-64 z-[90] overflow-y-auto"
      style="background: linear-gradient(to bottom, #2A1508, #1E0F06);
              border-left: 2px solid rgba(200,150,30,0.2);
              box-shadow: -20px 0 60px rgba(0,0,0,0.5);">
      
      <!-- Film strip decoration -->
      <div class="h-2 flex" style="background: #140C06;">
        <div v-for="i in 24" :key="i" class="flex-1 my-0.5 mx-px rounded-sm"
             style="background: rgba(0,0,0,0.65);"></div>
      </div>

      <!-- Menu content -->
      <div class="pt-20 px-6 pb-8 space-y-4">
        <!-- Logo section -->
        <div class="text-center mb-8 pb-6 border-b" style="border-color: rgba(200,150,30,0.2);">
          <div class="text-4xl mb-2">🎵</div>
          <h2 class="text-2xl font-black tracking-wider" style="color: #C8961E;">
            金憶KIM-I
          </h2>
        </div>

        <!-- Menu items -->
        <router-link
          to="/"
          class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
          :class="route.path === '/' 
            ? 'bg-gradient-to-r from-yellow-600/30 to-transparent' 
            : 'hover:bg-white/5'"
          @click="isOpen = false"
          :style="{ color: route.path === '/' ? '#C8961E' : 'rgba(255,255,255,0.7)' }">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="font-bold">長者遊戲</span>
        </router-link>

        <router-link
          to="/dashboard"
          class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
          :class="route.path === '/dashboard' 
            ? 'bg-gradient-to-r from-yellow-600/30 to-transparent' 
            : 'hover:bg-white/5'"
          @click="isOpen = false"
          :style="{ color: route.path === '/dashboard' ? '#C8961E' : 'rgba(255,255,255,0.7)' }">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          <span class="font-bold">家屬報表</span>
        </router-link>

        <!-- Version info -->
        <div class="mt-8 pt-6 border-t text-xs px-2 py-4 text-center" style="color: rgba(255,255,255,0.4); border-color: rgba(200,150,30,0.2);">
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
