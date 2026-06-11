import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

const BASELINE = { memory: 82, attention: 65, execution: 88, visual: 75, reaction: 70 }

const rowToPatient = (row) => {
  const dims = [
    row.dim_memory    ?? BASELINE.memory,
    row.dim_attention ?? BASELINE.attention,
    row.dim_execution ?? BASELINE.execution,
    row.dim_visual    ?? BASELINE.visual,
    row.dim_reaction  ?? BASELINE.reaction,
  ].map(Math.round)

  const weekScore = row.week_score
    ?? Math.round(dims.reduce((s, d) => s + d, 0) / dims.length)

  // weekDelta: 與 baseline 平均比較
  const baseAvg = Math.round(Object.values(BASELINE).reduce((s, v) => s + v, 0) / 5)
  const weekDelta = weekScore - baseAvg

  let statusLabel
  if (row.last_active_days >= 5)  statusLabel = '近期較少參與'
  else if (weekScore < 62)        statusLabel = '建議加強'
  else if (weekDelta > 3)         statusLabel = '持續進步'
  else                            statusLabel = '穩定表現'

  return {
    id:             row.id,
    name:           row.name || '未命名',
    age:            row.age  ?? null,
    avatarId:       row.avatar_id ?? 1,
    weeklyCount:    row.weekly_count   ?? 0,
    lastActiveDays: row.last_active_days ?? 999,
    dimensions:     dims,
    weekScore,
    weekDelta,
    statusLabel,
    totalSessions:  row.total_sessions ?? 0,
    orgCode:        row.organization_code,
  }
}

export const useCaregiverStore = defineStore('caregiver', () => {
  const patients      = ref([])
  const streakRanking = ref([])
  const loading       = ref(false)
  const error         = ref(null)

  const load = async (orgCode = null) => {
    loading.value = true
    error.value   = null

    let query = supabase.from('patient_stats').select('*')
    if (orgCode) query = query.eq('organization_code', orgCode)

    const [{ data: statsData, error: statsErr }, { data: streakData }] = await Promise.all([
      query,
      supabase.from('streak_ranking').select('*').limit(10),
    ])

    if (statsErr) {
      error.value = statsErr.message
    } else {
      patients.value = (statsData ?? []).map(rowToPatient)
    }

    streakRanking.value = (streakData ?? []).map(r => ({
      id:       r.id,
      name:     r.name,
      avatarId: r.avatar_id ?? 1,
      days:     r.streak_days ?? 0,
    }))

    loading.value = false
  }

  // ── Computed ─────────────────────────────────────────────────

  const kpiCards = computed(() => {
    const list = patients.value
    if (!list.length) return []
    const total      = list.length
    const activeRate = Math.round(list.filter(p => p.lastActiveDays === 0).length / total * 100)
    const avgScore   = Math.round(list.reduce((s, p) => s + p.weekScore, 0) / total)
    const trained    = list.filter(p => p.weeklyCount > 0).length
    const improved   = list.filter(p => p.weekDelta > 0).length
    return [
      { label: '長者總數',     value: total,      unit: '位', changeText: '', iconColor: '#C87820', iconBg: '#FEF0D8', icon: 'solar:users-group-rounded-bold' },
      { label: '本週活躍率',   value: activeRate, unit: '%',  changeText: '', iconColor: '#1E9E6A', iconBg: '#E8F5EF', icon: 'solar:heart-pulse-bold' },
      { label: '平均認知分數', value: avgScore,   unit: '分', changeText: '', iconColor: '#7B4EA0', iconBg: '#F0EBF8', icon: 'solar:star-bold' },
      { label: '完成訓練人數', value: trained,    unit: '位', changeText: '本週完成', iconColor: '#2C7BC8', iconBg: '#EEF4FB', icon: 'solar:checklist-minimalistic-bold' },
      { label: '本週進步人數', value: improved,   unit: '位', changeText: '', iconColor: '#E8974A', iconBg: '#FEF0D8', icon: 'solar:graph-up-bold' },
    ]
  })

  const starPodium = computed(() =>
    [...patients.value].sort((a, b) => b.weeklyCount - a.weeklyCount).slice(0, 3)
  )

  const activityDistribution = computed(() => {
    // 從 dimensions 陣列平均
    if (!patients.value.length) return []
    const sums = [0, 0, 0, 0, 0]
    patients.value.forEach(p => p.dimensions.forEach((d, i) => { sums[i] += d }))
    const total = sums.reduce((s, v) => s + v, 0)
    const labels = ['記憶力訓練', '注意力訓練', '執行力訓練', '視覺空間', '反應力訓練']
    const colors = ['#E8974A', '#5B9BD5', '#9B6DCF', '#9B9080', '#52B788']
    return sums.map((v, i) => ({
      label: labels[i],
      color: colors[i],
      pct:   Math.round(v / total * 100),
    }))
  })

  const radarAvg = computed(() => {
    if (!patients.value.length) return [0, 0, 0, 0, 0]
    const sums = [0, 0, 0, 0, 0]
    patients.value.forEach(p => p.dimensions.forEach((d, i) => { sums[i] += d }))
    return sums.map(v => Math.round(v / patients.value.length))
  })

  return {
    patients,
    streakRanking,
    loading,
    error,
    load,
    kpiCards,
    starPodium,
    activityDistribution,
    radarAvg,
  }
})
