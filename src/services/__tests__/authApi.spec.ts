import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loginUser, registerUser, logoutUser } from '../authApi'

describe('authApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('loginUser returns AuthResponse on successful response', async () => {
    const mockResponse = {
      token: 'jwt-token-123',
      id: 1,
      username: 'thainchai',
      email: 'thainchai@example.com',
      role: 'ROLE_CUSTOMER'
    }

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    } as unknown as Response)

    const result = await loginUser({ username: 'thainchai', password: 'password123' })
    expect(result).toEqual(mockResponse)
    expect(fetch).toHaveBeenCalledWith('/api/v1/auth/login', expect.objectContaining({
      method: 'POST'
    }))
  })

  it('loginUser throws error message on non-ok response with json message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      statusText: 'Unauthorized',
      json: () => Promise.resolve({ message: 'Invalid credentials' })
    } as unknown as Response)

    await expect(loginUser({ username: 'thainchai', password: 'wrong' }))
      .rejects.toThrow('Invalid credentials')
  })

  it('loginUser throws statusText when response body is not json', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Request',
      json: () => Promise.reject(new Error('Not JSON'))
    } as unknown as Response)

    await expect(loginUser({ username: 'thainchai', password: 'wrong' }))
      .rejects.toThrow('Bad Request')
  })

  it('registerUser returns success payload on 201 response and sends confirmPassword', async () => {
    const mockSuccess = { message: 'User registered successfully', id: 2, username: 'newuser' }

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSuccess)
    } as unknown as Response)

    const result = await registerUser({
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    })

    expect(result).toEqual(mockSuccess)
    expect(fetchSpy).toHaveBeenCalledWith('/api/v1/auth/register', expect.objectContaining({
      body: JSON.stringify({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      })
    }))
  })

  it('registerUser defaults confirmPassword to password if not provided', async () => {
    const mockSuccess = { message: 'User registered successfully', id: 2, username: 'newuser' }

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSuccess)
    } as unknown as Response)

    const result = await registerUser({
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123'
    })

    expect(result).toEqual(mockSuccess)
    expect(fetchSpy).toHaveBeenCalledWith('/api/v1/auth/register', expect.objectContaining({
      body: JSON.stringify({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      })
    }))
  })

  it('registerUser throws error message on failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      statusText: 'Conflict',
      json: () => Promise.resolve({ message: 'Username already exists' })
    } as unknown as Response)

    await expect(registerUser({
      username: 'existing',
      email: 'test@example.com',
      password: 'password123'
    })).rejects.toThrow('Username already exists')
  })

  it('registerUser extracts backend error property and validation details', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Request',
      json: () => Promise.resolve({ error: 'Username or Email already taken!' })
    } as unknown as Response)

    await expect(registerUser({
      username: 'existing',
      email: 'test@example.com',
      password: 'password123'
    })).rejects.toThrow('Username or Email already taken!')

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Request',
      json: () => Promise.resolve({ error: 'Validation failed', details: { email: 'Email format is invalid' } })
    } as unknown as Response)

    await expect(registerUser({
      username: 'existing',
      email: 'bademail',
      password: 'password123'
    })).rejects.toThrow('Email format is invalid')
  })

  it('registerUser throws statusText when response body is not JSON', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Error',
      json: () => Promise.reject(new Error('Parse error'))
    } as unknown as Response)

    await expect(registerUser({
      username: 'existing',
      email: 'test@example.com',
      password: 'password123'
    })).rejects.toThrow('Internal Error')
  })

  it('logoutUser sends bearer token in authorization header', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true
    } as unknown as Response)

    await logoutUser('sample-token')

    expect(spy).toHaveBeenCalledWith('/api/v1/auth/logout', expect.objectContaining({
      headers: { Authorization: 'Bearer sample-token' }
    }))
  })

  it('logoutUser handles exception gracefully and works without token', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true
    } as unknown as Response)

    await logoutUser(null)
    expect(spy).toHaveBeenCalledWith('/api/v1/auth/logout', {
      method: 'POST',
      headers: {}
    })

    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'))
    await expect(logoutUser('token')).resolves.not.toThrow()
  })

  it('extracts direct string errors and handles non-record error bodies', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      statusText: '',
      json: () => Promise.resolve('Raw string failure')
    } as unknown as Response)

    await expect(loginUser({ username: 'u', password: 'p' }))
      .rejects.toThrow('Raw string failure')

    // Non-string, non-record body (e.g. number 404)
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      statusText: '',
      json: () => Promise.resolve(404)
    } as unknown as Response)

    await expect(loginUser({ username: 'u', password: 'p' }))
      .rejects.toThrow('Login failed')

    // Empty details object without string values falling back to error field
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      statusText: '',
      json: () => Promise.resolve({ error: 'Top-level error', details: { a: '' } })
    } as unknown as Response)

    await expect(loginUser({ username: 'u', password: 'p' }))
      .rejects.toThrow('Top-level error')

    // Response non-json with empty statusText
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      statusText: '',
      json: () => Promise.reject(new Error('SyntaxError'))
    } as unknown as Response)

    await expect(loginUser({ username: 'u', password: 'p' }))
      .rejects.toThrow('Login failed')
  })
})
