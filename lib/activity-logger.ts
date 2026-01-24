import { getCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';

interface LogActivityParams {
  organizationId: string | ObjectId;
  userId: string | ObjectId;
  action: string;
  entityType: 'appointment' | 'staff' | 'service' | 'queue' | 'user';
  entityId?: string | ObjectId;
  changes?: Record<string, unknown>;
  description?: string;
}

export async function logActivity({
  organizationId,
  userId,
  action,
  entityType,
  entityId,
  changes = {},
  description
}: LogActivityParams) {
  try {
    const activityLogCollection = await getCollection('activityLog');
    
    const logData = {
      organizationId: new ObjectId(organizationId),
      userId: new ObjectId(userId),
      action,
      entityType,
      entityId: entityId ? new ObjectId(entityId) : null,
      changes,
      description: description || generateDefaultDescription(action, entityType, changes),
      timestamp: new Date(),
    };

    await activityLogCollection.insertOne(logData);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Activity logged:', logData);
    }
    
    return logData;
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

function generateDefaultDescription(action: string, entityType: string, changes: Record<string, unknown>): string {
  const entityMap: Record<string, string> = {
    appointment: 'Appointment',
    staff: 'Staff member',
    service: 'Service',
    queue: 'Queue entry',
    user: 'User',
  };

  const actionMap: Record<string, string> = {
    created: 'created',
    updated: 'updated',
    deleted: 'deleted',
    scheduled: 'scheduled',
    completed: 'completed',
    cancelled: 'cancelled',
    'no_show': 'marked as no show',
    assigned: 'assigned',
    moved: 'moved',
    served: 'served',
    'in-progress': 'started',
  };

  const entityName = entityMap[entityType] || entityType;
  const actionText = actionMap[action] || action;

  if (changes.customerName) {
    return `${entityName} for ${changes.customerName} was ${actionText}`;
  }

  if (changes.staffName) {
    return `${entityName} assigned to ${changes.staffName} was ${actionText}`;
  }

  if (changes.name) {
    return `${entityName} "${changes.name}" was ${actionText}`;
  }

  return `${entityName} was ${actionText}`;
}