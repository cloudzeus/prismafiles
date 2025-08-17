import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch departments with their roles and user counts
    const departments = await prisma.department.findMany({
      include: {
        departmentRoles: {
          where: { isActive: true },
          orderBy: { level: 'desc' },
          include: {
            department: {
              include: {
                userDepartments: {
                  where: { leftAt: null },
                  include: {
                    user: {
                      select: { id: true, name: true, email: true, image: true }
                    }
                  }
                }
              }
            }
          }
        },
        userDepartments: {
          where: { leftAt: null }, // Only active users
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        },
        manager: {
          select: { name: true, email: true }
        },
        children: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      success: true,
      departments,
    });

  } catch (error) {
    console.error('Error fetching departments with roles:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
