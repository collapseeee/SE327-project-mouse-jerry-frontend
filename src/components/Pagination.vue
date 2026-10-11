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

// Generate page items with ellipsis matching screenshot: `< 1 2 ... 6 >`
type PageItem = number | '...'

const visiblePages = computed<PageItem[]>(() => {
  const current = props.currentPage
  const total = props.totalPages

  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: PageItem[] = []

  if (current <= 2) {
    pages.push(1, 2, '...', total)
  } else if (current >= total - 1) {
    pages.push(1, '...', total - 1, total)
  } else {
    pages.push(1, '...', current, '...', total)
  }

  return pages
})
</script>

<template>
  <nav
    v-if="totalPages > 1"
    class="flex items-center justify-center gap-2 py-6 text-sm font-semibold select-none"
    aria-label="Pagination"
  >
    <!-- Previous button -->
    <button
      type="button"
      :disabled="currentPage <= 1"
      aria-label="Previous page"
      class="w-8 h-8 flex items-center justify-center text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
      @click="setPage(currentPage - 1)"
    >
      <i class="fa-solid fa-chevron-left text-xs"></i>
    </button>

    <!-- Page numbers -->
    <template v-for="(item, index) in visiblePages" :key="index">
      <span
        v-if="item === '...'"
        class="w-6 text-center text-primary/60 font-bold"
        aria-hidden="true"
      >
        ...
      </span>
      <button
        v-else
        type="button"
        :aria-current="item === currentPage ? 'page' : undefined"
        :class="[
          'w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer text-sm font-semibold',
          item === currentPage
            ? 'bg-secondary text-white shadow-sm'
            : 'text-primary hover:bg-slate-100'
        ]"
        @click="setPage(item)"
      >
        {{ item }}
      </button>
    </template>

    <!-- Next button -->
    <button
      type="button"
      :disabled="currentPage >= totalPages"
      aria-label="Next page"
      class="w-8 h-8 flex items-center justify-center text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
      @click="setPage(currentPage + 1)"
    >
      <i class="fa-solid fa-chevron-right text-xs"></i>
    </button>
  </nav>
</template>
