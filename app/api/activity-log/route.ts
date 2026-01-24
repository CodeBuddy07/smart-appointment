import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const payload = await verifyToken(token as string);

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
    const organizationId = new ObjectId(payload.userId as string);
    const activityLogCollection = await getCollection('activityLog');

    const logs = await activityLogCollection
      .find({
        organizationId,
      })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    const formattedLogs = logs.map(log => {
      const changes = log.changes && typeof log.changes === 'object' ? log.changes : {};
      
      const formattedLog: any = {
        _id: log._id.toString(),
        action: log.action,
        entityType: log.entityType,
        timestamp: log.timestamp,
        userId: log.userId?.toString(),
        changes,
      };

      if (log.entityId) {
        formattedLog.entityId = log.entityId.toString();
      }

      if (log.description) {
        formattedLog.description = log.description;
      } else {
        formattedLog.description = generateDescription(log);
      }

      return formattedLog;
    });

    return NextResponse.json({ 
      success: true,
      logs: formattedLogs 
    });
  } catch (error) {
    console.error('Get activity log error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateDescription(log: any): string {
  const { action, entityType, changes } = log;
  
  switch (entityType) {
    case 'appointment':
      if (changes.status) {
        return `Appointment status changed to ${changes.status}`;
      }
      if (action === 'created' || action === 'scheduled') {
        return `New appointment created`;
      }
      break;
      
    case 'queue':
      if (action === 'assigned' && changes.staffName) {
        return `Customer assigned to ${changes.staffName} from queue`;
      }
      if (action === 'called') {
        return `Customer called from queue`;
      }
      if (action === 'served') {
        return `Customer served`;
      }
      if (changes.position) {
        return `Queue position updated to ${changes.position}`;
      }
      break;
      
    case 'staff':
      if (changes.status) {
        return `Staff status changed to ${changes.status}`;
      }
      if (action === 'created') {
        return `New staff member added`;
      }
      break;
      
    case 'service':
      if (action === 'created') {
        return `New service created`;
      }
      break;
  }
  
  return `${action} ${entityType}`;
}

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

    const { action, entityType, entityId, changes } = await request.json();

    if (!action || !entityType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const activityLogCollection = await getCollection('activityLog');
    const result = await activityLogCollection.insertOne({
      organizationId: new ObjectId(payload.userId as string),
      userId: new ObjectId(payload.userId as string),
      action,
      entityType,
      entityId: entityId ? new ObjectId(entityId) : null,
      changes: changes || {},
      timestamp: new Date(),
    });

    return NextResponse.json(
      {
        log: {
          _id: result.insertedId,
          action,
          entityType,
          timestamp: new Date(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create activity log error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
