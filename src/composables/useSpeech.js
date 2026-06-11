// ============================================================
// useSpeech — Web Speech API 封裝（語音辨識 STT + 語音合成 TTS）
// 針對長輩使用情境：zh-TW、非連續模式（按一下講一句）、語速放慢
// ============================================================
import { ref, onUnmounted } from 'vue'

export function useSpeech() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  const isSupported = !!SR

  const isListening   = ref(false)   // 麥克風開啟中
  const isSpeaking    = ref(false)   // TTS 朗讀中
  const interimText   = ref('')      // 即時辨識中的文字（還沒定稿）
  const error         = ref(null)

  let recognition = null
  let finalTranscript = ''
  let onFinalCb = null
  let onSilenceCb = null

  // ── 語音辨識（STT）──────────────────────────────────────────
  // onFinal(text)：辨識到完整一句話
  // onSilence()：開了麥克風但什麼都沒聽到就結束（通話模式用來自動重啟聆聽）
  const startListening = (onFinal, onSilence) => {
    if (!isSupported || isListening.value) return
    error.value = null
    onFinalCb = onFinal
    onSilenceCb = onSilence ?? null
    finalTranscript = ''
    interimText.value = ''

    recognition = new SR()
    recognition.lang = 'zh-TW'
    recognition.interimResults = true   // 邊講邊顯示，長輩知道機器有在聽
    recognition.continuous = false      // 講完一句自動停，避免長輩不知道怎麼結束
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
      // no-speech 很常見（長輩猶豫），不當成錯誤
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
    voiceCache =
      voices.find(v => v.lang === 'zh-TW') ||
      voices.find(v => v.lang?.startsWith('zh')) ||
      null
    return voiceCache
  }
  // voices 是非同步載入的，先預熱一次
  window.speechSynthesis?.addEventListener?.('voiceschanged', pickVoice)

  const speak = (text) => new Promise((resolve) => {
    if (!window.speechSynthesis || !text) return resolve()
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'zh-TW'
    u.rate = 0.92    // 比預設慢一點，長輩聽得清楚
    u.pitch = 1.05
    const v = pickVoice()
    if (v) u.voice = v
    u.onend = () => { isSpeaking.value = false; resolve() }
    u.onerror = () => { isSpeaking.value = false; resolve() }
    isSpeaking.value = true
    window.speechSynthesis.speak(u)
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
