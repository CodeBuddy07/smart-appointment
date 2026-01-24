import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { logActivity } from '@/lib/activity-logger';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Unauthorized or invalid token' },
        { status: 401 }
      );
    }

    const staffCollection = await getCollection('staff');
    const appointmentsCollection = await getCollection('appointments');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const staff = await staffCollection.find({
      organizationId: new ObjectId(payload.userId as string),
    }).toArray();

    const staffWithAppointments = await Promise.all(
      staff.map(async (member) => {
        const todayAppointments = await appointmentsCollection.countDocuments({
          staffId: member._id,
          startTime: { $gte: today, $lt: tomorrow },
          status: { $in: ['scheduled', 'in-progress'] }
        });

        return {
          _id: member._id.toString(),
          name: member.name,
          serviceType: member.serviceType,
          dailyCapacity: member.dailyCapacity,
          status: member.status,
          currentAppointments: todayAppointments,
          createdAt: member.createdAt,
          updatedAt: member.updatedAt,
        };
      })
    );

    return NextResponse.json({ 
      success: true, 
      staff: staffWithAppointments 
    });
  } catch (error: any) {
    console.error('Get staff error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch staff members' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Unauthorized or invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, serviceType, dailyCapacity, status } = body;

    if (!name?.trim() || !serviceType?.trim()) {
      return NextResponse.json(
        { error: 'Name and service type are required' },
        { status: 400 }
      );
    }

    if (!dailyCapacity || dailyCapacity < 1 || dailyCapacity > 10) {
      return NextResponse.json(
        { error: 'Daily capacity must be between 1 and 10' },
        { status: 400 }
      );
    }

    if (!['available', 'on_leave'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const staffCollection = await getCollection('staff');
    
    const existingStaff = await staffCollection.findOne({
      organizationId: new ObjectId(payload.userId as string),
      name: name.trim()
    });
    
    if (existingStaff) {
      return NextResponse.json(
        { error: 'Staff member with this name already exists' },
        { status: 409 }
      );
    }

    const now = new Date();
    const result = await staffCollection.insertOne({
      organizationId: new ObjectId(payload.userId as string),
      name: name.trim(),
      serviceType: serviceType.trim(),
      dailyCapacity,
      currentAppointments: 0,
      status,
      createdAt: now,
      updatedAt: now,
    });

    await logActivity({
      organizationId: payload.userId as string,
      userId: payload.userId as string,
      action: 'created',
      entityType: 'staff',
      entityId: result.insertedId,
      changes: {
        name: name.trim(),
        serviceType: serviceType.trim(),
        dailyCapacity,
        status,
      },
      description: `New staff member "${name.trim()}" added as ${serviceType.trim()}`,
    });

    const newStaff = {
      _id: result.insertedId.toString(),
      name: name.trim(),
      serviceType: serviceType.trim(),
      dailyCapacity,
      status,
      currentAppointments: 0,
      createdAt: now,
      updatedAt: now,
    };

    return NextResponse.json(
      { 
        success: true, 
        message: 'Staff member added successfully',
        staff: newStaff 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create staff error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to add staff member' },
      { status: 500 }
    );
  }
}