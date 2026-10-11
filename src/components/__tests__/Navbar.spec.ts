import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Navbar from '../Navbar.vue'

const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

describe('Navbar', () => {
  const mountNavbar = () => {
    return mount(Navbar, {
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

  it('renders the brand name and username', () => {
    const wrapper = mountNavbar()
    expect(wrapper.text()).toContain('Mouse Jerry')
    expect(wrapper.text()).toContain('thainchai')
  })

  it('renders the search input with an accessible label and matching id', () => {
    const wrapper = mountNavbar()
    const label = wrapper.find('label[for="navbar-search"]')
    const input = wrapper.find('input#navbar-search')

    expect(label.exists()).toBe(true)
    expect(label.text()).toBe('Search epic games')
    expect(input.exists()).toBe(true)
  })

  it('toggles category dropdown menu on click', async () => {
    const wrapper = mountNavbar()
    const categoryBtn = wrapper.find('#category-dropdown-btn')
    expect(categoryBtn.exists()).toBe(true)

    // Initially closed
    expect(wrapper.find('a[href="/category/Fighting"]').exists()).toBe(false)

    // Open dropdown
    await categoryBtn.trigger('click')
    expect(wrapper.find('a[href="/category/Fighting"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Fighting')
    expect(wrapper.text()).toContain('Indie')

    // Click again to close
    await categoryBtn.trigger('click')
    expect(wrapper.find('a[href="/category/Fighting"]').exists()).toBe(false)
  })

  it('closes dropdown when clicking a category item', async () => {
    const wrapper = mountNavbar()
    const categoryBtn = wrapper.find('#category-dropdown-btn')
    await categoryBtn.trigger('click')

    const categoryLink = wrapper.find('a[href="/category/Fighting"]')
    expect(categoryLink.exists()).toBe(true)

    await categoryLink.trigger('click')
    expect(wrapper.find('a[href="/category/Fighting"]').exists()).toBe(false)
  })

  it('navigates to /search when search form is submitted with non-empty query', async () => {
    mockPush.mockClear()
    const wrapper = mountNavbar()
    const input = wrapper.find('input#navbar-search')

    await input.setValue('battle')
    await wrapper.find('form').trigger('submit.prevent')

    expect(mockPush).toHaveBeenCalledWith({
      path: '/search',
      query: { q: 'battle' }
    })
  })

  it('does not navigate when search query is empty or whitespace', async () => {
    mockPush.mockClear()
    const wrapper = mountNavbar()
    const input = wrapper.find('input#navbar-search')

    await input.setValue('   ')
    await wrapper.find('form').trigger('submit.prevent')

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('renders cart badge with product count', () => {
    const wrapper = mountNavbar()
    const cartLink = wrapper.find('a[href="/cart"]')
    expect(cartLink.exists()).toBe(true)
    expect(cartLink.text()).toContain('2')
  })
})
