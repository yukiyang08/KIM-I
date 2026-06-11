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
              :disabled="joining"
              class="px-5 py-3 rounded-xl font-bold disabled:opacity-60"
              style="background: linear-gradient(135deg,#D8A42C,#8B6000); color:#2A1808;"
            >
              {{ joining ? '…' : '加入' }}
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
            <option value="battle">線上對戰</option>
            <option value="assist">陪玩模式</option>
          </select>

          <label class="block text-sm mt-4 mb-2" style="color: rgba(255,232,188,0.82);">預設曲目</label>
          <select v-model="track" class="w-full px-4 py-3 rounded-xl text-base outline-none"
                  style="background: rgba(255,245,220,0.95); color:#241305;">
            <option value="music-rhythm2">月亮代表我的心</option>
            <option value="music-rhythm1">愛拚才會贏</option>
            <option value="music-yijianmei">一剪梅</option>
            <option value="music-jiahou">家後</option>
            <option value="music-wowentian">我問天</option>
            <option value="music-citymoon">城裡的月光</option>
          </select>

          <label class="block text-sm mt-4 mb-2" style="color: rgba(255,232,188,0.82);">遊玩時長</label>
          <select v-model="duration" class="w-full px-4 py-3 rounded-xl text-base outline-none"
                  style="background: rgba(255,245,220,0.95); color:#241305;">
            <option value="60">1 分鐘</option>
            <option value="120">2 分鐘</option>
            <option value="all">完整歌曲</option>
          </select>

          <label class="block text-sm mt-4 mb-2" style="color: rgba(255,232,188,0.82);">難度</label>
          <select v-model="difficulty" class="w-full px-4 py-3 rounded-xl text-base outline-none"
                  style="background: rgba(255,245,220,0.95); color:#241305;">
            <option value="easy">初級 🌱</option>
            <option value="normal">中級 ⚙️</option>
            <option value="hard">高級 🔥</option>
          </select>

          <label class="block text-sm mt-4 mb-2" style="color: rgba(255,232,188,0.82);">最多人數</label>
          <select v-model="maxPlayers" class="w-full px-4 py-3 rounded-xl text-base outline-none"
                  style="background: rgba(255,245,220,0.95); color:#241305;">
            <option :value="4">4 人</option>
            <option :value="6">6 人</option>
            <option :value="8">8 人</option>
            <option :value="10">10 人</option>
            <option :value="15">15 人</option>
            <option :value="20">20 人</option>
            <option :value="30">30 人</option>
          </select>

          <button
            @click="createNewRoom"
            :disabled="creating"
            class="mt-5 w-full py-3 rounded-xl text-lg font-black disabled:opacity-60"
            style="background: linear-gradient(135deg,#E4B84D,#A37212); color:#2A1808;"
          >
            {{ creating ? '建立中…' : '建立多人房間' }}
          </button>

          <p v-if="errorText" class="mt-3 text-sm" style="color:#FFB9A5;">{{ errorText }}</p>
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
                  {{ modeLabel(room.mode) }} ・ {{ songLabel(room.track) }} ・ {{ difficultyLabel(room.difficulty) }} ・ {{ durationLabel(room.duration) }} ・ {{ room.players.length }}/{{ room.maxPlayers }} 人
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
import { useRoute, useRouter } from 'vue-router'
import {
  createRoom,
  getOrCreateLocalPlayer,
  joinRoomByCode,
  listRooms,
  updateLocalPlayerName,
} from '../utils/multiplayerRoom'

const router = useRouter()
const route = useRoute()
const storedPlayer = getOrCreateLocalPlayer('玩家')

const playerName = ref(storedPlayer.name)
const joinCode = ref('')
const mode = ref('co-op')
const track = ref('music-rhythm2')
const duration = ref('60')
const difficulty = ref('normal')
const maxPlayers = ref(4)
const errorText = ref('')
const creating = ref(false)
const joining = ref(false)
const rooms = ref([])

let refreshTimer = null

const waitingRooms = computed(() =>
  rooms.value.filter((room) => room.status === 'waiting')
)

const modeLabel = (value) => {
  if (value === 'versus') return '輕競賽'
  if (value === 'assist') return '陪玩'
  if (value === 'battle') return '線上對戰'
  return '合作'
}

const songLabel = (value) => {
  const map = {
    'music-rhythm1': '愛拚才會贏',
    'music-rhythm2': '月亮代表我的心',
    'music-yijianmei': '一剪梅',
    'music-jiahou': '家後',
    'music-wowentian': '我問天',
    'music-citymoon': '城裡的月光',
  }
  return map[value] || '月亮代表我的心'
}

const durationLabel = (value) => {
  if (value === '120') return '2分鐘'
  if (value === 'all') return '完整'
  return '1分鐘'
}

const difficultyLabel = (value) => {
  if (value === 'easy') return '初級'
  if (value === 'hard') return '高級'
  return '中級'
}

const refreshRooms = async () => {
  rooms.value = await listRooms()
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

const createNewRoom = async () => {
  const player = ensureName()
  if (!player) return
  if (creating.value) return
  creating.value = true
  try {
    const result = await createRoom({
      hostName: player.name,
      mode: mode.value,
      track: track.value,
      duration: duration.value,
      difficulty: difficulty.value,
      maxPlayers: maxPlayers.value,
    })
    if (result.error) { errorText.value = result.error; return }
    router.push({ name: 'multiplayer-room', params: { roomId: result.room.id } })
  } catch (err) {
    errorText.value = `建立失敗：${err?.message || '網路錯誤，請重試。'}`
  } finally {
    creating.value = false
  }
}

const joinRoom = async () => {
  const player = ensureName()
  if (!player) return
  if (joining.value) return
  joining.value = true
  try {
    const result = await joinRoomByCode({
      code: joinCode.value,
      playerName: player.name,
    })
    if (result.error) { errorText.value = result.error; return }
    errorText.value = ''
    router.push({ name: 'multiplayer-room', params: { roomId: result.room.id } })
  } catch (err) {
    errorText.value = `加入失敗：${err?.message || '網路錯誤，請重試。'}`
  } finally {
    joining.value = false
  }
}

const quickJoin = async (code) => {
  joinCode.value = code
  await joinRoom()
}

onMounted(() => {
  refreshRooms()
  refreshTimer = setInterval(refreshRooms, 5000)

  // Arrived via invite QR code / link: pre-fill the room code and join.
  const inviteCode = String(route.query.code || '').trim().toUpperCase()
  if (inviteCode.length === 6) {
    joinCode.value = inviteCode
    if ((playerName.value || '').trim() && playerName.value !== '玩家') {
      joinRoom()
    } else {
      errorText.value = '輸入你的暱稱後，按「加入」就能進入房間。'
    }
  }
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>
