import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HighlightCarousel, { type HighlightItem } from '../HighlightCarousel.vue'

describe('HighlightCarousel', () => {
  const sampleHighlights: HighlightItem[] = [
    {
      id: '1',
      gameId: '101',
      name: 'Test Game',
      customImage: 'https://example.com/test.jpg',
      buttonColor: '#00c853'
    }
  ]

  it('renders carousel with SHOP NOW buttons', () => {
    const wrapper = mount(HighlightCarousel, {
      props: {
        highlights: sampleHighlights
      },
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

    expect(wrapper.text()).toContain('SHOP NOW')
    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe('https://example.com/test.jpg')
  })

  it('renders correctly when 5 or more highlights are provided', () => {
    const fiveHighlights: HighlightItem[] = Array.from({ length: 5 }, (_, i) => ({
      id: String(i + 1),
      gameId: String(100 + i),
      name: `Game ${i + 1}`,
      customImage: `https://example.com/game-${i + 1}.jpg`,
      buttonColor: '#ff0000'
    }))

    const wrapper = mount(HighlightCarousel, {
      props: {
        highlights: fiveHighlights
      },
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          swiper: { template: '<div><slot /></div>' },
          SwiperSlide: { template: '<div class="slide"><slot /></div>' }
        }
      }
    })

    const slides = wrapper.findAll('.slide')
    expect(slides.length).toBe(5)
  })

  it('handles empty highlights gracefully', () => {
    const wrapper = mount(HighlightCarousel, {
      props: {
        highlights: []
      },
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          swiper: { template: '<div><slot /></div>' },
          SwiperSlide: { template: '<div class="slide"><slot /></div>' }
        }
      }
    })

    const slides = wrapper.findAll('.slide')
    expect(slides.length).toBe(0)
  })
})
