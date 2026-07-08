import { usePlanStore } from '../../store/planStore'
import { getInboxTasks, getTodayTasks } from '../../lib/selectors'
import { TaskCompleteToggle } from '../tasks/TaskCompleteToggle'
import { WindowControls } from './WindowControls'
import { BrandMark } from './BrandMark'
import { expandElectronWindow, isElectron } from '../../lib/electron'

export function MinimalView() {
  const tasks = usePlanStore((s) => s.data.tasks)
  const openEditTask = usePlanStore((s) => s.openEditTask)
  const openNewTask = usePlanStore((s) => s.openNewTask)
  const openQuickCapture = usePlanStore((s) => s.openQuickCapture)
  const toggleTaskDone = usePlanStore((s) => s.toggleTaskDone)
  const setWindowMode = usePlanStore((s) => s.setWindowMode)

  const todayTasks = getTodayTasks(tasks).slice(0, 7)
  const inboxTasks = getInboxTasks(tasks).slice(0, 5)

  const handleTaskClick = async (id: string) => {
    if (isElectron()) {
      setWindowMode('standard')
      await expandElectronWindow(id)
    }
    openEditTask(id)
  }

  const handleExpand = async () => {
    setWindowMode('standard')
    await expandElectronWindow()
  }

  return (
    <div className="minimal-layout">
      <header className="minimal-header titlebar">
        <div className="titlebar-drag minimal-brand">
          <BrandMark variant="icon" size="xs" />
          <BrandMark variant="wordmark" size="sm" />
        </div>
        <div className="titlebar-no-drag">
          <WindowControls compact />
        </div>
      </header>

      <div className="minimal-body">
        <section className="minimal-section">
          <h2 className="minimal-section-title">Сегодня</h2>
          {todayTasks.length === 0 ? (
            <p className="minimal-empty">Нет задач на сегодня</p>
          ) : (
            <ul className="minimal-list">
              {todayTasks.map((task) => (
                <li key={task.id} className="minimal-item">
                  <TaskCompleteToggle
                    checked={false}
                    taskTitle={task.title}
                    onToggle={() => toggleTaskDone(task.id)}
                    size="compact"
                  />
                  <button
                    type="button"
                    className="minimal-item-title"
                    onClick={() => void handleTaskClick(task.id)}
                  >
                    {task.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {inboxTasks.length > 0 && (
          <section className="minimal-section">
            <h2 className="minimal-section-title">Входящие</h2>
            <ul className="minimal-list">
              {inboxTasks.map((task) => (
                <li key={task.id} className="minimal-item">
                  <TaskCompleteToggle
                    checked={false}
                    taskTitle={task.title}
                    onToggle={() => toggleTaskDone(task.id)}
                    size="compact"
                  />
                  <button
                    type="button"
                    className="minimal-item-title"
                    onClick={() => void handleTaskClick(task.id)}
                  >
                    {task.title}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <footer className="minimal-footer">
        <button
          type="button"
          className="btn btn-sm minimal-footer-btn"
          onClick={openQuickCapture}
          aria-label="Быстрый захват (Q / Й)"
        >
          <span className="minimal-btn-label">Быстро (Q / Й)</span>
          <span className="minimal-btn-label-short">Быстро</span>
        </button>
        <button
          type="button"
          className="btn btn-sm btn-primary minimal-footer-btn"
          onClick={openNewTask}
          aria-label="Новая задача"
        >
          +
        </button>
        <button
          type="button"
          className="btn btn-sm minimal-footer-btn"
          onClick={() => void handleExpand()}
          aria-label="Развернуть окно"
        >
          <span className="minimal-btn-label">Развернуть</span>
          <span className="minimal-btn-label-short" aria-hidden>
            ↗
          </span>
        </button>
      </footer>
    </div>
  )
}
