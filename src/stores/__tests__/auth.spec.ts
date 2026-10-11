import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'
import * as authApi from '@/services/authApi'

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('initializes with null user when localStorage is empty', () => {
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
    expect(store.currentUsername).toBe('')
    expect(store.isAdmin).toBe(false)
  })

  it('initializes with saved user from localStorage when available', () => {
    const savedUser = { id: 1, username: 'thainchai', email: 'test@example.com', role: 'ROLE_ADMIN' }
    localStorage.setItem('se327_auth_token', 'valid-token')
    localStorage.setItem('se327_auth_user', JSON.stringify(savedUser))

    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(true)
    expect(store.currentUsername).toBe('thainchai')
    expect(store.isAdmin).toBe(true)
  })

  it('safely handles corrupted JSON in localStorage', () => {
    localStorage.setItem('se327_auth_user', 'invalid-json{{{')
    const store = useAuthStore()
    expect(store.user).toBeNull()
  })

  it('performs successful login and stores token and user in localStorage', async () => {
    const mockAuthResponse = {
      token: 'jwt-token-xyz',
      id: 10,
      username: 'jerry',
      email: 'jerry@example.com',
      role: 'ROLE_CUSTOMER'
    }

    vi.spyOn(authApi, 'loginUser').mockResolvedValueOnce(mockAuthResponse)

    const store = useAuthStore()
    const result = await store.login({ username: 'jerry', password: 'password123' })

    expect(result.success).toBe(true)
    expect(store.isAuthenticated).toBe(true)
    expect(store.currentUsername).toBe('jerry')
    expect(store.token).toBe('jwt-token-xyz')
    expect(localStorage.getItem('se327_auth_token')).toBe('jwt-token-xyz')
    expect(JSON.parse(localStorage.getItem('se327_auth_user') || '{}').username).toBe('jerry')
  })

  it('handles login failure properly', async () => {
    vi.spyOn(authApi, 'loginUser').mockRejectedValueOnce(new Error('Invalid username or password'))

    const store = useAuthStore()
    const result = await store.login({ username: 'jerry', password: 'wrong' })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid username or password')
    expect(store.error).toBe('Invalid username or password')
    expect(store.isAuthenticated).toBe(false)
  })

  it('handles login failure with non-Error object', async () => {
    vi.spyOn(authApi, 'loginUser').mockRejectedValueOnce('Unknown error string')

    const store = useAuthStore()
    const result = await store.login({ username: 'jerry', password: 'wrong' })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Login failed')
  })

  it('performs successful registration', async () => {
    vi.spyOn(authApi, 'registerUser').mockResolvedValueOnce({
      message: 'User registered successfully',
      id: 5,
      username: 'mouse'
    })

    const store = useAuthStore()
    const result = await store.register({
      username: 'mouse',
      email: 'mouse@example.com',
      password: 'password123'
    })

    expect(result.success).toBe(true)
    expect(result.message).toBe('User registered successfully')
  })

  it('handles registration failure', async () => {
    vi.spyOn(authApi, 'registerUser').mockRejectedValueOnce(new Error('Username taken'))

    const store = useAuthStore()
    const result = await store.register({
      username: 'mouse',
      email: 'mouse@example.com',
      password: 'password123'
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Username taken')
  })

  it('handles registration failure with non-Error object', async () => {
    vi.spyOn(authApi, 'registerUser').mockRejectedValueOnce('Some failure string')

    const store = useAuthStore()
    const result = await store.register({
      username: 'mouse',
      email: 'mouse@example.com',
      password: 'password123'
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Registration failed')
  })

  it('clears state and removes credentials on logout', async () => {
    const logoutSpy = vi.spyOn(authApi, 'logoutUser').mockResolvedValueOnce()

    const store = useAuthStore()
    store.setUserSession({ id: 1, username: 'thainchai' }, 'valid-token')
    expect(store.isAuthenticated).toBe(true)

    await store.logout()

    expect(logoutSpy).toHaveBeenCalledWith('valid-token')
    expect(store.isAuthenticated).toBe(false)
    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
    expect(localStorage.getItem('se327_auth_token')).toBeNull()
    expect(localStorage.getItem('se327_auth_user')).toBeNull()
  })

  it('sets user session directly with setUserSession', () => {
    const store = useAuthStore()
    store.setUserSession({ id: 99, username: 'adminuser', role: 'ROLE_ADMIN' }, 'admin-token')

    expect(store.isAuthenticated).toBe(true)
    expect(store.currentUsername).toBe('adminuser')
    expect(store.isAdmin).toBe(true)
  })
})
