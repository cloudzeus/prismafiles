"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Shield, 
  Network, 
  Settings,
  ChevronDown,
  ChevronRight,
  FileText,
  UserCheck,
  Building,
  Cog,
  Home,
  Contact,
  FolderOpen,
  Share2,
  ClipboardList
} from "lucide-react"

interface SidebarProps {
  className?: string
}

interface MenuItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

interface MenuGroup {
  title: string
  items: MenuItem[]
  icon: React.ComponentType<{ className?: string }>
}

const menuGroups: MenuGroup[] = [
  {
    title: "Main",
    icon: Home,
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Files",
        href: "/files",
        icon: FolderOpen,
      },
      {
        title: "Shared Items",
        href: "/shared",
        icon: Share2,
      },
      {
        title: "My Profile",
        href: "/users/profile",
        icon: UserCheck,
      },
    ],
  },
  {
    title: "Users",
    icon: Users,
    items: [
      {
        title: "User Management",
        href: "/users",
        icon: Users,
      },
      {
        title: "Departments",
        href: "/users/departments",
        icon: Building,
      },
      {
        title: "Department Roles",
        href: "/users/department-roles",
        icon: Shield,
      },
      {
        title: "Company Structure",
        href: "/users/company-structure",
        icon: Network,
      },
    ],
  },
  {
    title: "Organization",
    icon: Building2,
    items: [
      {
        title: "Companies",
        href: "/companies",
        icon: Building2,
      },
      {
        title: "Contacts",
        href: "/contacts",
        icon: Users,
        badge: "New",
      },
    ],
  },
  {
    title: "System",
    icon: Settings,
    items: [
      {
        title: "Settings",
        href: "/settings",
        icon: Cog,
      },
      {
        title: "ERP Settings",
        href: "/settings/erp",
        icon: Settings,
      },
      {
        title: "GDPR Reports",
        href: "/gdpr-reports",
        icon: ClipboardList,
      },
      {
        title: "Redis Test",
        href: "/redis-test",
        icon: Cog,
      },
    ],
  },
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Users": true,
    "Organization": true,
    "System": true,
  })

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }))
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(href)
  }

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-1">
              {menuGroups.map((group) => (
                <div key={group.title} className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-between px-3 py-2 h-auto"
                    onClick={() => toggleGroup(group.title)}
                  >
                    <div className="flex items-center gap-2">
                      <group.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{group.title}</span>
                    </div>
                    {expandedGroups[group.title] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  
                  {expandedGroups[group.title] && (
                    <div className="ml-6 space-y-1">
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                            isActive(item.href)
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <span className="ml-auto rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
