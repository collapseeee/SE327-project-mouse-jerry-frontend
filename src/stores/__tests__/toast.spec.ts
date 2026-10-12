import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useToastStore } from '../toast'

describe('useToastStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with empty toasts array', () => {
    const store = useToastStore()
    expect(store.toasts).toEqual([])
  })

  it('adds a toast from a string message with default info type', () => {
    const store = useToastStore()
    const id = store.showToast('Test notification')

    expect(store.toasts).toHaveLength(1)
    expect(store.toasts[0].id).toBe(id)
    expect(store.toasts[0].message).toBe('Test notification')
    expect(store.toasts[0].type).toBe('info')
  })

  it('adds a success toast using showSuccess', () => {
    const store = useToastStore()
    store.showSuccess('Operation successful', 'Elden Ring')

    expect(store.toasts).toHaveLength(1)
    expect(store.toasts[0].message).toBe('Operation successful')
    expect(store.toasts[0].gameTitle).toBe('Elden Ring')
    expect(store.toasts[0].type).toBe('success')
  })

  it('adds a cart success toast with formatted message using showCartSuccess', () => {
    const store = useToastStore()
    store.showCartSuccess('Hollow Knight')

    expect(store.toasts).toHaveLength(1)
    expect(store.toasts[0].message).toBe('Added "Hollow Knight" to your cart!')
    expect(store.toasts[0].gameTitle).toBe('Hollow Knight')
    expect(store.toasts[0].type).toBe('success')
  })

  it('adds error and info toasts', () => {
    const store = useToastStore()
    store.showError('Something went wrong')
    store.showInfo('Did you know?')

    expect(store.toasts).toHaveLength(2)
    expect(store.toasts[0].type).toBe('error')
    expect(store.toasts[1].type).toBe('info')
  })

  it('removes a toast by ID', () => {
    const store = useToastStore()
    const id1 = store.showToast('First')
    const id2 = store.showToast('Second')

    expect(store.toasts).toHaveLength(2)
    store.removeToast(id1)

    expect(store.toasts).toHaveLength(1)
    expect(store.toasts[0].id).toBe(id2)
  })

  it('clears all toasts', () => {
    const store = useToastStore()
    store.showToast('First')
    store.showToast('Second')

    expect(store.toasts).toHaveLength(2)
    store.clearToasts()
    expect(store.toasts).toHaveLength(0)
  })

  it('automatically removes toast after duration expires', () => {
    const store = useToastStore()
    store.showToast('Self-dismissing message', 'info', 2000)

    expect(store.toasts).toHaveLength(1)

    vi.advanceTimersByTime(1999)
    expect(store.toasts).toHaveLength(1)

    vi.advanceTimersByTime(1)
    expect(store.toasts).toHaveLength(0)
  })
})
