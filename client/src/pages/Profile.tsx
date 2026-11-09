// client/src/pages/Profile.tsx
// Bu fayl istifadəçinin sırf şəxsi profilini və hesab parametrlərini (ad/şifrə yeniləmə) idarə edən səhifədir.

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  useGetMyRegistrationsQuery, 
  useUpdateProfileMutation 
} from '../api/apiSlice';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { updateUser } from '../features/auth/authSlice';
import { 
  User, 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  Save, 
  Star,
  Ticket,
  ArrowRight
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const { data: myEvents } = useGetMyRegistrationsQuery();
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Səhifə Başlığı */}
      <div>
        <h1 className="text-3xl font-extrabold text-primary tracking-tight">Şəxsi Profil</h1>
        <p className="text-secondary text-sm mt-1">Hesab məlumatlarınızı və təhlükəsizlik parametrlərinizi idarə edin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. İstifadəçi Kartı */}
        <div className="md:col-span-1 bg-white border border-borderBeige rounded-[2rem] p-6 shadow-sm text-center flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-accent/25 text-primary border-2 border-accent flex items-center justify-center font-extrabold text-3xl shadow-inner mb-4">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-primary">{user?.name}</h2>
          <p className="text-secondary text-xs mt-1">{user?.email}</p>

          <span className={`inline-block mt-4 text-xs px-3.5 py-1.5 rounded-full font-bold uppercase ${
            user?.role === 'admin' ? 'bg-accent/30 text-primary' : 'bg-cream text-secondary border border-borderBeige'
          }`}>
            {user?.role === 'admin' ? '👑 Admin' : 'İstifadəçi Hesabı'}
          </span>
        </div>

        {/* 2. Hesab Statistikası */}
        <div className="md:col-span-2 bg-white border border-borderBeige rounded-[2rem] p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Hesab Statistikası</h3>

          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/my-registrations"
              className="p-4 bg-cream/40 hover:bg-cream border border-borderBeige rounded-2xl transition group"
            >
              <div className="flex items-center space-x-2 text-xs text-secondary font-bold mb-1">
                <Ticket className="w-4 h-4 text-accent" />
                <span>Qeydiyyatlarım</span>
              </div>
              <p className="text-2xl font-extrabold text-primary">{myEvents?.length || 0}</p>
              <span className="text-[11px] text-accent font-semibold flex items-center space-x-1 mt-2 group-hover:underline">
                <span>Hamısına bax</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            <Link
              to="/favorites"
              className="p-4 bg-cream/40 hover:bg-cream border border-borderBeige rounded-2xl transition group"
            >
              <div className="flex items-center space-x-2 text-xs text-secondary font-bold mb-1">
                <Star className="w-4 h-4 text-accent" />
                <span>Seçilmiş Tədbirlər</span>
              </div>
              <p className="text-2xl font-extrabold text-primary">{favCount}</p>
              <span className="text-[11px] text-accent font-semibold flex items-center space-x-1 mt-2 group-hover:underline">
                <span>Hamısına bax</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-borderBeige/60 flex items-center justify-between text-xs text-secondary">
            <span>Sistem statusu: <b className="text-emerald-700">Aktiv</b></span>
            <span>İstifadəçi ID: #{user?.id}</span>
          </div>
        </div>
      </div>

      {/* 3. Məlumatları Yeniləmək Forması */}
      <div className="bg-white border border-borderBeige rounded-[2rem] p-8 shadow-sm">
        <h2 className="text-lg font-bold text-primary mb-1">Hesab Parametrləri</h2>
        <p className="text-secondary text-xs mb-6">Adınızı və ya şifrənizi buradan yeniləyə bilərsiniz.</p>

        {statusMessage && (
          <div className={`mb-6 p-4 rounded-xl flex items-center space-x-2.5 text-xs font-semibold ${
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

        <form onSubmit={handleUpdateProfile} className="space-y-5 max-w-lg">
          <div>
            <label className="block text-xs font-bold text-primary mb-2">Ad və Soyad</label>
            <div className="relative">
              <User className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-cream/40 border border-borderBeige rounded-xl pl-10 pr-4 py-3 text-sm text-primary focus:outline-none focus:border-accent font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-primary mb-2">E-poçt Ünvanı (Dəyişdirilə bilməz)</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full bg-cream/70 border border-borderBeige rounded-xl px-4 py-3 text-sm text-secondary/70 cursor-not-allowed font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary mb-2">Yeni Şifrə (İstəyə görə)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Şifrəni dəyişmək istəmirsinizsə boş buraxın"
                className="w-full bg-cream/40 border border-borderBeige rounded-xl pl-10 pr-4 py-3 text-sm text-primary focus:outline-none focus:border-accent font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isUpdating ? 'Yadda saxlanılır...' : 'Dəyişiklikləri Yadda Saxla'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
