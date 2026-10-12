import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ToastContainer from '../ToastContainer.vue'
import { useToastStore } from '@/stores/toast'

describe('ToastContainer', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders an empty aside container when no toasts are present', () => {
    const wrapper = mount(ToastContainer)
    expect(wrapper.find('aside').exists()).toBe(true)
    expect(wrapper.findAll('[role="status"]')).toHaveLength(0)
  })

  it('renders a success toast with game title and success icon', async () => {
    const toastStore = useToastStore()
    toastStore.showCartSuccess('Cyberpunk 2077')

    const wrapper = mount(ToastContainer)
    expect(wrapper.findAll('[role="status"]')).toHaveLength(1)
    expect(wrapper.find('[data-test="toast-icon-success"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Added to Cart')
    expect(wrapper.text()).toContain('"Cyberpunk 2077"')
  })

  it('renders an error toast with error icon', async () => {
    const toastStore = useToastStore()
    toastStore.showError('Unable to connect to server')

    const wrapper = mount(ToastContainer)
    expect(wrapper.find('[data-test="toast-icon-error"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Notification')
    expect(wrapper.text()).toContain('Unable to connect to server')
  })

  it('renders an info toast with info icon and standard message', async () => {
    const toastStore = useToastStore()
    toastStore.showInfo('Special promotion active')

    const wrapper = mount(ToastContainer)
    expect(wrapper.find('[data-test="toast-icon-info"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Notice')
    expect(wrapper.text()).toContain('Special promotion active')
  })

  it('dismisses toast when close button is clicked', async () => {
    const toastStore = useToastStore()
    const id = toastStore.showCartSuccess('Celeste')

    const wrapper = mount(ToastContainer)
    expect(toastStore.toasts).toHaveLength(1)

    const dismissBtn = wrapper.find('[data-test="toast-dismiss-btn"]')
    expect(dismissBtn.exists()).toBe(true)
    await dismissBtn.trigger('click')

    expect(toastStore.toasts.find((t) => t.id === id)).toBeUndefined()
  })
})
