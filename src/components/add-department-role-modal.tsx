"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface Department {
  id: string
  name: string
  description: string | null
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
  }
}

interface AddDepartmentRoleModalProps {
  isOpen: boolean
  onClose: () => void
  departments: Department[]
  onRoleAdded: (role: DepartmentRole) => void
}

export default function AddDepartmentRoleModal({
  isOpen,
  onClose,
  departments,
  onRoleAdded
}: AddDepartmentRoleModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    departmentId: "",
    level: "1"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.departmentId) {
      alert("Role name and department are required")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/department-roles/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          departmentId: formData.departmentId,
          level: parseInt(formData.level),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create role')
      }

      const newRole = await response.json()
      onRoleAdded(newRole.role)
      
      // Reset form and close modal
      setFormData({
        name: "",
        description: "",
        departmentId: "",
        level: "1"
      })
      onClose()
    } catch (error) {
      console.error("Error creating role:", error)
      alert(error instanceof Error ? error.message : 'Failed to create role')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Department Role</DialogTitle>
          <DialogDescription>
            Create a new job position or role within a department.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Role Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Software Engineer, Marketing Specialist"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe the responsibilities and requirements for this role"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="departmentId">Department *</Label>
            <Select
              value={formData.departmentId}
              onValueChange={(value) => handleInputChange("departmentId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Seniority Level</Label>
            <Select
              value={formData.level}
              onValueChange={(value) => handleInputChange("level", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Junior</SelectItem>
                <SelectItem value="2">2 - Mid-level</SelectItem>
                <SelectItem value="3">3 - Senior</SelectItem>
                <SelectItem value="4">4 - Lead</SelectItem>
                <SelectItem value="5">5 - Manager</SelectItem>
              </SelectContent>
            </Select>
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
                "Create Role"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
