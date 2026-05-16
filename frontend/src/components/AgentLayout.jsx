import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useAuth } from '../contexts/AuthContext'

export default function AgentLayout({ theme, setTheme }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 theme-dark:bg-slate-950 theme-dark:text-slate-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} />
      <div className="lg:pl-72">
        <Header setSidebarOpen={setSidebarOpen} theme={theme} setTheme={setTheme} user={user} logout={logout} />
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
