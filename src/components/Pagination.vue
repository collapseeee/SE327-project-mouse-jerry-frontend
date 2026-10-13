<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    currentPage?: number
    totalPages?: number
  }>(),
  {
    currentPage: 1,
    totalPages: 1
  }
)

const emit = defineEmits<{
  'update:currentPage': [page: number]
  'page-change': [page: number]
}>()

const setPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('update:currentPage', page)
    emit('page-change', page)
  }
}

// Generate all page numbers matching baseline UI design
const visiblePages = computed<number[]>(() => {
  return Array.from({ length: props.totalPages }, (_, i) => i + 1)
})
</script>

<template>
  <nav
    v-if="totalPages > 1"
    class="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 py-6 text-sm font-semibold select-none"
    aria-label="Pagination"
  >
    <!-- Previous button matching baseline '<' / '&laquo;' -->
    <button
      type="button"
      :disabled="currentPage <= 1"
      aria-label="Previous page"
      class="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 rounded-md transition-colors cursor-pointer text-xs sm:text-sm font-bold"
      @click="setPage(currentPage - 1)"
    >
      <i class="fa-solid fa-chevron-left text-[10px] sm:text-xs"></i>
    </button>

    <!-- Page numbers: all pages visible with responsive sizing -->
    <button
      v-for="page in visiblePages"
      :key="page"
      type="button"
      :aria-current="page === currentPage ? 'page' : undefined"
      :class="[
        'min-w-7 h-7 sm:min-w-8 sm:h-8 px-1.5 sm:px-2 rounded-lg flex items-center justify-center transition-all cursor-pointer text-xs sm:text-sm font-semibold',
        page === currentPage
          ? 'bg-secondary text-white shadow-sm font-bold'
          : 'text-primary hover:bg-slate-100 hover:text-secondary'
      ]"
      @click="setPage(page)"
    >
      {{ page }}
    </button>

    <!-- Next button matching baseline '>' / '&raquo;' -->
    <button
      type="button"
      :disabled="currentPage >= totalPages"
      aria-label="Next page"
      class="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 rounded-md transition-colors cursor-pointer text-xs sm:text-sm font-bold"
      @click="setPage(currentPage + 1)"
    >
      <i class="fa-solid fa-chevron-right text-[10px] sm:text-xs"></i>
    </button>
  </nav>
</template>
