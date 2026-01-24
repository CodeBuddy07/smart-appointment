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
        const payload = await verifyToken(token as string);
        const {id} = await params;

        if (!payload || !payload.userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { status } = await request.json();

        if (!['scheduled', 'in-progress', 'completed', 'cancelled', 'no_show'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            );
        }

        const organizationId = new ObjectId(payload.userId as string);
        const appointmentsCollection = await getCollection('appointments');
        const usersCollection = await getCollection('users');
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

        const [customer, staff, service] = await Promise.all([
            usersCollection.findOne({ _id: currentAppointment.customerId }),
            staffCollection.findOne({ _id: currentAppointment.staffId }),
            servicesCollection.findOne({ _id: currentAppointment.serviceId }),
        ]);

        const result = await appointmentsCollection.updateOne(
            {
                _id: new ObjectId(id),
                organizationId,
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
                { error: 'Appointment not found' },
                { status: 404 }
            );
        }

        await logActivity({
            organizationId: payload.userId as string,
            userId: payload.userId as string,
            action: status,
            entityType: 'appointment',
            entityId: id,
            changes: {
                status,
                customerId: currentAppointment.customerId.toString(),
                customerName: customer?.name || 'Unknown Customer',
                staffId: currentAppointment.staffId.toString(),
                staffName: staff?.name || 'Unknown Staff',
                serviceId: currentAppointment.serviceId.toString(),
                serviceName: service?.name || 'Unknown Service',
                previousStatus: currentAppointment.status,
                appointmentTime: currentAppointment.startTime,
            },
            description: `Appointment for ${customer?.name || 'customer'} marked as ${status}`,
        });

        return NextResponse.json({
            success: true,
            message: `Appointment status updated to ${status}`,
        });
    } catch (error) {
        console.error('Update appointment status error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}