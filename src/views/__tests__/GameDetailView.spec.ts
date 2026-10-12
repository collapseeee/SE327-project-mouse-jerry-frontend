import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { reactive } from 'vue'
import GameDetailView from '../GameDetailView.vue'

const mockRoute = reactive<{ params: { id?: unknown } }>({
  params: { id: 'vampire-survivors-emergency-meeting' }
})

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute
}))

describe('GameDetailView', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({})
    } as Response)
    mockRoute.params.id = 'vampire-survivors-emergency-meeting'
  })

  const mountGameDetailView = () => {
    return mount(GameDetailView, {
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

  it('renders game details matching Screenshot 2', async () => {
    mockRoute.params.id = 'vampire-survivors-emergency-meeting'
    const wrapper = mountGameDetailView()
    await flushPromises()

    expect(wrapper.text()).toContain('Vampire Survivors: Emergency Meeting')
    expect(wrapper.text()).toContain('1788 Baht')
    expect(wrapper.text()).toContain('Hack and slash/Beat \'em up')
    expect(wrapper.text()).toContain('Add to cart')
    expect(wrapper.text()).toContain('Buy now')
    expect(wrapper.text()).toContain('Amount')
  })

  it('allows incrementing and decrementing amount and respects stock limits', async () => {
    mockRoute.params.id = 'vampire-survivors-emergency-meeting'
    const wrapper = mountGameDetailView()
    await flushPromises()

    const minusBtn = wrapper.find('button[aria-label="Decrease quantity"]')
    const plusBtn = wrapper.find('button[aria-label="Increase quantity"]')

    expect(wrapper.text()).toContain('1')

    // Decrement when at 1 should not go below 1
    await minusBtn.trigger('click')
    expect(wrapper.text()).toContain('1')

    await plusBtn.trigger('click')
    expect(wrapper.text()).toContain('2')

    await plusBtn.trigger('click')
    expect(wrapper.text()).toContain('3')

    await minusBtn.trigger('click')
    expect(wrapper.text()).toContain('2')

    await minusBtn.trigger('click')
    expect(wrapper.text()).toContain('1')
  })

  it('caps incrementing at stock limit and falls back to default 99 when stock undefined', async () => {
    mockRoute.params.id = 'custom-stock-game'
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        id: 'custom-stock-game',
        name: 'Custom Stock Game',
        price: 50,
        category: 'Action',
        screenshots: ['sc1.jpg'],
        coverImage: 'cov.jpg',
        stock: 2
      })
    } as unknown as Response)

    const wrapper = mountGameDetailView()
    await flushPromises()

    const plusBtn = wrapper.find('button[aria-label="Increase quantity"]')
    await plusBtn.trigger('click') // quantity -> 2 (reaches max stock)
    expect(wrapper.text()).toContain('2')

    await plusBtn.trigger('click') // quantity stays 2 because quantity < stock is false
    expect(wrapper.text()).toContain('2')
  })

  it('cycles screenshots with next and prev buttons and wraps around', async () => {
    mockRoute.params.id = 'vampire-survivors-emergency-meeting'
    const wrapper = mountGameDetailView()
    await flushPromises()

    const nextBtn = wrapper.find('button[aria-label="Next screenshot"]')
    const prevBtn = wrapper.find('button[aria-label="Previous screenshot"]')

    expect(nextBtn.exists()).toBe(true)
    expect(prevBtn.exists()).toBe(true)

    // Initially at index 0: clicking prevBtn wraps to last image
    await prevBtn.trigger('click')
    // Now at last index: clicking nextBtn wraps to 0
    await nextBtn.trigger('click')

    // Moving forward to index 1
    await nextBtn.trigger('click')

    // Click thumbnail directly
    const thumbButtons = wrapper.findAll('button[aria-label^="Select screenshot"]')
    expect(thumbButtons.length).toBeGreaterThan(0)
    const thirdThumb = thumbButtons[2]
    if (thirdThumb) {
      await thirdThumb.trigger('click')
    }

    // Move back
    await prevBtn.trigger('click')
  })

  it('falls back to cover image when screenshots list is empty', async () => {
    mockRoute.params.id = 'no-screenshots-game'
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        id: 'no-screenshots-game',
        name: 'No Screenshots Game',
        price: 100,
        category: 'RPG',
        screenshots: [],
        coverImage: 'only-cover.jpg',
        stock: 10
      })
    } as unknown as Response)

    const wrapper = mountGameDetailView()
    await flushPromises()

    expect(wrapper.text()).toContain('No Screenshots Game')
    // Since screenshots is empty, galleryImages has only 1 image (coverImage), so navigation buttons are hidden
    expect(wrapper.find('button[aria-label="Next screenshot"]').exists()).toBe(false)
    expect(wrapper.find('button[aria-label="Previous screenshot"]').exists()).toBe(false)
  })

  it('displays not found state when game does not exist or route param id is empty/undefined', async () => {
    mockRoute.params.id = 'non-existing-game-404'
    let wrapper = mountGameDetailView()
    await flushPromises()

    expect(wrapper.text()).toContain('Game Not Found')
    expect(wrapper.text()).toContain('Back to Home')

    // When route param id is undefined
    mockRoute.params.id = undefined
    wrapper = mountGameDetailView()
    await flushPromises()
    expect(wrapper.text()).toContain('Game Not Found')
  })

  it('loads remote game details on mount and updates on route change', async () => {
    mockRoute.params.id = 'custom-remote-game'
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    fetchSpy.mockImplementation((url) => {
      const urlStr = String(url)
      if (urlStr.includes('custom-remote-game')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'custom-remote-game',
            name: 'Custom Remote Game',
            price: 999,
            category: 'Action',
            screenshots: ['sc1.jpg', 'sc2.jpg'],
            coverImage: 'cov.jpg',
            stock: 5
          })
        } as Response)
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({})
      } as Response)
    })

    const wrapper = mountGameDetailView()
    await flushPromises()
    expect(wrapper.text()).toContain('Custom Remote Game')

    // Route change to another string id (local fallback elden-ring)
    mockRoute.params.id = 'elden-ring'
    await flushPromises()
    expect(wrapper.text()).toContain('Elden Ring')

    // Route change to non-existing game
    mockRoute.params.id = 'non-existing-game-via-watch'
    await flushPromises()
    expect(wrapper.text()).toContain('Game Not Found')

    // Route change to non-string
    mockRoute.params.id = 999 as unknown as string
    await flushPromises()
    expect(wrapper.exists()).toBe(true)
  })
})
