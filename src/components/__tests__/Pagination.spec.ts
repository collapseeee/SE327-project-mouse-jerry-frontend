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

  it('renders all page numbers when totalPages is 4', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 2,
        totalPages: 4
      }
    })
    expect(wrapper.find('nav').exists()).toBe(true)
    const pageButtons = wrapper.findAll('button')
    // prev + 4 pages + next = 6 buttons
    expect(pageButtons).toHaveLength(6)
  })

  it('renders all page numbers when totalPages > 5 matching baseline', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        totalPages: 7
      }
    })
    expect(wrapper.text()).not.toContain('...')
    for (let p = 1; p <= 7; p++) {
      expect(wrapper.text()).toContain(String(p))
    }
    const pageButtons = wrapper.findAll('button')
    // prev + 7 pages + next = 9 buttons
    expect(pageButtons).toHaveLength(9)
  })

  it('highlights current page with active styling on later pages', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 6,
        totalPages: 8
      }
    })
    const activeBtn = wrapper.find('button[aria-current="page"]')
    expect(activeBtn.exists()).toBe(true)
    expect(activeBtn.text()).toBe('6')
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
    if (page2Btn) {
      await page2Btn.trigger('click')
    }

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

  it('does not emit page change when clicking the already active page button', async () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 2,
        totalPages: 5
      }
    })
    const page2Btn = wrapper.findAll('button').find((b) => b.text() === '2')
    expect(page2Btn).toBeDefined()
    if (page2Btn) {
      await page2Btn.trigger('click')
    }
    expect(wrapper.emitted('update:currentPage')).toBeUndefined()
    expect(wrapper.emitted('page-change')).toBeUndefined()
  })
})
