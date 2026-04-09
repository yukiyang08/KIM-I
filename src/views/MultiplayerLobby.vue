<template>
  <div class="h-full w-full overflow-y-auto px-4 sm:px-6 md:px-10 py-6 sm:py-8 font-['Outfit','Noto_Sans_TC']"
       style="background: radial-gradient(ellipse at top, #2A180A 0%, #120A04 50%, #090502 100%);">
    <div class="max-w-4xl mx-auto space-y-6">
      <header class="rounded-3xl px-5 sm:px-7 py-6 border"
              style="border-color: rgba(236,196,122,0.25); background: rgba(28,16,8,0.72); backdrop-filter: blur(6px);">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-black tracking-[0.06em]"
            style="color:#F0C785; text-shadow: 0 0 28px rgba(230,170,70,0.2);">
          多人遊戲大廳
        </h1>
        <p class="mt-2 text-sm sm:text-base" style="color: rgba(255,232,188,0.78);">
          先輸入名字，再建立房間或輸入房號加入。
        </p>
      </header>

      <section class="grid gap-4 sm:grid-cols-2">
        <div class="rounded-2xl p-5 border"
             style="border-color: rgba(236,196,122,0.2); background: rgba(24,14,8,0.72);">
          <label class="block text-sm mb-2" style="color: rgba(255,232,188,0.82);">你的暱稱</label>
          <input
            v-model="playerName"
            type="text"
            maxlength="20"
            class="w-full px-4 py-3 rounded-xl text-base outline-none"
            style="background: rgba(255,245,220,0.95); color:#241305;"
            placeholder="例如：王小美"
          />

          <label class="block text-sm mt-4 mb-2" style="color: rgba(255,232,188,0.82);">加入房號</label>
          <div class="flex gap-2">
            <input
              v-model="joinCode"
              type="text"
              maxlength="6"
              class="flex-1 px-4 py-3 rounded-xl text-base tracking-[0.2em] uppercase outline-none"
              style="background: rgba(255,245,220,0.95); color:#241305;"
              placeholder="例如：AB12CD"
            />
            <button
              @click="joinRoom"
              class="px-5 py-3 rounded-xl font-bold"
              style="background: linear-gradient(135deg,#D8A42C,#8B6000); color:#2A1808;"
            >
              加入
            </button>
          </div>

          <p v-if="errorText" class="mt-3 text-sm" style="color:#FFB9A5;">{{ errorText }}</p>
        </div>

        <div class="rounded-2xl p-5 border"
             style="border-color: rgba(236,196,122,0.2); background: rgba(24,14,8,0.72);">
          <h2 class="text-xl font-black mb-3" style="color:#F2CF86;">建立房間</h2>

          <label class="block text-sm mb-2" style="color: rgba(255,232,188,0.82);">模式</label>
          <select v-model="mode" class="w-full px-4 py-3 rounded-xl text-base outline-none"
                  style="background: rgba(255,245,220,0.95); color:#241305;">
            <option value="co-op">合作模式</option>
            <option value="versus">輕競賽模式</option>
            <option value="assist">陪玩模式</option>
          </select>

          <label class="block text-sm mt-4 mb-2" style="color: rgba(255,232,188,0.82);">預設曲目</label>
          <select v-model="track" class="w-full px-4 py-3 rounded-xl text-base outline-none"
                  style="background: rgba(255,245,220,0.95); color:#241305;">
            <option value="music-rhythm2">月亮代表我的心</option>
            <option value="music-rhythm1">愛拚才會贏</option>
          </select>

          <button
            @click="createNewRoom"
            class="mt-5 w-full py-3 rounded-xl text-lg font-black"
            style="background: linear-gradient(135deg,#E4B84D,#A37212); color:#2A1808;"
          >
            建立多人房間
          </button>
        </div>
      </section>

      <section class="rounded-2xl p-5 border"
               style="border-color: rgba(236,196,122,0.2); background: rgba(24,14,8,0.72);">
        <div class="flex items-center justify-between gap-3 mb-3">
          <h2 class="text-xl font-black" style="color:#F2CF86;">可加入房間</h2>
          <button @click="refreshRooms" class="text-sm font-bold px-3 py-1.5 rounded-lg"
                  style="background: rgba(120,85,30,0.5); color:#FFECC2;">重新整理</button>
        </div>

        <div v-if="waitingRooms.length === 0" class="text-sm py-4"
             style="color: rgba(255,232,188,0.7);">
          目前沒有等待中的房間，你可以先建立一間。
        </div>

        <div v-else class="grid gap-3">
          <button
            v-for="room in waitingRooms"
            :key="room.id"
            @click="quickJoin(room.code)"
            class="w-full text-left px-4 py-3 rounded-xl border transition-colors"
            style="border-color: rgba(236,196,122,0.25); background: rgba(56,32,14,0.55); color:#FFE8BA;"
          >
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="font-black tracking-[0.12em]">房號 {{ room.code }}</div>
                <div class="text-sm opacity-80 mt-1">
                  {{ modeLabel(room.mode) }} ・ {{ songLabel(room.track) }} ・ {{ room.players.length }}/{{ room.maxPlayers }} 人
                </div>
              </div>
              <div class="text-sm font-bold px-2.5 py-1 rounded-lg"
                   style="background: rgba(218,164,44,0.28); color:#F8D894;">加入</div>
            </div>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  createRoom,
  getOrCreateLocalPlayer,
  joinRoomByCode,
  listRooms,
  updateLocalPlayerName,
} from '../utils/multiplayerRoom'

const router = useRouter()
const storedPlayer = getOrCreateLocalPlayer('玩家')

const playerName = ref(storedPlayer.name)
const joinCode = ref('')
const mode = ref('co-op')
const track = ref('music-rhythm2')
const errorText = ref('')
const rooms = ref([])

let refreshTimer = null

const waitingRooms = computed(() =>
  rooms.value.filter((room) => room.status === 'waiting')
)

const modeLabel = (value) => {
  if (value === 'versus') return '輕競賽'
  if (value === 'assist') return '陪玩'
  return '合作'
}

const songLabel = (value) => {
  if (value === 'music-rhythm1') return '愛拚才會贏'
  return '月亮代表我的心'
}

const refreshRooms = () => {
  rooms.value = listRooms()
}

const ensureName = () => {
  const normalized = (playerName.value || '').trim()
  if (!normalized) {
    errorText.value = '請先輸入你的暱稱。'
    return null
  }
  errorText.value = ''
  const player = updateLocalPlayerName(normalized)
  playerName.value = player.name
  return player
}

const createNewRoom = () => {
  const player = ensureName()
  if (!player) return

  const { room } = createRoom({
    hostName: player.name,
    mode: mode.value,
    track: track.value,
    maxPlayers: 4,
  })

  router.push({ name: 'multiplayer-room', params: { roomId: room.id } })
}

const joinRoom = () => {
  const player = ensureName()
  if (!player) return

  const result = joinRoomByCode({
    code: joinCode.value,
    playerName: player.name,
  })

  if (result.error) {
    errorText.value = result.error
    return
  }

  errorText.value = ''
  router.push({ name: 'multiplayer-room', params: { roomId: result.room.id } })
}

const quickJoin = (code) => {
  joinCode.value = code
  joinRoom()
}

onMounted(() => {
  refreshRooms()
  refreshTimer = setInterval(refreshRooms, 1200)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>
