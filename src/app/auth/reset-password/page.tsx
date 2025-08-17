import { Suspense } from "react"
import { GradientBackground } from "@/components/ui/gradient-background"
import { Logo } from "@/components/ui/logo"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export default function ResetPasswordPage() {
  return (
    <GradientBackground variant="elegant">
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Title */}
          <div className="text-center">
            <Logo size="lg" className="mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900">
              Set new password
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your new password to complete the reset
            </p>
          </div>
          
          {/* Form - remains white */}
          <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
            <Suspense fallback={<div>Loading...</div>}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
    </GradientBackground>
  )
}
