export const SETTINGS_LAST_TAB_KEY = 'planboard-settings-last-tab'

export const SETTINGS_TABS = [
  { id: 'appearance', label: 'Оформление' },
  { id: 'planning', label: 'Планирование' },
  { id: 'window', label: 'Окно и ввод' },
  { id: 'export', label: 'Экспорт' },
  { id: 'data', label: 'Данные' },
  { id: 'integrations', label: 'Интеграции' },
  { id: 'roadmap', label: 'Дальше' },
] as const

export type SettingsTab = (typeof SETTINGS_TABS)[number]['id']

export interface SettingsSectionMeta {
  id: string
  tab: SettingsTab
  title: string
  keywords: string
}

export const SETTINGS_SECTIONS: SettingsSectionMeta[] = [
  {
    id: 'theme',
    tab: 'appearance',
    title: 'Тема интерфейса',
    keywords: 'светлая тёмная система',
  },
  {
    id: 'palette',
    tab: 'appearance',
    title: 'Тема оформления',
    keywords: 'палитра моя тема цвета',
  },
  {
    id: 'ambient',
    tab: 'appearance',
    title: 'Фоновая анимация',
    keywords: 'фон снег звёзды классика',
  },
  {
    id: 'calendar',
    tab: 'planning',
    title: 'Календарь',
    keywords: 'праздники рф выходные',
  },
  {
    id: 'daily',
    tab: 'planning',
    title: 'Дейлики',
    keywords: 'созвон дни недели',
  },
  {
    id: 'progress',
    tab: 'planning',
    title: 'Прогресс дня',
    keywords: 'процент счётчик повестка дашборд',
  },
  {
    id: 'window-mode',
    tab: 'window',
    title: 'Режим окна',
    keywords: 'минимальный развёрнутый electron desktop',
  },
  {
    id: 'sidebar',
    tab: 'window',
    title: 'Меню',
    keywords: 'сайдбар полное круговое логотип меню',
  },
  {
    id: 'voice',
    tab: 'window',
    title: 'Голосовой ввод',
    keywords: 'микрофон ctrl shift v',
  },
  {
    id: 'hotkeys',
    tab: 'window',
    title: 'Горячие клавиши',
    keywords: 'hotkey клавиатура сочетания',
  },
  {
    id: 'export-text',
    tab: 'export',
    title: 'Экспорт текста',
    keywords: 'telegram выполненные inbox пустые дни',
  },
  {
    id: 'plan-file',
    tab: 'data',
    title: 'Файл плана',
    keywords: 'путь бэкап backup plan.json localstorage',
  },
  {
    id: 'jira',
    tab: 'integrations',
    title: 'Jira Cloud',
    keywords: 'токен api atlassian проект',
  },
  {
    id: 'upcoming',
    tab: 'roadmap',
    title: 'Потенциальные доработки',
    keywords: 'план очередь импорт ссылка ctrl+k ввод задачи мобильное дейлик ollama фон анимация',
  },
]

const TAB_LABEL = new Map(SETTINGS_TABS.map((tab) => [tab.id, tab.label]))

export function isSettingsTab(value: string): value is SettingsTab {
  return SETTINGS_TABS.some((tab) => tab.id === value)
}

function normalizeSearch(value: string): string {
  return value.toLowerCase().replace(/ё/g, 'е').trim()
}

export function sectionMatchesQuery(section: SettingsSectionMeta, query: string): boolean {
  const q = normalizeSearch(query)
  if (!q) return true
  const hay = normalizeSearch(
    `${TAB_LABEL.get(section.tab) ?? ''} ${section.title} ${section.keywords}`,
  )
  return q.split(/\s+/).every((part) => hay.includes(part))
}

export function filterSettingsSections(query: string): SettingsSectionMeta[] {
  return SETTINGS_SECTIONS.filter((section) => sectionMatchesQuery(section, query))
}

export function tabsMatchingQuery(query: string): SettingsTab[] {
  const hits = new Set(filterSettingsSections(query).map((section) => section.tab))
  return SETTINGS_TABS.map((tab) => tab.id).filter((id) => hits.has(id))
}

export function resolveSettingsTab(current: SettingsTab, query: string): SettingsTab {
  const tabs = tabsMatchingQuery(query)
  if (tabs.length === 0) return current
  if (tabs.includes(current)) return current
  return tabs[0]
}

/** Чипы подразделов нужны только если секций несколько и они не влезают в панель. */
export function settingsSubnavNeeded(
  contentHeight: number,
  viewportHeight: number,
  sectionCount: number,
): boolean {
  if (sectionCount < 2 || viewportHeight <= 0) return false
  return contentHeight > viewportHeight + 1
}

export function readSettingsTab(): SettingsTab {
  try {
    const raw = sessionStorage.getItem(SETTINGS_LAST_TAB_KEY)
    if (raw && isSettingsTab(raw)) return raw
  } catch {
    /* sessionStorage недоступен */
  }
  return 'appearance'
}

export function writeSettingsTab(tab: SettingsTab): void {
  try {
    sessionStorage.setItem(SETTINGS_LAST_TAB_KEY, tab)
  } catch {
    /* sessionStorage недоступен */
  }
}
