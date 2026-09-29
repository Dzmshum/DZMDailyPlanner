import type { ReactNode } from 'react'
import { usePlanStore } from '../../store/planStore'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { AmbientBackground } from './AmbientBackground'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const sidebarMode = usePlanStore((s) => s.data.settings.navigation?.sidebarMode ?? 'expanded')

  return (
    <>
      <AmbientBackground />
      <div className={`app-layout${sidebarMode === 'peek' ? ' app-layout--peek' : ''}`}>
        <div className="sidebar-slot">
          <Sidebar />
        </div>
        <div className="main-content">
          <Header />
          <main className="view-content">{children}</main>
        </div>
      </div>
    </>
  )
}
