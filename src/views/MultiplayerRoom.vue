<template>
  <div class="h-full w-full overflow-y-auto px-4 sm:px-6 md:px-10 py-6 sm:py-8 font-['Outfit','Noto_Sans_TC']"
       style="background: radial-gradient(ellipse at top, #271709 0%, #100802 52%, #080402 100%);">
    <div class="max-w-4xl mx-auto space-y-5" v-if="room">
      <header class="rounded-3xl px-5 sm:px-7 py-5 border"
              style="border-color: rgba(236,196,122,0.25); background: rgba(28,16,8,0.72); backdrop-filter: blur(6px);">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 class="text-2xl sm:text-3xl md:text-4xl font-black tracking-[0.08em]"
                style="color:#F2CF86;">
              多人房間 {{ room.code }}
            </h1>
            <p class="mt-1 text-sm sm:text-base" style="color: rgba(255,232,188,0.8);">
              {{ modeLabel(room.mode) }} ・ {{ songLabel(room.track) }}
            </p>
          </div>
          <div class="text-sm px-3 py-1.5 rounded-lg font-bold"
               :style="statusPillStyle(room.status)">
            {{ statusLabel(room.status) }}
          </div>
        </div>
      </header>

      <section class="rounded-2xl p-5 border"
               style="border-color: rgba(236,196,122,0.2); background: rgba(24,14,8,0.72);">
        <div class="flex items-center justify-between gap-3 mb-4">
          <h2 class="text-xl font-black" style="color:#F2CF86;">玩家名單</h2>
          <button
            @click="leaveCurrentRoom"
            class="text-sm font-bold px-3 py-1.5 rounded-lg"
            style="background: rgba(105,45,25,0.62); color:#FFD7C6;"
          >
            離開房間
          </button>
        </div>

        <div class="grid gap-3">
          <div
            v-for="player in sortedPlayers"
            :key="player.id"
            class="px-4 py-3 rounded-xl border flex items-center justify-between"
            style="border-color: rgba(236,196,122,0.2); background: rgba(58,34,14,0.45);"
          >
            <div>
              <div class="font-black" style="color:#FFE8BA;">
                {{ player.name }}
                <span v-if="player.id === room.hostId" class="text-xs ml-2 px-2 py-0.5 rounded"
                      style="background: rgba(216,164,44,0.3); color:#F8D894;">房主</span>
                <span v-if="player.id === currentPlayer.id" class="text-xs ml-2 px-2 py-0.5 rounded"
                      style="background: rgba(100,170,120,0.28); color:#D0FFD8;">你</span>
              </div>
              <div class="text-sm mt-1" style="color: rgba(255,232,188,0.76);">
                <template v-if="room.status === 'finished' && Number.isFinite(player.score)">
                  分數：{{ player.score }}
                </template>
                <template v-else>
                  {{ player.ready ? '已準備' : '尚未準備' }}
                </template>
              </div>
            </div>
            <div class="text-sm font-bold px-2.5 py-1 rounded-lg"
                 :style="player.ready ? readyStyle : waitingStyle">
              {{ player.ready ? 'Ready' : 'Waiting' }}
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-2xl p-5 border"
               style="border-color: rgba(236,196,122,0.2); background: rgba(24,14,8,0.72);">
        <h2 class="text-xl font-black mb-3" style="color:#F2CF86;">房間設定</h2>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="block text-sm mb-2" style="color: rgba(255,232,188,0.82);">模式</label>
            <select
              :value="room.mode"
              :disabled="!isHost || room.status !== 'waiting'"
              @change="onModeChange"
              class="w-full px-4 py-3 rounded-xl text-base outline-none disabled:opacity-70"
              style="background: rgba(255,245,220,0.95); color:#241305;"
            >
              <option value="co-op">合作模式</option>
              <option value="versus">輕競賽模式</option>
              <option value="assist">陪玩模式</option>
            </select>
          </div>

          <div>
            <label class="block text-sm mb-2" style="color: rgba(255,232,188,0.82);">曲目</label>
            <select
              :value="room.track"
              :disabled="!isHost || room.status !== 'waiting'"
              @change="onTrackChange"
              class="w-full px-4 py-3 rounded-xl text-base outline-none disabled:opacity-70"
              style="background: rgba(255,245,220,0.95); color:#241305;"
            >
              <option value="music-rhythm2">月亮代表我的心</option>
              <option value="music-rhythm1">愛拚才會贏</option>
            </select>
          </div>
        </div>

        <div class="mt-5 flex flex-wrap gap-3">
          <button
            v-if="room.status === 'waiting'"
            @click="toggleMyReady"
            class="px-5 py-3 rounded-xl text-base font-black"
            :style="myReady ? stopReadyStyle : setReadyStyle"
          >
            {{ myReady ? '取消準備' : '我已準備' }}
          </button>

          <button
            v-if="room.status === 'waiting' && isHost"
            @click="startGame"
            class="px-6 py-3 rounded-xl text-base font-black"
            style="background: linear-gradient(135deg,#E4B84D,#A37212); color:#2A1808;"
          >
            開始多人遊戲
          </button>

          <button
            v-if="room.status === 'finished' && isHost"
            @click="restartRoom"
            class="px-6 py-3 rounded-xl text-base font-black"
            style="background: rgba(222,186,105,0.25); color:#FFE8BA; border:1px solid rgba(236,196,122,0.4);"
          >
            再來一局
          </button>
        </div>

        <p v-if="errorText" class="mt-3 text-sm" style="color:#FFB9A5;">{{ errorText }}</p>
      </section>

      <section v-if="room.status === 'finished'" class="rounded-2xl p-5 border"
               style="border-color: rgba(236,196,122,0.2); background: rgba(24,14,8,0.72);">
        <h2 class="text-xl font-black mb-3" style="color:#F2CF86;">本局排名</h2>
        <ol class="space-y-2">
          <li v-for="(player, index) in ranking" :key="player.id"
              class="px-4 py-3 rounded-xl"
              style="background: rgba(60,36,14,0.52); color:#FFE8BA;">
            {{ index + 1 }}. {{ player.name }} - {{ Number.isFinite(player.score) ? player.score : 0 }} 分
          </li>
        </ol>
      </section>
    </div>

    <div v-else class="max-w-2xl mx-auto mt-20 text-center">
      <h2 class="text-3xl font-black" style="color:#F2CF86;">房間不存在或已關閉</h2>
      <button @click="router.push({ name: 'multiplayer-lobby' })"
              class="mt-6 px-6 py-3 rounded-xl font-black"
              style="background: linear-gradient(135deg,#E4B84D,#A37212); color:#2A1808;">
        回多人大廳
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getOrCreateLocalPlayer,
  getRoom,
  leaveRoom,
  resetRoomToWaiting,
  startRoomGame,
  toggleReady,
  updateRoomConfig,
} from '../utils/multiplayerRoom'

const router = useRouter()
const route = useRoute()
const roomId = computed(() => String(route.params.roomId || ''))

const room = ref(null)
const errorText = ref('')
const currentPlayer = getOrCreateLocalPlayer('玩家')

let syncTimer = null

const readyStyle = { background: 'rgba(96,170,112,0.26)', color: '#D0FFD8' }
const waitingStyle = { background: 'rgba(130,95,40,0.28)', color: '#FFE1A8' }
const setReadyStyle = { background: 'rgba(96,170,112,0.26)', color: '#D0FFD8' }
const stopReadyStyle = { background: 'rgba(156,82,52,0.28)', color: '#FFD7C6' }

const isHost = computed(() => room.value?.hostId === currentPlayer.id)

const myReady = computed(() => {
  const me = (room.value?.players || []).find((player) => player.id === currentPlayer.id)
  return !!me?.ready
})

const sortedPlayers = computed(() => {
  const players = [...(room.value?.players || [])]
  return players.sort((a, b) => {
    if (a.id === room.value?.hostId) return -1
    if (b.id === room.value?.hostId) return 1
    return (a.name || '').localeCompare(b.name || 'zh-Hant')
  })
})

const ranking = computed(() => {
  return [...(room.value?.players || [])].sort((a, b) => {
    const scoreA = Number.isFinite(a.score) ? a.score : -1
    const scoreB = Number.isFinite(b.score) ? b.score : -1
    return scoreB - scoreA
  })
})

const modeLabel = (value) => {
  if (value === 'versus') return '輕競賽模式'
  if (value === 'assist') return '陪玩模式'
  return '合作模式'
}

const statusLabel = (status) => {
  if (status === 'playing') return '進行中'
  if (status === 'finished') return '已結算'
  return '等待中'
}

const statusPillStyle = (status) => {
  if (status === 'playing') return { background: 'rgba(96,170,112,0.25)', color: '#D0FFD8' }
  if (status === 'finished') return { background: 'rgba(116,126,168,0.3)', color: '#D8DFFF' }
  return { background: 'rgba(218,164,44,0.28)', color: '#F8D894' }
}

const songLabel = (track) => {
  if (track === 'music-rhythm1') return '愛拚才會贏'
  return '月亮代表我的心'
}

const refreshRoom = () => {
  const latest = getRoom(roomId.value)
  room.value = latest
  if (!latest) return

  const isMember = (latest.players || []).some((player) => player.id === currentPlayer.id)
  if (!isMember) {
    errorText.value = '你已不在此房間。'
    return
  }

  if (latest.status === 'playing') {
    router.push({
      name: 'music',
      query: {
        track: latest.track,
        mp: '1',
        roomId: latest.id,
        playerId: currentPlayer.id,
      },
    })
  }
}

const onTrackChange = (event) => {
  updateRoomConfig(roomId.value, { track: event.target.value })
  refreshRoom()
}

const onModeChange = (event) => {
  updateRoomConfig(roomId.value, { mode: event.target.value })
  refreshRoom()
}

const toggleMyReady = () => {
  if (!room.value || room.value.status !== 'waiting') return
  toggleReady(room.value.id, currentPlayer.id, !myReady.value)
  refreshRoom()
}

const startGame = () => {
  if (!room.value) return
  const result = startRoomGame(room.value.id, currentPlayer.id)
  if (result?.error) {
    errorText.value = result.error
    return
  }
  errorText.value = ''
  refreshRoom()
}

const restartRoom = () => {
  if (!room.value) return
  resetRoomToWaiting(room.value.id, currentPlayer.id)
  refreshRoom()
}

const leaveCurrentRoom = () => {
  leaveRoom(roomId.value, currentPlayer.id)
  router.push({ name: 'multiplayer-lobby' })
}

onMounted(() => {
  refreshRoom()
  syncTimer = setInterval(refreshRoom, 800)
})

onUnmounted(() => {
  if (syncTimer) clearInterval(syncTimer)
})
</script>
