import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchCategories, fetchCategoryById } from '../categoryApi'

describe('categoryApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetchCategories returns CategoryItem list on success', async () => {
    const mockCategories = [
      { id: 1, name: 'Fighting', slug: 'Fighting', isVisible: true },
      { id: 2, name: 'Indie', slug: 'Indie', isVisible: true }
    ]

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCategories)
    } as unknown as Response)

    const result = await fetchCategories()
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      id: 1,
      name: 'Fighting',
      slug: 'Fighting',
      isVisible: true
    })
    expect(fetch).toHaveBeenCalledWith('/api/v1/categories')
  })

  it('fetchCategories returns empty array on non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500
    } as unknown as Response)

    const result = await fetchCategories()
    expect(result).toEqual([])
  })

  it('fetchCategories returns empty array when json is not an array', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'not an array' })
    } as unknown as Response)

    const result = await fetchCategories()
    expect(result).toEqual([])
  })

  it('fetchCategories handles network exceptions gracefully', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'))

    const result = await fetchCategories()
    expect(result).toEqual([])
  })

  it('fetchCategories filters out invalid items', async () => {
    const mixedPayload = [
      null,
      'invalid',
      { id: 3, name: '' },
      { id: 4, name: 'Music' }
    ]

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mixedPayload)
    } as unknown as Response)

    const result = await fetchCategories()
    expect(result).toHaveLength(1)
    expect(result[0]?.name).toBe('Music')
  })

  it('fetchCategoryById returns CategoryItem on success', async () => {
    const mockCategory = { id: 1, name: 'Fighting', slug: 'Fighting', isVisible: true }

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCategory)
    } as unknown as Response)

    const result = await fetchCategoryById(1)
    expect(result).toEqual({
      id: 1,
      name: 'Fighting',
      slug: 'Fighting',
      isVisible: true
    })
    expect(fetch).toHaveBeenCalledWith('/api/v1/categories/1')
  })

  it('fetchCategoryById returns null on non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 404
    } as unknown as Response)

    const result = await fetchCategoryById(99)
    expect(result).toBeNull()
  })

  it('fetchCategoryById handles network exceptions gracefully', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Connection failed'))

    const result = await fetchCategoryById(1)
    expect(result).toBeNull()
  })

  it('fetchCategoryById returns null on invalid payload', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve('not-a-category')
    } as unknown as Response)

    const result = await fetchCategoryById(1)
    expect(result).toBeNull()
  })

  it('resolves category id and slug fallback when id or slug is missing or not a primitive', async () => {
    const rawCategories = [
      { id: null, name: 'Arcade', slug: null, isVisible: false }
    ]

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(rawCategories)
    } as unknown as Response)

    const result = await fetchCategories()
    expect(result[0]).toEqual({
      id: 'Arcade',
      name: 'Arcade',
      slug: 'Arcade',
      isVisible: false
    })
  })
})
