import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getDocuments, getVehicles } from '../../lib/supabase'
import { format } from 'date-fns'
import { FileText, Download, Filter, AlertCircle, ExternalLink } from 'lucide-react'

const documentTypeLabels = {
  registration: 'Registration',
  insurance: 'Insurance',
  title: 'Title',
  purchase_agreement: 'Purchase Agreement',
  service_record: 'Service Record',
  inspection: 'Inspection',
  photo: 'Photo',
  other: 'Other'
}

const DocumentCard = ({ document }) => (
  <a
    href={document.document_url}
    target="_blank"
    rel="noopener noreferrer"
    className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow group"
  >
    <div className="w-12 h-12 bg-rdc-cream rounded-lg flex items-center justify-center flex-shrink-0">
      <FileText size={24} className="text-rdc-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-medium text-black truncate group-hover:text-rdc-primary transition-colors">
        {document.title}
      </h3>
      <div className="flex items-center gap-3 text-sm text-rdc-taupe mt-1">
        <span className="capitalize">{documentTypeLabels[document.document_type] || document.document_type}</span>
        {document.vehicle && (
          <>
            <span>•</span>
            <span>{document.vehicle.year} {document.vehicle.make} {document.vehicle.model}</span>
          </>
        )}
      </div>
      {document.expiry_date && (
        <div className="text-xs text-rdc-taupe mt-1">
          Expires: {format(new Date(document.expiry_date), 'MMM d, yyyy')}
        </div>
      )}
    </div>
    <ExternalLink size={18} className="text-rdc-warm-gray group-hover:text-rdc-primary transition-colors flex-shrink-0" />
  </a>
)

export default function Documents() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterVehicle, setFilterVehicle] = useState('all')

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      const [docsRes, vehiclesRes] = await Promise.all([
        getDocuments(user.id),
        getVehicles(user.id)
      ])

      if (docsRes.error) throw docsRes.error

      setDocuments(docsRes.data || [])
      setVehicles(vehiclesRes.data || [])
    } catch (err) {
      console.error('Error loading documents:', err)
      setError('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const filteredDocuments = documents.filter(doc => {
    if (filterType !== 'all' && doc.document_type !== filterType) return false
    if (filterVehicle !== 'all' && doc.vehicle_id !== filterVehicle) return false
    return true
  })

  const documentTypes = [...new Set(documents.map(d => d.document_type))]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-rdc-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">Documents</h1>
          <p className="text-rdc-taupe mt-1">
            Registration, insurance, and vehicle documents
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-rdc-taupe" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field py-2 text-sm"
            >
              <option value="all">All Types</option>
              {documentTypes.map(type => (
                <option key={type} value={type}>
                  {documentTypeLabels[type] || type}
                </option>
              ))}
            </select>
          </div>

          {vehicles.length > 1 && (
            <select
              value={filterVehicle}
              onChange={(e) => setFilterVehicle(e.target.value)}
              className="input-field py-2 text-sm"
            >
              <option value="all">All Vehicles</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.year} {v.make} {v.model}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {filteredDocuments.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText size={48} className="text-rdc-warm-gray mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold text-black mb-2">
            No documents
          </h3>
          <p className="text-rdc-taupe">
            {filterType !== 'all' || filterVehicle !== 'all'
              ? 'No documents match your filters'
              : 'Documents will appear here once they\'re uploaded'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocuments.map(doc => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </div>
  )
}
