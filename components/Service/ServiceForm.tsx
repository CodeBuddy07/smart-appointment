// components/services/ServiceForm.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Clock, Loader2 } from 'lucide-react';

interface ServiceFormData {
  name: string;
  description: string;
  duration: number;
  price: number;
  requiredStaffType: string;
}

interface ServiceFormProps {
  staffTypes: string[];
  onSubmit: (formData: ServiceFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  initialData?: ServiceFormData;
}

export function ServiceForm({
  staffTypes,
  onSubmit,
  onCancel,
  isSubmitting,
  initialData
}: ServiceFormProps) {
  const durationOptions = [15, 30, 45, 60, 90, 120];

  const [formData, setFormData] = useState<ServiceFormData>(
    initialData || {
      name: '',
      description: '',
      duration: 30,
      price: 0,
      requiredStaffType: '',
    }
  );

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours} hr ${mins > 0 ? `${mins} min` : ''}`;
    return `${minutes} min`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Service Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., General Consultation, Haircut, Technical Support"
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the service in detail..."
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Duration *</Label>
            <Select
              value={formData.duration.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, duration: parseInt(value) })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((duration) => (
                  <SelectItem key={duration} value={duration.toString()}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {formatDuration(duration)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value) || 0
                  })
                }
                className="pl-10"
                placeholder="0.00"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requiredStaffType">Staff Type *</Label>
            <Select
              value={formData.requiredStaffType}
              onValueChange={(value) =>
                setFormData({ ...formData, requiredStaffType: value })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select staff type" />
              </SelectTrigger>
              <SelectContent>
                {staffTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
            initialData ? 'Update Service' : 'Add Service'
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