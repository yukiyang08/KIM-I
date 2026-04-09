<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    style="background: rgba(14,10,6,0.52); backdrop-filter: blur(5px);"
  >
    <div
      class="song-panel relative w-full max-w-[860px] rounded-[28px] px-5 sm:px-8 pt-7 sm:pt-9 pb-7 sm:pb-9"
      role="dialog"
      aria-modal="true"
      aria-label="選擇歌曲"
      style="animation: slideUp 0.28s ease;"
    >
      <button
        @click="cancel"
        class="absolute right-3 top-3 sm:right-4 sm:top-4 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-3xl font-black leading-none transition-transform active:scale-95"
        style="color:#7A4E22; background:rgba(209,184,136,0.55); border:1px solid rgba(131,95,46,0.35);"
      >
        ×
      </button>

      <h2 class="text-center song-title mb-6 sm:mb-7">選擇歌曲</h2>

      <div class="song-list space-y-4 sm:space-y-5 px-1 sm:px-2 overflow-y-auto pr-2">
        <button
          v-for="song in themedSongs"
          :key="song.id"
          class="song-row"
          :style="{ background: song.cardBg }"
          @click="confirm(song)"
        >
          <div
            class="w-20 h-20 sm:w-24 sm:h-24 rounded-[12px] shrink-0"
            :style="song.poster
              ? {
                  backgroundImage: `url('${song.poster}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '2px solid rgba(255,255,255,0.35)'
                }
              : {
                  background: 'linear-gradient(145deg, #2b2017, #1b130d)',
                  border: '2px solid rgba(255,255,255,0.25)'
                }"
          ></div>

          <div class="flex-1 text-left min-w-0">
            <p class="song-name truncate">{{ song.name }}</p>
            <p class="song-meta mt-1">{{ song.meta }}</p>
          </div>

          <div class="song-play">▶</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  songs: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['confirm', 'cancel'])

const rowThemes = [
  'linear-gradient(145deg, #8D3F3F, #6E2E2E)',
  'linear-gradient(145deg, #35669A, #204A79)',
  'linear-gradient(145deg, #2F7054, #1E4E3A)',
]

const themedSongs = computed(() =>
  props.songs.map((song, index) => ({
    ...song,
    cardBg: rowThemes[index % rowThemes.length],
  }))
)

const confirm = (song) => {
  emit('confirm', song)
}

const cancel = () => {
  emit('cancel')
}
</script>

<style scoped>
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(28px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.song-panel {
  background: linear-gradient(180deg, #f2e4c8 0%, #ecdab7 100%);
  border: 3px solid #8b6436;
  box-shadow:
    inset 0 0 0 2px rgba(250, 238, 208, 0.75),
    0 14px 40px rgba(0, 0, 0, 0.35);
}

.song-title {
  font-family: 'Noto Serif TC', 'PMingLiU', serif;
  font-weight: 900;
  font-size: clamp(2.2rem, 5vw, 3.5rem);
  line-height: 1.08;
  letter-spacing: 0.08em;
  color: #3a2310;
}

.song-row {
  width: 100%;
  border-radius: 20px;
  min-height: 110px;
  padding: 0.85rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.95rem;
  border: 3px solid rgba(77, 56, 30, 0.2);
  box-shadow: 0 6px 0 rgba(54, 39, 20, 0.35), 0 10px 20px rgba(0, 0, 0, 0.12);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.song-list {
  max-height: calc(110px * 3 + 20px * 2 + 4px);
}

.song-row:active {
  transform: translateY(2px);
  box-shadow: 0 3px 0 rgba(54, 39, 20, 0.35), 0 6px 12px rgba(0, 0, 0, 0.12);
}

.song-name {
  font-family: 'Noto Serif TC', 'PMingLiU', serif;
  font-size: clamp(1.6rem, 3.6vw, 2.4rem);
  line-height: 1.05;
  font-weight: 900;
  letter-spacing: 0.02em;
  color: #f5ecd9;
  text-shadow: 0 2px 0 rgba(58, 32, 10, 0.82), 0 4px 10px rgba(0, 0, 0, 0.45);
}

.song-meta {
  font-family: 'Noto Sans TC', sans-serif;
  font-size: clamp(1rem, 2vw, 1.35rem);
  font-weight: 700;
  color: rgba(255, 246, 220, 0.88);
}

.song-play {
  width: 52px;
  height: 52px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #f3e0b5;
  background: rgba(54, 35, 14, 0.4);
  border: 2px solid rgba(240, 204, 120, 0.48);
}

@media (max-width: 640px) {
  .song-list {
    max-height: calc(98px * 3 + 16px * 2 + 4px);
  }

  .song-row {
    min-height: 98px;
    border-radius: 16px;
  }

  .song-play {
    width: 44px;
    height: 44px;
    font-size: 1.2rem;
  }
}
</style>
