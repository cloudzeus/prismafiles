import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: roleId } = await params;
    const body = await request.json();
    const { userId, departmentId } = body;

    // Get the role to get the role name
    const role = await prisma.departmentRole.findUnique({
      where: { id: roleId },
      select: { name: true }
    });

    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Role not found' },
        { status: 404 }
      );
    }

    // Check if user is already assigned to this role in this department
    const existingAssignment = await prisma.userDepartment.findFirst({
      where: {
        userId,
        departmentId,
        jobPosition: role.name,
        leftAt: null
      }
    });

    if (existingAssignment) {
      return NextResponse.json(
        { success: false, error: 'User is already assigned to this role in this department' },
        { status: 400 }
      );
    }

    // Add user to the department with this role
    const userDepartment = await prisma.userDepartment.create({
      data: {
        userId,
        departmentId,
        jobPosition: role.name,
        isManager: false,
        joinedAt: new Date(),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      userDepartment,
    });

  } catch (error) {
    console.error('Error adding user to role:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
