import { getCurrentUser } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import DepartmentsPageClient from "./departments-page-client"

export default async function DepartmentsPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/auth/signin")
  }

  return (
    <DashboardLayout user={user}>
      <DepartmentsPageClient />
    </DashboardLayout>
  )
}
