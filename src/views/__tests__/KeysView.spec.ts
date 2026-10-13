import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import KeysView from '../KeysView.vue'
import { useCartStore } from '@/stores/cart'
import type { Order } from '@/types/order'

const sampleOrder: Order = {
  id: 'ORD-99',
  orderNumber: 'ORD-99',
  date: 'Oct 12, 2026',
  totalAmount: 800,
  items: [
    {
      id: 1,
      gameId: 'game-1',
      gameName: 'Stardew Valley',
      coverImage: 'stardew.jpg',
      key: 'STAR-DEW1-2345',
      price: 800
    }
  ]
}

describe('KeysView', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  const mountKeysView = () => {
    return mount(KeysView, {
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

  it('renders keys from latestOrder when available', async () => {
    const cartStore = useCartStore()
    cartStore.latestOrder = { ...sampleOrder }
    vi.spyOn(cartStore, 'loadOrders').mockResolvedValue()

    const wrapper = mountKeysView()
    await flushPromises()

    expect(wrapper.text()).toContain('Your Game Keys')
    expect(wrapper.text()).toContain('Stardew Valley')
    expect(wrapper.text()).toContain('STAR-DEW1-2345')
  })

  it('renders keys from orders list when latestOrder is not present', async () => {
    const cartStore = useCartStore()
    cartStore.latestOrder = null
    cartStore.orders = [{ ...sampleOrder }]
    vi.spyOn(cartStore, 'loadOrders').mockResolvedValue()

    const wrapper = mountKeysView()
    await flushPromises()

    expect(wrapper.text()).toContain('Stardew Valley')
    expect(wrapper.text()).toContain('STAR-DEW1-2345')
  })

  it('renders empty state when there are no claimed keys', async () => {
    const cartStore = useCartStore()
    cartStore.latestOrder = null
    cartStore.orders = []
    vi.spyOn(cartStore, 'loadOrders').mockResolvedValue()

    const wrapper = mountKeysView()
    await flushPromises()

    expect(wrapper.text()).toContain('No keys to display')
    expect(wrapper.text()).toContain('Back to Store')
  })

  it('handles copying key to clipboard successfully', async () => {
    const writeTextMock = vi.fn().mockImplementation(() => Promise.resolve())
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock
      }
    })

    const cartStore = useCartStore()
    cartStore.latestOrder = { ...sampleOrder }
    vi.spyOn(cartStore, 'loadOrders').mockResolvedValue()

    const wrapper = mountKeysView()
    await flushPromises()

    const copyBtn = wrapper.find('button')
    await copyBtn.trigger('click')

    expect(writeTextMock).toHaveBeenCalledWith('STAR-DEW1-2345')
    expect(wrapper.text()).toContain('Copied!')
  })

  it('handles clipboard copy failure gracefully without throwing', async () => {
    const writeTextMock = vi.fn().mockRejectedValue(new Error('Clipboard denied'))
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock
      }
    })

    const cartStore = useCartStore()
    cartStore.latestOrder = { ...sampleOrder }
    vi.spyOn(cartStore, 'loadOrders').mockResolvedValue()

    const wrapper = mountKeysView()
    await flushPromises()

    const copyBtn = wrapper.find('button')
    await copyBtn.trigger('click')

    expect(writeTextMock).toHaveBeenCalledWith('STAR-DEW1-2345')
  })
})
