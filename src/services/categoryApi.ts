import type { CategoryItem } from '@/types/game'

const API_BASE = '/api/v1/categories'

const isRecord = (val: unknown): val is Record<string, unknown> => typeof val === 'object' && val !== null

const isNonEmptyString = (val: unknown): val is string => typeof val === 'string' && Boolean(val.trim())

const isValidCategoryRecord = (item: unknown): item is Record<string, unknown> & { name: string } =>
  isRecord(item) && isNonEmptyString(item.name)

const resolveCategoryId = (id: unknown, fallback: string): string | number => {
  if (typeof id === 'number' || typeof id === 'string') {
    return id
  }
  return fallback
}

const resolveCategorySlug = (slug: unknown, fallback: string): string =>
  isNonEmptyString(slug) ? slug : fallback

const mapToCategoryItem = (item: unknown): CategoryItem | null => {
  if (!isValidCategoryRecord(item)) {
    return null
  }
  return {
    id: resolveCategoryId(item.id, item.name),
    name: item.name,
    slug: resolveCategorySlug(item.slug, item.name),
    isVisible: item.isVisible !== false
  }
}

const parseCategoriesList = (data: unknown): CategoryItem[] => {
  if (!Array.isArray(data)) {
    return []
  }
  return data
    .map(mapToCategoryItem)
    .filter((cat): cat is CategoryItem => cat !== null)
}

export const fetchCategories = async (): Promise<CategoryItem[]> => {
  try {
    const response = await fetch(API_BASE)
    if (!response.ok) {
      return []
    }
    const data: unknown = await response.json()
    return parseCategoriesList(data)
  } catch {
    return []
  }
}

export const fetchCategoryById = async (categoryId: number | string): Promise<CategoryItem | null> => {
  try {
    const response = await fetch(`${API_BASE}/${categoryId}`)
    if (!response.ok) {
      return null
    }
    const data: unknown = await response.json()
    return mapToCategoryItem(data)
  } catch {
    return null
  }
}
