<script setup lang="ts">
import type { Game } from '@/types/game'

defineProps<{
  game: Game
}>()

const emit = defineEmits<{
  'add-to-cart': [game: Game]
}>()
</script>

<template>
  <div
    class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
  >
    <!-- Game Cover Image -->
    <router-link
      :to="`/product/${game.id}`"
      class="aspect-[3/4] w-full overflow-hidden bg-slate-100 block group"
    >
      <img
        :src="game.coverImage"
        :alt="game.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
    </router-link>

    <!-- Card Details -->
    <div class="p-3.5 flex flex-col flex-1">
      <router-link
        :to="`/product/${game.id}`"
        class="font-bold text-slate-800 text-sm truncate mb-1 hover:text-primary transition-colors block"
        :title="game.name"
      >
        {{ game.name }}
      </router-link>
      <p class="text-accent-red font-semibold text-sm mb-3">
        {{ game.price }} Baht
      </p>

      <div class="mt-auto flex items-center gap-2">
        <router-link
          :to="`/product/${game.id}`"
          class="flex-1 py-1.5 px-3 text-xs font-semibold text-primary border border-primary/40 hover:bg-primary hover:text-white rounded-md transition-colors text-center"
        >
          View
        </router-link>
        <button
          type="button"
          class="p-1.5 px-2.5 bg-accent-orange hover:bg-accent-orange-hover text-white rounded-md transition-colors shadow-sm cursor-pointer"
          title="Add to Cart"
          @click="emit('add-to-cart', game)"
        >
          <i class="fa-solid fa-cart-shopping text-xs"></i>
        </button>
      </div>
    </div>
  </div>
</template>
