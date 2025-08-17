"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Building, 
  Users, 
  Plus, 
  Edit,
  Trash2
} from "lucide-react"

interface User {
  name: string | null
  email: string
}

interface UserDepartment {
  id: string
  userId: string
  departmentId: string
  jobPosition: string
  isManager: boolean
  joinedAt: Date
  leftAt: Date | null
  user: User
}

interface DepartmentRole {
  id: string
  name: string
  description: string | null
  departmentId: string
  level: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface Department {
  id: string
  name: string
  description: string | null
  email: string | null
  managerId: string | null
  parentId: string | null
  createdAt: Date
  updatedAt: Date
  userDepartments: UserDepartment[]
  departmentRoles: DepartmentRole[]
  children?: {
    id: string
    name: string
  }[]
  manager?: {
    name: string | null
    email: string
  } | null
}

interface DepartmentsListCardProps {
  department: Department
  onDepartmentDeleted?: (departmentId: string) => void
}

export default function DepartmentsListCard({ department, onDepartmentDeleted }: DepartmentsListCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleAddDepartmentRole = (departmentId: string) => {
    // TODO: Implement add role modal/form
    alert(`Add new role to ${department.name} department`)
  }

  const handleEditDepartment = (departmentId: string) => {
    // TODO: Implement edit department modal/form
    alert(`Edit ${department.name} department`)
  }

  const handleDeleteDepartment = async (departmentId: string, departmentName: string) => {
    if (!confirm(`Are you sure you want to delete the "${departmentName}" department? This will also delete all roles and user associations. This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/departments/${departmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete department')
      }

      // Call the callback to update parent state
      if (onDepartmentDeleted) {
        onDepartmentDeleted(department.id)
      }
    } catch (error) {
      console.error("Error deleting department:", error)
      alert(error instanceof Error ? error.message : 'Failed to delete department')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-xl">{department.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                {department.description && (
                  <span className="text-sm text-gray-600">{department.description}</span>
                )}
                {department.email && (
                  <>
                    <span>•</span>
                    <span className="text-sm text-gray-600">{department.email}</span>
                  </>
                )}
                {department.manager && (
                  <>
                    <span>•</span>
                    <span className="text-sm text-gray-600">
                      Manager: {department.manager?.name || department.manager?.email || 'Unknown'}
                    </span>
                  </>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white">
              {department.userDepartments?.length || 0} members
            </Badge>
            <button
              onClick={() => handleAddDepartmentRole(department.id)}
              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors"
              title="Add new role to this department"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleEditDepartment(department.id)}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
              title="Edit this department"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDeleteDepartment(department.id, department.name)}
              disabled={isDeleting}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete this department"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Available Roles</h4>
            <div className="space-y-3">
              {department.departmentRoles && department.departmentRoles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {department.departmentRoles.map((role) => (
                    <Badge key={role.id} variant="outline" className="bg-gray-50">
                      {role.name} (Level {role.level})
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm italic">No roles defined</div>
              )}
            </div>
          </div>

          {department.children && Array.isArray(department.children) && department.children.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Sub-departments</h4>
              <div className="flex flex-wrap gap-2">
                {department.children.map((child) => (
                  <Badge key={child.id} variant="outline" className="bg-green-50 text-green-700">
                    {child.name || 'Unnamed Department'}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
