<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getGamesByCategory } from '@/data/games'
import { fetchGames } from '@/services/gameApi'
import GameCard from '@/components/GameCard.vue'
import Pagination from '@/components/Pagination.vue'
import type { Game } from '@/types/game'

const route = useRoute()
const currentPage = ref(1)
const pageSize = ref(10)

const rawCategory = computed(() => {
  const cat = route.params.category
  return typeof cat === 'string' ? decodeURIComponent(cat) : ''
})

const categoryTitle = computed(() => rawCategory.value || 'Category')

const filteredGames = ref<Game[]>(getGamesByCategory(rawCategory.value))

const totalPages = computed(() => {
  return Math.ceil(filteredGames.value.length / pageSize.value) || 1
})

const paginatedGames = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredGames.value.slice(start, start + pageSize.value)
})

const loadCategoryGames = async (cat: string) => {
  if (!cat) {
    filteredGames.value = []
    return
  }
  const res = await fetchGames({ category: cat })
  if (res.games.length > 0) {
    filteredGames.value = res.games
  }
}

onMounted(() => {
  loadCategoryGames(rawCategory.value)
})

watch(
  () => route.params.category,
  (newCat) => {
    currentPage.value = 1
    const catStr = typeof newCat === 'string' ? decodeURIComponent(newCat) : ''
    filteredGames.value = getGamesByCategory(catStr)
    loadCategoryGames(catStr)
  }
)

const onPageChange = (page: number) => {
  currentPage.value = page
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
        {{ filteredGames.length }} products found
      </span>
    </div>

    <!-- Product Grid -->
    <section
      v-if="paginatedGames.length > 0"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 mb-10"
    >
      <GameCard
        v-for="game in paginatedGames"
        :key="game.id"
        :game="game"
      />
    </section>

    <!-- Empty State -->
    <div
      v-else
      class="py-16 text-center bg-white rounded-2xl border border-slate-100 shadow-sm my-6"
    >
      <i class="fa-solid fa-gamepad text-5xl text-slate-300 mb-4 block"></i>
      <h2 class="text-xl font-bold text-slate-700 mb-2">No games found</h2>
      <p class="text-slate-500 text-sm max-w-md mx-auto mb-6">
        We currently don't have any games in the "{{ categoryTitle }}" category.
      </p>
      <router-link
        to="/"
        class="inline-block px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors"
      >
        Back to Home
      </router-link>
    </div>

    <!-- Pagination -->
    <Pagination
      v-if="totalPages > 1"
      :current-page="currentPage"
      :total-pages="totalPages"
      @update:current-page="onPageChange"
    />
  </main>
</template>
