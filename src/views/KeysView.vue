<script lang="ts">
export default {
  name: 'KeysView'
}
</script>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCartStore, type OrderKeyItem } from '@/stores/cart'

const cartStore = useCartStore()
const copiedIndex = ref<number | null>(null)

// Collect all keys: first check latestOrder, if none show all keys from all orders
const displayedKeys = computed<OrderKeyItem[]>(() => {
  if (cartStore.latestOrder?.items && cartStore.latestOrder.items.length > 0) {
    return cartStore.latestOrder.items
  }
  const all: OrderKeyItem[] = []
  for (const order of cartStore.orders) {
    all.push(...order.items)
  }
  return all
})

const copyKey = async (keyText: string, index: number): Promise<void> => {
  try {
    await navigator.clipboard.writeText(keyText)
    copiedIndex.value = index
    setTimeout(() => {
      if (copiedIndex.value === index) {
        copiedIndex.value = null
      }
    }, 2000)
  } catch {
    // Fallback if clipboard API is unavailable
    copiedIndex.value = index
    setTimeout(() => {
      copiedIndex.value = null
    }, 2000)
  }
}

onMounted(async () => {
  if (cartStore.orders.length === 0) {
    await cartStore.loadOrders()
  }
})
</script>

<template>
  <main class="max-w-4xl mx-auto px-6 py-8 min-h-[calc(100vh-8rem)]">
    <!-- Title matching Screenshot 4 -->
    <h1 class="text-2xl sm:text-3xl font-extrabold text-primary flex items-center gap-2.5 mb-8">
      <i class="fa-solid fa-key rotate-90 text-primary"></i>
      <span>Your Game Keys</span>
    </h1>

    <div v-if="displayedKeys.length > 0" class="flex flex-col gap-5 mb-10">
      <!-- Game Key Cards matching Screenshot 4 -->
      <div
        v-for="(item, idx) in displayedKeys"
        :key="idx"
        class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6"
      >
        <img
          :src="item.coverImage"
          :alt="item.gameName"
          class="w-20 h-28 rounded-xl object-cover bg-slate-100 shadow-sm flex-shrink-0"
        />

        <div class="flex-1 w-full">
          <h2 class="text-base sm:text-lg font-bold text-primary mb-3">
            {{ item.gameName }}
          </h2>

          <!-- Terminal-style Dark Key Box matching Screenshot 4 -->
          <div
            class="bg-slate-900 rounded-xl px-4 py-3 flex items-center justify-between gap-4 font-mono shadow-inner w-full"
          >
            <span class="text-accent-green font-bold text-sm sm:text-base tracking-wider select-all truncate">
              {{ item.key }}
            </span>

            <button
              type="button"
              class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
              @click="copyKey(item.key, idx)"
            >
              <i
                :class="copiedIndex === idx ? 'fa-solid fa-check text-accent-green' : 'fa-regular fa-copy'"
              ></i>
              <span>{{ copiedIndex === idx ? 'Copied!' : 'Copy' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm mb-10"
    >
      <i class="fa-solid fa-key text-5xl text-slate-300 mb-4 block"></i>
      <h2 class="text-xl font-bold text-slate-700 mb-2">No keys to display</h2>
      <p class="text-slate-500 text-sm max-w-md mx-auto mb-6">
        You don't have any claimed digital game keys yet.
      </p>
    </div>

    <!-- Back to Store Button centered matching Screenshot 4 -->
    <div class="flex justify-center">
      <router-link
        to="/"
        class="px-8 py-2.5 bg-white border border-primary text-primary hover:bg-primary/5 text-sm font-bold rounded-xl transition-colors inline-flex items-center justify-center cursor-pointer shadow-sm"
      >
        Back to Store
      </router-link>
    </div>
  </main>
</template>

