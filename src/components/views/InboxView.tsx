import { usePlanStore } from '../../store/planStore'
import { getInboxTasks } from '../../lib/selectors'
import { InboxTaskList } from '../tasks/InboxTaskList'
import { InboxWeekStrip } from '../inbox/InboxWeekStrip'
import { EmptyState } from '../ui/EmptyState'

export function InboxView() {
  const tasks = usePlanStore((s) => s.data.tasks)
  const openQuickCapture = usePlanStore((s) => s.openQuickCapture)
  const voiceEnabled = usePlanStore((s) => s.data.settings.voiceInputEnabled)
  const inbox = getInboxTasks(tasks)

  return (
    <div>
      <div className="filters-bar filters-bar-split">
        <p className="settings-hint filters-bar-text">
          Задачи без даты. Перетащите на дни недели ниже или в «Календарь».
          Быстрый захват: <kbd>Q</kbd> / <kbd>Й</kbd>
          {voiceEnabled ? (
            <>
              {' '}
              · голос: <kbd>Ctrl+Shift+V</kbd>
            </>
          ) : null}
        </p>
        <div className="filters-bar-actions">
          <button type="button" className="btn btn-primary" onClick={openQuickCapture}>
            Быстрый захват
          </button>
        </div>
      </div>

      <InboxWeekStrip />

      {inbox.length === 0 ? (
        <EmptyState
          title="Входящие пусты"
          text="Нажмите Q, Й или «Быстрый захват», чтобы добавить мысль без даты"
        />
      ) : (
        <InboxTaskList tasks={inbox} />
      )}
    </div>
  )
}
