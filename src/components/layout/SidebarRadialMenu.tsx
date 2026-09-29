import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { NAV_ENTRIES, viewForNavEntry } from '../../lib/nav'
import { radialArcPath, radialLayout, type RadialLayout } from '../../lib/radialMenu'
import { usePlanStore } from '../../store/planStore'
import { ViewIcon } from './ViewIcon'

interface SidebarRadialMenuProps {
  open: boolean
  compact: boolean
  anchorRef: RefObject<HTMLButtonElement | null>
  onClose: () => void
}

export function SidebarRadialMenu({ open, compact, anchorRef, onClose }: SidebarRadialMenuProps) {
  const currentView = usePlanStore((s) => s.currentView)
  const setView = usePlanStore((s) => s.setView)
  const [layout, setLayout] = useState<RadialLayout | null>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const focused = useRef(false)

  useLayoutEffect(() => {
    if (!open) {
      setLayout(null)
      focused.current = false
      return
    }

    const measure = () => {
      const anchor = anchorRef.current
      if (!anchor) return
      const rect = anchor.getBoundingClientRect()
      const x = compact ? rect.left + rect.width / 2 : rect.right - 8
      const y = rect.top + rect.height / 2
      setLayout(radialLayout(x, y, NAV_ENTRIES.length, window.innerHeight))
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [open, compact, anchorRef])

  useEffect(() => {
    if (!open || !layout || focused.current) return
    focused.current = true
    itemRefs.current[0]?.focus()
  }, [open, layout])

  useEffect(() => {
    if (!open) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onClose()
        return
      }

      if (
        event.key !== 'ArrowDown' &&
        event.key !== 'ArrowUp' &&
        event.key !== 'ArrowRight' &&
        event.key !== 'ArrowLeft'
      ) {
        return
      }

      event.preventDefault()
      const buttons = itemRefs.current.filter((node): node is HTMLButtonElement => node !== null)
      if (buttons.length === 0) return
      const current = buttons.findIndex((node) => node === document.activeElement)
      const dir = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1
      const next = buttons[(current + dir + buttons.length) % buttons.length]
      next?.focus()
    }

    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, onClose])

  if (!open || !layout) return null

  return createPortal(
    <div className="sidebar-radial-root">
      <div className="sidebar-radial-backdrop" onClick={onClose} />
      <svg className="sidebar-radial-arc" aria-hidden>
        <path d={radialArcPath(layout)} />
      </svg>
      <div id="sidebar-radial-menu" role="menu" aria-label="Разделы">
        {NAV_ENTRIES.map((entry, index) => {
          const point = layout.points[index]
          const active = entry.views.includes(currentView)
          const iconView = active ? currentView : entry.defaultView
          return (
            <button
              key={entry.id}
              ref={(node) => {
                itemRefs.current[index] = node
              }}
              type="button"
              role="menuitem"
              className={`sidebar-radial-item${active ? ' active' : ''}`}
              style={{
                left: point.x,
                top: point.y,
                animationDelay: `${index * 28}ms`,
              }}
              aria-current={active ? 'page' : undefined}
              onClick={() => {
                setView(viewForNavEntry(entry))
                onClose()
              }}
            >
              <ViewIcon view={iconView} size="xs" />
              <span className="sidebar-radial-label">{entry.label}</span>
            </button>
          )
        })}
      </div>
    </div>,
    document.body,
  )
}
