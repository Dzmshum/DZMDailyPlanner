import type { ReactNode } from 'react'
import { UiIcon } from './UiIcon'

interface ThemedCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
  className?: string
}

export function ThemedCheckbox({
  checked,
  onChange,
  children,
  className = '',
}: ThemedCheckboxProps) {
  return (
    <label className={`themed-check ${className}`.trim()}>
      <input
        type="checkbox"
        className="themed-check-input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <UiIcon
        icon={checked ? 'checkbox-on' : 'checkbox-off'}
        size="sm"
        className="themed-check-icon"
      />
      <span className="themed-check-label">{children}</span>
    </label>
  )
}
