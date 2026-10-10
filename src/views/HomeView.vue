<script setup lang="ts">
import { ref } from 'vue'

interface Game {
  id: string
  name: string
  price: number
  coverImage: string
}

const games = ref<Game[]>([
  {
    id: '1',
    name: 'Cyberpunk 2077',
    price: 1399,
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co41mu.jpg'
  },
  {
    id: '2',
    name: 'Elden Ring',
    price: 1790,
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg'
  },
  {
    id: '3',
    name: 'Hollow Knight',
    price: 315,
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rgi.jpg'
  }
])
</script>

<template>
  <main class="max-w-7xl mx-auto px-6 py-8">
    <!-- Featured Carousel / Banner -->
    <div class="w-full max-w-2xl mx-auto mb-10">
      <div class="h-64 rounded-2xl bg-[#5a6572] shadow-lg flex items-center justify-center text-center px-6">
        <h2 class="text-white text-3xl font-bold tracking-tight">
          Welcome to Mouse Jerry!
        </h2>
      </div>
    </div>

    <!-- Section Title -->
    <h3 class="text-2xl font-bold text-primary mb-6">
      All Games
    </h3>

    <!-- Game Cards Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
      <div
        v-for="game in games"
        :key="game.id"
        class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
      >
        <!-- Game Cover Image -->
        <div class="aspect-[3/4] w-full overflow-hidden bg-slate-100">
          <img
            :src="game.coverImage"
            :alt="game.name"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        <!-- Card Body -->
        <div class="p-4 flex flex-col flex-1">
          <h4 class="font-bold text-slate-800 text-sm truncate mb-1">
            {{ game.name }}
          </h4>
          <p class="text-accent-red font-semibold text-sm mb-4">
            {{ game.price }} Baht
          </p>

          <div class="mt-auto flex items-center gap-2">
            <button
              class="flex-1 py-1 px-3 text-xs font-semibold text-primary border border-primary/50 hover:bg-primary hover:text-white rounded transition-colors text-center"
            >
              View
            </button>
            <button
              class="p-1.5 px-2.5 bg-[#e05638] hover:bg-[#c9492d] text-white rounded transition-colors"
              title="Add to Cart"
            >
              <i class="fa-solid fa-cart-plus text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>