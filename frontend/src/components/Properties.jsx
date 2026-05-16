import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

export default function Properties() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    limit: 50,
    offset: 0
  })
  const [total, setTotal] = useState(0)
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    bedrooms: '',
    price: '',
    description: ''
  })

  useEffect(() => {
    fetchProperties()
  }, [filters])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.search) params.append('location', filters.search)
      params.append('limit', filters.limit)
      params.append('offset', filters.offset)

      const response = await axios.get(`/properties?${params}`)
      setProperties(response.data.properties)
      setTotal(response.data.total)
    } catch (err) {
      console.error('Error fetching properties:', err)
      setError('Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        bedrooms: parseInt(formData.bedrooms),
        price: parseInt(formData.price)
      }

      if (editingProperty) {
        await axios.put(`/properties/${editingProperty.id}`, data)
      } else {
        await axios.post('/properties', data)
      }

      setShowForm(false)
      setEditingProperty(null)
      setFormData({ title: '', location: '', bedrooms: '', price: '', description: '' })
      fetchProperties()
    } catch (err) {
      console.error('Error saving property:', err)
      alert('Failed to save property')
    }
  }

  const handleEdit = (property) => {
    setEditingProperty(property)
    setFormData({
      title: property.title,
      location: property.location,
      bedrooms: property.bedrooms.toString(),
      price: property.price.toString(),
      description: property.description
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this property?')) return

    try {
      await axios.delete(`/properties/${id}`)
      fetchProperties()
    } catch (err) {
      console.error('Error deleting property:', err)
      alert('Failed to delete property')
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingProperty(null)
    setFormData({ title: '', location: '', bedrooms: '', price: '', description: '' })
  }

  if (loading && properties.length === 0) {
    return (
      <div className="animate-pulse">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="mt-2 text-sm text-gray-700">Manage property listings</p>
        </div>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
            <p className="mt-2 text-sm text-gray-700">Manage property listings for matching</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Property
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="max-w-md">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Search by location
          </label>
          <div className="mt-1 relative">
            <input
              type="text"
              id="search"
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search properties..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, offset: 0 }))}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Property Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        {editingProperty ? 'Edit Property' : 'Add New Property'}
                      </h3>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Title
                          </label>
                          <input
                            type="text"
                            id="title"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          />
                        </div>

                        <div>
                          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                            Location
                          </label>
                          <input
                            type="text"
                            id="location"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={formData.location}
                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">
                              Bedrooms
                            </label>
                            <input
                              type="number"
                              id="bedrooms"
                              required
                              min="1"
                              max="10"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              value={formData.bedrooms}
                              onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: e.target.value }))}
                            />
                          </div>

                          <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                              Price (KSh)
                            </label>
                            <input
                              type="number"
                              id="price"
                              required
                              min="1000"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              value={formData.price}
                              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <textarea
                            id="description"
                            required
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingProperty ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Properties List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-sm text-gray-700 mb-4">
            Showing {properties.length} of {total} properties
          </div>

          <div className="space-y-4">
            {properties.map((property) => (
              <div key={property.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{property.title}</h3>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Location:</span> {property.location}
                      </div>
                      <div>
                        <span className="font-medium">Bedrooms:</span> {property.bedrooms}
                      </div>
                      <div>
                        <span className="font-medium">Price:</span> KSh {property.price.toLocaleString()}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {property.description}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(property)}
                      className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="inline-flex items-center p-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {properties.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500">No properties found.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Your First Property
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}