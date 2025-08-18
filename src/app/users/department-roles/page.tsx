"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import DepartmentCard from "@/components/department-card"
import AddRoleButton from "@/components/add-role-button"

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
  children?: {
    id: string
    name: string
  }[]
  manager?: {
    name: string | null
    email: string
  } | null
}

export default function DepartmentRolesPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch('/api/auth/me')
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData.user)
        }

        // Fetch departments data
        const response = await fetch('/api/departments/with-roles')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setDepartments(data.departments)
          }
        }

        // Fetch users data for manager selection
        const usersResponse = await fetch('/api/users/list')
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          if (usersData.success) {
            setUsers(usersData.users)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDepartmentDeleted = (deletedDepartmentId: string) => {
    setDepartments(prev => prev.filter(dept => dept.id !== deletedDepartmentId))
  }

  const handleRoleDeleted = (deletedRoleId: string) => {
    setDepartments(prev => prev.map(dept => ({
      ...dept,
      departmentRoles: dept.departmentRoles.filter(role => role.id !== deletedRoleId)
    })))
  }

  const handleRoleAdded = (newRole: any) => {
    setDepartments(prev => prev.map(dept => {
      if (dept.id === newRole.departmentId) {
        return {
          ...dept,
          departmentRoles: [...dept.departmentRoles, newRole]
        }
      }
      return dept
    }))
  }

  if (!user) {
    return <div>Loading...</div>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading departments...</div>
      </div>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Department Roles</h1>
            <p className="text-gray-600 mt-2">
              View and manage job positions and roles within each department
            </p>
          </div>
          <AddRoleButton 
            departments={departments}
            onRoleAdded={handleRoleAdded}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {departments.map((department) => (
            <DepartmentCard 
              key={department.id} 
              department={department}
              onDepartmentDeleted={handleDepartmentDeleted}
              onRoleDeleted={handleRoleDeleted}
              users={users}
              departments={departments}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
