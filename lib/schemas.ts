import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'staff' | 'customer';
  createdAt: Date;
  updatedAt: Date;
}

export interface Staff {
  _id?: ObjectId;
  organizationId: ObjectId;
  name: string;
  serviceType: string;
  dailyCapacity: number;
  currentAppointments: number;
  status: 'available' | 'on_leave';
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  _id?: ObjectId;
  organizationId: ObjectId;
  name: string;
  description: string;
  duration: number; 
  price: number;
  requiredStaffType: string; 
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  _id?: ObjectId;
  organizationId: ObjectId;
  customerId: ObjectId;
  staffId: ObjectId;
  serviceId: ObjectId;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Queue {
  _id?: ObjectId;
  organizationId: ObjectId;
  serviceId: ObjectId;
  customerId: ObjectId;
  position: number;
  status: 'waiting' | 'called' | 'served' | 'no-show';
  checkinTime: Date;
  estimatedWaitTime: number; 
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityLog {
  _id?: ObjectId;
  organizationId: ObjectId;
  userId: ObjectId;
  action: string;
  entityType: string;
  entityId: ObjectId;
  changes: Record<string, unknown>;
  timestamp: Date;
}
