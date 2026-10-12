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

describe('CategoryView', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockRoute.params.category = 'Fighting'
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

  it('renders breadcrumb and heading matching the category parameter', () => {
    mockRoute.params.category = 'Fighting'
    const wrapper = mountCategoryView()

    expect(wrapper.text()).toContain('Home')
    expect(wrapper.text()).toContain('Fighting')
    expect(wrapper.text()).toContain('Fighting Games')
    expect(wrapper.text()).toContain('products found')
  })

  it('renders products found under Fighting category', () => {
    mockRoute.params.category = 'Fighting'
    const wrapper = mountCategoryView()

    expect(wrapper.text()).toContain('Clone Drone in the Hyperdome')
    expect(wrapper.text()).toContain('1702 Baht')
    expect(wrapper.text()).toContain('Superfighters Deluxe')
  })

  it('shows empty state when category has no games', () => {
    mockRoute.params.category = 'NonExistentCategory'
    const wrapper = mountCategoryView()

    expect(wrapper.text()).toContain('No games found')
    expect(wrapper.text()).toContain('0 products found')
  })

  it('handles page change and loads remote games from backend with pagination params', async () => {
    mockRoute.params.category = 'Fighting'
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      headers: new Headers({ 'x-total-count': '25' }),
      json: () => Promise.resolve([
        { id: 'custom-fight-p2', name: 'Custom Fighter Page 2', price: 99, category: 'Fighting' }
      ])
    } as unknown as Response)

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

  it('handles empty category param on initial mount gracefully', () => {
    mockRoute.params.category = ''
    const wrapper = mountCategoryView()
    expect(wrapper.text()).toContain('Category')
    expect(wrapper.text()).toContain('0 products found')
  })

  it('falls back to local category games when remote returns 0 items', async () => {
    mockRoute.params.category = 'Fighting'
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'x-total-count': '0' }),
      json: () => Promise.resolve([])
    } as unknown as Response)

    const wrapper = mountCategoryView()
    await flushPromises()

    expect(wrapper.text()).toContain('Clone Drone in the Hyperdome')
  })
})
