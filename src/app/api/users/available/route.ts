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

    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    const roleId = searchParams.get('roleId');

    if (!departmentId || !roleId) {
      return NextResponse.json(
        { success: false, error: 'Department ID and Role ID are required' },
        { status: 400 }
      );
    }

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

    // Get all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      orderBy: { name: 'asc' }
    });

    // Get users already assigned to this role in this department
    const assignedUsers = await prisma.userDepartment.findMany({
      where: {
        departmentId,
        jobPosition: role.name,
        leftAt: null
      },
      select: {
        userId: true
      }
    });

    const assignedUserIds = assignedUsers.map(ud => ud.userId);

    // Filter out already assigned users
    const availableUsers = allUsers.filter(user => !assignedUserIds.includes(user.id));

    return NextResponse.json({
      success: true,
      users: availableUsers,
    });

  } catch (error) {
    console.error('Error fetching available users:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
