import type { AuthResponse, LoginPayload, RegisterPayload } from '@/types/auth'

const API_BASE = '/api/v1/auth'

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
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
      errorMsg = errData.message || errorMsg
    } catch {
      errorMsg = response.statusText || errorMsg
    }
    throw new Error(errorMsg)
  }

  return response.json()
}

export async function registerUser(payload: RegisterPayload): Promise<{ message: string; id?: number; username?: string }> {
  const response = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    let errorMsg = 'Registration failed'
    try {
      const errData = await response.json()
      errorMsg = errData.message || errorMsg
    } catch {
      errorMsg = response.statusText || errorMsg
    }
    throw new Error(errorMsg)
  }

  return response.json()
}

export async function logoutUser(token?: string | null): Promise<void> {
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
