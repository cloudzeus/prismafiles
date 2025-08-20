"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Key, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export function ERPCredentialsTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [credentials, setCredentials] = useState({
    service: 'login',
    username: 'cronusweb',
    password: '1f1femsk',
    appId: '1001',
    COMPANY: '1001',
    BRANCH: '1000',
    MODULE: '0',
    REFID: '15'
  })
  const [lastResponse, setLastResponse] = useState<any>(null)

  const testCredentials = async () => {
    setIsLoading(true)
    setTestStatus('testing')
    
    try {
      const response = await fetch('/api/erp/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()
      setLastResponse(data)
      
      if (response.ok && data.success) {
        setTestStatus('success')
        toast.success('Authentication successful!')
      } else {
        setTestStatus('error')
        toast.error(`Authentication failed: ${data.error || 'Unknown error'}`)
      }
      
    } catch (error) {
      console.error('Test error:', error)
      setTestStatus('error')
      toast.error(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
        return <Key className="h-4 w-4" />
    }
  }

  const getStatusText = () => {
    switch (testStatus) {
      case 'testing':
        return 'Testing credentials...'
      case 'success':
        return 'Credentials valid'
      case 'error':
        return 'Credentials invalid'
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          ERP Credentials Test
        </CardTitle>
        <CardDescription>
          Test ERP authentication credentials before syncing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="appId">App ID</Label>
            <Input
              id="appId"
              value={credentials.appId}
              onChange={(e) => setCredentials(prev => ({ ...prev, appId: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={credentials.COMPANY}
              onChange={(e) => setCredentials(prev => ({ ...prev, COMPANY: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch">Branch</Label>
            <Input
              id="branch"
              value={credentials.BRANCH}
              onChange={(e) => setCredentials(prev => ({ ...prev, BRANCH: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="module">Module</Label>
            <Input
              id="module"
              value={credentials.MODULE}
              onChange={(e) => setCredentials(prev => ({ ...prev, MODULE: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="refId">Ref ID</Label>
            <Input
              id="refId"
              value={credentials.REFID}
              onChange={(e) => setCredentials(prev => ({ ...prev, REFID: e.target.value }))}
            />
          </div>

        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={testCredentials}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Key className="h-4 w-4" />
            )}
            {isLoading ? 'Testing...' : 'Test Credentials'}
          </Button>
          
          <Badge className={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-2">{getStatusText()}</span>
          </Badge>
        </div>

        {lastResponse && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Last Response:</h4>
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(lastResponse, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p><strong>Correct Authentication Fields:</strong></p>
          <p className="mt-1">• <strong>MODULE</strong>: 0 (not 1001)</p>
          <p className="mt-1">• <strong>REFID</strong>: 15</p>
          <p className="mt-1">• <strong>VERSION</strong>: Not required</p>
          <p className="mt-1">Please test with these corrected credentials.</p>
        </div>
      </CardContent>
    </Card>
  )
}
