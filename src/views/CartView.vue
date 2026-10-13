<script lang="ts">
export default {
  name: 'CartView'
}
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import type { CartItem } from '@/types/cart'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const isUpdating = ref(false)

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-US').format(amount)

const handleCheckAuth = (): boolean => {
  if (!authStore.isAuthenticated) {
    router.push({
      path: '/login',
      query: { mode: 'login', redirect: '/cart' }
    })
    return false
  }
  return true
}

const handleDecrement = async (item: CartItem): Promise<void> => {
  if (item.quantity <= 1 || isUpdating.value) {
    return
  }
  isUpdating.value = true
  try {
    await cartStore.updateQuantity(item.gameId, item.quantity - 1)
  } finally {
    isUpdating.value = false
  }
}

const handleIncrement = async (item: CartItem): Promise<void> => {
  if (isUpdating.value) {
    return
  }
  if (item.stock > 0 && item.quantity >= item.stock) {
    return
  }
  isUpdating.value = true
  try {
    await cartStore.updateQuantity(item.gameId, item.quantity + 1)
  } finally {
    isUpdating.value = false
  }
}

const handleRemove = async (gameId: string): Promise<void> => {
  if (isUpdating.value) {
    return
  }
  isUpdating.value = true
  try {
    await cartStore.removeItem(gameId)
  } finally {
    isUpdating.value = false
  }
}

const handleCheckout = (): void => {
  if (cartStore.items.length === 0) {
    return
  }
  cartStore.clearDirectPurchase()
  router.push('/purchase-page')
}

onMounted(async () => {
  if (handleCheckAuth()) {
    await cartStore.loadCart()
  }
})
</script>

<template>
  <main class="max-w-7xl mx-auto px-6 py-8 min-h-[calc(100vh-8rem)]">
    <!-- Header: Shopping Cart Icon + Your Cart Title -->
    <div class="flex items-center gap-3 mb-8" data-test="cart-header">
      <i class="fa-solid fa-cart-shopping text-3xl text-primary"></i>
      <h1 class="text-3xl font-extrabold text-primary tracking-tight">
        Your Cart
      </h1>
    </div>

    <!-- Loading State -->
    <div
      v-if="cartStore.isLoading && cartStore.items.length === 0"
      class="py-24 text-center bg-white rounded-2xl border border-slate-100 shadow-sm"
      data-test="cart-loading-state"
    >
      <i class="fa-solid fa-circle-notch fa-spin text-4xl text-primary mb-4 block"></i>
      <p class="text-slate-500 font-medium text-sm">Loading your cart...</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="cartStore.items.length === 0"
      class="py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm max-w-xl mx-auto p-8"
      data-test="cart-empty-state"
    >
      <i class="fa-solid fa-basket-shopping text-5xl text-slate-300 mb-4 block"></i>
      <h2 class="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
      <p class="text-slate-500 text-sm max-w-md mx-auto mb-6">
        Looks like you haven't added any games to your cart yet. Explore our catalog to find your next adventure!
      </p>
      <router-link
        to="/"
        class="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl shadow-md transition-all cursor-pointer"
        data-test="explore-games-btn"
      >
        <i class="fa-solid fa-gamepad"></i>
        <span>Explore Games</span>
      </router-link>
    </div>

    <!-- Populated Cart: 2-Column Grid matching reference image -->
    <div
      v-else
      class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
      data-test="cart-content-grid"
    >
      <!-- Left Column: Cart Items List -->
      <section class="lg:col-span-2 space-y-4" data-test="cart-items-list">
        <article
          v-for="item in cartStore.items"
          :key="item.id"
          class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col sm:flex-row gap-5 items-stretch sm:items-center border-l-4 border-l-transparent hover:border-l-primary hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          :data-test="`cart-item-${item.gameId}`"
        >
          <!-- Game Cover Thumbnail -->
          <router-link
            :to="`/product/${item.gameId}`"
            class="w-24 h-32 sm:w-28 sm:h-36 rounded-xl overflow-hidden shrink-0 bg-slate-100 block group"
          >
            <img
              v-if="item.coverImage"
              :src="item.coverImage"
              :alt="item.gameTitle"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100"
            >
              <i class="fa-solid fa-gamepad text-3xl"></i>
            </div>
          </router-link>

          <!-- Middle & Bottom Item Details -->
          <div class="flex-1 min-w-0 flex flex-col justify-between self-stretch">
            <div>
              <router-link
                :to="`/product/${item.gameId}`"
                class="block font-bold text-lg text-primary hover:text-primary-hover transition-colors truncate mb-2"
                :title="item.gameTitle"
                data-test="cart-item-title"
              >
                {{ item.gameTitle }}
              </router-link>

              <!-- Horizontal Thin Divider -->
              <div class="border-b border-slate-100 mb-2.5"></div>

              <!-- Category Tag matching reference: 🏷️ Category -->
              <div class="flex items-center gap-1.5 text-xs text-text-muted mb-4">
                <i class="fa-solid fa-tag text-[11px] text-slate-400"></i>
                <span class="font-medium text-slate-500">
                  {{ item.category || 'General' }}
                </span>
              </div>
            </div>

            <!-- Bottom Row: Price on Left, Stepper & Trash on Right -->
            <div class="flex items-center justify-between gap-4 mt-auto">
              <div
                class="text-lg sm:text-xl font-bold text-accent-red"
                data-test="cart-item-price"
              >
                {{ item.totalPrice }} Baht
              </div>

              <div class="flex items-center gap-3">
                <!-- Stepper Pill: [ - ] [ 1 ] [ + ] -->
                <div class="flex items-center bg-slate-100/90 rounded-xl px-2.5 py-1 gap-3 border border-slate-200/60">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    class="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-primary transition-colors cursor-pointer disabled:opacity-40"
                    :disabled="item.quantity <= 1 || isUpdating"
                    data-test="decrease-qty-btn"
                    @click="handleDecrement(item)"
                  >
                    <i class="fa-solid fa-minus text-xs"></i>
                  </button>
                  <span
                    class="w-6 text-center font-bold text-sm text-slate-800"
                    data-test="cart-item-qty"
                  >
                    {{ item.quantity }}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    class="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-primary transition-colors cursor-pointer disabled:opacity-40"
                    :disabled="(item.stock > 0 && item.quantity >= item.stock) || isUpdating"
                    data-test="increase-qty-btn"
                    @click="handleIncrement(item)"
                  >
                    <i class="fa-solid fa-plus text-xs"></i>
                  </button>
                </div>

                <!-- Trash Can Button -->
                <button
                  type="button"
                  aria-label="Remove item"
                  class="text-slate-300 hover:text-accent-red transition-colors p-2 cursor-pointer"
                  :disabled="isUpdating"
                  data-test="remove-item-btn"
                  @click="handleRemove(item.gameId)"
                >
                  <i class="fa-solid fa-trash-can text-lg"></i>
                </button>
              </div>
            </div>
          </div>
        </article>
      </section>

      <!-- Right Column: Order Summary Card -->
      <aside
        class="w-full lg:sticky lg:top-24 bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
        data-test="order-summary-card"
      >
        <h2 class="text-xl font-bold text-primary mb-6">
          Order Summary
        </h2>

        <div class="flex items-center justify-between text-slate-500 font-medium mb-4 text-sm sm:text-base">
          <span>Total Items</span>
          <span
            class="text-slate-800 font-bold text-lg"
            data-test="summary-total-items"
          >
            {{ cartStore.totalItems }}
          </span>
        </div>

        <!-- Dashed Divider Line matching reference image -->
        <div class="border-b border-dashed border-slate-200 my-4"></div>

        <div class="flex items-center justify-between mb-6">
          <span class="font-extrabold text-slate-900 text-lg">
            Total
          </span>
          <span
            class="font-extrabold text-slate-900 text-xl"
            data-test="summary-total-amount"
          >
            {{ formatCurrency(cartStore.totalPrice) }} Baht
          </span>
        </div>

        <!-- Checkout Button with Gradient & Padlock Icon -->
        <button
          type="button"
          class="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm tracking-wider uppercase bg-gradient-to-r from-secondary to-primary hover:opacity-95 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          :disabled="cartStore.items.length === 0"
          data-test="checkout-btn"
          @click="handleCheckout"
        >
          <i class="fa-solid fa-lock text-sm"></i>
          <span>CHECKOUT</span>
        </button>
      </aside>
    </div>
  </main>
</template>
