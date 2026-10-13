<script lang="ts">
export default {
  name: 'AdminHighlightsView'
}
</script>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  fetchAdminHighlights,
  createAdminHighlight,
  updateAdminHighlight,
  deleteAdminHighlight
} from '@/services/adminHighlightApi'
import { fetchGames } from '@/services/gameApi'
import { uploadGameImage } from '@/services/adminGameApi'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import type { Game, HighlightRecord } from '@/types/game'

const DEFAULT_COLOR = '#8b0000'
const DEFAULT_IMAGE_PLACEHOLDER = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg'

const authStore = useAuthStore()
const toastStore = useToastStore()

const highlights = ref<HighlightRecord[]>([])
const storeGames = ref<Game[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

// Modal State (Add & Edit)
const isModalOpen = ref(false)
const isEditing = ref(false)
const editingHighlightId = ref<string | number | null>(null)
const formGameId = ref('')
const formCustomImage = ref('')
const formButtonColor = ref(DEFAULT_COLOR)
const isSaving = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const isUploadingImage = ref(false)

// Delete Modal State
const isDeleteModalOpen = ref(false)
const highlightToDelete = ref<HighlightRecord | null>(null)
const isDeleting = ref(false)

const modalTitle = computed(() => (isEditing.value ? 'Edit Highlight' : 'New Highlight'))

const loadAllGames = async (): Promise<void> => {
  try {
    const response = await fetchGames({ size: 100 })
    storeGames.value = response.games
  } catch {
    storeGames.value = []
  }
}

const loadHighlights = async (): Promise<void> => {
  isLoading.value = true
  errorMessage.value = null
  try {
    highlights.value = await fetchAdminHighlights(authStore.token ?? undefined)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load highlights'
    errorMessage.value = message
    toastStore.showError(message)
  } finally {
    isLoading.value = false
  }
}

const resetFormFields = (): void => {
  formGameId.value = ''
  formCustomImage.value = ''
  formButtonColor.value = DEFAULT_COLOR
  editingHighlightId.value = null
  isEditing.value = false
}

const openAddModal = (): void => {
  resetFormFields()
  isModalOpen.value = true
}

const openEditModal = (item: HighlightRecord): void => {
  editingHighlightId.value = item.id
  isEditing.value = true
  formGameId.value = item.gameId
  formCustomImage.value = item.customImage ?? ''
  formButtonColor.value = item.buttonColor || DEFAULT_COLOR
  isModalOpen.value = true
}

const closeModal = (): void => {
  isModalOpen.value = false
  resetFormFields()
}

const getGameFallbackImage = (gameId: string): string => {
  const matchingGame = storeGames.value.find((g) => g.id === gameId)
  if (!matchingGame) {
    return DEFAULT_IMAGE_PLACEHOLDER
  }
  const firstScreenshot = matchingGame.screenshots?.[0]
  if (firstScreenshot) {
    return firstScreenshot
  }
  return matchingGame.coverImage || DEFAULT_IMAGE_PLACEHOLDER
}

const resolveThumbnail = (item: HighlightRecord): string => {
  const custom = item.customImage?.trim()
  if (custom) {
    return custom
  }
  return getGameFallbackImage(item.gameId)
}

const extractErrorMessage = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback

const submitNewHighlight = async (token: string): Promise<void> => {
  const payload = {
    gameId: formGameId.value,
    customImage: formCustomImage.value.trim() || undefined,
    buttonColor: formButtonColor.value.trim() || DEFAULT_COLOR
  }
  await createAdminHighlight(token, payload)
  toastStore.showSuccess('Highlight saved to homepage')
}

const submitUpdatedHighlight = async (token: string, targetId: string | number): Promise<void> => {
  const payload = {
    gameId: formGameId.value,
    customImage: formCustomImage.value.trim() || undefined,
    buttonColor: formButtonColor.value.trim() || DEFAULT_COLOR
  }
  await updateAdminHighlight(token, targetId, payload)
  toastStore.showSuccess('Highlight updated successfully')
}

const triggerFileUpload = (): void => {
  fileInputRef.value?.click()
}

const performImageUpload = async (token: string, file: File): Promise<void> => {
  isUploadingImage.value = true
  try {
    const uploadedUrl = await uploadGameImage(token, file)
    formCustomImage.value = uploadedUrl
    toastStore.showSuccess('Banner image uploaded successfully')
  } catch (err: unknown) {
    toastStore.showError(extractErrorMessage(err, 'Failed to upload image'))
  } finally {
    isUploadingImage.value = false
  }
}

const handleFileUpload = async (event: Event): Promise<void> => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) {
    return
  }

  const token = authStore.token
  if (!token) {
    toastStore.showError('Authentication required')
    return
  }

  await performImageUpload(token, file)
  input.value = ''
}

const persistHighlight = async (token: string): Promise<void> => {
  const editId = editingHighlightId.value
  if (isEditing.value && editId !== null) {
    await submitUpdatedHighlight(token, editId)
    return
  }
  await submitNewHighlight(token)
}

const handleSaveHighlight = async (): Promise<void> => {
  if (!formGameId.value) {
    toastStore.showError('Please select a target game')
    return
  }

  const token = authStore.token
  if (!token) {
    toastStore.showError('Authentication required')
    return
  }

  isSaving.value = true
  try {
    await persistHighlight(token)
    closeModal()
    await loadHighlights()
  } catch (err: unknown) {
    toastStore.showError(extractErrorMessage(err, 'Failed to save highlight'))
  } finally {
    isSaving.value = false
  }
}

const openDeleteConfirmation = (item: HighlightRecord): void => {
  highlightToDelete.value = item
  isDeleteModalOpen.value = true
}

const closeDeleteModal = (): void => {
  isDeleteModalOpen.value = false
  highlightToDelete.value = null
}

const executeDeleteHighlight = async (): Promise<void> => {
  const target = highlightToDelete.value
  const token = authStore.token
  if (!target || !token) {
    return
  }

  isDeleting.value = true
  try {
    await deleteAdminHighlight(token, target.id)
    toastStore.showSuccess(`Highlight for "${target.gameName}" deleted`)
    closeDeleteModal()
    await loadHighlights()
  } catch (err: unknown) {
    toastStore.showError(extractErrorMessage(err, 'Failed to delete highlight'))
  } finally {
    isDeleting.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadHighlights(), loadAllGames()])
})
</script>

<template>
  <div class="min-h-screen py-10 px-4 sm:px-6 lg:px-8 relative" data-test="admin-highlights-page">
    <div class="max-w-6xl mx-auto">
      <!-- Page Title matching Screenshot 1 -->
      <h1 class="text-2xl sm:text-3xl font-black text-primary tracking-wide uppercase mb-6" data-test="page-title">
        BACK-OFFICE HIGHLIGHT PAGE
      </h1>

      <!-- Main Highlights Table Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" data-test="highlights-card">
        <!-- Error Alert -->
        <div
          v-if="errorMessage"
          class="p-4 bg-red-50 text-red-700 text-sm border-b border-red-100 flex items-center justify-between"
          data-test="error-alert"
        >
          <span>{{ errorMessage }}</span>
          <button
            type="button"
            class="underline font-medium hover:text-red-900 cursor-pointer"
            @click="loadHighlights"
          >
            Retry
          </button>
        </div>

        <!-- Loading Spinner -->
        <div v-if="isLoading" class="py-20 text-center text-slate-500" data-test="loading-spinner">
          <i class="fa-solid fa-spinner fa-spin text-3xl text-primary mb-3"></i>
          <p class="text-sm">Loading highlights...</p>
        </div>

        <!-- Highlights Table -->
        <div v-else-if="highlights.length > 0" class="overflow-x-auto">
          <table class="w-full text-left border-collapse" data-test="highlights-table">
            <thead>
              <tr class="border-b border-gray-100 text-xs font-black text-primary tracking-wider uppercase">
                <th class="py-4 px-6">HIGHLIGHT IMAGE</th>
                <th class="py-4 px-6">TARGET GAME</th>
                <th class="py-4 px-6">BUTTON COLOR</th>
                <th class="py-4 px-6 text-center">DELETE</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in highlights"
                :key="item.id"
                class="border-b border-gray-100 hover:bg-slate-50/50 transition-colors"
                :data-test="`highlight-row-${item.id}`"
              >
                <!-- Highlight Image Column -->
                <td class="py-4 px-6">
                  <button
                    type="button"
                    class="w-28 h-16 rounded-lg overflow-hidden bg-slate-900 border border-slate-200/80 shadow-xs cursor-pointer hover:opacity-90 transition-opacity block focus:outline-none focus:ring-2 focus:ring-primary/40"
                    title="Click to edit highlight"
                    data-test="highlight-thumbnail-btn"
                    @click="openEditModal(item)"
                  >
                    <img
                      :src="resolveThumbnail(item)"
                      :alt="item.gameName"
                      class="w-full h-full object-cover"
                      data-test="highlight-thumbnail-img"
                    />
                  </button>
                </td>

                <!-- Target Game Column -->
                <td class="py-4 px-6">
                  <button
                    type="button"
                    class="text-sm font-semibold text-slate-800 hover:text-primary cursor-pointer transition-colors text-left focus:outline-none focus:underline"
                    title="Click to edit highlight"
                    data-test="highlight-game-name"
                    @click="openEditModal(item)"
                  >
                    {{ item.gameName }}
                  </button>
                </td>

                <!-- Button Color Column matching Screenshot 1 -->
                <td class="py-4 px-6">
                  <button
                    type="button"
                    class="flex items-center gap-2 cursor-pointer focus:outline-none"
                    title="Click to edit highlight"
                    @click="openEditModal(item)"
                  >
                    <span
                      class="w-3.5 h-3.5 rounded-full inline-block shadow-xs shrink-0"
                      :style="{ backgroundColor: item.buttonColor }"
                      data-test="highlight-color-dot"
                    ></span>
                    <span class="text-xs font-mono text-slate-700" data-test="highlight-color-hex">
                      {{ item.buttonColor }}
                    </span>
                  </button>
                </td>

                <!-- Delete Action Column matching Screenshot 1 -->
                <td class="py-4 px-6 text-center">
                  <button
                    type="button"
                    class="px-4 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-bold transition-colors cursor-pointer"
                    data-test="delete-highlight-btn"
                    @click="openDeleteConfirmation(item)"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-else class="py-16 text-center text-slate-400" data-test="empty-state">
          <i class="fa-solid fa-images text-4xl text-slate-300 mb-3 block"></i>
          <p class="text-sm font-semibold text-slate-600">No highlights configured yet</p>
          <p class="text-xs text-slate-400 mt-1">
            Click the "+" button below to feature games on the home page carousel.
          </p>
        </div>
      </div>
    </div>

    <!-- Floating Action Button (FAB) matching Screenshot 1 & 2 -->
    <button
      type="button"
      class="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 cursor-pointer z-40"
      data-test="add-highlight-fab"
      aria-label="Add New Highlight"
      @click="openAddModal"
    >
      <i class="fa-solid fa-plus text-xl"></i>
    </button>

    <!-- Highlight Modal (New / Edit) matching Screenshot 2 -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
      data-test="highlight-modal"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
        <!-- Close Button -->
        <button
          type="button"
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg transition-colors cursor-pointer"
          aria-label="Close modal"
          data-test="close-modal-btn"
          @click="closeModal"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>

        <!-- Modal Header -->
        <h2 class="text-base font-bold text-slate-900 mb-5 tracking-tight" data-test="modal-title">
          {{ modalTitle }}
        </h2>

        <form @submit.prevent="handleSaveHighlight">
          <!-- Field 1: Target Game matching Screenshot 2 -->
          <div class="mb-4">
            <label for="highlight-target-game" class="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5">
              <i class="fa-solid fa-gamepad text-primary text-xs"></i>
              <span>Target Game</span>
            </label>
            <select
              id="highlight-target-game"
              v-model="formGameId"
              required
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
              data-test="target-game-select"
            >
              <option value="" disabled>-- Select a game from store --</option>
              <option v-for="g in storeGames" :key="g.id" :value="g.id">
                {{ g.name }}
              </option>
            </select>
          </div>

          <!-- Field 2: Custom Banner Image URL & File Upload matching Screenshot 2 -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-1.5">
              <label for="highlight-custom-image" class="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                <i class="fa-solid fa-link text-primary text-xs"></i>
                <span>Custom Banner Image URL</span>
              </label>
              <button
                type="button"
                :disabled="isUploadingImage"
                class="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                data-test="trigger-upload-btn"
                @click="triggerFileUpload"
              >
                <i v-if="isUploadingImage" class="fa-solid fa-spinner fa-spin text-xs"></i>
                <i v-else class="fa-solid fa-cloud-arrow-up text-xs"></i>
                <span>{{ isUploadingImage ? 'Uploading...' : 'Upload File' }}</span>
              </button>
            </div>

            <!-- Hidden File Input -->
            <label for="highlight-file-input" class="sr-only">Upload highlight banner image</label>
            <input
              id="highlight-file-input"
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              data-test="banner-file-input"
              @change="handleFileUpload"
            />

            <input
              id="highlight-custom-image"
              v-model="formCustomImage"
              type="text"
              placeholder="https://..."
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              data-test="custom-image-input"
            />

            <!-- Banner Preview when URL is populated -->
            <div
              v-if="formCustomImage.trim()"
              class="mt-2 relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900 h-24 flex items-center justify-center group"
              data-test="banner-preview"
            >
              <img
                :src="formCustomImage"
                alt="Banner preview"
                class="w-full h-full object-cover"
              />
              <button
                type="button"
                class="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors cursor-pointer"
                title="Remove image"
                data-test="remove-banner-btn"
                @click="formCustomImage = ''"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <p class="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <i class="fa-solid fa-circle-info text-[10px]"></i>
              <span>If left blank, the system will use the game's default cover art.</span>
            </p>
          </div>

          <!-- Field 3: "Shop Now" Button Color matching Screenshot 2 -->
          <div class="mb-6">
            <label for="highlight-button-color" class="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5">
              <i class="fa-solid fa-palette text-primary text-xs"></i>
              <span>"Shop Now" Button Color</span>
            </label>
            <div class="border border-gray-200 rounded-lg p-3 flex items-center gap-3 bg-slate-50/50">
              <input
                id="highlight-button-color"
                v-model="formButtonColor"
                type="color"
                class="w-10 h-10 rounded border border-gray-300 cursor-pointer p-0.5 bg-white shrink-0"
                data-test="button-color-picker"
              />
              <p class="text-xs text-slate-500 leading-relaxed">
                Pick an accent color that stands out against your banner background.
              </p>
            </div>
          </div>

          <!-- Modal Action Buttons matching Screenshot 2 -->
          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              class="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              data-test="cancel-modal-btn"
              @click="closeModal"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSaving"
              class="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
              data-test="save-homepage-btn"
            >
              <i v-if="isSaving" class="fa-solid fa-spinner fa-spin mr-1.5"></i>
              <span>Save to Homepage</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="isDeleteModalOpen"
      class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
      data-test="delete-confirmation-modal"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 relative">
        <h2 class="text-base font-bold text-slate-900 mb-2">Delete Highlight</h2>
        <p class="text-xs text-slate-600 mb-6">
          Are you sure you want to remove the highlight for
          <span class="font-bold text-slate-800">"{{ highlightToDelete?.gameName }}"</span>?
          This will remove it from the home page carousel.
        </p>
        <div class="flex items-center justify-end gap-3">
          <button
            type="button"
            class="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            data-test="cancel-delete-btn"
            @click="closeDeleteModal"
          >
            Cancel
          </button>
          <button
            type="button"
            :disabled="isDeleting"
            class="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors cursor-pointer"
            data-test="confirm-delete-btn"
            @click="executeDeleteHighlight"
          >
            <i v-if="isDeleting" class="fa-solid fa-spinner fa-spin mr-1.5"></i>
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
