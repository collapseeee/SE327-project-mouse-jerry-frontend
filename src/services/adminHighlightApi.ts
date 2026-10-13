import type { HighlightPayload, HighlightRecord } from '@/types/game'

const ADMIN_HIGHLIGHTS_API = '/api/v1/admin/highlights'
const PUBLIC_HIGHLIGHTS_API = '/api/v1/highlights'

const isRecord = (val: unknown): val is Record<string, unknown> => typeof val === 'object' && val !== null

const isNonEmptyString = (val: unknown): val is string => typeof val === 'string' && Boolean(val.trim())

const resolveString = (val: unknown, fallback = ''): string => (isNonEmptyString(val) ? val.trim() : fallback)

const resolveId = (val: unknown): string | number => {
  if (typeof val === 'number') {
    return val
  }
  if (typeof val === 'string' && Boolean(val.trim())) {
    return val.trim()
  }
  return 0
}

const mapRawToHighlight = (item: unknown): HighlightRecord | null => {
  if (!isRecord(item)) {
    return null
  }
  const id = resolveId(item.id)
  const gameId = resolveString(item.gameId)
  const gameName = resolveString(item.gameName, resolveString(item.name))
  const customImage = resolveString(item.customImage) || undefined
  const buttonColor = resolveString(item.buttonColor, '#8b0000')

  if (!gameId && !gameName) {
    return null
  }

  return {
    id,
    gameId,
    gameName,
    customImage,
    buttonColor,
    createdAt: resolveString(item.createdAt) || undefined
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
    return handleResponseError(response, 'Failed to create highlight')
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
    return handleResponseError(response, 'Failed to update highlight')
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
    return handleResponseError(response, 'Failed to delete highlight')
  }
}
