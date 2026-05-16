import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  UsersIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'

const stats = [
  { name: 'Total Leads', icon: UsersIcon, key: 'total' },
  { name: 'Hot Leads', icon: ArrowTrendingUpIcon, key: 'hot' },
  { name: 'Warm Leads', icon: ChartBarIcon, key: 'warm' },
  { name: 'Properties', icon: BuildingOfficeIcon, key: 'properties' },
]

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    total: 0,
    hot: 0,
    warm: 0,
    cold: 0,
    properties: 0,
    average_score: 0,
    recent_leads: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [leadsResponse, propertiesResponse] = await Promise.all([
        axios.get('/leads/stats/summary'),
        axios.get('/properties?limit=1') // Just to get total count
      ])

      const leadsStats = leadsResponse.data
      const propertiesStats = propertiesResponse.data

      setDashboardData({
        total: leadsStats.total || 0,
        hot: leadsStats.hot || 0,
        warm: leadsStats.warm || 0,
        cold: leadsStats.cold || 0,
        properties: propertiesStats.total || 0,
        average_score: leadsStats.average_score || 0,
        recent_leads: leadsStats.recent_leads || 0
      })
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">AI Property Agent Lead Management</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchDashboardData}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">AI Property Agent Lead Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-8 w-8 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="text-lg font-medium text-gray-900">{dashboardData[stat.key]}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Average Lead Score</dt>
                  <dd className="text-lg font-medium text-gray-900">{dashboardData.average_score.toFixed(1)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Recent Leads (7 days)</dt>
                  <dd className="text-lg font-medium text-gray-900">{dashboardData.recent_leads}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold text-sm">{dashboardData.cold}</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Cold Leads</dt>
                  <dd className="text-lg font-medium text-gray-900">{dashboardData.cold}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium">
            View All Leads
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium">
            Add Property
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">
            Export Data
          </button>
        </div>
      </div>
    </div>
  )
}