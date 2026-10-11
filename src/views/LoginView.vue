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

const initialMode = computed<'register' | 'login'>(() => {
  if (route?.query?.mode === 'login') {
    return 'login'
  }
  return 'register'
})

async function handleAuthSubmit(data: { mode: 'register' | 'login'; username: string; email?: string; password: string; confirmPassword?: string }) {
  serverError.value = ''
  if (data.mode === 'login') {
    const result = await authStore.login({
      username: data.username,
      password: data.password
    })
    if (result.success) {
      router?.push('/')
    } else {
      serverError.value = result.error || 'Login failed. Please check your credentials.'
    }
  } else {
    const result = await authStore.register({
      username: data.username,
      email: data.email || '',
      password: data.password,
      confirmPassword: data.confirmPassword || data.password
    })
    if (result.success) {
      // Auto login after registration
      const loginResult = await authStore.login({
        username: data.username,
        password: data.password
      })
      if (loginResult.success) {
        router?.push('/')
      } else {
        serverError.value = loginResult.error || 'Registration succeeded, but auto-login failed. Please sign in.'
      }
    } else {
      serverError.value = result.error || 'Registration failed.'
    }
  }
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
      @submit="handleAuthSubmit"
      @mode-change="serverError = ''"
    />
  </div>
</template>
