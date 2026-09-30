import { type NavigationSettings, type SidebarMode } from '../types'

export function nextSidebarNavigation(
  _current: NavigationSettings | undefined,
  sidebarMode: SidebarMode,
): NavigationSettings {
  return { sidebarMode, sidebarOpenMode: sidebarMode }
}

/** `[` и стрелка внизу: полное меню ↔ круговое. */
export function toggledSidebarMode(current: NavigationSettings | undefined): SidebarMode {
  return current?.sidebarMode === 'radial' ? 'expanded' : 'radial'
}
