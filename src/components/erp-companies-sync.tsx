"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Download, Database, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ERPCompany {
  sodtype: string
  trdr: string
  code: string
  name: string
  afm?: string
  country?: string
  city?: string
  address?: string
  zip?: string
  phone01?: string
  phone02?: string
  fax?: string
  jobtypetrd?: string
  webpage?: string
  email?: string
  emailacc?: string
  irsdata?: string
  upddate?: string
}

interface ERPSyncResponse {
  success: boolean
  totalcount: number
  rows: ERPCompany[]
}

export function ERPCompaniesSync() {
  const [isLoading, setIsLoading] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [syncResults, setSyncResults] = useState<{
    customers: number
    suppliers: number
    total: number
  } | null>(null)

  const authenticateERP = async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/erp/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: "login",
          username: "cronusweb",
          password: "1f1femsk",
          appId: "1001",
          COMPANY: "1001",
          BRANCH: "1000",
          MODULE: "0",
          REFID: "15",
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('🚨 Authentication failed:', response.status, errorText)
        throw new Error(`Authentication failed: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('✅ Authentication response:', data)
      
      if (!data.success || !data.clientID) {
        console.error('🚨 Invalid authentication response:', data)
        throw new Error(`Invalid authentication response: ${JSON.stringify(data)}`)
      }

      return data.clientID
    } catch (error) {
      console.error('ERP Authentication error:', error)
      throw error
    }
  }

  const fetchERPCompanies = async (clientId: string, sodtype: '12' | '13'): Promise<ERPCompany[]> => {
    try {
      const response = await fetch('/api/erp/fetch-companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appId: "1001",
          clientId: clientId,
          SqlName: "133",
          service: "SqlData",
          param1: sodtype,
          param2: "1002"
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch ${sodtype === '12' ? 'suppliers' : 'customers'}: ${response.status}`)
      }

      const responseData = await response.json()
      
      if (!responseData.success || !responseData.data || !responseData.data.rows) {
        throw new Error(`Invalid response for ${sodtype === '12' ? 'suppliers' : 'customers'}`)
      }

      return responseData.data.rows
    } catch (error) {
      console.error(`ERP Fetch error for ${sodtype}:`, error)
      throw error
    }
  }

  const syncCompanies = async () => {
    setIsLoading(true)
    setSyncStatus('syncing')
    
    try {
      // Step 1: Authenticate with ERP
      toast.info('Authenticating with ERP system...')
      const clientId = await authenticateERP()
      toast.success('ERP authentication successful')

      // Step 2: Fetch customers (sodtype 13)
      toast.info('Fetching customers from ERP...')
      const customers = await fetchERPCompanies(clientId!, '13')
      toast.success(`Fetched ${customers.length} customers`)

      // Step 3: Fetch suppliers (sodtype 12)
      toast.info('Fetching suppliers from ERP...')
      const suppliers = await fetchERPCompanies(clientId!, '12')
      toast.success(`Fetched ${suppliers.length} suppliers`)

      // Step 4: Sync to database
      toast.info('Syncing companies to database...')
      const syncResponse = await fetch('/api/erp/sync-companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customers,
          suppliers
        }),
      })

      if (!syncResponse.ok) {
        throw new Error(`Sync failed: ${syncResponse.status}`)
      }

      const syncData = await syncResponse.json()
      
      if (!syncData.success) {
        throw new Error(syncData.error || 'Sync failed')
      }

      setSyncResults({
        customers: customers.length,
        suppliers: suppliers.length,
        total: customers.length + suppliers.length
      })

      setSyncStatus('success')
      toast.success(`Successfully synced ${customers.length + suppliers.length} companies`)
      
    } catch (error) {
      console.error('ERP Sync error:', error)
      setSyncStatus('error')
      
      let errorMessage = 'Unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
        
        // Check for specific authentication errors
        if (errorMessage.includes('Authentication failed')) {
          errorMessage = 'ERP Authentication failed. Please check credentials and try again.'
        } else if (errorMessage.includes('invalid credentials')) {
          errorMessage = 'Invalid ERP credentials. Please verify username and password.'
        }
      }
      
      toast.error(`Sync failed: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
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
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing with ERP...'
      case 'success':
        return 'Sync completed successfully'
      case 'error':
        return 'Sync failed'
      default:
        return 'Ready to sync'
    }
  }

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'syncing':
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
          <Database className="h-5 w-5" />
          ERP Companies Sync
        </CardTitle>
        <CardDescription>
          Synchronize companies from the ERP system (SoftOne)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={syncCompanies}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isLoading ? 'Syncing...' : 'Sync from ERP'}
          </Button>
          
          <Badge className={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-2">{getStatusText()}</span>
          </Badge>
        </div>

        {syncResults && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{syncResults.customers}</div>
              <div className="text-sm text-gray-600">Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{syncResults.suppliers}</div>
              <div className="text-sm text-gray-600">Suppliers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{syncResults.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p>This will fetch all companies from the ERP system and sync them to your local database.</p>
          <p className="mt-1">• Customers (sodtype: 13)</p>
          <p className="mt-1">• Suppliers (sodtype: 12)</p>
        </div>
      </CardContent>
    </Card>
  )
}
