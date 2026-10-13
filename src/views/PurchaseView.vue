<script lang="ts">
export default {
  name: 'PurchaseView'
}
</script>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'

interface PurchaseDisplayItem {
  game: {
    id: string
    name: string
    price: number
    coverImage: string
  }
  quantity: number
}

const cartStore = useCartStore()
const router = useRouter()
const isProcessing = ref(false)

// Determine items to display: If directPurchaseItem is set, ONLY show that item.
// Otherwise, show normalized items from cartStore.items.
const purchaseItems = computed<PurchaseDisplayItem[]>(() => {
  if (cartStore.directPurchaseItem) {
    return [cartStore.directPurchaseItem]
  }
  return cartStore.items.map((item) => ({
    game: {
      id: item.gameId,
      name: item.gameTitle,
      price: item.unitPrice,
      coverImage: item.coverImage
    },
    quantity: item.quantity
  }))
})

const totalAmount = computed<number>(() => {
  return purchaseItems.value.reduce(
    (sum: number, item: PurchaseDisplayItem) => sum + item.game.price * item.quantity,
    0
  )
})

const totalItemCount = computed<number>(() => {
  return purchaseItems.value.reduce(
    (sum: number, item: PurchaseDisplayItem) => sum + item.quantity,
    0
  )
})

const handleConfirm = async (): Promise<void> => {
  if (purchaseItems.value.length === 0 || isProcessing.value) {
    return
  }
  isProcessing.value = true
  try {
    const order = await cartStore.confirmPurchase()
    if (order) {
      router.push('/success')
    }
  } finally {
    isProcessing.value = false
  }
}

onMounted(async () => {
  if (!cartStore.directPurchaseItem && cartStore.items.length === 0) {
    await cartStore.loadCart()
  }
})
</script>

<template>
  <main class="max-w-4xl mx-auto px-6 py-8 min-h-[calc(100vh-8rem)] relative">
    <!-- Title matching Screenshot 3 -->
    <h1 class="text-2xl sm:text-3xl font-extrabold text-primary flex items-center gap-2.5 mb-8">
      <i class="fa-solid fa-money-check-dollar"></i>
      <span>Complete Your Purchase</span>
    </h1>

    <div v-if="purchaseItems.length > 0" class="flex flex-col gap-6">
      <!-- Items Card(s) matching Screenshot 3 -->
      <div
        v-for="item in purchaseItems"
        :key="item.game.id"
        class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center justify-between gap-6"
      >
        <div class="flex items-center gap-5">
          <img
            :src="item.game.coverImage"
            :alt="item.game.name"
            class="w-20 h-28 sm:w-24 sm:h-32 rounded-xl object-cover bg-slate-100 shadow-sm flex-shrink-0"
          />
          <div class="flex flex-col gap-2">
            <h2 class="text-base sm:text-lg font-bold text-primary">
              {{ item.game.name }}
            </h2>
            <p class="text-sm text-slate-600 font-medium">
              Amount: {{ item.quantity }}
            </p>
          </div>
        </div>

        <div class="text-right flex-shrink-0">
          <p class="text-base sm:text-lg font-extrabold text-accent-red">
            {{ item.game.price * item.quantity }} Baht
          </p>
        </div>
      </div>

      <!-- Summary Section matching Screenshot 3 -->
      <div class="pt-6 flex flex-col gap-4">
        <div class="flex items-center justify-between text-base font-bold text-slate-700">
          <span>TOTAL AMOUNT</span>
          <span class="text-xl font-extrabold text-slate-900">
            {{ totalAmount.toLocaleString() }} Baht
          </span>
        </div>

        <div class="flex items-center justify-between text-base font-bold text-slate-700">
          <span>ITEM COUNT</span>
          <span class="text-lg font-bold text-slate-900">
            {{ totalItemCount }} Item(s)
          </span>
        </div>

        <!-- Confirm Button matching Screenshot 3: slate/gray button aligned right -->
        <div class="flex justify-end pt-4">
          <button
            type="button"
            class="px-10 py-3 bg-slate-500 hover:bg-slate-600 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            :disabled="isProcessing"
            data-test="confirm-purchase-btn"
            @click="handleConfirm"
          >
            <i v-if="isProcessing" class="fa-solid fa-circle-notch fa-spin"></i>
            <span>{{ isProcessing ? 'Processing...' : 'Confirm' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm"
    >
      <i class="fa-solid fa-receipt text-5xl text-slate-300 mb-4 block"></i>
      <h2 class="text-xl font-bold text-slate-700 mb-2">No items to purchase</h2>
      <p class="text-slate-500 text-sm max-w-md mx-auto mb-6">
        There are currently no items queued for checkout.
      </p>
      <router-link
        to="/"
        class="inline-block px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors"
      >
        Back to Store
      </router-link>
    </div>

    <!-- Processing Popup Modal -->
    <div
      v-if="isProcessing"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in"
      data-test="processing-popup"
      role="dialog"
      aria-modal="true"
      aria-label="Processing your order"
    >
      <div
        class="bg-white rounded-3xl border border-slate-100 shadow-2xl p-8 sm:p-10 max-w-md w-full text-center flex flex-col items-center gap-5 transform transition-all"
      >
        <div
          class="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner"
        >
          <i class="fa-solid fa-circle-notch fa-spin text-4xl text-primary"></i>
        </div>

        <div class="flex flex-col gap-2">
          <h3 class="text-2xl font-extrabold text-primary tracking-tight">
            Processing Order
          </h3>
          <p class="text-sm text-slate-500 font-medium leading-relaxed">
            Please wait while we secure your payment and claim your digital keys. Do not close or refresh this page.
          </p>
        </div>

        <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-2">
          <div class="bg-gradient-to-r from-primary to-secondary h-full rounded-full animate-pulse w-full"></div>
        </div>
      </div>
    </div>
  </main>
</template>

