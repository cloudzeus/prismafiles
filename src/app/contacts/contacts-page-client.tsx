'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Building2,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import { BusinessContact, Company } from '@/types/business'
import AddContactModal from '@/components/add-contact-modal'
import EditContactModal from '@/components/edit-contact-modal'
import ViewContactModal from '@/components/view-contact-modal'
import AddCompanyToContactModal from '@/components/add-company-to-contact-modal'
import { useToast } from '@/hooks/use-toast'

interface ContactWithCompanies extends BusinessContact {
  companies: Array<{
    contactId: number
    companyId: number
    position?: string | null
    description?: string | null
    company: Company
  }>
}

interface ContactsResponse {
  contacts: ContactWithCompanies[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function ContactsPageClient() {
  const [contacts, setContacts] = useState<ContactWithCompanies[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalContacts, setTotalContacts] = useState(0)
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showAssociateCompanyModal, setShowAssociateCompanyModal] = useState(false)
  const [selectedContact, setSelectedContact] = useState<ContactWithCompanies | null>(null)
  
  const { toast } = useToast()

  const fetchContacts = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        includeCompanies: 'true',
        ...(search && { search }),
      })

      const response = await fetch(`/api/contacts?${params}`)
      if (!response.ok) throw new Error('Failed to fetch contacts')
      
      const data: ContactsResponse = await response.json()
      setContacts(data.contacts)
      setTotalPages(data.pagination.pages)
      setTotalContacts(data.pagination.total)
      setCurrentPage(data.pagination.page)
    } catch (error) {
      console.error('Error fetching contacts:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch contacts',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
    fetchContacts(1, value)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchContacts(page, searchTerm)
  }

  const handleAddContact = () => {
    setShowAddModal(true)
  }

  const handleEditContact = (contact: ContactWithCompanies) => {
    setSelectedContact(contact)
    setShowEditModal(true)
  }

  const handleViewContact = (contact: ContactWithCompanies) => {
    setSelectedContact(contact)
    setShowViewModal(true)
  }

  const handleAssociateCompany = (contact: ContactWithCompanies) => {
    setSelectedContact(contact)
    setShowAssociateCompanyModal(true)
  }

  const handleDeleteContact = async (contactId: number) => {
    if (!confirm('Are you sure you want to delete this contact?')) return

    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete contact')

      toast({
        title: 'Success',
        description: 'Contact deleted successfully',
      })

      // Refresh contacts
      fetchContacts(currentPage, searchTerm)
    } catch (error) {
      console.error('Error deleting contact:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete contact',
        variant: 'destructive',
      })
    }
  }

  const handleContactCreated = () => {
    setShowAddModal(false)
    fetchContacts(currentPage, searchTerm)
  }

  const handleContactUpdated = () => {
    setShowEditModal(false)
    setSelectedContact(null)
    fetchContacts(currentPage, searchTerm)
  }

  if (loading && contacts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="h-10 bg-muted animate-pulse rounded-md" />
          </div>
          <div className="w-24">
            <div className="h-10 bg-muted animate-pulse rounded-md" />
          </div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Add */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search contacts by name, email, or company..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleAddContact}>
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Contacts List */}
      <div className="space-y-4">
        {contacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onEdit={() => handleEditContact(contact)}
            onView={() => handleViewContact(contact)}
            onDelete={() => handleDeleteContact(contact.id)}
            onAssociateCompany={() => handleAssociateCompany(contact)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 py-2 text-sm">
            Page {currentPage} of {totalPages} ({totalContacts} total)
          </span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Modals */}
      <AddContactModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onContactCreated={handleContactCreated}
      />

      {selectedContact && (
        <>
          <EditContactModal
            contact={selectedContact}
            open={showEditModal}
            onOpenChange={setShowEditModal}
            onContactUpdated={handleContactUpdated}
          />
          <ViewContactModal
            contact={selectedContact}
            open={showViewModal}
            onOpenChange={setShowViewModal}
          />
          <AddCompanyToContactModal
            contactId={selectedContact.id}
            open={showAssociateCompanyModal}
            onOpenChange={setShowAssociateCompanyModal}
            onCompanyAdded={handleContactUpdated}
          />
        </>
      )}
    </div>
  )
}

function ContactCard({ 
  contact, 
  onEdit, 
  onView, 
  onDelete,
  onAssociateCompany
}: { 
  contact: ContactWithCompanies
  onEdit: () => void
  onView: () => void
  onDelete: () => void
  onAssociateCompany: () => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg">{contact.name}</CardTitle>
            {contact.title && (
              <p className="text-sm text-muted-foreground">{contact.title}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onAssociateCompany}>
              <Building2 className="h-4 w-4 mr-1" />
              Associate Company
            </Button>
            <Button variant="ghost" size="sm" onClick={onView}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {contact.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{contact.phone}</span>
            </div>
          )}
          {contact.mobile && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Mobile:</span>
              <span>{contact.mobile}</span>
            </div>
          )}
          {contact.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{contact.email}</span>
            </div>
          )}
          {contact.address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{contact.address}</span>
            </div>
          )}
        </div>

        {/* Companies */}
        {contact.companies.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="h-4 w-4" />
              Companies
            </div>
            <div className="flex flex-wrap gap-2">
              {contact.companies.map((cc) => (
                <Badge key={`${cc.contactId}-${cc.companyId}`} variant="secondary">
                  {cc.company.name}
                  {cc.position && ` - ${cc.position}`}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
