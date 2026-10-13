<script lang="ts">
export default {
  name: 'ToastContainer'
}
</script>

<script setup lang="ts">
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()
</script>

<template>
  <aside
    class="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4 sm:px-0"
    aria-live="polite"
    aria-label="Notifications"
  >
    <TransitionGroup name="toast" tag="div" class="flex flex-col gap-3">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="pointer-events-auto bg-bg-surface text-text-dark border border-gray-200/90 shadow-2xl rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-md"
        role="status"
        :data-test="`toast-${toast.id}`"
      >
        <!-- Icon badge -->
        <div
          v-if="toast.type === 'success'"
          class="w-10 h-10 rounded-xl bg-accent-green/15 text-accent-green flex items-center justify-center shrink-0"
          data-test="toast-icon-success"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div
          v-else-if="toast.type === 'error'"
          class="w-10 h-10 rounded-xl bg-accent-red/15 text-accent-red flex items-center justify-center shrink-0"
          data-test="toast-icon-error"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <div
          v-else
          class="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0"
          data-test="toast-icon-info"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <!-- Text content -->
        <div class="flex-1 min-w-0">
          <p
            v-if="toast.type === 'success'"
            class="text-xs font-bold text-accent-green uppercase tracking-wider"
            data-test="toast-badge-success"
          >
            {{ toast.title || (toast.gameTitle ? 'Added to Cart' : 'Updated Completed') }}
          </p>
          <p
            v-else-if="toast.type === 'error'"
            class="text-xs font-bold text-accent-red uppercase tracking-wider"
            data-test="toast-badge-error"
          >
            {{ toast.title || 'Notification' }}
          </p>
          <p
            v-else
            class="text-xs font-bold text-primary uppercase tracking-wider"
            data-test="toast-badge-info"
          >
            {{ toast.title || 'Notice' }}
          </p>
          <p class="text-sm font-semibold text-text-dark truncate" :title="toast.gameTitle ? `&quot;${toast.gameTitle}&quot;` : toast.message">
            {{ toast.gameTitle ? `"${toast.gameTitle}"` : toast.message }}
          </p>
        </div>

        <!-- Dismiss button -->
        <button
          type="button"
          aria-label="Dismiss notification"
          class="text-text-muted hover:text-text-dark p-1 rounded-lg transition-colors cursor-pointer shrink-0"
          data-test="toast-dismiss-btn"
          @click="toastStore.removeToast(toast.id)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </aside>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
</style>
