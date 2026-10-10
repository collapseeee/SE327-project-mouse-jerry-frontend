import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Navbar from '../Navbar.vue'

describe('Navbar', () => {
  it('renders the brand name', () => {
    const wrapper = mount(Navbar, {
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    })
    expect(wrapper.text()).toContain('Mouse Jerry')
  })
})
