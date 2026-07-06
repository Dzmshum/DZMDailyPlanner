import type { MonthCellTaskPreview } from './selectors'
import { getMonthCellTaskPreview } from './selectors'

/** Размеры ячейки месяца (px) — должны совпадать с CSS */
export const MONTH_CELL_LAYOUT = {
  paddingVertical: 12,
  header: 28,
  innerGap: 4,
  taskRow: 17,
  moreRow: 14,
  gridRowGap: 4,
  minSlots: 1,
  maxSlots: 12,
  fallbackSlots: 4,
} as const

/** Сколько полосок задач помещается в строку сетки при данной высоте грида */
export function computeMonthCellPreviewLimit(
  gridHeightPx: number,
  weekRowCount: number,
): number {
  if (gridHeightPx <= 0 || weekRowCount <= 0) {
    return MONTH_CELL_LAYOUT.fallbackSlots
  }

  const { paddingVertical, header, innerGap, taskRow, gridRowGap, minSlots, maxSlots } =
    MONTH_CELL_LAYOUT

  const rowHeight =
    (gridHeightPx - gridRowGap * Math.max(0, weekRowCount - 1)) / weekRowCount
  const tasksArea = rowHeight - paddingVertical - header - innerGap
  const slots = Math.floor(tasksArea / taskRow)

  return Math.max(minSlots, Math.min(maxSlots, slots))
}

/** Превью с резервом строки под «+N», если задач больше лимита */
export function resolveMonthCellTaskPreview(
  tasks: Parameters<typeof getMonthCellTaskPreview>[0],
  day: Date,
  maxSlots: number,
): MonthCellTaskPreview {
  const preview = getMonthCellTaskPreview(tasks, day, maxSlots)
  if (preview.overflow > 0 && maxSlots > 1) {
    return getMonthCellTaskPreview(tasks, day, maxSlots - 1)
  }
  return preview
}
