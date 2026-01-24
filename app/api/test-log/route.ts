import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { logActivity } from '@/lib/activity-logger';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const payload = await verifyToken(token as string);

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action, entityType, entityId, description } = await request.json();

    await logActivity({
      organizationId: payload.userId as string,
      userId: payload.userId as string,
      action: action || 'test',
      entityType: entityType || 'appointment',
      entityId: entityId,
      changes: {
        test: true,
        timestamp: new Date().toISOString(),
      },
      description: description || 'Test activity log entry',
    });

    return NextResponse.json({
      success: true,
      message: 'Test log created successfully',
    });
  } catch (error) {
    console.error('Test log error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}