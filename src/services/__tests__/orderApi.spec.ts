import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  checkoutOrder,
  fetchOrderHistory,
  fetchOrderByNumber,
  formatDate,
  mapOrderDtoToOrder
} from '../orderApi'
import type { OrderDTO } from '@/types/order'

describe('orderApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('formats date correctly and handles invalid or missing inputs', () => {
    expect(formatDate()).toBeDefined()
    expect(formatDate('')).toBeDefined()
    const formatted = formatDate('2026-10-12T14:30:00Z')
    expect(formatted).toContain('2026')
  })

  it('maps OrderDTO to Order model with fallback defaults', () => {
    const sampleDto: OrderDTO = {
      id: 123,
      orderNumber: 'ORD-TEST-1',
      totalAmount: 1500,
      purchaseDate: '2026-10-12T10:00:00Z',
      items: [
        {
          id: 1,
          gameId: 'game-1',
          gameTitle: 'Elden Ring',
          coverImage: 'cover.jpg',
          gameKey: 'XXXX-YYYY-ZZZZ',
          price: 1500
        }
      ]
    }

    const order = mapOrderDtoToOrder(sampleDto)
    expect(order.id).toBe('ORD-TEST-1')
    expect(order.orderNumber).toBe('ORD-TEST-1')
    expect(order.totalAmount).toBe(1500)
    expect(order.items).toHaveLength(1)
    expect(order.items[0].gameName).toBe('Elden Ring')
    expect(order.items[0].key).toBe('XXXX-YYYY-ZZZZ')
  })

  it('sends checkout request for cart successfully', async () => {
    const mockOrder: OrderDTO = {
      id: 1,
      orderNumber: 'ORD-12345',
      totalAmount: 999,
      items: [
        {
          gameId: 'game-99',
          gameTitle: 'Hades',
          coverImage: 'hades.jpg',
          gameKey: 'HADE-S123-4567',
          price: 999
        }
      ]
    }

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => mockOrder
    } as unknown as Response)

    const result = await checkoutOrder('mock-token')
    expect(result.orderNumber).toBe('ORD-12345')
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/v1/orders/checkout', expect.objectContaining({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock-token'
      }
    }))
  })

  it('sends checkout request for single item purchase', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => ({
        id: 2,
        orderNumber: 'ORD-SINGLE',
        totalAmount: 500,
        items: []
      })
    } as unknown as Response)

    const result = await checkoutOrder('mock-token', {
      checkoutType: 'single',
      gameId: 'game-1',
      quantity: 1
    })
    expect(result.orderNumber).toBe('ORD-SINGLE')
  })

  it('throws error when checkout request fails with response message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Insufficient stock available' })
    } as unknown as Response)

    await expect(checkoutOrder('mock-token')).rejects.toThrow('Insufficient stock available')
  })

  it('fetches order history successfully', async () => {
    const mockList = [
      {
        id: 1,
        orderNumber: 'ORD-1',
        totalAmount: 100,
        items: []
      }
    ]

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => mockList
    } as unknown as Response)

    const orders = await fetchOrderHistory('mock-token')
    expect(orders).toHaveLength(1)
    expect(orders[0].orderNumber).toBe('ORD-1')
  })

  it('throws error when fetch order history fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: () => Promise.reject(new Error('Not JSON'))
    } as unknown as Response)

    await expect(fetchOrderHistory('mock-token')).rejects.toThrow('Unauthorized')
  })

  it('fetches order by number successfully', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: 5,
        orderNumber: 'ORD-FIND',
        totalAmount: 250,
        items: []
      })
    } as unknown as Response)

    const order = await fetchOrderByNumber('mock-token', 'ORD-FIND')
    expect(order.orderNumber).toBe('ORD-FIND')
  })

  it('throws error when order is not found by number', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'Order not found' })
    } as unknown as Response)

    await expect(fetchOrderByNumber('mock-token', 'ORD-404')).rejects.toThrow('Order not found')
  })

  it('returns empty array when order history is not an array', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ not: 'an-array' })
    } as unknown as Response)

    const orders = await fetchOrderHistory('mock-token')
    expect(orders).toEqual([])
  })

  it('falls back to statusText or default message on checkout failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      json: () => {
        return Promise.reject(new Error('Not JSON'))
      }
    } as unknown as Response)

    await expect(checkoutOrder('mock-token')).rejects.toThrow('Server Error')
  })
})
