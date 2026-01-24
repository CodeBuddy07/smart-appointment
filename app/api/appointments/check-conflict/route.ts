import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';

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

    const { staffId, startTime, endTime, excludeAppointmentId } = await request.json();

    if (!staffId || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const appointmentsCollection = await getCollection('appointments');
    
    const conflictQuery: any = {
      staffId: new ObjectId(staffId),
      status: { $in: ['scheduled', 'in-progress'] },
      $or: [
        {
          startTime: { $lt: new Date(endTime) },
          endTime: { $gt: new Date(startTime) },
        },
      ],
    };

    if (excludeAppointmentId) {
      conflictQuery._id = { $ne: new ObjectId(excludeAppointmentId) };
    }

    const conflictingAppointments = await appointmentsCollection
      .find(conflictQuery)
      .toArray();

    if (conflictingAppointments.length > 0) {
      const conflictingAppointment = conflictingAppointments[0];
      return NextResponse.json({
        hasConflict: true,
        error: 'This staff member already has an appointment at this time.',
        conflictingAppointment: {
          _id: conflictingAppointment._id.toString(),
          customerName: conflictingAppointment.customerName,
          startTime: conflictingAppointment.startTime,
          endTime: conflictingAppointment.endTime,
        },
      });
    }

    return NextResponse.json({ hasConflict: false });
  } catch (error) {
    console.error('Check conflict error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}