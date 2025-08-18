"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Star, Loader2 } from "lucide-react"

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
}

interface EditDepartmentRoleModalProps {
  isOpen: boolean
  onClose: () => void
  role: DepartmentRole | null
  onRoleUpdated: (updatedRole: DepartmentRole) => void
}

export default function EditDepartmentRoleModal({
  isOpen,
  onClose,
  role,
  onRoleUpdated
}: EditDepartmentRoleModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    level: 1,
    isActive: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || "",
        description: role.description || "",
        level: role.level || 1,
        isActive: role.isActive
      })
      setErrors({})
    }
  }, [role])

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Role name is required"
    }
    
    if (formData.level < 1 || formData.level > 5) {
      newErrors.level = "Level must be between 1 and 5"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !role) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/department-roles/${role.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          level: formData.level,
          isActive: formData.isActive,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update role')
      }

      const updatedRole = await response.json()
      onRoleUpdated(updatedRole.role)
      onClose()
    } catch (error) {
      console.error("Error updating role:", error)
      alert(error instanceof Error ? error.message : 'Failed to update role')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 1: return 'Junior'
      case 2: return 'Mid'
      case 3: return 'Senior'
      case 4: return 'Lead'
      case 5: return 'Manager'
      default: return 'Unknown'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            Edit Department Role
          </DialogTitle>
          <DialogDescription>
            Update the role information. All changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Role Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter role name"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter role description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Level *</Label>
            <Select value={formData.level.toString()} onValueChange={(value) => handleInputChange("level", parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a level" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((level) => (
                  <SelectItem key={level} value={level.toString()}>
                    <div className="flex items-center gap-2">
                      <span>{getLevelLabel(level)}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: level }, (_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.level && <p className="text-sm text-red-500">{errors.level}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange("isActive", checked)}
            />
            <Label htmlFor="isActive">Active Role</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Role"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
