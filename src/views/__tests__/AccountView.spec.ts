import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import AccountView from '../AccountView.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import type { Order } from '@/types/order'

const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush })
}))

const sampleOrders: Order[] = [
  {
    id: 'ORD-101',
    orderNumber: 'ORD-101',
    date: 'Oct 12, 2026',
    totalAmount: 1200,
    items: [
      {
        id: 1,
        gameId: 'game-1',
        gameName: 'Cyberpunk 2077',
        coverImage: 'cyberpunk.jpg',
        key: 'CP77-1234-5678',
        price: 1200
      }
    ]
  }
]

describe('AccountView', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    mockPush.mockClear()
    vi.restoreAllMocks()
  })

  const mountAccountView = () => {
    return mount(AccountView, {
      global: {
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a :href="to"><slot /></a>'
          }
        }
      }
    })
  }

  it('renders user account details and role badge', async () => {
    const authStore = useAuthStore()
    authStore.setUserSession(
      { id: 1, username: 'testplayer', email: 'testplayer@example.com', role: 'ROLE_ADMIN' },
      'mock-jwt'
    )
    const cartStore = useCartStore()
    vi.spyOn(cartStore, 'loadOrders').mockResolvedValue()

    const wrapper = mountAccountView()
    await flushPromises()

    expect(wrapper.text()).toContain('testplayer')
    expect(wrapper.text()).toContain('testplayer@example.com')
    expect(wrapper.text()).toContain('ADMIN ACCOUNT')
  })

  it('renders customer account badge when role is not admin', async () => {
    const authStore = useAuthStore()
    authStore.setUserSession(
      { id: 2, username: 'gamer99', email: 'gamer99@example.com', role: 'ROLE_USER' },
      'mock-jwt'
    )
    const cartStore = useCartStore()
    vi.spyOn(cartStore, 'loadOrders').mockResolvedValue()

    const wrapper = mountAccountView()
    await flushPromises()

    expect(wrapper.text()).toContain('CUSTOMER ACCOUNT')
  })

  it('handles user logout button click', async () => {
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'player' }, 'mock-jwt')
    const logoutSpy = vi.spyOn(authStore, 'logout').mockResolvedValue()
    const cartStore = useCartStore()
    vi.spyOn(cartStore, 'loadOrders').mockResolvedValue()

    const wrapper = mountAccountView()
    await flushPromises()

    const logoutBtn = wrapper.find('[data-test="account-logout-btn"]')
    await logoutBtn.trigger('click')

    expect(logoutSpy).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/login?mode=login')
  })

  it('renders empty purchase history state when orders list is empty', async () => {
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'player' }, 'mock-jwt')
    const cartStore = useCartStore()
    cartStore.orders = []
    vi.spyOn(cartStore, 'loadOrders').mockResolvedValue()

    const wrapper = mountAccountView()
    await flushPromises()

    expect(wrapper.text()).toContain('No purchases yet!')
    expect(wrapper.text()).toContain('Browse Games')
  })

  it('renders orders list and digital keys when orders exist', async () => {
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'player' }, 'mock-jwt')
    const cartStore = useCartStore()
    cartStore.orders = [...sampleOrders]
    vi.spyOn(cartStore, 'loadOrders').mockResolvedValue()

    const wrapper = mountAccountView()
    await flushPromises()

    expect(wrapper.text()).toContain('Order #ORD-101')
    expect(wrapper.text()).toContain('Cyberpunk 2077')
    expect(wrapper.text()).toContain('CP77-1234-5678')
    expect(wrapper.text()).toContain('Oct 12, 2026')
  })

  it('paginates orders list at 15 items per page', async () => {
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'player' }, 'mock-jwt')
    const cartStore = useCartStore()

    const seventeenOrders: Order[] = Array.from({ length: 17 }, (_, i) => ({
      id: `ORD-PAGE-${i + 1}`,
      orderNumber: `ORD-PAGE-${i + 1}`,
      date: 'Oct 12, 2026',
      totalAmount: 100,
      items: [
        {
          id: i + 1,
          gameId: 'game-1',
          gameName: `Game ${i + 1}`,
          coverImage: 'game.jpg',
          key: `KEY-${i + 1}`,
          price: 100
        }
      ]
    }))

    cartStore.orders = [...seventeenOrders]
    vi.spyOn(cartStore, 'loadOrders').mockResolvedValue()

    const wrapper = mountAccountView()
    await flushPromises()

    // Page 1 should show first 15 orders
    expect(wrapper.find('[data-test="account-order-ORD-PAGE-1"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="account-order-ORD-PAGE-15"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="account-order-ORD-PAGE-16"]').exists()).toBe(false)

    const pagination = wrapper.find('[data-test="account-orders-pagination"]')
    expect(pagination.exists()).toBe(true)

    // Switch to page 2
    const page2Btn = pagination.findAll('button').find((btn) => btn.text() === '2')
    expect(page2Btn).toBeDefined()
    if (page2Btn) {
      await page2Btn.trigger('click')
    }
    await flushPromises()

    // Page 2 should show 16th and 17th orders
    expect(wrapper.find('[data-test="account-order-ORD-PAGE-1"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="account-order-ORD-PAGE-16"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="account-order-ORD-PAGE-17"]').exists()).toBe(true)
  })
})
