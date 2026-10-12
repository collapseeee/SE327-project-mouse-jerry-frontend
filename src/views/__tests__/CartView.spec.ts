import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import CartView from '../CartView.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import type { CartItem } from '@/types/cart'

const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush })
}))

const sampleCartItems: CartItem[] = [
  {
    id: 1,
    gameId: 'vs-1',
    gameTitle: 'Vampire Survivors: Emergency Meeting',
    coverImage: 'vs.jpg',
    unitPrice: 1788,
    quantity: 1,
    totalPrice: 1788,
    stock: 10,
    category: "Hack and slash/Beat 'em up"
  },
  {
    id: 2,
    gameId: 'pz-1',
    gameTitle: 'Planet Zoo: Aquatic Pack',
    coverImage: 'pz.jpg',
    unitPrice: 835,
    quantity: 1,
    totalPrice: 835,
    stock: 5,
    category: 'Simulator'
  }
]

describe('CartView', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    mockPush.mockClear()
    vi.restoreAllMocks()
  })

  const mountCartView = () => {
    return mount(CartView, {
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

  it('redirects to login when unauthenticated user mounts CartView', async () => {
    mountCartView()
    await flushPromises()

    expect(mockPush).toHaveBeenCalledWith({
      path: '/login',
      query: { mode: 'login', redirect: '/cart' }
    })
  })

  it('loads cart on mount when authenticated', async () => {
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'thainchai' }, 'mock-token')
    const cartStore = useCartStore()
    const loadSpy = vi.spyOn(cartStore, 'loadCart').mockResolvedValue()

    mountCartView()
    await flushPromises()

    expect(loadSpy).toHaveBeenCalled()
  })

  it('renders loading state when cart is loading and empty', () => {
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'thainchai' }, 'mock-token')
    const cartStore = useCartStore()
    cartStore.isLoading = true

    const wrapper = mountCartView()
    expect(wrapper.find('[data-test="cart-loading-state"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading your cart...')
  })

  it('renders empty cart state when cart has no items', async () => {
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'thainchai' }, 'mock-token')
    const cartStore = useCartStore()
    vi.spyOn(cartStore, 'loadCart').mockResolvedValue()

    const wrapper = mountCartView()
    await flushPromises()

    expect(wrapper.find('[data-test="cart-empty-state"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Your cart is empty')
    expect(wrapper.find('[data-test="explore-games-btn"]').exists()).toBe(true)
  })

  it('renders populated cart matching reference screenshot', async () => {
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'thainchai' }, 'mock-token')
    const cartStore = useCartStore()
    cartStore.items = [...sampleCartItems]
    vi.spyOn(cartStore, 'loadCart').mockResolvedValue()

    const wrapper = mountCartView()
    await flushPromises()

    expect(wrapper.find('[data-test="cart-header"]').text()).toContain('Your Cart')
    expect(wrapper.text()).toContain('Vampire Survivors: Emergency Meeting')
    expect(wrapper.text()).toContain("Hack and slash/Beat 'em up")
    expect(wrapper.text()).toContain('1788 Baht')

    expect(wrapper.text()).toContain('Planet Zoo: Aquatic Pack')
    expect(wrapper.text()).toContain('Simulator')
    expect(wrapper.text()).toContain('835 Baht')

    // Order summary card
    expect(wrapper.find('[data-test="order-summary-card"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="summary-total-items"]').text()).toBe('2')
    expect(wrapper.find('[data-test="summary-total-amount"]').text()).toBe('2,623 Baht')
    expect(wrapper.find('[data-test="checkout-btn"]').text()).toContain('CHECKOUT')
  })

  it('handles increment quantity button click', async () => {
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'thainchai' }, 'mock-token')
    const cartStore = useCartStore()
    cartStore.items = [{ ...sampleCartItems[0] }]
    vi.spyOn(cartStore, 'loadCart').mockResolvedValue()
    const updateSpy = vi.spyOn(cartStore, 'updateQuantity').mockResolvedValue(true)

    const wrapper = mountCartView()
    await flushPromises()

    const incBtn = wrapper.find('[data-test="increase-qty-btn"]')
    await incBtn.trigger('click')

    expect(updateSpy).toHaveBeenCalledWith('vs-1', 2)
  })

  it('handles decrement quantity button click and prevents decrementing below 1', async () => {
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'thainchai' }, 'mock-token')
    const cartStore = useCartStore()
    cartStore.items = [{ ...sampleCartItems[0], quantity: 2 }]
    vi.spyOn(cartStore, 'loadCart').mockResolvedValue()
    const updateSpy = vi.spyOn(cartStore, 'updateQuantity').mockResolvedValue(true)

    const wrapper = mountCartView()
    await flushPromises()

    const decBtn = wrapper.find('[data-test="decrease-qty-btn"]')
    await decBtn.trigger('click')

    expect(updateSpy).toHaveBeenCalledWith('vs-1', 1)
  })

  it('disables decrease button when item quantity is 1', async () => {
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'thainchai' }, 'mock-token')
    const cartStore = useCartStore()
    cartStore.items = [{ ...sampleCartItems[0], quantity: 1 }]
    vi.spyOn(cartStore, 'loadCart').mockResolvedValue()

    const wrapper = mountCartView()
    await flushPromises()

    const decBtn = wrapper.find('[data-test="decrease-qty-btn"]')
    expect(decBtn.attributes('disabled')).toBeDefined()
  })

  it('handles item removal when trash can icon is clicked', async () => {
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'thainchai' }, 'mock-token')
    const cartStore = useCartStore()
    cartStore.items = [{ ...sampleCartItems[0] }]
    vi.spyOn(cartStore, 'loadCart').mockResolvedValue()
    const removeSpy = vi.spyOn(cartStore, 'removeItem').mockResolvedValue(true)

    const wrapper = mountCartView()
    await flushPromises()

    const removeBtn = wrapper.find('[data-test="remove-item-btn"]')
    await removeBtn.trigger('click')

    expect(removeSpy).toHaveBeenCalledWith('vs-1')
  })

  it('renders fallback icon when item coverImage is missing', async () => {
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'thainchai' }, 'mock-token')
    const cartStore = useCartStore()
    cartStore.items = [{ ...sampleCartItems[0], coverImage: '' }]
    vi.spyOn(cartStore, 'loadCart').mockResolvedValue()

    const wrapper = mountCartView()
    await flushPromises()

    expect(wrapper.find('i.fa-gamepad').exists()).toBe(true)
  })

  it('allows clicking checkout button when cart has items', async () => {
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'thainchai' }, 'mock-token')
    const cartStore = useCartStore()
    cartStore.items = [...sampleCartItems]
    vi.spyOn(cartStore, 'loadCart').mockResolvedValue()

    const wrapper = mountCartView()
    await flushPromises()

    const checkoutBtn = wrapper.find('[data-test="checkout-btn"]')
    await checkoutBtn.trigger('click')
    expect(checkoutBtn.exists()).toBe(true)
  })
})
