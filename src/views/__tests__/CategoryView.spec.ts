import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { reactive } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import CategoryView from '../CategoryView.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const mockPush = vi.fn()
const mockRoute = reactive<{ params: { category?: unknown }; fullPath: string }>({
  params: { category: 'Fighting' },
  fullPath: '/category/Fighting'
})

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({ push: mockPush })
}))

const sampleFightingGames = [
  { id: 'cd-1', name: 'Clone Drone in the Hyperdome', price: 1702, category: 'Fighting', coverImage: 'cd.jpg' },
  { id: 'sf-1', name: 'Superfighters Deluxe', price: 1283, category: 'Fighting', coverImage: 'sf.jpg' }
]

describe('CategoryView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockPush.mockClear()
    vi.restoreAllMocks()
    mockRoute.params.category = 'Fighting'
    mockRoute.fullPath = '/category/Fighting'
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      headers: new Headers({ 'x-total-count': '2' }),
      json: () => Promise.resolve(sampleFightingGames)
    } as Response)
  })

  const mountCategoryView = () => {
    return mount(CategoryView, {
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

  it('renders breadcrumb and heading matching the category parameter', async () => {
    mockRoute.params.category = 'Fighting'
    const wrapper = mountCategoryView()
    await flushPromises()

    expect(wrapper.text()).toContain('Fighting')
    expect(wrapper.text()).toContain('Fighting Games')
    expect(wrapper.text()).toContain('2 products found')
  })

  it('renders game cards for the selected category', async () => {
    const wrapper = mountCategoryView()
    await flushPromises()

    expect(wrapper.text()).toContain('Clone Drone in the Hyperdome')
    expect(wrapper.text()).toContain('Superfighters Deluxe')
  })

  it('redirects to login when unauthenticated user adds game to cart', async () => {
    const wrapper = mountCategoryView()
    await flushPromises()

    const addButtons = wrapper.findAll('button[title="Add to Cart"]')
    expect(addButtons.length).toBeGreaterThan(0)
    await addButtons[0].trigger('click')

    expect(mockPush).toHaveBeenCalledWith({
      path: '/login',
      query: { mode: 'login', redirect: '/category/Fighting' }
    })
  })

  it('adds game to cart when authenticated user clicks add to cart', async () => {
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'tester' }, 'token-abc')
    const cartStore = useCartStore()
    const addItemSpy = vi.spyOn(cartStore, 'addItem').mockResolvedValue(true)

    const wrapper = mountCategoryView()
    await flushPromises()

    const addButtons = wrapper.findAll('button[title="Add to Cart"]')
    await addButtons[0].trigger('click')

    expect(addItemSpy).toHaveBeenCalledWith('cd-1', 1, 'Clone Drone in the Hyperdome')
  })

  it('updates games when route category param changes', async () => {
    mockRoute.params.category = 'Fighting'
    const wrapper = mountCategoryView()
    await flushPromises()

    mockRoute.params.category = 'Indie'
    await wrapper.vm.$nextTick()
    await flushPromises()
    expect(wrapper.exists()).toBe(true)

    mockRoute.params.category = undefined
    await wrapper.vm.$nextTick()
    await flushPromises()
    expect(wrapper.text()).toContain('No games found')
  })

  it('handles empty category param on initial mount gracefully', async () => {
    mockRoute.params.category = ''
    const wrapper = mountCategoryView()
    await flushPromises()
    expect(wrapper.text()).toContain('Category')
    expect(wrapper.text()).toContain('0 products found')
  })

  it('handles backend network errors gracefully with empty state', async () => {
    mockRoute.params.category = 'Fighting'
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Connection failed'))

    const wrapper = mountCategoryView()
    await flushPromises()

    expect(wrapper.text()).toContain('No games found')
    expect(wrapper.text()).toContain('0 products found')
  })
})
