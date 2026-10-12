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
import {
  checkoutOrder,
  fetchOrderHistory,
  formatDate,
  mapOrderDtoToOrder
} from '@/services/orderApi'
import type {
  DirectPurchaseGame,
  DirectPurchaseItem,
  Order,
  OrderDTO,
  OrderKeyItem
} from '@/types/order'
import { useAuthStore } from './auth'
import { useToastStore } from './toast'

export type { DirectPurchaseGame, DirectPurchaseItem, Order, OrderKeyItem }

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

const generateRandomKey = (): string => {
  const seg = () => Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${seg()}-${seg()}-${seg()}`
}

const createDirectFallbackOrder = (
  directItem: DirectPurchaseItem,
  orderNumber: string,
  dateStr: string
): Order => ({
  id: orderNumber,
  orderNumber,
  date: dateStr,
  totalAmount: directItem.game.price * directItem.quantity,
  items: [
    {
      gameId: directItem.game.id,
      gameName: directItem.game.name,
      coverImage: directItem.game.coverImage,
      key: generateRandomKey(),
      price: directItem.game.price
    }
  ]
})

const createCartFallbackOrder = (
  cartItemsList: CartItem[],
  orderNumber: string,
  dateStr: string
): Order => ({
  id: orderNumber,
  orderNumber,
  date: dateStr,
  totalAmount: cartItemsList.reduce((sum, item) => sum + item.totalPrice, 0),
  items: cartItemsList.map((item) => ({
    gameId: item.gameId,
    gameName: item.gameTitle,
    coverImage: item.coverImage,
    key: generateRandomKey(),
    price: item.unitPrice
  }))
})

const createLocalFallbackOrder = (
  directItem: DirectPurchaseItem | null,
  cartItemsList: CartItem[]
): Order => {
  const orderNumber = `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  const dateStr = formatDate()
  if (directItem) {
    return createDirectFallbackOrder(directItem, orderNumber, dateStr)
  }
  return createCartFallbackOrder(cartItemsList, orderNumber, dateStr)
}

export const useCartStore = defineStore('cart', () => {
  const authStore = useAuthStore()

  const items = ref<CartItem[]>([])
  const orders = ref<Order[]>([])
  const latestOrder = ref<Order | null>(null)
  const directPurchaseItem = ref<DirectPurchaseItem | null>(null)
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

  const setDirectPurchase = (game: DirectPurchaseGame, quantity = 1): void => {
    directPurchaseItem.value = { game, quantity }
  }

  const clearDirectPurchase = (): void => {
    directPurchaseItem.value = null
  }

  const loadOrders = async (): Promise<void> => {
    if (!authStore.isAuthenticated || !authStore.token) {
      orders.value = []
      return
    }
    try {
      const dtos = await fetchOrderHistory(authStore.token)
      orders.value = dtos.map(mapOrderDtoToOrder)
    } catch {
      // Retain existing orders if fetch fails
    }
  }

  const executeOrderCheckout = async (): Promise<OrderDTO> => {
    if (directPurchaseItem.value && authStore.token) {
      return checkoutOrder(authStore.token, {
        checkoutType: 'single',
        gameId: directPurchaseItem.value.game.id,
        quantity: directPurchaseItem.value.quantity
      })
    }
    if (authStore.token) {
      return checkoutOrder(authStore.token, { checkoutType: 'cart' })
    }
    throw new Error('Not authenticated')
  }

  const confirmPurchase = async (): Promise<Order | null> => {
    try {
      const orderDto = await executeOrderCheckout()
      const createdOrder = mapOrderDtoToOrder(orderDto)
      latestOrder.value = createdOrder
      orders.value.unshift(createdOrder)
      if (!directPurchaseItem.value) {
        items.value = []
      }
      directPurchaseItem.value = null
      return createdOrder
    } catch {
      const fallbackOrder = createLocalFallbackOrder(directPurchaseItem.value, items.value)
      latestOrder.value = fallbackOrder
      orders.value.unshift(fallbackOrder)
      if (!directPurchaseItem.value) {
        items.value = []
      }
      directPurchaseItem.value = null
      return fallbackOrder
    }
  }

  const reset = (): void => {
    items.value = []
    error.value = null
    orders.value = []
    latestOrder.value = null
    directPurchaseItem.value = null
  }

  return {
    items,
    orders,
    latestOrder,
    directPurchaseItem,
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
    setDirectPurchase,
    clearDirectPurchase,
    loadOrders,
    confirmPurchase,
    reset
  }
})
