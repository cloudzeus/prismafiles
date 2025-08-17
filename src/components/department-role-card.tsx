"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Edit, 
  Trash2, 
  UserPlus, 
  X, 
  Star,
  Users
} from "lucide-react"

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
}

interface DepartmentRoleCardProps {
  role: DepartmentRole
  levelInfo: { label: string; color: string }
  department: Department
  onRoleDeleted?: (roleId: string) => void
}

export default function DepartmentRoleCard({ role, levelInfo, department, onRoleDeleted }: DepartmentRoleCardProps) {
  const [isRemovingUser, setIsRemovingUser] = useState<string | null>(null)

  // Get users assigned to this specific role
  const roleUsers = department.userDepartments.filter(
    userDept => userDept.jobPosition === role.name
  ).map(userDept => ({
    ...userDept,
    user: {
      id: userDept.userId,
      name: userDept.user.name,
      email: userDept.user.email,
      image: null // We don't have image in the current query
    }
  }))

  const handleEditRole = () => {
    // TODO: Implement edit role modal/form
    alert('Edit role functionality coming soon!')
  }

  const handleDeleteRole = async () => {
    if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/department-roles/${role.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete role')
      }

      // Call the callback to update parent state
      if (onRoleDeleted) {
        onRoleDeleted(role.id)
      }
    } catch (error) {
      console.error("Error deleting role:", error)
      alert(error instanceof Error ? error.message : 'Failed to delete role')
    }
  }

  const handleAddUser = () => {
    // TODO: Implement add user modal/form
    alert('Add user functionality coming soon!')
  }

  const handleRemoveUser = async (userId: string) => {
    if (isRemovingUser === userId) return
    
    setIsRemovingUser(userId)
    try {
      const response = await fetch(`/api/department-roles/${role.id}/remove-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          departmentId: department.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove user from role');
      }

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error("Error removing user from role:", error)
      alert('Failed to remove user from role')
    } finally {
      setIsRemovingUser(null)
    }
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  return (
    <TooltipProvider>
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Badge className={levelInfo.color}>
              {levelInfo.label}
            </Badge>
            <div>
              <div className="font-medium text-gray-900">{role.name}</div>
              {role.description && (
                <div className="text-sm text-gray-600">{role.description}</div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: role.level }, (_, i) => (
              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditRole}
            className="h-8 px-2 text-xs"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteRole}
            className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddUser}
            className="h-8 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <UserPlus className="h-3 w-3 mr-1" />
            Add User
          </Button>
        </div>

        {/* Users Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Users className="h-4 w-4" />
            Users in this role ({roleUsers.length})
          </div>
          
          {roleUsers.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {roleUsers.map((userDept) => (
                <div key={userDept.id} className="relative group">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative">
                        <Avatar className="h-8 w-8 border-2 border-gray-200 hover:border-blue-300 transition-colors">
                          <AvatarImage src={userDept.user.image || undefined} alt={userDept.user.name || userDept.user.email} />
                          <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                            {getInitials(userDept.user.name, userDept.user.email)}
                          </AvatarFallback>
                        </Avatar>
                        
                        {/* Remove User Button */}
                        <button
                          onClick={() => handleRemoveUser(userDept.userId)}
                          disabled={isRemovingUser === userDept.userId}
                          className="absolute -top-1 -right-1 h-4 w-4 bg-gray-900 text-green-500 rounded-full 
                                   flex items-center justify-center text-[9px] font-bold opacity-0 group-hover:opacity-100 
                                   transition-opacity hover:bg-red-600 hover:text-white disabled:opacity-50"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="top" 
                      className="bg-gray-900 text-green-500 text-[9px] font-bold border-0"
                    >
                      {userDept.user.name || userDept.user.email}
                    </TooltipContent>
                  </Tooltip>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">No users assigned to this role</div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
