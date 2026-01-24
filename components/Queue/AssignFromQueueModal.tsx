// components/queue/AssignFromQueueModal.tsx
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';

interface Staff {
  _id: string;
  name: string;
  serviceType: string;
  dailyCapacity: number;
  currentAppointments?: number;
  status: 'available' | 'on_leave';
}

interface QueueEntry {
  _id: string;
  customerName: string;
  serviceId: string;
  position: number;
}

interface Service {
  _id: string;
  name: string;
  duration: number;
  requiredStaffType: string;
}

interface AssignFromQueueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: Staff[];
  queue: QueueEntry[];
  services: Service[];
  onSubmit: (staffId: string, queueId: string) => Promise<void>;
  isSubmitting: boolean;
}

export function AssignFromQueueModal({
  open,
  onOpenChange,
  staff,
  queue,
  services,
  onSubmit,
  isSubmitting
}: AssignFromQueueModalProps) {
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [selectedQueueEntry, setSelectedQueueEntry] = useState<string>('');

  const availableStaff = staff.filter(s =>
    s.status === 'available' &&
    s.currentAppointments &&
    s.currentAppointments < s.dailyCapacity
  );

  const eligibleQueueEntries = queue.filter(entry => {
    if (!selectedStaff) return true;
    const service = services.find(s => s._id === entry.serviceId);
    const staffMember = staff.find(s => s._id === selectedStaff);
    return service?.requiredStaffType === staffMember?.serviceType;
  });

  const getPositionSuffix = (position: number) => {
    if (position === 1) return '1st';
    if (position === 2) return '2nd';
    if (position === 3) return '3rd';
    return `${position}th`;
  };

  const handleSubmit = async () => {
    if (!selectedStaff || !selectedQueueEntry) return;
    await onSubmit(selectedStaff, selectedQueueEntry);
  };

  const getEligibleCount = (staffId: string) => {
    const staffMember = staff.find(s => s._id === staffId);
    if (!staffMember) return 0;
    
    return queue.filter(entry => {
      const service = services.find(s => s._id === entry.serviceId);
      return service?.requiredStaffType === staffMember.serviceType;
    }).length;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Assign From Queue
          </DialogTitle>
          <DialogDescription>
            Select a staff member and customer to assign from queue
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Select Staff Member</Label>
            <Select
              value={selectedStaff}
              onValueChange={(value) => {
                setSelectedStaff(value);
                setSelectedQueueEntry(''); 
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {availableStaff.map((staffMember) => {
                  const currentAppointments = staffMember.currentAppointments || 0;
                  const eligibleCount = getEligibleCount(staffMember._id);
                  
                  return (
                    <SelectItem key={staffMember._id} value={staffMember._id}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                          <span className="font-medium">{staffMember.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {staffMember.serviceType}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {eligibleCount > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {eligibleCount} eligible
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {currentAppointments}/{staffMember.dailyCapacity}
                          </Badge>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            
            {availableStaff.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No staff available for assignment. All staff are either on leave or at full capacity.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {selectedStaff && (
            <div className="space-y-3">
              <Label>Select Customer from Queue</Label>
              <Select
                value={selectedQueueEntry}
                onValueChange={setSelectedQueueEntry}
                disabled={isSubmitting || eligibleQueueEntries.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    eligibleQueueEntries.length === 0 
                      ? "No eligible customers for this staff type"
                      : "Select customer from queue"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {eligibleQueueEntries.map((entry) => {
                    const service = services.find(s => s._id === entry.serviceId);
                    return (
                      <SelectItem key={entry._id} value={entry._id}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex flex-col">
                            <span className="font-medium">{entry.customerName}</span>
                            <span className="text-sm text-muted-foreground">
                              {service?.name || 'Service'}
                            </span>
                          </div>
                          <Badge variant="outline">
                            {getPositionSuffix(entry.position)}
                          </Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
              {selectedStaff && eligibleQueueEntries.length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No customers in queue for {staff.find(s => s._id === selectedStaff)?.serviceType} services.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {selectedQueueEntry && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-sm font-medium mb-2">Assignment Details</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Customer:</div>
                <div className="font-medium">
                  {queue.find(q => q._id === selectedQueueEntry)?.customerName}
                </div>
                <div className="text-muted-foreground">Service:</div>
                <div className="font-medium">
                  {services.find(s => s._id === queue.find(q => q._id === selectedQueueEntry)?.serviceId)?.name}
                </div>
                <div className="text-muted-foreground">Staff:</div>
                <div className="font-medium">
                  {staff.find(s => s._id === selectedStaff)?.name}
                </div>
                <div className="text-muted-foreground">Position:</div>
                <div className="font-medium">
                  {getPositionSuffix(queue.find(q => q._id === selectedQueueEntry)?.position || 0)}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setSelectedStaff('');
                setSelectedQueueEntry('');
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedStaff || !selectedQueueEntry || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4" />
                  Assign Customer
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}