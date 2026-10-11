import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeView from '../HomeView.vue'

describe('HomeView', () => {
  const mountComponent = () => {
    return mount(HomeView, {
      global: {
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a :href="to"><slot /></a>'
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

  it('renders games on page 1 matching Screenshot 3', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('All Games')
    expect(wrapper.text()).toContain('Battlefield 3: Premium Edition')
    expect(wrapper.text()).toContain('1969 Baht')
    expect(wrapper.text()).toContain('FiveM')
    expect(wrapper.text()).toContain('837 Baht')
  })

  it('navigates through pages using pagination', async () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('1')
    expect(wrapper.text()).toContain('6')

    const page2Btn = wrapper.findAll('button').find((b) => b.text() === '2')
    expect(page2Btn).toBeDefined()
    if (page2Btn) {
      await page2Btn.trigger('click')
    }

    expect(wrapper.text()).toContain('Towerfall Ascension: Dark World')
    expect(wrapper.text()).toContain('683 Baht')
    expect(wrapper.text()).toContain('Vampire Survivors: Emergency Meeting')
  })

  it('gives every cover image alt text', () => {
    const wrapper = mountComponent()
    const images = wrapper.findAll('img')
    expect(images.length).toBeGreaterThan(0)
    images.forEach((img) => expect(img.attributes('alt')).toBeTruthy())
  })
})
