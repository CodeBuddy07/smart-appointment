import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CheckCircle, XCircle, Clock, Users } from 'lucide-react';

interface AppointmentStatsProps {
  totalAppointments: number;
  todayAppointments: number;
  completedToday: number;
  cancelledToday: number;
  upcomingAppointments: number;
}

export function AppointmentStats({
  totalAppointments,
  todayAppointments,
  completedToday,
  cancelledToday,
  upcomingAppointments
}: AppointmentStatsProps) {
  const stats = [
    {
      title: 'Total',
      value: totalAppointments,
      description: 'All appointments',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: "Today's",
      value: todayAppointments,
      description: 'Appointments today',
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Completed',
      value: completedToday,
      description: 'Completed today',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Cancelled',
      value: cancelledToday,
      description: 'Cancelled today',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Upcoming',
      value: upcomingAppointments,
      description: 'Next 7 days',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.title} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}