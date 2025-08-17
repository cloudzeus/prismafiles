"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Building, 
  Users, 
  Plus, 
  Star, 
  UserCheck,
  Trash2,
  Edit
} from "lucide-react"
import DepartmentRoleCard from "./department-role-card"

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
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
  department: {
    id: string
    name: string
    userDepartments: UserDepartment[]
  }
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
  userDepartments: {
    id: string
    userId: string
    departmentId: string
    jobPosition: string
    isManager: boolean
    joinedAt: Date
    leftAt: Date | null
    user: {
      name: string | null
      email: string
    }
  }[]
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

interface DepartmentCardProps {
  department: Department
  onDepartmentDeleted?: (departmentId: string) => void
  onRoleDeleted?: (roleId: string) => void
}

export default function DepartmentCard({ department, onDepartmentDeleted, onRoleDeleted }: DepartmentCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const getLevelLabel = (level: number | null | undefined) => {
    const safeLevel = level || 1
    switch (safeLevel) {
      case 1: return { label: 'Junior', color: 'bg-blue-100 text-blue-800' }
      case 2: return { label: 'Mid', color: 'bg-green-100 text-green-800' }
      case 3: return { label: 'Senior', color: 'bg-purple-100 text-purple-800' }
      case 4: return { label: 'Lead', color: 'bg-orange-100 text-orange-800' }
      case 5: return { label: 'Manager', color: 'bg-red-100 text-red-800' }
      default: return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' }
    }
  }

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
                {department.email && (
                  <span className="text-sm text-gray-600">{department.email}</span>
                )}
                {department.manager && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <UserCheck className="h-3 w-3" />
                      {department.manager?.name || department.manager?.email || 'Unknown Manager'}
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
                department.departmentRoles.map((role) => (
                  <DepartmentRoleCard 
                    key={role.id} 
                    role={role} 
                    levelInfo={getLevelLabel(role.level)}
                    department={department}
                    onRoleDeleted={onRoleDeleted}
                  />
                ))
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
