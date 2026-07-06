import type { ReactNode } from 'react'
import { UiIcon } from './UiIcon'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg' | 'xl'
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  if (!open) return null

  const sizeClass =
    size === 'xl' ? 'modal-xl' : size === 'lg' ? 'modal-lg' : ''

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal ${sizeClass}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h2 className="modal-title" id="modal-title">
            {title}
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Закрыть">
            <UiIcon icon="close" size="sm" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
