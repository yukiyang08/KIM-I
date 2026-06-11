<template>
  <template v-if="showNav">

    <!-- ── Circular Seal Button ───────────────────────────── -->
    <button
      @click="isOpen = !isOpen"
      :aria-label="isOpen ? '關閉選單' : '開啟選單'"
      :aria-expanded="isOpen"
      class="seal-btn"
      :class="{ 'seal-btn--open': isOpen }"
    >
      <span v-if="!profileStore.isSetup" class="seal-alert">
        <span class="seal-alert__ring"></span>
      </span>
      <span v-else-if="showNewDot && !isOpen" class="seal-new-dot">
        <span class="seal-new-dot__ring"></span>
      </span>
      <span class="seal-bar seal-bar--a"></span>
      <span class="seal-bar seal-bar--b"></span>
      <span class="seal-bar seal-bar--c"></span>
    </button>

    <!-- ── Backdrop ───────────────────────────────────────── -->
    <transition name="bd">
      <div v-if="isOpen" class="panel-backdrop" @click="isOpen = false"></div>
    </transition>

    <!-- ── Side Panel ─────────────────────────────────────── -->
    <transition name="panel">
      <div v-if="isOpen" class="side-panel" role="dialog" aria-modal="true" aria-label="導覽選單">

        <!-- Decorative left stripe -->
        <div class="panel-spine"></div>

        <div class="panel-body">

          <!-- ── Header ── -->
          <header class="panel-header">
            <div class="cloud-band">
              <span v-for="n in 14" :key="n" class="cloud-puff"></span>
            </div>
            <img src="../assets/KIM-I_LOGO.png" alt="KIM-I" class="brand-logo" />
            <h1 class="brand-name">金憶 KIM-I</h1>
            <p class="brand-tagline">為您的認知健康助力</p>
            <div class="ornament">
              <span class="ornament__line"></span>
              <span class="ornament__gem">◈</span>
              <span class="ornament__line"></span>
            </div>
          </header>

          <!-- ── Profile ── -->
          <router-link
            to="/profile"
            class="nav-item nav-item--profile"
            :class="{ 'nav-item--active': route.path === '/profile', 'nav-item--unset': !profileStore.isSetup }"
            @click="isOpen = false"
          >
            <span class="ni-icon">{{ profileStore.isSetup ? '👵' : '👤' }}</span>
            <div class="ni-body">
              <div class="ni-name">{{ profileStore.isSetup ? (profileStore.name || '個人資料') : '設定個人資料' }}</div>
              <div class="ni-sub">{{ profileStore.isSetup ? (profileStore.eraLabel + '・' + profileStore.regionLabel) : '讓故事變成你自己的' }}</div>
            </div>
          </router-link>

          <!-- ── Section: 遊戲 ── -->
          <div class="section-label">遊　戲</div>

          <router-link to="/" class="nav-item" :class="{ 'nav-item--active': route.path === '/' }" @click="isOpen = false">
            <span class="ni-icon">🎮</span>
            <span class="ni-name">遊戲大廳</span>
          </router-link>

          <router-link to="/multiplayer" class="nav-item" :class="{ 'nav-item--active': route.path.startsWith('/multiplayer') }" @click="isOpen = false">
            <span class="ni-icon">👥</span>
            <span class="ni-name">多人模式</span>
          </router-link>

          <router-link to="/outdoor" class="nav-item" :class="{ 'nav-item--active': route.path === '/outdoor' }" @click="isOpen = false">
            <span class="ni-icon">🗺️</span>
            <span class="ni-name">金憶街區</span>
          </router-link>

          <!-- ── Section: 報表 ── -->
          <div class="section-label">報　表</div>

          <router-link to="/dashboard/family" class="nav-item" :class="{ 'nav-item--active': route.path === '/dashboard/family' }" @click="isOpen = false">
            <span class="ni-icon">🏆</span>
            <div class="ni-body">
              <div class="ni-name">我的成就</div>
              <div class="ni-sub">查看您的腦力狀態</div>
            </div>
          </router-link>

          <router-link to="/dashboard" class="nav-item" :class="{ 'nav-item--active': route.path === '/dashboard' }" @click="isOpen = false">
            <span class="ni-icon">🏥</span>
            <div class="ni-body">
              <div class="ni-name">照顧單位報表</div>
              <div class="ni-sub">日照中心、照顧機構使用</div>
            </div>
          </router-link>

          <!-- ── Auth ── -->
          <div class="auth-section">
            <template v-if="profileStore.isLoggedIn">
              <div class="auth-row">
                <div class="auth-info">
                  <div class="auth-label">已登入</div>
                  <div class="auth-email">{{ profileStore.authUser?.email }}</div>
                </div>
                <button @click="handleLogout" class="btn-logout">登出</button>
              </div>
            </template>
            <button v-else @click="showAuth = true; isOpen = false" class="btn-login">
              🔑&ensp;登入 / 建立帳號
            </button>
          </div>

          <footer class="panel-footer">v0.0.0 · 認知訓練平台</footer>
        </div>
      </div>
    </transition>

  </template>

  <AuthModal v-model="showAuth" />
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useProfileStore } from '../stores/profileStore'
import AuthModal from './AuthModal.vue'

const isOpen      = ref(false)
const showAuth    = ref(false)
const showNewDot  = ref(!localStorage.getItem('kim-i-menu-seen'))
const route       = useRoute()
const profileStore = useProfileStore()

const handleLogout = async () => {
  await profileStore.logout()
  isOpen.value = false
}

const handleKeydown = (e) => {
  if (e.key === 'Escape' && isOpen.value) isOpen.value = false
}

watch(isOpen, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
  if (val && showNewDot.value) {
    showNewDot.value = false
    localStorage.setItem('kim-i-menu-seen', '1')
  }
})

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})

const showNav = computed(() =>
  !route.path.startsWith('/game/') &&
  !route.path.startsWith('/multiplayer/room') &&
  !route.path.startsWith('/dashboard')
)
</script>

<style scoped>
/* ──────────────────────────────────────────────────────────
   SEAL BUTTON
────────────────────────────────────────────────────────── */
.seal-btn {
  position: fixed;
  top: 14px;
  right: 14px;
  z-index: 100;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2.5px solid rgba(255, 230, 130, 0.52);
  background:
    radial-gradient(ellipse at 38% 32%, rgba(255,248,200,0.18) 0%, transparent 55%),
    conic-gradient(from 150deg, #F0C040, #D49018, #F4CA50, #C88018, #F0C040);
  box-shadow:
    0 0 0 4px rgba(200,140,20,0.14),
    0 8px 24px rgba(0,0,0,0.52),
    inset 0 2px 5px rgba(255,255,180,0.22);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0;
  cursor: pointer;
  outline: none;
  transition:
    transform  0.38s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.3s ease,
    background 0.35s ease;
}

/* Inner decorative ring */
.seal-btn::before {
  content: '';
  position: absolute;
  inset: 6px;
  border-radius: 50%;
  border: 1px solid rgba(255, 250, 210, 0.22);
  pointer-events: none;
  transition: border-color 0.35s;
}

.seal-btn:hover  { transform: scale(1.1) rotate(6deg); }
.seal-btn:active { transform: scale(0.94); transition-duration: 0.12s; }

.seal-btn--open {
  background: radial-gradient(circle at 40% 38%, #4A2E0A 0%, #1C1004 100%);
  border-color: rgba(200, 148, 40, 0.45);
  box-shadow:
    0 0 0 4px rgba(200, 148, 40, 0.2),
    0 8px 24px rgba(0,0,0,0.62);
}
.seal-btn--open::before { border-color: rgba(200, 148, 40, 0.28); }

@media (min-width: 640px) {
  .seal-btn { width: 62px; height: 62px; top: 16px; right: 16px; }
}

/* ── Alert badge ── */
.seal-alert {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #E84040;
  color: #fff;
  font-size: 10px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
}
.seal-alert__ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: #E84040;
  animation: badge-ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
}
@keyframes badge-ping {
  0%   { transform: scale(1);   opacity: 0.8; }
  75%, 100% { transform: scale(2.3); opacity: 0; }
}

/* ── New-user dot (first-visit only) ── */
.seal-new-dot {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #E84040;
  border: 2px solid rgba(30,12,2,0.8);
}
.seal-new-dot__ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: #E84040;
  animation: badge-ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* ── Bars (hamburger → X) ── */
.seal-bar {
  display: block;
  width: 22px;
  height: 2.5px;
  border-radius: 3px;
  background: #2A1605;
  transition: transform 0.36s cubic-bezier(0.4, 0, 0.2, 1),
              opacity   0.28s ease,
              background 0.35s ease,
              width      0.3s ease;
  transform-origin: center;
  position: relative;
}

.seal-btn--open .seal-bar { background: #F2C94C; }
.seal-btn--open .seal-bar--a { transform: translateY(8.5px) rotate(45deg);  width: 24px; }
.seal-btn--open .seal-bar--b { opacity: 0; transform: scaleX(0); }
.seal-btn--open .seal-bar--c { transform: translateY(-8.5px) rotate(-45deg); width: 24px; }


/* ──────────────────────────────────────────────────────────
   BACKDROP
────────────────────────────────────────────────────────── */
.panel-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(3px);
}
.bd-enter-active { transition: opacity 0.3s ease; }
.bd-leave-active { transition: opacity 0.22s ease; }
.bd-enter-from, .bd-leave-to { opacity: 0; }


/* ──────────────────────────────────────────────────────────
   SIDE PANEL
────────────────────────────────────────────────────────── */
.side-panel {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 90;
  width: 78vw;
  max-width: 320px;
  height: 100%;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  background: linear-gradient(175deg, #2E2010 0%, #221808 50%, #1A1205 100%);
  border-left: 1px solid rgba(200, 148, 40, 0.22);
  box-shadow: -12px 0 60px rgba(0,0,0,0.65), -1px 0 0 rgba(200,148,40,0.12);
  will-change: transform;
}

/* Panel open / close animation */
.panel-enter-active { transition: transform 0.38s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease; }
.panel-leave-active { transition: transform 0.28s cubic-bezier(0.4, 0, 1, 1),  opacity 0.22s ease; }
.panel-enter-from, .panel-leave-to { transform: translateX(100%); opacity: 0.6; }

/* ── Left spine stripe ── */
.panel-spine {
  width: 5px;
  flex-shrink: 0;
  background: linear-gradient(180deg,
    #C8861A 0%,
    #F2C94C 20%,
    #C8861A 45%,
    #8B5E10 70%,
    #C8861A 85%,
    #F2C94C 100%
  );
  box-shadow: 2px 0 12px rgba(200, 140, 20, 0.25);
}

/* ── Scrollable body ── */
.panel-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 0;
  scrollbar-width: none;
}
.panel-body::-webkit-scrollbar { display: none; }


/* ──────────────────────────────────────────────────────────
   HEADER
────────────────────────────────────────────────────────── */
.panel-header {
  padding: 0 0 20px;
  text-align: center;
  flex-shrink: 0;
}

/* Cloud band at very top */
.cloud-band {
  display: flex;
  height: 18px;
  background: #1E1508;
  overflow: hidden;
  margin-bottom: 0;
}
.cloud-puff {
  flex: 1;
  margin: 3px 2px;
  border-radius: 50%;
  background: rgba(200, 148, 40, 0.12);
  box-shadow: 0 0 4px rgba(200, 148, 40, 0.08);
}
.cloud-puff:nth-child(even) {
  background: rgba(200, 148, 40, 0.07);
  transform: translateY(2px) scaleX(0.8);
}

/* Reserve space for button at top-right */
.brand-logo {
  width: 96px;
  height: 40px;
  object-fit: contain;
  transform: rotate(90deg);
  margin: 42px auto 30px;
  display: block;
  filter: drop-shadow(0 2px 8px rgba(200,140,20,0.3));
}

.brand-name {
  font-family: 'Noto Serif TC', 'Noto Sans TC', serif;
  font-size: 1.55rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  color: #F2CF86;
  text-shadow: 0 2px 16px rgba(200,140,20,0.4);
  margin: 0 0 4px;
}

.brand-tagline {
  font-family: 'Noto Sans TC', sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  color: rgba(242, 215, 150, 0.42);
  margin: 0 0 16px;
}

/* Ornament divider */
.ornament {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 24px;
}
.ornament__line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(200,148,40,0.35), transparent);
  border: none;
}
.ornament__gem {
  font-size: 0.6rem;
  color: rgba(200, 148, 40, 0.55);
  flex-shrink: 0;
}


/* ──────────────────────────────────────────────────────────
   SECTION LABELS
────────────────────────────────────────────────────────── */
.section-label {
  font-family: 'Noto Serif TC', serif;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  color: rgba(200, 148, 40, 0.45);
  padding: 14px 20px 6px;
}


/* ──────────────────────────────────────────────────────────
   NAV ITEMS
────────────────────────────────────────────────────────── */
.nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px 14px 20px;
  margin: 2px 12px 2px 0;
  border-radius: 0 16px 16px 0;
  text-decoration: none;
  border-left: 3px solid transparent;
  transition:
    background 0.22s ease,
    border-color 0.22s ease,
    transform 0.2s ease;
  position: relative;
  min-height: 58px;
}
.nav-item:hover {
  background: rgba(200, 148, 40, 0.07);
  transform: translateX(2px);
}
.nav-item:active { transform: scale(0.98) translateX(2px); }

/* Active state */
.nav-item--active {
  background: rgba(200, 148, 40, 0.13);
  border-left-color: #C8961E;
  box-shadow: inset 0 0 20px rgba(200,140,20,0.08);
}
.nav-item--active .ni-name { color: #F2CF86 !important; }

/* Profile alert state */
.nav-item--unset {
  background: rgba(200, 148, 40, 0.1);
  border-left-color: rgba(200, 148, 40, 0.5);
}

/* Icon */
.ni-icon {
  font-size: 1.35rem;
  line-height: 1;
  flex-shrink: 0;
  width: 32px;
  text-align: center;
  filter: drop-shadow(0 1px 3px rgba(0,0,0,0.5));
}

/* Text block */
.ni-body { flex: 1; min-width: 0; }

.ni-name {
  font-family: 'Noto Sans TC', 'Outfit', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: rgba(242, 228, 184, 0.95);
  line-height: 1.3;
  transition: color 0.22s;
}

.ni-sub {
  font-family: 'Noto Sans TC', sans-serif;
  font-size: 0.7rem;
  color: rgba(242, 215, 150, 0.52);
  margin-top: 2px;
  line-height: 1.3;
}

/* Badge */
.ni-badge {
  font-size: 0.7rem;
  font-weight: 900;
  color: #C8961E;
  flex-shrink: 0;
  font-family: 'Outfit', sans-serif;
}

/* Profile item icon is slightly larger */
.nav-item--profile .ni-icon { font-size: 1.5rem; }


/* ──────────────────────────────────────────────────────────
   AUTH SECTION
────────────────────────────────────────────────────────── */
.auth-section {
  margin-top: auto;
  padding: 20px 14px 6px;
  border-top: 1px solid rgba(200, 148, 40, 0.12);
}

.auth-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(200, 148, 40, 0.14);
  gap: 12px;
}

.auth-info { min-width: 0; flex: 1; }

.auth-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: rgba(242, 228, 184, 0.65);
  font-family: 'Noto Sans TC', sans-serif;
}

.auth-email {
  font-size: 0.68rem;
  color: rgba(242, 215, 150, 0.35);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
  font-family: 'Outfit', monospace;
}

.btn-logout {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 10px;
  background: rgba(255, 80, 60, 0.1);
  border: 1px solid rgba(255, 80, 60, 0.22);
  color: rgba(255, 130, 100, 0.85);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  font-family: 'Noto Sans TC', sans-serif;
}
.btn-logout:hover  { background: rgba(255, 80, 60, 0.18); }
.btn-logout:active { transform: scale(0.95); }

.btn-login {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border-radius: 14px;
  background: rgba(200, 148, 40, 0.09);
  border: 1px solid rgba(200, 148, 40, 0.3);
  color: #C8961E;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.22s ease;
  font-family: 'Noto Sans TC', sans-serif;
}
.btn-login:hover  { background: rgba(200, 148, 40, 0.15); transform: translateY(-1px); }
.btn-login:active { transform: scale(0.98); }


/* ──────────────────────────────────────────────────────────
   FOOTER
────────────────────────────────────────────────────────── */
.panel-footer {
  text-align: center;
  font-size: 0.65rem;
  color: rgba(242, 220, 170, 0.28);
  padding: 12px 0 20px;
  font-family: 'Outfit', monospace;
  letter-spacing: 0.06em;
}


/* ──────────────────────────────────────────────────────────
   STAGGER ANIMATION — items cascade in as panel opens
────────────────────────────────────────────────────────── */
@keyframes item-appear {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}

.panel-body > * {
  animation: item-appear 0.48s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}
.panel-body > *:nth-child(1)  { animation-delay: 0.06s; }
.panel-body > *:nth-child(2)  { animation-delay: 0.11s; }
.panel-body > *:nth-child(3)  { animation-delay: 0.16s; }
.panel-body > *:nth-child(4)  { animation-delay: 0.21s; }
.panel-body > *:nth-child(5)  { animation-delay: 0.26s; }
.panel-body > *:nth-child(6)  { animation-delay: 0.30s; }
.panel-body > *:nth-child(7)  { animation-delay: 0.34s; }
.panel-body > *:nth-child(8)  { animation-delay: 0.38s; }
.panel-body > *:nth-child(9)  { animation-delay: 0.41s; }
.panel-body > *:nth-child(10) { animation-delay: 0.44s; }
.panel-body > *:nth-child(11) { animation-delay: 0.47s; }
</style>
