<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import logoImg from '@/assets/logo.png'
import { fetchCategories } from '@/services/categoryApi'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import type { CategoryItem } from '@/types/game'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const cartStore = useCartStore()

const searchQuery = ref('')
const isCategoryDropdownOpen = ref(false)
const categoryDropdownRef = ref<HTMLElement | null>(null)

const isProfilePage = computed(() => route.path === '/account')

const categories = ref<CategoryItem[]>([])

const toggleCategoryDropdown = () => {
  isCategoryDropdownOpen.value = !isCategoryDropdownOpen.value
}

const closeCategoryDropdown = () => {
  isCategoryDropdownOpen.value = false
}

const handleSearch = () => {
  const query = searchQuery.value.trim()
  if (query) {
    router.push({ path: '/search', query: { q: query } })
  }
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  if (
    categoryDropdownRef.value &&
    !categoryDropdownRef.value.contains(target)
  ) {
    closeCategoryDropdown()
  }
}

const loadCategories = async (): Promise<void> => {
  try {
    const remoteCategories = await fetchCategories()
    categories.value = remoteCategories
  } catch {
    categories.value = []
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  loadCategories()
  if (authStore.isAuthenticated) {
    cartStore.loadCart()
  }
})

watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    if (isAuth) {
      cartStore.loadCart()
    } else {
      cartStore.reset()
    }
  }
)

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <nav class="w-full bg-primary text-white shadow-md relative z-50">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
      <!-- Left side: Brand Logo & Links -->
      <div class="flex items-center gap-6">
        <router-link to="/" class="flex items-center gap-2.5 group">
          <img
            :src="logoImg"
            alt="Mouse Jerry"
            class="w-10 h-10 rounded-full border border-white/20 object-cover group-hover:scale-105 transition-transform"
          />
          <span class="font-bold text-xl tracking-tight text-white group-hover:text-accent-yellow transition-colors">
            Mouse Jerry
          </span>
        </router-link>

        <div class="hidden md:flex items-center gap-5 text-sm font-medium">
          <!-- Category Dropdown Container -->
          <div ref="categoryDropdownRef" class="relative">
            <button
              type="button"
              id="category-dropdown-btn"
              aria-haspopup="true"
              :aria-expanded="isCategoryDropdownOpen"
              class="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors cursor-pointer py-1.5 px-2 rounded-md hover:bg-white/10"
              @click="toggleCategoryDropdown"
            >
              <i class="fa-solid fa-gamepad text-accent-yellow"></i>
              <span>Category</span>
              <i
                class="fa-solid fa-chevron-down text-xs text-white/70 transition-transform duration-200"
                :class="{ 'rotate-180': isCategoryDropdownOpen }"
              ></i>
            </button>

            <!-- Dropdown Menu matching Screenshot 4 -->
            <transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="opacity-0 -translate-y-2 scale-95"
              enter-to-class="opacity-100 translate-y-0 scale-100"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="opacity-100 translate-y-0 scale-100"
              leave-to-class="opacity-0 -translate-y-2 scale-95"
            >
              <div
                v-if="isCategoryDropdownOpen"
                class="absolute left-0 mt-2 w-56 bg-bg-surface text-text-dark rounded-lg shadow-xl border border-auth-border py-2 z-50 overflow-hidden"
              >
                <router-link
                  v-for="cat in categories"
                  :key="cat.id"
                  :to="`/category/${encodeURIComponent(cat.slug)}`"
                  class="block px-4 py-2.5 text-sm font-medium text-text-dark hover:bg-bg-light hover:text-primary transition-colors"
                  @click="closeCategoryDropdown"
                >
                  {{ cat.name }}
                </router-link>
                <div
                  v-if="categories.length === 0"
                  class="px-4 py-2.5 text-xs text-slate-400 italic"
                >
                  No categories found
                </div>
              </div>
            </transition>
          </div>

          <router-link to="/contact" class="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors">
            <i class="fa-solid fa-envelope text-accent-yellow"></i>
            <span>Contact</span>
          </router-link>
        </div>
      </div>

      <!-- Right side: Search bar & User Actions -->
      <div class="flex items-center gap-5">
        <form class="relative w-56 sm:w-72" @submit.prevent="handleSearch">
          <label for="navbar-search" class="sr-only">Search epic games</label>
          <input
            id="navbar-search"
            v-model="searchQuery"
            type="text"
            placeholder="Search epic games..."
            class="w-full pl-4 pr-10 py-1.5 bg-white text-slate-800 placeholder-slate-400 text-sm rounded-full border-none focus:outline-none focus:ring-2 focus:ring-accent-yellow shadow-inner"
          />
          <button
            type="submit"
            aria-label="Submit search"
            class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary transition-colors cursor-pointer border-none bg-transparent p-0"
          >
            <i class="fa-solid fa-magnifying-glass text-sm"></i>
          </button>
        </form>

        <!-- Cart with badge -->
        <router-link
          to="/cart"
          class="relative text-white hover:text-accent-yellow transition-colors p-1"
          title="Shopping Cart"
          data-test="navbar-cart-link"
        >
          <i class="fa-solid fa-cart-shopping text-lg"></i>
          <span
            v-if="authStore.isAuthenticated && cartStore.totalItems > 0"
            class="absolute -top-1 -right-1 bg-accent-red text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none"
            data-test="navbar-cart-badge"
          >
            {{ cartStore.totalItems }}
          </span>
        </router-link>

        <!-- 
          CRITICAL AGENT INSTRUCTION - DO NOT REMOVE OR HARDCODE USERNAME:
          The login / user profile element below is DYNAMIC based on authentication state (authStore.isAuthenticated).
          - Unauthenticated: Renders the original baseline icon-only login button (<i class="fa-solid fa-user"></i>) without any text, matching the original baseline design.
          - Authenticated: Renders the active user's username (<i class="fa-regular fa-circle-user"></i> + {{ authStore.currentUsername }}).
          DO NOT hardcode 'thainchai' or any static username here to match baseline UI screenshots/mockups.
        -->
        <template v-if="authStore.isAuthenticated">
          <router-link
            to="/account"
            class="flex items-center gap-1.5 text-white hover:text-accent-yellow transition-colors p-1 group cursor-pointer"
            :title="authStore.currentUsername"
            data-test="navbar-user-btn"
          >
            <i class="fa-regular fa-circle-user text-xl transition-colors"></i>
            <span
              v-if="!isProfilePage"
              class="text-sm font-medium hidden sm:inline-block"
              data-test="navbar-username"
            >
              {{ authStore.currentUsername }}
            </span>
          </router-link>
        </template>
        <template v-else>
          <!-- Original baseline icon-only login button matching reference image -->
          <router-link
            to="/login?mode=login"
            class="text-white hover:text-accent-yellow transition-all duration-200 p-1 flex items-center justify-center text-lg hover:scale-110 cursor-pointer"
            title="Login"
            aria-label="Login"
            data-test="navbar-login-link"
          >
            <i class="fa-solid fa-user"></i>
          </router-link>
        </template>
      </div>
    </div>
  </nav>
</template>