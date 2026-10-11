export interface Game {
  id: string
  name: string
  price: number
  coverImage: string
  category: string
  categories?: string[]
  description?: string
  screenshots?: string[]
  publisher?: string
  releaseDate?: string
  stock?: number
}

export interface CategoryItem {
  id: string
  name: string
  slug: string
}
