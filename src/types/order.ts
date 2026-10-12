export interface OrderItemKeyDTO {
  id?: number
  gameId: string
  gameTitle?: string
  coverImage?: string
  gameKey: string
  price: number
}

export interface OrderDTO {
  id: number
  orderNumber: string
  userId?: number
  username?: string
  totalAmount: number
  purchaseDate?: string
  items: OrderItemKeyDTO[]
}

export interface CheckoutRequestPayload {
  checkoutType?: 'cart' | 'single'
  gameId?: string
  quantity?: number
}

export interface OrderKeyItem {
  id?: number
  gameId?: string
  gameName: string
  coverImage: string
  key: string
  price?: number
}

export interface Order {
  id: string
  orderNumber?: string
  date: string
  totalAmount?: number
  items: OrderKeyItem[]
}

export interface DirectPurchaseGame {
  id: string
  name: string
  price: number
  coverImage: string
}

export interface DirectPurchaseItem {
  game: DirectPurchaseGame
  quantity: number
}
