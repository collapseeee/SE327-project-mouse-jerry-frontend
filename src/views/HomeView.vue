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

const homeGameOrder = [
  'battlefield-3',
  'headquarters-wwii',
  'fivem',
  'clone-drone',
  'tropico-4'
]
const homeGameOrderSet = new Set(homeGameOrder)

const allGames = ref<Game[]>(getAllGames())

const sortedGames = computed<Game[]>(() => {
  const page1Games: Game[] = []
  const remainingGames: Game[] = []

  for (const id of homeGameOrder) {
    const found = allGames.value.find((g) => g.id === id)
    if (found) page1Games.push(found)
  }

  for (const g of allGames.value) {
    if (!homeGameOrderSet.has(g.id)) {
      remainingGames.push(g)
    }
  }

  return [...page1Games, ...remainingGames]
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

onMounted(async () => {
  const [remoteHighlights, remoteGames] = await Promise.all([
    fetchHighlights(),
    fetchGames({ size: 100 })
  ])

  if (remoteHighlights.length > 0) {
    highlights.value = remoteHighlights.map((item, index) => ({
      id: `h-${item.id}`,
      gameId: item.id,
      name: item.name,
      customImage: item.coverImage,
      buttonColor: mapHighlightColor(index)
    }))
  }

  if (remoteGames.games.length > 0) {
    allGames.value = remoteGames.games
  }
})

const currentPage = ref(1)
const pageSize = ref(5)

const totalPages = computed(() => {
  return Math.ceil(sortedGames.value.length / pageSize.value) || 1
})

const paginatedGames = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return sortedGames.value.slice(start, start + pageSize.value)
})

const onPageChange = (page: number) => {
  currentPage.value = page
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
        v-for="game in paginatedGames"
        :key="game.id"
        :game="game"
      />
    </section>

    <!-- Pagination matching Screenshot 3: < 1 2 ... 6 > -->
    <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      @update:current-page="onPageChange"
    />
  </main>
</template>