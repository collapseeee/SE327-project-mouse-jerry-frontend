import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchGames, fetchGameById, fetchHighlights } from '../gameApi'

describe('gameApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetchGames returns list of games and parses X-Total-Count header', async () => {
    const mockGames = [
      {
        id: 'elden-ring',
        name: 'Elden Ring',
        price: 1790,
        coverImage: 'https://images.igdb.com/cover.jpg',
        category: 'Action',
        categories: ['Action', 'RPG'],
        description: 'Great game',
        screenshots: ['https://images.igdb.com/sc1.jpg'],
        publisher: 'Bandai Namco',
        releaseDate: '2022-02-25',
        stock: 30,
        isHighlight: true
      }
    ]

    const headersMock = new Headers()
    headersMock.set('x-total-count', '42')

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: headersMock,
      json: () => Promise.resolve(mockGames)
    } as unknown as Response)

    const result = await fetchGames({
      category: 'Action',
      search: 'Elden',
      page: 1,
      size: 10,
      sort: 'price',
      direction: 'asc'
    })

    expect(result.totalCount).toBe(42)
    expect(result.games).toHaveLength(1)
    expect(result.games[0]?.id).toBe('elden-ring')
    expect(result.games[0]?.name).toBe('Elden Ring')
    expect(result.games[0]?.price).toBe(1790)
    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/games?category=Action&search=Elden&page=1&size=10&sort=price&direction=asc'
    )
  })

  it('fetchGames falls back to games count when X-Total-Count is missing', async () => {
    const mockGames = [
      {
        id: 'cyberpunk',
        name: 'Cyberpunk 2077',
        price: '1399.50',
        coverImage: '',
        stock: '15'
      }
    ]

    const headersMock = new Headers()

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: headersMock,
      json: () => Promise.resolve(mockGames)
    } as unknown as Response)

    const result = await fetchGames()
    expect(result.totalCount).toBe(1)
    expect(result.games[0]?.price).toBe(1399.5)
    expect(result.games[0]?.stock).toBe(15)
    expect(fetch).toHaveBeenCalledWith('/api/v1/games')
  })

  it('fetchGames returns empty list on non-ok status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500
    } as unknown as Response)

    const result = await fetchGames({ search: 'fail' })
    expect(result).toEqual({ games: [], totalCount: 0 })
  })

  it('fetchGames returns empty list on non-array json', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: new Headers(),
      json: () => Promise.resolve({ error: 'invalid' })
    } as unknown as Response)

    const result = await fetchGames()
    expect(result).toEqual({ games: [], totalCount: 0 })
  })

  it('fetchGames handles network exceptions gracefully', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'))

    const result = await fetchGames()
    expect(result).toEqual({ games: [], totalCount: 0 })
  })

  it('fetchGameById returns single game on success', async () => {
    const mockGame = {
      id: 'hades',
      name: 'Hades',
      price: 529,
      coverImage: 'https://images.igdb.com/hades.jpg',
      category: 'Roguelike',
      stock: 45
    }

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockGame)
    } as unknown as Response)

    const result = await fetchGameById('hades')
    expect(result?.id).toBe('hades')
    expect(result?.name).toBe('Hades')
    expect(fetch).toHaveBeenCalledWith('/api/v1/games/hades')
  })

  it('fetchGameById returns null on non-ok status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 404
    } as unknown as Response)

    const result = await fetchGameById('unknown')
    expect(result).toBeNull()
  })

  it('fetchGameById returns null on network exception', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Failed to fetch'))

    const result = await fetchGameById('hades')
    expect(result).toBeNull()
  })

  it('fetchGameById returns null on invalid item', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ name: '' })
    } as unknown as Response)

    const result = await fetchGameById('hades')
    expect(result).toBeNull()
  })

  it('fetchHighlights returns list of highlighted games', async () => {
    const mockHighlights = [
      { id: '1', name: 'Game 1', price: 100, coverImage: 'img1.jpg', isHighlight: true },
      { id: '2', name: 'Game 2', price: 200, coverImage: 'img2.jpg', isHighlight: true }
    ]

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockHighlights)
    } as unknown as Response)

    const result = await fetchHighlights()
    expect(result).toHaveLength(2)
    expect(result[0]?.id).toBe('1')
    expect(fetch).toHaveBeenCalledWith('/api/v1/games/highlights')
  })

  it('fetchHighlights returns empty list on non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500
    } as unknown as Response)

    const result = await fetchHighlights()
    expect(result).toEqual([])
  })

  it('fetchHighlights returns empty list on non-array payload', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [] })
    } as unknown as Response)

    const result = await fetchHighlights()
    expect(result).toEqual([])
  })

  it('fetchHighlights handles network exceptions gracefully', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network offline'))

    const result = await fetchHighlights()
    expect(result).toEqual([])
  })

  it('builds empty query string for empty params object and handles non-primitive id and invalid numbers', async () => {
    const rawGames = [
      {
        id: null,
        name: 'Game Without ID',
        price: 'invalid-price',
        stock: {},
        categories: 'not-an-array',
        screenshots: null
      }
    ]

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: new Headers(),
      json: () => Promise.resolve(rawGames)
    } as unknown as Response)

    const result = await fetchGames({})
    expect(fetch).toHaveBeenCalledWith('/api/v1/games')
    expect(result.games[0]?.id).toBe('Game Without ID')
    expect(result.games[0]?.price).toBe(0)
    expect(result.games[0]?.stock).toBe(0)
    expect(result.games[0]?.categories).toEqual([])
    expect(result.games[0]?.screenshots).toEqual([])
  })
})
