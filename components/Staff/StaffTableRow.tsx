import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    CheckCircle,
    XCircle,
    Edit2,
    Trash2,
    Calendar,
    User
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface StaffTableRowProps {
    staff: {
        _id: string;
        name: string;
        serviceType: string;
        dailyCapacity: number;
        status: 'available' | 'on_leave';
        currentAppointments?: number;
    };
    onEdit: () => void;
    onDelete: () => void;
    onStatusToggle: () => void;
    isSubmitting: boolean;
    index: number;
}

export function StaffTableRow({
    staff,
    onEdit,
    onDelete,
    onStatusToggle,
    isSubmitting,
}: StaffTableRowProps) {
    const currentAppointments = staff.currentAppointments || 0;
    const capacityPercentage = (currentAppointments / staff.dailyCapacity) * 100;
    const isNearCapacity = capacityPercentage >= 80;
    const isFull = currentAppointments >= staff.dailyCapacity;
    const hasAppointments = currentAppointments > 0;

    const getStatusColor = () => {
        if (isFull) return 'text-red-600 bg-red-50 border-red-200';
        if (isNearCapacity) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-green-600 bg-green-50 border-green-200';
    };

    return (
        <tr className="border-b hover:bg-muted/50 transition-colors">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{staff.name}</div>
                        <div className="text-sm text-gray-500">{staff.serviceType}</div>
                    </div>
                </div>
            </td>

            <td className="px-6 py-4">
                <Badge
                    variant={staff.status === 'available' ? 'default' : 'destructive'}
                    className="gap-1.5"
                >
                    {staff.status === 'available' ? (
                        <CheckCircle className="h-3 w-3" />
                    ) : (
                        <XCircle className="h-3 w-3" />
                    )}
                    {staff.status === 'available' ? 'Available' : 'On Leave'}
                </Badge>
            </td>

            <td className="px-6 py-4">
                <div className="space-y-2 w-48">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Capacity</span>
                        <span className={`font-medium ${getStatusColor().split(' ')[0]}`}>
                            {currentAppointments} / {staff.dailyCapacity}
                        </span>
                    </div>
                    <Progress
                        value={capacityPercentage}
                        className={`h-2 ${isFull ? '*:bg-red-600' : isNearCapacity ? '*:bg-amber-500' : '*:bg-green-600'}`}
                    />
                    {isFull && (
                        <p className="text-xs text-red-600">Full capacity</p>
                    )}
                    {isNearCapacity && !isFull && (
                        <p className="text-xs text-amber-600">Near capacity</p>
                    )}
                </div>
            </td>

            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm font-medium">
                                        {currentAppointments}
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Today's appointments</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    {hasAppointments && (
                        <Badge variant="outline" className="text-xs">
                            {Math.round(capacityPercentage)}% busy
                        </Badge>
                    )}
                </div>
            </td>

            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
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
                                <p>Edit staff member</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant={staff.status === 'available' ? 'outline' : 'default'}
                                    className="h-8 w-8 p-0"
                                    onClick={onStatusToggle}
                                    disabled={isSubmitting}
                                >
                                    {staff.status === 'available' ? (
                                        <XCircle className="h-4 w-4" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4" />
                                    )}
                                    <span className="sr-only">Toggle status</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{staff.status === 'available' ? 'Mark as On Leave' : 'Mark as Available'}</p>
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
                                <p>Delete staff member</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </td>
        </tr>
    );
}