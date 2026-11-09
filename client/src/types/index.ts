export type UserRole = 'user' | 'admin';

export type EventStatus = 'Gələcəkdə' | 'Davam edir' | 'Bitib';
export type StatusFilter = 'all' | EventStatus;
export type DateSortOrder = 'asc' | 'desc';

export const EVENT_CATEGORIES = [
  'Konfranslar',
  'Seminarlar',
  'Festivallar',
  'İdman',
  'İncəsənət',
  'Texnologiya',
  'Digər'
] as const;

export type EventCategory = typeof EVENT_CATEGORIES[number];

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface EventItem {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  category?: string;
  image_url?: string;
  status?: EventStatus;
  registration_deadline?: string;
  created_by?: number;
  registered_count?: number;
}

export interface Attendee {
  id: number;
  name: string;
  email: string;
  registered_at: string;
}

export interface AdminStats {
  totalEvents: number;
  totalUsers: number;
  totalRegistrations: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
