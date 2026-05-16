import { useEffect, useState } from 'react'
import axios from 'axios'

export default function AdminMetrics() {
  const [metrics, setMetrics] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get('/admin/metrics')
        setMetrics(response.data)
      } catch (err) {
        setError(err?.response?.data?.error || 'Unable to retrieve metrics')
      }
    }

    fetchMetrics()
  }, [])

  if (error) {
    return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 theme-dark:border-rose-800 theme-dark:bg-rose-950 theme-dark:text-rose-200">{error}</div>
  }

  if (!metrics) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm theme-dark:border-slate-800 theme-dark:bg-slate-900">Loading metrics…</div>
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm theme-dark:border-slate-800 theme-dark:bg-slate-900">
        <h2 className="text-xl font-semibold text-slate-950 theme-dark:text-slate-100">System metrics</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-slate-50 p-5 theme-dark:bg-slate-800">
            <p className="text-sm text-slate-500 theme-dark:text-slate-400">Active users</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950 theme-dark:text-white">{metrics.totalUsers}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 theme-dark:bg-slate-800">
            <p className="text-sm text-slate-500 theme-dark:text-slate-400">Managers</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950 theme-dark:text-white">{metrics.managerCount}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 theme-dark:bg-slate-800">
            <p className="text-sm text-slate-500 theme-dark:text-slate-400">Properties</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950 theme-dark:text-white">{metrics.propertyCount}</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm theme-dark:border-slate-800 theme-dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-950 theme-dark:text-slate-100">Recent system health</h3>
        <div className="mt-4 space-y-3 text-sm text-slate-700 theme-dark:text-slate-300">
          <p><span className="font-semibold">Leads total:</span> {metrics.leadCount}</p>
          <p><span className="font-semibold">Workflow entries:</span> {metrics.workflowCount}</p>
          <p><span className="font-semibold">Active notifications:</span> {metrics.notificationCount}</p>
        </div>
      </div>
    </div>
  )
}
