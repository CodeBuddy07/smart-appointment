import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  UserCircle,
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

interface AppointmentTableRowProps {
  appointment: {
    _id: string;
    customerName: string;
    staffName: string;
    serviceName: string;
    startTime: string;
    endTime: string;
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no_show';
    notes: string;
  };
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: string) => void;
  isSubmitting: boolean;
}

export function AppointmentTableRow({
  appointment,
  onEdit,
  onDelete,
  onStatusChange,
  isSubmitting
}: AppointmentTableRowProps) {
  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  };

  const getDuration = () => {
    const start = new Date(appointment.startTime);
    const end = new Date(appointment.endTime);
    const duration = Math.floor((end.getTime() - start.getTime()) / 60000);
    return `${duration} min`;
  };

  return (
    <tr className="border-b hover:bg-muted/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCircle className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900">{appointment.customerName}</div>
            <div className="text-sm text-gray-500">{appointment.serviceName}</div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="font-medium text-gray-900">{appointment.staffName}</div>
      </td>
      
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{formatDateTime(appointment.startTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>{getDuration()}</span>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4">
        <Badge className={`${getStatusColor(appointment.status)} font-medium`}>
          {getStatusLabel(appointment.status)}
        </Badge>
      </td>
      
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          {appointment.status === 'scheduled' && (
            <div className="flex gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => onStatusChange('completed')}
                      disabled={isSubmitting}
                    >
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="sr-only">Mark as Completed</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mark as Completed</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => onStatusChange('no_show')}
                      disabled={isSubmitting}
                    >
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="sr-only">Mark as No Show</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mark as No Show</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
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
              <DropdownMenuItem onClick={onEdit}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Appointment
              </DropdownMenuItem>
              {appointment.status === 'scheduled' && (
                <DropdownMenuItem onClick={() => onStatusChange('cancelled')}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Appointment
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Permanently
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
}