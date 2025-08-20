import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 Debug: Checking companies database...')
    
    // Get total count
    const totalCount = await prisma.company.count()
    console.log('📊 Total companies in database:', totalCount)
    
    // Get first 5 companies
    const companies = await prisma.company.findMany({
      take: 5,
      orderBy: { id: 'desc' }
    })
    
    console.log('📋 Sample companies:')
    companies.forEach((company, index) => {
      console.log(`   ${index + 1}. ID: ${company.id}, Name: "${company.name}", Code: "${company.code}", TRDR: ${company.trdr}`)
    })
    
    // Check if there are any companies with corrupted names
    const corruptedCompanies = await prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: 'ύ' } },
          { address: { contains: 'ύ' } },
          { city: { contains: 'ύ' } }
        ]
      },
      take: 3
    })
    
    console.log('⚠️ Companies with corrupted text:', corruptedCompanies.length)
    if (corruptedCompanies.length > 0) {
      corruptedCompanies.forEach((company, index) => {
        console.log(`   ${index + 1}. ID: ${company.id}, Name: "${company.name}"`)
      })
    }
    
    return NextResponse.json({
      success: true,
      totalCount,
      sampleCompanies: companies,
      corruptedCount: corruptedCompanies.length,
      corruptedCompanies
    })
    
  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Debug failed' 
      },
      { status: 500 }
    )
  }
}
