interface EmptyStateProps {
  icon?: string
  title: string
  text?: string
}

export function EmptyState({ icon = '❄', title, text }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <p className="empty-state-title">{title}</p>
      {text && <p className="empty-state-text">{text}</p>}
    </div>
  )
}
