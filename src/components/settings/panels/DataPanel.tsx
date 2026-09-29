import { isElectron } from '../../../lib/electron'
import { SettingsSection } from '../SettingsSection'

export function DataPanel({
  query,
  planPath,
  sharedFile,
}: {
  query: string
  planPath: string | null
  sharedFile: boolean
}) {
  return (
    <SettingsSection id="plan-file" query={query}>
      {sharedFile ? (
        <>
          <p className="settings-hint">
            Один файл на диске.{' '}
            {isElectron()
              ? 'Пересборка .exe задачи не удаляет.'
              : 'pnpm dev читает тот же файл, что Electron.'}
          </p>
          {planPath && (
            <p className="settings-path">
              <span className="form-label">Файл данных</span>
              <code>{planPath}</code>
            </p>
          )}
          <p className="settings-hint">
            Копия: <code>plan.json.bak</code> рядом. Импорт и экспорт — в шапке.
          </p>
        </>
      ) : (
        <p className="settings-hint">
          Сейчас localStorage браузера, отдельно от десктопа. Общий файл:{' '}
          <code>pnpm dev</code> или <code>pnpm electron:dev</code>.
        </p>
      )}
    </SettingsSection>
  )
}
