<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { searchGames } from '@/data/games'
import { fetchGames } from '@/services/gameApi'
import GameCard from '@/components/GameCard.vue'
import Pagination from '@/components/Pagination.vue'
import type { Game } from '@/types/game'

const route = useRoute()
const currentPage = ref(1)
const pageSize = ref(10)

const searchQuery = computed(() => {
  const queryParam = route.query.q
  if (typeof queryParam === 'string') return queryParam.trim()
  return ''
})

const searchResults = ref<Game[]>(searchGames(searchQuery.value))

const totalPages = computed(() => {
  return Math.ceil(searchResults.value.length / pageSize.value) || 1
})

const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return searchResults.value.slice(start, start + pageSize.value)
})

const loadSearchResults = async (queryParam: string) => {
  if (!queryParam) {
    searchResults.value = []
    return
  }
  const res = await fetchGames({ search: queryParam })
  if (res.games.length > 0) {
    searchResults.value = res.games
  }
}

onMounted(() => {
  loadSearchResults(searchQuery.value)
})

watch(
  () => route.query.q,
  (newQ) => {
    currentPage.value = 1
    const queryStr = typeof newQ === 'string' ? newQ.trim() : ''
    searchResults.value = searchGames(queryStr)
    loadSearchResults(queryStr)
  }
)

const onPageChange = (page: number) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <main class="max-w-7xl mx-auto px-6 py-6 min-h-[calc(100vh-8rem)]">
    <!-- Breadcrumb matching Screenshot 1 -->
    <nav class="flex items-center text-sm text-text-muted mb-4" aria-label="Breadcrumb">
      <router-link to="/" class="text-secondary hover:underline font-medium">
        Home
      </router-link>
      <span class="mx-2 text-slate-400">/</span>
      <span class="text-slate-600 font-medium">
        Search Results for: "{{ searchQuery }}"
      </span>
    </nav>

    <!-- Header Section with underline and count -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b-2 border-accent-yellow pb-2 mb-8">
      <h1 class="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
        Search Results for: "{{ searchQuery }}" Games
      </h1>
      <span class="text-sm text-text-muted font-medium pb-1">
        {{ searchResults.length }} products found
      </span>
    </div>

    <!-- Product Grid -->
    <section
      v-if="paginatedResults.length > 0"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 mb-10"
    >
      <GameCard
        v-for="game in paginatedResults"
        :key="game.id"
        :game="game"
      />
    </section>

    <!-- Empty State -->
    <div
      v-else
      class="py-16 text-center bg-white rounded-2xl border border-slate-100 shadow-sm my-6"
    >
      <i class="fa-solid fa-magnifying-glass text-5xl text-slate-300 mb-4 block"></i>
      <h2 class="text-xl font-bold text-slate-700 mb-2">No games found</h2>
      <p class="text-slate-500 text-sm max-w-md mx-auto mb-6">
        We couldn't find any games matching "{{ searchQuery }}". Try searching with different keywords.
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
