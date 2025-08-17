import { getCurrentUser, hasRole } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, Settings, User, ArrowRight } from "lucide-react"
import UserDropdown from "@/components/user-dropdown"

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/auth/signin")
  }

  const isAdmin = hasRole(user.role, "ADMINISTRATOR")
  const isManager = hasRole(user.role, "MANAGER") || isAdmin

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - 100% width */}
      <header className="w-full bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo size="lg" />
            
            {/* User Avatar with Dropdown */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden sm:block">
                Welcome, {user.name || user.email}
              </span>
              
              <UserDropdown user={user} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome to your G-FILES dashboard
          </p>
        </div>

        {/* Role-based Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Role
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600 capitalize">{user.role}</p>
              <p className="text-sm text-gray-600 mt-1">{user.email}</p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  View Files
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Upload Files
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">System Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Database Connected</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Count */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">Online</p>
              <p className="text-sm text-gray-600 mt-1">You are currently active</p>
            </CardContent>
          </Card>
        </div>

        {/* Role-specific Content */}
        {isAdmin && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Administrator Panel</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    User Management
                  </CardTitle>
                  <CardDescription>Manage all users and their roles</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    Manage Users
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    System Settings
                  </CardTitle>
                  <CardDescription>Configure system-wide settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    Configure System
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    Role Management
                  </CardTitle>
                  <CardDescription>Define and manage user roles</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    Manage Roles
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {isManager && !isAdmin && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Manager Panel</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Team Overview
                  </CardTitle>
                  <CardDescription>View and manage your team</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    View Team
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-green-600" />
                    Project Management
                  </CardTitle>
                  <CardDescription>Manage team projects and tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    Manage Projects
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Employee Content */}
        {!isManager && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Employee Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    My Tasks
                  </CardTitle>
                  <CardDescription>View and manage your assigned tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    View Tasks
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-green-600" />
                    File Management
                  </CardTitle>
                  <CardDescription>Access and manage your files</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    Manage Files
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
