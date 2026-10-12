<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchGameById } from '@/services/gameApi'
import type { Game } from '@/types/game'

const route = useRoute()
const isLoading = ref(true)

const gameId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? id : ''
})

const game = ref<Game | null>(null)

const loadGameDetail = async (id: string): Promise<void> => {
  if (!id) {
    game.value = null
    isLoading.value = false
    return
  }
  isLoading.value = true
  try {
    const remoteGame = await fetchGameById(id)
    game.value = remoteGame
  } catch {
    game.value = null
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadGameDetail(gameId.value)
})

watch(
  () => route.params.id,
  (newId) => {
    if (typeof newId === 'string') {
      loadGameDetail(newId)
    }
  }
)

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

const prevImage = () => {
  if (galleryImages.value.length === 0) return
  if (activeImageIndex.value > 0) {
    activeImageIndex.value--
  } else {
    activeImageIndex.value = galleryImages.value.length - 1
  }
}

const nextImage = () => {
  if (galleryImages.value.length === 0) return
  if (activeImageIndex.value < galleryImages.value.length - 1) {
    activeImageIndex.value++
  } else {
    activeImageIndex.value = 0
  }
}

const selectImage = (index: number) => {
  activeImageIndex.value = index
}

const decrementQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const incrementQuantity = () => {
  const maxStock = game.value?.stock ?? 99
  if (quantity.value < maxStock) {
    quantity.value++
  }
}
</script>

<template>
  <main class="max-w-7xl mx-auto px-6 py-6 min-h-[calc(100vh-8rem)]">
    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="py-20 text-center"
    >
      <i class="fa-solid fa-circle-notch fa-spin text-4xl text-primary mb-4 block"></i>
      <p class="text-slate-500 text-sm">Loading game details...</p>
    </div>

    <!-- Game Found State -->
    <template v-else-if="game">
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

      <!-- Main Product Details Card -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Gallery Section matching Screenshot 2 -->
        <section class="lg:col-span-7 flex flex-col gap-4">
          <!-- Main Preview Window with Next/Prev Arrows -->
          <div class="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-md flex items-center justify-center group">
            <img
              :src="galleryImages[activeImageIndex]"
              :alt="game.name"
              class="w-full h-full object-cover select-none"
            />

            <!-- Prev arrow (if more than 1 image) -->
            <button
              v-if="galleryImages.length > 1"
              type="button"
              class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all opacity-80 hover:opacity-100"
              aria-label="Previous screenshot"
              @click="prevImage"
            >
              <i class="fa-solid fa-chevron-left text-sm"></i>
            </button>

            <!-- Next arrow (if more than 1 image) -->
            <button
              v-if="galleryImages.length > 1"
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all opacity-80 hover:opacity-100"
              aria-label="Next screenshot"
              @click="nextImage"
            >
              <i class="fa-solid fa-chevron-right text-sm"></i>
            </button>
          </div>

          <!-- Thumbnail Strip (Screenshot 2 bottom thumbnails) -->
          <div
            v-if="galleryImages.length > 1"
            class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2"
          >
            <button
              v-for="(img, idx) in galleryImages"
              :key="idx"
              type="button"
              :aria-label="`Select screenshot ${idx + 1}`"
              class="aspect-video rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-slate-900"
              :class="activeImageIndex === idx ? 'border-primary ring-2 ring-primary/30 scale-95' : 'border-transparent opacity-70 hover:opacity-100'"
              @click="selectImage(idx)"
            >
              <img
                :src="img"
                :alt="`${game.name} preview ${idx + 1}`"
                class="w-full h-full object-cover"
              />
            </button>
          </div>
        </section>

        <!-- Right Side: Game Info & Purchasing Section -->
        <section class="lg:col-span-5 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col gap-6">
          <div>
            <!-- Categories / Badges -->
            <div class="flex items-center gap-2 flex-wrap mb-2">
              <span class="inline-block px-2.5 py-1 bg-primary/10 text-primary font-semibold text-xs rounded-full">
                {{ game.category }}
              </span>
              <span
                v-if="game.stock !== undefined && game.stock > 0"
                class="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold text-xs rounded-full"
              >
                In Stock ({{ game.stock }})
              </span>
            </div>

            <!-- Title -->
            <h1 class="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight leading-snug">
              {{ game.name }}
            </h1>

            <!-- Publisher & Release -->
            <div class="flex items-center gap-4 text-xs text-text-muted mt-2">
              <span v-if="game.publisher">
                Publisher: <strong class="text-slate-700">{{ game.publisher }}</strong>
              </span>
              <span v-if="game.releaseDate">
                Release: <strong class="text-slate-700">{{ game.releaseDate }}</strong>
              </span>
            </div>
          </div>

          <!-- Price -->
          <div class="py-2 border-y border-slate-100">
            <span class="text-xs text-text-muted uppercase tracking-wider block font-semibold mb-0.5">
              Price
            </span>
            <div class="text-3xl font-extrabold text-primary">
              {{ game.price }} <span class="text-lg font-bold text-slate-500">Baht</span>
            </div>
          </div>

          <!-- Quantity Selector matching Screenshot 2: `[ - ] [ 1 ] [ + ]` -->
          <div class="flex items-center gap-4">
            <span class="text-sm font-semibold text-slate-700">Amount</span>
            <div class="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50">
              <button
                type="button"
                class="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-40"
                aria-label="Decrease quantity"
                :disabled="quantity <= 1"
                @click="decrementQuantity"
              >
                <i class="fa-solid fa-minus text-xs"></i>
              </button>
              <span class="w-12 text-center text-sm font-bold text-slate-800">
                {{ quantity }}
              </span>
              <button
                type="button"
                class="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-40"
                aria-label="Increase quantity"
                :disabled="quantity >= (game.stock ?? 99)"
                @click="incrementQuantity"
              >
                <i class="fa-solid fa-plus text-xs"></i>
              </button>
            </div>
          </div>

          <!-- Actions: Add to Cart & Buy Now matching Screenshot 2 -->
          <div class="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              class="flex-1 py-3 px-6 rounded-xl font-bold text-sm bg-accent-yellow hover:bg-accent-yellow-hover text-slate-900 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <i class="fa-solid fa-cart-shopping"></i>
              <span>Add to cart</span>
            </button>
            <button
              type="button"
              class="flex-1 py-3 px-6 rounded-xl font-bold text-sm bg-accent-red hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <i class="fa-solid fa-bolt"></i>
              <span>Buy now</span>
            </button>
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
