import { useEffect } from 'react'
import { usePlanStore } from '../store/planStore'
import { applyElectronWindowMode, isElectron } from '../lib/electron'

export function useWindowMode() {
  const windowMode = usePlanStore((s) => s.data.settings.windowMode)
  const loaded = usePlanStore((s) => s.loaded)

  useEffect(() => {
    if (!loaded || !isElectron()) return
    void applyElectronWindowMode(windowMode)
  }, [windowMode, loaded])
}
