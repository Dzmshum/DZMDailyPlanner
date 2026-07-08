const path = require('path')
const fs = require('fs')
const { planDir, ensurePlanDir } = require('./plan-file.cjs')

/** @typedef {{ x: number, y: number, width: number, height: number }} WindowLayout */

function layoutsPath() {
  return path.join(planDir(), 'window-layouts.json')
}

function isValidLayout(value) {
  if (!value || typeof value !== 'object') return false
  const { x, y, width, height } = value
  return (
    Number.isFinite(x) &&
    Number.isFinite(y) &&
    Number.isFinite(width) &&
    Number.isFinite(height) &&
    width > 0 &&
    height > 0
  )
}

/** @returns {{ standard?: WindowLayout, minimal?: WindowLayout }} */
function normalizeLayouts(raw) {
  /** @type {{ standard?: WindowLayout, minimal?: WindowLayout }} */
  const result = {}
  if (!raw || typeof raw !== 'object') return result

  for (const mode of ['standard', 'minimal']) {
    const layout = raw[mode]
    if (!isValidLayout(layout)) continue
    result[mode] = {
      x: Math.round(layout.x),
      y: Math.round(layout.y),
      width: Math.round(layout.width),
      height: Math.round(layout.height),
    }
  }

  return result
}

function loadWindowLayouts() {
  ensurePlanDir()
  const file = layoutsPath()
  if (!fs.existsSync(file)) return {}

  try {
    return normalizeLayouts(JSON.parse(fs.readFileSync(file, 'utf8')))
  } catch {
    return {}
  }
}

/** @param {{ standard?: WindowLayout, minimal?: WindowLayout }} layouts */
function writeWindowLayouts(layouts) {
  ensurePlanDir()
  const normalized = normalizeLayouts(layouts)
  fs.writeFileSync(layoutsPath(), `${JSON.stringify(normalized, null, 2)}\n`, 'utf8')
  return normalized
}

/** @param {'standard' | 'minimal'} mode @param {WindowLayout} bounds @param {{ standard?: WindowLayout, minimal?: WindowLayout }} layouts */
function saveWindowLayout(mode, bounds, layouts) {
  if (mode !== 'standard' && mode !== 'minimal') return layouts
  if (!isValidLayout(bounds)) return layouts

  const next = {
    ...layouts,
    [mode]: {
      x: Math.round(bounds.x),
      y: Math.round(bounds.y),
      width: Math.round(bounds.width),
      height: Math.round(bounds.height),
    },
  }

  return writeWindowLayouts(next)
}

module.exports = {
  loadWindowLayouts,
  saveWindowLayout,
  writeWindowLayouts,
  normalizeLayouts,
  isValidLayout,
  layoutsPath,
}
