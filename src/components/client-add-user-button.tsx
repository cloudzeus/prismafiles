"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import AddUserModal from "./add-user-modal"

interface ClientAddUserButtonProps {
  onUserCreated?: () => void
}

export default function ClientAddUserButton({ onUserCreated }: ClientAddUserButtonProps) {
  const [open, setOpen] = useState(false)
  
  const handleUserCreated = () => {
    setOpen(false)
    onUserCreated?.()
  }
  
  return (
    <>
      <button 
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2" 
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" />
        Add User
      </button>
      <AddUserModal 
        isOpen={open} 
        onClose={() => setOpen(false)} 
        onCreated={handleUserCreated} 
      />
    </>
  )
}
