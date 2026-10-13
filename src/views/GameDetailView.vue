<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchGameById } from '@/services/gameApi'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import type { Game } from '@/types/game'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const isLoading = ref(true)
const isAddingToCart = ref(false)

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

const displayCategories = computed(() => {
  if (!game.value) return []
  if (game.value.categories && game.value.categories.length > 0) {
    return game.value.categories
  }
  if (game.value.category) {
    return [game.value.category]
  }
  return []
})

const primaryCategory = computed(() => {
  return displayCategories.value[0] || 'Games'
})

const hasSystemRequirements = computed(() => {
  const req = game.value?.systemRequirements
  return Boolean(req && Object.values(req).some(Boolean))
})

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

const redirectToLogin = () => {
  router.push({
    path: '/login',
    query: { mode: 'login', redirect: route.fullPath }
  })
}

const handleAddToCart = async () => {
  if (!authStore.isAuthenticated) {
    redirectToLogin()
    return
  }
  if (!game.value || isAddingToCart.value) {
    return
  }
  isAddingToCart.value = true
  try {
    await cartStore.addItem(game.value.id, quantity.value, game.value.name)
  } finally {
    isAddingToCart.value = false
  }
}

const handleBuyNow = async () => {
  if (!authStore.isAuthenticated) {
    redirectToLogin()
    return
  }
  if (!game.value || isAddingToCart.value) {
    return
  }
  isAddingToCart.value = true
  try {
    const success = await cartStore.addItem(game.value.id, quantity.value, game.value.name)
    if (success) {
      router.push('/cart')
    }
  } finally {
    isAddingToCart.value = false
  }
}
</script>

<template>
  <main class="max-w-7xl mx-auto px-4 sm:px-6 py-6 min-h-[calc(100vh-8rem)]">
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
      <!-- Breadcrumb matching Baseline UI & Screenshot -->
      <nav class="flex items-center text-sm mb-6 flex-wrap gap-1 text-slate-500 animate-fade-in-down" aria-label="Breadcrumb">
        <router-link to="/" class="text-secondary hover:underline font-medium">
          Home
        </router-link>
        <span class="mx-1 text-slate-400">/</span>
        <router-link :to="'/category/' + encodeURIComponent(primaryCategory)" class="text-secondary hover:underline font-medium">
          {{ primaryCategory }}
        </router-link>
        <span class="mx-1 text-slate-400">/</span>
        <span class="text-slate-600 font-medium" aria-current="page">
          {{ game.name }}
        </span>
      </nav>

      <!-- Top Two-Column Grid: Visuals Column (Left) & Purchasing Column (Right) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        <!-- Left Column: Visuals / Custom Slider & Thumbnails -->
        <section class="lg:col-span-7 flex flex-col animate-fade-in-scale delay-100">
          <!-- Main Slider Image Box -->
          <div class="relative overflow-hidden rounded-xl bg-[#111] shadow-sm mb-3 flex items-center justify-center min-h-[420px] max-h-[460px]">
            <img
              :src="galleryImages[activeImageIndex] || game.coverImage"
              :alt="`${game.name} Screenshot`"
              class="w-full h-[450px] object-contain transition-opacity duration-150 cursor-pointer"
            />

            <!-- Prev Arrow -->
            <button
              v-if="galleryImages.length > 1"
              type="button"
              class="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-primary text-white flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 z-10 cursor-pointer"
              aria-label="Previous screenshot"
              @click="prevImage"
            >
              <i class="fa-solid fa-chevron-left text-sm"></i>
            </button>

            <!-- Next Arrow -->
            <button
              v-if="galleryImages.length > 1"
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-primary text-white flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 z-10 cursor-pointer"
              aria-label="Next screenshot"
              @click="nextImage"
            >
              <i class="fa-solid fa-chevron-right text-sm"></i>
            </button>
          </div>

          <!-- Thumbnail Scroller -->
          <div
            v-if="galleryImages.length > 1"
            class="flex gap-2 overflow-x-auto py-2"
          >
            <button
              v-for="(img, idx) in galleryImages"
              :key="idx"
              type="button"
              :aria-label="`Select screenshot ${idx + 1}`"
              class="w-[120px] h-[68px] flex-shrink-0 rounded-md overflow-hidden border-2 transition-all cursor-pointer bg-slate-900"
              :class="activeImageIndex === idx ? 'border-primary opacity-100 scale-105 shadow-md' : 'border-transparent opacity-50 hover:opacity-80'"
              @click="selectImage(idx)"
            >
              <img
                :src="img"
                :alt="`Thumbnail ${idx + 1}`"
                class="w-full h-full object-cover"
              />
            </button>
          </div>
        </section>

        <!-- Right Column: Purchasing Section (Matching Screenshot) -->
        <section class="lg:col-span-5 flex flex-col justify-start animate-fade-in-up delay-200">
          <!-- Game Cover Image with border-primary -->
          <div class="mb-4">
            <img
              :src="game.coverImage"
              :alt="game.name"
              class="rounded-lg shadow-sm max-h-[250px] w-auto border-2 border-primary object-cover"
            />
          </div>

          <!-- Game Title -->
          <h1 class="text-3xl sm:text-4xl font-bold text-primary mb-2 tracking-tight leading-tight">
            {{ game.name }}
          </h1>

          <!-- Price Tag -->
          <div class="text-3xl sm:text-4xl font-extrabold text-primary mb-4">
            {{ game.price }} <span class="text-2xl font-bold">Baht</span>
          </div>

          <!-- Action Buttons: Add to Cart & Buy Now side by side -->
          <div class="flex items-center gap-3 mb-5">
            <button
              type="button"
              class="flex-1 py-2.5 px-4 rounded-lg font-bold text-sm bg-secondary hover:bg-transparent text-white hover:text-secondary border-2 border-secondary transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              :disabled="isAddingToCart"
              data-test="add-to-cart-btn"
              @click="handleAddToCart"
            >
              <i class="fa-solid fa-cart-shopping"></i>
              <span>Add to cart</span>
            </button>
            <button
              type="button"
              class="flex-1 py-2.5 px-4 rounded-lg font-bold text-sm bg-gradient-to-r from-accent-red to-accent-yellow hover:opacity-95 text-white border-none shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              :disabled="isAddingToCart"
              data-test="buy-now-btn"
              @click="handleBuyNow"
            >
              <i class="fa-solid fa-bolt"></i>
              <span>Buy now</span>
            </button>
          </div>

          <!-- Amount / Quantity Selector & Stock Info -->
          <div class="mb-4">
            <label class="block font-bold text-slate-500 mb-1 text-sm">
              Amount
            </label>
            <div class="flex items-center gap-3">
              <div class="flex items-center bg-white border-2 border-slate-200 rounded-lg overflow-hidden w-max">
                <button
                  type="button"
                  class="w-9 h-9 flex items-center justify-center bg-slate-50 hover:bg-slate-200 text-primary transition-colors disabled:opacity-40 cursor-pointer"
                  aria-label="Decrease quantity"
                  :disabled="quantity <= 1"
                  @click="decrementQuantity"
                >
                  <i class="fa-solid fa-minus text-xs"></i>
                </button>
                <span class="w-12 text-center font-bold text-base text-slate-800">
                  {{ quantity }}
                </span>
                <button
                  type="button"
                  class="w-9 h-9 flex items-center justify-center bg-slate-50 hover:bg-slate-200 text-primary transition-colors disabled:opacity-40 cursor-pointer"
                  aria-label="Increase quantity"
                  :disabled="quantity >= (game.stock ?? 99)"
                  @click="incrementQuantity"
                >
                  <i class="fa-solid fa-plus text-xs"></i>
                </button>
              </div>
              <span class="text-slate-500 text-sm">
                ({{ game.stock ?? 0 }} available in stock)
              </span>
            </div>
          </div>

          <!-- Metadata: Publisher & Release -->
          <div v-if="game.publisher || game.releaseDate" class="flex items-center gap-4 text-xs text-text-muted mt-1">
            <span v-if="game.publisher">
              Publisher: <strong class="text-slate-700">{{ game.publisher }}</strong>
            </span>
            <span v-if="game.releaseDate">
              Release: <strong class="text-slate-700">{{ game.releaseDate }}</strong>
            </span>
          </div>
        </section>
      </div>

      <!-- Bottom Info Column (Matching Baseline Section Titles & Cards) -->
      <div class="w-full lg:w-8/12 mt-4 space-y-8 animate-fade-in-up delay-300">
        <!-- 1. Category Section -->
        <div class="mb-6">
          <h3 class="relative text-2xl font-extrabold text-primary pb-2.5 mb-3 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-1 after:bg-accent-yellow after:rounded">
            Category
          </h3>
          <div class="flex gap-2 flex-wrap mt-3">
            <router-link
              v-for="cat in displayCategories"
              :key="cat"
              :to="'/category/' + encodeURIComponent(cat)"
              class="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-primary border border-slate-300 rounded-full text-sm font-medium transition-colors"
            >
              {{ cat }}
            </router-link>
          </div>
        </div>

        <!-- 2. About Game Section -->
        <div class="mb-6">
          <h3 class="relative text-2xl font-extrabold text-primary pb-2.5 mb-3 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-1 after:bg-accent-yellow after:rounded">
            About Game
          </h3>
          <div class="bg-white rounded-xl p-6 sm:p-8 shadow-sm border-l-4 border-secondary mt-3">
            <p class="leading-relaxed text-slate-700 m-0 text-sm sm:text-base">
              {{ game.description || 'No description available.' }}
            </p>
          </div>
        </div>

        <!-- 3. System Requirements Section (Rendered strictly if systemRequirements exists) -->
        <div v-if="hasSystemRequirements" class="mb-6">
          <h3 class="relative text-2xl font-extrabold text-primary pb-2.5 mb-3 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-1 after:bg-accent-yellow after:rounded">
            System Requirements
          </h3>
          <div class="bg-white rounded-xl p-6 sm:p-8 shadow-sm border-l-4 border-secondary mt-3 text-slate-700">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-if="game.systemRequirements?.os">
                <span class="text-slate-400 block text-xs font-bold uppercase tracking-wider mb-1">OS</span>
                <span class="text-sm font-medium text-slate-800">{{ game.systemRequirements.os }}</span>
              </div>
              <div v-if="game.systemRequirements?.processor">
                <span class="text-slate-400 block text-xs font-bold uppercase tracking-wider mb-1">Processor</span>
                <span class="text-sm font-medium text-slate-800">{{ game.systemRequirements.processor }}</span>
              </div>
              <div v-if="game.systemRequirements?.memory">
                <span class="text-slate-400 block text-xs font-bold uppercase tracking-wider mb-1">Memory</span>
                <span class="text-sm font-medium text-slate-800">{{ game.systemRequirements.memory }}</span>
              </div>
              <div v-if="game.systemRequirements?.graphics">
                <span class="text-slate-400 block text-xs font-bold uppercase tracking-wider mb-1">Graphics</span>
                <span class="text-sm font-medium text-slate-800">{{ game.systemRequirements.graphics }}</span>
              </div>
              <div v-if="game.systemRequirements?.storage" class="col-span-1 sm:col-span-2 pt-3 border-t border-slate-200">
                <span class="text-slate-400 block text-xs font-bold uppercase tracking-wider mb-1">Storage</span>
                <span class="text-sm font-medium text-slate-800 flex items-center">
                  <i class="fa-solid fa-hard-drive mr-2 text-primary"></i>
                  {{ game.systemRequirements.storage }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Game Not Found State -->
    <div
      v-else
      class="py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm animate-card-entrance"
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
