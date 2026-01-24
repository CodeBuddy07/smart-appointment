import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';

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

    const range = request.nextUrl.searchParams.get('range') || 'today';
    const organizationId = new ObjectId(payload.userId as string);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let startDate: Date;
    switch (range) {
      case 'week':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      default: 
        startDate = today;
    }

    const appointmentsCollection = await getCollection('appointments');
    const queueCollection = await getCollection('queue');
    const staffCollection = await getCollection('staff');
    const servicesCollection = await getCollection('services');
    const usersCollection = await getCollection('users');


    const totalAppointments = await appointmentsCollection.countDocuments({
      organizationId,
    });

    const appointmentsToday = await appointmentsCollection.countDocuments({
      organizationId,
      startTime: { $gte: today, $lt: tomorrow },
    });

    const appointmentsThisMonth = await appointmentsCollection.countDocuments({
      organizationId,
      startTime: { $gte: startDate },
    });

    const completedAppointments = await appointmentsCollection.countDocuments({
      organizationId,
      status: 'completed',
    });

    const cancelledAppointments = await appointmentsCollection.countDocuments({
      organizationId,
      status: 'cancelled',
    });

  
    const todayStatusStats = await appointmentsCollection.aggregate([
      {
        $match: {
          organizationId,
          startTime: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]).toArray();

    const todayStats = {
      completed: todayStatusStats.find(s => s._id === 'completed')?.count || 0,
      cancelled: todayStatusStats.find(s => s._id === 'cancelled')?.count || 0,
      noShow: todayStatusStats.find(s => s._id === 'no_show')?.count || 0,
      inProgress: todayStatusStats.find(s => s._id === 'in-progress')?.count || 0,
      scheduled: todayStatusStats.find(s => s._id === 'scheduled')?.count || 0,
    };

    const pendingAppointments = totalAppointments - completedAppointments - cancelledAppointments;


    const currentQueueLength = await queueCollection.countDocuments({
      organizationId,
      status: 'waiting',
    });

    const servedToday = await queueCollection.countDocuments({
      organizationId,
      status: 'served',
      checkinTime: { $gte: today },
    });

 
    const queueStats = await queueCollection.aggregate([
      {
        $match: {
          organizationId,
          status: 'served',
          checkinTime: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          avgWaitTime: { $avg: '$estimatedWaitTime' },
          totalServed: { $sum: 1 },
        },
      },
    ]).toArray();

    const averageWaitTime = queueStats[0]?.avgWaitTime 
      ? Math.round(queueStats[0].avgWaitTime)
      : 0;

    const staffCount = await staffCollection.countDocuments({
      organizationId,
    });

    const servicesCount = await servicesCollection.countDocuments({
      organizationId,
    });

    const staffLoad = await staffCollection.find({
      organizationId,
    }).toArray();

    const staffWithLoad = await Promise.all(
      staffLoad.map(async (staff) => {
        const todayAppointments = await appointmentsCollection.countDocuments({
          staffId: staff._id,
          startTime: { $gte: today, $lt: tomorrow },
          status: { $in: ['scheduled', 'in-progress'] }
        });

        return {
          name: staff.name,
          serviceType: staff.serviceType,
          currentAppointments: todayAppointments,
          dailyCapacity: staff.dailyCapacity,
          status: staff.status,
        };
      })
    );

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const appointmentsTrend = await appointmentsCollection
      .aggregate([
        {
          $match: {
            organizationId,
            createdAt: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    const servicePerformance = await appointmentsCollection
      .aggregate([
        {
          $match: { organizationId },
        },
        {
          $group: {
            _id: '$serviceId',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ])
      .toArray();

    const topServices = await Promise.all(
      servicePerformance.map(async (service) => {
        const serviceDoc = await servicesCollection.findOne({
          _id: new ObjectId(service._id),
        });
        return {
          _id: service._id.toString(),
          name: serviceDoc?.name || 'Unknown Service',
          count: service.count,
        };
      })
    );

    return NextResponse.json({
      summary: {
        totalAppointments,
        appointmentsToday,
        appointmentsThisMonth,
        completedAppointments,
        cancelledAppointments,
        pendingAppointments,
        currentQueueLength,
        servedToday,
        staffCount,
        servicesCount,
        averageWaitTime,
      },
      trends: {
        appointments: appointmentsTrend,
      },
      performance: {
        topServices,
      },
      staffLoad: staffWithLoad,
      todayStats,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}