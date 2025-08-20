import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { filePath } = body;

    if (!filePath) {
      return NextResponse.json(
        { success: false, error: 'File path is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.BUNNY_ACCESS_KEY;
    const storageZone = process.env.BUNNY_STORAGE_ZONE || 'kolleris';
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'BunnyCDN not configured' },
        { status: 500 }
      );
    }

    const deleteUrl = `https://storage.bunnycdn.com/${storageZone}/${filePath}`;
    
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'AccessKey': apiKey,
      }
    });

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'File deleted successfully',
        deletedPath: filePath
      });
    } else {
      console.error('BunnyCDN delete error:', response.status, response.statusText);
      return NextResponse.json(
        { success: false, error: 'Failed to delete file' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
