import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Pagination from '../Pagination.vue'

describe('Pagination', () => {
  it('does not render if totalPages <= 1', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        totalPages: 1
      }
    })
    expect(wrapper.find('nav').exists()).toBe(false)
  })

  it('renders all page numbers when totalPages <= 5', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 2,
        totalPages: 4
      }
    })
    expect(wrapper.find('nav').exists()).toBe(true)
    const pageButtons = wrapper.findAll('button')
    // prev + 4 pages + next = 6 buttons
    expect(pageButtons.length).toBe(6)
  })

  it('renders ellipsis when totalPages > 5 near start', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        totalPages: 6
      }
    })
    expect(wrapper.text()).toContain('...')
    expect(wrapper.text()).toContain('1')
    expect(wrapper.text()).toContain('2')
    expect(wrapper.text()).toContain('6')
  })

  it('renders ellipsis when totalPages > 5 near end', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 6,
        totalPages: 6
      }
    })
    expect(wrapper.text()).toContain('...')
    expect(wrapper.text()).toContain('1')
    expect(wrapper.text()).toContain('5')
    expect(wrapper.text()).toContain('6')
  })

  it('renders dual ellipsis when in middle', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 4,
        totalPages: 8
      }
    })
    expect(wrapper.text()).toContain('4')
    expect(wrapper.text()).toContain('8')
  })

  it('disables previous button on first page and next button on last page', () => {
    const wrapperFirst = mount(Pagination, {
      props: {
        currentPage: 1,
        totalPages: 5
      }
    })
    const prevBtn = wrapperFirst.find('button[aria-label="Previous page"]')
    expect(prevBtn.attributes('disabled')).toBeDefined()

    const wrapperLast = mount(Pagination, {
      props: {
        currentPage: 5,
        totalPages: 5
      }
    })
    const nextBtn = wrapperLast.find('button[aria-label="Next page"]')
    expect(nextBtn.attributes('disabled')).toBeDefined()
  })

  it('emits page-change and update:currentPage when clicking a page button', async () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        totalPages: 5
      }
    })
    const page2Btn = wrapper.findAll('button').find((b) => b.text() === '2')
    expect(page2Btn).toBeDefined()
    await page2Btn!.trigger('click')

    expect(wrapper.emitted('update:currentPage')?.[0]).toEqual([2])
    expect(wrapper.emitted('page-change')?.[0]).toEqual([2])
  })

  it('emits page change when clicking next and prev buttons', async () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 2,
        totalPages: 5
      }
    })
    const nextBtn = wrapper.find('button[aria-label="Next page"]')
    await nextBtn.trigger('click')
    expect(wrapper.emitted('update:currentPage')?.[0]).toEqual([3])

    const prevBtn = wrapper.find('button[aria-label="Previous page"]')
    await prevBtn.trigger('click')
    expect(wrapper.emitted('update:currentPage')?.[1]).toEqual([1])
  })
})
