import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  useGetMyRegistrationsQuery, 
  useUpdateProfileMutation 
} from '../api/apiSlice';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { updateUser, logout } from '../features/auth/authSlice';
import { useFavorites } from '../hooks/useFavorites';
import { ConfirmModal } from '../components/ConfirmModal';
import { AZ_VALIDATION_MESSAGES, azValidationProps, passwordMessage } from '../utils/validation';
import { 
  User, 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  Save, 
  Star, 
  Ticket, 
  ArrowRight,
  LogOut
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { data: myEvents } = useGetMyRegistrationsQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const [name, setName] = useState(user?.name || '');
  const [newPassword, setNewPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const confirmLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const { favoritesCount: favCount } = useFavorites();

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
      setStatusMessage({
        type: 'error',
        text: err?.data?.message || 'Məlumatları yeniləyərkən xəta baş verdi.',
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Profil</h1>
        <p className="text-secondary text-xs sm:text-sm mt-0.5">Hesab parametrləri</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white border border-borderBeige rounded-2xl p-6 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-accent/20 text-primary flex items-center justify-center font-bold text-2xl mb-3">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-lg font-bold text-primary">{user?.name}</h2>
          <p className="text-secondary text-xs mt-0.5">{user?.email}</p>

          <span className={`inline-block mt-3 text-xs px-3 py-1 rounded-full font-semibold ${
            user?.role === 'admin' ? 'bg-accent/20 text-primary' : 'bg-cream text-secondary'
          }`}>
            {user?.role === 'admin' ? 'Admin' : 'İstifadəçi'}
          </span>
        </div>

        <div className="md:col-span-2 bg-white border border-borderBeige rounded-2xl p-6 flex flex-col justify-between">
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Statistika</h3>

          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/my-registrations"
              className="p-4 bg-cream/30 hover:bg-cream/60 border border-borderBeige rounded-xl transition"
            >
              <div className="flex items-center space-x-2 text-xs text-secondary font-semibold mb-1">
                <Ticket className="w-4 h-4 text-accent" />
                <span>Qeydiyyatlarım</span>
              </div>
              <p className="text-2xl font-bold text-primary">{myEvents?.length || 0}</p>
              <span className="text-[11px] text-accent font-medium flex items-center space-x-1 mt-2">
                <span>Bax</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            <Link
              to="/favorites"
              className="p-4 bg-cream/30 hover:bg-cream/60 border border-borderBeige rounded-xl transition"
            >
              <div className="flex items-center space-x-2 text-xs text-secondary font-semibold mb-1">
                <Star className="w-4 h-4 text-accent" />
                <span>Seçilmişlər</span>
              </div>
              <p className="text-2xl font-bold text-primary">{favCount}</p>
              <span className="text-[11px] text-accent font-medium flex items-center space-x-1 mt-2">
                <span>Bax</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>

          <div className="mt-3 pt-3 border-t border-borderBeige/60 text-right text-xs text-secondary">
            ID: #{user?.id}
          </div>
        </div>
      </div>

      <div className="bg-white border border-borderBeige rounded-2xl p-6">
        <h2 className="text-base font-bold text-primary mb-1">Məlumatları yenilə</h2>
        <p className="text-secondary text-xs mb-5">Ad və ya şifrəni dəyişə bilərsiniz.</p>

        {statusMessage && (
          <div className={`mb-5 p-3 rounded-xl flex items-center space-x-2 text-xs font-medium ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
          <div>
            <label htmlFor="profile-name" className="block text-xs font-semibold text-primary mb-1.5">
              Ad və Soyad
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="profile-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                {...azValidationProps(AZ_VALIDATION_MESSAGES.required)}
                className="w-full bg-cream/30 border border-borderBeige rounded-xl pl-10 pr-4 py-2 text-primary focus:outline-none focus:border-accent text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="profile-new-password" className="block text-xs font-semibold text-primary mb-1.5">
              Yeni Şifrə (dəyişmək istəmirsinizsə boş buraxın)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="profile-new-password"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Yeni şifrə"
                {...azValidationProps(passwordMessage)}
                className="w-full bg-cream/30 border border-borderBeige rounded-xl pl-10 pr-4 py-2 text-primary focus:outline-none focus:border-accent text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl text-xs shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isUpdating ? 'Yadda saxlanılır...' : 'Yadda saxla'}</span>
          </button>
        </form>

        <div className="mt-8 pt-5 border-t border-borderBeige flex items-center justify-between">
          <p className="text-xs text-secondary">
            Hesabdan çıxış
          </p>

          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl text-xs transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Çıxış</span>
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Hesabdan çıxış"
        message="Hesabınızdan çıxış etmək istədiyinizə əminsiniz?"
        confirmText="Çıxış"
        cancelText="Geri"
        isDestructive={true}
        onConfirm={confirmLogout}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
};
