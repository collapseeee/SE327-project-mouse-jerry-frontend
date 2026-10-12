import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItem } from '@/types/cart'
import {
  fetchCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart
} from '@/services/cartApi'
import { fetchGameById } from '@/services/gameApi'
import { useAuthStore } from './auth'
import { useToastStore } from './toast'

const notifyCartItemAdded = (gameTitle?: string): void => {
  const toastStore = useToastStore()
  if (gameTitle) {
    toastStore.showCartSuccess(gameTitle)
    return
  }
  toastStore.showSuccess('Item added to cart!')
}

const isAuthMissing = (isAuthenticated: boolean, token: string | null): boolean =>
  !isAuthenticated || !token

const findCartItemTitle = (cartItems: CartItem[], targetGameId: string): string | undefined => {
  const matched = cartItems.find((it) => it.gameId === targetGameId)
  return matched ? matched.gameTitle : undefined
}

const categoryCache = new Map<string, string>()

const resolveGameCategory = async (gameId: string): Promise<string> => {
  if (categoryCache.has(gameId)) {
    return categoryCache.get(gameId) ?? 'General'
  }
  try {
    const game = await fetchGameById(gameId)
    const categoryName = game?.category || 'General'
    categoryCache.set(gameId, categoryName)
    return categoryName
  } catch {
    return 'General'
  }
}

const enrichItemsWithCategory = (cartItems: CartItem[]): Promise<CartItem[]> =>
  Promise.all(
    cartItems.map(async (item) => {
      if (item.category) {
        return item
      }
      const category = await resolveGameCategory(item.gameId)
      return { ...item, category }
    })
  )

const isInvalidQuantity = (token: string | null, quantity: number): boolean =>
  !token || quantity < 1

const exceedsStock = (item: CartItem | undefined, quantity: number): boolean => {
  if (!item) {
    return false
  }
  return item.stock > 0 && quantity > item.stock
}

export const useCartStore = defineStore('cart', () => {
  const authStore = useAuthStore()

  const items = ref<CartItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const totalItems = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.totalPrice, 0)
  )

  const hasItems = computed(() => items.value.length > 0)

  const loadCart = async (): Promise<void> => {
    if (!authStore.isAuthenticated || !authStore.token) {
      items.value = []
      return
    }

    isLoading.value = true
    error.value = null
    try {
      const cartDto = await fetchCart(authStore.token)
      items.value = await enrichItemsWithCategory(cartDto.items)
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to load cart'
    } finally {
      isLoading.value = false
    }
  }

  const addItem = async (
    gameId: string,
    quantity = 1,
    gameTitle?: string
  ): Promise<boolean> => {
    if (isAuthMissing(authStore.isAuthenticated, authStore.token)) {
      error.value = 'User must be authenticated to add to cart'
      return false
    }

    isLoading.value = true
    error.value = null
    try {
      const cartDto = await addToCart(authStore.token as string, { gameId, quantity })
      items.value = await enrichItemsWithCategory(cartDto.items)
      const resolvedTitle = gameTitle ?? findCartItemTitle(items.value, gameId)
      notifyCartItemAdded(resolvedTitle)
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to add item'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const updateQuantity = async (gameId: string, newQuantity: number): Promise<boolean> => {
    if (isInvalidQuantity(authStore.token, newQuantity)) {
      return false
    }

    const targetItem = items.value.find((it) => it.gameId === gameId)
    if (exceedsStock(targetItem, newQuantity)) {
      return false
    }

    try {
      const cartDto = await updateCartItemQuantity(authStore.token as string, gameId, newQuantity)
      items.value = await enrichItemsWithCategory(cartDto.items)
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to update quantity'
      return false
    }
  }

  const removeItem = async (gameId: string): Promise<boolean> => {
    if (!authStore.token) {
      return false
    }

    try {
      const cartDto = await removeCartItem(authStore.token, gameId)
      items.value = await enrichItemsWithCategory(cartDto.items)
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to remove item'
      return false
    }
  }

  const clear = async (): Promise<boolean> => {
    if (!authStore.token) {
      items.value = []
      return true
    }

    try {
      await clearCart(authStore.token)
      items.value = []
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to clear cart'
      return false
    }
  }

  const reset = (): void => {
    items.value = []
    error.value = null
  }

  return {
    items,
    isLoading,
    error,
    totalItems,
    totalPrice,
    hasItems,
    loadCart,
    addItem,
    updateQuantity,
    removeItem,
    clear,
    reset
  }
})
