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
    const payload = await verifyToken(token as string);
    const {id} =await params;

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, description, duration, price, requiredStaffType } = await request.json();

    if (!name || !duration || !requiredStaffType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (![15, 30, 45, 60].includes(duration)) {
      return NextResponse.json(
        { error: 'Duration must be 15, 30, 45, or 60 minutes' },
        { status: 400 }
      );
    }

    if (price < 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    const servicesCollection = await getCollection('services');
    
    const existingService = await servicesCollection.findOne({
      organizationId: new ObjectId(payload.userId as string),
      name: name.trim(),
      _id: { $ne: new ObjectId(id) }
    });
    
    if (existingService) {
      return NextResponse.json(
        { error: 'Another service with this name already exists' },
        { status: 409 }
      );
    }

    const result = await servicesCollection.updateOne(
      {
        _id: new ObjectId(id),
        organizationId: new ObjectId(payload.userId as string),
      },
      {
        $set: {
          name: name.trim(),
          description: description?.trim() || '',
          duration,
          price,
          requiredStaffType,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Service updated successfully',
    });
  } catch (error: any) {
    console.error('Update service error:', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
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

    const servicesCollection = await getCollection('services');
    
    const appointmentsCollection = await getCollection('appointments');
    const serviceAppointments = await appointmentsCollection.countDocuments({
      serviceId: new ObjectId(id),
      status: { $in: ['scheduled', 'in-progress'] }
    });

    if (serviceAppointments > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete service with existing appointments',
          appointmentsCount: serviceAppointments
        },
        { status: 400 }
      );
    }

    const result = await servicesCollection.deleteOne({
      _id: new ObjectId(id),
      organizationId: new ObjectId(payload.userId as string),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete service error:', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}