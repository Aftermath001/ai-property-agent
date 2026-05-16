import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

const categoryColors = {
  hot: 'bg-red-100 text-red-800',
  warm: 'bg-yellow-100 text-yellow-800',
  cold: 'bg-gray-100 text-gray-800'
}

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    limit: 50,
    offset: 0
  })
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    fetchLeads()
  }, [filters])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.category) params.append('category', filters.category)
      if (filters.search) params.append('search', filters.search)
      params.append('limit', filters.limit)
      params.append('offset', filters.offset)

      const response = await axios.get(`/leads?${params}`)
      setLeads(response.data.leads)
      setTotal(response.data.total)
      setHasMore(response.data.hasMore)
    } catch (err) {
      console.error('Error fetching leads:', err)
      setError('Failed to load leads')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: 0 // Reset pagination when filters change
    }))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && leads.length === 0) {
    return (
      <div className="animate-pulse">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="mt-2 text-sm text-gray-700">Manage and track property leads</p>
        </div>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <p className="mt-2 text-sm text-gray-700">Manage and track property leads from WhatsApp</p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search
            </label>
            <div className="mt-1 relative">
              <input
                type="text"
                id="search"
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search by phone or location..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="hot">Hot Leads</option>
              <option value="warm">Warm Leads</option>
              <option value="cold">Cold Leads</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ category: '', search: '', limit: 50, offset: 0 })}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-700">
        Showing {leads.length} of {total} leads
      </div>

      {/* Leads Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {leads.map((lead) => (
            <li key={lead.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-sm">
                          {lead.customer_name ? lead.customer_name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <h3 className="text-sm font-medium text-gray-900">
                          {lead.customer_name || 'Unknown'}
                        </h3>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[lead.lead_category]}`}>
                          {lead.lead_category}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        <span className="font-medium">{lead.phone}</span>
                        {lead.location && <span> • {lead.location}</span>}
                        {lead.budget && <span> • KSh {lead.budget.toLocaleString()}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        Score: {lead.lead_score}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(lead.created_at)}
                      </div>
                    </div>
                    <Link
                      to={`/leads/${lead.id}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p className="line-clamp-2">{lead.message}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {leads.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No leads found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setFilters(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  )
}