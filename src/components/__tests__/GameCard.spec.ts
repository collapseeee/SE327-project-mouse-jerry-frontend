import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GameCard from '../GameCard.vue'
import type { Game } from '@/types/game'

describe('GameCard', () => {
  const mockGame: Game = {
    id: 'test-game-1',
    name: 'Super Test Adventure',
    price: 999,
    coverImage: 'https://example.com/cover.jpg',
    category: 'Fighting'
  }

  const createWrapper = () => {
    return mount(GameCard, {
      props: {
        game: mockGame
      },
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

  it('renders game name, price and cover image', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Super Test Adventure')
    expect(wrapper.text()).toContain('999 Baht')

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe(mockGame.coverImage)
    expect(img.attributes('alt')).toBe(mockGame.name)
  })

  it('links to the product detail page', () => {
    const wrapper = createWrapper()
    const links = wrapper.findAll('a')
    expect(links.length).toBeGreaterThanOrEqual(2)
    links.forEach((link) => {
      expect(link.attributes('href')).toBe(`/product/${mockGame.id}`)
    })
  })

  it('emits add-to-cart when clicking the cart button', async () => {
    const wrapper = createWrapper()
    const cartButton = wrapper.find('button[title="Add to Cart"]')
    expect(cartButton.exists()).toBe(true)

    await cartButton.trigger('click')
    expect(wrapper.emitted('add-to-cart')).toBeTruthy()
    expect(wrapper.emitted('add-to-cart')?.[0]).toEqual([mockGame])
  })
})
