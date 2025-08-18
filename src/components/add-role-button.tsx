"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import AddDepartmentRoleModal from "./add-department-role-modal"

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

interface AddRoleButtonProps {
  departments?: Department[]
  onRoleAdded?: (role: DepartmentRole) => void
}

export default function AddRoleButton({ departments = [], onRoleAdded }: AddRoleButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleRoleAdded = (role: DepartmentRole) => {
    if (onRoleAdded) {
      onRoleAdded(role)
    }
    setIsModalOpen(false)
  }

  return (
    <>
      <Button 
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        onClick={() => setIsModalOpen(true)}
      >
        <Plus className="h-4 w-4" />
        Add Role
      </Button>

      <AddDepartmentRoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        departments={departments}
        onRoleAdded={handleRoleAdded}
      />
    </>
  )
}
