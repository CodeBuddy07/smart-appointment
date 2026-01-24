import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, User, Loader2, AlertCircle } from 'lucide-react';

interface Staff {
  _id: string;
  name: string;
  serviceType: string;
  dailyCapacity: number;
  currentAppointments?: number;
  status: 'available' | 'on_leave';
}

interface Service {
  _id: string;
  name: string;
  duration: number;
  requiredStaffType: string;
}

interface AppointmentFormData {
  customerName: string;
  staffId: string;
  serviceId: string;
  startDate: string;
  startTime: string;
  notes: string;
}

interface AppointmentFormProps {
  staff: Staff[];
  services: Service[];
  onSubmit: (formData: AppointmentFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  initialData?: AppointmentFormData;
}

export function AppointmentForm({
  staff,
  services,
  onSubmit,
  onCancel,
  isSubmitting,
  initialData
}: AppointmentFormProps) {
  const [formData, setFormData] = useState<AppointmentFormData>(
    initialData || {
      customerName: '',
      staffId: '',
      serviceId: '',
      startDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      notes: '',
    }
  );

  const getEligibleStaff = (serviceId?: string) => {
    if (!serviceId) return staff.filter(s => s.status === 'available');
    
    const service = services.find(s => s._id === serviceId);
    if (!service) return staff.filter(s => s.status === 'available');

    return staff.filter(s =>
      s.serviceType === service.requiredStaffType &&
      s.status === 'available' &&
      (s.currentAppointments || 0) < s.dailyCapacity
    );
  };

  const selectedService = services.find(s => s._id === formData.serviceId);
  const eligibleStaff = getEligibleStaff(formData.serviceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${minutes}m`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customerName">Customer Name *</Label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="pl-10"
              placeholder="Enter customer name"
              disabled={isSubmitting}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="serviceId">Service *</Label>
            <Select
              value={formData.serviceId}
              onValueChange={(value) => {
                setFormData({ 
                  ...formData, 
                  serviceId: value,
                  staffId: '' 
                });
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service._id} value={service._id}>
                    <div className="flex items-center justify-between">
                      <span>{service.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(service.duration)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="staffId">Assign Staff *</Label>
            <Select
              value={formData.staffId}
              onValueChange={(value) => setFormData({ ...formData, staffId: value })}
              disabled={isSubmitting || !formData.serviceId}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder={
                  !formData.serviceId
                    ? "Select a service first"
                    : "Select eligible staff"
                } />
              </SelectTrigger>
              <SelectContent>
                {eligibleStaff.map((staffMember) => {
                  const currentAppointments = staffMember.currentAppointments || 0;
                  const remainingSlots = staffMember.dailyCapacity - currentAppointments;
                  
                  return (
                    <SelectItem
                      key={staffMember._id}
                      value={staffMember._id}
                    >
                      <div className="flex items-center justify-between">
                        <span>{staffMember.name}</span>
                        <span className="text-xs">
                          {remainingSlots > 0 ? 
                            `${remainingSlots} slots left` : 
                            'Full'
                          }
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            
            {formData.serviceId && eligibleStaff.length === 0 && (
              <Alert className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No available staff for {selectedService?.name}. 
                  Try selecting a different service or time.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Date *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="pl-10"
                disabled={isSubmitting}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time *</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Select
                value={formData.startTime}
                onValueChange={(value) => setFormData({ ...formData, startTime: value })}
                disabled={isSubmitting}
              >
                <SelectTrigger className="pl-10 w-full">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => {
                    const hour = 9 + i; // Start from 9 AM
                    return [`${hour.toString().padStart(2, '0')}:00`, `${hour.toString().padStart(2, '0')}:30`];
                  }).flat().map(time => (
                    <SelectItem key={time} value={time}>
                      {parseInt(time.split(':')[0]) > 12 
                        ? `${parseInt(time.split(':')[0]) - 12}:${time.split(':')[1]} PM`
                        : `${time} AM`
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {selectedService && formData.startDate && formData.startTime && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium mb-1">Appointment Summary</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Duration:</div>
              <div className="font-medium">{formatDuration(selectedService.duration)}</div>
              <div className="text-muted-foreground">Estimated End:</div>
              <div className="font-medium">
                {(() => {
                  const start = new Date(`${formData.startDate}T${formData.startTime}`);
                  const end = new Date(start.getTime() + selectedService.duration * 60000);
                  return end.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });
                })()}
              </div>
            </div>
          </div>
        )}

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
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting || !formData.serviceId || !formData.staffId}
          className="flex-1 gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            initialData ? 'Update Appointment' : 'Schedule Appointment'
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