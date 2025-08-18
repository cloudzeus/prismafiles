"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Users, Plus, Edit, Trash2 } from "lucide-react"
import EditDepartmentModal from "@/components/edit-department-modal"
import AddDepartmentModal from "@/components/add-department-modal"

interface User {
  id: string
  name: string | null
  email: string
  role: string
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
      id: string
      name: string | null
      email: string
      image: string | null
    }
  }[]
  departmentRoles: {
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
      userDepartments: {
        id: string
        userId: string
        departmentId: string
        jobPosition: string
        isManager: boolean
        joinedAt: Date
        leftAt: Date | null
        user: {
          id: string
          name: string | null
          email: string
          image: string | null
        }
      }[]
    }
  }[]
  manager?: {
    name: string | null
    email: string
  } | null
  children?: {
    id: string
    name: string
  }[]
}

export default function DepartmentsPageClient() {
  const router = useRouter()
  const [departments, setDepartments] = useState<Department[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)

  useEffect(() => {
    fetchDepartments()
    fetchUsers()
  }, [])

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments')
      if (response.ok) {
        const data = await response.json()
        setDepartments(data.departments || [])
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users/list')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department)
    setEditModalOpen(true)
  }

  const handleDepartmentUpdated = (updatedDepartment: Department) => {
    setDepartments(prev => 
      prev.map(dept => 
        dept.id === updatedDepartment.id ? updatedDepartment : dept
      )
    )
  }

  const handleDepartmentAdded = (newDepartment: Department) => {
    setDepartments(prev => [...prev, newDepartment])
  }

  const handleDeleteDepartment = async (departmentId: string, departmentName: string) => {
    if (!confirm(`Are you sure you want to delete the "${departmentName}" department? This will also delete all roles and user associations. This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/departments/${departmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete department')
      }

      // Remove from local state
      setDepartments(prev => prev.filter(dept => dept.id !== departmentId))
    } catch (error) {
      console.error("Error deleting department:", error)
      alert(error instanceof Error ? error.message : 'Failed to delete department')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading departments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600 mt-2">
            Manage organizational departments and their members
          </p>
        </div>
        <button 
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {departments.length > 0 ? (
          departments.map((department) => (
            <Card key={department.id} className="overflow-hidden">
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
                    <span className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-full">
                      {department.userDepartments?.length || 0} members
                    </span>
                    <button
                      className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors"
                      title="Add new role to this department"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditDepartment(department)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                      title="Edit this department"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDepartment(department.id, department.name)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
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
                            <span key={role.id} className="px-3 py-1 text-sm bg-gray-50 border border-gray-200 rounded-full">
                              {role.name} (Level {role.level})
                            </span>
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
                          <span key={child.id} className="px-3 py-1 text-sm bg-green-50 text-green-700 border border-green-200 rounded-full">
                            {child.name || 'Unnamed Department'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No departments yet</h3>
                <p className="text-gray-600 mb-4">
                  Get started by creating your first department to organize your team.
                </p>
                <button 
                  onClick={() => setAddModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Department
                </button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <EditDepartmentModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedDepartment(null)
        }}
        department={selectedDepartment}
        users={users}
        departments={departments}
        onDepartmentUpdated={handleDepartmentUpdated}
      />

      <AddDepartmentModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        users={users}
        departments={departments}
        onDepartmentAdded={handleDepartmentAdded}
      />
    </div>
  )
}
