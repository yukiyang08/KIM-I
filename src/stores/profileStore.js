import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { supabase } from '../lib/supabase'

const KEY = 'kim-i-profile'
const UID_KEY = 'kim-i-user-id'

const REGION_MAP = {
  south: '南部', north: '北部', central: '中部',
  east: '東部', island: '離島', military: '眷村',
}
const OCCUPATION_MAP = {
  farming: '務農', factory: '工廠', trade: '做生意',
  official: '公務員', teacher: '教師', homemaker: '家管',
}

const avatarId = (n) => {
  let hash = 0
  for (const c of String(n)) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff
  return (hash % 6) + 1
}

export const useProfileStore = defineStore('profile', () => {
  const _saved = JSON.parse(localStorage.getItem(KEY) || 'null') ?? {}

  // Guest UUID (always exists, used when not logged in)
  const _guestId = ref(
    localStorage.getItem(UID_KEY) || (() => {
      const id = crypto.randomUUID()
      localStorage.setItem(UID_KEY, id)
      return id
    })()
  )

  // Supabase Auth state
  const authUser = ref(null)
  const isLoggedIn = computed(() => !!authUser.value)

  // Effective user ID: auth user when logged in, otherwise guest UUID
  const userId = computed(() => authUser.value?.id ?? _guestId.value)

  // Profile fields
  const name       = ref(_saved.name       ?? '')
  const birthYear  = ref(_saved.birthYear  ?? 45)
  const region     = ref(_saved.region     ?? null)
  const occupation = ref(_saved.occupation ?? null)
  const family     = ref(_saved.family     ?? null)
  const isSetup    = ref(_saved.isSetup    ?? false)

  const eraLabel = computed(() => {
    const y = birthYear.value
    if (y <= 34) return '民國60年代'
    if (y <= 44) return '民國70年代'
    if (y <= 54) return '民國80年代'
    return '民國90年代'
  })

  const regionLabel = computed(() => ({
    south: '南部', north: '北部', central: '中部',
    east: '東部', island: '離島', military: '眷村',
  }[region.value] ?? ''))

  const occupationLabel = computed(() => ({
    farming: '務農', factory: '工廠', trade: '做生意',
    official: '公務員', teacher: '教師', homemaker: '家管',
  }[occupation.value] ?? ''))

  const displayName = computed(() => name.value.trim() || '你')

  const _persist = () => {
    localStorage.setItem(KEY, JSON.stringify({
      name: name.value, birthYear: birthYear.value,
      region: region.value, occupation: occupation.value,
      family: family.value, isSetup: isSetup.value,
    }))
  }

  watch([name, birthYear, region, occupation, family, isSetup], _persist, { deep: true })

  const _syncToDb = async () => {
    await supabase.from('users').upsert({
      id: userId.value,
      name: name.value.trim() || '未命名',
      birth_year: birthYear.value,
      region: REGION_MAP[region.value] ?? null,
      occupation: OCCUPATION_MAP[occupation.value] ?? null,
      avatar_id: avatarId(name.value),
    }, { onConflict: 'id' })
  }

  // Load profile from DB (used after login on a new device)
  const _loadProfileFromDb = async (uid) => {
    const { data } = await supabase.from('users').select('*').eq('id', uid).single()
    if (!data) return
    // Reverse map Chinese → key
    const regionKey = Object.entries(REGION_MAP).find(([, v]) => v === data.region)?.[0] ?? null
    const occKey    = Object.entries(OCCUPATION_MAP).find(([, v]) => v === data.occupation)?.[0] ?? null
    name.value       = data.name ?? name.value
    birthYear.value  = data.birth_year ?? birthYear.value
    region.value     = regionKey ?? region.value
    occupation.value = occKey ?? occupation.value
    if (data.name) isSetup.value = true
  }

  // Migrate guest sessions to auth account after login
  const _migrateGuestSessions = async (authId) => {
    const gid = _guestId.value
    if (gid === authId) return
    await supabase
      .from('game_sessions')
      .update({ user_id: authId })
      .eq('user_id', gid)
  }

  // ── Auth actions ──────────────────────────────────────────────

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signup = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  // ── Auth state listener ───────────────────────────────────────

  // Init: restore existing session
  supabase.auth.getSession().then(({ data: { session } }) => {
    authUser.value = session?.user ?? null
  })

  supabase.auth.onAuthStateChange(async (event, session) => {
    authUser.value = session?.user ?? null
    if (event === 'SIGNED_IN' && session?.user) {
      await _migrateGuestSessions(session.user.id)
      await _loadProfileFromDb(session.user.id)
    }
  })

  // ── Profile setup ─────────────────────────────────────────────

  const completeSetup = async () => {
    isSetup.value = true
    await _syncToDb()
  }

  const reset = () => {
    name.value = ''; birthYear.value = 45; region.value = null
    occupation.value = null; family.value = null; isSetup.value = false
    localStorage.removeItem(KEY)
  }

  return {
    userId,
    authUser,
    isLoggedIn,
    name, birthYear, region, occupation, family, isSetup,
    eraLabel, regionLabel, occupationLabel, displayName,
    completeSetup, reset,
    login, signup, logout,
  }
})
