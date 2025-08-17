import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function PUT(
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

    const { id } = await params;
    const body = await request.json();
    const { name, description, level, isActive } = body;

    const updatedRole = await prisma.departmentRole.update({
      where: { id },
      data: {
        name,
        description,
        level: parseInt(level),
        isActive,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      role: updatedRole,
    });

  } catch (error) {
    console.error('Error updating department role:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { id } = await params;

    // Get the role to check its name and department
    const role = await prisma.departmentRole.findUnique({
      where: { id },
      select: { name: true, departmentId: true }
    });

    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Role not found' },
        { status: 404 }
      );
    }

    // Check if there are users assigned to this specific role
    const usersWithRole = await prisma.userDepartment.findMany({
      where: {
        departmentId: role.departmentId,
        jobPosition: role.name,
        leftAt: null // Only active assignments
      },
      select: {
        id: true,
        userId: true,
        jobPosition: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Log the users that will be detached (for audit purposes)
    if (usersWithRole.length > 0) {
      console.log(`Detaching ${usersWithRole.length} user(s) from role: ${role.name}`);
      usersWithRole.forEach(userDept => {
        console.log(`- User: ${userDept.user.name || userDept.user.email}, Role: ${userDept.jobPosition}`);
      });
    }

    // First, detach all users from this role by marking them as left
    if (usersWithRole.length > 0) {
      await prisma.userDepartment.updateMany({
        where: {
          departmentId: role.departmentId,
          jobPosition: role.name,
          leftAt: null
        },
        data: {
          leftAt: new Date()
        }
      });
    }

    // Delete the role
    await prisma.departmentRole.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Role deleted successfully. ${usersWithRole.length} user(s) have been detached from this role.`,
      detachedUsers: usersWithRole.length
    });

  } catch (error) {
    console.error('Error deleting department role:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
