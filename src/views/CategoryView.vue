<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchGames } from '@/services/gameApi'
import { useCartStore } from '@/stores/cart'
import GameCard from '@/components/GameCard.vue'
import Pagination from '@/components/Pagination.vue'
import type { Game } from '@/types/game'

const cartStore = useCartStore()
const route = useRoute()
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const categoryGames = ref<Game[]>([])
const isLoading = ref(true)

const rawCategory = computed(() => {
  const cat = route.params.category
  return typeof cat === 'string' ? decodeURIComponent(cat) : ''
})

const categoryTitle = computed(() => rawCategory.value || 'Category')

const totalPages = computed(() => {
  return Math.ceil(totalCount.value / pageSize.value) || 1
})

const loadCategoryGames = async (categoryName: string, page: number): Promise<void> => {
  if (!categoryName) {
    categoryGames.value = []
    totalCount.value = 0
    isLoading.value = false
    return
  }
  isLoading.value = true
  try {
    const res = await fetchGames({ category: categoryName, page, size: pageSize.value })
    categoryGames.value = res.games
    totalCount.value = res.totalCount
  } catch {
    categoryGames.value = []
    totalCount.value = 0
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadCategoryGames(rawCategory.value, currentPage.value)
})

watch(
  () => route.params.category,
  (newCategory) => {
    currentPage.value = 1
    const categoryStr = typeof newCategory === 'string' ? decodeURIComponent(newCategory) : ''
    loadCategoryGames(categoryStr, 1)
  }
)

const onPageChange = async (page: number): Promise<void> => {
  currentPage.value = page
  await loadCategoryGames(rawCategory.value, page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <main class="max-w-7xl mx-auto px-6 py-6 min-h-[calc(100vh-8rem)]">
    <!-- Breadcrumb matching Screenshot 5 -->
    <nav class="flex items-center text-sm text-text-muted mb-4" aria-label="Breadcrumb">
      <router-link to="/" class="text-secondary hover:underline font-medium">
        Home
      </router-link>
      <span class="mx-2 text-slate-400">/</span>
      <span class="text-slate-600 font-medium">{{ categoryTitle }}</span>
    </nav>

    <!-- Header Section with underline and count -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b-2 border-accent-yellow pb-2 mb-8">
      <h1 class="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
        {{ categoryTitle }} Games
      </h1>
      <span class="text-sm text-text-muted font-medium pb-1">
        {{ totalCount }} products found
      </span>
    </div>

    <!-- Product Grid -->
    <section
      v-if="categoryGames.length > 0"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 mb-10"
    >
      <GameCard
        v-for="game in categoryGames"
        :key="game.id"
        :game="game"
        @add-to-cart="cartStore.addToCart($event)"
      />
    </section>

    <!-- Empty State -->
    <div
      v-else-if="!isLoading"
      class="py-16 text-center bg-white rounded-2xl border border-slate-100 shadow-sm mb-10"
    >
      <i class="fa-solid fa-gamepad text-4xl text-slate-300 mb-3 block"></i>
      <h2 class="text-lg font-bold text-slate-700 mb-1">No games found</h2>
      <p class="text-slate-500 text-sm">
        We couldn't find any games under {{ categoryTitle }}.
      </p>
    </div>

    <!-- Loading State -->
    <div
      v-else
      class="py-16 text-center mb-10"
    >
      <i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary mb-3 block"></i>
      <p class="text-slate-500 text-sm">Loading category games...</p>
    </div>

    <!-- Pagination matching Screenshot 5 -->
    <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-change="onPageChange"
    />
  </main>
</template>
