export const isRecord = (val: unknown): val is Record<string, unknown> => typeof val === 'object' && val !== null

export const isNonEmptyString = (val: unknown): val is string => typeof val === 'string' && Boolean(val.trim())

export const parseStringField = (val: unknown, fallback = ''): string =>
  isNonEmptyString(val) ? val : fallback

export const parseOptionalString = (val: unknown): string | undefined =>
  isNonEmptyString(val) ? val : undefined

export const parseNumericField = (val: unknown, fallback: number): number => {
  if (typeof val === 'number' && !Number.isNaN(val)) {
    return val
  }
  if (typeof val === 'string') {
    const parsed = Number.parseFloat(val)
    return Number.isNaN(parsed) ? fallback : parsed
  }
  return fallback
}

export const parseStringArray = (val: unknown): string[] => {
  if (!Array.isArray(val)) {
    return []
  }
  return val.filter(isNonEmptyString)
}

const extractDetailsError = (data: Record<string, unknown>): string | null => {
  const details = data.details
  if (!isRecord(details)) {
    return null
  }
  const messages = Object.values(details).filter(isNonEmptyString)
  return messages.length > 0 ? messages.join(', ') : null
}

const extractObjectError = (data: Record<string, unknown>): string | null => {
  const detailsMsg = extractDetailsError(data)
  if (detailsMsg) {
    return detailsMsg
  }
  const errorVal = data.error
  if (isNonEmptyString(errorVal)) {
    return errorVal
  }
  const msgVal = data.message
  return isNonEmptyString(msgVal) ? msgVal : null
}

export const extractErrorMessage = (errData: unknown, fallback: string): string => {
  if (isNonEmptyString(errData)) {
    return errData
  }
  if (isRecord(errData)) {
    return extractObjectError(errData) ?? fallback
  }
  return fallback
}

export const parseResponseError = async (response: Response, fallback: string): Promise<string> => {
  try {
    const errData = await response.json()
    return extractErrorMessage(errData, fallback)
  } catch {
    return response.statusText || fallback
  }
}
