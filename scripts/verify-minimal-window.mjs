/**
 * Минимальное окно Electron: компактная вёрстка v0.29.1.
 * Запуск: npx tsx scripts/verify-minimal-window.mjs
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const css = readFileSync(join(root, 'src/index.css'), 'utf8')
const minimalView = readFileSync(join(root, 'src/components/layout/MinimalView.tsx'), 'utf8')
const taskToggle = readFileSync(join(root, 'src/components/tasks/TaskCompleteToggle.tsx'), 'utf8')
const brandMark = readFileSync(join(root, 'src/components/layout/BrandMark.tsx'), 'utf8')
const mainCjs = readFileSync(join(root, 'electron/main.cjs'), 'utf8')

let failed = 0
let passed = 0

function assert(name, condition) {
  if (!condition) {
    console.error('FAIL:', name)
    failed += 1
  } else {
    console.log('OK:', name)
    passed += 1
  }
}

// --- CSS tokens ---
assert('minimal font tokens', css.includes('--minimal-font-title') && css.includes('--minimal-font-body'))
assert('minimal gap tokens', css.includes('--minimal-gap-item') && css.includes('--minimal-gap-footer'))
assert('minimal pad tokens', css.includes('--minimal-pad-header') && css.includes('--minimal-pad-body'))
assert('minimal content indent zero', css.includes('--minimal-content-indent: 0'))
assert('minimal container query', css.includes('container-type: inline-size') && css.includes('container-name: minimal'))
assert('minimal narrow brand swap', css.includes('@container minimal (max-width: 300px)'))
assert('minimal item title line-clamp', /\.minimal-item-title\s*\{[^}]*-webkit-line-clamp:\s*2/s.test(css))
assert('minimal footer flex-wrap', /\.minimal-footer\s*\{[^}]*flex-wrap:\s*wrap/s.test(css))
assert('minimal footer btn min-width', /\.minimal-footer-btn\s*\{[^}]*min-width:\s*0/s.test(css))
assert('compact task toggle CSS', css.includes('.task-complete-wrap--compact'))
assert('brand mark xs size', css.includes('.brand-mark-xs'))

// --- Components ---
assert('MinimalView compact toggle', minimalView.includes('size="compact"'))
assert('MinimalView dual brand', minimalView.includes('variant="icon"') && minimalView.includes('variant="wordmark"'))
assert('MinimalView footer short labels', minimalView.includes('minimal-btn-label-short'))
assert('MinimalView footer aria labels', minimalView.includes('aria-label="Быстрый захват'))
assert('TaskCompleteToggle size prop', taskToggle.includes("size?: 'default' | 'compact'"))
assert('TaskCompleteToggle compact class', taskToggle.includes('task-complete-wrap--compact'))
assert('BrandMark xs size', brandMark.includes("'xs'"))

// --- Electron IPC limits ---
assert('electron minimal min width 260', mainCjs.includes('setMinimumSize(260, 280)'))
assert('electron minimal max width 380', mainCjs.includes('setMaximumSize(380, 640)'))
assert('electron minimal default 280x380', mainCjs.includes('setSize(280, 380)'))

if (failed > 0) {
  console.error(`\n${failed} failed, ${passed} passed`)
  process.exit(1)
}

console.log(`\nMinimal window OK: ${passed} checks`)
