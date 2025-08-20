"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  FileText, 
  Calendar,
  Hash,
  Tag,
  X
} from "lucide-react"

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

interface ViewCompanyModalProps {
  isOpen: boolean
  onClose: () => void
  company: Company | null
}

export default function ViewCompanyModal({ isOpen, onClose, company }: ViewCompanyModalProps) {
  const getCompanyTypeLabel = (sodtype: number) => {
    return sodtype === 12 ? "Supplier" : "Customer"
  }

  const getCompanyTypeColor = (sodtype: number) => {
    return sodtype === 12 ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const renderField = (label: string, value: string | number | null, icon?: React.ReactNode) => {
    if (value === null || value === undefined || value === "") return null
    
    return (
      <div className="flex items-center gap-2 text-sm">
        {icon && icon}
        <span className="font-medium text-gray-700">{label}:</span>
        <span className="text-gray-600">{value}</span>
      </div>
    )
  }

  if (!company) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Details: {company.name}
          </DialogTitle>
          <DialogDescription>
            View complete company information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{company.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="font-mono text-sm">
                      {company.code}
                    </Badge>
                    <Badge className={getCompanyTypeColor(company.sodtype)}>
                      {getCompanyTypeLabel(company.sodtype)}
                    </Badge>
                    <Badge variant="secondary" className="font-mono">
                      TRDR: {company.trdr}
                    </Badge>
                    {company.afm && (
                      <Badge variant="outline" className="font-mono">
                        AFM: {company.afm}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField("Company Type", getCompanyTypeLabel(company.sodtype), <Tag className="h-4 w-4 text-gray-500" />)}
                {renderField("TRDR", company.trdr, <Hash className="h-4 w-4 text-gray-500" />)}
                {renderField("Company Code", company.code, <Tag className="h-4 w-4 text-gray-500" />)}
                {renderField("Commercial Name", company.sotitle, <FileText className="h-4 w-4 text-gray-500" />)}
                {renderField("Job Type TRDR", company.jobtypetrd, <Hash className="h-4 w-4 text-gray-500" />)}
                {renderField("Concent", company.concent ? "Yes" : "No", <Tag className="h-4 w-4 text-gray-500" />)}
              </div>
              {company.irsdata && (
                <div className="pt-2">
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-700">IRS Data:</span>
                      <pre className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded overflow-auto">
                        {JSON.stringify(company.irsdata, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField("Primary Phone", company.phone01, <Phone className="h-4 w-4 text-gray-500" />)}
                {renderField("Secondary Phone", company.phone02, <Phone className="h-4 w-4 text-gray-500" />)}
                {renderField("Fax", company.fax, <Phone className="h-4 w-4 text-gray-500" />)}
                {renderField("Website", company.webpage, <Globe className="h-4 w-4 text-gray-500" />)}
                {renderField("Primary Email", company.email, <Mail className="h-4 w-4 text-gray-500" />)}
                {renderField("Accounting Email", company.emailacc, <Mail className="h-4 w-4 text-gray-500" />)}
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderField("City", company.city, <MapPin className="h-4 w-4 text-gray-500" />)}
                {renderField("ZIP Code", company.zip, <MapPin className="h-4 w-4 text-gray-500" />)}
                {renderField("Country", company.country, <MapPin className="h-4 w-4 text-gray-500" />)}
              </div>
              {company.address && (
                <div className="pt-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-700">Street Address:</span>
                      <p className="text-gray-600 mt-1">{company.address}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-gray-700">Last Updated:</span>
                <span className="text-gray-600">{formatDate(company.upddate)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Hash className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-gray-700">Company ID:</span>
                <span className="text-gray-600">{company.id}</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
