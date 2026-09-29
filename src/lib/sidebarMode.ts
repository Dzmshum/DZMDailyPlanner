import {
  DEFAULT_NAVIGATION_SETTINGS,
  type NavigationSettings,
  type SidebarMode,
  type SidebarOpenMode,
} from '../types'

function rememberedOpenMode(current: NavigationSettings): SidebarOpenMode {
  if (current.sidebarMode === 'rail' || current.sidebarMode === 'expanded') {
    return current.sidebarMode
  }
  return current.sidebarOpenMode === 'rail' ? 'rail' : 'expanded'
}

export function nextSidebarNavigation(
  current: NavigationSettings | undefined,
  sidebarMode: SidebarMode,
): NavigationSettings {
  const prev = current ?? DEFAULT_NAVIGATION_SETTINGS
  if (sidebarMode === 'peek') {
    return { sidebarMode: 'peek', sidebarOpenMode: rememberedOpenMode(prev) }
  }
  return { sidebarMode, sidebarOpenMode: sidebarMode }
}

const SIDEBAR_CYCLE: readonly SidebarMode[] = ['expanded', 'rail', 'peek']

/** `[` и кнопка внизу: полное меню → иконки → скрыто → полное меню. */
export function toggledSidebarMode(current: NavigationSettings | undefined): SidebarMode {
  const mode = current?.sidebarMode ?? 'expanded'
  const index = SIDEBAR_CYCLE.indexOf(mode)
  return SIDEBAR_CYCLE[(index + 1) % SIDEBAR_CYCLE.length] ?? 'expanded'
}
