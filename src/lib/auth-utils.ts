import { cookies } from "next/headers"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret")

export interface AuthUser {
  id: string
  email: string
  name?: string | null
  role: string
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string | null,
      role: payload.role as string
    }
  } catch (error) {
    return null
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error("Authentication required")
  }
  
  return user
}

export function hasRole(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    COLLABORATOR: 1,
    EMPLOYEE: 2,
    MANAGER: 3,
    ADMINISTRATOR: 4
  }

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0

  return userLevel >= requiredLevel
}

export function requireRole(userRole: string, requiredRole: string): boolean {
  if (!hasRole(userRole, requiredRole)) {
    throw new Error(`Role ${requiredRole} required`)
  }
  
  return true
}
