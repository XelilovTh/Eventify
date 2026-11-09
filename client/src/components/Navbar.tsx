// client/src/components/Navbar.tsx
// Bu fayl mockup Şəkil 1-dəki dizayna tam uyğunlaşdırılmış naviqasiya panelidir:
// Pill formalı keçidlər (Ana səhifə, Tədbirlər, Mənim qeydiyyatlarım, Seçilmişlər), bildiriş zəngi və istifadəçi profili.

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { 
  Calendar, 
  Home, 
  Ticket, 
  Heart, 
  LogOut, 
  ShieldAlert, 
  ChevronDown 
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-borderBeige sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* 1. Loqo (Eventify) */}
          <Link to="/" className="flex items-center space-x-2.5 text-primary font-extrabold text-2xl tracking-tight">
            <span className="p-2.5 bg-primary rounded-2xl text-accent shadow-sm flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </span>
            <span className="font-sans">Event<span className="text-accent">ify</span></span>
          </Link>

          {/* 2. Əsas Menyu (Pill formalı keçidlər - Şəkil 1) */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              to="/"
              className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold transition duration-200 ${
                isActive('/')
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-secondary hover:text-primary hover:bg-cream/60'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Ana səhifə</span>
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/profile"
                  className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold transition duration-200 ${
                    isActive('/profile')
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-secondary hover:text-primary hover:bg-cream/60'
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  <span>Mənim qeydiyyatlarım</span>
                </Link>

                <Link
                  to="/favorites"
                  className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold transition duration-200 ${
                    isActive('/favorites')
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-secondary hover:text-primary hover:bg-cream/60'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  <span>Seçilmişlər</span>
                </Link>

                {/* Yalnız Admin olduqda Admin Dashboard linki */}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold bg-accent/20 border border-accent/40 text-primary hover:bg-accent/30 transition"
                  >
                    <ShieldAlert className="w-4 h-4 text-accent" />
                    <span>Admin Panel</span>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* 3. Sağ Tərəf: Profil və Çıxış */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* İstifadəçi Avatarı və Adı */}
                <Link
                  to="/profile"
                  className="flex items-center space-x-2.5 p-1.5 pl-2 pr-3 bg-cream/40 hover:bg-cream/80 border border-borderBeige rounded-full transition group"
                >
                  <div className="w-8 h-8 rounded-full bg-accent/30 text-primary font-bold flex items-center justify-center text-xs border border-accent/40">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-primary group-hover:text-accent transition">
                    {user?.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-secondary" />
                </Link>

                {/* Çıxış düyməsi */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-secondary hover:text-red-600 rounded-full hover:bg-red-50 transition"
                  title="Çıxış"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-primary hover:text-accent font-bold px-4 py-2 rounded-xl text-xs transition"
                >
                  Daxil ol
                </Link>
                <Link
                  to="/register"
                  className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-full text-xs font-bold transition shadow-sm"
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
