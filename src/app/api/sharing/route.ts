import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { gdprScanner } from '@/lib/gdpr-scanner';

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
    const {
      itemPath,
      itemName,
      itemType,
      sharingType,
      sharedWithUserId,
      sharedWithContactId,
      expiresAt,
      shareLinkExpiresAt,
      canView = true,
      canDownload = true,
      canEdit = false,
      canDelete = false,
      description,
      userJustification,
      userAcknowledged
    } = body;

    // Validate required fields
    if (!itemPath || !itemName || !itemType || !sharingType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate sharing type
    if (!['user', 'contact'].includes(sharingType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid sharing type' },
        { status: 400 }
      );
    }

    // Validate target based on sharing type
    if (sharingType === 'user' && !sharedWithUserId) {
      return NextResponse.json(
        { success: false, error: 'User ID required for user sharing' },
        { status: 400 }
      );
    }

    if (sharingType === 'contact' && !sharedWithContactId) {
      return NextResponse.json(
        { success: false, error: 'Contact ID required for contact sharing' },
        { status: 400 }
      );
    }

    // Check if user exists (for user sharing)
    if (sharingType === 'user') {
      const targetUser = await prisma.user.findUnique({
        where: { id: sharedWithUserId }
      });
      if (!targetUser) {
        return NextResponse.json(
          { success: false, error: 'Target user not found' },
          { status: 404 }
        );
      }
    }

    // Check if contact exists (for contact sharing)
    if (sharingType === 'contact') {
      const targetContact = await prisma.contact.findUnique({
        where: { id: sharedWithContactId }
      });
      if (!targetContact) {
        return NextResponse.json(
          { success: false, error: 'Target contact not found' },
          { status: 404 }
        );
      }
    }

    // GDPR Compliance Check for files
    let gdprCompliant = true;
    let blockedReason = null;
    let fileScanResultId = null;
    let scanRequired = false;
    let scanCompleted = false;

    if (itemType === 'file') {
      // Check if file has been scanned recently
      const existingScan = await prisma.fileScanResult.findFirst({
        where: {
          filePath: itemPath,
          scanDate: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        orderBy: { scanDate: 'desc' }
      });

      if (existingScan) {
        fileScanResultId = existingScan.id;
        scanCompleted = true;
        
        if (existingScan.hasPersonalData) {
          gdprCompliant = false;
          blockedReason = `File contains personal data (${existingScan.riskLevel} risk level). Detected: ${existingScan.personalDataTypes}`;
        }
      } else {
        // File needs to be scanned
        scanRequired = true;
        
        // For now, we'll block sharing until scan is completed
        // In a production system, you might want to scan the file here
        gdprCompliant = false;
        blockedReason = 'File requires GDPR compliance scan before sharing';
      }
    }

    // If GDPR compliance check failed and user hasn't acknowledged, block sharing
    if (!gdprCompliant && !userAcknowledged) {
      // Record the blocked sharing attempt
      await prisma.sharingAttempt.create({
        data: {
          userId: user.id,
          itemPath,
          itemName,
          itemType,
          sharingType,
          targetId: sharingType === 'user' ? sharedWithUserId : sharedWithContactId.toString(),
          targetType: sharingType,
          gdprCompliant: false,
          blockedReason,
          scanRequired,
          scanCompleted,
          userAcknowledged: false,
          userJustification: userJustification || null,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
          userAgent: request.headers.get('user-agent') || null
        }
      });

      return NextResponse.json({
        success: false,
        error: 'GDPR compliance check failed',
        gdprCompliant: false,
        blockedReason,
        scanRequired,
        requiresAcknowledgment: true
      }, { status: 403 });
    }

    // Generate unique share link for contact sharing
    let shareLink = null;
    if (sharingType === 'contact') {
      shareLink = `share_${randomBytes(16).toString('hex')}`;
    }

    // Create the shared item
    const sharedItem = await prisma.sharedItem.create({
      data: {
        itemPath,
        itemName,
        itemType,
        sharedBy: user.id,
        sharingType,
        sharedWithUserId: sharingType === 'user' ? sharedWithUserId : null,
        sharedWithContactId: sharingType === 'contact' ? sharedWithContactId : null,
        shareLink,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        shareLinkExpiresAt: shareLinkExpiresAt ? new Date(shareLinkExpiresAt) : null,
        canView,
        canDownload,
        canEdit,
        canDelete,
        description
      }
    });

    // Record successful sharing attempt
    await prisma.sharingAttempt.create({
      data: {
        userId: user.id,
        itemPath,
        itemName,
        itemType,
        sharingType,
        targetId: sharingType === 'user' ? sharedWithUserId : sharedWithContactId.toString(),
        targetType: sharingType,
        gdprCompliant: true,
        blockedReason: null,
        scanRequired,
        scanCompleted,
        userAcknowledged: userAcknowledged || false,
        userJustification: userJustification || null,
        fileScanResultId,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        userAgent: request.headers.get('user-agent') || null
      }
    });

    // If sharing with a user, create their shared folder
    if (sharingType === 'user') {
      await prisma.userSharedFolder.upsert({
        where: {
          userId_folderPath: {
            userId: sharedWithUserId,
            folderPath: itemPath
          }
        },
        update: {},
        create: {
          userId: sharedWithUserId,
          folderPath: itemPath,
          folderName: itemName
        }
      });
    }

    return NextResponse.json({
      success: true,
      sharedItem,
      shareLink: sharingType === 'contact' ? shareLink : null
    });

  } catch (error) {
    console.error('Error creating shared item:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const type = searchParams.get('type'); // 'shared-by-me' or 'shared-with-me'

    if (!type || !['shared-by-me', 'shared-with-me'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid type parameter' },
        { status: 400 }
      );
    }

    let sharedItems;
    if (type === 'shared-by-me') {
      sharedItems = await prisma.sharedItem.findMany({
        where: {
          sharedBy: user.id,
          isActive: true
        },
        include: {
          sharedWithUser: {
            select: { id: true, name: true, email: true }
          },
          sharedWithContact: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { sharedAt: 'desc' }
      });
    } else {
      sharedItems = await prisma.sharedItem.findMany({
        where: {
          sharedWithUserId: user.id,
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        include: {
          sharedByUser: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { sharedAt: 'desc' }
      });
    }

    return NextResponse.json({
      success: true,
      sharedItems
    });

  } catch (error) {
    console.error('Error fetching shared items:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
