import type { CategoryItem } from '@/types/game'

const API_BASE = '/api/v1/categories'

const isRecord = (val: unknown): val is Record<string, unknown> => typeof val === 'object' && val !== null

const isNonEmptyString = (val: unknown): val is string => typeof val === 'string' && Boolean(val.trim())

const mapToCategoryItem = (item: unknown): CategoryItem | null => {
  if (!isRecord(item)) {
    return null
  }
  const idValue = item.id
  const nameValue = item.name
  const slugValue = item.slug

  if (!isNonEmptyString(nameValue)) {
    return null
  }

  const validId = typeof idValue === 'number' || typeof idValue === 'string' ? idValue : String(nameValue)
  const validSlug = isNonEmptyString(slugValue) ? slugValue : String(nameValue)

  return {
    id: validId,
    name: nameValue,
    slug: validSlug,
    isVisible: item.isVisible !== false
  }
}

export const fetchCategories = async (): Promise<CategoryItem[]> => {
  try {
    const response = await fetch(API_BASE)
    if (!response.ok) {
      return []
    }
    const data: unknown = await response.json()
    if (!Array.isArray(data)) {
      return []
    }
    return data
      .map(mapToCategoryItem)
      .filter((cat): cat is CategoryItem => cat !== null)
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
