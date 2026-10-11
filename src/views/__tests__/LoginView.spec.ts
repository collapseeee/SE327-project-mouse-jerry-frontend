import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginView from '../LoginView.vue'
import AuthCard from '../../components/auth/AuthCard.vue'

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    path: '/login',
    query: {}
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
}))

describe('LoginView', () => {
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

  it('renders AuthCard without stubs and allows interactions', async () => {
    const wrapper = mount(LoginView)

    expect(wrapper.text()).toContain('MOUSE JERRY')
    expect(wrapper.text()).toContain('CREATE ACCOUNT')
    expect(wrapper.find('button[data-test="submit-btn"]').text()).toBe('Register')
  })

  it('handles auth submit event for login', async () => {
    const wrapper = mount(LoginView)
    const authCard = wrapper.findComponent(AuthCard)

    authCard.vm.$emit('submit', {
      mode: 'login',
      username: 'jerry',
      password: 'password123'
    })

    authCard.vm.$emit('submit', {
      mode: 'register',
      username: 'jerry',
      email: 'jerry@example.com',
      password: 'password123'
    })

    expect(authCard.emitted()).toBeDefined()
  })

  it('sets initialMode to login when query.mode is login', async () => {
    const { useRoute } = await import('vue-router')
    vi.mocked(useRoute).mockReturnValueOnce({
      path: '/login',
      query: { mode: 'login' }
    } as any)

    const wrapper = mount(LoginView)
    const authCard = wrapper.findComponent(AuthCard)
    expect(authCard.props('initialMode')).toBe('login')
  })
})
