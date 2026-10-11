<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthCard from '../components/auth/AuthCard.vue'
import loginBg from '../assets/login-bg.png'

const route = useRoute()
const router = useRouter()

const initialMode = computed<'register' | 'login'>(() => {
  if (route?.query?.mode === 'login') {
    return 'login'
  }
  return 'register'
})

function handleAuthSubmit(data: { mode: 'register' | 'login'; username: string; email?: string; password: string }) {
  if (data.mode === 'login') {
    router?.push('/')
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
      @submit="handleAuthSubmit"
    />
  </div>
</template>
