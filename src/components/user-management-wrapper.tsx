"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building, Shield } from "lucide-react"
import UserManagementTable from "./user-management-table"
import ClientAddUserButton from "./client-add-user-button"

interface UserManagementWrapperProps {
  initialUserCount: number
  initialDepartmentCount: number
  initialRoleCount: number
  initialActiveMemberships: number
}

export default function UserManagementWrapper({
  initialUserCount,
  initialDepartmentCount,
  initialRoleCount,
  initialActiveMemberships
}: UserManagementWrapperProps) {
  const [userCount, setUserCount] = useState(initialUserCount)
  const [departmentCount, setDepartmentCount] = useState(initialDepartmentCount)
  const [roleCount, setRoleCount] = useState(initialRoleCount)
  const [activeMemberships, setActiveMemberships] = useState(initialActiveMemberships)

  const handleUserCreated = () => {
    // Refresh the user count and trigger table refresh
    setUserCount(prev => prev + 1)
    // The UserManagementTable will refresh its data when the key changes
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage users, departments, and company structure
          </p>
        </div>
        <ClientAddUserButton onUserCreated={handleUserCreated} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              All Users
            </CardTitle>
            <CardDescription>View and manage all system users</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{userCount}</p>
            <p className="text-sm text-gray-600 mt-1">Active users</p>
            <div className="mt-2 text-xs text-blue-500">
              Total registered users in the system
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-green-600" />
              Departments
            </CardTitle>
            <CardDescription>Manage organizational departments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{departmentCount}</p>
            <p className="text-sm text-gray-600 mt-1">Departments</p>
            <div className="mt-2 text-xs text-green-500">
              Organizational units
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Roles
            </CardTitle>
            <CardDescription>Define and manage user roles</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{roleCount}</p>
            <p className="text-sm text-gray-600 mt-1">Role types</p>
            <div className="mt-2 text-xs text-purple-500">
              Job positions available
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              Memberships
            </CardTitle>
            <CardDescription>Active department assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{activeMemberships}</p>
            <p className="text-sm text-gray-600 mt-1">Active memberships</p>
            <div className="mt-2 text-xs text-orange-500">
              Current assignments
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Expand rows to view detailed information and manage users</CardDescription>
        </CardHeader>
        <CardContent>
          <UserManagementTable key={userCount} />
        </CardContent>
      </Card>
    </div>
  )
}
