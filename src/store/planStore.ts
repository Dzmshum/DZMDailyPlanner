import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type {
  PlanData,
  Project,
  Settings,
  JiraSettings,
  Task,
  TaskStatus,
  ColorPalette,
  ThemeMode,
  ViewId,
  WindowMode,
  CalendarSettings,
  DailySettings,
  ExportSettings,
  CustomThemeSettings,
  AmbientAnimation,
} from '../types'
import {
  createDefaultPlan,
  DEFAULT_PROJECT_COLORS,
  DEFAULT_CUSTOM_THEME,
  normalizePlan,
} from '../types'
import { loadPlanFromDisk, savePlanToDisk } from '../lib/storage'
import { mergePlans, replacePlan } from '../lib/planMerge'
import { deleteTaskAttachments } from '../lib/attachmentStorage'
import { formatDate } from '../lib/dates'
import { getInboxTasks } from '../lib/selectors'

interface PlanState {
  data: PlanData
  loaded: boolean
  saving: boolean
  currentView: ViewId
  selectedTaskId: string | null
  taskFormOpen: boolean
  editingTaskId: string | null
  agendaDate: string
  weekAnchor: string
  searchQuery: string
  quickCaptureOpen: boolean
  exportTextOpen: boolean

  init: () => Promise<void>
  persist: () => Promise<void>
  setView: (view: ViewId) => void
  setTheme: (theme: ThemeMode) => void
  setColorPalette: (palette: ColorPalette) => void
  selectBuiltInPalette: (palette: ColorPalette) => void
  selectCustomTheme: () => void
  setAmbientAnimation: (mode: AmbientAnimation) => void
  setCustomTheme: (theme: CustomThemeSettings) => void
  disableCustomTheme: () => void
  resetCustomTheme: () => void
  setAgendaDate: (date: string) => void
  setWeekAnchor: (date: string) => void
  setSearchQuery: (query: string) => void
  setJiraSettings: (jira: Partial<JiraSettings>) => void
  setWindowMode: (mode: WindowMode) => void
  setCalendarSettings: (calendar: Partial<CalendarSettings>) => void
  setDailySettings: (daily: Partial<DailySettings>) => void
  setExportSettings: (exportSettings: Partial<ExportSettings>) => void
  setVoiceInputEnabled: (enabled: boolean) => void
  settingsOpen: boolean
  openSettings: () => void
  closeSettings: () => void

  openNewTask: () => void
  openQuickCapture: () => void
  closeQuickCapture: () => void
  openExportText: () => void
  closeExportText: () => void
  openEditTask: (id: string) => void
  closeTaskForm: () => void

  addProject: (name: string, color?: string) => string
  updateProject: (id: string, updates: Partial<Pick<Project, 'name' | 'color' | 'completed' | 'completedAt'>>) => void
  deleteProject: (id: string) => void

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completedAt'> & { id?: string }) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTaskDone: (id: string) => void
  restoreTask: (id: string) => void
  moveTaskDeadline: (id: string, deadline: string | null) => void
  reorderInboxTask: (taskId: string, targetTaskId: string) => void
  importPlan: (data: PlanData, mode: 'replace' | 'merge') => void
}

function updateSettings(data: PlanData, settings: Partial<Settings>): PlanData {
  return { ...data, settings: { ...data.settings, ...settings } }
}

export const usePlanStore = create<PlanState>((set, get) => ({
  data: createDefaultPlan(),
  loaded: false,
  saving: false,
  currentView: 'dashboard',
  selectedTaskId: null,
  taskFormOpen: false,
  editingTaskId: null,
  agendaDate: formatDate(new Date()),
  weekAnchor: formatDate(new Date()),
  searchQuery: '',
  quickCaptureOpen: false,
  exportTextOpen: false,
  settingsOpen: false,

  init: async () => {
    const raw = await loadPlanFromDisk()
    const data = normalizePlan(raw)
    set({
      data,
      loaded: true,
      currentView: data.settings.defaultView,
      agendaDate: formatDate(new Date()),
      weekAnchor: formatDate(new Date()),
    })
  },

  persist: async () => {
    const { data, saving } = get()
    if (saving) return
    set({ saving: true })
    try {
      await savePlanToDisk(data)
    } finally {
      set({ saving: false })
    }
  },

  setView: (view) => {
    set({ currentView: view })
    const { data } = get()
    set({ data: updateSettings(data, { defaultView: view }) })
  },

  setTheme: (theme) => {
    const { data } = get()
    set({ data: updateSettings(data, { theme }) })
  },

  setColorPalette: (colorPalette) => {
    const { data } = get()
    set({ data: updateSettings(data, { colorPalette }) })
  },

  selectBuiltInPalette: (colorPalette) => {
    const { data } = get()
    set({
      data: updateSettings(data, {
        colorPalette,
        customTheme: { ...data.settings.customTheme, enabled: false },
      }),
    })
  },

  selectCustomTheme: () => {
    const { data } = get()
    set({
      data: updateSettings(data, {
        customTheme: { ...data.settings.customTheme, enabled: true },
      }),
    })
  },

  setAmbientAnimation: (ambientAnimation) => {
    const { data } = get()
    set({ data: updateSettings(data, { ambientAnimation }) })
  },

  setCustomTheme: (customTheme) => {
    const { data } = get()
    set({ data: updateSettings(data, { customTheme }) })
  },

  disableCustomTheme: () => {
    const { data } = get()
    set({
      data: updateSettings(data, {
        customTheme: { ...data.settings.customTheme, enabled: false },
      }),
    })
  },

  resetCustomTheme: () => {
    const { data } = get()
    set({
      data: updateSettings(data, {
        colorPalette: 'plain',
        customTheme: { ...DEFAULT_CUSTOM_THEME },
        ambientAnimation: 'auto',
      }),
    })
  },

  setAgendaDate: (date) => set({ agendaDate: date }),
  setWeekAnchor: (date) => set({ weekAnchor: date }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  setJiraSettings: (jira) => {
    const { data } = get()
    set({
      data: updateSettings(data, {
        jira: { ...data.settings.jira, ...jira },
      }),
    })
  },

  setWindowMode: (windowMode) => {
    const { data } = get()
    set({ data: updateSettings(data, { windowMode }) })
  },

  setCalendarSettings: (calendar) => {
    const { data } = get()
    set({
      data: updateSettings(data, {
        calendar: { ...data.settings.calendar, ...calendar },
      }),
    })
  },

  setDailySettings: (daily) => {
    const { data } = get()
    set({
      data: updateSettings(data, {
        daily: { ...data.settings.daily, ...daily },
      }),
    })
  },

  setExportSettings: (exportSettings) => {
    const { data } = get()
    set({
      data: updateSettings(data, {
        export: { ...data.settings.export, ...exportSettings },
      }),
    })
  },

  setVoiceInputEnabled: (voiceInputEnabled) => {
    const { data } = get()
    set({ data: updateSettings(data, { voiceInputEnabled }) })
  },

  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),

  openNewTask: () =>
    set({ taskFormOpen: true, editingTaskId: null, selectedTaskId: null }),

  openQuickCapture: () => set({ quickCaptureOpen: true }),
  closeQuickCapture: () => set({ quickCaptureOpen: false }),
  openExportText: () => set({ exportTextOpen: true }),
  closeExportText: () => set({ exportTextOpen: false }),

  openEditTask: (id) =>
    set({ taskFormOpen: true, editingTaskId: id, selectedTaskId: id }),

  closeTaskForm: () =>
    set({ taskFormOpen: false, editingTaskId: null }),

  addProject: (name, color) => {
    const { data } = get()
    const project: Project = {
      id: uuidv4(),
      name: name.trim(),
      color: color ?? DEFAULT_PROJECT_COLORS[data.projects.length % DEFAULT_PROJECT_COLORS.length],
      completed: false,
      completedAt: null,
    }
    set({ data: { ...data, projects: [...data.projects, project] } })
    return project.id
  },

  updateProject: (id, updates) => {
    const { data } = get()
    set({
      data: {
        ...data,
        projects: data.projects.map((p) =>
          p.id === id ? { ...p, ...updates } : p,
        ),
      },
    })
  },

  deleteProject: (id) => {
    const { data } = get()
    set({
      data: {
        ...data,
        projects: data.projects.filter((p) => p.id !== id),
        tasks: data.tasks.map((t) =>
          t.projectId === id ? { ...t, projectId: null } : t,
        ),
      },
    })
  },

  addTask: (taskData) => {
    const { data } = get()
    const task: Task = {
      ...taskData,
      id: taskData.id ?? uuidv4(),
      attachments: taskData.attachments ?? [],
      createdAt: new Date().toISOString(),
      completedAt: null,
      jiraKey: taskData.jiraKey ?? null,
    }
    set({ data: { ...data, tasks: [...data.tasks, task] } })
  },

  updateTask: (id, updates) => {
    const { data } = get()
    set({
      data: {
        ...data,
        tasks: data.tasks.map((t) => {
          if (t.id !== id) return t
          const updated = { ...t, ...updates }
          if (updates.status === 'done' && t.status !== 'done') {
            updated.completedAt = new Date().toISOString()
          } else if (updates.status && updates.status !== 'done') {
            updated.completedAt = null
          }
          return updated
        }),
      },
    })
  },

  deleteTask: (id) => {
    void deleteTaskAttachments(id)
    const { data } = get()
    set({
      data: {
        ...data,
        tasks: data.tasks.filter((t) => t.id !== id),
      },
    })
  },

  toggleTaskDone: (id) => {
    const { data } = get()
    const task = data.tasks.find((t) => t.id === id)
    if (!task) return
    const newStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done'
    get().updateTask(id, { status: newStatus })
  },

  restoreTask: (id) => {
    get().updateTask(id, { status: 'todo', completedAt: null })
  },

  moveTaskDeadline: (id, deadline) => {
    get().updateTask(id, { deadline })
  },

  reorderInboxTask: (taskId, targetTaskId) => {
    const inbox = getInboxTasks(get().data.tasks)
    const fromIndex = inbox.findIndex((t) => t.id === taskId)
    const toIndex = inbox.findIndex((t) => t.id === targetTaskId)
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return

    const reordered = [...inbox]
    const [item] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, item)

    const base = Date.now()
    reordered.forEach((task, index) => {
      get().updateTask(task.id, {
        createdAt: new Date(base - index * 1000).toISOString(),
      })
    })
  },

  importPlan: (imported, mode) => {
    const { data } = get()
    const next = mode === 'replace' ? replacePlan(data, imported) : mergePlans(data, imported)
    set({
      data: next,
      currentView: next.settings.defaultView,
      selectedTaskId: null,
      taskFormOpen: false,
      editingTaskId: null,
    })
  },
}))
