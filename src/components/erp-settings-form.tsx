"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, Database, TestTube, Save, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface ERPSettings {
  endpoint: string
  username: string
  password: string
  appId: string
  company: string
  branch: string
  module: string
  refId: string
  autoSync: boolean
  syncInterval: number
}

export function ERPSettingsForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [settings, setSettings] = useState<ERPSettings>({
    endpoint: 'https://kolleris.oncloud.gr/s1services',
    username: 'cronusweb',
    password: '1f1femsk',
    appId: '1001',
    company: '1001',
    branch: '1000',
    module: '0',
    refId: '15',
    autoSync: false,
    syncInterval: 3600
  })

  const handleInputChange = (field: keyof ERPSettings, value: string | boolean | number) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const testConnection = async () => {
    setIsTesting(true)
    setTestStatus('testing')
    
    try {
      const response = await fetch('/api/erp/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: "login",
          username: settings.username,
          password: settings.password,
          appId: settings.appId,
          COMPANY: settings.company,
          BRANCH: settings.branch,
          MODULE: settings.module,
          REFID: settings.refId,
        }),
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        setTestStatus('success')
        toast.success('ERP connection test successful!')
      } else {
        setTestStatus('error')
        toast.error(`Connection test failed: ${data.error || 'Unknown error'}`)
      }
      
    } catch (error) {
      console.error('Test error:', error)
      setTestStatus('error')
      toast.error(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsTesting(false)
    }
  }

  const testDatabase = async () => {
    try {
      const response = await fetch('/api/erp/test-db')
      const data = await response.json()
      
      if (response.ok && data.success) {
        toast.success(`Database test successful! Total companies: ${data.details.totalCompanies}`)
      } else {
        toast.error(`Database test failed: ${data.error || 'Unknown error'}`)
      }
      
    } catch (error) {
      console.error('Database test error:', error)
      toast.error(`Database test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const saveSettings = async () => {
    setIsLoading(true)
    
    try {
      // Save settings to localStorage or API
      localStorage.setItem('erp-settings', JSON.stringify(settings))
      toast.success('ERP settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = () => {
    switch (testStatus) {
      case 'testing':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  const getStatusText = () => {
    switch (testStatus) {
      case 'testing':
        return 'Testing connection...'
      case 'success':
        return 'Connection successful'
      case 'error':
        return 'Connection failed'
      default:
        return 'Ready to test'
    }
  }

  const getStatusColor = () => {
    switch (testStatus) {
      case 'testing':
        return 'bg-blue-100 text-blue-800'
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            ERP Connection Settings
          </CardTitle>
          <CardDescription>
            Configure the connection to your ERP system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endpoint">Endpoint URL</Label>
              <Input
                id="endpoint"
                value={settings.endpoint}
                onChange={(e) => handleInputChange('endpoint', e.target.value)}
                placeholder="https://your-erp-system.com/api"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={settings.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="ERP username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={settings.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="ERP password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appId">App ID</Label>
              <Input
                id="appId"
                value={settings.appId}
                onChange={(e) => handleInputChange('appId', e.target.value)}
                placeholder="1001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={settings.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="1001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input
                id="branch"
                value={settings.branch}
                onChange={(e) => handleInputChange('branch', e.target.value)}
                placeholder="1000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="module">Module</Label>
              <Input
                id="module"
                value={settings.module}
                onChange={(e) => handleInputChange('module', e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refId">Ref ID</Label>
              <Input
                id="refId"
                value={settings.refId}
                onChange={(e) => handleInputChange('refId', e.target.value)}
                placeholder="15"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Button
              onClick={testConnection}
              disabled={isTesting}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4" />
              )}
              {isTesting ? 'Testing...' : 'Test ERP Connection'}
            </Button>
            
            <Button
              onClick={testDatabase}
              disabled={isTesting}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Test Database
            </Button>
            
            <Badge className={getStatusColor()}>
              {getStatusIcon()}
              <span className="ml-2">{getStatusText()}</span>
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Sync Settings
          </CardTitle>
          <CardDescription>
            Configure automatic synchronization settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoSync">Automatic Sync</Label>
              <p className="text-sm text-gray-600">Enable automatic synchronization with ERP</p>
            </div>
            <Switch
              id="autoSync"
              checked={settings.autoSync}
              onCheckedChange={(checked) => handleInputChange('autoSync', checked)}
            />
          </div>
          
          {settings.autoSync && (
            <div className="space-y-2">
              <Label htmlFor="syncInterval">Sync Interval (seconds)</Label>
              <Input
                id="syncInterval"
                type="number"
                value={settings.syncInterval}
                onChange={(e) => handleInputChange('syncInterval', parseInt(e.target.value))}
                min="300"
                step="300"
              />
              <p className="text-sm text-gray-600">
                Minimum 5 minutes (300 seconds)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button
          onClick={testDatabase}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Database className="h-4 w-4" />
          Test Database
        </Button>
        
        <div className="flex gap-3">
          <Button
            onClick={saveSettings}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  )
}
