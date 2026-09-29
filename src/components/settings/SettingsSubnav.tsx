import { useLayoutEffect, useRef, useState } from 'react'
import {
  filterSettingsSections,
  settingsSubnavNeeded,
  type SettingsTab,
} from '../../lib/settingsNav'

export function SettingsSubnav({ tab, query }: { tab: SettingsTab; query: string }) {
  const items = filterSettingsSections(query).filter((section) => section.tab === tab)
  const itemKey = items.map((section) => section.id).join('|')
  const probeRef = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  useLayoutEffect(() => {
    const panel = probeRef.current?.closest('.settings-panel')
    const body = panel?.querySelector('.settings-panel-body')
    if (!(panel instanceof HTMLElement) || !(body instanceof HTMLElement)) {
      setShow(false)
      return
    }

    const measure = () => {
      setShow(settingsSubnavNeeded(body.scrollHeight, panel.clientHeight, items.length))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(panel)
    observer.observe(body)
    return () => observer.disconnect()
  }, [itemKey, items.length])

  if (items.length < 2 || !show) {
    return <span ref={probeRef} hidden />
  }

  return (
    <div ref={probeRef} className="settings-subnav" role="navigation" aria-label="Подразделы">
      {items.map((section) => (
        <button
          key={section.id}
          type="button"
          className="settings-subnav-item"
          onClick={() => {
            document.getElementById(`settings-section-${section.id}`)?.scrollIntoView({
              block: 'start',
            })
          }}
        >
          {section.title}
        </button>
      ))}
    </div>
  )
}
