import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import HomeView from '../HomeView.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush })
}))

const sampleHighlights = [
  { id: '1', name: 'Battlefield 3', price: 1969, coverImage: 'bf3.jpg', isHighlight: true, screenshots: ['bf3-sc.jpg'] },
  { id: '2', name: 'Elden Ring', price: 1790, coverImage: 'er.jpg', isHighlight: true, screenshots: ['er-sc.jpg'] }
]

const sampleGames = [
  { id: '1', name: 'Battlefield 3: Premium Edition', price: 1969, coverImage: 'bf3.jpg' },
  { id: '2', name: 'FiveM', price: 837, coverImage: 'fivem.jpg' },
  { id: '3', name: 'Clone Drone', price: 1702, coverImage: 'cd.jpg' },
  { id: '4', name: 'Tropico 4', price: 499, coverImage: 't4.jpg' },
  { id: '5', name: 'Headquarters WWII', price: 1100, coverImage: 'hq.jpg' }
]

describe('HomeView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockPush.mockClear()
    vi.restoreAllMocks()
    vi.spyOn(globalThis, 'fetch').mockImplementation((requestUrl) => {
      const url = String(requestUrl)
      if (url.includes('/highlights')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(sampleHighlights)
        } as Response)
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'x-total-count': '30' }),
        json: () => Promise.resolve(sampleGames)
      } as Response)
    })
  })

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

  it('renders the highlights carousel with SHOP NOW buttons', async () => {
    const wrapper = mountComponent()
    await flushPromises()
    expect(wrapper.text()).toContain('SHOP NOW')
  })

  it('renders games on page 1 matching Screenshot 3', async () => {
    const wrapper = mountComponent()
    await flushPromises()
    expect(wrapper.text()).toContain('All Games')
    expect(wrapper.text()).toContain('Battlefield 3: Premium Edition')
    expect(wrapper.text()).toContain('1969 Baht')
    expect(wrapper.text()).toContain('FiveM')
    expect(wrapper.text()).toContain('837 Baht')
  })

  it('redirects to login when unauthenticated user adds game to cart', async () => {
    const wrapper = mountComponent()
    await flushPromises()

    const addButtons = wrapper.findAll('button[title="Add to Cart"]')
    expect(addButtons.length).toBeGreaterThan(0)
    await addButtons[0].trigger('click')

    expect(mockPush).toHaveBeenCalledWith({
      path: '/login',
      query: { mode: 'login', redirect: '/' }
    })
  })

  it('adds game to cart when authenticated user clicks add to cart', async () => {
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'tester' }, 'token-abc')
    const cartStore = useCartStore()
    const addItemSpy = vi.spyOn(cartStore, 'addItem').mockResolvedValue(true)

    const wrapper = mountComponent()
    await flushPromises()

    const addButtons = wrapper.findAll('button[title="Add to Cart"]')
    await addButtons[0].trigger('click')

    expect(addItemSpy).toHaveBeenCalledWith('1', 1)
  })

  it('navigates through pages using pagination', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation((requestUrl) => {
      const url = String(requestUrl)
      if (url.includes('/highlights')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(sampleHighlights)
        } as Response)
      }
      if (url.includes('page=2')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'x-total-count': '30' }),
          json: () => Promise.resolve([
            { id: '6', name: 'Towerfall Ascension: Dark World', price: 683, coverImage: 'tf.jpg' }
          ])
        } as Response)
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'x-total-count': '30' }),
        json: () => Promise.resolve(sampleGames)
      } as Response)
    })

    const wrapper = mountComponent()
    await flushPromises()

    expect(wrapper.text()).toContain('1')
    expect(wrapper.text()).toContain('6')

    const page2Btn = wrapper.findAll('button').find((button) => button.text() === '2')
    expect(page2Btn).toBeDefined()
    if (page2Btn) {
      await page2Btn.trigger('click')
      await flushPromises()
    }

    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('page=2'))
    expect(wrapper.text()).toContain('Towerfall Ascension: Dark World')
  })

  it('gives every cover image alt text', async () => {
    const wrapper = mountComponent()
    await flushPromises()
    const images = wrapper.findAll('img')
    expect(images.length).toBeGreaterThan(0)
    images.forEach((img) => expect(img.attributes('alt')).toBeTruthy())
  })

  it('renders empty state when backend returns 0 games', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((requestUrl) => {
      const url = String(requestUrl)
      if (url.includes('/highlights')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        } as Response)
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'x-total-count': '0' }),
        json: () => Promise.resolve([])
      } as Response)
    })

    const wrapper = mountComponent()
    await flushPromises()
    expect(wrapper.text()).toContain('No games available at this time.')
  })

  it('handles fetch error gracefully on both highlights and catalog', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'))

    const wrapper = mountComponent()
    await flushPromises()
    expect(wrapper.text()).toContain('No games available at this time.')
  })
})
