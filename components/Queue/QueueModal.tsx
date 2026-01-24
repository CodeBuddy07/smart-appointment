// components/queue/QueueModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { QueueForm } from './QueueForm';
import { Plus, Edit2 } from 'lucide-react';

interface QueueFormData {
  customerName: string;
  serviceId: string;
  appointmentTime: string;
  estimatedWaitTime: number;
  notes: string;
}

interface QueueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: Array<{
    _id: string;
    name: string;
    duration: number;
    requiredStaffType: string;
  }>;
  onSubmit: (formData: QueueFormData) => Promise<void>;
  isSubmitting: boolean;
  mode: 'add' | 'edit';
  initialData?: QueueFormData;
}

export function QueueModal({
  open,
  onOpenChange,
  services,
  onSubmit,
  isSubmitting,
  mode,
  initialData
}: QueueModalProps) {
  const title = mode === 'add' ? 'Add Customer to Queue' : 'Edit Queue Entry';
  const description = mode === 'add'
    ? 'Add a new customer to the waiting queue'
    : 'Edit queue entry details';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'add' ? <Plus className="h-5 w-5" /> : <Edit2 className="h-5 w-5" />}
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <QueueForm
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