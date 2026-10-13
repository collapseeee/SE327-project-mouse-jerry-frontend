import type { FetchGamesParams, Game, GamePayload, GamesResponse, SystemRequirements } from '@/types/game'

const ADMIN_GAMES_BASE = '/api/v1/admin/games'
const UPLOAD_BASE = '/api/v1/upload/image'

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

const parseSystemRequirements = (val: unknown): SystemRequirements | undefined => {
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

export const mapAdminGame = (item: unknown): Game | null => {
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

const parseGamesList = (rawData: unknown): Game[] => {
  if (!Array.isArray(rawData)) {
    return []
  }
  return rawData.map(mapAdminGame).filter((game): game is Game => game !== null)
}

const extractTotalCount = (response: Response, fallbackCount: number): number => {
  const header = response.headers.get('x-total-count') ?? response.headers.get('X-Total-Count')
  if (!header) {
    return fallbackCount
  }
  return parseNumericField(header, fallbackCount)
}

const appendParamIfPresent = (params: URLSearchParams, key: string, value: unknown): void => {
  if (typeof value === 'number' || isNonEmptyString(value)) {
    params.set(key, String(value))
  }
}

const buildAdminGamesQuery = (params?: FetchGamesParams): string => {
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

const buildJsonAuthHeaders = (token: string): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
})

const extractDetailsError = (data: Record<string, unknown>): string | null => {
  const details = data.details
  if (!isRecord(details)) {
    return null
  }
  const messages = Object.values(details).filter(isNonEmptyString)
  return messages.length > 0 ? messages.join(', ') : null
}

const extractObjectError = (data: Record<string, unknown>): string | null => {
  const detailsMsg = extractDetailsError(data)
  if (detailsMsg) {
    return detailsMsg
  }
  const errorVal = data.error
  if (isNonEmptyString(errorVal)) {
    return errorVal
  }
  const msgVal = data.message
  return isNonEmptyString(msgVal) ? msgVal : null
}

const extractErrorMessage = (errData: unknown, fallback: string): string => {
  if (isNonEmptyString(errData)) {
    return errData
  }
  if (isRecord(errData)) {
    return extractObjectError(errData) ?? fallback
  }
  return fallback
}

const parseResponseError = async (response: Response, fallback: string): Promise<string> => {
  try {
    const errData = await response.json()
    return extractErrorMessage(errData, fallback)
  } catch {
    return response.statusText || fallback
  }
}

export const fetchAdminGames = async (
  token: string,
  params?: FetchGamesParams
): Promise<GamesResponse> => {
  const query = buildAdminGamesQuery(params)
  const response = await fetch(`${ADMIN_GAMES_BASE}${query}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  if (!response.ok) {
    const msg = await parseResponseError(response, 'Failed to fetch admin games')
    throw new Error(msg)
  }
  const rawData: unknown = await response.json()
  const games = parseGamesList(rawData)
  return {
    games,
    totalCount: extractTotalCount(response, games.length)
  }
}

export const fetchAdminGameById = async (
  token: string,
  gameId: string
): Promise<Game> => {
  const response = await fetch(`${ADMIN_GAMES_BASE}/${encodeURIComponent(gameId)}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  if (!response.ok) {
    const msg = await parseResponseError(response, `Failed to fetch game ${gameId}`)
    throw new Error(msg)
  }
  const rawData: unknown = await response.json()
  const game = mapAdminGame(rawData)
  if (!game) {
    throw new Error('Invalid game data received')
  }
  return game
}

export const createAdminGame = async (
  token: string,
  payload: GamePayload
): Promise<Game> => {
  const response = await fetch(ADMIN_GAMES_BASE, {
    method: 'POST',
    headers: buildJsonAuthHeaders(token),
    body: JSON.stringify(payload)
  })
  if (!response.ok) {
    const msg = await parseResponseError(response, 'Failed to create game')
    throw new Error(msg)
  }
  const rawData: unknown = await response.json()
  const game = mapAdminGame(rawData)
  if (!game) {
    throw new Error('Invalid game data returned on creation')
  }
  return game
}

export const updateAdminGame = async (
  token: string,
  gameId: string,
  payload: GamePayload
): Promise<Game> => {
  const response = await fetch(`${ADMIN_GAMES_BASE}/${encodeURIComponent(gameId)}`, {
    method: 'PUT',
    headers: buildJsonAuthHeaders(token),
    body: JSON.stringify(payload)
  })
  if (!response.ok) {
    const msg = await parseResponseError(response, `Failed to update game ${gameId}`)
    throw new Error(msg)
  }
  const rawData: unknown = await response.json()
  const game = mapAdminGame(rawData)
  if (!game) {
    throw new Error('Invalid game data returned on update')
  }
  return game
}

export const deleteAdminGame = async (
  token: string,
  gameId: string
): Promise<void> => {
  const response = await fetch(`${ADMIN_GAMES_BASE}/${encodeURIComponent(gameId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  if (!response.ok) {
    const msg = await parseResponseError(response, `Failed to delete game ${gameId}`)
    throw new Error(msg)
  }
}

export const uploadGameImage = async (
  token: string,
  file: File
): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(UPLOAD_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  })
  if (!response.ok) {
    const msg = await parseResponseError(response, 'Failed to upload image')
    throw new Error(msg)
  }
  const data: unknown = await response.json()
  if (isRecord(data) && isNonEmptyString(data.fileUrl)) {
    return data.fileUrl
  }
  throw new Error('Upload succeeded but no image URL was returned')
}
