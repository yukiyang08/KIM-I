<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="modelValue"
           class="fixed inset-0 z-[200] flex items-center justify-center px-6"
           style="background: rgba(0,0,0,0.65); backdrop-filter: blur(6px);"
           @click.self="$emit('update:modelValue', false)">

        <div class="w-full max-w-sm rounded-[28px] overflow-hidden"
             style="background: linear-gradient(160deg, #1E1608, #140E05);
                    border: 1px solid rgba(200,148,40,0.35);
                    box-shadow: 0 32px 80px rgba(0,0,0,0.7);">

          <!-- Header -->
          <div class="px-7 pt-8 pb-5 text-center border-b" style="border-color: rgba(200,148,40,0.15);">
            <div class="text-4xl mb-3">{{ mode === 'login' ? '🔑' : '✨' }}</div>
            <h2 class="text-2xl font-black" style="color: #F2CF86;">
              {{ mode === 'login' ? '登入帳號' : '建立帳號' }}
            </h2>
            <p class="text-sm mt-1.5" style="color: rgba(255,215,150,0.45);">
              {{ mode === 'login' ? '登入後可跨裝置同步遊戲紀錄' : '建立帳號，永久保存你的進度' }}
            </p>
          </div>

          <!-- Form -->
          <div class="px-7 py-6 flex flex-col gap-4">

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold tracking-widest uppercase"
                     style="color: rgba(255,215,150,0.5);">電子郵件</label>
              <input
                v-model="email"
                type="email"
                placeholder="your@email.com"
                autocomplete="email"
                class="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style="background: rgba(255,255,255,0.06);
                       border: 1px solid rgba(200,148,40,0.3);
                       color: rgba(255,231,186,0.9);"
                @focus="e => e.target.style.borderColor='rgba(200,148,40,0.7)'"
                @blur="e => e.target.style.borderColor='rgba(200,148,40,0.3)'"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold tracking-widest uppercase"
                     style="color: rgba(255,215,150,0.5);">密碼</label>
              <input
                v-model="password"
                type="password"
                placeholder="至少 6 個字元"
                autocomplete="current-password"
                class="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style="background: rgba(255,255,255,0.06);
                       border: 1px solid rgba(200,148,40,0.3);
                       color: rgba(255,231,186,0.9);"
                @focus="e => e.target.style.borderColor='rgba(200,148,40,0.7)'"
                @blur="e => e.target.style.borderColor='rgba(200,148,40,0.3)'"
                @keyup.enter="submit"
              />
            </div>

            <!-- Error -->
            <p v-if="errorMsg" class="text-sm text-center rounded-xl px-4 py-2.5"
               style="background: rgba(220,50,50,0.15); color: #FF9090; border: 1px solid rgba(220,50,50,0.3);">
              {{ errorMsg }}
            </p>

            <!-- Success (signup email sent) -->
            <p v-if="successMsg" class="text-sm text-center rounded-xl px-4 py-2.5"
               style="background: rgba(50,200,100,0.12); color: #80E8A0; border: 1px solid rgba(50,200,100,0.25);">
              {{ successMsg }}
            </p>

            <!-- Submit -->
            <button
              @click="submit"
              :disabled="loading"
              class="w-full py-3.5 rounded-xl text-sm font-black transition-all active:scale-[0.98]"
              style="background: linear-gradient(135deg, #D4A020, #8B6000); color: #1E1608;">
              {{ loading ? '處理中…' : (mode === 'login' ? '登入' : '建立帳號') }}
            </button>

            <!-- Toggle mode -->
            <button
              @click="toggleMode"
              class="text-sm text-center py-1 transition-colors"
              style="color: rgba(255,215,150,0.45);"
              @mouseover="e => e.target.style.color='rgba(255,215,150,0.85)'"
              @mouseleave="e => e.target.style.color='rgba(255,215,150,0.45)'">
              {{ mode === 'login' ? '還沒有帳號？建立帳號' : '已有帳號？直接登入' }}
            </button>

            <div class="flex items-center gap-3">
              <div class="flex-1 h-px" style="background: rgba(200,148,40,0.15);"></div>
              <span class="text-xs" style="color: rgba(255,215,150,0.3);">或</span>
              <div class="flex-1 h-px" style="background: rgba(200,148,40,0.15);"></div>
            </div>

            <!-- Guest mode -->
            <button
              @click="$emit('update:modelValue', false)"
              class="w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
              style="background: rgba(255,255,255,0.05);
                     border: 1px solid rgba(255,255,255,0.1);
                     color: rgba(255,231,186,0.55);">
              以訪客身份繼續
            </button>

          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useProfileStore } from '../stores/profileStore'

defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue'])

const profileStore = useProfileStore()

const mode      = ref('login')
const email     = ref('')
const password  = ref('')
const loading   = ref(false)
const errorMsg  = ref('')
const successMsg = ref('')

const toggleMode = () => {
  mode.value = mode.value === 'login' ? 'signup' : 'login'
  errorMsg.value = ''
  successMsg.value = ''
}

const ERROR_MAP = {
  'Invalid login credentials': '電子郵件或密碼錯誤',
  'Email not confirmed': '請先到信箱驗證帳號',
  'User already registered': '此電子郵件已註冊，請直接登入',
  'Password should be at least 6 characters': '密碼至少需要 6 個字元',
}

const submit = async () => {
  errorMsg.value = ''
  successMsg.value = ''
  if (!email.value || !password.value) {
    errorMsg.value = '請填寫電子郵件和密碼'
    return
  }
  loading.value = true
  try {
    const fn = mode.value === 'login' ? profileStore.login : profileStore.signup
    const { error } = await fn(email.value, password.value)
    if (error) {
      errorMsg.value = ERROR_MAP[error.message] ?? error.message
    } else if (mode.value === 'signup') {
      successMsg.value = '帳號建立成功！請到信箱點擊驗證連結後再登入。'
    } else {
      emit('update:modelValue', false)
    }
  } catch (e) {
    errorMsg.value = e?.message ?? '發生錯誤，請重試'
    console.error('[AuthModal]', e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
