// client/src/pages/AdminDashboard.tsx
// Bu fayl Admin üçün idarəetmə mərkəzidir (Dashboard).
// Qəhvəyi tonlar, krem fon və ağ kartlar ilə dizayn olunub.

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  useGetAdminStatsQuery, 
  useGetEventsQuery, 
  useGetAdminUsersQuery, 
  useDeleteEventMutation, 
  useDeleteUserMutation,
  useGetEventAttendeesQuery,
  useRemoveAttendeeMutation
} from '../api/apiSlice';
import { 
  Calendar, 
  Users, 
  CheckSquare, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  X, 
  Shield 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'events' | 'users'>('events');
  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState<number | null>(null);

  const { data: stats } = useGetAdminStatsQuery();
  const { data: events, isLoading: eventsLoading } = useGetEventsQuery();
  const { data: users, isLoading: usersLoading } = useGetAdminUsersQuery();

  const [deleteEvent] = useDeleteEventMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [removeAttendee] = useRemoveAttendeeMutation();

  const { data: attendees, isLoading: attendeesLoading } = useGetEventAttendeesQuery(
    selectedEventForAttendees!,
    { skip: selectedEventForAttendees === null }
  );

  const handleDeleteEvent = async (id: number) => {
    if (window.confirm('Bu tədbiri silmək istədiyinizdən əminsiniz?')) {
      await deleteEvent(id);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Bu istifadəçini silmək istədiyinizdən əminsiniz?')) {
      await deleteUser(id);
    }
  };

  const handleRemoveAttendee = async (userId: number, userName: string) => {
    if (window.confirm(`${userName} adlı istifadəçini bu tədbirin qeydiyyat siyahısından silmək istəyirsiniz?`)) {
      if (selectedEventForAttendees !== null) {
        await removeAttendee({ eventId: selectedEventForAttendees, userId });
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Başlıq və Yeni Tədbir Düyməsi */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-accent/20 text-primary rounded-xl">
              <Shield className="w-5 h-5 text-accent" />
            </span>
            <h1 className="text-3xl font-extrabold text-primary tracking-tight">Admin Dashboard</h1>
          </div>
          <p className="text-secondary text-sm mt-1">Sistemin idarə edilməsi və statistika</p>
        </div>

        <Link
          to="/admin/events/new"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl text-sm shadow-md shadow-primary/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Tədbir Yarat</span>
        </Link>
      </div>

      {/* 3 Əsas Statistika Kartı */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-borderBeige rounded-2xl p-6 flex items-center space-x-4 shadow-sm">
          <div className="p-3.5 bg-accent/20 text-accent rounded-xl">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-secondary uppercase tracking-wider">Cəmi Tədbir</p>
            <p className="text-3xl font-extrabold text-primary mt-1">{stats?.totalEvents ?? '-'}</p>
          </div>
        </div>

        <div className="bg-white border border-borderBeige rounded-2xl p-6 flex items-center space-x-4 shadow-sm">
          <div className="p-3.5 bg-secondary/15 text-secondary rounded-xl">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-secondary uppercase tracking-wider">İstifadəçilər</p>
            <p className="text-3xl font-extrabold text-primary mt-1">{stats?.totalUsers ?? '-'}</p>
          </div>
        </div>

        <div className="bg-white border border-borderBeige rounded-2xl p-6 flex items-center space-x-4 shadow-sm">
          <div className="p-3.5 bg-emerald-100 text-emerald-800 rounded-xl">
            <CheckSquare className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-secondary uppercase tracking-wider">Qeydiyyatlar</p>
            <p className="text-3xl font-extrabold text-primary mt-1">{stats?.totalRegistrations ?? '-'}</p>
          </div>
        </div>
      </div>

      {/* Tab Naviqasiyası */}
      <div className="flex border-b border-borderBeige mb-6">
        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 px-4 font-bold text-sm transition border-b-2 ${
            activeTab === 'events'
              ? 'border-primary text-primary'
              : 'border-transparent text-secondary hover:text-primary'
          }`}
        >
          Tədbirlərin İdarəsi
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 font-bold text-sm transition border-b-2 ${
            activeTab === 'users'
              ? 'border-primary text-primary'
              : 'border-transparent text-secondary hover:text-primary'
          }`}
        >
          İstifadəçilər
        </button>
      </div>

      {/* 1. Tədbirlər Cədvəli */}
      {activeTab === 'events' && (
        <div className="bg-white border border-borderBeige rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-secondary">
              <thead className="bg-cream/80 text-xs uppercase font-bold text-primary border-b border-borderBeige">
                <tr>
                  <th className="px-6 py-4">Tədbir Adı</th>
                  <th className="px-6 py-4">Kateqoriya</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Tarix</th>
                  <th className="px-6 py-4">Qeydiyyat / Tutum</th>
                  <th className="px-6 py-4 text-right">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderBeige">
                {eventsLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">Yüklənir...</td>
                  </tr>
                ) : events?.map((event) => (
                  <tr key={event.id} className="hover:bg-cream/30 transition">
                    <td className="px-6 py-4 font-bold text-primary">{event.title}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-cream text-primary border border-borderBeige rounded-full text-xs font-semibold">
                        {event.category || 'Konfranslar'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        event.status === 'Bitib' 
                          ? 'bg-slate-100 text-slate-700' 
                          : event.status === 'Davam edir'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {event.status || 'Gələcəkdə'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-secondary text-xs">{event.date}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-primary">{event.registered_count || 0}</span>
                      <span className="text-secondary/70"> / {event.capacity}</span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedEventForAttendees(event.id)}
                        className="p-2 bg-cream hover:bg-secondary/20 text-secondary hover:text-primary rounded-lg transition"
                        title="Qeydiyyatçılar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <Link
                        to={`/admin/events/edit/${event.id}`}
                        className="inline-block p-2 bg-cream hover:bg-secondary/20 text-secondary hover:text-primary rounded-lg transition"
                        title="Redaktə et"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. İstifadəçilər Cədvəli */}
      {activeTab === 'users' && (
        <div className="bg-white border border-borderBeige rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-secondary">
              <thead className="bg-cream/80 text-xs uppercase font-bold text-primary border-b border-borderBeige">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Ad və Soyad</th>
                  <th className="px-6 py-4">E-poçt</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4 text-right">Əməliyyat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderBeige">
                {usersLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8">Yüklənir...</td>
                  </tr>
                ) : users?.map((u) => (
                  <tr key={u.id} className="hover:bg-cream/30 transition">
                    <td className="px-6 py-4 text-secondary/70">#{u.id}</td>
                    <td className="px-6 py-4 font-bold text-primary">{u.name}</td>
                    <td className="px-6 py-4 text-secondary">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                        u.role === 'admin' ? 'bg-accent/30 text-primary' : 'bg-cream text-secondary border border-borderBeige'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition"
                          title="İstifadəçini sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Qeydiyyatçılar Modalı */}
      {selectedEventForAttendees !== null && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-borderBeige rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-primary">Qeydiyyatdan Keçənlər</h3>
              <button
                onClick={() => setSelectedEventForAttendees(null)}
                className="text-secondary hover:text-primary transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {attendeesLoading ? (
              <p className="text-center py-6 text-secondary">Yüklənir...</p>
            ) : attendees && attendees.length > 0 ? (
              <div className="max-h-80 overflow-y-auto divide-y divide-borderBeige">
                {attendees.map((att) => (
                  <div key={att.id} className="py-3 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-bold text-primary">{att.name}</p>
                      <p className="text-xs text-secondary">{att.email}</p>
                      <span className="text-[11px] text-secondary/60">{att.registered_at}</span>
                    </div>

                    <button
                      onClick={() => handleRemoveAttendee(att.id, att.name)}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition"
                      title="Qeydiyyatı sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-secondary text-sm">
                Bu tədbirə hələ heç kim qeydiyyatdan keçməyib.
              </p>
            )}

            <button
              onClick={() => setSelectedEventForAttendees(null)}
              className="mt-6 w-full py-3 bg-cream hover:bg-borderBeige text-primary font-bold rounded-xl text-sm transition"
            >
              Bağla
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
