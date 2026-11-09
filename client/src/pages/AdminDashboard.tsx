// client/src/pages/AdminDashboard.tsx
// Bu fayl Admin üçün idarəetmə mərkəzidir (Dashboard).
// Qəhvəyi tonlar, krem fon, statistik kartlar, axtarış və cədvəllər ilə təchiz olunub.

import React, { useState, useMemo } from 'react';
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
import { useAppSelector } from '../app/hooks';
import { 
  Calendar, 
  Users, 
  CheckSquare, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  X, 
  Shield,
  Search,
  Clock
} from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';
import { isDatePassed } from '../utils/dateUtils';

export const AdminDashboard: React.FC = () => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<'events' | 'users'>('events');
  const [searchTerm, setSearchTerm] = useState('');
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

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Axtarış süzgəci - Tədbirlər
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (!searchTerm.trim()) return events;
    const q = searchTerm.toLowerCase().trim();
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        (e.category && e.category.toLowerCase().includes(q)) ||
        (e.status && e.status.toLowerCase().includes(q))
    );
  }, [events, searchTerm]);

  // Axtarış süzgəci - İstifadəçilər
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchTerm.trim()) return users;
    const q = searchTerm.toLowerCase().trim();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, searchTerm]);

  const handleDeleteEvent = (id: number, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Tədbiri Sil',
      message: `"${title}" tədbirini sistemdən həmişəlik silmək istədiyinizdən əminsiniz?`,
      onConfirm: () => deleteEvent(id),
    });
  };

  const handleDeleteUser = (id: number, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'İstifadəçini Sil',
      message: `"${name}" adlı istifadəçi hesabını sistemdən silmək istədiyinizdən əminsiniz?`,
      onConfirm: () => deleteUser(id),
    });
  };

  const handleRemoveAttendee = (userId: number, userName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Qeydiyyatı Sil',
      message: `"${userName}" adlı istifadəçini bu tədbirin qeydiyyat siyahısından çıxarmaq istəyirsiniz?`,
      onConfirm: () => {
        if (selectedEventForAttendees !== null) {
          removeAttendee({ eventId: selectedEventForAttendees, userId });
        }
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. Başlıq və Yeni Tədbir Düyməsi */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2.5 bg-accent/20 text-primary rounded-2xl">
              <Shield className="w-6 h-6 text-accent" />
            </span>
            <h1 className="text-3xl font-extrabold text-primary tracking-tight">Admin Dashboard</h1>
          </div>
          <p className="text-secondary text-xs sm:text-sm mt-1">Sistemin idarə edilməsi, tədbirlər və istifadəçilər</p>
        </div>

        <Link
          to="/admin/events/new"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl text-xs shadow-md shadow-primary/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Tədbir Yarat</span>
        </Link>
      </div>

      {/* 2. Statistik Kartlar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-borderBeige rounded-3xl p-6 flex items-center space-x-4 shadow-sm">
          <div className="p-4 bg-accent/20 text-accent rounded-2xl">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-secondary uppercase tracking-wider">Cəmi Tədbir</p>
            <p className="text-3xl font-extrabold text-primary mt-1">{stats?.totalEvents ?? '-'}</p>
          </div>
        </div>

        <div className="bg-white border border-borderBeige rounded-3xl p-6 flex items-center space-x-4 shadow-sm">
          <div className="p-4 bg-secondary/15 text-secondary rounded-2xl">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-secondary uppercase tracking-wider">İstifadəçilər</p>
            <p className="text-3xl font-extrabold text-primary mt-1">{stats?.totalUsers ?? '-'}</p>
          </div>
        </div>

        <div className="bg-white border border-borderBeige rounded-3xl p-6 flex items-center space-x-4 shadow-sm">
          <div className="p-4 bg-emerald-100 text-emerald-800 rounded-2xl">
            <CheckSquare className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-secondary uppercase tracking-wider">Qeydiyyatlar</p>
            <p className="text-3xl font-extrabold text-primary mt-1">{stats?.totalRegistrations ?? '-'}</p>
          </div>
        </div>
      </div>

      {/* 3. Tablar və Axtarış Paneli */}
      <div className="bg-white border border-borderBeige rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-borderBeige/60 pb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setActiveTab('events');
                setSearchTerm('');
              }}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition ${
                activeTab === 'events'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-cream/60 hover:bg-cream text-secondary hover:text-primary'
              }`}
            >
              Tədbirlərin İdarəsi ({events?.length || 0})
            </button>
            <button
              onClick={() => {
                setActiveTab('users');
                setSearchTerm('');
              }}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition ${
                activeTab === 'users'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-cream/60 hover:bg-cream text-secondary hover:text-primary'
              }`}
            >
              İstifadəçilər ({users?.length || 0})
            </button>
          </div>

          {/* Cədvəldaxili Canlı Axtarış */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={activeTab === 'events' ? 'Tədbir axtar...' : 'İstifadəçi axtar...'}
              className="w-full bg-cream/40 border border-borderBeige rounded-xl pl-10 pr-8 py-2.5 text-xs text-primary placeholder:text-secondary/50 focus:outline-none focus:border-accent font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 4. Tədbirlər Cədvəli */}
        {activeTab === 'events' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-secondary">
              <thead className="bg-cream/50 text-[11px] uppercase font-bold text-primary border-b border-borderBeige">
                <tr>
                  <th className="px-6 py-4">Tədbir</th>
                  <th className="px-6 py-4">Kateqoriya</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Tarix & Son Qeydiyyat</th>
                  <th className="px-6 py-4">Doluluq / Tutum</th>
                  <th className="px-6 py-4 text-right">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderBeige/60">
                {eventsLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10">Yüklənir...</td>
                  </tr>
                ) : filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-secondary">Uyğun tədbir tapılmadı.</td>
                  </tr>
                ) : (
                  filteredEvents.map((event) => {
                    const registered = event.registered_count || 0;
                    const percent = Math.min(100, Math.round((registered / event.capacity) * 100));
                    const barColor = percent >= 100 ? 'bg-red-500' : percent >= 75 ? 'bg-amber-500' : 'bg-emerald-600';
                    const deadlinePassed = event.registration_deadline ? isDatePassed(event.registration_deadline) : false;

                    return (
                      <tr key={event.id} className="hover:bg-cream/20 transition">
                        {/* 1. Tədbir Thumbnail və Başlıq */}
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3.5">
                            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-cream border border-borderBeige flex-shrink-0">
                              {event.image_url ? (
                                <img
                                  src={event.image_url}
                                  alt={event.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-secondary/40">
                                  <Calendar className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-primary truncate max-w-xs">{event.title}</p>
                              <p className="text-xs text-secondary truncate">{event.location}</p>
                            </div>
                          </div>
                        </td>

                        {/* 2. Kateqoriya */}
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-cream text-primary border border-borderBeige rounded-full text-xs font-bold">
                            {event.category || 'Konfranslar'}
                          </span>
                        </td>

                        {/* 3. Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-bold ${
                              event.status === 'Bitib'
                                ? 'bg-slate-100 text-slate-700'
                                : event.status === 'Davam edir'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            ● {event.status || 'Gələcəkdə'}
                          </span>
                        </td>

                        {/* 4. Tarix və Son Qeydiyyat */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-primary">{event.date}</p>
                            {event.registration_deadline && (
                              <p
                                className={`text-[11px] flex items-center space-x-1 ${
                                  deadlinePassed ? 'text-red-600 font-semibold' : 'text-secondary/70'
                                }`}
                              >
                                <Clock className="w-3 h-3 flex-shrink-0" />
                                <span>Son: {event.registration_deadline}</span>
                              </p>
                            )}
                          </div>
                        </td>

                        {/* 5. Doluluq Zolağı (Progress bar) */}
                        <td className="px-6 py-4">
                          <div className="w-32 space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-primary">{registered}</span>
                              <span className="text-secondary/70">/ {event.capacity} ({percent}%)</span>
                            </div>
                            <div className="w-full bg-cream h-2 rounded-full overflow-hidden border border-borderBeige">
                              <div
                                className={`h-full ${barColor} rounded-full transition-all duration-300`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* 6. Əməliyyatlar */}
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => setSelectedEventForAttendees(event.id)}
                            className="p-2 bg-cream hover:bg-secondary/20 text-secondary hover:text-primary rounded-xl transition cursor-pointer"
                            title="Qeydiyyatçılar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <Link
                            to={`/admin/events/edit/${event.id}`}
                            className="inline-block p-2 bg-cream hover:bg-secondary/20 text-secondary hover:text-primary rounded-xl transition cursor-pointer"
                            title="Redaktə et"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleDeleteEvent(event.id, event.title)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition cursor-pointer"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. İstifadəçilər Cədvəli */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-secondary">
              <thead className="bg-cream/50 text-[11px] uppercase font-bold text-primary border-b border-borderBeige">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">İstifadəçi</th>
                  <th className="px-6 py-4">E-poçt</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4 text-right">Əməliyyat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderBeige/60">
                {usersLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10">Yüklənir...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-secondary">İstifadəçi tapılmadı.</td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    const isAdmin = u.role === 'admin';

                    return (
                      <tr key={u.id} className="hover:bg-cream/20 transition">
                        <td className="px-6 py-4 text-secondary/60 text-xs">#{u.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-full bg-accent/25 text-primary border border-accent/40 font-bold flex items-center justify-center text-xs">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-primary">{u.name}</p>
                              {isSelf && (
                                <span className="text-[10px] text-accent font-semibold">(Siz)</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-secondary">{u.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                              isAdmin
                                ? 'bg-accent/30 text-primary border border-accent/40'
                                : 'bg-cream text-secondary border border-borderBeige'
                            }`}
                          >
                            {isAdmin ? '👑 Admin' : 'İstifadəçi'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {/* Admin özünü və digər adminləri təsadüfən silə bilməz */}
                          {!isAdmin && !isSelf && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition cursor-pointer"
                              title="İstifadəçini sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Qeydiyyatçılar Modalı */}
      {selectedEventForAttendees !== null && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-borderBeige rounded-[2rem] max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-primary">Qeydiyyatdan Keçənlər</h3>
                <p className="text-xs text-secondary mt-0.5">Tədbirə qeydiyyatdan keçmiş istifadəçilərin siyahısı</p>
              </div>
              <button
                onClick={() => setSelectedEventForAttendees(null)}
                className="p-2 text-secondary hover:text-primary rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {attendeesLoading ? (
              <p className="text-center py-8 text-secondary text-sm">Yüklənir...</p>
            ) : attendees && attendees.length > 0 ? (
              <div className="max-h-80 overflow-y-auto divide-y divide-borderBeige/60 pr-1">
                {attendees.map((att) => (
                  <div key={att.id} className="py-3 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-bold text-primary">{att.name}</p>
                      <p className="text-xs text-secondary">{att.email}</p>
                      <span className="text-[11px] text-secondary/60">Qeydiyyat: {att.registered_at}</span>
                    </div>

                    <button
                      onClick={() => handleRemoveAttendee(att.id, att.name)}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition cursor-pointer"
                      title="Qeydiyyatı ləğv et"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-secondary text-sm bg-cream/40 rounded-2xl border border-borderBeige">
                Bu tədbirə hələ heç kim qeydiyyatdan keçməyib.
              </div>
            )}

            <button
              onClick={() => setSelectedEventForAttendees(null)}
              className="w-full py-3 bg-cream hover:bg-borderBeige text-primary font-bold rounded-xl text-xs transition"
            >
              Bağla
            </button>
          </div>
        </div>
      )}

      {/* 7. Xüsusi Təsdiq Modalı */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Bəli, sil"
        cancelText="Ləğv et"
        isDestructive={true}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
