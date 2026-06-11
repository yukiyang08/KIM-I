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

  // Used only for internal alert thresholds, not shown directly to user
  const baseline = { memory: 70, attention: 70, execution: 70, visual: 70, reactionSpeed: 70 }

  // Average of last 3 sessions per dimension; 0 when no data
  const radarCurrent = computed(() =>
    dimensionOrder.map(dim => {
      const related = sessions.value.filter(s => dimensionOf[s.gameId] === dim)
      if (!related.length) return 0
      const recent = related.slice(-3)
      return Math.round(recent.reduce((sum, s) => sum + s.score, 0) / recent.length)
    })
  )

  // Average of sessions before the most recent 3; mirrors current when not enough history
  const radarBaseline = computed(() =>
    dimensionOrder.map((dim, i) => {
      const related = sessions.value.filter(s => dimensionOf[s.gameId] === dim)
      if (related.length <= 1) return radarCurrent.value[i]
      const prev = related.slice(0, -1).slice(-3)
      return Math.round(prev.reduce((sum, s) => sum + s.score, 0) / prev.length)
    })
  )

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
    dimensionOrder.map((dim, i) => {
      const related = sessions.value.filter((s) => dimensionOf[s.gameId] === dim)

      if (!related.length) {
        return { key: dim, label: dimensionLabel[dim], current: 0, baseline: 0, delta: 0, trend: 'stuck', sessionsCount: 0 }
      }

      const current = radarCurrent.value[i]
      const base = radarBaseline.value[i]
      const delta = current - base
      const trend = delta >= 5 ? 'improving' : delta <= -5 ? 'declining' : 'stuck'

      return { key: dim, label: dimensionLabel[dim], current, baseline: base, delta, trend, sessionsCount: related.length }
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
