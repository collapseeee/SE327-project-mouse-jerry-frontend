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
  isHighlight?: boolean
}

export interface CategoryItem {
  id: string | number
  name: string
  slug: string
  isVisible?: boolean
}

export interface FetchGamesParams {
  category?: string
  search?: string
  page?: number
  size?: number
  sort?: string
  direction?: string
}

export interface GamesResponse {
  games: Game[]
  totalCount: number
}

