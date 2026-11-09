// client/src/types/index.ts
// Bu fayl bütün Frontend tətbiqi boyunca istifadə edəcəyimiz TypeScript interfeyslərini cəmləyir.
// Hər bir API sorğusunun və verilənlər bazası obyektinin tipi burada dəqiq təsvir olunur.

// İstifadəçi rolu yalnız bu iki dəyərdən biri ola bilər
export type UserRole = 'user' | 'admin';

// İstifadəçi modeli
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

// Tədbir modeli
export interface EventItem {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  created_by?: number;
  registered_count?: number; // Tədbirə indiyədək yazılanların sayı
}

// Qeydiyyatçı modeli (Admin panelində tədbirə yazılanları görmək üçün)
export interface Attendee {
  id: number;
  name: string;
  email: string;
  registered_at: string;
}

// Admin statistikası
export interface AdminStats {
  totalEvents: number;
  totalUsers: number;
  totalRegistrations: number;
}

// Auth API Cavabları
export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// Auth State (Redux üçün)
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
