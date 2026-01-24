'use client';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserPlus, AlertCircle, Download } from 'lucide-react';

import { StaffModal } from './StaffModal';
import { StaffTable } from './StaffTable';
import { StaffStats } from './StaffStats';

interface Staff {
  _id: string;
  name: string;
  serviceType: string;
  dailyCapacity: number;
  status: 'available' | 'on_leave';
  currentAppointments?: number;
}

export function StaffManagement() {
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');

  const serviceTypes = [
    'Doctor',
    'Consultant',
    'Support Agent',
    'Technician',
    'Nurse',
    'Therapist',
    'Specialist'
  ];

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/staff');

      if (!response.ok) {
        throw new Error('Failed to fetch staff');
      }

      const data = await response.json();
      setAllStaff(data.staff || []);
    } catch (error: any) {
      console.error('Error fetching staff:', error);
      setError(error.message || 'An error occurred while fetching staff');
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = useMemo(() => {
    return allStaff.filter((staff) => {
      if (searchQuery && !staff.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !staff.serviceType.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      if (statusFilter !== 'all' && statusFilter !== 'by_type') {
        if (statusFilter === 'available' && staff.status !== 'available') return false;
        if (statusFilter === 'on_leave' && staff.status !== 'on_leave') return false;
      }

      if (statusFilter === 'by_type' || serviceTypeFilter !== 'all') {
        const typeFilter = statusFilter === 'by_type' ? searchQuery : serviceTypeFilter;
        if (typeFilter !== 'all' && staff.serviceType !== typeFilter) return false;
      }

      return true;
    });
  }, [allStaff, searchQuery, statusFilter, serviceTypeFilter]);

  const paginatedStaff = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredStaff.slice(startIndex, endIndex);
  }, [filteredStaff, currentPage, itemsPerPage]);

  const stats = useMemo(() => {
    const availableStaff = allStaff.filter(s => s.status === 'available').length;
    const onLeaveStaff = allStaff.filter(s => s.status === 'on_leave').length;
    const totalCapacity = allStaff.reduce((sum, staff) => sum + staff.dailyCapacity, 0);
    
    return {
      totalStaff: allStaff.length,
      availableStaff,
      onLeaveStaff,
      totalCapacity
    };
  }, [allStaff]);

  const handleAddOrUpdateStaff = async (formData: any) => {
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      if (!formData.name.trim()) {
        throw new Error('Staff name is required');
      }

      if (!formData.serviceType.trim()) {
        throw new Error('Service type is required');
      }

      if (formData.dailyCapacity < 1 || formData.dailyCapacity > 10) {
        throw new Error('Daily capacity must be between 1 and 10');
      }

      const url = editingStaff ? `/api/staff/${editingStaff._id}` : '/api/staff';
      const method = editingStaff ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          serviceType: formData.serviceType.trim(),
          dailyCapacity: formData.dailyCapacity,
          status: formData.status
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save staff');
      }

      setSuccess(
        editingStaff
          ? 'Staff member updated successfully!'
          : 'Staff member added successfully!'
      );

      setStaffModalOpen(false);
      setEditingStaff(null);
      await fetchStaff();
    } catch (error: any) {
      console.error('Error saving staff:', error);
      setError(error.message || 'An error occurred while saving staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setStaffModalOpen(true);
  };

  const handleDelete = async (staffId: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    try {
      setError(null);
      const response = await fetch(`/api/staff/${staffId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete staff member');
      }

      setSuccess('Staff member deleted successfully!');
      await fetchStaff();
      
      if (paginatedStaff.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error: any) {
      console.error('Error deleting staff:', error);
      setError(error.message || 'An error occurred while deleting staff member');
    }
  };

  const handleStatusToggle = async (staffId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'on_leave' : 'available';

    try {
      const response = await fetch(`/api/staff/${staffId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      await fetchStaff();
    } catch (error: any) {
      console.error('Error updating status:', error);
      setError(error.message || 'An error occurred while updating status');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Service Type', 'Status', 'Daily Capacity', 'Current Appointments'],
      ...allStaff.map(staff => [
        staff.name,
        staff.serviceType,
        staff.status,
        staff.dailyCapacity.toString(),
        (staff.currentAppointments || 0).toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staff_${new Date().toISOString().split('T')[0]}.csv`;
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
    setStatusFilter(filter);
    setCurrentPage(1); 
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Loading Staff Database</h3>
          <p className="text-gray-500">Fetching staff information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Staff Management</h2>
          <p className="text-muted-foreground mt-1">
            Manage your team members, schedules, and capacity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExport}
            disabled={allStaff.length === 0}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            onClick={() => {
              setEditingStaff(null);
              setStaffModalOpen(true);
            }}
            className="gap-2"
            disabled={isSubmitting}
          >
            <UserPlus className="h-4 w-4" />
            Add Staff
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

      <StaffStats
        totalStaff={stats.totalStaff}
        availableStaff={stats.availableStaff}
        onLeaveStaff={stats.onLeaveStaff}
        totalCapacity={stats.totalCapacity}
      />

      <StaffModal
        open={staffModalOpen}
        onOpenChange={setStaffModalOpen}
        serviceTypes={serviceTypes}
        onSubmit={handleAddOrUpdateStaff}
        isSubmitting={isSubmitting}
        mode={editingStaff ? 'edit' : 'add'}
        initialData={editingStaff ? {
          name: editingStaff.name,
          serviceType: editingStaff.serviceType,
          dailyCapacity: editingStaff.dailyCapacity,
          status: editingStaff.status
        } : undefined}
      />

      <StaffTable
        staff={paginatedStaff}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusToggle={handleStatusToggle}
        isSubmitting={isSubmitting}
        totalItems={filteredStaff.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(value) => {
          setItemsPerPage(value);
          setCurrentPage(1);
        }}
        onSearch={handleSearch}
        onFilter={handleFilter}
        serviceTypes={serviceTypes}
      />
    </div>
  );
}