import { describe, it, expect } from 'vitest'
import router from '../index'

describe('router', () => {
  it('resolves / to the Home route', () => {
    const route = router.resolve('/')
    expect(route.name).toBe('Home')
  })
})
