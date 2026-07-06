import { create } from 'zustand'

interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
}

interface ConfirmState {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  danger: boolean
  resolver: ((confirmed: boolean) => void) | null
  requestConfirm: (options: ConfirmOptions) => Promise<boolean>
  resolve: (confirmed: boolean) => void
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  open: false,
  title: '',
  message: '',
  confirmLabel: 'Подтвердить',
  danger: false,
  resolver: null,

  requestConfirm: (options) =>
    new Promise<boolean>((resolve) => {
      set({
        open: true,
        title: options.title,
        message: options.message,
        confirmLabel: options.confirmLabel ?? 'Подтвердить',
        danger: options.danger ?? false,
        resolver: resolve,
      })
    }),

  resolve: (confirmed) => {
    const { resolver } = get()
    resolver?.(confirmed)
    set({
      open: false,
      resolver: null,
      title: '',
      message: '',
    })
  },
}))

export async function confirmAction(options: ConfirmOptions): Promise<boolean> {
  return useConfirmStore.getState().requestConfirm(options)
}
