import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeView from '../HomeView.vue'

describe('HomeView', () => {
  it('shows the welcome banner', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.text()).toContain('Welcome to Mouse Jerry!')
  })

  it('renders one card per game with name and price', () => {
    const wrapper = mount(HomeView)
    const cards = wrapper.findAll('h4')
    expect(cards).toHaveLength(3)
    expect(wrapper.text()).toContain('Elden Ring')
    expect(wrapper.text()).toContain('1790 Baht')
  })

  it('gives every cover image alt text', () => {
    const wrapper = mount(HomeView)
    const images = wrapper.findAll('img')
    expect(images).toHaveLength(3)
    images.forEach((img) => expect(img.attributes('alt')).toBeTruthy())
  })
})
