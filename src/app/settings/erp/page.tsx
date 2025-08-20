import { getCurrentUser } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { ERPSettingsForm } from "@/components/erp-settings-form"

export default async function ERPSettingsPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/signin')
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ERP Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure ERP system connections, authentication, and sync settings
          </p>
        </div>

        <ERPSettingsForm />
      </div>
    </DashboardLayout>
  )
}
