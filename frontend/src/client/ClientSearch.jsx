import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'
import { MapPinIcon, BuildingOffice2Icon, FunnelIcon, SparklesIcon } from '@heroicons/react/24/outline'
import ClientBottomNav from './ClientBottomNav'

const bedroomOptions = ['Any', '1', '2', '3', '4+']

export default function ClientSearch({ theme, setTheme }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    min_price: parseInt(searchParams.get('min_price') || '100000', 10),
    max_price: parseInt(searchParams.get('max_price') || '2000000', 10),
    bedrooms: searchParams.get('bedrooms') || 'Any',
    sort: searchParams.get('sort') || 'newest'
  })

  useEffect(() => {
    fetchProperties()
  }, [filters])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.location) params.append('location', filters.location)
      if (filters.bedrooms !== 'Any') params.append('bedrooms', filters.bedrooms)
      if (filters.min_price) params.append('min_price', filters.min_price)
      if (filters.max_price) params.append('max_price', filters.max_price)
      const response = await axios.get(`/properties?${params}`)
      let result = response.data.properties || []
      if (filters.sort === 'price_asc') {
        result = result.sort((a, b) => a.price - b.price)
      } else if (filters.sort === 'price_desc') {
        result = result.sort((a, b) => b.price - a.price)
      }
      setProperties(result)
      setSearchParams({
        ...Object.fromEntries(params.entries()),
        sort: filters.sort
      })
    } catch (err) {
      console.error('Error fetching properties:', err)
    } finally {
      setLoading(false)
    }
  }

  const featured = useMemo(() => properties.slice(0, 3), [properties])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 theme-dark:bg-slate-950 theme-dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Search listings</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950 theme-dark:text-slate-100">Find homes by budget, location, and bedrooms</h1>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 theme-dark:bg-slate-800 theme-dark:text-slate-100"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? 'Dark' : 'Light'} mode
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm theme-dark:border-slate-800 theme-dark:bg-slate-900">
            <div className="flex items-center gap-3 text-slate-900 theme-dark:text-slate-100">
              <FunnelIcon className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold">Filters</h2>
            </div>
            <div className="mt-6 space-y-6">
              <label className="block text-sm font-medium text-slate-600 theme-dark:text-slate-300">Location</label>
              <input
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder="Nairobi, Mombasa, Kisumu"
                className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 theme-dark:border-slate-800 theme-dark:bg-slate-950 theme-dark:text-slate-100"
              />
              <div>
                <div className="flex items-center justify-between text-sm font-medium text-slate-600 theme-dark:text-slate-300">
                  <span>Budget</span>
                  <span>KSh {filters.max_price.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="100000"
                  max="2000000"
                  step="50000"
                  value={filters.max_price}
                  onChange={(e) => handleFilterChange('max_price', Number(e.target.value))}
                  className="mt-3 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 theme-dark:text-slate-300">Bedrooms</label>
                <select
                  value={filters.bedrooms}
                  onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                  className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 theme-dark:border-slate-800 theme-dark:bg-slate-950 theme-dark:text-slate-100"
                >
                  {bedroomOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 theme-dark:text-slate-300">Sort</label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 theme-dark:border-slate-800 theme-dark:bg-slate-950 theme-dark:text-slate-100"
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: low to high</option>
                  <option value="price_desc">Price: high to low</option>
                </select>
              </div>
            </div>
          </aside>

          <div>
            <div className="flex items-center justify-between gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm theme-dark:border-slate-800 theme-dark:bg-slate-900">
              <div>
                <p className="text-sm text-slate-500 theme-dark:text-slate-400">Showing</p>
                <p className="mt-1 text-2xl font-semibold text-slate-950 theme-dark:text-slate-100">{properties.length} listings</p>
              </div>
              <div className="rounded-3xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 theme-dark:bg-emerald-500/10">
                <span>AI filtered</span>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-48 rounded-3xl bg-slate-200 shimmer-theme"></div>
                ))
              ) : properties.length ? (
                properties.map((property) => (
                  <Link
                    key={property.id}
                    to={`/property/${property.id}`}
                    className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg theme-dark:border-slate-800 theme-dark:bg-slate-900"
                  >
                    <div className="aspect-[4/3] bg-slate-200" />
                    <div className="p-6">
                      <div className="flex items-center justify-between gap-4 text-sm font-semibold text-slate-500 theme-dark:text-slate-400">
                        <span className="inline-flex items-center gap-2"><MapPinIcon className="h-4 w-4" />{property.location}</span>
                        <span className="inline-flex items-center gap-2"><BuildingOffice2Icon className="h-4 w-4" />{property.bedrooms} bed</span>
                      </div>
                      <h2 className="mt-4 text-xl font-semibold text-slate-950 theme-dark:text-slate-100">{property.title}</h2>
                      <p className="mt-3 text-sm leading-6 text-slate-600 theme-dark:text-slate-300 line-clamp-2">{property.description}</p>
                      <div className="mt-5 flex items-center justify-between text-lg font-semibold text-slate-900 theme-dark:text-white">
                        <span>KSh {property.price.toLocaleString()}</span>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-800 theme-dark:bg-emerald-700/20">Match</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 theme-dark:border-slate-700 theme-dark:bg-slate-900 theme-dark:text-slate-400">
                  No listings match your filters yet.
                </div>
              )}
            </div>

            <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm theme-dark:border-slate-800 theme-dark:bg-slate-900">
              <div className="flex items-center gap-3 text-emerald-600">
                <SparklesIcon className="h-5 w-5" />
                <div>
                  <h3 className="text-base font-semibold text-slate-950 theme-dark:text-slate-100">How matching works</h3>
                  <p className="text-sm text-slate-600 theme-dark:text-slate-400">We use lead budget and location data to surface the best homes and keep WhatsApp as your fastest way to contact an agent.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ClientBottomNav />
    </div>
  )
}
