import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get fresh user data from database
    const freshUser = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        phone: true,
        mobile: true,
        extension: true,
        address: true,
        city: true,
        zip: true,
        country: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!freshUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        ...freshUser,
        createdAt: freshUser.createdAt.toISOString(),
        updatedAt: freshUser.updatedAt.toISOString(),
      },
    });

  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
