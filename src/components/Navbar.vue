<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import logoImg from '@/assets/logo.png'
import { getAllCategories } from '@/data/games'

const router = useRouter()
const searchQuery = ref('')
const isCategoryDropdownOpen = ref(false)
const categoryDropdownRef = ref<HTMLElement | null>(null)

const categories = getAllCategories()

function toggleCategoryDropdown() {
  isCategoryDropdownOpen.value = !isCategoryDropdownOpen.value
}

function closeCategoryDropdown() {
  isCategoryDropdownOpen.value = false
}

function handleSearch() {
  const query = searchQuery.value.trim()
  if (query) {
    router.push({ path: '/search', query: { q: query } })
  }
}

function handleClickOutside(event: MouseEvent) {
  if (
    categoryDropdownRef.value &&
    !categoryDropdownRef.value.contains(event.target as Node)
  ) {
    closeCategoryDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

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
                class="absolute left-0 mt-2 w-56 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-100 py-2 z-50 overflow-hidden"
              >
                <router-link
                  v-for="cat in categories"
                  :key="cat.id"
                  :to="`/category/${encodeURIComponent(cat.slug)}`"
                  class="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-primary transition-colors"
                  @click="closeCategoryDropdown"
                >
                  {{ cat.name }}
                </router-link>
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
        >
          <i class="fa-solid fa-cart-shopping text-lg"></i>
          <span
            class="absolute -top-1 -right-1 bg-accent-red text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none"
          >
            2
          </span>
        </router-link>

        <!-- User profile with name thainchai matching screenshots -->
        <router-link
          to="/login"
          class="flex items-center gap-1.5 text-white hover:text-accent-yellow transition-colors p-1 group"
          title="User Profile"
        >
          <i class="fa-regular fa-circle-user text-xl"></i>
          <span class="text-sm font-medium hidden sm:inline-block">thainchai</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>