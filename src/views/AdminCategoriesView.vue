<script lang="ts">
export default {
  name: 'AdminCategoriesView'
}
</script>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  toggleAdminCategoryVisibility,
  deleteAdminCategory
} from '@/services/adminCategoryApi'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import type { CategoryItem } from '@/types/game'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const categories = ref<CategoryItem[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

// Add Category modal state
const isAddModalOpen = ref(false)
const newCategoryName = ref('')
const isSavingNew = ref(false)

// Edit Category modal state
const editingCategory = ref<CategoryItem | null>(null)
const editCategoryName = ref('')
const isSavingEdit = ref(false)

// Delete Category modal state
const categoryToDelete = ref<CategoryItem | null>(null)
const isDeleting = ref(false)

const loadCategories = async (): Promise<void> => {
  if (!authStore.token) {
    return
  }
  isLoading.value = true
  errorMessage.value = null
  try {
    categories.value = await fetchAdminCategories(authStore.token)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to load categories'
    errorMessage.value = msg
    toastStore.showError(msg)
  } finally {
    isLoading.value = false
  }
}

const performVisibilityToggle = async (
  token: string,
  category: CategoryItem,
  targetState: boolean
): Promise<void> => {
  const updated = await toggleAdminCategoryVisibility(token, category.id, targetState)
  category.isVisible = updated.isVisible
  toastStore.showSuccess(`Category "${category.name}" visibility updated`)
}

const reportActionError = (err: unknown, fallbackMessage: string): void => {
  const msg = err instanceof Error ? err.message : fallbackMessage
  toastStore.showError(msg)
}

const handleToggleVisibility = async (category: CategoryItem): Promise<void> => {
  const token = authStore.token
  if (!token) {
    return
  }
  const nextVisibleState = category.isVisible === false
  try {
    await performVisibilityToggle(token, category, nextVisibleState)
  } catch (err: unknown) {
    reportActionError(err, 'Failed to update visibility')
  }
}

const handleViewGames = (category: CategoryItem): void => {
  router.push({
    path: '/admin/games',
    query: { search: category.name }
  })
}

const openAddModal = (): void => {
  newCategoryName.value = ''
  isAddModalOpen.value = true
}

const closeAddModal = (): void => {
  isAddModalOpen.value = false
  newCategoryName.value = ''
}

const performCategoryCreation = async (token: string, name: string): Promise<void> => {
  await createAdminCategory(token, name)
  toastStore.showSuccess(`Category "${name}" created successfully`)
  closeAddModal()
  await loadCategories()
}

const isValidAddInput = (token: string | null, name: string): boolean =>
  Boolean(token && name.trim())

const submitAddCategory = async (): Promise<void> => {
  const token = authStore.token
  const trimmed = newCategoryName.value.trim()
  if (!isValidAddInput(token, trimmed)) {
    return
  }
  isSavingNew.value = true
  try {
    await performCategoryCreation(token as string, trimmed)
  } catch (err: unknown) {
    reportActionError(err, 'Failed to create category')
  } finally {
    isSavingNew.value = false
  }
}

const openEditModal = (category: CategoryItem): void => {
  editingCategory.value = category
  editCategoryName.value = category.name
}

const closeEditModal = (): void => {
  editingCategory.value = null
  editCategoryName.value = ''
}

const performCategoryUpdate = async (
  token: string,
  id: string | number,
  name: string
): Promise<void> => {
  await updateAdminCategory(token, id, name)
  toastStore.showSuccess(`Category "${name}" updated successfully`)
  closeEditModal()
  await loadCategories()
}

const isValidEditInput = (
  token: string | null,
  target: CategoryItem | null,
  name: string
): target is CategoryItem => Boolean(token && target && name.trim())

const submitEditCategory = async (): Promise<void> => {
  const token = authStore.token
  const target = editingCategory.value
  const trimmed = editCategoryName.value.trim()
  if (!isValidEditInput(token, target, trimmed)) {
    return
  }
  isSavingEdit.value = true
  try {
    await performCategoryUpdate(token as string, target.id, trimmed)
  } catch (err: unknown) {
    reportActionError(err, 'Failed to update category')
  } finally {
    isSavingEdit.value = false
  }
}

const confirmDelete = (category: CategoryItem): void => {
  categoryToDelete.value = category
}

const cancelDelete = (): void => {
  categoryToDelete.value = null
}

const performCategoryDeletion = async (
  token: string,
  id: string | number,
  name: string
): Promise<void> => {
  await deleteAdminCategory(token, id)
  toastStore.showSuccess(`Category "${name}" deleted successfully`)
  categoryToDelete.value = null
  await loadCategories()
}

const isValidDeleteTarget = (
  token: string | null,
  target: CategoryItem | null
): target is CategoryItem => Boolean(token && target)

const executeDelete = async (): Promise<void> => {
  const token = authStore.token
  const target = categoryToDelete.value
  if (!isValidDeleteTarget(token, target)) {
    return
  }
  isDeleting.value = true
  try {
    await performCategoryDeletion(token as string, target.id, target.name)
  } catch (err: unknown) {
    reportActionError(err, 'Failed to delete category')
  } finally {
    isDeleting.value = false
  }
}

onMounted(() => {
  loadCategories()
})
</script>

<template>
  <div class="min-h-screen py-10 px-4 sm:px-6 lg:px-8 relative">
    <div class="max-w-6xl mx-auto">
      <!-- Page Title matching Screenshot 1 -->
      <h1 class="text-2xl sm:text-3xl font-black text-[#2e0474] tracking-wide uppercase mb-6">
        BACK-OFFICE CATEGORIES PAGE
      </h1>

      <!-- Main Table Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Error Alert -->
        <div
          v-if="errorMessage"
          class="p-4 bg-red-50 text-red-700 text-sm border-b border-red-100 flex items-center justify-between"
        >
          <span>{{ errorMessage }}</span>
          <button
            type="button"
            class="underline font-medium hover:text-red-900 cursor-pointer"
            @click="loadCategories"
          >
            Retry
          </button>
        </div>

        <!-- Loading Spinner -->
        <div v-if="isLoading" class="py-20 text-center text-slate-500">
          <i class="fa-solid fa-spinner fa-spin text-3xl text-primary mb-3"></i>
          <p class="text-sm">Loading categories...</p>
        </div>

        <!-- Categories Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse" data-test="admin-categories-table">
            <thead>
              <tr class="border-b border-gray-100 text-xs font-black text-[#360185] tracking-wider uppercase">
                <th class="py-4 px-6">CATEGORIES</th>
                <th class="py-4 px-6 text-center">VISIBILITY</th>
                <th class="py-4 px-6 text-center">VIEW GAMES</th>
                <th class="py-4 px-6 text-center">EDIT</th>
                <th class="py-4 px-6 text-center">DELETE</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-sm">
              <tr
                v-for="cat in categories"
                :key="cat.id"
                class="hover:bg-slate-50/60 transition-colors"
                :data-test="`category-row-${cat.id}`"
              >
                <!-- Category Name -->
                <td class="py-4 px-6 font-medium text-slate-800">
                  {{ cat.name }}
                </td>

                <!-- Visibility Toggle -->
                <td class="py-4 px-6 text-center">
                  <button
                    type="button"
                    class="p-1 hover:opacity-80 transition-opacity cursor-pointer inline-flex items-center justify-center"
                    :title="cat.isVisible !== false ? 'Hide from store front' : 'Show on store front'"
                    :data-test="`visibility-toggle-${cat.id}`"
                    @click="handleToggleVisibility(cat)"
                  >
                    <i
                      v-if="cat.isVisible !== false"
                      class="fa-solid fa-eye text-[#0284c7] text-base"
                      data-test="icon-visible"
                    ></i>
                    <i
                      v-else
                      class="fa-solid fa-eye-slash text-slate-400 text-base"
                      data-test="icon-hidden"
                    ></i>
                  </button>
                </td>

                <!-- View Games -->
                <td class="py-4 px-6 text-center">
                  <button
                    type="button"
                    class="bg-[#ede7f6] hover:bg-[#d1c4e9] text-[#360185] font-semibold px-5 py-1.5 rounded-md transition-colors cursor-pointer text-xs uppercase"
                    :data-test="`view-games-btn-${cat.id}`"
                    @click="handleViewGames(cat)"
                  >
                    View
                  </button>
                </td>

                <!-- Edit Button -->
                <td class="py-4 px-6 text-center">
                  <button
                    type="button"
                    class="bg-[#ede7f6] hover:bg-[#d1c4e9] text-[#360185] font-semibold px-5 py-1.5 rounded-md transition-colors cursor-pointer text-xs uppercase"
                    :data-test="`edit-btn-${cat.id}`"
                    @click="openEditModal(cat)"
                  >
                    Edit
                  </button>
                </td>

                <!-- Delete Button -->
                <td class="py-4 px-6 text-center">
                  <button
                    type="button"
                    class="bg-[#feebee] hover:bg-[#ffcdd2] text-[#c62828] font-semibold px-4 py-1.5 rounded-md transition-colors cursor-pointer text-xs uppercase"
                    :data-test="`delete-btn-${cat.id}`"
                    @click="confirmDelete(cat)"
                  >
                    Delete
                  </button>
                </td>
              </tr>

              <!-- Empty state -->
              <tr v-if="categories.length === 0">
                <td colspan="5" class="py-12 text-center text-slate-400 italic">
                  No categories found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Floating Action Button (FAB) matching Screenshot 1 -->
    <button
      type="button"
      class="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[#360185] hover:bg-[#4a02b5] text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 cursor-pointer z-40"
      data-test="add-category-fab"
      aria-label="Add New Category"
      @click="openAddModal"
    >
      <i class="fa-solid fa-plus text-xl"></i>
    </button>

    <!-- Add Category Modal matching Screenshot 2 -->
    <div
      v-if="isAddModalOpen"
      class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
      data-test="add-category-modal"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
        <h2 class="text-base font-bold text-slate-900 mb-4 tracking-tight">
          Add New Category
        </h2>
        <form @submit.prevent="submitAddCategory">
          <div class="mb-5">
            <label for="new-category-name" class="block text-xs font-medium text-slate-700 mb-1.5">
              Category Name :
            </label>
            <input
              id="new-category-name"
              v-model="newCategoryName"
              type="text"
              placeholder="Enter category name"
              required
              class="w-full px-3 py-2 border border-gray-200 rounded-md text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              data-test="new-category-name-input"
            />
          </div>
          <div class="flex items-center justify-center gap-3">
            <button
              type="button"
              class="bg-[#64748b] hover:bg-slate-600 text-white font-medium px-5 py-1.5 rounded-md text-xs cursor-pointer transition-colors"
              data-test="cancel-add-btn"
              @click="closeAddModal"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="bg-[#0066ff] hover:bg-blue-700 text-white font-medium px-6 py-1.5 rounded-md text-xs cursor-pointer transition-colors disabled:opacity-50"
              :disabled="isSavingNew || !newCategoryName.trim()"
              data-test="save-add-btn"
            >
              {{ isSavingNew ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Category Modal matching Screenshot 3 -->
    <div
      v-if="editingCategory"
      class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
      data-test="edit-category-modal"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
        <h2 class="text-base font-bold text-slate-900 mb-4 tracking-tight">
          Edit Category
        </h2>
        <form @submit.prevent="submitEditCategory">
          <div class="mb-4">
            <label for="current-category-name" class="block text-xs font-medium text-slate-700 mb-1.5">
              Current Name :
            </label>
            <input
              id="current-category-name"
              :value="editingCategory.name"
              type="text"
              disabled
              readonly
              class="w-full px-3 py-2 bg-slate-50 text-slate-600 border border-gray-200 rounded-md text-sm cursor-not-allowed"
              data-test="current-category-name-input"
            />
          </div>
          <div class="mb-5">
            <label for="edit-category-name" class="block text-xs font-medium text-slate-700 mb-1.5">
              New Name :
            </label>
            <input
              id="edit-category-name"
              v-model="editCategoryName"
              type="text"
              placeholder="Enter new category name"
              required
              class="w-full px-3 py-2 border border-gray-200 rounded-md text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              data-test="edit-category-name-input"
            />
          </div>
          <div class="flex items-center justify-center gap-3">
            <button
              type="button"
              class="bg-[#64748b] hover:bg-slate-600 text-white font-medium px-5 py-1.5 rounded-md text-xs cursor-pointer transition-colors"
              data-test="cancel-edit-btn"
              @click="closeEditModal"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="bg-[#0066ff] hover:bg-blue-700 text-white font-medium px-6 py-1.5 rounded-md text-xs cursor-pointer transition-colors disabled:opacity-50"
              :disabled="isSavingEdit || !editCategoryName.trim()"
              data-test="save-edit-btn"
            >
              {{ isSavingEdit ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="categoryToDelete"
      class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
      data-test="delete-category-modal"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
        <h2 class="text-base font-bold text-slate-900 mb-2 tracking-tight">
          Delete Category
        </h2>
        <p class="text-xs text-slate-600 mb-5">
          Are you sure you want to delete category
          <strong>"{{ categoryToDelete.name }}"</strong>? This action cannot be undone.
        </p>
        <div class="flex items-center justify-center gap-3">
          <button
            type="button"
            class="bg-[#64748b] hover:bg-slate-600 text-white font-medium px-5 py-1.5 rounded-md text-xs cursor-pointer transition-colors"
            data-test="cancel-delete-btn"
            @click="cancelDelete"
          >
            Cancel
          </button>
          <button
            type="button"
            class="bg-[#c62828] hover:bg-red-700 text-white font-medium px-6 py-1.5 rounded-md text-xs cursor-pointer transition-colors disabled:opacity-50"
            :disabled="isDeleting"
            data-test="confirm-delete-btn"
            @click="executeDelete"
          >
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
