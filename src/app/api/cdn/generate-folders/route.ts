import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hasRole } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!hasRole(user.role, 'ADMINISTRATOR')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions. Only administrators can generate folders.' },
        { status: 403 }
      );
    }

    // Get all departments and users
    const [departments, users] = await Promise.all([
      prisma.department.findMany(),
      prisma.user.findMany()
    ]);

    if (departments.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No departments found. Please create departments first.' },
        { status: 400 }
      );
    }

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No users found.' },
        { status: 400 }
      );
    }

    const storageZone = process.env.BUNNY_STORAGE_ZONE || 'kolleris';
    const apiKey = process.env.BUNNY_ACCESS_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'BunnyCDN API key not configured' },
        { status: 500 }
      );
    }

    const results = {
      departments: [] as any[],
      users: [] as any[],
      errors: [] as string[]
    };

    // Generate department folders
    for (const department of departments) {
      try {
        const folderPath = `departments/${department.name}`;
        const apiUrl = `https://storage.bunnycdn.com/${storageZone}/${folderPath}`;
        
        // Check if folder already exists
        const checkResponse = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'AccessKey': apiKey,
            'Accept': 'application/json',
          },
        });

        if (checkResponse.status === 404) {
          // Create the folder
          const createResponse = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
              'AccessKey': apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ObjectName: folderPath,
              IsDirectory: true
            }),
          });

          if (createResponse.ok) {
            results.departments.push({
              name: department.name,
              path: folderPath,
              status: 'created'
            });
          } else {
            results.errors.push(`Failed to create department folder: ${department.name}`);
          }
        } else {
          results.departments.push({
            name: department.name,
            path: folderPath,
            status: 'already_exists'
          });
        }
      } catch (error) {
        results.errors.push(`Error creating department folder ${department.name}: ${error}`);
      }
    }

    // Generate user folders
    for (const user of users) {
      try {
        const folderPath = `users/${user.id}`;
        const apiUrl = `https://storage.bunnycdn.com/${storageZone}/${folderPath}`;
        
        // Check if folder already exists
        const checkResponse = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'AccessKey': apiKey,
            'Accept': 'application/json',
          },
        });

        if (checkResponse.status === 404) {
          // Create the folder
          const createResponse = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
              'AccessKey': apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ObjectName: folderPath,
              IsDirectory: true
            }),
          });

          if (createResponse.ok) {
            results.users.push({
              id: user.id,
              name: user.name || user.email,
              path: folderPath,
              status: 'created'
            });
          } else {
            results.errors.push(`Failed to create user folder: ${user.name || user.email}`);
          }
        } else {
          results.users.push({
            id: user.id,
            name: user.name || user.email,
            path: folderPath,
            status: 'already_exists'
          });
        }
      } catch (error) {
        results.errors.push(`Error creating user folder ${user.name || user.email}: ${error}`);
      }
    }

    // Create root folders if they don't exist
    const rootFolders = ['departments', 'users'];
    for (const rootFolder of rootFolders) {
      try {
        const apiUrl = `https://storage.bunnycdn.com/${storageZone}/${rootFolder}`;
        
        const checkResponse = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'AccessKey': apiKey,
            'Accept': 'application/json',
          },
        });

        if (checkResponse.status === 404) {
          const createResponse = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
              'AccessKey': apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ObjectName: rootFolder,
              IsDirectory: true
            }),
          });

          if (!createResponse.ok) {
            results.errors.push(`Failed to create root folder: ${rootFolder}`);
          }
        }
      } catch (error) {
        results.errors.push(`Error creating root folder ${rootFolder}: ${error}`);
      }
    }

    const success = results.errors.length === 0;
    const status = success ? 200 : (results.errors.length < results.departments.length + results.users.length ? 207 : 500);

    return NextResponse.json({
      success,
      message: success 
        ? 'All folders generated successfully' 
        : 'Folders generated with some errors',
      results,
      summary: {
        totalDepartments: departments.length,
        totalUsers: users.length,
        createdDepartments: results.departments.filter(d => d.status === 'created').length,
        createdUsers: results.users.filter(u => u.status === 'created').length,
        existingDepartments: results.departments.filter(d => d.status === 'already_exists').length,
        existingUsers: results.users.filter(u => u.status === 'already_exists').length,
        errors: results.errors.length
      }
    }, { status });

  } catch (error) {
    console.error('Error generating folders:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
