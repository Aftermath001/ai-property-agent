import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeftIcon, MapPinIcon, BuildingOffice2Icon, CurrencyDollarIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import ClientBottomNav from './ClientBottomNav'

export default function ClientPropertyDetail({ theme, setTheme }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [similar, setSimilar] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperty()
  }, [id])

  const fetchProperty = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/properties/${id}`)
      setProperty(response.data)
      const similarResponse = await axios.get(`/properties?location=${encodeURIComponent(response.data.location)}&limit=4`)
      setSimilar(similarResponse.data.properties.filter((item) => item.id !== response.data.id))
    } catch (err) {
      console.error('Error loading property:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleContact = () => {
    const phone = '254700000000'
    const text = `Hello, I am interested in ${property?.title}. Can you share more details?`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-slate-50 theme-dark:bg-slate-950 theme-dark:text-slate-100 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm theme-dark:border-slate-800 theme-dark:bg-slate-900 theme-dark:text-slate-100"
          >
            <ArrowLeftIcon className="h-4 w-4" /> Back
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 theme-dark:bg-slate-800 theme-dark:text-slate-100"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? 'Dark' : 'Light'} mode
          </button>
        </div>

        {loading ? (
          <div className="mt-10 space-y-6">
            <div className="h-80 rounded-3xl bg-slate-200 shimmer-theme"></div>
            <div className="h-10 rounded-3xl bg-slate-200 shimmer-theme"></div>
            <div className="h-6 rounded bg-slate-200 shimmer-theme"></div>
          </div>
        ) : property ? (
          <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm theme-dark:border-slate-800 theme-dark:bg-slate-900">
                <div className="aspect-[16/9] rounded-t-3xl bg-slate-200" />
                <div className="p-8">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Property details</p>
                      <h1 className="mt-3 text-3xl font-semibold text-slate-950 theme-dark:text-slate-100">{property.title}</h1>
                    </div>
                    <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 theme-dark:bg-slate-800 theme-dark:text-slate-100">
                      AI match score: 92
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-3xl bg-slate-50 p-4 text-sm font-semibold text-slate-700 theme-dark:bg-slate-950 theme-dark:text-slate-100">
                      <MapPinIcon className="mb-2 h-5 w-5 text-emerald-600" />
                      {property.location}
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4 text-sm font-semibold text-slate-700 theme-dark:bg-slate-950 theme-dark:text-slate-100">
                      <BuildingOffice2Icon className="mb-2 h-5 w-5 text-emerald-600" />
                      {property.bedrooms} bedrooms
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4 text-sm font-semibold text-slate-700 theme-dark:bg-slate-950 theme-dark:text-slate-100">
                      <CurrencyDollarIcon className="mb-2 h-5 w-5 text-emerald-600" />
                      KSh {property.price.toLocaleString()}
                    </div>
                  </div>

                  <div className="mt-8 space-y-4 text-slate-600 theme-dark:text-slate-300">
                    <p>{property.description}</p>
                    <p>Verified listing. Chat instantly with an agent through WhatsApp and book a viewing.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm theme-dark:border-slate-800 theme-dark:bg-slate-900">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Contact agent</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950 theme-dark:text-slate-100">Fast WhatsApp response</p>
                  </div>
                  <button
                    onClick={handleContact}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-500/20 hover:bg-emerald-700"
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5" /> Contact on WhatsApp
                  </button>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600 theme-dark:text-slate-300">One-click contact via WhatsApp keeps you connected to property agents and hot listings.</p>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm theme-dark:border-slate-800 theme-dark:bg-slate-900">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 theme-dark:text-slate-400">Similar homes</p>
                <div className="mt-6 space-y-4">
                  {similar.length ? similar.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => navigate(`/property/${item.id}`)}
                      className="w-full text-left rounded-3xl border border-slate-200 p-4 transition hover:border-emerald-500 theme-dark:border-slate-800"
                    >
                      <p className="text-sm font-semibold text-slate-950 theme-dark:text-slate-100">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-500 theme-dark:text-slate-400">KSh {item.price.toLocaleString()} • {item.bedrooms} bed</p>
                    </button>
                  )) : (
                    <p className="text-sm text-slate-500 theme-dark:text-slate-400">No other homes found in this area yet.</p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm theme-dark:border-slate-800 theme-dark:bg-slate-900">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 theme-dark:text-slate-400">Why choose WhatsApp?</p>
                <ul className="mt-4 space-y-3 text-sm text-slate-600 theme-dark:text-slate-300">
                  <li>• Fast agent responses</li>
                  <li>• Real-time property details</li>
                  <li>• Local Kenyan agent support</li>
                </ul>
              </div>
            </aside>
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 theme-dark:border-slate-700 theme-dark:bg-slate-900 theme-dark:text-slate-400">
            Property not found.
          </div>
        )}
      </div>
      <ClientBottomNav />
    </div>
  )
}
