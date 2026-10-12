import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AuthCard from '../AuthCard.vue'

describe('AuthCard', () => {
  it('renders brand elements and support contact information', () => {
    const wrapper = mount(AuthCard)

    expect(wrapper.text()).toContain('MOUSE JERRY')
    expect(wrapper.text()).toContain('Unlock the')
    expect(wrapper.text()).toContain('ultimate gaming')
    expect(wrapper.text()).toContain('experience.')
    expect(wrapper.text()).toContain('Experiencing issues?')
    expect(wrapper.find('a[href="mailto:support@mousejerry.com"]').exists()).toBe(true)
  })

  it('renders default register mode with all required fields', () => {
    const wrapper = mount(AuthCard, {
      props: { initialMode: 'register' }
    })

    expect(wrapper.find('h3').text()).toBe('CREATE ACCOUNT')
    expect(wrapper.find('[data-test="input-username"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="input-email"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="input-password"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="input-confirm-password"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="submit-btn"]').text()).toBe('Register')
    expect(wrapper.find('[data-test="toggle-mode-btn"]').text()).toBe('Login here')
  })

  it('toggles mode between register and login', async () => {
    const wrapper = mount(AuthCard, {
      props: { initialMode: 'register' }
    })

    const toggleBtn = wrapper.find('[data-test="toggle-mode-btn"]')
    await toggleBtn.trigger('click')

    expect(wrapper.find('h3').text()).toBe('LOGIN')
    expect(wrapper.find('[data-test="input-username"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="input-email"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="input-confirm-password"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="submit-btn"]').text()).toBe('Login')
    expect(wrapper.find('[data-test="toggle-mode-btn"]').text()).toBe('Register here')
    expect(wrapper.emitted('mode-change')?.[0]).toEqual(['login'])

    // Toggle back to register
    await toggleBtn.trigger('click')
    expect(wrapper.find('h3').text()).toBe('CREATE ACCOUNT')
    expect(wrapper.emitted('mode-change')?.[1]).toEqual(['register'])
  })

  it('shows error when username or password is missing', async () => {
    const wrapper = mount(AuthCard)

    await wrapper.find('[data-test="auth-form"]').trigger('submit.prevent')
    expect(wrapper.find('[data-test="error-msg"]').text()).toBe('Please fill in all required fields.')
  })

  it('shows error when email is missing in register mode', async () => {
    const wrapper = mount(AuthCard)

    await wrapper.find('[data-test="input-username"]').setValue('testuser')
    await wrapper.find('[data-test="input-password"]').setValue('secret123')
    await wrapper.find('[data-test="auth-form"]').trigger('submit.prevent')

    expect(wrapper.find('[data-test="error-msg"]').text()).toBe('Please provide an email address.')
  })

  it('shows error when passwords do not match in register mode', async () => {
    const wrapper = mount(AuthCard)

    await wrapper.find('[data-test="input-username"]').setValue('testuser')
    await wrapper.find('[data-test="input-email"]').setValue('user@example.com')
    await wrapper.find('[data-test="input-password"]').setValue('secret123')
    await wrapper.find('[data-test="input-confirm-password"]').setValue('different123')
    await wrapper.find('[data-test="auth-form"]').trigger('submit.prevent')

    expect(wrapper.find('[data-test="error-msg"]').text()).toBe('Passwords do not match.')
  })

  it('emits submit event when register form is valid', async () => {
    const wrapper = mount(AuthCard)

    await wrapper.find('[data-test="input-username"]').setValue('gamer123')
    await wrapper.find('[data-test="input-email"]').setValue('gamer@mousejerry.com')
    await wrapper.find('[data-test="input-password"]').setValue('correctpass')
    await wrapper.find('[data-test="input-confirm-password"]').setValue('correctpass')
    await wrapper.find('[data-test="auth-form"]').trigger('submit.prevent')

    expect(wrapper.find('[data-test="success-msg"]').exists()).toBe(false)
    expect(wrapper.emitted('submit')?.[0]).toEqual([{
      mode: 'register',
      username: 'gamer123',
      email: 'gamer@mousejerry.com',
      password: 'correctpass',
      confirmPassword: 'correctpass'
    }])
  })

  it('emits submit event when login form is valid', async () => {
    const wrapper = mount(AuthCard, {
      props: { initialMode: 'login' }
    })

    await wrapper.find('[data-test="input-username"]').setValue('gamer123')
    await wrapper.find('[data-test="input-password"]').setValue('correctpass')
    await wrapper.find('[data-test="auth-form"]').trigger('submit.prevent')

    expect(wrapper.find('[data-test="success-msg"]').exists()).toBe(false)
    expect(wrapper.emitted('submit')?.[0]).toEqual([{
      mode: 'login',
      username: 'gamer123',
      password: 'correctpass'
    }])
  })

  it('renders serverError in error alert and suppresses successMessage', () => {
    const wrapper = mount(AuthCard, {
      props: {
        initialMode: 'login',
        serverError: 'Account locked'
      }
    })

    expect(wrapper.find('[data-test="error-msg"]').text()).toBe('Account locked')
    expect(wrapper.find('[data-test="success-msg"]').exists()).toBe(false)
  })

  it('renders serverSuccess in success alert when provided', () => {
    const wrapper = mount(AuthCard, {
      props: {
        serverSuccess: 'Account created successfully!'
      }
    })

    expect(wrapper.find('[data-test="success-msg"]').text()).toBe('Account created successfully!')
  })

  it('handles serverError clearing to empty string in watch handler', async () => {
    const wrapper = mount(AuthCard, {
      props: {
        serverError: 'Initial error'
      }
    })

    expect(wrapper.find('[data-test="error-msg"]').text()).toBe('Initial error')

    await wrapper.setProps({ serverError: '' })
    expect(wrapper.find('[data-test="error-msg"]').exists()).toBe(false)
  })
})
