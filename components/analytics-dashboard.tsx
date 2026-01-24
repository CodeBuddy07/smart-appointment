'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  RefreshCw, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Users, 
  TrendingUp, 
  AlertCircle,
  Loader2,
  UserCheck,
  BarChart3,
  ListChecks
} from 'lucide-react';

interface AnalyticsData {
  summary: {
    totalAppointments: number;
    appointmentsToday: number;
    appointmentsThisMonth: number;
    completedAppointments: number;
    cancelledAppointments: number;
    pendingAppointments: number;
    currentQueueLength: number;
    servedToday: number;
    staffCount: number;
    servicesCount: number;
    averageWaitTime: number;
  };
  trends: {
    appointments: Array<{ _id: string; count: number }>;
  };
  performance: {
    topServices: Array<{ _id: string; name: string; count: number }>;
  };
  staffLoad: Array<{
    name: string;
    serviceType: string;
    currentAppointments: number;
    dailyCapacity: number;
    status: 'available' | 'on_leave';
  }>;
  todayStats: {
    completed: number;
    cancelled: number;
    noShow: number;
    inProgress: number;
    scheduled: number;
  };
}

const COLORS = [
  'oklch(0.55 0.2 252)',   
  'oklch(0.65 0.18 150)',  
  'oklch(0.75 0.15 280)',  
  'oklch(0.85 0.12 10)',   
  'oklch(0.95 0.1 180)',   
];

const STATUS_COLORS = {
  completed: 'oklch(0.65 0.18 150)',    
  scheduled: 'oklch(0.55 0.2 252)',     
  cancelled: 'oklch(0.75 0.22 10)',     
  'no_show': 'oklch(0.85 0.15 280)',    
  'in-progress': 'oklch(0.95 0.2 60)',  
};

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('today');

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/analytics?range=${timeRange}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const data = await response.json();
      setAnalytics(data);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      setError(error.message || 'An error occurred while fetching analytics');
    } finally {
      setLoading(false);
    }
  };

  const mockAnalytics: AnalyticsData = {
    summary: {
      totalAppointments: 0,
      appointmentsToday: 0,
      appointmentsThisMonth: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      pendingAppointments: 0,
      currentQueueLength: 0,
      servedToday: 0,
      staffCount: 0,
      servicesCount: 0,
      averageWaitTime: 0,
    },
    trends: {
      appointments: [],
    },
    performance: {
      topServices: [],
    },
    staffLoad: [],
    todayStats: {
      completed: 0,
      cancelled: 0,
      noShow: 0,
      inProgress: 0,
      scheduled: 0,
    }
  };

  const data = analytics || mockAnalytics;
  const { summary, trends, performance, staffLoad, todayStats } = data;

  const completionRate = summary.totalAppointments > 0
    ? ((summary.completedAppointments / summary.totalAppointments) * 100).toFixed(1)
    : '0';

  const staffLoadData = staffLoad.map(staff => ({
    name: staff.name,
    subject: staff.serviceType,
    A: (staff.currentAppointments / staff.dailyCapacity) * 100,
    fullMark: 100,
    current: staff.currentAppointments,
    capacity: staff.dailyCapacity,
    status: staff.status,
  }));

  const appointmentStatusData = [
    { name: 'Completed', value: todayStats.completed, color: STATUS_COLORS.completed },
    { name: 'Scheduled', value: todayStats.scheduled, color: STATUS_COLORS.scheduled },
    { name: 'In Progress', value: todayStats.inProgress, color: STATUS_COLORS['in-progress'] },
    { name: 'Cancelled', value: todayStats.cancelled, color: STATUS_COLORS.cancelled },
    { name: 'No Show', value: todayStats.noShow, color: STATUS_COLORS.no_show },
  ];

  const topServicesData = performance.topServices.map(service => ({
    name: service.name.length > 15 ? service.name.substring(0, 12) + '...' : service.name,
    bookings: service.count,
  }));

  const queueEfficiency = summary.servedToday > 0
    ? ((summary.servedToday / (summary.servedToday + summary.currentQueueLength)) * 100).toFixed(1)
    : '0';

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchAnalytics} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground mt-1">
            Real-time insights and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            {['today', 'week', 'month'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  timeRange === range
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <Button
            onClick={fetchAnalytics}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Today's Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.appointmentsToday}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-xs text-green-600">
                {todayStats.completed} completed
              </div>
              <div className="text-xs text-blue-600">
                {todayStats.scheduled} scheduled
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Total: {summary.totalAppointments}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completionRate}%</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-xs text-green-600">
                ✓ {summary.completedAppointments}
              </div>
              <div className="text-xs text-red-600">
                ✗ {summary.cancelledAppointments}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {summary.pendingAppointments} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Queue Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.currentQueueLength}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-xs text-blue-600">
                {summary.servedToday} served today
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Efficiency: {queueEfficiency}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg. Wait Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.averageWaitTime}m</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-xs text-blue-600">
                Active Staff: {staffLoad.filter(s => s.status === 'available').length}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {summary.staffCount} total staff
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Appointments Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends.appointments}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0 0)" />
                <XAxis 
                  dataKey="_id" 
                  tick={{ fontSize: 12 }}
                  stroke="oklch(0.5 0 0)"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="oklch(0.5 0 0)"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid oklch(0.9 0 0)',
                    borderRadius: '6px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="oklch(0.55 0.2 252)"
                  strokeWidth={2}
                  name="Appointments"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={appointmentStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {appointmentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} appointments`, 'Count']}
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid oklch(0.9 0 0)',
                        borderRadius: '6px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {appointmentStatusData.map((status, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="text-sm font-medium">{status.name}</span>
                    </div>
                    <span className="text-lg font-bold">{status.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Staff Load Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {staffLoad.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No staff data available</p>
              </div>
            ) : (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={staffLoadData}>
                      <PolarGrid stroke="oklch(0.9 0 0)" />
                      <PolarAngleAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        stroke="oklch(0.5 0 0)"
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]}
                        tick={{ fontSize: 10 }}
                        stroke="oklch(0.5 0 0)"
                      />
                      <Radar
                        name="Load %"
                        dataKey="A"
                        stroke="oklch(0.55 0.2 252)"
                        fill="oklch(0.55 0.2 252)"
                        fillOpacity={0.6}
                      />
                      <Tooltip 
                        formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Load']}
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: '1px solid oklch(0.9 0 0)',
                          borderRadius: '6px'
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Top Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topServicesData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No service data available</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topServicesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0 0)" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fontSize: 11 }}
                      stroke="oklch(0.5 0 0)"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="oklch(0.5 0 0)"
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} bookings`, 'Count']}
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid oklch(0.9 0 0)',
                        borderRadius: '6px'
                      }}
                    />
                    <Bar 
                      dataKey="bookings" 
                      fill="oklch(0.55 0.2 252)" 
                      radius={[4, 4, 0, 0]}
                      name="Bookings"
                    />
                  </BarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {performance.topServices.slice(0, 4).map((service, index) => (
                    <div key={index} className="border rounded p-3">
                      <p className="font-medium truncate">{service.name}</p>
                      <p className="text-2xl font-bold mt-1">{service.count}</p>
                      <p className="text-xs text-muted-foreground">bookings</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Total Services</p>
                  <p className="text-2xl font-bold mt-1">{summary.servicesCount}</p>
                  <div className="h-2 bg-secondary rounded-full mt-2">
                    <div 
                      className="h-full rounded-full bg-blue-500" 
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Active Staff</p>
                  <p className="text-2xl font-bold mt-1">
                    {staffLoad.filter(s => s.status === 'available').length}
                  </p>
                  <div className="h-2 bg-secondary rounded-full mt-2">
                    <div 
                      className="h-full rounded-full bg-green-500" 
                      style={{ 
                        width: `${(staffLoad.filter(s => s.status === 'available').length / summary.staffCount) * 100 || 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold mt-1">{summary.appointmentsThisMonth}</p>
                  <p className="text-xs text-green-600 mt-1">
                    +{summary.appointmentsThisMonth - (summary.appointmentsThisMonth * 0.8)} from last month
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Queue Efficiency</p>
                  <p className="text-2xl font-bold mt-1">{queueEfficiency}%</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {summary.servedToday} served today
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}