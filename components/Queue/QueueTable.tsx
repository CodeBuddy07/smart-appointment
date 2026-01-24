// components/queue/QueueTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Filter, Download, RefreshCw } from 'lucide-react';
import { QueueTableRow } from './QueueTableRow';

interface QueueEntry {
  _id: string;
  customerName: string;
  serviceId: string;
  serviceName?: string;
  serviceType?: string;
  position: number;
  status: 'waiting' | 'called' | 'served' | 'no_show';
  checkinTime: string;
  estimatedWaitTime: number;
  appointmentTime?: string;
  notes?: string;
}

interface Service {
  _id: string;
  name: string;
  duration: number;
  requiredStaffType: string;
}

interface QueueTableProps {
  entries: QueueEntry[];
  services: Service[];
  onCall: (queueId: string) => void;
  onMarkServed: (queueId: string) => void;
  onMarkNoShow: (queueId: string) => void;
  onAssignToStaff?: (queueId: string) => void;
  isSubmitting: boolean;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
  onSearch: (query: string) => void;
  onFilter: (filter: string) => void;
  onRefresh: () => void;
}

export function QueueTable({
  entries,
  services,
  onCall,
  onMarkServed,
  onMarkNoShow,
  onAssignToStaff,
  isSubmitting,
  totalItems,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onSearch,
  onFilter,
  onRefresh
}: QueueTableProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const waitingCount = entries.filter(e => e.status === 'waiting').length;
  const activeCount = entries.filter(e => e.status === 'called').length;

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search queue..."
                className="pl-10"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
            
            <Select onValueChange={onFilter}>
              <SelectTrigger className="w-full md:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="called">Called</SelectItem>
                <SelectItem value="served">Served</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <span className="text-green-600">●</span>
                {waitingCount} Waiting
              </Badge>
              <Badge variant="outline" className="gap-1">
                <span className="text-yellow-600">●</span>
                {activeCount} Active
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={onRefresh}
              disabled={isSubmitting}
            >
              <RefreshCw className={`h-4 w-4 ${isSubmitting ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">entries</span>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Customer & Service</TableHead>
              <TableHead className="font-semibold">Position & Wait Time</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Time Details</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Queue is empty
                    </h3>
                    <p className="text-gray-500">
                      No customers in the queue
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <QueueTableRow
                  key={entry._id}
                  entry={entry}
                  services={services}
                  onCall={() => onCall(entry._id)}
                  onMarkServed={() => onMarkServed(entry._id)}
                  onMarkNoShow={() => onMarkNoShow(entry._id)}
                  onAssignToStaff={onAssignToStaff ? () => onAssignToStaff(entry._id) : undefined}
                  isSubmitting={isSubmitting}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {entries.length > 0 && (
        <div className="p-4 border-t">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing {startItem} to {endItem} of {totalItems} queue entries
            </div>
            
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    className={
                      currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => onPageChange(pageNum)}
                        isActive={currentPage === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    className={
                      currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </div>
  );
}