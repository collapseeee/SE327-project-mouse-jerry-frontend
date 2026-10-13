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

  it('resolves /contact to the Contact route', () => {
    const route = router.resolve('/contact')
    expect(route.name).toBe('Contact')
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

  it('resolves /account, /purchase-page, /success, and /my-keys with requiresAuth meta', () => {
    const accountRoute = router.resolve('/account')
    expect(accountRoute.name).toBe('Account')
    expect(accountRoute.meta.requiresAuth).toBe(true)

    const purchaseRoute = router.resolve('/purchase-page')
    expect(purchaseRoute.name).toBe('Purchase')
    expect(purchaseRoute.meta.requiresAuth).toBe(true)

    const successRoute = router.resolve('/success')
    expect(successRoute.name).toBe('Success')
    expect(successRoute.meta.requiresAuth).toBe(true)

    const keysRoute = router.resolve('/my-keys')
    expect(keysRoute.name).toBe('Keys')
    expect(keysRoute.meta.requiresAuth).toBe(true)
  })

  it('redirects unauthenticated user visiting /cart to /login with query', async () => {
    await router.push('/')
    await router.push('/cart')
    expect(router.currentRoute.value.path).toBe('/login')
    expect(router.currentRoute.value.query.mode).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/cart')
  })

  it('redirects unauthenticated user visiting /account to /login with query', async () => {
    await router.push('/')
    await router.push('/account')
    expect(router.currentRoute.value.path).toBe('/login')
    expect(router.currentRoute.value.query.mode).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/account')
  })

  it('allows authenticated user to visit /cart and /account', async () => {
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'testuser' }, 'token-xyz')
    await router.push('/cart')
    expect(router.currentRoute.value.path).toBe('/cart')
    await router.push('/account')
    expect(router.currentRoute.value.path).toBe('/account')
  })

  it('resolves admin routes with requiresAuth and requiresAdmin', () => {
    const gamesRoute = router.resolve('/admin/games')
    expect(gamesRoute.name).toBe('AdminGames')
    expect(gamesRoute.meta.requiresAuth).toBe(true)
    expect(gamesRoute.meta.requiresAdmin).toBe(true)

    const newRoute = router.resolve('/admin/games/new')
    expect(newRoute.name).toBe('AdminGameNew')
    expect(newRoute.meta.requiresAdmin).toBe(true)

    const editRoute = router.resolve('/admin/games/elden-ring/edit')
    expect(editRoute.name).toBe('AdminGameEdit')
    expect(editRoute.params.id).toBe('elden-ring')
    expect(editRoute.meta.requiresAdmin).toBe(true)

    const categoriesRoute = router.resolve('/admin/categories')
    expect(categoriesRoute.name).toBe('AdminCategories')
    expect(categoriesRoute.meta.requiresAuth).toBe(true)
    expect(categoriesRoute.meta.requiresAdmin).toBe(true)
  })

  it('redirects non-admin user visiting admin route to /', async () => {
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 2, username: 'customer', role: 'ROLE_CUSTOMER' }, 'cust-token')
    await router.push('/')
    await router.push('/admin/games')
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('allows admin user to visit admin routes', async () => {
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 3, username: 'admin', role: 'ROLE_ADMIN' }, 'admin-token')
    await router.push('/admin/games')
    expect(router.currentRoute.value.path).toBe('/admin/games')
  })
})
