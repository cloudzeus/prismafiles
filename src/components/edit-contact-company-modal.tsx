'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Building2 } from 'lucide-react'
import { Company, UpdateContactCompanyData } from '@/types/business'
import { useToast } from '@/hooks/use-toast'

interface ContactCompany {
  contactId: number
  companyId: number
  position?: string | null
  description?: string | null
  company: Company
}

interface EditContactCompanyModalProps {
  contactCompany: ContactCompany
  open: boolean
  onOpenChange: (open: boolean) => void
  onCompanyUpdated: () => void
}

export default function EditContactCompanyModal({ 
  contactCompany, 
  open, 
  onOpenChange, 
  onCompanyUpdated 
}: EditContactCompanyModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    position: contactCompany.position || '',
    description: contactCompany.description || '',
  })

  const { toast } = useToast()

  // Update form data when contactCompany changes
  useEffect(() => {
    setFormData({
      position: contactCompany.position || '',
      description: contactCompany.description || '',
    })
  }, [contactCompany])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      
      const updateData: UpdateContactCompanyData = {
        contactId: contactCompany.contactId,
        companyId: contactCompany.companyId,
        position: formData.position || undefined,
        description: formData.description || undefined,
      }

      const response = await fetch(`/api/contacts/${contactCompany.contactId}/companies/${contactCompany.companyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update contact company relationship')
      }

      toast({
        title: 'Success',
        description: 'Contact company relationship updated successfully',
      })

      onCompanyUpdated()
    } catch (error) {
      console.error('Error updating contact company relationship:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update contact company relationship',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Company Relationship</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Company Information</h3>
            
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">{contactCompany.company.name}</span>
                <Badge variant={getCompanyTypeVariant(contactCompany.company.sodtype)}>
                  {getCompanyTypeLabel(contactCompany.company.sodtype)}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                {contactCompany.company.code && <p>Code: {contactCompany.company.code}</p>}
                {contactCompany.company.afm && <p>VAT: {contactCompany.company.afm}</p>}
                {contactCompany.company.city && <p>City: {contactCompany.company.city}</p>}
              </div>
            </div>
          </div>

          {/* Relationship Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Relationship Details</h3>
            
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

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Relationship'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
