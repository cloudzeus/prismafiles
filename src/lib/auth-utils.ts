import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { prisma } from "./prisma"

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret")

export interface AuthUser {
  id: string
  email: string
  name?: string | null
  role: string
  image?: string | null
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    // Ensure all required fields are present and valid
    if (!payload.id || !payload.email || !payload.role) {
      console.warn('Invalid JWT payload:', payload)
      return null
    }
    
    return {
      id: String(payload.id),
      email: String(payload.email),
      name: payload.name ? String(payload.name) : null,
      role: String(payload.role),
      image: payload.image ? String(payload.image) : null
    }
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
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
  // Ensure inputs are valid strings
  if (!userRole || !requiredRole || typeof userRole !== 'string' || typeof requiredRole !== 'string') {
    return false;
  }

  const roleHierarchy = {
    COLLABORATOR: 1,
    EMPLOYEE: 2,
    MANAGER: 3,
    ADMINISTRATOR: 4
  }

  const userLevel = roleHierarchy[userRole.toUpperCase() as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[requiredRole.toUpperCase() as keyof typeof roleHierarchy] || 0

  return userLevel >= requiredLevel
}

export function requireRole(userRole: string, requiredRole: string): boolean {
  // Ensure inputs are valid strings
  if (!userRole || !requiredRole || typeof userRole !== 'string' || typeof requiredRole !== 'string') {
    throw new Error(`Invalid role values: userRole=${userRole}, requiredRole=${requiredRole}`)
  }

  if (!hasRole(userRole, requiredRole)) {
    throw new Error(`Role ${requiredRole} required`)
  }
  
  return true
}

export async function getFreshUserData(userId: string) {
  try {
    // Ensure userId is valid
    if (!userId || typeof userId !== 'string') {
      console.warn('Invalid userId:', userId)
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Ensure user data is valid
    if (!user || !user.id || !user.email || !user.role) {
      console.warn('Invalid user data from database:', user)
      return null
    }

    return user
  } catch (error) {
    console.error('Error fetching fresh user data:', error)
    return null
  }
}
