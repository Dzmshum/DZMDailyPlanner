import { useEffect, useMemo, useState } from 'react'
import { usePlanStore } from '../../store/planStore'
import {
  getDailyReportPeriod,
  getDailyReportPeriodForTarget,
  getDoneTasksForDailyReport,
  getDoneTasksForTargetDaily,
  getPastDailyMeetings,
  getPeriodEndDeferredTasks,
  getUndoneTasksForDailyReport,
} from '../../lib/dailyMeetings'
import { groupTasksByProject } from '../../lib/selectors'
import { formatDate, formatDisplayDate, formatShortDate, parseDate } from '../../lib/dates'
import { EmptyState } from '../ui/EmptyState'
import { DailyReportTaskList } from './DailyReportTaskList'
import type { Task } from '../../types'

function formatTaskForCopy(task: Task): string[] {
  const lines = [`- ${task.title}`]
  const notes = task.notes.trim()
  if (notes) lines.push(`  ${notes}`)
  return lines
}

function useNow(tickMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), tickMs)
    return () => window.clearInterval(id)
  }, [tickMs])

  return now
}

export function DailyReportView() {
  const tasks = usePlanStore((s) => s.data.tasks)
  const projects = usePlanStore((s) => s.data.projects)
  const daily = usePlanStore((s) => s.data.settings.daily)
  const now = useNow()
  const [selectedTargetKey, setSelectedTargetKey] = useState<string | null>(null)

  const currentTarget = useMemo(
    () => getDailyReportPeriod(daily.days, now).targetDaily,
    [daily.days, now],
  )

  const selectedTarget = useMemo(() => {
    if (!selectedTargetKey) return currentTarget
    return selectedTargetKey === formatDate(currentTarget ?? new Date(0))
      ? currentTarget
      : parseDate(selectedTargetKey)
  }, [selectedTargetKey, currentTarget])

  const isViewingCurrent =
    selectedTarget &&
    currentTarget &&
    formatDate(selectedTarget) === formatDate(currentTarget)

  const period = useMemo(() => {
    if (!selectedTarget) return getDailyReportPeriod(daily.days, now)
    return getDailyReportPeriodForTarget(selectedTarget, daily.days)
  }, [daily.days, now, selectedTarget])

  const doneTasks = useMemo(() => {
    if (!selectedTarget) return getDoneTasksForDailyReport(tasks, daily.days, now)
    return getDoneTasksForTargetDaily(tasks, selectedTarget, daily.days)
  }, [tasks, daily.days, now, selectedTarget])

  const undoneTasks = useMemo(() => {
    if (!isViewingCurrent) return []
    return getUndoneTasksForDailyReport(tasks, daily.days, now)
  }, [tasks, daily.days, now, isViewingCurrent])

  const deferredTasks = useMemo(() => {
    if (!selectedTarget || isViewingCurrent) return []
    return getPeriodEndDeferredTasks(tasks, selectedTarget)
  }, [tasks, selectedTarget, isViewingCurrent])

  const pastMeetings = useMemo(() => {
    const past = getPastDailyMeetings(now, daily.days, 10)
    return past.map((date) => {
      const reportCount = getDoneTasksForTargetDaily(tasks, date, daily.days).length
      const deferredCount = getPeriodEndDeferredTasks(tasks, date).length
      return {
        date,
        key: formatDate(date),
        reportCount,
        deferredCount,
        periodTotal: reportCount + deferredCount,
      }
    })
  }, [tasks, daily.days, now])

  const grouped = groupTasksByProject(doneTasks, projects)

  const handleCopy = async () => {
    const lines = ['Сделано к дейлику:', '']
    if (period.targetDaily) {
      lines.push(`Дейлик ${formatDisplayDate(period.targetDaily)}`)
      if (period.periodEnd) {
        lines.push(`Период до ${formatDisplayDate(period.periodEnd)} включительно (до 13:00)`)
      }
      lines.push('')
    }
    for (const task of doneTasks) {
      lines.push(...formatTaskForCopy(task))
    }
    if (undoneTasks.length > 0) {
      lines.push('', 'Не сделано:', '')
      for (const task of undoneTasks) {
        lines.push(...formatTaskForCopy(task))
      }
    }
    await navigator.clipboard.writeText(lines.join('\n'))
  }

  return (
    <div>
      <div className="filters-bar filters-bar-split">
        <div className="filters-bar-text">
          {period.targetDaily ? (
            <p className="settings-hint">
              {!isViewingCurrent ? (
                <>
                  <button
                    type="button"
                    className="daily-report-back-link"
                    onClick={() => setSelectedTargetKey(null)}
                  >
                    ← Актуальный
                  </button>
                  {' · '}
                </>
              ) : null}
              Дейлик {formatDisplayDate(period.targetDaily)}
              {period.periodEnd ? (
                <>
                  {' '}
                  · закрыто до {formatDisplayDate(period.periodEnd)} включительно
                  {period.periodStart ? (
                    <>
                      {' '}
                      (с {formatDisplayDate(period.periodStart)})
                    </>
                  ) : null}
                  , до 13:00
                  : <strong>{doneTasks.length}</strong>
                </>
              ) : (
                <>
                  {' '}
                  · закрыто: <strong>{doneTasks.length}</strong>
                </>
              )}
            </p>
          ) : (
            <p className="settings-hint">Ближайший рабочий дейлик не найден в календаре</p>
          )}
        </div>
        <div className="filters-bar-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={doneTasks.length === 0 && undoneTasks.length === 0}
            onClick={() => void handleCopy()}
          >
            Скопировать для дейлика
          </button>
        </div>
      </div>

      {pastMeetings.length > 0 && isViewingCurrent ? (
        <details className="daily-history-section">
          <summary className="daily-history-summary">
            Прошлые дейлики <span className="daily-history-count">{pastMeetings.length}</span>
          </summary>
          <ul className="daily-history-list">
            {pastMeetings.map(({ date, key, reportCount, deferredCount, periodTotal }) => (
              <li key={key}>
                <button
                  type="button"
                  className="daily-history-item"
                  onClick={() => setSelectedTargetKey(key)}
                >
                  <span className="daily-history-item-date">{formatShortDate(date)}</span>
                  <span className="daily-history-item-meta">
                    {reportCount > 0
                      ? `${reportCount} в отчёт`
                      : 'в отчёт ничего'}
                    {deferredCount > 0
                      ? ` · +${deferredCount} после 13:00`
                      : null}
                    {periodTotal > 0 && deferredCount > 0 ? ` (${periodTotal} за период)` : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {doneTasks.length === 0 ? (
        <EmptyState
          title="За период ничего не закрыто"
          text={
            isViewingCurrent
              ? 'Отмечайте задачи выполненными до дня дейлика (до 13:00) — они появятся здесь'
              : 'За этот период задачи не закрывались'
          }
        />
      ) : (
        grouped.map(({ project, tasks: groupTasks }) => (
          <section key={project?.id ?? 'none'} className="section daily-report-section">
            <h2 className="section-title">
              {project?.name ?? 'Без проекта'} ({groupTasks.length})
            </h2>
            <DailyReportTaskList tasks={groupTasks} />
          </section>
        ))
      )}

      {deferredTasks.length > 0 && (
        <details className="daily-deferred-section">
          <summary className="daily-deferred-summary">
            Перенесено на следующий дейлик (после 13:00){' '}
            <span className="daily-deferred-count">{deferredTasks.length}</span>
          </summary>
          <p className="settings-hint daily-deferred-hint">
            Закрыто в последний день периода после 13:00 — в отчёт этого дейлика не входит,
            попадёт в следующий. В истории эти задачи видны по дате закрытия.
          </p>
          <DailyReportTaskList tasks={deferredTasks} subdued />
        </details>
      )}

      {undoneTasks.length > 0 && (
        <details className="daily-undone-section">
          <summary className="daily-undone-summary">
            Не сделано <span className="daily-undone-count">{undoneTasks.length}</span>
          </summary>
          <DailyReportTaskList tasks={undoneTasks} subdued />
        </details>
      )}
    </div>
  )
}
