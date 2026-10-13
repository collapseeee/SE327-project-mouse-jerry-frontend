import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import LoginView from '../LoginView.vue'
import AuthCard from '../../components/auth/AuthCard.vue'
import { useAuthStore } from '@/stores/auth'

const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    path: '/login',
    query: {}
  })),
  useRouter: vi.fn(() => ({
    push: mockPush
  }))
}))

describe('LoginView', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    mockPush.mockClear()
    vi.restoreAllMocks()
  })

  it('renders the login page container and AuthCard', () => {
    const wrapper = mount(LoginView, {
      global: {
        stubs: {
          AuthCard: true
        }
      }
    })

    expect(wrapper.find('[data-test="login-page-container"]').exists()).toBe(true)
    expect(wrapper.findComponent(AuthCard).exists()).toBe(true)
  })

  it('renders AuthCard without stubs and allows interactions', () => {
    const wrapper = mount(LoginView)

    expect(wrapper.text()).toContain('MOUSE JERRY')
    expect(wrapper.text()).toContain('CREATE ACCOUNT')
    expect(wrapper.find('button[data-test="submit-btn"]').text()).toBe('Register')
  })

  it('handles successful login and redirects to home', async () => {
    const authStore = useAuthStore()
    vi.spyOn(authStore, 'login').mockResolvedValueOnce({
      success: true,
      user: { id: 1, username: 'thainchai' }
    })

    const wrapper = mount(LoginView)
    const authCard = wrapper.findComponent(AuthCard)

    authCard.vm.$emit('submit', {
      mode: 'login',
      username: 'thainchai',
      password: 'password123'
    })
    await flushPromises()

    expect(authStore.login).toHaveBeenCalledWith({
      username: 'thainchai',
      password: 'password123'
    })
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('handles failed login and displays server error', async () => {
    const authStore = useAuthStore()
    vi.spyOn(authStore, 'login').mockResolvedValueOnce({
      success: false,
      error: 'Invalid credentials'
    })

    const wrapper = mount(LoginView)
    const authCard = wrapper.findComponent(AuthCard)

    authCard.vm.$emit('submit', {
      mode: 'login',
      username: 'thainchai',
      password: 'wrongpassword'
    })
    await flushPromises()

    expect(mockPush).not.toHaveBeenCalled()
    expect(authCard.props('serverError')).toBe('Invalid credentials')
  })

  it('handles successful register and redirects after auto-login', async () => {
    const authStore = useAuthStore()
    vi.spyOn(authStore, 'register').mockResolvedValueOnce({
      success: true,
      message: 'Created'
    })
    vi.spyOn(authStore, 'login').mockResolvedValueOnce({
      success: true,
      user: { id: 2, username: 'newuser' }
    })

    const wrapper = mount(LoginView)
    const authCard = wrapper.findComponent(AuthCard)

    authCard.vm.$emit('submit', {
      mode: 'register',
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123'
    })
    await flushPromises()

    expect(authStore.register).toHaveBeenCalledWith({
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    })
    expect(authStore.login).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('handles registration success but auto-login failure with error feedback', async () => {
    const authStore = useAuthStore()
    vi.spyOn(authStore, 'register').mockResolvedValueOnce({
      success: true,
      message: 'Created'
    })
    vi.spyOn(authStore, 'login').mockResolvedValueOnce({
      success: false,
      error: 'Cannot auto-login'
    })

    const wrapper = mount(LoginView)
    const authCard = wrapper.findComponent(AuthCard)

    authCard.vm.$emit('submit', {
      mode: 'register',
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123'
    })
    await flushPromises()

    expect(authStore.register).toHaveBeenCalled()
    expect(authStore.login).toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
    expect(authCard.props('serverError')).toBe('Cannot auto-login')
  })

  it('handles failed register and sets server error', async () => {
    const authStore = useAuthStore()
    vi.spyOn(authStore, 'register').mockResolvedValueOnce({
      success: false,
      error: 'Username already in use'
    })

    const wrapper = mount(LoginView)
    const authCard = wrapper.findComponent(AuthCard)

    authCard.vm.$emit('submit', {
      mode: 'register',
      username: 'existinguser',
      email: 'existing@example.com',
      password: 'password123'
    })
    await flushPromises()

    expect(mockPush).not.toHaveBeenCalled()
    expect(authCard.props('serverError')).toBe('Username already in use')
  })

  it('sets initialMode to login when query.mode is login', async () => {
    const { useRoute } = await import('vue-router')
    vi.mocked(useRoute).mockReturnValueOnce({
      path: '/login',
      query: { mode: 'login' }
    } as unknown as ReturnType<typeof useRoute>)

    const wrapper = mount(LoginView)
    const authCard = wrapper.findComponent(AuthCard)
    expect(authCard.props('initialMode')).toBe('login')
  })

  it('handles login failure without error message and falls back to default message', async () => {
    const authStore = useAuthStore()
    vi.spyOn(authStore, 'login').mockResolvedValueOnce({
      success: false,
      error: ''
    })

    const wrapper = mount(LoginView)
    const authCard = wrapper.findComponent(AuthCard)

    authCard.vm.$emit('submit', {
      mode: 'login',
      username: 'user',
      password: 'pwd'
    })
    await flushPromises()
    expect(authCard.props('serverError')).toBe('Login failed. Please check your credentials.')
  })

  it('handles registration without email and confirmPassword, with default error fallbacks', async () => {
    const authStore = useAuthStore()
    vi.spyOn(authStore, 'register').mockResolvedValueOnce({
      success: false,
      error: ''
    })

    const wrapper = mount(LoginView)
    const authCard = wrapper.findComponent(AuthCard)

    authCard.vm.$emit('submit', {
      mode: 'register',
      username: 'user2',
      password: 'pwd'
    })
    await flushPromises()
    expect(authStore.register).toHaveBeenCalledWith({
      username: 'user2',
      email: '',
      password: 'pwd',
      confirmPassword: 'pwd'
    })
    expect(authCard.props('serverError')).toBe('Registration failed.')

    // Also test autoLogin failure without error message
    vi.spyOn(authStore, 'register').mockResolvedValueOnce({
      success: true,
      message: 'OK'
    })
    vi.spyOn(authStore, 'login').mockResolvedValueOnce({
      success: false,
      error: ''
    })

    authCard.vm.$emit('submit', {
      mode: 'register',
      username: 'user3',
      password: 'pwd'
    })
    await flushPromises()
    expect(authCard.props('serverError')).toBe('Registration succeeded, but auto-login failed. Please sign in.')
  })

  it('redirects to redirect query param on successful login when provided', async () => {
    const vueRouter = await import('vue-router')
    vi.mocked(vueRouter.useRoute).mockReturnValueOnce({
      path: '/login',
      query: { mode: 'login', redirect: '/cart' }
    } as unknown as ReturnType<typeof vueRouter.useRoute>)

    const authStore = useAuthStore()
    vi.spyOn(authStore, 'login').mockResolvedValueOnce({
      success: true,
      user: { id: 1, username: 'thainchai' }
    })

    const wrapper = mount(LoginView)
    const authCard = wrapper.findComponent(AuthCard)

    authCard.vm.$emit('submit', {
      mode: 'login',
      username: 'thainchai',
      password: 'password123'
    })
    await flushPromises()

    expect(mockPush).toHaveBeenCalledWith('/cart')
  })

  it('redirects to redirect query param on successful register auto-login when provided', async () => {
    const vueRouter = await import('vue-router')
    vi.mocked(vueRouter.useRoute).mockReturnValueOnce({
      path: '/register',
      query: { redirect: '/product/123' }
    } as unknown as ReturnType<typeof vueRouter.useRoute>)

    const authStore = useAuthStore()
    vi.spyOn(authStore, 'register').mockResolvedValueOnce({
      success: true,
      message: 'OK'
    })
    vi.spyOn(authStore, 'login').mockResolvedValueOnce({
      success: true,
      user: { id: 1, username: 'newuser' }
    })

    const wrapper = mount(LoginView)
    const authCard = wrapper.findComponent(AuthCard)

    authCard.vm.$emit('submit', {
      mode: 'register',
      username: 'newuser',
      password: 'pwd'
    })
    await flushPromises()

    expect(mockPush).toHaveBeenCalledWith('/product/123')
  })
})
