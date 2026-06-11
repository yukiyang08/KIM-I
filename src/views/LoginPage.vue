<template>
  <div class="h-full w-full flex items-center justify-center px-5 font-['Outfit','Noto_Sans_TC']"
       style="background: radial-gradient(ellipse at 50% 0%, #221A0C 0%, #130E06 55%, #0A0804 100%);">

    <div class="w-full max-w-sm">
      <!-- Logo / Title -->
      <div class="text-center mb-8">
        <div class="text-5xl mb-3">🏮</div>
        <h1 class="font-black tracking-[0.08em]"
            style="font-family:'Noto Serif TC',serif; font-size:2rem; color:#F2CF86;">
          金憶 KIM-I
        </h1>
        <p class="text-sm mt-1" style="color:rgba(255,231,186,0.5);">認知訓練・懷舊故事</p>
      </div>

      <!-- Tab 切換 -->
      <div class="flex rounded-xl overflow-hidden mb-6"
           style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);">
        <button class="flex-1 py-2.5 text-sm font-black transition-all"
                :style="mode === 'login'
                  ? 'background:rgba(242,207,134,0.18); color:#F2CF86;'
                  : 'color:rgba(255,231,186,0.4);'"
                @click="mode = 'login'; errorMsg = ''">登入</button>
        <button class="flex-1 py-2.5 text-sm font-black transition-all"
                :style="mode === 'signup'
                  ? 'background:rgba(242,207,134,0.18); color:#F2CF86;'
                  : 'color:rgba(255,231,186,0.4);'"
                @click="mode = 'signup'; errorMsg = ''">註冊</button>
      </div>

      <!-- Form -->
      <div class="rounded-2xl p-5 space-y-4"
           style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09);">
        <div>
          <label class="block text-xs font-bold mb-1.5" style="color:rgba(255,231,186,0.55);">電子郵件</label>
          <input v-model="email" type="email" placeholder="example@email.com"
                 class="w-full px-4 py-3 rounded-xl text-sm outline-none"
                 style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,231,186,0.15); color:white;"
                 @keyup.enter="submit" />
        </div>
        <div>
          <label class="block text-xs font-bold mb-1.5" style="color:rgba(255,231,186,0.55);">密碼</label>
          <input v-model="password" type="password" placeholder="至少 6 個字"
                 class="w-full px-4 py-3 rounded-xl text-sm outline-none"
                 style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,231,186,0.15); color:white;"
                 @keyup.enter="submit" />
        </div>

        <p v-if="errorMsg" class="text-xs text-center" style="color:#FF9090;">{{ errorMsg }}</p>
        <p v-if="successMsg" class="text-xs text-center" style="color:#90FFB0;">{{ successMsg }}</p>

        <button @click="submit" :disabled="loading"
                class="w-full py-3.5 rounded-xl font-black text-base transition-all active:scale-95"
                style="background:linear-gradient(135deg,#D4A020,#8B6000); color:#2A1808;">
          {{ loading ? '處理中…' : mode === 'login' ? '登入' : '建立帳號' }}
        </button>
      </div>

      <!-- 跳過 -->
      <button class="mt-5 w-full text-center text-sm font-semibold"
              style="color:rgba(255,231,186,0.3);"
              @click="router.push({ name: 'lobby' })">
        先不用，繼續使用訪客模式 →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '../stores/profileStore'

const router  = useRouter()
const profile = useProfileStore()

const mode       = ref('login')
const email      = ref('')
const password   = ref('')
const loading    = ref(false)
const errorMsg   = ref('')
const successMsg = ref('')

const ERROR_MAP = {
  'Invalid login credentials':        '帳號或密碼錯誤',
  'Email not confirmed':              '請先至信箱驗證帳號',
  'User already registered':          '此信箱已被註冊，請直接登入',
  'Password should be at least 6':    '密碼至少需要 6 個字元',
}

const friendlyError = (msg) => {
  for (const [key, val] of Object.entries(ERROR_MAP)) {
    if (msg?.includes(key)) return val
  }
  return msg || '發生錯誤，請稍後再試'
}

const submit = async () => {
  errorMsg.value   = ''
  successMsg.value = ''
  if (!email.value || !password.value) {
    errorMsg.value = '請填寫信箱和密碼'
    return
  }
  loading.value = true

  if (mode.value === 'login') {
    const { error } = await profile.login(email.value, password.value)
    if (error) {
      errorMsg.value = friendlyError(error.message)
    } else {
      router.push({ name: 'lobby' })
    }
  } else {
    const { error } = await profile.signup(email.value, password.value)
    if (error) {
      errorMsg.value = friendlyError(error.message)
    } else {
      successMsg.value = '註冊成功！請至信箱點擊驗證連結後登入。'
      mode.value = 'login'
    }
  }

  loading.value = false
}
</script>
