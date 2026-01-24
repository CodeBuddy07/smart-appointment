'use client';

import React from "react"
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, AlertCircle, Download } from 'lucide-react';


import { ServiceTable } from './ServiceTable';
import { ServiceStats } from './ServiceStats';
import { ServiceModal } from "./ServiceModal";

interface Service {
  _id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  requiredStaffType: string;
}

export function ServiceManagement() {
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal state
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Common staff types
  const staffTypes = [
    'Doctor',
    'Consultant',
    'Support Agent',
    'Technician',
    'Nurse',
    'Therapist',
    'Specialist'
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/services');

      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data = await response.json();
      setAllServices(data.services || []);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      setError(error.message || 'An error occurred while fetching services');
    } finally {
      setLoading(false);
    }
  };

  // Filter services
  const filteredServices = useMemo(() => {
    return allServices.filter((service) => {
      // Search filter
      if (searchQuery && 
          !service.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !service.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Apply filters
      switch (filterType) {
        case 'by_staff':
          return true; // User will select staff type from dropdown
        case 'under_30':
          return service.duration < 30;
        case 'over_60':
          return service.duration > 60;
        case 'under_50':
          return service.price < 50;
        case 'over_100':
          return service.price > 100;
        default:
          return true;
      }
    });
  }, [allServices, searchQuery, filterType]);

  // Get unique staff types for stats
  const uniqueStaffTypes = useMemo(() => {
    const types = new Set(allServices.map(s => s.requiredStaffType));
    return Array.from(types);
  }, [allServices]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalServices = allServices.length;
    const averagePrice = totalServices > 0 
      ? allServices.reduce((sum, s) => sum + s.price, 0) / totalServices 
      : 0;
    const averageDuration = totalServices > 0 
      ? allServices.reduce((sum, s) => sum + s.duration, 0) / totalServices 
      : 0;
    const staffTypesCount = uniqueStaffTypes.length;

    return {
      totalServices,
      averagePrice,
      averageDuration,
      staffTypesCount
    };
  }, [allServices, uniqueStaffTypes]);

  // Paginate services
  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredServices.slice(startIndex, endIndex);
  }, [filteredServices, currentPage, itemsPerPage]);

  const handleAddOrUpdateService = async (formData: any) => {
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      if (!formData.name.trim()) {
        throw new Error('Service name is required');
      }

      if (!formData.requiredStaffType) {
        throw new Error('Required staff type is required');
      }

      if (formData.duration < 15 || formData.duration > 120) {
        throw new Error('Duration must be between 15 and 120 minutes');
      }

      if (formData.price < 0) {
        throw new Error('Price cannot be negative');
      }

      const url = editingService ? `/api/services/${editingService._id}` : '/api/services';
      const method = editingService ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          duration: formData.duration,
          price: formData.price,
          requiredStaffType: formData.requiredStaffType,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save service');
      }

      setSuccess(
        editingService
          ? 'Service updated successfully!'
          : 'Service added successfully!'
      );

      setServiceModalOpen(false);
      setEditingService(null);
      await fetchServices();
    } catch (error: any) {
      console.error('Error saving service:', error);
      setError(error.message || 'An error occurred while saving service');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setServiceModalOpen(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete service');
      }

      setSuccess('Service deleted successfully!');
      await fetchServices();
      
      // Reset to first page if last item on current page was deleted
      if (paginatedServices.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error: any) {
      console.error('Error deleting service:', error);
      setError(error.message || 'An error occurred while deleting service');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Description', 'Duration (min)', 'Price ($)', 'Required Staff Type'],
      ...allServices.map(service => [
        service.name,
        service.description,
        service.duration.toString(),
        service.price.toFixed(2),
        service.requiredStaffType
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `services_${new Date().toISOString().split('T')[0]}.csv`;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Loading Services</h3>
          <p className="text-gray-500">Fetching service catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Service Management</h2>
          <p className="text-muted-foreground mt-1">
            Define and manage services, pricing, and staff requirements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExport}
            disabled={allServices.length === 0}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            onClick={() => {
              setEditingService(null);
              setServiceModalOpen(true);
            }}
            className="gap-2"
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4" />
            Add Service
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

      <ServiceStats
        totalServices={stats.totalServices}
        averagePrice={stats.averagePrice}
        averageDuration={stats.averageDuration}
        staffTypesCount={stats.staffTypesCount}
      />

      <ServiceModal
        open={serviceModalOpen}
        onOpenChange={setServiceModalOpen}
        staffTypes={staffTypes}
        onSubmit={handleAddOrUpdateService}
        isSubmitting={isSubmitting}
        mode={editingService ? 'edit' : 'add'}
        initialData={editingService ? {
          name: editingService.name,
          description: editingService.description,
          duration: editingService.duration,
          price: editingService.price,
          requiredStaffType: editingService.requiredStaffType
        } : undefined}
      />

      <ServiceTable
        services={paginatedServices}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isSubmitting={isSubmitting}
        totalItems={filteredServices.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(value:number) => {
          setItemsPerPage(value);
          setCurrentPage(1);
        }}
        onSearch={handleSearch}
        onFilter={handleFilter}
        staffTypes={staffTypes}
      />
    </div>
  );
}