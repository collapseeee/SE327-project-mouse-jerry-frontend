import type { AddToCartPayload, CartDTO, CartItem } from '@/types/cart'

const API_BASE = '/api/v1/cart'

const isRecord = (val: unknown): val is Record<string, unknown> => typeof val === 'object' && val !== null

const isNonEmptyString = (val: unknown): val is string => typeof val === 'string' && Boolean(val.trim())

const parseStringField = (val: unknown, fallback = ''): string =>
  isNonEmptyString(val) ? val : fallback

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

const buildAuthHeaders = (token: string): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
})

const mapToCartItem = (raw: unknown): CartItem | null => {
  if (!isRecord(raw)) {
    return null
  }
  const idVal = parseNumericField(raw.id, 0)
  const gameIdVal = parseStringField(raw.gameId)
  if (!gameIdVal) {
    return null
  }
  const unitPriceVal = parseNumericField(raw.unitPrice, 0)
  const quantityVal = parseNumericField(raw.quantity, 1)
  const calculatedTotal = unitPriceVal * quantityVal

  return {
    id: idVal,
    gameId: gameIdVal,
    gameTitle: parseStringField(raw.gameTitle, 'Unknown Game'),
    coverImage: parseStringField(raw.coverImage),
    unitPrice: unitPriceVal,
    quantity: quantityVal,
    stock: parseNumericField(raw.stock, 0),
    totalPrice: parseNumericField(raw.totalPrice, calculatedTotal),
    category: isNonEmptyString(raw.category) ? raw.category : undefined
  }
}

const mapToCartDTO = (raw: unknown): CartDTO => {
  if (!isRecord(raw)) {
    return { items: [], totalItems: 0, totalAmount: 0 }
  }
  const rawItems = Array.isArray(raw.items) ? raw.items : []
  const items: CartItem[] = []
  for (const rawItem of rawItems) {
    const mapped = mapToCartItem(rawItem)
    if (mapped) {
      items.push(mapped)
    }
  }
  const totalItems = parseNumericField(
    raw.totalItems,
    items.reduce((acc, it) => acc + it.quantity, 0)
  )
  const totalAmount = parseNumericField(
    raw.totalAmount,
    items.reduce((acc, it) => acc + it.totalPrice, 0)
  )
  return { items, totalItems, totalAmount }
}

export const fetchCart = async (token: string): Promise<CartDTO> => {
  const response = await fetch(API_BASE, {
    method: 'GET',
    headers: buildAuthHeaders(token)
  })

  if (!response.ok) {
    const msg = await parseResponseError(response, 'Failed to load cart')
    throw new Error(msg)
  }

  const data: unknown = await response.json()
  return mapToCartDTO(data)
}

export const addToCart = async (token: string, payload: AddToCartPayload): Promise<CartDTO> => {
  const response = await fetch(`${API_BASE}/items`, {
    method: 'POST',
    headers: buildAuthHeaders(token),
    body: JSON.stringify({
      gameId: payload.gameId,
      quantity: payload.quantity ?? 1
    })
  })

  if (!response.ok) {
    const msg = await parseResponseError(response, 'Failed to add item to cart')
    throw new Error(msg)
  }

  const data: unknown = await response.json()
  return mapToCartDTO(data)
}

export const updateCartItemQuantity = async (
  token: string,
  gameId: string,
  quantity: number
): Promise<CartDTO> => {
  const response = await fetch(`${API_BASE}/items/${encodeURIComponent(gameId)}`, {
    method: 'PUT',
    headers: buildAuthHeaders(token),
    body: JSON.stringify({ quantity })
  })

  if (!response.ok) {
    const msg = await parseResponseError(response, 'Failed to update item quantity')
    throw new Error(msg)
  }

  const data: unknown = await response.json()
  return mapToCartDTO(data)
}

export const removeCartItem = async (token: string, gameId: string): Promise<CartDTO> => {
  const response = await fetch(`${API_BASE}/items/${encodeURIComponent(gameId)}`, {
    method: 'DELETE',
    headers: buildAuthHeaders(token)
  })

  if (!response.ok) {
    const msg = await parseResponseError(response, 'Failed to remove item from cart')
    throw new Error(msg)
  }

  const data: unknown = await response.json()
  return mapToCartDTO(data)
}

export const clearCart = async (token: string): Promise<void> => {
  const response = await fetch(API_BASE, {
    method: 'DELETE',
    headers: buildAuthHeaders(token)
  })

  if (!response.ok) {
    const msg = await parseResponseError(response, 'Failed to clear cart')
    throw new Error(msg)
  }
}
