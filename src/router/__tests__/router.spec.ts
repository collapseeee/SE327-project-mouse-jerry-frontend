import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import router from '../index'
import { useAuthStore } from '@/stores/auth'

describe('router', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('resolves / to the Home route', () => {
    const route = router.resolve('/')
    expect(route.name).toBe('Home')
  })

  it('resolves /login to the Login route', () => {
    const route = router.resolve('/login')
    expect(route.name).toBe('Login')
  })

  it('resolves /register to the Register route', () => {
    const route = router.resolve('/register')
    expect(route.name).toBe('Register')
  })

  it('resolves /category/:category to the Category route', () => {
    const route = router.resolve('/category/Fighting')
    expect(route.name).toBe('Category')
    expect(route.params.category).toBe('Fighting')
  })

  it('resolves /search to the Search route', () => {
    const route = router.resolve('/search')
    expect(route.name).toBe('Search')
  })

  it('resolves /product/:id to the GameDetail route', () => {
    const route = router.resolve('/product/vampire-survivors-emergency-meeting')
    expect(route.name).toBe('GameDetail')
    expect(route.params.id).toBe('vampire-survivors-emergency-meeting')
  })

  it('resolves /cart to the Cart route with requiresAuth meta', () => {
    const route = router.resolve('/cart')
    expect(route.name).toBe('Cart')
    expect(route.meta.requiresAuth).toBe(true)
  })

  it('redirects unauthenticated user visiting /cart to /login with query', async () => {
    await router.push('/')
    await router.push('/cart')
    expect(router.currentRoute.value.path).toBe('/login')
    expect(router.currentRoute.value.query.mode).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/cart')
  })

  it('allows authenticated user to visit /cart', async () => {
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'testuser' }, 'token-xyz')
    await router.push('/cart')
    expect(router.currentRoute.value.path).toBe('/cart')
  })
})
