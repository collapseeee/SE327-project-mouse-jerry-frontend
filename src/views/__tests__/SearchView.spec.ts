import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { reactive } from 'vue'
import SearchView from '../SearchView.vue'

const mockRoute = reactive<{ query: { q?: unknown } }>({
  query: { q: 'battle' }
})

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute
}))

const sampleSearchResults = [
  { id: 'bf-1', name: 'Battlefield 3: Premium Edition', price: 1969, coverImage: 'bf.jpg', category: 'Action' },
  { id: 'bb-1', name: 'Beast Battle Simulator', price: 1373, coverImage: 'bb.jpg', category: 'Simulation' }
]

describe('SearchView', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockRoute.query.q = 'battle'
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
    expect(wrapper.text()).toContain('Search Results for: "battle" Games')
    expect(wrapper.text()).toContain('2 products found')
  })

  it('renders matched games: Battlefield 3 and Beast Battle Simulator', async () => {
    mockRoute.query.q = 'battle'
    const wrapper = mountSearchView()
    await flushPromises()

    expect(wrapper.text()).toContain('Battlefield 3: Premium Edition')
    expect(wrapper.text()).toContain('1969 Baht')
    expect(wrapper.text()).toContain('Beast Battle Simulator')
    expect(wrapper.text()).toContain('1373 Baht')
  })

  it('shows empty state when no games match the query', async () => {
    mockRoute.query.q = 'NonExistingQueryXYZ123'
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      headers: new Headers({ 'x-total-count': '0' }),
      json: () => Promise.resolve([])
    } as Response)

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
    expect(wrapper.text()).toContain('0 products found')
  })

  it('handles backend search querying and pagination params', async () => {
    mockRoute.query.q = 'battle'
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation((requestUrl) => {
      const url = String(requestUrl)
      if (url.includes('page=2')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'x-total-count': '15' }),
          json: () => Promise.resolve([
            { id: 'remote-battle-p2', name: 'Remote Battle Page 2', price: 500, category: 'Action' }
          ])
        } as Response)
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'x-total-count': '15' }),
        json: () => Promise.resolve(sampleSearchResults)
      } as Response)
    })

    const wrapper = mountSearchView()
    await flushPromises()

    const pagination = wrapper.findComponent({ name: 'Pagination' })
    if (pagination.exists()) {
      await pagination.vm.$emit('page-change', 2)
      await flushPromises()
    }
    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('search=battle'))
    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('page=2'))
    expect(wrapper.text()).toContain('Remote Battle Page 2')
  })

  it('updates search results when query parameter changes', async () => {
    mockRoute.query.q = 'battle'
    const wrapper = mountSearchView()
    await flushPromises()

    mockRoute.query.q = 'ring'
    await wrapper.vm.$nextTick()
    await flushPromises()
    expect(wrapper.exists()).toBe(true)

    // Route changes to undefined / non-string
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
