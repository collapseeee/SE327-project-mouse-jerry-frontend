export type UserRole = 'ROLE_ADMIN' | 'ROLE_CUSTOMER'

export interface User {
  id: number
  username: string
  email?: string
  role?: UserRole
}

export interface AuthResponse {
  token: string
  type?: string
  id: number
  username: string
  email: string
  role: UserRole
  redirectUrl?: string
  message?: string
}

export interface LoginPayload {
  username: string
  password: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
  confirmPassword?: string
}

