import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '../cart'
import { useAuthStore } from '../auth'
import { useToastStore } from '../toast'
import {
  fetchCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart
} from '@/services/cartApi'
import { fetchGameById } from '@/services/gameApi'
import type { CartDTO, CartItem } from '@/types/cart'

vi.mock('@/services/cartApi')
vi.mock('@/services/gameApi')

describe('useCartStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  const sampleCartItem: CartItem = {
    id: 1,
    gameId: 'vs-1',
    gameTitle: 'Vampire Survivors',
    coverImage: 'vs.jpg',
    unitPrice: 1788,
    quantity: 1,
    totalPrice: 1788,
    stock: 10,
    category: "Hack and slash/Beat 'em up"
  }

  const sampleCartDto: CartDTO = {
    items: [sampleCartItem],
    totalItems: 1,
    totalAmount: 1788
  }

  it('initializes with default empty values', () => {
    const store = useCartStore()
    expect(store.items).toEqual([])
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.totalItems).toBe(0)
    expect(store.totalPrice).toBe(0)
    expect(store.hasItems).toBe(false)
  })

  describe('loadCart', () => {
    it('does not load cart if user is not authenticated', async () => {
      const store = useCartStore()
      await store.loadCart()

      expect(vi.mocked(fetchCart)).not.toHaveBeenCalled()
      expect(store.items).toEqual([])
    })

    it('loads and enriches items when user is authenticated', async () => {
      const authStore = useAuthStore()
      authStore.setUserSession({ id: 1, username: 'testuser' }, 'mock-token')

      vi.mocked(fetchCart).mockResolvedValueOnce({
        items: [{ ...sampleCartItem, category: undefined }],
        totalItems: 1,
        totalAmount: 1788
      })
      vi.mocked(fetchGameById).mockResolvedValueOnce({
        id: 'vs-1',
        name: 'Vampire Survivors',
        price: 1788,
        category: 'Action Roguelike',
        coverImage: 'vs.jpg'
      })

      const store = useCartStore()
      await store.loadCart()

      expect(store.items).toHaveLength(1)
      expect(store.items[0].category).toBe('Action Roguelike')
      expect(store.totalItems).toBe(1)
      expect(store.totalPrice).toBe(1788)
      expect(store.hasItems).toBe(true)
    })

    it('sets error when loadCart fails', async () => {
      const authStore = useAuthStore()
      authStore.setUserSession({ id: 1, username: 'testuser' }, 'mock-token')
      vi.mocked(fetchCart).mockRejectedValueOnce(new Error('Backend error'))

      const store = useCartStore()
      await store.loadCart()

      expect(store.error).toBe('Backend error')
      expect(store.items).toEqual([])
    })
  })

  describe('addItem', () => {
    it('returns false and sets error when unauthenticated user adds item', async () => {
      const store = useCartStore()
      const success = await store.addItem('vs-1')

      expect(success).toBe(false)
      expect(store.error).toContain('User must be authenticated')
    })

    it('successfully adds item, enriches category, and triggers toast notification', async () => {
      const authStore = useAuthStore()
      authStore.setUserSession({ id: 1, username: 'testuser' }, 'mock-token')
      vi.mocked(addToCart).mockResolvedValueOnce(sampleCartDto)

      const store = useCartStore()
      const toastStore = useToastStore()
      const success = await store.addItem('vs-1', 2)

      expect(success).toBe(true)
      expect(store.items).toHaveLength(1)
      expect(store.totalItems).toBe(1)
      expect(toastStore.toasts).toHaveLength(1)
      expect(toastStore.toasts[0].gameTitle).toBe('Vampire Survivors')
      expect(toastStore.toasts[0].message).toContain('Vampire Survivors')
    })

    it('triggers toast notification using explicit gameTitle parameter', async () => {
      const authStore = useAuthStore()
      authStore.setUserSession({ id: 1, username: 'testuser' }, 'mock-token')
      vi.mocked(addToCart).mockResolvedValueOnce(sampleCartDto)

      const store = useCartStore()
      const toastStore = useToastStore()
      const success = await store.addItem('vs-1', 1, 'Custom Game Title')

      expect(success).toBe(true)
      expect(toastStore.toasts).toHaveLength(1)
      expect(toastStore.toasts[0].gameTitle).toBe('Custom Game Title')
    })

    it('triggers generic toast when item game title cannot be found', async () => {
      const authStore = useAuthStore()
      authStore.setUserSession({ id: 1, username: 'testuser' }, 'mock-token')
      vi.mocked(addToCart).mockResolvedValueOnce({ items: [], totalItems: 0, totalAmount: 0 })

      const store = useCartStore()
      const toastStore = useToastStore()
      const success = await store.addItem('unknown-id', 1)

      expect(success).toBe(true)
      expect(toastStore.toasts).toHaveLength(1)
      expect(toastStore.toasts[0].message).toBe('Item added to cart!')
    })

    it('returns false when addToCart service fails', async () => {
      const authStore = useAuthStore()
      authStore.setUserSession({ id: 1, username: 'testuser' }, 'mock-token')
      vi.mocked(addToCart).mockRejectedValueOnce(new Error('Out of stock'))

      const store = useCartStore()
      const success = await store.addItem('vs-1')

      expect(success).toBe(false)
      expect(store.error).toBe('Out of stock')
    })
  })

  describe('updateQuantity', () => {
    it('returns false if user has no token or newQuantity is less than 1', async () => {
      const store = useCartStore()
      const result = await store.updateQuantity('vs-1', 0)
      expect(result).toBe(false)
    })

    it('returns false if newQuantity exceeds available stock', async () => {
      const authStore = useAuthStore()
      authStore.setUserSession({ id: 1, username: 'testuser' }, 'mock-token')

      const store = useCartStore()
      store.items = [sampleCartItem] // stock: 10

      const result = await store.updateQuantity('vs-1', 15)
      expect(result).toBe(false)
    })

    it('updates quantity successfully and preserves item details', async () => {
      const authStore = useAuthStore()
      authStore.setUserSession({ id: 1, username: 'testuser' }, 'mock-token')

      const updatedDto: CartDTO = {
        items: [{ ...sampleCartItem, quantity: 3, totalPrice: 5364 }],
        totalItems: 3,
        totalAmount: 5364
      }
      vi.mocked(updateCartItemQuantity).mockResolvedValueOnce(updatedDto)

      const store = useCartStore()
      store.items = [sampleCartItem]

      const result = await store.updateQuantity('vs-1', 3)
      expect(result).toBe(true)
      expect(store.items[0].quantity).toBe(3)
      expect(store.totalPrice).toBe(5364)
    })

    it('returns false and sets error when updateQuantity API fails', async () => {
      const authStore = useAuthStore()
      authStore.setUserSession({ id: 1, username: 'testuser' }, 'mock-token')
      vi.mocked(updateCartItemQuantity).mockRejectedValueOnce(new Error('Network drop'))

      const store = useCartStore()
      store.items = [sampleCartItem]

      const result = await store.updateQuantity('vs-1', 2)
      expect(result).toBe(false)
      expect(store.error).toBe('Network drop')
    })
  })

  describe('removeItem', () => {
    it('returns false when unauthenticated user calls removeItem', async () => {
      const store = useCartStore()
      const result = await store.removeItem('vs-1')
      expect(result).toBe(false)
    })

    it('removes item successfully when authenticated', async () => {
      const authStore = useAuthStore()
      authStore.setUserSession({ id: 1, username: 'testuser' }, 'mock-token')

      vi.mocked(removeCartItem).mockResolvedValueOnce({
        items: [],
        totalItems: 0,
        totalAmount: 0
      })

      const store = useCartStore()
      store.items = [sampleCartItem]

      const result = await store.removeItem('vs-1')
      expect(result).toBe(true)
      expect(store.items).toEqual([])
      expect(store.totalItems).toBe(0)
    })

    it('returns false when removeCartItem service fails', async () => {
      const authStore = useAuthStore()
      authStore.setUserSession({ id: 1, username: 'testuser' }, 'mock-token')
      vi.mocked(removeCartItem).mockRejectedValueOnce(new Error('Cannot delete'))

      const store = useCartStore()
      store.items = [sampleCartItem]

      const result = await store.removeItem('vs-1')
      expect(result).toBe(false)
      expect(store.error).toBe('Cannot delete')
    })
  })

  describe('clear and reset', () => {
    it('clears items locally if unauthenticated', async () => {
      const store = useCartStore()
      store.items = [sampleCartItem]

      const result = await store.clear()
      expect(result).toBe(true)
      expect(store.items).toEqual([])
    })

    it('calls clearCart API when authenticated', async () => {
      const authStore = useAuthStore()
      authStore.setUserSession({ id: 1, username: 'testuser' }, 'mock-token')
      vi.mocked(clearCart).mockResolvedValueOnce()

      const store = useCartStore()
      store.items = [sampleCartItem]

      const result = await store.clear()
      expect(result).toBe(true)
      expect(vi.mocked(clearCart)).toHaveBeenCalledWith('mock-token')
      expect(store.items).toEqual([])
    })

    it('handles clear failure gracefully', async () => {
      const authStore = useAuthStore()
      authStore.setUserSession({ id: 1, username: 'testuser' }, 'mock-token')
      vi.mocked(clearCart).mockRejectedValueOnce(new Error('Clear failed'))

      const store = useCartStore()
      const result = await store.clear()
      expect(result).toBe(false)
      expect(store.error).toBe('Clear failed')
    })

    it('resets local store state on reset()', () => {
      const store = useCartStore()
      store.items = [sampleCartItem]
      store.error = 'Some error'

      store.reset()
      expect(store.items).toEqual([])
      expect(store.error).toBeNull()
    })
  })
})
