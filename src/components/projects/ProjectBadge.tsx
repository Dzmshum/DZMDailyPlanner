import type { Project } from '../../types'

interface ProjectBadgeProps {
  project?: Project
  fallback?: string
}

export function ProjectBadge({ project, fallback = 'Без проекта' }: ProjectBadgeProps) {
  if (!project) {
    return <span className="project-badge">{fallback}</span>
  }

  return (
    <span
      className={`project-badge${project.completed ? ' project-badge-completed' : ''}`}
      title={project.completed ? 'Проект завершён' : undefined}
    >
      <span
        className={`project-dot${project.completed ? ' project-dot-completed' : ''}`}
        style={{ background: project.color }}
      />
      {project.completed ? <span className="project-badge-check" aria-hidden>✓</span> : null}
      {project.name}
    </span>
  )
}
