import { useState } from 'react'
import { usePlanStore } from '../../store/planStore'
import { filterProjectsForSelect } from '../../lib/selectors'
import { VoiceInputField } from '../ui/VoiceInputField'

interface ProjectSelectProps {
  value: string
  onChange: (projectId: string) => void
}

export function ProjectSelect({ value, onChange }: ProjectSelectProps) {
  const projects = usePlanStore((s) => s.data.projects)
  const addProject = usePlanStore((s) => s.addProject)
  const voiceInputEnabled = usePlanStore((s) => s.data.settings.voiceInputEnabled)

  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [query, setQuery] = useState('')

  const hasCompleted = projects.some((p) => p.completed)
  const visibleProjects = filterProjectsForSelect(projects, query, value || null)

  const handleCreate = () => {
    const name = newName.trim()
    if (!name) return
    const id = addProject(name)
    onChange(id)
    setNewName('')
    setCreating(false)
    setQuery('')
  }

  if (creating) {
    return (
      <div className="project-select-create">
        <VoiceInputField
          value={newName}
          onChange={setNewName}
          voiceEnabled={voiceInputEnabled}
          placeholder="Название проекта..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreate()
            if (e.key === 'Escape') setCreating(false)
          }}
          autoFocus
        />
        <div className="project-select-create-actions">
          <button type="button" className="btn btn-sm" onClick={() => setCreating(false)}>
            Отмена
          </button>
          <button type="button" className="btn btn-sm btn-primary" onClick={handleCreate}>
            Создать
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="project-select-row">
      {hasCompleted ? (
        <input
          type="search"
          className="form-input project-select-search"
          placeholder="Найти проект (в т.ч. завершённые)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      ) : null}
      <select
        className="form-select"
        value={value}
        onChange={(e) => {
          if (e.target.value === '__new__') {
            setCreating(true)
            return
          }
          onChange(e.target.value)
        }}
      >
        <option value="">Без проекта</option>
        {visibleProjects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.completed ? `✓ ${p.name}` : p.name}
          </option>
        ))}
        <option value="__new__">+ Создать проект...</option>
      </select>
    </div>
  )
}
