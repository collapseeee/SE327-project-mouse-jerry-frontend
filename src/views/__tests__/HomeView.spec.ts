import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeView from '../HomeView.vue'

describe('HomeView', () => {
  const mountComponent = () => {
    return mount(HomeView, {
      global: {
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>'
          },
          swiper: {
            template: '<div><slot /></div>'
          },
          SwiperSlide: {
            template: '<div class="slide"><slot /></div>'
          }
        }
      }
    })
  }

  it('renders the highlights carousel with SHOP NOW buttons', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('SHOP NOW')
  })

  it('renders games with name and price', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('Elden Ring')
    expect(wrapper.text()).toContain('1790 Baht')
    expect(wrapper.text()).toContain('All Games')
  })

  it('gives every cover image alt text', () => {
    const wrapper = mountComponent()
    const images = wrapper.findAll('img')
    expect(images.length).toBeGreaterThan(0)
    images.forEach((img) => expect(img.attributes('alt')).toBeTruthy())
  })
})
