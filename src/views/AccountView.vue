<script lang="ts">
export default {
  name: 'AccountView'
}
</script>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()

const handleLogout = async (): Promise<void> => {
  await authStore.logout()
  router.push('/login?mode=login')
}

onMounted(async () => {
  await cartStore.loadOrders()
})
</script>

<template>
  <main class="max-w-6xl mx-auto px-6 py-8 min-h-[calc(100vh-8rem)]">
    <!-- Profile Card matching Screenshot 1 -->
    <div
      class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-6 mb-10"
    >
      <div class="flex flex-col sm:flex-row items-center sm:items-center gap-6 text-center sm:text-left">
        <!-- Avatar matching Screenshot 1: rounded square with purple background -->
        <div
          class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0 shadow-inner"
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
              class="inline-block px-3 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded-md uppercase tracking-wider"
            >
              {{ authStore.user?.role === 'ROLE_ADMIN' ? 'ADMIN ACCOUNT' : 'CUSTOMER ACCOUNT' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Logout Button matching Screenshot 1 -->
      <button
        type="button"
        class="px-5 py-2.5 bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-semibold text-sm rounded-xl transition-colors flex items-center gap-2 cursor-pointer self-center sm:self-center"
        @click="handleLogout"
      >
        <i class="fa-solid fa-arrow-right-from-bracket"></i>
        <span>Logout</span>
      </button>
    </div>

    <!-- My Digital Keys Heading matching Screenshot 1 -->
    <div class="mb-8">
      <div class="border-b-2 border-accent-yellow pb-2 inline-block mb-6">
        <h2 class="text-2xl font-extrabold text-primary flex items-center gap-2.5">
          <i class="fa-solid fa-key rotate-90 text-primary"></i>
          <span>My Digital Keys</span>
        </h2>
      </div>

      <!-- Orders List matching Screenshot 1 -->
      <div v-if="cartStore.orders.length > 0" class="flex flex-col gap-6">
        <div
          v-for="order in cartStore.orders"
          :key="order.id"
          class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6"
        >
          <!-- Order Header: Order #... (left) and Date (right) -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-blue-600">
              Order #{{ order.id }}
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
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="py-16 text-center bg-white rounded-2xl border border-slate-100 shadow-sm"
      >
        <i class="fa-solid fa-key text-5xl text-slate-300 mb-4 block"></i>
        <h3 class="text-lg font-bold text-slate-700 mb-2">No purchase history yet</h3>
        <p class="text-slate-500 text-sm max-w-md mx-auto mb-6">
          Start shopping to see your digital game keys here.
        </p>
        <router-link
          to="/"
          class="inline-block px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors"
        >
          Browse Games
        </router-link>
      </div>
    </div>
  </main>
</template>
