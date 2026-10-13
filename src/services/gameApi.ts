import type { FetchGamesParams, Game, GamesResponse } from '@/types/game'

const API_BASE = '/api/v1/games'

const isRecord = (val: unknown): val is Record<string, unknown> => typeof val === 'object' && val !== null

const isNonEmptyString = (val: unknown): val is string => typeof val === 'string' && Boolean(val.trim())

const isValidGameRecord = (item: unknown): item is Record<string, unknown> & { name: string } =>
  isRecord(item) && isNonEmptyString(item.name)

const parseStringField = (val: unknown, fallback = ''): string =>
  isNonEmptyString(val) ? val : fallback

const parseOptionalString = (val: unknown): string | undefined =>
  isNonEmptyString(val) ? val : undefined

const resolveGameId = (val: unknown, fallback: string): string => {
  if (typeof val === 'string' || typeof val === 'number') {
    return String(val)
  }
  return fallback
}

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

const parseSystemRequirements = (val: unknown): Game['systemRequirements'] => {
  if (!isRecord(val)) {
    return undefined
  }
  return {
    os: parseOptionalString(val.os),
    processor: parseOptionalString(val.processor),
    memory: parseOptionalString(val.memory),
    graphics: parseOptionalString(val.graphics),
    storage: parseOptionalString(val.storage)
  }
}

const mapToGame = (item: unknown): Game | null => {
  if (!isValidGameRecord(item)) {
    return null
  }
  return {
    id: resolveGameId(item.id, item.name),
    name: item.name,
    price: parseNumericField(item.price, 0),
    coverImage: parseStringField(item.coverImage),
    category: parseStringField(item.category, 'General'),
    categories: parseStringArray(item.categories),
    description: parseStringField(item.description),
    screenshots: parseStringArray(item.screenshots),
    publisher: parseOptionalString(item.publisher),
    releaseDate: parseOptionalString(item.releaseDate),
    stock: parseNumericField(item.stock, 0),
    isHighlight: item.isHighlight === true,
    systemRequirements: parseSystemRequirements(item.systemRequirements)
  }
}

const appendParamIfPresent = (params: URLSearchParams, key: string, value: unknown): void => {
  if (typeof value === 'number' || isNonEmptyString(value)) {
    params.set(key, String(value))
  }
}

const buildGamesQuery = (params?: FetchGamesParams): string => {
  if (!params) {
    return ''
  }
  const searchParams = new URLSearchParams()
  appendParamIfPresent(searchParams, 'category', params.category)
  appendParamIfPresent(searchParams, 'search', params.search)
  appendParamIfPresent(searchParams, 'page', params.page)
  appendParamIfPresent(searchParams, 'size', params.size)
  appendParamIfPresent(searchParams, 'sort', params.sort)
  appendParamIfPresent(searchParams, 'direction', params.direction)
  const queryStr = searchParams.toString()
  return queryStr ? `?${queryStr}` : ''
}

const parseGamesList = (rawData: unknown): Game[] => {
  if (!Array.isArray(rawData)) {
    return []
  }
  return rawData.map(mapToGame).filter((game): game is Game => game !== null)
}

const extractTotalCount = (response: Response, fallbackCount: number): number => {
  const header = response.headers.get('x-total-count') ?? response.headers.get('X-Total-Count')
  if (!header) {
    return fallbackCount
  }
  return parseNumericField(header, fallbackCount)
}

export const fetchGames = async (params?: FetchGamesParams): Promise<GamesResponse> => {
  try {
    const queryString = buildGamesQuery(params)
    const response = await fetch(`${API_BASE}${queryString}`)
    if (!response.ok) {
      return { games: [], totalCount: 0 }
    }
    const rawData: unknown = await response.json()
    const games = parseGamesList(rawData)
    return {
      games,
      totalCount: extractTotalCount(response, games.length)
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
    return parseGamesList(rawData)
  } catch {
    return []
  }
}
