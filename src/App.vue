<template>
  <div class="h-screen w-full bg-[#1e1e1e] overflow-hidden flex flex-col font-['Outfit',_'Noto_Sans_TC']">
    
    <!-- Top AI Indicator (Fixed at top) -->
    <div v-if="$route.path === '/'" class="fixed top-6 right-8 z-50 bg-green-500/20 text-green-500 text-sm font-semibold px-4 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md border border-green-500/30">
      <span class="relative flex h-2.5 w-2.5">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
      </span>
      AI 數據監控中
    </div>

    <!-- Main Content Area (Tablet Layout) -->
    <main class="flex-1 overflow-hidden relative">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Navigation Bar (Tablet / Desktop optimized) -->
    <nav class="h-[90px] bg-white/95 backdrop-blur-md border-t border-gray-200 flex justify-center items-center gap-16 px-10 pb-safe z-40 relative">
        <router-link to="/" class="nav-btn" active-class="active-nav">
          <svg class="w-6 h-6 mb-1 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span class="text-[11px] font-medium tracking-wide">長者遊戲</span>
        </router-link>
        <router-link to="/dashboard" class="nav-btn" active-class="active-nav">
          <svg class="w-6 h-6 mb-1 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          <span class="text-[11px] font-medium tracking-wide">家屬報表</span>
        </router-link>
      </nav>
  </div>
</template>

<style scoped>
@reference "./style.css";

.nav-btn {
  @apply flex flex-col items-center text-gray-400 transition-colors duration-300;
}
.active-nav {
  color: var(--primary);
}
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Page Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
