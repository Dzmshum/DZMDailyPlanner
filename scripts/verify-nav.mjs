/**
 * Меню v0.31: 6 пунктов, режимы внутри, hotkeys 1–N, старые defaultView живы.
 * v0.31.1: sidebarMode peek, клавиша `[`, полоска 4px без сдвига main.
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
const fresh = createDefaultPlan()
assert('default sidebar expanded', fresh.settings.navigation.sidebarMode === 'expanded')
const keptPeek = normalizePlan({
  ...fresh,
  settings: { ...fresh.settings, navigation: { sidebarMode: 'peek' } },
})
const droppedMode = normalizePlan({
  ...fresh,
  settings: { ...fresh.settings, navigation: { sidebarMode: 'rail' } },
})
assert('sidebar peek kept', keptPeek.settings.navigation.sidebarMode === 'peek')
assert('bad sidebar mode falls back', droppedMode.settings.navigation.sidebarMode === 'expanded')
assert('hotkey bracket toggles sidebar', hotkeys.includes("e.code === 'BracketLeft'") && hotkeys.includes('toggleSidebarMode'))
assert('view hotkeys ignore sidebar mode', !/NAV_VIEW_ORDER[\s\S]{0,180}sidebarMode/.test(hotkeys))
assert('layout uses sidebar mode', layout.includes('app-layout--peek') && layout.includes('sidebarMode'))
assert('peek does not reserve sidebar width', css.includes('.app-layout--peek .sidebar') && css.includes('position: absolute'))
assert(
  'peek strip is 4px',
  css.includes('--sidebar-peek: 4px') &&
    css.includes('translateX(calc(-1 * var(--sidebar-shift)))') &&
    css.includes('width: 4px'),
)
assert('sidebar is not a drag region', sidebar.includes('titlebar-no-drag'))
assert(
  'collapsed menu is inert',
  sidebar.includes('const menuHidden = sidebarMode === \'peek\' && !revealed') &&
    (sidebar.match(/inert=\{menuHidden\}/g) ?? []).length >= 3,
)

if (failed > 0) {
  console.error(`\n${failed} failed, ${passed} passed`)
  process.exit(1)
}

console.log(`\nNav OK: ${passed} checks`)
