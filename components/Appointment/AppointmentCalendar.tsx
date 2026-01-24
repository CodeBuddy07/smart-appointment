import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';

interface AppointmentCalendarProps {
  appointments: Array<{
    _id: string;
    customerName: string;
    staffName: string;
    serviceName: string;
    startTime: string;
    endTime: string;
    status: string;
  }>;
  onAppointmentClick: (appointmentId: string) => void;
}

export function AppointmentCalendar({ appointments, onAppointmentClick }: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    const startDay = firstDay.getDay();
    
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getAppointmentsForDay = (date: Date | null) => {
    if (!date) return [];
    
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.startTime);
      return appointmentDate.getDate() === date.getDate() &&
             appointmentDate.getMonth() === date.getMonth() &&
             appointmentDate.getFullYear() === date.getFullYear();
    });
  };

  const formatTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const days = getDaysInMonth(currentDate);
  const monthYear = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const today = new Date();

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={prevMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-semibold">{monthYear}</h3>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={nextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Scheduled
            </Badge>
            <Badge variant="outline" className="gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              In Progress
            </Badge>
            <Badge variant="outline" className="gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-500" />
              Completed
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center font-medium text-gray-500 text-sm py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            const isToday = date && 
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear();
            
            const dayAppointments = getAppointmentsForDay(date);
            
            return (
              <div
                key={index}
                className={`
                  min-h-32 border rounded-lg p-2
                  ${date ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'}
                  ${isToday ? 'border-primary border-2' : 'border-gray-200'}
                `}
              >
                {date && (
                  <>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`
                        text-sm font-medium
                        ${isToday ? 'text-primary' : 'text-gray-700'}
                      `}>
                        {date.getDate()}
                      </span>
                      {dayAppointments.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {dayAppointments.length}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {dayAppointments.slice(0, 3).map(appointment => (
                        <div
                          key={appointment._id}
                          className={`
                            p-1 rounded text-xs cursor-pointer truncate
                            ${appointment.status === 'scheduled' ? 'bg-green-100 text-green-800 border border-green-200' : 
                              appointment.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                              appointment.status === 'completed' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                              'bg-red-100 text-red-800 border border-red-200'
                            }
                          `}
                          onClick={() => onAppointmentClick(appointment._id)}
                          title={`${appointment.customerName} - ${appointment.serviceName}`}
                        >
                          <div className="flex items-center gap-1">
                            <Clock className="h-2 w-2" />
                            <span className="font-medium">{formatTime(appointment.startTime)}</span>
                          </div>
                          <div className="truncate">{appointment.customerName}</div>
                        </div>
                      ))}
                      {dayAppointments.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayAppointments.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}