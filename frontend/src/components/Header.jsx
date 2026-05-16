import { Bars3Icon, MoonIcon, SunIcon } from '@heroicons/react/24/outline'

export default function Header({ setSidebarOpen, theme, setTheme, user, logout }) {
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 theme-dark:border-slate-800 theme-dark:bg-slate-950">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-slate-700 lg:hidden theme-dark:text-slate-200"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="h-6 w-px bg-slate-200 lg:hidden theme-dark:bg-slate-800" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center text-sm text-slate-600 theme-dark:text-slate-300">
          <span className="font-medium">Sales Agent Dashboard</span>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button
            type="button"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 theme-dark:border-slate-800 theme-dark:bg-slate-900 theme-dark:text-slate-200"
          >
            {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
          </button>

          {user ? (
            <div className="hidden sm:flex items-center gap-x-3">
              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 theme-dark:border-slate-800 theme-dark:bg-slate-900 theme-dark:text-slate-100">
                {user.name} · {user.role.toUpperCase()}
              </div>
              <button
                type="button"
                onClick={logout}
                className="inline-flex h-10 items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 theme-dark:border-slate-800 theme-dark:bg-slate-900 theme-dark:text-slate-100"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-x-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 theme-dark:border-slate-800 theme-dark:bg-slate-900 theme-dark:text-slate-100">
              Agent
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
