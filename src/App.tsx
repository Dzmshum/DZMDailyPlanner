import { useEffect, type ReactNode } from 'react'
import { usePlanStore } from './store/planStore'
import { useAutoSave } from './hooks/useAutoSave'
import { useHotkeys } from './hooks/useHotkeys'
import { useTheme } from './hooks/useTheme'
import { useWindowMode } from './hooks/useWindowMode'
import { AppLayout } from './components/layout/AppLayout'
import { MinimalView } from './components/layout/MinimalView'
import { TaskForm } from './components/tasks/TaskForm'
import { SettingsModal } from './components/settings/SettingsModal'
import { ConfirmDialog } from './components/ui/ConfirmDialog'
import { QuickCaptureModal } from './components/ui/QuickCaptureModal'
import { ExportTextModal } from './components/ui/ExportTextModal'
import { Dashboard } from './components/views/Dashboard'
import { Agenda } from './components/views/Agenda'
import { CalendarView } from './components/views/CalendarView'
import { TasksView } from './components/views/TasksView'
import { History } from './components/views/History'
import { InboxView } from './components/views/InboxView'
import { DailyReportView } from './components/views/DailyReportView'
import { ProjectsView } from './components/views/ProjectsView'
import { isElectron } from './lib/electron'

function AppShell({ children }: { children: ReactNode }) {
  const exportTextOpen = usePlanStore((s) => s.exportTextOpen)
  const closeExportText = usePlanStore((s) => s.closeExportText)

  return (
    <>
      {children}
      <TaskForm />
      <QuickCaptureModal />
      <ExportTextModal open={exportTextOpen} onClose={closeExportText} />
      <SettingsModal />
      <ConfirmDialog />
    </>
  )
}

function App() {
  const loaded = usePlanStore((s) => s.loaded)
  const currentView = usePlanStore((s) => s.currentView)
  const windowMode = usePlanStore((s) => s.data.settings.windowMode)
  const init = usePlanStore((s) => s.init)

  useEffect(() => {
    void init()
  }, [init])

  useAutoSave()
  useHotkeys()
  useTheme()
  useWindowMode()

  if (!loaded) {
    return <div className="loading-screen">Загрузка плана...</div>
  }

  if (isElectron() && windowMode === 'minimal') {
    return (
      <AppShell>
        <MinimalView />
      </AppShell>
    )
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      case 'agenda':
        return <Agenda />
      case 'week':
        return <CalendarView />
      case 'tasks':
        return <TasksView />
      case 'projects':
        return <ProjectsView />
      case 'history':
        return <History />
      case 'inbox':
        return <InboxView />
      case 'daily':
        return <DailyReportView />
      default:
        return <Dashboard />
    }
  }

  return (
    <AppShell>
      <AppLayout>{renderView()}</AppLayout>
    </AppShell>
  )
}

export default App
