// client/src/api/apiSlice.ts
// Bu fayl bütün Backend API sorğularımızı mərkəzləşdirən RTK Query servisidir.
// Hər bir sorğuya avtomatik JWT Token əlavə edir və məlumatları keşləyir.

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../app/store';
import type { 
  AuthResponse, 
  EventItem, 
  Attendee, 
  AdminStats, 
  User 
} from '../types';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    // Hər bir sorğu göndərilərkən Redux state-dəki tokeni avtomatik Authorization header-ə əlavə edir
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  // Keş teqləri: Tədbir yaradıldıqda və ya silindikdə siyahını avtomatik yeniləmək üçün
  tagTypes: ['Events', 'EventDetails', 'Registrations', 'AdminUsers', 'AdminStats'],

  endpoints: (builder) => ({
    // ================== AUTH ==================
    register: builder.mutation<AuthResponse, { name: string; email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
    }),
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getMe: builder.query<{ user: User }, void>({
      query: () => '/auth/me',
    }),
    updateProfile: builder.mutation<{ message: string; user: User }, { name: string; newPassword?: string }>({
      query: (data) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: data,
      }),
    }),

    // ================== EVENTS ==================
    getEvents: builder.query<EventItem[], void>({
      query: () => '/events',
      providesTags: ['Events'],
    }),
    getMyRegistrations: builder.query<(EventItem & { registered_at: string })[], void>({
      query: () => '/events/my-registrations',
      providesTags: ['Registrations'],
    }),
    getEventById: builder.query<EventItem, number>({
      query: (id) => `/events/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'EventDetails', id }],
    }),
    checkIsRegistered: builder.query<{ isRegistered: boolean }, number>({
      query: (id) => `/events/${id}/is-registered`,
      providesTags: (_result, _error, id) => [{ type: 'Registrations', id }],
    }),
    registerForEvent: builder.mutation<{ message: string }, number>({
      query: (eventId) => ({
        url: `/events/${eventId}/register`,
        method: 'POST',
      }),
      // Qeydiyyat uğurlu olanda tədbir siyahısını və qeydiyyat statusunu yeniləyir
      invalidatesTags: ['Events', 'EventDetails', 'Registrations', 'AdminStats'],
    }),
    cancelRegistration: builder.mutation<{ message: string }, number>({
      query: (eventId) => ({
        url: `/events/${eventId}/register`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Events', 'EventDetails', 'Registrations', 'AdminStats'],
    }),

    // ================== ADMIN ==================
    createEvent: builder.mutation<{ message: string; event: EventItem }, Partial<EventItem>>({
      query: (newEvent) => ({
        url: '/events',
        method: 'POST',
        body: newEvent,
      }),
      invalidatesTags: ['Events', 'AdminStats'],
    }),
    updateEvent: builder.mutation<{ message: string }, { id: number; data: Partial<EventItem> }>({
      query: ({ id, data }) => ({
        url: `/events/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Events', 'EventDetails'],
    }),
    deleteEvent: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/events/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Events', 'AdminStats'],
    }),
    getEventAttendees: builder.query<Attendee[], number>({
      query: (eventId) => `/events/${eventId}/attendees`,
      providesTags: (_result, _error, eventId) => [{ type: 'Registrations', id: eventId }],
    }),
    removeAttendee: builder.mutation<{ message: string }, { eventId: number; userId: number }>({
      query: ({ eventId, userId }) => ({
        url: `/events/${eventId}/attendees/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Events', 'EventDetails', 'Registrations', 'AdminStats'],
    }),
    getAdminStats: builder.query<AdminStats, void>({
      query: () => '/admin/stats',
      providesTags: ['AdminStats'],
    }),
    getAdminUsers: builder.query<User[], void>({
      query: () => '/admin/users',
      providesTags: ['AdminUsers'],
    }),
    deleteUser: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminUsers', 'AdminStats'],
    }),
  }),
});

// RTK Query tərəfindən avtomatik generasiya olunan React Hook-ları
export const {
  useRegisterMutation,
  useLoginMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useGetEventsQuery,
  useGetMyRegistrationsQuery,
  useGetEventByIdQuery,
  useCheckIsRegisteredQuery,
  useRegisterForEventMutation,
  useCancelRegistrationMutation,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useGetEventAttendeesQuery,
  useRemoveAttendeeMutation,
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useDeleteUserMutation,
} = apiSlice;
