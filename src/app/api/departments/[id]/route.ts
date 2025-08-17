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
    const { name, description, email, managerId, parentId } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Department name is required' },
        { status: 400 }
      );
    }

    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: { id }
    });

    if (!existingDepartment) {
      return NextResponse.json(
        { success: false, error: 'Department not found' },
        { status: 404 }
      );
    }

    // Check if name is already taken by another department
    if (name !== existingDepartment.name) {
      const nameExists = await prisma.department.findFirst({
        where: {
          name: name.trim(),
          id: { not: id }
        }
      });

      if (nameExists) {
        return NextResponse.json(
          { success: false, error: 'Department name already exists' },
          { status: 400 }
        );
      }
    }

    // Check if parent department exists (if specified)
    if (parentId && parentId !== existingDepartment.parentId) {
      const parentExists = await prisma.department.findUnique({
        where: { id: parentId }
      });

      if (!parentExists) {
        return NextResponse.json(
          { success: false, error: 'Parent department not found' },
          { status: 400 }
        );
      }

      // Prevent circular references
      if (parentId === id) {
        return NextResponse.json(
          { success: false, error: 'Department cannot be its own parent' },
          { status: 400 }
        );
      }
    }

    // Check if manager exists (if specified)
    if (managerId && managerId !== existingDepartment.managerId) {
      const managerExists = await prisma.user.findUnique({
        where: { id: managerId }
      });

      if (!managerExists) {
        return NextResponse.json(
          { success: false, error: 'Manager not found' },
          { status: 400 }
        );
      }
    }

    // Update the department
    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        email: email?.trim() || null,
        managerId: managerId || null,
        parentId: parentId || null,
        updatedAt: new Date()
      },
      include: {
        userDepartments: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        },
        departmentRoles: true,
        manager: {
          select: {
            name: true,
            email: true,
          }
        },
        children: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Department updated successfully',
      department: updatedDepartment
    });

  } catch (error) {
    console.error('Error updating department:', error);
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

    // Check if department exists
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        userDepartments: {
          where: { leftAt: null },
          select: { id: true, jobPosition: true }
        },
        departmentRoles: {
          select: { id: true, name: true }
        }
      }
    });

    if (!department) {
      return NextResponse.json(
        { success: false, error: 'Department not found' },
        { status: 404 }
      );
    }

    // Get all active users in this department (for logging purposes)
    const activeUsers = await prisma.userDepartment.findMany({
      where: {
        departmentId: id,
        leftAt: null
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
    if (activeUsers.length > 0) {
      console.log(`Detaching ${activeUsers.length} user(s) from department: ${department.name}`);
      activeUsers.forEach(userDept => {
        console.log(`- User: ${userDept.user.name || userDept.user.email}, Role: ${userDept.jobPosition}`);
      });
    }

    // First, detach all users from this department by marking them as left
    if (activeUsers.length > 0) {
      await prisma.userDepartment.updateMany({
        where: {
          departmentId: id,
          leftAt: null
        },
        data: {
          leftAt: new Date()
        }
      });
    }

    // Delete all department roles
    if (department.departmentRoles.length > 0) {
      await prisma.departmentRole.deleteMany({
        where: { departmentId: id }
      });
    }

    // Delete the department
    await prisma.department.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: `Department deleted successfully. ${activeUsers.length} user(s) have been detached from this department.`,
      detachedUsers: activeUsers.length
    });

  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
