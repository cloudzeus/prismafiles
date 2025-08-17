import { getCurrentUser } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Users, TrendingUp, Plus, Edit, Trash2 } from "lucide-react"

export default async function CompanyStructurePage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/auth/signin")
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Company Structure</h1>
            <p className="text-gray-600 mt-2">
              Visualize and manage your organizational hierarchy
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Position
          </button>
        </div>

        {/* Company Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                  <p className="text-sm text-gray-600">Departments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                  <p className="text-sm text-gray-600">Employees</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">5</p>
                  <p className="text-sm text-gray-600">Levels</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                  <p className="text-sm text-gray-600">Locations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Organizational Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Organizational Hierarchy</CardTitle>
            <CardDescription>Current company structure and reporting relationships</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Level 1 - CEO */}
              <div className="flex justify-center">
                <div className="bg-blue-600 text-white px-6 py-3 rounded-lg text-center">
                  <h3 className="font-semibold">CEO</h3>
                  <p className="text-sm opacity-90">John Smith</p>
                  <p className="text-xs opacity-75">Chief Executive Officer</p>
                </div>
              </div>

              {/* Level 2 - Direct Reports */}
              <div className="flex justify-center">
                <div className="w-px h-8 bg-gray-300"></div>
              </div>

              <div className="flex justify-center gap-8">
                <div className="bg-green-600 text-white px-4 py-2 rounded-lg text-center">
                  <h4 className="font-medium">CTO</h4>
                  <p className="text-xs opacity-90">Sarah Johnson</p>
                </div>
                <div className="bg-green-600 text-white px-4 py-2 rounded-lg text-center">
                  <h4 className="font-medium">CFO</h4>
                  <p className="text-xs opacity-90">Mike Davis</p>
                </div>
                <div className="bg-green-600 text-white px-4 py-2 rounded-lg text-center">
                  <h4 className="font-medium">COO</h4>
                  <p className="text-xs opacity-90">Lisa Wilson</p>
                </div>
              </div>

              {/* Level 3 - Department Heads */}
              <div className="flex justify-center">
                <div className="w-px h-8 bg-gray-300"></div>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
                <div className="space-y-2">
                  <div className="bg-blue-500 text-white px-3 py-2 rounded text-center text-sm">
                    <p className="font-medium">Engineering</p>
                    <p className="text-xs opacity-90">Alex Chen</p>
                  </div>
                  <div className="bg-blue-500 text-white px-3 py-2 rounded text-center text-sm">
                    <p className="font-medium">Product</p>
                    <p className="text-xs opacity-90">Emma Brown</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="bg-green-500 text-white px-3 py-2 rounded text-center text-sm">
                    <p className="font-medium">Marketing</p>
                    <p className="text-xs opacity-90">David Lee</p>
                  </div>
                  <div className="bg-green-500 text-white px-3 py-2 rounded text-center text-sm">
                    <p className="font-medium">Sales</p>
                    <p className="text-xs opacity-90">Rachel Green</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="bg-purple-500 text-white px-3 py-2 rounded text-center text-sm">
                    <p className="font-medium">HR</p>
                    <p className="text-xs opacity-90">Tom Wilson</p>
                  </div>
                  <div className="bg-purple-500 text-white px-3 py-2 rounded text-center text-sm">
                    <p className="font-medium">Finance</p>
                    <p className="text-xs opacity-90">Anna Garcia</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                Engineering Team
              </CardTitle>
              <CardDescription>Software development and technical operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <span className="font-medium">Team Size</span>
                  <span className="text-blue-600 font-semibold">8 members</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="font-medium">Projects</span>
                  <span className="text-green-600 font-semibold">12 active</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                  <span className="font-medium">Technologies</span>
                  <span className="text-purple-600 font-semibold">8 stacks</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-green-600" />
                Marketing Team
              </CardTitle>
              <CardDescription>Brand management and customer acquisition</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <span className="font-medium">Team Size</span>
                  <span className="text-blue-600 font-semibold">5 members</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="font-medium">Campaigns</span>
                  <span className="text-green-600 font-semibold">6 active</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                  <span className="font-medium">Channels</span>
                  <span className="text-purple-600 font-semibold">4 platforms</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
