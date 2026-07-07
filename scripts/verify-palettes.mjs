/**
 * Палитры, кастомная тема, дефолты v0.24–v0.25.
 * Запуск: npx tsx scripts/verify-palettes.mjs
 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import {
  createDefaultPlan,
  normalizePlan,
  PALETTE_LABELS,
  PALETTE_HINTS,
  DEFAULT_CUSTOM_THEME,
} from '../src/types/index.ts'
import {
  COLOR_PALETTE_IDS,
  WOW_PALETTE_IDS,
  UNIVERSE_PALETTE_IDS,
  isColorPalette,
  normalizeColorPalette,
} from '../src/lib/palettes.ts'
import {
  normalizeCustomTheme,
  exportThemeJson,
  importThemeJson,
} from '../src/lib/customTheme.ts'

const root = process.cwd()
const cssPath = join(root, 'src/index.css')
const typesPath = join(root, 'src/types/index.ts')
const iconsDir = join(root, 'public/icons')

const CSS_PALETTES = [
  'plain',
  'northrend',
  'outland',
  'pandaria',
  'starwars',
  'got',
  'witcher',
  'custom',
]

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

// --- CSS ---
const css = readFileSync(cssPath, 'utf8')
for (const id of CSS_PALETTES) {
  assert(`CSS dark: ${id}`, css.includes(`[data-palette='${id}'][data-theme='dark']`))
  assert(`CSS light: ${id}`, css.includes(`[data-palette='${id}'][data-theme='light']`))
}
assert('CSS body.custom-bg-image', css.includes('body.custom-bg-image'))
assert('CSS palette-group-title', css.includes('.palette-group-title'))

// --- types / labels ---
const types = readFileSync(typesPath, 'utf8')
assert("default colorPalette: 'plain'", types.includes("colorPalette: 'plain'"))

for (const id of COLOR_PALETTE_IDS) {
  assert(`PALETTE_LABELS[${id}]`, Boolean(PALETTE_LABELS[id]))
  assert(`PALETTE_HINTS[${id}]`, Boolean(PALETTE_HINTS[id]))
  assert(`types ColorPalette: ${id}`, types.includes(`'${id}'`))
}

assert('WOW_PALETTE_IDS = 3', WOW_PALETTE_IDS.length === 3)
assert('UNIVERSE_PALETTE_IDS = 3', UNIVERSE_PALETTE_IDS.length === 3)
assert('COLOR_PALETTE_IDS = 7', COLOR_PALETTE_IDS.length === 7)

// --- createDefaultPlan ---
const fresh = createDefaultPlan()
assert('createDefaultPlan: colorPalette plain', fresh.settings.colorPalette === 'plain')
assert('createDefaultPlan: ambientAnimation auto', fresh.settings.ambientAnimation === 'auto')
assert(
  'createDefaultPlan: customTheme disabled',
  fresh.settings.customTheme.enabled === false,
)
assert(
  'createDefaultPlan: customTheme defaults',
  fresh.settings.customTheme.accent === DEFAULT_CUSTOM_THEME.accent &&
    fresh.settings.customTheme.background === DEFAULT_CUSTOM_THEME.background,
)

// --- normalizePlan: palette ---
const keepNorthrend = normalizePlan({
  ...createDefaultPlan(),
  settings: { ...createDefaultPlan().settings, colorPalette: 'northrend' },
})
assert('normalizePlan: northrend сохраняется', keepNorthrend.settings.colorPalette === 'northrend')

const badPalette = normalizePlan({
  ...createDefaultPlan(),
  settings: { ...createDefaultPlan().settings, colorPalette: 'unknown' },
})
assert('normalizePlan: unknown → plain', badPalette.settings.colorPalette === 'plain')

const legacyNoPalette = normalizePlan({
  version: 1,
  settings: {
    theme: 'system',
    defaultView: 'dashboard',
    windowMode: 'standard',
    calendar: { showHolidays: true, calendarView: 'week' },
    daily: { enabled: true, days: [1, 4] },
    export: { includeDone: false, skipEmptyDays: true, exportTitle: 'x' },
    voiceInputEnabled: false,
    jira: {
      enabled: false,
      baseUrl: '',
      email: '',
      apiToken: '',
      projectKey: '',
      issueType: 'Task',
    },
  },
  projects: [],
  tasks: [],
})
assert('normalizePlan: без colorPalette → plain', legacyNoPalette.settings.colorPalette === 'plain')

assert('normalizePlan: ambientAnimation off', normalizePlan({
  ...createDefaultPlan(),
  settings: { ...createDefaultPlan().settings, ambientAnimation: 'off' },
}).settings.ambientAnimation === 'off')

assert('normalizePlan: ambientAnimation invalid → auto', normalizePlan({
  ...createDefaultPlan(),
  settings: { ...createDefaultPlan().settings, ambientAnimation: 'snow' },
}).settings.ambientAnimation === 'auto')

// --- customTheme ---
assert('normalizeCustomTheme: пустой → defaults', normalizeCustomTheme(null).enabled === false)
assert(
  'normalizeCustomTheme: hex',
  normalizeCustomTheme({ accent: '#aabbcc' }).accent === '#aabbcc',
)
assert(
  'normalizeCustomTheme: bad hex → fallback',
  normalizeCustomTheme({ accent: 'red' }).accent === DEFAULT_CUSTOM_THEME.accent,
)
assert(
  'normalizeCustomTheme: legacy backgroundImage → gallery',
  normalizeCustomTheme({ backgroundImage: 'data:image/png;base64,x' }).backgroundImages[0]
    ?.dataUrl.startsWith('data:'),
)

const exported = exportThemeJson({
  ...DEFAULT_CUSTOM_THEME,
  enabled: true,
  accent: '#112233',
})
const imported = importThemeJson(exported)
assert('export/import theme JSON roundtrip', imported?.enabled === true && imported.accent === '#112233')
assert('importThemeJson: invalid JSON → null', importThemeJson('{bad') === null)
assert('importThemeJson: wrong version → null', importThemeJson('{"version":2}') === null)

const mergedTheme = normalizePlan({
  ...createDefaultPlan(),
  settings: {
    ...createDefaultPlan().settings,
    customTheme: { enabled: true, accent: '#ff0000' },
  },
})
assert('normalizePlan: customTheme merge', mergedTheme.settings.customTheme.enabled === true)
assert(
  'normalizePlan: customTheme accent',
  mergedTheme.settings.customTheme.accent === '#ff0000',
)

const migratedAmbient = normalizePlan({
  ...createDefaultPlan(),
  settings: {
    ...createDefaultPlan().settings,
    ambientAnimation: 'auto',
    customTheme: { enabled: true, ambientEnabled: false, accent: '#aabbcc' },
  },
})
assert(
  'normalizePlan: ambientEnabled false → ambientAnimation off',
  migratedAmbient.settings.ambientAnimation === 'off',
)

const preservedCustom = normalizePlan({
  ...createDefaultPlan(),
  settings: {
    ...createDefaultPlan().settings,
    colorPalette: 'northrend',
    customTheme: { enabled: true, accent: '#ff0000', basedOn: 'northrend' },
  },
})
assert('normalizePlan: customTheme basedOn', preservedCustom.settings.customTheme.basedOn === 'northrend')

// --- palettes lib ---
assert('isColorPalette: starwars', isColorPalette('starwars'))
assert('isColorPalette: bogus', !isColorPalette('bogus'))
assert('normalizeColorPalette: got', normalizeColorPalette('got') === 'got')
assert('normalizeColorPalette: fallback', normalizeColorPalette('x') === 'plain')

// --- electron + index.html ---
const planFile = readFileSync(join(root, 'electron/plan-file.cjs'), 'utf8')
assert('electron DEFAULT_PLAN plain', planFile.includes("colorPalette: 'plain'"))
assert('electron customTheme block', planFile.includes('customTheme:'))
assert('electron customTheme basedOn', planFile.includes('basedOn: null'))
assert('electron customTheme gallery', planFile.includes('backgroundImages:'))

const indexHtml = readFileSync(join(root, 'index.html'), 'utf8')
assert('index.html pre-hydration plain', indexHtml.includes("data-palette', 'plain'"))

// --- icons ---
for (const id of COLOR_PALETTE_IDS) {
  assert(`icon PNG: ${id}`, existsSync(join(iconsDir, `${id}.png`)))
  assert(`wordmark PNG: ${id}`, existsSync(join(iconsDir, 'wordmark', `${id}.png`)))
}
assert('CustomThemeSection exists', existsSync(join(root, 'src/components/settings/CustomThemeSection.tsx')))
assert('DailyDaysPicker exists', existsSync(join(root, 'src/components/settings/DailyDaysPicker.tsx')))
assert('ThemePreview exists', existsSync(join(root, 'src/components/settings/ThemePreview.tsx')))
assert('PaletteToggle custom card', readFileSync(join(root, 'src/components/layout/PaletteToggle.tsx'), 'utf8').includes('Моя тема'))
assert('planStore selectBuiltInPalette', readFileSync(join(root, 'src/store/planStore.ts'), 'utf8').includes('selectBuiltInPalette'))

if (failed > 0) {
  console.error(`\nПроверка палитр: ${failed} ошибок`)
  process.exit(1)
}

console.log(`\nПроверка палитр: все тесты пройдены (${passed} проверок, ${COLOR_PALETTE_IDS.length} палитр)`)
