import { useEffect, useRef } from 'react'
import { usePlanStore } from '../store/planStore'

export function useAutoSave(delayMs = 300) {
  const data = usePlanStore((s) => s.data)
  const loaded = usePlanStore((s) => s.loaded)
  const persist = usePlanStore((s) => s.persist)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!loaded) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      void persist()
    }, delayMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [data, loaded, persist, delayMs])
}
