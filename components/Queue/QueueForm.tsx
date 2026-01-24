// components/queue/QueueForm.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, Loader2, AlertCircle } from 'lucide-react';

interface Service {
  _id: string;
  name: string;
  duration: number;
  requiredStaffType: string;
}

interface QueueFormData {
  customerName: string;
  serviceId: string;
  appointmentTime: string;
  estimatedWaitTime: number;
  notes: string;
}

interface QueueFormProps {
  services: Service[];
  onSubmit: (formData: QueueFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  initialData?: QueueFormData;
}

export function QueueForm({
  services,
  onSubmit,
  onCancel,
  isSubmitting,
  initialData
}: QueueFormProps) {
  const [formData, setFormData] = useState<QueueFormData>(
    initialData || {
      customerName: '',
      serviceId: '',
      appointmentTime: '',
      estimatedWaitTime: 15,
      notes: '',
    }
  );

  const durationOptions = [5, 10, 15, 20, 25, 30, 45, 60];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customerName">Customer Name *</Label>
          <Input
            id="customerName"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            placeholder="Enter customer name"
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="serviceId">Service *</Label>
            <Select
              value={formData.serviceId}
              onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service._id} value={service._id} className="group">
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{service.name}</span>
                      <Badge variant="outline" className="ml-2 shrink-0">
                        {service.duration} min
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedWaitTime">Estimated Wait Time *</Label>
            <Select
              value={formData.estimatedWaitTime.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, estimatedWaitTime: parseInt(value) })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select wait time" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((minutes) => (
                  <SelectItem key={minutes} value={minutes.toString()}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {minutes} minutes
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="appointmentTime">Preferred Time</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="appointmentTime"
                type="datetime-local"
                value={formData.appointmentTime}
                onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                className="pl-10"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add any additional notes..."
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        {formData.serviceId && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium mb-1">Service Details</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Service:</div>
              <div className="font-medium">
                {services.find(s => s._id === formData.serviceId)?.name || 'N/A'}
              </div>
              <div className="text-muted-foreground">Duration:</div>
              <div className="font-medium">
                {services.find(s => s._id === formData.serviceId)?.duration || 0} minutes
              </div>
              <div className="text-muted-foreground">Staff Type Required:</div>
              <div className="font-medium">
                {services.find(s => s._id === formData.serviceId)?.requiredStaffType || 'N/A'}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting || !formData.serviceId}
          className="flex-1 gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            initialData ? 'Update Queue Entry' : 'Add to Queue'
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