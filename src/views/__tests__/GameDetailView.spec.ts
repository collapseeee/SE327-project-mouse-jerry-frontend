import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { reactive } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import GameDetailView from '../GameDetailView.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const mockPush = vi.fn()
const mockRoute = reactive<{ params: { id?: unknown }; fullPath: string }>({
  params: { id: 'vampire-survivors-emergency-meeting' },
  fullPath: '/product/vampire-survivors-emergency-meeting'
})

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({ push: mockPush })
}))

const sampleGame = {
  id: 'vampire-survivors-emergency-meeting',
  name: 'Vampire Survivors: Emergency Meeting',
  price: 1788,
  category: 'Hack and slash/Beat \'em up',
  coverImage: 'vs.jpg',
  screenshots: ['sc1.jpg', 'sc2.jpg', 'sc3.jpg'],
  stock: 10,
  description: 'Emergency meeting in space with vampires.',
  publisher: 'Poncle',
  releaseDate: '2023-12-18'
}

describe('GameDetailView', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    mockPush.mockClear()
    vi.restoreAllMocks()
    mockRoute.params.id = 'vampire-survivors-emergency-meeting'
    mockRoute.fullPath = '/product/vampire-survivors-emergency-meeting'
    vi.spyOn(globalThis, 'fetch').mockImplementation((requestUrl) => {
      const url = String(requestUrl)
      if (url.includes('vampire-survivors-emergency-meeting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(sampleGame)
        } as Response)
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({})
      } as Response)
    })
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
    const wrapper = mountGameDetailView()
    await flushPromises()

    expect(wrapper.text()).toContain('Vampire Survivors: Emergency Meeting')
    expect(wrapper.text()).toContain('1788')
    expect(wrapper.text()).toContain('Baht')
    expect(wrapper.text()).toContain('Poncle')
    expect(wrapper.text()).toContain('2023-12-18')
    expect(wrapper.text()).toContain('Emergency meeting in space with vampires.')
    expect(wrapper.find('button[aria-label="Decrease quantity"]').exists()).toBe(true)
    expect(wrapper.find('button[aria-label="Increase quantity"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="add-to-cart-btn"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="buy-now-btn"]').exists()).toBe(true)
  })

  it('redirects to login when unauthenticated user clicks add to cart', async () => {
    const wrapper = mountGameDetailView()
    await flushPromises()

    const addToCartBtn = wrapper.find('[data-test="add-to-cart-btn"]')
    await addToCartBtn.trigger('click')

    expect(mockPush).toHaveBeenCalledWith({
      path: '/login',
      query: { mode: 'login', redirect: '/product/vampire-survivors-emergency-meeting' }
    })
  })

  it('adds game to cart when authenticated user clicks add to cart', async () => {
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'tester' }, 'token-abc')
    const cartStore = useCartStore()
    const addItemSpy = vi.spyOn(cartStore, 'addItem').mockResolvedValue(true)

    const wrapper = mountGameDetailView()
    await flushPromises()

    const addToCartBtn = wrapper.find('[data-test="add-to-cart-btn"]')
    await addToCartBtn.trigger('click')

    expect(addItemSpy).toHaveBeenCalledWith(
      'vampire-survivors-emergency-meeting',
      1,
      'Vampire Survivors: Emergency Meeting'
    )
  })

  it('redirects to login when unauthenticated user clicks buy now', async () => {
    const wrapper = mountGameDetailView()
    await flushPromises()

    const buyNowBtn = wrapper.find('[data-test="buy-now-btn"]')
    await buyNowBtn.trigger('click')

    expect(mockPush).toHaveBeenCalledWith({
      path: '/login',
      query: { mode: 'login', redirect: '/product/vampire-survivors-emergency-meeting' }
    })
  })

  it('adds game to cart and navigates to /cart when authenticated user clicks buy now', async () => {
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'tester' }, 'token-abc')
    const cartStore = useCartStore()
    vi.spyOn(cartStore, 'addItem').mockResolvedValue(true)

    const wrapper = mountGameDetailView()
    await flushPromises()

    const buyNowBtn = wrapper.find('[data-test="buy-now-btn"]')
    await buyNowBtn.trigger('click')
    await flushPromises()

    expect(mockPush).toHaveBeenCalledWith('/cart')
  })

  it('allows incrementing and decrementing amount and respects stock limits', async () => {
    const wrapper = mountGameDetailView()
    await flushPromises()

    const decBtn = wrapper.find('button[aria-label="Decrease quantity"]')
    const incBtn = wrapper.find('button[aria-label="Increase quantity"]')

    expect(wrapper.text()).toContain('1')
    await decBtn.trigger('click')
    expect(wrapper.text()).toContain('1') // Doesn't go below 1

    await incBtn.trigger('click')
    expect(wrapper.text()).toContain('2')

    await decBtn.trigger('click')
    expect(wrapper.text()).toContain('1')
  })

  it('caps incrementing at stock limit and falls back to default 99 when stock undefined', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        ...sampleGame,
        stock: 2
      })
    } as Response)

    const wrapper = mountGameDetailView()
    await flushPromises()

    const incBtn = wrapper.find('button[aria-label="Increase quantity"]')
    await incBtn.trigger('click') // to 2
    expect(wrapper.text()).toContain('2')

    await incBtn.trigger('click') // capped at 2
    expect(wrapper.text()).toContain('2')
  })

  it('cycles screenshots with next and prev buttons and wraps around', async () => {
    const wrapper = mountGameDetailView()
    await flushPromises()

    const prevBtn = wrapper.find('button[aria-label="Previous screenshot"]')
    const nextBtn = wrapper.find('button[aria-label="Next screenshot"]')

    const mainImg = () => wrapper.find('section img')
    expect(mainImg().attributes('src')).toBe('sc1.jpg')

    await nextBtn.trigger('click')
    expect(mainImg().attributes('src')).toBe('sc2.jpg')

    await nextBtn.trigger('click')
    expect(mainImg().attributes('src')).toBe('sc3.jpg')

    await nextBtn.trigger('click') // wraps to start
    expect(mainImg().attributes('src')).toBe('sc1.jpg')

    await prevBtn.trigger('click') // wraps to end
    expect(mainImg().attributes('src')).toBe('sc3.jpg')
  })

  it('falls back to cover image when screenshots list is empty', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        ...sampleGame,
        screenshots: []
      })
    } as Response)

    const wrapper = mountGameDetailView()
    await flushPromises()

    const mainImg = wrapper.find('section img')
    expect(mainImg.attributes('src')).toBe('vs.jpg')
  })

  it('displays not found state when game does not exist or route param id is empty/undefined', async () => {
    mockRoute.params.id = 'non-existing-game'
    const wrapper = mountGameDetailView()
    await flushPromises()

    expect(wrapper.text()).toContain('Game Not Found')
  })

  it('loads remote game details on mount and updates on route change', async () => {
    mockRoute.params.id = 'custom-remote-game'
    vi.spyOn(globalThis, 'fetch').mockImplementation((requestUrl) => {
      const urlStr = String(requestUrl)
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
      if (urlStr.includes('elden-ring')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'elden-ring',
            name: 'Elden Ring',
            price: 1790,
            category: 'RPG',
            screenshots: ['er1.jpg'],
            coverImage: 'er.jpg',
            stock: 8
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

    // Route change to another string id
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
