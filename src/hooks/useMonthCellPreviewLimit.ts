import { useEffect, useState, type RefObject } from 'react'
import {
  computeMonthCellPreviewLimit,
  MONTH_CELL_LAYOUT,
} from '../lib/monthCalendarLayout'

export function useMonthCellPreviewLimit(
  gridRef: RefObject<HTMLElement | null>,
  weekRowCount: number,
): number {
  const [limit, setLimit] = useState<number>(MONTH_CELL_LAYOUT.fallbackSlots)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const measure = () => {
      setLimit(computeMonthCellPreviewLimit(grid.clientHeight, weekRowCount))
    }

    const observer = new ResizeObserver(measure)
    observer.observe(grid)
    measure()

    return () => observer.disconnect()
  }, [gridRef, weekRowCount])

  return limit
}
