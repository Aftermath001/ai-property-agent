import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

const navigationItems = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon, roles: ['admin', 'manager'] },
  { name: 'Leads', href: '/admin/leads', icon: UsersIcon, roles: ['admin', 'manager'] },
  { name: 'Properties', href: '/admin/properties', icon: BuildingOfficeIcon, roles: ['admin', 'manager'] },
  { name: 'Metrics', href: '/admin/metrics', icon: ChartBarIcon, roles: ['admin'] }
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Sidebar({ sidebarOpen, setSidebarOpen, user }) {
  const location = useLocation()

  const navigation = navigationItems.filter((item) => user && item.roles.includes(user.role))
  const isActive = (href) =>
    location.pathname === href || (href !== '/admin' && location.pathname.startsWith(href))

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-950/90 theme-dark:bg-slate-950/90" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>

                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 theme-dark:bg-slate-950">
                  <div className="flex h-16 shrink-0 items-center">
                    <div>
                      <h1 className="text-xl font-bold text-slate-950 theme-dark:text-slate-100">AI Property Agent</h1>
                      {user && <p className="text-sm text-slate-500 theme-dark:text-slate-400">{user.role.toUpperCase()}</p>}
                    </div>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <Link
                                to={item.href}
                                className={classNames(
                                  isActive(item.href)
                                    ? 'bg-slate-100 text-brand-600 theme-dark:bg-slate-800 theme-dark:text-emerald-300'
                                    : 'text-slate-700 hover:text-brand-600 hover:bg-slate-50 theme-dark:text-slate-300 theme-dark:hover:text-emerald-300 theme-dark:hover:bg-slate-800',
                                  'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                )}
                                onClick={() => setSidebarOpen(false)}
                              >
                                <item.icon
                                  className={classNames(
                                    isActive(item.href)
                                      ? 'text-brand-600 theme-dark:text-emerald-300'
                                      : 'text-slate-400 group-hover:text-brand-600 theme-dark:text-slate-500 theme-dark:group-hover:text-emerald-300',
                                    'h-6 w-6 shrink-0'
                                  )}
                                  aria-hidden="true"
                                />
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 border-r border-slate-200 theme-dark:bg-slate-950 theme-dark:border-slate-800">
          <div className="flex h-16 shrink-0 items-center">
            <div>
              <h1 className="text-xl font-bold text-slate-950 theme-dark:text-slate-100">AI Property Agent</h1>
              {user && <p className="text-sm text-slate-500 theme-dark:text-slate-400">{user.role.toUpperCase()}</p>}
            </div>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={classNames(
                          isActive(item.href)
                            ? 'bg-slate-100 text-brand-600 theme-dark:bg-slate-800 theme-dark:text-emerald-300'
                            : 'text-slate-700 hover:text-brand-600 hover:bg-slate-50 theme-dark:text-slate-300 theme-dark:hover:text-emerald-300 theme-dark:hover:bg-slate-800',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                        )}
                      >
                        <item.icon
                          className={classNames(
                            isActive(item.href)
                              ? 'text-brand-600 theme-dark:text-emerald-300'
                              : 'text-slate-400 group-hover:text-brand-600 theme-dark:text-slate-500 theme-dark:group-hover:text-emerald-300',
                            'h-6 w-6 shrink-0'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}
