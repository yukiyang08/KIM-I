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

export const createRoom = async ({ hostName, mode = 'co-op', track = 'music-rhythm2', maxPlayers = 4, duration = '60' }) => {
  const player = updateLocalPlayerName(hostName)
  const { data, error } = await supabase
    .from('multiplayer_rooms')
    .insert({
      code:           makeCode(),
      mode,
      track,
      max_players:    maxPlayers,
      duration,
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

  const { data: row, error } = await supabase
    .from('multiplayer_rooms')
    .select('*')
    .eq('code', normalizedCode)
    .single()

  if (error || !row) return { error: '找不到房間，請確認房號。' }
  if (row.status !== 'waiting') return { error: '此房間已開局或已結束。' }

  const existing = (row.players || []).find((p) => p.id === player.id)
  if (!existing && (row.players || []).length >= (row.max_players || 4)) {
    return { error: '房間已滿。' }
  }

  const updatedPlayers = existing
    ? (row.players || []).map((p) =>
        p.id === player.id ? { ...p, name: player.name, connectedAt: now() } : p)
    : [...(row.players || []), {
        id: player.id, name: player.name,
        ready: false, score: null, finishedAt: null, connectedAt: now(),
      }]

  const { data: updated, error: updateErr } = await supabase
    .from('multiplayer_rooms')
    .update({ players: updatedPlayers, updated_at: new Date().toISOString() })
    .eq('id', row.id)
    .select()
    .single()

  if (updateErr) return { error: updateErr.message }
  return { room: dbToRoom(updated), player }
}

export const toggleReady = async (roomId, playerId, ready) => {
  const { data: row } = await supabase
    .from('multiplayer_rooms').select('players').eq('id', roomId).single()
  if (!row) return null
  const players = (row.players || []).map((p) => p.id === playerId ? { ...p, ready } : p)
  const { data } = await supabase
    .from('multiplayer_rooms')
    .update({ players, updated_at: new Date().toISOString() })
    .eq('id', roomId).select().single()
  return dbToRoom(data)
}

export const updateRoomConfig = async (roomId, config) => {
  const updates = { updated_at: new Date().toISOString() }
  if (config.track)    updates.track    = config.track
  if (config.mode)     updates.mode     = config.mode
  if (config.duration) updates.duration = config.duration
  const { data } = await supabase
    .from('multiplayer_rooms')
    .update(updates).eq('id', roomId).eq('status', 'waiting').select().single()
  return dbToRoom(data)
}

export const leaveRoom = async (roomId, playerId) => {
  const { data: row } = await supabase
    .from('multiplayer_rooms').select('*').eq('id', roomId).single()
  if (!row) return null
  const players = (row.players || []).filter((p) => p.id !== playerId)
  if (players.length === 0) {
    await supabase.from('multiplayer_rooms').delete().eq('id', roomId)
    return null
  }
  const hostId = row.host_player_id === playerId ? players[0].id : row.host_player_id
  const { data } = await supabase
    .from('multiplayer_rooms')
    .update({ players, host_player_id: hostId, updated_at: new Date().toISOString() })
    .eq('id', roomId).select().single()
  return dbToRoom(data)
}

export const startRoomGame = async (roomId, hostId) => {
  const { data: row } = await supabase
    .from('multiplayer_rooms').select('*').eq('id', roomId).single()
  if (!row)                              return { error: '房間不存在。' }
  if (row.host_player_id !== hostId)     return { error: '只有房主可以開始。' }
  const players = row.players || []
  if (players.length < 2)               return { error: '至少需要 2 位玩家。' }
  if (!players.every((p) => p.ready))   return { error: '仍有玩家尚未準備。' }
  const { data } = await supabase
    .from('multiplayer_rooms')
    .update({
      status: 'playing',
      started_at: new Date().toISOString(),
      ended_at: null,
      updated_at: new Date().toISOString(),
      players: players.map((p) => ({ ...p, score: null, finishedAt: null })),
    })
    .eq('id', roomId).select().single()
  return { room: dbToRoom(data) }
}

export const submitRoomScore = async (roomId, playerId, score) => {
  const { data: row } = await supabase
    .from('multiplayer_rooms').select('*').eq('id', roomId).single()
  if (!row) return null
  const players = (row.players || []).map((p) =>
    p.id === playerId
      ? { ...p, score: Number.isFinite(score) ? Math.max(0, Math.round(score)) : 0, finishedAt: now() }
      : p)
  const allDone = players.every((p) => p.finishedAt)
  const { data } = await supabase
    .from('multiplayer_rooms')
    .update({
      players,
      updated_at: new Date().toISOString(),
      ...(allDone ? { status: 'finished', ended_at: new Date().toISOString() } : {}),
    })
    .eq('id', roomId).select().single()
  return dbToRoom(data)
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
