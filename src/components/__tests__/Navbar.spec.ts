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

  it('renders the search input with an accessible label and matching id', () => {
    const wrapper = mount(Navbar, {
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    })
    const label = wrapper.find('label[for="navbar-search"]')
    const input = wrapper.find('input#navbar-search')

    expect(label.exists()).toBe(true)
    expect(label.text()).toBe('Search epic games')
    expect(input.exists()).toBe(true)
  })
})

