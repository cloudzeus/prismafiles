"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Folder, File, Download, Calendar, User, Mail, 
  FileText, Image, Video, Music, Archive, Code, FileImage, 
  FileVideo, FileAudio, FileArchive, FileCode, FileSpreadsheet, 
  Presentation, ExternalLink, Clock
} from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

interface SharedItem {
  id: string
  itemPath: string
  itemName: string
  itemType: string
  sharedAt: string
  expiresAt: string | null
  shareLinkExpiresAt: string | null
  sharingType: string
  canView: boolean
  canDownload: boolean
  canEdit: boolean
  canDelete: boolean
  description: string | null
  shareLink: string | null
  sharedByUser?: {
    name: string | null
    email: string
  }
  sharedWithContact?: {
    name: string
    email: string | null
  }
}

interface SharedItemViewProps {
  sharedItem: SharedItem
}

export default function SharedItemView({ sharedItem }: SharedItemViewProps) {
  const [downloading, setDownloading] = useState(false)
  const { toast } = useToast()

  const getFileIcon = (fileType: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      'txt': FileText,
      'pdf': FileText,
      'doc': FileText,
      'docx': FileText,
      'jpg': Image,
      'jpeg': Image,
      'png': Image,
      'gif': Image,
      'mp4': Video,
      'avi': Video,
      'mov': Video,
      'mp3': Music,
      'wav': Music,
      'zip': Archive,
      'rar': Archive,
      'js': Code,
      'ts': Code,
      'py': Code,
      'xlsx': FileSpreadsheet,
      'xls': FileSpreadsheet,
      'pptx': Presentation,
      'ppt': Presentation
    }
    
    const extension = fileType.toLowerCase()
    return iconMap[extension] || File
  }

  const handleDownload = async () => {
    if (!sharedItem.canDownload) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to download this file",
        variant: "destructive"
      })
      return
    }

    setDownloading(true)
    try {
      const response = await fetch('/api/cdn/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: sharedItem.itemPath })
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = sharedItem.itemName
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
        
        toast({
          title: "Success",
          description: "File downloaded successfully"
        })
      } else {
        throw new Error('Download failed')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive"
      })
    } finally {
      setDownloading(false)
    }
  }

  const copyShareLink = () => {
    const fullLink = window.location.href
    navigator.clipboard.writeText(fullLink)
    toast({
      title: "Copied",
      description: "Share link copied to clipboard"
    })
  }

  const isExpired = (dateString: string | null) => {
    if (!dateString) return false
    return new Date(dateString) < new Date()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {sharedItem.itemType === 'folder' ? (
              <Folder className="h-10 w-10 text-blue-600" />
            ) : (
              React.createElement(getFileIcon((sharedItem.itemName.split('.').pop() || 'file')), { 
                className: 'h-10 w-10 text-green-600' 
              })
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{sharedItem.itemName}</h1>
          <p className="text-lg text-gray-600">
            {sharedItem.itemType === 'folder' ? 'Folder' : 'File'} shared with you
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Item Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <File className="h-5 w-5" />
                  Item Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sharedItem.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600">{sharedItem.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Type</h4>
                    <p className="text-gray-600 capitalize">{sharedItem.itemType}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Shared by</h4>
                    <p className="text-gray-600">
                      {sharedItem.sharedByUser?.name || sharedItem.sharedByUser?.email || 'Unknown user'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Shared on</h4>
                    <p className="text-gray-600">
                      {format(new Date(sharedItem.sharedAt), 'PPP')}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Expires</h4>
                    <p className="text-gray-600">
                      {sharedItem.expiresAt ? (
                        <span className="flex items-center gap-1">
                          {format(new Date(sharedItem.expiresAt), 'PPP')}
                          {isExpired(sharedItem.expiresAt) && (
                            <Badge variant="destructive" className="text-xs">Expired</Badge>
                          )}
                        </span>
                      ) : (
                        'Never'
                      )}
                    </p>
                  </div>
                </div>

                {sharedItem.shareLinkExpiresAt && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Link expires</h4>
                    <p className="text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {format(new Date(sharedItem.shareLinkExpiresAt), 'PPP')}
                        {isExpired(sharedItem.shareLinkExpiresAt) && (
                          <Badge variant="destructive" className="text-xs">Expired</Badge>
                        )}
                      </span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions & Permissions */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sharedItem.canDownload && sharedItem.itemType === 'file' && (
                  <Button 
                    onClick={handleDownload} 
                    disabled={downloading}
                    className="w-full"
                  >
                    {downloading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download File
                      </>
                    )}
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={copyShareLink}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </CardContent>
            </Card>

            {/* Permissions */}
            <Card>
              <CardHeader>
                <CardTitle>Your Permissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">View</span>
                  <Badge variant={sharedItem.canView ? "default" : "secondary"}>
                    {sharedItem.canView ? "Allowed" : "Denied"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Download</span>
                  <Badge variant={sharedItem.canDownload ? "default" : "secondary"}>
                    {sharedItem.canDownload ? "Allowed" : "Denied"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Edit</span>
                  <Badge variant={sharedItem.canEdit ? "default" : "secondary"}>
                    {sharedItem.canEdit ? "Allowed" : "Denied"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Delete</span>
                  <Badge variant={sharedItem.canDelete ? "default" : "secondary"}>
                    {sharedItem.canDelete ? "Allowed" : "Denied"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>Shared with: {sharedItem.sharedWithContact?.name || 'Unknown contact'}</span>
                </div>
                
                {sharedItem.sharedWithContact?.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{sharedItem.sharedWithContact.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>This is a shared item from PrismaFiles</p>
          <p>If you have any questions, please contact the person who shared this with you</p>
        </div>
      </div>
    </div>
  )
}
