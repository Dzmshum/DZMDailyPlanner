import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { AmbientBackground } from './AmbientBackground'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <AmbientBackground />
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Header />
          <main className="view-content">{children}</main>
        </div>
      </div>
    </>
  )
}
