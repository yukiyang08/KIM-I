import { supabaseAnon as supabase } from '../lib/supabase'

const PLAYER_KEY = 'kim-i-multiplayer-player-v1'
const now = () => Date.now()
const random = () => Math.random().toString(36).slice(2, 10)
const normalizeName = (name) => (name || '').trim().slice(0, 20) || '玩家'

const parseJson = (raw, fallback) => {
  try { return raw ? JSON.parse(raw) : fallback } catch { return fallback }
}

// Player identity stored locally — just a display name + session ID
export const getOrCreateLocalPlayer = (preferredName = '玩家') => {
  const saved = parseJson(localStorage.getItem(PLAYER_KEY), null)
  if (saved?.id && saved?.name) return saved
  const player = { id: `p_${random()}`, name: normalizeName(preferredName) }
  localStorage.setItem(PLAYER_KEY, JSON.stringify(player))
  return player
}

export const updateLocalPlayerName = (name) => {
  const player = getOrCreateLocalPlayer(name)
  const updated = { ...player, name: normalizeName(name) }
  localStorage.setItem(PLAYER_KEY, JSON.stringify(updated))
  return updated
}

const makeCode = () => {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += charset[Math.floor(Math.random() * charset.length)]
  return code
}

const dbToRoom = (row) => row ? {
  id:         row.id,
  code:       row.code,
  mode:       row.mode,
  track:      row.track,
  maxPlayers: row.max_players,
  duration:   row.duration,
  difficulty: row.difficulty || 'normal',
  hostId:     row.host_player_id,
  status:     row.status,
  createdAt:  new Date(row.created_at).getTime(),
  updatedAt:  new Date(row.updated_at).getTime(),
  startedAt:  row.started_at ? new Date(row.started_at).getTime() : null,
  endedAt:    row.ended_at   ? new Date(row.ended_at).getTime()   : null,
  players:    row.players || [],
} : null

// ─── Queries ──────────────────────────────────────────────────────────────────

export const listRooms = async () => {
  const { data } = await supabase
    .from('multiplayer_rooms')
    .select('*')
    .in('status', ['waiting', 'playing'])
    .order('created_at', { ascending: false })
    .limit(20)
  return (data ?? []).map(dbToRoom)
}

export const getRoom = async (roomId) => {
  const { data } = await supabase
    .from('multiplayer_rooms')
    .select('*')
    .eq('id', roomId)
    .single()
  return dbToRoom(data)
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export const createRoom = async ({ hostName, mode = 'co-op', track = 'music-rhythm2', maxPlayers = 4, duration = '60', difficulty = 'normal' }) => {
  const player = updateLocalPlayerName(hostName)
  const { data, error } = await supabase
    .from('multiplayer_rooms')
    .insert({
      code:           makeCode(),
      mode,
      track,
      max_players:    maxPlayers,
      duration,
      difficulty,
      host_player_id: player.id,
      status:         'waiting',
      players: [{
        id: player.id, name: player.name,
        ready: false, score: null, finishedAt: null, connectedAt: now(),
      }],
    })
    .select()
    .single()
  if (error) return { error: error.message }
  return { room: dbToRoom(data), player }
}

export const joinRoomByCode = async ({ code, playerName }) => {
  const normalizedCode = (code || '').trim().toUpperCase()
  const player = updateLocalPlayerName(playerName)

  const { data, error } = await supabase.rpc('mp_join_room', {
    p_code: normalizedCode,
    p_player: {
      id: player.id, name: player.name,
      ready: false, score: null, finishedAt: null, connectedAt: now(),
    },
  })

  if (error) {
    if (error.message?.includes('ROOM_FULL'))        return { error: '房間已滿。' }
    if (error.message?.includes('ROOM_NOT_WAITING')) return { error: '此房間已開局或已結束。' }
    return { error: error.message }
  }
  const row = Array.isArray(data) ? data[0] : data
  if (!row) return { error: '找不到房間，請確認房號。' }
  return { room: dbToRoom(row), player }
}

export const toggleReady = async (roomId, playerId, ready) => {
  const { data } = await supabase.rpc('mp_set_ready', {
    p_room_id: roomId, p_player_id: playerId, p_ready: ready,
  })
  const row = Array.isArray(data) ? data[0] : data
  return dbToRoom(row)
}

export const updateRoomConfig = async (roomId, config) => {
  const updates = { updated_at: new Date().toISOString() }
  if (config.track)      updates.track      = config.track
  if (config.mode)       updates.mode       = config.mode
  if (config.duration)   updates.duration   = config.duration
  if (config.difficulty) updates.difficulty = config.difficulty
  const { data } = await supabase
    .from('multiplayer_rooms')
    .update(updates).eq('id', roomId).eq('status', 'waiting').select().single()
  return dbToRoom(data)
}

export const leaveRoom = async (roomId, playerId) => {
  const { data } = await supabase.rpc('mp_leave_room', {
    p_room_id: roomId, p_player_id: playerId,
  })
  const row = Array.isArray(data) ? data[0] : data
  return dbToRoom(row)
}

export const startRoomGame = async (roomId, hostId) => {
  const { data, error } = await supabase.rpc('mp_start_game', {
    p_room_id: roomId, p_host_id: hostId,
  })
  if (error) {
    if (error.message?.includes('ROOM_NOT_FOUND'))   return { error: '房間不存在。' }
    if (error.message?.includes('NOT_HOST'))         return { error: '只有房主可以開始。' }
    if (error.message?.includes('NEED_TWO_PLAYERS')) return { error: '至少需要 2 位玩家。' }
    if (error.message?.includes('NOT_ALL_READY'))    return { error: '仍有玩家尚未準備。' }
    return { error: error.message }
  }
  const row = Array.isArray(data) ? data[0] : data
  return { room: dbToRoom(row) }
}

export const submitRoomScore = async (roomId, playerId, score) => {
  const { data } = await supabase.rpc('mp_submit_score', {
    p_room_id: roomId,
    p_player_id: playerId,
    p_score: Number.isFinite(score) ? Math.max(0, Math.round(score)) : 0,
  })
  const row = Array.isArray(data) ? data[0] : data
  return dbToRoom(row)
}

export const resetRoomToWaiting = async (roomId, hostId) => {
  const { data: row } = await supabase
    .from('multiplayer_rooms').select('*').eq('id', roomId).single()
  if (!row || row.host_player_id !== hostId) return null
  const { data } = await supabase
    .from('multiplayer_rooms')
    .update({
      status: 'waiting', started_at: null, ended_at: null,
      updated_at: new Date().toISOString(),
      players: (row.players || []).map((p) => ({
        ...p, ready: p.id === hostId, score: null, finishedAt: null,
      })),
    })
    .eq('id', roomId).select().single()
  return dbToRoom(data)
}

export const broadcastBattleScore = async (roomId, playerId, liveScore) => {
  await supabase.rpc('mp_live_score', {
    p_room_id: roomId,
    p_player_id: playerId,
    p_score: Math.max(0, Math.round(liveScore || 0)),
  })
}

// ─── Realtime subscription ────────────────────────────────────────────────────

const activeChannels = new Map()

export const subscribeToRoom = (roomId, onUpdate) => {
  if (activeChannels.has(roomId)) activeChannels.get(roomId).unsubscribe()
  const channel = supabase
    .channel(`room-${roomId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'multiplayer_rooms',
      filter: `id=eq.${roomId}`,
    }, (payload) => onUpdate(dbToRoom(payload.new)))
    .subscribe()
  activeChannels.set(roomId, channel)
  return channel
}

export const unsubscribeFromRoom = (roomId) => {
  if (activeChannels.has(roomId)) {
    activeChannels.get(roomId).unsubscribe()
    activeChannels.delete(roomId)
  }
}
