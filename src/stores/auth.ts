import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginPayload, RegisterPayload } from '@/types/auth'
import { loginUser, registerUser, logoutUser } from '@/services/authApi'

const STORAGE_KEY_TOKEN = 'se327_auth_token'
const STORAGE_KEY_USER = 'se327_auth_user'

const loadSavedUser = (): User | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_USER)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(STORAGE_KEY_TOKEN))
  const user = ref<User | null>(loadSavedUser())
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => Boolean(token.value && user.value))
  const currentUsername = computed(() => user.value?.username || '')
  const isAdmin = computed(() => user.value?.role === 'ROLE_ADMIN')

  async function login(payload: LoginPayload) {
    isLoading.value = true
    error.value = null
    try {
      const res = await loginUser(payload)
      token.value = res.token
      user.value = {
        id: res.id,
        username: res.username,
        email: res.email,
        role: res.role
      }
      localStorage.setItem(STORAGE_KEY_TOKEN, res.token)
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user.value))
      return { success: true, user: user.value }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed'
      error.value = message
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  async function register(payload: RegisterPayload) {
    isLoading.value = true
    error.value = null
    try {
      const res = await registerUser(payload)
      return { success: true, message: res.message }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      error.value = message
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    if (token.value) {
      await logoutUser(token.value)
    }
    token.value = null
    user.value = null
    error.value = null
    localStorage.removeItem(STORAGE_KEY_TOKEN)
    localStorage.removeItem(STORAGE_KEY_USER)
  }

  function setUserSession(newUser: User, newToken: string) {
    user.value = newUser
    token.value = newToken
    localStorage.setItem(STORAGE_KEY_TOKEN, newToken)
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser))
  }

  return {
    token,
    user,
    isLoading,
    error,
    isAuthenticated,
    currentUsername,
    isAdmin,
    login,
    register,
    logout,
    setUserSession
  }
})
