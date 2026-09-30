/**
 * Меню v0.31: 6 пунктов, режимы внутри, hotkeys 1–N, старые defaultView живы.
 * v0.31.1: полное меню и круговое, пункты от логотипа вниз, `[` переключает режимы.
 * Запуск: npx tsx scripts/verify-nav.mjs
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createDefaultPlan, normalizePlan } from '../src/types/index.ts'
import {
  NAV_ENTRIES,
  NAV_VIEW_ORDER,
  navEntryForView,
  rememberNavView,
  viewForNavEntry,
} from '../src/lib/nav.ts'
import { radialLayout } from '../src/lib/radialMenu.ts'
import { nextSidebarNavigation, toggledSidebarMode } from '../src/lib/sidebarMode.ts'

const root = process.cwd()
const sidebar = readFileSync(join(root, 'src/components/layout/Sidebar.tsx'), 'utf8')
const hotkeys = readFileSync(join(root, 'src/hooks/useHotkeys.ts'), 'utf8')
const header = readFileSync(join(root, 'src/components/layout/Header.tsx'), 'utf8')

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

assert('six nav entries', NAV_ENTRIES.length === 6)
assert('hotkey order length', NAV_VIEW_ORDER.length === 6)
assert('hotkey 1 is dashboard', NAV_VIEW_ORDER[0] === 'dashboard')
assert('hotkey 2 is calendar', NAV_VIEW_ORDER[1] === 'week')
assert('hotkey 3 is tasks', NAV_VIEW_ORDER[2] === 'tasks')
assert('hotkey 4 is daily', NAV_VIEW_ORDER[3] === 'daily')
assert('hotkey 5 is projects', NAV_VIEW_ORDER[4] === 'projects')
assert('hotkey 6 is history', NAV_VIEW_ORDER[5] === 'history')
assert('agenda sits in today', navEntryForView('agenda')?.id === 'today')
assert('inbox sits in tasks', navEntryForView('inbox')?.id === 'tasks')
assert('every view has an entry', ['dashboard', 'agenda', 'week', 'tasks', 'history', 'inbox', 'daily', 'projects'].every((id) => navEntryForView(id)))

rememberNavView('agenda')
assert('today remembers agenda', viewForNavEntry(navEntryForView('dashboard')) === 'agenda')
rememberNavView('inbox')
assert('tasks remembers inbox', viewForNavEntry(navEntryForView('tasks')) === 'inbox')
assert('today memory stays', viewForNavEntry(navEntryForView('agenda')) === 'agenda')

const base = createDefaultPlan()
const keptAgenda = normalizePlan({
  ...base,
  settings: { ...base.settings, defaultView: 'agenda' },
})
const keptInbox = normalizePlan({
  ...base,
  settings: { ...base.settings, defaultView: 'inbox' },
})
const dropped = normalizePlan({
  ...base,
  settings: { ...base.settings, defaultView: 'nope' },
})
assert('defaultView agenda kept', keptAgenda.settings.defaultView === 'agenda')
assert('defaultView inbox kept', keptInbox.settings.defaultView === 'inbox')
assert('bad defaultView falls back', dropped.settings.defaultView === 'dashboard')

assert('sidebar uses NAV_ENTRIES', sidebar.includes('NAV_ENTRIES'))
assert('sidebar has no inbox label', !sidebar.includes('Входящие'))
assert('hotkeys use NAV_VIEW_ORDER', hotkeys.includes('NAV_VIEW_ORDER'))
assert('hotkeys not capped at 8', !hotkeys.includes("<= '8'"))
assert('header switches modes', header.includes('header-view-switch'))

const layout = readFileSync(join(root, 'src/components/layout/AppLayout.tsx'), 'utf8')
const css = readFileSync(join(root, 'src/index.css'), 'utf8')
const radial = readFileSync(join(root, 'src/components/layout/SidebarRadialMenu.tsx'), 'utf8')
const store = readFileSync(join(root, 'src/store/planStore.ts'), 'utf8')
const fresh = createDefaultPlan()
assert('default sidebar expanded', fresh.settings.navigation.sidebarMode === 'expanded')
assert('default open mode expanded', fresh.settings.navigation.sidebarOpenMode === 'expanded')
const migratedPeek = normalizePlan({
  ...fresh,
  settings: { ...fresh.settings, navigation: { sidebarMode: 'peek', sidebarOpenMode: 'expanded' } },
})
const migratedRail = normalizePlan({
  ...fresh,
  settings: { ...fresh.settings, navigation: { sidebarMode: 'rail' } },
})
const migratedBoth = normalizePlan({
  ...fresh,
  settings: { ...fresh.settings, navigation: { sidebarMode: 'peek', sidebarOpenMode: 'rail' } },
})
const droppedMode = normalizePlan({
  ...fresh,
  settings: { ...fresh.settings, navigation: { sidebarMode: 'drawer', sidebarOpenMode: 'nope' } },
})
assert(
  'peek becomes radial',
  migratedPeek.settings.navigation.sidebarMode === 'radial' &&
    migratedPeek.settings.navigation.sidebarOpenMode === 'radial',
)
assert(
  'rail becomes radial',
  migratedRail.settings.navigation.sidebarMode === 'radial' &&
    migratedRail.settings.navigation.sidebarOpenMode === 'radial',
)
assert(
  'old open mode follows radial',
  migratedBoth.settings.navigation.sidebarMode === 'radial' &&
    migratedBoth.settings.navigation.sidebarOpenMode === 'radial',
)
assert('bad sidebar mode falls back', droppedMode.settings.navigation.sidebarMode === 'expanded')
assert('bad open mode falls back', droppedMode.settings.navigation.sidebarOpenMode === 'expanded')
assert(
  'toggle from expanded goes to radial',
  toggledSidebarMode({ sidebarMode: 'expanded', sidebarOpenMode: 'expanded' }) === 'radial',
)
assert(
  'toggle from radial opens full menu',
  toggledSidebarMode({ sidebarMode: 'radial', sidebarOpenMode: 'radial' }) === 'expanded',
)
assert(
  'radial stores radial',
  nextSidebarNavigation({ sidebarMode: 'expanded', sidebarOpenMode: 'expanded' }, 'radial').sidebarOpenMode ===
    'radial',
)
assert('hotkey bracket toggles sidebar', hotkeys.includes("e.code === 'BracketLeft'") && hotkeys.includes('toggleSidebarMode'))
assert('view hotkeys ignore sidebar mode', !/NAV_VIEW_ORDER[\s\S]{0,180}sidebarMode/.test(hotkeys))
assert('layout uses sidebar mode', layout.includes('app-layout--radial') && layout.includes('sidebarMode'))
assert('sidebar is not a drag region', sidebar.includes('titlebar-no-drag'))
assert(
  'radial column hides the nav list',
  sidebar.includes("sidebarMode === 'radial'") && sidebar.includes('radialMode ? null'),
)
assert(
  'radial does not reserve a column',
  css.includes('.app-layout--radial .sidebar-slot') &&
    /width:\s*0/.test(css) &&
    /\.app-layout--radial \.sidebar\s*\{[^}]*position:\s*fixed/.test(css),
)
assert(
  'hide button stays at 12px',
  /\.sidebar-toggle\s*\{[^}]*left:\s*12px;[^}]*bottom:\s*12px;/s.test(css),
)
assert('hide button uses toggle', sidebar.includes('toggleSidebarMode'))
assert('store uses sidebar navigation helper', store.includes('nextSidebarNavigation') && store.includes('toggledSidebarMode'))
assert(
  'radial menu on logo',
  sidebar.includes('sidebar-logo') &&
    sidebar.includes('aria-haspopup="menu"') &&
    radial.includes('role="menu"') &&
    radial.includes('NAV_ENTRIES'),
)
assert('settings sit in the menu', sidebar.includes('className="nav-item settings-btn"') && radial.includes('Настройки'))
assert('radial closes in reverse', radial.includes('sidebar-radial-root--closing') && css.includes('sidebar-radial-out'))
assert('expanded menu keeps counters', sidebar.includes('nav-count'))
assert('expanded menu uses the wordmark', sidebar.includes('variant="wordmark"'))
assert(
  'radial logo is taller than the wordmark',
  css.includes('.app-layout--radial .sidebar-logo .brand-mark') &&
    /\.app-layout--radial \.sidebar-logo \.brand-mark\s*\{[^}]*height:\s*56px/.test(css) &&
    /\.brand-mark-lg\s*\{[^}]*height:\s*40px/.test(css),
)

const radialRing = radialLayout(60, 68, 7, 800, 1280)
assert('radial has seven points', radialRing.points.length === 7)
assert('radial is centered on the logo', radialRing.cx === 60 && radialRing.cy === 68)
const radialDistances = radialRing.points.map((point) => Math.hypot(point.x - 60, point.y - 68))
assert(
  'radial path is angular',
  Math.max(...radialDistances) - Math.min(...radialDistances) > 80,
)
assert(
  'radial stays near the logo',
  radialDistances[0] < 120 && radialRing.points.every((point) => point.x < 200 && point.x > 30),
)
assert('radial first item sits high', radialRing.points[0].y < radialRing.cy - 8)
assert(
  'radial stays on screen',
  radialRing.points.every((point) => point.x >= 20 && point.y >= 20 && point.y <= 760 && point.x <= 1240),
)
let radialSpaced = true
for (let i = 1; i < radialRing.points.length; i += 1) {
  const prev = radialRing.points[i - 1]
  const next = radialRing.points[i]
  if (Math.hypot(prev.x - next.x, prev.y - next.y) < 56) radialSpaced = false
}
assert('radial items do not overlap', radialSpaced)

if (failed > 0) {
  console.error(`\n${failed} failed, ${passed} passed`)
  process.exit(1)
}

console.log(`\nNav OK: ${passed} checks`)
