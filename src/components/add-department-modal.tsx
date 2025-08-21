"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

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

interface AddDepartmentModalProps {
  isOpen: boolean
  onClose: () => void
  users: User[]
  departments: Department[]
  onDepartmentAdded: (department: Department) => void
}

export default function AddDepartmentModal({
  isOpen,
  onClose,
  users,
  departments,
  onDepartmentAdded
}: AddDepartmentModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    email: "",
    managerId: null as string | null,
    parentId: null as string | null
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert("Department name is required")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          email: formData.email.trim() || null,
          managerId: formData.managerId,
          parentId: formData.parentId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create department')
      }

      const newDepartment = await response.json()
      onDepartmentAdded(newDepartment.department)
      
      // Reset form and close modal
      setFormData({
        name: "",
        description: "",
        email: "",
        managerId: null,
        parentId: null
      })
      onClose()
    } catch (error) {
      console.error("Error creating department:", error)
      alert(error instanceof Error ? error.message : 'Failed to create department')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Department</DialogTitle>
          <DialogDescription>
            Create a new department to organize your team structure.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Department Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter department name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter department description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Department Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="department@company.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="managerId">Department Manager</Label>
            <div className="flex gap-2">
              <Select
                value={formData.managerId || ""}
                onValueChange={(value) => handleInputChange("managerId", value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a manager" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.managerId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleInputChange("managerId", null)}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentId">Parent Department</Label>
            <div className="flex gap-2">
              <Select
                value={formData.parentId || ""}
                onValueChange={(value) => handleInputChange("parentId", value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a parent department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.parentId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleInputChange("parentId", null)}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Department"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
