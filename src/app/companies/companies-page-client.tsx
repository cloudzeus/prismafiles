"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Phone,
  Mail,
  Globe,
  MapPin,
  FileText,
  RefreshCw
} from "lucide-react"
import AddCompanyModal from "@/components/add-company-modal"
import EditCompanyModal from "@/components/edit-company-modal"
import ViewCompanyModal from "@/components/view-company-modal"
import { ERPCompaniesSync } from "@/components/erp-companies-sync"


interface Company {
  id: number
  sodtype: number
  trdr: number
  code: string
  name: string
  afm: string | null
  country: string | null
  address: string | null
  zip: string | null
  city: string | null
  phone01: string | null
  phone02: string | null
  fax: string | null
  jobtypetrd: number | null
  webpage: string | null
  email: string | null
  emailacc: string | null
  irsdata: any | null
  sotitle: string | null
  concent: boolean | null
  upddate: string
}

interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export default function CompaniesPageClient() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("name")
  const [sortOrder, setSortOrder] = useState<string>("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  
  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  useEffect(() => {
    fetchCompanies()
  }, [searchTerm, selectedType, sortBy, sortOrder, currentPage])

  const fetchCompanies = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "50",
        search: searchTerm,
        sortBy,
        sortOrder
      })
      
      if (selectedType) {
        params.append("sodtype", selectedType)
      }

      const response = await fetch(`/api/companies?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCompanies(data.companies || [])
        setPagination(data.pagination || null)
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page on search
  }

  const handleTypeChange = (value: string) => {
    setSelectedType(value)
    setCurrentPage(1) // Reset to first page on filter change
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
    setCurrentPage(1) // Reset to first page on sort change
  }

  const handleViewCompany = (company: Company) => {
    setSelectedCompany(company)
    setViewModalOpen(true)
  }

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company)
    setEditModalOpen(true)
  }

  const handleCompanyUpdated = (updatedCompany: Company) => {
    setCompanies(prev => 
      prev.map(company => 
        company.id === updatedCompany.id ? updatedCompany : company
      )
    )
  }

  const handleCompanyAdded = (newCompany: Company) => {
    setCompanies(prev => [newCompany, ...prev])
    if (pagination) {
      setPagination(prev => prev ? {
        ...prev,
        totalCount: prev.totalCount + 1
      } : null)
    }
  }

  const handleDeleteCompany = async (companyId: number, companyName: string) => {
    if (!confirm(`Are you sure you want to delete "${companyName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/companies/${companyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete company')
      }

      // Remove from local state
      setCompanies(prev => prev.filter(company => company.id !== companyId))
      
      // Update pagination
      if (pagination) {
        setPagination(prev => prev ? {
          ...prev,
          totalCount: prev.totalCount - 1
        } : null)
      }
    } catch (error) {
      console.error("Error deleting company:", error)
      alert(error instanceof Error ? error.message : 'Failed to delete company')
    }
  }

  const getCompanyTypeLabel = (sodtype: number) => {
    return sodtype === 12 ? "Supplier" : "Customer"
  }

  const getCompanyTypeColor = (sodtype: number) => {
    return sodtype === 12 ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
  }

  const getCompanyCardBackground = (sodtype: number) => {
    return sodtype === 12 
      ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500" 
      : "bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-500"
  }

  const renderSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  if (isLoading && companies.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
            <p className="text-gray-600 mt-2">
              Manage suppliers and customers
            </p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        {renderSkeleton()}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600 mt-2">
            Manage suppliers and customers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Company
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button 
            variant="outline"
            onClick={() => document.getElementById('erp-sync')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Go to ERP Sync
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search companies by name, code, AFM, city, or email..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select 
              value={selectedType || ""} 
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="12">Suppliers</option>
              <option value="13">Customers</option>
            </select>
            <select 
              value={sortBy || "name"} 
              onChange={(e) => handleSort(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name</option>
              <option value="code">Code</option>
              <option value="trdr">TRDR</option>
              <option value="upddate">Last Updated</option>
            </select>
            <Button
              variant="outline"
              onClick={() => {
                setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                setCurrentPage(1)
              }}
              className="w-full sm:w-auto"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ERP Sync Section */}
      <div id="erp-sync">
        <ERPCompaniesSync />
      </div>



      {/* Companies List */}
      <div className="space-y-4">
        {companies.length > 0 ? (
          companies.map((company) => (
            <Card key={company.id} className={`overflow-hidden ${getCompanyCardBackground(company.sodtype)}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className={`h-5 w-5 ${company.sodtype === 12 ? 'text-blue-600' : 'text-green-600'}`} />
                    <div className="space-y-1">
                      <CardTitle className="text-lg leading-tight">{company.name}</CardTitle>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs px-2 py-1">
                          {company.code}
                        </Badge>
                        <Badge className={`${getCompanyTypeColor(company.sodtype)} text-xs px-2 py-1`}>
                          {getCompanyTypeLabel(company.sodtype)}
                        </Badge>
                        <Badge variant="secondary" className="font-mono text-xs px-2 py-1">
                          TRDR: {company.trdr}
                        </Badge>
                        {company.afm && (
                          <Badge variant="outline" className="font-mono text-xs px-2 py-1">
                            AFM: {company.afm}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewCompany(company)}
                      title="View company details"
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCompany(company)}
                      title="Edit company"
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCompany(company.id, company.name)}
                      title="Delete company"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 pb-4 px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {company.city && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{company.city}{company.country && `, ${company.country}`}</span>
                    </div>
                  )}
                  {company.phone01 && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Phone className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{company.phone01}</span>
                    </div>
                  )}
                  {company.email && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{company.email}</span>
                    </div>
                    )}
                  {company.webpage && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Globe className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{company.webpage}</span>
                    </div>
                  )}
                  {company.sotitle && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <FileText className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">Commercial: {company.sotitle}</span>
                    </div>
                  )}
                </div>
                
                {company.address && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-start gap-2 text-xs text-gray-600">
                      <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span className="truncate">{company.address}{company.zip && `, ${company.zip}`}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedType 
                  ? "Try adjusting your search criteria or filters."
                  : "Get started by adding your first company."
                }
              </p>
              {!searchTerm && !selectedType && (
                <Button 
                  onClick={() => setAddModalOpen(true)}
                  className="flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  Add Company
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{" "}
                {pagination.totalCount} companies
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <AddCompanyModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCompanyAdded={handleCompanyAdded}
      />

      <EditCompanyModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedCompany(null)
        }}
        company={selectedCompany}
        onCompanyUpdated={handleCompanyUpdated}
      />

      <ViewCompanyModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false)
          setSelectedCompany(null)
        }}
        company={selectedCompany}
      />
    </div>
  )
}
