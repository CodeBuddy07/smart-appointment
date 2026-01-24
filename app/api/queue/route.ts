import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { logActivity } from '@/lib/activity-logger';

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

    const organizationId = new ObjectId(payload.userId as string);
    const queueCollection = await getCollection('queue');
    const servicesCollection = await getCollection('services');
    const usersCollection = await getCollection('users');

    const queue = await queueCollection
      .find({ organizationId })
      .sort({ position: 1 })
      .toArray();

    const enrichedQueue = await Promise.all(
      queue.map(async (entry) => {
        const [service, customer] = await Promise.all([
          servicesCollection.findOne({ _id: entry.serviceId }),
          usersCollection.findOne({ _id: entry.customerId }),
        ]);

        return {
          _id: entry._id.toString(),
          customerId: entry.customerId.toString(),
          customerName: customer?.name || 'Unknown Customer',
          serviceId: entry.serviceId.toString(),
          serviceName: service?.name,
          serviceType: service?.requiredStaffType,
          position: entry.position,
          status: entry.status,
          checkinTime: entry.checkinTime,
          estimatedWaitTime: entry.estimatedWaitTime,
          appointmentTime: entry.appointmentTime,
          notes: entry.notes,
        };
      })
    );

    return NextResponse.json({
      success: true,
      queue: enrichedQueue
    });
  } catch (error) {
    console.error('Get queue error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
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

    const { customerName, serviceId, estimatedWaitTime, appointmentTime, notes } = await request.json();

    if (!customerName || !serviceId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const organizationId = new ObjectId(payload.userId as string);
    const queueCollection = await getCollection('queue');
    const usersCollection = await getCollection('users');
    const servicesCollection = await getCollection('services');

    let customer = await usersCollection.findOne({ 
      name: customerName.trim(),
      role: 'customer'
    });

    if (!customer) {
      const result = await usersCollection.insertOne({
        email: `${customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        name: customerName.trim(),
        role: 'customer',
        password: 'temp_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      customer = await usersCollection.findOne({ _id: result.insertedId });
    }

    const service = await servicesCollection.findOne({ _id: new ObjectId(serviceId) });

    const lastInQueue = await queueCollection
      .findOne({ organizationId }, { sort: { position: -1 } });
    const nextPosition = (lastInQueue?.position || 0) + 1;

    const result = await queueCollection.insertOne({
      organizationId,
      serviceId: new ObjectId(serviceId),
      customerId: customer!._id,
      position: nextPosition,
      status: 'waiting',
      checkinTime: new Date(),
      estimatedWaitTime: estimatedWaitTime || 15,
      appointmentTime: appointmentTime ? new Date(appointmentTime) : null,
      notes: notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await logActivity({
      organizationId: payload.userId as string,
      userId: payload.userId as string,
      action: 'added',
      entityType: 'queue',
      entityId: result.insertedId,
      changes: {
        customerName: customer!.name,
        serviceName: service?.name || 'Unknown Service',
        position: nextPosition,
        estimatedWaitTime: estimatedWaitTime || 15,
        checkinTime: new Date(),
      },
      description: `${customer!.name} added to queue for ${service?.name || 'service'} (position ${nextPosition})`,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Added to queue successfully',
        queue: {
          _id: result.insertedId.toString(),
          customerName: customer!.name,
          serviceId,
          position: nextPosition,
          status: 'waiting',
          estimatedWaitTime: estimatedWaitTime || 15,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add to queue error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const payload = await verifyToken(token as string);

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { queueId, status, staffId } = await request.json();

    if (!queueId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const organizationId = new ObjectId(payload.userId as string);
    const queueCollection = await getCollection('queue');
    const usersCollection = await getCollection('users');
    const servicesCollection = await getCollection('services');
    const staffCollection = await getCollection('staff');

    const currentQueueEntry = await queueCollection.findOne({ 
      _id: new ObjectId(queueId),
      organizationId 
    });

    if (!currentQueueEntry) {
      return NextResponse.json(
        { error: 'Queue entry not found' },
        { status: 404 }
      );
    }

    const [customer, service, staff] = await Promise.all([
      usersCollection.findOne({ _id: currentQueueEntry.customerId }),
      servicesCollection.findOne({ _id: currentQueueEntry.serviceId }),
      staffId ? staffCollection.findOne({ _id: new ObjectId(staffId) }) : Promise.resolve(null),
    ]);

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (staffId) {
      updateData.staffId = new ObjectId(staffId);
    }

    const result = await queueCollection.updateOne(
      { 
        _id: new ObjectId(queueId),
        organizationId 
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Queue entry not found' },
        { status: 404 }
      );
    }

    let action = 'updated';
    let description = '';
    
    if (status === 'called' && currentQueueEntry.status === 'waiting') {
      action = 'called';
      description = `${customer?.name || 'Customer'} called from queue`;
    } else if (status === 'served' && currentQueueEntry.status !== 'served') {
      action = 'served';
      description = `${customer?.name || 'Customer'} marked as served`;
      if (staff) {
        description += ` by ${staff.name}`;
      }
    } else if (status === 'no_show') {
      action = 'no_show';
      description = `${customer?.name || 'Customer'} marked as no-show`;
    }

    await logActivity({
      organizationId: payload.userId as string,
      userId: payload.userId as string,
      action,
      entityType: 'queue',
      entityId: queueId,
      changes: {
        customerName: customer?.name || 'Unknown Customer',
        serviceName: service?.name || 'Unknown Service',
        staffName: staff?.name || null,
        previousStatus: currentQueueEntry.status,
        newStatus: status,
        position: currentQueueEntry.position,
      },
      description,
    });

    return NextResponse.json({
      success: true,
      message: 'Queue entry updated successfully',
    });
  } catch (error) {
    console.error('Update queue error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}