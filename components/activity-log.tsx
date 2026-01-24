'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  Loader2,
  Calendar,
  User,
  Users,
  Scissors,
  ListOrdered,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  UserCheck,
  Bell
} from 'lucide-react';

interface ActivityLogEntry {
  _id: string;
  action: string;
  entityType: string;
  entityId?: string;
  timestamp: string;
  userId: string;
  changes: Record<string, unknown>;
  description?: string;
}

export function ActivityLog() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchActivityLog();
  }, []);

  const fetchActivityLog = async () => {
    try {
      setLoading(true);
      setError(null);
      const limit = showAll ? 50 : 10;
      const response = await fetch(`/api/activity-log?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch activity log');
      }
      
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error: any) {
      console.error('Error fetching activity log:', error);
      setError(error.message || 'An error occurred while fetching activity log');
    } finally {
      setLoading(false);
    }
  };

  const getActionConfig = (action: string) => {
    switch (action) {
      case 'created':
        return { label: 'Created', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100', icon: <CheckCircle className="h-3 w-3" /> };
      case 'updated':
        return { label: 'Updated', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100', icon: <RefreshCw className="h-3 w-3" /> };
      case 'deleted':
        return { label: 'Deleted', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100', icon: <AlertCircle className="h-3 w-3" /> };
      case 'scheduled':
        return { label: 'Scheduled', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100', icon: <Calendar className="h-3 w-3" /> };
      case 'completed':
        return { label: 'Completed', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100', icon: <CheckCircle className="h-3 w-3" /> };
      case 'cancelled':
        return { label: 'Cancelled', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100', icon: <AlertCircle className="h-3 w-3" /> };
      case 'assigned':
        return { label: 'Assigned', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100', icon: <UserCheck className="h-3 w-3" /> };
      case 'moved':
        return { label: 'Moved', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100', icon: <ArrowRight className="h-3 w-3" /> };
      default:
        return { label: action, color: 'bg-gray-100 text-gray-800', icon: <Bell className="h-3 w-3" /> };
    }
  };

  const getEntityConfig = (entityType: string) => {
    switch (entityType) {
      case 'appointment':
        return { label: 'Appointment', icon: <Calendar className="h-4 w-4" />, color: 'text-blue-600' };
      case 'staff':
        return { label: 'Staff', icon: <Users className="h-4 w-4" />, color: 'text-green-600' };
      case 'service':
        return { label: 'Service', icon: <Scissors className="h-4 w-4" />, color: 'text-purple-600' };
      case 'queue':
        return { label: 'Queue', icon: <ListOrdered className="h-4 w-4" />, color: 'text-amber-600' };
      case 'user':
        return { label: 'User', icon: <User className="h-4 w-4" />, color: 'text-red-600' };
      default:
        return { label: entityType, icon: <Bell className="h-4 w-4" />, color: 'text-gray-600' };
    }
  };

  const formatHumanReadable = (log: ActivityLogEntry) => {
    const time = new Date(log.timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    const { label: entityLabel } = getEntityConfig(log.entityType);
    const { label: actionLabel } = getActionConfig(log.action);

    let details = '';
    
    if (log.changes) {
      if (log.entityType === 'queue' && log.action === 'assigned') {
        const staffName = log.changes.staffName || log.changes.staffId;
        const customerName = log.changes.customerName || log.changes.customerId;
        if (staffName && customerName) {
          return `${time} — ${customerName} was auto-assigned to ${staffName} from queue`;
        }
      }
      
      if (log.entityType === 'appointment' && log.changes.status) {
        const customerName = log.changes.customerName || log.changes.customerId;
        const staffName = log.changes.staffName || log.changes.staffId;
        if (customerName) {
          if (staffName) {
            return `${time} — Appointment for "${customerName}" was ${log.changes.status} with ${staffName}`;
          }
          return `${time} — Appointment for "${customerName}" was ${log.changes.status}`;
        }
      }
      
      if (log.action === 'created' && log.changes.customerName) {
        if (log.entityType === 'appointment') {
          const staffName = log.changes.staffName || '';
          return `${time} — New appointment for "${log.changes.customerName}"${staffName ? ` with ${staffName}` : ''}`;
        } else if (log.entityType === 'queue') {
          return `${time} — "${log.changes.customerName}" joined the queue`;
        }
      }
      
      if (log.entityType === 'queue' && log.changes.position) {
        const customerName = log.changes.customerName || log.changes.customerId;
        if (customerName) {
          return `${time} — ${customerName} moved to position ${log.changes.position} in queue`;
        }
      }
    }

    if (log.description) {
      return `${time} — ${log.description}`;
    }

    return `${time} — ${actionLabel} ${entityLabel.toLowerCase()}`;
  };

  const getRecentActivityStats = () => {
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    const recentLogs = logs.filter(log => new Date(log.timestamp) > lastHour);
    
    return {
      total: logs.length,
      recent: recentLogs.length,
      appointments: logs.filter(l => l.entityType === 'appointment').length,
      queueActions: logs.filter(l => l.entityType === 'queue').length,
      today: logs.filter(l => {
        const logDate = new Date(l.timestamp);
        const today = new Date();
        return logDate.toDateString() === today.toDateString();
      }).length
    };
  };

  const stats = getRecentActivityStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading activity log...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Activity Log</h2>
          <p className="text-muted-foreground mt-1">
            Track important system actions and events
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAll(!showAll)}
            variant="outline"
            size="sm"
          >
            {showAll ? 'Show Recent Only' : 'Show All Activities'}
          </Button>
          <Button
            onClick={fetchActivityLog}
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p>{error}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Today's Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
            <p className="text-xs text-muted-foreground">actions today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.appointments}</div>
            <p className="text-xs text-muted-foreground">total changes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ListOrdered className="h-4 w-4" />
              Queue Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.queueActions}</div>
            <p className="text-xs text-muted-foreground">assignments & moves</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Last Hour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recent}</div>
            <p className="text-xs text-muted-foreground">recent activities</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Activities</span>
            <Badge variant="outline">
              {logs.length} {showAll ? 'activities' : 'recent'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No activity recorded yet</p>
              <p className="text-sm mt-1">Activities will appear here as you use the system</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-125 overflow-y-auto pr-2">
              {logs.map((log) => {
                const actionConfig = getActionConfig(log.action);
                const entityConfig = getEntityConfig(log.entityType);

                return (
                  <div
                    key={log._id}
                    className="flex items-start gap-4 pb-4 border-b last:border-b-0 last:pb-0 group hover:bg-muted/50 transition-colors p-2 rounded-lg"
                  >
                    <div className={`p-2 rounded-full ${actionConfig.color.replace('text-', 'bg-').replace('dark:text-', 'dark:bg-')}`}>
                      <div className={`${actionConfig.color.split(' ')[0]}`}>
                        {actionConfig.icon}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge variant="outline" className="gap-1">
                              {entityConfig.icon}
                              {entityConfig.label}
                            </Badge>
                            <Badge className={actionConfig.color + ' gap-1'}>
                              {actionConfig.icon}
                              {actionConfig.label}
                            </Badge>
                          </div>
                          
                          <p className="font-medium text-sm">
                            {formatHumanReadable(log)}
                          </p>
                          
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(log.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        
                        {log.entityId && (
                          <Badge variant="secondary" className="text-xs">
                            #{log.entityId.slice(-6)}
                          </Badge>
                        )}
                      </div>

                      {Object.keys(log.changes).length > 0 && (
                        <div className="mt-3">
                          <details className="group/details">
                            <summary className="cursor-pointer text-xs font-medium text-muted-foreground flex items-center gap-1">
                              <span>View details</span>
                              <svg className="w-3 h-3 group-open/details:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </summary>
                            <div className="mt-2 p-3 bg-muted/30 rounded-lg border">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                {Object.entries(log.changes).map(([key, value]) => (
                                  <div key={key} className="flex gap-2">
                                    <span className="font-medium text-muted-foreground capitalize">
                                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                                    </span>
                                    <span className="truncate">
                                      {typeof value === 'object' 
                                        ? JSON.stringify(value)
                                        : String(value)
                                      }
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Key Events Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Recent Queue Assignments</h4>
                <div className="space-y-2">
                  {logs
                    .filter(log => 
                      log.entityType === 'queue' && 
                      (log.action === 'assigned' || log.action === 'moved')
                    )
                    .slice(0, 3)
                    .map((log, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        <span>{formatHumanReadable(log)}</span>
                      </div>
                    ))}
                  {logs.filter(log => log.entityType === 'queue' && log.action === 'assigned').length === 0 && (
                    <p className="text-sm text-muted-foreground">No recent queue assignments</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Recent Status Changes</h4>
                <div className="space-y-2">
                  {logs
                    .filter(log => 
                      log.entityType === 'appointment' && 
                      ['completed', 'cancelled', 'no_show'].includes(log.action)
                    )
                    .slice(0, 3)
                    .map((log, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span>{formatHumanReadable(log)}</span>
                      </div>
                    ))}
                  {logs.filter(log => 
                    log.entityType === 'appointment' && 
                    ['completed', 'cancelled', 'no_show'].includes(log.action)
                  ).length === 0 && (
                    <p className="text-sm text-muted-foreground">No recent status changes</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}