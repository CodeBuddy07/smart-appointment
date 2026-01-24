import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface StaffFormData {
  name: string;
  serviceType: string;
  dailyCapacity: number;
  status: 'available' | 'on_leave';
}

interface StaffFormProps {
  serviceTypes: string[];
  onSubmit: (formData: StaffFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  initialData?: StaffFormData;
}

export function StaffForm({
  serviceTypes,
  onSubmit,
  onCancel,
  isSubmitting,
  initialData
}: StaffFormProps) {
  const [formData, setFormData] = useState<StaffFormData>(
    initialData || {
      name: '',
      serviceType: '',
      dailyCapacity: 5,
      status: 'available'
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          placeholder="e.g., Dr. John Smith"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="serviceType">Service Type *</Label>
        <Select
          value={formData.serviceType}
          onValueChange={(value) =>
            setFormData({ ...formData, serviceType: value })
          }
          disabled={isSubmitting}
        >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder="Select service type" />
          </SelectTrigger>
          <SelectContent>
            {serviceTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dailyCapacity">
          Daily Capacity (max appointments per day) *
        </Label>
        <Input
          id="dailyCapacity"
          type="number"
          min="1"
          max="10"
          value={formData.dailyCapacity}
          onChange={(e) =>
            setFormData({ ...formData, dailyCapacity: parseInt(e.target.value) || 5 })
          }
          disabled={isSubmitting}
          required
        />
        <p className="text-xs text-muted-foreground">
          Maximum number of appointments this staff can handle per day (1-10)
        </p>
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={formData.status === 'available' ? "default" : "outline"}
            className="flex-1 gap-2"
            onClick={() => setFormData({ ...formData, status: 'available' })}
            disabled={isSubmitting}
          >
            <CheckCircle className="h-4 w-4" />
            Available
          </Button>
          <Button
            type="button"
            variant={formData.status === 'on_leave' ? "default" : "outline"}
            className="flex-1 gap-2"
            onClick={() => setFormData({ ...formData, status: 'on_leave' })}
            disabled={isSubmitting}
          >
            <XCircle className="h-4 w-4" />
            On Leave
          </Button>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            initialData ? 'Update Staff' : 'Add Staff'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}