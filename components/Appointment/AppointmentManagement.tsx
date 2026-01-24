'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Calendar, AlertCircle, Download } from 'lucide-react';

import { AppointmentModal } from './AppointmentModal';
import { AppointmentTable } from './AppointmentTable';
import { AppointmentStats } from './AppointmentStats';
import { AppointmentCalendar } from './AppointmentCalendar';

interface Appointment {
  _id: string;
  customerId: string;
  customerName: string;
  staffId: string;
  staffName: string;
  serviceId: string;
  serviceName: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no_show';
  notes: string;
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

export function AppointmentManagement() {
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [appointmentsRes, staffRes, servicesRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/staff'),
        fetch('/api/services')
      ]);

      if (!appointmentsRes.ok) throw new Error('Failed to fetch appointments');
      if (!staffRes.ok) throw new Error('Failed to fetch staff');
      if (!servicesRes.ok) throw new Error('Failed to fetch services');

      const appointmentsData = await appointmentsRes.json();
      const staffData = await staffRes.json();
      const servicesData = await servicesRes.json();

      setAllAppointments(appointmentsData.appointments || []);
      setStaff(staffData.staff || []);
      setServices(servicesData.services || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return allAppointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.startTime);
      
      if (searchQuery && 
          !appointment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !appointment.staffName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !appointment.serviceName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      switch (filterType) {
        case 'today':
          return appointmentDate >= today && appointmentDate < tomorrow;
        case 'upcoming':
          return appointmentDate >= tomorrow;
        case 'past':
          return appointmentDate < today;
        case 'scheduled':
          return appointment.status === 'scheduled';
        case 'completed':
          return appointment.status === 'completed';
        case 'cancelled':
          return appointment.status === 'cancelled';
        default:
          return true;
      }
    });
  }, [allAppointments, searchQuery, filterType]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return {
      totalAppointments: allAppointments.length,
      todayAppointments: allAppointments.filter(a => {
        const date = new Date(a.startTime);
        return date >= today && date < tomorrow;
      }).length,
      completedToday: allAppointments.filter(a => {
        const date = new Date(a.startTime);
        return a.status === 'completed' && date >= today && date < tomorrow;
      }).length,
      cancelledToday: allAppointments.filter(a => {
        const date = new Date(a.startTime);
        return a.status === 'cancelled' && date >= today && date < tomorrow;
      }).length,
      upcomingAppointments: allAppointments.filter(a => {
        const date = new Date(a.startTime);
        return date >= tomorrow && date < nextWeek;
      }).length
    };
  }, [allAppointments]);

  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAppointments.slice(startIndex, endIndex);
  }, [filteredAppointments, currentPage, itemsPerPage]);

  const handleAddOrUpdateAppointment = async (formData: any) => {
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      if (!formData.customerName.trim()) {
        throw new Error('Customer name is required');
      }

      if (!formData.staffId) {
        throw new Error('Please select a staff member');
      }

      if (!formData.serviceId) {
        throw new Error('Please select a service');
      }

      const selectedStaff = staff.find(s => s._id === formData.staffId);
      const selectedService = services.find(s => s._id === formData.serviceId);

      if (!selectedStaff || !selectedService) {
        throw new Error('Invalid selection');
      }

      if (selectedStaff.serviceType !== selectedService.requiredStaffType) {
        throw new Error(`Selected staff (${selectedStaff.serviceType}) cannot perform this service (requires ${selectedService.requiredStaffType})`);
      }

      if (selectedStaff.status === 'on_leave') {
        throw new Error('Selected staff is on leave');
      }

      if (selectedStaff.currentAppointments && selectedStaff.currentAppointments >= selectedStaff.dailyCapacity) {
        throw new Error(`${selectedStaff.name} has reached daily capacity (${selectedStaff.dailyCapacity} appointments)`);
      }

      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + selectedService.duration * 60000);

      const url = editingAppointment ? `/api/appointments/${editingAppointment._id}` : '/api/appointments';
      const method = editingAppointment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: formData.customerName.trim(),
          staffId: formData.staffId,
          serviceId: formData.serviceId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          notes: formData.notes.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save appointment');
      }

      setSuccess(
        editingAppointment
          ? 'Appointment updated successfully!'
          : 'Appointment scheduled successfully!'
      );

      setAppointmentModalOpen(false);
      setEditingAppointment(null);
      await fetchData();
    } catch (error: any) {
      console.error('Error saving appointment:', error);
      setError(error.message || 'An error occurred while saving appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    const startDate = new Date(appointment.startTime);
    setEditingAppointment(appointment);
    setAppointmentModalOpen(true);
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    if (!confirm(`Change appointment status to ${newStatus.replace('_', ' ')}?`)) {
      return;
    }

    try {
      setError(null);
      const response = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment status');
      }

      setSuccess(`Appointment status updated to ${newStatus.replace('_', ' ')}`);
      await fetchData();
    } catch (error: any) {
      console.error('Error updating status:', error);
      setError(error.message || 'An error occurred while updating status');
    }
  };

  const handleDelete = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to delete this appointment permanently?')) {
      return;
    }

    try {
      setError(null);
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete appointment');
      }

      setSuccess('Appointment deleted successfully!');
      await fetchData();
      
      if (paginatedAppointments.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      setError(error.message || 'An error occurred while deleting appointment');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Customer', 'Service', 'Staff', 'Start Time', 'End Time', 'Status', 'Notes'],
      ...allAppointments.map(appointment => [
        appointment.customerName,
        appointment.serviceName,
        appointment.staffName,
        new Date(appointment.startTime).toLocaleString(),
        new Date(appointment.endTime).toLocaleString(),
        appointment.status,
        appointment.notes
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointments_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilter = (filter: string) => {
    setFilterType(filter);
    setCurrentPage(1);
  };

  const handleAppointmentClick = (appointmentId: string) => {
    const appointment = allAppointments.find(a => a._id === appointmentId);
    if (appointment) {
      handleEdit(appointment);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Loading Appointments</h3>
          <p className="text-gray-500">Fetching appointment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Appointment Management</h2>
          <p className="text-muted-foreground mt-1">
            Schedule, manage, and track appointments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExport}
            disabled={allAppointments.length === 0}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            onClick={() => {
              setEditingAppointment(null);
              setAppointmentModalOpen(true);
            }}
            className="gap-2"
            disabled={isSubmitting}
          >
            <Calendar className="h-4 w-4" />
            Schedule Appointment
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

      <AppointmentStats
        totalAppointments={stats.totalAppointments}
        todayAppointments={stats.todayAppointments}
        completedToday={stats.completedToday}
        cancelledToday={stats.cancelledToday}
        upcomingAppointments={stats.upcomingAppointments}
      />

      <AppointmentModal
        open={appointmentModalOpen}
        onOpenChange={setAppointmentModalOpen}
        staff={staff}
        services={services}
        onSubmit={handleAddOrUpdateAppointment}
        isSubmitting={isSubmitting}
        mode={editingAppointment ? 'edit' : 'add'}
        initialData={editingAppointment ? {
          customerName: editingAppointment.customerName,
          staffId: editingAppointment.staffId,
          serviceId: editingAppointment.serviceId,
          startDate: new Date(editingAppointment.startTime).toISOString().split('T')[0],
          startTime: new Date(editingAppointment.startTime).toTimeString().slice(0, 5),
          notes: editingAppointment.notes,
        } : undefined}
      />

      {viewMode === 'list' ? (
        <AppointmentTable
          appointments={paginatedAppointments}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          isSubmitting={isSubmitting}
          totalItems={filteredAppointments.length}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(value: number) => {
            setItemsPerPage(value);
            setCurrentPage(1);
          }}
          onSearch={handleSearch}
          onFilter={handleFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      ) : (
        <AppointmentCalendar
          appointments={allAppointments}
          onAppointmentClick={handleAppointmentClick}
        />
      )}
    </div>
  );
}