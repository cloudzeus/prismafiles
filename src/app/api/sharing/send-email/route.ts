import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

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
    const { sharedItemId, contactId } = body;

    if (!sharedItemId || !contactId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the shared item and contact details
    const sharedItem = await prisma.sharedItem.findUnique({
      where: { id: sharedItemId },
      include: {
        sharedByUser: {
          select: { name: true, email: true }
        },
        sharedWithContact: {
          select: { name: true, email: true }
        }
      }
    });

    if (!sharedItem) {
      return NextResponse.json(
        { success: false, error: 'Shared item not found' },
        { status: 404 }
      );
    }

    if (sharedItem.sharedBy !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to send email for this shared item' },
        { status: 403 }
      );
    }

    if (sharedItem.sharingType !== 'contact' || !sharedItem.shareLink) {
      return NextResponse.json(
        { success: false, error: 'Invalid sharing type or missing share link' },
        { status: 400 }
      );
    }

    const contact = sharedItem.sharedWithContact;
    if (!contact || !contact.email) {
      return NextResponse.json(
        { success: false, error: 'Contact email not found' },
        { status: 404 }
      );
    }

    // Configure SMTP transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Create sharing link
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/shared/${sharedItem.shareLink}`;

    // Email content
    const emailSubject = `${user.name || user.email} has shared "${sharedItem.itemName}" with you`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>File/Folder Shared</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef; }
          .button { display: inline-block; padding: 12px 24px; background: #007bff; color: #fff; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 14px; color: #6c757d; }
          .permissions { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📁 File/Folder Shared</h2>
          </div>
          
          <div class="content">
            <p>Hello ${contact.name || 'there'},</p>
            
            <p><strong>${user.name || user.email}</strong> has shared the following item with you:</p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <h3 style="margin: 0 0 10px 0;">${sharedItem.itemName}</h3>
              <p style="margin: 0; color: #6c757d;">
                Type: ${sharedItem.itemType === 'file' ? 'File' : 'Folder'}<br>
                Shared: ${new Date(sharedItem.sharedAt).toLocaleDateString()}
                ${sharedItem.expiresAt ? `<br>Expires: ${new Date(sharedItem.expiresAt).toLocaleDateString()}` : ''}
              </p>
            </div>
            
            ${sharedItem.description ? `<p><strong>Description:</strong> ${sharedItem.description}</p>` : ''}
            
            <div class="permissions">
              <h4 style="margin: 0 0 10px 0;">Permissions:</h4>
              <ul style="margin: 0; padding-left: 20px;">
                <li>View: ${sharedItem.canView ? '✅' : '❌'}</li>
                <li>Download: ${sharedItem.canDownload ? '✅' : '❌'}</li>
                <li>Edit: ${sharedItem.canEdit ? '✅' : '❌'}</li>
                <li>Delete: ${sharedItem.canDelete ? '✅' : '❌'}</li>
              </ul>
            </div>
            
            <a href="${shareUrl}" class="button">Access Shared Item</a>
            
            <p style="margin-top: 20px; font-size: 14px; color: #6c757d;">
              If the button doesn't work, you can copy and paste this link into your browser:<br>
              <a href="${shareUrl}" style="color: #007bff;">${shareUrl}</a>
            </p>
          </div>
          
          <div class="footer">
            <p>This is an automated message from PrismaFiles. Please do not reply to this email.</p>
            <p>If you have any questions, please contact ${user.name || user.email} directly.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
File/Folder Shared

Hello ${contact.name || 'there'},

${user.name || user.email} has shared the following item with you:

${sharedItem.itemName}
Type: ${sharedItem.itemType === 'file' ? 'File' : 'Folder'}
Shared: ${new Date(sharedItem.sharedAt).toLocaleDateString()}
${sharedItem.expiresAt ? `Expires: ${new Date(sharedItem.expiresAt).toLocaleDateString()}` : ''}

${sharedItem.description ? `Description: ${sharedItem.description}` : ''}

Permissions:
- View: ${sharedItem.canView ? 'Yes' : 'No'}
- Download: ${sharedItem.canDownload ? 'Yes' : 'No'}
- Edit: ${sharedItem.canEdit ? 'Yes' : 'No'}
- Delete: ${sharedItem.canDelete ? 'Yes' : 'No'}

Access the shared item at: ${shareUrl}

This is an automated message from PrismaFiles. Please do not reply to this email.
If you have any questions, please contact ${user.name || user.email} directly.
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@prismafiles.com',
      to: contact.email,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      message: 'Sharing email sent successfully',
      shareUrl
    });

  } catch (error) {
    console.error('Error sending sharing email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
