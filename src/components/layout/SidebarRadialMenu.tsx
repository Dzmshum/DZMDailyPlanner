import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { NAV_ENTRIES, viewForNavEntry, type NavEntry } from '../../lib/nav'
import { radialArcPath, radialLayout, type RadialLayout } from '../../lib/radialMenu'
import { usePlanStore } from '../../store/planStore'
import { UiIcon } from '../ui/UiIcon'
import { ViewIcon } from './ViewIcon'

interface SidebarRadialMenuProps {
  open: boolean
  anchorRef: RefObject<HTMLButtonElement | null>
  onClose: () => void
  onOpenSettings: () => void
}

type RadialItem =
  | { id: string; kind: 'nav'; entry: NavEntry }
  | { id: 'settings'; kind: 'settings' }

const RADIAL_ITEMS: readonly RadialItem[] = [
  ...NAV_ENTRIES.map((entry) => ({ id: entry.id, kind: 'nav' as const, entry })),
  { id: 'settings', kind: 'settings' },
]

const ITEM_STAGGER_MS = 28

type Phase = 'closed' | 'open' | 'closing'

export function SidebarRadialMenu({ open, anchorRef, onClose, onOpenSettings }: SidebarRadialMenuProps) {
  const currentView = usePlanStore((s) => s.currentView)
  const setView = usePlanStore((s) => s.setView)
  const [phase, setPhase] = useState<Phase>('closed')
  const [layout, setLayout] = useState<RadialLayout | null>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const focused = useRef(false)
  const reduceMotion = useRef(false)

  useEffect(() => {
    reduceMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    if (open) {
      setPhase('open')
      return
    }
    setPhase((current) => {
      if (current === 'closed' || reduceMotion.current) return 'closed'
      return 'closing'
    })
  }, [open])

  useLayoutEffect(() => {
    const layoutEl = document.querySelector('.app-layout')
    if (phase === 'closed') {
      layoutEl?.classList.remove('app-layout--radial-open')
      setLayout(null)
      focused.current = false
      return
    }

    const measure = () => {
      const anchor = anchorRef.current
      if (!anchor) return
      const rect = anchor.getBoundingClientRect()
      const x = rect.left + anchor.offsetWidth
      const y = rect.top + anchor.offsetHeight
      layoutEl?.classList.add('app-layout--radial-open')
      setLayout(radialLayout(x, y, RADIAL_ITEMS.length, window.innerHeight, window.innerWidth))
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [phase, anchorRef])

  useEffect(() => {
    if (phase !== 'open' || !layout || focused.current) return
    focused.current = true
    itemRefs.current[0]?.focus()
  }, [phase, layout])

  useEffect(() => {
    if (phase === 'closed') return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onClose()
        return
      }

      if (phase !== 'open') return

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
  }, [phase, onClose])

  if (phase === 'closed' || !layout) return null

  const closing = phase === 'closing'

  return createPortal(
    <div className={`sidebar-radial-root${closing ? ' sidebar-radial-root--closing' : ''}`}>
      <div className="sidebar-radial-backdrop" onClick={onClose} />
      <div
        className="sidebar-radial-frost"
        style={
          {
            '--frost-x': `${layout.cx}px`,
            '--frost-y': `${layout.cy}px`,
            '--frost-r': `${layout.radius + 36}px`,
          } as CSSProperties
        }
      />
      <svg className="sidebar-radial-arc" aria-hidden>
        <path d={radialArcPath(layout)} />
      </svg>
      <div id="sidebar-radial-menu" role="menu" aria-label="Разделы">
        {RADIAL_ITEMS.map((item, index) => {
          const point = layout.points[index]
          const delay =
            (closing ? RADIAL_ITEMS.length - 1 - index : index) * ITEM_STAGGER_MS
          const active = item.kind === 'nav' && item.entry.views.includes(currentView)
          const iconView =
            item.kind === 'nav' ? (active ? currentView : item.entry.defaultView) : null
          return (
            <button
              key={item.id}
              ref={(node) => {
                itemRefs.current[index] = node
              }}
              type="button"
              role="menuitem"
              className={`sidebar-radial-item${active ? ' active' : ''}`}
              style={{
                left: point.x,
                top: point.y,
                animationDelay: `${delay}ms`,
              }}
              aria-current={active ? 'page' : undefined}
              onAnimationEnd={(event) => {
                if (!closing || event.target !== event.currentTarget || index !== 0) return
                setPhase('closed')
              }}
              onClick={() => {
                if (item.kind === 'settings') onOpenSettings()
                else setView(viewForNavEntry(item.entry))
                onClose()
              }}
            >
              {item.kind === 'settings' ? (
                <UiIcon icon="settings" size="md" />
              ) : (
                <ViewIcon view={iconView ?? item.entry.defaultView} size="xs" />
              )}
              <span className="sidebar-radial-label">
                {item.kind === 'settings' ? 'Настройки' : item.entry.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>,
    document.body,
  )
}
