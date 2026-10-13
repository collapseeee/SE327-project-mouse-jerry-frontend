import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import AdminCategoriesView from '../AdminCategoriesView.vue'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import {
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  toggleAdminCategoryVisibility,
  deleteAdminCategory
} from '@/services/adminCategoryApi'
import type { CategoryItem } from '@/types/game'

const mockPush = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush })
}))

vi.mock('@/services/adminCategoryApi', () => ({
  fetchAdminCategories: vi.fn(),
  createAdminCategory: vi.fn(),
  updateAdminCategory: vi.fn(),
  toggleAdminCategoryVisibility: vi.fn(),
  deleteAdminCategory: vi.fn()
}))

const sampleCategories: CategoryItem[] = [
  { id: 1, name: 'Action', slug: 'action', isVisible: true },
  { id: 2, name: 'Adventure', slug: 'adventure', isVisible: true },
  { id: 3, name: 'RPG', slug: 'rpg', isVisible: true },
  { id: 4, name: 'Strategy', slug: 'strategy', isVisible: false }
]

describe('AdminCategoriesView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockPush.mockClear()
    vi.restoreAllMocks()

    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'admin', role: 'ROLE_ADMIN' }, 'mock-token')
  })

  it('renders page title and loads categories into the table', async () => {
    vi.mocked(fetchAdminCategories).mockResolvedValueOnce(sampleCategories)

    const wrapper = mount(AdminCategoriesView)
    await flushPromises()

    expect(wrapper.text()).toContain('BACK-OFFICE CATEGORIES PAGE')
    expect(wrapper.find('[data-test="admin-categories-table"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="category-row-1"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Action')
    expect(wrapper.text()).toContain('Strategy')

    const actionToggle = wrapper.find('[data-test="visibility-toggle-1"]')
    expect(actionToggle.find('[data-test="icon-visible"]').exists()).toBe(true)

    const strategyToggle = wrapper.find('[data-test="visibility-toggle-4"]')
    expect(strategyToggle.find('[data-test="icon-hidden"]').exists()).toBe(true)
  })

  it('renders empty state when no categories exist', async () => {
    vi.mocked(fetchAdminCategories).mockResolvedValueOnce([])

    const wrapper = mount(AdminCategoriesView)
    await flushPromises()

    expect(wrapper.text()).toContain('No categories found')
  })

  it('handles load error and allows retry', async () => {
    vi.mocked(fetchAdminCategories)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(sampleCategories)

    const wrapper = mount(AdminCategoriesView)
    await flushPromises()

    expect(wrapper.text()).toContain('Network error')
    const retryBtn = wrapper.find('button.underline')
    expect(retryBtn.exists()).toBe(true)

    await retryBtn.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Action')
  })

  it('does not load categories if unauthenticated', async () => {
    const authStore = useAuthStore()
    authStore.token = null

    mount(AdminCategoriesView)
    await flushPromises()

    expect(fetchAdminCategories).not.toHaveBeenCalled()
  })

  it('toggles category visibility successfully', async () => {
    vi.mocked(fetchAdminCategories).mockResolvedValueOnce([...sampleCategories])
    vi.mocked(toggleAdminCategoryVisibility).mockResolvedValueOnce({
      id: 1,
      name: 'Action',
      slug: 'action',
      isVisible: false
    })

    const wrapper = mount(AdminCategoriesView)
    await flushPromises()

    const toggleBtn = wrapper.find('[data-test="visibility-toggle-1"]')
    await toggleBtn.trigger('click')
    await flushPromises()

    expect(toggleAdminCategoryVisibility).toHaveBeenCalledWith('mock-token', 1, false)
    expect(wrapper.find('[data-test="visibility-toggle-1"]').find('[data-test="icon-hidden"]').exists()).toBe(true)
  })

  it('handles visibility toggle failure gracefully', async () => {
    vi.mocked(fetchAdminCategories).mockResolvedValueOnce([...sampleCategories])
    vi.mocked(toggleAdminCategoryVisibility).mockRejectedValueOnce(new Error('Toggle failed'))

    const toastStore = useToastStore()
    const errorSpy = vi.spyOn(toastStore, 'showError')

    const wrapper = mount(AdminCategoriesView)
    await flushPromises()

    const toggleBtn = wrapper.find('[data-test="visibility-toggle-1"]')
    await toggleBtn.trigger('click')
    await flushPromises()

    expect(errorSpy).toHaveBeenCalledWith('Toggle failed')
  })

  it('navigates to admin games with search query when clicking View button', async () => {
    vi.mocked(fetchAdminCategories).mockResolvedValueOnce(sampleCategories)

    const wrapper = mount(AdminCategoriesView)
    await flushPromises()

    const viewBtn = wrapper.find('[data-test="view-games-btn-1"]')
    await viewBtn.trigger('click')

    expect(mockPush).toHaveBeenCalledWith({
      path: '/admin/games',
      query: { search: 'Action' }
    })
  })

  it('opens Add New Category modal and cancels it', async () => {
    vi.mocked(fetchAdminCategories).mockResolvedValueOnce(sampleCategories)

    const wrapper = mount(AdminCategoriesView)
    await flushPromises()

    expect(wrapper.find('[data-test="add-category-modal"]').exists()).toBe(false)

    const fabBtn = wrapper.find('[data-test="add-category-fab"]')
    await fabBtn.trigger('click')

    expect(wrapper.find('[data-test="add-category-modal"]').exists()).toBe(true)

    const cancelBtn = wrapper.find('[data-test="cancel-add-btn"]')
    await cancelBtn.trigger('click')

    expect(wrapper.find('[data-test="add-category-modal"]').exists()).toBe(false)
  })

  it('submits Add New Category form successfully', async () => {
    vi.mocked(fetchAdminCategories)
      .mockResolvedValueOnce([...sampleCategories])
      .mockResolvedValueOnce([
        ...sampleCategories,
        { id: 5, name: 'Puzzle', slug: 'puzzle', isVisible: true }
      ])
    vi.mocked(createAdminCategory).mockResolvedValueOnce({
      id: 5,
      name: 'Puzzle',
      slug: 'puzzle',
      isVisible: true
    })

    const wrapper = mount(AdminCategoriesView)
    await flushPromises()

    await wrapper.find('[data-test="add-category-fab"]').trigger('click')

    const input = wrapper.find('[data-test="new-category-name-input"]')
    await input.setValue('  Puzzle  ')

    const form = wrapper.find('[data-test="add-category-modal"] form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(createAdminCategory).toHaveBeenCalledWith('mock-token', 'Puzzle')
    expect(wrapper.find('[data-test="add-category-modal"]').exists()).toBe(false)
    expect(fetchAdminCategories).toHaveBeenCalledTimes(2)
  })

  it('handles Add Category failure', async () => {
    vi.mocked(fetchAdminCategories).mockResolvedValueOnce(sampleCategories)
    vi.mocked(createAdminCategory).mockRejectedValueOnce(new Error('Name already exists'))

    const toastStore = useToastStore()
    const errorSpy = vi.spyOn(toastStore, 'showError')

    const wrapper = mount(AdminCategoriesView)
    await flushPromises()

    await wrapper.find('[data-test="add-category-fab"]').trigger('click')
    await wrapper.find('[data-test="new-category-name-input"]').setValue('Duplicate')

    await wrapper.find('[data-test="add-category-modal"] form').trigger('submit.prevent')
    await flushPromises()

    expect(errorSpy).toHaveBeenCalledWith('Name already exists')
    expect(wrapper.find('[data-test="add-category-modal"]').exists()).toBe(true)
  })

  it('opens Edit Category modal and cancels it', async () => {
    vi.mocked(fetchAdminCategories).mockResolvedValueOnce(sampleCategories)

    const wrapper = mount(AdminCategoriesView)
    await flushPromises()

    expect(wrapper.find('[data-test="edit-category-modal"]').exists()).toBe(false)

    const editBtn = wrapper.find('[data-test="edit-btn-1"]')
    await editBtn.trigger('click')

    expect(wrapper.find('[data-test="edit-category-modal"]').exists()).toBe(true)
    const currentInput = wrapper.find('[data-test="current-category-name-input"]')
    expect((currentInput.element as HTMLInputElement).value).toBe('Action')

    const cancelBtn = wrapper.find('[data-test="cancel-edit-btn"]')
    await cancelBtn.trigger('click')

    expect(wrapper.find('[data-test="edit-category-modal"]').exists()).toBe(false)
  })

  it('submits Edit Category form successfully', async () => {
    vi.mocked(fetchAdminCategories)
      .mockResolvedValueOnce([...sampleCategories])
      .mockResolvedValueOnce([
        { id: 1, name: 'Action & Adventure', slug: 'action-adventure', isVisible: true },
        sampleCategories[1],
        sampleCategories[2],
        sampleCategories[3]
      ])
    vi.mocked(updateAdminCategory).mockResolvedValueOnce({
      id: 1,
      name: 'Action & Adventure',
      slug: 'action-adventure',
      isVisible: true
    })

    const wrapper = mount(AdminCategoriesView)
    await flushPromises()

    await wrapper.find('[data-test="edit-btn-1"]').trigger('click')

    const editInput = wrapper.find('[data-test="edit-category-name-input"]')
    await editInput.setValue('Action & Adventure')

    await wrapper.find('[data-test="edit-category-modal"] form').trigger('submit.prevent')
    await flushPromises()

    expect(updateAdminCategory).toHaveBeenCalledWith('mock-token', 1, 'Action & Adventure')
    expect(wrapper.find('[data-test="edit-category-modal"]').exists()).toBe(false)
  })

  it('handles Edit Category failure', async () => {
    vi.mocked(fetchAdminCategories).mockResolvedValueOnce(sampleCategories)
    vi.mocked(updateAdminCategory).mockRejectedValueOnce(new Error('Update failed'))

    const toastStore = useToastStore()
    const errorSpy = vi.spyOn(toastStore, 'showError')

    const wrapper = mount(AdminCategoriesView)
    await flushPromises()

    await wrapper.find('[data-test="edit-btn-1"]').trigger('click')
    await wrapper.find('[data-test="edit-category-name-input"]').setValue('New Name')

    await wrapper.find('[data-test="edit-category-modal"] form').trigger('submit.prevent')
    await flushPromises()

    expect(errorSpy).toHaveBeenCalledWith('Update failed')
    expect(wrapper.find('[data-test="edit-category-modal"]').exists()).toBe(true)
  })

  it('opens Delete confirmation modal and cancels it', async () => {
    vi.mocked(fetchAdminCategories).mockResolvedValueOnce(sampleCategories)

    const wrapper = mount(AdminCategoriesView)
    await flushPromises()

    expect(wrapper.find('[data-test="delete-category-modal"]').exists()).toBe(false)

    await wrapper.find('[data-test="delete-btn-1"]').trigger('click')
    expect(wrapper.find('[data-test="delete-category-modal"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Are you sure you want to delete category')
    expect(wrapper.text()).toContain('"Action"')

    await wrapper.find('[data-test="cancel-delete-btn"]').trigger('click')
    expect(wrapper.find('[data-test="delete-category-modal"]').exists()).toBe(false)
  })

  it('executes delete category successfully', async () => {
    vi.mocked(fetchAdminCategories)
      .mockResolvedValueOnce([...sampleCategories])
      .mockResolvedValueOnce(sampleCategories.slice(1))
    vi.mocked(deleteAdminCategory).mockResolvedValueOnce()

    const wrapper = mount(AdminCategoriesView)
    await flushPromises()

    await wrapper.find('[data-test="delete-btn-1"]').trigger('click')
    await wrapper.find('[data-test="confirm-delete-btn"]').trigger('click')
    await flushPromises()

    expect(deleteAdminCategory).toHaveBeenCalledWith('mock-token', 1)
    expect(wrapper.find('[data-test="delete-category-modal"]').exists()).toBe(false)
  })

  it('handles delete category failure', async () => {
    vi.mocked(fetchAdminCategories).mockResolvedValueOnce(sampleCategories)
    vi.mocked(deleteAdminCategory).mockRejectedValueOnce(new Error('Delete forbidden'))

    const toastStore = useToastStore()
    const errorSpy = vi.spyOn(toastStore, 'showError')

    const wrapper = mount(AdminCategoriesView)
    await flushPromises()

    await wrapper.find('[data-test="delete-btn-1"]').trigger('click')
    await wrapper.find('[data-test="confirm-delete-btn"]').trigger('click')
    await flushPromises()

    expect(errorSpy).toHaveBeenCalledWith('Delete forbidden')
    expect(wrapper.find('[data-test="delete-category-modal"]').exists()).toBe(true)
  })
})
