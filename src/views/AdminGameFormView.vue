<script lang="ts">
export default {
  name: 'AdminGameFormView'
}
</script>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  fetchAdminGameById,
  createAdminGame,
  updateAdminGame,
  uploadGameImage
} from '@/services/adminGameApi'
import { fetchCategories } from '@/services/categoryApi'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import type { CategoryItem, Game, GamePayload, SystemRequirements } from '@/types/game'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const gameId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? id : ''
})
const isEditMode = computed(() => Boolean(gameId.value))

// Form state
const name = ref('')
const price = ref<number | ''>(0)
const stock = ref<number | ''>(0)
const coverImage = ref('')
const screenshots = ref<string[]>(['', '', '', '', ''])
const selectedCategories = ref<string[]>([])
const description = ref('')

// Category dropdown state
const availableCategories = ref<CategoryItem[]>([])
const selectedCategoryDropdown = ref('')

// System Requirements per topic
const reqOs = ref('')
const reqProcessor = ref('')
const reqMemory = ref('')
const reqGraphics = ref('')
const reqStorage = ref('')

const isSubmitting = ref(false)
const isLoadingGame = ref(false)

// Image Modal state (for cover image or screenshot slots)
type ActiveSlot = { type: 'cover' } | { type: 'screenshot'; index: number } | null
const activeSlot = ref<ActiveSlot>(null)
const modalImageUrl = ref('')
const isUploadingImage = ref(false)
const uploadFileInput = ref<HTMLInputElement | null>(null)

const padScreenshots = (list?: string[]): string[] => {
  const source = list || []
  return Array.from({ length: 5 }, (_, i) => source[i] || '')
}

const assignReq = (val?: string): string => val ?? ''

const populateSysReqs = (sr?: SystemRequirements): void => {
  if (sr) {
    reqOs.value = assignReq(sr.os)
    reqProcessor.value = assignReq(sr.processor)
    reqMemory.value = assignReq(sr.memory)
    reqGraphics.value = assignReq(sr.graphics)
    reqStorage.value = assignReq(sr.storage)
  }
}

const populateCategories = (game: Game): void => {
  if (game.categories && game.categories.length > 0) {
    selectedCategories.value = [...game.categories]
    return
  }
  if (game.category) {
    selectedCategories.value = [game.category]
  }
}

const applyGameData = (game: Game): void => {
  name.value = game.name
  price.value = game.price
  stock.value = game.stock ?? 0
  coverImage.value = game.coverImage || ''
  description.value = game.description || ''
  screenshots.value = padScreenshots(game.screenshots)
  populateCategories(game)
  populateSysReqs(game.systemRequirements)
}

const loadGameData = async (): Promise<void> => {
  if (!isEditMode.value || !authStore.token) {
    return
  }
  isLoadingGame.value = true
  try {
    const game = await fetchAdminGameById(authStore.token, gameId.value)
    applyGameData(game)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to load game'
    toastStore.showError(msg)
    router.push('/admin/games')
  } finally {
    isLoadingGame.value = false
  }
}

const loadCategoryOptions = async (): Promise<void> => {
  try {
    availableCategories.value = await fetchCategories()
  } catch {
    availableCategories.value = []
  }
}

const addCategory = (): void => {
  const cat = selectedCategoryDropdown.value.trim()
  if (!cat) {
    return
  }
  if (!selectedCategories.value.includes(cat)) {
    selectedCategories.value.push(cat)
  }
  selectedCategoryDropdown.value = ''
}

const removeCategory = (catName: string): void => {
  selectedCategories.value = selectedCategories.value.filter((c) => c !== catName)
}

// Image modal handlers
const openImageModal = (slot: ActiveSlot): void => {
  activeSlot.value = slot
  if (slot?.type === 'cover') {
    modalImageUrl.value = coverImage.value
  } else if (slot?.type === 'screenshot') {
    modalImageUrl.value = screenshots.value[slot.index] || ''
  } else {
    modalImageUrl.value = ''
  }
}

const closeImageModal = (): void => {
  activeSlot.value = null
  modalImageUrl.value = ''
}

const confirmImageModal = (): void => {
  const url = modalImageUrl.value.trim()
  if (activeSlot.value?.type === 'cover') {
    coverImage.value = url
  } else if (activeSlot.value?.type === 'screenshot') {
    screenshots.value[activeSlot.value.index] = url
  }
  closeImageModal()
}

const removeCoverImage = (event: Event): void => {
  event.stopPropagation()
  coverImage.value = ''
}

const removeScreenshot = (index: number, event: Event): void => {
  event.stopPropagation()
  screenshots.value[index] = ''
}

const triggerFileUpload = (): void => {
  uploadFileInput.value?.click()
}

const handleFileUpload = async (event: Event): Promise<void> => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !authStore.token) {
    return
  }

  isUploadingImage.value = true
  try {
    const uploadedUrl = await uploadGameImage(authStore.token, file)
    modalImageUrl.value = uploadedUrl
    toastStore.showSuccess('Image uploaded successfully to S3')
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Image upload failed'
    toastStore.showError(msg)
  } finally {
    isUploadingImage.value = false
    input.value = ''
  }
}

const handleCancel = (): void => {
  router.push('/admin/games')
}

const isValidNonNegativeNumber = (val: number | string): boolean => {
  const parsed = Number(val)
  return !Number.isNaN(parsed) && parsed >= 0
}

const validateBasicFields = (): boolean => {
  if (!authStore.token) {
    toastStore.showError('You must be logged in as admin')
    return false
  }
  if (!name.value.trim()) {
    toastStore.showError('Please enter game name')
    return false
  }
  return true
}

const validateNumbers = (): boolean => {
  if (!isValidNonNegativeNumber(price.value)) {
    toastStore.showError('Game price must be a valid non-negative number')
    return false
  }
  if (!isValidNonNegativeNumber(stock.value)) {
    toastStore.showError('Game stock must be a valid non-negative integer')
    return false
  }
  return true
}

const validateInputs = (): boolean => {
  return validateBasicFields() && validateNumbers()
}

const trimOrUndefined = (str: string): string | undefined => {
  const trimmed = str.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const buildSysReqs = (): SystemRequirements => ({
  os: trimOrUndefined(reqOs.value),
  processor: trimOrUndefined(reqProcessor.value),
  memory: trimOrUndefined(reqMemory.value),
  graphics: trimOrUndefined(reqGraphics.value),
  storage: trimOrUndefined(reqStorage.value)
})

const buildPayload = (): GamePayload => {
  const filteredScreenshots = screenshots.value
    .map((s) => s.trim())
    .filter(Boolean)

  return {
    name: name.value.trim(),
    price: Number(price.value),
    stock: Number(stock.value),
    coverImage: trimOrUndefined(coverImage.value),
    description: trimOrUndefined(description.value),
    category: selectedCategories.value[0],
    categories: selectedCategories.value.length > 0 ? selectedCategories.value : undefined,
    screenshots: filteredScreenshots,
    systemRequirements: buildSysReqs()
  }
}

const saveGame = async (payload: GamePayload, cleanName: string): Promise<void> => {
  if (!authStore.token) {
    return
  }
  if (isEditMode.value) {
    await updateAdminGame(authStore.token, gameId.value, payload)
    toastStore.showSuccess(`Game "${cleanName}" updated successfully`, 'Updated Completed')
  } else {
    await createAdminGame(authStore.token, payload)
    toastStore.showSuccess(`Game "${cleanName}" created successfully`, 'Updated Completed')
  }
}

const handleSubmit = async (): Promise<void> => {
  if (!validateInputs()) {
    return
  }
  const payload = buildPayload()
  isSubmitting.value = true
  try {
    await saveGame(payload, payload.name)
    router.push('/admin/games')
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save game'
    toastStore.showError(msg)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadCategoryOptions(), loadGameData()])
})
</script>

<template>
  <div class="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Page Title matching Screenshots 2 & 3 -->
      <h1 class="text-2xl sm:text-3xl font-black text-[#2e0474] tracking-wide uppercase mb-6">
        {{ isEditMode ? 'EDIT GAME' : 'ADD NEW GAME' }}
      </h1>

      <div v-if="isLoadingGame" class="py-20 text-center text-slate-500 bg-white rounded-2xl shadow-sm">
        <i class="fa-solid fa-spinner fa-spin text-3xl text-primary mb-3"></i>
        <p class="text-sm">Loading game data...</p>
      </div>

      <!-- Main Form Card matching Screenshot 2 -->
      <form
        v-else
        class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6"
        data-test="admin-game-form"
        @submit.prevent="handleSubmit"
      >
        <!-- Top Section: Cover Image (Left) + Basic Info (Right) -->
        <div class="flex flex-col sm:flex-row gap-6 items-start">
          <!-- Cover Image Slot matching Screenshot 2 -->
          <div class="flex-shrink-0 relative group w-36 h-48">
            <button
              type="button"
              class="w-full h-full border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-slate-50/50 transition-all overflow-hidden bg-slate-50/30 p-0 text-left"
              :title="coverImage ? 'Change Cover Image' : 'Add Cover Image'"
              :aria-label="coverImage ? 'Change cover image' : 'Add cover image'"
              data-test="cover-image-slot"
              @click="openImageModal({ type: 'cover' })"
            >
              <img
                v-if="coverImage"
                :src="coverImage"
                alt="Cover Preview"
                class="w-full h-full object-cover"
              />
              <i
                v-else
                class="fa-solid fa-plus text-2xl text-gray-400 group-hover:text-primary transition-colors"
              ></i>
            </button>
            <button
              v-if="coverImage"
              type="button"
              class="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
              title="Remove cover"
              aria-label="Remove cover image"
              data-test="remove-cover-btn"
              @click.stop="removeCoverImage"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- Basic Info Fields (Game name, Price, Stock, Cancel/Save buttons) -->
          <div class="flex-1 w-full space-y-4">
            <!-- Game Name -->
            <div>
              <label for="game-name-input" class="block text-xs font-semibold text-slate-700 mb-1">
                Game name
              </label>
              <input
                id="game-name-input"
                v-model="name"
                type="text"
                placeholder="Enter game name"
                required
                class="w-full px-3 py-2 bg-slate-50/50 border border-gray-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                data-test="input-game-name"
              />
            </div>

            <!-- Price & Stock Row -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="game-price-input" class="block text-xs font-semibold text-slate-700 mb-1">
                  Game Price
                </label>
                <input
                  id="game-price-input"
                  v-model.number="price"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  required
                  class="w-full px-3 py-2 bg-slate-50/50 border border-gray-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                  data-test="input-game-price"
                />
              </div>

              <div>
                <label for="game-stock-input" class="block text-xs font-semibold text-slate-700 mb-1">
                  Game Stock
                </label>
                <input
                  id="game-stock-input"
                  v-model.number="stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  required
                  class="w-full px-3 py-2 bg-slate-50/50 border border-gray-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                  data-test="input-game-stock"
                />
              </div>
            </div>

            <!-- Buttons matching Screenshot 2 (Cancel, Save) -->
            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                class="px-5 py-2 bg-[#555d6b] hover:bg-[#434a56] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
                data-test="cancel-btn"
                @click="handleCancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-6 py-2 bg-[#360185] hover:bg-[#4a02b5] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer uppercase tracking-wider flex items-center gap-2"
                :disabled="isSubmitting"
                data-test="save-btn"
              >
                <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin"></i>
                <span>{{ isSubmitting ? 'Saving...' : 'Save' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Section: Screenshots (5 slots) matching Screenshot 2 -->
        <div>
          <p class="block text-xs font-semibold text-slate-700 mb-2">
            Screenshots (5 slots) :
          </p>
          <div class="grid grid-cols-5 gap-3">
            <div
              v-for="(slotUrl, idx) in screenshots"
              :key="idx"
              class="relative group h-20"
            >
              <button
                type="button"
                class="w-full h-full border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary hover:bg-slate-50/50 transition-all overflow-hidden bg-slate-50/30 p-0 text-left"
                :title="slotUrl ? `Change screenshot ${idx + 1}` : `Screenshot slot ${idx + 1}`"
                :aria-label="slotUrl ? `Change screenshot ${idx + 1}` : `Screenshot slot ${idx + 1}`"
                :data-test="`screenshot-slot-${idx}`"
                @click="openImageModal({ type: 'screenshot', index: idx })"
              >
                <img
                  v-if="slotUrl"
                  :src="slotUrl"
                  :alt="`Screenshot ${idx + 1}`"
                  class="w-full h-full object-cover"
                />
                <i
                  v-else
                  class="fa-solid fa-plus text-base text-gray-400 group-hover:text-primary transition-colors"
                ></i>
              </button>
              <button
                v-if="slotUrl"
                type="button"
                class="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                title="Remove screenshot"
                :aria-label="`Remove screenshot ${idx + 1}`"
                :data-test="`remove-screenshot-${idx}`"
                @click.stop="removeScreenshot(idx, $event)"
                @keydown.enter.stop="removeScreenshot(idx, $event)"
                @keydown.space.stop.prevent="removeScreenshot(idx, $event)"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Section: Category matching Screenshot 2 & 3 -->
        <div>
          <p class="block text-xs font-semibold text-slate-700 mb-2">
            Category :
          </p>
          <div class="flex flex-wrap items-center gap-2">
            <!-- Selected Category Tags (Purple chips matching Screenshot 3) -->
            <span
              v-for="cat in selectedCategories"
              :key="cat"
              class="inline-flex items-center gap-1.5 px-3 py-1 bg-[#360185] text-white text-xs font-medium rounded-md shadow-xs"
              :data-test="`category-tag-${cat}`"
            >
              <span>{{ cat }}</span>
              <button
                type="button"
                class="hover:text-red-300 transition-colors cursor-pointer text-xs font-bold leading-none"
                :title="`Remove ${cat}`"
                @click="removeCategory(cat)"
              >
                ✕
              </button>
            </span>

            <!-- Dropdown selector + Add button -->
            <div class="flex items-center gap-2">
              <select
                id="category-select-dropdown"
                v-model="selectedCategoryDropdown"
                aria-label="Select Category"
                class="px-3 py-1.5 bg-slate-50/50 border border-gray-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                data-test="category-select"
              >
                <option value="" disabled selected>-- Add Category --</option>
                <option
                  v-for="c in availableCategories"
                  :key="c.id"
                  :value="c.name"
                >
                  {{ c.name }}
                </option>
              </select>
              <button
                type="button"
                class="w-8 h-8 bg-[#360185] hover:bg-[#4a02b5] text-white rounded-lg flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                title="Add Category"
                data-test="add-category-btn"
                @click="addCategory"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <!-- Section: Description matching Screenshot 2 -->
        <div>
          <label for="game-description-input" class="block text-xs font-semibold text-slate-700 mb-1">
            Description :
          </label>
          <textarea
            id="game-description-input"
            v-model="description"
            rows="5"
            placeholder="Enter game description"
            class="w-full px-3 py-2 bg-slate-50/50 border border-gray-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
            data-test="textarea-description"
          ></textarea>
        </div>

        <!-- Section: System Requirements per topic requested by user -->
        <div>
          <p class="block text-xs font-semibold text-slate-700 mb-2">
            System Requirements :
          </p>
          <div class="bg-slate-50/50 border border-gray-200 rounded-xl p-4 space-y-3">
            <div class="flex items-center gap-3">
              <label for="req-os" class="w-24 text-xs font-bold text-slate-700">OS:</label>
              <input
                id="req-os"
                v-model="reqOs"
                type="text"
                placeholder="e.g. Windows 10 64-bit"
                class="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                data-test="req-os-input"
              />
            </div>
            <div class="flex items-center gap-3">
              <label for="req-processor" class="w-24 text-xs font-bold text-slate-700">Processor:</label>
              <input
                id="req-processor"
                v-model="reqProcessor"
                type="text"
                placeholder="e.g. Intel Core i5-8400 / AMD Ryzen 5 2600"
                class="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                data-test="req-processor-input"
              />
            </div>
            <div class="flex items-center gap-3">
              <label for="req-memory" class="w-24 text-xs font-bold text-slate-700">Memory:</label>
              <input
                id="req-memory"
                v-model="reqMemory"
                type="text"
                placeholder="e.g. 16 GB RAM"
                class="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                data-test="req-memory-input"
              />
            </div>
            <div class="flex items-center gap-3">
              <label for="req-graphics" class="w-24 text-xs font-bold text-slate-700">Graphic:</label>
              <input
                id="req-graphics"
                v-model="reqGraphics"
                type="text"
                placeholder="e.g. NVIDIA GeForce GTX 1060 / AMD Radeon RX 580"
                class="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                data-test="req-graphics-input"
              />
            </div>
            <div class="flex items-center gap-3">
              <label for="req-storage" class="w-24 text-xs font-bold text-slate-700">Storage:</label>
              <input
                id="req-storage"
                v-model="reqStorage"
                type="text"
                placeholder="e.g. 60 GB available space"
                class="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                data-test="req-storage-input"
              />
            </div>
          </div>
        </div>
      </form>
    </div>

    <!-- Hidden file input for S3 upload -->
    <input
      id="upload-file-input"
      ref="uploadFileInput"
      type="file"
      accept="image/*"
      aria-label="Upload game image to S3"
      class="hidden"
      data-test="hidden-file-input"
      @change="handleFileUpload"
    />

    <!-- Add Image URL / S3 Upload Modal matching Screenshot 3 -->
    <div
      v-if="activeSlot"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
      data-test="image-url-modal"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
        <!-- Title matching Screenshot 3 -->
        <h3 class="text-base font-bold text-slate-900 mb-4">
          Add Image URL
        </h3>

        <!-- Image URL Input matching Screenshot 3 -->
        <div class="mb-4">
          <label for="modal-image-url-input" class="block text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
            <span>🔗</span>
            <span>Enter Image URL:</span>
          </label>
          <input
            id="modal-image-url-input"
            v-model="modalImageUrl"
            type="text"
            placeholder="https://..."
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
            data-test="modal-url-input"
          />
        </div>

        <!-- Optional S3 Upload matching User Requirement 10 -->
        <div class="mb-6 p-3 bg-slate-50 rounded-xl border border-dashed border-gray-300 text-center">
          <p class="text-xs text-slate-500 mb-2">Or upload a new image from device (S3):</p>
          <button
            type="button"
            class="px-3 py-1.5 bg-white hover:bg-slate-100 border border-gray-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors cursor-pointer flex items-center gap-2 mx-auto"
            :disabled="isUploadingImage"
            data-test="upload-file-btn"
            @click="triggerFileUpload"
          >
            <i v-if="isUploadingImage" class="fa-solid fa-spinner fa-spin text-primary"></i>
            <i v-else class="fa-solid fa-cloud-arrow-up text-primary"></i>
            <span>{{ isUploadingImage ? 'Uploading to S3...' : 'Choose File' }}</span>
          </button>
        </div>

        <!-- Modal Actions matching Screenshot 3 (Cancel, Confirm) -->
        <div class="flex items-center justify-end gap-3">
          <button
            type="button"
            class="px-5 py-2 rounded-lg bg-[#555d6b] hover:bg-[#434a56] text-white text-xs font-bold transition-colors cursor-pointer uppercase tracking-wider"
            data-test="modal-cancel-btn"
            @click="closeImageModal"
          >
            Cancel
          </button>
          <button
            type="button"
            class="px-5 py-2 rounded-lg bg-[#360185] hover:bg-[#4a02b5] text-white text-xs font-bold transition-colors cursor-pointer uppercase tracking-wider"
            data-test="modal-confirm-btn"
            @click="confirmImageModal"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
