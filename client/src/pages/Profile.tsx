// client/src/pages/Profile.tsx
// Bu fayl daxil olmuş istifadəçinin şəxsi profil səhifəsidir.
// Şəxsi məlumatların yenilənməsini və istifadəçinin qeydiyyatdan keçdiyi tədbirlərin idarəsini təmin edir.

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
  Mail, 
  Lock, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  Save, 
  Trash2, 
  ArrowRight
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // Mənim qeydiyyatlarım sorğusu
  const { data: myEvents, isLoading: isEventsLoading } = useGetMyRegistrationsQuery();
  const [cancelRegistration] = useCancelRegistrationMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  // Profil formu üçün state
  const [name, setName] = useState(user?.name || '');
  const [newPassword, setNewPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    try {
      const res = await updateProfile({
        name,
        newPassword: newPassword ? newPassword : undefined,
      }).unwrap();

      // Redux-dakı istifadəçi məlumatını yeniləyirik
      dispatch(updateUser(res.user));
      setNewPassword('');
      setStatusMessage({ type: 'success', text: res.message });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.data?.message || 'Yenilənmə zamanı xəta baş verdi.' });
    }
  };

  const handleCancelReg = async (eventId: number, eventTitle: string) => {
    if (window.confirm(`"${eventTitle}" tədbirindən qeydiyyatınızı ləğv etmək istədiyinizdən əminsiniz?`)) {
      try {
        await cancelRegistration(eventId).unwrap();
      } catch (err) {
        alert('Ləğv edilərkən xəta baş verdi.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Səhifə Başlığı */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-primary tracking-tight">Şəxsi Profil</h1>
        <p className="text-secondary text-sm mt-1">
          Hesab məlumatlarınızı idarə edin və qeydiyyatdan keçdiyiniz tədbirlərə nəzarət edin.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SOL TƏRƏF: İstifadəçi Kartı və Redaktə Forması */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-borderBeige rounded-3xl p-6 shadow-sm">
            {/* Avatar və Rol */}
            <div className="text-center pb-6 border-b border-borderBeige">
              <div className="w-20 h-20 mx-auto bg-accent/20 text-primary border-2 border-accent rounded-full flex items-center justify-center font-extrabold text-2xl shadow-inner mb-3">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-primary">{user?.name}</h2>
              <p className="text-secondary text-xs mt-0.5">{user?.email}</p>

              <span className={`inline-block mt-3 text-xs px-3 py-1 rounded-full font-bold uppercase ${
                user?.role === 'admin' ? 'bg-accent/30 text-primary' : 'bg-cream text-secondary border border-borderBeige'
              }`}>
                {user?.role === 'admin' ? '👑 Admin' : 'İstifadəçi'}
              </span>
            </div>

            {/* Bildiriş Mesajı */}
            {statusMessage && (
              <div className={`mt-4 p-3.5 rounded-xl flex items-center space-x-2 text-xs font-semibold ${
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

            {/* Məlumat Yeniləmə Forması */}
            <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider">
                Məlumatları Yenilə
              </h3>

              <div>
                <label className="block text-xs text-secondary font-medium mb-1">Ad və Soyad</label>
                <div className="relative">
                  <User className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-cream/40 border border-borderBeige rounded-xl pl-9 pr-3 py-2 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-secondary font-medium mb-1">E-poçt (Dəyişdirilə bilməz)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-secondary/60 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-cream/70 border border-borderBeige rounded-xl pl-9 pr-3 py-2 text-sm text-secondary/70 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-secondary font-medium mb-1">Yeni Şifrə (İstəyə görə)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Dəyişmək istəmirsinizsə boş buraxın"
                    className="w-full bg-cream/40 border border-borderBeige rounded-xl pl-9 pr-3 py-2 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl text-xs shadow-sm transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isUpdating ? 'Yadda saxlanılır...' : 'Yadda Saxla'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* SAĞ TƏRƏF: Qeydiyyatdan Keçilən Tədbirlər */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-borderBeige rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-borderBeige">
              <div>
                <h2 className="text-xl font-bold text-primary">Qeydiyyatdan Keçdiyim Tədbirlər</h2>
                <p className="text-secondary text-xs mt-0.5">
                  Hazırda iştirak edəcəyiniz aktiv tədbirlərin siyahısı
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-accent/20 text-primary rounded-full">
                {myEvents?.length || 0} Tədbir
              </span>
            </div>

            {isEventsLoading ? (
              <div className="py-12 text-center text-secondary">Tədbirlər yüklənir...</div>
            ) : myEvents && myEvents.length > 0 ? (
              <div className="space-y-4">
                {myEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-5 bg-cream/40 border border-borderBeige rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-accent transition duration-200"
                  >
                    <div className="space-y-2">
                      <span className="inline-block text-[11px] font-semibold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                        ✓ Qeydiyyat təsdiqlənib
                      </span>
                      <h3 className="text-base font-bold text-primary">{ev.title}</h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-secondary font-medium">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-accent" />
                          <span>{ev.date}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-accent" />
                          <span>{ev.location}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-secondary/60">
                        Qeydiyyat tarixi: {ev.registered_at}
                      </p>
                    </div>

                    {/* Əməliyyat düymələri */}
                    <div className="flex items-center space-x-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-borderBeige">
                      <Link
                        to={`/events/${ev.id}`}
                        className="px-3.5 py-2 bg-white hover:bg-cream border border-borderBeige text-primary font-semibold text-xs rounded-xl transition inline-flex items-center space-x-1"
                      >
                        <span>Detallar</span>
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
                <Calendar className="w-12 h-12 text-secondary/40 mx-auto mb-3" />
                <h4 className="text-base font-bold text-primary">Hələ heç bir tədbirə yazılmamısınız</h4>
                <p className="text-secondary text-xs mt-1 max-w-sm mx-auto">
                  Maraqlı tədbirləri kəşf edin və yerinizi indidən təmin edin.
                </p>
                <Link
                  to="/"
                  className="mt-5 inline-flex items-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold text-xs rounded-xl shadow-sm transition"
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
