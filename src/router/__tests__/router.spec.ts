import { describe, it, expect } from 'vitest'
import router from '../index'

describe('router', () => {
  it('resolves / to the Home route', () => {
    const route = router.resolve('/')
    expect(route.name).toBe('Home')
  })

  it('resolves /login to the Login route', () => {
    const route = router.resolve('/login')
    expect(route.name).toBe('Login')
  })

  it('resolves /register to the Register route', () => {
    const route = router.resolve('/register')
    expect(route.name).toBe('Register')
  })
})
