"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function AddRoleButton() {
  const handleAddRole = () => {
    alert('Add role functionality coming soon!')
  }

  return (
    <Button 
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      onClick={handleAddRole}
    >
      <Plus className="h-4 w-4" />
      Add Role
    </Button>
  )
}
