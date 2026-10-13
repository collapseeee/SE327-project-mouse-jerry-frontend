<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import HighlightCarousel, { type HighlightItem } from '../components/HighlightCarousel.vue'
import GameCard from '../components/GameCard.vue'
import Pagination from '../components/Pagination.vue'
import { fetchGames, fetchHighlights } from '@/services/gameApi'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import type { Game } from '@/types/game'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const highlights = ref<HighlightItem[]>([])
const currentPage = ref(1)
const pageSize = ref(15)
const totalCount = ref(0)
const catalogGames = ref<Game[]>([])
const isLoading = ref(true)

const totalPages = computed(() => {
  return Math.ceil(totalCount.value / pageSize.value) || 1
})

const mapHighlightColor = (index: number): string => {
  const colors = [
    'var(--color-accent-green)',
    'var(--color-accent-red)',
    'var(--color-accent-yellow)',
    'var(--color-secondary)'
  ]
  return colors[index % colors.length]
}

const loadHighlights = async (): Promise<void> => {
  try {
    const remoteHighlights = await fetchHighlights()
    highlights.value = remoteHighlights.map((item, index) => ({
      id: `h-${item.id}`,
      gameId: item.id,
      name: item.name,
      customImage: item.customImage || item.screenshots?.[0] || item.coverImage,
      buttonColor: item.buttonColor || mapHighlightColor(index)
    }))
  } catch {
    highlights.value = []
  }
}

const loadPageGames = async (page: number): Promise<void> => {
  isLoading.value = true
  try {
    const remote = await fetchGames({ page, size: pageSize.value })
    catalogGames.value = remote.games
    totalCount.value = remote.totalCount
  } catch {
    catalogGames.value = []
    totalCount.value = 0
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    loadHighlights(),
    loadPageGames(currentPage.value)
  ])
})

const onPageChange = async (page: number): Promise<void> => {
  currentPage.value = page
  await loadPageGames(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleAddToCart = async (game: Game): Promise<void> => {
  if (!authStore.isAuthenticated) {
    router.push({
      path: '/login',
      query: { mode: 'login', redirect: '/' }
    })
    return
  }
  await cartStore.addItem(game.id, 1, game.name)
}
</script>

<template>
  <main class="max-w-7xl mx-auto px-6 py-6">
    <!-- Premium Swiper Coverflow Carousel -->
    <section v-if="highlights.length > 0" class="mb-8">
      <HighlightCarousel :highlights="highlights" />
    </section>

    <!-- Section Title -->
    <div class="mb-6">
      <h3 class="text-2xl font-bold text-primary">
        All Games
      </h3>
    </div>

    <!-- Product Grid matching Screenshot 3 -->
    <section
      v-if="catalogGames.length > 0"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 mb-8"
    >
      <GameCard
        v-for="game in catalogGames"
        :key="game.id"
        :game="game"
        @add-to-cart="handleAddToCart"
      />
    </section>

    <!-- Empty State -->
    <div
      v-else-if="!isLoading"
      class="py-16 text-center bg-white rounded-2xl border border-slate-100 shadow-sm mb-8"
    >
      <i class="fa-solid fa-gamepad text-4xl text-slate-300 mb-3 block"></i>
      <p class="text-slate-600 font-medium">No games available at this time.</p>
    </div>

    <!-- Loading State -->
    <div
      v-else
      class="py-16 text-center mb-8"
    >
      <i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary mb-3 block"></i>
      <p class="text-slate-500 text-sm">Loading games...</p>
    </div>

    <!-- Pagination matching Screenshot 3: < 1 2 ... 6 > -->
    <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-change="onPageChange"
    />
  </main>
</template>