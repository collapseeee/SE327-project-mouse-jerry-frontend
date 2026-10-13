import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchAdminHighlights,
  createAdminHighlight,
  updateAdminHighlight,
  deleteAdminHighlight
} from '../adminHighlightApi'

describe('adminHighlightApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('fetchAdminHighlights', () => {
    it('fetches highlights from admin endpoint with bearer token', async () => {
      const mockData = [
        {
          id: 1,
          gameId: 'elden-ring',
          gameName: 'Elden Ring',
          customImage: 'https://img.test/banner.jpg',
          buttonColor: '#8b0000',
          createdAt: '2026-10-13T10:00:00'
        }
      ]

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData)
      } as Response)

      const result = await fetchAdminHighlights('test-token')
      expect(result).toHaveLength(1)
      expect(result[0].gameName).toBe('Elden Ring')
      expect(result[0].buttonColor).toBe('#8b0000')

      expect(fetchSpy).toHaveBeenCalledWith('/api/v1/admin/highlights', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token'
        }
      })
    })

    it('falls back to public /api/v1/highlights when admin endpoint returns 404', async () => {
      const mockFallback = [
        {
          id: '2',
          gameId: 'sekiro',
          name: 'Sekiro',
          buttonColor: '#DE1A58'
        }
      ]

      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce({
          ok: false,
          status: 404
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockFallback)
        } as Response)

      const result = await fetchAdminHighlights()
      expect(result).toHaveLength(1)
      expect(result[0].gameId).toBe('sekiro')
      expect(result[0].gameName).toBe('Sekiro')
    })

    it('returns empty array when both endpoints fail', async () => {
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)

      const result = await fetchAdminHighlights()
      expect(result).toEqual([])
    })

    it('handles non-array and invalid payload responses gracefully', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ notAnArray: true })
      } as Response)

      const result = await fetchAdminHighlights('tok')
      expect(result).toEqual([])
    })

    it('filters out records that lack both gameId and gameName', async () => {
      const mixed = [
        { id: 1, gameId: 'g1', gameName: 'Game 1' },
        { id: 2, invalid: 'no-game' },
        null
      ]
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mixed)
      } as Response)

      const result = await fetchAdminHighlights('tok')
      expect(result).toHaveLength(1)
      expect(result[0].gameId).toBe('g1')
    })
  })

  describe('createAdminHighlight', () => {
    it('creates highlight successfully', async () => {
      const payload = {
        gameId: 'elden-ring',
        customImage: 'https://img.test/custom.jpg',
        buttonColor: '#8b0000'
      }

      const returned = {
        id: 10,
        gameId: 'elden-ring',
        gameName: 'Elden Ring',
        customImage: 'https://img.test/custom.jpg',
        buttonColor: '#8b0000'
      }

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(returned)
      } as Response)

      const result = await createAdminHighlight('tok', payload)
      expect(result.id).toBe(10)
      expect(result.gameName).toBe('Elden Ring')
    })

    it('throws error with server message on failure', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Target game is required' })
      } as Response)

      await expect(createAdminHighlight('tok', { gameId: '' })).rejects.toThrow('Target game is required')
    })

    it('throws default error when server response is not JSON', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Invalid JSON'))
      } as Response)

      await expect(createAdminHighlight('tok', { gameId: 'g1' })).rejects.toThrow('Failed to create highlight')
    })

    it('throws error when created record format is invalid', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve('not-an-object')
      } as Response)

      await expect(createAdminHighlight('tok', { gameId: 'g1' })).rejects.toThrow('Invalid highlight response format')
    })
  })

  describe('updateAdminHighlight', () => {
    it('updates highlight successfully', async () => {
      const returned = {
        id: 5,
        gameId: 'elden-ring',
        gameName: 'Elden Ring',
        buttonColor: '#00c853'
      }

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(returned)
      } as Response)

      const result = await updateAdminHighlight('tok', 5, { buttonColor: '#00c853' })
      expect(result.buttonColor).toBe('#00c853')
    })

    it('throws error on failure', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Highlight not found' })
      } as Response)

      await expect(updateAdminHighlight('tok', 99, {})).rejects.toThrow('Highlight not found')
    })

    it('throws error on malformed response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(null)
      } as Response)

      await expect(updateAdminHighlight('tok', 1, {})).rejects.toThrow('Invalid highlight response format')
    })
  })

  describe('deleteAdminHighlight', () => {
    it('deletes highlight successfully', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 204
      } as Response)

      await expect(deleteAdminHighlight('tok', 1)).resolves.toBeUndefined()
      expect(fetchSpy).toHaveBeenCalledWith('/api/v1/admin/highlights/1', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer tok'
        }
      })
    })

    it('throws error when deletion fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Database constraint error' })
      } as Response)

      await expect(deleteAdminHighlight('tok', 1)).rejects.toThrow('Database constraint error')
    })
  })
})
