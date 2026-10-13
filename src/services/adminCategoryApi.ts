import type { CategoryItem } from '@/types/game'
import {
  isRecord,
  isNonEmptyString,
  parseStringField,
  parseResponseError
} from './apiHelpers'

const ADMIN_CATEGORIES_BASE = '/api/v1/admin/categories'

const isValidCategoryRecord = (item: unknown): item is Record<string, unknown> & { name: string } =>
  isRecord(item) && isNonEmptyString(item.name)

const resolveCategoryId = (val: unknown, fallback: string | number): string | number => {
  if (typeof val === 'number' || typeof val === 'string') {
    return val
  }
  return fallback
}

export const mapAdminCategory = (item: unknown): CategoryItem | null => {
  if (!isValidCategoryRecord(item)) {
    return null
  }
  return {
    id: resolveCategoryId(item.id, item.name),
    name: item.name,
    slug: parseStringField(item.slug, item.name),
    isVisible: item.isVisible !== false
  }
}

const parseCategoriesList = (rawData: unknown): CategoryItem[] => {
  if (!Array.isArray(rawData)) {
    return []
  }
  return rawData.map(mapAdminCategory).filter((cat): cat is CategoryItem => cat !== null)
}

const buildJsonAuthHeaders = (token: string): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
})

export const fetchAdminCategories = async (token: string): Promise<CategoryItem[]> => {
  const response = await fetch(ADMIN_CATEGORIES_BASE, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!response.ok) {
    const msg = await parseResponseError(response, 'Failed to fetch admin categories')
    throw new Error(msg)
  }
  const rawData: unknown = await response.json()
  return parseCategoriesList(rawData)
}

export const createAdminCategory = async (token: string, name: string): Promise<CategoryItem> => {
  const response = await fetch(ADMIN_CATEGORIES_BASE, {
    method: 'POST',
    headers: buildJsonAuthHeaders(token),
    body: JSON.stringify({ name: name.trim() })
  })
  if (!response.ok) {
    const msg = await parseResponseError(response, 'Failed to create category')
    throw new Error(msg)
  }
  const rawData: unknown = await response.json()
  const mapped = mapAdminCategory(rawData)
  if (!mapped) {
    throw new Error('Invalid category response received from server')
  }
  return mapped
}

export const updateAdminCategory = async (
  token: string,
  id: string | number,
  name: string
): Promise<CategoryItem> => {
  const response = await fetch(`${ADMIN_CATEGORIES_BASE}/${encodeURIComponent(String(id))}`, {
    method: 'PUT',
    headers: buildJsonAuthHeaders(token),
    body: JSON.stringify({ name: name.trim() })
  })
  if (!response.ok) {
    const msg = await parseResponseError(response, 'Failed to update category')
    throw new Error(msg)
  }
  const rawData: unknown = await response.json()
  const mapped = mapAdminCategory(rawData)
  if (!mapped) {
    throw new Error('Invalid category response received from server')
  }
  return mapped
}

export const toggleAdminCategoryVisibility = async (
  token: string,
  id: string | number,
  isVisible?: boolean
): Promise<CategoryItem> => {
  const body = typeof isVisible === 'boolean' ? JSON.stringify({ isVisible }) : undefined
  const response = await fetch(`${ADMIN_CATEGORIES_BASE}/${encodeURIComponent(String(id))}/visibility`, {
    method: 'PATCH',
    headers: buildJsonAuthHeaders(token),
    body
  })
  if (!response.ok) {
    const msg = await parseResponseError(response, 'Failed to toggle category visibility')
    throw new Error(msg)
  }
  const rawData: unknown = await response.json()
  const mapped = mapAdminCategory(rawData)
  if (!mapped) {
    throw new Error('Invalid category response received from server')
  }
  return mapped
}

export const deleteAdminCategory = async (token: string, id: string | number): Promise<void> => {
  const response = await fetch(`${ADMIN_CATEGORIES_BASE}/${encodeURIComponent(String(id))}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!response.ok) {
    const msg = await parseResponseError(response, 'Failed to delete category')
    throw new Error(msg)
  }
}
