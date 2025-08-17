import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all department roles
    const roles = await prisma.departmentRole.findMany({
      where: { isActive: true },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { department: { name: 'asc' } },
        { level: 'desc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      roles,
    });

  } catch (error) {
    console.error('Error fetching department roles:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
