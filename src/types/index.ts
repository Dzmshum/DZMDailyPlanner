export type ThemeMode = 'light' | 'dark' | 'system'
export type ColorPalette = 'northrend' | 'outland' | 'pandaria'
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
}

export interface Settings {
  theme: ThemeMode
  colorPalette: ColorPalette
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

export const APP_NAME = 'RuneBoard'
export const BRAND_TAGLINE = 'Рунный планировщик задач'

export const PALETTE_LABELS: Record<ColorPalette, string> = {
  northrend: 'Нордскол',
  outland: 'Запределье',
  pandaria: 'Пандария',
}

export const PALETTE_HINTS: Record<ColorPalette, string> = {
  northrend: 'Лёд, сталь, руны — Ледяная Корона',
  outland: 'Скверна, фиолет, зелёное пламя — Иллидан',
  pandaria: 'Нефрит, золото, шёлк — Пандария',
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
}

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
      colorPalette: 'northrend',
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

export function normalizePlan(data: PlanData): PlanData {
  const defaults = createDefaultPlan().settings
  return {
    ...data,
    settings: {
      ...defaults,
      ...data.settings,
      colorPalette: data.settings?.colorPalette ?? 'northrend',
      windowMode: data.settings?.windowMode ?? 'standard',
      calendar: {
        ...defaults.calendar,
        ...data.settings?.calendar,
      },
      daily: {
        ...defaults.daily,
        ...data.settings?.daily,
      },
      export: {
        ...defaults.export,
        ...data.settings?.export,
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
