import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Count existing companies
    const totalCompanies = await prisma.company.count()
    
    // Try to create a test company
    const testCompany = await prisma.company.create({
      data: {
        sodtype: 99, // Test type
        code: `TEST-${Date.now()}`,
        name: 'Test Company for Database Verification',
        afm: 'TEST123',
        concent: false
      }
    })
    
    // Delete the test company
    await prisma.company.delete({
      where: { id: testCompany.id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Database operations working correctly',
      details: {
        connection: 'OK',
        totalCompanies,
        testCreate: 'OK',
        testDelete: 'OK'
      }
    })
    
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Database test failed' 
      },
      { status: 500 }
    )
  }
}
