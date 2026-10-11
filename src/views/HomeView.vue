<script setup lang="ts">
import { ref } from 'vue'
import HighlightCarousel, { type HighlightItem } from '../components/HighlightCarousel.vue'

interface Game {
  id: string
  name: string
  price: number
  coverImage: string
}

// Carousel highlights matching the baseline Swiper Coverflow
const highlights = ref<HighlightItem[]>([
  {
    id: 'h1',
    gameId: 'anstoss-3',
    name: 'ANSTOSS 3 - Der Fußballmanager',
    // Realistic football stadium / banner matching the user's screenshot
    customImage: 'https://images.igdb.com/igdb/image/upload/t_1080p/sc66l2.jpg',
    buttonColor: 'var(--color-accent-green)' // Green SHOP NOW button from theme
  },
  {
    id: 'h2',
    gameId: 'cyberpunk-2077',
    name: 'Cyberpunk 2077',
    customImage: 'https://images.igdb.com/igdb/image/upload/t_1080p/sc7x7t.jpg',
    buttonColor: 'var(--color-accent-red)' // Red/Pink SHOP NOW button from theme
  },
  {
    id: 'h3',
    gameId: 'elden-ring',
    name: 'Elden Ring',
    customImage: 'https://images.igdb.com/igdb/image/upload/t_1080p/sclh7y.jpg',
    buttonColor: 'var(--color-accent-yellow)' // Gold SHOP NOW button from theme
  },
  {
    id: 'h4',
    gameId: 'planet-zoo',
    name: 'Planet Zoo: Aquatic Pack',
    customImage: 'https://images.igdb.com/igdb/image/upload/t_1080p/sc7x7t.jpg',
    buttonColor: 'var(--color-secondary)' // Secondary purple SHOP NOW button from theme
  }
])

// Games matching the user's screenshot grid
const games = ref<Game[]>([
  {
    id: '1',
    name: 'Among Us',
    price: 99,
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg'
  },
  {
    id: '2',
    name: 'Planet Zoo: Aquatic Pack',
    price: 350,
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2oau.jpg'
  },
  {
    id: '3',
    name: 'Blake: The Visual Novel',
    price: 189,
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3p2b.jpg'
  },
  {
    id: '4',
    name: 'Motor City Online',
    price: 450,
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x4c.jpg'
  },
  {
    id: '5',
    name: 'Bubsy in: Claws Encounters of the Furred Kind',
    price: 150,
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co26vi.jpg'
  },
  {
    id: '6',
    name: 'Cyberpunk 2077',
    price: 1399,
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co41mu.jpg'
  },
  {
    id: '7',
    name: 'Elden Ring',
    price: 1790,
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg'
  },
  {
    id: '8',
    name: 'Hollow Knight',
    price: 315,
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rgi.jpg'
  }
])
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

    <!-- Product Grid -->
    <section class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 mb-12">
      <div
        v-for="game in games"
        :key="game.id"
        class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
      >
        <!-- Game Cover Image -->
        <div class="aspect-[3/4] w-full overflow-hidden bg-slate-100">
          <img
            :src="game.coverImage"
            :alt="game.name"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        <!-- Card Details -->
        <div class="p-3.5 flex flex-col flex-1">
          <h4 class="font-bold text-slate-800 text-sm truncate mb-1" :title="game.name">
            {{ game.name }}
          </h4>
          <p class="text-accent-red font-semibold text-sm mb-3">
            {{ game.price }} Baht
          </p>

          <div class="mt-auto flex items-center gap-2">
            <router-link
              :to="`/product/${game.id}`"
              class="flex-1 py-1.5 px-3 text-xs font-semibold text-primary border border-primary/40 hover:bg-primary hover:text-white rounded-md transition-colors text-center"
            >
              View
            </router-link>
            <button
              class="p-1.5 px-2.5 bg-accent-orange hover:bg-accent-orange-hover text-white rounded-md transition-colors shadow-sm"
              title="Add to Cart"
            >
              <i class="fa-solid fa-cart-plus text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>