import { usePlanStore } from '../../store/planStore'
import { getElectronApi, isElectron } from '../../lib/electron'
import type { WindowMode } from '../../types'
import { UiIcon, type UiIconId } from '../ui/UiIcon'

const SIZE_ORDER = ['maximized', 'standard', 'minimal'] as const

const SIZE_ACTION: Record<WindowMode, { icon: UiIconId; label: string }> = {
  maximized: { icon: 'window-maximize', label: 'На весь экран' },
  standard: { icon: 'window-restore', label: 'Средний размер' },
  minimal: { icon: 'window-compact', label: 'Минимальный размер' },
}

function nextWindowSize(mode: WindowMode): WindowMode {
  const index = SIZE_ORDER.indexOf(mode)
  return SIZE_ORDER[(index + 1) % SIZE_ORDER.length]
}

export function WindowControls({ compact = false }: { compact?: boolean }) {
  const windowMode = usePlanStore((s) => s.data.settings.windowMode)
  const setWindowMode = usePlanStore((s) => s.setWindowMode)

  if (!isElectron()) return null

  const api = getElectronApi()
  const sizeAction = SIZE_ACTION[nextWindowSize(windowMode)]

  return (
    <div className={`window-controls ${compact ? 'window-controls-compact' : ''}`}>
      <button
        type="button"
        className="window-control-btn"
        onClick={() => void api.windowMinimize()}
        title="Свернуть"
        aria-label="Свернуть"
      >
        <UiIcon icon="window-minimize" size="xs" />
      </button>
      <button
        type="button"
        className="window-control-btn"
        onClick={() => setWindowMode(nextWindowSize(windowMode))}
        title={sizeAction.label}
        aria-label={sizeAction.label}
      >
        <UiIcon icon={sizeAction.icon} size="xs" />
      </button>
      <button
        type="button"
        className="window-control-btn window-control-close"
        onClick={() => void api.windowClose()}
        title="Закрыть"
        aria-label="Закрыть"
      >
        <span className="window-control-edge" aria-hidden="true" />
        <UiIcon icon="close" size="xs" />
      </button>
    </div>
  )
}
