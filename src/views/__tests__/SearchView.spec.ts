import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { reactive } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import SearchView from '../SearchView.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const mockPush = vi.fn()
const mockRoute = reactive<{ query: { q?: unknown }; fullPath: string }>({
  query: { q: 'battle' },
  fullPath: '/search?q=battle'
})

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({ push: mockPush })
}))

const sampleSearchResults = [
  { id: 'bf-1', name: 'Battlefield 3: Premium Edition', price: 1969, coverImage: 'bf.jpg', category: 'Action' },
  { id: 'bb-1', name: 'Beast Battle Simulator', price: 1373, coverImage: 'bb.jpg', category: 'Simulation' }
]

describe('SearchView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockPush.mockClear()
    vi.restoreAllMocks()
    mockRoute.query.q = 'battle'
    mockRoute.fullPath = '/search?q=battle'
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      headers: new Headers({ 'x-total-count': '2' }),
      json: () => Promise.resolve(sampleSearchResults)
    } as Response)
  })

  const mountSearchView = () => {
    return mount(SearchView, {
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

  it('renders search query in breadcrumb and heading matching Screenshot 1', async () => {
    mockRoute.query.q = 'battle'
    const wrapper = mountSearchView()
    await flushPromises()

    expect(wrapper.text()).toContain('Search Results for: "battle"')
    expect(wrapper.text()).toContain('2 products found')
  })

  it('renders matched games: Battlefield 3 and Beast Battle Simulator', async () => {
    const wrapper = mountSearchView()
    await flushPromises()

    expect(wrapper.text()).toContain('Battlefield 3: Premium Edition')
    expect(wrapper.text()).toContain('Beast Battle Simulator')
  })

  it('redirects to login when unauthenticated user adds game to cart from search', async () => {
    const wrapper = mountSearchView()
    await flushPromises()

    const addButtons = wrapper.findAll('button[title="Add to Cart"]')
    expect(addButtons.length).toBeGreaterThan(0)
    await addButtons[0].trigger('click')

    expect(mockPush).toHaveBeenCalledWith({
      path: '/login',
      query: { mode: 'login', redirect: '/search?q=battle' }
    })
  })

  it('adds game to cart when authenticated user clicks add to cart from search', async () => {
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'tester' }, 'token-abc')
    const cartStore = useCartStore()
    const addItemSpy = vi.spyOn(cartStore, 'addItem').mockResolvedValue(true)

    const wrapper = mountSearchView()
    await flushPromises()

    const addButtons = wrapper.findAll('button[title="Add to Cart"]')
    await addButtons[0].trigger('click')

    expect(addItemSpy).toHaveBeenCalledWith('bf-1', 1)
  })

  it('shows empty state when no games match the query', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      headers: new Headers({ 'x-total-count': '0' }),
      json: () => Promise.resolve([])
    } as Response)

    mockRoute.query.q = 'nonexistentgame'
    const wrapper = mountSearchView()
    await flushPromises()

    expect(wrapper.text()).toContain('No games found')
    expect(wrapper.text()).toContain('0 products found')
  })

  it('handles empty query parameter gracefully', async () => {
    mockRoute.query.q = ''
    const wrapper = mountSearchView()
    await flushPromises()

    expect(wrapper.text()).toContain('No games found')
  })

  it('handles backend search querying and pagination params', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'x-total-count': '15' }),
      json: () => Promise.resolve([
        { id: 'p2-1', name: 'Remote Battle Page 2', price: 999, coverImage: '', category: 'Action' }
      ])
    } as Response)

    const wrapper = mountSearchView()
    await flushPromises()

    const nextBtn = wrapper.findAll('button').find(b => b.text().includes('2'))
    if (nextBtn) {
      await nextBtn.trigger('click')
      await flushPromises()
    }

    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('search=battle'))
  })

  it('updates search results when query parameter changes', async () => {
    mockRoute.query.q = 'battle'
    const wrapper = mountSearchView()
    await flushPromises()

    mockRoute.query.q = 'ring'
    await wrapper.vm.$nextTick()
    await flushPromises()
    expect(wrapper.exists()).toBe(true)

    mockRoute.query.q = undefined
    await wrapper.vm.$nextTick()
    await flushPromises()
    expect(wrapper.text()).toContain('No games found')
  })

  it('handles non-string query parameter on mount gracefully', async () => {
    mockRoute.query.q = ['array'] as unknown as string
    const wrapper = mountSearchView()
    await flushPromises()
    expect(wrapper.text()).toContain('No games found')
  })

  it('handles backend network errors gracefully with empty state', async () => {
    mockRoute.query.q = 'battle'
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Backend offline'))

    const wrapper = mountSearchView()
    await flushPromises()

    expect(wrapper.text()).toContain('No games found')
    expect(wrapper.text()).toContain('0 products found')
  })
})
