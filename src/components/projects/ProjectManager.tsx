import { useState, type CSSProperties } from 'react'
import { usePlanStore } from '../../store/planStore'
import { isProjectActive } from '../../lib/selectors'
import { VoiceInputField } from '../ui/VoiceInputField'
import type { Project } from '../../types'

function ProjectRow({
  project,
  onToggleComplete,
  onUpdate,
  onDelete,
  voiceInputEnabled,
}: {
  project: Project
  onToggleComplete: () => void
  onUpdate: (updates: Partial<Pick<Project, 'name' | 'color'>>) => void
  onDelete: () => void
  voiceInputEnabled: boolean
}) {
  const completed = Boolean(project.completed)

  return (
    <li
      className={`project-row${completed ? ' project-row-completed' : ''}`}
      title={completed ? 'Проект завершён' : undefined}
    >
      <label
        className={`project-color-wrap${completed ? ' project-color-wrap-completed' : ''}`}
        title={completed ? 'Цвет проекта (завершён)' : 'Цвет проекта'}
      >
        <input
          type="color"
          className="project-color-input"
          value={project.color}
          onChange={(e) => onUpdate({ color: e.target.value })}
        />
        <span
          className={`project-color-plate${completed ? ' project-color-plate-completed' : ''}`}
          style={{ '--project-color': project.color } as CSSProperties}
          aria-hidden
        />
        {completed ? <span className="project-completed-mark" aria-hidden>✓</span> : null}
      </label>
      <VoiceInputField
        value={project.name}
        onChange={(name) => onUpdate({ name })}
        voiceEnabled={voiceInputEnabled}
        inputClassName={`project-name-input${completed ? ' project-name-input-completed' : ''}`}
      />
      <button
        className={`btn btn-sm project-complete-btn${completed ? ' btn-ghost' : ' btn-accent'}`}
        type="button"
        onClick={onToggleComplete}
        title={completed ? 'Вернуть в работу' : 'Отметить проект завершённым'}
      >
        {completed ? 'Вернуть' : 'Завершить'}
      </button>
      <button
        className="btn btn-ghost btn-sm project-delete-btn"
        type="button"
        onClick={onDelete}
        title="Удалить проект"
      >
        Удалить
      </button>
    </li>
  )
}

export function ProjectManager() {
  const projects = usePlanStore((s) => s.data.projects)
  const addProject = usePlanStore((s) => s.addProject)
  const updateProject = usePlanStore((s) => s.updateProject)
  const deleteProject = usePlanStore((s) => s.deleteProject)
  const voiceInputEnabled = usePlanStore((s) => s.data.settings.voiceInputEnabled)
  const [newName, setNewName] = useState('')

  const activeProjects = projects.filter(isProjectActive)
  const completedProjects = projects.filter((p) => p.completed)

  const handleAdd = () => {
    if (!newName.trim()) return
    addProject(newName.trim())
    setNewName('')
  }

  const toggleComplete = (project: Project) => {
    const next = !project.completed
    updateProject(project.id, {
      completed: next,
      completedAt: next ? new Date().toISOString() : null,
    })
  }

  return (
    <div className="project-manager">
      <h3 className="project-manager-title">Проекты</h3>

      <div className="project-add-row">
        <VoiceInputField
          value={newName}
          onChange={setNewName}
          voiceEnabled={voiceInputEnabled}
          inputClassName="project-add-input"
          placeholder="Новый проект..."
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button className="btn btn-accent btn-sm" type="button" onClick={handleAdd}>
          Добавить
        </button>
      </div>

      {projects.length > 0 ? (
        <>
          {activeProjects.length > 0 ? (
            <ul className="project-list">
              {activeProjects.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  voiceInputEnabled={voiceInputEnabled}
                  onToggleComplete={() => toggleComplete(project)}
                  onUpdate={(updates) => updateProject(project.id, updates)}
                  onDelete={() => deleteProject(project.id)}
                />
              ))}
            </ul>
          ) : (
            <p className="project-empty">Нет активных проектов.</p>
          )}

          {completedProjects.length > 0 ? (
            <div className="project-completed-section">
              <h4 className="project-completed-title">
                Завершённые <span className="project-completed-count">{completedProjects.length}</span>
              </h4>
              <ul className="project-list project-list-completed">
                {completedProjects.map((project) => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    voiceInputEnabled={voiceInputEnabled}
                    onToggleComplete={() => toggleComplete(project)}
                    onUpdate={(updates) => updateProject(project.id, updates)}
                    onDelete={() => deleteProject(project.id)}
                  />
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : (
        <p className="project-empty">Создайте проект для группировки задач по цвету и названию.</p>
      )}
    </div>
  )
}
