// components/services/ServiceModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ServiceForm } from './ServiceForm';
import { Plus, Edit2 } from 'lucide-react';

interface ServiceFormData {
  name: string;
  description: string;
  duration: number;
  price: number;
  requiredStaffType: string;
}

interface ServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffTypes: string[];
  onSubmit: (formData: ServiceFormData) => Promise<void>;
  isSubmitting: boolean;
  mode: 'add' | 'edit';
  initialData?: ServiceFormData;
}

export function ServiceModal({
  open,
  onOpenChange,
  staffTypes,
  onSubmit,
  isSubmitting,
  mode,
  initialData
}: ServiceModalProps) {
  const title = mode === 'add' ? 'Add New Service' : 'Edit Service';
  const description = mode === 'add'
    ? 'Create a new service with duration, price, and required staff type'
    : 'Update service details';

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
        <ServiceForm
          staffTypes={staffTypes}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
}