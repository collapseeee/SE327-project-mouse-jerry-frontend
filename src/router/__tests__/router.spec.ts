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

  it('resolves /category/:category to the Category route', () => {
    const route = router.resolve('/category/Fighting')
    expect(route.name).toBe('Category')
    expect(route.params.category).toBe('Fighting')
  })

  it('resolves /search to the Search route', () => {
    const route = router.resolve('/search')
    expect(route.name).toBe('Search')
  })

  it('resolves /product/:id to the GameDetail route', () => {
    const route = router.resolve('/product/vampire-survivors-emergency-meeting')
    expect(route.name).toBe('GameDetail')
    expect(route.params.id).toBe('vampire-survivors-emergency-meeting')
  })
})
