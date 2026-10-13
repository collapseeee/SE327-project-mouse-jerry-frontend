<script lang="ts">
export default {
  name: 'AdminGamesView'
}
</script>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Pagination from '@/components/Pagination.vue'
import { fetchAdminGames, deleteAdminGame } from '@/services/adminGameApi'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import type { Game } from '@/types/game'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toastStore = useToastStore()

const games = ref<Game[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const currentPage = ref(1)
const pageSize = ref(15)
const totalCount = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))

const gameToDelete = ref<Game | null>(null)
const isDeleting = ref(false)

const loadGames = async (search = '', page = currentPage.value): Promise<void> => {
  if (!authStore.token) {
    return
  }
  isLoading.value = true
  errorMessage.value = null
  try {
    const res = await fetchAdminGames(authStore.token, {
      search: search.trim() || undefined,
      page,
      size: pageSize.value
    })
    games.value = res.games
    totalCount.value = res.totalCount
    currentPage.value = page
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to load games'
    errorMessage.value = msg
    toastStore.showError(msg)
  } finally {
    isLoading.value = false
  }
}

const onPageChange = async (page: number): Promise<void> => {
  const querySearch = typeof route.query.search === 'string' ? route.query.search : ''
  await loadGames(querySearch, page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const confirmDelete = (game: Game): void => {
  gameToDelete.value = game
}

const cancelDelete = (): void => {
  gameToDelete.value = null
}

const computeNextPageAfterDelete = (currentCount: number, page: number): number =>
  currentCount === 1 && page > 1 ? page - 1 : page

const performGameDeletion = async (token: string, targetId: string, targetName: string): Promise<void> => {
  await deleteAdminGame(token, targetId)
  toastStore.showSuccess(`Deleted game "${targetName}" successfully`)
  gameToDelete.value = null
  const querySearch = typeof route.query.search === 'string' ? route.query.search : ''
  const nextPage = computeNextPageAfterDelete(games.value.length, currentPage.value)
  await loadGames(querySearch, nextPage)
}

const executeDelete = async (): Promise<void> => {
  const target = gameToDelete.value
  const token = authStore.token
  if (!target || !token) {
    return
  }
  isDeleting.value = true
  try {
    await performGameDeletion(token, target.id, target.name)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete game'
    toastStore.showError(msg)
  } finally {
    isDeleting.value = false
  }
}

const handleEdit = (gameId: string): void => {
  router.push(`/admin/games/${encodeURIComponent(gameId)}/edit`)
}

const handleAddGame = (): void => {
  router.push('/admin/games/new')
}

watch(
  () => route.query.search,
  (newSearch) => {
    currentPage.value = 1
    loadGames(typeof newSearch === 'string' ? newSearch : '', 1)
  }
)

onMounted(() => {
  const querySearch = typeof route.query.search === 'string' ? route.query.search : ''
  loadGames(querySearch, 1)
})
</script>

<template>
  <div class="min-h-screen py-10 px-4 sm:px-6 lg:px-8 relative">
    <div class="max-w-6xl mx-auto">
      <!-- Page Title matching Screenshot 1 -->
      <h1 class="text-2xl sm:text-3xl font-black text-[#2e0474] tracking-wide uppercase mb-6">
        BACK-OFFICE GAME PAGE
      </h1>

      <!-- Main Table Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Error alert -->
        <div
          v-if="errorMessage"
          class="p-4 bg-red-50 text-red-700 text-sm border-b border-red-100 flex items-center justify-between"
        >
          <span>{{ errorMessage }}</span>
          <button
            type="button"
            class="underline font-medium hover:text-red-900 cursor-pointer"
            @click="loadGames()"
          >
            Retry
          </button>
        </div>

        <!-- Loading spinner -->
        <div v-if="isLoading" class="py-20 text-center text-slate-500">
          <i class="fa-solid fa-spinner fa-spin text-3xl text-primary mb-3"></i>
          <p class="text-sm">Loading games...</p>
        </div>

        <!-- Table View -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse" data-test="admin-games-table">
            <thead>
              <tr class="border-b border-gray-100 text-xs font-black text-[#360185] tracking-wider uppercase">
                <th class="py-4 px-6">IMAGE</th>
                <th class="py-4 px-6">GAME NAME</th>
                <th class="py-4 px-6">GAME PRICE</th>
                <th class="py-4 px-6">GAME STOCK</th>
                <th class="py-4 px-6 text-center">EDIT</th>
                <th class="py-4 px-6 text-center">DELETE</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-sm">
              <tr
                v-for="game in games"
                :key="game.id"
                class="hover:bg-slate-50/60 transition-colors"
                :data-test="`game-row-${game.id}`"
              >
                <!-- Cover Image -->
                <td class="py-4 px-6">
                  <div class="w-16 h-20 bg-slate-100 rounded-md overflow-hidden flex items-center justify-center border border-gray-200">
                    <img
                      v-if="game.coverImage"
                      :src="game.coverImage"
                      :alt="game.name"
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <i v-else class="fa-solid fa-gamepad text-slate-400 text-xl"></i>
                  </div>
                </td>

                <!-- Game Name -->
                <td class="py-4 px-6 font-medium text-slate-800">
                  {{ game.name }}
                </td>

                <!-- Game Price -->
                <td class="py-4 px-6 text-slate-700">
                  {{ game.price }} baht
                </td>

                <!-- Game Stock -->
                <td class="py-4 px-6 text-slate-700 font-medium">
                  {{ game.stock ?? 0 }}
                </td>

                <!-- Edit Button -->
                <td class="py-4 px-6 text-center">
                  <button
                    type="button"
                    class="bg-[#ede7f6] hover:bg-[#d1c4e9] text-[#360185] font-semibold px-4 py-1.5 rounded-md transition-colors cursor-pointer text-xs uppercase"
                    :data-test="`edit-btn-${game.id}`"
                    @click="handleEdit(game.id)"
                  >
                    Edit
                  </button>
                </td>

                <!-- Delete Button -->
                <td class="py-4 px-6 text-center">
                  <button
                    type="button"
                    class="bg-[#feebee] hover:bg-[#ffcdd2] text-[#c62828] font-semibold px-4 py-1.5 rounded-md transition-colors cursor-pointer text-xs uppercase"
                    :data-test="`delete-btn-${game.id}`"
                    @click="confirmDelete(game)"
                  >
                    Delete
                  </button>
                </td>
              </tr>

              <!-- Empty state -->
              <tr v-if="games.length === 0">
                <td colspan="6" class="py-12 text-center text-slate-400 italic">
                  No games found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        data-test="admin-games-pagination"
        @page-change="onPageChange"
      />
    </div>

    <!-- Floating Action Button (FAB) matching Screenshot 1 -->
    <button
      type="button"
      class="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[#360185] hover:bg-[#4a02b5] text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 cursor-pointer z-40"
      title="Add New Game"
      aria-label="Add New Game"
      data-test="fab-add-game"
      @click="handleAddGame"
    >
      <i class="fa-solid fa-plus text-2xl"></i>
    </button>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="gameToDelete"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
      data-test="delete-modal"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
        <h3 class="text-lg font-bold text-slate-900 mb-2">Delete Game</h3>
        <p class="text-sm text-slate-600 mb-6">
          Are you sure you want to delete <span class="font-semibold text-slate-800">"{{ gameToDelete.name }}"</span>? This action cannot be undone.
        </p>
        <div class="flex items-center justify-end gap-3">
          <button
            type="button"
            class="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors cursor-pointer"
            :disabled="isDeleting"
            @click="cancelDelete"
          >
            Cancel
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors cursor-pointer flex items-center gap-2"
            :disabled="isDeleting"
            data-test="confirm-delete-btn"
            @click="executeDelete"
          >
            <i v-if="isDeleting" class="fa-solid fa-spinner fa-spin"></i>
            <span>{{ isDeleting ? 'Deleting...' : 'Delete' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
