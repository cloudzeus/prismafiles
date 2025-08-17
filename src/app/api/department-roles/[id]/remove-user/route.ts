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

    // Find and update the user department assignment
    const userDepartment = await prisma.userDepartment.findFirst({
      where: {
        userId,
        departmentId,
        jobPosition: role.name,
        leftAt: null
      }
    });

    if (!userDepartment) {
      return NextResponse.json(
        { success: false, error: 'User is not assigned to this role in this department' },
        { status: 404 }
      );
    }

    // Mark the user as left (soft delete)
    await prisma.userDepartment.update({
      where: { id: userDepartment.id },
      data: {
        leftAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      message: 'User removed from role successfully',
    });

  } catch (error) {
    console.error('Error removing user from role:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
