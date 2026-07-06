import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const iconsDir = join(root, 'public/icons')
const palettes = ['northrend', 'outland', 'pandaria']
const views = [
  'dashboard',
  'agenda',
  'week',
  'tasks',
  'history',
  'inbox',
  'daily',
  'projects',
]

const uiIcons = [
  'window-compact',
  'window-expand',
  'window-maximize',
  'window-restore',
  'close',
  'chevron-down',
  'chevron-right',
]

const paletteColors = {
  northrend: '#30cfea',
  outland: '#92d038',
  pandaria: '#3daa6a',
}

/** Простые SVG-иконки для вкладок без исходного PNG */
const viewSvgPaths = {
  dashboard: '<rect x="14" y="14" width="20" height="20" rx="3" fill="COLOR"/><rect x="42" y="14" width="20" height="9" rx="2" fill="COLOR" opacity="0.7"/><rect x="42" y="27" width="20" height="7" rx="2" fill="COLOR" opacity="0.45"/><rect x="14" y="40" width="48" height="10" rx="2" fill="COLOR" opacity="0.55"/>',
  agenda:
    '<rect x="16" y="12" width="44" height="40" rx="4" fill="none" stroke="COLOR" stroke-width="3"/><line x1="16" y1="22" x2="60" y2="22" stroke="COLOR" stroke-width="2"/><circle cx="24" cy="32" r="3" fill="COLOR"/><line x1="32" y1="32" x2="52" y2="32" stroke="COLOR" stroke-width="2"/><circle cx="24" cy="42" r="3" fill="COLOR"/><line x1="32" y1="42" x2="48" y2="42" stroke="COLOR" stroke-width="2"/>',
  week: '<rect x="10" y="18" width="10" height="28" rx="2" fill="COLOR" opacity="0.45"/><rect x="22" y="12" width="10" height="34" rx="2" fill="COLOR" opacity="0.65"/><rect x="34" y="16" width="10" height="30" rx="2" fill="COLOR"/><rect x="46" y="20" width="10" height="26" rx="2" fill="COLOR" opacity="0.8"/><rect x="58" y="14" width="10" height="32" rx="2" fill="COLOR" opacity="0.55"/>',
  tasks:
    '<rect x="14" y="16" width="44" height="8" rx="2" fill="COLOR" opacity="0.5"/><rect x="14" y="28" width="44" height="8" rx="2" fill="COLOR" opacity="0.7"/><rect x="14" y="40" width="44" height="8" rx="2" fill="COLOR"/><circle cx="20" cy="20" r="3" fill="#0a0f14"/><circle cx="20" cy="32" r="3" fill="#0a0f14"/><circle cx="20" cy="44" r="3" fill="#0a0f14"/>',
  history:
    '<path d="M36 14a18 18 0 1 0 0 36" fill="none" stroke="COLOR" stroke-width="3"/><polyline points="36,20 36,36 48,36" fill="none" stroke="COLOR" stroke-width="3" stroke-linecap="round"/><polyline points="22,18 36,14 40,28" fill="COLOR"/>',
  inbox:
    '<path d="M14 22h48l-8 14H22z" fill="COLOR" opacity="0.85"/><rect x="14" y="22" width="48" height="24" rx="4" fill="none" stroke="COLOR" stroke-width="3"/><line x1="30" y1="36" x2="46" y2="36" stroke="COLOR" stroke-width="2"/>',
  daily:
    '<polygon points="36,10 52,22 52,46 20,46 20,22" fill="COLOR" opacity="0.25"/><polygon points="36,10 52,22 52,46 20,46 20,22" fill="none" stroke="COLOR" stroke-width="3"/><circle cx="36" cy="32" r="6" fill="COLOR"/>',
  projects:
    '<path d="M12 24l24-12 24 12v22H12z" fill="COLOR" opacity="0.35"/><path d="M12 24l24-12 24 12v22H12z" fill="none" stroke="COLOR" stroke-width="3"/><rect x="30" y="34" width="12" height="12" rx="1" fill="COLOR"/>',
}

mkdirSync(iconsDir, { recursive: true })
mkdirSync(join(root, 'resources'), { recursive: true })

function removeLightBackground(inputBuffer) {
  return sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
    .then(({ data, info }) => {
      const { width, height, channels } = info

      for (let i = 0; i < data.length; i += channels) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        const spread = max - min
        const lum = (r + g + b) / 3

        const isWhite = max >= 238 && lum >= 225
        const isLightGrayBg = lum >= 200 && spread <= 18
        const isCheckerGray = lum >= 175 && lum <= 210 && spread <= 8

        if (isWhite || isLightGrayBg || isCheckerGray) {
          data[i + 3] = 0
        }
      }

      return sharp(data, { raw: { width, height, channels } })
    })
}

function buildViewSvg(view, color) {
  const body = viewSvgPaths[view].replaceAll('COLOR', color)
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 72 72">${body}</svg>`,
  )
}

async function processIcon(sourcePath, outPath, size) {
  const source = readFileSync(sourcePath)
  const png = await removeLightBackground(source)
    .then((img) =>
      img
        .trim()
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png({ compressionLevel: 9, palette: true })
        .toBuffer(),
    )

  writeFileSync(outPath, png)
  const rel = outPath.replace(root + '\\', '').replace(root + '/', '')
  console.log(`${rel}: ${Math.round(png.length / 1024)} KB (${size}px)`)
}

async function ensureViewIcon(palette, view) {
  const viewDir = join(iconsDir, 'views', palette)
  mkdirSync(viewDir, { recursive: true })
  const source = join(viewDir, `${view}-source.png`)
  const out = join(viewDir, `${view}.png`)

  if (!existsSync(source)) {
    const svgTemplate = viewSvgPaths[view]
    if (!svgTemplate) {
      console.error(`Missing ${source} (no SVG fallback for ${view})`)
      process.exit(1)
    }
    const color = paletteColors[palette]
    const svg = buildViewSvg(view, color)
    await sharp(svg).png().toFile(source)
    console.warn(`Generated placeholder ${source} — add a proper *-source.png`)
  }

  await processIcon(source, out, 96)
}

async function ensureUiIcon(palette, icon) {
  const uiDir = join(iconsDir, 'ui', palette)
  mkdirSync(uiDir, { recursive: true })
  const source = join(uiDir, `${icon}-source.png`)
  const out = join(uiDir, `${icon}.png`)

  if (!existsSync(source)) {
    console.error(`Missing ${source}`)
    process.exit(1)
  }

  await processIcon(source, out, 64)
}

for (const palette of palettes) {
  const source = join(iconsDir, `${palette}-source.png`)
  if (!existsSync(source)) {
    console.error(`Missing ${source}`)
    process.exit(1)
  }
  await processIcon(source, join(iconsDir, `${palette}.png`), 192)
}

for (const palette of palettes) {
  for (const view of views) {
    await ensureViewIcon(palette, view)
  }
}

for (const palette of palettes) {
  for (const icon of uiIcons) {
    await ensureUiIcon(palette, icon)
  }
}

const northrendSource = join(iconsDir, 'northrend-source.png')
await processIcon(northrendSource, join(root, 'public/icon.png'), 192)
await processIcon(northrendSource, join(root, 'resources/icon.png'), 512)

const favicon = await removeLightBackground(readFileSync(northrendSource)).then((img) =>
  img
    .trim()
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer(),
)
writeFileSync(join(root, 'public/favicon.png'), favicon)
console.log(`public/favicon.png: ${Math.round(favicon.length / 1024)} KB (32px)`)
