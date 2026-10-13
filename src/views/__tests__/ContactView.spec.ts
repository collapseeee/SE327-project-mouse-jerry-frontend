import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ContactView from '../ContactView.vue'

describe('ContactView', () => {
  const mountContactView = () => {
    return mount(ContactView)
  }

  it('renders contact card with header, channels, address, and map', () => {
    const wrapper = mountContactView()

    expect(wrapper.find('[data-test="contact-card"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Contact us')
    expect(wrapper.text()).toContain('Address')
    expect(wrapper.text()).toContain('Map')
  })

  it('renders all social and phone contact links with correct attributes', () => {
    const wrapper = mountContactView()

    const igLink = wrapper.find('[data-test="contact-instagram"]')
    expect(igLink.exists()).toBe(true)
    expect(igLink.attributes('href')).toBe('https://instagram.com')
    expect(igLink.attributes('target')).toBe('_blank')
    expect(igLink.text()).toContain('Instagram')

    const fbLink = wrapper.find('[data-test="contact-facebook"]')
    expect(fbLink.exists()).toBe(true)
    expect(fbLink.attributes('href')).toBe('https://facebook.com')
    expect(fbLink.attributes('target')).toBe('_blank')
    expect(fbLink.text()).toContain('Facebook')

    const phoneLink = wrapper.find('[data-test="contact-phone"]')
    expect(phoneLink.exists()).toBe(true)
    expect(phoneLink.attributes('href')).toBe('tel:+66123456789')
    expect(phoneLink.text()).toContain('+66 123 456 789')
  })

  it('renders address card with correct headquarters information', () => {
    const wrapper = mountContactView()
    const addrCard = wrapper.find('[data-test="contact-address-card"]')
    expect(addrCard.exists()).toBe(true)
    expect(addrCard.text()).toContain('Mouse Jerry Keys HQ')
    expect(addrCard.text()).toContain('Floor 99, Cyber Gaming Tower')
    expect(addrCard.text()).toContain('Nimmanhaemin Road')
    expect(addrCard.text()).toContain('Chiang Mai, Thailand 50200')
  })

  it('renders Google Map iframe with expected location parameters', () => {
    const wrapper = mountContactView()
    const mapIframe = wrapper.find('[data-test="contact-map-iframe"]')
    expect(mapIframe.exists()).toBe(true)
    const src = mapIframe.attributes('src')
    expect(src).toContain('maps.google.com/maps')
    expect(src).toContain('Nimmanhaemin+Road')
    expect(mapIframe.attributes('title')).toBe('Google Map Location - Nimmanhaemin Road, Chiang Mai')
  })
})
