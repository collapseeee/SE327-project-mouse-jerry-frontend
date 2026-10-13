<script lang="ts">
export default {
  name: 'AdminSaleHistoryView'
}
</script>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Pagination from '@/components/Pagination.vue'
import {
  fetchAdminSaleHistory,
  formatSaleDateParts,
  formatSaleOrderId,
  aggregateSaleItems
} from '@/services/adminSaleApi'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import type { OrderDTO } from '@/types/order'

const authStore = useAuthStore()
const toastStore = useToastStore()

const sales = ref<OrderDTO[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const currentPage = ref(1)
const pageSize = ref(15)

const totalPages = computed(() => Math.max(1, Math.ceil(sales.value.length / pageSize.value)))

const paginatedSales = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return sales.value.slice(start, start + pageSize.value)
})

const onPageChange = (page: number): void => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const loadSales = async (): Promise<void> => {
  if (!authStore.token) {
    return
  }
  isLoading.value = true
  errorMessage.value = null
  try {
    sales.value = await fetchAdminSaleHistory(authStore.token)
    currentPage.value = 1
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to load sale history'
    errorMessage.value = msg
    toastStore.showError(msg)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadSales()
})
</script>

<template>
  <div class="min-h-screen py-10 px-4 sm:px-6 lg:px-8 relative">
    <div class="max-w-6xl mx-auto">
      <!-- Page Title matching Screenshot -->
      <h1 class="text-2xl sm:text-3xl font-black text-[#2e0474] tracking-wide uppercase mb-6">
        SALE HISTORY
      </h1>

      <!-- Main Table Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Error Alert -->
        <div
          v-if="errorMessage"
          class="p-4 bg-red-50 text-red-700 text-sm border-b border-red-100 flex items-center justify-between"
        >
          <span>{{ errorMessage }}</span>
          <button
            type="button"
            class="underline font-medium hover:text-red-900 cursor-pointer"
            @click="loadSales"
          >
            Retry
          </button>
        </div>

        <!-- Loading Spinner -->
        <div v-if="isLoading" class="py-20 text-center text-slate-500">
          <i class="fa-solid fa-spinner fa-spin text-3xl text-primary mb-3"></i>
          <p class="text-sm">Loading sale history...</p>
        </div>

        <!-- Sale History Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse" data-test="sale-history-table">
            <thead>
              <tr class="border-b border-gray-100 text-xs font-black text-[#360185] tracking-wider uppercase">
                <th class="py-4 px-6">DATE</th>
                <th class="py-4 px-6">CUSTOMER</th>
                <th class="py-4 px-6">ITEMS PURCHASED</th>
                <th class="py-4 px-6 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-sm">
              <tr
                v-for="sale in paginatedSales"
                :key="sale.orderNumber || sale.id"
                class="hover:bg-slate-50/60 transition-colors"
                :data-test="`sale-row-${sale.orderNumber || sale.id}`"
              >
                <!-- Date column matching Screenshot -->
                <td class="py-4 px-6 text-xs text-slate-700 leading-tight">
                  <div class="font-medium">
                    {{ formatSaleDateParts(sale.purchaseDate).date }}
                  </div>
                  <div class="font-medium">
                    {{ formatSaleDateParts(sale.purchaseDate).yearWithComma }}
                  </div>
                  <div class="text-slate-500">
                    {{ formatSaleDateParts(sale.purchaseDate).time }}
                  </div>
                </td>

                <!-- Customer column matching Screenshot -->
                <td class="py-4 px-6">
                  <div class="text-sm font-bold text-slate-800">
                    {{ sale.username || 'customer' }}
                  </div>
                  <div class="text-xs text-slate-400">
                    {{ formatSaleOrderId(sale.orderNumber, sale.id) }}
                  </div>
                </td>

                <!-- Items Purchased column matching Screenshot -->
                <td class="py-4 px-6">
                  <div
                    v-if="aggregateSaleItems(sale.items).length > 0"
                    class="space-y-1"
                  >
                    <div
                      v-for="item in aggregateSaleItems(sale.items)"
                      :key="item.title"
                      class="text-sm"
                    >
                      <span class="text-slate-800 font-medium">{{ item.title }}</span>
                      <span class="text-amber-500 font-semibold ml-1.5">(x{{ item.quantity }})</span>
                    </div>
                  </div>
                  <span v-else class="text-slate-400 italic text-sm">No items</span>
                </td>

                <!-- Status column matching Screenshot -->
                <td class="py-4 px-6 text-center">
                  <span class="inline-block bg-[#16a34a] text-white text-xs font-semibold px-3 py-1 rounded-md">
                    Completed
                  </span>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-if="sales.length === 0">
                <td colspan="4" class="py-12 text-center text-slate-400 italic">
                  No sale history found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination matching 15 per page -->
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        data-test="sale-history-pagination"
        @page-change="onPageChange"
      />
    </div>
  </div>
</template>
