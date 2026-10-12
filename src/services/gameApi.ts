import type { FetchGamesParams, Game, GamesResponse } from '@/types/game'

const API_BASE = '/api/v1/games'

const isRecord = (val: unknown): val is Record<string, unknown> => typeof val === 'object' && val !== null

const isNonEmptyString = (val: unknown): val is string => typeof val === 'string' && Boolean(val.trim())

const parseNumericField = (val: unknown, fallback: number): number => {
  if (typeof val === 'number' && !Number.isNaN(val)) {
    return val
  }
  if (typeof val === 'string') {
    const parsed = Number.parseFloat(val)
    return Number.isNaN(parsed) ? fallback : parsed
  }
  return fallback
}

const parseStringArray = (val: unknown): string[] => {
  if (!Array.isArray(val)) {
    return []
  }
  return val.filter(isNonEmptyString)
}

const mapToGame = (item: unknown): Game | null => {
  if (!isRecord(item)) {
    return null
  }
  const idValue = item.id
  const nameValue = item.name

  if (!isNonEmptyString(nameValue)) {
    return null
  }

  const gameId = typeof idValue === 'string' || typeof idValue === 'number' ? String(idValue) : nameValue
  const categoryStr = isNonEmptyString(item.category) ? item.category : 'General'
  const coverImageStr = isNonEmptyString(item.coverImage) ? item.coverImage : ''

  return {
    id: gameId,
    name: nameValue,
    price: parseNumericField(item.price, 0),
    coverImage: coverImageStr,
    category: categoryStr,
    categories: parseStringArray(item.categories),
    description: isNonEmptyString(item.description) ? item.description : '',
    screenshots: parseStringArray(item.screenshots),
    publisher: isNonEmptyString(item.publisher) ? item.publisher : undefined,
    releaseDate: isNonEmptyString(item.releaseDate) ? item.releaseDate : undefined,
    stock: parseNumericField(item.stock, 0),
    isHighlight: item.isHighlight === true
  }
}

const buildGamesQuery = (params?: FetchGamesParams): string => {
  if (!params) {
    return ''
  }
  const searchParams = new URLSearchParams()
  if (isNonEmptyString(params.category)) {
    searchParams.set('category', params.category)
  }
  if (isNonEmptyString(params.search)) {
    searchParams.set('search', params.search)
  }
  if (typeof params.page === 'number') {
    searchParams.set('page', String(params.page))
  }
  if (typeof params.size === 'number') {
    searchParams.set('size', String(params.size))
  }
  if (isNonEmptyString(params.sort)) {
    searchParams.set('sort', params.sort)
  }
  if (isNonEmptyString(params.direction)) {
    searchParams.set('direction', params.direction)
  }
  const queryStr = searchParams.toString()
  return queryStr ? `?${queryStr}` : ''
}

export const fetchGames = async (params?: FetchGamesParams): Promise<GamesResponse> => {
  try {
    const queryString = buildGamesQuery(params)
    const response = await fetch(`${API_BASE}${queryString}`)
    if (!response.ok) {
      return { games: [], totalCount: 0 }
    }
    const totalCountHeader = response.headers.get('x-total-count') ?? response.headers.get('X-Total-Count')
    const rawData: unknown = await response.json()
    if (!Array.isArray(rawData)) {
      return { games: [], totalCount: 0 }
    }
    const gamesList = rawData.map(mapToGame).filter((game): game is Game => game !== null)
    const fallbackCount = gamesList.length
    const totalCount = totalCountHeader ? parseNumericField(totalCountHeader, fallbackCount) : fallbackCount

    return {
      games: gamesList,
      totalCount
    }
  } catch {
    return { games: [], totalCount: 0 }
  }
}

export const fetchGameById = async (gameId: string): Promise<Game | null> => {
  try {
    const response = await fetch(`${API_BASE}/${encodeURIComponent(gameId)}`)
    if (!response.ok) {
      return null
    }
    const data: unknown = await response.json()
    return mapToGame(data)
  } catch {
    return null
  }
}

export const fetchHighlights = async (): Promise<Game[]> => {
  try {
    const response = await fetch(`${API_BASE}/highlights`)
    if (!response.ok) {
      return []
    }
    const rawData: unknown = await response.json()
    if (!Array.isArray(rawData)) {
      return []
    }
    return rawData.map(mapToGame).filter((game): game is Game => game !== null)
  } catch {
    return []
  }
}
