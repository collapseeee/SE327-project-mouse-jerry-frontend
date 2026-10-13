<script lang="ts">
export default {
  name: 'AccountView'
}
</script>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Pagination from '@/components/Pagination.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()

const currentPage = ref(1)
const pageSize = ref(15)

const totalPages = computed(() => Math.max(1, Math.ceil(cartStore.orders.length / pageSize.value)))

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return cartStore.orders.slice(start, start + pageSize.value)
})

const onPageChange = (page: number): void => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleLogout = async (): Promise<void> => {
  await authStore.logout()
  router.push('/login?mode=login')
}

onMounted(async () => {
  await cartStore.loadOrders()
  currentPage.value = 1
})
</script>

<template>
  <main class="max-w-5xl mx-auto px-6 py-10 min-h-[calc(100vh-8rem)]">
    <!-- Profile Card matching Screenshot 1 & 2 -->
    <div
      class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 mb-10"
    >
      <div class="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <!-- Avatar: rounded square with rich purple gradient matching Screenshot 1 -->
        <div
          class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary via-[#520268] to-[#6d037a] flex items-center justify-center flex-shrink-0 shadow-md"
        >
          <i class="fa-solid fa-user text-3xl sm:text-4xl text-white"></i>
        </div>

        <!-- User Information -->
        <div class="flex flex-col gap-1">
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {{ authStore.currentUsername || 'User' }}
          </h1>
          <p class="text-sm text-slate-500 font-medium">
            {{ authStore.user?.email || 'user@example.com' }}
          </p>
          <div class="mt-1">
            <span
              class="inline-block px-3 py-0.5 bg-slate-200/80 text-slate-600 text-xs font-bold rounded-md uppercase tracking-wider"
            >
              {{ authStore.user?.role === 'ROLE_ADMIN' ? 'ADMIN ACCOUNT' : 'CUSTOMER ACCOUNT' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Logout Button: pill style, light gray by default, hover red with smooth animation -->
      <button
        type="button"
        class="px-5 py-2 bg-slate-200/80 text-slate-700 font-semibold text-sm rounded-full transition-all duration-300 ease-in-out hover:bg-accent-red hover:text-white hover:shadow-md hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer self-center"
        data-test="account-logout-btn"
        @click="handleLogout"
      >
        <i class="fa-solid fa-arrow-right-from-bracket text-xs transition-transform duration-300 group-hover:translate-x-0.5"></i>
        <span>Logout</span>
      </button>
    </div>

    <!-- My Digital Keys Heading with yellow underline matching Screenshot 1 & 2 -->
    <div class="mb-8">
      <div class="border-b-2 border-accent-yellow pb-1.5 inline-block mb-6">
        <h2 class="text-2xl font-extrabold text-primary flex items-center gap-2.5">
          <i class="fa-solid fa-key rotate-90 text-primary"></i>
          <span>My Digital Keys</span>
        </h2>
      </div>

      <!-- Orders List matching Screenshot 2 -->
      <div v-if="cartStore.orders.length > 0" class="flex flex-col gap-6">
        <div
          v-for="order in paginatedOrders"
          :key="order.id"
          class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6"
          :data-test="'account-order-' + (order.orderNumber || order.id)"
        >
          <!-- Order Header: Order #... (blue, left) and Date (right with calendar icon) -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-blue-600">
              Order #{{ order.orderNumber || order.id }}
            </h3>
            <span class="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <i class="fa-regular fa-calendar"></i>
              {{ order.date }}
            </span>
          </div>

          <!-- Order Items Inner Container -->
          <div class="flex flex-col gap-3">
            <div
              v-for="(item, idx) in order.items"
              :key="idx"
              class="bg-slate-50/80 rounded-xl p-4 flex items-center gap-5 border border-slate-100"
            >
              <img
                :src="item.coverImage"
                :alt="item.gameName"
                class="w-14 h-20 rounded-lg object-cover bg-slate-200 flex-shrink-0 shadow-sm"
              />
              <div class="flex-1">
                <h4 class="text-sm font-bold text-slate-800 mb-2">
                  {{ item.gameName }}
                </h4>
                <div
                  class="bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs sm:text-sm font-mono font-bold text-slate-700 tracking-wider inline-block shadow-inner"
                >
                  {{ item.key }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination matching 15 per page -->
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          data-test="account-orders-pagination"
          @page-change="onPageChange"
        />
      </div>

      <!-- Empty State matching Screenshot 1: box icon, No purchases yet!, Browse Games button -->
      <div
        v-else
        class="py-16 text-center bg-white rounded-2xl border border-slate-200/80 shadow-sm"
      >
        <div class="flex justify-center mb-3">
          <i class="fa-solid fa-box-open text-4xl text-slate-600"></i>
        </div>
        <h3 class="text-xl font-bold text-slate-800 mb-2">No purchases yet!</h3>
        <p class="text-slate-500 text-sm max-w-md mx-auto mb-6">
          When you buy games, your digital activation keys will live here permanently.
        </p>
        <router-link
          to="/"
          class="inline-block px-6 py-2 bg-white border border-primary text-primary hover:bg-primary/5 text-sm font-bold rounded-lg transition-colors cursor-pointer"
        >
          Browse Games
        </router-link>
      </div>
    </div>
  </main>
</template>
