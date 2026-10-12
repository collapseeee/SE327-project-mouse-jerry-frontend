export interface CartItem {
  id: number
  gameId: string
  gameTitle: string
  coverImage: string
  unitPrice: number
  stock: number
  quantity: number
  totalPrice: number
  category?: string
}

export interface CartDTO {
  items: CartItem[]
  totalItems: number
  totalAmount: number
}

export interface AddToCartPayload {
  gameId: string
  quantity?: number
}

export interface UpdateCartItemPayload {
  quantity: number
}
