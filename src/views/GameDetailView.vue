<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getGameById } from '@/data/games'

const route = useRoute()

const gameId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? id : ''
})

const game = computed(() => {
  return getGameById(gameId.value)
})

// Gallery images: screenshots or fallback to cover
const galleryImages = computed(() => {
  if (!game.value) return []
  if (game.value.screenshots && game.value.screenshots.length > 0) {
    return game.value.screenshots
  }
  return [game.value.coverImage]
})

const activeImageIndex = ref(0)
const quantity = ref(1)

function prevImage() {
  if (galleryImages.value.length === 0) return
  if (activeImageIndex.value > 0) {
    activeImageIndex.value--
  } else {
    activeImageIndex.value = galleryImages.value.length - 1
  }
}

function nextImage() {
  if (galleryImages.value.length === 0) return
  if (activeImageIndex.value < galleryImages.value.length - 1) {
    activeImageIndex.value++
  } else {
    activeImageIndex.value = 0
  }
}

function selectImage(index: number) {
  activeImageIndex.value = index
}

function decrementQuantity() {
  if (quantity.value > 1) {
    quantity.value--
  }
}

function incrementQuantity() {
  const maxStock = game.value?.stock ?? 99
  if (quantity.value < maxStock) {
    quantity.value++
  }
}
</script>

<template>
  <main class="max-w-7xl mx-auto px-6 py-6 min-h-[calc(100vh-8rem)]">
    <!-- Game Found State -->
    <template v-if="game">
      <!-- Breadcrumb matching Screenshot 2 -->
      <nav class="flex items-center text-sm text-text-muted mb-6 flex-wrap gap-1" aria-label="Breadcrumb">
        <router-link to="/" class="text-secondary hover:underline font-medium">
          Home
        </router-link>
        <span class="text-slate-400">/</span>
        <router-link
          :to="`/category/${encodeURIComponent(game.category)}`"
          class="text-secondary hover:underline font-medium"
        >
          {{ game.category }}
        </router-link>
        <span class="text-slate-400">/</span>
        <span class="text-slate-600 font-medium truncate max-w-xs sm:max-w-md">
          {{ game.name }}
        </span>
      </nav>

      <!-- Main Layout: 2 Columns matching Screenshot 2 -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Left Column: Gallery (60% width) -->
        <section class="lg:col-span-7 flex flex-col">
          <!-- Main Display with Chevron Navigation -->
          <div
            class="relative w-full aspect-video sm:aspect-[4/3] lg:aspect-[16/10] bg-slate-900 rounded-2xl overflow-hidden shadow-md flex items-center justify-center group"
          >
            <!-- Left Arrow Button -->
            <button
              v-if="galleryImages.length > 1"
              type="button"
              aria-label="Previous screenshot"
              class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center z-10 transition-colors cursor-pointer"
              @click="prevImage"
            >
              <i class="fa-solid fa-chevron-left text-sm"></i>
            </button>

            <!-- Active Main Image -->
            <img
              :src="galleryImages[activeImageIndex]"
              :alt="`${game.name} preview`"
              class="w-full h-full object-cover transition-opacity duration-300"
            />

            <!-- Right Arrow Button -->
            <button
              v-if="galleryImages.length > 1"
              type="button"
              aria-label="Next screenshot"
              class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center z-10 transition-colors cursor-pointer"
              @click="nextImage"
            >
              <i class="fa-solid fa-chevron-right text-sm"></i>
            </button>
          </div>

          <!-- Bottom Thumbnails Strip (6 items matching Screenshot 2) -->
          <div
            v-if="galleryImages.length > 1"
            class="grid grid-cols-6 gap-2 sm:gap-3 mt-3.5"
          >
            <button
              v-for="(img, idx) in galleryImages"
              :key="idx"
              type="button"
              :aria-label="`Select screenshot ${idx + 1}`"
              :class="[
                'aspect-[16/10] w-full rounded-lg overflow-hidden border-2 transition-all cursor-pointer p-0 bg-slate-100',
                activeImageIndex === idx
                  ? 'border-secondary ring-2 ring-secondary/30 scale-102 opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-100'
              ]"
              @click="selectImage(idx)"
            >
              <img
                :src="img"
                :alt="`Thumbnail ${idx + 1}`"
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          </div>
        </section>

        <!-- Right Column: Game Info & Purchasing matching Screenshot 2 -->
        <section class="lg:col-span-5 flex flex-col">
          <!-- Game Cover Box Art -->
          <div class="w-32 sm:w-40 aspect-[3/4] rounded-xl overflow-hidden shadow-md mb-4 bg-slate-100 border border-slate-200">
            <img
              :src="game.coverImage"
              :alt="game.name"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Title -->
          <h1 class="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight mb-2">
            {{ game.name }}
          </h1>

          <!-- Price -->
          <p class="text-2xl sm:text-3xl font-extrabold text-primary mb-6">
            {{ game.price }} Baht
          </p>

          <!-- Action Buttons Row matching Screenshot 2 -->
          <div class="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              type="button"
              class="flex-1 py-3 px-5 bg-secondary hover:bg-secondary-hover text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <i class="fa-solid fa-cart-shopping text-sm"></i>
              <span>Add to cart</span>
            </button>

            <button
              type="button"
              class="flex-1 py-3 px-5 bg-gradient-to-r from-accent-orange to-accent-yellow hover:opacity-95 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <i class="fa-solid fa-bolt text-sm"></i>
              <span>Buy now</span>
            </button>
          </div>

          <!-- Amount Stepper matching Screenshot 2 -->
          <div class="mb-6">
            <span class="block text-sm font-bold text-slate-800 mb-2">Amount</span>
            <div class="inline-flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-inner">
              <button
                type="button"
                aria-label="Decrease quantity"
                class="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
                :disabled="quantity <= 1"
                @click="decrementQuantity"
              >
                <i class="fa-solid fa-minus text-xs"></i>
              </button>
              <span class="w-12 text-center text-sm font-bold text-slate-800 select-none">
                {{ quantity }}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                class="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
                :disabled="quantity >= (game.stock ?? 99)"
                @click="incrementQuantity"
              >
                <i class="fa-solid fa-plus text-xs"></i>
              </button>
            </div>
          </div>

          <!-- Description / Metadata -->
          <div v-if="game.description" class="pt-4 border-t border-slate-200">
            <h2 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
              About the Game
            </h2>
            <p class="text-sm text-slate-600 leading-relaxed">
              {{ game.description }}
            </p>
          </div>
        </section>
      </div>
    </template>

    <!-- Game Not Found State -->
    <div
      v-else
      class="py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm"
    >
      <i class="fa-solid fa-triangle-exclamation text-5xl text-accent-red mb-4 block"></i>
      <h1 class="text-2xl font-bold text-slate-800 mb-2">Game Not Found</h1>
      <p class="text-slate-500 text-sm max-w-md mx-auto mb-6">
        The game you are looking for does not exist or may have been removed.
      </p>
      <router-link
        to="/"
        class="inline-block px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors"
      >
        Back to Home
      </router-link>
    </div>
  </main>
</template>
