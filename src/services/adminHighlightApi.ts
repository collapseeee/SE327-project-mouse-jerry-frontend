import type { HighlightPayload, HighlightRecord } from '@/types/game'

const ADMIN_HIGHLIGHTS_API = '/api/v1/admin/highlights'
const PUBLIC_HIGHLIGHTS_API = '/api/v1/highlights'

const isRecord = (val: unknown): val is Record<string, unknown> => typeof val === 'object' && val !== null

const isNonEmptyString = (val: unknown): val is string => typeof val === 'string' && Boolean(val.trim())

const resolveString = (val: unknown, fallback = ''): string => (isNonEmptyString(val) ? val.trim() : fallback)

const resolveOptionalString = (val: unknown): string | undefined => {
  const str = resolveString(val)
  return str || undefined
}

const resolveId = (val: unknown): string | number => {
  if (typeof val === 'number') {
    return val
  }
  if (typeof val === 'string' && Boolean(val.trim())) {
    return val.trim()
  }
  return 0
}

const hasHighlightTarget = (gameId: string, gameName: string): boolean =>
  Boolean(gameId) || Boolean(gameName)

const mapRawToHighlight = (item: unknown): HighlightRecord | null => {
  if (!isRecord(item)) {
    return null
  }
  const gameId = resolveString(item.gameId)
  const fallbackName = resolveString(item.name)
  const gameName = resolveString(item.gameName, fallbackName)

  if (!hasHighlightTarget(gameId, gameName)) {
    return null
  }

  return {
    id: resolveId(item.id),
    gameId,
    gameName,
    customImage: resolveOptionalString(item.customImage),
    buttonColor: resolveString(item.buttonColor, '#8b0000'),
    createdAt: resolveOptionalString(item.createdAt)
  }
}

const parseHighlightList = (raw: unknown): HighlightRecord[] => {
  if (!Array.isArray(raw)) {
    return []
  }
  return raw.map(mapRawToHighlight).filter((item): item is HighlightRecord => item !== null)
}

const createAuthHeaders = (token?: string): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

const handleResponseError = async (response: Response, defaultMessage: string): Promise<never> => {
  let message = defaultMessage
  try {
    const errorBody: unknown = await response.json()
    if (isRecord(errorBody) && typeof errorBody.error === 'string') {
      message = errorBody.error
    }
  } catch {
    // Keep fallback message
  }
  throw new Error(message)
}

export const fetchAdminHighlights = async (token?: string): Promise<HighlightRecord[]> => {
  const headers = createAuthHeaders(token)
  let response = await fetch(ADMIN_HIGHLIGHTS_API, { headers })

  if (response.status === 404 || response.status === 401 || !response.ok) {
    response = await fetch(PUBLIC_HIGHLIGHTS_API)
  }

  if (!response.ok) {
    return []
  }

  const rawData: unknown = await response.json()
  return parseHighlightList(rawData)
}

export const createAdminHighlight = async (
  token: string,
  payload: HighlightPayload
): Promise<HighlightRecord> => {
  const response = await fetch(ADMIN_HIGHLIGHTS_API, {
    method: 'POST',
    headers: createAuthHeaders(token),
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    await handleResponseError(response, 'Failed to create highlight')
  }

  const rawData: unknown = await response.json()
  const mapped = mapRawToHighlight(rawData)
  if (!mapped) {
    throw new Error('Invalid highlight response format')
  }
  return mapped
}

export const updateAdminHighlight = async (
  token: string,
  id: string | number,
  payload: Partial<HighlightPayload>
): Promise<HighlightRecord> => {
  const response = await fetch(`${ADMIN_HIGHLIGHTS_API}/${id}`, {
    method: 'PUT',
    headers: createAuthHeaders(token),
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    await handleResponseError(response, 'Failed to update highlight')
  }

  const rawData: unknown = await response.json()
  const mapped = mapRawToHighlight(rawData)
  if (!mapped) {
    throw new Error('Invalid highlight response format')
  }
  return mapped
}

export const deleteAdminHighlight = async (
  token: string,
  id: string | number
): Promise<void> => {
  const response = await fetch(`${ADMIN_HIGHLIGHTS_API}/${id}`, {
    method: 'DELETE',
    headers: createAuthHeaders(token)
  })

  if (!response.ok) {
    await handleResponseError(response, 'Failed to delete highlight')
  }
}
