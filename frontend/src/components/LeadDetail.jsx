import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import {
  ArrowLeftIcon,
  PhoneIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

const categoryColors = {
  hot: 'bg-red-100 text-red-800',
  warm: 'bg-yellow-100 text-yellow-800',
  cold: 'bg-gray-100 text-gray-800'
}

export default function LeadDetail() {
  const { id } = useParams()
  const [lead, setLead] = useState(null)
  const [matchedProperties, setMatchedProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchLeadDetail()
  }, [id])

  const fetchLeadDetail = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/leads/${id}`)
      setLead(response.data.lead)
      setMatchedProperties(response.data.matchedProperties)
    } catch (err) {
      console.error('Error fetching lead detail:', err)
      setError('Failed to load lead details')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !lead) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error || 'Lead not found'}</div>
        <Link
          to="/leads"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Back to Leads
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <Link
            to="/leads"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back to Leads
          </Link>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {lead.customer_name || 'Unknown Customer'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Lead #{lead.id} • Created {formatDate(lead.created_at)}
            </p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${categoryColors[lead.lead_category]}`}>
            {lead.lead_category} Lead
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Original Message */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                WhatsApp Message
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">{lead.message}</p>
              </div>
            </div>
          </div>

          {/* AI Extracted Data */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">AI Extracted Information</h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                    {lead.location || 'Not specified'}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Budget</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-1 text-gray-400" />
                    {lead.budget ? `KSh ${lead.budget.toLocaleString()}` : 'Not specified'}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Bedrooms</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <HomeIcon className="h-4 w-4 mr-1 text-gray-400" />
                    {lead.bedrooms || 'Not specified'}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                    {lead.phone || 'Not available'}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Lead Score</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className="font-semibold">{lead.lead_score}</span>
                    <span className="text-gray-500 ml-1">/ 100</span>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Urgency</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {lead.urgency || 'Not specified'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Matched Properties */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Matched Properties ({matchedProperties.length})
              </h3>
              {matchedProperties.length > 0 ? (
                <div className="space-y-4">
                  {matchedProperties.map((property) => (
                    <div key={property.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{property.title}</h4>
                          <div className="mt-1 text-sm text-gray-600 flex items-center space-x-4">
                            <span className="flex items-center">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              {property.location}
                            </span>
                            <span className="flex items-center">
                              <HomeIcon className="h-4 w-4 mr-1" />
                              {property.bedrooms} bed
                            </span>
                            <span className="flex items-center">
                              <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                              KSh {property.price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {property.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No properties matched this lead's criteria.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Lead Actions & Timeline */}
        <div className="space-y-6">
          {/* Lead Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium">
                  Call Customer
                </button>
                <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium">
                  Send Property Details
                </button>
                <button className="w-full bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 text-sm font-medium">
                  Mark as Contacted
                </button>
                <button className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-medium">
                  Archive Lead
                </button>
              </div>
            </div>
          </div>

          {/* Lead Timeline */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <ChatBubbleLeftRightIcon className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900">WhatsApp message received</p>
                    <p className="text-sm text-gray-500">{formatDate(lead.created_at)}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-xs">AI</span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900">
                      Lead processed and categorized as <span className="font-medium">{lead.lead_category}</span>
                    </p>
                    <p className="text-sm text-gray-500">{formatDate(lead.created_at)}</p>
                  </div>
                </div>

                {lead.lead_action && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        lead.lead_category === 'hot' ? 'bg-red-100' :
                        lead.lead_category === 'warm' ? 'bg-yellow-100' : 'bg-gray-100'
                      }`}>
                        <span className={`font-bold text-xs ${
                          lead.lead_category === 'hot' ? 'text-red-600' :
                          lead.lead_category === 'warm' ? 'text-yellow-600' : 'text-gray-600'
                        }`}>
                          {lead.lead_category === 'hot' ? '!' : lead.lead_category === 'warm' ? '~' : '○'}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900">
                        Action taken: <span className="font-medium">{lead.lead_action.replace('_', ' ')}</span>
                      </p>
                      <p className="text-sm text-gray-500">{formatDate(lead.created_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}