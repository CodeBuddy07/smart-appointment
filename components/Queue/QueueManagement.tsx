'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, AlertCircle, UserCheck } from 'lucide-react';

import { QueueModal } from './QueueModal';
import { QueueTable } from './QueueTable';
import { QueueStats } from './QueueStats';
import { AssignFromQueueModal } from './AssignFromQueueModal';

interface QueueEntry {
  _id: string;
  customerName: string;
  serviceId: string;
  serviceName?: string;
  serviceType?: string;
  staffId?: string;
  staffName?: string;
  position: number;
  status: 'waiting' | 'called' | 'served' | 'no_show';
  checkinTime: string;
  estimatedWaitTime: number;
  appointmentTime?: string;
  notes?: string;
}

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

interface Appointment {
  _id: string;
  customerName: string;
  staffId: string;
  serviceId: string;
  startTime: string;
  endTime: string;
  status: string;
}

export function QueueManagement() {
  const [allQueue, setAllQueue] = useState<QueueEntry[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal states
  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<QueueEntry | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchData();
    // Set up real-time refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [queueRes, staffRes, servicesRes, appointmentsRes] = await Promise.all([
        fetch('/api/queue'),
        fetch('/api/staff'),
        fetch('/api/services'),
        fetch('/api/appointments?status=scheduled')
      ]);

      if (!queueRes.ok) throw new Error('Failed to fetch queue');
      if (!staffRes.ok) throw new Error('Failed to fetch staff');
      if (!servicesRes.ok) throw new Error('Failed to fetch services');
      if (!appointmentsRes.ok) throw new Error('Failed to fetch appointments');

      const queueData = await queueRes.json();
      const staffData = await staffRes.json();
      const servicesData = await servicesRes.json();
      const appointmentsData = await appointmentsRes.json();

      // Filter appointments that might need to go to queue (no staff assigned)
      const problematicAppointments = appointmentsData.appointments?.filter(
        (a: Appointment) => !a.staffId
      ) || [];

      // Check if any appointments need to be moved to queue
      if (problematicAppointments.length > 0) {
        await Promise.all(
          problematicAppointments.map(async (appointment: Appointment) => {
            await addToQueueFromAppointment(appointment);
          })
        );
        // Refetch queue after adding appointments
        const updatedQueueRes = await fetch('/api/queue');
        const updatedQueueData = await updatedQueueRes.json();
        setAllQueue(updatedQueueData.queue || []);
      } else {
        setAllQueue(queueData.queue || []);
      }

      setStaff(staffData.staff || []);
      setServices(servicesData.services || []);
      setAppointments(appointmentsData.appointments || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const addToQueueFromAppointment = async (appointment: Appointment) => {
    try {
      const response = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: appointment.customerName,
          serviceId: appointment.serviceId,
          appointmentTime: appointment.startTime,
          estimatedWaitTime: 30,
          notes: 'Auto-added from appointment (no staff available)'
        }),
      });

      if (!response.ok) {
        console.error('Failed to add appointment to queue');
      }
    } catch (error) {
      console.error('Error adding appointment to queue:', error);
    }
  };

  // Filter queue
  const filteredQueue = useMemo(() => {
    return allQueue.filter((entry) => {
      // Search filter
      if (searchQuery && 
          !entry.customerName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !(services.find(s => s._id === entry.serviceId)?.name || '').toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && entry.status !== statusFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort by position for waiting customers, then by check-in time
      if (a.status === 'waiting' && b.status === 'waiting') {
        return a.position - b.position;
      }
      return new Date(b.checkinTime).getTime() - new Date(a.checkinTime).getTime();
    });
  }, [allQueue, searchQuery, statusFilter, services]);

  // Calculate stats
  const stats = useMemo(() => {
    const waitingCount = allQueue.filter(entry => entry.status === 'waiting').length;
    const activeCount = allQueue.filter(entry => entry.status === 'called').length;
    const servedToday = allQueue.filter(entry => {
      const servedDate = new Date(entry.checkinTime);
      const today = new Date();
      return entry.status === 'served' &&
        servedDate.toDateString() === today.toDateString();
    }).length;
    const totalInQueue = allQueue.length;
    
    const waitingEntries = allQueue.filter(entry => entry.status === 'waiting');
    const avgWaitTime = waitingEntries.length > 0
      ? Math.round(
        waitingEntries.reduce((sum, e) => sum + e.estimatedWaitTime, 0) /
        waitingEntries.length
      )
      : 0;

    return {
      waitingCount,
      activeCount,
      servedToday,
      avgWaitTime,
      totalInQueue
    };
  }, [allQueue]);

  // Paginate queue
  const paginatedQueue = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredQueue.slice(startIndex, endIndex);
  }, [filteredQueue, currentPage, itemsPerPage]);

  const handleAddOrUpdateQueueEntry = async (formData: any) => {
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      if (!formData.customerName.trim()) {
        throw new Error('Customer name is required');
      }

      if (!formData.serviceId) {
        throw new Error('Please select a service');
      }

      const url = editingEntry ? `/api/queue/${editingEntry._id}` : '/api/queue';
      const method = editingEntry ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingEntry ? { ...formData, queueId: editingEntry._id } : formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save queue entry');
      }

      setSuccess(editingEntry ? 'Queue entry updated successfully!' : 'Customer added to queue successfully!');
      setQueueModalOpen(false);
      setEditingEntry(null);
      await fetchData();
    } catch (error: any) {
      console.error('Error saving queue entry:', error);
      setError(error.message || 'An error occurred while saving queue entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditQueueEntry = (entry: QueueEntry) => {
    setEditingEntry(entry);
    setQueueModalOpen(true);
  };

  const handleCallCustomer = async (queueId: string) => {
    try {
      setError(null);
      const response = await fetch('/api/queue', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueId, status: 'called' }),
      });

      if (!response.ok) {
        throw new Error('Failed to call customer');
      }

      setSuccess('Customer called successfully!');
      await fetchData();
    } catch (error: any) {
      console.error('Error calling customer:', error);
      setError(error.message || 'An error occurred while calling customer');
    }
  };

  const handleMarkServed = async (queueId: string) => {
    try {
      setError(null);
      const response = await fetch('/api/queue', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueId, status: 'served' }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark as served');
      }

      setSuccess('Customer marked as served!');
      await fetchData();
    } catch (error: any) {
      console.error('Error marking as served:', error);
      setError(error.message || 'An error occurred while marking as served');
    }
  };

  const handleMarkNoShow = async (queueId: string) => {
    if (!confirm('Mark this customer as no-show?')) {
      return;
    }

    try {
      setError(null);
      const response = await fetch('/api/queue', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueId, status: 'no_show' }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark as no-show');
      }

      setSuccess('Customer marked as no-show!');
      await fetchData();
    } catch (error: any) {
      console.error('Error marking as no-show:', error);
      setError(error.message || 'An error occurred while marking as no-show');
    }
  };

  const handleAssignFromQueue = async (staffId: string, queueId: string) => {
    try {
      setError(null);
      setIsSubmitting(true);

      const staffMember = staff.find(s => s._id === staffId);
      const queueEntry = allQueue.find(q => q._id === queueId);
      
      if (!staffMember || !queueEntry) {
        throw new Error('Invalid selection');
      }

      // Check staff capacity
      if (staffMember.currentAppointments && staffMember.currentAppointments >= staffMember.dailyCapacity) {
        throw new Error(`${staffMember.name} has reached daily capacity (${staffMember.dailyCapacity} appointments)`);
      }

      // Create appointment from queue entry
      const service = services.find(s => s._id === queueEntry.serviceId);
      const appointmentResponse = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: queueEntry.customerName,
          staffId,
          serviceId: queueEntry.serviceId,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + (service?.duration || 30) * 60000).toISOString(),
          notes: `Assigned from queue. ${queueEntry.notes || ''}`
        }),
      });

      if (!appointmentResponse.ok) {
        throw new Error('Failed to create appointment');
      }

      // Update queue entry to served
      const queueResponse = await fetch('/api/queue', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queueId,
          status: 'served',
          staffId
        }),
      });

      if (!queueResponse.ok) {
        throw new Error('Failed to update queue');
      }

      setSuccess(`Appointment assigned to ${staffMember.name} from queue!`);
      setAssignModalOpen(false);
      await fetchData();
    } catch (error: any) {
      console.error('Error assigning from queue:', error);
      setError(error.message || 'An error occurred while assigning from queue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilter = (filter: string) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  const waitingQueue = useMemo(() => 
    allQueue.filter(entry => entry.status === 'waiting'), 
    [allQueue]
  );

  const availableStaff = useMemo(() => 
    staff.filter(s => s.status === 'available' && 
      (s.currentAppointments || 0) < s.dailyCapacity), 
    [staff]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Loading Queue</h3>
          <p className="text-gray-500">Fetching queue data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Queue Management</h2>
          <p className="text-muted-foreground mt-1">
            Manage waiting customers and assign appointments from queue
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setAssignModalOpen(true)}
            disabled={availableStaff.length === 0 || waitingQueue.length === 0}
            className="gap-2"
          >
            <UserCheck className="h-4 w-4" />
            Assign From Queue
          </Button>
          <Button
            onClick={() => {
              setEditingEntry(null);
              setQueueModalOpen(true);
            }}
            className="gap-2"
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4" />
            Add to Queue
          </Button>
        </div>
      </div>

      {success && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <QueueStats
        waitingCount={stats.waitingCount}
        activeCount={stats.activeCount}
        servedToday={stats.servedToday}
        avgWaitTime={stats.avgWaitTime}
        totalInQueue={stats.totalInQueue}
      />

      <QueueModal
        open={queueModalOpen}
        onOpenChange={setQueueModalOpen}
        services={services}
        onSubmit={handleAddOrUpdateQueueEntry}
        isSubmitting={isSubmitting}
        mode={editingEntry ? 'edit' : 'add'}
        initialData={editingEntry ? {
          customerName: editingEntry.customerName,
          serviceId: editingEntry.serviceId,
          appointmentTime: editingEntry.appointmentTime || '',
          estimatedWaitTime: editingEntry.estimatedWaitTime,
          notes: editingEntry.notes || ''
        } : undefined}
      />

      <AssignFromQueueModal
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        staff={availableStaff}
        queue={waitingQueue}
        services={services}
        onSubmit={handleAssignFromQueue}
        isSubmitting={isSubmitting}
      />

      <QueueTable
        entries={paginatedQueue}
        services={services}
        onCall={handleCallCustomer}
        onMarkServed={handleMarkServed}
        onMarkNoShow={handleMarkNoShow}
        onAssignToStaff={(queueId) => {
          console.log('Assign single entry:', queueId);
        }}
        isSubmitting={isSubmitting}
        totalItems={filteredQueue.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(value) => {
          setItemsPerPage(value);
          setCurrentPage(1);
        }}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onRefresh={fetchData}
      />
    </div>
  );
}