// components/services/ServiceTableRow.tsx
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  Clock,
  Edit2,
  Trash2,
  Briefcase,
  Stethoscope,
  Users,
  Scissors,
  Wrench
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ServiceTableRowProps {
  service: {
    _id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
    requiredStaffType: string;
  };
  onEdit: () => void;
  onDelete: () => void;
  isSubmitting: boolean;
}

export function ServiceTableRow({
  service,
  onEdit,
  onDelete,
  isSubmitting
}: ServiceTableRowProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${minutes}m`;
  };

  const getStaffTypeIcon = (staffType: string) => {
    const type = staffType.toLowerCase();
    if (type.includes('doctor') || type.includes('nurse')) return Stethoscope;
    if (type.includes('consultant') || type.includes('support')) return Users;
    if (type.includes('technician') || type.includes('engineer')) return Wrench;
    if (type.includes('therapist') || type.includes('stylist')) return Scissors;
    return Briefcase;
  };

  const StaffIcon = getStaffTypeIcon(service.requiredStaffType);

  return (
    <tr className="border-b hover:bg-muted/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <StaffIcon className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate">{service.name}</div>
            {service.description && (
              <div className="text-sm text-gray-500 truncate max-w-md">
                {service.description}
              </div>
            )}
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4">
        <Badge variant="secondary" className="gap-1.5">
          <StaffIcon className="h-3 w-3" />
          {service.requiredStaffType}
        </Badge>
      </td>
      
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="h-4 w-4" />
          <span className="font-medium">{formatDuration(service.duration)}</span>
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-bold text-green-700">
            ${service.price.toFixed(2)}
          </span>
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={onEdit}
                  disabled={isSubmitting}
                >
                  <Edit2 className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit service</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 w-8 p-0"
                  onClick={onDelete}
                  disabled={isSubmitting}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete service</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </td>
    </tr>
  );
}