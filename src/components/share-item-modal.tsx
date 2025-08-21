"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Copy, Mail, Users, Link, X, Check, Share } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface User {
  id: string
  name: string | null
  email: string
  role: string
}

interface Contact {
  id: number
  name: string
  email: string | null
  title: string | null
}

interface ShareItemModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: {
    name: string
    path: string
    type: 'file' | 'folder'
  }
  currentUser: {
    id: string
    name: string | null
    email: string
  }
}

export default function ShareItemModal({ open, onOpenChange, item, currentUser }: ShareItemModalProps) {
  const [activeTab, setActiveTab] = useState<'user' | 'contact'>('user')
  const [users, setUsers] = useState<User[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  
  // User sharing state
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [userPermissions, setUserPermissions] = useState({
    canView: true,
    canDownload: true,
    canEdit: false,
    canDelete: false
  })
  
  // Contact sharing state
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null)
  const [contactPermissions, setContactPermissions] = useState({
    canView: true,
    canDownload: true,
    canEdit: false,
    canDelete: false
  })
  
  // Common state
  const [description, setDescription] = useState('')
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [shareLinkExpiresAt, setShareLinkExpiresAt] = useState<Date | null>(null)
  const [showExpiration, setShowExpiration] = useState(false)
  const [showLinkExpiration, setShowLinkExpiration] = useState(false)
  
  // GDPR compliance state
  const [gdprScanResult, setGdprScanResult] = useState<any>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [gdprCompliant, setGdprCompliant] = useState(true)
  const [showGdprWarning, setShowGdprWarning] = useState(false)
  const [userJustification, setUserJustification] = useState('')
  const [userAcknowledged, setUserAcknowledged] = useState(false)
  
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchUsers()
      fetchContacts()
      if (item.type === 'file') {
        checkGdprCompliance()
      }
    }
  }, [open, item])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users/list')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts?limit=1000')
      if (response.ok) {
        const data = await response.json()
        setContacts(data.contacts || [])
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
    }
  }

  const checkGdprCompliance = async () => {
    if (item.type !== 'file') return;
    
    setIsScanning(true);
    try {
      const response = await fetch('/api/gdpr/scan-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: item.path,
          fileName: item.name,
          fileType: item.name.split('.').pop() || 'unknown',
          content: '' // In a real implementation, you'd read the file content
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGdprScanResult(data.scanResult);
        
        if (data.scanResult.hasPersonalData) {
          setGdprCompliant(false);
          setShowGdprWarning(true);
        } else {
          setGdprCompliant(true);
          setShowGdprWarning(false);
        }
      }
    } catch (error) {
      console.error('Error checking GDPR compliance:', error);
      // Default to compliant if scan fails
      setGdprCompliant(true);
    } finally {
      setIsScanning(false);
    }
  };

  const handleShareWithUser = async () => {
    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a user to share with",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/sharing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemPath: item.path,
          itemName: item.name,
          itemType: item.type,
          sharingType: 'user',
          sharedWithUserId: selectedUserId,
          expiresAt: expiresAt?.toISOString(),
          ...userPermissions,
          description,
          userJustification,
          userAcknowledged
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Success",
          description: `Successfully shared "${item.name}" with the selected user`,
        })
        
        // Reset form
        setSelectedUserId('')
        setDescription('')
        setExpiresAt(null)
        setShowExpiration(false)
        onOpenChange(false)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to share item')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to share item',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleShareWithContact = async () => {
    if (!selectedContactId) {
      toast({
        title: "Error",
        description: "Please select a contact to share with",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/sharing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemPath: item.path,
          itemName: item.name,
          itemType: item.type,
          sharingType: 'contact',
          sharedWithContactId: selectedContactId,
          expiresAt: expiresAt?.toISOString(),
          shareLinkExpiresAt: shareLinkExpiresAt?.toISOString(),
          ...contactPermissions,
          description,
          userJustification,
          userAcknowledged
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Send email to contact
        await sendSharingEmail(data.sharedItem.id, selectedContactId)
        
        toast({
          title: "Success",
          description: `Successfully shared "${item.name}" with the contact and sent email notification`,
        })
        
        // Reset form
        setSelectedContactId(null)
        setDescription('')
        setExpiresAt(null)
        setShareLinkExpiresAt(null)
        setShowExpiration(false)
        setShowLinkExpiration(false)
        onOpenChange(false)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to share item')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to share item',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const sendSharingEmail = async (sharedItemId: string, contactId: number) => {
    try {
      const response = await fetch('/api/sharing/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sharedItemId, contactId })
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      // Don't throw here, as the sharing was successful
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Link copied to clipboard",
    })
  }

  const resetForm = () => {
    setSelectedUserId('')
    setSelectedContactId(null)
    setDescription('')
    setExpiresAt(null)
    setShareLinkExpiresAt(null)
    setShowExpiration(false)
    setShowLinkExpiration(false)
    setUserPermissions({
      canView: true,
      canDownload: true,
      canEdit: false,
      canDelete: false
    })
    setContactPermissions({
      canView: true,
      canDownload: true,
      canEdit: false,
      canDelete: false
    })
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Share "{item.name}"
          </DialogTitle>
                  <DialogDescription>
          Share this {item.type} with users or contacts. Users will see it in their shared folders, 
          while contacts will receive an email with a unique sharing link.
          {item.type === 'file' && isScanning && (
            <div className="mt-2 text-sm text-blue-600">
              🔍 Scanning file for GDPR compliance...
            </div>
          )}
        </DialogDescription>
        </DialogHeader>

        {/* GDPR Compliance Warning */}
        {showGdprWarning && gdprScanResult && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800 mb-2">
                  ⚠️ GDPR Compliance Warning
                </h4>
                <p className="text-sm text-red-700 mb-3">
                  This file contains personal data that may be subject to GDPR regulations. 
                  Risk level: <span className="font-semibold">{gdprScanResult.riskLevel.toUpperCase()}</span>
                </p>
                
                <div className="text-sm text-red-600 mb-3">
                  <p className="font-medium">Detected personal data types:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {gdprScanResult.personalDataTypes?.map((type: string, index: number) => (
                      <li key={index}>{type}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="gdpr-acknowledge"
                      checked={userAcknowledged}
                      onChange={(e) => setUserAcknowledged(e.target.checked)}
                      className="rounded border-red-300 text-red-600 focus:ring-red-500"
                    />
                    <label htmlFor="gdpr-acknowledge" className="text-sm text-red-700">
                      I acknowledge the GDPR risks and take responsibility for sharing this file
                    </label>
                  </div>
                  
                  {userAcknowledged && (
                    <div>
                      <label htmlFor="justification" className="block text-sm font-medium text-red-700 mb-1">
                        Justification for sharing (required):
                      </label>
                      <textarea
                        id="justification"
                        value={userJustification}
                        onChange={(e) => setUserJustification(e.target.value)}
                        placeholder="Please explain why you need to share this file despite the GDPR risks..."
                        className="w-full p-2 border border-red-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
                        rows={3}
                        required
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'user' | 'contact')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Share with User
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Share with Contact
            </TabsTrigger>
          </TabsList>

          <TabsContent value="user" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="user-select">Select User</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user to share with" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <span>{user.name || 'No name'}</span>
                          <Badge variant="secondary" className="text-xs">
                            {user.email}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="user-view"
                      checked={userPermissions.canView}
                      onCheckedChange={(checked) => 
                        setUserPermissions(prev => ({ ...prev, canView: checked as boolean }))
                      }
                    />
                    <Label htmlFor="user-view">View</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="user-download"
                      checked={userPermissions.canDownload}
                      onCheckedChange={(checked) => 
                        setUserPermissions(prev => ({ ...prev, canDownload: checked as boolean }))
                      }
                    />
                    <Label htmlFor="user-download">Download</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="user-edit"
                      checked={userPermissions.canEdit}
                      onCheckedChange={(checked) => 
                        setUserPermissions(prev => ({ ...prev, canEdit: checked as boolean }))
                      }
                    />
                    <Label htmlFor="user-edit">Edit</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="user-delete"
                      checked={userPermissions.canDelete}
                      onCheckedChange={(checked) => 
                        setUserPermissions(prev => ({ ...prev, canDelete: checked as boolean }))
                      }
                    />
                    <Label htmlFor="user-delete">Delete</Label>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleShareWithUser} 
                disabled={!selectedUserId || loading || (showGdprWarning && !userAcknowledged) || (showGdprWarning && userAcknowledged && !userJustification.trim())}
                className="w-full"
              >
                {loading ? 'Sharing...' : 'Share with User'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="contact-select">Select Contact</Label>
                <Select 
                  value={selectedContactId?.toString() || ''} 
                  onValueChange={(value) => setSelectedContactId(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a contact to share with" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{contact.name}</span>
                          {contact.email && (
                            <Badge variant="secondary" className="text-xs">
                              {contact.email}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="contact-view"
                      checked={contactPermissions.canView}
                      onCheckedChange={(checked) => 
                        setContactPermissions(prev => ({ ...prev, canView: checked as boolean }))
                      }
                    />
                    <Label htmlFor="contact-view">View</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="contact-download"
                      checked={contactPermissions.canDownload}
                      onCheckedChange={(checked) => 
                        setContactPermissions(prev => ({ ...prev, canDownload: checked as boolean }))
                      }
                    />
                    <Label htmlFor="contact-download">Download</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="contact-edit"
                      checked={contactPermissions.canEdit}
                      onCheckedChange={(checked) => 
                        setContactPermissions(prev => ({ ...prev, canEdit: checked as boolean }))
                      }
                    />
                    <Label htmlFor="contact-edit">Edit</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="contact-delete"
                      checked={contactPermissions.canDelete}
                      onCheckedChange={(checked) => 
                        setContactPermissions(prev => ({ ...prev, canDelete: checked as boolean }))
                      }
                    />
                    <Label htmlFor="contact-delete">Delete</Label>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleShareWithContact} 
                disabled={!selectedContactId || loading || (showGdprWarning && !userAcknowledged) || (showGdprWarning && userAcknowledged && !userJustification.trim())}
                className="w-full"
              >
                {loading ? 'Sharing...' : 'Share with Contact & Send Email'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Common Options */}
        <div className="space-y-4 pt-4 border-t">
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a description of what you're sharing..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-expiration"
                      checked={showExpiration}
                      onCheckedChange={(checked) => setShowExpiration(checked === true)}
                    />
                    <Label htmlFor="show-expiration">Set expiration date</Label>
                  </div>
            
            {showExpiration && (
              <div className="pl-6">
                <Label>Expires on</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !expiresAt && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expiresAt ? format(expiresAt, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      selected={expiresAt || undefined}
                      onSelect={setExpiresAt}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          {activeTab === 'contact' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-link-expiration"
                  checked={showLinkExpiration}
                  onCheckedChange={(checked) => setShowLinkExpiration(checked === true)}
                />
                <Label htmlFor="show-link-expiration">Set link expiration date</Label>
              </div>
              
              {showLinkExpiration && (
                <div className="pl-6">
                  <Label>Link expires on</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !shareLinkExpiresAt && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {shareLinkExpiresAt ? format(shareLinkExpiresAt, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        selected={shareLinkExpiresAt || undefined}
                        onSelect={setShareLinkExpiresAt}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
