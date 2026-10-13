import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  formatSaleOrderId,
  formatSaleDateParts,
  aggregateSaleItems,
  fetchAdminSaleHistory
} from '../adminSaleApi'

const mockFetch = vi.fn()
globalThis.fetch = mockFetch

describe('adminSaleApi', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  describe('formatSaleOrderId', () => {
    it('formats long order numbers with truncation to 8 characters and ellipsis', () => {
      expect(formatSaleOrderId('6acdf966-4e5c-482a-a9fb-e08713d80ab5')).toBe('ID: 6acdf966...')
    })

    it('formats short order numbers without truncation', () => {
      expect(formatSaleOrderId('ORD-123')).toBe('ID: ORD-123')
    })

    it('falls back to id when orderNumber is omitted', () => {
      expect(formatSaleOrderId('', 105)).toBe('ID: 105')
    })

    it('returns ID: — when both orderNumber and id are missing', () => {
      expect(formatSaleOrderId()).toBe('ID: —')
      expect(formatSaleOrderId('', '')).toBe('ID: —')
    })
  })

  describe('formatSaleDateParts', () => {
    it('returns formatted date, yearWithComma, and time for valid ISO string', () => {
      const parts = formatSaleDateParts('2026-10-13T16:30:00')
      expect(parts.date).toBe('13 Oct')
      expect(parts.yearWithComma).toBe('2026,')
      expect(parts.time).toBe('16:30')
    })

    it('handles missing dateStr gracefully', () => {
      const parts = formatSaleDateParts()
      expect(parts.date).toBe('—')
      expect(parts.yearWithComma).toBe('')
      expect(parts.time).toBe('')
    })

    it('handles invalid dateStr gracefully', () => {
      const parts = formatSaleDateParts('invalid-date')
      expect(parts.date).toBe('invalid-date')
      expect(parts.yearWithComma).toBe('')
      expect(parts.time).toBe('')
    })
  })

  describe('aggregateSaleItems', () => {
    it('returns empty array when items array is empty or undefined', () => {
      expect(aggregateSaleItems()).toEqual([])
      expect(aggregateSaleItems([])).toEqual([])
    })

    it('aggregates quantities for identical game titles', () => {
      const rawItems = [
        { gameId: 'g1', gameTitle: 'Cyberpunk 2077', gameKey: 'K1', price: 1000 },
        { gameId: 'g1', gameTitle: 'Cyberpunk 2077', gameKey: 'K2', price: 1000 },
        { gameId: 'g2', gameTitle: 'Elden Ring', gameKey: 'K3', price: 1500 }
      ]
      const aggregated = aggregateSaleItems(rawItems)
      expect(aggregated).toEqual([
        { title: 'Cyberpunk 2077', quantity: 2 },
        { title: 'Elden Ring', quantity: 1 }
      ])
    })

    it('handles whitespace and missing title fallback', () => {
      const rawItems = [
        { gameId: 'g1', gameTitle: '   ', gameKey: 'K1', price: 100 }
      ]
      const aggregated = aggregateSaleItems(rawItems)
      expect(aggregated).toEqual([
        { title: 'Unknown Game', quantity: 1 }
      ])
    })
  })

  describe('fetchAdminSaleHistory', () => {
    it('returns mapped sales when primary admin endpoint succeeds', async () => {
      const mockRawOrders = [
        {
          id: 1,
          orderNumber: '6acdf966-4e5c-482a',
          userId: 9,
          username: 'customer',
          totalAmount: 1790,
          purchaseDate: '2026-10-13T16:30:00',
          items: [
            {
              id: 11,
              gameId: 'cyberpunk-2077',
              gameTitle: 'Cyberpunk 2077',
              coverImage: 'cyber.jpg',
              gameKey: 'KEY-1234',
              price: 1790
            }
          ]
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRawOrders)
      })

      const sales = await fetchAdminSaleHistory('admin-token')
      expect(sales).toHaveLength(1)
      expect(sales[0].orderNumber).toBe('6acdf966-4e5c-482a')
      expect(sales[0].username).toBe('customer')
      expect(sales[0].items[0].gameTitle).toBe('Cyberpunk 2077')
      expect(mockFetch).toHaveBeenCalledWith('/api/v1/admin/orders', expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer admin-token' })
      }))
    })

    it('returns empty array when primary endpoint returns non-array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'empty' })
      })

      const sales = await fetchAdminSaleHistory('admin-token')
      expect(sales).toEqual([])
    })

    it('falls back to /api/v1/orders when primary endpoint returns 404', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: () => Promise.resolve({ message: 'Not found' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 2,
              orderNumber: 'ORD-777',
              username: 'player1',
              totalAmount: 500,
              items: []
            }
          ])
        })

      const sales = await fetchAdminSaleHistory('admin-token')
      expect(sales).toHaveLength(1)
      expect(sales[0].orderNumber).toBe('ORD-777')
      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(mockFetch).toHaveBeenNthCalledWith(2, '/api/v1/orders', expect.anything())
    })

    it('throws error when fallback endpoint also fails', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: () => Promise.resolve({ message: 'Not found' })
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: () => Promise.resolve({ message: 'Database connection failed' })
        })

      await expect(fetchAdminSaleHistory('admin-token')).rejects.toThrow('Database connection failed')
    })

    it('throws error when primary endpoint fails with non-404 status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: () => Promise.resolve({ message: 'Access denied' })
      })

      await expect(fetchAdminSaleHistory('admin-token')).rejects.toThrow('Access denied')
    })

    it('skips invalid items in raw items list and handles malformed order records', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([
          null,
          {
            id: 'not-a-number',
            items: [
              null,
              { id: 'bad-id' }, // missing gameId
              { gameId: 'g1', price: 'invalid' }
            ]
          }
        ])
      })

      const sales = await fetchAdminSaleHistory('admin-token')
      expect(sales).toHaveLength(2)
      expect(sales[0].id).toBe(0)
      expect(sales[1].items).toHaveLength(1)
      expect(sales[1].items[0].price).toBe(0)
    })
  })
})
