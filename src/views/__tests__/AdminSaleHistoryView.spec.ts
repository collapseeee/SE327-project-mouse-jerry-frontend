import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import AdminSaleHistoryView from '../AdminSaleHistoryView.vue'
import { useAuthStore } from '@/stores/auth'
import { fetchAdminSaleHistory } from '@/services/adminSaleApi'
import type { OrderDTO } from '@/types/order'

vi.mock('@/services/adminSaleApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/adminSaleApi')>()
  return {
    ...actual,
    fetchAdminSaleHistory: vi.fn()
  }
})

const sampleSales: OrderDTO[] = [
  {
    id: 1,
    orderNumber: '6acdf966-4e5c-482a-a9fb-e08713d80ab5',
    userId: 10,
    username: 'customer',
    totalAmount: 1790,
    purchaseDate: '2026-10-13T16:30:00',
    items: [
      {
        id: 1,
        gameId: 'cyberpunk-2077',
        gameTitle: 'Cyberpunk 2077',
        coverImage: 'cyber.jpg',
        gameKey: 'KEY-1234-5678',
        price: 1790
      }
    ]
  },
  {
    id: 2,
    orderNumber: 'ORD-555',
    userId: 11,
    username: 'alice',
    totalAmount: 630,
    purchaseDate: '2026-10-14T09:15:00',
    items: [
      {
        id: 2,
        gameId: 'hollow-knight',
        gameTitle: 'Hollow Knight',
        coverImage: 'hollow.jpg',
        gameKey: 'HK-1',
        price: 315
      },
      {
        id: 3,
        gameId: 'hollow-knight',
        gameTitle: 'Hollow Knight',
        coverImage: 'hollow.jpg',
        gameKey: 'HK-2',
        price: 315
      }
    ]
  }
]

describe('AdminSaleHistoryView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()

    const authStore = useAuthStore()
    authStore.setUserSession({ id: 1, username: 'admin', role: 'ROLE_ADMIN' }, 'mock-token')
  })

  it('renders page title and loads sales into the table', async () => {
    vi.mocked(fetchAdminSaleHistory).mockResolvedValueOnce(sampleSales)

    const wrapper = mount(AdminSaleHistoryView)
    await flushPromises()

    expect(wrapper.text()).toContain('SALE HISTORY')
    expect(wrapper.find('[data-test="sale-history-table"]').exists()).toBe(true)

    // First sale row
    const row1 = wrapper.find('[data-test="sale-row-6acdf966-4e5c-482a-a9fb-e08713d80ab5"]')
    expect(row1.exists()).toBe(true)
    expect(row1.text()).toContain('13 Oct')
    expect(row1.text()).toContain('2026,')
    expect(row1.text()).toContain('16:30')
    expect(row1.text()).toContain('customer')
    expect(row1.text()).toContain('ID: 6acdf966...')
    expect(row1.text()).toContain('Cyberpunk 2077')
    expect(row1.text()).toContain('(x1)')
    expect(row1.text()).toContain('Completed')

    // Second sale row with aggregated items
    const row2 = wrapper.find('[data-test="sale-row-ORD-555"]')
    expect(row2.exists()).toBe(true)
    expect(row2.text()).toContain('14 Oct')
    expect(row2.text()).toContain('alice')
    expect(row2.text()).toContain('ID: ORD-555')
    expect(row2.text()).toContain('Hollow Knight')
    expect(row2.text()).toContain('(x2)')
  })

  it('renders empty state when no sale history exists', async () => {
    vi.mocked(fetchAdminSaleHistory).mockResolvedValueOnce([])

    const wrapper = mount(AdminSaleHistoryView)
    await flushPromises()

    expect(wrapper.text()).toContain('No sale history found')
  })

  it('handles load error and allows retry', async () => {
    vi.mocked(fetchAdminSaleHistory)
      .mockRejectedValueOnce(new Error('Network error loading sales'))
      .mockResolvedValueOnce(sampleSales)

    const wrapper = mount(AdminSaleHistoryView)
    await flushPromises()

    expect(wrapper.text()).toContain('Network error loading sales')
    const retryBtn = wrapper.find('button.underline')
    expect(retryBtn.exists()).toBe(true)

    await retryBtn.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('customer')
    expect(fetchAdminSaleHistory).toHaveBeenCalledTimes(2)
  })

  it('does not load sales when unauthenticated', async () => {
    const authStore = useAuthStore()
    authStore.token = null

    mount(AdminSaleHistoryView)
    await flushPromises()

    expect(fetchAdminSaleHistory).not.toHaveBeenCalled()
  })

  it('renders fallback when order has no items', async () => {
    const emptyOrder: OrderDTO = {
      id: 99,
      orderNumber: 'ORD-EMPTY',
      username: 'bob',
      totalAmount: 0,
      items: []
    }
    vi.mocked(fetchAdminSaleHistory).mockResolvedValueOnce([emptyOrder])

    const wrapper = mount(AdminSaleHistoryView)
    await flushPromises()

    const row = wrapper.find('[data-test="sale-row-ORD-EMPTY"]')
    expect(row.exists()).toBe(true)
    expect(row.text()).toContain('No items')
  })
})
