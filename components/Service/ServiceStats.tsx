// components/services/ServiceStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Clock, Tag, Users } from 'lucide-react';

interface ServiceStatsProps {
  totalServices: number;
  averagePrice: number;
  averageDuration: number;
  staffTypesCount: number;
}

export function ServiceStats({
  totalServices,
  averagePrice,
  averageDuration,
  staffTypesCount
}: ServiceStatsProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${minutes}m`;
  };

  const stats = [
    {
      title: 'Total Services',
      value: totalServices,
      description: 'Active services',
      icon: Tag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Avg. Price',
      value: `$${averagePrice.toFixed(2)}`,
      description: 'Average service price',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Avg. Duration',
      value: formatDuration(averageDuration),
      description: 'Average service time',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Staff Types',
      value: staffTypesCount,
      description: 'Different staff roles',
      icon: Users,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
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