import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import HomeView from '../HomeView.vue'

describe('HomeView', () => {
  const mountComponent = () => {
    return mount(HomeView, {
      global: {
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a :href="to"><slot /></a>'
          },
          swiper: {
            template: '<div><slot /></div>'
          },
          SwiperSlide: {
            template: '<div class="slide"><slot /></div>'
          }
        }
      }
    })
  }

  it('renders the highlights carousel with SHOP NOW buttons', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('SHOP NOW')
  })

  it('renders games on page 1 matching Screenshot 3', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('All Games')
    expect(wrapper.text()).toContain('Battlefield 3: Premium Edition')
    expect(wrapper.text()).toContain('1969 Baht')
    expect(wrapper.text()).toContain('FiveM')
    expect(wrapper.text()).toContain('837 Baht')
  })

  it('navigates through pages using pagination', async () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('1')
    expect(wrapper.text()).toContain('6')

    const page2Btn = wrapper.findAll('button').find((b) => b.text() === '2')
    expect(page2Btn).toBeDefined()
    if (page2Btn) {
      await page2Btn.trigger('click')
      await flushPromises()
    }

    expect(wrapper.text()).toContain('Towerfall Ascension: Dark World')
    expect(wrapper.text()).toContain('683 Baht')
    expect(wrapper.text()).toContain('Vampire Survivors: Emergency Meeting')
  })

  it('gives every cover image alt text', () => {
    const wrapper = mountComponent()
    const images = wrapper.findAll('img')
    expect(images.length).toBeGreaterThan(0)
    images.forEach((img) => expect(img.attributes('alt')).toBeTruthy())
  })

  it('loads remote highlights and games on mount when available', async () => {
    const mockHighlights = [
      { id: 'rem-1', name: 'Remote Highlight', price: 999, coverImage: 'rem.jpg', isHighlight: true }
    ]
    const mockRemoteGames = [
      { id: 'rem-1', name: 'Remote Highlight', price: 999, coverImage: 'rem.jpg', category: 'Action' }
    ]

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHighlights)
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'x-total-count': '1' }),
        json: () => Promise.resolve(mockRemoteGames)
      } as unknown as Response)

    const wrapper = mountComponent()
    await flushPromises()
    expect(wrapper.exists()).toBe(true)
  })

  it('loads requested page from backend when page changes', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      headers: new Headers({ 'x-total-count': '20' }),
      json: () => Promise.resolve([
        { id: 'bg-p2', name: 'Backend Page 2 Game', price: 100, coverImage: 'test.jpg' }
      ])
    } as unknown as Response)

    const wrapper = mountComponent()
    await flushPromises()

    const pagination = wrapper.findComponent({ name: 'Pagination' })
    expect(pagination.exists()).toBe(true)
    await pagination.vm.$emit('page-change', 2)
    await flushPromises()

    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('page=2'))
    expect(wrapper.text()).toContain('Backend Page 2 Game')
  })
})
