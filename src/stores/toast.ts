import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Toast, ToastType } from '@/types/toast'

const DEFAULT_TOAST_DURATION = 3500

const generateToastId = (): string =>
  `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])

  const removeToast = (id: string): void => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  const showToast = (
    toastInput: Omit<Toast, 'id'> | string,
    toastType: ToastType = 'info',
    toastDuration = DEFAULT_TOAST_DURATION
  ): string => {
    const id = generateToastId()
    const newToast: Toast =
      typeof toastInput === 'string'
        ? { id, message: toastInput, type: toastType, duration: toastDuration }
        : { id, duration: toastDuration, ...toastInput }

    toasts.value.push(newToast)

    const duration = newToast.duration ?? DEFAULT_TOAST_DURATION
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  const showSuccess = (message: string, gameTitle?: string, duration?: number): string =>
    showToast({ message, gameTitle, type: 'success' }, 'success', duration)

  const showCartSuccess = (gameTitle: string, duration?: number): string =>
    showSuccess(`Added "${gameTitle}" to your cart!`, gameTitle, duration)

  const showError = (message: string, duration?: number): string =>
    showToast({ message, type: 'error' }, 'error', duration)

  const showInfo = (message: string, duration?: number): string =>
    showToast({ message, type: 'info' }, 'info', duration)

  const clearToasts = (): void => {
    toasts.value = []
  }

  return {
    toasts,
    showToast,
    showSuccess,
    showCartSuccess,
    showError,
    showInfo,
    removeToast,
    clearToasts
  }
})
