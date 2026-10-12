import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { reactive } from 'vue'
import CategoryView from '../CategoryView.vue'

const mockRoute = reactive<{ params: { category?: unknown } }>({
  params: { category: 'Fighting' }
})

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute
}))

const sampleFightingGames = [
  { id: 'cd-1', name: 'Clone Drone in the Hyperdome', price: 1702, category: 'Fighting', coverImage: 'cd.jpg' },
  { id: 'sf-1', name: 'Superfighters Deluxe', price: 1283, category: 'Fighting', coverImage: 'sf.jpg' }
]

describe('CategoryView', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockRoute.params.category = 'Fighting'
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

    expect(wrapper.text()).toContain('Home')
    expect(wrapper.text()).toContain('Fighting')
    expect(wrapper.text()).toContain('Fighting Games')
    expect(wrapper.text()).toContain('2 products found')
  })

  it('renders products found under Fighting category', async () => {
    mockRoute.params.category = 'Fighting'
    const wrapper = mountCategoryView()
    await flushPromises()

    expect(wrapper.text()).toContain('Clone Drone in the Hyperdome')
    expect(wrapper.text()).toContain('1702 Baht')
    expect(wrapper.text()).toContain('Superfighters Deluxe')
  })

  it('shows empty state when category has no games', async () => {
    mockRoute.params.category = 'NonExistentCategory'
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      headers: new Headers({ 'x-total-count': '0' }),
      json: () => Promise.resolve([])
    } as Response)

    const wrapper = mountCategoryView()
    await flushPromises()

    expect(wrapper.text()).toContain('No games found')
    expect(wrapper.text()).toContain('0 products found')
  })

  it('handles page change and loads remote games from backend with pagination params', async () => {
    mockRoute.params.category = 'Fighting'
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation((requestUrl) => {
      const url = String(requestUrl)
      if (url.includes('page=2')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'x-total-count': '25' }),
          json: () => Promise.resolve([
            { id: 'custom-fight-p2', name: 'Custom Fighter Page 2', price: 99, category: 'Fighting' }
          ])
        } as Response)
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'x-total-count': '25' }),
        json: () => Promise.resolve(sampleFightingGames)
      } as Response)
    })

    const wrapper = mountCategoryView()
    await flushPromises()

    const pagination = wrapper.findComponent({ name: 'Pagination' })
    if (pagination.exists()) {
      await pagination.vm.$emit('page-change', 2)
      await flushPromises()
    }
    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('page=2'))
    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('category=Fighting'))
    expect(wrapper.text()).toContain('Custom Fighter Page 2')
  })

  it('updates games when route category param changes', async () => {
    mockRoute.params.category = 'Fighting'
    const wrapper = mountCategoryView()
    await flushPromises()

    mockRoute.params.category = 'Indie'
    await wrapper.vm.$nextTick()
    await flushPromises()
    expect(wrapper.exists()).toBe(true)

    // Route changes to undefined / non-string
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
