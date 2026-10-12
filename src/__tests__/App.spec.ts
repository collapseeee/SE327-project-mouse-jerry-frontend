import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('renders the navbar, router outlet, and toast container', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          Navbar: { template: '<nav data-test="navbar" />' },
          RouterView: { template: '<div data-test="outlet" />' },
          ToastContainer: { template: '<aside data-test="toast-container" />' },
        },
      },
    })
    expect(wrapper.find('[data-test="navbar"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="outlet"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="toast-container"]').exists()).toBe(true)
  })
})
