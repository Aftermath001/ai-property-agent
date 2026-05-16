import { Link, useLocation } from 'react-router-dom'
import { HomeIcon, MagnifyingGlassIcon, HeartIcon, ChatBubbleLeftRightIcon, UserCircleIcon } from '@heroicons/react/24/outline'

const navItems = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Search', href: '/search', icon: MagnifyingGlassIcon },
  { name: 'Saved', href: '/saved', icon: HeartIcon },
  { name: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon },
  { name: 'Profile', href: '/profile', icon: UserCircleIcon },
]

export default function ClientBottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-xl theme-dark:border-slate-800 theme-dark:bg-slate-950/95 lg:hidden">
      <div className="mx-auto flex max-w-4xl justify-between px-4 py-3">
        {navItems.map((item) => {
          const active = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`inline-flex flex-col items-center text-xs font-semibold ${active ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-900 theme-dark:text-slate-300'}`}
            >
              <item.icon className="h-6 w-6" aria-hidden="true" />
              {item.name}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
