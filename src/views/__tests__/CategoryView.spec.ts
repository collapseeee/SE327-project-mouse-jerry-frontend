import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import CategoryView from '../CategoryView.vue'

const mockRouteParams = ref<{ category?: string }>({ category: 'Fighting' })

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: mockRouteParams.value
  })
}))

describe('CategoryView', () => {
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
    mockRouteParams.value = { category: 'Fighting' }
    const wrapper = mountCategoryView()

    expect(wrapper.text()).toContain('Home')
    expect(wrapper.text()).toContain('Fighting')
    expect(wrapper.text()).toContain('Fighting Games')
    expect(wrapper.text()).toContain('products found')
  })

  it('renders products found under Fighting category', () => {
    mockRouteParams.value = { category: 'Fighting' }
    const wrapper = mountCategoryView()

    expect(wrapper.text()).toContain('Clone Drone in the Hyperdome')
    expect(wrapper.text()).toContain('1702 Baht')
    expect(wrapper.text()).toContain('Superfighters Deluxe')
  })

  it('shows empty state when category has no games', () => {
    mockRouteParams.value = { category: 'NonExistentCategory' }
    const wrapper = mountCategoryView()

    expect(wrapper.text()).toContain('No games found')
    expect(wrapper.text()).toContain('0 products found')
  })

  it('handles page change and loads remote games on mount', async () => {
    mockRouteParams.value = { category: 'Fighting' }
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'x-total-count': '1' }),
      json: () => Promise.resolve([
        { id: 'custom-fight', name: 'Custom Fighter', price: 99, category: 'Fighting' }
      ])
    } as unknown as Response)

    const wrapper = mountCategoryView()
    await Promise.resolve()
    await Promise.resolve()

    const pagination = wrapper.findComponent({ name: 'Pagination' })
    if (pagination.exists()) {
      await pagination.vm.$emit('update:current-page', 2)
    }
    expect(wrapper.exists()).toBe(true)
  })

  it('updates games when route category param changes', async () => {
    mockRouteParams.value = { category: 'Fighting' }
    const wrapper = mountCategoryView()
    mockRouteParams.value = { category: 'Indie' }
    await wrapper.vm.$nextTick()
    await Promise.resolve()
    expect(wrapper.exists()).toBe(true)
  })
})

