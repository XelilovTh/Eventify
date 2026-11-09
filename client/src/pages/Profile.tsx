// client/src/pages/Profile.tsx
// Bu fayl mockup Şəkil 2-dəki dizayn elementləri ilə hazırlanmış Şəxsi Profil və Dashboard səhifəsidir:
// İstifadəçi kartı (Tələbə, ADNSU - İT), Mənim statistikam, motivasiya kartı və qeydiyyatdan keçilən tədbirlər.

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  useGetMyRegistrationsQuery, 
  useCancelRegistrationMutation, 
  useUpdateProfileMutation 
} from '../api/apiSlice';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { updateUser } from '../features/auth/authSlice';
import { 
  User, 
  Lock, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  Save, 
  Trash2, 
  ArrowRight,
  Ticket,
  Star
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const { data: myEvents, isLoading: isEventsLoading } = useGetMyRegistrationsQuery();
  const [cancelRegistration] = useCancelRegistrationMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const [name, setName] = useState(user?.name || '');
  const [newPassword, setNewPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Favorilərin sayını oxuyuruq
  const savedFavs = localStorage.getItem('eventify_favs');
  const favCount = savedFavs ? JSON.parse(savedFavs).length : 0;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    try {
      const res = await updateProfile({
        name,
        newPassword: newPassword ? newPassword : undefined,
      }).unwrap();

      dispatch(updateUser(res.user));
      setNewPassword('');
      setStatusMessage({ type: 'success', text: res.message });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.data?.message || 'Yenilənmə zamanı xəta baş verdi.' });
    }
  };

  const handleCancelReg = async (eventId: number, eventTitle: string) => {
    if (window.confirm(`"${eventTitle}" tədbirindən qeydiyyatınızı ləğv etmək istəyirsiniz?`)) {
      try {
        await cancelRegistration(eventId).unwrap();
      } catch (err) {
        alert('Xəta baş verdi.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Başlıq */}
      <div>
        <h1 className="text-3xl font-extrabold text-primary tracking-tight">Şəxsi Kabinet</h1>
        <p className="text-secondary text-sm mt-1">İstifadəçi məlumatları, statistika və qeydiyyatlar</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SOL TƏRƏF: İstifadəçi Kartı, Statistika və Motivasiya (Şəkil 2-dəki Sağ Panel) */}
        <div className="lg:col-span-1 space-y-6">
          {/* 1. İstifadəçi Şəxsiyyət Kartı (Şəkil 2) */}
          <div className="bg-white border border-borderBeige rounded-[2rem] p-6 shadow-sm text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-accent/25 text-primary border-2 border-accent flex items-center justify-center font-extrabold text-2xl shadow-inner mb-3">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-lg font-bold text-primary">{user?.name}</h2>
            <p className="text-secondary/70 text-xs mt-1">{user?.email}</p>

            <span className={`inline-block mt-3 text-[11px] px-3 py-1 rounded-full font-bold uppercase ${
              user?.role === 'admin' ? 'bg-accent/30 text-primary' : 'bg-cream text-secondary border border-borderBeige'
            }`}>
              {user?.role === 'admin' ? '👑 Admin' : 'İstifadəçi'}
            </span>
          </div>

          {/* 2. Mənim Statistikam (Şəkil 2) */}
          <div className="bg-white border border-borderBeige rounded-[2rem] p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Mənim statistikam</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-cream/40 rounded-2xl">
                <div className="flex items-center space-x-2.5 text-xs text-primary font-bold">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span>Qeydiyyat sayı</span>
                </div>
                <span className="text-base font-extrabold text-primary">{myEvents?.length || 0}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-cream/40 rounded-2xl">
                <div className="flex items-center space-x-2.5 text-xs text-primary font-bold">
                  <Ticket className="w-4 h-4 text-accent" />
                  <span>İştirak etdiyim tədbir</span>
                </div>
                <span className="text-base font-extrabold text-primary">
                  {myEvents ? Math.max(0, myEvents.length - 1) : 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-cream/40 rounded-2xl">
                <div className="flex items-center space-x-2.5 text-xs text-primary font-bold">
                  <Star className="w-4 h-4 text-accent" />
                  <span>Sevimli tədbirlər</span>
                </div>
                <span className="text-base font-extrabold text-primary">{favCount}</span>
              </div>
            </div>
          </div>



          {/* 4. Məlumatları Yenilə Forması */}
          <div className="bg-white border border-borderBeige rounded-[2rem] p-6 shadow-sm">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">
              Məlumatları Yenilə
            </h3>

            {statusMessage && (
              <div className={`mb-4 p-3 rounded-xl flex items-center space-x-2 text-xs font-semibold ${
                statusMessage.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {statusMessage.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-3.5">
              <div>
                <label className="block text-[11px] text-secondary font-bold mb-1">Ad və Soyad</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-cream/40 border border-borderBeige rounded-xl pl-9 pr-3 py-2 text-xs text-primary focus:outline-none focus:border-accent font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-secondary font-bold mb-1">Yeni Şifrə</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Dəyişmək istəmirsinizsə boş buraxın"
                    className="w-full bg-cream/40 border border-borderBeige rounded-xl pl-9 pr-3 py-2 text-xs text-primary focus:outline-none focus:border-accent font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isUpdating ? 'Yadda saxlanılır...' : 'Yadda Saxla'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* SAĞ TƏRƏF: Qeydiyyatdan Keçilən Tədbirlər (Kartlar və Şəkillər) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-borderBeige rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-borderBeige">
              <div>
                <h2 className="text-xl font-extrabold text-primary">Qeydiyyatdan Keçdiyim Tədbirlər</h2>
                <p className="text-secondary text-xs mt-0.5 font-medium">
                  İştirak edəcəyiniz aktiv tədbirlərin siyahısı
                </p>
              </div>
              <span className="text-xs font-bold px-3.5 py-1.5 bg-accent/20 text-primary rounded-full">
                {myEvents?.length || 0} Tədbir
              </span>
            </div>

            {isEventsLoading ? (
              <div className="py-12 text-center text-secondary">Yüklənir...</div>
            ) : myEvents && myEvents.length > 0 ? (
              <div className="space-y-4">
                {myEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-4 bg-cream/30 border border-borderBeige rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-accent transition duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Kiçik Şəkil (Thumbnail - Şəkil 2) */}
                      <img
                        src={ev.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=300&q=80'}
                        alt={ev.title}
                        className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                      />

                      <div className="space-y-1">
                        <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                          ✓ Qeydiyyat aktivdir
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-primary">{ev.title}</h3>

                        <div className="flex flex-wrap items-center gap-x-3 text-xs text-secondary font-medium">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-accent" />
                            <span>{ev.date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-accent" />
                            <span>{ev.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Düymələr */}
                    <div className="flex items-center space-x-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-borderBeige">
                      <Link
                        to={`/events/${ev.id}`}
                        className="px-4 py-2 bg-white hover:bg-cream border border-borderBeige text-primary font-bold text-xs rounded-xl transition inline-flex items-center space-x-1 shadow-sm"
                      >
                        <span>Bax</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => handleCancelReg(ev.id, ev.title)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition"
                        title="Qeydiyyatı ləğv et"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Ticket className="w-12 h-12 text-secondary/30 mx-auto mb-3" />
                <h4 className="text-base font-bold text-primary">Hələ heç bir tədbirə yazılmamısınız</h4>
                <p className="text-secondary text-xs mt-1 mb-5">
                  Maraqlı tədbirləri kəşf edin və yerinizi indidən bron edin.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-sm transition"
                >
                  <span>Tədbirlərə Bax</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
