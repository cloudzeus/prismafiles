'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Building2,
  Plus,
  Edit,
  Trash2,
  Globe
} from 'lucide-react'
import { BusinessContact, Company } from '@/types/business'
import AddCompanyToContactModal from './add-company-to-contact-modal'
import EditContactCompanyModal from './edit-contact-company-modal'
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

interface ViewContactModalProps {
  contact: ContactWithCompanies
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ViewContactModal({ contact, open, onOpenChange }: ViewContactModalProps) {
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false)
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<{
    contactId: number
    companyId: number
    position?: string | null
    description?: string | null
    company: Company
  } | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const { toast } = useToast()

  const handleAddCompany = () => {
    setShowAddCompanyModal(true)
  }

  const handleEditCompany = (company: any) => {
    setSelectedCompany(company)
    setShowEditCompanyModal(true)
  }

  const handleRemoveCompany = async (contactId: number, companyId: number) => {
    if (!confirm('Are you sure you want to remove this company from the contact?')) return

    try {
      const response = await fetch(`/api/contacts/${contactId}/companies/${companyId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to remove company from contact')

      toast({
        title: 'Success',
        description: 'Company removed from contact successfully',
      })

      // Trigger refresh
      setRefreshTrigger(prev => prev + 1)
    } catch (error) {
      console.error('Error removing company from contact:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove company from contact',
        variant: 'destructive',
      })
    }
  }

  const handleCompanyAdded = () => {
    setShowAddCompanyModal(false)
    setRefreshTrigger(prev => prev + 1)
  }

  const handleCompanyUpdated = () => {
    setShowEditCompanyModal(false)
    setSelectedCompany(null)
    setRefreshTrigger(prev => prev + 1)
  }

  const getCountryName = (code: string) => {
    const countries: { [key: string]: string } = {
      'GR': 'Greece',
      'US': 'United States',
      'GB': 'United Kingdom',
      'DE': 'Germany',
      'FR': 'France',
      'IT': 'Italy',
      'ES': 'Spain',
      'NL': 'Netherlands',
      'BE': 'Belgium',
      'AT': 'Austria',
      'CH': 'Switzerland',
      'SE': 'Sweden',
      'NO': 'Norway',
      'DK': 'Denmark',
      'FI': 'Finland',
      'PL': 'Poland',
      'CZ': 'Czech Republic',
      'HU': 'Hungary',
      'RO': 'Romania',
      'BG': 'Bulgaria',
      'HR': 'Croatia',
      'SI': 'Slovenia',
      'SK': 'Slovakia',
      'LT': 'Lithuania',
      'LV': 'Latvia',
      'EE': 'Estonia',
      'IE': 'Ireland',
      'PT': 'Portugal',
      'MT': 'Malta',
      'CY': 'Cyprus',
      'LU': 'Luxembourg',
    }
    return countries[code] || code
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{contact.name}</CardTitle>
                {contact.title && (
                  <p className="text-muted-foreground">{contact.title}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {contact.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-muted-foreground">{contact.description}</p>
                  </div>
                )}

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{contact.phone}</span>
                    </div>
                  )}
                  
                  {contact.mobile && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Mobile:</span>
                      <span className="text-sm">{contact.mobile}</span>
                    </div>
                  )}
                  
                  {contact.workPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Work:</span>
                      <span className="text-sm">{contact.workPhone}</span>
                    </div>
                  )}
                  
                  {contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{contact.email}</span>
                    </div>
                  )}
                </div>

                {/* Address Information */}
                {(contact.address || contact.city || contact.zip || contact.country) && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Address</h4>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="text-sm space-y-1">
                        {contact.address && <p>{contact.address}</p>}
                        <div className="flex gap-2 text-muted-foreground">
                          {contact.city && <span>{contact.city}</span>}
                          {contact.zip && <span>{contact.zip}</span>}
                          {contact.country && <span>{getCountryName(contact.country)}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Companies */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Companies
                  </CardTitle>
                  <Button onClick={handleAddCompany} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Company
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {contact.companies.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No companies associated with this contact
                  </p>
                ) : (
                  <div className="space-y-3">
                    {contact.companies.map((cc) => (
                      <div key={`${cc.contactId}-${cc.companyId}`} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{cc.company.name}</Badge>
                              {cc.company.sodtype === 12 && (
                                <Badge variant="secondary">Supplier</Badge>
                              )}
                              {cc.company.sodtype === 13 && (
                                <Badge variant="secondary">Customer</Badge>
                              )}
                            </div>
                            {cc.position && (
                              <p className="text-sm text-muted-foreground">
                                Position: {cc.position}
                              </p>
                            )}
                            {cc.description && (
                              <p className="text-sm text-muted-foreground">
                                {cc.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {cc.company.code && (
                                <span>Code: {cc.company.code}</span>
                              )}
                              {cc.company.afm && (
                                <span>VAT: {cc.company.afm}</span>
                              )}
                              {cc.company.city && (
                                <span>{cc.company.city}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCompany(cc)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveCompany(cc.contactId, cc.companyId)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Company Modal */}
      <AddCompanyToContactModal
        contactId={contact.id}
        open={showAddCompanyModal}
        onOpenChange={setShowAddCompanyModal}
        onCompanyAdded={handleCompanyAdded}
      />

      {/* Edit Company Relationship Modal */}
      {selectedCompany && (
        <EditContactCompanyModal
          contactCompany={selectedCompany}
          open={showEditCompanyModal}
          onOpenChange={setShowEditCompanyModal}
          onCompanyUpdated={handleCompanyUpdated}
        />
      )}
    </>
  )
}
