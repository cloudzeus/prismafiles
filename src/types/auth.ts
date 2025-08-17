export type UserRole = "ADMINISTRATOR" | "MANAGER" | "EMPLOYEE" | "COLLABORATOR"

export interface User {
  id: string
  email: string
  name?: string | null
  role: UserRole
  image?: string | null
  emailVerified?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Session {
  user: User
  expires: string
}

export interface AuthUser {
  id: string
  email: string
  name?: string | null
  role: UserRole
  image?: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name?: string
  role?: UserRole
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetData {
  token: string
  password: string
}
