import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Create response and clear the auth cookie
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully"
    })
    
    // Clear the auth cookie by setting it to expire
    response.cookies.set("auth-token", "", {
      expires: new Date(0),
      path: "/"
    })
    
    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
