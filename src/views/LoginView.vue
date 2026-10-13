<script lang="ts">
export default {
  name: 'LoginView'
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthCard from '../components/auth/AuthCard.vue'
import loginBg from '../assets/login-bg.png'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const serverError = ref('')
const serverSuccess = ref('')

const initialMode = computed<'register' | 'login'>(() => {
  if (route?.query?.mode === 'login') {
    return 'login'
  }
  return 'register'
})

const getQueryRedirect = (): string => {
  const target = route.query?.redirect
  return typeof target === 'string' ? target.trim() : ''
}

const resolveAdminRedirect = (target: string): string => {
  return target.startsWith('/admin') ? target : '/admin/games'
}

const resolveCustomerRedirect = (target: string): string => {
  return target && !target.startsWith('/admin') ? target : '/'
}

const getRedirectTarget = (): string => {
  const target = getQueryRedirect()
  return authStore.isAdmin ? resolveAdminRedirect(target) : resolveCustomerRedirect(target)
}

const handleLoginAction = async (username: string, password: string) => {
  const result = await authStore.login({ username, password })
  if (result.success) {
    router?.push(getRedirectTarget())
    return
  }
  serverError.value = result.error || 'Login failed. Please check your credentials.'
}

const autoLoginAfterRegister = async (username: string, password: string) => {
  const loginResult = await authStore.login({
    username,
    password
  })
  if (loginResult.success) {
    router?.push(getRedirectTarget())
    return
  }
  serverError.value = loginResult.error || 'Registration succeeded, but auto-login failed. Please sign in.'
  serverSuccess.value = ''
}

const handleRegisterAction = async (data: { username: string; email?: string; password: string; confirmPassword?: string }) => {
  const confirmPassword = data.confirmPassword ? data.confirmPassword : data.password
  const email = data.email ? data.email : ''
  const result = await authStore.register({
    username: data.username,
    email,
    password: data.password,
    confirmPassword
  })
  if (!result.success) {
    serverError.value = result.error || 'Registration failed.'
    serverSuccess.value = ''
    return
  }
  serverSuccess.value = 'Registration successful! Signing in...'
  await autoLoginAfterRegister(data.username, data.password)
}

const handleAuthSubmit = async (data: { mode: 'register' | 'login'; username: string; email?: string; password: string; confirmPassword?: string }) => {
  serverError.value = ''
  serverSuccess.value = ''
  if (data.mode === 'login') {
    await handleLoginAction(data.username, data.password)
    return
  }
  await handleRegisterAction(data)
}
</script>

<template>
  <div
    class="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-auth-bg relative overflow-hidden bg-cover bg-center bg-no-repeat"
    :style="{ backgroundImage: `url(${loginBg})` }"
    data-test="login-page-container"
  >
    <!-- Ambient glows matching cosmic background -->
    <div
      class="absolute -top-32 -left-32 w-96 h-96 bg-primary/30 rounded-full blur-3xl pointer-events-none"
      aria-hidden="true"
    ></div>
    <div
      class="absolute -bottom-32 -right-32 w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none"
      aria-hidden="true"
    ></div>

    <!-- Auth Card Component -->
    <AuthCard
      :initial-mode="initialMode"
      :server-error="serverError"
      :server-success="serverSuccess"
      @submit="handleAuthSubmit"
      @mode-change="serverError = ''; serverSuccess = ''"
    />
  </div>
</template>
