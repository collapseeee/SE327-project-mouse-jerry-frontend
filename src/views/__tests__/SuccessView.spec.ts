import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import SuccessView from '../SuccessView.vue'
import { useCartStore } from '@/stores/cart'

describe('SuccessView', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  const mountSuccessView = () => {
    return mount(SuccessView, {
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

  it('renders dynamic order number from latestOrder in cartStore', () => {
    const cartStore = useCartStore()
    cartStore.latestOrder = {
      id: 'ORD-98765',
      orderNumber: 'ORD-98765',
      date: 'Oct 12, 2026',
      totalAmount: 1500,
      items: []
    }

    const wrapper = mountSuccessView()
    expect(wrapper.text()).toContain('Payment Successful!')
    expect(wrapper.text()).toContain('ORD-98765')
    expect(wrapper.text()).toContain('Keep Shopping')
    expect(wrapper.text()).toContain('View My Keys')
  })

  it('falls back to default order number when latestOrder is missing', () => {
    const cartStore = useCartStore()
    cartStore.latestOrder = null

    const wrapper = mountSuccessView()
    expect(wrapper.text()).toContain('ORD-8I5A2T')
  })
})
