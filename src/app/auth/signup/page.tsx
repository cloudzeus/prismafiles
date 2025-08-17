import { GradientBackground } from "@/components/ui/gradient-background"
import { Logo } from "@/components/ui/logo"
import { RegisterForm } from "@/components/auth/register-form"

export default function SignUpPage() {
  return (
    <GradientBackground variant="elegant">
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Title */}
          <div className="text-center">
            <Logo size="lg" className="mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Join G-FILES today
            </p>
          </div>
          
          {/* Form - remains white */}
          <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
            <RegisterForm />
          </div>
        </div>
      </div>
    </GradientBackground>
  )
}
