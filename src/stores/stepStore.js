import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { getTodaySteps, getStepHistory, startStepCounter, stopStepCounter, requestMotionPermission } from '../utils/stepCounter'

// 景點實景照片（Wikimedia Commons）
import photoPark   from '../assets/spots/park.jpg'
import photoStore  from '../assets/spots/store.jpg'
import photoCamera from '../assets/spots/camera.jpg'
import photoMarket from '../assets/spots/market.jpg'
import photoStage  from '../assets/spots/stage.jpg'
import photoTemple from '../assets/spots/temple.jpg'

// ============================================================
// 走路打卡系統 — 狀態機
//
//   locked ──(steps>0)──▶ in_progress ──(步數達標/GPS到達)──▶ arrived(可打卡)
//        ──(長輩按「打卡」+完成現場挑戰)──▶ unlocked(建築點亮) ──(玩過遊戲)──▶ completed
//
// - 打卡(checkedIn) / completed 會持久化（localStorage），不會因步數重設而退回
// - 「到達」只是條件達成；要長輩親手打卡才解鎖 — 打卡本身就是體驗
// ============================================================

export const DAILY_GOAL = 8000

// 使用者目前位置（文山區木新路一帶，demo 固定點）
export const USER_POSITION = { lat: 24.9889, lng: 121.5681 }

// 文山區社區懷舊地圖：沿散步路線由近到遠排列
export const LOCATIONS = [
  {
    id: 'park',
    name: '木柵公園',
    emoji: '🌳',
    requiredSteps: 500,
    streakRequired: 0,
    story: '清晨的木柵公園，老朋友們已經在涼亭擺好棋盤。樹蔭下有人打太極、有人泡茶開講，這裡是社區一天的開始……',
    storyTitle: '涼亭棋局',
    game: 'riddle',
    gameName: '謎語遊戲',
    color: '#5B8C3E',
    x: 20, y: 46,
    lat: 24.9941, lng: 121.5650,
    distance: '120m', walkMin: 2,
    desc: '綠意盎然的公園，適合散步放鬆',
    photo: photoPark,
  },
  {
    id: 'store',
    name: '柑仔店',
    emoji: '🏪',
    requiredSteps: 1500,
    streakRequired: 0,
    story: '巷口的柑仔店開了五十年，玻璃罐裡的橄欖、王子麵、抽抽樂都還在。老闆娘笑著問：「今仔日欲買啥？」……',
    storyTitle: '柑仔店的味道',
    game: 'shopping',
    gameName: '購物遊戲',
    color: '#C77B3A',
    x: 40, y: 28,
    lat: 24.9928, lng: 121.5598,
    distance: '350m', walkMin: 5,
    desc: '充滿回憶的老柑仔店',
    photo: photoStore,
  },
  {
    id: 'camera',
    name: '懷舊相機館',
    emoji: '📷',
    requiredSteps: 3000,
    streakRequired: 0,
    story: '相機館的櫥窗裡擺著一台老蛇腹相機，跟阿公結婚照用的那台一模一樣。老照片一張張排開，黑白的街景慢慢有了顏色……',
    storyTitle: '老照片的故事',
    game: 'puzzle',
    gameName: '老照片遊戲',
    color: '#8B5E3C',
    x: 52, y: 58,
    lat: 24.9855, lng: 121.5622,
    distance: '650m', walkMin: 9,
    desc: '老照片裡的文山記憶',
    photo: photoCamera,
  },
  {
    id: 'market',
    name: '景美夜市',
    emoji: '🍢',
    requiredSteps: 4500,
    streakRequired: 0,
    story: '傍晚的景美夜市燈火亮起，蚵仔煎的香味飄過整條街。老闆鏟子翻得鏗鏘響，那是幾十年沒變的聲音……',
    storyTitle: '夜市的香味',
    game: 'cooking',
    gameName: '料理遊戲',
    color: '#C84B31',
    x: 68, y: 40,
    lat: 24.9924, lng: 121.5424,
    distance: '950m', walkMin: 13,
    desc: '美食天堂，文山人的廚房',
    photo: photoMarket,
  },
  {
    id: 'stage',
    name: '河堤音樂台',
    emoji: '🎶',
    requiredSteps: 6000,
    streakRequired: 0,
    story: '河堤旁的音樂台傳來那卡西的旋律，是那首熟悉的〈望春風〉。散步的人們停下腳步，有人輕輕跟著哼……',
    storyTitle: '河堤的歌聲',
    game: 'music',
    gameName: '音樂遊戲',
    color: '#4A6FA5',
    x: 78, y: 64,
    lat: 24.9836, lng: 121.5527,
    distance: '1.0km', walkMin: 15,
    desc: '河畔音樂饗宴',
    photo: photoStage,
  },
  {
    id: 'temple',
    name: '指南宮',
    emoji: '⛩️',
    requiredSteps: 8000,
    streakRequired: 0,
    story: '爬上千階步道，指南宮的飛簷在山嵐中若隱若現。廟埕前的大樹下，說書人正要開講當年的故事……',
    storyTitle: '山上的廟會',
    game: 'puppet',
    gameName: '布袋戲遊戲',
    color: '#A23E48',
    x: 90, y: 26,
    lat: 24.9779, lng: 121.5868,
    distance: '1.2km', walkMin: 18,
    desc: '千年古寺，祈福好去處',
    photo: photoTemple,
  },
]

const UNLOCK_KEY = 'kim-i-unlocks-v1'

export const useStepStore = defineStore('step', () => {
  const todaySteps = ref(getTodaySteps())
  const permissionState = ref('unknown')
  const history = ref(getStepHistory())

  // 所在行政區（未來可由 GPS reverse-geocode 自動帶入）
  const district = ref(localStorage.getItem('kim-i-district') || '台北市文山區')

  // ── 持久化的打卡狀態 ──────────────────────────────────────
  const _saved = JSON.parse(localStorage.getItem(UNLOCK_KEY) || '{}')
  // 相容舊版：之前的 unlocked 視為已打卡
  const checkedInIds = ref(_saved.checkedIn ?? _saved.unlocked ?? [])
  const completedIds = ref(_saved.completed ?? [])
  // GPS 到達的地標（geofence 觸發，不持久化 — 每次出門重新偵測）
  const gpsArrivedIds = ref([])

  const _persistUnlocks = () => {
    localStorage.setItem(UNLOCK_KEY, JSON.stringify({
      checkedIn: checkedInIds.value,
      completed: completedIds.value,
    }))
  }

  const streak = computed(() => {
    const hist = history.value
    let count = 0
    for (let i = 0; i < 30; i++) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      if ((hist[key] || 0) >= 1000) count++
      else if (i > 0) break
    }
    return count
  })

  // ── 到達判定：步數達標或 GPS 到達 → 可打卡 ─────────────────
  const arrivedIds = computed(() =>
    LOCATIONS.filter(loc => {
      const stepsOk  = todaySteps.value >= loc.requiredSteps
      const streakOk = loc.streakRequired === 0 || streak.value >= loc.streakRequired
      return (stepsOk && streakOk) || gpsArrivedIds.value.includes(loc.id)
    }).map(loc => loc.id)
  )

  watch([checkedInIds, completedIds], _persistUnlocks)

  // 地點目前狀態：locked | in_progress | arrived(可打卡) | unlocked(已打卡點亮) | completed
  const statusOf = (loc) => {
    if (completedIds.value.includes(loc.id))  return 'completed'
    if (checkedInIds.value.includes(loc.id))  return 'unlocked'
    if (arrivedIds.value.includes(loc.id))    return 'arrived'
    if (todaySteps.value > 0)                 return 'in_progress'
    return 'locked'
  }

  // 長輩按下「打卡」：locked 之外唯一的解鎖途徑
  const checkIn = (id) => {
    if (!checkedInIds.value.includes(id)) {
      checkedInIds.value = [...checkedInIds.value, id]
    }
  }

  // 下一個還沒到達的目標（顯示「再 X 步解鎖下一區域」）
  const nextTarget = computed(() =>
    LOCATIONS.find(l => !arrivedIds.value.includes(l.id)) ?? null
  )

  const remainingToGoal = computed(() => Math.max(0, DAILY_GOAL - todaySteps.value))
  const goalProgress    = computed(() => Math.min(100, Math.round(todaySteps.value / DAILY_GOAL * 100)))

  const progress = (loc) => Math.min(100, Math.round(todaySteps.value / loc.requiredSteps * 100))

  // 玩過該地點的遊戲 → completed（地圖上打勾）
  const completeLocation = (id) => {
    if (!completedIds.value.includes(id)) {
      completedIds.value = [...completedIds.value, id]
    }
  }

  // GPS 進入地標範圍（geofence 觸發）→ 變成可打卡
  const arriveAt = (id) => {
    if (!gpsArrivedIds.value.includes(id)) {
      gpsArrivedIds.value = [...gpsArrivedIds.value, id]
    }
  }

  const setSteps = (n) => {
    todaySteps.value = n
    const key = new Date().toISOString().slice(0, 10)
    history.value = { ...history.value, [key]: n }
  }

  const resetAll = () => {
    setSteps(0)
    checkedInIds.value = []
    completedIds.value = []
    gpsArrivedIds.value = []
  }

  const start = async () => {
    const state = await requestMotionPermission()
    permissionState.value = state
    startStepCounter((steps) => {
      todaySteps.value = steps
      history.value = getStepHistory()
    })
  }

  const stop = () => stopStepCounter()

  return {
    todaySteps, permissionState, history, streak, district,
    arrivedIds, checkedInIds, completedIds, nextTarget, remainingToGoal, goalProgress,
    statusOf, progress, checkIn, completeLocation, arriveAt,
    start, stop, setSteps, resetAll,
  }
})
