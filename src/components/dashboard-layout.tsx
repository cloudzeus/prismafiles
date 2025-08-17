"use client";
import { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "@/components/ui/sidebar";
import { Logo } from "@/components/ui/logo";
import UserDropdown from "@/components/user-dropdown";
import { motion } from "motion/react";
import { 
  IconDashboard, 
  IconUsers, 
  IconBuilding, 
  IconShield, 
  IconSettings,
  IconFileUpload,
  IconFolder,
  IconShieldCheck,
  IconKey
} from "@tabler/icons-react";
import { getCurrentUser } from "@/lib/auth-utils";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: any;
}

const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <IconDashboard className="h-5 w-5" />
  },
  {
    label: "User Management",
    href: "/user-management",
    icon: <IconUsers className="h-5 w-5" />
  },
  {
    label: "Users",
    href: "/users",
    icon: <IconBuilding className="h-5 w-5" />,
    subItems: [
      { label: "Departments", href: "/users/departments" },
      { label: "Department Roles", href: "/users/department-roles" },
      { label: "Company Structure", href: "/users/company-structure" }
    ]
  },
  {
    label: "Files",
    href: "/files",
    icon: <IconFolder className="h-5 w-5" />
  },
  {
    label: "Upload",
    href: "/upload",
    icon: <IconFileUpload className="h-5 w-5" />
  },
  {
    label: "GDPR Compliance",
    href: "/gdpr",
    icon: <IconShieldCheck className="h-5 w-5" />,
    subItems: [
      { label: "Data Processing", href: "/gdpr/data-processing" },
      { label: "Consent Management", href: "/gdpr/consent" },
      { label: "Data Subject Rights", href: "/gdpr/subject-rights" },
      { label: "Data Breach Log", href: "/gdpr/breach-log" },
      { label: "Compliance Reports", href: "/gdpr/reports" }
    ]
  },
  {
    label: "API Keys",
    href: "/api-keys",
    icon: <IconKey className="h-5 w-5" />,
    subItems: [
      { label: "Manage Keys", href: "/api-keys/manage" },
      { label: "Key Permissions", href: "/api-keys/permissions" },
      { label: "Usage Analytics", href: "/api-keys/analytics" },
      { label: "Rate Limits", href: "/api-keys/rate-limits" }
    ]
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <IconSettings className="h-5 w-5" />
  }
];

function SidebarContent({ user }: { user: any }) {
  const { open } = useSidebar();

  return (
    <>
      {/* Logo Section */}
      <div className="mb-8">
        <div className="flex items-center justify-center h-16">
          <Logo size={open ? "lg" : "md"} showText={open} />
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-3">
        {menuItems.map((item, index) => (
          <SidebarLink key={index} link={item} />
        ))}
      </nav>

      {/* User Section at Bottom */}
      <div className="mt-auto">
        <div className={cn(
          "flex items-center gap-3 px-3 py-3",
          open ? "justify-start" : "justify-center"
        )}>
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
            {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
          </div>
          {open && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="flex-1 min-w-0 overflow-hidden"
            >
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                {user?.role || "User"}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody>
          <SidebarContent user={user} />
        </SidebarBody>
      </Sidebar>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-0 ml-[50px]">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-neutral-200 dark:border-neutral-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  Dashboard
                </h1>
              </div>
              
              <UserDropdown user={user} />
            </div>
          </div>
        </header>

        {/* Page Content with 5% padding */}
        <main className="flex-1 pt-[2%] px-[5%] pb-[5%] overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
