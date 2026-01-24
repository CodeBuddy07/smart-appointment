// components/queue/QueueTableRow.tsx
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface QueueTableRowProps {
  entry: {
    _id: string;
    customerName: string;
    serviceId: string;
    serviceName?: string;
    serviceType?: string;
    position: number;
    status: 'waiting' | 'called' | 'served' | 'no_show';
    checkinTime: string;
    estimatedWaitTime: number;
    appointmentTime?: string;
    notes?: string;
  };
  services: Array<{
    _id: string;
    name: string;
    duration: number;
    requiredStaffType: string;
  }>;
  onCall: () => void;
  onMarkServed: () => void;
  onMarkNoShow: () => void;
  onAssignToStaff?: () => void;
  isSubmitting: boolean;
}

export function QueueTableRow({
  entry,
  services,
  onCall,
  onMarkServed,
  onMarkNoShow,
  onAssignToStaff,
  isSubmitting
}: QueueTableRowProps) {
  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPositionSuffix = (position: number) => {
    if (position === 1) return '1st';
    if (position === 2) return '2nd';
    if (position === 3) return '3rd';
    return `${position}th`;
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'waiting':
        return {
          label: 'Waiting',
          color: 'bg-blue-100 text-blue-800',
          icon: Clock,
          variant: 'default' as const
        };
      case 'called':
        return {
          label: 'Called',
          color: 'bg-yellow-100 text-yellow-800',
          icon: Phone,
          variant: 'secondary' as const
        };
      case 'served':
        return {
          label: 'Served',
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          variant: 'secondary' as const
        };
      case 'no_show':
        return {
          label: 'No Show',
          color: 'bg-red-100 text-red-800',
          icon: XCircle,
          variant: 'destructive' as const
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-800',
          icon: Clock,
          variant: 'outline' as const
        };
    }
  };

  const service = services.find(s => s._id === entry.serviceId);
  const statusConfig = getStatusConfig(entry.status);
  const StatusIcon = statusConfig.icon;

  return (
    <tr className="border-b hover:bg-muted/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900">{entry.customerName}</div>
            <div className="text-sm text-gray-500">{service?.name || 'Service'}</div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="font-mono font-bold">
            #{entry.position}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            {entry.estimatedWaitTime} min
          </Badge>
        </div>
      </td>
      
      <td className="px-6 py-4">
        <Badge className={statusConfig.color}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {statusConfig.label}
        </Badge>
      </td>
      
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-3 w-3 text-gray-400" />
            <span className="text-gray-600">{formatDateTime(entry.checkinTime)}</span>
          </div>
          {entry.appointmentTime && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-3 w-3 text-gray-400" />
              <span className="text-gray-500">Pref: {formatDateTime(entry.appointmentTime)}</span>
            </div>
          )}
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          {entry.status === 'waiting' && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={onCall}
                      disabled={isSubmitting}
                    >
                      <Phone className="h-4 w-4" />
                      <span className="sr-only">Call Customer</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Call Customer</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {onAssignToStaff && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={onAssignToStaff}
                        disabled={isSubmitting}
                      >
                        <User className="h-4 w-4" />
                        <span className="sr-only">Assign to Staff</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Assign to Staff</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </>
          )}

          {entry.status === 'called' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={onMarkServed}
                    disabled={isSubmitting}
                  >
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="sr-only">Mark as Served</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mark as Served</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={isSubmitting}
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {entry.status === 'waiting' && (
                <DropdownMenuItem onClick={onMarkServed}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Served
                </DropdownMenuItem>
              )}
              {entry.status === 'called' && (
                <DropdownMenuItem onClick={onCall}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call Again
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onMarkNoShow}>
                <XCircle className="h-4 w-4 mr-2" />
                Mark as No Show
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
}