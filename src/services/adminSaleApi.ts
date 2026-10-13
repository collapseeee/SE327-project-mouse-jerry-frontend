import type { OrderDTO, OrderItemKeyDTO } from '@/types/order'
import {
  isRecord,
  parseStringField,
  parseOptionalString,
  parseNumericField,
  parseResponseError
} from './apiHelpers'

const ADMIN_ORDERS_ENDPOINT = '/api/v1/admin/orders'
const FALLBACK_ORDERS_ENDPOINT = '/api/v1/orders'

export interface AggregatedSaleItem {
  title: string
  quantity: number
}

export interface FormattedSaleDate {
  date: string
  yearWithComma: string
  time: string
}

export const formatSaleOrderId = (orderNumber?: string, id?: number | string): string => {
  const rawId = orderNumber || (id !== undefined ? String(id) : '')
  if (!rawId) {
    return 'ID: —'
  }
  if (rawId.length > 8) {
    return `ID: ${rawId.slice(0, 8)}...`
  }
  return `ID: ${rawId}`
}

export const formatSaleDateParts = (dateStr?: string): FormattedSaleDate => {
  if (!dateStr) {
    return { date: '—', yearWithComma: '', time: '' }
  }
  const dateObj = new Date(dateStr)
  if (Number.isNaN(dateObj.getTime())) {
    return { date: dateStr, yearWithComma: '', time: '' }
  }
  const day = dateObj.getDate()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[dateObj.getMonth()]
  const hours = String(dateObj.getHours()).padStart(2, '0')
  const minutes = String(dateObj.getMinutes()).padStart(2, '0')
  return {
    date: `${day} ${month}`,
    yearWithComma: `${dateObj.getFullYear()},`,
    time: `${hours}:${minutes}`
  }
}

export const aggregateSaleItems = (items?: OrderItemKeyDTO[]): AggregatedSaleItem[] => {
  if (!Array.isArray(items) || items.length === 0) {
    return []
  }
  const counts = new Map<string, number>()
  for (const item of items) {
    const title = item.gameTitle?.trim() || 'Unknown Game'
    counts.set(title, (counts.get(title) || 0) + 1)
  }
  return Array.from(counts.entries()).map(([title, quantity]) => ({
    title,
    quantity
  }))
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
    username: parseOptionalString(raw.username),
    totalAmount: parseNumericField(raw.totalAmount, 0),
    purchaseDate: parseOptionalString(raw.purchaseDate),
    items: mapRawOrderItemsList(rawItems)
  }
}

const parseOrdersResponse = async (response: Response): Promise<OrderDTO[]> => {
  const rawData: unknown = await response.json()
  if (!Array.isArray(rawData)) {
    return []
  }
  return rawData.map(mapRawOrderDTO)
}

const requestOrders = async (url: string, token: string): Promise<Response> =>
  fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })

export const fetchAdminSaleHistory = async (token: string): Promise<OrderDTO[]> => {
  const primaryResponse = await requestOrders(ADMIN_ORDERS_ENDPOINT, token)
  if (primaryResponse.ok) {
    return parseOrdersResponse(primaryResponse)
  }
  if (primaryResponse.status === 404) {
    const fallbackResponse = await requestOrders(FALLBACK_ORDERS_ENDPOINT, token)
    if (fallbackResponse.ok) {
      return parseOrdersResponse(fallbackResponse)
    }
    const fallbackMsg = await parseResponseError(fallbackResponse, 'Failed to fetch sale history')
    throw new Error(fallbackMsg)
  }
  const errorMsg = await parseResponseError(primaryResponse, 'Failed to fetch sale history')
  throw new Error(errorMsg)
}
