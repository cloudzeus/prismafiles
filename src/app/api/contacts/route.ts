import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateContactData } from '@/types/business'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const includeCompanies = searchParams.get('includeCompanies') === 'true'

    const skip = (page - 1) * limit

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { title: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}

    // Get total count
    const total = await prisma.contact.count({ where })

    // Get contacts with optional company relationships
    const contacts = await prisma.contact.findMany({
      where,
      skip,
      take: limit,
      include: includeCompanies
        ? {
            companies: {
              include: {
                company: true,
              },
            },
          }
        : undefined,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateContactData = await request.json()

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Create contact
    const contact = await prisma.contact.create({
      data: {
        name: body.name,
        title: body.title,
        description: body.description,
        phone: body.phone,
        mobile: body.mobile,
        workPhone: body.workPhone,
        email: body.email,
        address: body.address,
        city: body.city,
        zip: body.zip,
        country: body.country,
      },
    })

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error('Error creating contact:', error)
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    )
  }
}

