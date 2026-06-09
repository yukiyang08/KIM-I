<template>
  <div class="h-full w-full flex flex-col relative overflow-hidden font-['Outfit','Noto_Sans_TC'] text-white select-none"
       style="background: radial-gradient(ellipse at 50% 0%, #221A0C 0%, #130E06 55%, #0A0804 100%);">

    <!-- Grain -->
    <div class="absolute inset-0 pointer-events-none opacity-[0.04]"
         style="background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.7%22 numOctaves=%224%22 stitchTiles=%22stitch%22/><feColorMatrix type=%22saturate%22 values=%220%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>');"></div>

    <!-- Top bar: step progress -->
    <div class="shrink-0 flex items-center px-6 pt-6 pb-0 gap-3 relative z-20">
      <button v-if="step > 0" @click="back"
              class="text-sm font-semibold transition-opacity"
              style="color:rgba(255,231,186,0.45);"
              @mouseover="e => e.currentTarget.style.opacity='1'"
              @mouseleave="e => e.currentTarget.style.opacity='0.45'">
        ← 上一步
      </button>
      <div class="flex-1 flex gap-1.5 justify-center">
        <div v-for="i in TOTAL_STEPS" :key="i"
             class="h-1.5 rounded-full transition-all duration-400"
             :style="{
               width: i - 1 === step ? '28px' : '8px',
               background: i - 1 < step ? '#F2CF86' : i - 1 === step ? '#F2CF86' : 'rgba(255,255,255,0.18)',
               opacity: i - 1 <= step ? 1 : 0.5,
             }"></div>
      </div>
      <div class="text-sm font-semibold" style="color:rgba(255,231,186,0.35);">
        {{ step + 1 }} / {{ TOTAL_STEPS }}
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-6 relative z-10 overflow-y-auto">
      <transition name="step-fade" mode="out-in">

        <!-- Step 0: Name -->
        <div v-if="step === 0" key="name" class="w-full max-w-md text-center">
          <div class="text-5xl mb-6">👋</div>
          <h2 class="font-black mb-2" style="font-family:'Noto Serif TC',serif; font-size:clamp(1.6rem,6vw,2.4rem); color:#F2CF86;">
            歡迎來到金憶
          </h2>
          <p class="mb-8 text-base sm:text-lg leading-relaxed" style="color:rgba(255,231,190,0.7);">
            讓我們認識一下你，才能為你打造專屬的故事。
          </p>
          <div class="rounded-2xl p-5 mb-6" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);">
            <label class="block text-sm font-bold mb-3 text-left tracking-wide" style="color:rgba(255,231,186,0.6);">
              你叫什麼名字？（可以不填）
            </label>
            <input v-model="draft.name" type="text" placeholder="例：金美奶奶"
                   class="w-full rounded-xl px-5 py-4 text-xl font-semibold outline-none transition-all"
                   style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,231,186,0.2);
                          color:white; font-family:'Outfit','Noto Sans TC';"
                   @focus="e => e.target.style.borderColor='rgba(242,207,134,0.5)'"
                   @blur="e => e.target.style.borderColor='rgba(255,231,186,0.2)'"
                   @keyup.enter="next" />
          </div>
          <button @click="next"
                  class="w-full py-4 rounded-full text-black text-lg font-black active:scale-95 transition-transform"
                  style="background:linear-gradient(135deg,#D4A020,#8B6000); box-shadow:0 12px 36px rgba(200,120,0,0.3);">
            開始設定 →
          </button>
        </div>

        <!-- Step 1: Birth year -->
        <div v-else-if="step === 1" key="birthyear" class="w-full max-w-md text-center">
          <div class="text-5xl mb-5">🎂</div>
          <h2 class="font-black mb-2" style="font-family:'Noto Serif TC',serif; font-size:clamp(1.4rem,5vw,2rem); color:#F2CF86;">
            你是哪一年出生的？
          </h2>
          <p class="mb-8 text-sm sm:text-base" style="color:rgba(255,231,190,0.55);">
            用來決定你那個年代的故事場景
          </p>

          <!-- Year picker -->
          <div class="flex items-center justify-center gap-6 mb-6">
            <button @click="draft.birthYear = Math.max(20, draft.birthYear - 1)"
                    class="w-14 h-14 rounded-full text-3xl font-black active:scale-90 transition-transform flex items-center justify-center"
                    style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15);">−</button>
            <div class="text-center min-w-[160px]">
              <div class="font-black leading-none" style="font-size:clamp(2.8rem,10vw,4.5rem); color:#F2CF86;">
                民國 {{ draft.birthYear }}
              </div>
              <div class="text-base mt-1 font-semibold" style="color:rgba(255,231,186,0.5);">
                西元 {{ draft.birthYear + 1911 }} 年
              </div>
            </div>
            <button @click="draft.birthYear = Math.min(65, draft.birthYear + 1)"
                    class="w-14 h-14 rounded-full text-3xl font-black active:scale-90 transition-transform flex items-center justify-center"
                    style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15);">＋</button>
          </div>

          <!-- Era preview -->
          <div class="rounded-2xl px-5 py-3.5 mb-8 inline-block"
               style="background:rgba(242,207,134,0.1); border:1px solid rgba(242,207,134,0.2);">
            <span class="text-sm font-bold" style="color:rgba(255,231,186,0.7);">你的全盛年代 →</span>
            <span class="text-base font-black ml-2" style="color:#F2CF86;">{{ currentEraLabel }}</span>
          </div>

          <button @click="next"
                  class="w-full py-4 rounded-full text-black text-lg font-black active:scale-95 transition-transform"
                  style="background:linear-gradient(135deg,#D4A020,#8B6000); box-shadow:0 12px 36px rgba(200,120,0,0.3);">
            下一步 →
          </button>
        </div>

        <!-- Step 2: Region -->
        <div v-else-if="step === 2" key="region" class="w-full max-w-lg">
          <div class="text-center mb-6">
            <div class="text-5xl mb-4">🗺️</div>
            <h2 class="font-black" style="font-family:'Noto Serif TC',serif; font-size:clamp(1.4rem,5vw,2rem); color:#F2CF86;">
              你從哪裡來？
            </h2>
            <p class="mt-1 text-sm sm:text-base" style="color:rgba(255,231,190,0.55);">點選你的出身地區</p>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button v-for="opt in REGION_OPTIONS" :key="opt.value"
                    class="rounded-2xl p-4 sm:p-5 text-left transition-all active:scale-95"
                    :style="optionStyle(draft.region === opt.value)"
                    @click="selectAndNext('region', opt.value)">
              <div class="text-3xl sm:text-4xl mb-2 leading-none">{{ opt.emoji }}</div>
              <div class="font-black text-base sm:text-lg" style="color:#F2CF86;">{{ opt.label }}</div>
              <div class="text-xs sm:text-sm mt-0.5 leading-snug" style="color:rgba(255,231,186,0.5);">{{ opt.desc }}</div>
            </button>
          </div>
        </div>

        <!-- Step 3: Occupation -->
        <div v-else-if="step === 3" key="occupation" class="w-full max-w-lg">
          <div class="text-center mb-6">
            <div class="text-5xl mb-4">💼</div>
            <h2 class="font-black" style="font-family:'Noto Serif TC',serif; font-size:clamp(1.4rem,5vw,2rem); color:#F2CF86;">
              你以前主要做什麼？
            </h2>
            <p class="mt-1 text-sm sm:text-base" style="color:rgba(255,231,190,0.55);">選一個最接近的</p>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button v-for="opt in OCCUPATION_OPTIONS" :key="opt.value"
                    class="rounded-2xl p-4 sm:p-5 text-left transition-all active:scale-95"
                    :style="optionStyle(draft.occupation === opt.value)"
                    @click="selectAndNext('occupation', opt.value)">
              <div class="text-3xl sm:text-4xl mb-2 leading-none">{{ opt.emoji }}</div>
              <div class="font-black text-base sm:text-lg" style="color:#F2CF86;">{{ opt.label }}</div>
              <div class="text-xs sm:text-sm mt-0.5 leading-snug" style="color:rgba(255,231,186,0.5);">{{ opt.desc }}</div>
            </button>
          </div>
        </div>

        <!-- Step 4: Family -->
        <div v-else-if="step === 4" key="family" class="w-full max-w-lg">
          <div class="text-center mb-6">
            <div class="text-5xl mb-4">🏠</div>
            <h2 class="font-black" style="font-family:'Noto Serif TC',serif; font-size:clamp(1.4rem,5vw,2rem); color:#F2CF86;">
              你的家庭是什麼樣子？
            </h2>
            <p class="mt-1 text-sm sm:text-base" style="color:rgba(255,231,190,0.55);">說的是你全盛時期的家</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button v-for="opt in FAMILY_OPTIONS" :key="opt.value"
                    class="rounded-2xl p-5 sm:p-6 text-left sm:text-center transition-all active:scale-95"
                    :style="optionStyle(draft.family === opt.value)"
                    @click="selectAndNext('family', opt.value)">
              <div class="text-4xl sm:text-5xl mb-3 leading-none">{{ opt.emoji }}</div>
              <div class="font-black text-lg sm:text-xl" style="color:#F2CF86;">{{ opt.label }}</div>
              <div class="text-sm mt-1 leading-snug" style="color:rgba(255,231,186,0.5);">{{ opt.desc }}</div>
            </button>
          </div>
        </div>

        <!-- Step 5: Done -->
        <div v-else-if="step === 5" key="done" class="w-full max-w-md text-center">
          <div class="text-6xl mb-5">🌟</div>
          <h2 class="font-black mb-3" style="font-family:'Noto Serif TC',serif; font-size:clamp(1.6rem,6vw,2.4rem); color:#F2CF86;">
            設定完成了！
          </h2>

          <!-- Profile summary card -->
          <div class="rounded-2xl p-6 mb-7 text-left"
               style="background:rgba(255,255,255,0.06); border:1px solid rgba(242,207,134,0.2);">
            <div v-if="draft.name" class="flex items-center gap-3 mb-4 pb-4"
                 style="border-bottom:1px solid rgba(255,255,255,0.08);">
              <div class="text-3xl">👵</div>
              <div class="text-2xl font-black" style="color:#F2CF86;">{{ draft.name }}</div>
            </div>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <span class="text-xl w-8 text-center">🎂</span>
                <span class="text-base font-semibold" style="color:rgba(255,231,186,0.8);">
                  民國 {{ draft.birthYear }} 年生・{{ currentEraLabel }}的故事
                </span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xl w-8 text-center">{{ REGION_OPTIONS.find(o=>o.value===draft.region)?.emoji }}</span>
                <span class="text-base font-semibold" style="color:rgba(255,231,186,0.8);">
                  {{ REGION_OPTIONS.find(o=>o.value===draft.region)?.label }} 出身
                </span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xl w-8 text-center">{{ OCCUPATION_OPTIONS.find(o=>o.value===draft.occupation)?.emoji }}</span>
                <span class="text-base font-semibold" style="color:rgba(255,231,186,0.8);">
                  {{ OCCUPATION_OPTIONS.find(o=>o.value===draft.occupation)?.label }}
                </span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xl w-8 text-center">{{ FAMILY_OPTIONS.find(o=>o.value===draft.family)?.emoji }}</span>
                <span class="text-base font-semibold" style="color:rgba(255,231,186,0.8);">
                  {{ FAMILY_OPTIONS.find(o=>o.value===draft.family)?.label }}
                </span>
              </div>
            </div>
          </div>

          <button @click="finish"
                  class="w-full py-5 rounded-full text-black text-xl font-black active:scale-95 transition-transform"
                  style="background:linear-gradient(135deg,#D4A020,#8B6000); box-shadow:0 14px 44px rgba(200,120,0,0.38);">
            開始我的故事 🌅
          </button>
          <button @click="back" class="mt-4 text-sm font-semibold opacity-40 hover:opacity-70 transition-opacity">
            重新設定
          </button>
        </div>

      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '../stores/profileStore'

const router  = useRouter()
const profile = useProfileStore()

const TOTAL_STEPS = 6

const draft = ref({
  name:       profile.name,
  birthYear:  profile.birthYear,
  region:     profile.region,
  occupation: profile.occupation,
  family:     profile.family,
})

const step = ref(0)

// Era label based on draft (not store)
const currentEraLabel = computed(() => {
  const y = draft.value.birthYear
  if (y <= 34) return '民國60年代'
  if (y <= 44) return '民國70年代'
  if (y <= 54) return '民國80年代'
  return '民國90年代'
})

const REGION_OPTIONS = [
  { value: 'south',    emoji: '🌊', label: '南部',  desc: '台語、廟會、虱目魚' },
  { value: 'north',    emoji: '🏙️', label: '北部',  desc: '工廠、基隆、城市生活' },
  { value: 'central',  emoji: '🌾', label: '中部',  desc: '稻田、夜市、彰化風情' },
  { value: 'east',     emoji: '🏔️', label: '東部',  desc: '花東、山海、純樸小鎮' },
  { value: 'island',   emoji: '🏝️', label: '離島',  desc: '澎湖、金馬、海風鹹味' },
  { value: 'military', emoji: '🏘️', label: '眷村',  desc: '眷村大院、南北口音' },
]

const OCCUPATION_OPTIONS = [
  { value: 'farming',   emoji: '🌾', label: '務農',   desc: '田間農作、曬穀、牛車' },
  { value: 'factory',   emoji: '🏭', label: '工廠',   desc: '輪班、機器聲、廠區生活' },
  { value: 'trade',     emoji: '🛒', label: '做生意', desc: '攤販、店面、斤斤計較' },
  { value: 'official',  emoji: '📋', label: '公務員', desc: '穩定、公文、制服上班' },
  { value: 'teacher',   emoji: '📚', label: '教師',   desc: '粉筆、黑板、學生叫老師' },
  { value: 'homemaker', emoji: '🍳', label: '家管',   desc: '灶腳、菜市場、照顧家人' },
]

const FAMILY_OPTIONS = [
  { value: 'alone',    emoji: '🪴', label: '獨居',      desc: '一個人、自在、安靜' },
  { value: 'children', emoji: '👨‍👩‍👧', label: '與子女同住', desc: '一起吃飯、天倫之樂' },
  { value: 'extended', emoji: '🏘️', label: '大家庭',    desc: '三代同堂、熱熱鬧鬧' },
]

const optionStyle = (selected) =>
  selected
    ? 'background:rgba(242,207,134,0.18); border:2px solid rgba(242,207,134,0.55); box-shadow:0 0 24px rgba(242,207,134,0.15);'
    : 'background:rgba(255,255,255,0.05); border:2px solid rgba(255,255,255,0.1);'

const next = () => { if (step.value < TOTAL_STEPS - 1) step.value++ }
const back = () => { if (step.value > 0) step.value-- }

const selectAndNext = (field, value) => {
  draft.value[field] = value
  setTimeout(next, 180)
}

const finish = () => {
  profile.name       = draft.value.name
  profile.birthYear  = draft.value.birthYear
  profile.region     = draft.value.region
  profile.occupation = draft.value.occupation
  profile.family     = draft.value.family
  profile.completeSetup()
  router.push({ name: 'lobby' })
}
</script>

<style scoped>
.step-fade-enter-active,
.step-fade-leave-active {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.step-fade-enter-from { opacity: 0; transform: translateX(24px); }
.step-fade-leave-to   { opacity: 0; transform: translateX(-16px); }
</style>
