/** Угловая траектория у левого края: первый пункт справа от логотипа, по диагонали вниз, дальше столбцом. */

const STEP = 64
const MIN_STEP = 56
const LOGO_HALF = 42
const LABEL_SPAN = 112

const BEND = [
  { dx: 96, dy: -24 },
  { dx: 68, dy: 62 },
  { dx: 20, dy: 124 },
] as const

const COLUMN_Y = BEND[BEND.length - 1].dy

export interface RadialPoint {
  x: number
  y: number
}

export interface RadialLayout {
  cx: number
  cy: number
  radius: number
  points: RadialPoint[]
}

export function radialLayout(
  originX: number,
  originY: number,
  count: number,
  viewportHeight = 800,
  viewportWidth = 1280,
): RadialLayout {
  const safeCount = Math.max(count, 1)
  const bottom = viewportHeight - 28
  const columnGaps = Math.max(safeCount - BEND.length, 1)
  const fitStep = (bottom - originY - COLUMN_Y) / columnGaps
  const step = Math.max(MIN_STEP, Math.min(STEP, fitStep))
  const points = Array.from({ length: safeCount }, (_, index) => {
    const offset =
      index < BEND.length
        ? BEND[index]
        : { dx: 0, dy: COLUMN_Y + (index - BEND.length + 1) * step }
    return {
      x: clamp(originX + offset.dx, 36, viewportWidth - 120),
      y: clamp(originY + offset.dy, 28, bottom),
    }
  })
  const far = points[points.length - 1]
  return {
    cx: originX,
    cy: originY,
    radius: Math.hypot(far.x - originX, far.y - originY),
    points,
  }
}

export function radialArcPath(layout: RadialLayout): string {
  const segments = layout.points.map((point) => `L ${point.x} ${point.y}`).join(' ')
  return `M ${layout.cx + LOGO_HALF} ${layout.cy} ${segments}`
}

/** Отступ заголовка при открытом меню: сразу за подписью первого пункта. */
export function radialHeaderPad(originX: number): number {
  return Math.round(originX + BEND[0].dx + LABEL_SPAN)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
