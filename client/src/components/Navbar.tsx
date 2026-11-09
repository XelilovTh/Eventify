// client/src/components/Navbar.tsx
// Bu fayl bütün səhifələrin yuxarısında görünən naviqasiya panelidir.
// Ağ fon, tünd qəhvəyi mətnlər və isti bej vurğuları ilə dizayn edilib.

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { Calendar, User, LogOut, ShieldAlert } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-borderBeige sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Loqo */}
          <Link to="/" className="flex items-center space-x-2 text-primary font-bold text-xl tracking-tight">
            <span className="p-2 bg-primary rounded-xl text-accent shadow-sm">
              <Calendar className="w-5 h-5" />
            </span>
            <span>Event<span className="text-accent">ify</span></span>
          </Link>

          {/* Menyu keçidləri */}
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-secondary hover:text-primary px-3 py-2 rounded-lg text-sm font-medium transition"
            >
              Tədbirlər
            </Link>

            {isAuthenticated ? (
              <>
                {/* Yalnız Admin olduqda Admin Dashboard linki görünür */}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1.5 text-primary hover:text-primary-hover bg-accent/20 border border-accent/40 px-3 py-1.5 rounded-xl text-sm font-semibold transition"
                  >
                    <ShieldAlert className="w-4 h-4 text-accent" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                {/* İstifadəçi adı və Rol nişanı */}
                <div className="flex items-center space-x-2 bg-cream/70 border border-borderBeige px-3 py-1.5 rounded-xl">
                  <User className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-medium text-primary">{user?.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    user?.role === 'admin' ? 'bg-accent text-white' : 'bg-secondary/15 text-secondary'
                  }`}>
                    {user?.role}
                  </span>
                </div>

                {/* Çıxış düyməsi */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-secondary hover:text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition"
                  title="Çıxış et"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Çıxış</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-primary hover:text-accent font-medium px-3 py-2 rounded-lg text-sm transition"
                >
                  Daxil ol
                </Link>
                <Link
                  to="/register"
                  className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-md shadow-primary/20"
                >
                  Qeydiyyat
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
