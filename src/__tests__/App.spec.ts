import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('renders the navbar and the router outlet', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          Navbar: { template: '<nav data-test="navbar" />' },
          RouterView: { template: '<div data-test="outlet" />' },
        },
      },
    })
    expect(wrapper.find('[data-test="navbar"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="outlet"]').exists()).toBe(true)
  })
})
