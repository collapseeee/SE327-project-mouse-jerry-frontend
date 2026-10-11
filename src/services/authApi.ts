import type { AuthResponse, LoginPayload, RegisterPayload } from '@/types/auth'

const API_BASE = '/api/v1/auth'

const extractErrorMessage = (errData: unknown, fallback: string): string => {
  if (typeof errData === 'string' && errData.trim()) {
    return errData
  }
  if (errData && typeof errData === 'object') {
    const data = errData as Record<string, unknown>
    if (data.details && typeof data.details === 'object') {
      const details = Object.values(data.details as Record<string, unknown>)
        .filter((val): val is string => typeof val === 'string' && val.trim().length > 0)
      if (details.length > 0) {
        return details.join(', ')
      }
    }
    if (typeof data.error === 'string' && data.error.trim()) {
      return data.error
    }
    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message
    }
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
