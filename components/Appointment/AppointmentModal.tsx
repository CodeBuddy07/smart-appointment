import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { AppointmentForm } from './AppointmentForm';
import { Calendar, Edit2 } from 'lucide-react';

interface AppointmentFormData {
  customerName: string;
  staffId: string;
  serviceId: string;
  startDate: string;
  startTime: string;
  notes: string;
}

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: Array<{
    _id: string;
    name: string;
    serviceType: string;
    dailyCapacity: number;
    currentAppointments?: number;
    status: 'available' | 'on_leave';
  }>;
  services: Array<{
    _id: string;
    name: string;
    duration: number;
    requiredStaffType: string;
  }>;
  onSubmit: (formData: AppointmentFormData) => Promise<void>;
  isSubmitting: boolean;
  mode: 'add' | 'edit';
  initialData?: AppointmentFormData;
}

export function AppointmentModal({
  open,
  onOpenChange,
  staff,
  services,
  onSubmit,
  isSubmitting,
  mode,
  initialData
}: AppointmentModalProps) {
  const title = mode === 'add' ? 'Schedule New Appointment' : 'Edit Appointment';
  const description = mode === 'add'
    ? 'Book a new appointment with customer, service, and staff assignment'
    : 'Update appointment details';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-175">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'add' ? <Calendar className="h-5 w-5" /> : <Edit2 className="h-5 w-5" />}
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <AppointmentForm
          staff={staff}
          services={services}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
}