import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { logActivity } from '@/lib/activity-logger';

export async function PATCH(
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
        const { status } = body;

        if (!['available', 'on_leave'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            );
        }

        const staffCollection = await getCollection('staff');

        const currentStaff = await staffCollection.findOne({
            _id: new ObjectId(id),
            organizationId: new ObjectId(payload.userId as string),
        });

        if (!currentStaff) {
            return NextResponse.json(
                { error: 'Staff member not found' },
                { status: 404 }
            );
        }

        const result = await staffCollection.updateOne(
            {
                _id: new ObjectId(id),
                organizationId: new ObjectId(payload.userId as string),
            },
            {
                $set: {
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

        await logActivity({
            organizationId: payload.userId as string,
            userId: payload.userId as string,
            action: 'updated',
            entityType: 'staff',
            entityId: id,
            changes: {
                name: currentStaff.name,
                previousStatus: currentStaff.status,
                newStatus: status,
            },
            description: `Staff member "${currentStaff.name}" status changed to ${status}`,
        });

        return NextResponse.json({
            success: true,
            message: `Staff status updated to ${status}`,
        });
    } catch (error: any) {
        console.error('Update staff status error:', error);

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
            { error: 'Failed to update staff status' },
            { status: 500 }
        );
    }
}