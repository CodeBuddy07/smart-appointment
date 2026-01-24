'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import { ActivityLog } from '@/components/activity-log';
import { CalendarClock, ChartBarBig, LayoutDashboard, LayoutList, LogOut, Menu, Settings, UserCog } from 'lucide-react';
import { QueueManagement } from '@/components/Queue/QueueManagement';
import { StaffManagement } from '@/components/Staff/StaffManagement';
import { ServiceManagement } from '@/components/Service/ServiceManagement';
import { AppointmentManagement } from '@/components/Appointment/AppointmentManagement';

export default function Dashboard() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="flex h-screen bg-background">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } border-r border-border transition-all duration-200 flex flex-col`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className={`font-bold text-lg ${!sidebarOpen && 'hidden'}`}>
            AppointmentQ
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-muted rounded"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'overview', label: 'Overview', icon: <LayoutDashboard /> },
            { id: 'staff', label: 'Staff Management', icon: <UserCog /> },
            { id: 'services', label: 'Services', icon: <Settings /> },
            { id: 'appointments', label: 'Appointments', icon: <CalendarClock /> },
            { id: 'queue', label: 'Queue Management', icon: <LayoutList /> },
            { id: 'activity', label: 'Activity Log', icon: <ChartBarBig /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex justify-start items-center text-left px-4 py-2 rounded transition-colors ${
                activeTab === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              } ${!sidebarOpen && 'text-center'}`}
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span className="ml-2">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full gap-2 bg-transparent"
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen && 'Logout'}
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="border-b border-border bg-card p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold capitalize">
              {activeTab === 'overview'
                ? 'Dashboard Overview'
                : activeTab.replace('-', ' ')}
            </h1>
            <div className="text-sm text-muted-foreground">
              Welcome, {user?.name}
            </div>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && <AnalyticsDashboard />}

          {activeTab === 'staff' && <StaffManagement />}
          {activeTab === 'services' && <ServiceManagement />}
          {activeTab === 'appointments' && <AppointmentManagement />}
          {activeTab === 'queue' && <QueueManagement />}

          {activeTab === 'activity' && <ActivityLog />}
        </div>
      </main>
    </div>
  );
}
