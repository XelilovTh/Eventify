// client/src/components/Navbar.tsx
// Bu fayl mockup Şəkil 1-dəki dizayna tam uyğunlaşdırılmış naviqasiya panelidir:
// Pill formalı keçidlər (Ana səhifə, Tədbirlər, Mənim qeydiyyatlarım, Seçilmişlər), bildiriş zəngi və istifadəçi profili.

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { useFavorites } from '../hooks/useFavorites';
import { 
  Calendar, 
  Home, 
  Ticket, 
  Heart, 
  ShieldAlert, 
  ChevronDown,
  Menu,
  X,
  User as UserIcon
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { favoritesCount } = useFavorites();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(location.pathname);

  // Səhifə dəyişəndə mobil menyunu avtomatik bağlayırıq
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setMobileMenuOpen(false);
  }

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

          {/* 2. Əsas Menyu (Masaüstü Ekranlar) */}
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

            {/* Seçilmişlər (həm qonaqlar, həm də daxil olmuş istifadəçilər üçün) */}
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
              {favoritesCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-black bg-accent text-white rounded-full">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/my-registrations"
                  className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold transition duration-200 ${
                    isActive('/my-registrations')
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-secondary hover:text-primary hover:bg-cream/60'
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  <span>Mənim qeydiyyatlarım</span>
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

          {/* 3. Sağ Tərəf: Profil və Çıxış / Giriş */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="flex items-center space-x-2.5 p-1.5 pl-2 pr-3 bg-cream/40 hover:bg-cream/80 border border-borderBeige rounded-full transition group"
              >
                <div className="w-8 h-8 rounded-full bg-accent/30 text-primary font-bold flex items-center justify-center text-xs border border-accent/40">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline-block text-xs font-bold text-primary group-hover:text-accent transition">
                  {user?.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-secondary hidden sm:inline-block" />
              </Link>
            ) : (
              <div className="hidden sm:flex items-center space-x-3">
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

            {/* Mobil Hamburger Açma Düyməsi */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-secondary hover:text-primary rounded-xl focus:outline-none transition"
              aria-label="Menyu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Mobil Menyu Qutusu (Yalnız kiçik ekranlarda açılır) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-borderBeige bg-white px-4 py-4 space-y-2 shadow-lg animate-fade-in">
          <Link
            to="/"
            className={`flex items-center space-x-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition ${
              isActive('/') ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:bg-cream/60'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Ana səhifə</span>
          </Link>

          {/* Seçilmişlər (Hamı üçün) */}
          <Link
            to="/favorites"
            className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition ${
              isActive('/favorites') ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:bg-cream/60'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Heart className="w-4 h-4" />
              <span>Seçilmişlər</span>
            </div>
            {favoritesCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-black bg-accent text-white rounded-full">
                {favoritesCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/my-registrations"
                className={`flex items-center space-x-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition ${
                  isActive('/my-registrations') ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:bg-cream/60'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>Mənim qeydiyyatlarım</span>
              </Link>

              <Link
                to="/profile"
                className={`flex items-center space-x-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition ${
                  isActive('/profile') ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:bg-cream/60'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>Şəxsi Profil</span>
              </Link>

              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-2.5 px-4 py-3 rounded-2xl text-xs font-bold bg-accent/20 border border-accent/40 text-primary"
                >
                  <ShieldAlert className="w-4 h-4 text-accent" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </>
          ) : (
            <div className="pt-2 border-t border-borderBeige flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full text-center py-2.5 text-primary font-bold text-xs bg-cream/70 rounded-xl"
              >
                Daxil ol
              </Link>
              <Link
                to="/register"
                className="w-full text-center py-2.5 bg-primary text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Qeydiyyatdan Keç
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
