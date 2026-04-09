const ROOMS_KEY = 'kim-i-multiplayer-rooms-v1'
const PLAYER_KEY = 'kim-i-multiplayer-player-v1'

const now = () => Date.now()

const parseJson = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const readRooms = () => parseJson(localStorage.getItem(ROOMS_KEY), [])
const writeRooms = (rooms) => localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms))

const random = () => Math.random().toString(36).slice(2, 10)
const normalizeName = (name) => (name || '').trim().slice(0, 20) || '玩家'

const makeCode = (existingCodes) => {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let tries = 0
  while (tries < 20) {
    let code = ''
    for (let i = 0; i < 6; i++) code += charset[Math.floor(Math.random() * charset.length)]
    if (!existingCodes.has(code)) return code
    tries += 1
  }
  return String(Math.floor(100000 + Math.random() * 899999))
}

export const getOrCreateLocalPlayer = (preferredName = '玩家') => {
  const saved = parseJson(localStorage.getItem(PLAYER_KEY), null)
  if (saved?.id && saved?.name) return saved

  const player = {
    id: `p_${random()}`,
    name: normalizeName(preferredName),
  }
  localStorage.setItem(PLAYER_KEY, JSON.stringify(player))
  return player
}

export const updateLocalPlayerName = (name) => {
  const player = getOrCreateLocalPlayer(name)
  const updated = { ...player, name: normalizeName(name) }
  localStorage.setItem(PLAYER_KEY, JSON.stringify(updated))
  return updated
}

export const listRooms = () => {
  return readRooms()
    .map((room) => ({ ...room, players: room.players || [] }))
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export const getRoom = (roomId) => listRooms().find((room) => room.id === roomId) || null

export const createRoom = ({ hostName, mode = 'co-op', track = 'music-rhythm2', maxPlayers = 4 }) => {
  const player = updateLocalPlayerName(hostName)
  const rooms = readRooms()
  const existingCodes = new Set(rooms.map((room) => room.code))

  const room = {
    id: `r_${random()}`,
    code: makeCode(existingCodes),
    mode,
    track,
    maxPlayers,
    hostId: player.id,
    status: 'waiting',
    createdAt: now(),
    updatedAt: now(),
    startedAt: null,
    endedAt: null,
    players: [
      {
        id: player.id,
        name: player.name,
        ready: false,
        score: null,
        finishedAt: null,
        connectedAt: now(),
      },
    ],
  }

  rooms.push(room)
  writeRooms(rooms)
  return { room, player }
}

export const joinRoomByCode = ({ code, playerName }) => {
  const normalizedCode = (code || '').trim().toUpperCase()
  const player = updateLocalPlayerName(playerName)
  const rooms = readRooms()
  const room = rooms.find((item) => item.code === normalizedCode)

  if (!room) return { error: '找不到房間，請確認房號。' }
  if (room.status !== 'waiting') return { error: '此房間已開局或已結束。' }

  const players = room.players || []
  const existing = players.find((p) => p.id === player.id)
  if (!existing && players.length >= (room.maxPlayers || 4)) {
    return { error: '房間已滿。' }
  }

  if (existing) {
    existing.name = player.name
    existing.connectedAt = now()
  } else {
    players.push({
      id: player.id,
      name: player.name,
      ready: false,
      score: null,
      finishedAt: null,
      connectedAt: now(),
    })
  }

  room.players = players
  room.updatedAt = now()
  writeRooms(rooms)
  return { room, player }
}

export const toggleReady = (roomId, playerId, ready) => {
  const rooms = readRooms()
  const room = rooms.find((item) => item.id === roomId)
  if (!room) return null

  const player = (room.players || []).find((p) => p.id === playerId)
  if (!player) return null

  player.ready = ready
  room.updatedAt = now()
  writeRooms(rooms)
  return room
}

export const updateRoomConfig = (roomId, config) => {
  const rooms = readRooms()
  const room = rooms.find((item) => item.id === roomId)
  if (!room || room.status !== 'waiting') return null

  if (config.track) room.track = config.track
  if (config.mode) room.mode = config.mode
  room.updatedAt = now()
  writeRooms(rooms)
  return room
}

export const leaveRoom = (roomId, playerId) => {
  const rooms = readRooms()
  const roomIndex = rooms.findIndex((item) => item.id === roomId)
  if (roomIndex < 0) return null

  const room = rooms[roomIndex]
  room.players = (room.players || []).filter((p) => p.id !== playerId)

  if (room.players.length === 0) {
    rooms.splice(roomIndex, 1)
    writeRooms(rooms)
    return null
  }

  if (room.hostId === playerId) {
    room.hostId = room.players[0].id
  }

  room.updatedAt = now()
  rooms[roomIndex] = room
  writeRooms(rooms)
  return room
}

export const startRoomGame = (roomId, hostId) => {
  const rooms = readRooms()
  const room = rooms.find((item) => item.id === roomId)
  if (!room) return { error: '房間不存在。' }
  if (room.hostId !== hostId) return { error: '只有房主可以開始。' }

  const players = room.players || []
  if (players.length < 2) return { error: '至少需要 2 位玩家。' }
  const everyoneReady = players.every((p) => p.ready)
  if (!everyoneReady) return { error: '仍有玩家尚未準備。' }

  room.status = 'playing'
  room.startedAt = now()
  room.endedAt = null
  room.updatedAt = now()
  room.players = players.map((p) => ({
    ...p,
    score: null,
    finishedAt: null,
  }))

  writeRooms(rooms)
  return { room }
}

export const submitRoomScore = (roomId, playerId, score) => {
  const rooms = readRooms()
  const room = rooms.find((item) => item.id === roomId)
  if (!room) return null

  const player = (room.players || []).find((p) => p.id === playerId)
  if (!player) return null

  player.score = Number.isFinite(score) ? Math.max(0, Math.round(score)) : 0
  player.finishedAt = now()
  room.updatedAt = now()

  const allDone = room.players.every((p) => p.finishedAt)
  if (allDone) {
    room.status = 'finished'
    room.endedAt = now()
  }

  writeRooms(rooms)
  return room
}

export const resetRoomToWaiting = (roomId, hostId) => {
  const rooms = readRooms()
  const room = rooms.find((item) => item.id === roomId)
  if (!room || room.hostId !== hostId) return null

  room.status = 'waiting'
  room.startedAt = null
  room.endedAt = null
  room.players = (room.players || []).map((p) => ({
    ...p,
    ready: p.id === hostId,
    score: null,
    finishedAt: null,
  }))
  room.updatedAt = now()

  writeRooms(rooms)
  return room
}
