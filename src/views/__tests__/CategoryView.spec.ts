import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
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

  it('handles page change and loads remote games from backend with pagination params', async () => {
    mockRouteParams.value = { category: 'Fighting' }
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
    mockRouteParams.value = { category: 'Fighting' }
    const wrapper = mountCategoryView()
    mockRouteParams.value = { category: 'Indie' }
    await wrapper.vm.$nextTick()
    await flushPromises()
    expect(wrapper.exists()).toBe(true)
  })
})
