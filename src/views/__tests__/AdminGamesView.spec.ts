import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { reactive } from 'vue'
import AdminGamesView from '../AdminGamesView.vue'
import { useAuthStore } from '@/stores/auth'
import { fetchAdminGames, deleteAdminGame } from '@/services/adminGameApi'

const mockPush = vi.fn()
const mockRoute = reactive({
  query: {} as Record<string, string>,
  params: {} as Record<string, string>
})

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => mockRoute
}))

vi.mock('@/services/adminGameApi', () => ({
  fetchAdminGames: vi.fn(),
  deleteAdminGame: vi.fn()
}))

const sampleGames = [
  {
    id: 'hollow-knight',
    name: 'Hollow Knight',
    price: 315,
    stock: 50,
    coverImage: 'hollow.jpg',
    category: 'Action'
  },
  {
    id: 'elden-ring',
    name: 'Elden Ring',
    price: 1790,
    stock: 40,
    coverImage: '',
    category: 'Action'
  }
]

describe('AdminGamesView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockPush.mockClear()
    mockRoute.query = {}
    mockRoute.params = {}
    vi.restoreAllMocks()

    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'admin', role: 'ROLE_ADMIN' }, 'mock-token')
  })

  it('renders page title and loads games into the table', async () => {
    vi.mocked(fetchAdminGames).mockResolvedValueOnce({
      games: sampleGames,
      totalCount: 2
    })

    const wrapper = mount(AdminGamesView)
    await flushPromises()

    expect(wrapper.text()).toContain('BACK-OFFICE GAME PAGE')
    expect(wrapper.find('[data-test="admin-games-table"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="game-row-hollow-knight"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Hollow Knight')
    expect(wrapper.text()).toContain('315 baht')
    expect(wrapper.text()).toContain('50')
    expect(wrapper.find('[data-test="game-row-elden-ring"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Elden Ring')
  })

  it('renders empty state when no games exist', async () => {
    vi.mocked(fetchAdminGames).mockResolvedValueOnce({
      games: [],
      totalCount: 0
    })

    const wrapper = mount(AdminGamesView)
    await flushPromises()

    expect(wrapper.text()).toContain('No games found')
  })

  it('handles load error and allows retry', async () => {
    vi.mocked(fetchAdminGames)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ games: sampleGames, totalCount: 2 })

    const wrapper = mount(AdminGamesView)
    await flushPromises()

    expect(wrapper.text()).toContain('Network error')
    const retryBtn = wrapper.find('button.underline')
    expect(retryBtn.exists()).toBe(true)

    await retryBtn.trigger('click')
    await flushPromises()

    expect(fetchAdminGames).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toContain('Hollow Knight')
  })

  it('navigates to edit game on Edit click', async () => {
    vi.mocked(fetchAdminGames).mockResolvedValueOnce({
      games: sampleGames,
      totalCount: 2
    })

    const wrapper = mount(AdminGamesView)
    await flushPromises()

    const editBtn = wrapper.find('[data-test="edit-btn-hollow-knight"]')
    await editBtn.trigger('click')

    expect(mockPush).toHaveBeenCalledWith('/admin/games/hollow-knight/edit')
  })

  it('navigates to add game on floating action button click', async () => {
    vi.mocked(fetchAdminGames).mockResolvedValueOnce({
      games: sampleGames,
      totalCount: 2
    })

    const wrapper = mount(AdminGamesView)
    await flushPromises()

    const fabBtn = wrapper.find('[data-test="fab-add-game"]')
    await fabBtn.trigger('click')

    expect(mockPush).toHaveBeenCalledWith('/admin/games/new')
  })

  it('opens confirmation modal and deletes game on confirm', async () => {
    vi.mocked(fetchAdminGames).mockResolvedValueOnce({
      games: sampleGames,
      totalCount: 2
    })
    vi.mocked(deleteAdminGame).mockResolvedValueOnce()

    const wrapper = mount(AdminGamesView)
    await flushPromises()

    // Click delete on hollow knight
    const deleteBtn = wrapper.find('[data-test="delete-btn-hollow-knight"]')
    await deleteBtn.trigger('click')

    // Modal appears
    const modal = wrapper.find('[data-test="delete-modal"]')
    expect(modal.exists()).toBe(true)
    expect(modal.text()).toContain('Are you sure you want to delete')

    // Confirm deletion
    const confirmBtn = wrapper.find('[data-test="confirm-delete-btn"]')
    await confirmBtn.trigger('click')
    await flushPromises()

    expect(deleteAdminGame).toHaveBeenCalledWith('mock-token', 'hollow-knight')
    expect(wrapper.find('[data-test="game-row-hollow-knight"]').exists()).toBe(false)
  })

  it('cancels deletion when clicking Cancel in delete modal', async () => {
    vi.mocked(fetchAdminGames).mockResolvedValueOnce({
      games: sampleGames,
      totalCount: 2
    })

    const wrapper = mount(AdminGamesView)
    await flushPromises()

    const deleteBtn = wrapper.find('[data-test="delete-btn-hollow-knight"]')
    await deleteBtn.trigger('click')

    const cancelBtn = wrapper.find('[data-test="delete-modal"] button')
    await cancelBtn.trigger('click')

    expect(wrapper.find('[data-test="delete-modal"]').exists()).toBe(false)
    expect(deleteAdminGame).not.toHaveBeenCalled()
  })

  it('handles route query search filter updates', async () => {
    vi.mocked(fetchAdminGames).mockResolvedValue({
      games: [sampleGames[0]],
      totalCount: 1
    })

    const wrapper = mount(AdminGamesView)
    await flushPromises()
    expect(wrapper.exists()).toBe(true)

    mockRoute.query = { search: 'Hollow' }
    await flushPromises()

    expect(fetchAdminGames).toHaveBeenCalledWith('mock-token', expect.objectContaining({ search: 'Hollow' }))
  })
})
