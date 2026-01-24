// components/queue/QueueStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Phone, CheckCircle, Users, Timer } from 'lucide-react';

interface QueueStatsProps {
  waitingCount: number;
  activeCount: number;
  servedToday: number;
  avgWaitTime: number;
  totalInQueue: number;
}

export function QueueStats({
  waitingCount,
  activeCount,
  servedToday,
  avgWaitTime,
  totalInQueue
}: QueueStatsProps) {
  const stats = [
    {
      title: 'Waiting',
      value: waitingCount,
      description: 'In queue',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active',
      value: activeCount,
      description: 'Being served',
      icon: Phone,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Served Today',
      value: servedToday,
      description: 'Completed today',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Avg Wait Time',
      value: `${avgWaitTime} min`,
      description: 'Average wait',
      icon: Timer,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Total in Queue',
      value: totalInQueue,
      description: 'All statuses',
      icon: Clock,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
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