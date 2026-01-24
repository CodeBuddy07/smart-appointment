import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle, XCircle, Briefcase } from 'lucide-react';

interface StaffStatsProps {
  totalStaff: number;
  availableStaff: number;
  onLeaveStaff: number;
  totalCapacity: number;
}

export function StaffStats({
  totalStaff,
  availableStaff,
  onLeaveStaff,
  totalCapacity
}: StaffStatsProps) {
  const stats = [
    {
      title: 'Total Staff',
      value: totalStaff,
      description: 'Staff members',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Available',
      value: availableStaff,
      description: 'Ready for appointments',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'On Leave',
      value: onLeaveStaff,
      description: 'Unavailable',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Total Capacity',
      value: totalCapacity,
      description: 'Daily appointments',
      icon: Briefcase,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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