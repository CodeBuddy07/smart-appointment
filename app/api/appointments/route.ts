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
    const appointmentsCollection = await getCollection('appointments');
    const usersCollection = await getCollection('users');
    const staffCollection = await getCollection('staff');
    const servicesCollection = await getCollection('services');

    const appointments = await appointmentsCollection
      .find({ organizationId })
      .sort({ startTime: 1 })
      .toArray();

    const enrichedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        const [customer, staff, service] = await Promise.all([
          usersCollection.findOne({ _id: appointment.customerId }),
          staffCollection.findOne({ _id: appointment.staffId }),
          servicesCollection.findOne({ _id: appointment.serviceId }),
        ]);

        return {
          _id: appointment._id.toString(),
          customerId: appointment.customerId.toString(),
          customerName: customer?.name || 'Unknown Customer',
          staffId: appointment.staffId.toString(),
          staffName: staff?.name || 'Unknown Staff',
          serviceId: appointment.serviceId.toString(),
          serviceName: service?.name || 'Unknown Service',
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          status: appointment.status,
          notes: appointment.notes || '',
          createdAt: appointment.createdAt,
          updatedAt: appointment.updatedAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      appointments: enrichedAppointments
    });
  } catch (error) {
    console.error('Get appointments error:', error);
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

    const result = await appointmentsCollection.insertOne({
      organizationId,
      customerId: customer!._id,
      staffId: new ObjectId(staffId),
      serviceId: new ObjectId(serviceId),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: 'scheduled',
      notes: notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await logActivity({
      organizationId: payload.userId as string,
      userId: payload.userId as string,
      action: 'scheduled',
      entityType: 'appointment',
      entityId: result.insertedId,
      changes: {
        customerId: customer!._id.toString(),
        customerName: customer!.name,
        staffId,
        staffName: staff?.name || 'Unknown Staff',
        serviceId,
        serviceName: service?.name || 'Unknown Service',
        startTime,
        endTime,
        status: 'scheduled',
        notes: notes || '',
      },
      description: `New appointment scheduled for ${customer!.name} with ${staff?.name || 'staff'}`,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Appointment scheduled successfully',
        appointment: {
          _id: result.insertedId.toString(),
          customerName: customer!.name,
          staffId,
          staffName: staff?.name || 'Unknown Staff',
          serviceId,
          serviceName: service?.name || 'Unknown Service',
          startTime,
          endTime,
          status: 'scheduled',
          notes: notes || '',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}