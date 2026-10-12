import type {
  CheckoutRequestPayload,
  Order,
  OrderDTO,
  OrderItemKeyDTO,
  OrderKeyItem
} from '@/types/order'

const API_BASE = '/api/v1/orders'

const isRecord = (val: unknown): val is Record<string, unknown> =>
  typeof val === 'object' && val !== null

const isNonEmptyString = (val: unknown): val is string =>
  typeof val === 'string' && Boolean(val.trim())

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

const buildAuthHeaders = (token: string): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
})

const extractErrorMessage = (errData: unknown): string | null => {
  if (!isRecord(errData)) {
    return null
  }
  if (isNonEmptyString(errData.error)) {
    return errData.error
  }
  if (isNonEmptyString(errData.message)) {
    return errData.message
  }
  return null
}

const parseResponseError = async (response: Response, fallback: string): Promise<string> => {
  try {
    const errData = await response.json()
    const extracted = extractErrorMessage(errData)
    return extracted ?? (response.statusText || fallback)
  } catch {
    return response.statusText || fallback
  }
}

const mapRawOrderItem = (raw: unknown): OrderItemKeyDTO | null => {
  if (!isRecord(raw)) {
    return null
  }
  const gameId = parseStringField(raw.gameId)
  if (!gameId) {
    return null
  }
  return {
    id: typeof raw.id === 'number' ? raw.id : undefined,
    gameId,
    gameTitle: parseStringField(raw.gameTitle, 'Unknown Game'),
    coverImage: parseStringField(raw.coverImage),
    gameKey: parseStringField(raw.gameKey, 'XXXX-XXXX-XXXX'),
    price: parseNumericField(raw.price, 0)
  }
}

const mapRawOrderItemsList = (rawItems: unknown[]): OrderItemKeyDTO[] => {
  const items: OrderItemKeyDTO[] = []
  for (const item of rawItems) {
    const parsed = mapRawOrderItem(item)
    if (parsed) {
      items.push(parsed)
    }
  }
  return items
}

const mapRawOrderDTO = (raw: unknown): OrderDTO => {
  if (!isRecord(raw)) {
    return { id: 0, orderNumber: '', totalAmount: 0, items: [] }
  }
  const rawItems = Array.isArray(raw.items) ? raw.items : []
  return {
    id: parseNumericField(raw.id, 0),
    orderNumber: parseStringField(raw.orderNumber, ''),
    userId: typeof raw.userId === 'number' ? raw.userId : undefined,
    username: isNonEmptyString(raw.username) ? raw.username : undefined,
    totalAmount: parseNumericField(raw.totalAmount, 0),
    purchaseDate: isNonEmptyString(raw.purchaseDate) ? raw.purchaseDate : undefined,
    items: mapRawOrderItemsList(rawItems)
  }
}

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateStr
  }
}

export const mapOrderDtoToOrder = (dto: OrderDTO): Order => {
  const items: OrderKeyItem[] = (dto.items || []).map((item) => ({
    id: item.id,
    gameId: item.gameId,
    gameName: item.gameTitle || 'Unknown Game',
    coverImage: item.coverImage || '',
    key: item.gameKey || 'XXXX-XXXX-XXXX',
    price: item.price
  }))

  return {
    id: dto.orderNumber || String(dto.id),
    orderNumber: dto.orderNumber,
    date: formatDate(dto.purchaseDate),
    totalAmount: dto.totalAmount,
    items
  }
}

export const checkoutOrder = async (
  token: string,
  payload?: CheckoutRequestPayload
): Promise<OrderDTO> => {
  const response = await fetch(`${API_BASE}/checkout`, {
    method: 'POST',
    headers: buildAuthHeaders(token),
    body: JSON.stringify(payload || { checkoutType: 'cart' })
  })

  if (!response.ok) {
    const message = await parseResponseError(response, 'Checkout failed')
    throw new Error(message)
  }

  const data = await response.json()
  return mapRawOrderDTO(data)
}

export const fetchOrderHistory = async (token: string): Promise<OrderDTO[]> => {
  const response = await fetch(API_BASE, {
    method: 'GET',
    headers: buildAuthHeaders(token)
  })

  if (!response.ok) {
    const message = await parseResponseError(response, 'Failed to fetch order history')
    throw new Error(message)
  }

  const data = await response.json()
  if (!Array.isArray(data)) {
    return []
  }
  return data.map(mapRawOrderDTO)
}

export const fetchOrderByNumber = async (
  token: string,
  orderNumber: string
): Promise<OrderDTO> => {
  const response = await fetch(`${API_BASE}/${encodeURIComponent(orderNumber)}`, {
    method: 'GET',
    headers: buildAuthHeaders(token)
  })

  if (!response.ok) {
    const message = await parseResponseError(response, 'Order not found')
    throw new Error(message)
  }

  const data = await response.json()
  return mapRawOrderDTO(data)
}
