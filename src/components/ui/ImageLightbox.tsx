import { useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { suppressClickThrough } from '../../lib/suppressClickThrough'
import { UiIcon } from './UiIcon'

interface ImageLightboxProps {
  open: boolean
  src: string | null
  alt?: string
  title?: string
  onClose: () => void
}

export function ImageLightbox({
  open,
  src,
  alt = '',
  title,
  onClose,
}: ImageLightboxProps) {
  const closeLightbox = useCallback(() => {
    suppressClickThrough()
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return

    document.documentElement.classList.add('lightbox-open')

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        closeLightbox()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.documentElement.classList.remove('lightbox-open')
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, closeLightbox])

  if (!open || !src) return null

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    event.preventDefault()
    event.stopPropagation()
    closeLightbox()
  }

  return createPortal(
    <div
      className="image-lightbox-overlay"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={handleBackdropClick}
      onWheel={(e) => e.preventDefault()}
      role="dialog"
      aria-modal="true"
      aria-label={title || alt || 'Просмотр изображения'}
    >
      <div className="image-lightbox-header" onClick={(e) => e.stopPropagation()}>
        {title && <span className="image-lightbox-title">{title}</span>}
        <button
          type="button"
          className="btn btn-ghost btn-icon image-lightbox-close"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            closeLightbox()
          }}
          aria-label="Закрыть"
        >
          <UiIcon icon="close" size="sm" />
        </button>
      </div>
      <div
        className="image-lightbox-stage"
        onClick={(e) => {
          if (e.target !== e.currentTarget) return
          e.preventDefault()
          e.stopPropagation()
          closeLightbox()
        }}
      >
        <img className="image-lightbox-image" src={src} alt={alt} />
      </div>
    </div>,
    document.body,
  )
}
