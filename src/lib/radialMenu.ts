/** Дуга справа от логотипа. Верх круга — у логотипа, пункты начинаются ниже шапки. */

const ITEM_GAP = 58
const LOGO_CLEAR_DEG = 56
const SWEEP_DEG = 100

export interface RadialPoint {
  x: number
  y: number
}

export interface RadialLayout {
  cx: number
  cy: number
  radius: number
  arcStart: number
  arcEnd: number
  points: RadialPoint[]
}

export function radialLayout(
  originX: number,
  originY: number,
  count: number,
  viewportHeight = 800,
): RadialLayout {
  const safeCount = Math.max(count, 1)
  const bottom = Math.max(originY + ITEM_GAP, viewportHeight - 32)
  const room = Math.max(ITEM_GAP, bottom - originY - 24)
  const gap = Math.min(ITEM_GAP, room / Math.max(safeCount - 1, 1))
  const step = SWEEP_DEG / Math.max(safeCount - 1, 1)
  const radius = gap / (2 * Math.sin(((step / 2) * Math.PI) / 180))
  const first = -90 + LOGO_CLEAR_DEG
  const arcEnd = first + SWEEP_DEG
  const arcStart = first - 18
  const cx = originX
  const cy = originY + radius
  const points = Array.from({ length: safeCount }, (_, index) => {
    const rad = ((first + step * index) * Math.PI) / 180
    return {
      x: cx + Math.cos(rad) * radius,
      y: cy + Math.sin(rad) * radius,
    }
  })
  return {
    cx,
    cy,
    radius,
    arcStart,
    arcEnd,
    points,
  }
}

export function radialArcPath(layout: RadialLayout): string {
  const start = (layout.arcStart * Math.PI) / 180
  const end = (layout.arcEnd * Math.PI) / 180
  const x1 = layout.cx + Math.cos(start) * layout.radius
  const y1 = layout.cy + Math.sin(start) * layout.radius
  const x2 = layout.cx + Math.cos(end) * layout.radius
  const y2 = layout.cy + Math.sin(end) * layout.radius
  const large = layout.arcEnd - layout.arcStart > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${layout.radius} ${layout.radius} 0 ${large} 1 ${x2} ${y2}`
}
