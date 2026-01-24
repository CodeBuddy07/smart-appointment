import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { StaffForm } from './StaffForm';
import { UserPlus, Edit2 } from 'lucide-react';

interface StaffFormData {
  name: string;
  serviceType: string;
  dailyCapacity: number;
  status: 'available' | 'on_leave';
}

interface StaffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceTypes: string[];
  onSubmit: (formData: StaffFormData) => Promise<void>;
  isSubmitting: boolean;
  mode: 'add' | 'edit';
  initialData?: StaffFormData;
}

export function StaffModal({
  open,
  onOpenChange,
  serviceTypes,
  onSubmit,
  isSubmitting,
  mode,
  initialData
}: StaffModalProps) {
  const title = mode === 'add' ? 'Add New Staff Member' : 'Edit Staff Member';
  const description = mode === 'add'
    ? 'Add a new staff member to your team'
    : 'Edit staff member details';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'add' ? <UserPlus className="h-5 w-5" /> : <Edit2 className="h-5 w-5" />}
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <StaffForm
          serviceTypes={serviceTypes}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
}