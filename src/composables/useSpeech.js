// ============================================================
// useSpeech — Web Speech API 封裝（語音辨識 STT + 語音合成 TTS）
// 針對長輩使用情境：zh-TW、非連續模式（按一下講一句）、語速放慢
// ============================================================
import { ref, onUnmounted } from 'vue'

// 優先嘗試已知較自然的中文音色（各平台）
const PREFERRED_VOICES = [
  'Mei-Jia',              // macOS / iOS — 最自然
  'Microsoft Hanhan',     // Windows
  'Microsoft Yating',     // Windows 備選
  'Google 國語（台灣）',   // Chrome Android
  'Google 普通話（台灣）', // Chrome Android 備選
]

// 在句尾標點後斷句，讓每一句之間有自然停頓
function splitSentences(text) {
  const END = new Set([...'。！？…～'])
  const out = []
  let cur = ''
  for (const ch of text) {
    cur += ch
    if (END.has(ch)) { out.push(cur.trim()); cur = '' }
  }
  if (cur.trim()) out.push(cur.trim())
  return out.filter(Boolean)
}

export function useSpeech() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  const isSupported = !!SR

  const isListening   = ref(false)
  const isSpeaking    = ref(false)
  const interimText   = ref('')
  const error         = ref(null)

  let recognition = null
  let finalTranscript = ''
  let onFinalCb = null
  let onSilenceCb = null

  // ── 語音辨識（STT）──────────────────────────────────────────
  const startListening = (onFinal, onSilence) => {
    if (!isSupported || isListening.value) return
    error.value = null
    onFinalCb = onFinal
    onSilenceCb = onSilence ?? null
    finalTranscript = ''
    interimText.value = ''

    recognition = new SR()
    recognition.lang = 'zh-TW'
    recognition.interimResults = true
    recognition.continuous = false
    recognition.maxAlternatives = 1

    recognition.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) finalTranscript += t
        else interim += t
      }
      interimText.value = finalTranscript + interim
    }

    recognition.onerror = (e) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        error.value = e.error === 'not-allowed'
          ? '需要麥克風權限，請允許瀏覽器使用麥克風'
          : `語音辨識發生問題（${e.error}）`
      }
    }

    recognition.onend = () => {
      isListening.value = false
      interimText.value = ''
      const text = finalTranscript.trim()
      if (text && onFinalCb) onFinalCb(text)
      else if (!text && onSilenceCb) onSilenceCb()
    }

    recognition.start()
    isListening.value = true
  }

  const stopListening = () => {
    if (recognition && isListening.value) recognition.stop()
  }

  // ── 語音合成（TTS）──────────────────────────────────────────
  let voiceCache = null

  const pickVoice = () => {
    if (voiceCache) return voiceCache
    const voices = window.speechSynthesis?.getVoices() ?? []

    // 優先找已知自然音色
    for (const name of PREFERRED_VOICES) {
      const v = voices.find(v => v.name.includes(name))
      if (v) { voiceCache = v; return voiceCache }
    }

    // 退回：任何 zh-TW 音色
    voiceCache =
      voices.find(v => v.lang === 'zh-TW') ||
      voices.find(v => v.lang?.startsWith('zh')) ||
      null
    return voiceCache
  }

  // 音色列表非同步載入，預熱一次讓 pickVoice 快取生效
  window.speechSynthesis?.addEventListener?.('voiceschanged', () => {
    voiceCache = null   // 重設讓下次 speak 重新選最佳音色
    pickVoice()
  })

  // 朗讀單一句子
  const speakChunk = (text, voice) => new Promise(resolve => {
    const u = new SpeechSynthesisUtterance(text)
    u.lang   = 'zh-TW'
    u.rate   = 0.88    // 略慢、溫和，長輩聽得清楚
    u.pitch  = 1.1     // 略高、親切感
    u.volume = 1
    if (voice) u.voice = voice
    u.onend  = resolve
    u.onerror = resolve
    window.speechSynthesis.speak(u)
  })

  // 依句尾標點斷句，每句之間加 200 ms 停頓，聽起來更像真人
  const speak = (text) => new Promise(async (resolve) => {
    if (!window.speechSynthesis || !text) return resolve()
    window.speechSynthesis.cancel()
    isSpeaking.value = true

    const voice = pickVoice()
    const sentences = splitSentences(text)

    for (let i = 0; i < sentences.length; i++) {
      if (!isSpeaking.value) break   // 外部呼叫 stopSpeaking 時中止
      await speakChunk(sentences[i], voice)
      if (i < sentences.length - 1) {
        await new Promise(r => setTimeout(r, 200))
      }
    }

    isSpeaking.value = false
    resolve()
  })

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel()
    isSpeaking.value = false
  }

  onUnmounted(() => {
    stopListening()
    stopSpeaking()
  })

  return {
    isSupported,
    isListening, isSpeaking, interimText, error,
    startListening, stopListening,
    speak, stopSpeaking,
  }
}
