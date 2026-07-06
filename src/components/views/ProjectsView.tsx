import { ProjectManager } from '../projects/ProjectManager'

export function ProjectsView() {
  return (
    <div className="projects-view">
      <p className="settings-hint projects-view-hint">
        Проекты для группировки задач. Цвет на карточках и в календаре. Завершённые проекты скрыты при выборе в новых задачах.
      </p>
      <ProjectManager />
    </div>
  )
}
