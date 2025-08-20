"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Edit, Loader2 } from "lucide-react"
import { toast } from "sonner"

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

interface EditCompanyModalProps {
  isOpen: boolean
  onClose: () => void
  company: Company | null
  onCompanyUpdated: (company: Company) => void
}

export default function EditCompanyModal({ isOpen, onClose, company, onCompanyUpdated }: EditCompanyModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    sodtype: "",
    trdr: "",
    code: "",
    name: "",
    afm: "",
    country: "",
    address: "",
    zip: "",
    city: "",
    phone01: "",
    phone02: "",
    fax: "",
    jobtypetrd: "",
    webpage: "",
    email: "",
    emailacc: "",
    sotitle: "",
    concent: false
  })

  // Update form data when company changes
  useEffect(() => {
    if (company) {
      setFormData({
        sodtype: company.sodtype.toString(),
        trdr: company.trdr.toString(),
        code: company.code,
        name: company.name,
        afm: company.afm || "",
        country: company.country || "",
        address: company.address || "",
        zip: company.zip || "",
        city: company.city || "",
        phone01: company.phone01 || "",
        phone02: company.phone02 || "",
        fax: company.fax || "",
        jobtypetrd: company.jobtypetrd?.toString() || "",
        webpage: company.webpage || "",
        email: company.email || "",
        emailacc: company.emailacc || "",
        sotitle: company.sotitle || "",
        concent: company.concent || false
      })
    }
  }, [company])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!company) return
    
    if (!formData.sodtype || !formData.code || !formData.name) {
      toast.error("Please fill in all required fields")
      return
    }

    if (![12, 13].includes(parseInt(formData.sodtype))) {
      toast.error("Company type must be 12 (supplier) or 13 (customer)")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/companies/${company.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          sodtype: parseInt(formData.sodtype),
          trdr: formData.trdr ? parseInt(formData.trdr) : null,
          jobtypetrd: formData.jobtypetrd ? parseInt(formData.jobtypetrd) : null,
          concent: formData.concent
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update company')
      }

      const data = await response.json()
      toast.success("Company updated successfully!")
      onCompanyUpdated(data.company)
      handleClose()
    } catch (error) {
      console.error('Error updating company:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update company')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  if (!company) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Edit Company: {company.name}
          </DialogTitle>
          <DialogDescription>
            Update company information. Fill in the required fields marked with *.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
              <CardDescription>Essential company details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sodtype">Company Type *</Label>
                  <Select value={formData.sodtype || ""} onValueChange={(value) => handleInputChange('sodtype', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="supplier" value="12">12 - Supplier</SelectItem>
                      <SelectItem key="customer" value="13">13 - Customer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trdr">TRDR</Label>
                  <Input
                    id="trdr"
                    type="number"
                    placeholder="SoftOne TRDR number"
                    value={formData.trdr}
                    onChange={(e) => handleInputChange('trdr', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Company Code *</Label>
                  <Input
                    id="code"
                    placeholder="Company code"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    placeholder="Company name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="afm">AFM (VAT Number)</Label>
                  <Input
                    id="afm"
                    placeholder="Greek VAT number"
                    value={formData.afm}
                    onChange={(e) => handleInputChange('afm', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sotitle">Commercial Name</Label>
                  <Input
                    id="sotitle"
                    placeholder="Commercial name"
                    value={formData.sotitle}
                    onChange={(e) => handleInputChange('sotitle', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
              <CardDescription>Phone numbers, email, and website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone01">Primary Phone</Label>
                  <Input
                    id="phone01"
                    placeholder="Primary phone number"
                    value={formData.phone01}
                    onChange={(e) => handleInputChange('phone01', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone02">Secondary Phone</Label>
                  <Input
                    id="phone02"
                    placeholder="Secondary phone number"
                    value={formData.phone02}
                    onChange={(e) => handleInputChange('phone02', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fax">Fax</Label>
                  <Input
                    id="fax"
                    placeholder="Fax number"
                    value={formData.fax}
                    onChange={(e) => handleInputChange('fax', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webpage">Website</Label>
                  <Input
                    id="webpage"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.webpage}
                    onChange={(e) => handleInputChange('webpage', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Primary Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="primary@company.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailacc">Accounting Email</Label>
                  <Input
                    id="emailacc"
                    type="email"
                    placeholder="accounting@company.com"
                    value={formData.emailacc}
                    onChange={(e) => handleInputChange('emailacc', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Address Information</CardTitle>
              <CardDescription>Company location details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  placeholder="Street address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP/Postal Code</Label>
                  <Input
                    id="zip"
                    placeholder="ZIP code"
                    value={formData.zip}
                    onChange={(e) => handleInputChange('zip', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="ISO-2 code (e.g., GR)"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    maxLength={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
              <CardDescription>Other company details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobtypetrd">Job Type TRDR</Label>
                  <Input
                    id="jobtypetrd"
                    type="number"
                    placeholder="Job type TRDR"
                    value={formData.jobtypetrd}
                    onChange={(e) => handleInputChange('jobtypetrd', e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="concent"
                    checked={formData.concent}
                    onCheckedChange={(checked) => handleInputChange('concent', checked as boolean)}
                  />
                  <Label htmlFor="concent">Concent</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Update Company
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
