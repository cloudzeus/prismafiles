import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, departmentId, level } = body;

    // Validate required fields
    if (!name || !departmentId) {
      return NextResponse.json(
        { success: false, error: 'Name and department ID are required' },
        { status: 400 }
      );
    }

    // Check if role name already exists in this department
    const existingRole = await prisma.departmentRole.findFirst({
      where: {
        name,
        departmentId,
        isActive: true
      }
    });

    if (existingRole) {
      return NextResponse.json(
        { success: false, error: 'Role with this name already exists in this department' },
        { status: 400 }
      );
    }

    // Create the new role
    const newRole = await prisma.departmentRole.create({
      data: {
        name,
        description: description || null,
        departmentId,
        level: level || 1,
        isActive: true,
      },
      include: {
        department: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      role: newRole,
    });

  } catch (error) {
    console.error('Error creating department role:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
