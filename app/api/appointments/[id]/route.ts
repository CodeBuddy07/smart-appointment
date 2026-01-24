import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { logActivity } from '@/lib/activity-logger';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const payload = await verifyToken(token as string);
    const {id} = await params;

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { customerName, staffId, serviceId, startTime, endTime, notes } = await request.json();

    if (!customerName || !staffId || !serviceId || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const organizationId = new ObjectId(payload.userId as string);
    const usersCollection = await getCollection('users');
    const appointmentsCollection = await getCollection('appointments');
    const staffCollection = await getCollection('staff');
    const servicesCollection = await getCollection('services');

    const currentAppointment = await appointmentsCollection.findOne({
      _id: new ObjectId(id),
      organizationId,
    });

    if (!currentAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

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

    const [staff, service] = await Promise.all([
      staffCollection.findOne({ _id: new ObjectId(staffId) }),
      servicesCollection.findOne({ _id: new ObjectId(serviceId) }),
    ]);

    const conflict = await appointmentsCollection.findOne({
      _id: { $ne: new ObjectId(id) },
      staffId: new ObjectId(staffId),
      status: { $in: ['scheduled', 'in-progress'] },
      $or: [
        {
          startTime: { $lt: new Date(endTime) },
          endTime: { $gt: new Date(startTime) },
        },
      ],
    });

    if (conflict) {
      return NextResponse.json(
        { 
          error: 'This staff member already has an appointment at this time.',
          conflictingAppointment: {
            _id: conflict._id.toString(),
            customerId: conflict.customerId.toString(),
            startTime: conflict.startTime,
            endTime: conflict.endTime,
          }
        },
        { status: 409 }
      );
    }

    const result = await appointmentsCollection.updateOne(
      {
        _id: new ObjectId(id),
        organizationId,
      },
      {
        $set: {
          customerId: customer!._id,
          staffId: new ObjectId(staffId),
          serviceId: new ObjectId(serviceId),
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          notes: notes || '',
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    await logActivity({
      organizationId: payload.userId as string,
      userId: payload.userId as string,
      action: 'updated',
      entityType: 'appointment',
      entityId: id,
      changes: {
        customerName: customer!.name,
        staffName: staff?.name || 'Unknown Staff',
        serviceName: service?.name || 'Unknown Service',
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        previousCustomerId: currentAppointment.customerId.toString(),
        previousStaffId: currentAppointment.staffId.toString(),
        previousServiceId: currentAppointment.serviceId.toString(),
        previousStartTime: currentAppointment.startTime,
        previousEndTime: currentAppointment.endTime,
      },
      description: `Appointment updated for ${customer!.name}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Appointment updated successfully',
    });
  } catch (error: any) {
    console.error('Update appointment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const payload = await verifyToken(token as string);
    const {id} = await params;

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const organizationId = new ObjectId(payload.userId as string);
    const appointmentsCollection = await getCollection('appointments');

    const result = await appointmentsCollection.updateOne(
      {
        _id: new ObjectId(id),
        organizationId,
      },
      {
        $set: {
          status: 'cancelled',
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment cancelled successfully',
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}