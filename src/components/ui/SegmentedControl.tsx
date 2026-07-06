import type { ReactNode } from 'react'

interface SegmentedControlProps {
  children: ReactNode
  className?: string
  'aria-label'?: string
}

export function SegmentedControl({
  children,
  className,
  'aria-label': ariaLabel,
}: SegmentedControlProps) {
  return (
    <div
      className={['segmented-control', className].filter(Boolean).join(' ')}
      role="tablist"
      aria-label={ariaLabel}
    >
      {children}
    </div>
  )
}

interface SegmentedControlItemProps {
  active?: boolean
  onClick: () => void
  children: ReactNode
}

export function SegmentedControlItem({ active, onClick, children }: SegmentedControlItemProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`btn segmented-control-item ${active ? 'is-active' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
