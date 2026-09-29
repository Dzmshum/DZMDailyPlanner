import type { JiraSettings } from '../../../types'
import { usePlanStore } from '../../../store/planStore'
import { ThemedCheckbox } from '../../ui/ThemedCheckbox'
import { SettingsSection } from '../SettingsSection'

export function IntegrationsPanel({ query }: { query: string }) {
  const jira = usePlanStore((s) => s.data.settings.jira)
  const setJiraSettings = usePlanStore((s) => s.setJiraSettings)

  const patchJira = (updates: Partial<JiraSettings>) => setJiraSettings({ ...jira, ...updates })

  return (
    <SettingsSection
      id="jira"
      hint="Токен в plan.json, в экспорт плана не попадает. URL — только https, публичный host."
      query={query}
    >
      <p className="settings-hint">
        Токен:{' '}
        <a
          href="https://id.atlassian.com/manage-profile/security/api-tokens"
          target="_blank"
          rel="noreferrer"
        >
          Atlassian → API tokens
        </a>
        . Сохраняется само. Нужен Electron.
      </p>

      <ThemedCheckbox
        className="settings-check"
        checked={jira.enabled}
        onChange={(v) => patchJira({ enabled: v })}
      >
        Включить экспорт в Jira
      </ThemedCheckbox>

      <div className="form-group">
        <label className="form-label">URL Jira</label>
        <input
          className="form-input"
          placeholder="https://company.atlassian.net"
          value={jira.baseUrl}
          onChange={(e) => patchJira({ baseUrl: e.target.value })}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            type="email"
            placeholder="you@company.com"
            value={jira.email}
            onChange={(e) => patchJira({ email: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">API Token</label>
          <input
            className="form-input"
            type="password"
            placeholder="••••••••"
            value={jira.apiToken}
            onChange={(e) => patchJira({ apiToken: e.target.value })}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Ключ проекта</label>
          <input
            className="form-input"
            placeholder="PROJ"
            value={jira.projectKey}
            onChange={(e) => patchJira({ projectKey: e.target.value.toUpperCase() })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Тип задачи</label>
          <input
            className="form-input"
            placeholder="Task"
            value={jira.issueType}
            onChange={(e) => patchJira({ issueType: e.target.value })}
          />
        </div>
      </div>
    </SettingsSection>
  )
}
