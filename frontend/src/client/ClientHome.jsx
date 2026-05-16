import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { SparklesIcon, MapPinIcon, BuildingOffice2Icon, ArrowRightIcon } from '@heroicons/react/24/outline'
import ClientBottomNav from './ClientBottomNav'

const steps = [
  {
    title: 'Tell us your budget',
    description: 'Choose a price range and preferred location for fast matching.',
  },
  {
    title: 'Get AI-matched homes',
    description: 'We surface the best listings for your needs instantly.',
  },
  {
    title: 'Contact via WhatsApp',
    description: 'Reach the agent with one tap and book a viewing.',
  },
]

export default function ClientHome({ theme, setTheme }) {
  const [featured, setFeatured] = useState([])
  const [search, setSearch] = useState({ location: '', budget: 5000000, bedrooms: 'Any' })

  useEffect(() => {
    fetchFeatured()
  }, [])

  const fetchFeatured = async () => {
    try {
      const response = await axios.get('/properties?limit=6')
      setFeatured(response.data.properties || [])
    } catch (error) {
      console.error('Error loading featured properties:', error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 theme-dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-600 theme-dark:text-slate-300">Login or sign up to save favorites and book viewings faster.</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/login"
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:border-emerald-500 hover:text-emerald-700 theme-dark:border-slate-800 theme-dark:bg-slate-900 theme-dark:text-slate-100"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              Sign up
            </Link>
          </div>
        </div>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-start">
          <div>
            <p className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-200">
              <SparklesIcon className="h-4 w-4 mr-2" aria-hidden="true" />
              AI-powered property matching for Kenya
            </p>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 theme-dark:text-slate-100 sm:text-5xl">
              Find your perfect home instantly.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 theme-dark:text-slate-300">
              Search verified Kenyan listings with fast AI matching, WhatsApp contact, and real-time property recommendations.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm theme-dark:border-slate-800 theme-dark:bg-slate-900">
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Listings</p>
                <p className="mt-4 text-3xl font-semibold text-slate-950 theme-dark:text-white">{featured.length}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm theme-dark:border-slate-800 theme-dark:bg-slate-900">
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">WhatsApp ready</p>
                <p className="mt-4 text-3xl font-semibold text-slate-950 theme-dark:text-white">1-tap chat</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm theme-dark:border-slate-800 theme-dark:bg-slate-900">
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Local support</p>
                <p className="mt-4 text-3xl font-semibold text-slate-950 theme-dark:text-white">Nairobi + Coast</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm theme-dark:bg-slate-900 theme-dark:border-slate-800 border border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-950 theme-dark:text-slate-100">Search listings</h2>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 theme-dark:bg-slate-800 theme-dark:text-slate-200"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              >
                {theme === 'light' ? 'Dark' : 'Light'} mode
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-slate-700 theme-dark:text-slate-300">Location</label>
              <input
                value={search.location}
                onChange={(e) => setSearch(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Nairobi, Mombasa, Kisumu"
                className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 theme-dark:border-slate-800 theme-dark:bg-slate-950 theme-dark:text-slate-100"
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 theme-dark:text-slate-300">Budget</label>
                <input
                  type="range"
                  min="100000"
                  max="2000000"
                  step="50000"
                  value={search.budget}
                  onChange={(e) => setSearch(prev => ({ ...prev, budget: Number(e.target.value) }))}
                  className="mt-3 w-full"
                />
                <div className="mt-2 flex items-center justify-between text-sm text-slate-500 theme-dark:text-slate-400">
                  <span>KSh 100,000</span>
                  <span className="font-semibold text-slate-900 theme-dark:text-slate-100">KSh {search.budget.toLocaleString()}</span>
                  <span>KSh 2,000,000</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 theme-dark:text-slate-300">Bedrooms</label>
                <select
                  value={search.bedrooms}
                  onChange={(e) => setSearch(prev => ({ ...prev, bedrooms: e.target.value }))}
                  className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 theme-dark:border-slate-800 theme-dark:bg-slate-950 theme-dark:text-slate-100"
                >
                  <option>Any</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4+</option>
                </select>
              </div>
              <Link
                to={`/search?location=${encodeURIComponent(search.location)}&min_price=100000&max_price=${search.budget}${search.bedrooms !== 'Any' ? `&bedrooms=${search.bedrooms}` : ''}`}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-500/20 hover:bg-emerald-700"
              >
                Search properties
n                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <section className="mt-14">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 theme-dark:text-slate-400">Featured listings</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950 theme-dark:text-slate-100">Top homes ready for viewing</h2>
            </div>
            <Link to="/search" className="text-sm font-semibold text-emerald-600 hover:text-emerald-800">
              Browse all <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featured.map((property) => (
              <article key={property.id} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg theme-dark:border-slate-800 theme-dark:bg-slate-900">
                <div className="aspect-[4/3] bg-slate-200" />
                <div className="p-6">
                  <p className="text-sm font-semibold text-emerald-700">AI match</p>
                  <h3 className="mt-3 text-xl font-semibold text-slate-950 theme-dark:text-slate-100">{property.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 theme-dark:text-slate-300 line-clamp-2">{property.description}</p>
                  <div className="mt-5 flex items-center justify-between text-sm font-semibold text-slate-900 theme-dark:text-slate-100">
                    <span>KSh {property.price.toLocaleString()}</span>
                    <span>{property.bedrooms} bed</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-3xl bg-slate-950 px-8 py-10 text-white theme-dark:bg-slate-900">
          <div className="grid gap-8 lg:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white">{index + 1}</div>
                <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-200">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="pt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ClientBottomNav />
        </div>
      </div>
    </div>
  )
}
