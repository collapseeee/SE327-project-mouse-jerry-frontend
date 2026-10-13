import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { reactive } from 'vue'
import AdminGameFormView from '../AdminGameFormView.vue'
import { useAuthStore } from '@/stores/auth'
import {
  fetchAdminGameById,
  createAdminGame,
  updateAdminGame,
  uploadGameImage
} from '@/services/adminGameApi'
import { fetchCategories } from '@/services/categoryApi'
import type { Game } from '@/types/game'

const mockPush = vi.fn()
const mockRoute = reactive({
  params: {} as Record<string, string>,
  query: {} as Record<string, string>
})

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => mockRoute
}))

vi.mock('@/services/adminGameApi', () => ({
  fetchAdminGameById: vi.fn(),
  createAdminGame: vi.fn(),
  updateAdminGame: vi.fn(),
  uploadGameImage: vi.fn()
}))

vi.mock('@/services/categoryApi', () => ({
  fetchCategories: vi.fn()
}))

const mockCategories = [
  { id: 1, name: 'Action', slug: 'action' },
  { id: 2, name: 'RPG', slug: 'rpg' }
]

describe('AdminGameFormView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockPush.mockClear()
    mockRoute.params = {}
    mockRoute.query = {}
    vi.restoreAllMocks()

    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'admin', role: 'ROLE_ADMIN' }, 'mock-token')

    vi.mocked(fetchCategories).mockResolvedValue(mockCategories)
  })

  describe('Add New Game Mode', () => {
    it('renders Add New Game title and default fields', async () => {
      const wrapper = mount(AdminGameFormView)
      await flushPromises()

      expect(wrapper.text()).toContain('ADD NEW GAME')
      expect(wrapper.find('[data-test="input-game-name"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="input-game-price"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="input-game-stock"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="textarea-description"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="req-os-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="req-processor-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="req-memory-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="req-graphics-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="req-storage-input"]').exists()).toBe(true)
    })

    it('adds and removes category chips', async () => {
      const wrapper = mount(AdminGameFormView)
      await flushPromises()

      const select = wrapper.find('[data-test="category-select"]')
      await select.setValue('Action')

      const addBtn = wrapper.find('[data-test="add-category-btn"]')
      await addBtn.trigger('click')

      expect(wrapper.find('[data-test="category-tag-Action"]').exists()).toBe(true)

      // Remove category
      const removeBtn = wrapper.find('[data-test="category-tag-Action"] button')
      await removeBtn.trigger('click')

      expect(wrapper.find('[data-test="category-tag-Action"]').exists()).toBe(false)
    })

    it('opens image modal, enters URL and sets cover image and removes it', async () => {
      const wrapper = mount(AdminGameFormView)
      await flushPromises()

      const coverSlot = wrapper.find('[data-test="cover-image-slot"]')
      await coverSlot.trigger('click')

      const modal = wrapper.find('[data-test="image-url-modal"]')
      expect(modal.exists()).toBe(true)

      const urlInput = wrapper.find('[data-test="modal-url-input"]')
      await urlInput.setValue('https://example.com/cover.png')

      const confirmBtn = wrapper.find('[data-test="modal-confirm-btn"]')
      await confirmBtn.trigger('click')

      expect(wrapper.find('[data-test="image-url-modal"]').exists()).toBe(false)
      expect(coverSlot.find('img').attributes('src')).toBe('https://example.com/cover.png')

      // Remove cover image
      const removeBtn = wrapper.find('[data-test="remove-cover-btn"]')
      await removeBtn.trigger('click')
      expect(coverSlot.find('img').exists()).toBe(false)
    })

    it('sets and removes screenshot slot via image modal', async () => {
      const wrapper = mount(AdminGameFormView)
      await flushPromises()

      const shotSlot = wrapper.find('[data-test="screenshot-slot-0"]')
      await shotSlot.trigger('click')

      const urlInput = wrapper.find('[data-test="modal-url-input"]')
      await urlInput.setValue('https://example.com/shot1.png')

      const confirmBtn = wrapper.find('[data-test="modal-confirm-btn"]')
      await confirmBtn.trigger('click')

      expect(shotSlot.find('img').attributes('src')).toBe('https://example.com/shot1.png')

      // Remove screenshot
      const removeBtn = wrapper.find('[data-test="remove-screenshot-0"]')
      await removeBtn.trigger('keydown.enter')
      expect(shotSlot.find('img').exists()).toBe(false)
    })

    it('handles S3 file upload in image modal', async () => {
      vi.mocked(uploadGameImage).mockResolvedValueOnce('https://s3.amazonaws.com/games/uploaded.png')

      const wrapper = mount(AdminGameFormView)
      await flushPromises()

      await wrapper.find('[data-test="cover-image-slot"]').trigger('click')

      const fileInput = wrapper.find('[data-test="hidden-file-input"]')
      const file = new File(['content'], 'test.png', { type: 'image/png' })

      Object.defineProperty(fileInput.element, 'files', {
        value: [file]
      })
      await fileInput.trigger('change')
      await flushPromises()

      expect(uploadGameImage).toHaveBeenCalledWith('mock-token', file)
      const urlInput = wrapper.find('[data-test="modal-url-input"]')
      expect((urlInput.element as HTMLInputElement).value).toBe('https://s3.amazonaws.com/games/uploaded.png')
    })

    it('navigates to /admin/games on Cancel click', async () => {
      const wrapper = mount(AdminGameFormView)
      await flushPromises()

      const cancelBtn = wrapper.find('[data-test="cancel-btn"]')
      await cancelBtn.trigger('click')

      expect(mockPush).toHaveBeenCalledWith('/admin/games')
    })

    it('submits valid game creation with system requirements', async () => {
      const mockCreatedGame: Game = {
        id: 'cyberpunk',
        name: 'Cyberpunk 2077',
        price: 1399,
        stock: 25,
        coverImage: '',
        category: 'RPG'
      }
      vi.mocked(createAdminGame).mockResolvedValueOnce(mockCreatedGame)

      const wrapper = mount(AdminGameFormView)
      await flushPromises()

      await wrapper.find('[data-test="input-game-name"]').setValue('Cyberpunk 2077')
      await wrapper.find('[data-test="input-game-price"]').setValue('1399')
      await wrapper.find('[data-test="input-game-stock"]').setValue('25')
      await wrapper.find('[data-test="textarea-description"]').setValue('Futuristic open world RPG')

      await wrapper.find('[data-test="req-os-input"]').setValue('Windows 10 64-bit')
      await wrapper.find('[data-test="req-processor-input"]').setValue('Intel Core i7')
      await wrapper.find('[data-test="req-memory-input"]').setValue('16 GB')
      await wrapper.find('[data-test="req-graphics-input"]').setValue('RTX 2060')
      await wrapper.find('[data-test="req-storage-input"]').setValue('70 GB')

      const form = wrapper.find('[data-test="admin-game-form"]')
      await form.trigger('submit')
      await flushPromises()

      expect(createAdminGame).toHaveBeenCalledWith(
        'mock-token',
        expect.objectContaining({
          name: 'Cyberpunk 2077',
          price: 1399,
          stock: 25,
          systemRequirements: {
            os: 'Windows 10 64-bit',
            processor: 'Intel Core i7',
            memory: '16 GB',
            graphics: 'RTX 2060',
            storage: '70 GB'
          }
        })
      )
      expect(mockPush).toHaveBeenCalledWith('/admin/games')
    })

    it('prevents submission if game name is blank', async () => {
      const wrapper = mount(AdminGameFormView)
      await flushPromises()

      await wrapper.find('[data-test="input-game-name"]').setValue('   ')
      const form = wrapper.find('[data-test="admin-game-form"]')
      await form.trigger('submit')
      await flushPromises()

      expect(createAdminGame).not.toHaveBeenCalled()
    })
  })

  describe('Edit Game Mode', () => {
    beforeEach(() => {
      mockRoute.params = { id: 'elden-ring' }
    })

    it('loads existing game data into form fields', async () => {
      vi.mocked(fetchAdminGameById).mockResolvedValueOnce({
        id: 'elden-ring',
        name: 'Elden Ring',
        price: 1790,
        stock: 40,
        coverImage: 'https://img.com/elden.jpg',
        description: 'FromSoftware masterpiece',
        category: 'Action',
        categories: ['Action', 'RPG'],
        screenshots: ['https://img.com/ss1.jpg'],
        systemRequirements: {
          os: 'Windows 10',
          processor: 'Core i5-8400',
          memory: '12 GB RAM',
          graphics: 'GTX 1060',
          storage: '60 GB'
        }
      })

      const wrapper = mount(AdminGameFormView)
      await flushPromises()

      expect(wrapper.text()).toContain('EDIT GAME')
      expect((wrapper.find('[data-test="input-game-name"]').element as HTMLInputElement).value).toBe('Elden Ring')
      expect((wrapper.find('[data-test="input-game-price"]').element as HTMLInputElement).value).toBe('1790')
      expect((wrapper.find('[data-test="req-os-input"]').element as HTMLInputElement).value).toBe('Windows 10')
      expect(wrapper.find('[data-test="category-tag-Action"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="category-tag-RPG"]').exists()).toBe(true)
    })

    it('submits game update on submit in edit mode', async () => {
      vi.mocked(fetchAdminGameById).mockResolvedValueOnce({
        id: 'elden-ring',
        name: 'Elden Ring',
        price: 1790,
        stock: 40,
        coverImage: '',
        category: 'Action'
      })
      const mockUpdatedGame: Game = {
        id: 'elden-ring',
        name: 'Elden Ring Deluxe',
        price: 1990,
        coverImage: '',
        category: 'Action'
      }
      vi.mocked(updateAdminGame).mockResolvedValueOnce(mockUpdatedGame)

      const wrapper = mount(AdminGameFormView)
      await flushPromises()

      await wrapper.find('[data-test="input-game-name"]').setValue('Elden Ring Deluxe')
      await wrapper.find('[data-test="input-game-price"]').setValue('1990')

      const form = wrapper.find('[data-test="admin-game-form"]')
      await form.trigger('submit')
      await flushPromises()

      expect(updateAdminGame).toHaveBeenCalledWith(
        'mock-token',
        'elden-ring',
        expect.objectContaining({
          name: 'Elden Ring Deluxe',
          price: 1990
        })
      )
      expect(mockPush).toHaveBeenCalledWith('/admin/games')
    })

    it('redirects to /admin/games if loading game data fails', async () => {
      vi.mocked(fetchAdminGameById).mockRejectedValueOnce(new Error('Game not found'))

      mount(AdminGameFormView)
      await flushPromises()

      expect(mockPush).toHaveBeenCalledWith('/admin/games')
    })
  })
})
