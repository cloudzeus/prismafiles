"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/sidebar"
import { Logo } from "@/components/ui/logo"
import UserDropdown from "@/components/user-dropdown"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { AuthUser } from "@/lib/auth-utils"

interface AuthenticatedLayoutProps {
  children: React.ReactNode
  user: AuthUser
}

export function AuthenticatedLayout({ children, user }: AuthenticatedLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <Logo size="md" />
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Sidebar Content */}
          <Sidebar />
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Desktop Logo (hidden on mobile) */}
            <div className="hidden lg:block">
              <Logo size="md" />
            </div>

            {/* User Section */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden sm:block">
                Welcome, {user?.name || user?.email || 'User'}
              </span>
              <UserDropdown user={user} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="w-full p-5">
          {children}
        </main>
      </div>
    </div>
  )
}
