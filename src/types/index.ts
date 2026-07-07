export type ThemeMode = 'light' | 'dark' | 'system'
export type ColorPalette =
  | 'plain'
  | 'northrend'
  | 'outland'
  | 'pandaria'
  | 'starwars'
  | 'got'
  | 'witcher'
export type AmbientAnimation = 'auto' | 'off'
export type ViewId =
  | 'dashboard'
  | 'agenda'
  | 'week'
  | 'tasks'
  | 'history'
  | 'inbox'
  | 'daily'
  | 'projects'
export type WindowMode = 'standard' | 'maximized' | 'minimal'
export type CalendarView = 'week' | 'month' | 'quarter' | 'year'
export type ExportPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year'
export type Priority = 'low' | 'medium' | 'high'
export type TaskStatus = 'todo' | 'in_progress' | 'done'

import { normalizeDailyDays } from '../lib/dailyLabels'
import { isColorPalette } from '../lib/palettes'

export interface TaskTime {
  start: string
  end: string
}

export interface Project {
  id: string
  name: string
  color: string
  /** Завершённый проект скрыт из выбора по умолчанию */
  completed?: boolean
  completedAt?: string | null
}

export interface TaskAttachment {
  id: string
  name: string
  mimeType: string
  fileName: string
}

export interface Task {
  id: string
  title: string
  projectId: string | null
  deadline: string | null
  time: TaskTime | null
  priority: Priority
  status: TaskStatus
  notes: string
  attachments: TaskAttachment[]
  createdAt: string
  completedAt: string | null
  jiraKey: string | null
}

export interface JiraSettings {
  enabled: boolean
  baseUrl: string
  email: string
  apiToken: string
  projectKey: string
  issueType: string
}

export interface JiraExportResult {
  issueKey: string
  issueUrl: string
}

export interface CalendarSettings {
  showHolidays: boolean
  calendarView: CalendarView
}

export interface DailySettings {
  enabled: boolean
  days: number[]
}

export interface ExportSettings {
  includeDone: boolean
  skipEmptyDays: boolean
  exportTitle: string
  includeRecentDone: boolean
  recentDoneDays: number
  includeInbox: boolean
}

export interface CustomBackgroundImage {
  id: string
  dataUrl: string
}

export interface CustomThemeSettings {
  enabled: boolean
  /** Палитра-основа при создании «Моей темы» */
  basedOn: ColorPalette | null
  accent: string
  background: string
  surface: string
  text: string
  backgroundImages: CustomBackgroundImage[]
  backgroundImageId: string | null
  /** @deprecated Используйте settings.ambientAnimation; мигрируется в normalizePlan */
  ambientEnabled: boolean
}

export interface Settings {
  theme: ThemeMode
  colorPalette: ColorPalette
  ambientAnimation: AmbientAnimation
  customTheme: CustomThemeSettings
  defaultView: ViewId
  windowMode: WindowMode
  calendar: CalendarSettings
  daily: DailySettings
  export: ExportSettings
  voiceInputEnabled: boolean
  jira: JiraSettings
}

export interface PlanData {
  version: 1
  settings: Settings
  projects: Project[]
  tasks: Task[]
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'К выполнению',
  in_progress: 'В работе',
  done: 'Готово',
}

export const APP_NAME = 'PlanBoard'

export const PALETTE_LABELS: Record<ColorPalette, string> = {
  plain: 'Классика',
  northrend: 'Нордскол',
  outland: 'Запределье',
  pandaria: 'Пандария',
  starwars: 'Звёздные войны',
  got: 'Игра престолов',
  witcher: 'Ведьмак',
}

export const PALETTE_HINTS: Record<ColorPalette, string> = {
  plain: 'Нейтральная тёмная тема без декора',
  northrend: 'Лёд, сталь, руны — Ледяная Корона',
  outland: 'Скверна, фиолет, зелёное пламя — Иллидан',
  pandaria: 'Нефрит, золото, шёлк — Пандария',
  starwars: 'Космос, неон, звёзды — далёкая-далёкая галактика',
  got: 'Гранит, бордо, золото — Железный трон',
  witcher: 'Медь, руны, туман — Ведьмак',
}

export const DEFAULT_CUSTOM_THEME: CustomThemeSettings = {
  enabled: false,
  basedOn: null,
  accent: '#6b8cff',
  background: '#121418',
  surface: '#1a1d24',
  text: '#e8eaed',
  backgroundImages: [],
  backgroundImageId: null,
  ambientEnabled: false,
}

const DATA_IMAGE = /^data:image\//

export function normalizeBackgroundGallery(raw: unknown): {
  backgroundImages: CustomBackgroundImage[]
  backgroundImageId: string | null
} {
  const images: CustomBackgroundImage[] = []
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : null

  if (o && Array.isArray(o.backgroundImages)) {
    for (const item of o.backgroundImages) {
      if (!item || typeof item !== 'object') continue
      const entry = item as Partial<CustomBackgroundImage>
      if (
        typeof entry.id === 'string' &&
        entry.id.length > 0 &&
        typeof entry.dataUrl === 'string' &&
        DATA_IMAGE.test(entry.dataUrl)
      ) {
        images.push({ id: entry.id, dataUrl: entry.dataUrl })
      }
    }
  }

  if (
    images.length === 0 &&
    o &&
    typeof o.backgroundImage === 'string' &&
    DATA_IMAGE.test(o.backgroundImage)
  ) {
    images.push({ id: 'legacy-bg', dataUrl: o.backgroundImage })
  }

  let backgroundImageId: string | null = null
  if (
    o &&
    typeof o.backgroundImageId === 'string' &&
    images.some((img) => img.id === o.backgroundImageId)
  ) {
    backgroundImageId = o.backgroundImageId
  } else if (
    o &&
    typeof o.backgroundImage === 'string' &&
    DATA_IMAGE.test(o.backgroundImage)
  ) {
    const match = images.find((img) => img.dataUrl === o.backgroundImage)
    backgroundImageId = match?.id ?? images[0]?.id ?? null
  } else if (images.length > 0) {
    backgroundImageId = images[0].id
  }

  return { backgroundImages: images, backgroundImageId }
}

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

function normalizeCustomThemeSettings(raw: unknown): CustomThemeSettings {
  const d = DEFAULT_CUSTOM_THEME
  if (!raw || typeof raw !== 'object') return { ...d }
  const o = raw as Partial<CustomThemeSettings>
  const color = (v: unknown, fb: string) =>
    typeof v === 'string' && HEX_COLOR.test(v) ? v : fb
  const gallery = normalizeBackgroundGallery(o)
  return {
    enabled: Boolean(o.enabled),
    basedOn: isColorPalette(o.basedOn) ? o.basedOn : null,
    accent: color(o.accent, d.accent),
    background: color(o.background, d.background),
    surface: color(o.surface, d.surface),
    text: color(o.text, d.text),
    ...gallery,
    ambientEnabled: Boolean(o.ambientEnabled),
  }
}

export const VIEW_LABELS: Record<ViewId, string> = {
  dashboard: 'Дашборд',
  agenda: 'Повестка дня',
  week: 'Календарь',
  tasks: 'Задачи',
  history: 'История',
  inbox: 'Входящие',
  daily: 'Дейлик',
  projects: 'Проекты',
}

/** Views with dedicated PNG icons in public/icons/views */
export type ViewIconId =
  | 'dashboard'
  | 'agenda'
  | 'week'
  | 'tasks'
  | 'history'
  | 'inbox'
  | 'daily'
  | 'projects'

export const VIEW_ICON_ALIASES: Partial<Record<ViewId, ViewIconId>> = {}

export const DEFAULT_PROJECT_COLORS = [
  '#4fc3f7',
  '#38bdf8',
  '#67e8f9',
  '#22d3ee',
  '#818cf8',
  '#a78bfa',
]

export const DEFAULT_CALENDAR_SETTINGS: CalendarSettings = {
  showHolidays: true,
  calendarView: 'week',
}

export const DEFAULT_DAILY_SETTINGS: DailySettings = {
  enabled: true,
  days: [1, 4],
}

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  includeDone: false,
  skipEmptyDays: true,
  exportTitle: 'Текущий план.',
  includeRecentDone: false,
  recentDoneDays: 7,
  includeInbox: false,
}

export const RECENT_DONE_DAY_OPTIONS = [3, 7, 14, 30] as const

export const DEFAULT_JIRA_SETTINGS: JiraSettings = {
  enabled: false,
  baseUrl: '',
  email: '',
  apiToken: '',
  projectKey: '',
  issueType: 'Task',
}

export function createDefaultPlan(): PlanData {
  return {
    version: 1,
    settings: {
      theme: 'system',
      colorPalette: 'plain',
      ambientAnimation: 'auto',
      customTheme: { ...DEFAULT_CUSTOM_THEME },
      defaultView: 'dashboard',
      windowMode: 'standard',
      calendar: { ...DEFAULT_CALENDAR_SETTINGS },
      daily: { ...DEFAULT_DAILY_SETTINGS },
      export: { ...DEFAULT_EXPORT_SETTINGS },
      voiceInputEnabled: false,
      jira: { ...DEFAULT_JIRA_SETTINGS },
    },
    projects: [],
    tasks: [],
  }
}

function normalizeRecentDoneDays(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return DEFAULT_EXPORT_SETTINGS.recentDoneDays
  return Math.min(90, Math.max(1, Math.round(n)))
}

export function normalizePlan(data: PlanData): PlanData {
  const defaults = createDefaultPlan().settings
  const validPalettes: ColorPalette[] = [
    'plain',
    'northrend',
    'outland',
    'pandaria',
    'starwars',
    'got',
    'witcher',
  ]
  const rawPalette = data.settings?.colorPalette
  const colorPalette = validPalettes.includes(rawPalette as ColorPalette)
    ? (rawPalette as ColorPalette)
    : 'plain'
  const ambientRaw = data.settings?.ambientAnimation
  let ambientAnimation: AmbientAnimation =
    ambientRaw === 'off' ? 'off' : 'auto'
  const customTheme = normalizeCustomThemeSettings(data.settings?.customTheme)
  const rawCustom = data.settings?.customTheme
  if (
    customTheme.enabled &&
    rawCustom &&
    typeof rawCustom === 'object' &&
    'ambientEnabled' in rawCustom &&
    !(rawCustom as { ambientEnabled?: boolean }).ambientEnabled &&
    ambientAnimation === 'auto'
  ) {
    ambientAnimation = 'off'
  }

  return {
    ...data,
    settings: {
      ...defaults,
      ...data.settings,
      colorPalette,
      ambientAnimation,
      customTheme,
      windowMode: data.settings?.windowMode ?? 'standard',
      calendar: {
        ...defaults.calendar,
        ...data.settings?.calendar,
      },
      daily: {
        enabled: data.settings?.daily?.enabled ?? defaults.daily.enabled,
        days: normalizeDailyDays(data.settings?.daily?.days),
      },
      export: {
        ...defaults.export,
        ...data.settings?.export,
        includeRecentDone: data.settings?.export?.includeRecentDone ?? false,
        recentDoneDays: normalizeRecentDoneDays(data.settings?.export?.recentDoneDays),
        includeInbox: data.settings?.export?.includeInbox ?? false,
      },
      voiceInputEnabled: data.settings?.voiceInputEnabled ?? false,
      jira: {
        ...DEFAULT_JIRA_SETTINGS,
        ...data.settings?.jira,
      },
    },
    tasks: data.tasks.map((t) => ({
      ...t,
      jiraKey: t.jiraKey ?? null,
      attachments: Array.isArray(t.attachments) ? t.attachments : [],
    })),
    projects: (data.projects ?? []).map((p) => ({
      ...p,
      completed: Boolean(p.completed),
      completedAt: p.completed ? (p.completedAt ?? null) : null,
    })),
  }
}
