"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Folder, File, Download, Share, Calendar, User, Mail, 
  FileText, Image, Video, Music, Archive, Code, FileImage, 
  FileVideo, FileAudio, FileArchive, FileCode, FileSpreadsheet, 
  Presentation, ExternalLink, Link
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
  shareLink?: string | null
  sharedByUser?: {
    id: string
    name: string | null
    email: string
  }
  sharedWithUser?: {
    id: string
    name: string | null
    email: string
  }
  sharedWithContact?: {
    id: number
    name: string
    email: string | null
  }
}

interface SharedItemsClientProps {
  user: {
    id: string
    name: string | null
    email: string
    role: string
  }
}

export default function SharedItemsClient({ user }: SharedItemsClientProps) {
  const [sharedByMe, setSharedByMe] = useState<SharedItem[]>([])
  const [sharedWithMe, setSharedWithMe] = useState<SharedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'shared-with-me' | 'shared-by-me'>('shared-with-me')
  
  const { toast } = useToast()

  useEffect(() => {
    fetchSharedItems()
  }, [activeTab])

  const fetchSharedItems = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/sharing?type=${activeTab}`)
      if (response.ok) {
        const data = await response.json()
        if (activeTab === 'shared-with-me') {
          setSharedWithMe(data.sharedItems || [])
        } else {
          setSharedByMe(data.sharedItems || [])
        }
      }
    } catch (error) {
      console.error('Error fetching shared items:', error)
      toast({
        title: "Error",
        description: "Failed to fetch shared items",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

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
      'mp3': Audio,
      'wav': Audio,
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

  const handleDownload = async (itemPath: string) => {
    try {
      const response = await fetch('/api/cdn/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: itemPath })
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = itemPath.split('/').pop() || 'download'
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
    }
  }

  const copyShareLink = (shareLink: string) => {
    const baseUrl = window.location.origin
    const fullLink = `${baseUrl}/shared/${shareLink}`
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

  const renderSharedItem = (item: SharedItem, isOwner: boolean = false) => (
    <Card key={item.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {item.itemType === 'folder' ? (
                <Folder className="h-5 w-5 text-blue-600" />
              ) : (
                React.createElement(getFileIcon((item.itemName.split('.').pop() || 'file')), { 
                  className: 'h-5 w-5 text-green-600' 
                })
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{item.itemName}</h4>
              <p className="text-sm text-gray-600">
                Type: {item.itemType === 'folder' ? 'Folder' : 'File'}
                {item.description && ` • ${item.description}`}
              </p>
              
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Shared: {format(new Date(item.sharedAt), 'MMM d, yyyy')}
                </div>
                
                {item.expiresAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Expires: {format(new Date(item.expiresAt), 'MMM d, yyyy')}
                    {isExpired(item.expiresAt) && (
                      <Badge variant="destructive" className="text-xs">Expired</Badge>
                    )}
                  </div>
                )}
                
                {item.shareLinkExpiresAt && (
                  <div className="flex items-center gap-1">
                    <Link className="h-3 w-3" />
                    Link expires: {format(new Date(item.shareLinkExpiresAt), 'MMM d, yyyy')}
                    {isExpired(item.shareLinkExpiresAt) && (
                      <Badge variant="destructive" className="text-xs">Link Expired</Badge>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                {item.sharingType === 'user' ? (
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <User className="h-3 w-3" />
                    {isOwner ? 'Shared with: ' : 'Shared by: '}
                    {isOwner 
                      ? (item.sharedWithUser?.name || item.sharedWithUser?.email || 'Unknown user')
                      : (item.sharedByUser?.name || item.sharedByUser?.email || 'Unknown user')
                    }
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Mail className="h-3 w-3" />
                    {isOwner ? 'Shared with: ' : 'Shared by: '}
                    {isOwner 
                      ? (item.sharedWithContact?.name || 'Unknown contact')
                      : (item.sharedByUser?.name || item.sharedByUser?.email || 'Unknown user')
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {item.canDownload && item.itemType === 'file' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(item.itemPath)}
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            
            {isOwner && item.sharingType === 'contact' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyShareLink(item.shareLink || '')}
                title="Copy share link"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Permissions */}
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-gray-600">Permissions:</span>
            <div className="flex gap-2">
              <Badge variant={item.canView ? "default" : "secondary"}>
                View {item.canView ? "✓" : "✗"}
              </Badge>
              <Badge variant={item.canDownload ? "default" : "secondary"}>
                Download {item.canDownload ? "✓" : "✗"}
              </Badge>
              <Badge variant={item.canEdit ? "default" : "secondary"}>
                Edit {item.canEdit ? "✓" : "✗"}
              </Badge>
              <Badge variant={item.canDelete ? "default" : "secondary"}>
                Delete {item.canDelete ? "✓" : "✗"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'shared-with-me' | 'shared-by-me')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="shared-with-me" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Shared with Me ({sharedWithMe.length})
          </TabsTrigger>
          <TabsTrigger value="shared-by-me" className="flex items-center gap-2">
            <Share className="h-4 w-4" />
            Shared by Me ({sharedByMe.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shared-with-me" className="space-y-4">
          {sharedWithMe.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No items have been shared with you</p>
                <p className="text-sm text-gray-500 mt-2">
                  When someone shares a file or folder with you, it will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sharedWithMe.map(item => renderSharedItem(item, false))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="shared-by-me" className="space-y-4">
          {sharedByMe.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Share className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">You haven't shared any items yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Go to the Files page to share files and folders with users or contacts.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sharedByMe.map(item => renderSharedItem(item, true))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
