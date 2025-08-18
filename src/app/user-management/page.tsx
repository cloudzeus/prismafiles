import { getCurrentUser } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { prisma } from "@/lib/prisma"
import UserManagementWrapper from "@/components/user-management-wrapper"

export default async function UserManagementPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/auth/signin")
  }

  // Fetch real statistics from the database
  let userCount = 0, departmentCount = 0, roleCount = 0, activeMemberships = 0;
  
  try {
    [userCount, departmentCount, roleCount, activeMemberships] = await Promise.all([
      prisma.user.count(),
      prisma.department.count(),
      prisma.departmentRole.count({ where: { isActive: true } }),
      prisma.userDepartment.count({ where: { leftAt: null } })
    ]);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    // Keep default values of 0 if there's an error
  }

  return (
    <DashboardLayout user={user}>
      <UserManagementWrapper
        initialUserCount={userCount}
        initialDepartmentCount={departmentCount}
        initialRoleCount={roleCount}
        initialActiveMemberships={activeMemberships}
      />
    </DashboardLayout>
  )
}
