"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, Download, FileText, AlertTriangle, CheckCircle, 
  XCircle, Users, Shield, BarChart3, TrendingUp, TrendingDown,
  Eye, EyeOff, RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

interface GdprReport {
  id: string
  reportType: string
  startDate: string
  endDate: string
  generatedAt: string
  status: string
  reportData: any
  user: {
    name: string | null
    email: string
  }
}

interface GdprReportsClientProps {
  user: {
    id: string
    name: string | null
    email: string
    role: string
  }
}

export default function GdprReportsClient({ user }: GdprReportsClientProps) {
  const [reports, setReports] = useState<GdprReport[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'generate'>('overview')
  
  // Report generation form
  const [reportType, setReportType] = useState('weekly')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  // Overview statistics
  const [overviewStats, setOverviewStats] = useState<any>(null)
  
  const { toast } = useToast()

  useEffect(() => {
    fetchReports()
    if (activeTab === 'overview') {
      fetchOverviewStats()
    }
  }, [activeTab])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/gdpr/reports')
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports || [])
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast({
        title: "Error",
        description: "Failed to fetch GDPR reports",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchOverviewStats = async () => {
    try {
      // Generate a quick overview report for the last 30 days
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 30)
      
      const response = await fetch('/api/gdpr/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: 'overview',
          startDate: start.toISOString(),
          endDate: end.toISOString()
        })
      })

      if (response.ok) {
        const data = await response.json()
        setOverviewStats(data.report.data)
      }
    } catch (error) {
      console.error('Error fetching overview stats:', error)
    }
  }

  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select start and end dates",
        variant: "destructive"
      })
      return
    }

    try {
      setGenerating(true)
      const response = await fetch('/api/gdpr/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          startDate,
          endDate
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Success",
          description: "GDPR report generated successfully",
        })
        
        // Reset form
        setStartDate('')
        setEndDate('')
        setReportType('weekly')
        
        // Refresh reports list
        fetchReports()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate report')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to generate report',
        variant: "destructive"
      })
    } finally {
      setGenerating(false)
    }
  }

  const downloadReport = (report: GdprReport) => {
    const dataStr = JSON.stringify(report.reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `gdpr-report-${report.reportType}-${format(new Date(report.startDate), 'yyyy-MM-dd')}-${format(new Date(report.endDate), 'yyyy-MM-dd')}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'generating': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Eye className="h-4 w-4 text-gray-600" />
    }
  }

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
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'overview' | 'reports' | 'generate')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports ({reports.length})
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Generate Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {overviewStats ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{overviewStats.summary.totalSharingAttempts}</p>
                        <p className="text-sm text-gray-600">Total Sharing Attempts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{overviewStats.summary.successfulAttempts}</p>
                        <p className="text-sm text-gray-600">Successful Shares</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <XCircle className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{overviewStats.summary.blockedAttempts}</p>
                        <p className="text-sm text-gray-600">Blocked Attempts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Shield className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{overviewStats.summary.complianceRate}%</p>
                        <p className="text-sm text-gray-600">Compliance Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Risk Level Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Level Breakdown</CardTitle>
                  <CardDescription>Files by GDPR risk level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Object.entries(overviewStats.riskLevelBreakdown || {}).map(([level, data]: [string, any]) => (
                      <div key={level} className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{data.count}</div>
                        <div className="text-sm text-gray-600 capitalize">{level} Risk</div>
                        <Badge className={`mt-2 ${getRiskLevelColor(level)}`}>
                          {level.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Blocked Files */}
              {overviewStats.topBlockedFiles && overviewStats.topBlockedFiles.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top Blocked Files</CardTitle>
                    <CardDescription>Files most frequently blocked for GDPR compliance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {overviewStats.topBlockedFiles.slice(0, 5).map((file: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{file.name}</div>
                            <div className="text-sm text-gray-600">{file.path}</div>
                            <div className="text-xs text-gray-500">Type: {file.type}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-red-600">{file.blockedCount}</div>
                            <div className="text-xs text-gray-500">blocked</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No overview statistics available</p>
                <Button onClick={fetchOverviewStats} className="mt-4">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Statistics
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {reports.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No GDPR reports generated yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Generate your first report using the "Generate Report" tab.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold capitalize">
                            {report.reportType} Report
                          </h3>
                          <Badge variant="outline">
                            {getStatusIcon(report.status)}
                            <span className="ml-2 capitalize">{report.status}</span>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Period:</span><br />
                            {format(new Date(report.startDate), 'MMM d, yyyy')} - {format(new Date(report.endDate), 'MMM d, yyyy')}
                          </div>
                          <div>
                            <span className="font-medium">Generated:</span><br />
                            {format(new Date(report.generatedAt), 'MMM d, yyyy HH:mm')}
                          </div>
                          <div>
                            <span className="font-medium">By:</span><br />
                            {report.user.name || report.user.email}
                          </div>
                        </div>

                        {report.reportData?.summary && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Total Attempts:</span><br />
                                {report.reportData.summary.totalSharingAttempts}
                              </div>
                              <div>
                                <span className="font-medium">Compliance Rate:</span><br />
                                {report.reportData.summary.complianceRate}%
                              </div>
                              <div>
                                <span className="font-medium">Blocked:</span><br />
                                {report.reportData.summary.blockedAttempts}
                              </div>
                              <div>
                                <span className="font-medium">Critical Files:</span><br />
                                {report.reportData.summary.criticalRiskFiles}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadReport(report)}
                          disabled={report.status !== 'completed'}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate New GDPR Report</CardTitle>
              <CardDescription>
                Create a comprehensive report for a specific time period
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="custom">Custom Period</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button 
                onClick={generateReport} 
                disabled={!startDate || !endDate || generating}
                className="w-full"
              >
                {generating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>

              <div className="text-sm text-gray-600">
                <p><strong>Note:</strong> Report generation may take a few moments depending on the data volume.</p>
                <p>Reports include detailed statistics on sharing attempts, GDPR compliance, and risk assessments.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
