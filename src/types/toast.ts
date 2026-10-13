export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  title?: string
  message: string
  gameTitle?: string
  type: ToastType
  duration?: number
}
