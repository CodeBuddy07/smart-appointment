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

    const servicesCollection = await getCollection('services');
    const services = await servicesCollection.find({}).toArray();

    return NextResponse.json({ services });
  } catch (error) {
    console.error('Get services error:', error);
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

    const organizationId = new ObjectId(payload.userId as string);
    const servicesCollection = await getCollection('services');
    
    const existingService = await servicesCollection.findOne({
      organizationId,
      name: name.trim()
    });
    
    if (existingService) {
      return NextResponse.json(
        { error: 'A service with this name already exists' },
        { status: 409 }
      );
    }

    const result = await servicesCollection.insertOne({
      organizationId,
      name: name.trim(),
      description: description?.trim() || '',
      duration,
      price,
      requiredStaffType,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await logActivity({
      organizationId: payload.userId as string,
      userId: payload.userId as string,
      action: 'created',
      entityType: 'service',
      entityId: result.insertedId,
      changes: {
        name: name.trim(),
        description: description?.trim() || '',
        duration,
        price,
        requiredStaffType,
      },
      description: `New service "${name.trim()}" created (${duration} min, ${requiredStaffType})`,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Service created successfully',
        service: {
          _id: result.insertedId.toString(),
          name: name.trim(),
          description: description?.trim() || '',
          duration,
          price,
          requiredStaffType,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create service error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}