import { getCurrentUser } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, Building, User, Shield, Database, Key, Globe } from "lucide-react"
import Link from "next/link"

export default async function SettingsPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/signin')
  }

  const settingsGroups = [
            {
          title: "ERP Settings",
          description: "Configure ERP system connections and authentication",
          icon: <Database className="h-8 w-8 text-blue-600" />,
          href: "/settings/erp",
          features: ["Authentication", "API Configuration", "Sync Settings"]
        },
        {
          title: "User Settings",
          description: "Manage user accounts and permissions",
          icon: <User className="h-8 w-8 text-green-600" />,
          href: "/settings/users",
          features: ["Account Management", "Role Permissions", "Security"]
        },
        {
          title: "GDPR Settings",
          description: "Data protection and privacy compliance",
          icon: <Shield className="h-8 w-8 text-purple-600" />,
          href: "/settings/gdpr",
          features: ["Data Retention", "Privacy Policies", "Consent Management"]
        },
        {
          title: "System Settings",
          description: "General system configuration",
          icon: <Settings className="h-8 w-8 text-gray-600" />,
          href: "/settings/system",
          features: ["Database", "Cache", "Logging"]
        }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure system settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsGroups.map((group) => (
            <Card key={group.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {group.icon}
                  <div>
                    <CardTitle className="text-xl">{group.title}</CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-1">
                  {group.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={group.href}>
                  <Button className="w-full" variant="outline">
                    Configure {group.title}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
