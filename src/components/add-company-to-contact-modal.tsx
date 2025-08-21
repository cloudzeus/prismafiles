'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Building2,
  Check,
  X
} from 'lucide-react'
import { Company, CreateContactCompanyData } from '@/types/business'
import { useToast } from '@/hooks/use-toast'

interface AddCompanyToContactModalProps {
  contactId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onCompanyAdded: () => void
}

export default function AddCompanyToContactModal({ 
  contactId, 
  open, 
  onOpenChange, 
  onCompanyAdded 
}: AddCompanyToContactModalProps) {
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [companies, setCompanies] = useState<Company[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [formData, setFormData] = useState({
    position: '',
    description: '',
  })

  const { toast } = useToast()

  // Fetch companies when modal opens
  useEffect(() => {
    if (open) {
      fetchCompanies()
    }
  }, [open])

  // Filter companies based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCompanies(companies)
    } else {
      const filtered = companies.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.afm && company.afm.includes(searchTerm))
      )
      setFilteredCompanies(filtered)
    }
  }, [searchTerm, companies])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies')
      if (!response.ok) throw new Error('Failed to fetch companies')
      
      const data = await response.json()
      setCompanies(data.companies || [])
      setFilteredCompanies(data.companies || [])
    } catch (error) {
      console.error('Error fetching companies:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch companies',
        variant: 'destructive',
      })
    }
  }

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCompany) {
      toast({
        title: 'Error',
        description: 'Please select a company',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)
      
      const contactCompanyData: CreateContactCompanyData = {
        contactId,
        companyId: selectedCompany.id,
        position: formData.position || undefined,
        description: formData.description || undefined,
      }

      const response = await fetch(`/api/contacts/${contactId}/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactCompanyData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add company to contact')
      }

      toast({
        title: 'Success',
        description: 'Company added to contact successfully',
      })

      // Reset form
      setSelectedCompany(null)
      setFormData({ position: '', description: '' })
      setSearchTerm('')
      
      onCompanyAdded()
    } catch (error) {
      console.error('Error adding company to contact:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add company to contact',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setSelectedCompany(null)
    setFormData({ position: '', description: '' })
    setSearchTerm('')
    onOpenChange(false)
  }

  const getCompanyTypeLabel = (sodtype: number) => {
    switch (sodtype) {
      case 12: return 'Supplier'
      case 13: return 'Customer'
      default: return 'Unknown'
    }
  }

  const getCompanyTypeVariant = (sodtype: number) => {
    switch (sodtype) {
      case 12: return 'secondary'
      case 13: return 'default'
      default: return 'outline'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Company to Contact</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Select Company</h3>
            
            <div className="space-y-2">
              <Label htmlFor="search">Search Companies</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search by name, code, or VAT number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Companies List */}
            <div className="max-h-60 overflow-y-auto border rounded-lg">
              {filteredCompanies.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  {searchTerm ? 'No companies found' : 'No companies available'}
                </p>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredCompanies.map((company) => (
                    <div
                      key={company.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedCompany?.id === company.id
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleCompanySelect(company)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{company.name}</span>
                            <Badge variant={getCompanyTypeVariant(company.sodtype)}>
                              {getCompanyTypeLabel(company.sodtype)}
                            </Badge>
                          </div>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            {company.code && <span>Code: {company.code}</span>}
                            {company.afm && <span>VAT: {company.afm}</span>}
                            {company.city && <span>{company.city}</span>}
                          </div>
                        </div>
                        {selectedCompany?.id === company.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Relationship Details */}
          {selectedCompany && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Relationship Details</h3>
              
              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium">{selectedCompany.name}</span>
                  <Badge variant={getCompanyTypeVariant(selectedCompany.sodtype)}>
                    {getCompanyTypeLabel(selectedCompany.sodtype)}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  {selectedCompany.code && <p>Code: {selectedCompany.code}</p>}
                  {selectedCompany.afm && <p>VAT: {selectedCompany.afm}</p>}
                  {selectedCompany.city && <p>City: {selectedCompany.city}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="e.g., Manager, Director, etc."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Additional notes about this relationship"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !selectedCompany}
            >
              {loading ? 'Adding...' : 'Add Company'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
