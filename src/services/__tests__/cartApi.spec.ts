import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart
} from '../cartApi'

describe('cartApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('fetchCart', () => {
    it('successfully loads and maps cart data with items and totals', async () => {
      const mockCartResponse = {
        items: [
          {
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
        ],
        totalItems: 1,
        totalAmount: 1788
      }

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCartResponse)
      } as unknown as Response)

      const result = await fetchCart('mock-token')
      expect(result.totalItems).toBe(1)
      expect(result.totalAmount).toBe(1788)
      expect(result.items).toHaveLength(1)
      expect(result.items[0].gameTitle).toBe('Vampire Survivors')
    })

    it('handles numeric string conversion and missing optional properties', async () => {
      const mockCartResponse = {
        items: [
          {
            id: '2',
            gameId: 'pz-1',
            gameTitle: 'Planet Zoo',
            unitPrice: '835',
            quantity: '2',
            stock: '5'
          },
          {
            // Invalid item without gameId
            id: 99
          }
        ]
      }

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCartResponse)
      } as unknown as Response)

      const result = await fetchCart('mock-token')
      expect(result.items).toHaveLength(1)
      expect(result.items[0].unitPrice).toBe(835)
      expect(result.items[0].quantity).toBe(2)
      expect(result.items[0].totalPrice).toBe(1670)
      expect(result.items[0].coverImage).toBe('')
    })

    it('returns empty cart structure when response payload is not an object', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(null)
      } as unknown as Response)

      const result = await fetchCart('mock-token')
      expect(result.items).toEqual([])
      expect(result.totalItems).toBe(0)
      expect(result.totalAmount).toBe(0)
    })

    it('throws structured error message from details object when fetch fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: () => Promise.resolve({
          details: { gameId: 'Game not found', stock: 'Out of stock' }
        })
      } as unknown as Response)

      await expect(fetchCart('mock-token')).rejects.toThrow('Game not found, Out of stock')
    })

    it('throws string error field when present on failed response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        statusText: 'Forbidden',
        json: () => Promise.resolve({ error: 'Token expired' })
      } as unknown as Response)

      await expect(fetchCart('mock-token')).rejects.toThrow('Token expired')
    })

    it('throws message field when present on failed response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Error',
        json: () => Promise.resolve({ message: 'Cart service unavailable' })
      } as unknown as Response)

      await expect(fetchCart('mock-token')).rejects.toThrow('Cart service unavailable')
    })

    it('falls back to statusText or generic message when json parsing fails on error', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        statusText: 'Gateway Timeout',
        json: () => Promise.reject(new Error('Invalid JSON'))
      } as unknown as Response)

      await expect(fetchCart('mock-token')).rejects.toThrow('Gateway Timeout')
    })
  })

  describe('addToCart', () => {
    it('sends POST to /api/v1/cart/items with gameId and quantity', async () => {
      const mockUpdatedCart = {
        items: [{ id: 1, gameId: 'g-101', gameTitle: 'Game 101', quantity: 2, unitPrice: 50, totalPrice: 100 }],
        totalItems: 2,
        totalAmount: 100
      }

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUpdatedCart)
      } as unknown as Response)

      const result = await addToCart('mock-token', { gameId: 'g-101', quantity: 2 })

      expect(fetchSpy).toHaveBeenCalledWith('/api/v1/cart/items', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token'
        }),
        body: JSON.stringify({ gameId: 'g-101', quantity: 2 })
      }))
      expect(result.totalItems).toBe(2)
      expect(result.items).toHaveLength(1)
    })

    it('defaults quantity to 1 when payload quantity is omitted', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [], totalItems: 0, totalAmount: 0 })
      } as unknown as Response)

      await addToCart('mock-token', { gameId: 'g-102' })

      expect(fetchSpy).toHaveBeenCalledWith('/api/v1/cart/items', expect.objectContaining({
        body: JSON.stringify({ gameId: 'g-102', quantity: 1 })
      }))
    })

    it('throws error when addToCart response is not ok', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: () => Promise.resolve('Insufficient stock')
      } as unknown as Response)

      await expect(addToCart('mock-token', { gameId: 'g-101' })).rejects.toThrow('Insufficient stock')
    })
  })

  describe('updateCartItemQuantity', () => {
    it('sends PUT to /api/v1/cart/items/{gameId} with new quantity', async () => {
      const mockUpdatedCart = {
        items: [{ id: 1, gameId: 'g-101', gameTitle: 'Game 101', quantity: 3, unitPrice: 50, totalPrice: 150 }],
        totalItems: 3,
        totalAmount: 150
      }

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUpdatedCart)
      } as unknown as Response)

      const result = await updateCartItemQuantity('mock-token', 'g-101', 3)

      expect(fetchSpy).toHaveBeenCalledWith('/api/v1/cart/items/g-101', expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ quantity: 3 })
      }))
      expect(result.totalItems).toBe(3)
    })

    it('throws error when update quantity fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
        json: () => Promise.reject(new Error('Parse error'))
      } as unknown as Response)

      await expect(updateCartItemQuantity('mock-token', 'g-101', 3)).rejects.toThrow('Not Found')
    })
  })

  describe('removeCartItem', () => {
    it('sends DELETE to /api/v1/cart/items/{gameId}', async () => {
      const mockUpdatedCart = {
        items: [],
        totalItems: 0,
        totalAmount: 0
      }

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUpdatedCart)
      } as unknown as Response)

      const result = await removeCartItem('mock-token', 'g-101')

      expect(fetchSpy).toHaveBeenCalledWith('/api/v1/cart/items/g-101', expect.objectContaining({
        method: 'DELETE'
      }))
      expect(result.items).toEqual([])
    })

    it('throws error when remove item fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        statusText: 'Server Error',
        json: () => Promise.resolve({ error: 'Database timeout' })
      } as unknown as Response)

      await expect(removeCartItem('mock-token', 'g-101')).rejects.toThrow('Database timeout')
    })
  })

  describe('clearCart', () => {
    it('sends DELETE to /api/v1/cart', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true
      } as unknown as Response)

      await clearCart('mock-token')

      expect(fetchSpy).toHaveBeenCalledWith('/api/v1/cart', expect.objectContaining({
        method: 'DELETE'
      }))
    })

    it('throws error when clearCart fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        statusText: 'Forbidden',
        json: () => Promise.resolve({ message: 'Unauthorized action' })
      } as unknown as Response)

      await expect(clearCart('mock-token')).rejects.toThrow('Unauthorized action')
    })
  })
})
