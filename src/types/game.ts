export interface SystemRequirements {
  os?: string
  processor?: string
  memory?: string
  graphics?: string
  storage?: string
}

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
  systemRequirements?: SystemRequirements
}

export interface GamePayload {
  id?: string
  name: string
  price: number
  coverImage?: string
  category?: string
  categoryIds?: number[]
  categories?: string[]
  description?: string
  screenshots?: string[]
  publisher?: string
  releaseDate?: string
  stock?: number
  isHighlight?: boolean
  systemRequirements?: SystemRequirements
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

export interface HighlightRecord {
  id: string | number
  gameId: string
  gameName: string
  customImage?: string
  buttonColor: string
  createdAt?: string
}

export interface HighlightPayload {
  gameId: string
  customImage?: string
  buttonColor?: string
}

