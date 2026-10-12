<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()

const orderId = computed(() => {
  return cartStore.latestOrder?.id || 'ORD-8I5A2T'
})
</script>

<template>
  <main class="max-w-2xl mx-auto px-6 py-12 min-h-[calc(100vh-8rem)] flex items-center justify-center">
    <!-- Payment Success Card matching Screenshot 5 -->
    <div
      class="w-full bg-white rounded-3xl border border-slate-200/80 shadow-md p-8 sm:p-12 text-center"
    >
      <!-- Checkmark Icon Circle -->
      <div
        class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-secondary text-white flex items-center justify-center mx-auto mb-6 shadow-md"
      >
        <i class="fa-solid fa-check text-2xl sm:text-3xl"></i>
      </div>

      <!-- Title & Message -->
      <h1 class="text-2xl sm:text-3xl font-extrabold text-primary mb-3">
        Payment Successful!
      </h1>
      <p class="text-sm text-slate-500 leading-relaxed max-w-md mx-auto mb-8">
        Thank you for your purchase. Your payment has been processed securely, and your game keys are ready to be claimed.
      </p>

      <!-- Order Number Box with dashed border -->
      <div
        class="border-2 border-dashed border-slate-200 rounded-2xl py-5 px-6 mb-8 bg-slate-50/50 max-w-md mx-auto"
      >
        <span class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
          YOUR ORDER NUMBER
        </span>
        <span class="text-xl sm:text-2xl font-extrabold text-primary tracking-wider">
          {{ orderId }}
        </span>
      </div>

      <!-- Action Buttons Row matching Screenshot 5 -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <router-link
          to="/"
          class="w-full sm:w-auto px-7 py-3 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-full shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <i class="fa-solid fa-link text-xs"></i>
          <span>Keep Shopping</span>
        </router-link>

        <router-link
          to="/my-keys"
          class="w-full sm:w-auto px-7 py-3 bg-white border border-primary text-primary hover:bg-primary/5 font-bold text-sm rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <i class="fa-solid fa-key rotate-90 text-xs"></i>
          <span>View My Keys</span>
        </router-link>
      </div>
    </div>
  </main>
</template>
