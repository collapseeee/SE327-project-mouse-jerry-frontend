import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import PurchaseView from '../PurchaseView.vue'
import { useCartStore } from '@/stores/cart'
import type { CartItem } from '@/types/cart'
import type { Order } from '@/types/order'

const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush })
}))

const sampleCartItem: CartItem = {
  id: 1,
  gameId: 'game-1',
  gameTitle: 'Elden Ring: Shadow of the Erdtree',
  coverImage: 'eldenring.jpg',
  unitPrice: 1500,
  quantity: 2,
  totalPrice: 3000,
  stock: 10
}

const sampleConfirmedOrder: Order = {
  id: 'ORD-SUCCESS-1',
  orderNumber: 'ORD-SUCCESS-1',
  date: 'Oct 12, 2026',
  totalAmount: 3000,
  items: []
}

describe('PurchaseView', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    mockPush.mockClear()
    vi.restoreAllMocks()
  })

  const mountPurchaseView = () => {
    return mount(PurchaseView, {
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

  it('renders purchase items from cartStore items', async () => {
    const cartStore = useCartStore()
    cartStore.items = [{ ...sampleCartItem }]
    vi.spyOn(cartStore, 'loadCart').mockResolvedValue()

    const wrapper = mountPurchaseView()
    await flushPromises()

    expect(wrapper.text()).toContain('Complete Your Purchase')
    expect(wrapper.text()).toContain('Elden Ring: Shadow of the Erdtree')
    expect(wrapper.text()).toContain('Amount: 2')
    expect(wrapper.text()).toContain('3,000 Baht')
    expect(wrapper.text()).toContain('2 Item(s)')
  })

  it('renders directPurchaseItem when direct checkout is queued', async () => {
    const cartStore = useCartStore()
    cartStore.setDirectPurchase(
      {
        id: 'direct-1',
        name: 'Hollow Knight',
        price: 350,
        coverImage: 'hk.jpg'
      },
      1
    )

    const wrapper = mountPurchaseView()
    await flushPromises()

    expect(wrapper.text()).toContain('Hollow Knight')
    expect(wrapper.text()).toContain('Amount: 1')
    expect(wrapper.text()).toContain('350 Baht')
  })

  it('renders empty purchase state when no items are in cart or direct purchase', async () => {
    const cartStore = useCartStore()
    cartStore.items = []
    cartStore.directPurchaseItem = null
    vi.spyOn(cartStore, 'loadCart').mockResolvedValue()

    const wrapper = mountPurchaseView()
    await flushPromises()

    expect(wrapper.text()).toContain('No items to purchase')
    expect(wrapper.text()).toContain('Back to Store')
  })

  it('confirms purchase and redirects to /success', async () => {
    const cartStore = useCartStore()
    cartStore.items = [{ ...sampleCartItem }]
    const confirmSpy = vi.spyOn(cartStore, 'confirmPurchase').mockResolvedValue(sampleConfirmedOrder)

    const wrapper = mountPurchaseView()
    await flushPromises()

    const confirmBtn = wrapper.find('button')
    await confirmBtn.trigger('click')
    await flushPromises()

    expect(confirmSpy).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/success')
  })
})
