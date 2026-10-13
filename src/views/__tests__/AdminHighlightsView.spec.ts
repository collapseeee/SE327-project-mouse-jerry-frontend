import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import AdminHighlightsView from '../AdminHighlightsView.vue'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import {
  fetchAdminHighlights,
  createAdminHighlight,
  updateAdminHighlight,
  deleteAdminHighlight
} from '@/services/adminHighlightApi'
import { fetchGames } from '@/services/gameApi'
import { uploadGameImage } from '@/services/adminGameApi'

vi.mock('@/services/adminHighlightApi', () => ({
  fetchAdminHighlights: vi.fn(),
  createAdminHighlight: vi.fn(),
  updateAdminHighlight: vi.fn(),
  deleteAdminHighlight: vi.fn()
}))

vi.mock('@/services/gameApi', () => ({
  fetchGames: vi.fn()
}))

vi.mock('@/services/adminGameApi', () => ({
  uploadGameImage: vi.fn()
}))

const sampleHighlights = [
  {
    id: 1,
    gameId: 'elden-ring',
    gameName: 'Elden Ring',
    customImage: 'https://img.test/elden-banner.jpg',
    buttonColor: '#8b0000'
  },
  {
    id: 2,
    gameId: 'sekiro',
    gameName: 'Sekiro',
    customImage: '',
    buttonColor: '#00c853'
  }
]

const sampleStoreGames = [
  {
    id: 'elden-ring',
    name: 'Elden Ring',
    price: 1990,
    coverImage: 'https://img.test/elden-cover.jpg',
    category: 'Action',
    screenshots: ['https://img.test/elden-ss1.jpg']
  },
  {
    id: 'sekiro',
    name: 'Sekiro',
    price: 1590,
    coverImage: 'https://img.test/sekiro-cover.jpg',
    category: 'Action',
    screenshots: []
  }
]

describe('AdminHighlightsView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'admin', role: 'ROLE_ADMIN' }, 'test-admin-token')

    vi.restoreAllMocks()
    vi.mocked(fetchAdminHighlights).mockResolvedValue(sampleHighlights)
    vi.mocked(fetchGames).mockResolvedValue({ games: sampleStoreGames, totalCount: 2 })
    vi.mocked(createAdminHighlight).mockResolvedValue({
      id: 3,
      gameId: 'elden-ring',
      gameName: 'Elden Ring',
      buttonColor: '#8b0000'
    })
    vi.mocked(updateAdminHighlight).mockResolvedValue({
      id: 1,
      gameId: 'elden-ring',
      gameName: 'Elden Ring',
      buttonColor: '#00c853'
    })
    vi.mocked(deleteAdminHighlight).mockResolvedValue()
    vi.mocked(uploadGameImage).mockResolvedValue('https://img.test/uploaded-banner.jpg')
  })

  it('renders page title and table columns matching Screenshot 1', async () => {
    const wrapper = mount(AdminHighlightsView)
    await flushPromises()

    expect(wrapper.find('[data-test="page-title"]').text()).toBe('BACK-OFFICE HIGHLIGHT PAGE')
    expect(wrapper.find('[data-test="highlights-table"]').exists()).toBe(true)

    const headers = wrapper.findAll('th')
    expect(headers[0].text()).toBe('HIGHLIGHT IMAGE')
    expect(headers[1].text()).toBe('TARGET GAME')
    expect(headers[2].text()).toBe('BUTTON COLOR')
    expect(headers[3].text()).toBe('DELETE')

    // First row checks
    const row1 = wrapper.find('[data-test="highlight-row-1"]')
    expect(row1.exists()).toBe(true)
    expect(row1.find('[data-test="highlight-game-name"]').text()).toBe('Elden Ring')
    expect(row1.find('[data-test="highlight-color-hex"]').text()).toBe('#8b0000')

    const dotStyle = row1.find('[data-test="highlight-color-dot"]').attributes('style')
    expect(dotStyle).toContain('background-color: rgb(139, 0, 0)')
  })

  it('resolves fallback thumbnail when customImage is empty', async () => {
    const wrapper = mount(AdminHighlightsView)
    await flushPromises()

    const row2 = wrapper.find('[data-test="highlight-row-2"]')
    expect(row2.exists()).toBe(true)
    const img = row2.find('[data-test="highlight-thumbnail-img"]')
    expect(img.attributes('src')).toBe('https://img.test/sekiro-cover.jpg')
  })

  it('displays empty state when no highlights are returned', async () => {
    vi.mocked(fetchAdminHighlights).mockResolvedValue([])

    const wrapper = mount(AdminHighlightsView)
    await flushPromises()

    expect(wrapper.find('[data-test="empty-state"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="highlights-table"]').exists()).toBe(false)
  })

  it('handles fetch error and displays error alert with retry button', async () => {
    vi.mocked(fetchAdminHighlights).mockRejectedValue(new Error('Network failure'))

    const wrapper = mount(AdminHighlightsView)
    await flushPromises()

    expect(wrapper.find('[data-test="error-alert"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Network failure')

    // Retry
    vi.mocked(fetchAdminHighlights).mockResolvedValue(sampleHighlights)
    const retryBtn = wrapper.find('[data-test="error-alert"] button')
    if (retryBtn.exists()) {
      await retryBtn.trigger('click')
      await flushPromises()
    }

    expect(wrapper.find('[data-test="highlights-table"]').exists()).toBe(true)
  })

  it('opens New Highlight modal via FAB button and creates a highlight', async () => {
    const wrapper = mount(AdminHighlightsView)
    await flushPromises()

    expect(wrapper.find('[data-test="highlight-modal"]').exists()).toBe(false)

    // Click FAB
    const fab = wrapper.find('[data-test="add-highlight-fab"]')
    await fab.trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-test="highlight-modal"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="modal-title"]').text()).toBe('New Highlight')

    // Select game
    const select = wrapper.find('[data-test="target-game-select"]')
    await select.setValue('elden-ring')

    // Set custom banner
    const bannerInput = wrapper.find('[data-test="custom-image-input"]')
    await bannerInput.setValue('https://img.test/banner-new.jpg')

    // Set button color
    const colorInput = wrapper.find('[data-test="button-color-picker"]')
    await colorInput.setValue('#8b0000')

    // Submit
    const form = wrapper.find('form')
    await form.trigger('submit')
    await flushPromises()

    expect(createAdminHighlight).toHaveBeenCalledWith('test-admin-token', {
      gameId: 'elden-ring',
      customImage: 'https://img.test/banner-new.jpg',
      buttonColor: '#8b0000'
    })
    expect(wrapper.find('[data-test="highlight-modal"]').exists()).toBe(false)
  })

  it('validates that target game is selected before submitting', async () => {
    const toastStore = useToastStore()
    const errorSpy = vi.spyOn(toastStore, 'showError')

    const wrapper = mount(AdminHighlightsView)
    await flushPromises()

    await wrapper.find('[data-test="add-highlight-fab"]').trigger('click')
    await flushPromises()

    // Submit with empty target game
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(errorSpy).toHaveBeenCalledWith('Please select a target game')
    expect(createAdminHighlight).not.toHaveBeenCalled()
  })

  it('opens Edit Highlight modal prefilled when clicking row item and updates it', async () => {
    const wrapper = mount(AdminHighlightsView)
    await flushPromises()

    // Click game name to edit
    const gameNameLink = wrapper.find('[data-test="highlight-row-1"] [data-test="highlight-game-name"]')
    await gameNameLink.trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-test="highlight-modal"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="modal-title"]').text()).toBe('Edit Highlight')

    // Update color
    const colorInput = wrapper.find('[data-test="button-color-picker"]')
    await colorInput.setValue('#00c853')

    // Submit
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(updateAdminHighlight).toHaveBeenCalledWith('test-admin-token', 1, {
      gameId: 'elden-ring',
      customImage: 'https://img.test/elden-banner.jpg',
      buttonColor: '#00c853'
    })
    expect(wrapper.find('[data-test="highlight-modal"]').exists()).toBe(false)
  })

  it('closes modal when clicking close xmark or cancel button', async () => {
    const wrapper = mount(AdminHighlightsView)
    await flushPromises()

    await wrapper.find('[data-test="add-highlight-fab"]').trigger('click')
    expect(wrapper.find('[data-test="highlight-modal"]').exists()).toBe(true)

    // Click cancel
    const cancelBtn = wrapper.find('[data-test="cancel-modal-btn"]')
    await cancelBtn.trigger('click')
    expect(wrapper.find('[data-test="highlight-modal"]').exists()).toBe(false)

    // Open again and click X
    await wrapper.find('[data-test="add-highlight-fab"]').trigger('click')
    expect(wrapper.find('[data-test="highlight-modal"]').exists()).toBe(true)
    const closeBtn = wrapper.find('[data-test="close-modal-btn"]')
    await closeBtn.trigger('click')
    expect(wrapper.find('[data-test="highlight-modal"]').exists()).toBe(false)
  })

  it('opens delete confirmation modal and executes delete', async () => {
    const wrapper = mount(AdminHighlightsView)
    await flushPromises()

    const deleteBtn = wrapper.find('[data-test="highlight-row-1"] [data-test="delete-highlight-btn"]')
    await deleteBtn.trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-test="delete-confirmation-modal"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Are you sure you want to remove the highlight for')

    // Confirm delete
    const confirmBtn = wrapper.find('[data-test="confirm-delete-btn"]')
    await confirmBtn.trigger('click')
    await flushPromises()

    expect(deleteAdminHighlight).toHaveBeenCalledWith('test-admin-token', 1)
    expect(wrapper.find('[data-test="delete-confirmation-modal"]').exists()).toBe(false)
  })

  it('cancels delete confirmation without deleting', async () => {
    const wrapper = mount(AdminHighlightsView)
    await flushPromises()

    await wrapper.find('[data-test="highlight-row-1"] [data-test="delete-highlight-btn"]').trigger('click')
    expect(wrapper.find('[data-test="delete-confirmation-modal"]').exists()).toBe(true)

    const cancelBtn = wrapper.find('[data-test="cancel-delete-btn"]')
    await cancelBtn.trigger('click')

    expect(wrapper.find('[data-test="delete-confirmation-modal"]').exists()).toBe(false)
    expect(deleteAdminHighlight).not.toHaveBeenCalled()
  })

  it('triggers file upload when clicking Upload File button and sets uploaded URL', async () => {
    const wrapper = mount(AdminHighlightsView)
    await flushPromises()

    await wrapper.find('[data-test="add-highlight-fab"]').trigger('click')
    await flushPromises()

    const fileInput = wrapper.find<HTMLInputElement>('[data-test="banner-file-input"]')
    const clickSpy = vi.spyOn(fileInput.element, 'click')

    const uploadTrigger = wrapper.find('[data-test="trigger-upload-btn"]')
    await uploadTrigger.trigger('click')
    expect(clickSpy).toHaveBeenCalled()

    const file = new File(['dummy'], 'banner.png', { type: 'image/png' })
    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: true
    })

    await fileInput.trigger('change')
    await flushPromises()

    expect(uploadGameImage).toHaveBeenCalledWith('test-admin-token', file)
    expect(wrapper.find('[data-test="banner-preview"]').exists()).toBe(true)

    // Remove banner preview
    const removeBtn = wrapper.find('[data-test="remove-banner-btn"]')
    await removeBtn.trigger('click')
    expect(wrapper.find('[data-test="banner-preview"]').exists()).toBe(false)
  })

  it('shows error toast when file upload fails', async () => {
    const toastStore = useToastStore()
    const errorSpy = vi.spyOn(toastStore, 'showError')
    vi.mocked(uploadGameImage).mockRejectedValueOnce(new Error('S3 upload error'))

    const wrapper = mount(AdminHighlightsView)
    await flushPromises()

    await wrapper.find('[data-test="add-highlight-fab"]').trigger('click')
    await flushPromises()

    const fileInput = wrapper.find<HTMLInputElement>('[data-test="banner-file-input"]')
    const file = new File(['dummy'], 'banner.png', { type: 'image/png' })
    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: true
    })

    await fileInput.trigger('change')
    await flushPromises()

    expect(errorSpy).toHaveBeenCalledWith('S3 upload error')
  })
})
