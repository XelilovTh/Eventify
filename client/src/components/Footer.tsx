import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#24130A] text-cream border-t border-[#3B2418] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="inline-flex items-center space-x-2 text-white font-bold text-xl tracking-tight">
              <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm">
                <img src="/logo.svg" alt="Eventify" className="w-full h-full object-contain" />
              </div>
              <span>Eventify</span>
            </Link>
            <p className="text-cream/70 text-xs sm:text-sm leading-relaxed max-w-sm">
              Tədbirlərin idarə edilməsi və qeydiyyat platforması.
            </p>
            <div className="flex items-center space-x-4 text-xs text-cream/60 pt-1">
              <span className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-accent" />
                <span>Bakı, Azərbaycan</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-accent" />
                <span>contact@eventify.az</span>
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-3">Keçidlər</h4>
            <ul className="space-y-2 text-xs text-cream/70">
              <li>
                <Link to="/" className="hover:text-white transition">Ana səhifə</Link>
              </li>
              <li>
                <Link to="/my-registrations" className="hover:text-white transition">Qeydiyyatlarım</Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-white transition">Seçilmişlər</Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition">Profil</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-3">Kateqoriyalar</h4>
            <ul className="space-y-2 text-xs text-cream/70">
              <li><Link to="/" className="hover:text-white transition">Konfranslar</Link></li>
              <li><Link to="/" className="hover:text-white transition">Seminarlar</Link></li>
              <li><Link to="/" className="hover:text-white transition">Festivallar</Link></li>
              <li><Link to="/" className="hover:text-white transition">İdman</Link></li>
              <li><Link to="/" className="hover:text-white transition">Texnologiya</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-cream/10 text-xs text-cream/60">
          <p>© 2026 Eventify.</p>
        </div>
      </div>
    </footer>
  );
};
