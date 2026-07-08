import { useEffect, useState } from 'react'
import { usePlanStore } from '../../store/planStore'
import { getElectronApi, isElectron } from '../../lib/electron'
import { UiIcon } from '../ui/UiIcon'

export function WindowControls({ compact = false }: { compact?: boolean }) {
  const [maximized, setMaximized] = useState(false)
  const windowMode = usePlanStore((s) => s.data.settings.windowMode)
  const setWindowMode = usePlanStore((s) => s.setWindowMode)

  useEffect(() => {
    if (!isElectron()) return
    void getElectronApi()
      .windowIsMaximized()
      .then(setMaximized)
      .catch(() => {})
  }, [windowMode])

  if (!isElectron()) return null

  const api = getElectronApi()

  const handleMaximize = () => {
    void api.windowToggleMaximize().then(setMaximized)
  }

  const handleMinimal = () => {
    setWindowMode('minimal')
  }

  const handleStandard = () => {
    setWindowMode('standard')
  }

  const handleMaximizedMode = () => {
    setWindowMode('maximized')
  }

  return (
    <div className={`window-controls ${compact ? 'window-controls-compact' : ''}`}>
      {!compact && windowMode !== 'minimal' && (
        <button
          type="button"
          className="window-control-btn"
          onClick={handleMinimal}
          title="Компактное окно"
          aria-label="Компактное окно"
        >
          <UiIcon icon="window-compact" size="xs" />
        </button>
      )}
      {compact && (
        <>
          <button
            type="button"
            className="window-control-btn"
            onClick={handleStandard}
            title="Обычное окно"
            aria-label="Обычное окно"
          >
            <UiIcon icon="window-expand" size="xs" />
          </button>
          <button
            type="button"
            className="window-control-btn"
            onClick={handleMaximizedMode}
            title="На весь экран"
            aria-label="На весь экран"
          >
            <UiIcon icon="window-maximize" size="xs" />
          </button>
        </>
      )}
      {!compact && (
        <button
          type="button"
          className="window-control-btn"
          onClick={handleMaximize}
          title={maximized ? 'Восстановить' : 'Развернуть'}
          aria-label={maximized ? 'Восстановить' : 'Развернуть'}
        >
          <UiIcon icon={maximized ? 'window-restore' : 'window-maximize'} size="xs" />
        </button>
      )}
      <button
        type="button"
        className="window-control-btn window-control-close"
        onClick={() => void api.windowClose()}
        title="Закрыть"
        aria-label="Закрыть"
      >
        <UiIcon icon="close" size="xs" />
      </button>
    </div>
  )
}
