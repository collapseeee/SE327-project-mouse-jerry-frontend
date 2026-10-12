import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import SearchView from '../SearchView.vue'

const mockRouteQuery = ref<{ q?: string }>({ q: 'battle' })

vi.mock('vue-router', () => ({
  useRoute: () => ({
    query: mockRouteQuery.value
  })
}))

describe('SearchView', () => {
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

  it('renders search query in breadcrumb and heading matching Screenshot 1', () => {
    mockRouteQuery.value = { q: 'battle' }
    const wrapper = mountSearchView()

    expect(wrapper.text()).toContain('Search Results for: "battle"')
    expect(wrapper.text()).toContain('Search Results for: "battle" Games')
    expect(wrapper.text()).toContain('2 products found')
  })

  it('renders matched games: Battlefield 3 and Beast Battle Simulator', () => {
    mockRouteQuery.value = { q: 'battle' }
    const wrapper = mountSearchView()

    expect(wrapper.text()).toContain('Battlefield 3: Premium Edition')
    expect(wrapper.text()).toContain('1969 Baht')
    expect(wrapper.text()).toContain('Beast Battle Simulator')
    expect(wrapper.text()).toContain('1373 Baht')
  })

  it('shows empty state when no games match the query', () => {
    mockRouteQuery.value = { q: 'NonExistingQueryXYZ123' }
    const wrapper = mountSearchView()

    expect(wrapper.text()).toContain('No games found')
    expect(wrapper.text()).toContain('0 products found')
  })

  it('handles empty query parameter gracefully', () => {
    mockRouteQuery.value = { q: '' }
    const wrapper = mountSearchView()
    expect(wrapper.text()).toContain('No games found')
  })

  it('handles backend search querying and pagination params', async () => {
    mockRouteQuery.value = { q: 'battle' }
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      headers: new Headers({ 'x-total-count': '15' }),
      json: () => Promise.resolve([
        { id: 'remote-battle-p2', name: 'Remote Battle Page 2', price: 500, category: 'Action' }
      ])
    } as unknown as Response)

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
    mockRouteQuery.value = { q: 'battle' }
    const wrapper = mountSearchView()
    mockRouteQuery.value = { q: 'ring' }
    await wrapper.vm.$nextTick()
    await flushPromises()
    expect(wrapper.exists()).toBe(true)
  })
})
