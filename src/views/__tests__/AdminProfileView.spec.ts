import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import AdminProfileView from '../AdminProfileView.vue'
import { useAuthStore } from '@/stores/auth'

const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

describe('AdminProfileView', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    mockPush.mockClear()
  })

  it('renders admin profile card with all components and animation classes', () => {
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'admin', role: 'ROLE_ADMIN' }, 'admin-token')

    const wrapper = mount(AdminProfileView)

    const card = wrapper.find('[data-test="admin-profile-card"]')
    expect(card.exists()).toBe(true)
    expect(card.classes()).toContain('animate-card')

    const avatar = wrapper.find('[data-test="admin-avatar"]')
    expect(avatar.exists()).toBe(true)
    expect(avatar.classes()).toContain('animate-avatar')

    const title = wrapper.find('[data-test="admin-title"]')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('ADMIN')
    expect(title.classes()).toContain('animate-title')

    const badge = wrapper.find('[data-test="admin-badge"]')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('ADMIN')
    expect(badge.classes()).toContain('animate-badge')

    const infoPanel = wrapper.find('[data-test="admin-info-panel"]')
    expect(infoPanel.exists()).toBe(true)
    expect(infoPanel.classes()).toContain('animate-info')

    const accountName = wrapper.find('[data-test="admin-account-name"]')
    expect(accountName.text()).toBe('admin')

    const systemAccess = wrapper.find('[data-test="admin-system-access"]')
    expect(systemAccess.text()).toBe('Back-Office Full')

    const serverStatus = wrapper.find('[data-test="admin-server-status"]')
    expect(serverStatus.text()).toContain('Online')

    const logoutBtn = wrapper.find('[data-test="admin-logout-btn"]')
    expect(logoutBtn.exists()).toBe(true)
    expect(logoutBtn.classes()).toContain('animate-logout')
    expect(logoutBtn.text().toLowerCase()).toContain('logout')
  })

  it('displays fallback username when not authenticated or username absent', () => {
    const wrapper = mount(AdminProfileView)

    const accountName = wrapper.find('[data-test="admin-account-name"]')
    expect(accountName.text()).toBe('admin')
  })

  it('handles logout and redirects to login page when logout button is clicked', async () => {
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'admin', role: 'ROLE_ADMIN' }, 'admin-token')
    const logoutSpy = vi.spyOn(authStore, 'logout').mockResolvedValue()

    const wrapper = mount(AdminProfileView)
    const logoutBtn = wrapper.find('[data-test="admin-logout-btn"]')

    await logoutBtn.trigger('click')

    expect(logoutSpy).toHaveBeenCalledTimes(1)
    expect(mockPush).toHaveBeenCalledWith('/login?mode=login')
  })
})
