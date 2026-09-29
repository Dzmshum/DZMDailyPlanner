/**
 * Настройки: модалка, сайдбар, селектор просроченных в повестке.
 * Запуск: npx tsx scripts/verify-settings-ui.mjs
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { getOverdueTasksForAgenda } from '../src/lib/selectors.ts'
import { formatDailyDaysLabel } from '../src/lib/dailyLabels.ts'
import {
  filterSettingsSections,
  resolveSettingsTab,
  SETTINGS_LAST_TAB_KEY,
  SETTINGS_SECTIONS,
  SETTINGS_TABS,
  settingsSubnavNeeded,
} from '../src/lib/settingsNav.ts'
import { resolveIconPalette } from '../src/lib/paletteThemeColors.ts'

const root = process.cwd()
const css = readFileSync(join(root, 'src/index.css'), 'utf8')
const pkg = readFileSync(join(root, 'package.json'), 'utf8')
const planFile = readFileSync(join(root, 'electron/plan-file.cjs'), 'utf8')
const preload = readFileSync(join(root, 'electron/preload.cjs'), 'utf8')
const electronApi = readFileSync(join(root, 'src/lib/electron.ts'), 'utf8')
const storage = readFileSync(join(root, 'src/lib/storage.ts'), 'utf8')
const sidebar = readFileSync(join(root, 'src/components/layout/Sidebar.tsx'), 'utf8')
const settingsModal = readFileSync(join(root, 'src/components/settings/SettingsModal.tsx'), 'utf8')
const settingsNav = readFileSync(join(root, 'src/lib/settingsNav.ts'), 'utf8')
const appearancePanel = readFileSync(
  join(root, 'src/components/settings/panels/AppearancePanel.tsx'),
  'utf8',
)
const planningPanel = readFileSync(
  join(root, 'src/components/settings/panels/PlanningPanel.tsx'),
  'utf8',
)
const windowPanel = readFileSync(join(root, 'src/components/settings/panels/WindowPanel.tsx'), 'utf8')
const exportPanel = readFileSync(join(root, 'src/components/settings/panels/ExportPanel.tsx'), 'utf8')
const paletteToggle = readFileSync(join(root, 'src/components/layout/PaletteToggle.tsx'), 'utf8')
const customTheme = readFileSync(join(root, 'src/components/settings/CustomThemeSection.tsx'), 'utf8')
const ambientBg = readFileSync(join(root, 'src/components/layout/AmbientBackground.tsx'), 'utf8')
const uiIcon = readFileSync(join(root, 'src/components/ui/UiIcon.tsx'), 'utf8')
const viewIcon = readFileSync(join(root, 'src/components/layout/ViewIcon.tsx'), 'utf8')
const brandMark = readFileSync(join(root, 'src/components/layout/BrandMark.tsx'), 'utf8')

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

// --- Branding ---
assert('package productName PlanBoard', pkg.includes('"productName": "PlanBoard"'))
assert('package appId planboard', pkg.includes('"appId": "com.planboard.desktop"'))
assert('plan-file APPDATA PlanBoard', planFile.includes("APP_DATA_DIR = 'PlanBoard'"))
assert('plan-file legacy migration', planFile.includes("LEGACY_DATA_DIRS = ['DoomPlanner']"))
assert('preload planBoard API', preload.includes("exposeInMainWorld('planBoard'"))
assert('electron.ts planBoard window', electronApi.includes('planBoard?: PlanBoardElectronApi'))
assert('storage planboard-plan key', storage.includes("const STORAGE_KEY = 'planboard-plan'"))
assert('custom theme export filename', customTheme.includes("'planboard-theme.json'"))

// --- Settings modal ---
assert('SettingsModal size xl', settingsModal.includes('size="xl"'))
assert('settings 6 tabs', SETTINGS_TABS.length === 6)
assert('settings tab appearance', SETTINGS_TABS.some((tab) => tab.id === 'appearance'))
assert('settings tab planning', SETTINGS_TABS.some((tab) => tab.id === 'planning'))
assert('settings tab window', SETTINGS_TABS.some((tab) => tab.id === 'window'))
assert('settings tab export', SETTINGS_TABS.some((tab) => tab.id === 'export'))
assert('settings tab data', SETTINGS_TABS.some((tab) => tab.id === 'data'))
assert('settings tab integrations', SETTINGS_TABS.some((tab) => tab.id === 'integrations'))
assert('settings no behavior tab', !SETTINGS_TABS.some((tab) => tab.id === 'behavior'))
assert('settings last tab key', settingsNav.includes(SETTINGS_LAST_TAB_KEY))
assert('SettingsModal remembers tab', settingsModal.includes('readSettingsTab') && settingsModal.includes('writeSettingsTab'))
assert('SettingsModal search', settingsModal.includes('id="settings-search"'))
assert('SettingsModal settings-panel', settingsModal.includes('className="settings-panel"'))
assert('SettingsModal subnav', settingsModal.includes('SettingsSubnav'))
assert('PlanningPanel DailyDaysPicker', planningPanel.includes('DailyDaysPicker'))
assert('PlanningPanel formatDailyDaysLabel', planningPanel.includes('formatDailyDaysLabel'))
assert('PlanningPanel calendar holidays', planningPanel.includes('showHolidays'))
assert('PlanningPanel day progress toggles', planningPanel.includes('showOnAgenda') && planningPanel.includes('showOnDashboard'))
assert('windowMode not in appearance', !appearancePanel.includes('setWindowMode') && !appearancePanel.includes('windowMode'))
assert('WindowPanel windowMode', windowPanel.includes('setWindowMode'))
assert('WindowPanel hotkeys', windowPanel.includes('id="hotkeys"') && settingsNav.includes('Горячие клавиши'))
assert('ExportPanel includeDone', exportPanel.includes('includeDone'))
assert('search праздники → calendar', filterSettingsSections('праздники').some((section) => section.id === 'calendar'))
assert('search jira → integrations', filterSettingsSections('jira').every((section) => section.tab === 'integrations') && filterSettingsSections('jira').length > 0)
assert('search miss empty', filterSettingsSections('zzzz-nope').length === 0)
assert('blank query all sections', filterSettingsSections('  ').length === SETTINGS_SECTIONS.length)
assert('resolve tab keeps planning', resolveSettingsTab('planning', 'праздники') === 'planning')
assert('resolve tab jumps to jira', resolveSettingsTab('appearance', 'jira') === 'integrations')
assert('CustomThemeSection hidden file input', customTheme.includes('hidden-file-input'))
assert('CustomThemeSection no visually-hidden file', !customTheme.includes('visually-hidden'))
assert('CSS visually-hidden', css.includes('.visually-hidden'))
assert('CSS day-progress', css.includes('.day-progress'))
assert('CSS layout spacing tokens', css.includes('--view-padding-x') && css.includes('--content-indent'))
assert('history-view zero-padding scrollport', css.includes('.view-content:has(> .history-view)'))
assert('history-day-title full bleed', /\.history-day-title\s*\{[^}]*width:\s*calc\(100% \+ 2 \* var\(--view-padding-x\)\)/s.test(css))
assert('history-day-title sticky top', /\.history-day-title\s*\{[^}]*top:\s*0/s.test(css))
assert('section-title content indent', /\.section-title\s*\{[^}]*padding-left:\s*var\(--content-indent\)/s.test(css))

// --- Fixed modal layout ---
assert('modal-xl fixed height', /\.modal-xl\s*\{[^}]*height:\s*min\(82vh,\s*780px\)/s.test(css))
assert('modal-xl fixed width', /\.modal-xl\s*\{[^}]*width:\s*min\(920px/s.test(css))
assert('modal-xl body overflow hidden', css.includes('.modal-xl .modal-body') && css.includes('overflow: hidden'))
assert('settings-layout height 100%', /\.settings-layout\s*\{[^}]*height:\s*100%/s.test(css))
assert('settings-panel scroll', /\.settings-panel\s*\{[^}]*overflow-y:\s*auto/s.test(css))
assert('settings-subnav sticky', /\.settings-subnav\s*\{[^}]*position:\s*sticky/s.test(css))
assert('settings panel body', settingsModal.includes('settings-panel-body'))
assert('subnav hidden when fits', settingsSubnavNeeded(400, 500, 3) === false)
assert('subnav shown when overflow', settingsSubnavNeeded(800, 500, 3) === true)
assert('subnav hidden for one section', settingsSubnavNeeded(800, 500, 1) === false)
assert('icon palette follows basedOn', resolveIconPalette('plain', { enabled: true, basedOn: 'witcher' }) === 'witcher')
assert('icon palette ignores basedOn when off', resolveIconPalette('northrend', { enabled: false, basedOn: 'witcher' }) === 'northrend')
assert('icon palette fallback without basedOn', resolveIconPalette('got', { enabled: true, basedOn: null }) === 'got')
assert('UiIcon uses icon palette', uiIcon.includes('useIconPalette'))
assert('ViewIcon uses icon palette', viewIcon.includes('useIconPalette'))
assert('BrandMark uses icon palette', brandMark.includes('useIconPalette'))

// --- Theme picker v0.28 ---
assert('PaletteToggle custom card', paletteToggle.includes('Моя тема'))
assert('PaletteToggle selectBuiltInPalette', paletteToggle.includes('selectBuiltInPalette'))
assert('PaletteToggle selectCustomTheme', paletteToggle.includes('selectCustomTheme'))
assert('PaletteToggle no disableCustomTheme', !paletteToggle.includes('disableCustomTheme'))
assert('CustomThemeSection ThemePreview', customTheme.includes('ThemePreview'))
assert('CustomThemeSection create from palette', customTheme.includes('createCustomThemeFromPalette'))
assert('CustomThemeSection no ambientEnabled UI', !customTheme.includes('ambientEnabled'))
assert('CustomThemeSection no enable checkbox', !customTheme.includes('цвета поверх'))
assert('AmbientBackground single animation control', !ambientBg.includes('ambientEnabled'))
assert('CSS daily-day-chip', css.includes('.daily-day-chip'))
assert('CSS theme-preview-mini', css.includes('.theme-preview-mini'))
assert('CSS palette-preview-custom', css.includes('.palette-preview-custom'))
assert('btn-primary hover keeps gradient', /\.btn-primary:hover\s*\{[^}]*background:\s*linear-gradient/s.test(css))
assert('btn:hover excludes btn-primary', css.includes('.btn:hover:not(.btn-primary)'))
assert('btn:hover excludes segmented-control-item', css.includes(':not(.segmented-control-item)'))
assert('segmented-control active hover keeps gradient', /\.segmented-control-item\.is-active:hover\s*\{[^}]*background:\s*linear-gradient/s.test(css))
assert('nav-item active hover preserves accent', /\.nav-item\.active:hover\s*\{[^}]*color:\s*var\(--accent\)/s.test(css))
assert('settings-nav active hover preserves accent', /\.settings-nav-item\.active:hover\s*\{[^}]*color:\s*var\(--accent\)/s.test(css))

// --- Sidebar settings button ---
assert('sidebar-footer starts at left', /\.sidebar-footer\s*\{[^}]*justify-content:\s*flex-start/s.test(css))
assert('settings-btn width auto', /\.nav-item\.settings-btn\s*\{[^}]*width:\s*auto/s.test(css))
assert('Sidebar settings UiIcon', sidebar.includes('icon="settings"'))
assert('Sidebar nav-item settings-btn', sidebar.includes('className="nav-item settings-btn"'))

// --- UiIcon settings ---
assert("UiIcon type settings", uiIcon.includes("'settings'"))

// --- Daily days labels ---
assert('formatDailyDaysLabel mon-thu', formatDailyDaysLabel([1, 4]) === 'Пн, Чт')
assert('formatDailyDaysLabel weekdays', formatDailyDaysLabel([1, 2, 3, 4, 5]) === 'Пн–Пт')
assert('formatDailyDaysLabel wed only', formatDailyDaysLabel([3]) === 'Ср')

// --- Agenda overdue selector ---
const agendaDay = new Date(2026, 6, 7)
const tasks = [
  {
    id: '1',
    title: 'Overdue',
    deadline: '2026-07-05',
    status: 'todo',
    notes: '',
    projectId: null,
    priority: 'medium',
    attachments: [],
    jiraKey: null,
    createdAt: '2026-07-01T10:00:00.000Z',
    completedAt: null,
  },
  {
    id: '2',
    title: 'Same day',
    deadline: '2026-07-07',
    status: 'todo',
    notes: '',
    projectId: null,
    priority: 'medium',
    attachments: [],
    jiraKey: null,
    createdAt: '2026-07-01T10:00:00.000Z',
    completedAt: null,
  },
  {
    id: '3',
    title: 'Done overdue',
    deadline: '2026-07-01',
    status: 'done',
    notes: '',
    projectId: null,
    priority: 'medium',
    attachments: [],
    jiraKey: null,
    createdAt: '2026-07-01T10:00:00.000Z',
    completedAt: '2026-07-06T10:00:00.000Z',
  },
]

const overdue = getOverdueTasksForAgenda(tasks, agendaDay)
assert('getOverdueTasksForAgenda count', overdue.length === 1)
assert('getOverdueTasksForAgenda id', overdue[0]?.id === '1')
assert('getOverdueTasksForAgenda excludes same day', !overdue.some((t) => t.id === '2'))
assert('getOverdueTasksForAgenda excludes done', !overdue.some((t) => t.id === '3'))

if (failed > 0) {
  console.error(`\n${failed} failed, ${passed} passed`)
  process.exit(1)
}

console.log(`\nSettings UI OK: ${passed} checks`)
