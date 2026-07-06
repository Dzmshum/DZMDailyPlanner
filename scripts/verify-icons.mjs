import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const buildDir = join(root, 'build')

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

function walk(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

function isPng(file) {
  const buf = readFileSync(file)
  return (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  )
}

const required = [
  'icon.png',
  'favicon.png',
  ...palettes.map((p) => `icons/${p}.png`),
  ...palettes.flatMap((p) => views.map((v) => `icons/views/${p}/${v}.png`)),
  ...palettes.flatMap((p) => uiIcons.map((i) => `icons/ui/${p}/${i}.png`)),
]

const errors = []

for (const rel of required) {
  const full = join(buildDir, rel)
  if (!existsSync(full)) {
    errors.push(`Missing build/${rel}`)
    continue
  }
  if (!isPng(full)) {
    errors.push(`Invalid PNG: build/${rel}`)
  }
}

const electronIcon = join(root, 'resources/icon.png')
if (!existsSync(electronIcon)) {
  errors.push('Missing resources/icon.png (electron-builder app icon)')
} else if (!isPng(electronIcon)) {
  errors.push('Invalid PNG: resources/icon.png')
}

const sourceInBuild = walk(join(buildDir, 'icons')).filter((f) => f.endsWith('-source.png'))
if (sourceInBuild.length > 0) {
  errors.push(
    `Found ${sourceInBuild.length} *-source.png in build/ — run strip-icon-sources before electron pack`,
  )
}

if (errors.length > 0) {
  console.error('Icon verification failed:\n')
  for (const err of errors) console.error(`  - ${err}`)
  process.exit(1)
}

console.log(
  `Icons OK: ${required.length} assets in build/, electron icon in resources/, no source PNGs in build`,
)
