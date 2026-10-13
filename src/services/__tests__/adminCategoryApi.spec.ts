import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  toggleAdminCategoryVisibility,
  deleteAdminCategory,
  mapAdminCategory
} from '../adminCategoryApi'

describe('adminCategoryApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('mapAdminCategory', () => {
    it('returns null for invalid category records', () => {
      expect(mapAdminCategory(null)).toBeNull()
      expect(mapAdminCategory({})).toBeNull()
      expect(mapAdminCategory({ name: '   ' })).toBeNull()
      expect(mapAdminCategory({ name: 123 })).toBeNull()
    })

    it('maps valid category record with defaults', () => {
      const result = mapAdminCategory({
        id: 1,
        name: 'Action',
        slug: 'action',
        isVisible: true
      })
      expect(result).toEqual({
        id: 1,
        name: 'Action',
        slug: 'action',
        isVisible: true
      })
    })

    it('handles fallback slug and default isVisible true', () => {
      const result = mapAdminCategory({
        name: 'Adventure'
      })
      expect(result).toEqual({
        id: 'Adventure',
        name: 'Adventure',
        slug: 'Adventure',
        isVisible: true
      })
    })

    it('preserves false isVisible status', () => {
      const result = mapAdminCategory({
        id: 'cat-2',
        name: 'Strategy',
        slug: 'strategy',
        isVisible: false
      })
      expect(result).toEqual({
        id: 'cat-2',
        name: 'Strategy',
        slug: 'strategy',
        isVisible: false
      })
    })
  })

  describe('fetchAdminCategories', () => {
    it('successfully fetches and maps categories', async () => {
      const mockCategories = [
        { id: 1, name: 'Action', slug: 'action', isVisible: true },
        { id: 2, name: 'Adventure', slug: 'adventure', isVisible: false }
      ]
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCategories)
      } as Response)

      const result = await fetchAdminCategories('mock-token')
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Action')
      expect(result[1].isVisible).toBe(false)
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/v1/admin/categories', {
        headers: { Authorization: 'Bearer mock-token' }
      })
    })

    it('returns empty array when response body is not an array', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ notAnArray: true })
      } as Response)

      const result = await fetchAdminCategories('mock-token')
      expect(result).toEqual([])
    })

    it('throws error when server responds with non-ok status', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Unauthorized access' })
      } as Response)

      await expect(fetchAdminCategories('bad-token')).rejects.toThrow('Unauthorized access')
    })
  })

  describe('createAdminCategory', () => {
    it('successfully creates category', async () => {
      const mockCreated = { id: 3, name: 'RPG', slug: 'rpg', isVisible: true }
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCreated)
      } as Response)

      const result = await createAdminCategory('mock-token', 'RPG')
      expect(result).toEqual({ id: 3, name: 'RPG', slug: 'rpg', isVisible: true })
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/v1/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token'
        },
        body: JSON.stringify({ name: 'RPG' })
      })
    })

    it('throws error when creation fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Category already exists' })
      } as Response)

      await expect(createAdminCategory('mock-token', 'Action')).rejects.toThrow('Category already exists')
    })

    it('throws error when server returns invalid category record', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      } as Response)

      await expect(createAdminCategory('mock-token', 'Action')).rejects.toThrow(
        'Invalid category response received from server'
      )
    })
  })

  describe('updateAdminCategory', () => {
    it('successfully updates category name', async () => {
      const mockUpdated = { id: 1, name: 'Action & Adventure', slug: 'action-adventure', isVisible: true }
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUpdated)
      } as Response)

      const result = await updateAdminCategory('mock-token', 1, 'Action & Adventure')
      expect(result).toEqual({ id: 1, name: 'Action & Adventure', slug: 'action-adventure', isVisible: true })
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/v1/admin/categories/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token'
        },
        body: JSON.stringify({ name: 'Action & Adventure' })
      })
    })

    it('throws error when update fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Category not found' })
      } as Response)

      await expect(updateAdminCategory('mock-token', 99, 'New Name')).rejects.toThrow('Category not found')
    })

    it('throws error when server returns invalid updated record', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(null)
      } as Response)

      await expect(updateAdminCategory('mock-token', 1, 'Action')).rejects.toThrow(
        'Invalid category response received from server'
      )
    })
  })

  describe('toggleAdminCategoryVisibility', () => {
    it('successfully toggles visibility with boolean payload', async () => {
      const mockToggled = { id: 1, name: 'Action', slug: 'action', isVisible: false }
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockToggled)
      } as Response)

      const result = await toggleAdminCategoryVisibility('mock-token', 1, false)
      expect(result.isVisible).toBe(false)
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/v1/admin/categories/1/visibility', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token'
        },
        body: JSON.stringify({ isVisible: false })
      })
    })

    it('successfully toggles visibility without body when isVisible not provided', async () => {
      const mockToggled = { id: 1, name: 'Action', slug: 'action', isVisible: true }
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockToggled)
      } as Response)

      const result = await toggleAdminCategoryVisibility('mock-token', 1)
      expect(result.isVisible).toBe(true)
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/v1/admin/categories/1/visibility', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token'
        },
        body: undefined
      })
    })

    it('throws error when toggle visibility fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Failed to update visibility' })
      } as Response)

      await expect(toggleAdminCategoryVisibility('mock-token', 1, true)).rejects.toThrow(
        'Failed to update visibility'
      )
    })

    it('throws error when server returns invalid toggled record', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve('invalid')
      } as Response)

      await expect(toggleAdminCategoryVisibility('mock-token', 1, true)).rejects.toThrow(
        'Invalid category response received from server'
      )
    })
  })

  describe('deleteAdminCategory', () => {
    it('successfully deletes category', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true
      } as Response)

      await expect(deleteAdminCategory('mock-token', 5)).resolves.toBeUndefined()
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/v1/admin/categories/5', {
        method: 'DELETE',
        headers: { Authorization: 'Bearer mock-token' }
      })
    })

    it('throws error when deletion fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Category is assigned to active games' })
      } as Response)

      await expect(deleteAdminCategory('mock-token', 5)).rejects.toThrow(
        'Category is assigned to active games'
      )
    })
  })
})
