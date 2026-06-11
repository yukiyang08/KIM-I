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
              {{ modeLabel(room.mode) }} ・ {{ songLabel(room.track) }} ・ {{ durationLabel(room.duration) }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <div class="text-sm px-3 py-1.5 rounded-lg font-bold"
                 :style="statusPillStyle(room.status)">
              {{ statusLabel(room.status) }}
            </div>
            <button
              @click="leaveCurrentRoom"
              class="text-sm font-bold px-3 py-1.5 rounded-lg"
              style="background: rgba(105,45,25,0.62); color:#FFD7C6;"
            >
              離開房間
            </button>
          </div>
        </div>
      </header>

      <!-- Playing: live progress panel -->
      <section v-if="room.status === 'playing'" class="rounded-2xl p-5 border"
               style="border-color: rgba(96,190,112,0.3); background: rgba(14,28,16,0.75);">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-2.5 h-2.5 rounded-full" style="background:#6ABE50; box-shadow:0 0 8px rgba(100,190,80,0.7); animation: pulse 1.4s ease-in-out infinite;"></div>
          <h2 class="text-xl font-black" style="color:#D0FFD8;">遊戲進行中</h2>
          <span class="text-sm ml-auto" style="color: rgba(180,240,190,0.55);">已進行 {{ elapsedText }}</span>
          <button
            @click="leaveCurrentRoom"
            class="text-xs font-bold px-2.5 py-1.5 rounded-lg shrink-0"
            style="background: rgba(105,45,25,0.55); color:#FFD7C6;"
          >
            離開
          </button>
        </div>

        <div class="grid gap-2">
          <div v-for="player in sortedPlayers" :key="player.id"
               class="px-4 py-3 rounded-xl flex items-center justify-between gap-3"
               :style="Number.isFinite(player.score)
                 ? 'background: rgba(40,72,38,0.5); border: 1px solid rgba(100,190,80,0.22);'
                 : 'background: rgba(30,20,8,0.45); border: 1px solid rgba(200,148,40,0.12);'">
            <div class="font-bold text-sm truncate" style="color:#FFE8BA;">
              {{ player.name }}
              <span v-if="player.id === room.hostId" class="text-xs ml-1.5 opacity-60">房主</span>
              <span v-if="player.id === currentPlayer.id" class="text-xs ml-1.5" style="color:rgba(208,255,216,0.7);">（你）</span>
            </div>
            <div v-if="Number.isFinite(player.score)" class="font-black text-base shrink-0"
                 style="color:#D0FFD8;">{{ player.score }} 分 ✓</div>
            <div v-else class="text-xs font-semibold shrink-0 flex items-center gap-1.5"
                 style="color: rgba(255,220,150,0.55);">
              <span class="inline-block w-1.5 h-1.5 rounded-full" style="background:currentColor; opacity:0.7; animation:pulse 1s ease-in-out infinite;"></span>
              遊戲中
            </div>
          </div>
        </div>
      </section>

      <!-- Waiting: player list with ready status -->
      <section v-if="room.status !== 'playing'" class="rounded-2xl p-5 border"
               style="border-color: rgba(236,196,122,0.2); background: rgba(24,14,8,0.72);">
        <div class="flex items-center justify-between gap-3 mb-4">
          <h2 class="text-xl font-black" style="color:#F2CF86;">玩家名單</h2>
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

      <!-- Room settings (waiting state only) -->
      <section v-if="room.status === 'waiting'" class="rounded-2xl p-5 border"
               style="border-color: rgba(236,196,122,0.2); background: rgba(24,14,8,0.72);">
        <h2 class="text-xl font-black mb-3" style="color:#F2CF86;">房間設定</h2>

        <div class="grid gap-4 sm:grid-cols-3">
          <div>
            <label class="block text-sm mb-2" style="color: rgba(255,232,188,0.82);">模式</label>
            <select
              :value="room.mode"
              :disabled="!isHost"
              @change="onModeChange"
              class="w-full px-4 py-3 rounded-xl text-base outline-none disabled:opacity-50"
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
              :disabled="!isHost"
              @change="onTrackChange"
              class="w-full px-4 py-3 rounded-xl text-base outline-none disabled:opacity-50"
              style="background: rgba(255,245,220,0.95); color:#241305;"
            >
              <option value="music-rhythm2">月亮代表我的心</option>
              <option value="music-rhythm1">愛拚才會贏</option>
              <option value="music-yijianmei">一剪梅</option>
              <option value="music-jiahou">家後</option>
              <option value="music-wowentian">我問天</option>
              <option value="music-citymoon">城裡的月光</option>
            </select>
          </div>

          <div>
            <label class="block text-sm mb-2" style="color: rgba(255,232,188,0.82);">時長</label>
            <select
              :value="room.duration || '60'"
              :disabled="!isHost"
              @change="onDurationChange"
              class="w-full px-4 py-3 rounded-xl text-base outline-none disabled:opacity-50"
              style="background: rgba(255,245,220,0.95); color:#241305;"
            >
              <option value="60">1 分鐘</option>
              <option value="120">2 分鐘</option>
              <option value="all">完整歌曲</option>
            </select>
          </div>
        </div>

        <div class="mt-5 flex flex-wrap gap-3">
          <button
            @click="toggleMyReady"
            class="px-5 py-3 rounded-xl text-base font-black"
            :style="myReady ? stopReadyStyle : setReadyStyle"
          >
            {{ myReady ? '取消準備' : '我已準備' }}
          </button>

          <button
            v-if="isHost"
            @click="startGame"
            class="px-6 py-3 rounded-xl text-base font-black"
            style="background: linear-gradient(135deg,#E4B84D,#A37212); color:#2A1808;"
          >
            開始多人遊戲
          </button>
        </div>

        <p v-if="errorText" class="mt-3 text-sm" style="color:#FFB9A5;">{{ errorText }}</p>
      </section>

      <!-- Finished: ranking -->
      <section v-if="room.status === 'finished'" class="rounded-2xl p-5 border"
               style="border-color: rgba(236,196,122,0.2); background: rgba(24,14,8,0.72);">
        <h2 class="text-xl font-black mb-4" style="color:#F2CF86;">本局排名</h2>
        <ol class="space-y-2 mb-5">
          <li v-for="(player, index) in ranking" :key="player.id"
              class="px-4 py-3 rounded-xl flex items-center justify-between"
              :style="index === 0
                ? 'background: rgba(200,150,30,0.22); border: 1px solid rgba(220,180,60,0.3);'
                : 'background: rgba(60,36,14,0.52);'">
            <div class="flex items-center gap-3">
              <span class="font-black text-lg w-6 text-center" style="color:rgba(255,220,150,0.6);">{{ index + 1 }}</span>
              <span class="font-bold" style="color:#FFE8BA;">
                {{ player.name }}
                <span v-if="player.id === currentPlayer.id" class="text-xs ml-1.5 opacity-60">（你）</span>
              </span>
              <span v-if="index === 0" class="text-base">🏆</span>
            </div>
            <span class="font-black text-lg tabular-nums" style="color:#F0C040;">
              {{ Number.isFinite(player.score) ? player.score : 0 }} 分
            </span>
          </li>
        </ol>

        <div class="flex flex-wrap gap-3">
          <button v-if="isHost" @click="restartRoom"
                  class="px-6 py-3 rounded-xl text-base font-black"
                  style="background: linear-gradient(135deg,#E4B84D,#A37212); color:#2A1808;">
            再來一局
          </button>
          <button @click="leaveCurrentRoom"
                  class="px-6 py-3 rounded-xl text-base font-bold"
                  style="background: rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.14); color:rgba(255,231,186,0.75);">
            離開房間
          </button>
        </div>
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
  subscribeToRoom,
  toggleReady,
  unsubscribeFromRoom,
  updateRoomConfig,
} from '../utils/multiplayerRoom'

const router = useRouter()
const route = useRoute()
const roomId = computed(() => String(route.params.roomId || ''))

const room = ref(null)
const errorText = ref('')
const nowMs = ref(Date.now())
const currentPlayer = getOrCreateLocalPlayer('玩家')

let clockTimer = null

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

const elapsedText = computed(() => {
  if (!room.value?.startedAt) return ''
  const elapsed = Math.floor((nowMs.value - room.value.startedAt) / 1000)
  if (elapsed < 0) return '0 秒'
  const m = Math.floor(elapsed / 60)
  const s = elapsed % 60
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s} 秒`
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
  const map = {
    'music-rhythm1': '愛拚才會贏',
    'music-rhythm2': '月亮代表我的心',
    'music-yijianmei': '一剪梅',
    'music-jiahou': '家後',
    'music-wowentian': '我問天',
    'music-citymoon': '城裡的月光',
  }
  return map[track] || '月亮代表我的心'
}

const durationLabel = (value) => {
  if (value === '120') return '2 分鐘'
  if (value === 'all') return '完整歌曲'
  return '1 分鐘'
}

const applyRoom = (latest) => {
  room.value = latest
  nowMs.value = Date.now()
  if (!latest) return

  const isMember = (latest.players || []).some((player) => player.id === currentPlayer.id)
  if (!isMember) { errorText.value = '你已不在此房間。'; return }

  if (latest.status === 'playing') {
    const me = (latest.players || []).find((p) => p.id === currentPlayer.id)
    if (!me?.finishedAt) {
      router.push({
        name: 'music',
        query: {
          track: latest.track, mp: '1',
          roomId: latest.id, playerId: currentPlayer.id,
          duration: latest.duration || '60',
        },
      })
    }
  }
}

const refreshRoom = async () => {
  applyRoom(await getRoom(roomId.value))
}

const onTrackChange = async (event) => {
  await updateRoomConfig(roomId.value, { track: event.target.value })
}

const onModeChange = async (event) => {
  await updateRoomConfig(roomId.value, { mode: event.target.value })
}

const onDurationChange = async (event) => {
  await updateRoomConfig(roomId.value, { duration: event.target.value })
}

const toggleMyReady = async () => {
  if (!room.value || room.value.status !== 'waiting') return
  await toggleReady(room.value.id, currentPlayer.id, !myReady.value)
}

const startGame = async () => {
  if (!room.value) return
  const result = await startRoomGame(room.value.id, currentPlayer.id)
  if (result?.error) { errorText.value = result.error; return }
  errorText.value = ''
}

const restartRoom = async () => {
  if (!room.value) return
  await resetRoomToWaiting(room.value.id, currentPlayer.id)
}

const leaveCurrentRoom = async () => {
  await leaveRoom(roomId.value, currentPlayer.id)
  router.push({ name: 'multiplayer-lobby' })
}

onMounted(async () => {
  await refreshRoom()
  subscribeToRoom(roomId.value, applyRoom)
  clockTimer = setInterval(() => { nowMs.value = Date.now() }, 1000)
})

onUnmounted(() => {
  unsubscribeFromRoom(roomId.value)
  if (clockTimer) clearInterval(clockTimer)
})
</script>

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
