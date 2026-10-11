<script setup lang="ts">
import { ref, reactive } from 'vue'

const props = withDefaults(
  defineProps<{
    initialMode?: 'register' | 'login'
    serverError?: string
  }>(),
  {
    initialMode: 'register',
    serverError: ''
  }
)

const emit = defineEmits<{
  (e: 'submit', data: { mode: 'register' | 'login'; username: string; email?: string; password: string }): void
  (e: 'mode-change', mode: 'register' | 'login'): void
}>()

const isRegister = ref(props.initialMode === 'register')
const errorMessage = ref('')
const successMessage = ref('')

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

function toggleMode() {
  isRegister.value = !isRegister.value
  errorMessage.value = ''
  successMessage.value = ''
  emit('mode-change', isRegister.value ? 'register' : 'login')
}

function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!form.username.trim() || !form.password) {
    errorMessage.value = 'Please fill in all required fields.'
    return
  }

  if (isRegister.value) {
    if (!form.email.trim()) {
      errorMessage.value = 'Please provide an email address.'
      return
    }
    if (form.password !== form.confirmPassword) {
      errorMessage.value = 'Passwords do not match.'
      return
    }
    successMessage.value = 'Account registration submitted successfully!'
    emit('submit', {
      mode: 'register',
      username: form.username,
      email: form.email,
      password: form.password
    })
  } else {
    successMessage.value = 'Login submitted successfully!'
    emit('submit', {
      mode: 'login',
      username: form.username,
      password: form.password
    })
  }
}
</script>

<template>
  <div
    class="w-full max-w-4xl rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/10"
  >
    <!-- Left Hero / Brand Panel -->
    <div
      class="w-full md:w-5/12 bg-auth-card-overlay p-8 sm:p-10 flex flex-col justify-between text-white backdrop-blur-md relative z-10"
    >
      <div>
        <h2 class="font-black text-2xl tracking-wider uppercase mb-8">
          MOUSE JERRY
        </h2>

        <h1 class="font-extrabold text-3xl sm:text-4xl leading-tight">
          Unlock the<br />
          ultimate gaming<br />
          experience.
        </h1>
      </div>

      <div class="mt-12 md:mt-auto pt-6 text-xs text-white/70 leading-relaxed border-t border-white/10">
        <p>Experiencing issues?</p>
        <p>
          Get assistance via
          <a
            href="mailto:support@mousejerry.com"
            class="text-white underline hover:text-accent-yellow transition-colors font-medium"
          >
            support@mousejerry.com
          </a>
        </p>
      </div>
    </div>

    <!-- Right Form Panel -->
    <div class="w-full md:w-7/12 bg-bg-surface p-8 sm:p-12 flex flex-col justify-center relative z-10">
      <h3 class="font-black text-2xl sm:text-3xl text-text-dark tracking-tight uppercase mb-6">
        {{ isRegister ? 'CREATE ACCOUNT' : 'LOGIN' }}
      </h3>

      <form @submit.prevent="handleSubmit" class="space-y-4" data-test="auth-form">
        <!-- Username Field -->
        <div>
          <label for="username" class="sr-only">Username</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            placeholder="Username"
            required
            class="w-full px-4 py-3 rounded-lg border border-auth-border bg-white text-text-dark placeholder:text-text-muted/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            data-test="input-username"
          />
        </div>

        <!-- Email Field (Register Only) -->
        <div v-if="isRegister">
          <label for="email" class="sr-only">Email Address</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="Email Address"
            required
            class="w-full px-4 py-3 rounded-lg border border-auth-border bg-white text-text-dark placeholder:text-text-muted/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            data-test="input-email"
          />
        </div>

        <!-- Password Field -->
        <div>
          <label for="password" class="sr-only">{{ isRegister ? 'Create Password' : 'Password' }}</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            :placeholder="isRegister ? 'Create Password' : 'Password'"
            required
            class="w-full px-4 py-3 rounded-lg border border-auth-border bg-white text-text-dark placeholder:text-text-muted/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            data-test="input-password"
          />
        </div>

        <!-- Confirm Password Field (Register Only) -->
        <div v-if="isRegister">
          <label for="confirmPassword" class="sr-only">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            placeholder="Confirm Password"
            required
            class="w-full px-4 py-3 rounded-lg border border-auth-border bg-white text-text-dark placeholder:text-text-muted/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            data-test="input-confirm-password"
          />
        </div>

        <!-- Toggle Auth Mode Link -->
        <div class="pt-1 text-xs sm:text-sm text-text-muted flex items-center">
          <span>{{ isRegister ? 'Already have an account?' : "Don't have an account?" }}</span>
          <button
            type="button"
            @click="toggleMode"
            class="ml-1 text-primary hover:text-secondary font-semibold cursor-pointer transition-colors focus:outline-none underline-offset-2 hover:underline"
            data-test="toggle-mode-btn"
          >
            {{ isRegister ? 'Login here' : 'Register here' }}
          </button>
        </div>

        <!-- Feedback Alert -->
        <div v-if="serverError || errorMessage" class="text-accent-red text-xs font-semibold pt-1" data-test="error-msg">
          {{ serverError || errorMessage }}
        </div>
        <div v-if="successMessage" class="text-accent-green text-xs font-semibold pt-1" data-test="success-msg">
          {{ successMessage }}
        </div>

        <!-- Submit Button -->
        <div class="pt-2">
          <button
            type="submit"
            class="w-full py-3 px-6 rounded-lg font-bold text-white bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover shadow-md hover:shadow-lg transition-all text-sm sm:text-base cursor-pointer active:scale-[0.99]"
            data-test="submit-btn"
          >
            {{ isRegister ? 'Register' : 'Login' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
