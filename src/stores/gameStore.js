import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGameStore = defineStore('game', () => {
  // Each session: { gameId, score (0–100), timestamp, ...detail }
  const sessions = ref([])

  const addSession = (gameId, score, detail = {}) => {
    sessions.value.push({
      gameId,
      score: Math.min(100, Math.max(0, Math.round(score))),
      timestamp: Date.now(),
      ...detail,
    })
  }

  // gameId → cognitive dimension
  const dimensionOf = {
    pinball: 'reactionSpeed',
    shopping: 'memory',
    cooking: 'execution',
    puppet: 'attention',
  }

  // Most recent score per dimension
  const latestByDimension = computed(() => {
    const result = {}
    ;[...sessions.value].reverse().forEach(s => {
      const dim = dimensionOf[s.gameId]
      if (dim && result[dim] === undefined) result[dim] = s.score
    })
    return result
  })

  // Baseline (上月) — static reference
  const baseline = { memory: 82, attention: 65, execution: 88, visual: 75, reactionSpeed: 70 }

  // Live radar data: [記憶力, 注意力, 執行力, 視覺空間, 反應力]
  const radarCurrent = computed(() => {
    const d = latestByDimension.value
    return [
      d.memory        ?? baseline.memory,
      d.attention     ?? baseline.attention,
      d.execution     ?? baseline.execution,
      baseline.visual,                        // 視覺空間：遊戲尚未實裝
      d.reactionSpeed ?? baseline.reactionSpeed,
    ]
  })

  const radarBaseline = [
    baseline.memory, baseline.attention, baseline.execution,
    baseline.visual, baseline.reactionSpeed,
  ]

  const hasData = computed(() => sessions.value.length > 0)

  // Dynamic alert: check if reaction speed dropped vs baseline
  const alertMessage = computed(() => {
    const pinball = sessions.value.filter(s => s.gameId === 'pinball')
    if (pinball.length === 0) return null
    const recent = pinball.slice(-3).reduce((a, b) => a + b.score, 0) / Math.min(3, pinball.length)
    const drop = baseline.reactionSpeed - recent
    if (drop > 8) {
      return `過去 ${pinball.length} 場彈珠台的反應速度下降了 ${Math.round(drop)}%，建議多鼓勵進行「彈珠台」訓練。`
    }
    const memory = sessions.value.filter(s => s.gameId === 'shopping')
    if (memory.length >= 2) {
      const avg = memory.slice(-3).reduce((a, b) => a + b.score, 0) / Math.min(3, memory.length)
      if (avg < 70) {
        return `近期採買記憶遊戲的正確率偏低（平均 ${Math.round(avg)} 分），建議多練習「柑仔店採買記」。`
      }
    }
    return null
  })

  const recentSessions = computed(() =>
    [...sessions.value].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5)
  )

  return {
    sessions,
    addSession,
    radarCurrent,
    radarBaseline,
    hasData,
    alertMessage,
    recentSessions,
    latestByDimension,
  }
})
