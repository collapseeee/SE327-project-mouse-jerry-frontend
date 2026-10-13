import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchAdminGames,
  fetchAdminGameById,
  createAdminGame,
  updateAdminGame,
  deleteAdminGame,
  uploadGameImage,
  mapAdminGame
} from '../adminGameApi'

describe('adminGameApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('mapAdminGame', () => {
    it('returns null for invalid inputs', () => {
      expect(mapAdminGame(null)).toBeNull()
      expect(mapAdminGame({})).toBeNull()
      expect(mapAdminGame({ name: ' ' })).toBeNull()
    })

    it('maps valid game data including system requirements', () => {
      const raw = {
        id: 'game-1',
        name: 'Game One',
        price: '49.99',
        coverImage: 'cover.jpg',
        category: 'Action',
        categories: ['Action', 'RPG'],
        description: 'A great game',
        screenshots: ['s1.jpg', 's2.jpg'],
        publisher: 'Publisher',
        releaseDate: '2026-01-01',
        stock: '15',
        isHighlight: true,
        systemRequirements: {
          os: 'Windows 11',
          processor: 'i7',
          memory: '16GB',
          graphics: 'RTX 3070',
          storage: '50GB'
        }
      }

      const result = mapAdminGame(raw)
      expect(result).not.toBeNull()
      expect(result?.id).toBe('game-1')
      expect(result?.name).toBe('Game One')
      expect(result?.price).toBe(49.99)
      expect(result?.stock).toBe(15)
      expect(result?.isHighlight).toBe(true)
      expect(result?.systemRequirements?.os).toBe('Windows 11')
      expect(result?.systemRequirements?.graphics).toBe('RTX 3070')
    })
  })

  describe('fetchAdminGames', () => {
    it('successfully loads games and parses total count header', async () => {
      const mockGames = [
        { id: '1', name: 'Hollow Knight', price: 315, stock: 50 }
      ]
      const headers = new Headers({ 'X-Total-Count': '1' })

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        headers,
        json: () => Promise.resolve(mockGames)
      } as unknown as Response)

      const result = await fetchAdminGames('mock-token', {
        search: 'Hollow',
        category: 'Action',
        page: 1,
        size: 10,
        sort: 'name',
        direction: 'asc'
      })

      expect(result.games).toHaveLength(1)
      expect(result.games[0].name).toBe('Hollow Knight')
      expect(result.totalCount).toBe(1)
    })

    it('throws error when response is not ok', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ error: 'Access denied' })
      } as unknown as Response)

      await expect(fetchAdminGames('token')).rejects.toThrow('Access denied')
    })
  })

  describe('fetchAdminGameById', () => {
    it('successfully fetches a single game by id', async () => {
      const mockGame = { id: 'elden-ring', name: 'Elden Ring', price: 1790 }

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGame)
      } as unknown as Response)

      const game = await fetchAdminGameById('mock-token', 'elden-ring')
      expect(game.id).toBe('elden-ring')
      expect(game.name).toBe('Elden Ring')
    })

    it('throws error when game not found or invalid', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Game not found' })
      } as unknown as Response)

      await expect(fetchAdminGameById('token', 'unknown')).rejects.toThrow('Game not found')
    })

    it('throws error when data returned is invalid format', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ invalid: true })
      } as unknown as Response)

      await expect(fetchAdminGameById('token', 'bad')).rejects.toThrow('Invalid game data received')
    })
  })

  describe('createAdminGame', () => {
    it('successfully creates game and returns it', async () => {
      const payload = {
        name: 'Cyberpunk 2077',
        price: 1399,
        stock: 25,
        category: 'RPG',
        systemRequirements: {
          os: 'Windows 10'
        }
      }

      const mockResponse = {
        id: 'cyberpunk-2077',
        name: 'Cyberpunk 2077',
        price: 1399,
        stock: 25
      }

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as unknown as Response)

      const created = await createAdminGame('mock-token', payload)
      expect(created.id).toBe('cyberpunk-2077')
      expect(created.name).toBe('Cyberpunk 2077')
    })

    it('throws error when creation fails with details message', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ details: { name: 'Name is required' } })
      } as unknown as Response)

      await expect(createAdminGame('token', { name: '', price: 0 })).rejects.toThrow('Name is required')
    })
  })

  describe('updateAdminGame', () => {
    it('successfully updates a game', async () => {
      const payload = {
        name: 'Cyberpunk 2077 Phantom Liberty',
        price: 1599,
        stock: 30
      }

      const mockResponse = {
        id: 'cyberpunk-2077',
        name: 'Cyberpunk 2077 Phantom Liberty',
        price: 1599,
        stock: 30
      }

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as unknown as Response)

      const updated = await updateAdminGame('mock-token', 'cyberpunk-2077', payload)
      expect(updated.name).toBe('Cyberpunk 2077 Phantom Liberty')
      expect(updated.price).toBe(1599)
    })

    it('throws error on failure', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Update error' })
      } as unknown as Response)

      await expect(updateAdminGame('token', 'g1', { name: 'Test', price: 10 })).rejects.toThrow('Update error')
    })
  })

  describe('deleteAdminGame', () => {
    it('successfully deletes a game', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true
      } as unknown as Response)

      await expect(deleteAdminGame('mock-token', 'game-to-delete')).resolves.toBeUndefined()
    })

    it('throws error when delete fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('fail'))
      } as unknown as Response)

      await expect(deleteAdminGame('mock-token', 'game-fail')).rejects.toThrow('Internal Server Error')
    })
  })

  describe('uploadGameImage', () => {
    it('successfully uploads image file to S3 and returns fileUrl', async () => {
      const file = new File(['image-content'], 'test.png', { type: 'image/png' })
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          fileUrl: 'https://s3.amazonaws.com/bucket/test.png',
          fileName: 'test.png'
        })
      } as unknown as Response)

      const url = await uploadGameImage('mock-token', file)
      expect(url).toBe('https://s3.amazonaws.com/bucket/test.png')
    })

    it('returns publicUrl when fileUrl is absent', async () => {
      const file = new File(['image-content'], 'test.png', { type: 'image/png' })
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          publicUrl: '/api/v1/upload/files/games/test.png',
          name: 'games/test.png'
        })
      } as unknown as Response)

      const url = await uploadGameImage('mock-token', file)
      expect(url).toBe('/api/v1/upload/files/games/test.png')
    })

    it('throws error when upload fails', async () => {
      const file = new File(['content'], 'test.png', { type: 'image/png' })
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Payload too large' })
      } as unknown as Response)

      await expect(uploadGameImage('mock-token', file)).rejects.toThrow('Payload too large')
    })

    it('throws error when upload response missing fileUrl', async () => {
      const file = new File(['content'], 'test.png', { type: 'image/png' })
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      } as unknown as Response)

      await expect(uploadGameImage('mock-token', file)).rejects.toThrow('Upload succeeded but no image URL was returned')
    })
  })
})
