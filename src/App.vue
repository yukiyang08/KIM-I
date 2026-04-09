<template>
  <div class="h-screen w-full bg-[#1e1e1e] overflow-hidden flex flex-col font-['Outfit',_'Noto_Sans_TC']">
    
    <!-- Sidebar Navigation -->
    <SidebarNav />

    <!-- Main Content Area (Tablet Layout) -->
    <main class="flex-1 overflow-y-auto overflow-x-hidden relative">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import SidebarNav from './components/SidebarNav.vue'
</script>

<style scoped>
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
