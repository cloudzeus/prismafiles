import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hasRole } from '@/lib/auth-utils';
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

    // Only administrators and managers can generate reports
    if (!hasRole(user.role, 'ADMINISTRATOR') && !hasRole(user.role, 'MANAGER')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reportType, startDate, endDate } = body;

    if (!reportType || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Report type, start date, and end date are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Generate comprehensive GDPR compliance report
    const reportData = await generateGdprReport(start, end);

    // Store the report
    const report = await prisma.gdprReport.create({
      data: {
        reportType,
        startDate: start,
        endDate: end,
        generatedBy: user.id,
        reportData,
        status: 'completed'
      }
    });

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        reportType,
        startDate: start,
        endDate: end,
        generatedAt: report.generatedAt,
        data: reportData
      }
    });

  } catch (error) {
    console.error('Error generating GDPR report:', error);
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

    // Only administrators and managers can view reports
    if (!hasRole(user.role, 'ADMINISTRATOR') && !hasRole(user.role, 'MANAGER')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const reportType = searchParams.get('type');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (reportType) {
      where.reportType = reportType;
    }

    // Get reports with pagination
    const [reports, total] = await Promise.all([
      prisma.gdprReport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { generatedAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      }),
      prisma.gdprReport.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching GDPR reports:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateGdprReport(startDate: Date, endDate: Date) {
  // Get sharing attempts in the date range
  const sharingAttempts = await prisma.sharingAttempt.findMany({
    where: {
      attemptDate: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      user: {
        select: { name: true, email: true, role: true }
      },
      fileScanResult: true
    }
  });

  // Get file scan results in the date range
  const fileScans = await prisma.fileScanResult.findMany({
    where: {
      scanDate: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  // Calculate statistics
  const totalSharingAttempts = sharingAttempts.length;
  const blockedAttempts = sharingAttempts.filter(a => !a.gdprCompliant).length;
  const successfulAttempts = sharingAttempts.filter(a => a.gdprCompliant).length;
  const filesWithPersonalData = fileScans.filter(f => f.hasPersonalData).length;
  const criticalRiskFiles = fileScans.filter(f => f.riskLevel === 'critical').length;

  // Group by user
  const userStats = sharingAttempts.reduce((acc, attempt) => {
    const userId = attempt.userId;
    if (!acc[userId]) {
      acc[userId] = {
        userId,
        userName: attempt.user.name || attempt.user.email,
        userEmail: attempt.user.email,
        userRole: attempt.user.role,
        totalAttempts: 0,
        blockedAttempts: 0,
        successfulAttempts: 0,
        scanRequired: 0,
        scanCompleted: 0
      };
    }

    acc[userId].totalAttempts++;
    if (!attempt.gdprCompliant) {
      acc[userId].blockedAttempts++;
    } else {
      acc[userId].successfulAttempts++;
    }
    if (attempt.scanRequired) acc[userId].scanRequired++;
    if (attempt.scanCompleted) acc[userId].scanCompleted++;

    return acc;
  }, {} as Record<string, any>);

  // Group by risk level
  const riskLevelStats = fileScans.reduce((acc, scan) => {
    const level = scan.riskLevel;
    if (!acc[level]) {
      acc[level] = { count: 0, files: [] };
    }
    acc[level].count++;
    acc[level].files.push({
      path: scan.filePath,
      name: scan.fileName,
      scanDate: scan.scanDate
    });
    return acc;
  }, {} as Record<string, any>);

  // Group by personal data type
  const personalDataTypeStats = fileScans.reduce((acc, scan) => {
    if (scan.hasPersonalData && scan.personalDataTypes) {
      try {
        const types = JSON.parse(scan.personalDataTypes);
        types.forEach((type: string) => {
          if (!acc[type]) {
            acc[type] = { count: 0, files: [] };
          }
          acc[type].count++;
          acc[type].files.push({
            path: scan.filePath,
            name: scan.fileName,
            riskLevel: scan.riskLevel
          });
        });
      } catch (e) {
        console.error('Error parsing personal data types:', e);
      }
    }
    return acc;
  }, {} as Record<string, any>);

  // Top blocked files
  const topBlockedFiles = sharingAttempts
    .filter(a => !a.gdprCompliant)
    .reduce((acc, attempt) => {
      const key = attempt.itemPath;
      if (!acc[key]) {
        acc[key] = {
          path: attempt.itemPath,
          name: attempt.itemName,
          type: attempt.itemType,
          blockedCount: 0,
          reasons: new Set()
        };
      }
      acc[key].blockedCount++;
      if (attempt.blockedReason) {
        acc[key].reasons.add(attempt.blockedReason);
      }
      return acc;
    }, {} as Record<string, any>);

  // Convert reasons from Set to Array
  Object.values(topBlockedFiles).forEach((file: any) => {
    file.reasons = Array.from(file.reasons);
  });

  // Sort by blocked count
  const sortedBlockedFiles = Object.values(topBlockedFiles)
    .sort((a: any, b: any) => b.blockedCount - a.blockedCount)
    .slice(0, 10);

  return {
    summary: {
      period: {
        start: startDate,
        end: endDate
      },
      totalSharingAttempts,
      blockedAttempts,
      successfulAttempts,
      complianceRate: totalSharingAttempts > 0 ? ((successfulAttempts / totalSharingAttempts) * 100).toFixed(2) : '0.00',
      filesWithPersonalData,
      criticalRiskFiles
    },
    userStatistics: Object.values(userStats),
    riskLevelBreakdown: riskLevelStats,
    personalDataTypeBreakdown: personalDataTypeStats,
    topBlockedFiles: sortedBlockedFiles,
    detailedSharingAttempts: sharingAttempts.map(attempt => ({
      id: attempt.id,
      userId: attempt.userId,
      userName: attempt.user.name || attempt.user.email,
      userEmail: attempt.user.email,
      itemPath: attempt.itemPath,
      itemName: attempt.itemName,
      itemType: attempt.itemType,
      sharingType: attempt.sharingType,
      targetId: attempt.targetId,
      targetType: attempt.targetType,
      gdprCompliant: attempt.gdprCompliant,
      blockedReason: attempt.blockedReason,
      attemptDate: attempt.attemptDate,
      scanRequired: attempt.scanRequired,
      scanCompleted: attempt.scanCompleted,
      userAcknowledged: attempt.userAcknowledged,
      userJustification: attempt.userJustification,
      ipAddress: attempt.ipAddress,
      userAgent: attempt.userAgent
    })),
    fileScanResults: fileScans.map(scan => ({
      id: scan.id,
      filePath: scan.filePath,
      fileName: scan.fileName,
      scanDate: scan.scanDate,
      hasPersonalData: scan.hasPersonalData,
      personalDataTypes: scan.personalDataTypes ? JSON.parse(scan.personalDataTypes) : [],
      riskLevel: scan.riskLevel,
      fileType: scan.fileType,
      fileSize: scan.fileSize,
      scanDuration: scan.scanDuration,
      scanErrors: scan.scanErrors
    }))
  };
}
