interface EmptyStateProps {
  icon?: string
  title: string
  text?: string
}

export function EmptyState({ icon, title, text }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon ? <div className="empty-state-icon">{icon}</div> : null}
      <p className="empty-state-title">{title}</p>
      {text && <p className="empty-state-text">{text}</p>}
    </div>
  )
}
