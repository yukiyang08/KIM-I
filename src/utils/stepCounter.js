const STEP_KEY = 'kim-i-steps-v1'
const THRESHOLD = 12        // m/s² peak needed to count a step
const MIN_INTERVAL = 250    // ms minimum between steps

let lastStepTime = 0
let lastMag = 0
let rising = false
let onStepCb = null
let active = false

const getMag = (e) => {
  const a = e.accelerationIncludingGravity || e.acceleration || {}
  return Math.sqrt((a.x || 0) ** 2 + (a.y || 0) ** 2 + (a.z || 0) ** 2)
}

const handleMotion = (e) => {
  const mag = getMag(e)
  if (mag > lastMag) {
    rising = true
  } else if (rising && lastMag > THRESHOLD) {
    const now = Date.now()
    if (now - lastStepTime > MIN_INTERVAL) {
      lastStepTime = now
      addStep()
    }
    rising = false
  }
  lastMag = mag
}

const todayKey = () => new Date().toISOString().slice(0, 10)

const loadToday = () => {
  try {
    const raw = localStorage.getItem(STEP_KEY)
    const data = raw ? JSON.parse(raw) : {}
    return data[todayKey()] || 0
  } catch { return 0 }
}

const saveToday = (steps) => {
  try {
    const raw = localStorage.getItem(STEP_KEY)
    const data = raw ? JSON.parse(raw) : {}
    // Keep only last 30 days
    const keys = Object.keys(data).sort()
    if (keys.length > 30) keys.slice(0, keys.length - 30).forEach(k => delete data[k])
    data[todayKey()] = steps
    localStorage.setItem(STEP_KEY, JSON.stringify(data))
  } catch {}
}

const loadHistory = () => {
  try {
    const raw = localStorage.getItem(STEP_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

let _steps = loadToday()

const addStep = () => {
  _steps++
  saveToday(_steps)
  onStepCb?.(_steps)
}

export const startStepCounter = (onStep) => {
  if (active) return
  _steps = loadToday()
  onStepCb = onStep
  onStepCb?.(_steps)
  if (typeof DeviceMotionEvent === 'undefined') return
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    // iOS 13+ requires permission
    DeviceMotionEvent.requestPermission().then(state => {
      if (state === 'granted') {
        window.addEventListener('devicemotion', handleMotion)
        active = true
      }
    }).catch(() => {})
  } else {
    window.addEventListener('devicemotion', handleMotion)
    active = true
  }
}

export const stopStepCounter = () => {
  window.removeEventListener('devicemotion', handleMotion)
  active = false
  onStepCb = null
}

export const getTodaySteps = () => loadToday()
export const getStepHistory = () => loadHistory()

export const requestMotionPermission = async () => {
  if (typeof DeviceMotionEvent === 'undefined') return 'unavailable'
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    try {
      return await DeviceMotionEvent.requestPermission()
    } catch { return 'denied' }
  }
  return 'granted'
}
