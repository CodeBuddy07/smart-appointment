import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    const {id} = await params;
    
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
      name: name.trim(),
      _id: { $ne: new ObjectId( id) }
    });


    
    if (existingStaff) {
      return NextResponse.json(
        { error: 'Another staff member with this name already exists' },
        { status: 409 }
      );
    }

    const result = await staffCollection.updateOne(
      {
        _id: new ObjectId(id),
        organizationId: new ObjectId(payload.userId as string),
      },
      {
        $set: {
          name: name.trim(),
          serviceType: serviceType.trim(),
          dailyCapacity,
          status,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Staff member updated successfully',
    });
  } catch (error: any) {
    console.error('Update staff error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    if (error.name === 'BSONError') {
      return NextResponse.json(
        { error: 'Invalid staff ID format' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update staff member' },
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
    const {id} = await params;
    
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
    const upcomingAppointments = await appointmentsCollection.countDocuments({
      staffId: new ObjectId(id),
      startTime: { $gte: new Date() },
      status: { $in: ['scheduled', 'in-progress'] }
    });

    if (upcomingAppointments > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete staff with upcoming appointments',
          upcomingAppointments
        },
        { status: 400 }
      );
    }

    const result = await staffCollection.deleteOne({
      _id: new ObjectId(id),
      organizationId: new ObjectId(payload.userId as string),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Staff member deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete staff error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    if (error.name === 'BSONError') {
      return NextResponse.json(
        { error: 'Invalid staff ID format' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete staff member' },
      { status: 500 }
    );
  }
}