import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
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
})
