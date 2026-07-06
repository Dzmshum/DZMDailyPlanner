import { useEffect, useRef, useState } from 'react'
import { UiIcon } from './UiIcon'

export interface DropdownMenuItem {
  id: string
  label: string
  hint?: string
  onClick: () => void
  separatorBefore?: boolean
}

interface DropdownMenuProps {
  label: string
  items: DropdownMenuItem[]
  align?: 'left' | 'right'
}

export function DropdownMenu({ label, items, align = 'right' }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const runItem = (item: DropdownMenuItem) => {
    setOpen(false)
    item.onClick()
  }

  return (
    <div className={`dropdown-menu ${open ? 'is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="btn btn-menu-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span>{label}</span>
        <UiIcon icon="chevron-down" size="xs" className="dropdown-chevron" />
      </button>
      {open && (
        <div className={`dropdown-panel dropdown-align-${align}`} role="menu">
          {items.map((item) => (
            <div key={item.id}>
              {item.separatorBefore && <div className="dropdown-separator" role="separator" />}
              <button
                type="button"
                className="dropdown-item"
                role="menuitem"
                onClick={() => runItem(item)}
              >
                <span className="dropdown-item-label">{item.label}</span>
                {item.hint && <span className="dropdown-item-hint">{item.hint}</span>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
