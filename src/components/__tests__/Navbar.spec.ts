import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import Navbar from '../Navbar.vue'
import { useAuthStore } from '@/stores/auth'

const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

describe('Navbar', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    mockPush.mockClear()
  })

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

  it('renders brand name and icon-only Login link matching baseline when unauthenticated', () => {
    const wrapper = mountNavbar()
    expect(wrapper.text()).toContain('Mouse Jerry')
    const loginLink = wrapper.find('[data-test="navbar-login-link"]')
    expect(loginLink.exists()).toBe(true)
    expect(loginLink.attributes('aria-label')).toBe('Login')
    expect(loginLink.attributes('href')).toBe('/login?mode=login')
    expect(loginLink.find('i.fa-solid.fa-user').exists()).toBe(true)
    expect(wrapper.find('[data-test="navbar-user-btn"]').exists()).toBe(false)
  })

  it('renders dynamic username when authenticated and toggles dropdown', async () => {
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'thainchai' }, 'token-123')

    const wrapper = mountNavbar()
    const userBtn = wrapper.find('[data-test="navbar-user-btn"]')
    expect(userBtn.exists()).toBe(true)
    expect(wrapper.find('[data-test="navbar-username"]').text()).toBe('thainchai')

    // Initially dropdown closed
    expect(wrapper.find('[data-test="navbar-user-dropdown"]').exists()).toBe(false)

    // Open dropdown
    await userBtn.trigger('click')
    expect(wrapper.find('[data-test="navbar-user-dropdown"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Signed in as thainchai')

    // Close dropdown on click again
    await userBtn.trigger('click')
    expect(wrapper.find('[data-test="navbar-user-dropdown"]').exists()).toBe(false)
  })

  it('handles logout and navigates to login page', async () => {
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 2, username: 'gamer99' }, 'token-xyz')

    const wrapper = mountNavbar()
    const userBtn = wrapper.find('[data-test="navbar-user-btn"]')
    await userBtn.trigger('click')

    const logoutBtn = wrapper.find('[data-test="navbar-logout-btn"]')
    expect(logoutBtn.exists()).toBe(true)

    await logoutBtn.trigger('click')
    await flushPromises()

    expect(authStore.isAuthenticated).toBe(false)
    expect(mockPush).toHaveBeenCalledWith('/login?mode=login')
  })

  it('closes dropdowns when clicking outside', async () => {
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'thainchai' }, 'token-123')

    const wrapper = mountNavbar()
    const userBtn = wrapper.find('[data-test="navbar-user-btn"]')
    await userBtn.trigger('click')
    expect(wrapper.find('[data-test="navbar-user-dropdown"]').exists()).toBe(true)

    // Simulate clicking outside on document body
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-test="navbar-user-dropdown"]').exists()).toBe(false)
  })

  it('renders search input with accessible label and matching id', () => {
    const wrapper = mountNavbar()
    const label = wrapper.find('label[for="navbar-search"]')
    const input = wrapper.find('input#navbar-search')

    expect(label.exists()).toBe(true)
    expect(label.text()).toBe('Search epic games')
    expect(input.exists()).toBe(true)
  })

  it('toggles category dropdown menu on click and closes on item select', async () => {
    const wrapper = mountNavbar()
    const categoryBtn = wrapper.find('#category-dropdown-btn')
    expect(categoryBtn.exists()).toBe(true)

    // Initially closed
    expect(wrapper.find('a[href="/category/Fighting"]').exists()).toBe(false)

    // Open dropdown
    await categoryBtn.trigger('click')
    expect(wrapper.find('a[href="/category/Fighting"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Fighting')

    // Click item to close
    const categoryLink = wrapper.find('a[href="/category/Fighting"]')
    await categoryLink.trigger('click')
    expect(wrapper.find('a[href="/category/Fighting"]').exists()).toBe(false)
  })

  it('navigates to /search when search form is submitted with non-empty query', async () => {
    const wrapper = mountNavbar()
    const input = wrapper.find('input#navbar-search')

    await input.setValue('cyberpunk')
    await wrapper.find('form').trigger('submit.prevent')

    expect(mockPush).toHaveBeenCalledWith({
      path: '/search',
      query: { q: 'cyberpunk' }
    })
  })

  it('does not navigate when search query is empty or whitespace', async () => {
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

  it('updates categories on mount when fetchCategories returns remote list', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([
        { id: 99, name: 'Sci-Fi', slug: 'Sci-Fi', isVisible: true }
      ])
    } as unknown as Response)

    const wrapper = mountNavbar()
    await Promise.resolve()
    await Promise.resolve()

    const categoryBtn = wrapper.find('#category-dropdown-btn')
    await categoryBtn.trigger('click')
    expect(wrapper.text()).toContain('Sci-Fi')
  })

  it('does not close category dropdown when clicking inside it, and handles empty categories', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    } as unknown as Response)

    const wrapper = mountNavbar()
    await flushPromises()

    const categoryBtn = wrapper.find('#category-dropdown-btn')
    await categoryBtn.trigger('click')
    expect(wrapper.find('a[href="/category/Fighting"]').exists()).toBe(true)

    // Click inside the dropdown menu button itself
    await categoryBtn.trigger('click')
    // Click outside when dropdown is already closed
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('a[href="/category/Fighting"]').exists()).toBe(false)
  })
})

