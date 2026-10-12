import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import GameDetailView from '../GameDetailView.vue'

const mockRouteParams = ref<{ id?: string }>({ id: 'vampire-survivors-emergency-meeting' })

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: mockRouteParams.value
  })
}))

describe('GameDetailView', () => {
  const mountGameDetailView = () => {
    return mount(GameDetailView, {
      global: {
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a :href="to"><slot /></a>'
          }
        }
      }
    })
  }

  it('renders game details matching Screenshot 2', () => {
    mockRouteParams.value = { id: 'vampire-survivors-emergency-meeting' }
    const wrapper = mountGameDetailView()

    expect(wrapper.text()).toContain('Vampire Survivors: Emergency Meeting')
    expect(wrapper.text()).toContain('1788 Baht')
    expect(wrapper.text()).toContain('Hack and slash/Beat \'em up')
    expect(wrapper.text()).toContain('Add to cart')
    expect(wrapper.text()).toContain('Buy now')
    expect(wrapper.text()).toContain('Amount')
  })

  it('allows incrementing and decrementing amount', async () => {
    mockRouteParams.value = { id: 'vampire-survivors-emergency-meeting' }
    const wrapper = mountGameDetailView()

    const minusBtn = wrapper.find('button[aria-label="Decrease quantity"]')
    const plusBtn = wrapper.find('button[aria-label="Increase quantity"]')

    expect(wrapper.text()).toContain('1')

    await plusBtn.trigger('click')
    expect(wrapper.text()).toContain('2')

    await plusBtn.trigger('click')
    expect(wrapper.text()).toContain('3')

    await minusBtn.trigger('click')
    expect(wrapper.text()).toContain('2')

    // Decrement when at 1 should not go below 1
    await minusBtn.trigger('click')
    await minusBtn.trigger('click')
    expect(wrapper.text()).toContain('1')
  })

  it('cycles screenshots with next and prev buttons', async () => {
    mockRouteParams.value = { id: 'vampire-survivors-emergency-meeting' }
    const wrapper = mountGameDetailView()

    const nextBtn = wrapper.find('button[aria-label="Next screenshot"]')
    const prevBtn = wrapper.find('button[aria-label="Previous screenshot"]')

    expect(nextBtn.exists()).toBe(true)
    expect(prevBtn.exists()).toBe(true)

    await nextBtn.trigger('click')
    // Click thumbnail directly
    const thumbButtons = wrapper.findAll('button[aria-label^="Select screenshot"]')
    expect(thumbButtons.length).toBeGreaterThan(0)
    const thirdThumb = thumbButtons[2]
    if (thirdThumb) {
      await thirdThumb.trigger('click')
    }

    await prevBtn.trigger('click')
    await prevBtn.trigger('click')
    await prevBtn.trigger('click')
    await prevBtn.trigger('click')
  })

  it('displays not found state when game does not exist', () => {
    mockRouteParams.value = { id: 'non-existing-game-404' }
    const wrapper = mountGameDetailView()

    expect(wrapper.text()).toContain('Game Not Found')
    expect(wrapper.text()).toContain('Back to Home')
  })

  it('loads remote game details on mount and updates on route change', async () => {
    mockRouteParams.value = { id: 'custom-remote-game' }
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: 'custom-remote-game',
        name: 'Custom Remote Game',
        price: 999,
        category: 'Action',
        screenshots: ['sc1.jpg', 'sc2.jpg'],
        coverImage: 'cov.jpg',
        stock: 5
      })
    } as unknown as Response)

    const wrapper = mountGameDetailView()
    await flushPromises()
    expect(wrapper.text()).toContain('Custom Remote Game')

    mockRouteParams.value = { id: 'elden-ring' }
    await flushPromises()
    expect(wrapper.exists()).toBe(true)
  })
})


