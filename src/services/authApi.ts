import type { AuthResponse, LoginPayload, RegisterPayload } from '@/types/auth'

const API_BASE = '/api/v1/auth'

const isNonEmptyString = (val: unknown): val is string => typeof val === 'string' && Boolean(val.trim())

const isRecord = (val: unknown): val is Record<string, unknown> => typeof val === 'object' && val !== null

const getStringField = (obj: Record<string, unknown>, key: string): string | null => {
  const val = obj[key]
  return isNonEmptyString(val) ? val : null
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
  return getStringField(data, 'error') ?? getStringField(data, 'message')
}

const extractErrorMessage = (errData: unknown, fallback: string): string => {
  if (isNonEmptyString(errData)) {
    return errData
  }
  if (isRecord(errData)) {
    return extractObjectError(errData) ?? fallback
  }
  return fallback
}

export const loginUser = async (payload: LoginPayload): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    let errorMsg = 'Login failed'
    try {
      const errData = await response.json()
      errorMsg = extractErrorMessage(errData, errorMsg)
    } catch {
      errorMsg = response.statusText || errorMsg
    }
    throw new Error(errorMsg)
  }

  return response.json()
}

export const registerUser = async (payload: RegisterPayload): Promise<{ message: string; id?: number; username?: string }> => {
  const bodyPayload = {
    username: payload.username,
    email: payload.email,
    password: payload.password,
    confirmPassword: payload.confirmPassword || payload.password
  }

  const response = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bodyPayload)
  })

  if (!response.ok) {
    let errorMsg = 'Registration failed'
    try {
      const errData = await response.json()
      errorMsg = extractErrorMessage(errData, errorMsg)
    } catch {
      errorMsg = response.statusText || errorMsg
    }
    throw new Error(errorMsg)
  }

  return response.json()
}

export const logoutUser = async (token?: string | null): Promise<void> => {
  try {
    await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
  } catch {
    // Graceful logout fallback
  }
}
