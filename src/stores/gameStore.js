import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useProfileStore } from './profileStore'

export const useGameStore = defineStore('game', () => {
  const difficulty = ref('normal')

  const setDifficulty = (level) => {
    if (['easy', 'normal', 'hard'].includes(level)) difficulty.value = level
  }

  // Each session: { gameId, score, timestamp, difficulty, ...detail }
  const sessions = ref([])

  const addSession = async (gameId, score, detail = {}) => {
    const session = {
      gameId,
      score: Math.min(100, Math.max(0, Math.round(score))),
      timestamp: Date.now(),
      difficulty: difficulty.value,
      ...detail,
    }
    sessions.value.push(session)

    const profile = useProfileStore()
    if (profile.userId) {
      await supabase.from('game_sessions').insert({
        user_id: profile.userId,
        game_id: gameId,
        score: session.score,
        difficulty: difficulty.value,
        detail: detail,
        played_at: new Date(session.timestamp).toISOString(),
      })
    }
  }

  // Load all sessions for the current user from DB
  const loadSessions = async () => {
    const profile = useProfileStore()
    if (!profile.userId) return

    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', profile.userId)
      .order('played_at', { ascending: true })

    if (!error && data) {
      sessions.value = data.map(row => ({
        gameId: row.game_id,
        score: row.score,
        timestamp: new Date(row.played_at).getTime(),
        difficulty: row.difficulty,
        ...row.detail,
      }))
    }
  }

  // gameId → cognitive dimension
  const dimensionOf = {
    music:    'reactionSpeed',
    shopping: 'memory',
    cooking:  'execution',
    puppet:   'attention',
    riddle:   'memory',
    puzzle:   'visual',
  }

  const latestByDimension = computed(() => {
    const result = {}
    ;[...sessions.value].reverse().forEach(s => {
      const dim = dimensionOf[s.gameId]
      if (dim && result[dim] === undefined) result[dim] = s.score
    })
    return result
  })

  const baseline = { memory: 82, attention: 65, execution: 88, visual: 75, reactionSpeed: 70 }

  const radarCurrent = computed(() => {
    const d = latestByDimension.value
    return [
      d.memory        ?? baseline.memory,
      d.attention     ?? baseline.attention,
      d.execution     ?? baseline.execution,
      d.visual        ?? baseline.visual,
      d.reactionSpeed ?? baseline.reactionSpeed,
    ]
  })

  const radarBaseline = [
    baseline.memory, baseline.attention, baseline.execution,
    baseline.visual, baseline.reactionSpeed,
  ]

  const hasData = computed(() => sessions.value.length > 0)

  const alertMessage = computed(() => {
    const music = sessions.value.filter(s => s.gameId === 'music')
    if (music.length === 0) return null
    const recent = music.slice(-3).reduce((a, b) => a + b.score, 0) / Math.min(3, music.length)
    const drop = baseline.reactionSpeed - recent
    if (drop > 8) {
      return `過去 ${music.length} 場節拍遊戲的反應速度下降了 ${Math.round(drop)}%，建議多鼓勵進行「懷舊音樂節拍」訓練。`
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

  const dimensionOrder = ['memory', 'attention', 'execution', 'visual', 'reactionSpeed']
  const dimensionLabel = {
    memory: '記憶力',
    attention: '注意力',
    execution: '執行力',
    visual: '視覺空間',
    reactionSpeed: '反應力',
  }

  const dimensionBreakdown = computed(() =>
    dimensionOrder.map((dim) => {
      const related = sessions.value.filter((s) => dimensionOf[s.gameId] === dim)
      const recent = related.slice(-3)
      const current = recent.length
        ? Math.round(recent.reduce((sum, item) => sum + item.score, 0) / recent.length)
        : baseline[dim]

      const base = baseline[dim]
      const delta = current - base
      let trend = 'stuck'
      if (delta >= 5) trend = 'improving'
      else if (delta <= -5) trend = 'declining'

      return {
        key: dim,
        label: dimensionLabel[dim],
        current,
        baseline: base,
        delta,
        trend,
        sessionsCount: related.length,
      }
    })
  )

  return {
    sessions,
    addSession,
    loadSessions,
    difficulty,
    setDifficulty,
    radarCurrent,
    radarBaseline,
    hasData,
    alertMessage,
    recentSessions,
    latestByDimension,
    dimensionBreakdown,
  }
})
