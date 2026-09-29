import { useEffect, useState } from 'react'
import { usePlanStore } from '../../store/planStore'
import { getPlanFilePath, usesSharedPlanFile } from '../../lib/storage'
import {
  readSettingsTab,
  resolveSettingsTab,
  SETTINGS_TABS,
  tabsMatchingQuery,
  writeSettingsTab,
  type SettingsTab,
} from '../../lib/settingsNav'
import { Modal } from '../ui/Modal'
import { SettingsSubnav } from './SettingsSubnav'
import { AppearancePanel } from './panels/AppearancePanel'
import { PlanningPanel } from './panels/PlanningPanel'
import { WindowPanel } from './panels/WindowPanel'
import { ExportPanel } from './panels/ExportPanel'
import { DataPanel } from './panels/DataPanel'
import { IntegrationsPanel } from './panels/IntegrationsPanel'
import { RoadmapPanel } from './panels/RoadmapPanel'

export function SettingsModal() {
  const open = usePlanStore((s) => s.settingsOpen)
  const closeSettings = usePlanStore((s) => s.closeSettings)

  const [tab, setTab] = useState<SettingsTab>(() => readSettingsTab())
  const [query, setQuery] = useState('')
  const [planPath, setPlanPath] = useState<string | null>(null)
  const [sharedFile, setSharedFile] = useState(false)

  useEffect(() => {
    if (open) return
    setQuery('')
  }, [open])

  useEffect(() => {
    if (!open) return
    void usesSharedPlanFile().then(setSharedFile)
    void getPlanFilePath().then(setPlanPath)
  }, [open])

  const selectTab = (next: SettingsTab) => {
    setTab(next)
    writeSettingsTab(next)
  }

  const onSearch = (value: string) => {
    setQuery(value)
    const next = resolveSettingsTab(tab, value)
    if (next !== tab) selectTab(next)
  }

  const visibleTabs = tabsMatchingQuery(query)
  const showEmpty = query.trim() !== '' && visibleTabs.length === 0

  return (
    <Modal open={open} onClose={closeSettings} title="Настройки" size="xl">
      <div className="settings-layout">
        <label className="settings-search">
          <span className="visually-hidden">Поиск настройки</span>
          <input
            id="settings-search"
            className="form-input"
            type="search"
            placeholder="Поиск настройки"
            value={query}
            autoComplete="off"
            onChange={(e) => onSearch(e.target.value)}
          />
        </label>

        <nav className="settings-nav" aria-label="Разделы настроек">
          {SETTINGS_TABS.filter((item) => visibleTabs.includes(item.id)).map((item) => (
            <button
              key={item.id}
              type="button"
              className={`settings-nav-item ${tab === item.id ? 'active' : ''}`}
              aria-current={tab === item.id ? 'true' : undefined}
              onClick={() => selectTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="settings-panel">
          {showEmpty ? (
            <p className="settings-hint">Ничего не найдено.</p>
          ) : (
            <>
              <SettingsSubnav tab={tab} query={query} />
              <div className="settings-panel-body">
                {tab === 'appearance' && <AppearancePanel query={query} />}
                {tab === 'planning' && <PlanningPanel query={query} />}
                {tab === 'window' && <WindowPanel query={query} />}
                {tab === 'export' && <ExportPanel query={query} />}
                {tab === 'data' && (
                  <DataPanel query={query} planPath={planPath} sharedFile={sharedFile} />
                )}
                {tab === 'integrations' && <IntegrationsPanel query={query} />}
                {tab === 'roadmap' && <RoadmapPanel query={query} />}
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}
