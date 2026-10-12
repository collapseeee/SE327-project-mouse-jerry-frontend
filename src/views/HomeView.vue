<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import HighlightCarousel, { type HighlightItem } from '../components/HighlightCarousel.vue'
import GameCard from '../components/GameCard.vue'
import Pagination from '../components/Pagination.vue'
import { getAllGames } from '@/data/games'
import { fetchGames, fetchHighlights } from '@/services/gameApi'
import type { Game } from '@/types/game'

// Carousel highlights matching the baseline Swiper Coverflow
const highlights = ref<HighlightItem[]>([
  {
    id: 'h1',
    gameId: 'anstoss-3',
    name: 'ANSTOSS 3 - Der Fußballmanager',
    customImage: 'https://images.igdb.com/igdb/image/upload/t_1080p/sc66l2.jpg',
    buttonColor: 'var(--color-accent-green)'
  },
  {
    id: 'h2',
    gameId: 'cyberpunk-2077',
    name: 'Cyberpunk 2077',
    customImage: 'https://images.igdb.com/igdb/image/upload/t_1080p/sc7x7t.jpg',
    buttonColor: 'var(--color-accent-red)'
  },
  {
    id: 'h3',
    gameId: 'elden-ring',
    name: 'Elden Ring',
    customImage: 'https://images.igdb.com/igdb/image/upload/t_1080p/sclh7y.jpg',
    buttonColor: 'var(--color-accent-yellow)'
  },
  {
    id: 'h4',
    gameId: 'planet-zoo',
    name: 'Planet Zoo: Aquatic Pack',
    customImage: 'https://images.igdb.com/igdb/image/upload/t_1080p/sc7x7t.jpg',
    buttonColor: 'var(--color-secondary)'
  }
])

const mapHighlightColor = (index: number): string => {
  const colors = [
    'var(--color-accent-green)',
    'var(--color-accent-red)',
    'var(--color-accent-yellow)',
    'var(--color-secondary)'
  ]
  return colors[index % colors.length]
}

const getInitialHomeGames = (): Game[] => {
  const all = getAllGames()
  const homeOrder = ['battlefield-3', 'headquarters-wwii', 'fivem', 'clone-drone', 'tropico-4']
  const homeSet = new Set(homeOrder)
  const p1: Game[] = []
  const rest: Game[] = []
  for (const id of homeOrder) {
    const found = all.find((g) => g.id === id)
    if (found) p1.push(found)
  }
  for (const g of all) {
    if (!homeSet.has(g.id)) rest.push(g)
  }
  return [...p1, ...rest]
}

const initialAll = getInitialHomeGames()
const currentPage = ref(1)
const pageSize = ref(5)
const totalCount = ref(initialAll.length)
const catalogGames = ref<Game[]>(initialAll.slice(0, 5))

const totalPages = computed(() => {
  return Math.ceil(totalCount.value / pageSize.value) || 1
})

const loadHighlights = async (): Promise<void> => {
  const remoteHighlights = await fetchHighlights()
  if (remoteHighlights.length > 0) {
    highlights.value = remoteHighlights.map((item, index) => ({
      id: `h-${item.id}`,
      gameId: item.id,
      name: item.name,
      customImage: item.coverImage,
      buttonColor: mapHighlightColor(index)
    }))
  }
}

const loadPageGames = async (page: number): Promise<void> => {
  const remote = await fetchGames({ page, size: pageSize.value })
  if (remote.games.length > 0 || remote.totalCount > 0) {
    catalogGames.value = remote.games
    totalCount.value = remote.totalCount
    return
  }
  const all = getInitialHomeGames()
  totalCount.value = all.length
  const start = (page - 1) * pageSize.value
  catalogGames.value = all.slice(start, start + pageSize.value)
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
}
</script>

<template>
  <main class="max-w-7xl mx-auto px-6 py-6">
    <!-- Premium Swiper Coverflow Carousel -->
    <section class="mb-8">
      <HighlightCarousel :highlights="highlights" />
    </section>

    <!-- Section Title -->
    <div class="mb-6">
      <h3 class="text-2xl font-bold text-primary">
        All Games
      </h3>
    </div>

    <!-- Product Grid matching Screenshot 3 -->
    <section class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 mb-8">
      <GameCard
        v-for="game in catalogGames"
        :key="game.id"
        :game="game"
      />
    </section>

    <!-- Pagination matching Screenshot 3: < 1 2 ... 6 > -->
    <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-change="onPageChange"
    />
  </main>
</template>